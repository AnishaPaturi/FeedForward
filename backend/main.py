from fastapi import FastAPI, Query
from typing import Optional
import pandas as pd
from backend.ai_logic import classify_feedback
from backend.feedback_processing.generate_report import generate_report
from backend.integrations.email_sender import send_email_report
from backend.integrations.slack_notion_sender import send_slack_report
from backend.feedback_processing import process_feedback
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

# ------------------------
# New Endpoint: Generate Weekly Report
# ------------------------
@app.get("/generate_report")
def generate_weekly_report(format: Optional[str] = "json"):
    # Step 1: Process feedback
    processed_feedback = process_feedback.get_processed_feedback("data/feedback.csv")
    
    # Step 2: Generate report
    report_file = generate_report(processed_feedback, format=format)
    
    return {"message": f"Report generated: {report_file}", "file": report_file}

# ------------------------
# New Endpoint: Send report via Slack
# ------------------------
@app.get("/send_slack")
def send_report_slack(webhook_url: str, format: Optional[str] = "json"):
    processed_feedback = process_feedback.get_processed_feedback("data/feedback.csv")
    report_file = generate_report(processed_feedback, format=format)
    send_slack_report(webhook_url, report_file)
    return {"message": "Report sent to Slack", "file": report_file}

# ------------------------
# New Endpoint: Send report via Email
# ------------------------
@app.get("/send_email")
def send_report_email(
    sender_email: str,
    sender_password: str,
    recipient_email: str,
    subject: Optional[str] = "Weekly Feedback Report",
    body: Optional[str] = "Please find attached the weekly feedback report.",
    format: Optional[str] = "json"
):
    processed_feedback = process_feedback.get_processed_feedback("data/feedback.csv")
    report_file = generate_report(processed_feedback, format=format)
    send_email_report(sender_email, sender_password, recipient_email, subject, body, report_file)
    return {"message": f"Report sent to {recipient_email}", "file": report_file}

@app.get("/favicon.ico")
async def favicon():
    return FileResponse(os.path.join("static", "favicon.ico"))
