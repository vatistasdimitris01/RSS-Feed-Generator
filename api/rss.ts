import RSS from "rss";
import { scrapePronews } from "../lib/scrapePronews";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const name = url.searchParams.get("name") || "rss";

    const articles = await scrapePronews();

    const feed = new RSS({
      title: "Pronews.gr RSS Feed",
      description: "Latest news from Pronews.gr",
      site_url: "https://www.pronews.gr/",
      feed_url: `${url.origin}/api/rss?name=${encodeURIComponent(name)}`,
      language: "el",
      pubDate: new Date(),
      ttl: 60,
    });

    for (const article of articles) {
      feed.item({
        title: article.title,
        url: article.link,
        guid: article.link,
        date: new Date(),
      });
    }

    const xml = feed.xml({ indent: true });

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new Response("Error generating RSS feed", { status: 500 });
  }
}