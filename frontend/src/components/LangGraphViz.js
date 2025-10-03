import React from "react";
import ReactFlow, { MiniMap, Controls } from "react-flow-renderer";

const nodes = [
  { id: '1', data: { label: 'Input Feedback' }, position: { x: 0, y: 0 } },
  { id: '2', data: { label: 'Preprocessing' }, position: { x: 200, y: 0 } },
  { id: '3', data: { label: 'LLM Classification' }, position: { x: 400, y: 0 } },
  { id: '4', data: { label: 'Ranking & Prioritization' }, position: { x: 600, y: 0 } },
  { id: '5', data: { label: 'Dashboard & Reports' }, position: { x: 800, y: 0 } },
];

const edges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
];

export default function LangGraphViz() {
  return (
    <div style={{ height: 300, border: '1px solid #ccc' }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
