// components/CodeforcesStats.jsx (or your preferred path)
"use client";
import { useState, useEffect } from "react";
import StatsCard from "./Statscard"; // Ensure path is correct
import Chart from "./Chart"; // Ensure path is correct
import WeekWiseChart from "./WeekWiseChart"; // Ensure path is correct
import MonthWiseChart from "./MonthWiseChart"; // Ensure path is correct
import RatingChart from "./RatingLineChart"; // Create this component for the rating graph
import { useAuth } from "@/context/AuthContext"; // Ensure path is correct
import axios from "axios";

// Accept id as a prop (student's User ID)
export default function CodeforcesStats({ id }) {
  const { getToken } = useAuth();

  // Define state variables for Codeforces data
  const [profileData, setProfileData] = useState({});
  const [solvedCountsData, setSolvedCountsData] = useState({});
  const [languageDistData, setLanguageDistData] = useState({});
  const [tagDistData, setTagDistData] = useState({});
  const [monthlySubmissionsData, setMonthlySubmissionsData] = useState({});
  const [weeklySubmissionsData, setWeeklySubmissionsData] = useState({});
  const [ratingHistoryData, setRatingHistoryData] = useState([]); // For the graph

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch analytics for a specific student ID
    const fetchStudentAnalytics = async (studentId) => {
      setLoading(true);
      setError(null);
      // Clear previous data when fetching for a new ID
      setProfileData({});
      setSolvedCountsData({});
      setLanguageDistData({});
      setTagDistData({});
      setMonthlySubmissionsData({});
      setWeeklySubmissionsData({});
      setRatingHistoryData([]);

      if (!getToken) {
          setError("Authentication context not ready.");
          setLoading(false);
          return;
      }

      try {
        console.log("Fetching Codeforces analytics for student ID:", studentId);
        const token = await getToken();
        if (!token) {
            setError("Authentication token not available.");
            setLoading(false);
            return;
        }

        // --- API Endpoint for Codeforces ---
        // Ensure this endpoint returns the JSON structure provided in the example
        const response = await axios.get(
          `http://127.0.0.1:8000/api/analytics/mentor/${studentId}/?platform=codeforces`, // Added platform query param
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Codeforces API Response:", response.data);

        // Update state with API response - use fallbacks for safety
        setProfileData(response.data?.profile ?? {});
        setSolvedCountsData(response.data?.solved_counts ?? {});
        setLanguageDistData(response.data?.language_distribution ?? {});
        setTagDistData(response.data?.tag_distribution ?? {});
        setMonthlySubmissionsData(response.data?.submissions_monthly ?? {});
        setWeeklySubmissionsData(response.data?.submissions_weekly ?? {});
        setRatingHistoryData(response.data?.ratings_graph ?? []);

      } catch (err) {
        console.error("Error fetching Codeforces student analytics:", err);
        // Provide a more specific error message
        const errorMsg = err.response?.data?.detail || err.message || "Failed to load Codeforces data for the selected student.";
        setError(errorMsg);
        // Clear data on error
        setProfileData({});
        setSolvedCountsData({});
        setLanguageDistData({});
        setTagDistData({});
        setMonthlySubmissionsData({});
        setWeeklySubmissionsData({});
        setRatingHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    // --- Trigger Fetch Logic ---
    if (id !== null && id !== undefined) {
      fetchStudentAnalytics(id);
    } else {
      // Clear data if no ID is selected
      setLoading(false);
      setError(null);
      setProfileData({});
      setSolvedCountsData({});
      setLanguageDistData({});
      setTagDistData({});
      setMonthlySubmissionsData({});
      setWeeklySubmissionsData({});
      setRatingHistoryData([]);
    }

  }, [id, getToken]); // Re-run effect when id or getToken changes

  // --- Render Logic ---

  // 1. Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div> {/* Changed color for distinction */}
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
  if (id === null || id === undefined) {
    return (
      <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative text-center">
        Please select a student from the dropdown to view their Codeforces stats.
      </div>
    );
  }

  // Helper to safely get values from solvedCountsData
  const getSolvedCount = (difficulty) => solvedCountsData?.[difficulty]?.count ?? 0;
  const getSolvedSubmissions = (difficulty) => solvedCountsData?.[difficulty]?.submissions ?? 0;

  // Prepare data for charts (transform objects/arrays if needed by chart components)
  const tagChartData = Object.entries(tagDistData || {}).map(([tag, count]) => ({ tag, count }));
  // Assuming MonthWiseChart/WeekWiseChart can handle the object format directly or you transform it inside them
  const monthlyChartData = monthlySubmissionsData || {};
  const weeklyChartData = weeklySubmissionsData || {};
  const ratingChartData = ratingHistoryData || []; // Already an array

  // 4. Render the main content
  return (
    <>
      {/* Profile Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
            title="Handle"
            value={profileData?.handle || "N/A"}
            change={profileData?.rank || ""}
        />
        <StatsCard
            title="Rating"
            value={profileData?.rating?.toLocaleString() || "N/A"}
            change={`Max: ${profileData?.maxRating?.toLocaleString() || "N/A"}`}
        />
         <StatsCard
            title="Organization"
            value={profileData?.organization || "N/A"}
            change={`${profileData?.city || ""}, ${profileData?.country || ""}`.replace(/^,|,$/g, '').trim() || ""}
        />
         <StatsCard
            title="Total Solved (Unique)"
            value={getSolvedCount("All")}
            change={`Total AC Submissions: ${getSolvedSubmissions("All")}`}
        />
      </div>

      {/* Solved Counts by Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
         {/* Filter out "All" key before mapping */}
         {Object.keys(solvedCountsData || {}).filter(key => key !== "All").map((difficulty) => (
            <StatsCard
                key={difficulty}
                title={`${difficulty} Solved`}
                value={getSolvedCount(difficulty)}
                change={`Submissions: ${getSolvedSubmissions(difficulty)}`}
            />
         ))}
      </div>

       {/* Language Distribution */}
       <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
         <h2 className="text-lg font-semibold text-indigo-900 mb-4">
           Language Distribution (Unique Solves)
         </h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(languageDistData || {}).map(([lang, count]) => (
                <StatsCard
                    key={lang}
                    title={lang}
                    value={count}
                    change="Problems Solved"
                    smallValue={true} // Optional: make value smaller if needed
                />
            ))}
         </div>
       </div>


      {/* Rating History Chart */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-indigo-900 mb-4">
          Rating History
        </h2>
        {/* Ensure RatingChart handles empty data array */}
        <RatingChart data={ratingChartData} />
      </div>

      {/* Charts for Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-900 mb-4">
            Month-wise Submissions
          </h2>
          {/* Pass the data object */}
          <MonthWiseChart data={monthlyChartData} />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-900 mb-4">
            Week-wise Submissions
          </h2>
           {/* Pass the data object */}
          <WeekWiseChart data={weeklyChartData} />
        </div>
      </div>

      {/* Tag Distribution */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-indigo-900 mb-4">
          Tag Distribution (Unique Solves)
        </h2>
        {/* Pass transformed data */}
        <Chart data={tagChartData} />
      </div>
    </>
  );
}