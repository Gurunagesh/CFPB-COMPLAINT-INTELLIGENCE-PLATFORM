from pathlib import Path
import hashlib
import json

import joblib
import numpy as np
import pandas as pd

from scipy.sparse import hstack, csr_matrix


# ============================================================
# PROJECT 2 — FINAL MODEL PACKAGING
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

SOURCE_DIR = (
    PROJECT_ROOT
    / "Reports"
    / "project2"
)

PACKAGE_DIR = (
    SOURCE_DIR
    / "Models_package"
)

PACKAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# SOURCE ARTIFACTS
# ============================================================

MODEL_PATH = (
    SOURCE_DIR
    / "ridge_model.joblib"
)

TEXT_VECTORIZER_PATH = (
    SOURCE_DIR
    / "text_vectorizer.joblib"
)

COMPANY_VECTORIZER_PATH = (
    SOURCE_DIR
    / "company_vectorizer.joblib"
)

MODEL_CONFIG_PATH = (
    SOURCE_DIR
    / "model_config.json"
)

FEATURE_METADATA_PATH = (
    SOURCE_DIR
    / "feature_metadata.json"
)

TRAINING_METADATA_PATH = (
    SOURCE_DIR
    / "training_metadata.json"
)

EVALUATION_METADATA_PATH = (
    SOURCE_DIR
    / "evaluation_metadata.json"
)


# ============================================================
# DEPLOYMENT ARTIFACTS
# ============================================================

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

def load_json(path):

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:

        return json.load(f)


def validate_file(path, label):

    if not path.exists():

        raise FileNotFoundError(
            f"{label} not found:\n{path}"
        )

    print(
        f"{label:<35}: PASS"
    )

    print(
        f"    {path}"
    )


def sha256_file(path):

    sha256 = hashlib.sha256()

    with open(path, "rb") as f:

        for chunk in iter(
            lambda: f.read(1024 * 1024),
            b""
        ):

            sha256.update(chunk)

    return sha256.hexdigest()


def build_time_features(
    date_received
):

    """
    Reconstruct the exact five time features
    used during Project 2 training.

    Feature order:

        hour
        day_of_week
        day_of_month
        month
        is_weekend
    """

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


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("PROJECT 2 — FINAL MODEL PACKAGING")
print("=" * 70)

print(
    f"\nProject root : {PROJECT_ROOT}"
)

print(
    f"Source dir   : {SOURCE_DIR}"
)

print(
    f"Package dir  : {PACKAGE_DIR}"
)


# ============================================================
# [1/10] VALIDATE SOURCE ARTIFACTS
# ============================================================

print(
    "\n[1/10] Validating source artifacts..."
)


source_files = [

    (
        MODEL_PATH,
        "Ridge model"
    ),

    (
        TEXT_VECTORIZER_PATH,
        "Text vectorizer"
    ),

    (
        COMPANY_VECTORIZER_PATH,
        "Company vectorizer"
    ),

    (
        MODEL_CONFIG_PATH,
        "Model config"
    ),

    (
        FEATURE_METADATA_PATH,
        "Feature metadata"
    ),

    (
        TRAINING_METADATA_PATH,
        "Training metadata"
    ),

    (
        EVALUATION_METADATA_PATH,
        "Evaluation metadata"
    ),
]


for path, label in source_files:

    validate_file(
        path,
        label
    )


# ============================================================
# [2/10] LOAD FROZEN COMPONENTS
# ============================================================

print(
    "\n[2/10] Loading frozen components..."
)


model = joblib.load(
    MODEL_PATH
)

text_vectorizer = joblib.load(
    TEXT_VECTORIZER_PATH
)

company_vectorizer = joblib.load(
    COMPANY_VECTORIZER_PATH
)

model_config = load_json(
    MODEL_CONFIG_PATH
)

feature_metadata = load_json(
    FEATURE_METADATA_PATH
)

training_metadata = load_json(
    TRAINING_METADATA_PATH
)

evaluation_metadata = load_json(
    EVALUATION_METADATA_PATH
)


print(
    f"Model              : "
    f"{type(model).__name__}"
)

print(
    f"Text vectorizer    : "
    f"{type(text_vectorizer).__name__}"
)

print(
    f"Company vectorizer : "
    f"{type(company_vectorizer).__name__}"
)


# ============================================================
# [3/10] VALIDATE MODEL INTERFACE
# ============================================================

print(
    "\n[3/10] Validating model interface..."
)


if not hasattr(
    model,
    "predict"
):

    raise RuntimeError(
        "Ridge model does not expose predict()."
    )


print(
    "predict() available                : PASS"
)


print(
    "predict_proba() available          : N/A"
)

print(
    "Regression model — probability "
    "output is not applicable."
)


