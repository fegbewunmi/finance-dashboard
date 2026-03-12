// const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
// const REST_URL = "https://finnhub.io/api/v1";

// export const fetchQuote = async (ticker: string) => {
//   const res = await fetch(
//     `${REST_URL}/quote?symbol=${ticker}&token=${API_KEY}`,
//   );
//   const data = await res.json();
//   return {
//     currentPrice: data.c,
//     previousClose: data.pc,
//     change: data.d,
//     changePct: data.dp,
//   };
// };

// // Candles are paywalled on free tier — generate realistic mock history
// // seeded from the real current price
// export const fetchCandles = async (ticker: string) => {
//   const quote = await fetchQuote(ticker);
//   const basePrice = quote.currentPrice;

//   const days = 30;
//   const now = Date.now();
//   let price = basePrice * (1 - Math.random() * 0.1); // start ~10% below current

//   return Array.from({ length: days }, (_, i) => {
//     price = price * (1 + (Math.random() - 0.48) * 0.02);
//     return {
//       timestamp: now - (days - i) * 24 * 60 * 60 * 1000,
//       price: parseFloat(price.toFixed(2)),
//     };
//   }).concat([{ timestamp: now, price: basePrice }]); // end at real price
// };

// export const createFinnhubSocket = () =>
//   new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);

// Mock prices seeded from real approximate values
// In production this would be live Finnhub data
const MOCK_PRICES: Record<string, number> = {
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

export const fetchQuote = async (ticker: string) => {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 100));

  const base = MOCK_PRICES[ticker] ?? 100;
  const previousClose = base * (1 - (Math.random() - 0.5) * 0.02);
  const currentPrice = parseFloat(
    (base * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2),
  );
  const change = parseFloat((currentPrice - previousClose).toFixed(2));
  const changePct = parseFloat(((change / previousClose) * 100).toFixed(2));

  return {
    currentPrice,
    previousClose,
    change,
    changePct,
    name: STOCK_INFO[ticker]?.name ?? ticker,
    sector: STOCK_INFO[ticker]?.sector ?? "Unknown",
  };
};

export const fetchCandles = async (ticker: string) => {
  await new Promise((res) => setTimeout(res, 100));

  const base = MOCK_PRICES[ticker] ?? 100;
  const days = 30;
  const now = Date.now();
  let price = base * (1 - Math.random() * 0.1);

  return Array.from({ length: days }, (_, i) => {
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    return {
      timestamp: now - (days - i) * 24 * 60 * 60 * 1000,
      price: parseFloat(price.toFixed(2)),
    };
  }).concat([{ timestamp: now, price: base }]);
};
