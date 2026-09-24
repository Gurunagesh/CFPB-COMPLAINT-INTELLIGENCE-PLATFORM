import { CombinedPredictionResponse, ProductPredictionResponse, TriagePredictionResponse } from "@/types/api";

export function formatCombinedAnalysisSummary(
  result: CombinedPredictionResponse,
  input: { narrative: string; company: string; dateReceived?: string },
  isDevMode: boolean = false
): string {
  const p1 = result.product_prediction;
  const p2 = result.triage_prediction;
  const timestamp = new Date().toISOString();

  let summary = `=====================================================
CFPB CONSUMER COMPLAINT INTELLIGENCE - ANALYSIS SUMMARY
=====================================================
Timestamp: ${timestamp}
Company: ${input.company || "Not Specified"}
Intake Received: ${input.dateReceived || "N/A"}

-----------------------------------------------------
PROJECT 1: PRODUCT CLASSIFICATION
-----------------------------------------------------
Predicted Product: ${p1.predicted_product}
Model Probability: ${(p1.confidence * 100).toFixed(1)}%
Model Status: ${p1.model_status || "VERIFIED"}
Top Classes:
${p1.top_predictions.map((tp) => `  - ${tp.product}: ${(tp.probability * 100).toFixed(1)}%`).join("\n")}

-----------------------------------------------------
PROJECT 2: TRIAGE DELAY ESTIMATION
-----------------------------------------------------
Estimated Triage Delay: ${p2.predicted_delay_days.toFixed(2)} days (≈ ${p2.predicted_delay_hours.toFixed(1)} hours)
Operational Band: ${p2.operational_band}
Model Status: ${p2.model_status || "EXPERIMENTAL_NOT_PRODUCTION_APPROVED"}

-----------------------------------------------------
GOVERNANCE & OPERATIONAL CONSTRAINTS
-----------------------------------------------------
1. Statistical inference; not verified ground truth.
2. Project 2 is EXPERIMENTAL and did not outperform the baseline.
3. Autonomous decisioning is STRICTLY PROHIBITED.
4. This prediction must not be used as an automated operational decision.
`;

  if (isDevMode) {
    summary += `
-----------------------------------------------------
DEVELOPER METADATA
-----------------------------------------------------
Architecture: FastAPI REST + Frozen Scikit-Learn Artifacts
P1 Architecture: Logistic Regression (Word + Char TF-IDF + OHE)
P2 Architecture: Ridge Regression (log1p transformed delay)
Endpoint: POST /api/v1/combined/predict
`;
  }

  summary += `=====================================================`;
  return summary;
}

export function formatProductSummary(
  result: ProductPredictionResponse,
  input: { narrative: string; company: string }
): string {
  return `=====================================================
CFPB PRODUCT CLASSIFICATION - ANALYSIS SUMMARY
=====================================================
Timestamp: ${new Date().toISOString()}
Company: ${input.company || "N/A"}
Predicted Product: ${result.predicted_product}
Model Probability: ${(result.confidence * 100).toFixed(1)}%
Model Status: ${result.model_status || "VERIFIED"}

Governance: Statistical inference; not verified ground truth.
=====================================================`;
}

export function formatTriageSummary(
  result: TriagePredictionResponse,
  input: { narrative: string; company: string; dateReceived?: string }
): string {
  return `=====================================================
CFPB TRIAGE DELAY - ANALYSIS SUMMARY
=====================================================
Timestamp: ${new Date().toISOString()}
Company: ${input.company || "N/A"}
Estimated Triage Delay: ${result.predicted_delay_days.toFixed(2)} days (≈ ${result.predicted_delay_hours.toFixed(1)} hours)
Operational Band: ${result.operational_band}
Model Status: ${result.model_status || "EXPERIMENTAL_NOT_PRODUCTION_APPROVED"}

Governance Constraint: Autonomous decisioning is STRICTLY PROHIBITED.
=====================================================`;
}
