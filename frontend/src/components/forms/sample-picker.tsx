"use client";

import { Sparkles } from "lucide-react";
import { SYNTHETIC_SAMPLES, SampleComplaint } from "@/lib/samples";

interface SamplePickerProps {
  onSelect: (sample: SampleComplaint) => void;
  disabled?: boolean;
}

export function SamplePicker({ onSelect, disabled = false }: SamplePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
        <span>Demonstration Presets:</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SYNTHETIC_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(sample)}
            className="rounded border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            {sample.categoryHint}
          </button>
        ))}
      </div>
    </div>
  );
}