# ============================================================
# [4/10] VALIDATE FEATURE CONFIGURATION
# ============================================================

print(
    "\n[4/10] Validating feature configuration..."
)


text_features = len(
    text_vectorizer.vocabulary_
)

company_features = len(
    company_vectorizer.vocabulary_
)

time_features = len(
    feature_metadata["time_features"]
)

expected_total = (
    text_features
    + company_features
    + time_features
)

model_features = (
    model.n_features_in_
)


print(
    f"Narrative TF-IDF features         : "
    f"{text_features:,}"
)

print(
    f"Company TF-IDF features            : "
    f"{company_features:,}"
)

print(
    f"Time features                       : "
    f"{time_features:,}"
)

print(
    f"Combined feature count             : "
    f"{expected_total:,}"
)

print(
    f"Model expected features            : "
    f"{model_features:,}"
)


if expected_total != model_features:

    raise RuntimeError(
        "FEATURE CONTRACT FAILURE\n"
        f"Constructed features: {expected_total}\n"
        f"Model expects: {model_features}"
    )


print(
    "Feature-count validation             : PASS"
)


# ============================================================
# [5/10] VALIDATE FEATURE ORDER
# ============================================================

print(
    "\n[5/10] Validating feature order..."
)


expected_order = [

    "narrative_tfidf",

    "company_tfidf",

    "time_features",
]


actual_order = (
    feature_metadata["feature_order"]
)


print(
    "Expected order:"
)

for item in expected_order:

    print(
        f"    {item}"
    )


print(
    "\nStored order:"
)

for item in actual_order:

    print(
        f"    {item}"
    )


if actual_order != expected_order:

    raise RuntimeError(
        "Feature order mismatch."
    )


print(
    "\nFeature-order validation             : PASS"
)


# ============================================================
# [6/10] BUILD DEPLOYMENT ARTIFACT
# ============================================================

print(
    "\n[6/10] Building deployment artifact..."
)


deployment_metadata = {

    "artifact_name":
        "project2_triage_latency_predictor",

    "artifact_version":
        "1.0.0",

    "task":
        "Triage Latency Regression",

    "target":
        "triage_delay_days",

    "prediction_event":
        "Date received",

    "target_transform":
        "log1p",

    "inverse_target_transform":
        "expm1",

    "feature_order":
        expected_order,

    "model_status":
        "experimental_not_production_approved",

    "production_baseline_required":
        True,

    "autonomous_decision_allowed":
        False,

    "note":
        (
            "The final frozen Ridge model did not "
            "outperform the train+validation median "
            "baseline on the frozen test set. "
            "The artifact is packaged for research "
            "and API demonstration, not autonomous "
            "production decision-making."
        ),
}


artifact = {

    "model":
        model,

    "text_vectorizer":
        text_vectorizer,

    "company_vectorizer":
        company_vectorizer,

    "model_config":
        model_config,

    "feature_metadata":
        feature_metadata,

    "training_metadata":
        training_metadata,

    "evaluation_metadata":
        evaluation_metadata,

    "deployment_metadata":
        deployment_metadata,
}


joblib.dump(
    artifact,
    ARTIFACT_PATH
)


print(
    f"Artifact saved                    : "
    f"{ARTIFACT_PATH}"
)


# ============================================================
# [7/10] CREATE DEPLOYMENT METADATA
# ============================================================

print(
    "\n[7/10] Creating deployment metadata..."
)


metadata = {

    "artifact_name":
        "project2_triage_latency_predictor",

    "artifact_version":
        "1.0.0",

    "task":
        "Triage Latency Regression",

    "target":
        "triage_delay_days",

    "prediction_event":
        "Date received",

    "target_transform":
        "log1p",

    "inverse_target_transform":
        "expm1",

    "feature_configuration": {

        "narrative_tfidf":
            text_features,

        "company_tfidf":
            company_features,

        "time_features":
            feature_metadata["time_features"],

        "total_features":
            expected_total,

        "feature_order":
            expected_order,
    },

    "model_configuration":
        model_config,

    "training_metadata":
        training_metadata,

    "evaluation_metadata":
        evaluation_metadata,

    "deployment": {

        "status":
            "experimental_not_production_approved",

        "baseline_required":
            True,

        "autonomous_decision_allowed":
            False,
    },
}


with open(
    METADATA_PATH,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        metadata,
        f,
        indent=2,
        default=str
    )


print(
    f"Metadata saved                    : "
    f"{METADATA_PATH}"
)


# ============================================================
# [8/10] GENERATE SHA-256
# ============================================================

print(
    "\n[8/10] Generating artifact hash..."
)


artifact_hash = sha256_file(
    ARTIFACT_PATH
)


