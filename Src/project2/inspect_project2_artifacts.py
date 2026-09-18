from pathlib import Path
import json
import joblib


PROJECT_ROOT = Path(__file__).resolve().parents[2]

SOURCE_DIR = (
    PROJECT_ROOT
    / "Reports"
    / "project2"
)


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


print("=" * 70)
print("PROJECT 2 — ARTIFACT STRUCTURE INSPECTION")
print("=" * 70)


# ============================================================
# LOAD ARTIFACTS
# ============================================================

model = joblib.load(
    SOURCE_DIR / "ridge_model.joblib"
)

text_vectorizer = joblib.load(
    SOURCE_DIR / "text_vectorizer.joblib"
)

company_vectorizer = joblib.load(
    SOURCE_DIR / "company_vectorizer.joblib"
)

model_config = load_json(
    SOURCE_DIR / "model_config.json"
)

feature_metadata = load_json(
    SOURCE_DIR / "feature_metadata.json"
)

training_metadata = load_json(
    SOURCE_DIR / "training_metadata.json"
)

evaluation_metadata = load_json(
    SOURCE_DIR / "evaluation_metadata.json"
)


# ============================================================
# MODEL
# ============================================================

print("\n[1] MODEL")

print(
    "Type                  :",
    type(model)
)

print(
    "Class                 :",
    type(model).__name__
)

print(
    "n_features_in_        :",
    getattr(
        model,
        "n_features_in_",
        "NOT AVAILABLE"
    )
)

print(
    "alpha                 :",
    getattr(
        model,
        "alpha",
        "NOT AVAILABLE"
    )
)

print(
    "fit_intercept         :",
    getattr(
        model,
        "fit_intercept",
        "NOT AVAILABLE"
    )
)


# ============================================================
# TEXT VECTORIZER
# ============================================================

print("\n[2] TEXT VECTORIZER")

print(
    "Type                  :",
    type(text_vectorizer)
)

print(
    "Class                 :",
    type(text_vectorizer).__name__
)

print(
    "Vocabulary size       :",
    len(text_vectorizer.vocabulary_)
)

print(
    "ngram_range           :",
    text_vectorizer.ngram_range
)

print(
    "max_features          :",
    text_vectorizer.max_features
)

print(
    "analyzer              :",
    text_vectorizer.analyzer
)


# ============================================================
# COMPANY VECTORIZER
# ============================================================

print("\n[3] COMPANY VECTORIZER")

print(
    "Type                  :",
    type(company_vectorizer)
)

print(
    "Class                 :",
    type(company_vectorizer).__name__
)

print(
    "Vocabulary size       :",
    len(company_vectorizer.vocabulary_)
)

print(
    "ngram_range           :",
    company_vectorizer.ngram_range
)

print(
    "max_features          :",
    company_vectorizer.max_features
)

print(
    "analyzer              :",
    company_vectorizer.analyzer
)


# ============================================================
# FEATURE COUNT RECONSTRUCTION
# ============================================================

print("\n[4] FEATURE COUNT")

text_features = len(
    text_vectorizer.vocabulary_
)

company_features = len(
    company_vectorizer.vocabulary_
)

total_features = (
    text_features
    + company_features
)

print(
    "Text features         :",
    text_features
)

print(
    "Company features      :",
    company_features
)

print(
    "Combined features     :",
    total_features
)

print(
    "Model expects         :",
    model.n_features_in_
)

print(
    "Feature count match   :",
    total_features == model.n_features_in_
)


# ============================================================
# METADATA
# ============================================================

print("\n[5] FEATURE METADATA")

print(
    json.dumps(
        feature_metadata,
        indent=2
    )
)


print("\n[6] MODEL CONFIG")

print(
    json.dumps(
        model_config,
        indent=2
    )
)


print("\n[7] TRAINING METADATA")

print(
    json.dumps(
        training_metadata,
        indent=2
    )
)


print("\n[8] EVALUATION METADATA")

print(
    json.dumps(
        evaluation_metadata,
        indent=2
    )
)


# ============================================================
# VECTOR REPRESENTATION TEST
# ============================================================

print("\n[9] TRANSFORMATION TEST")

sample_narrative = (
    "I was charged an unexpected fee on my "
    "bank account and would like the company "
    "to investigate the issue."
)

sample_company = "Capital One"


text_matrix = text_vectorizer.transform(
    [sample_narrative]
)

company_matrix = company_vectorizer.transform(
    [sample_company]
)

print(
    "Narrative input      :",
    sample_narrative
)

print(
    "Company input        :",
    sample_company
)

print(
    "Narrative shape      :",
    text_matrix.shape
)

print(
    "Company shape        :",
    company_matrix.shape
)

print(
    "Narrative nnz        :",
    text_matrix.nnz
)

print(
    "Company nnz          :",
    company_matrix.nnz
)


print("\n" + "=" * 70)
print("INSPECTION COMPLETE")
print("=" * 70)