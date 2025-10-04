import React from "react";

const stages = [
  { key: "input", icon: "🟢", label: "Input Node", color: "#4caf50" },
  { key: "preprocessing", icon: "⚙️", label: "Preprocessing Node", color: "#2196f3" },
  { key: "classification", icon: "🤖", label: "LLM Classification Node", color: "#9c27b0" },
  { key: "ranking", icon: "⭐", label: "Ranking Node", color: "#ff9800" },
  { key: "output", icon: "📄", label: "Output Node", color: "#f44336" },
];

function AgentWorkflow({ nodes }) {
  return (
    <div
      className="p-4 rounded shadow-lg"
      style={{
        background: "linear-gradient(135deg, #f3f4f6 0%, #e3f2fd 100%)",
        border: "1px solid #ddd",
      }}
    >
      <h5 className="mb-4 text-center fw-bold text-primary">
        🧠 Agentic Workflow
      </h5>

      <div className="d-flex justify-content-between align-items-center mb-3">
        {stages.map((s) => (
          <div key={s.key} className="text-center flex-fill">
            <div
              style={{
                width: 75,
                height: 75,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2em",
                background: nodes[s.key] ? s.color : "#d1d5db",
                color: nodes[s.key] ? "#fff" : "#6b7280",
                boxShadow: nodes[s.key] ? `0 0 20px ${s.color}` : "none",
                transition: "all 0.5s ease",
                margin: "0 auto 8px auto",
              }}
            >
              {s.icon}
            </div>
            <small style={{ color: nodes[s.key] ? s.color : "#6b7280" }}>
              {s.label}
            </small>
          </div>
        ))}
      </div>

      {nodes.complete && (
        <p className="text-success fw-bold text-center mt-3">
          ✅ Workflow Complete!
        </p>
      )}
    </div>
  );
}

export default AgentWorkflow;
