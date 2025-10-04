import React from "react";
import ReactFlow, { MiniMap, Controls, Background } from "react-flow-renderer";

const nodeColors = {
  input: "#60a5fa",        // blue
  preprocessing: "#34d399", // green
  classification: "#facc15", // yellow
  ranking: "#a78bfa",      // purple
  output: "#f87171",       // red
  report: "#4ade80",       // light green
};

const nodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Input" },
    position: { x: 50, y: 50 },
    style: { background: nodeColors.input, color: "white", padding: 10, borderRadius: 8 },
  },
  {
    id: "2",
    data: { label: "Preprocessing" },
    position: { x: 250, y: 50 },
    style: { background: nodeColors.preprocessing, color: "black", padding: 10, borderRadius: 8 },
  },
  {
    id: "3",
    data: { label: "LLM Classification" },
    position: { x: 450, y: 50 },
    style: { background: nodeColors.classification, color: "black", padding: 10, borderRadius: 8 },
  },
  {
    id: "4",
    data: { label: "Ranking" },
    position: { x: 650, y: 50 },
    style: { background: nodeColors.ranking, color: "white", padding: 10, borderRadius: 8 },
  },
  {
    id: "5",
    data: { label: "Output" },
    position: { x: 850, y: 50 },
    style: { background: nodeColors.output, color: "white", padding: 10, borderRadius: 8 },
  },
  {
    id: "6",
    type: "output",
    data: { label: "Report Delivery" },
    position: { x: 1050, y: 50 },
    style: { background: nodeColors.report, color: "black", padding: 10, borderRadius: 8 },
  },
];

const edges = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4", animated: true },
  { id: "e4-5", source: "4", target: "5", animated: true },
  { id: "e5-6", source: "5", target: "6", animated: true },
];

function Workflow() {
  return (
    <div style={{ height: 300, border: "1px solid #ddd", borderRadius: 8 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default Workflow;
