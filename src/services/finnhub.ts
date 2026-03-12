const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const WS_URL = `wss://ws.finnhub.io?token=${API_KEY}`;
const REST_URL = "https://finnhub.io/api/v1";

export const fetchQuote = async (ticker: string) => {
  const res = await fetch(
    `${REST_URL}/quote?symbol=${ticker}&token=${API_KEY}`,
  );
  const data = await res.json();

  return {
    currentPrice: data.c, // current price
    previousClose: data.pc, // previous close
    change: data.d, // absolute change
    changePct: data.dp, // % change
  };
};

export const fetchCandles = async (ticker: string) => {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 30 * 24 * 60 * 60; // 30 days ago

  const res = await fetch(
    `${REST_URL}/stock/candle?symbol=${ticker}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`,
  );
  const data = await res.json();

  if (data.s !== "ok") return [];

  // Finnhub returns parallel arrays — zip them into PricePoint objects
  return data.t.map((timestamp: number, i: number) => ({
    timestamp: timestamp * 1000, // convert to ms
    price: data.c[i], // closing price
  }));
};

export const createFinnhubSocket = () => new WebSocket(WS_URL);
