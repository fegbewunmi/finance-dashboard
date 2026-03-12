export interface PricePoint {
  timestamp: number; // Unix ms
  price: number;
}

export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  change: number; // absolute $ change
  changePct: number; // % change
  priceHistory: PricePoint[];
}

export interface Holding {
  ticker: string;
  shares: number;
  avgCost: number; // average cost per share
}

export interface Position extends Stock, Holding {
  totalValue: number; // currentPrice * shares
  totalCost: number; // avgCost * shares
  unrealizedGain: number; // totalValue - totalCost
  unrealizedGainPct: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface WebSocketMessage {
  type: "trade" | "ping";
  data?: {
    s: string; // symbol
    p: number; // price
    t: number; // timestamp
    v: number; // volume
  }[];
}
