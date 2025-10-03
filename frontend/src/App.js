import React, { useState } from "react";
import Papa from "papaparse";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [feedbackText, setFeedbackText] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [impactFilter, setImpactFilter] = useState("All");

  // Single feedback submit
  const handleFeedbackSubmit = async () => {
    if (!feedbackText) return alert("Please enter feedback");
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/classify?text=${encodeURIComponent(feedbackText)}`
      );
      const data = await res.json();
      setResults([{
        feedback: data.feedback,
        urgency: data.classification.urgency,
        impact: data.classification.impact,
        summary: data.classification.summary,
      }]);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    }
    setLoading(false);
  };

  // CSV upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => setCsvData(results.data),
    });
  };

  // CSV process (parallel requests)
  const handleCsvProcess = async () => {
    if (csvData.length === 0) return alert("No CSV data to process");
    setLoading(true);
    try {
      const fetchPromises = csvData
        .filter(row => row.text)
        .map(row =>
          fetch(`http://127.0.0.1:8000/classify?text=${encodeURIComponent(row.text)}`)
            .then(res => res.json())
            .then(data => ({
              feedback: row.text,
              urgency: data.classification?.urgency || "Medium",
              impact: data.classification?.impact || "Medium",
              summary: data.classification?.summary || "",
            }))
            .catch(() => ({
              feedback: row.text,
              urgency: "Error",
              impact: "Error",
              summary: "Failed to classify",
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

  // Apply filters
  const filteredResults = results.filter(r => 
    (urgencyFilter === "All" || r.urgency === urgencyFilter) &&
    (impactFilter === "All" || r.impact === impactFilter)
  );

  return (
    <div className="container p-4">
      <h1 className="mb-4">Customer Feedback Prioritizer</h1>

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

      {/* Results Cards */}
      {filteredResults.length > 0 && (
        <div className="row">
          {filteredResults.map((r, idx) => (
            <div key={idx} className="col-md-4 mb-3">
              <div className={`card border-${r.urgency === "High" || r.impact === "High" ? "danger" : "secondary"}`}>
                <div className="card-body">
                  <h5 className="card-title">{r.feedback}</h5>
                  <p className="card-text">
                    Urgency: <strong style={{ color: r.urgency === "High" ? "red" : "black" }}>{r.urgency}</strong>
                  </p>
                  <p className="card-text">
                    Impact: <strong style={{ color: r.impact === "High" ? "red" : "black" }}>{r.impact}</strong>
                  </p>
                  <p className="card-text"><em>{r.summary}</em></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && filteredResults.length === 0 && (
        <p>No feedback matches the selected filters.</p>
      )}
    </div>
  );
}

export default App;