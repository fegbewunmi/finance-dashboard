import type { Position } from "../types";

interface Props {
  position: Position;
  selected: boolean;
  onClick: () => void;
}

export function StockCard({ position: p, selected, onClick }: Props) {
  const gain = p.unrealizedGain >= 0;
  const dayUp = p.change >= 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
        selected
          ? "border-sky-500 bg-sky-500/5"
          : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-sm tracking-tight">{p.ticker}</p>
          <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-[120px]">
            {p.name}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-sm">
            ${p.currentPrice.toFixed(2)}
          </p>
          <p
            className={`text-xs mt-0.5 ${dayUp ? "text-emerald-400" : "text-red-400"}`}
          >
            {dayUp ? "+" : ""}
            {p.changePct.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-between text-xs">
        <span className="text-neutral-500">
          {p.shares} shares · avg ${p.avgCost}
        </span>
        <span className={gain ? "text-emerald-400" : "text-red-400"}>
          {gain ? "+" : ""}
          {p.unrealizedGainPct.toFixed(1)}%
        </span>
      </div>
    </button>
  );
}
