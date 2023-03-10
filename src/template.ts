/* 📰⚡ Reader
File: src/template.ts
Author: Kai Folf
Description: Template for news page
License: MIT
*/

import { getStatusText, StatusCode } from "hono/utils/http-status";

export type newsData = {
  lang: string;
  title: string;
  description: string;
  imageSrc: string;
  pubDate: Date;
  author: string;
  imageAlt: string;
  content: string;
  status: number;
  error: string;
};

export function indexTemplate(news: []): string {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>📰⚡ Reader - The Lightning-fast Indonesian News Reader</title>
      <meta name="description" content="Read Kompas, Liputan6, Tribunnews articles without ads and distractions!">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="theme-color" content="#DDFE67">

      <!-- Open Graph -->
      <meta property="og:site_name" content="📰⚡ Reader">
      <meta property="og:title" content="📰⚡ Reader - The Lightning-fast Indonesian News Reader">
      <meta property="og:description" content="Read Kompas, Liputan6, Tribunnews articles without ads and distractions!">
      <meta property="og:type" content="website">
      <meta property="og:image" content="https://opengraph.githubassets.com/93319d7a41623d264aa57403823edc73d803e4076f9de6031273563c096d8f9b/folfcoder/reader">

      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:site" content="@folfcoder">
      <meta name="twitter:title" content="📰⚡ Reader - The Lightning-fast Indonesian News Reader">
      <meta name="twitter:description" content="Read Kompas, Liputan6, Tribunnews articles without ads and distractions!">
      <meta name="twitter:image" content="https://opengraph.githubassets.com/93319d7a41623d264aa57403823edc73d803e4076f9de6031273563c096d8f9b/folfcoder/reader">
      <meta name="twitter:image:alt" content="Image banner for 📰⚡ Reader.">

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
  if (data.status !== 200) {
    data = {
      lang: "en",
      title: `📰⚡ Reader: ${data.status} ${getStatusText(data.status as StatusCode)}`,
      description: `📰⚡ Reader: ${data.status} ${getStatusText(data.status as StatusCode)}`,
      imageSrc: "https://placekitten.com/720/480",
      imageAlt: "Enjoy this picture of a kitten!",
      pubDate: new Date(),
      author: "📰⚡ Reader",
      content: `<p>Uh oh! It looks like our code wizards accidentally let a pesky gremlin sneak into the system. Not to worry, we've apprehended the little troublemaker and are putting it in a time-out. Please take a moment to enjoy this adorable kitten pics while we straighten things out.</p><code>${data.error}</code><br><br>`,
      status: data.status,
      error: data.error,
    };
  }
  const html = `
        <!DOCTYPE html>
        <html lang="${data.lang}">
        <head>
          <title>${data.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="${data.description}">
          <meta name="robots" content="noindex">
          <meta name="theme-color" content="#DDFE67">

          <!-- Open Graph -->
          <meta property="og:site_name" content="📰⚡ Reader">
          <meta property="og:title" content="${data.title}">
          <meta property="og:description" content="${data.description}">
          <meta property="og:type" content="article">
          <meta property="article:author" content="${data.author}">
          <meta property="article:published_time" content="${data.pubDate.toISOString()}">
          <meta property="og:image" content="${data.imageSrc}">

          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:site" content="@folfcoder">
          <meta name="twitter:title" content="${data.title}">
          <meta name="twitter:description" content="${data.description}">
          <meta name="twitter:image" content="${data.imageSrc}">
          <meta name="twitter:image:alt" content="${data.imageAlt}">

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
          <article>
            ${data.content}
          </article>
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
