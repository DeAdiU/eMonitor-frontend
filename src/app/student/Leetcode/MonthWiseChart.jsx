'use client'
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeekWiseChart({ data }) {
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Convert data to array and sort by week in descending order (latest first)
  const chartData = Object.entries(data)
    .map(([week, submissions]) => ({ week, submissions }))
    .sort((a, b) => b.week.localeCompare(a.week));

  // Calculate total pages
  const totalPages = Math.ceil(chartData.length / ITEMS_PER_PAGE);

  // Get the data for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = chartData.slice(startIndex, endIndex);

  // Handle pagination
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={paginatedData}>
            <XAxis dataKey="week" stroke="#4B5EAA" />
            <YAxis stroke="#4B5EAA" />
            <Tooltip />
            <Bar dataKey="submissions" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}