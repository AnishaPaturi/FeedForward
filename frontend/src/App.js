import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import AgentWorkflow from "./AgentWorkflow";
import "bootstrap/dist/css/bootstrap.min.css";

// Charts
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Table
import { useTable } from "react-table";

// Quotes array
const quotes = [
  "Feedback is the breakfast of champions.",
  "Your most unhappy customers are your greatest source of learning.",
  "Listening to feedback is the key to growth.",
  "The customer’s perception is your reality.",
  "Great feedback creates great products.",
  "The key to success is listening to your users.",
  "Every feedback is an opportunity to improve.",
  "Criticism is the roadmap to excellence.",
  "Customer insight drives innovation.",
  "Feedback is the gift you give to your future self.",
  "Act on feedback before it acts on you.",
  "The voice of the customer is the ultimate guide.",
  "Feedback ignored is opportunity wasted.",
  "Customer complaints are gold in disguise.",
  "Small improvements from feedback create huge results.",
];

// Mapping for Priority Score
const getPriorityScore = (urgency, impact) => {
  const urgencyScore = urgency === "High" ? 3 : urgency === "Medium" ? 2 : 1;
  const impactScore = impact === "High" ? 3 : impact === "Medium" ? 2 : 1;
  return urgencyScore * impactScore;
};

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

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setInsight(randomQuote);
    }, 5000); // 5 seconds

    return () => clearInterval(interval); // cleanup
  }, []);

  // --- Single Feedback Submit ---
  const handleFeedbackSubmit = async () => {
    if (!feedbackText) return alert("Please enter feedback");
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

      const res = await fetch(
        `http://127.0.0.1:8000/classify?text=${encodeURIComponent(feedbackText)}`
      );
      const data = await res.json();

      await new Promise((res) => setTimeout(res, 1500));
      setWorkflowNodes((prev) => ({ ...prev, ranking: true }));

      setResults((prevResults) => [
        ...prevResults,
        {
          feedback: data.feedback,
          urgency: data.classification.urgency,
          impact: data.classification.impact,
          summary: data.classification.summary,
          reason: data.classification.reason || "",
          Source: "Manual",
          Date: new Date().toLocaleDateString(),
          PriorityScore: Math.floor(Math.random() * 10) + 1,
        },
      ]);

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
          fetch(
            `http://127.0.0.1:8000/classify?text=${encodeURIComponent(row.text)}`
          )
            .then((res) => res.json())
            .then((data) => ({
              feedback: row.text,
              urgency: data.classification?.urgency || "Medium",
              impact: data.classification?.impact || "Medium",
              summary: data.classification?.summary || "",
              reason: data.classification?.reason || "",
              PriorityScore: getPriorityScore(
                data.classification?.urgency || "Medium",
                data.classification?.impact || "Medium"
              ),
              Source: data.classification?.source || "CSV",
              Date: row.Date || new Date().toLocaleDateString(),
            }))
            .catch(() => ({
              feedback: row.text,
              urgency: "Error",
              impact: "Error",
              summary: "Failed to classify",
              reason: "",
              PriorityScore: 0,
              Source: "CSV",
              Date: row.Date || new Date().toLocaleDateString(),
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

  // // --- Generate Insights ---
  // const handleGenerateInsight = async () => {
  //   setInsightLoading(true);
  //   try {
  //     const res = await fetch(`http://127.0.0.1:8000/generate_insights`);
  //     const data = await res.json();
  //     setInsight(data.insight || "No insights generated");
  //   } catch (err) {
  //     console.error(err);
  //     setInsight("Error generating insights");
  //   }
  //   setInsightLoading(false);
  // };

  // --- Apply Filters ---
  const filteredResults = results.filter(
    (r) =>
      (urgencyFilter === "All" || r.urgency === urgencyFilter) &&
      (impactFilter === "All" || r.impact === impactFilter)
  );

  // --- Dashboard Data ---
  const scatterData = filteredResults.map((d) => ({
    x: d.urgency === "Low" ? 1 : d.urgency === "Medium" ? 2 : 3,
    y: d.impact === "Low" ? 1 : d.impact === "Medium" ? 2 : 3,
    z: d.PriorityScore,
    feedback: d.feedback,
  }));

  // Table setup
  const columns = React.useMemo(
    () => [
      { Header: "Feedback", accessor: "feedback" },
      { Header: "Urgency", accessor: "urgency" },
      { Header: "Impact", accessor: "impact" },
      { Header: "Priority Score", accessor: "PriorityScore" },
      { Header: "Summary", accessor: "summary" },
      { Header: "Source", accessor: "Source" },
      { Header: "Date", accessor: "Date" },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: filteredResults,
    });

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

      {/* Weekly Report & Integrations */}
      <div className="mb-3 d-flex gap-2">
        <button
          className="btn btn-warning"
          onClick={async () => {
            try {
              const res = await fetch("http://127.0.0.1:8000/generate_report");
              const data = await res.json();
              alert(`Report generated: ${data.file}`);
            } catch (err) {
              console.error(err);
              alert("Error generating report");
            }
          }}
        >
          Generate Weekly Report
        </button>

        <button
          className="btn btn-info"
          onClick={async () => {
            const webhookUrl = prompt("Enter your Slack webhook URL:");
            if (!webhookUrl) return;
            try {
              const res = await fetch(
                `http://127.0.0.1:8000/send_slack?webhook_url=${encodeURIComponent(
                  webhookUrl
                )}`
              );
              const data = await res.json();
              alert(data.message);
            } catch (err) {
              console.error(err);
              alert("Error sending report to Slack");
            }
          }}
        >
          Send Report to Slack
        </button>

        <button
          className="btn btn-success"
          onClick={async () => {
            const sender = prompt("Enter your email:");
            const password = prompt("Enter your email password:");
            const recipient = prompt("Enter recipient email:");
            if (!sender || !password || !recipient) return;

            try {
              const url = `http://127.0.0.1:8000/send_email?sender_email=${encodeURIComponent(
                sender
              )}&sender_password=${encodeURIComponent(
                password
              )}&recipient_email=${encodeURIComponent(recipient)}`;
              const res = await fetch(url);
              const data = await res.json();
              alert(data.message);
            } catch (err) {
              console.error(err);
              alert("Error sending report via Email");
            }
          }}
        >
          Send Report via Email
        </button>
      </div>


      {/* Generate Insights */}
      {/* <div className="mb-3">
        <button
          className="btn btn-info"
          onClick={handleGenerateInsight}
          disabled={insightLoading}
        >
          {insightLoading ? "Generating..." : "Generate Insights"}
        </button>
      </div> */}

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard */}
      {filteredResults.length > 0 && (
        <>
          <h3 className="mt-5">Priority Matrix (Scatter Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="x"
                name="Urgency"
                ticks={[1, 2, 3]}
                tickFormatter={(val) => (val === 1 ? "Low" : val === 2 ? "Medium" : "High")}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Impact"
                ticks={[1, 2, 3]}
                tickFormatter={(val) => (val === 1 ? "Low" : val === 2 ? "Medium" : "High")}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Feedback" data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>

          <h3 className="mt-5">Detailed Feedback Table</h3>
          <table {...getTableProps()} className="table table-bordered">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {/* Workflow Visualization */}
      <div className="text-center mt-4">
        <AgentWorkflow nodes={workflowNodes} />
      </div>
    </div>
  );
}

export default App;
