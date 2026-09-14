from __future__ import annotations

import json
import os
import re
import sqlite3
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any

import torch
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline


MODEL_ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = Path(os.getenv("DATA_DIR", str(MODEL_ROOT.parent / "data")))
DATABASE_PATH = DATA_ROOT / "support-sense.db"
ISSUE_MODEL_DIR = MODEL_ROOT / "distilbert_issue_model" / "distilbert_issue_model"
LABEL_ENCODER_PATH = MODEL_ROOT / "distilbert_label_encoder.pkl"
SENTIMENT_MODEL_DIR = MODEL_ROOT / "roberta_sentiment"


class ClassificationRequest(BaseModel):
    text: str = Field(min_length=3, max_length=10_000)
    customer: str = Field(default="New customer", max_length=120)


class ClassificationResponse(BaseModel):
    issue: str
    issue_label: str
    issue_confidence: float
    sentiment: str
    sentiment_confidence: float
    priority: str


class ComplaintRecord(ClassificationResponse):
    id: str
    customer: str
    title: str
    body: str
    created_at: str


class ComplaintListResponse(BaseModel):
    complaints: list[ComplaintRecord]
    total: int
    negative: int
    auto_classified: int


class ModelStatus(BaseModel):
    issue_model: str
    sentiment_model: str
    issue_labels: int


def _load_issue_labels() -> list[str]:
    if not LABEL_ENCODER_PATH.exists():
        return []
    encoder = joblib.load(LABEL_ENCODER_PATH)
    labels = getattr(encoder, "classes_", [])
    return [str(label) for label in labels]


@lru_cache(maxsize=1)
def get_issue_classifier() -> tuple[Any, list[str]]:
    if not ISSUE_MODEL_DIR.exists():
        raise RuntimeError(f"Issue model not found at {ISSUE_MODEL_DIR}")
    tokenizer = AutoTokenizer.from_pretrained(ISSUE_MODEL_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(ISSUE_MODEL_DIR)
    model.eval()
    return pipeline(
        "text-classification",
        model=model,
        tokenizer=tokenizer,
        device=0 if torch.cuda.is_available() else -1,
    ), _load_issue_labels()


@lru_cache(maxsize=1)
def get_sentiment_classifier() -> Any | None:
    if not SENTIMENT_MODEL_DIR.exists():
        return None
    tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL_DIR)
    return pipeline(
        "sentiment-analysis",
        model=model,
        tokenizer=tokenizer,
        device=0 if torch.cuda.is_available() else -1,
    )


def _fallback_sentiment(text: str) -> tuple[str, float]:
    positive_words = {"thank", "thanks", "resolved", "helpful", "great", "happy", "quickly", "good"}
    negative_words = {"charged", "declined", "late", "cannot", "unable", "wrong", "failed", "urgent", "refund", "dispute"}
    words = set(re.findall(r"[a-z]+", text.lower()))
    positive = len(words & positive_words)
    negative = len(words & negative_words)
    if negative > positive:
        return "Negative", min(0.55 + negative * 0.06, 0.98)
    if positive > negative:
        return "Positive", min(0.55 + positive * 0.06, 0.98)
    return "Neutral", 0.58


def _sentiment(text: str) -> tuple[str, float]:
    classifier = get_sentiment_classifier()
    if classifier is None:
        return _fallback_sentiment(text)
    result = classifier(text, truncation=True)[0]
    label = str(result["label"]).lower()
    normalized = "Positive" if "pos" in label else "Negative" if "neg" in label else "Neutral"
    return normalized, float(result["score"])


def classify_text(text: str) -> ClassificationResponse:
    classifier, labels = get_issue_classifier()
    result = classifier(text, truncation=True)[0]
    raw_label = str(result["label"])
    index = int(raw_label.removeprefix("LABEL_")) if raw_label.removeprefix("LABEL_").isdigit() else -1
    issue = labels[index] if 0 <= index < len(labels) else raw_label
    sentiment, sentiment_confidence = _sentiment(text)
    priority = "High" if sentiment == "Negative" and float(result["score"]) >= 0.7 else "Medium" if sentiment == "Negative" else "Low"
    return ClassificationResponse(
        issue=issue,
        issue_label=raw_label,
        issue_confidence=round(float(result["score"]), 4),
        sentiment=sentiment,
        sentiment_confidence=round(sentiment_confidence, 4),
        priority=priority,
    )


def _database() -> sqlite3.Connection:
    DATA_ROOT.mkdir(exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute(
        """CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            customer TEXT NOT NULL,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            issue TEXT NOT NULL,
            issue_label TEXT NOT NULL,
            issue_confidence REAL NOT NULL,
            sentiment TEXT NOT NULL,
            sentiment_confidence REAL NOT NULL,
            priority TEXT NOT NULL,
            created_at TEXT NOT NULL
        )"""
    )
    connection.commit()
    return connection


def _record_from_row(row: sqlite3.Row) -> ComplaintRecord:
    return ComplaintRecord(**dict(row))


def _store_complaint(text: str, customer: str, result: ClassificationResponse) -> ComplaintRecord:
    created_at = datetime.now(timezone.utc).isoformat()
    complaint_id = f"C-{datetime.now(timezone.utc).strftime('%y%m%d%H%M%S%f')[-8:]}"
    title = text.strip().split(".")[0][:90]
    record = ComplaintRecord(
        id=complaint_id,
        customer=customer.strip() or "New customer",
        title=title,
        body=text.strip(),
        created_at=created_at,
        **result.model_dump(),
    )
    connection = _database()
    connection.execute(
        "INSERT INTO complaints VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            record.id,
            record.customer,
            record.title,
            record.body,
            record.issue,
            record.issue_label,
            record.issue_confidence,
            record.sentiment,
            record.sentiment_confidence,
            record.priority,
            record.created_at,
        ),
    )
    connection.commit()
    connection.close()
    return record


app = FastAPI(title="CasePilot Model API", version="1.0.0")
configured_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins or ["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=ModelStatus)
def health() -> ModelStatus:
    return ModelStatus(
        issue_model="loaded" if ISSUE_MODEL_DIR.exists() else "missing",
        sentiment_model="loaded" if SENTIMENT_MODEL_DIR.exists() else "lexicon-fallback",
        issue_labels=len(_load_issue_labels()),
    )


@app.get("/api/v1/complaints", response_model=ComplaintListResponse)
def list_complaints() -> ComplaintListResponse:
    connection = _database()
    rows = connection.execute("SELECT * FROM complaints ORDER BY created_at DESC").fetchall()
    connection.close()
    records = [_record_from_row(row) for row in rows]
    return ComplaintListResponse(
        complaints=records,
        total=len(records),
        negative=sum(record.sentiment == "Negative" for record in records),
        auto_classified=len(records),
    )


@app.post("/api/v1/classify", response_model=ClassificationResponse)
def classify(request: ClassificationRequest) -> ClassificationResponse:
    try:
        result = classify_text(request.text)
        _store_complaint(request.text, request.customer, result)
        return result
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Model inference failed: {error}") from error


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=False)