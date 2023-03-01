/* 📰⚡ Reader
File: src/template.ts
Author: Kai Folf
Description: Template for news page
License: MIT
*/

import sanitizeHtml from "sanitize-html";

export type newsData = {
    lang: string;
    title: string;
    description: string;
    imageSrc: string;
    pubDate: Date;
    author: string;
    imageAlt: string;
    content: string;
  }

export function newsTemplate(data: newsData): string {
  const html = `
        <!DOCTYPE html>
        <html lang="${data.lang}">
        <head>
          <title>${data.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="${data.description}">
          <meta name="robots" content="noindex">
          <link rel="preload" as="image" href="${data.imageSrc}">
          <link rel="dns-prefetch" href="https://cdn.jsdelivr.net/">
          <link rel="dns-prefetch" href="https://static.cloudflareinsights.com/" />
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css">
        </head>
        <body>
          <h1>${data.title}</h1>
          <span>${data.pubDate.toDateString()} | ${data.author}</span>
          <hr>
          <img width="750" height="500" src="${data.imageSrc}" alt="${data.imageAlt}"/>
          ${sanitizeHtml(data.content, {
            allowedTags: sanitizeHtml.defaults.allowedTags
              .concat(["img"])
              .filter((item: unknown) => item !== "a"),
          })}
          <a href="/"><< Return</a>
          <footer>
            📰⚡ Reader by <a href="https://fcd.im" target="_blank">Kai</a> | 
            <a href="https://gist.github.com/folfcoder/c80ebb177db1e83dd12e24432a9b58b6/raw/reader.user.js" target="_blank">Userscript</a> |
            Built with Cloudflare Workers
          </footer>
        </body>
        </html>
      `;
  return html;
}
