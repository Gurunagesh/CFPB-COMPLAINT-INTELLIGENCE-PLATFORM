from pathlib import Path
import json

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedGroupKFold


# ============================================================
# CONFIGURATION
# ============================================================

RAW_PATH = Path("Data/raw/complaints-cfpb-raw.csv")
OUTPUT_DIR = Path("Data/processed")
REPORT_DIR = Path("Reports/project1")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


EXPECTED_COLUMNS = [
    "Date received",
    "Product",
    "Sub-product",
    "Issue",
    "Sub-issue",
    "Consumer complaint narrative",
    "Company public response",
    "Company",
    "State",
    "ZIP code",
    "Tags",
    "Submitted via",
    "Date sent to company",
    "Company response to consumer",
    "Timely response?",
    "Complaint ID",
]


# ============================================================
# 1. LOAD
# ============================================================

def load_data(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)

    print(f"Loaded dataset: {df.shape[0]:,} rows × {df.shape[1]} columns")

    return df


# ============================================================
# 2. SCHEMA VALIDATION
# ============================================================

def validate_schema(df: pd.DataFrame) -> None:

    actual_columns = list(df.columns)

    missing_columns = [
        col for col in EXPECTED_COLUMNS
        if col not in actual_columns
    ]

    unexpected_columns = [
        col for col in actual_columns
        if col not in EXPECTED_COLUMNS
    ]

    if missing_columns:
        raise ValueError(
            f"Missing expected columns: {missing_columns}"
        )

    if unexpected_columns:
        print(
            f"WARNING: Unexpected columns found: {unexpected_columns}"
        )

    print("Schema validation: PASS")


# ============================================================
# 3. BASIC TARGET VALIDATION
# ============================================================

def validate_target(df: pd.DataFrame) -> None:

    if df["Product"].isna().any():
        raise ValueError(
            "Product contains NULL values."
        )

    n_classes = df["Product"].nunique()

    print(f"Product classes: {n_classes}")

    if n_classes != 11:
        print(
            f"WARNING: Expected 11 Product classes, "
            f"found {n_classes}"
        )

    print("Target validation: PASS")


# ============================================================
# 4. CREATE EXACT NARRATIVE GROUPS
# ============================================================

def create_narrative_groups(df: pd.DataFrame) -> pd.DataFrame:

    narrative = df["Consumer complaint narrative"]

    if narrative.isna().any():
        raise ValueError(
            "Consumer complaint narrative contains NULL values."
        )

    # Exact raw-text grouping.
    # Every identical narrative gets the same group ID.
    df["narrative_group"] = (
        pd.factorize(narrative, sort=False)[0]
    )

    return df


# ============================================================
# 5. DUPLICATE / LABEL CONSISTENCY AUDIT
# ============================================================

def analyze_duplicates(df: pd.DataFrame):

    group_stats = (
        df.groupby("narrative_group")
        .agg(
            row_count=("Complaint ID", "size"),
            unique_products=("Product", "nunique"),
        )
    )

    duplicate_groups = group_stats[
        group_stats["row_count"] > 1
    ]

    conflicting_groups = duplicate_groups[
        duplicate_groups["unique_products"] > 1
    ]

    duplicate_group_ids = set(
        duplicate_groups.index
    )

    conflicting_group_ids = set(
        conflicting_groups.index
    )

    duplicate_rows = int(
        df["narrative_group"]
        .isin(duplicate_group_ids)
        .sum()
    )

    conflicting_rows = int(
        df["narrative_group"]
        .isin(conflicting_group_ids)
        .sum()
    )

    audit = {
        "total_rows": len(df),
        "unique_narratives": int(
            df["narrative_group"].nunique()
        ),
        "duplicate_narrative_groups": len(
            duplicate_groups
        ),
        "rows_belonging_to_duplicate_groups": duplicate_rows,
        "conflicting_duplicate_groups": len(
            conflicting_groups
        ),
        "rows_belonging_to_conflicting_groups": conflicting_rows,
    }

    print("\nDuplicate / label audit")
    print("-" * 50)

    for key, value in audit.items():
        print(f"{key}: {value:,}")

    return (
        group_stats,
        conflicting_group_ids,
        audit,
    )


# ============================================================
# 6. QUARANTINE CONFLICTING LABEL GROUPS
# ============================================================

def quarantine_conflicting_groups(
    df: pd.DataFrame,
    conflicting_group_ids,
):

    conflict_mask = df["narrative_group"].isin(
        conflicting_group_ids
    )

    quarantined = df.loc[
        conflict_mask
    ].copy()

    clean = df.loc[
        ~conflict_mask
    ].copy()

    print(
        f"\nQuarantined rows: {len(quarantined):,}"
    )

    print(
        f"Remaining benchmark rows: {len(clean):,}"
    )

    return clean, quarantined


# ============================================================
# 7. STRATIFIED GROUP SPLIT
# ============================================================

