from fastapi import FastAPI, Query
from typing import Optional
import pandas as pd
from backend.ai_logic import classify_feedback
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use ["http://localhost:3000"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df = pd.read_csv("data/feedback.csv")

@app.get("/")
def read_root():
    return {"message": "Customer Feedback Prioritizer running"}

@app.get("/feedback")
def get_feedback():
    return df.to_dict(orient="records")

@app.get("/classify")
def classify(text: Optional[str] = Query(None)):
    if not text:
        return {"error": "Please provide ?text=Your feedback here"}
    result = classify_feedback(text)
    return {"feedback": text, "classification": result}

@app.get("/favicon.ico")
async def favicon():
    return FileResponse(os.path.join("static", "favicon.ico"))