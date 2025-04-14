// components/AutoSelectQuestionsDialog.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed Separator import as it wasn't used
// import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
// Removed Tag import as it wasn't used
// import { Tag, Loader2, Search as SearchIcon, AlertCircle, ExternalLink, PlusCircle, Check, ChevronsUpDown, X } from "lucide-react";
import { Loader2, Search as SearchIcon, AlertCircle, ExternalLink, PlusCircle, Check, ChevronsUpDown, X } from "lucide-react"; // Removed Tag
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from "sonner";
import Link from 'next/link';
import { cn } from "@/lib/utils";

// --- Codeforces Tags Constant ---
const CODEFORCES_TAGS = [
  "2-sat", "binary search", "bitmasks", "brute force", "chinese remainder theorem",
  "combinatorics", "constructive algorithms", "data structures", "dfs and similar",
  "divide and conquer", "dp", "dsu", "expression parsing", "fft", "flows", "games",
  "geometry", "graph matchings", "graphs", "greedy", "hashing", "implementation",
  "interactive", "math", "matrices", "meet-in-the-middle", "number theory",
  "probabilities", "schedules", "shortest paths", "sortings",
  "string suffix structures", "strings", "ternary search", "trees", "two pointers",
].sort();
// ---

export function AutoSelectQuestionsDialog({ isOpen, onClose, assignmentId, onQuestionsSelected }) {
  const { getToken } = useAuth();
  const [criteria, setCriteria] = useState({
    tags: [],
    minRating: 800,
    maxRating: 1500,
  });
  const [openTagSelector, setOpenTagSelector] = useState(false);
  // suggestedQuestions should contain objects with id, contest_id, problem_index, title, rating, tags, link
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  // selectedQuestions stores the unique identifier (e.g., "1941A") used for UI selection
  const [selectedQuestions, setSelectedQuestions] = useState([]); // Store unique IDs (like "1941A")

  const [isSearching, setIsSearching] = useState(false);
  const [errorSearch, setErrorSearch] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [errorAdd, setErrorAdd] = useState(null);

  // Reset state
  useEffect(() => {
    if (!isOpen) {
      setCriteria({ tags: [], minRating: 800, maxRating: 1500 });
      setSuggestedQuestions([]);
      setSelectedQuestions([]);
      setIsSearching(false);
      setErrorSearch(null);
      setIsAdding(false);
      setErrorAdd(null);
      setOpenTagSelector(false);
    }
  }, [isOpen]);

  // --- Tag Handlers ---
  const handleTagSelect = (tag) => {
    setCriteria(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    setOpenTagSelector(false);
  };
  const handleTagDeselect = (tagToRemove) => {
    setCriteria(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };
  // ---

  const handleCriteriaChange = (field, value) => {
     if (field === 'minRating' || field === 'maxRating') {
        const numValue = value === '' ? '' : parseInt(value, 10);
        if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
            setCriteria(prev => ({ ...prev, [field]: numValue }));
        }
     } else {
         setCriteria(prev => ({ ...prev, [field]: value }));
     }
  };

  // Store the unique question ID (e.g., "1941A") when toggling
  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // --- API Call: Search/Suggest Questions ---
  const searchQuestions = async () => {
    setIsSearching(true);
    setErrorSearch(null);
    setSuggestedQuestions([]);
    setSelectedQuestions([]); // Reset selection on new search

    const min = criteria.minRating === '' ? 0 : criteria.minRating;
    const max = criteria.maxRating === '' ? 5000 : criteria.maxRating;
    if (min > max) {
        const msg = "Minimum rating cannot be greater than maximum rating.";
        toast.error(msg);
        setErrorSearch(msg);
        setIsSearching(false);
        return;
    }

    const loadingToastId = toast.loading("Searching for questions...");
    let token;

    try {
      token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available. Please log in again.");
      }

      // Ensure this endpoint returns objects containing:
      // id (unique identifier, e.g., "1941A"), contest_id, problem_index, title, rating, tags, link
      const response = await axios.get(`http://127.0.0.1:8000/api/codeforces/random-problems/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          tags: criteria.tags.join(','),
          min_rating: min,
          max_rating: max,
          count: 20 // Request up to 20 suggestions
        }
      });

      // Validate response data structure (optional but recommended)
      const validQuestions = (response.data || []).filter(q =>
        q.id !== undefined && q.contest_id !== undefined && q.problem_index !== undefined
      );
      if (validQuestions.length !== (response.data || []).length) {
        console.warn("Some suggested questions were missing required fields (id, contest_id, problem_index) and were filtered out.");
      }

      setSuggestedQuestions(validQuestions);
      toast.dismiss(loadingToastId);
      if (validQuestions.length > 0) {
        toast.info(`Found ${validQuestions.length} suggested questions.`);
      } else {
        toast.info("No questions found matching the criteria.");
      }

    } catch (err) {
      toast.dismiss(loadingToastId);
      console.error("Error searching questions:", err);
      const message = err.message === "Authentication token not available. Please log in again."
                      ? err.message
                      : err.response?.data?.detail || err.message || "Failed to search questions.";
      setErrorSearch(message);
      toast.error(`Search failed: ${message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // --- API Call: Add Selected Questions to Assessment (One by One) ---
  const addSelectedQuestionsToAssignment = async () => {
    if (selectedQuestions.length === 0 || !assignmentId) return;

    setIsAdding(true);
    setErrorAdd(null);
    const loadingToastId = toast.loading(`Adding ${selectedQuestions.length} questions...`);
    let token;
    let addedCount = 0;
    let firstError = null;

    try {
      token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available. Please log in again.");
      }

      // 1. Find the full details for the selected question IDs
      const questionsToAddDetails = suggestedQuestions.filter(q =>
        selectedQuestions.includes(q.id) // Match based on the unique ID stored in selectedQuestions
      );

      // 2. Loop through each selected question and send a request
      for (const question of questionsToAddDetails) {
        // Check if required fields exist
        if (question.contest_id === undefined || question.problem_index === undefined) {
          console.error(`Missing contest_id or problem_index for question ID ${question.id}`, question);
          // Store the first error encountered
          if (!firstError) {
             firstError = `Internal error: Missing required details for question ${question.title || question.id}. Cannot add.`;
          }
          continue; // Skip this question, try the next one
        }

        // Construct the payload for a single question
        const singlePayload = {
          contest_id: question.contest_id,
          problem_index: question.problem_index
        };

        try {
          // Update toast message to show progress (optional)
          toast.loading(`Adding question ${addedCount + 1} of ${selectedQuestions.length}: ${question.title || question.id}...`, { id: loadingToastId });

          // Make the POST request for the single question
          await axios.post(
            `http://127.0.0.1:8000/api/assessments/${assignmentId}/add_question/`,
            singlePayload, // Send the single { contest_id, problem_index } object
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          addedCount++; // Increment count only on successful addition
        } catch (err) {
          console.error(`Error adding question ${question.id} (${question.title}):`, err);
          const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || `Failed to add question ${question.title || question.id}.`;
          // Store the first error encountered and stop the process
          firstError = errorMessage;
          toast.error(`Failed to add question ${question.title || question.id}: ${errorMessage}`, { id: loadingToastId }); // Update toast with error
          break; // Stop adding remaining questions on first error
        }
      } // End of for...of loop

      // After the loop finishes or breaks
      toast.dismiss(loadingToastId); // Dismiss the final loading/error toast from the loop

      if (firstError) {
        // If an error occurred at any point
        setErrorAdd(firstError); // Set the error state
        toast.error(`Failed to add all questions. Added ${addedCount} successfully. Error: ${firstError}`);
      } else if (addedCount > 0) {
        // If all requests succeeded
        toast.success(`${addedCount} questions added successfully!`);
        onQuestionsSelected(); // Refresh parent list
        onClose(); // Close dialog only if all were successful
      } else {
        // If no questions were selected or none could be added (e.g., all had missing data)
        toast.info("No questions were added.");
        // Optionally keep the dialog open if no questions were added due to missing data
        // onClose();
      }

    } catch (err) { // Catch errors from getToken or initial setup
      toast.dismiss(loadingToastId);
      console.error("Error setting up adding questions:", err);
      const message = err.message === "Authentication token not available. Please log in again."
                      ? err.message
                      : err.message || "An unexpected error occurred before adding questions.";
      setErrorAdd(message);
      toast.error(`Failed to start adding questions: ${message}`);
    } finally {
      setIsAdding(false);
    }
  };


  // Filter available tags
  const availableTags = useMemo(() => {
      return CODEFORCES_TAGS.filter(tag => !criteria.tags.includes(tag));
  }, [criteria.tags]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* DialogContent size adjusted for better table view */}
      <DialogContent className="sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="text-indigo-900">Auto-Select Questions</DialogTitle>
          <DialogDescription>
            Use Codeforces tags and rating range to find relevant questions for Assignment #{assignmentId}.
          </DialogDescription>
        </DialogHeader>

        {/* Criteria Section */}
        <div className="border p-4 rounded-md bg-gray-50/50 space-y-4">
           <h3 className="text-base font-semibold text-gray-700 mb-3">Search Criteria</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              {/* --- Tags Multi-Select --- */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="tag-selector-trigger" className="text-sm font-medium">Codeforces Tags</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 border rounded-md bg-white items-center">
                  {criteria.tags.length === 0 && <span className="text-xs text-gray-400 italic px-1">No tags selected</span>}
                  {criteria.tags.map((tag) => ( <Badge key={tag} variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-xs"> {tag} <button type="button" className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={() => handleTagDeselect(tag)} disabled={isSearching || isAdding} aria-label={`Remove ${tag} tag`}> <X className="h-3 w-3 text-indigo-600 hover:text-indigo-900" /> </button> </Badge> ))}
                </div>
                <Popover open={openTagSelector} onOpenChange={setOpenTagSelector}>
                  <PopoverTrigger asChild>
                    <Button id="tag-selector-trigger" variant="outline" role="combobox" aria-expanded={openTagSelector} className="w-full justify-between h-9 text-sm font-normal" disabled={isSearching || isAdding}>
                      {criteria.tags.length > 0 ? `${criteria.tags.length} tags selected` : "Select tags..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search tags..." className="h-9" />
                      <CommandList> <CommandEmpty>No tag found.</CommandEmpty> <ScrollArea className="h-[200px]"> <CommandGroup> {availableTags.map((tag) => ( <CommandItem key={tag} value={tag} onSelect={() => handleTagSelect(tag)} className="text-sm"> {tag} </CommandItem> ))} </CommandGroup> </ScrollArea> </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {/* --- End Tags Multi-Select --- */}
              {/* Rating Range */}
              <div className="space-y-1.5">
                 <Label className="text-sm font-medium">Codeforces Rating Range</Label>
                 <div className="flex items-center gap-2">
                     <Input id="minRating" type="number" placeholder="Min" min="0" step="100" className="h-9 text-sm w-full" value={criteria.minRating} onChange={(e) => handleCriteriaChange('minRating', e.target.value)} disabled={isSearching || isAdding} aria-label="Minimum rating"/>
                      <span className="text-gray-400 text-lg font-light">-</span>
                     <Input id="maxRating" type="number" placeholder="Max" min="0" step="100" className="h-9 text-sm w-full" value={criteria.maxRating} onChange={(e) => handleCriteriaChange('maxRating', e.target.value)} disabled={isSearching || isAdding} aria-label="Maximum rating"/>
                 </div>
              </div>
            </div>
             {/* Search Button & Error */}
             <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-2 pt-2">
                {errorSearch && ( <span className="text-red-600 text-xs flex items-center mr-auto"> <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errorSearch} </span> )}
                <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto" onClick={searchQuestions} disabled={isSearching || isAdding} size="sm">
                  {isSearching ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <SearchIcon className="mr-2 h-4 w-4" /> )}
                  Search Questions
                </Button>
             </div>
        </div>

        {/* Suggested Questions Section */}
        <div className="mt-5">
           <h3 className="text-lg font-medium mb-3 text-indigo-800">Suggested Questions</h3>
          {isSearching && <div className="flex items-center justify-center text-gray-500 py-6"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Searching...</div>}
          {!isSearching && suggestedQuestions.length === 0 && ( <p className="text-sm text-center text-gray-500 py-6">{errorSearch ? 'Search failed. Check criteria or API status.' : 'No questions found matching your criteria. Click "Search Questions" above.'}</p> )}
          {!isSearching && suggestedQuestions.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-3"> Found {suggestedQuestions.length} questions. Select the ones to add. </p>
              {/* Increased height for ScrollArea */}
              <ScrollArea className="h-[400px] border rounded-md">
                <Table>
                  {/* Sticky header for better scrolling */}
                  <TableHeader className="bg-indigo-50 sticky top-0 z-10">
                    <TableRow>
                      {/* Checkbox for selection */}
                      <TableHead className="w-12 px-4">
                        {/* Select/Deselect All Checkbox (Optional but good UX) */}
                        <Checkbox
                           id="select-all-suggested"
                           checked={suggestedQuestions.length > 0 && selectedQuestions.length === suggestedQuestions.length}
                           onCheckedChange={(checked) => {
                             if (checked) {
                               setSelectedQuestions(suggestedQuestions.map(q => q.id)); // Select all IDs
                             } else {
                               setSelectedQuestions([]); // Deselect all
                             }
                           }}
                           disabled={isAdding || suggestedQuestions.length === 0}
                           aria-label="Select all suggested questions"
                         />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="w-24 text-center">Rating</TableHead>
                      <TableHead>Tags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestedQuestions.map((question) => (
                      // Ensure question.id is unique (e.g., "1941A")
                      <TableRow key={question.id} className="hover:bg-muted/50" data-state={selectedQuestions.includes(question.id) ? 'selected' : ''}>
                        <TableCell className="px-4">
                          {/* Pass question.id (the unique identifier) to the toggle function */}
                          <Checkbox
                            id={`suggested-q-${question.id}`}
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => handleQuestionToggle(question.id)} // Pass the unique ID
                            disabled={isAdding}
                            aria-label={`Select question ${question.title || `${question.contest_id}${question.problem_index}`}`}
                          />
                        </TableCell>
                         <TableCell className="font-medium text-sm py-2.5">
                           <Link href={question.link || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-700 hover:underline inline-flex items-center gap-1.5 group">
                             {/* Display title or fallback to contestId+index */}
                             {question.title || `${question.contest_id}${question.problem_index}`}
                             {question.link && <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-600"/>}
                           </Link>
                         </TableCell>
                        <TableCell className="text-center text-sm">{question.rating ?? 'N/A'}</TableCell>
                        <TableCell className="py-2.5">
                           {/* Ensure tags are handled correctly (assuming comma-separated string) */}
                           <div className="flex gap-1 flex-wrap max-w-md">
                             {(question.tags || '').split(',').map((tag, i) => tag.trim() && (
                               <Badge key={i} variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 whitespace-nowrap font-normal px-1.5 py-0.5">
                                 {tag.trim()}
                               </Badge>
                             ))}
                           </div>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6 sm:justify-between">
           <div className="flex-grow mr-4">
             {errorAdd && (
               <Alert variant="destructive" className="p-2 text-xs">
                 <AlertCircle className="h-4 w-4" />
                 <AlertDescription> {errorAdd} </AlertDescription>
               </Alert>
             )}
           </div>
           <div className="flex gap-2 flex-shrink-0">
             <Button variant="outline" onClick={onClose} disabled={isAdding}>Cancel</Button>
             <Button
               className="bg-indigo-600 hover:bg-indigo-700 min-w-[180px]"
               onClick={addSelectedQuestionsToAssignment}
               disabled={selectedQuestions.length === 0 || isAdding || isSearching}
             >
               {isAdding ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <PlusCircle className="mr-2 h-4 w-4" /> )}
               Add {selectedQuestions.length > 0 ? `${selectedQuestions.length} ` : ''}Selected
             </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}