import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Position } from "../types";

interface Props {
  position: Position;
}

const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function PriceChart({ position }: Props) {
  const isUp = position.change >= 0;
  const color = isUp ? "#34d399" : "#f87171";

  const data = position.priceHistory.map((p) => ({
    date: fmt.format(new Date(p.timestamp)),
    price: p.price,
  }));

  const min = Math.min(...data.map((d) => d.price));
  const max = Math.max(...data.map((d) => d.price));
  const padding = (max - min) * 0.1;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`grad-${position.ticker}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#737373", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            domain={[min - padding, max + padding]}
            tick={{ fill: "#737373", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: "#171717",
              border: "1px solid #262626",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#e5e5e5",
            }}
            formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${position.ticker})`}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
