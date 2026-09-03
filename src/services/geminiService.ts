import { NewsItem, SentimentReport } from "../types";

export async function analyzeSentiment(news: NewsItem[]): Promise<SentimentReport> {
  const res = await fetch("/api/ai/sentiment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ news })
  });
  if (!res.ok) throw new Error("Failed to analyze sentiment");
  return await res.json() as SentimentReport;
}
