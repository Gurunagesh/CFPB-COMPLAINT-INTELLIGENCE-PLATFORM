from pathlib import Path

import joblib
import numpy as np
from scipy.sparse import hstack


PROJECT_ROOT = Path(__file__).resolve().parent

ARTIFACT_PATH = (
    PROJECT_ROOT
    / "Reports"
    / "project1"
    / "Models_package"
    / "project1_product_classifier.joblib"
)


def main():

    print("=" * 72)
    print("PROJECT 1 — RAW INPUT INFERENCE VERIFICATION")
    print("=" * 72)

    # ------------------------------------------------------------
    # 1. LOAD ARTIFACT
    # ------------------------------------------------------------

    artifact = joblib.load(ARTIFACT_PATH)

    model = artifact["model"]
    word_vectorizer = artifact["word_vectorizer"]
    char_vectorizer = artifact["char_vectorizer"]
    company_encoder = artifact["company_encoder"]
    classes = artifact["classes"]

    print("\n[1] COMPONENTS")

    print("Model              :", type(model).__name__)
    print("Word vectorizer    :", type(word_vectorizer).__name__)
    print("Char vectorizer    :", type(char_vectorizer).__name__)
    print("Company encoder    :", type(company_encoder).__name__)
    print("Classes            :", len(classes))

    print("\nClasses:")
    for i, cls in enumerate(classes):
        print(f"  {i:2d}. {cls}")

    # ------------------------------------------------------------
    # 2. KNOWN COMPANY
    # ------------------------------------------------------------

    print("\n" + "=" * 72)
    print("[2] KNOWN COMPANY INFERENCE")
    print("=" * 72)

    narrative = (
        "I was charged an unexpected fee on my credit card "
        "and I am unable to understand why this charge was applied."
    )

    company = "Capital One"

    # Text transformations
    word_features = word_vectorizer.transform(
        [narrative]
    )

    char_features = char_vectorizer.transform(
        [narrative]
    )

    # Company transformation
    company_features = company_encoder.transform(
        [[company]]
    )

    # Final feature matrix
    X = hstack(
        [
            word_features,
            char_features,
            company_features,
        ],
        format="csr",
    )

    print("\nFeature shapes:")
    print("Word     :", word_features.shape)
    print("Char     :", char_features.shape)
    print("Company  :", company_features.shape)
    print("Final X  :", X.shape)

    # ------------------------------------------------------------
    # 3. PREDICTION
    # ------------------------------------------------------------

    prediction = model.predict(X)[0]

    probabilities = model.predict_proba(X)[0]

    predicted_index = int(
        np.argmax(probabilities)
    )

    confidence = float(
        probabilities[predicted_index]
    )

    print("\nPrediction:")
    print("Predicted Product :", prediction)
    print("Predicted Index   :", predicted_index)
    print("Confidence        :", round(confidence, 4))

    # ------------------------------------------------------------
    # 4. TOP-3
    # ------------------------------------------------------------

    top_indices = np.argsort(
        probabilities
    )[::-1][:3]

    print("\nTop-3 predictions:")

    for rank, index in enumerate(
        top_indices,
        start=1
    ):

        print(
            f"  {rank}. "
            f"{classes[index]} "
            f"({probabilities[index]:.4f})"
        )

    # ------------------------------------------------------------
    # 5. PROBABILITY VALIDATION
    # ------------------------------------------------------------

    print("\nProbability checks:")

    print(
        "Probability count :",
        len(probabilities)
    )

    print(
        "Probability sum   :",
        round(float(probabilities.sum()), 6)
    )

    print(
        "Min probability   :",
        round(float(probabilities.min()), 6)
    )

    print(
        "Max probability   :",
        round(float(probabilities.max()), 6)
    )

    assert len(probabilities) == len(classes)

    assert np.isclose(
        probabilities.sum(),
        1.0,
        atol=1e-6
    )

    assert 0.0 <= confidence <= 1.0

    print(
        "Probability validation: PASS"
    )

    # ------------------------------------------------------------
    # 6. UNKNOWN COMPANY
    # ------------------------------------------------------------

    print("\n" + "=" * 72)
    print("[3] UNKNOWN COMPANY TEST")
    print("=" * 72)

    unknown_company = (
        "This Company Does Not Exist In Training Data"
    )

    unknown_company_features = (
        company_encoder.transform(
            [[unknown_company]]
        )
    )

    X_unknown = hstack(
        [
            word_features,
            char_features,
            unknown_company_features,
        ],
        format="csr",
    )

    unknown_prediction = model.predict(
        X_unknown
    )[0]

    unknown_probabilities = model.predict_proba(
        X_unknown
    )[0]

    unknown_confidence = float(
        unknown_probabilities.max()
    )

    print(
        "Unknown company   :",
        unknown_company
    )

    print(
        "Prediction        :",
        unknown_prediction
    )

    print(
        "Confidence        :",
        round(unknown_confidence, 4)
    )

    print(
        "Unknown-company inference: PASS"
    )

    # ------------------------------------------------------------
    # 7. FINAL
    # ------------------------------------------------------------

    print("\n" + "=" * 72)
    print("PROJECT 1 INFERENCE VERIFICATION COMPLETE")
    print("=" * 72)

    print("\nSTATUS:")
    print("RAW INPUT INFERENCE VERIFIED")


if __name__ == "__main__":
    main()