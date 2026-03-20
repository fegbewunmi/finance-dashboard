export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePct: number;
  priceHistory: PricePoint[];
}

export interface Holding {
  ticker: string;
  shares: number;
  avgCost: number;
}

export interface Position extends Stock, Holding {
  totalValue: number;
  totalCost: number;
  unrealizedGain: number;
  unrealizedGainPct: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPct: number;
  dayChange: number;
  dayChangePct: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
