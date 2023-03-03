/* 📰⚡ Reader
File: src/website/kompas.ts
Author: Kai Folf
Description: Kompas.com news scraper
License: MIT
*/

import { newsData } from "../template";

export async function parseKompas(url: string): Promise<newsData> {
    const source = await fetch(url + "?page=all");
    const text = await source.text();

    const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/;
    const title = text.match(h1Regex)?.[1];

    const descRegex =
        /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i;
    const description = text.match(descRegex)?.[1];

    const authorRegex =
        /<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/i;
    const author = text.match(authorRegex)?.[1];

    const pubDateRegex =
        /<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i;
    const pubDate = new Date(text.match(pubDateRegex)?.[1] || new Date().toISOString());

    const langRegex =
        /html lang="([^"]*)"/i;
    const lang = text.match(langRegex)?.[1];

    const imageRegex =
        /<div class="photo__wrap">[ \n]*<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"/i;
    const imageSrc = text.match(imageRegex)?.[1];
    const imageAlt = text.match(imageRegex)?.[2];

    let content = text
        .split('<div class="read__content">')[1]
        .split('<div id="EndOfArticle">')[0];
    content = content.replace('<div class="clearfix">', "");
    const bacaJuga = [/<strong[^>]*>Baca juga:.*?<\/strong>/gi, /<p><strong[^>]*>Also read.*?<\/strong>.*?<\/p>/gi];
    for (let i = 0; i < bacaJuga.length; i++) {
        content = content.replace(bacaJuga[i], "");
    }
    return {
        lang: lang || "id",
        title: title || "Kompas.com News",
        description: description || "Kompas.com News",
        imageSrc: imageSrc || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
        imageAlt: imageAlt || "Kompas.com News",
        pubDate: pubDate,
        author: author || "Kompas.com",
        content: content || ""
    }
}