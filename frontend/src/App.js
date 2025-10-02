import React, { useState } from "react";
import Papa from "papaparse";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [feedbackText, setFeedbackText] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [results, setResults] = useState([]);

  // Handle single feedback submit
  const handleFeedbackSubmit = async () => {
    if (!feedbackText) return alert("Please enter feedback");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/classify?text=${encodeURIComponent(feedbackText)}`
      );
      const data = await res.json();
      setResults([{
        feedback: data.feedback,
        urgency: data.classification.urgency,
        impact: data.classification.impact,
      }]);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    }
  };

  // Handle CSV upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  // Process CSV feedbacks
  const handleCsvProcess = async () => {
    if (csvData.length === 0) return alert("No CSV data to process");

    try {
      const processedResults = [];
      for (let row of csvData) {
        if (!row.text) continue; // skip empty rows
        const res = await fetch(
          `http://127.0.0.1:8000/classify?text=${encodeURIComponent(row.text)}`
        );
        const data = await res.json();
        processedResults.push({
          feedback: row.text,
          urgency: data.classification?.urgency || "medium",
          impact: data.classification?.impact || "medium",
        });
      }
      setResults(processedResults);
    } catch (err) {
      console.error(err);
      alert("Error processing CSV");
    }
  };

  return (
    <div className="container p-4">
      <h1 className="mb-4">Customer Feedback Prioritizer</h1>

      {/* Feedback Input */}
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
        >
          Submit Feedback
        </button>
      </div>

      {/* CSV Upload */}
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
        >
          Process CSV
        </button>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="mt-4">
          <h3>Results</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Feedback</th>
                <th>Urgency</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.feedback}</td>
                  <td>{r.urgency}</td>
                  <td>{r.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
