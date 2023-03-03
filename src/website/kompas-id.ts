/* 📰⚡ Reader
File: src/website/kompas-id.ts
Author: Kai Folf
Description: Kompas.id news scraper
License: MIT
*/

import { newsData } from "../template";

export async function parseKompasID(url: string): Promise<newsData> {
  const source = await fetch(url + "?page=all");
  const text = await source.text();

  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/;
  const title = text.match(h1Regex)?.[1];

  const descRegex = /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i;
  const description = text.match(descRegex)?.[1];

  const authorRegex = /<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/i;
  const author = text.match(authorRegex)?.[1];

  const pubDateRegex =
    /<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i;
  const pubDate = new Date(
    text.match(pubDateRegex)?.[1] || new Date().toISOString()
  );

  const langRegex = /html lang="([^"]*)"/i;
  const lang = text.match(langRegex)?.[1];

  const imageRegex = /<img alt="([^"]*)"[^>]*src="([^"]*)"/i;
  let imageSrc = text.match(imageRegex)?.[2];
  const imageAlt = text.match(imageRegex)?.[1];

  // Strip cloudfront url
  imageSrc = "https" + imageSrc?.split("https")[2];

  let content = text
    .split('<section class="content mx-auto max-w-xl non-paywall">')[1]
    .split("</article>")[0];

  // Remove the first figure tag
  content = content.replace(/<figure[^>]*>[\s\S]*?<\/figure>/, "");

  // Remove srcset and cloudfront url
  content = content.replace(/srcset="[^"]*"/gi, "");
  content = content.replace(/https:\/\/.{0,15}?cloudfront.*?https/gi, "https");

  // Remove credits and tags
  content = content.split('<div class="ksm-2dD">')[0];

  const bacaJuga = [
    /<p[^>]*>Baca juga:.*?<\/p>/gi,
    /<p[^>]*><b>.?Also read: .*?<\/b><\/p>/gi,
    /<p[^>]*>&gt;.*?<a.*?<\/a><\/p>/gi,
  ];
  for (let i = 0; i < bacaJuga.length; i++) {
    content = content.replace(bacaJuga[i], "");
  }
  return {
    lang: lang || "id",
    title: title || "Kompas.id News",
    description: description || "Kompas.id News",
    imageSrc:
      imageSrc ||
      "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
    imageAlt: imageAlt || "Kompas.id News",
    pubDate: pubDate,
    author: author || "Kompas.id",
    content: content || "",
  };
}
