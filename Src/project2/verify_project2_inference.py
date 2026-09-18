from pathlib import Path
import hashlib
import json

import joblib
import numpy as np
import pandas as pd

from scipy.sparse import hstack, csr_matrix


# ============================================================
# PROJECT 2 — INFERENCE CONTRACT VERIFICATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

PACKAGE_DIR = (
    PROJECT_ROOT
    / "Reports"
    / "project2"
    / "Models_package"
)

ARTIFACT_PATH = (
    PACKAGE_DIR
    / "project2_triage_latency_predictor.joblib"
)

METADATA_PATH = (
    PACKAGE_DIR
    / "model_metadata.json"
)

HASH_PATH = (
    PACKAGE_DIR
    / "artifact.sha256"
)


# ============================================================
# HELPERS
# ============================================================

def sha256_file(path):

    sha256 = hashlib.sha256()

    with open(path, "rb") as f:

        for chunk in iter(
            lambda: f.read(1024 * 1024),
            b""
        ):

            sha256.update(chunk)

    return sha256.hexdigest()


def build_time_features(date_received):

    timestamp = pd.to_datetime(
        date_received,
        utc=True
    )

    return np.array(
        [
            [
                timestamp.hour,
                timestamp.dayofweek,
                timestamp.day,
                timestamp.month,
                int(timestamp.dayofweek >= 5)
            ]
        ],
        dtype=np.float64
    )


def predict_raw(
    artifact,
    narrative,
    company,
    date_received
):

    text_vectorizer = (
        artifact["text_vectorizer"]
    )

    company_vectorizer = (
        artifact["company_vectorizer"]
    )

    model = artifact["model"]


    narrative_matrix = (
        text_vectorizer.transform(
            [narrative]
        )
    )


    company_matrix = (
        company_vectorizer.transform(
            [company]
        )
    )


    time_matrix = csr_matrix(
        build_time_features(
            date_received
        )
    )


    X = hstack(
        [
            narrative_matrix,
            company_matrix,
            time_matrix
        ],
        format="csr"
    )


    if X.shape[1] != model.n_features_in_:

        raise AssertionError(
            "Feature-count mismatch: "
            f"{X.shape[1]} != "
            f"{model.n_features_in_}"
        )


    predicted_log_delay = float(
        model.predict(X)[0]
    )


    predicted_delay_days = float(
        np.expm1(
            predicted_log_delay
        )
    )


    # Real-world latency cannot be negative.
    predicted_delay_days = max(
        0.0,
        predicted_delay_days
    )


    predicted_delay_hours = (
        predicted_delay_days * 24
    )


    return {
        "log_prediction":
            predicted_log_delay,

        "delay_days":
            predicted_delay_days,

        "delay_hours":
            predicted_delay_hours,

        "feature_shape":
            X.shape,
    }


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("PROJECT 2 — INFERENCE CONTRACT VERIFICATION")
print("=" * 70)


# ============================================================
# [1] FILE EXISTENCE
# ============================================================

print("\n[1] DEPLOYMENT FILES")


for path, label in [

    (
        ARTIFACT_PATH,
        "Artifact"
    ),

    (
        METADATA_PATH,
        "Metadata"
    ),

    (
        HASH_PATH,
        "SHA-256"
    ),

]:

    if not path.exists():

        raise AssertionError(
            f"{label} missing:\n{path}"
        )

    print(
        f"{label:<25}: PASS"
    )


# ============================================================
# [2] HASH VERIFICATION
# ============================================================

print("\n[2] ARTIFACT INTEGRITY")


actual_hash = sha256_file(
    ARTIFACT_PATH
)

expected_hash = (
    HASH_PATH
    .read_text(
        encoding="utf-8"
    )
    .strip()
)


print(
    "Actual SHA-256   :",
    actual_hash
)

print(
    "Expected SHA-256 :",
    expected_hash
)


if actual_hash != expected_hash:

    raise AssertionError(
        "SHA-256 mismatch."
    )


print(
    "SHA-256 validation           : PASS"
)


# ============================================================
# [3] LOAD ARTIFACT
# ============================================================

print("\n[3] ARTIFACT LOADING")


artifact = joblib.load(
    ARTIFACT_PATH
)


required_keys = [

    "model",

    "text_vectorizer",

    "company_vectorizer",

    "model_config",

    "feature_metadata",

    "training_metadata",

    "evaluation_metadata",

    "deployment_metadata",
]


for key in required_keys:

    if key not in artifact:

        raise AssertionError(
            f"Missing artifact key: {key}"
        )


print(
    "Artifact loading             : PASS"
)


# ============================================================
# [4] DEPLOYMENT METADATA
# ============================================================

print("\n[4] DEPLOYMENT STATUS")


deployment_metadata = (
    artifact[
        "deployment_metadata"
    ]
)


print(
    "Status:",
    deployment_metadata[
        "model_status"
    ]
)


if (
    deployment_metadata[
        "model_status"
    ]
    !=
    "experimental_not_production_approved"
):

    raise AssertionError(
        "Unexpected deployment status."
    )


print(
    "Deployment status validation : PASS"
)


# ============================================================
# [5] FEATURE CONTRACT
# ============================================================

print("\n[5] FEATURE CONTRACT")


model = artifact["model"]

text_vectorizer = (
    artifact[
        "text_vectorizer"
    ]
)

company_vectorizer = (
    artifact[
        "company_vectorizer"
    ]
)


