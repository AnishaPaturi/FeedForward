import os
import re
from transformers import pipeline
from dotenv import load_dotenv
import openai

# --- Load .env ---
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# --- Preprocessing ---
def preprocess_feedback(text: str) -> str:
    text = re.sub(r"[^\w\s,.!?]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# --- Transformers Pipelines ---
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", framework="pt")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# --- Mapping for scores ---
SCORE_MAP = {"Low": 1, "Medium": 2, "High": 3}

# --- Feedback Classification ---
def classify_feedback(feedback_text: str):
    try:
        clean_text = preprocess_feedback(feedback_text)

        # Handle short / empty inputs
        if not clean_text or len(clean_text.split()) < 3:
            return {
                "feedback": clean_text,
                "urgency": "Low",
                "impact": "Low",
                "summary": f"Short feedback: {clean_text}",
                "reason": "Too short for detailed analysis, defaulting to Low impact/urgency."
            }

        # Urgency
        urgency_labels = ["Low urgency", "Medium urgency", "High urgency"]
        urgency_result = classifier(clean_text, urgency_labels)
        urgency = urgency_result["labels"][0].split()[0]

        # Impact
        impact_labels = ["Low impact", "Medium impact", "High impact"]
        impact_result = classifier(clean_text, impact_labels)
        impact = impact_result["labels"][0].split()[0]

        # Summary
        try:
            summary_result = summarizer(clean_text, max_length=80, min_length=15, do_sample=False)
            summary = summary_result[0]["summary_text"]
        except Exception:
            summary = clean_text  # fallback

        # Priority score
        urgency_score = SCORE_MAP.get(urgency, 1)
        impact_score = SCORE_MAP.get(impact, 1)
        priority_score = urgency_score + impact_score  # scale 2–6

        # Reason
        reason = f"Based on the feedback text, urgency is {urgency} and impact is {impact}."

        return {
            "feedback": clean_text,
            "urgency": urgency,
            "impact": impact,
            "priority_score": priority_score,
            "summary": summary,
            "reason": reason,
        }

    except Exception as e:
        return {"error": str(e)}

# --- Generate Insights ---
def generate_insights(feedback_list: list):
    try:
        prompt = "Generate actionable product insights based on the following customer feedback:\n"
        prompt += "\n".join(feedback_list)
        prompt += "\nProvide concise, prioritized insights in bullet points."

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7,
        )
        insight_text = response['choices'][0]['message']['content'].strip()
        return insight_text

    except Exception as e:
        return f"Error generating insights: {str(e)}"

# --- Rotating Quotes ---
ROTATING_QUOTES = [
    "Customer feedback is our roadmap to success.",
    "Every opinion counts. Listen carefully!",
    "Small insights can lead to big improvements.",
    "Turning feedback into action is the real innovation.",
    "Happy customers make happy products.",
    "Feedback is the breakfast of champions.",
    "Your voice shapes our next release."
]

_quote_index = 0
def get_rotating_quote():
    global _quote_index
    quote = ROTATING_QUOTES[_quote_index]
    _quote_index = (_quote_index + 1) % len(ROTATING_QUOTES)
    return quote
