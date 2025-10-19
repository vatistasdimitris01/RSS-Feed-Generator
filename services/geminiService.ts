
import { GoogleGenAI } from "@google/genai";
import { FeedItem } from '../types';

export const fetchFeedItems = async (url: string): Promise<FeedItem[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an intelligent web scraper. Given the URL "${url}", please identify the main articles on the page. For each article, extract its title, a direct link (must be an absolute URL), and a brief description.

    Return the response as a valid JSON object with a single key "items". The value of "items" should be an array of objects, where each object has "title", "link", and "description" properties.

    Example response format:
    {
      "items": [
        {
          "title": "Example Article Title 1",
          "link": "https://example.com/article1",
          "description": "This is a short summary of the first article."
        },
        {
          "title": "Example Article Title 2",
          "link": "https://example.com/article2",
          "description": "This is a short summary of the second article."
        }
      ]
    }

    Do not include any markdown formatting (like \`\`\`json) or any other explanatory text in your response. Just the raw JSON object.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    const data = JSON.parse(text);

    if (data && Array.isArray(data.items)) {
      return data.items as FeedItem[];
    } else {
      throw new Error("Invalid JSON structure received from AI.");
    }
  } catch (error) {
    console.error("Error fetching feed items from Gemini:", error);
    throw new Error("Failed to generate feed items. The AI might have been unable to process the URL or returned an unexpected format.");
  }
};
