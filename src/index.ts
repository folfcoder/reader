/* 📰⚡ Reader
File: src/index.ts
Author: Kai Folf
Description: Main file
License: MIT
*/

import { newsTemplate } from "./template";
import { parseKompas, parseTribun } from "./parser";

export default {
  async fetch(request: Request) {
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

      // Page index
      if (pathname == "/" && searchParams.get("url")) {
        return Response.redirect(
          "https://" + hostname + "/" + searchParams.get("url"),
          302
        );
      } else if (pathname == "/") {
        const rss = await fetch(
          "https://news.google.com/rss/search?q=site%3Akompas.com%20OR%20site%3Atribunnews.com%20when%3A45d&hl=en-ID&gl=ID&ceid=ID%3Aen"
        );
        const items = (await rss.text()).match(/<item>[\S\s]*?<\/item>/g);
        const news = [];
        if (items) {
          items.sort(() => Math.random() - 0.5);
          for (let i = 0; i < Math.min(10, items.length); i++) {
            const item = items?.[i];
            const title = item.match(/<title>([\S\s]*?)<\/title>/)?.[1];
            const link = item.match(/<link>([\S\s]*?)<\/link>/)?.[1];
            const pubDate = item.match(/<pubDate>([\S\s]*?)<\/pubDate>/)?.[1];
            news.push({ title, link, pubDate });
          }
        }

        const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>📰⚡ Reader by Kai</title>
            <meta name="description" content="Read kompas.com (and other sites) news without ads and distractions!">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="dns-prefetch" href="https://cdn.jsdelivr.net/">
            <link rel="dns-prefetch" href="https://static.cloudflareinsights.com/" />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css">
          </head>
          <body>
          <h1>📰⚡ Reader</h1>
          <p>Read kompas.com and tribunnews.com articles without ads and distractions!</p>
          <form action="/">
            <div style="display: flex;">
              <input style="flex-grow: 4;" type="text" id="url" name="url" placeholder="kompas.com, tribunnews.com" autofocus>
              <input type="submit" value="Read">
            </div>
          </form> 
          <h2>News</h2>
          <ul>
            ${news
              .map(
                (item) =>
                  `<li><a href="/${item.link}">${
                    item.title
                  }</a> <small>${new Date(
                    item.pubDate || new Date().toISOString()
                  ).toLocaleString()}</small></li>`
              )
              .join("")}
          </ul>
          <footer>
            📰⚡ Reader by <a href="https://fcd.im" target="_blank">Kai</a> | 
            <a href="https://gist.github.com/folfcoder/c80ebb177db1e83dd12e24432a9b58b6/raw/reader.user.js" target="_blank">Userscript</a> |
            Built with Cloudflare Workers
          </footer>
          </body>
        </html>
        `;
        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html;charset=UTF-8",
            "X-Frame-Options": "DENY",
          },
        });
      }

      if (pathname.includes("://")) {
        pathname = pathname.split("://")[1];
      } else if (pathname.startsWith("/")) {
        pathname = pathname.substring(1);
      }

      if (pathname.startsWith("news.google.com")) {
        const linkResponse = await fetch("https://" + pathname);
        const data = await linkResponse.text();
        const loc = data.split('data-n-au="')[1].split('"')[0];
        return Response.redirect("https://" + hostname + "/" + loc, 302);
      }

      let news;

      if (pathname.includes("kompas.com")) {
        news = await parseKompas(pathname);
      } else if (pathname.includes("tribunnews.com")) {
        news = await parseTribun(pathname);
      } else {
        return Response.redirect("https://reader.fcd.im/", 302);
      }

      // Image optimization w/ Cloudinary
      const cloudinaryUrl =
        "https://res.cloudinary.com/dljzpse4l/image/fetch/f_auto/";
      news.content = news.content.replaceAll('src="', 'src="' + cloudinaryUrl);
      news.imageSrc = cloudinaryUrl + news.imageSrc;

      const html = newsTemplate(news);

      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "X-Frame-Options": "DENY",
        },
      });
    } catch (e: unknown) {
      return new Response(e instanceof Error ? e.message : "Unknown error", {
        status: 500,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
      });
    }
  },
};
