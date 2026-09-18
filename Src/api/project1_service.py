import numpy as np
import pandas as pd
from scipy.sparse import hstack


def predict_product(
    model_bundle,
    narrative: str,
    company: str,
    top_k: int = 3
):
    artifact = model_bundle["artifact"]

    model = artifact["model"]
    word_vectorizer = artifact["word_vectorizer"]
    char_vectorizer = artifact["char_vectorizer"]
    company_encoder = artifact["company_encoder"]
    classes = artifact["classes"]

    # --------------------------------------------------------
    # Narrative features
    # --------------------------------------------------------

    word_features = word_vectorizer.transform([narrative])
    char_features = char_vectorizer.transform([narrative])

    # --------------------------------------------------------
    # Company features
    # Preserve the feature-name contract used during training.
    # --------------------------------------------------------

    if hasattr(company_encoder, "feature_names_in_"):
        company_column = company_encoder.feature_names_in_[0]
    else:
        company_column = "Company"

    company_input = pd.DataFrame(
        {company_column: [company]}
    )

    company_features = company_encoder.transform(
        company_input
    )

    # --------------------------------------------------------
    # Final feature matrix
    # --------------------------------------------------------

    X = hstack(
        [
            word_features,
            char_features,
            company_features
        ],
        format="csr"
    )

    expected_features = model.n_features_in_

    if X.shape[1] != expected_features:
        raise RuntimeError(
            "Project 1 feature contract violation: "
            f"expected {expected_features}, "
            f"received {X.shape[1]}"
        )

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    probabilities = model.predict_proba(X)[0]

    predicted_index = int(
        np.argmax(probabilities)
    )

    top_indices = np.argsort(probabilities)[::-1][:top_k]

    top_predictions = [
        {
            "product": str(classes[index]),
            "probability": float(probabilities[index])
        }
        for index in top_indices
    ]

    return {
        "project": "CFPB Product Classification",
        "model_status": "verified",
        "predicted_product": str(
            classes[predicted_index]
        ),
        "confidence": float(
            probabilities[predicted_index]
        ),
        "top_predictions": top_predictions
    }