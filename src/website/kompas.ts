/* 📰⚡ Reader
File: src/website/kompas.ts
Author: Kai Folf
Description: Kompas.com news scraper
License: MIT
*/

import { newsData } from "../template";

export async function stripKompas(path: string): Promise<newsData> {
    let source = await fetch("https://" + path + "?page=all");
    let text = await source.text();

    let h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/;
    let title = text.match(h1Regex)?.[1];

    let descRegex =
        /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i;
    let description = text.match(descRegex)?.[1];

    let authorRegex =
        /<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/i;
    let author = text.match(authorRegex)?.[1];

    let pubDateRegex =
        /<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i;
    let pubDate = new Date(text.match(pubDateRegex)?.[1] || new Date().toISOString());

    let langRegex =
        /html lang="([^"]*)"/i;
    let lang = text.match(langRegex)?.[1];

    let imageRegex =
        /<div class="photo__wrap">[ \n]*<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"/i;
    let imageSrc = text.match(imageRegex)?.[1];
    let imageAlt = text.match(imageRegex)?.[2];

    let content = text
        .split('<div class="read__content">')[1]
        .split('<div id="EndOfArticle">')[0];
    content = content.replace('<div class="clearfix">', "");
    let bacaJuga = [/<strong[^>]*>Baca juga:.*?<\/strong>/gi, /<p><strong[^>]*>Also read.*?<\/strong>.*?<\/p>/gi];
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