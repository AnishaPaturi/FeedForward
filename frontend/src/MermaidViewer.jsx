// frontend/src/MermaidViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

export default function MermaidViewer({ mermaidText }) {
  const ref = useRef();
  const [svg, setSvg] = useState(null);

  useEffect(() => {
    if (!mermaidText) return;
    mermaid.initialize({ startOnLoad: false });
    try {
      mermaid.render("graphDiv", mermaidText, (svgCode) => {
        setSvg(svgCode);
      });
    } catch (err) {
      setSvg(`<pre>${err.message}</pre>`);
    }
  }, [mermaidText]);

  return <div dangerouslySetInnerHTML={{ __html: svg || "<em>Loading diagram...</em>" }} />;
}
