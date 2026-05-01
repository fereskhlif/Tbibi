"""
Train a multi-label disease risk classifier — v2 (HistGradientBoosting + Feature Engineering)

Required CSV columns:
    age, bmi, systolic_bp, fasting_glucose, smoking,
    physical_activity, family_history, cholesterol,
    heart_disease_risk, high_blood_pressure_risk,
    diabetes_risk, lung_disease_risk

Usage:
    python train_disease_model.py

Outputs:
    disease_risk_model.joblib        - trained model bundle loaded by main.py
    disease_risk_model.meta.json     - feature ranges for the frontend form
    disease_risk_model.metrics.json  - evaluation metrics served via /predict-risk/metrics
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# ── Configuration ─────────────────────────────────────────────────────────────

BASE_DIR     = Path(__file__).parent
CSV_PATH     = BASE_DIR / "disease_risk_dataset.csv"
MODEL_PATH   = BASE_DIR / "disease_risk_model.joblib"
META_PATH    = BASE_DIR / "disease_risk_model.meta.json"
METRICS_PATH = BASE_DIR / "disease_risk_model.metrics.json"

FEATURE_COLS = [
    "age", "bmi", "systolic_bp", "fasting_glucose",
    "smoking", "physical_activity", "family_history", "cholesterol",
]
LABEL_COLS = [
    "heart_disease_risk", "high_blood_pressure_risk",
    "diabetes_risk", "lung_disease_risk",
]
LABEL_DISPLAY = {
    "heart_disease_risk":       "Heart Disease",
    "high_blood_pressure_risk": "High Blood Pressure",
    "diabetes_risk":            "Diabetes",
    "lung_disease_risk":        "Lung Disease",
}

# ── Feature Engineering ───────────────────────────────────────────────────────

ENGINEERED_COLS = [
    "metabolic_risk", "cardio_risk", "age_risk", "chol_bmi_ratio",
    "inactivity", "bmi_category", "hypertension_flag", "glucose_flag",
    "lifestyle_risk",
]
ALL_FEATURE_COLS = FEATURE_COLS + ENGINEERED_COLS


def _engineer_features(df):
    """Add medical domain interaction features for stronger model signal."""
    import numpy as np
    df = df.copy()

    df["metabolic_risk"]    = df["fasting_glucose"] * df["bmi"] / 1000.0
    df["cardio_risk"]       = df["systolic_bp"] * (1 + df["smoking"] * 0.3 + df["family_history"] * 0.2)
    df["age_risk"]          = df["age"] / 90.0
    df["chol_bmi_ratio"]    = df["cholesterol"] / (df["bmi"] + 1e-6)
    df["inactivity"]        = 7 - df["physical_activity"]
    df["bmi_category"]      = np.select(
        [df["bmi"] < 18.5, df["bmi"] < 25, df["bmi"] < 30],
        [0, 1, 2], default=3
    )
    df["hypertension_flag"] = (df["systolic_bp"] >= 130).astype(int)
    df["glucose_flag"]      = np.select(
        [df["fasting_glucose"] < 100, df["fasting_glucose"] < 126],
        [0, 1], default=2
    )
    df["lifestyle_risk"]    = (
        df["smoking"] * 2 +
        df["family_history"] * 1.5 +
        df["inactivity"] * 0.5 +
        df["bmi_category"] * 0.5
    )
    return df


# ── Training ──────────────────────────────────────────────────────────────────

def train():
    import numpy as np
    import pandas as pd
    from sklearn.ensemble import HistGradientBoostingClassifier
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import (
        classification_report, accuracy_score,
        precision_score, recall_score, f1_score, roc_auc_score
    )
    import joblib

    # 1. Load
    if not CSV_PATH.exists():
        print(f"\n[ERROR] CSV not found: {CSV_PATH}")
        sys.exit(1)

    print(f"[INFO] Loading dataset: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    print(f"[INFO] Rows loaded: {len(df)}")

    # 2. Validate
    missing = [c for c in FEATURE_COLS + LABEL_COLS if c not in df.columns]
    if missing:
        print(f"[ERROR] Missing columns: {missing}")
        sys.exit(1)

    # 3. Clean
    before = len(df)
    df = df.dropna(subset=FEATURE_COLS + LABEL_COLS)
    if before - len(df):
        print(f"[WARN] Dropped {before - len(df)} rows with NaN. {len(df)} remain.")

    if len(df) < 10:
        print(f"[ERROR] Not enough rows ({len(df)}).")
        sys.exit(1)

    # 4. Feature engineering
    print("[INFO] Engineering features...")
    df = _engineer_features(df)
    for col in LABEL_COLS:
        df[col] = df[col].astype(int)

    X = df[ALL_FEATURE_COLS].values.astype(float)
    Y = df[LABEL_COLS].values
    print(f"[INFO] Feature matrix: {X.shape}  ({len(ALL_FEATURE_COLS)} features)")

    # 5. Stratified split
    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y, test_size=0.2, random_state=42, stratify=Y[:, 0]
    )
    print(f"[INFO] Train: {len(X_train)} | Test: {len(X_test)}")

    # 6. Train one calibrated HistGradientBoosting model per disease
    print("[INFO] Training HistGradientBoostingClassifier (500 iterations) per label...")
    models      = {}
    per_disease = {}

    for i, label_key in enumerate(LABEL_COLS):
        display = LABEL_DISPLAY.get(label_key, label_key)
        print(f"\n  -> [{i+1}/4] {display}")
        y_tr, y_te = Y_train[:, i], Y_test[:, i]

        base = HistGradientBoostingClassifier(
            max_iter=300,           # fewer rounds → less overfitting
            learning_rate=0.08,    # slightly higher → faster, needs less data memorisation
            max_depth=5,            # shallower trees
            min_samples_leaf=50,   # much larger → very smooth decision boundary
            l2_regularization=1.0, # strong regularisation
            max_leaf_nodes=24,     # limits tree complexity
            random_state=42,
        )
        # Isotonic calibration over 5 folds → reliable probability estimates
        clf = CalibratedClassifierCV(base, method="isotonic", cv=5)
        clf.fit(X_train, y_tr)

        y_pred = clf.predict(X_test)
        y_prob = clf.predict_proba(X_test)[:, 1]

        acc  = float(accuracy_score(y_te, y_pred))
        prec = float(precision_score(y_te, y_pred, zero_division=0))
        rec  = float(recall_score(y_te, y_pred, zero_division=0))
        f1   = float(f1_score(y_te, y_pred, zero_division=0))
        try:    auc = float(roc_auc_score(y_te, y_prob))
        except: auc = None

        per_disease[label_key] = {
            "displayName": display,
            "accuracy":    round(acc,  4),
            "precision":   round(prec, 4),
            "recall":      round(rec,  4),
            "f1Score":     round(f1,   4),
            "rocAuc":      round(auc, 4) if auc is not None else None,
            "support":     int(y_te.sum()),
        }
        models[label_key] = clf

        auc_str = f"{auc:.3f}" if auc is not None else "N/A"
        print(f"     Acc={acc:.3f}  Prec={prec:.3f}  Rec={rec:.3f}  F1={f1:.3f}  AUC={auc_str}")
        print(classification_report(y_te, y_pred, target_names=["No Risk", "At Risk"], zero_division=0))

    # 7. Overall averages
    overall_acc  = sum(per_disease[k]["accuracy"]  for k in LABEL_COLS) / len(LABEL_COLS)
    overall_prec = sum(per_disease[k]["precision"] for k in LABEL_COLS) / len(LABEL_COLS)
    overall_rec  = sum(per_disease[k]["recall"]    for k in LABEL_COLS) / len(LABEL_COLS)
    overall_f1   = sum(per_disease[k]["f1Score"]   for k in LABEL_COLS) / len(LABEL_COLS)
    print(f"\n[OVERALL] Acc={overall_acc:.3f}  Prec={overall_prec:.3f}  Rec={overall_rec:.3f}  F1={overall_f1:.3f}")

    # 8. Save model bundle
    bundle = {
        "models":       models,
        "feature_cols": ALL_FEATURE_COLS,
        "label_cols":   LABEL_COLS,
        "engineered":   True,
    }
    joblib.dump(bundle, str(MODEL_PATH))
    print(f"\n[INFO] Model saved → {MODEL_PATH}")

    # 9. Save feature metadata (raw cols only, for the frontend form)
    df_raw = df[FEATURE_COLS]
    META_PATH.write_text(json.dumps({
        "features": {
            col: {
                "min":  float(df_raw[col].min()),
                "max":  float(df_raw[col].max()),
                "mean": float(round(df_raw[col].mean(), 1)),
            }
            for col in FEATURE_COLS
        },
        "labels": LABEL_COLS,
    }, indent=2))
    print(f"[INFO] Feature metadata saved → {META_PATH}")

    # 10. Save evaluation metrics
    METRICS_PATH.write_text(json.dumps({
        "trainedAt":   datetime.now().isoformat(),
        "datasetSize": len(df),
        "trainSize":   len(X_train),
        "testSize":    len(X_test),
        "algorithm":   "HistGradientBoosting + Isotonic Calibration (per-label, 500 iterations)",
        "nEstimators": 500,
        "overall": {
            "accuracy":  round(overall_acc,  4),
            "precision": round(overall_prec, 4),
            "recall":    round(overall_rec,  4),
            "f1Score":   round(overall_f1,   4),
        },
        "perDisease": per_disease,
    }, indent=2))
    print(f"[INFO] Metrics saved → {METRICS_PATH}")
    print("\n[OK] Done. Restart main.py to load the new model.")


if __name__ == "__main__":
    train()