def create_group_splits(df: pd.DataFrame):

    X = df["Consumer complaint narrative"]
    y = df["Product"]
    groups = df["narrative_group"]

    # Seven folds gives approximately 14.3% per fold.
    # We select one fold for TEST and one for VALIDATION.
    # Remaining ~71.4% becomes TRAIN.
    sgkf = StratifiedGroupKFold(
        n_splits=7,
        shuffle=True,
        random_state=42,
    )

    folds = np.empty(len(df), dtype=int)

    for fold_id, (_, test_idx) in enumerate(
        sgkf.split(X, y, groups)
    ):
        folds[test_idx] = fold_id

    # --------------------------------------------------------
    # Choose test + validation folds.
    #
    # We evaluate every pair and select the pair whose
    # combined class distributions are closest to the
    # desired ~15% / ~15% proportions.
    # --------------------------------------------------------

    target_fraction = 0.15

    best_pair = None
    best_score = float("inf")

    class_distribution = (
        df["Product"]
        .value_counts(normalize=True)
        .sort_index()
    )

    for test_fold in range(7):

        for val_fold in range(7):

            if test_fold == val_fold:
                continue

            test_mask = folds == test_fold
            val_mask = folds == val_fold

            test_fraction = test_mask.mean()
            val_fraction = val_mask.mean()

            test_dist = (
                df.loc[test_mask, "Product"]
                .value_counts(normalize=True)
                .reindex(
                    class_distribution.index,
                    fill_value=0,
                )
            )

            val_dist = (
                df.loc[val_mask, "Product"]
                .value_counts(normalize=True)
                .reindex(
                    class_distribution.index,
                    fill_value=0,
                )
            )

            distribution_error = (
                np.abs(
                    test_dist - class_distribution
                ).mean()
                +
                np.abs(
                    val_dist - class_distribution
                ).mean()
            )

            size_error = (
                abs(test_fraction - target_fraction)
                +
                abs(val_fraction - target_fraction)
            )

            score = (
                10 * size_error
                + distribution_error
            )

            if score < best_score:
                best_score = score
                best_pair = (
                    test_fold,
                    val_fold,
                )

    test_fold, val_fold = best_pair

    split = np.full(
        len(df),
        "train",
        dtype=object,
    )

    split[folds == val_fold] = "validation"
    split[folds == test_fold] = "test"

    df = df.copy()
    df["split"] = split

    return df


# ============================================================
# 8. SPLIT VALIDATION
# ============================================================

def validate_splits(df: pd.DataFrame):

    print("\nSplit distribution")
    print("-" * 50)

    print(
        df["split"]
        .value_counts()
        .sort_index()
    )

    print("\nProduct distribution by split")
    print("-" * 50)

    distribution = pd.crosstab(
        df["split"],
        df["Product"],
        normalize="index",
    )

    print(
        (distribution * 100)
        .round(2)
    )

    # --------------------------------------------------------
    # Critical leakage check:
    # no narrative group may occur in multiple splits.
    # --------------------------------------------------------

    group_split_counts = (
        df.groupby("narrative_group")["split"]
        .nunique()
    )

    leaking_groups = (
        group_split_counts[
            group_split_counts > 1
        ]
    )

    if len(leaking_groups) > 0:
        raise AssertionError(
            f"Split leakage detected! "
            f"{len(leaking_groups)} narrative groups "
            f"cross split boundaries."
        )

    print(
        "\nDuplicate-group split check: PASS"
    )


# ============================================================
# 9. SAVE DATASETS
# ============================================================

def save_outputs(
    df,
    quarantined,
    audit,
):

    train = df[df["split"] == "train"].copy()
    validation = df[
        df["split"] == "validation"
    ].copy()
    test = df[df["split"] == "test"].copy()

    # Main datasets
    train.to_csv(
        OUTPUT_DIR / "project1_train.csv",
        index=False,
    )

    validation.to_csv(
        OUTPUT_DIR / "project1_validation.csv",
        index=False,
    )

    test.to_csv(
        OUTPUT_DIR / "project1_test.csv",
        index=False,
    )

    # Label-conflict quarantine
    quarantined.to_csv(
        OUTPUT_DIR /
        "project1_label_conflicts_quarantine.csv",
        index=False,
    )

    # Split manifest
    manifest_columns = [
        "Complaint ID",
        "narrative_group",
        "split",
        "Product",
    ]

    df[manifest_columns].to_csv(
        OUTPUT_DIR /
        "project1_split_manifest.csv",
        index=False,
    )

    # Audit report
    audit_path = (
        REPORT_DIR /
        "data_preparation_report.json"
    )

    with open(audit_path, "w") as f:
        json.dump(
            audit,
            f,
            indent=4,
        )

    print("\nFiles written:")
    print(
        f"  {OUTPUT_DIR / 'project1_train.csv'}"
    )
    print(
        f"  {OUTPUT_DIR / 'project1_validation.csv'}"
    )
    print(
        f"  {OUTPUT_DIR / 'project1_test.csv'}"
    )
    print(
        f"  {OUTPUT_DIR / 'project1_label_conflicts_quarantine.csv'}"
    )
    print(
        f"  {OUTPUT_DIR / 'project1_split_manifest.csv'}"
    )
    print(
        f"  {audit_path}"
    )


# ============================================================
# MAIN PIPELINE
# ============================================================

def main():

    df = load_data(RAW_PATH)

    validate_schema(df)

    validate_target(df)

    df = create_narrative_groups(df)

    (
        group_stats,
        conflicting_group_ids,
        audit,
    ) = analyze_duplicates(df)

    clean_df, quarantined = (
        quarantine_conflicting_groups(
            df,
            conflicting_group_ids,
        )
    )

    clean_df = create_group_splits(
        clean_df
    )

    validate_splits(clean_df)

    save_outputs(
        clean_df,
        quarantined,
        audit,
    )

    print("\nProject 1 data preparation: COMPLETE")


if __name__ == "__main__":
    main()