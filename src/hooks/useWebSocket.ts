import { useEffect, useState } from "react";

interface PriceMap {
  [ticker: string]: number;
}

export const useWebSocket = (tickers: string[], initialPrices: PriceMap) => {
  const [prices, setPrices] = useState<PriceMap>(initialPrices);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (Object.keys(initialPrices).length === 0) return;

    const interval = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        tickers.forEach((ticker) => {
          const current = next[ticker];
          const change = current * (1 + (Math.random() - 0.5) * 0.006);
          next[ticker] = parseFloat(change.toFixed(2));
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [initialPrices]);

  return { prices, connected };
};
