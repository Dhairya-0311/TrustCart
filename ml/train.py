"""
TrustCart — Fake Review Detection Model Training Script
========================================================
Trains an XGBoost + Logistic Regression classifier to detect
fake (CG) vs genuine (OR) product reviews.

Usage:
    python train.py --data fake_reviews_dataset.csv

Output:
    - xgboost_fake_review_model.pkl
    - logistic_regression_model.pkl
    - tfidf_vectorizer.pkl
    - training_report.txt
"""

import argparse
import re
import sys
import joblib
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings("ignore")

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, classification_report
from sklearn.preprocessing import LabelEncoder
from scipy.sparse import hstack, csr_matrix
from xgboost import XGBClassifier


# ─────────────────────────────────────────────
# Feature Engineering
# ─────────────────────────────────────────────

def extract_statistical_features(text_series: pd.Series) -> pd.DataFrame:
    """
    Extract 8 statistical heuristic features from review text.
    These directly mirror TrustCart's fake review detection logic.

    Features:
        1. char_length       — review character length
        2. word_count        — total word count
        3. exclamation_count — over-enthusiasm signal
        4. caps_ratio        — ratio of ALL-CAPS words (fake emphasis)
        5. avg_word_length   — vocabulary complexity
        6. unique_word_ratio — repetition/copy-paste detection
        7. sentence_count    — sentence structure complexity
        8. question_count    — genuine reviews ask more questions
    """
    features = pd.DataFrame()
    features["char_length"]       = text_series.apply(lambda x: len(str(x)))
    features["word_count"]        = text_series.apply(lambda x: len(str(x).split()))
    features["exclamation_count"] = text_series.apply(lambda x: str(x).count("!"))
    features["caps_ratio"]        = text_series.apply(
        lambda x: sum(1 for w in str(x).split() if w.isupper()) / max(len(str(x).split()), 1)
    )
    features["avg_word_length"]   = text_series.apply(
        lambda x: np.mean([len(w) for w in str(x).split()]) if str(x).split() else 0
    )
    features["unique_word_ratio"] = text_series.apply(
        lambda x: len(set(str(x).lower().split())) / max(len(str(x).split()), 1)
    )
    features["sentence_count"]    = text_series.apply(
        lambda x: len(re.split(r"[.!?]+", str(x)))
    )
    features["question_count"]    = text_series.apply(lambda x: str(x).count("?"))
    return features


# ─────────────────────────────────────────────
# Prediction Helper
# ─────────────────────────────────────────────

def predict_review(review_text: str, rating: float, model, tfidf_vec) -> tuple:
    """
    Predict if a single review is fake or genuine.

    Returns:
        (label: str, fake_probability: float)
    """
    tfidf_feat = tfidf_vec.transform([review_text])
    stat_feat  = extract_statistical_features(pd.Series([review_text]))
    stat_feat["rating"] = rating
    X = hstack([tfidf_feat, csr_matrix(stat_feat.values)])
    prob  = model.predict_proba(X)[0][1]
    label = "FAKE" if prob >= 0.5 else "GENUINE"
    return label, round(float(prob), 4)


# ─────────────────────────────────────────────
# Main Training Pipeline
# ─────────────────────────────────────────────

