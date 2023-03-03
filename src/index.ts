/* 📰⚡ Reader
File: src/index.ts
Author: Kai Folf
Description: Main file
License: MIT
*/

import { indexTemplate, newsTemplate } from "./template";
import { parseNews } from "./parser";
import { updateNews } from "./cron";
import { captureError } from "@cfworker/sentry";

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(updateNews(env));
  },
  async fetch(request: Request, env: Env) {
    try {
      let { pathname } = new URL(request.url);
      const { searchParams, hostname } = new URL(request.url);

      // favicon.ico
      if (pathname.startsWith("/favicon.ico")) {
        return fetch("https://kaifolf.carrd.co/assets/images/image01.jpg");
      }

      // robots.txt
      if (pathname.startsWith("/robots.txt")) {
        return new Response("User-Agent: *\nAllow: /");
      }

      // News API
      if (pathname.startsWith("/api/news")) {
        try {
          // Get news from KV
          const news = JSON.parse(
            (await env.READER_KV.get("news", { cacheTtl: 3600 })) || "[]"
          );

          // Prefix news with 📰⚡ Reader's hostname + Cloudinary CDN
          for (let i = 0; i < news.length; i++) {
            news[i].link = "https://" + hostname + "/" + news[i].link;
            news[i].image = env.CLOUDINARY_URL + news[i].image;
          }

          // Return news
          return new Response(JSON.stringify({ success: true, news: news }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (e: unknown) {
          return new Response(
            JSON.stringify({
              success: false,
              error: e instanceof Error ? e.message : "Unknown error",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
      }

      // Page index
      if (pathname == "/" && searchParams.get("url")) {
        return Response.redirect(
          "https://" + hostname + "/" + searchParams.get("url"),
          302
        );
      } else if (pathname == "/") {
        // Get news from KV
        const news = JSON.parse(
          (await env.READER_KV.get("news", { cacheTtl: 3600 })) || "[]"
        );

        const { html, nonce } = indexTemplate(news);
        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html;charset=UTF-8",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Content-Security-Policy": `default-src 'self'; object-src 'none'; script-src 'self' static.cloudflareinsights.com; connect-src cloudflareinsights.com; style-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net; img-src 'self' res.cloudinary.com;`,
          },
        });
      }

      if (pathname.includes("://")) {
        pathname = pathname.split("://")[1];
      } else if (pathname.includes(":/")) {
        pathname = pathname.split(":/")[1];
      } else if (pathname.startsWith("/")) {
        pathname = pathname.substring(1);
      }

      const news = await parseNews("https://" + pathname);

      // Image optimization w/ Cloudinary
      news.content = news.content.replaceAll(
        'src="',
        'src="' + env.CLOUDINARY_URL
      );
      news.imageSrc = env.CLOUDINARY_URL + news.imageSrc;

      const html = newsTemplate(news);

      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Content-Security-Policy": `default-src 'self'; object-src 'none'; script-src 'self' static.cloudflareinsights.com; connect-src cloudflareinsights.com; style-src 'self' https://cdn.jsdelivr.net; img-src 'self' res.cloudinary.com;`,
        },
      });
    } catch (e: unknown) {
      // Log error to Sentry
      if (env.SENTRY_URL) {
        captureError(
          env.SENTRY_URL,
          env.WORKERS_ENV,
          "reader@latest",
          e,
          request,
          {}
        );
      }

      // Return error
      return new Response(e instanceof Error ? e.message : "Unknown error", {
        status: 500,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Content-Security-Policy": `default-src 'self'; object-src 'none'; script-src 'self' static.cloudflareinsights.com; connect-src cloudflareinsights.com; style-src 'self' https://cdn.jsdelivr.net; img-src 'self' res.cloudinary.com;`,
        },
      });
    }
  },
};
