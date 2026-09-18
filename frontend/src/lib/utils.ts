import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format confidence float (0.0 - 1.0) into rounded percentage.
 */
export function formatConfidence(score: number): string {
  if (isNaN(score)) return "0.0%";
  return `${(score * 100).toFixed(1)}%`;
}

/**
 * Categorize statistical confidence with human-readable guidance.
 */
export function getConfidenceAssessment(confidence: number): {
  label: string;
  description: string;
  variant: "high" | "medium" | "low";
} {
  if (confidence >= 0.85) {
    return {
      label: "High Statistical Confidence",
      description: "Strong signal across linguistic features and company history.",
      variant: "high",
    };
  }
  if (confidence >= 0.6) {
    return {
      label: "Moderate Confidence",
      description: "Plausible match; multiple product categories exhibit overlapping traits.",
      variant: "medium",
    };
  }
  return {
    label: "Low Statistical Confidence",
    description: "Ambiguous narrative or sparse entity tokens; review secondary probability distributions.",
    variant: "low",
  };
}

/**
 * Categorize operational triage band.
 */
export function getOperationalBandBadge(band: string): {
  label: string;
  style: string;
  description: string;
} {
  const normalized = (band || "").toUpperCase();

  if (normalized.includes("HIGH") || normalized.includes("URGENT") || normalized.includes("CRITICAL")) {
    return {
      label: band,
      style: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      description: "Elevated response latency expected; monitor intake backlog.",
    };
  }
  if (normalized.includes("MED") || normalized.includes("MODERATE")) {
    return {
      label: band,
      style: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description: "Standard handling window; within typical institutional turnaround.",
    };
  }
  return {
    label: band || "STANDARD",
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description: "Nominal SLA range; low expected latency.",
  };
}

/**
 * Returns formatted ISO string with local timezone offset preserved for intake timestamps.
 */
export function getCurrentDateTimeISO(): string {
  const now = new Date();
  // Return YYYY-MM-DDTHH:mm:ss format
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
