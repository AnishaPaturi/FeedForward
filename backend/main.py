# from fastapi import FastAPI, Query
# from typing import Optional
# import pandas as pd
# from backend.ai_logic import classify_feedback

# # Create FastAPI app
# app = FastAPI()

# # Load sample feedback
# df = pd.read_csv(r"C:\Coding\Hackathon\AI Agent\FeedForward\data\feedback.csv")

# # Test endpoint
# @app.get("/")
# def read_root():
#     return {"message": "Customer Feedback Prioritizer running"}

# # Endpoint to get feedback
# @app.get("/feedback")
# def get_feedback():
#     return df.to_dict(orient="records")

# # Endpoint to classify feedback
# @app.get("/classify")
# def classify(text: Optional[str] = Query(None)):
#     if not text:
#         return {"error": "Please provide ?text=Your feedback here"}
#     result = classify_feedback(text)
#     return {"feedback": text, "classification": result}


from fastapi import FastAPI, Query
from typing import Optional
import pandas as pd
from backend.ai_logic import classify_feedback
from fastapi.middleware.cors import CORSMiddleware

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
