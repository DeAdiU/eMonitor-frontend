'use client'
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Chart({ data }) {
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Sort data by count in descending order for better visualization
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  // Get the data for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, endIndex);

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
            <XAxis dataKey="tag" stroke="#4B5EAA" />
            <YAxis stroke="#4B5EAA" />
            <Tooltip />
            <Bar dataKey="count" fill="#6366F1" />
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