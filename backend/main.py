from fastapi import FastAPI
import pandas as pd

# Create FastAPI app
app = FastAPI()

# Load sample feedback
df = pd.read_csv(r"C:\Coding\Hackathon\AI Agent\FeedForward\data\feedback.csv")

# Test endpoint
@app.get("/")
def read_root():
    return {"message": "Customer Feedback Prioritizer running"}

# Endpoint to get feedback
@app.get("/feedback")
def get_feedback():
    return df.to_dict(orient="records")