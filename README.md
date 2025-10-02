# FeedForward
Customer Feedback Prioritizer: Product teams get flooded with feedback from surveys, apps, and social media. This agent analyzes entries by urgency and impact, highlights key pain points, and delivers a weekly prioritized action list via Notion, Slack, or Email.

## Running the Project Without Docker

### Prerequisites
- Python 3.8 or higher installed on your system.

### Setup
1. Clone or navigate to the project directory.

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### Running the Backend
1. Ensure you're in the project root directory.

2. Run the FastAPI server:
   ```
   uvicorn backend.main:app --reload
   ```

3. The server will start on `http://127.0.0.1:8000`. You can access:
   - Root endpoint: `http://127.0.0.1:8000/`
   - Feedback endpoint: `http://127.0.0.1:8000/feedback`

### API Endpoints
- `GET /`: Returns a welcome message.
- `GET /feedback`: Returns the feedback data as JSON.
