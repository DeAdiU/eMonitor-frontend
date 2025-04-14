"use client"; // Required for Recharts components

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label // Import Label for axis titles
} from 'recharts';

/**
 * RatingLineChart Component
 *
 * Displays a line chart of rating changes over time.
 *
 * @param {object} props - Component props
 * @param {Array<object>} props.data - Array of data points, e.g., [{ date: 'YYYY-MM-DD', rating: 1500 }, ...]
 */
const RatingLineChart = ({ data }) => {

  // Basic check for data validity
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No rating history data available to display.
      </div>
    );
  }

  // --- Formatters ---

  // Format date ticks on the X-axis (e.g., 'Jan 08')
  const formatDateTick = (tickItem) => {
    try {
      // Assuming tickItem is 'YYYY-MM-DD'
      const dateObj = new Date(tickItem + 'T00:00:00'); // Add time part to avoid timezone issues
      if (isNaN(dateObj.getTime())) { // Check if date is valid
        return tickItem; // Return original if invalid
      }
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit' // Optional: add year if needed
      });
    } catch (e) {
      console.error("Error formatting date tick:", tickItem, e);
      return tickItem; // Fallback to original string on error
    }
  };

  // Format the tooltip label (date)
  const formatTooltipLabel = (label) => {
     try {
      const dateObj = new Date(label + 'T00:00:00');
       if (isNaN(dateObj.getTime())) {
        return label;
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      console.error("Error formatting tooltip label:", label, e);
      return label;
    }
  };


  return (
    // ResponsiveContainer makes the chart adapt to parent size
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30, // More space for Y-axis label if needed
          left: 20, // More space for Y-axis label
          bottom: 20, // More space for angled X-axis labels if needed
        }}
      >
        {/* Grid lines */}
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

        {/* X Axis (Date) */}
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          angle={-30} // Angle ticks slightly if dates are long/numerous
          textAnchor="end" // Adjust anchor for angled text
          height={50} // Increase height to accommodate angled labels
          stroke="#666"
          tick={{ fontSize: 11 }} // Smaller font size for ticks
        />

        {/* Y Axis (Rating) */}
        <YAxis
          dataKey="rating"
          stroke="#666"
          tick={{ fontSize: 11 }}
          // Allow Recharts to determine domain automatically, or specify:
          // domain={['dataMin - 50', 'dataMax + 50']} // Example: add padding
          domain={['auto', 'auto']} // Common setting
        >
           {/* Y Axis Label */}
           <Label value="Rating" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#333' }} />
        </YAxis>

        {/* Tooltip shown on hover */}
        <Tooltip
          labelFormatter={formatTooltipLabel} // Format the date label in tooltip
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', borderRadius: '4px' }}
          itemStyle={{ color: '#3f51b5' }} // Style for the rating line item
          formatter={(value, name) => [`${value}`, "Rating"]} // Format value and name
        />

        {/* Legend to identify the line */}
        <Legend verticalAlign="top" height={36}/>

        {/* The actual line */}
        <Line
          type="monotone" // Makes the line curved; use "linear" for straight lines
          dataKey="rating" // Key from the data array
          name="Rating" // Name shown in Legend and Tooltip
          stroke="#3f51b5" // Line color (e.g., indigo)
          strokeWidth={2}
          activeDot={{ r: 7 }} // Dot appearance on hover/active
          dot={{ r: 3, fill: '#3f51b5' }} // Appearance of dots on the line
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RatingLineChart;