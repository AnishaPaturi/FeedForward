# backend/app.py

from fastapi import FastAPI, Query
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import pandas as pd
from backend.ai_logic import classify_feedback  # ✅ clean import

# --- App Setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load Feedback CSV ---
DATA_FILE = os.path.join("data", "feedback.csv")
if os.path.exists(DATA_FILE):
    df = pd.read_csv(DATA_FILE)
else:
    df = pd.DataFrame(columns=["feedback"])

# --- Routes ---
@app.get("/")
def read_root():
    return {"message": "Customer Feedback Prioritizer running"}

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/feedback")
def get_feedback():
    return df.to_dict(orient="records")

@app.get("/classify")
def classify_endpoint(text: Optional[str] = Query(None)):
    if not text:
        return {"error": "Please provide ?text=Your feedback here"}
    result = classify_feedback(text)
    return {"feedback": text, "classification": result}

# @app.get("/favicon.ico")
# async def favicon():
#     favicon_path = os.path.join("static", "favicon.ico")
#     if os.path.exists(favicon_path):
#         return FileResponse(favicon_path)
#     return {"error": "favicon not found"}
