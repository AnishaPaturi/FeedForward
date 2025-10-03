import requests
import os

def send_slack_report(webhook_url, report_path):
    """Send report content to Slack."""
    if not os.path.exists(report_path):
        print(f"Report file {report_path} does not exist")
        return

    with open(report_path, "r", encoding="utf-8") as f:
        report_content = f.read()

    payload = {"text": f"*Weekly Feedback Report:*\n```{report_content}```"}

    try:
        response = requests.post(webhook_url, json=payload)
        response.raise_for_status()
        print("Report sent to Slack successfully")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send report: {e}")
