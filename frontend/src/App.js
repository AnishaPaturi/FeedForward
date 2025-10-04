import React, { useState, useEffect } from "react";
import Papa from "papaparse";
// import Workflow from "./Workflow";
import AgentWorkflow from "./AgentWorkflow";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [feedbackText, setFeedbackText] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Filters
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [impactFilter, setImpactFilter] = useState("All");

  // --- 🔥 Real Hackathon Quotes (Yours) ---
  const quotes = [
    "Turning feedback chaos into clarity.",
    "My GenAI agent just had its first ‘real conversation’ — and wow, it was interesting.",
    "Day 2 of the AI Agent Hackathon — my Customer Feedback Prioritizer is officially alive!",
    "Making product teams listen smarter, not harder.",
    "From noise to insights — that’s FeedForward AI.",
    "Building agents that don’t just analyze, but understand.",
  ];

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  // Rotate quotes every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => {
        const currentIndex = quotes.indexOf(prev);
        const nextIndex = (currentIndex + 1) % quotes.length;
        return quotes[nextIndex];
      });
    }, 7000);
    return () => clearInterval(interval);
  }, [quotes]);

  // --- Single Feedback Submit ---
  const handleFeedbackSubmit = async () => {
    if (!feedbackText) return alert("Please enter feedback");
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/classify?text=${encodeURIComponent(feedbackText)}`
      );
      const data = await res.json();
      setResults([
        {
          feedback: data.feedback,
          urgency: data.classification.urgency,
          impact: data.classification.impact,
          summary: data.classification.summary,
          reason: data.classification.reason || "",
        },
      ]);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    }
    setLoading(false);
  };

  // --- CSV Upload ---
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => setCsvData(results.data),
    });
  };

  // --- CSV Process ---
  const handleCsvProcess = async () => {
    if (csvData.length === 0) return alert("No CSV data to process");
    setLoading(true);
    try {
      const fetchPromises = csvData
        .filter((row) => row.text)
        .map((row) =>
          fetch(`http://127.0.0.1:8000/classify?text=${encodeURIComponent(row.text)}`)
            .then((res) => res.json())
            .then((data) => ({
              feedback: row.text,
              urgency: data.classification?.urgency || "Medium",
              impact: data.classification?.impact || "Medium",
              summary: data.classification?.summary || "",
              reason: data.classification?.reason || "",
            }))
            .catch(() => ({
              feedback: row.text,
              urgency: "Error",
              impact: "Error",
              summary: "Failed to classify",
              reason: "",
            }))
        );

      const processedResults = await Promise.all(fetchPromises);
      setResults(processedResults);
    } catch (err) {
      console.error(err);
      alert("Error processing CSV");
    }
    setLoading(false);
  };

  // --- Report / Email / Slack Integration ---
  const handleGenerateReport = async (type) => {
    setLoading(true);
    setStatusMessage("");
    try {
      let endpoint = "";
      if (type === "generate") endpoint = "generate_report";
      else if (type === "email")
        endpoint =
          "send_email?sender_email=you@gmail.com&sender_password=APP_PASSWORD&recipient_email=recipient@gmail.com";
      else if (type === "slack")
        endpoint = "send_slack?webhook_url=YOUR_SLACK_WEBHOOK";

      const res = await fetch(`http://127.0.0.1:8000/${endpoint}`);
      const data = await res.json();
      setStatusMessage(data.message || "Action completed");
    } catch (err) {
      console.error(err);
      setStatusMessage("Error performing action: " + err.message);
    }
    setLoading(false);
  };

  // --- Apply Filters ---
  const filteredResults = results.filter(
    (r) =>
      (urgencyFilter === "All" || r.urgency === urgencyFilter) &&
      (impactFilter === "All" || r.impact === impactFilter)
  );

  return (
    <div className="container p-4">
      <h1 className="mb-2 text-center fw-bold">Customer Feedback Prioritizer</h1>

      {/* Rotating Quotes */}
      <blockquote className="blockquote text-center mb-4">
        <p className="mb-0 fs-5 fst-italic">“{currentQuote}”</p>
        <footer className="blockquote-footer mt-1">FeedForward AI Agent</footer>
      </blockquote>

      {/* Single feedback input */}
      <div className="mb-3">
        <label className="form-label">Enter Feedback</label>
        <textarea
          className="form-control"
          rows="3"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={handleFeedbackSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Feedback"}
        </button>
      </div>

      {/* CSV upload */}
      <div className="mb-3">
        <label className="form-label">Upload Feedback CSV</label>
        <input
          type="file"
          className="form-control"
          accept=".csv"
          onChange={handleCsvUpload}
        />
        <button
          className="btn btn-success mt-2"
          onClick={handleCsvProcess}
          disabled={loading}
        >
          {loading ? "Processing..." : "Process CSV"}
        </button>
      </div>

      {/* Report Actions */}
      <div className="mb-3 d-flex gap-2">
        <button
          className="btn btn-info"
          onClick={() => handleGenerateReport("generate")}
          disabled={loading}
        >
          {loading ? "Working..." : "Generate Report"}
        </button>
        <button
          className="btn btn-warning"
          onClick={() => handleGenerateReport("email")}
          disabled={loading}
        >
          {loading ? "Working..." : "Send Email"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => handleGenerateReport("slack")}
          disabled={loading}
        >
          {loading ? "Working..." : "Send Slack"}
        </button>
      </div>

      {statusMessage && (
        <div
          className={`alert ${
            statusMessage.includes("Error") ? "alert-danger" : "alert-success"
          } mt-2`}
        >
          {statusMessage}
        </div>
      )}

      {/* Filters */}
      {results.length > 0 && (
        <div className="mb-3 d-flex gap-3">
          <div>
            <label>Filter by Urgency:</label>
            <select
              className="form-select"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
            >
              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label>Filter by Impact:</label>
            <select
              className="form-select"
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
            >
              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredResults.length > 0 && (
        <div className="row">
          {filteredResults.map((r, idx) => (
            <div key={idx} className="col-md-4 mb-3">
              <div
                className={`card border-${
                  r.urgency === "High" || r.impact === "High"
                    ? "danger"
                    : "secondary"
                }`}
              >
                <div className="card-body">
                  <h5 className="card-title">{r.feedback}</h5>
                  <p className="card-text">
                    Urgency:{" "}
                    <strong
                      style={{
                        color: r.urgency === "High" ? "red" : "black",
                      }}
                    >
                      {r.urgency}
                    </strong>
                  </p>
                  <p className="card-text">
                    Impact:{" "}
                    <strong
                      style={{
                        color: r.impact === "High" ? "red" : "black",
                      }}
                    >
                      {r.impact}
                    </strong>
                  </p>
                  {r.summary && (
                    <p className="card-text">
                      <em>Summary: {r.summary}</em>
                    </p>
                  )}
                  {r.reason && (
                    <p className="card-text">
                      <small>Reason: {r.reason}</small>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && filteredResults.length === 0 && (
        <p>No feedback matches the selected filters.</p>
      )}

      {/* Workflow Visualization */}
      {/* <div className="text-center mt-4">
        <h3>Agentic Workflow Visualization</h3>
        <Workflow />
      </div> */}
      {/* LangGraph Agent Workflow Simulation */}
      <div className="text-center mt-4">
        {/* <h3>Agentic Workflow Execution</h3> */}
        <AgentWorkflow />
      </div>
    </div>
  );
}

export default App;
