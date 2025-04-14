// app/assessment/[id]/page.jsx (or your file structure)
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Use useParams for route params
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { PlusCircle, Filter, Loader2, AlertTriangle, ExternalLink, Edit, Trash2, Check } from "lucide-react"; // Added icons
import { AddQuestionDialog } from '../addQuestion'; // Adjust path if needed
import { AutoSelectQuestionsDialog } from '../autoSelectQues'; // Adjust path if needed
import { useDisclosure } from '@/hooks/useDisclosure'; // Adjust path if needed
import { useAuth } from '@/context/AuthContext'; // Adjust path if needed
import axios from 'axios';
import { toast } from "sonner";
import { format, parseISO, isValid } from 'date-fns'; // For formatting date
import Link from 'next/link'; // For external links

// Helper function to format status/verdict
const formatStatus = (status, verdict) => {
    if (status === 'EVALUATED') {
        if (verdict === 'OK') return { text: 'Solved', color: 'bg-green-100 text-green-800' };
        if (verdict === 'WRONG_ANSWER') return { text: 'Wrong Answer', color: 'bg-red-100 text-red-800' };
        if (verdict === 'TIME_LIMIT_EXCEEDED') return { text: 'TLE', color: 'bg-yellow-100 text-yellow-800' };
        if (verdict === 'MEMORY_LIMIT_EXCEEDED') return { text: 'MLE', color: 'bg-yellow-100 text-yellow-800' };
        if (verdict === 'COMPILATION_ERROR') return { text: 'Compile Error', color: 'bg-gray-100 text-gray-800' };
        return { text: verdict || 'Evaluated', color: 'bg-blue-100 text-blue-800' }; // Fallback for other verdicts
    }
    if (status === 'PENDING_EVALUATION') return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    if (status === 'ERROR') return { text: 'Eval Error', color: 'bg-red-100 text-red-800' };
    // Default: NOT_ATTEMPTED or unknown
    return { text: 'Not Attempted', color: 'bg-gray-100 text-gray-800' };
};

