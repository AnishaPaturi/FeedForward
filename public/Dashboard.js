import React, { useEffect, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTable } from "react-table";

export default function Dashboard({ data }) {
  const [scatterData, setScatterData] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Scatter chart mapping
    const mappedScatter = data.map(d => ({
      x: d.Urgency === "Low" ? 1 : d.Urgency === "Medium" ? 2 : 3,
      y: d.Impact === "Low" ? 1 : d.Impact === "Medium" ? 2 : 3,
      z: d.PriorityScore,
      feedback: d.Feedback
    }));
    setScatterData(mappedScatter);
  }, [data]);

  // Table setup
  const columns = React.useMemo(() => [
    { Header: "Feedback", accessor: "Feedback" },
    { Header: "Urgency", accessor: "Urgency" },
    { Header: "Impact", accessor: "Impact" },
    { Header: "Priority Score", accessor: "PriorityScore" },
    { Header: "Summary", accessor: "Summary" },
    { Header: "Source", accessor: "Source" },
    { Header: "Date", accessor: "Date" },
  ], []);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

  return (
    <div className="mt-5">
      <h3>Priority Matrix</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="Urgency" ticks={[1,2,3]} tickFormatter={val => val===1?"Low":val===2?"Medium":"High"} />
          <YAxis type="number" dataKey="y" name="Impact" ticks={[1,2,3]} tickFormatter={val => val===1?"Low":val===2?"Medium":"High"} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Feedback" data={scatterData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>

      <h3 className="mt-5">Detailed Feedback</h3>
      <table {...getTableProps()} className="table table-bordered">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => <th {...column.getHeaderProps()}>{column.render("Header")}</th>)}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => <td {...cell.getCellProps()}>{cell.render("Cell")}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
