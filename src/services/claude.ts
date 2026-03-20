import type { ChatMessage, Position, PortfolioSummary } from "../types";

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export const askPortfolioQuestion = async (
  messages: ChatMessage[],
  positions: Position[],
  summary: PortfolioSummary
): Promise<string> => {
  if (!ANTHROPIC_API_KEY) {
    return "⚠️ No API key found. Add VITE_ANTHROPIC_API_KEY to your .env file to enable AI chat.";
  }

  const systemPrompt = `You are a concise financial assistant embedded in a portfolio dashboard.

Current portfolio snapshot:
- Total value: $${summary.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
- Unrealized gain/loss: $${summary.totalGain >= 0 ? "+" : ""}${summary.totalGain.toLocaleString("en-US", { minimumFractionDigits: 2 })} (${summary.totalGainPct >= 0 ? "+" : ""}${summary.totalGainPct.toFixed(2)}%)
- Day change: $${summary.dayChange >= 0 ? "+" : ""}${summary.dayChange.toLocaleString("en-US", { minimumFractionDigits: 2 })}

Holdings:
${positions
  .map(
    (p) =>
      `${p.ticker} (${p.name}): ${p.shares} shares @ avg cost $${p.avgCost} | current $${p.currentPrice} | P&L $${p.unrealizedGain >= 0 ? "+" : ""}${p.unrealizedGain.toFixed(2)} (${p.unrealizedGainPct >= 0 ? "+" : ""}${p.unrealizedGainPct.toFixed(2)}%)`
  )
  .join("\n")}

Be direct and concise. No disclaimers about not being a financial advisor. Answer the question plainly.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "No response.";
};
