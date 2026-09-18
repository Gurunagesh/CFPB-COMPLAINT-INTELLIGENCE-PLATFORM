"""
Project 1 — CFPB Product Classification
Final Model Packaging / Reproducible Training Script

Purpose
-------
Build and package the final frozen Product Classification model
for reproducible inference.

Frozen model design
-------------------
Features:
    1. Consumer complaint narrative
       - Word TF-IDF: ngrams (1, 2), max_features=10,000
       - Character TF-IDF: ngrams (3, 5), max_features=10,000

    2. Company
       - One-hot encoding

Model:
    Logistic Regression
    C=1.0
    class_weight=None

Training data:
    Train + Validation

Important:
    The test set is intentionally NOT loaded or used here.
"""

from __future__ import annotations

import hashlib
import json
import platform
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from scipy.sparse import hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import OneHotEncoder


# ============================================================
# 1. PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = PROJECT_ROOT / "Data" / "processed"
MODEL_DIR = PROJECT_ROOT / "Reports" / "project1"/ "Models_package"

TRAIN_PATH = DATA_DIR / "project1_train.csv"
VALIDATION_PATH = DATA_DIR / "project1_validation.csv"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# 2. FROZEN MODEL CONFIGURATION
# ============================================================

TEXT_COL = "Consumer complaint narrative"
COMPANY_COL = "Company"
TARGET_COL = "Product"

WORD_NGRAM_RANGE = (1, 2)
CHAR_NGRAM_RANGE = (3, 5)

WORD_MAX_FEATURES = 10_000
CHAR_MAX_FEATURES = 10_000

LOGREG_C = 1.0
CLASS_WEIGHT = None

RANDOM_STATE = 42


# ============================================================
# 3. HELPER FUNCTIONS
# ============================================================

def sha256_file(path: Path) -> str:
    """Return SHA-256 hash of a file."""
    sha256 = hashlib.sha256()

    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            sha256.update(chunk)

    return sha256.hexdigest()


def predict_from_raw_input(
    artifact: dict,
    narrative: str,
    company: str,
) -> dict:
    """
    Run inference directly from raw complaint information.

    This function intentionally hides all feature-engineering details
    from the caller.
    """

    word_vectorizer = artifact["word_vectorizer"]
    char_vectorizer = artifact["char_vectorizer"]
    company_encoder = artifact["company_encoder"]
    model = artifact["model"]

    narrative = "" if narrative is None else str(narrative)
    company = "Missing" if company is None else str(company)

    word_features = word_vectorizer.transform([narrative])

    char_features = char_vectorizer.transform([narrative])

    company_features = company_encoder.transform(
        pd.DataFrame({
            COMPANY_COL: [company]
        })
    )

    features = hstack([
        word_features,
        char_features,
        company_features
    ]).tocsr()

    probabilities = model.predict_proba(features)[0]

    best_index = int(np.argmax(probabilities))

    prediction = model.classes_[best_index]

    confidence = float(probabilities[best_index])

    return {
        "predicted_product": prediction,
        "confidence": confidence,
    }


# ============================================================
# 4. LOAD DEVELOPMENT DATA
# ============================================================

print("=" * 70)
print("PROJECT 1 — FINAL MODEL PACKAGING")
print("=" * 70)

print("\n[1/9] Loading development datasets...")

train_df = pd.read_csv(TRAIN_PATH)
validation_df = pd.read_csv(VALIDATION_PATH)

development_df = pd.concat(
    [train_df, validation_df],
    ignore_index=True
)

print(f"Train rows       : {len(train_df):,}")
print(f"Validation rows  : {len(validation_df):,}")
print(f"Development rows : {len(development_df):,}")


# ============================================================
# 5. BASIC DATA VALIDATION
# ============================================================

print("\n[2/9] Validating training data...")

required_columns = {
    TEXT_COL,
    COMPANY_COL,
    TARGET_COL,
}

missing_columns = required_columns - set(development_df.columns)

if missing_columns:
    raise ValueError(
        f"Missing required columns: {sorted(missing_columns)}"
    )

