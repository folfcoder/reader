/* 📰⚡ Reader
File: src/website/tribun.ts
Author: Kai Folf
Description: Tribunnews.com news scraper
License: MIT
*/

import { newsData } from "../template";

export async function parseTribun(url: string): Promise<newsData> {
    url = url.replace("m.tribunnews.com", "www.tribunnews.com");
    const source = await fetch(url + "?page=all");
    const text = await source.text();

    const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/;
    const title = text.match(h1Regex)?.[1];

    const descRegex =
        /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i;
    const description = text.match(descRegex)?.[1];

    const authorRegex =
        /<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i;
    const author = text.match(authorRegex)?.[1];

    const pubDateRegex = /"datePublished": "([^"]*)"/i;
    const pubDate = new Date(text.match(pubDateRegex)?.[1] || new Date().toISOString());

    const langRegex = /html lang="([^"]*)"/i;
    const lang = text.match(langRegex)?.[1];

    const imageRegex =
        /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i;
    const imageSrc = text.match(imageRegex)?.[1];
    const imageAlt = description;

    const startRegex = /<div class="[^>]*? txt-article.*?>/i;
    let content = text
        .split(startRegex)[1]
        .split('<div class="side-article mb5"')[0];
    content = content.replace(
        /<div class="article-content-body__item-break-index">[0-9]* dari [0-9]* halaman<\/div><hr .*?\/>/gi,
        ""
    );
    content = content.replace(/<p class="baca".*?>.*?<\/p>/gi, "");
    return {
        lang: lang || "id",
        title: title || "Tribunnews.com News",
        description: description || "Tribunnews.com News",
        imageSrc: imageSrc || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
        imageAlt: imageAlt || "Tribunnews.com News",
        pubDate: pubDate,
        author: author || "Tribunnews.com",
        content: content || ""
    }
}