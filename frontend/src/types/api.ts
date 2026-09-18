/**
 * API Contract Types for CFPB Consumer Complaint Intelligence Platform
 * Authoritative source: Src/api/schemas.py, Src/api/main.py, Src/api/health.py
 * Do NOT modify without aligning with backend FastAPI schemas.
 */

// ============================================================
// SYSTEM & HEALTH SCHEMAS
// ============================================================

export interface HealthResponse {
  status: "healthy" | string;
  service: string;
}

export interface ReadyResponse {
  status: "ready" | "not_ready";
  models?: {
    project1?: boolean;
    project2?: boolean;
  };
  reason?: string;
}

export interface Project1ModelInfo {
  name: string;
  artifact_name?: string | null;
  version?: string | null;
  task?: string | null;
  target?: string | null;
  model_type?: string | null;
  status: string;
  test_metrics?: Record<string, number | string | Record<string, unknown>>;
  metadata_loaded: boolean;
}

export interface Project2ModelInfo {
  name: string;
  artifact_name?: string | null;
  version?: string | null;
  task?: string | null;
  target?: string | null;
  model_type?: string | null;
  status: string;
  test_metrics?: Record<string, number | string | Record<string, unknown>>;
  baseline_metrics?: Record<string, number | string | Record<string, unknown>>;
  baseline_required?: boolean;
  autonomous_decision_allowed?: boolean;
  metadata_loaded: boolean;
}

export interface ModelsResponse {
  project1: Project1ModelInfo;
  project2: Project2ModelInfo;
}

// ============================================================
// PROJECT 1: PRODUCT CLASSIFICATION
// ============================================================

export interface ProductProbability {
  product: string;
  probability: number;
}

export interface ProductPredictionRequest {
  narrative: string;
  company: string;
}

export interface ProductPredictionResponse {
  project: string;
  model_status: string;
  predicted_product: string;
  confidence: number;
  top_predictions: ProductProbability[];
}

// ============================================================
// PROJECT 2: TRIAGE LATENCY PREDICTION
// ============================================================

export interface TriagePredictionRequest {
  narrative: string;
  company: string;
  date_received: string; // ISO 8601 string: e.g. "2026-09-18T12:00:00"
}

export interface TriagePredictionResponse {
  project: string;
  model_status: string;
  predicted_delay_days: number;
  predicted_delay_hours: number;
  operational_band: string;
}

// ============================================================
// COMBINED ANALYSIS
// ============================================================

export interface CombinedPredictionRequest {
  narrative: string;
  company: string;
  date_received: string; // ISO 8601 string
}

export interface CombinedPredictionResponse {
  product_prediction: ProductPredictionResponse;
  triage_prediction: TriagePredictionResponse;
}

// ============================================================
// ERROR CONTRACT
// ============================================================

export interface FastAPIValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface FastAPIValidationError {
  detail: FastAPIValidationErrorDetail[] | string;
}

export interface APIErrorResponse {
  error?: string;
  detail?: string | FastAPIValidationErrorDetail[];
  message?: string;
}
