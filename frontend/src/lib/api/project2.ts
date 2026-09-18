import { apiClient } from "./client";
import { TriagePredictionRequest, TriagePredictionResponse } from "@/types/api";

/**
 * Project 2: Triage Latency Prediction
 * Endpoint: POST /api/v1/project2/triage/predict
 */
export async function predictTriage(
  data: TriagePredictionRequest
): Promise<TriagePredictionResponse> {
  return apiClient<TriagePredictionResponse>("/api/v1/project2/triage/predict", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
