import { useMemo } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { usePortfolio } from "./hooks/usePortfolio";

const TICKERS = ["AAPL", "GOOGL", "MSFT", "NVDA", "JPM", "TSLA"];

export default function App() {
  const { positions, loading, error, summary } = usePortfolio();

  // Build initial prices from fetched positions
  const initialPrices = useMemo(() => {
    return positions.reduce(
      (acc, p) => {
        acc[p.ticker] = p.currentPrice;
        return acc;
      },
      {} as { [ticker: string]: number },
    );
  }, [positions]);

  const { prices, connected } = useWebSocket(TICKERS, initialPrices);

  // Merge live prices into positions for display
  const livePositions = useMemo(() => {
    return positions.map((p) => {
      const livePrice = prices[p.ticker] ?? p.currentPrice;
      const totalValue = livePrice * p.shares;
      const unrealizedGain = totalValue - p.totalCost;
      return {
        ...p,
        currentPrice: livePrice,
        totalValue,
        unrealizedGain,
        unrealizedGainPct: (unrealizedGain / p.totalCost) * 100,
      };
    });
  }, [positions, prices]);

  const liveSummary = useMemo(() => {
    const totalValue = livePositions.reduce((sum, p) => sum + p.totalValue, 0);
    const totalCost = livePositions.reduce((sum, p) => sum + p.totalCost, 0);
    const totalGain = totalValue - totalCost;
    return {
      totalValue,
      totalCost,
      totalGain,
      totalGainPct: totalCost > 0 ? (totalGain / totalCost) * 100 : 0,
    };
  }, [livePositions]);

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400 tracking-widest text-sm uppercase">
          Loading portfolio...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Finance Dashboard
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            AI-Powered Portfolio Intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
          />
          <span className="text-xs text-neutral-400">
            {connected ? "Live" : "Reconnecting..."}
          </span>
        </div>
      </header>

      {/* Summary bar */}
      <div className="border-b border-neutral-800 px-8 py-4 flex gap-12">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Portfolio Value
          </p>
          <p className="text-2xl font-semibold mt-1">
            $
            {liveSummary.totalValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Total Return
          </p>
          <p
            className={`text-2xl font-semibold mt-1 ${liveSummary.totalGain >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {liveSummary.totalGain >= 0 ? "+" : ""}$
            {liveSummary.totalGain.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
            <span className="text-sm ml-2">
              ({liveSummary.totalGainPct.toFixed(2)}%)
            </span>
          </p>
        </div>
      </div>

      {/* Positions */}
      <main className="px-8 py-6">
        <div className="grid grid-cols-1 gap-3">
          {livePositions.map((position) => (
            <div
              key={position.ticker}
              className="border border-neutral-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">{position.ticker}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {position.shares} shares
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${position.currentPrice.toFixed(2)}
                </p>
                <p
                  className={`text-xs mt-0.5 ${position.unrealizedGain >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {position.unrealizedGain >= 0 ? "+" : ""}$
                  {position.unrealizedGain.toFixed(2)} (
                  {position.unrealizedGainPct.toFixed(2)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
