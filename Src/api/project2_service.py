import numpy as np
from scipy.sparse import csr_matrix, hstack

## Project 2 inference service

def build_time_features(date_received):
    return np.array(
        [[
            date_received.hour,
            date_received.weekday(),
            date_received.day,
            date_received.month,
            int(date_received.weekday() >= 5)
        ]],
        dtype=np.float64
    )


def predict_triage(
    model_bundle,
    narrative: str,
    company: str,
    date_received
):
    artifact = model_bundle["artifact"]
    metadata = model_bundle["metadata"]

    narrative_matrix = (
        artifact["text_vectorizer"]
        .transform([narrative])
    )

    company_matrix = (
        artifact["company_vectorizer"]
        .transform([company])
    )

    time_matrix = csr_matrix(
        build_time_features(date_received)
    )

    X = hstack(
        [
            narrative_matrix,
            company_matrix,
            time_matrix
        ],
        format="csr"
    )

    expected_features = (
        artifact["model"].n_features_in_
    )

    if X.shape[1] != expected_features:
        raise RuntimeError(
            "Project 2 feature contract violation: "
            f"expected {expected_features}, "
            f"received {X.shape[1]}"
        )

    predicted_log_delay = float(
        artifact["model"].predict(X)[0]
    )

    predicted_delay_days = float(
        np.expm1(predicted_log_delay)
    )

    predicted_delay_days = max(
        0.0,
        predicted_delay_days
    )

    if not np.isfinite(predicted_delay_days):
        raise RuntimeError(
            "Project 2 produced a non-finite prediction."
        )

    predicted_delay_hours = (
        predicted_delay_days * 24
    )

    if predicted_delay_days <= 1:
        operational_band = "LOW"
    elif predicted_delay_days <= 3:
        operational_band = "MODERATE"
    elif predicted_delay_days <= 7:
        operational_band = "HIGH"
    else:
        operational_band = "SEVERE"

    return {
        "project": "CFPB Triage Latency Prediction",
        "model_status": (
            "experimental_not_production_approved"
        ),
        "predicted_delay_days": predicted_delay_days,
        "predicted_delay_hours": predicted_delay_hours,
        "operational_band": operational_band
    }