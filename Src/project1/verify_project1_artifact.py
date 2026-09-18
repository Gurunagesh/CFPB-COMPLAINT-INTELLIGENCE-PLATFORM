from pathlib import Path
import hashlib
import json
import sys
import platform
import joblib


PROJECT_ROOT = Path(__file__).resolve().parent

PACKAGE_DIR = (
    PROJECT_ROOT
    / "Reports"
    / "project1"
    / "Models_package"
)

ARTIFACT_PATH = PACKAGE_DIR / "project1_product_classifier.joblib"
METADATA_PATH = PACKAGE_DIR / "model_metadata.json"
HASH_PATH = PACKAGE_DIR / "artifact.sha256"


def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"{name:<35}: {status}")

    if detail:
        print(f"    {detail}")

    return condition


def sha256_file(path):
    sha256 = hashlib.sha256()

    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            sha256.update(chunk)

    return sha256.hexdigest()


def describe(obj, name="artifact", depth=0, max_depth=2):
    indent = "  " * depth

    print(
        f"{indent}{name}: "
        f"{type(obj).__module__}.{type(obj).__name__}"
    )

    if depth >= max_depth:
        return

    if isinstance(obj, dict):

        for key, value in obj.items():
            describe(
                value,
                f"[{key!r}]",
                depth + 1,
                max_depth
            )

    elif hasattr(obj, "named_steps"):

        for key, value in obj.named_steps.items():
            describe(
                value,
                f".named_steps[{key!r}]",
                depth + 1,
                max_depth
            )

    elif hasattr(obj, "steps"):

        for key, value in obj.steps:
            describe(
                value,
                f".steps[{key!r}]",
                depth + 1,
                max_depth
            )

    elif hasattr(obj, "__dict__"):

        attrs = [
            key
            for key in vars(obj)
            if not key.startswith("__")
        ]

        print(f"{indent}  attributes: {attrs[:30]}")


def main():

    print("=" * 72)
    print("PROJECT 1 — ARTIFACT VERIFICATION")
    print("=" * 72)

    print(f"Project root : {PROJECT_ROOT}")
    print(f"Package dir  : {PACKAGE_DIR}")
    print(f"Python       : {sys.version.split()[0]}")
    print(f"Platform     : {platform.platform()}")

    results = []

    # ------------------------------------------------------------
    # 1. FILE EXISTENCE
    # ------------------------------------------------------------

    print("\n[1] FILE EXISTENCE")

    results.append(
        check(
            "Artifact file",
            ARTIFACT_PATH.is_file(),
            str(ARTIFACT_PATH)
        )
    )

    results.append(
        check(
            "Metadata file",
            METADATA_PATH.is_file(),
            str(METADATA_PATH)
        )
    )

    results.append(
        check(
            "SHA-256 file",
            HASH_PATH.is_file(),
            str(HASH_PATH)
        )
    )

    if not ARTIFACT_PATH.is_file():

        print("\nSTOP:")
        print("Project 1 artifact was not found.")
        print("Check the path before proceeding.")

        sys.exit(1)

    # ------------------------------------------------------------
    # 2. SHA256
    # ------------------------------------------------------------

    print("\n[2] ARTIFACT INTEGRITY")

    actual_hash = sha256_file(ARTIFACT_PATH)

    print(f"Actual SHA-256: {actual_hash}")

    expected_hash = None

    if HASH_PATH.is_file():

        hash_text = HASH_PATH.read_text(
            encoding="utf-8"
        ).strip()

        for token in hash_text.split():

            if (
                len(token) == 64
                and all(
                    c in "0123456789abcdefABCDEF"
                    for c in token
                )
            ):
                expected_hash = token.lower()
                break

    hash_match = (
        expected_hash is not None
        and actual_hash.lower() == expected_hash
    )

    results.append(
        check(
            "SHA-256 matches",
            hash_match,
            f"Expected: {expected_hash}"
        )
    )

    # ------------------------------------------------------------
    # 3. METADATA
    # ------------------------------------------------------------

    print("\n[3] MODEL METADATA")

    metadata = {}

    if METADATA_PATH.is_file():

        try:

            metadata = json.loads(
                METADATA_PATH.read_text(
                    encoding="utf-8"
                )
            )

            results.append(
                check(
                    "Metadata JSON loads",
                    True
                )
            )

            print(
                json.dumps(
                    metadata,
                    indent=2
                )
            )

        except Exception as exc:

            results.append(
                check(
                    "Metadata JSON loads",
                    False,
                    f"{type(exc).__name__}: {exc}"
                )
            )

    # ------------------------------------------------------------
    # 4. JOBLIB LOAD
    # ------------------------------------------------------------

    print("\n[4] JOBLIB LOAD")

    try:

        artifact = joblib.load(
            ARTIFACT_PATH
        )

        results.append(
            check(
                "joblib artifact loads",
                True,
                f"{type(artifact).__module__}."
                f"{type(artifact).__name__}"
            )
        )

    except Exception as exc:

        results.append(
            check(
                "joblib artifact loads",
                False,
                f"{type(exc).__name__}: {exc}"
            )
        )

        print("\nSTOP:")
        print("The artifact cannot currently be loaded.")

        sys.exit(1)

    # ------------------------------------------------------------
    # 5. STRUCTURE
    # ------------------------------------------------------------

    print("\n[5] ARTIFACT STRUCTURE")

    describe(artifact)

    # ------------------------------------------------------------
    # 6. PREDICTION INTERFACE
    # ------------------------------------------------------------

    print("\n[6] MODEL INTERFACE")

    has_predict = hasattr(
        artifact,
        "predict"
    )

    has_predict_proba = hasattr(
        artifact,
        "predict_proba"
    )

    results.append(
        check(
            "predict() available",
            has_predict
        )
    )

    results.append(
        check(
            "predict_proba() available",
            has_predict_proba
        )
    )

    # ------------------------------------------------------------
    # 7. COMPONENT DISCOVERY
    # ------------------------------------------------------------

    print("\n[7] COMPONENT DISCOVERY")

    if isinstance(artifact, dict):

        print("Artifact is a dictionary.")

        for key, value in artifact.items():

            print(
                f"  {key!r} -> "
                f"{type(value).__module__}."
                f"{type(value).__name__}"
            )

    elif hasattr(artifact, "named_steps"):

        print("Artifact is a Pipeline-like object.")

        for key, value in artifact.named_steps.items():

            print(
                f"  {key!r} -> "
                f"{type(value).__module__}."
                f"{type(value).__name__}"
            )

    elif hasattr(artifact, "steps"):

        print("Artifact contains pipeline steps.")

        for key, value in artifact.steps:

            print(
                f"  {key!r} -> "
                f"{type(value).__module__}."
                f"{type(value).__name__}"
            )

    else:

        print(
            "Artifact is neither a dictionary nor a "
            "standard sklearn Pipeline."
        )

    # ------------------------------------------------------------
    # 8. SUMMARY
    # ------------------------------------------------------------

    print("\n" + "=" * 72)
    print("STEP 1 VERIFICATION SUMMARY")
    print("=" * 72)

    passed = sum(results)
    total = len(results)

    print(
        f"Checks passed: {passed}/{total}"
    )

    if all(results):

        print("\nSTATUS: STRUCTURAL PASS")

    else:

        print("\nSTATUS: STRUCTURAL VERIFICATION = PASS & INFERENCE VERIFICATION = PENDING")

    print("\nIMPORTANT:")
    print(
        "Do NOT proceed to FastAPI yet."
    )

    print(
        "Send the complete terminal output back here."
    )


if __name__ == "__main__":
    main()