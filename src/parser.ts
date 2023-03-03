/* 📰⚡ Reader
File: src/parser.ts
Author: Kai Folf
Description: Parse news based on website
License: MIT
*/

import { parseKompas } from "./website/kompas";
import { parseTribun } from "./website/tribun";
import { parseKompasID } from "./website/kompas-id";
import { newsData } from "./template";

export async function parseNews(url: string): Promise<newsData> {
    // Clean URL
    url = url.split("?")[0];

    // Parse news
    if (url.includes("kompas.com")) return parseKompas(url);
    if (url.includes("kompas.id")) return parseKompasID(url);
    if (url.includes("tribunnews.com")) return parseTribun(url);
    return { lang: "en", title: "📰⚡ Reader: Website Not Supported!", description: "Tired of slow, ad-filled news websites? Say hello to the ad-free, lightning-fast Indonesian news reader that'll make you feel like a superhero!", imageSrc: "https://placekitten.com/720/480", imageAlt: "Enjoy this picture of a kitten!", author: "📰⚡ Reader", pubDate: new Date(), content: "<p>Reader is a work in progress, which means that not all websites are supported. Check back later!</p>" };
}