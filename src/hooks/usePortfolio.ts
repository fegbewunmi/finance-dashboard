import { useState, useEffect, useCallback } from "react";
import type { Position, PortfolioSummary } from "../types";
import { fetchQuote } from "../services/market";

// Static holdings — in a real app this would come from a backend/DB
const HOLDINGS = [
  { ticker: "AAPL", shares: 15, avgCost: 142.3 },
  { ticker: "GOOGL", shares: 8, avgCost: 128.5 },
  { ticker: "MSFT", shares: 5, avgCost: 310.0 },
  { ticker: "NVDA", shares: 3, avgCost: 620.0 },
  { ticker: "JPM", shares: 12, avgCost: 175.4 },
  { ticker: "TSLA", shares: 10, avgCost: 215.0 },
];

const EMPTY_SUMMARY: PortfolioSummary = {
  totalValue: 0,
  totalCost: 0,
  totalGain: 0,
  totalGainPct: 0,
  dayChange: 0,
  dayChangePct: 0,
};

export function usePortfolio() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const stocks = await Promise.all(
        HOLDINGS.map((h) => fetchQuote(h.ticker))
      );

      const newPositions: Position[] = stocks.map((stock, i) => {
        const holding = HOLDINGS[i];
        const totalValue = stock.currentPrice * holding.shares;
        const totalCost = holding.avgCost * holding.shares;
        const unrealizedGain = totalValue - totalCost;
        const unrealizedGainPct = (unrealizedGain / totalCost) * 100;

        return {
          ...stock,
          ...holding,
          totalValue,
          totalCost,
          unrealizedGain,
          unrealizedGainPct,
        };
      });

      const totalValue = newPositions.reduce((s, p) => s + p.totalValue, 0);
      const totalCost = newPositions.reduce((s, p) => s + p.totalCost, 0);
      const totalGain = totalValue - totalCost;
      const totalGainPct = (totalGain / totalCost) * 100;
      const dayChange = newPositions.reduce(
        (s, p) => s + p.change * p.shares,
        0
      );
      const dayChangePct =
        (dayChange /
          newPositions.reduce(
            (s, p) => s + p.previousClose * p.shares,
            0
          )) *
        100;

      setPositions(newPositions);
      setSummary({
        totalValue,
        totalCost,
        totalGain,
        totalGainPct,
        dayChange,
        dayChangePct,
      });
    } catch (e) {
      setError("Failed to load portfolio data.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + refresh every 10s to simulate live prices
  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, [load]);

  return { positions, summary, loading, error };
}
