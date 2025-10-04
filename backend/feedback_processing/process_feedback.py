import pandas as pd
import re
import os
from backend.ai_logic import classify_feedback

def clean_text(text):
    """Clean feedback text."""
    text = re.sub(r"[^\w\s,.!?]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def get_processed_feedback(csv_path=None):
    """
    Reads CSV and returns a list of dicts with feedback, urgency, impact, summary, and reason.
    """
    if csv_path is None:
        csv_path = os.path.join("data", "feedback.csv")
    if not os.path.exists(csv_path):
        return []

    df = pd.read_csv(csv_path)
    processed_list = []
    for _, row in df.iterrows():
        feedback_text = clean_text(str(row.get("feedback", "")))
        classification = classify_feedback(feedback_text)
        processed_list.append({
            "issue": feedback_text,
            "urgency": classification.get("urgency", "Medium"),
            "impact": classification.get("impact", "Medium"),
            "summary": classification.get("summary", ""),
            "reason": classification.get("reason", ""),
            "priority": f"{classification.get('urgency', 'Medium')} / {classification.get('impact', 'Medium')}"
        })
    return processed_list
