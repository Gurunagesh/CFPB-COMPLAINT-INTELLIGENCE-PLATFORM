from pathlib import Path
import hashlib
import json
import joblib

## This file should load the frozen artifacts once when the API starts, rather than loading them for every request.

PROJECT_ROOT = Path(__file__).resolve().parents[2]

PROJECT1_DIR = (
    PROJECT_ROOT
    / "Reports"
    / "project1"
    / "Models_package"
)

PROJECT2_DIR = (
    PROJECT_ROOT
    / "Reports"
    / "project2"
    / "Models_package"
)


def verify_sha256(artifact_path: Path, checksum_path: Path) -> None:
    actual_hash = hashlib.sha256(
        artifact_path.read_bytes()
    ).hexdigest()

    expected_hash = checksum_path.read_text(
        encoding="utf-8"
    ).strip()

    if actual_hash != expected_hash:
        raise RuntimeError(
            f"SHA-256 mismatch for {artifact_path.name}"
        )


def load_project1():
    artifact_path = (
        PROJECT1_DIR
        / "project1_product_classifier.joblib"
    )

    checksum_path = (
        PROJECT1_DIR
        / "artifact.sha256"
    )

    verify_sha256(
        artifact_path,
        checksum_path
    )

    artifact = joblib.load(artifact_path)

    metadata_path = (
        PROJECT1_DIR
        / "model_metadata.json"
    )

    metadata = json.loads(
        metadata_path.read_text(
            encoding="utf-8"
        )
    )

    return {
        "artifact": artifact,
        "metadata": metadata
    }

## Loading project-2 model
def load_project2():
    artifact_path = (
        PROJECT2_DIR
        / "project2_triage_latency_predictor.joblib"
    )

    checksum_path = (
        PROJECT2_DIR
        / "artifact.sha256"
    )

    verify_sha256(
        artifact_path,
        checksum_path
    )

    artifact = joblib.load(artifact_path)

    metadata_path = (
        PROJECT2_DIR
        / "model_metadata.json"
    )

    metadata = json.loads(
        metadata_path.read_text(
            encoding="utf-8"
        )
    )

    return {
        "artifact": artifact,
        "metadata": metadata
    }

# caller function
def load_all_models():
    return {
        "project1": load_project1(),
        "project2": load_project2()
    }