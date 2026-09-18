import { apiClient } from "./client";
import { ProductPredictionRequest, ProductPredictionResponse } from "@/types/api";

/**
 * Project 1: Product Classification Inference
 * Endpoint: POST /api/v1/project1/product/predict
 */
export async function predictProduct(
  data: ProductPredictionRequest
): Promise<ProductPredictionResponse> {
  return apiClient<ProductPredictionResponse>("/api/v1/project1/product/predict", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
