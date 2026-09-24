"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CharacterCounterProps {
  currentLength: number;
  minLength?: number;
  maxLength?: number;
  className?: string;
}

export function CharacterCounter({
  currentLength,
  minLength = 10,
  maxLength = 20000,
  className = "",
}: CharacterCounterProps) {
  const isTooShort = currentLength > 0 && currentLength < minLength;
  const isApproachingMax = currentLength >= maxLength - 1000 && currentLength <= maxLength;
  const isExceeded = currentLength > maxLength;
  const isValid = currentLength >= minLength && currentLength <= maxLength;

  return (
    <div className={`flex items-center justify-between text-[11px] font-mono transition-colors ${className}`}>
      {/* State Feedback */}
      <div>
        {currentLength === 0 ? (
          <span className="text-slate-500 font-sans">Min {minLength} chars required</span>
        ) : isTooShort ? (
          <span className="text-amber-400 font-sans flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Needs {minLength - currentLength} more character{minLength - currentLength > 1 ? "s" : ""}
          </span>
        ) : isExceeded ? (
          <span className="text-rose-400 font-sans flex items-center gap-1 font-semibold">
            <AlertCircle className="h-3 w-3" />
            Exceeds maximum limit by {currentLength - maxLength} character{currentLength - maxLength > 1 ? "s" : ""}
          </span>
        ) : isApproachingMax ? (
          <span className="text-amber-400 font-sans">Near maximum character limit</span>
        ) : (
          <span className="text-emerald-400 font-sans flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Valid length for inference
          </span>
        )}
      </div>

      {/* Numerical Counter */}
      <div
        className={`font-semibold ${
          isExceeded
            ? "text-rose-400"
            : isApproachingMax
            ? "text-amber-400"
            : isValid
            ? "text-slate-300"
            : "text-slate-500"
        }`}
      >
        {currentLength.toLocaleString()} / {maxLength.toLocaleString()} chars
      </div>
    </div>
  );
}
