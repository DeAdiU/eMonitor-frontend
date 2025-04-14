// components/CustomRatingTooltip.jsx
import React from 'react';
import { format, isValid } from 'date-fns'; // Import isValid

const CustomRatingTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;

    // --- Robust Date Formatting ---
    let formattedDate = 'N/A';
    // 1. Check if label is a valid number type
    if (typeof label === 'number' && !isNaN(label)) {
        try {
            // 2. Create Date object (multiply by 1000 for milliseconds)
            const dateObject = new Date(label * 1000);
            // 3. Check if the created Date object is valid
            if (isValid(dateObject)) {
                formattedDate = format(dateObject, 'PPpp'); // 'PPpp' gives date and time
            } else {
                console.warn("CustomRatingTooltip: Invalid Date object created from label:", label);
            }
        } catch (error) {
            // Catch potential errors during Date creation/formatting (less likely here)
            console.error("CustomRatingTooltip: Error formatting date:", error, "Label:", label);
        }
    } else {
        // Log if the label received is not a valid number
        console.warn("CustomRatingTooltip: Received invalid label type for date formatting:", label, typeof label);
    }
    // --- End Robust Date Formatting ---


    return (
      <div className="custom-tooltip bg-white/90 backdrop-blur-sm p-3 border border-gray-300 rounded shadow-lg text-sm">
        <p className="label font-semibold text-gray-800 mb-1">{formattedDate}</p>
        <p className="intro text-indigo-700 font-medium">{`Rating: ${dataPoint.newRating ?? 'N/A'}`}</p> {/* Added nullish check */}
        <p className="desc text-gray-600">{`Rank: ${dataPoint.rank ?? 'N/A'}`}</p> {/* Added nullish check */}
        <p className="desc text-gray-600">{`Contest: ${dataPoint.contestName || 'N/A'} (ID: ${dataPoint.contestId ?? 'N/A'})`}</p> {/* Added nullish check */}
      </div>
    );
  }

  return null;
};

export default CustomRatingTooltip;