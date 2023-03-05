/* 📰⚡ Reader
File: src/index.ts
Author: Kai Folf
Description: Main file
License: MIT
*/

import {
  errorTemplate,
  indexTemplate,
  newsData,
  newsTemplate,
} from "./template";
import { parseNews } from "./parser";
import { updateNews } from "./cron";
import { captureError } from "@cfworker/sentry";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/cloudflare-workers";
import { cache } from "hono/cache";

const app = new Hono<{ Bindings: Env }>();

// Cross origin resource sharing
app.use("/api/*", cors());

// Static files
app.use(
  "/static/*",
  cache({ cacheName: "reader", cacheControl: "max-age=2592000" })
);
app.use(
  "/favicon.ico",
  cache({ cacheName: "reader", cacheControl: "max-age=2592000" })
);
app.all("/static/*", serveStatic({ root: "./" }));
app.all("/robots.txt", serveStatic({ path: "./robots.txt" }));
app.all("/favicon.ico", serveStatic({ path: "./favicon.ico" }));

app.all("/", async (c) => {
  // Security headers
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; object-src 'none'; script-src 'self' static.cloudflareinsights.com; connect-src 'self' cloudflareinsights.com; style-src 'self' https://cdn.jsdelivr.net; img-src https: data:"
  );

  // Preload styles
  c.header("Link", "</static/styles.css>; rel=preload; as=style");

  // Redirect to news URL
  if (c.req.query("url")) {
    return c.redirect("/" + decodeURIComponent(c.req.query("url") || ""), 302);
  }

  // Get news from KV
  const news = JSON.parse(
    (await c.env.READER_KV.get("news", { cacheTtl: 3600 })) || "[]"
  );

  return c.html(indexTemplate(news));
});

app.all("/api/news", async (c) => {
  // Get news from KV
  const news = JSON.parse(
    (await c.env.READER_KV.get("news", { cacheTtl: 3600 })) || "[]"
  );

  // Prefix news with 📰⚡ Reader's hostname + Cloudinary CDN
  for (let i = 0; i < news.length; i++) {
    news[i].link = "https://" + c.req.header("host") + "/" + news[i].link;
    news[i].image = c.env.CLOUDINARY_URL + news[i].image;
  }

  return c.json({ success: true, news });
});

app.use("/*", cache({ cacheName: "reader", cacheControl: "max-age=86400" }));
app.all("/*", async (c) => {
  // Security headers
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; object-src 'none'; script-src 'self' static.cloudflareinsights.com; connect-src 'self' cloudflareinsights.com; style-src 'self' https://cdn.jsdelivr.net; img-src https: data:"
  );

  let { pathname } = new URL(c.req.url);

  // Get URL without protocol
  if (pathname.includes("://")) {
    pathname = pathname.split("://")[1];
  } else if (pathname.includes(":/")) {
    pathname = pathname.split(":/")[1];
  } else if (pathname.startsWith("/")) {
    pathname = pathname.substring(1);
  }

  // Parse and cache news
  let news: newsData;
  const cache = await c.env.READER_KV.get(`cache:${pathname}`, {
    cacheTtl: 3600,
  });
  if (cache && c.env.WORKERS_ENV === "prod") {
    news = JSON.parse(cache);
    news.pubDate = new Date(news.pubDate);
  } else {
    news = await parseNews("https://" + pathname);
    await c.env.READER_KV.put(`cache:${pathname}`, JSON.stringify(news), {
      expirationTtl: 86400,
    });
  }

  // Optimize image with Cloudinary whenever possible
  news.content = news.content.replace(
    /<img[^>]* src=["'](.{0,255}?)["']/gi,
    `<img src="${c.env.CLOUDINARY_URL}$1"`
  );
  news.imageSrc =
    news.imageSrc.length <= 255
      ? c.env.CLOUDINARY_URL + news.imageSrc
      : news.imageSrc;

  return c.html(newsTemplate(news));
});

app.onError((err, c) => {
  // Log error to Sentry
  if (c.env.SENTRY_URL) {
    captureError(
      c.env.SENTRY_URL,
      c.env.WORKERS_ENV,
      "reader@latest",
      err,
      c.req.raw,
      {}
    );
  }

  return c.html(errorTemplate(err.message), 500);
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(updateNews(env));
  },
};
