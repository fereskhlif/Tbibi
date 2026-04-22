"""
Train a multi-label Random Forest disease risk classifier from YOUR OWN CSV file.

Required CSV columns:
    age, bmi, systolic_bp, fasting_glucose, smoking,
    physical_activity, family_history, cholesterol,
    heart_disease_risk, high_blood_pressure_risk,
    diabetes_risk, lung_disease_risk

Usage:
    1. Place your CSV file at:
           tbibi-gemma-service/disease_risk_dataset.csv
       (or edit CSV_PATH below to point to your file)

    2. Run:
           python train_disease_model.py

Outputs:
    disease_risk_model.joblib   - trained model loaded by main.py
    disease_risk_model.meta.json - feature ranges used by the frontend
"""

import json
import sys
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────────────

BASE_DIR   = Path(__file__).parent
CSV_PATH   = BASE_DIR / "disease_risk_dataset.csv"   # <-- change this if needed
MODEL_PATH = BASE_DIR / "disease_risk_model.joblib"
META_PATH  = BASE_DIR / "disease_risk_model.meta.json"

FEATURE_COLS = [
    "age", "bmi", "systolic_bp", "fasting_glucose",
    "smoking", "physical_activity", "family_history", "cholesterol",
]
LABEL_COLS = [
    "heart_disease_risk", "high_blood_pressure_risk",
    "diabetes_risk", "lung_disease_risk",
]


# ── Main ──────────────────────────────────────────────────────────────────────

def train():
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.multioutput import MultiOutputClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report
    import joblib

    # 1. Load CSV
    if not CSV_PATH.exists():
        print(f"\n[ERROR] CSV file not found: {CSV_PATH}")
        print("[INFO]  Place your dataset at that path and re-run.")
        print(f"[INFO]  Required columns: {FEATURE_COLS + LABEL_COLS}")
        sys.exit(1)

    print(f"[INFO] Loading dataset: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    print(f"[INFO] Rows loaded: {len(df)}")

    # 2. Validate columns
    missing = [c for c in FEATURE_COLS + LABEL_COLS if c not in df.columns]
    if missing:
        print(f"\n[ERROR] Missing columns in your CSV: {missing}")
        print(f"[INFO]  Your CSV has: {list(df.columns)}")
        sys.exit(1)

    # 3. Drop rows with any NaN in required columns
    before = len(df)
    df = df.dropna(subset=FEATURE_COLS + LABEL_COLS)
    dropped = before - len(df)
    if dropped:
        print(f"[WARN]  Dropped {dropped} rows with missing values. {len(df)} rows remain.")

    if len(df) < 10:
        print(f"[ERROR] Not enough rows to train ({len(df)}). Add more data.")
        sys.exit(1)

    # 4. Ensure label columns are binary int (0/1)
    for col in LABEL_COLS:
        df[col] = df[col].astype(int)

    X = df[FEATURE_COLS].values
    Y = df[LABEL_COLS].values

    # 5. Split
    test_size = 0.2 if len(df) >= 50 else 0.1
    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y, test_size=test_size, random_state=42
    )
    print(f"[INFO] Train: {len(X_train)} rows | Test: {len(X_test)} rows")

    # 6. Train Random Forest
    print(f"[INFO] Training MultiOutputClassifier (RandomForest) ...")
    clf = MultiOutputClassifier(
        RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_split=4,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )
    )
    clf.fit(X_train, Y_train)

    # 7. Evaluate
    Y_pred = clf.predict(X_test)
    print("\n-- Evaluation on test set ------------------------------------------")
    for i, label in enumerate(LABEL_COLS):
        print(f"\n{label}:")
        print(classification_report(
            Y_test[:, i], Y_pred[:, i],
            target_names=["No Risk", "At Risk"],
            zero_division=0
        ))

    # 8. Save model
    bundle = {
        "model":        clf,
        "feature_cols": FEATURE_COLS,
        "label_cols":   LABEL_COLS,
    }
    joblib.dump(bundle, str(MODEL_PATH))
    print(f"[INFO] Model saved -> {MODEL_PATH}")

    # 9. Save feature metadata (for frontend form ranges)
    df_features = df[FEATURE_COLS]
    ranges = {
        col: {
            "min":  float(df_features[col].min()),
            "max":  float(df_features[col].max()),
            "mean": float(df_features[col].mean().round(1)),
        }
        for col in FEATURE_COLS
    }
    meta = {"features": ranges, "labels": LABEL_COLS}
    META_PATH.write_text(json.dumps(meta, indent=2))
    print(f"[INFO] Feature metadata saved -> {META_PATH}")
    print("\n[OK] Training complete. Restart main.py to load the new model.")


if __name__ == "__main__":
    train()
