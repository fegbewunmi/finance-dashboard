import type { Stock, PricePoint } from "../types";

const MOCK_BASE_PRICES: Record<string, number> = {
  AAPL: 178.5,
  GOOGL: 141.2,
  MSFT: 378.9,
  NVDA: 875.4,
  JPM: 195.3,
  TSLA: 245.8,
};

const STOCK_INFO: Record<string, { name: string; sector: string }> = {
  AAPL: { name: "Apple Inc.", sector: "Technology" },
  GOOGL: { name: "Alphabet Inc.", sector: "Technology" },
  MSFT: { name: "Microsoft Corp.", sector: "Technology" },
  NVDA: { name: "NVIDIA Corp.", sector: "Semiconductors" },
  JPM: { name: "JPMorgan Chase", sector: "Finance" },
  TSLA: { name: "Tesla Inc.", sector: "Automotive" },
};

// Generate 30 days of fake candle history
export const fetchCandles = async (ticker: string): Promise<PricePoint[]> => {
  await new Promise((res) => setTimeout(res, 80));
  const base = MOCK_BASE_PRICES[ticker] ?? 100;
  const points: PricePoint[] = [];
  let price = base * 0.88;
  const now = Date.now();

  for (let i = 29; i >= 0; i--) {
    price = price * (1 + (Math.random() - 0.48) * 0.025);
    points.push({
      timestamp: now - i * 24 * 60 * 60 * 1000,
      price: parseFloat(price.toFixed(2)),
    });
  }
  // Make sure it ends near the current base
  points[points.length - 1].price = base;
  return points;
};

export const fetchQuote = async (ticker: string): Promise<Stock> => {
  await new Promise((res) => setTimeout(res, 60));
  const base = MOCK_BASE_PRICES[ticker] ?? 100;
  const previousClose = parseFloat(
    (base * (1 + (Math.random() - 0.5) * 0.015)).toFixed(2)
  );
  const currentPrice = parseFloat(
    (base * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)
  );
  const change = parseFloat((currentPrice - previousClose).toFixed(2));
  const changePct = parseFloat(((change / previousClose) * 100).toFixed(2));
  const priceHistory = await fetchCandles(ticker);

  return {
    ticker,
    name: STOCK_INFO[ticker]?.name ?? ticker,
    sector: STOCK_INFO[ticker]?.sector ?? "Unknown",
    currentPrice,
    previousClose,
    change,
    changePct,
    priceHistory,
  };
};
