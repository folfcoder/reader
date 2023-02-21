import sanitizeHtml from "sanitize-html";

export default {
  async fetch(request, env) {
    try {
      let { pathname, searchParams, hostname } = new URL(request.url);

      // favicon.ico
      if (pathname.startsWith("/favicon.ico")) {
        return fetch("https://kaifolf.carrd.co/assets/images/image01.jpg");
      }

      // robots.txt
      if (pathname.startsWith("/robots.txt")) {
        return new Response("User-Agent: *\nAllow: /");
      }

      // Page index
      if (pathname == "/" && searchParams.get("url")) {
        return Response.redirect(
          "https://" + hostname + "/" + searchParams.get("url"),
          302
        );
      } else if (pathname == "/") {
        let rss = await fetch(
          "https://news.google.com/rss/search?q=site%3Akompas.com%20OR%20site%3Atribunnews.com%20when%3A14d&hl=en-ID&gl=ID&ceid=ID%3Aen"
        );
        let items = (await rss.text()).match(/<item>[\S\s]*?<\/item>/g);
        items.sort(() => Math.random() - 0.5);
        let news = [];
        for (let i = 0; i < Math.min(10, items.length); i++) {
          let item = items[i];
          let title = item.match(/<title>([\S\s]*?)<\/title>/)[1];
          let link = item.match(/<link>([\S\s]*?)<\/link>/)[1];
          // follow redirect, don't download data
          // let linkResponse = await fetch(link);
          // link = linkResponse.url

          let pubDate = item.match(/<pubDate>([\S\s]*?)<\/pubDate>/)[1];
          news.push({ title, link, pubDate });
        }

        let html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Reader by Kai</title>
            <meta name="description" content="Read kompas.com (and other sites) news without ads and distractions!">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="dns-prefetch" href="https://cdn.jsdelivr.net/">
            <link rel="dns-prefetch" href="https://static.cloudflareinsights.com/" />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css">
          </head>
          <body>
          <h1>Reader</h1>
          <p>Read kompas.com and tribunnews.com articles without ads and distractions!</p>
          <form action="/">
            <div style="display: flex;">
              <input style="flex-grow: 4;" type="text" id="url" name="url" placeholder="kompas.com, tribunnews.com" autofocus>
              <input type="submit" value="Read">
            </div>
          </form> 
          <h2>News</h2>
          <ul>
            ${news
              .map(
                (item) =>
                  `<li><a href="${item.link}">${
                    item.title
                  }</a> <small>${new Date(
                    item.pubDate
                  ).toLocaleString()}</small></li>`
              )
              .join("")}
          </ul>
          <footer>
            Reader by <a href="https://fcd.im" target="_blank">Kai</a> | 
            <a href="https://gist.github.com/folfcoder/c80ebb177db1e83dd12e24432a9b58b6/raw/reader.user.js" target="_blank">Userscript</a> |
            Built with Cloudflare Workers
          </footer>
          </body>
        </html>
        `;
        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html;charset=UTF-8",
            "X-Frame-Options": "DENY",
          },
        });
      }

      if (pathname.includes("://")) {
        pathname = pathname.split("://")[1];
      } else if (pathname.startsWith("/")) {
        pathname = pathname.substring(1);
      }

      if (pathname.startsWith("news.google.com")) {
        let linkResponse = await fetch("https://" + pathname);
        pathname = linkResponse.url.replace("https://", "");
        return Response.redirect("https://" + hostname + "/" + pathname, 302);
      }

      let lang,
        title,
        description,
        imageSrc,
        pubDate,
        author,
        imageAlt,
        content;

      if (pathname.includes("kompas.com")) {
        let source = await fetch("https://" + pathname + "?page=all");
        let text = await source.text();

        let h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/;
        title = text.match(h1Regex)[1];

        let descRegex =
          /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i;
        description = text.match(descRegex)[1];

        let authorRegex =
          /<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/i;
        author = text.match(authorRegex)[1];

        let pubDateRegex =
          /<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i;
        pubDate = new Date(text.match(pubDateRegex)[1]);

        let langRegex =
          /<meta[^>]*name="language"[^>]*content="([^"]*)"[^>]*>/i;
        lang = text.match(langRegex)[1];

        let imageRegex =
          /<div class="photo__wrap">[ \n]*<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"/i;
        imageSrc = text.match(imageRegex)[1];
        imageAlt = text.match(imageRegex)[2];

        content = text
          .split('<div class="read__content">')[1]
          .split('<div id="EndOfArticle">')[0];
        let bacajugaRegex = /<strong[^>]*>Baca juga:.*?<\/strong>/gi;
        content = content.replace('<div class="clearfix">', "");
        content = content.replace(bacajugaRegex, "");
      } else if (pathname.includes("tribunnews.com")) {
        pathname = pathname.replace("m.tribunnews.com", "www.tribunnews.com");
        let source = await fetch("https://" + pathname + "?page=all");
        let text = await source.text();

        let h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/;
        title = text.match(h1Regex)[1];

        let descRegex =
          /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i;
        description = text.match(descRegex)[1];

        let authorRegex =
          /<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i;
        author = text.match(authorRegex)[1];

        // "datePublished": "2023-01-20T07:21:57+07:00",
        let pubDateRegex = /"datePublished": "([^"]*)"/i;
        pubDate = new Date(text.match(pubDateRegex)[1]);

        // html lang="id-ID"
        let langRegex = /html lang="([^"]*)"/i;
        lang = text.match(langRegex)[1];

        // <meta property="og:image" content="https://cdn-2.tstatic.net/tribunnews/foto/bank/images/raker-komisi-viii-dpr-ri-kemenag-bahas-pelaksanaan-haji-2023_20230120_001511.jpg" />
        let imageRegex =
          /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i;
        imageSrc = text.match(imageRegex)[1];
        imageAlt = description;

        // Article is inside a div with class txt-article, with other classes
        let startRegex = /<div class="[^>]*? txt-article.*?>/i;
        content = text
          .split(startRegex)[1]
          .split('<div class="side-article mb5"')[0];
        content = content.replace(
          /<div class="article-content-body__item-break-index">[0-9]* dari [0-9]* halaman<\/div><hr .*?\/>/gi,
          ""
        );
        content = content.replace(/<p class="baca".*?>.*?<\/p>/gi, "");
      }

      // const response = await fetch(
      //   "https://api-inference.huggingface.co/models/brian-the-dev/autotrain-baitblocker-3008186497",
      //   {
      //     headers: {
      //       Authorization: "Bearer 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",
      //     },
      //     method: "POST",
      //     body: JSON.stringify({ inputs: "I like you. I love you" }),
      //   }
      // );
      // return new Response(JSON.stringify(await response.statusText));

      // <p>Reader's BaitBlockerTM AI has detected this title as ${isClickbait ? "clickbait" : "not clickbait"} with a confidence of ${confidence}. Please note that this model is still new and might be wrong.</p>
      let html = `
        <!DOCTYPE html>
        <html lang="${lang}">
        <head>
          <title>${title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="${description}">
          <meta name="robots" content="noindex">
          <link rel="preload" as="image" href="${imageSrc}">
          <link rel="dns-prefetch" href="https://cdn.jsdelivr.net/">
          <link rel="dns-prefetch" href="https://static.cloudflareinsights.com/" />
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css">
        </head>
        <body>
          <h1>${title}</h1>
          <span>${pubDate.toDateString()} | ${author}</span>
          <hr>
          <img width="750" height="500" src="${imageSrc}" alt="${imageAlt}"/>
          ${sanitizeHtml(content, {
            allowedTags: sanitizeHtml.defaults.allowedTags
              .concat(["img"])
              .filter((item) => item !== "a"),
          })}
          <a href="/"><< Return to Reader</a>
          <footer>
            Reader by <a href="https://fcd.im" target="_blank">Kai</a> | 
            <a href="https://gist.github.com/folfcoder/c80ebb177db1e83dd12e24432a9b58b6/raw/reader.user.js" target="_blank">Userscript</a> |
            Built with Cloudflare Workers
          </footer>
        </body>
        </html>
      `;
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "X-Frame-Options": "DENY",
        },
      });
    } catch (e) {
      return new Response(e);
      //return fetch("https://http.cat/500")
    }
  },
};
