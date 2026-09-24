"use client";

import { Info } from "lucide-react";
import { extractTextualSignals } from "@/lib/signals";

interface TextualSignalsPanelProps {
  narrative: string;
}

export function TextualSignalsPanel({ narrative }: TextualSignalsPanelProps) {
  const signals = extractTextualSignals(narrative);

  if (signals.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
          Detected Textual Signals
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {signals.length} recognized pattern{signals.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {signals.map((sig, idx) => (
          <span
            key={`${sig.term}-${idx}`}
            className="inline-flex items-center gap-1 rounded-md border border-indigo-500/20 bg-indigo-950/40 px-2 py-0.5 text-xs text-indigo-300 font-mono"
          >
            <span className="h-1 w-1 rounded-full bg-indigo-400" />
            <span>&quot;{sig.term}&quot;</span>
            <span className="text-[10px] text-slate-400 font-sans">({sig.category})</span>
          </span>
        ))}
      </div>

      <div className="flex items-start gap-1.5 pt-1 text-[10px] text-slate-400 leading-relaxed border-t border-slate-800/60">
        <Info className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <span className="text-slate-300 font-medium">Interpretability Note: </span>
          Recognized vocabulary signals extracted from the submitted narrative. These are descriptive textual patterns and do <span className="underline">not</span> represent causal explanations or feature importance weights.
        </p>
      </div>
    </div>
  );
}
