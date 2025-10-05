# FeedForward: Customer Feedback Prioritizer for Product Teams

FeedForward is an AI-powered solution that helps product teams manage **feedback overload**. It processes thousands of feedback entries from surveys, in-app feedback, and social media, categorizes them by **urgency** and **impact**, identifies key pain points, and generates a **prioritized action list**. This action list can be delivered via **Notion, Slack, or Email**.

---

## 🚀 Features

- **Automated Feedback Categorization:** Classify feedback by urgency and impact.
- **Pain Point Identification:** Detect recurring issues or critical user concerns.
- **Prioritized Action List:** Suggest actionable tasks for product teams.
- **Multi-Channel Delivery:** Export results to Notion, Slack, or Email.
- **Interactive Frontend:** Visualize feedback insights through a user-friendly dashboard.

---

## 🛠 Tech Stack

- **Backend:** Python (NLP processing, data handling)
- **Frontend:** React.js
- **Database:** MongoDB (feedback storage and user management)
- **Integrations:** Notion, Slack, Email (SMTP)
- **Package Management:** Node.js and npm

---

## ⚡ Installation

### 1. Clone the repository
```bash
git clone https://github.com/AnishaPaturi/FeedForward.git
cd FeedForward


###Backend Setup
cd backend
python -m venv venv
# Activate virtual environment:
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
pip install -r requirements.txt

###Frontend Setup
cd frontend
npm install
npm start
