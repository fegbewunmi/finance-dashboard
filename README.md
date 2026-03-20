# AI Finance Dashboard

A portfolio tracker with AI-powered Q&A. Built with React, TypeScript, Vite, Recharts, and Claude.

## Stack

- **React + TypeScript + Vite** — frontend scaffold
- **Tailwind CSS** — styling
- **Recharts** — price history charts
- **Lucide React** — icons
- **Anthropic API** — AI portfolio chat

## Getting Started

```bash
npm install
cp .env.example .env     # add your VITE_ANTHROPIC_API_KEY
npm run dev
```

## Project Structure

```
src/
  components/
    StockCard.tsx        # Position card in the sidebar
    PriceChart.tsx       # 30-day area chart (Recharts)
    AIChat.tsx           # Conversational AI interface
  hooks/
    usePortfolio.ts      # Loads positions, computes P&L summary
  services/
    market.ts            # Mock market data (replaces Finnhub)
    claude.ts            # Anthropic API integration
  types/
    index.ts             # Shared TypeScript interfaces
  App.tsx                # Root layout and routing
```


## Key Technical Decisions
- **Mock data over live API** — Finnhub free tier has aggressive rate limits; mock data keeps the demo stable and removes API key friction for reviewers.
- **usePortfolio hook** — separates data fetching from UI; refreshes every 10s to simulate live price ticking.
- **Positions = Stock + Holding** — stock data (price, history) and holding data (shares, avg cost) are separate concerns that get merged into a `Position` at the hook level.
- **AI has full portfolio context** — every Claude request includes the current positions and summary so it can answer questions about specific holdings without the user having to explain their portfolio each time.