def main(data_path: str):
    print("=" * 60)
    print("  TrustCart — Fake Review Detection Training Pipeline")
    print("=" * 60)

    # 1. Load data
    print(f"\n[1/6] Loading dataset from '{data_path}'...")
    df = pd.read_csv(data_path)
    print(f"      Shape: {df.shape} | Labels: {df['label'].value_counts().to_dict()}")

    # 2. Encode labels: CG (fake) = 1, OR (genuine) = 0
    print("\n[2/6] Encoding labels...")
    le = LabelEncoder()
    df["label_encoded"] = le.fit_transform(df["label"])
    df["label_encoded"] = 1 - df["label_encoded"]   # CG=1 (fake), OR=0 (genuine)

    # 3. Feature engineering
    print("\n[3/6] Extracting statistical features (8 heuristics)...")
    stat_features = extract_statistical_features(df["text_"])
    stat_features["rating"] = df["rating"].values
    print(f"      Statistical feature shape: {stat_features.shape}")

    # 4. Train/test split
    print("\n[4/6] Splitting data (80% train / 20% test, stratified)...")
    X_stat = stat_features.values
    y      = df["label_encoded"].values

    (
        X_stat_train, X_stat_test,
        X_text_train, X_text_test,
        y_train, y_test
    ) = train_test_split(
        X_stat, df["text_"].values, y,
        test_size=0.2, random_state=42, stratify=y
    )

    # 5. TF-IDF (fit on train only)
    print("\n[5/6] Fitting TF-IDF vectorizer (5000 features, unigrams+bigrams)...")
    tfidf = TfidfVectorizer(
        max_features=5000, ngram_range=(1, 2),
        stop_words="english", min_df=3, sublinear_tf=True
    )
    X_tfidf_train = tfidf.fit_transform(X_text_train)
    X_tfidf_test  = tfidf.transform(X_text_test)

    X_train = hstack([X_tfidf_train, csr_matrix(X_stat_train)])
    X_test  = hstack([X_tfidf_test,  csr_matrix(X_stat_test)])
    print(f"      Combined feature shape: {X_train.shape}")

    # 6. Train models
    print("\n[6/6] Training models...")

    print("      → Logistic Regression... ", end="", flush=True)
    lr = LogisticRegression(max_iter=1000, C=1.0, solver="saga", random_state=42, n_jobs=-1)
    lr.fit(X_train, y_train)
    lr_preds = lr.predict(X_test)
    lr_proba = lr.predict_proba(X_test)[:, 1]
    print("done")

    print("      → XGBoost...             ", end="", flush=True)
    xgb = XGBClassifier(
        n_estimators=200, max_depth=6, learning_rate=0.1,
        subsample=0.8, colsample_bytree=0.8,
        eval_metric="logloss", random_state=42,
        n_jobs=-1, tree_method="hist"
    )
    xgb.fit(X_train, y_train)
    xgb_preds = xgb.predict(X_test)
    xgb_proba = xgb.predict_proba(X_test)[:, 1]
    print("done")

    # ─── Results
    print("\n" + "=" * 60)
    print("  RESULTS")
    print("=" * 60)

    report_lines = []
    for name, preds, proba in [
        ("Logistic Regression", lr_preds, lr_proba),
        ("XGBoost",             xgb_preds, xgb_proba),
    ]:
        acc = accuracy_score(y_test, preds)
        f1  = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, proba)
        line = f"  {name:<25} Accuracy: {acc:.4f}  F1: {f1:.4f}  AUC: {auc:.4f}"
        print(line)
        report_lines.append(line)
        report_lines.append(classification_report(
            y_test, preds, target_names=["Genuine (OR)", "Fake (CG)"]
        ))

    best_model = xgb if f1_score(y_test, xgb_preds) >= f1_score(y_test, lr_preds) else lr
    best_name  = "XGBoost" if best_model is xgb else "Logistic Regression"
    print(f"\n  🏆 Best model: {best_name}")

    # ─── Save models
    print("\n  Saving models...")
    joblib.dump(xgb,   "xgboost_fake_review_model.pkl")
    joblib.dump(lr,    "logistic_regression_model.pkl")
    joblib.dump(tfidf, "tfidf_vectorizer.pkl")

    with open("training_report.txt", "w") as f:
        f.write("TrustCart — Fake Review Detection Training Report\n")
        f.write("=" * 60 + "\n")
        f.write("\n".join(report_lines))

    print("  ✅ Saved: xgboost_fake_review_model.pkl")
    print("  ✅ Saved: logistic_regression_model.pkl")
    print("  ✅ Saved: tfidf_vectorizer.pkl")
    print("  ✅ Saved: training_report.txt")

    # ─── Quick inference demo
    print("\n" + "=" * 60)
    print("  INFERENCE DEMO")
    print("=" * 60)
    demos = [
        ("Best product ever!! Love it!! Buy this NOW!!", 5),
        ("Used it for 2 weeks. Works well but gets warm after 30 mins. Not ideal for long sessions.", 3),
    ]
    for text, rating in demos:
        label, prob = predict_review(text, rating, best_model, tfidf)
        print(f"  [{label}] (prob={prob}) — \"{text[:60]}...\"")

    print("\n✅ Training complete!\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TrustCart Fake Review Detector Training")
    parser.add_argument("--data", default="fake_reviews_dataset.csv", help="Path to CSV dataset")
    args = parser.parse_args()
    main(args.data)
