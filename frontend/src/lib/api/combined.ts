import { apiClient } from "./client";
import { CombinedPredictionRequest, CombinedPredictionResponse } from "@/types/api";

/**
 * Combined Inference: Dual-model execution in a single request
 * Endpoint: POST /api/v1/combined/predict
 */
export async function predictCombined(
  data: CombinedPredictionRequest
): Promise<CombinedPredictionResponse> {
  return apiClient<CombinedPredictionResponse>("/api/v1/combined/predict", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
