// components/MentorDashboard.jsx (or your file name)
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Use shadcn Progress
import { PlusCircle, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { CreateAssignmentDialog } from './createAssignment'; // Assuming path is correct
import { useDisclosure } from '@/hooks/useDisclosure'; // Assuming path is correct
import { useAuth } from '@/context/AuthContext'; // Assuming path is correct
import axios from 'axios';
import { toast } from "sonner";
import { format, parseISO } from 'date-fns'; // For formatting date

export default function MentorDashboard() {
  const router = useRouter();
  const { isOpen: isDialogOpen, onOpen: onOpenDialog, onClose: onCloseDialog } = useDisclosure();
  const { getToken } = useAuth();

  // State for assessments, loading, and errors
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState(null);

  // Function to fetch assessments
  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching mentor assessments...");

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available.");
      }

      const response = await axios.get('http://127.0.0.1:8000/api/mentor-assessments/', { // Use your actual API endpoint
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API Response:", response.data);
      setAssessments(response.data || []); // Ensure it's always an array

    } catch (err) {
      console.error("Failed to fetch assessments:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Could not load assessments.";
      setError(errorMessage);
      toast.error(`Failed to load assessments: ${errorMessage}`); // Error toast
      setAssessments([]); // Clear assessments on error
    } finally {
      setIsLoading(false);
    }
  }, [getToken]); // Dependency: getToken

  // Fetch assessments on component mount
  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]); // Dependency: the fetch function itself

  // Function to handle successful assignment creation (to refresh list)
  const handleAssignmentCreated = () => {
    onCloseDialog(); // Close the dialog
    toast.info("Refreshing assessment list..."); // Inform user
    fetchAssessments(); // Re-fetch the data
  };

  // Calculate progress percentage safely
  const calculateProgress = (submitted, total) => {
    if (total === 0 || submitted === 0) {
      return 0;
    }
    return Math.round((submitted / total) * 100);
  };

  return (
    <div className="container mx-auto p-6"> {/* Removed justify-center */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-900">Mentor Dashboard</h1>
        <Button
          onClick={onOpenDialog}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Create Assignment
        </Button>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-indigo-800">Your Assessments</h2>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center text-gray-500 py-10">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading assessments...
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
             <AlertTriangle className="mr-2 h-5 w-5" />
            <span className="block sm:inline">{error}</span>
             <Button variant="outline" size="sm" onClick={fetchAssessments} className="ml-auto border-red-300 text-red-700 hover:bg-red-100">
                Retry
             </Button>
          </div>
        )}

        {/* Content: No Assessments */}
        {!isLoading && !error && assessments.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            <p>You haven't created any assessments yet.</p>
            <Button variant="link" onClick={onOpenDialog} className="text-indigo-600">
              Create your first assignment
            </Button>
          </div>
        )}

        {/* Content: Assessments Grid */}
        {!isLoading && !error && assessments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((assessment) => {
              // Safely parse and format the deadline
              let formattedDueDate = "Invalid Date";
              try {
                // Assuming assessment.deadline is like "2025-04-15 23:59" or ISO string
                // Adjust parsing if the format is different
                const dateObj = parseISO(assessment.deadline); // Use parseISO for robust parsing
                if (isValid(dateObj)) {
                    formattedDueDate = format(dateObj, 'yyyy-MM-dd'); // Format as YYYY-MM-DD
                }
              } catch (e) {
                console.warn(`Could not parse date: ${assessment.deadline}`, e);
              }

              const progress = calculateProgress(
                assessment.submitted_students_count,
                assessment.total_assigned_students
              );

              return (
                <Card
                  key={assessment.id}
                  className="hover:shadow-lg transition-shadow bg-indigo-50 border-indigo-100 flex flex-col" // Added flex flex-col
                  // onClick={() => router.push(`/assessment/${assessment.id}`)} // Keep navigation if needed
                >
                  <CardHeader className="bg-indigo-50 rounded-t-lg pb-2"> {/* Reduced padding */}
                    <CardTitle className="text-indigo-700">{assessment.title}</CardTitle>
                    <CardDescription>Due: {formattedDueDate}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow"> {/* Added flex-grow */}
                    <p className="text-sm text-gray-600 mb-2">
                      Submissions: {assessment.submitted_students_count} / {assessment.total_assigned_students}
                    </p>
                    <Progress value={progress} className="h-2.5" indicatorClassName="bg-indigo-600"/>
                  </CardContent>
                  <CardFooter className="border-t border-indigo-100 bg-indigo-50 rounded-b-lg mt-auto"> {/* Added mt-auto */}
                    <Button
                      variant="ghost"
                      className="w-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                       onClick={(e) => {
                           e.stopPropagation(); // Prevent card click if button is clicked
                           router.push(`/assessment/${assessment.id}`); // Navigate on button click
                       }}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Pass the success handler to the dialog */}
      <CreateAssignmentDialog
        isOpen={isDialogOpen}
        onClose={() => {
            onCloseDialog();
            // Optionally trigger refresh even if closed manually without saving
            // fetchAssessments();
        }}
        // Add a prop like onAssignmentCreated to your Dialog if you want to trigger refresh *only* on successful save
        // For simplicity now, we'll refresh via the handleAssignmentCreated function called manually after success
        // If your CreateAssignmentDialog calls onClose() internally after successful submit, this setup works.
        // If not, you might need to pass fetchAssessments down or use a more robust state management.
      />
    </div>
  );
}

// Helper function to check if a date object is valid
function isValid(date) {
  return date instanceof Date && !isNaN(date);
}