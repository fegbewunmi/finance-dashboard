import { useState, useEffect } from "react";
import type { Position, Holding } from "../types";
import { fetchQuote, fetchCandles } from "../services/finnhub";

// Hardcoded for now — later this could come from localStorage or a backend
const HOLDINGS: Holding[] = [
  { ticker: "AAPL", shares: 10, avgCost: 150.0 },
  { ticker: "GOOGL", shares: 5, avgCost: 120.0 },
  { ticker: "MSFT", shares: 8, avgCost: 300.0 },
  { ticker: "NVDA", shares: 3, avgCost: 400.0 },
  { ticker: "JPM", shares: 12, avgCost: 160.0 },
  { ticker: "TSLA", shares: 6, avgCost: 200.0 },
];

export const usePortfolio = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial market data on mount
  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const results = await Promise.all(
          HOLDINGS.map(async (holding) => {
            const [quote, priceHistory] = await Promise.all([
              fetchQuote(holding.ticker),
              fetchCandles(holding.ticker),
            ]);

            const totalValue = quote.currentPrice * holding.shares;
            const totalCost = holding.avgCost * holding.shares;
            const unrealizedGain = totalValue - totalCost;

            return {
              ...holding,
              ...quote,
              name: "", // we'll fill this in a moment
              sector: "",
              priceHistory,
              totalValue,
              totalCost,
              unrealizedGain,
              unrealizedGainPct: (unrealizedGain / totalCost) * 100,
            } as Position;
          }),
        );

        setPositions(results);
      } catch (err) {
        setError("Failed to load portfolio data");
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
  }, []);

  const totalValue = positions.reduce((sum, p) => sum + p.totalValue, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.totalCost, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return {
    positions,
    loading,
    error,
    summary: { totalValue, totalCost, totalGain, totalGainPct },
  };
};
