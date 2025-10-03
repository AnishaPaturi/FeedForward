import re
from transformers import pipeline

# --- Preprocessing ---
def preprocess_feedback(text: str) -> str:
    # Remove emojis & special characters (but keep punctuation)
    text = re.sub(r"[^\w\s,.!?]", "", text)
    # Normalize spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

# --- Pipelines ---
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", framework="pt")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# --- Main Feedback Classification ---
def classify_feedback(feedback_text: str):
    try:
        clean_text = preprocess_feedback(feedback_text)

        # Classify urgency
        urgency_labels = ["Low urgency", "Medium urgency", "High urgency"]
        urgency_result = classifier(clean_text, urgency_labels)
        urgency = urgency_result["labels"][0].split()[0]  # e.g., "High"

        # Classify impact
        impact_labels = ["Low impact", "Medium impact", "High impact"]
        impact_result = classifier(clean_text, impact_labels)
        impact = impact_result["labels"][0].split()[0]

        # Summarize feedback
        summary_result = summarizer(clean_text, max_length=100, min_length=20, do_sample=False)
        summary = summary_result[0]["summary_text"]

        return {
            "feedback": clean_text,
            "urgency": urgency,
            "impact": impact,
            "summary": summary
        }

    except Exception as e:
        return {"error": str(e)}
