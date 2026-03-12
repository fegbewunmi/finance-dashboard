const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const REST_URL = "https://finnhub.io/api/v1";

export const fetchQuote = async (ticker: string) => {
  const res = await fetch(
    `${REST_URL}/quote?symbol=${ticker}&token=${API_KEY}`,
  );
  const data = await res.json();
  return {
    currentPrice: data.c,
    previousClose: data.pc,
    change: data.d,
    changePct: data.dp,
  };
};

// Candles are paywalled on free tier — generate realistic mock history
// seeded from the real current price
export const fetchCandles = async (ticker: string) => {
  const quote = await fetchQuote(ticker);
  const basePrice = quote.currentPrice;

  const days = 30;
  const now = Date.now();
  let price = basePrice * (1 - Math.random() * 0.1); // start ~10% below current

  return Array.from({ length: days }, (_, i) => {
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    return {
      timestamp: now - (days - i) * 24 * 60 * 60 * 1000,
      price: parseFloat(price.toFixed(2)),
    };
  }).concat([{ timestamp: now, price: basePrice }]); // end at real price
};

export const createFinnhubSocket = () =>
  new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);
