/* 📰⚡ Reader
File: src/website/liputan6.ts
Author: Kai Folf
Description: liputan6.com news scraper
License: MIT
*/

import { newsData } from "../template";

export async function parseLiputan6(url: string): Promise<newsData> {
  const source = await fetch(url);
  const text = await source.text();

  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/;
  const title = text.match(h1Regex)?.[1];

  const descRegex = /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i;
  const description = text.match(descRegex)?.[1];

  const authorRegex = /<meta[^>]*content="([^"]*)"[^>]*name="author"[^>]*>/i;
  const author = text.match(authorRegex)?.[1];

  const pubDateRegex =
    /<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i;
  const pubDate = new Date(
    text.match(pubDateRegex)?.[1] || new Date().toISOString()
  );

  const langRegex = /html lang="([^"]*)"/i;
  const lang = text.match(langRegex)?.[1];

  const imageRegex =
    /<picture class="read-page--photo-gallery--item__picture">[ \n]*<img[^>]*data-src="([^"]*)"[^>]*alt="([^"]*)"/i;
  const imageSrc = text.match(imageRegex)?.[1];
  const imageAlt = text.match(imageRegex)?.[2];

  let content = text
    .split('data-page="1" data-title="">')[1]
    .split("<strong>* BACA BERITA TERKINI")[0];

  // Remove cek fakta
  content = content.replace(/<div[^>]*class="promo".*?<\/div>/gis, "");

  // Remove advertisement
  content = content.replace(
    /<div[^>]*class="advertisement-text".*?<\/div>/gis,
    ""
  );

  // Remove page separator
  content = content.replace(
    /<div[^>]*class="article-content-body__item-break-index".*?<\/div><hr.*?>/gis,
    ""
  );

  // Fix images
  content = content.replaceAll(" src=", " old-src=");
  content = content.replaceAll(" data-src=", " src=");
  content = content.replaceAll(
    '<span class="read-page--photo-gallery--item__icon--new-zoom__enlarge-caption">Perbesar</span>',
    ""
  );

  const bacaJuga = [/<div class="baca.*?baca juga.*?<\/div>/gis];
  for (let i = 0; i < bacaJuga.length; i++) {
    content = content.replace(bacaJuga[i], "");
  }
  return {
    lang: lang || "id",
    title: title || "Liputan6.com News",
    description: description || "Liputan6.com News",
    imageSrc:
      imageSrc ||
      "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
    imageAlt: imageAlt || "Liputan6.com News",
    pubDate: pubDate,
    author: author || "Liputan6.com News",
    content: content || "",
    status: source.status,
    error: "Failed to fetch news.",
  };
}