with open(
    HASH_PATH,
    "w",
    encoding="utf-8"
) as f:

    f.write(
        artifact_hash
    )


print(
    f"SHA-256                            : "
    f"{artifact_hash}"
)

print(
    f"Hash saved                         : "
    f"{HASH_PATH}"
)


# ============================================================
# [9/10] RELOAD PACKAGED ARTIFACT
# ============================================================

print(
    "\n[9/10] Reloading packaged artifact..."
)


reloaded = joblib.load(
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

    if key not in reloaded:

        raise RuntimeError(
            f"Missing artifact key: {key}"
        )

    print(
        f"Key '{key}' : PASS"
    )


# ============================================================
# [10/10] RAW INPUT INFERENCE SMOKE TEST
# ============================================================

print(
    "\n[10/10] Running raw-input inference smoke test..."
)


sample_narrative = (
    "I was charged an unexpected fee on my "
    "bank account and would like the company "
    "to investigate the issue."
)


sample_company = "Capital One"


sample_date = (
    "2026-06-01 14:30:00+00:00"
)


# ------------------------------------------------------------
# Narrative TF-IDF
# ------------------------------------------------------------

narrative_matrix = (
    text_vectorizer.transform(
        [sample_narrative]
    )
)


# ------------------------------------------------------------
# Company character TF-IDF
# ------------------------------------------------------------

company_matrix = (
    company_vectorizer.transform(
        [sample_company]
    )
)


# ------------------------------------------------------------
# Time features
# ------------------------------------------------------------

time_matrix = csr_matrix(
    build_time_features(
        sample_date
    )
)


# ------------------------------------------------------------
# Final feature matrix
#
# IMPORTANT:
#
# narrative_tfidf
#       +
# company_tfidf
#       +
# time_features
#
# ------------------------------------------------------------

X = hstack(
    [

        narrative_matrix,

        company_matrix,

        time_matrix,

    ],

    format="csr"
)


print(
    f"Narrative features                  : "
    f"{narrative_matrix.shape}"
)

print(
    f"Company features                    : "
    f"{company_matrix.shape}"
)

print(
    f"Time features                       : "
    f"{time_matrix.shape}"
)

print(
    f"Final feature matrix                : "
    f"{X.shape}"
)


# ------------------------------------------------------------
# Feature contract validation
# ------------------------------------------------------------

if X.shape[1] != model_features:

    raise RuntimeError(
        "Final inference feature count does not "
        "match trained model."
    )


print(
    "Inference feature-count validation   : PASS"
)


# ------------------------------------------------------------
# Ridge prediction
#
# Model predicts log1p(delay).
# ------------------------------------------------------------

predicted_log_delay = (
    reloaded["model"]
    .predict(X)[0]
)


# ------------------------------------------------------------
# Inverse target transformation
# ------------------------------------------------------------

predicted_delay_days = (
    np.expm1(
        predicted_log_delay
    )
)


predicted_delay_days = max(
    0.0,
    float(predicted_delay_days)
)


predicted_delay_hours = (
    predicted_delay_days
    * 24
)


print(
    f"Predicted log1p delay               : "
    f"{predicted_log_delay:.6f}"
)

print(
    f"Predicted delay (days)              : "
    f"{predicted_delay_days:.6f}"
)

print(
    f"Predicted delay (hours)             : "
    f"{predicted_delay_hours:.4f}"
)


# ------------------------------------------------------------
# Prediction validation
# ------------------------------------------------------------

if not np.isfinite(
    predicted_delay_days
):

    raise RuntimeError(
        "Prediction is not finite."
    )


if predicted_delay_days < 0:

    raise RuntimeError(
        "Prediction became negative."
    )


print(
    "Prediction validation               : PASS"
)


# ============================================================
# FINAL STATUS
# ============================================================

print(
    "\n" + "=" * 70
)

print(
    "PROJECT 2 MODEL PACKAGING COMPLETE"
)

print(
    "=" * 70
)


print(
    "\nDeployment artifact:"
)

print(
    f"    {ARTIFACT_PATH}"
)


print(
    "\nDeployment metadata:"
)

print(
    f"    {METADATA_PATH}"
)


print(
    "\nArtifact hash:"
)

print(
    f"    {HASH_PATH}"
)


print(
    "\nModel:"
)

print(
    f"    {type(model).__name__}"
)


print(
    "\nTarget:"
)

print(
    "    triage_delay_days"
)


print(
    "\nTarget transformation:"
)

print(
    "    log1p during training → expm1 during inference"
)


print(
    "\nModel status:"
)

print(
    "    EXPERIMENTAL / NOT PRODUCTION APPROVED"
)


print(
    "\nNext gate:"
)

print(
    "    STEP 2.5 — PROJECT 2 INFERENCE CONTRACT TEST"
)