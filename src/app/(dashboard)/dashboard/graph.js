import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

const ResizableChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.forceUpdate();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          ref={chartRef}
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="0 2" stroke="#45475a08" />

          <Line
            strokeWidth={1.2}
            type="monotone"
            dataKey="sales"
            stroke="#181825"
          />
          <Line
            strokeWidth={1}
            type="monotone"
            dataKey="impressions"
            stroke="#04a5e5"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#7287fd"
            strokeWidth={1}
            strokeDasharray="5 5"
          />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Brush height={20} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResizableChart;
