"use client";

import { useState } from "react";
import { ProductProbability } from "@/types/api";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProbabilityChartProps {
  data: ProductProbability[];
  showAllInitially?: boolean;
}

export function ProbabilityChart({ data, showAllInitially = false }: ProbabilityChartProps) {
  const [showAll, setShowAll] = useState(showAllInitially);

  if (!data || data.length === 0) return null;

  const displayItems = showAll ? data : data.slice(0, 4);
  const remainingCount = data.length - 4;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {displayItems.map((item, index) => {
          const percentage = item.probability * 100;
          const isTop = index === 0;

          return (
            <div key={item.product} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`truncate max-w-[260px] sm:max-w-[340px] font-medium ${
                    isTop ? "text-indigo-200 font-semibold" : "text-slate-400"
                  }`}
                  title={item.product}
                >
                  {item.product}
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    isTop ? "text-indigo-400 font-bold" : "text-slate-400"
                  }`}
                >
                  {percentage.toFixed(1)}%
                </span>
              </div>

              {/* Animated Horizontal Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isTop
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-sm shadow-indigo-500/30"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  style={{ width: `${Math.max(percentage, 1.5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors pt-1"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-3 w-3" />
              <span>Show top 4 probabilities only</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span>View all {data.length} class probabilities (+{remainingCount} more)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
