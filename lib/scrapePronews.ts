
import axios from "axios";
import * as cheerio from "cheerio";

interface Article {
  title: string;
  link: string;
}

export async function scrapePronews(): Promise<Article[]> {
  const url = "https://www.pronews.gr/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const articles: Article[] = [];

  $("a.card__title").each((_, el) => {
    const title = $(el).text().trim();
    let link = $(el).attr("href");
    if (link && !link.startsWith("http")) {
      link = new URL(link, url).href;
    }
    if (title && link) {
      articles.push({ title, link });
    }
  });

  return articles.slice(0, 20); // Limit to the 20 most recent articles
}