if development_df[TARGET_COL].isna().any():
    raise ValueError(
        "Target column contains missing values."
    )

if development_df[TARGET_COL].nunique() != 11:
    raise ValueError(
        "Expected exactly 11 Product classes."
    )

print("Schema validation: PASS")
print(f"Product classes  : {development_df[TARGET_COL].nunique()}")


# ============================================================
# 6. FIT FEATURE REPRESENTATION
# ============================================================

print("\n[3/9] Fitting frozen feature representation...")

narratives = (
    development_df[TEXT_COL]
    .fillna("")
    .astype(str)
)

companies = (
    development_df[[COMPANY_COL]]
    .fillna("Missing")
    .astype(str)
)

y = development_df[TARGET_COL]


# -----------------------------
# Word TF-IDF
# -----------------------------

word_vectorizer = TfidfVectorizer(
    ngram_range=WORD_NGRAM_RANGE,
    max_features=WORD_MAX_FEATURES,
)

word_features = word_vectorizer.fit_transform(narratives)


# -----------------------------
# Character TF-IDF
# -----------------------------

char_vectorizer = TfidfVectorizer(
    analyzer="char",
    ngram_range=CHAR_NGRAM_RANGE,
    max_features=CHAR_MAX_FEATURES,
)

char_features = char_vectorizer.fit_transform(narratives)


# -----------------------------
# Company One-Hot Encoding
# -----------------------------

company_encoder = OneHotEncoder(
    handle_unknown="ignore"
)

company_features = company_encoder.fit_transform(
    companies
)


print(f"Word features    : {word_features.shape}")
print(f"Char features    : {char_features.shape}")
print(f"Company features : {company_features.shape}")


# ============================================================
# 7. BUILD FINAL FEATURE MATRIX
# ============================================================

print("\n[4/9] Building final feature matrix...")

X_development = hstack([
    word_features,
    char_features,
    company_features,
]).tocsr()

print(f"Final matrix     : {X_development.shape}")


# ============================================================
# 8. TRAIN FINAL FROZEN MODEL
# ============================================================

print("\n[5/9] Training final frozen Logistic Regression model...")

model = LogisticRegression(
    C=LOGREG_C,
    class_weight=CLASS_WEIGHT,
    max_iter=1000,
    random_state=RANDOM_STATE,
)

model.fit(
    X_development,
    y
)

print("Model training: COMPLETE")


# ============================================================
# 9. BUILD SINGLE ARTIFACT
# ============================================================

print("\n[6/9] Building model artifact...")

artifact = {
    "model": model,

    "word_vectorizer": word_vectorizer,

    "char_vectorizer": char_vectorizer,

    "company_encoder": company_encoder,

    "feature_columns": {
        "text": TEXT_COL,
        "company": COMPANY_COL,
        "target": TARGET_COL,
    },

    "model_config": {
        "model_type": "LogisticRegression",
        "C": LOGREG_C,
        "class_weight": CLASS_WEIGHT,
        "max_iter": 1000,
        "random_state": RANDOM_STATE,
    },

    "feature_config": {
        "word_ngram_range": WORD_NGRAM_RANGE,
        "word_max_features": WORD_MAX_FEATURES,
        "char_ngram_range": CHAR_NGRAM_RANGE,
        "char_max_features": CHAR_MAX_FEATURES,
        "company_encoding": "OneHotEncoder",
        "company_handle_unknown": "ignore",
    },

    "classes": list(model.classes_),
}


# ============================================================
# 10. SAVE ARTIFACT
# ============================================================

artifact_path = (
    MODEL_DIR /
    "project1_product_classifier.joblib"
)

joblib.dump(
    artifact,
    artifact_path
)

print(f"Artifact saved  : {artifact_path}")


# ============================================================
# 11. CREATE METADATA
# ============================================================

print("\n[7/9] Creating model metadata...")

