import json
from datetime import datetime
import os

def generate_report(feedback_list, format="json"):
    """
    Generates weekly feedback report in JSON or Markdown.
    Includes issue, priority, summary, and reason.
    """
    report_date = datetime.now().strftime("%Y-%m-%d")
    report = {
        "week_of": report_date,
        "top_issues": feedback_list
    }

    if format.lower() == "json":
        filename = f"weekly_report_{report_date}.json"
        report_str = json.dumps(report, indent=4)
    elif format.lower() == "md":
        filename = f"weekly_report_{report_date}.md"
        report_str = f"# Weekly Feedback Report ({report_date})\n\n"
        report_str += "| Issue | Urgency | Impact | Summary | Reason |\n|-------|--------|-------|---------|--------|\n"
        for item in feedback_list:
            report_str += f"| {item['issue']} | {item['urgency']} | {item['impact']} | {item['summary']} | {item['reason']} |\n"
    else:
        raise ValueError("Unsupported format. Choose 'json' or 'md'.")

    with open(filename, "w", encoding="utf-8") as f:
        f.write(report_str)

    print(f"Report generated: {filename}")
    return filename
