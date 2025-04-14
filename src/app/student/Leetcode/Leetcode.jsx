"use client";
import { useState, useEffect } from "react";
import StatsCard from "./Statscard"; // Ensure path is correct
import Chart from "./Chart"; // Ensure path is correct
import WeekWiseChart from "./WeekWiseChart"; // Ensure path is correct
import MonthWiseChart from "./MonthWiseChart"; // Ensure path is correct
import { useAuth } from "@/context/AuthContext"; // Ensure path is correct
import axios from "axios";
// Removed unused import: import { set } from "react-hook-form";

// Accept id as a prop
export default function Leetcode({ id }) {
  const { getToken } = useAuth();

  // Define state variables
  const [difficultyData, setDifficultyData] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [rankingData, setRankingData] = useState({});
  const [languageData, setLanguageData] = useState([]);
  const [tagData, setTagData] = useState({});
  const [problemData, setProblemData] = useState([]);
  const [submissionData, setSubmissionData] = useState({}); // Keep as object
  const [loading, setLoading] = useState(false); // Start false, true only during fetch
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch analytics for a specific student ID
    const fetchStudentAnalytics = async (studentId) => {
      setLoading(true); // Set loading true when fetch starts
      setError(null);
      // Optionally clear previous data here if desired
      // setDifficultyData([]); setRankingData({}); etc.

      if (!getToken) {
          setError("Authentication context not ready.");
          setLoading(false);
          return;
      }

      try {
        console.log("Fetching LeetCode analytics for student ID:", studentId); // Log the ID being used
        const token = await getToken();
        if (!token) {
            setError("Authentication token not available.");
            setLoading(false);
            return;
        }

        // --- IMPORTANT: VERIFY THIS API ENDPOINT ---
        // This endpoint MUST accept the student ID to fetch their specific data.
        // Replace `/student/${studentId}/` with your actual API structure if different.
        const response = await axios.get(
          `http://127.0.0.1:8000/api/analytics/mentor/${studentId}/?platform=leetcode`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("API Response:", response.data); // Log the response

        // Update state with API response - use fallbacks
        setDifficultyData(response.data?.profile ?? []);
        setRatingData(response.data?.ranking_contest ?? []);
        setRankingData(response.data?.ranking_contest ?? {});
        setLanguageData(response.data?.language_distribution ?? []);
        setTagData(response.data?.topic_distribution ?? {});
        setProblemData(response.data?.problem_distribution ?? []);
        setSubmissionData(response.data?.recent_submissions ?? {}); // Assign the sub-object or empty object

      } catch (err) {
        console.error("Error fetching student analytics:", err);
        setError("Failed to load LeetCode data for the selected student.");
        // Clear data on error
        setDifficultyData([]);
        setRatingData([]);
        setRankingData({});
        setLanguageData([]);
        setTagData({});
        setProblemData([]);
        setSubmissionData({});
      } finally {
        setLoading(false); // Set loading false when fetch finishes or fails
      }
    };

    // --- Trigger Fetch Logic ---
    // Only fetch if a valid ID is provided
    if (id !== null && id !== undefined) {
      fetchStudentAnalytics(id);
    } else {
      // If ID is null (no selection), clear data and ensure not loading/error
      setLoading(false);
      setError(null);
      setDifficultyData([]);
      setRatingData([]);
      setRankingData({});
      setLanguageData([]);
      setTagData({});
      setProblemData([]);
      setSubmissionData({});
    }

    // Add id and getToken to dependency array
  }, [id, getToken]); // Re-run effect when id or getToken changes

  // --- Render Logic ---

  // 1. Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Show error message
  if (error) {
      return (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
          </div>
      );
  }

  // 3. Show message if no student is selected
  // This check MUST come *after* loading and error checks
  if (id === null || id === undefined) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative text-center">
        Please select a student from the dropdown to view their LeetCode stats.
      </div>
    );
  }

  // 4. Render the main content if loaded, no error, and ID is present
  return (
    <>
      {/* Difficulty Stats */}
      {/* Render unconditionally - assumes StatsCard handles empty data or API guarantees structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {difficultyData.map((item) => (
          <StatsCard
            key={item.difficulty}
            title={`${item.difficulty} Problems`}
            // Use nullish coalescing for safety if count/submissions might be missing
            value={`${item.count ?? 0} / ${item.submissions ?? 0}`}
            change={`Solved / Submitted`}
          />
        ))}
      </div>

      {/* Ranking and Language Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Ranking"
          value={rankingData?.ranking?.toLocaleString() || "N/A"}
          change={rankingData?.contest_badge ? `Badge: ${rankingData.contest_badge}` : "No Badge"}
        />
        {languageData.map((lang) => (
          <StatsCard
            key={lang.languageName}
            title={`${lang.languageName} Solved`}
            value={lang.problemsSolved ?? 0} // Use nullish coalescing
            change="Problems Solved"
          />
        ))}
      </div>

      {/* Charts for Submissions */}
      {/* Render unconditionally - assumes Chart components handle potentially missing/empty data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-900 mb-4">
            Month-wise Submissions
          </h2>
          {/* Pass the specific array, fallback to empty array */}
          <MonthWiseChart data={submissionData?.monthly_submissions || []} />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-900 mb-4">
            Week-wise Submissions
          </h2>
           {/* Pass the specific array, fallback to empty array */}
          <WeekWiseChart data={submissionData?.weekly_submissions || []} />
        </div>
      </div>

      {/* Tag Distribution */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-indigo-900 mb-4">
          Tag Distribution
        </h2>
        {/* Ensure Chart handles empty tagData object gracefully */}
        <Chart data={Object.entries(tagData || {}).map(([tag, count]) => ({ tag, count }))} />
      </div>
    </>
  );
}