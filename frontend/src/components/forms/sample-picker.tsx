"use client";

import { Sparkles } from "lucide-react";
import { SYNTHETIC_SAMPLES, SampleComplaint } from "@/lib/samples";

interface SamplePickerProps {
  onSelect: (sample: SampleComplaint) => void;
  disabled?: boolean;
  selectedId?: string | null;
}

export function SamplePicker({ onSelect, disabled = false, selectedId = null }: SamplePickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
        <span className="font-medium text-slate-300">Preset Synthetic Demonstration Scenarios:</span>
        <span className="text-[10px] text-slate-500">(1-click test input)</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SYNTHETIC_SAMPLES.map((sample) => {
          const isSelected = selectedId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(sample)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? "border-indigo-500 bg-indigo-950/60 text-indigo-200 ring-1 ring-indigo-500/50"
                  : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-800 hover:text-white"
              } disabled:pointer-events-none disabled:opacity-40`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>{sample.badge}</span>
              <span className="hidden sm:inline text-[10px] text-slate-400">
                — {sample.company.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
