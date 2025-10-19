
import { scrapePronews } from "../lib/scrapePronews";

// NOTE: Serverless functions are stateless. This in-memory cache will be lost
// when the function instance is recycled. For a robust solution, use a
// database or a key-value store (like Vercel KV) to persist `lastLinks`.
let lastLinks: string[] = [];

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const webhook = searchParams.get("webhook");

  try {
    const articles = await scrapePronews();
    const currentLinks = articles.map((a) => a.link);

    if (lastLinks.length === 0) {
      lastLinks = currentLinks;
      return new Response(
        JSON.stringify({
          message: "Initialized link history. No new articles to report.",
          updated: 0,
          total: articles.length,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const newArticles = articles.filter((a) => !lastLinks.includes(a.link));

    if (newArticles.length > 0 && webhook) {
      try {
        new URL(webhook); // Validate webhook URL format
        await Promise.all(
          newArticles.map((article) =>
            fetch(webhook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(article),
            })
          )
        );
      } catch (e) {
         console.warn("Invalid or failed webhook:", webhook, e);
      }
    }

    lastLinks = currentLinks;

    return new Response(
      JSON.stringify({
        updated: newArticles.length,
        newArticles,
        total: articles.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in update function:", error);
    return new Response(JSON.stringify({ error: "Failed to process update." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