metadata = {
    "artifact_name": "project1_product_classifier",
    "artifact_version": "1.0.0",

    "created_at_utc": datetime.now(
        timezone.utc
    ).isoformat(),

    "task": "Multiclass Product Classification",

    "target": TARGET_COL,

    "features": [
        TEXT_COL,
        COMPANY_COL,
    ],

    "training_data": {
        "train_rows": int(len(train_df)),
        "validation_rows": int(len(validation_df)),
        "development_rows": int(len(development_df)),
    },

    "feature_configuration": {
        "word_tfidf": {
            "ngram_range": list(WORD_NGRAM_RANGE),
            "max_features": WORD_MAX_FEATURES,
        },

        "char_tfidf": {
            "ngram_range": list(CHAR_NGRAM_RANGE),
            "max_features": CHAR_MAX_FEATURES,
        },

        "company": {
            "encoding": "OneHotEncoder",
            "handle_unknown": "ignore",
        },
    },

    "model_configuration": {
        "algorithm": "LogisticRegression",
        "C": LOGREG_C,
        "class_weight": CLASS_WEIGHT,
        "max_iter": 1000,
    },

    "classes": list(model.classes_),

    "final_test_performance": {
        "accuracy": 0.865126,
        "macro_f1": 0.792991,
        "weighted_f1": 0.863177,
    },

    "validation_to_test_gap": {
        "accuracy": -0.002910,
        "macro_f1": -0.011331,
        "weighted_f1": -0.002903,
    },

    "excluded_features": [
        "Sub-product",
        "Issue",
        "Sub-issue",
        "Company public response",
        "Date sent to company",
        "Company response to consumer",
        "Timely response?",
        "Complaint ID",
        "Submitted via",
    ],

    "software_environment": {
        "python": sys.version,
        "platform": platform.platform(),
        "pandas": pd.__version__,
        "numpy": np.__version__,
        "scikit_learn": sklearn.__version__,
        "joblib": joblib.__version__,
    },
}


metadata_path = MODEL_DIR / "model_metadata.json"

with metadata_path.open(
    "w",
    encoding="utf-8"
) as file:
    json.dump(
        metadata,
        file,
        indent=4,
    )

print(f"Metadata saved   : {metadata_path}")


# ============================================================
# 12. ARTIFACT INTEGRITY HASH
# ============================================================

print("\n[8/9] Generating artifact hash...")

artifact_hash = sha256_file(
    artifact_path
)

hash_path = MODEL_DIR / "artifact.sha256"

hash_path.write_text(
    artifact_hash,
    encoding="utf-8"
)

print(f"SHA-256          : {artifact_hash}")


# ============================================================
# 13. RAW-INPUT SMOKE TEST
# ============================================================

print("\n[9/9] Running raw-input inference smoke test...")

loaded_artifact = joblib.load(
    artifact_path
)

sample_narrative = (
    "I was charged an unexpected fee on my credit card "
    "and I believe the charge is incorrect."
)

sample_company = "Example Bank"

result = predict_from_raw_input(
    loaded_artifact,
    narrative=sample_narrative,
    company=sample_company,
)

print("\nSample inference:")
print(f"Predicted Product : {result['predicted_product']}")
print(f"Confidence        : {result['confidence']:.4f}")


# ============================================================
# 14. FINAL PACKAGE SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("MODEL PACKAGE COMPLETE")
print("=" * 70)

print(f"""
Artifact:
    {artifact_path}

Metadata:
    {metadata_path}

Hash:
    {hash_path}

Model:
    Logistic Regression

Features:
    Narrative + Company

Word TF-IDF:
    ngrams={WORD_NGRAM_RANGE}
    max_features={WORD_MAX_FEATURES}

Character TF-IDF:
    ngrams={CHAR_NGRAM_RANGE}
    max_features={CHAR_MAX_FEATURES}

Company:
    OneHotEncoder(handle_unknown='ignore')

C:
    {LOGREG_C}

Class weight:
    {CLASS_WEIGHT}

Development rows:
    {len(development_df):,}

Final Test Accuracy:
    86.51%

Final Test Macro F1:
    79.30%

Final Test Weighted F1:
    86.32%

Test set:
    NOT USED during artifact construction.

Status:
    FROZEN / PACKAGED
""")