import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

// Initialize Mermaid
mermaid.initialize({ startOnLoad: true });

export default function Workflow() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.contentLoaded(); // Render the Mermaid graph
    }
  }, []);

  const diagram = `
    graph TD
      A[Input Feedback] --> B[Preprocessing]
      B --> C[LLM Classification]
      C --> D[Ranking & Prioritization]
      D --> E[Dashboard & Reports]
  `;

  return (
    <div className="p-4">
      <div className="mermaid" ref={ref}>
        {diagram}
      </div>
    </div>
  );
}
