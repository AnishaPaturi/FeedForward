import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import AgentWorkflow from "./AgentWorkflow";
import "bootstrap/dist/css/bootstrap.min.css";

// Default quotes (can replace with API later)
const defaultQuotes = [
  "Feedback is the breakfast of champions.",
  "Your most unhappy customers are your greatest source of learning.",
  "Listening to feedback is the key to growth.",
  "The customer’s perception is your reality.",
];

function App() {
  const [feedbackText, setFeedbackText] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  // Filters
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [impactFilter, setImpactFilter] = useState("All");

  // Workflow node states
  const [workflowNodes, setWorkflowNodes] = useState({
    input: false,
    preprocessing: false,
    classification: false,
    ranking: false,
    output: false,
    complete: false,
  });

  // Display random quote on load
  useEffect(() => {
    const quote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
    setInsight(quote);
  }, []);

  // --- Single Feedback Submit ---
  const handleFeedbackSubmit = async () => {
    if (!feedbackText) return alert("Please enter feedback");
    setLoading(true);

    // Reset workflow
    setWorkflowNodes({
      input: true,
      preprocessing: false,
      classification: false,
      ranking: false,
      output: false,
      complete: false,
    });

    try {
      await new Promise((res) => setTimeout(res, 1000));
      setWorkflowNodes((prev) => ({ ...prev, preprocessing: true }));

      await new Promise((res) => setTimeout(res, 1500));
      setWorkflowNodes((prev) => ({ ...prev, classification: true }));

      const res = await fetch(
        `http://127.0.0.1:8000/classify?text=${encodeURIComponent(feedbackText)}`
      );
      const data = await res.json();

      await new Promise((res) => setTimeout(res, 1500));
      setWorkflowNodes((prev) => ({ ...prev, ranking: true }));

      const newResult = {
        feedback: data.feedback,
        urgency: data.classification.urgency,
        impact: data.classification.impact,
        summary: data.classification.summary,
        reason: data.classification.reason || "",
      };
      setResults([newResult]);

      await new Promise((res) => setTimeout(res, 1000));
      setWorkflowNodes((prev) => ({ ...prev, output: true, complete: true }));
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
      setWorkflowNodes((prev) => ({ ...prev, complete: false }));
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

    setWorkflowNodes({
      input: true,
      preprocessing: false,
      classification: false,
      ranking: false,
      output: false,
      complete: false,
    });

    try {
      await new Promise((res) => setTimeout(res, 1000));
      setWorkflowNodes((prev) => ({ ...prev, preprocessing: true }));

      await new Promise((res) => setTimeout(res, 1500));
      setWorkflowNodes((prev) => ({ ...prev, classification: true }));

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

      await new Promise((res) => setTimeout(res, 1500));
      setWorkflowNodes((prev) => ({ ...prev, ranking: true }));

      setResults(processedResults);
      await new Promise((res) => setTimeout(res, 1000));
      setWorkflowNodes((prev) => ({ ...prev, output: true, complete: true }));
    } catch (err) {
      console.error(err);
      alert("Error processing CSV");
      setWorkflowNodes((prev) => ({ ...prev, complete: false }));
    }

    setLoading(false);
  };

  // --- Generate Insights ---
  const handleGenerateInsight = async () => {
    setInsightLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/generate_insights`);
      const data = await res.json();
      setInsight(data.insight || "No insights generated");
    } catch (err) {
      console.error(err);
      setInsight("Error generating insights");
    }
    setInsightLoading(false);
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

      {/* Quote / Insight */}
      {insight && (
        <div className="alert alert-info text-center">
          <em>💡 {insight}</em>
        </div>
      )}

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

      {/* Generate Insights */}
      <div className="mb-3">
        <button
          className="btn btn-info"
          onClick={handleGenerateInsight}
          disabled={insightLoading}
        >
          {insightLoading ? "Generating..." : "Generate Insights"}
        </button>
      </div>

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
                  r.urgency === "High" || r.impact === "High" ? "danger" : "secondary"
                }`}
              >
                <div className="card-body">
                  <h5 className="card-title">{r.feedback}</h5>
                  <p className="card-text">
                    Urgency:{" "}
                    <strong style={{ color: r.urgency === "High" ? "red" : "black" }}>
                      {r.urgency}
                    </strong>
                  </p>
                  <p className="card-text">
                    Impact:{" "}
                    <strong style={{ color: r.impact === "High" ? "red" : "black" }}>
                      {r.impact}
                    </strong>
                  </p>
                  {r.summary && <p className="card-text"><em>Summary: {r.summary}</em></p>}
                  {r.reason && <p className="card-text"><small>Reason: {r.reason}</small></p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Visualization */}
      <div className="text-center mt-4">
        <AgentWorkflow nodes={workflowNodes} />
      </div>
    </div>
  );
}

export default App;
