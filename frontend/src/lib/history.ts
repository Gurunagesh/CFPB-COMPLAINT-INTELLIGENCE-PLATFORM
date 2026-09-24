/**
 * Session history storage for client-side demonstration only.
 * Stored in browser sessionStorage; never transmitted or stored remotely.
 */

import { CombinedPredictionResponse } from "@/types/api";

export interface SessionHistoryItem {
  id: string;
  timestamp: string;
  narrativeExcerpt: string;
  fullNarrative: string;
  company: string;
  dateReceived: string;
  predictedProduct: string;
  confidence: number;
  predictedDelayDays: number;
  predictedDelayHours: number;
  operationalBand: string;
  fullResult: CombinedPredictionResponse;
}

const STORAGE_KEY = "cfpb_session_history_v1";
const MAX_HISTORY_ITEMS = 5;

export function getSessionHistory(): SessionHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionHistoryItem[];
  } catch {
    return [];
  }
}

export function addSessionHistoryItem(
  narrative: string,
  company: string,
  dateReceived: string,
  result: CombinedPredictionResponse
): SessionHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getSessionHistory();
    const excerpt = narrative.length > 80 ? `${narrative.slice(0, 80).trim()}...` : narrative;

    const newItem: SessionHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      narrativeExcerpt: excerpt,
      fullNarrative: narrative,
      company: company || "N/A",
      dateReceived,
      predictedProduct: result.product_prediction.predicted_product,
      confidence: result.product_prediction.confidence,
      predictedDelayDays: result.triage_prediction.predicted_delay_days,
      predictedDelayHours: result.triage_prediction.predicted_delay_hours,
      operationalBand: result.triage_prediction.operational_band,
      fullResult: result,
    };

    const updated = [newItem, ...current.filter((item) => item.fullNarrative !== narrative)].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearSessionHistory(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage clear errors
  }
}