text_features = len(
    text_vectorizer.vocabulary_
)

company_features = len(
    company_vectorizer.vocabulary_
)

time_features = 5

total_features = (
    text_features
    + company_features
    + time_features
)


print(
    "Narrative features           :",
    text_features
)

print(
    "Company features             :",
    company_features
)

print(
    "Time features                :",
    time_features
)

print(
    "Total features               :",
    total_features
)

print(
    "Model expected               :",
    model.n_features_in_
)


if total_features != model.n_features_in_:

    raise AssertionError(
        "Feature contract mismatch."
    )


print(
    "Feature contract             : PASS"
)


# ============================================================
# [6] KNOWN COMPANY INFERENCE
# ============================================================

print("\n[6] KNOWN COMPANY INFERENCE")


known_result = predict_raw(

    artifact,

    narrative=(
        "I was charged an unexpected fee "
        "on my bank account and would like "
        "the company to investigate the issue."
    ),

    company="Capital One",

    date_received=(
        "2026-06-01 14:30:00+00:00"
    )
)


print(
    "Company                      : Capital One"
)

print(
    "Feature shape                :",
    known_result["feature_shape"]
)

print(
    "Log prediction               :",
    f"{known_result['log_prediction']:.6f}"
)

print(
    "Predicted delay (days)       :",
    f"{known_result['delay_days']:.6f}"
)

print(
    "Predicted delay (hours)      :",
    f"{known_result['delay_hours']:.4f}"
)


if (
    known_result["delay_days"]
    < 0
):

    raise AssertionError(
        "Negative business-level delay."
    )


print(
    "Known-company inference      : PASS"
)


# ============================================================
# [7] UNKNOWN COMPANY INFERENCE
# ============================================================

print("\n[7] UNKNOWN COMPANY INFERENCE")


unknown_company = (
    "Company Never Seen During Training XYZ"
)


unknown_result = predict_raw(

    artifact,

    narrative=(
        "I need help resolving an issue "
        "with a financial transaction."
    ),

    company=unknown_company,

    date_received=(
        "2026-06-01 14:30:00+00:00"
    )
)


print(
    "Company                      :",
    unknown_company
)

print(
    "Feature shape                :",
    unknown_result["feature_shape"]
)

print(
    "Predicted delay (days)       :",
    f"{unknown_result['delay_days']:.6f}"
)


if not np.isfinite(
    unknown_result["delay_days"]
):

    raise AssertionError(
        "Unknown-company prediction "
        "is not finite."
    )


print(
    "Unknown-company inference    : PASS"
)


# ============================================================
# [8] TEMPORAL FEATURE TEST
# ============================================================

print("\n[8] TEMPORAL FEATURE TEST")


dates = [

    (
        "Weekday morning",
        "2026-06-01 09:00:00+00:00"
    ),

    (
        "Weekday evening",
        "2026-06-01 20:00:00+00:00"
    ),

    (
        "Weekend",
        "2026-06-06 14:00:00+00:00"
    ),

]


for label, date_value in dates:

    result = predict_raw(

        artifact,

        narrative=(
            "I have an issue with my "
            "financial account."
        ),

        company="Capital One",

        date_received=date_value
    )


    print(
        f"{label:<25} "
        f"{result['delay_days']:.6f} days"
    )


print(
    "Temporal feature inference   : PASS"
)


# ============================================================
# [9] DETERMINISM TEST
# ============================================================

print("\n[9] DETERMINISM TEST")


input_args = {

    "narrative": (
        "I have an issue with "
        "my financial account."
    ),

    "company":
        "Capital One",

    "date_received":
        "2026-06-01 14:30:00+00:00",
}


prediction_1 = predict_raw(
    artifact,
    **input_args
)

prediction_2 = predict_raw(
    artifact,
    **input_args
)


if not np.isclose(
    prediction_1["delay_days"],
    prediction_2["delay_days"],
    rtol=0,
    atol=1e-12
):

    raise AssertionError(
        "Inference is not deterministic."
    )


print(
    "Prediction 1                 :",
    f"{prediction_1['delay_days']:.12f}"
)

print(
    "Prediction 2                 :",
    f"{prediction_2['delay_days']:.12f}"
)

print(
    "Deterministic inference       : PASS"
)


# ============================================================
# [10] TARGET TRANSFORMATION TEST
# ============================================================

print("\n[10] TARGET TRANSFORMATION")


log_prediction = (
    prediction_1[
        "log_prediction"
    ]
)

expected_delay = max(
    0.0,
    float(
        np.expm1(
            log_prediction
        )
    )
)


actual_delay = prediction_1[
    "delay_days"
]


if not np.isclose(
    actual_delay,
    expected_delay,
    rtol=0,
    atol=1e-12
):

    raise AssertionError(
        "log1p/expm1 transformation "
        "contract failed."
    )


print(
    "log1p → expm1 contract       : PASS"
)


# ============================================================
# FINAL SUMMARY
# ============================================================

print(
    "\n" + "=" * 70
)

print(
    "PROJECT 2 INFERENCE CONTRACT VERIFIED"
)

print(
    "=" * 70
)

print(
    "\nSTATUS: PASS"
)

print(
    "\nProject 2 is now ready for:"
)

print(
    "    STEP 3 — FastAPI backend"
)

print(
    "\nImportant:"
)

print(
    "    Model remains EXPERIMENTAL / "
    "NOT PRODUCTION APPROVED."
)