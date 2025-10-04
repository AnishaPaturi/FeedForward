// frontend/src/AgentWorkflow.jsx
import React, { useEffect, useState } from "react";

const stages = [
  {
    icon: "🟢",
    label: "Input Node",
    message: "Feedback received",
    color: "#4caf50",
  },
  {
    icon: "⚙️",
    label: "Preprocessing Node",
    message: "Cleaning and normalizing text",
    color: "#2196f3",
  },
  {
    icon: "🤖",
    label: "LLM Classification Node",
    message: "Analyzing urgency and impact",
    color: "#9c27b0",
  },
  {
    icon: "⭐",
    label: "Ranking Node",
    message: "Prioritizing feedback",
    color: "#ff9800",
  },
  {
    icon: "📄",
    label: "Output Node",
    message: "Generating final report",
    color: "#f44336",
  },
];

function AgentWorkflow() {
  const [activeStep, setActiveStep] = useState(-1);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let isMounted = true; // prevent double triggers in React Strict Mode

    stages.forEach((stage, i) => {
      setTimeout(() => {
        if (isMounted) {
          setActiveStep(i);
          setLogs((prev) => [
            ...prev,
            `${stage.icon} [${stage.label}] → ${stage.message}`,
          ]);
        }
      }, i * 1500); // speed synced to stage transitions
    });

    setTimeout(() => {
      if (isMounted)
        setLogs((prev) => [...prev, "✅ Workflow complete!"]);
    }, stages.length * 1500 + 500);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className="p-4 rounded shadow-lg mt-4"
      style={{
        background: "linear-gradient(135deg, #f3f4f6 0%, #e3f2fd 100%)",
        border: "1px solid #ddd",
      }}
    >
      <h5 className="mb-4 text-center fw-bold text-primary">
        🧠 Agentic Workflow (LangGraph Simulation)
      </h5>

      {/* === Stages Visualization === */}
      <div className="position-relative mb-4 px-4 d-flex justify-content-between align-items-center">
        {/* Connector line */}
        <div
          className="position-absolute top-50 start-0 w-100"
          style={{
            height: "4px",
            background:
              "linear-gradient(to right, #4caf50, #2196f3, #9c27b0, #ff9800, #f44336)",
            zIndex: 0,
            opacity: 0.35,
          }}
        ></div>

        {stages.map((s, i) => (
          <div
            key={i}
            className="text-center flex-fill"
            style={{ zIndex: 1 }}
          >
            <div
              className="rounded-circle mx-auto mb-2"
              style={{
                width: 75,
                height: 75,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.9em",
                background:
                  i === activeStep
                    ? `radial-gradient(circle at center, ${s.color} 40%, #fff 100%)`
                    : "#d1d5db",
                color: i === activeStep ? "#fff" : "#6b7280",
                boxShadow:
                  i === activeStep
                    ? `0 0 20px ${s.color}, 0 0 40px ${s.color}70`
                    : "0 0 0px transparent",
                transition: "all 0.6s ease",
              }}
            >
              {s.icon}
            </div>
            <small
              style={{
                color: i <= activeStep ? s.color : "#6b7280",
                fontWeight: i <= activeStep ? "600" : "400",
                transition: "color 0.4s ease",
              }}
            >
              {s.label}
            </small>
          </div>
        ))}
      </div>

      {/* === Log Console === */}
      <div
        className="bg-dark text-light p-3 rounded"
        style={{
          height: 160,
          overflowY: "auto",
          fontSize: "0.9em",
          boxShadow: "inset 0 0 12px rgba(0,0,0,0.4)",
        }}
      >
        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              color: log.includes("✅")
                ? "#4caf50"
                : stages[i % stages.length].color,
              animation: "fadeIn 0.5s ease-in-out",
            }}
          >
            {log}
          </div>
        ))}
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default AgentWorkflow;
