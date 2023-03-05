/* 📰⚡ Reader
File: src/parser.ts
Author: Kai Folf
Description: Parse news based on website
License: MIT
*/

import { parseKompas } from "./website/kompas";
import { parseTribun } from "./website/tribun";
import { parseKompasID } from "./website/kompas-id";
import { parseLiputan6 } from "./website/liputan6";
import { newsData } from "./template";
import sanitizeHtml from "sanitize-html";

export async function parseNews(url: string): Promise<newsData> {
  // Clean URL
  url = url.split("?")[0];

  // Parse news
  let parsedNews: newsData = {
    lang: "en",
    title: "📰⚡ Reader: Website Not Supported!",
    description:
      "Tired of slow, ad-filled news websites? Say hello to the ad-free, lightning-fast Indonesian news reader that'll make you feel like a superhero!",
    imageSrc: "https://placekitten.com/720/480",
    imageAlt: "Enjoy this picture of a kitten!",
    author: "📰⚡ Reader",
    pubDate: new Date(),
    content:
      "<p>Reader is a work in progress, which means that not all websites are supported. Check back later!</p>",
  };
  if (url.includes("kompas.com")) parsedNews = await parseKompas(url);
  if (url.includes("kompas.id")) parsedNews = await parseKompasID(url);
  if (url.includes("tribunnews.com")) parsedNews = await parseTribun(url);
  if (url.includes("liputan6.com")) parsedNews = await parseLiputan6(url);

  // Sanitize HTML
  parsedNews.content = sanitizeHtml(parsedNews.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags
      .concat(["img"])
      .filter((item: unknown) => item !== "a" && item !== "div"),
  });

  // Remove empty tags (https://stackoverflow.com/a/5573115, CC BY-SA 4.0)
  parsedNews.content = parsedNews.content.replace(
    /<(\w+)\b(?:\s+[\w\-.:]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[\w\-.:]+))?)*\s*\/?>\s*<\/\1\s*>/gim,
    ""
  );

  return parsedNews;
}
