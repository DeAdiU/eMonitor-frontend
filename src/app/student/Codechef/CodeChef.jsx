"use client";
import { useState, useEffect } from "react";
import StatsCard from "./Statscard"; // Reusable StatsCard component
// Assuming you have chart components:
import WeekWiseChart from "./WeekWiseChart";
import MonthWiseChart from "./MonthWiseChart";
import RatingLineChart from "./RatingLineChart"; // Assuming you have/create this
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

// Accept id as a prop (student's ID)
export default function Codechef({ id }) {
  const { getToken } = useAuth();

  // --- State Variables for CodeChef Data ---
  const [profileData, setProfileData] = useState({}); // For current/high rating
  const [rankingData, setRankingData] = useState({}); // For ranks
  const [stars, setStars] = useState(""); // For star rating string
  const [monthlySubmissions, setMonthlySubmissions] = useState({}); // Raw monthly data
  const [weeklySubmissions, setWeeklySubmissions] = useState({}); // Raw weekly data
  const [ratingGraphData, setRatingGraphData] = useState([]); // For rating graph
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentCodechefAnalytics = async (studentId) => {
      setLoading(true);
      setError(null);
      // Clear previous data
      setProfileData({});
      setRankingData({});
      setStars("");
      setMonthlySubmissions({});
      setWeeklySubmissions({});
      setRatingGraphData([]);

      if (!getToken) {
        setError("Authentication context not ready.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching CodeChef analytics for student ID:", studentId);
        const token = await getToken();
        if (!token) {
          setError("Authentication token not available.");
          setLoading(false);
          return;
        }

        // --- IMPORTANT: VERIFY THIS API ENDPOINT ---
        // Adjust `/student/${studentId}/` if your API structure is different.
        // Ensure platform=codechef is correct.
        const response = await axios.get(
          `http://127.0.0.1:8000/api/analytics/mentor/${studentId}/?platform=codechef`,
          // OR if using the mentor endpoint: `http://127.0.0.1:8000/api/analytics/mentor/${studentId}/?platform=codechef`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("CodeChef API Response:", response.data);

        // --- Update State with CodeChef Data ---
        setProfileData(response.data?.profile ?? {});
        setRankingData(response.data?.ranking_contest ?? {});
        setStars(response.data?.stars ?? "");
        // Store the submission objects directly first
        setMonthlySubmissions(response.data?.submissions_monthly ?? {});
        setWeeklySubmissions(response.data?.submissions_weekly ?? {});
        setRatingGraphData(response.data?.ratings_graph ?? []);

      } catch (err) {
        console.error("Error fetching CodeChef analytics:", err);
        setError("Failed to load CodeChef data for the selected student.");
        // Clear data on error
        setProfileData({});
        setRankingData({});
        setStars("");
        setMonthlySubmissions({});
        setWeeklySubmissions({});
        setRatingGraphData([]);
      } finally {
        setLoading(false);
      }
    };

    // --- Trigger Fetch Logic ---
    if (id !== null && id !== undefined) {
      fetchStudentCodechefAnalytics(id);
    } else {
      // Clear data if no ID
      setLoading(false);
      setError(null);
      setProfileData({});
      setRankingData({});
      setStars("");
      setMonthlySubmissions({});
      setWeeklySubmissions({});
      setRatingGraphData([]);
    }
  }, [id, getToken]); // Re-run effect when id or getToken changes


  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> {/* Codechef Orange? */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (id === null || id === undefined) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative text-center">
        Please select a student from the dropdown to view their CodeChef stats.
      </div>
    );
  }

  // Check if there's any meaningful data to display
   const hasData = Object.keys(profileData).length > 0 || Object.keys(rankingData).length > 0 || stars || ratingGraphData.length > 0 || monthlySubmissions.length > 0 || weeklySubmissions.length > 0;

   if (!hasData && !loading) { // Ensure not loading before showing no data
       return (
           <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative text-center">
               No CodeChef data found for the selected student.
           </div>
       );
   }

  return (
    <>
      {/* CodeChef Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Current Rating"
          value={profileData?.current_rating?.toLocaleString() || "N/A"}
          change={stars || ""} // Display stars here or separately
        />
         <StatsCard
          title="Highest Rating"
          value={profileData?.high_rating?.toLocaleString() || "N/A"}
          change="Peak Performance"
        />
        <StatsCard
          title="Global Rank"
          value={rankingData?.global_rank?.toLocaleString() || "N/A"}
          change="Overall Standing"
        />
        <StatsCard
          title="Country Rank"
          value={rankingData?.country_rank?.toLocaleString() || "N/A"}
          change="Rank within Country"
        />
        {/* You could add a separate card for stars if preferred */}
        {/* <StatsCard title="Stars" value={stars || "N/A"} change="Current Level" /> */}
      </div>

      {/* Rating Graph */}
      {ratingGraphData.length > 0 && (
         <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">
              Rating History
            </h2>
            {/* Ensure RatingLineChart accepts data in this format */}
            <RatingLineChart data={ratingGraphData} />
         </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-indigo-900 mb-4">
                  Month-wise Submissions
                </h2>
                {/* Pass the specific array, fallback to empty array */}
                <MonthWiseChart data={monthlySubmissions || []} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-indigo-900 mb-4">
                  Week-wise Submissions
                </h2>
                 {/* Pass the specific array, fallback to empty array */}
                <WeekWiseChart data={weeklySubmissions || []} />
              </div>
        </div>
    </>
  );
}