export default function AssignmentDetailsPage() {
  const router = useRouter();
  const params = useParams(); // Get route parameters
  const assignmentId = params?.id; // Extract the id

  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("questions");
  const { isOpen: isAddQuestionOpen, onOpen: onAddQuestionOpen, onClose: onAddQuestionClose } = useDisclosure();
  const { isOpen: isAutoSelectOpen, onOpen: onAutoSelectOpen, onClose: onAutoSelectClose } = useDisclosure();

  // State for fetched data
  const [assignmentTitle, setAssignmentTitle] = useState(''); // Store title separately
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState(null); // Can be null initially

  // Loading states
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // Error states
  const [errorQuestions, setErrorQuestions] = useState(null);
  const [errorSubmissions, setErrorSubmissions] = useState(null);
  const [errorResults, setErrorResults] = useState(null);

  // --- Data Fetching Functions ---
  const fetchData = useCallback(async (endpoint, setData, setIsLoading, setError, dataKey = null) => {
    if (!assignmentId) return; // Don't fetch if ID is missing

    setIsLoading(true);
    setError(null);
    let fetchedData = null; // To store data before setting state

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available.");

      const response = await axios.get(`http://127.0.0.1:8000/api/assessments/${assignmentId}/${endpoint}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchedData = response.data; // Store fetched data
      setData(fetchedData || (dataKey ? {} : [])); // Set state, default to empty array/object

      // Attempt to set assignment title from the first successful fetch that contains it
      if (!assignmentTitle) {
          if (endpoint === 'questions' && fetchedData?.length > 0 && fetchedData[0].assessment_title) {
              setAssignmentTitle(fetchedData[0].assessment_title);
          } else if (endpoint === 'submissions' && fetchedData?.length > 0 && fetchedData[0].assessment_title) {
              setAssignmentTitle(fetchedData[0].assessment_title);
          }
      }


    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err);
      const errorMessage = err.response?.data?.detail || err.message || `Could not load ${endpoint}.`;
      setError(errorMessage);
      toast.error(`Failed to load ${endpoint}: ${errorMessage}`);
      setData(dataKey ? {} : []); // Clear data on error
    } finally {
      setIsLoading(false);
    }
    return fetchedData; // Return fetched data for potential chaining
  }, [assignmentId, getToken, assignmentTitle]); // Include assignmentTitle to prevent re-setting it unnecessarily

  const fetchQuestions = useCallback(() => fetchData('questions', setQuestions, setIsLoadingQuestions, setErrorQuestions), [fetchData]);
  const fetchSubmissions = useCallback(() => fetchData('submissions', setSubmissions, setIsLoadingSubmissions, setErrorSubmissions), [fetchData]);
  const fetchResults = useCallback(() => fetchData('results', setResults, setIsLoadingResults, setErrorResults, 'results'), [fetchData]); // Pass dataKey for object state

  // --- Initial Data Load ---
  useEffect(() => {
    if (assignmentId) {
      console.log("Assignment ID:", assignmentId);
      // Fetch all data initially
      fetchQuestions();
      fetchSubmissions();
      fetchResults();
    } else {
        // Handle missing ID - maybe redirect or show error
        toast.error("Assignment ID not found in URL.");
        router.push('/assessment'); // Redirect back
    }
  }, [assignmentId, fetchQuestions, fetchSubmissions, fetchResults, router]); // Dependencies

  // --- Helper for rendering loading/error/empty states ---
  const renderContent = (isLoading, error, data, dataKey, emptyMessage, renderTable) => {
    if (isLoading) {
      return <div className="flex items-center justify-center text-gray-500 py-10"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading...</div>;
    }
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span className="block sm:inline">{error}</span>
          {/* Add retry button if needed */}
        </div>
      );
    }
    const hasData = dataKey ? data && Object.keys(data).length > 0 : data && data.length > 0;
    if (!hasData) {
      return <div className="text-center text-gray-500 py-10">{emptyMessage}</div>;
    }
    return renderTable();
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available.");

      await axios.delete(`http://127.0.0.1:8000/api/assessments/${assignmentId}/remove_question/${questionId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuestions();
    } catch (err) {
          toast.error(`Failed to delete question: ${err.response?.data?.detail || err.message}`);
      }
  }

  // Memoize question map for results tab efficiency
  const questionMap = useMemo(() => {
      const map = new Map();
      questions.forEach(q => map.set(q.id, q.title));
      return map;
  }, [questions]);

  // --- Render ---
  if (!assignmentId) {
      // Optional: Render a loading/error state while ID is being determined or if missing
      return <div className="container mx-auto p-6 text-center text-gray-500">Loading assignment details or ID missing...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <Button
          variant="outline"
          size="sm" // Smaller back button
          className="w-fit" // Fit content width
          onClick={() => router.push('/assessment')} // Navigate back to dashboard
        >
          ← Back to Assessments
        </Button>
        <h1 className="text-3xl font-bold text-indigo-900">
            {assignmentTitle || `Assignment #${assignmentId}`} {/* Show fetched title or ID */}
        </h1>
        {/* Optional: Add description if available */}
        {/* <p className="text-gray-600">Description if fetched...</p> */}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="questions" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full bg-indigo-50 grid grid-cols-3"> {/* Use grid for equal width */}
          <TabsTrigger value="questions" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900">
            Questions ({questions?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900">
            Submissions ({submissions?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900">
            Results
          </TabsTrigger>
        </TabsList>

        {/* Questions Tab Content */}
        <TabsContent value="questions" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-800">Questions</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onAutoSelectOpen} disabled={isLoadingQuestions}>
                <Filter className="mr-2 h-4 w-4" /> Auto Select
              </Button>
              <Button onClick={onAddQuestionOpen} className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoadingQuestions}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </div>
          </div>
          {renderContent(isLoadingQuestions, errorQuestions, questions, null, "No questions added to this assignment yet.", () => (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-indigo-50">
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">
                          <Link href={q.link || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-700 hover:underline inline-flex items-center">
                            {q.title || `${q.contest_id}${q.problem_index}`}
                            {q.link && <ExternalLink className="ml-1.5 h-3 w-3 text-gray-400"/>}
                          </Link>
                        </TableCell>
                        <TableCell>{q.rating ?? 'N/A'}</TableCell>
                        <TableCell>{q.points}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(q.tags || '').split(',').map((tag, i) => tag.trim() && (
                              <Badge key={i} variant="secondary" className="text-xs bg-indigo-100 text-indigo-800">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 h-8 w-8 mr-1">
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 hover:bg-red-100 h-8 w-8" onClick={() => handleDeleteQuestion(q.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Submissions Tab Content */}
        <TabsContent value="submissions" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-800">Submissions</h2>
          </div>
           {renderContent(isLoadingSubmissions, errorSubmissions, submissions, null, "No submissions found for this assignment.", () => (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-indigo-50">
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Solved At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => {
                       const statusInfo = formatStatus(sub.status, sub.codeforces_verdict);
                       let solvedAtDisplay = '-';
                       if (sub.solved_at) {
                           try {
                               const dateObj = parseISO(sub.solved_at);
                               if (isValid(dateObj)) {
                                   solvedAtDisplay = format(dateObj, 'yyyy-MM-dd HH:mm');
                               }
                           } catch (e) { console.warn("Invalid solved_at date"); }
                       }

                       return (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.student?.full_name || `User ID: ${sub.student?.id}`}</TableCell>
                          <TableCell>{sub.question_display || `Q ID: ${sub.question}`}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                              {statusInfo.text}
                            </Badge>
                          </TableCell>
                          <TableCell>{sub.evaluation_score?.toFixed(1) ?? '-'}</TableCell>
                          <TableCell>{solvedAtDisplay}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100">
                              View Details {/* Link to detailed submission view if available */}
                            </Button>
                          </TableCell>
                        </TableRow>
                       );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
           ))}
        </TabsContent>

        {/* Results Tab Content */}
        <TabsContent value="results" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-800">Results Summary</h2>
          </div>
          {renderContent(isLoadingResults, errorResults, results, 'results', "Results are not yet available for this assignment.", () => (
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Overall Stats */}
                {results.overall_stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-indigo-50">
                      <CardHeader className="pb-2"><CardTitle className="text-indigo-800 text-base font-medium">Average Score</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold text-indigo-600">{results.overall_stats.average_score ?? 'N/A'}</p></CardContent>
                    </Card>
                    <Card className="bg-indigo-50">
                      <CardHeader className="pb-2"><CardTitle className="text-indigo-800 text-base font-medium">Completed</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold text-indigo-600">{results.overall_stats.completed ?? 'N/A'}</p></CardContent>
                    </Card>
                    <Card className="bg-indigo-50">
                      <CardHeader className="pb-2"><CardTitle className="text-indigo-800 text-base font-medium">Pass Rate</CardTitle></CardHeader>
                      <CardContent><p className="text-2xl font-bold text-indigo-600">{results.overall_stats.pass_rate ?? 'N/A'}</p></CardContent>
                    </Card>
                  </div>
                )}

                {/* Question Stats Table */}
                {results.question_stats && results.question_stats.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-800 mb-3">Question Performance</h3>
                    <Table>
                      <TableHeader className="bg-indigo-50">
                        <TableRow>
                          <TableHead>Question</TableHead>
                          <TableHead>Avg. Score</TableHead>
                          <TableHead>Highest Score</TableHead>
                          <TableHead>Lowest Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.question_stats.map((stat, index) => (
                          <TableRow key={index}>
                            {/* Use question_name directly from API */}
                            <TableCell className="font-medium">{stat.question_name || `Question ${index + 1}`}</TableCell>
                            <TableCell>{stat.avg_score ?? 'N/A'}</TableCell>
                            <TableCell>{stat.highest_score ?? 'N/A'}</TableCell>
                            <TableCell>{stat.lowest_score ?? 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                 {/* Student Scores Table (Optional) */}
                 {results.student_scores && results.student_scores.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-800 mb-3 mt-6">Student Scores</h3>
                    <Table>
                      <TableHeader className="bg-indigo-50">
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Total Score</TableHead>
                          <TableHead>Solved Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.student_scores.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell className="font-medium">{student.student_name}</TableCell>
                            <TableCell>{student.total_score?.toFixed(1) ?? 'N/A'}</TableCell>
                            <TableCell>{student.solved_count?.toFixed(1) ?? 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddQuestionDialog isOpen={isAddQuestionOpen} onClose={onAddQuestionClose} assignmentId={assignmentId} onQuestionAdded={fetchQuestions} />
      <AutoSelectQuestionsDialog isOpen={isAutoSelectOpen} onClose={onAutoSelectClose} assignmentId={assignmentId} onQuestionsSelected={fetchQuestions} />
    </div>
  );
}