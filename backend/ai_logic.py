from transformers import pipeline

# Initialize the zero-shot classifier
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

def classify_feedback(feedback_text):
    try:
        result = classifier(
            sequences=feedback_text,
            candidate_labels=[
                "high urgency", "medium urgency", "low urgency",
                "high impact", "medium impact", "low impact"
            ]
        )

        labels = result["labels"]
        scores = result["scores"]

        urgency = None
        impact = None
        for label, score in zip(labels, scores):
            if "urgency" in label and urgency is None:
                urgency = label.split()[0]
            elif "impact" in label and impact is None:
                impact = label.split()[0]

        return {
            "feedback": feedback_text,
            "urgency": urgency or "medium",
            "impact": impact or "medium",
            "raw": result
        }

    except Exception as e:
        return {"error": str(e)}
