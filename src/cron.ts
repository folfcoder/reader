/* 📰⚡ Reader
File: src/cron.ts
Author: Kai Folf
Description: Cron job to update news
License: MIT
*/

import { parseNews } from "./parser";

export async function updateNews(env: Env): Promise<void> {
  const rss = await fetch(
    "https://news.google.com/rss/search?q=site:kompas.com OR site:tribunnews.com when:30d&hl=en-ID&gl=ID&ceid=ID:en"
  );
  const items = (await rss.text()).match(/<item>[\S\s]*?<\/item>/g);
  const news = [];
  if (items) {
    items.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(10, items.length); i++) {
      try {
        // Get news metadata
        const item = items?.[i];
        const title = item.match(/<title>([\S\s]*?)<\/title>/)?.[1];
        let link = item.match(/<link>([\S\s]*?)<\/link>/)?.[1];
        const pubDate = item.match(/<pubDate>([\S\s]*?)<\/pubDate>/)?.[1];

        // Get news URL
        if (!link) continue;
        const linkResponse = await fetch(link);
        const data = await linkResponse.text();
        link = data.split('data-n-au="')[1].split('"')[0];

        // Temporary fix: remove parapuan (currently broken)
        if (link.includes("parapuan")) continue;

        // Get news image
        const image = (await parseNews(link)).imageSrc;

        news.push({ title, link, pubDate, image });
      } catch (error) {
        console.log(error);
      }
    }
  }

  // Save news to KV
  await env.READER_KV.put("news", JSON.stringify(news));
}
