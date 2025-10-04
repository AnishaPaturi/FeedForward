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

# --- Feedback Classification ---
def classify_feedback(feedback_text: str):
    try:
        clean_text = preprocess_feedback(feedback_text)

        # Urgency
        urgency_labels = ["Low urgency", "Medium urgency", "High urgency"]
        urgency_result = classifier(clean_text, urgency_labels)
        urgency = urgency_result["labels"][0].split()[0]

        # Impact
        impact_labels = ["Low impact", "Medium impact", "High impact"]
        impact_result = classifier(clean_text, impact_labels)
        impact = impact_result["labels"][0].split()[0]

        # Summary
        summary_result = summarizer(clean_text, max_length=100, min_length=20, do_sample=False)
        summary = summary_result[0]["summary_text"]

        # Reason
        reason = f"Based on the text, urgency is {urgency} and impact is {impact}."

        return {
            "feedback": clean_text,
            "urgency": urgency,
            "impact": impact,
            "summary": summary,
            "reason": reason
        }

    except Exception as e:
        return {"error": str(e)}

# --- Generate Insights ---
def generate_insights(feedback_list: list):
    """
    feedback_list: list of strings (all feedback entries)
    """
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

# --- Generate LLM Quote ---
def generate_llm_quote():
    try:
        prompt = "Generate a short inspirational quote about AI helping product teams:"
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=50,
            temperature=0.8,
        )
        quote_text = response['choices'][0]['message']['content'].strip()
        return quote_text
    except Exception as e:
        return f"Error generating quote: {str(e)}"

# --- Rotating Predefined Quotes ---
ROTATING_QUOTES = [
    "Customer feedback is our roadmap to success.",
    "Every opinion counts. Listen carefully!",
    "Small insights can lead to big improvements.",
    "Turning feedback into action is the real innovation.",
    "Happy customers make happy products.",
    "Feedback is the breakfast of champions.",
    "Your voice shapes our next release."
]

_quote_index = 0  # internal counter

def get_rotating_quote():
    global _quote_index
    quote = ROTATING_QUOTES[_quote_index]
    _quote_index = (_quote_index + 1) % len(ROTATING_QUOTES)
    return quote
