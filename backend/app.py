from fastapi import FastAPI, Query
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import pandas as pd

from backend.ai_logic import classify_feedback
from backend.feedback_processing import process_feedback
from backend.feedback_processing.generate_report import generate_report
from backend.integrations.email_sender import send_email_report
from backend.integrations.slack_notion_sender import send_slack_report

# --- App Setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load CSV ---
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
    return {
        "feedback": text,
        "classification": {
            "urgency": result.get("urgency"),
            "impact": result.get("impact"),
            "summary": result.get("summary"),
            "reason": result.get("reason")
        }
    }

# --- Generate Weekly Report ---
@app.get("/generate_report")
def generate_weekly_report(format: Optional[str] = "json"):
    processed_feedback = process_feedback.get_processed_feedback(DATA_FILE)
    report_file = generate_report(processed_feedback, format=format)
    return {"message": f"Report generated: {report_file}", "file": report_file}

# --- Send Report via Slack ---
@app.get("/send_slack")
def send_report_slack(webhook_url: str, format: Optional[str] = "json"):
    processed_feedback = process_feedback.get_processed_feedback(DATA_FILE)
    report_file = generate_report(processed_feedback, format=format)
    send_slack_report(webhook_url, report_file)
    return {"message": "Report sent to Slack", "file": report_file}

# --- Send Report via Email ---
@app.get("/send_email")
def send_report_email(
    sender_email: str,
    sender_password: str,
    recipient_email: str,
    subject: Optional[str] = "Weekly Feedback Report",
    body: Optional[str] = "Please find attached the weekly feedback report.",
    format: Optional[str] = "json"
):
    processed_feedback = process_feedback.get_processed_feedback(DATA_FILE)
    report_file = generate_report(processed_feedback, format=format)
    send_email_report(sender_email, sender_password, recipient_email, subject, body, report_file)
    return {"message": f"Report sent to {recipient_email}", "file": report_file}

@app.get("/favicon.ico")
async def favicon():
    return FileResponse(os.path.join("static", "favicon.ico"))
