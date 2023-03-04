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
};

export function indexTemplate(news: []): string {
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
      <link rel="stylesheet" href="/static/styles.css">
    </head>
    <body>
    <h1>📰⚡ Reader</h1>
    <p>Tired of slow, ad-filled news websites? Say hello to the ad-free, lightning-fast Indonesian news reader that'll make you feel like a superhero!</p>
    <form action="/">
      <label for="url">News URL</label>
      <div id="url-form">
        <input type="text" id="url" name="url" placeholder="Kompas, Liputan6, Tribunnews" autofocus>
        <input type="submit" value="Read">
      </div>
    </form> 
    <h2>News</h2>
    <ul>
      ${news
        .map(
          (item: {
            title: string;
            link: string;
            pubDate: Date;
            image: string;
          }) =>
            `<li><a href="/${item.link}">${item.title}</a> <small>${new Date(
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
  return html;
}

export function newsTemplate(data: newsData): string {
  // Sanitize HTML
  let sanitized = sanitizeHtml(data.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags
      .concat(["img"])
      .filter((item: unknown) => item !== "a" && item !== "div"),
  });

  // Remove empty tags (https://stackoverflow.com/a/5573115, CC BY-SA 4.0)
  sanitized = sanitized.replace(/<(\w+)\b(?:\s+[\w\-.:]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[\w\-.:]+))?)*\s*\/?>\s*<\/\1\s*>/gim, "")

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
          <img width="750" height="500" src="${data.imageSrc}" alt="${
    data.imageAlt
  }"/>
          ${sanitized}
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

export function errorTemplate(error: string): string {
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
    <h1>📰⚡ Reader: Server Error</h1>
    <span>${new Date().toString()}</span>
    <hr>
    <p><code>${error}</code></p>
    <p>Uh oh! It looks like our code wizards accidentally let a pesky gremlin sneak into the system. Not to worry, we've apprehended the little troublemaker and are putting it in a time-out. Please take a moment to enjoy this adorable kitten pics while we straighten things out.</p>
    <img src="https://placekitten.com/720/480" alt="Enjoy this picture of a kitten!" width="100%" />
    <p><a href="/"><< Return</a></p>
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
