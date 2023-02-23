/* 📰⚡ Reader
File: src/website/tribun.ts
Author: Kai Folf
Description: Tribunnews.com news scraper
License: MIT
*/

import { newsData } from "../template";

export async function stripTribun(path: string): Promise<newsData> {
    path = path.replace("m.tribunnews.com", "www.tribunnews.com");
    let source = await fetch("https://" + path + "?page=all");
    let text = await source.text();

    let h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/;
    let title = text.match(h1Regex)?.[1];

    let descRegex =
        /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i;
    let description = text.match(descRegex)?.[1];

    let authorRegex =
        /<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i;
    let author = text.match(authorRegex)?.[1];

    let pubDateRegex = /"datePublished": "([^"]*)"/i;
    let pubDate = new Date(text.match(pubDateRegex)?.[1] || new Date().toISOString());

    let langRegex = /html lang="([^"]*)"/i;
    let lang = text.match(langRegex)?.[1];

    let imageRegex =
        /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i;
    let imageSrc = text.match(imageRegex)?.[1];
    let imageAlt = description;

    let startRegex = /<div class="[^>]*? txt-article.*?>/i;
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