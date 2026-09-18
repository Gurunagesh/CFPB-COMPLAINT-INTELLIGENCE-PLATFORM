"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ProductProbability } from "@/types/api";

interface ProbabilityChartProps {
  data: ProductProbability[];
}

interface TooltipPayload {
  payload?: {
    product: string;
    percentage: number;
    probability: number;
  };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    if (!item) return null;
    return (
      <div className="rounded border border-slate-700 bg-slate-900 p-2.5 shadow-xl text-xs font-mono">
        <p className="font-sans font-medium text-slate-200">{item.product}</p>
        <p className="mt-1 text-indigo-400 font-semibold">
          Probability: {item.percentage.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
}

export function ProbabilityChart({ data }: ProbabilityChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((item, index) => ({
    product: item.product.length > 28 ? `${item.product.substring(0, 26)}...` : item.product,
    fullProduct: item.product,
    probability: item.probability,
    percentage: item.probability * 100,
    isTop: index === 0,
  }));

  return (
    <div className="w-full h-64 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            unit="%"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="product"
            width={140}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={16}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isTop ? "#6366f1" : "#334155"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
