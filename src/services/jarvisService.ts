import { Portfolio } from "../types";

export async function getJarvisResponse(
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  portfolio: Portfolio | null
) {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, portfolio })
  });
  if (!res.ok) throw new Error("Failed to get chat response");
  const data = await res.json();
  return data.text;
}

export async function getStockDecision(symbol: string, portfolio: Portfolio | null) {
  const res = await fetch("/api/ai/decision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, portfolio })
  });
  if (!res.ok) throw new Error("Failed to get decision");
  return await res.json();
}
