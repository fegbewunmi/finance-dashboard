import { useState } from "react";
import { TrendingUp, MessageSquare, RefreshCw } from "lucide-react";
import { usePortfolio } from "./hooks/usePortfolio";
import { StockCard } from "./components/StockCard";
import { PriceChart } from "./components/PriceChart";
import { AIChat } from "./components/AIChat";
import type { Position } from "./types";

export default function App() {
  const { positions, summary, loading, error } = usePortfolio();
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"portfolio" | "chat">("portfolio");

  const selected: Position | undefined = positions.find(
    (p) => p.ticker === selectedTicker
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400">
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-sm tracking-widest uppercase">
            Loading portfolio...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2 });
  const sign = (n: number) => (n >= 0 ? "+" : "");

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-sky-600 flex items-center justify-center">
            <TrendingUp size={14} />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              Finance Dashboard
            </h1>
            <p className="text-xs text-neutral-500">
              AI-Powered Portfolio Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-neutral-400">Live</span>
        </div>
      </header>

      {/* Summary bar */}
      <div className="border-b border-neutral-800 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Portfolio Value
          </p>
          <p className="text-xl font-semibold mt-1">${fmt(summary.totalValue)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Total Return
          </p>
          <p
            className={`text-xl font-semibold mt-1 ${summary.totalGain >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {sign(summary.totalGain)}${fmt(Math.abs(summary.totalGain))}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Return %
          </p>
          <p
            className={`text-xl font-semibold mt-1 ${summary.totalGainPct >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {sign(summary.totalGainPct)}
            {summary.totalGainPct.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            Today
          </p>
          <p
            className={`text-xl font-semibold mt-1 ${summary.dayChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {sign(summary.dayChange)}${fmt(Math.abs(summary.dayChange))}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: stock list */}
        <aside className="w-72 border-r border-neutral-800 flex flex-col overflow-hidden">
          <div className="flex border-b border-neutral-800">
            {(["portfolio", "chat"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? "text-sky-400 border-b-2 border-sky-500"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab === "portfolio" ? (
                  <TrendingUp size={12} />
                ) : (
                  <MessageSquare size={12} />
                )}
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "portfolio" ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {positions.map((p) => (
                <StockCard
                  key={p.ticker}
                  position={p}
                  selected={selectedTicker === p.ticker}
                  onClick={() =>
                    setSelectedTicker(
                      selectedTicker === p.ticker ? null : p.ticker
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <AIChat positions={positions} summary={summary} />
            </div>
          )}
        </aside>

        {/* Right: chart / detail */}
        <main className="flex-1 p-6 overflow-y-auto">
          {selected ? (
            <div>
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {selected.ticker}
                    </h2>
                    <p className="text-neutral-400 text-sm mt-0.5">
                      {selected.name} · {selected.sector}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">
                      ${selected.currentPrice.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm mt-0.5 ${selected.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {sign(selected.change)}${selected.change.toFixed(2)} (
                      {sign(selected.changePct)}
                      {selected.changePct.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                  30-Day Price History
                </p>
                <PriceChart position={selected} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Shares", value: selected.shares.toString() },
                  { label: "Avg Cost", value: `$${selected.avgCost}` },
                  {
                    label: "Market Value",
                    value: `$${fmt(selected.totalValue)}`,
                  },
                  {
                    label: "Unrealized P&L",
                    value: `${sign(selected.unrealizedGain)}$${fmt(Math.abs(selected.unrealizedGain))}`,
                    color:
                      selected.unrealizedGain >= 0
                        ? "text-emerald-400"
                        : "text-red-400",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
                  >
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p
                      className={`text-lg font-semibold mt-1 ${stat.color ?? ""}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-600">
              <div className="text-center">
                <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a position to view details</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
