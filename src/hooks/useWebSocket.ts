import { useEffect, useRef, useState } from "react";

interface PriceMap {
  [ticker: string]: number;
}

export const useWebSocket = (tickers: string[], initialPrices: PriceMap) => {
  const [prices, setPrices] = useState<PriceMap>({});
  const pricesRef = useRef<PriceMap>({});
  const [connected, setConnected] = useState(false);

  // Sync initialPrices into state once they arrive
  useEffect(() => {
    if (Object.keys(initialPrices).length === 0) return;
    setPrices(initialPrices);
    pricesRef.current = initialPrices;
    setConnected(true);
  }, [initialPrices]);

  // Start ticking only after we have real prices
  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    const interval = setInterval(() => {
      const next: PriceMap = {};
      tickers.forEach((ticker) => {
        const current = pricesRef.current[ticker];
        if (!current || isNaN(current)) return;
        const change = current * (1 + (Math.random() - 0.5) * 0.006);
        next[ticker] = parseFloat(change.toFixed(2));
      });

      pricesRef.current = { ...pricesRef.current, ...next };
      setPrices({ ...pricesRef.current });
    }, 3000);

    return () => clearInterval(interval);
  }, [prices, tickers]);

  return { prices, connected };
};
