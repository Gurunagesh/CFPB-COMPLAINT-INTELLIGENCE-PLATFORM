"use client";

import { useState } from "react";
import { History, Trash2, ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import { SessionHistoryItem } from "@/lib/history";
import { formatConfidence } from "@/lib/utils";

interface SessionHistoryTrayProps {
  history: SessionHistoryItem[];
  onSelect: (item: SessionHistoryItem) => void;
  onClear: () => void;
}

export function SessionHistoryTray({
  history,
  onSelect,
  onClear,
}: SessionHistoryTrayProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
        >
          <History className="h-4 w-4 text-indigo-400" />
          <span>Recent Session Inferences ({history.length})</span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
          title="Clear local session history"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear</span>
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 text-xs space-y-2 hover:border-indigo-500/40 hover:bg-slate-900 transition-all cursor-pointer"
              onClick={() => onSelect(item)}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono">{item.timestamp}</span>
                <span className="truncate max-w-[120px] font-sans font-medium text-slate-300">
                  {item.company}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                &ldquo;{item.narrativeExcerpt}&rdquo;
              </p>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px]">
                <span className="text-indigo-300 font-medium truncate max-w-[130px]">
                  {item.predictedProduct}
                </span>
                <span className="font-mono text-slate-400">
                  {formatConfidence(item.confidence)}
                </span>
              </div>

              <div className="flex items-center justify-end text-[10px] text-indigo-400 group-hover:text-indigo-300 pt-1 font-medium">
                <span>Restore analysis</span>
                <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
