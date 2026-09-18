import { apiClient } from "./client";
import { HealthResponse, ReadyResponse, ModelsResponse } from "@/types/api";

/**
 * System Health Endpoint: GET /health
 */
export async function getHealth(): Promise<HealthResponse> {
  return apiClient<HealthResponse>("/health", {
    method: "GET",
    cache: "no-store",
  });
}

/**
 * Service Readiness Endpoint: GET /ready
 */
export async function getReadiness(): Promise<ReadyResponse> {
  return apiClient<ReadyResponse>("/ready", {
    method: "GET",
    cache: "no-store",
  });
}

/**
 * Models & Artifacts Metadata Endpoint: GET /models
 */
export async function getModels(): Promise<ModelsResponse> {
  return apiClient<ModelsResponse>("/models", {
    method: "GET",
    cache: "no-store",
  });
}
