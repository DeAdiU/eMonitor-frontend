// components/create-assignment-dialog.jsx
"use client";

import React, { useState, useEffect } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Search, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValid, format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner"; // <-- Import toast from sonner

export function CreateAssignmentDialog({ isOpen, onClose }) {
  const [assignmentData, setAssignmentData] = useState({
    title: "Week 2 - DP Introduction",
    description: "Solve basic dynamic programming problems.",
    deadline: new Date("2025-04-15T23:59:59Z"),
    assigned_student_ids: [],
    preferred_criteria: "Use CPP instead of Python"
  });
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [openStudentPopover, setOpenStudentPopover] = useState(false);
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- State for submission loading

  // (useEffect for fetching students remains the same)
  useEffect(() => {
    if (isOpen && openStudentPopover && students.length === 0 && !isLoadingStudents) {
      const fetchStudents = async () => {
        setIsLoadingStudents(true);
        setFetchError(null);
        try {
          const token = await getToken();
          if (!token) {
             throw new Error("Authentication token not available.");
          }
          const response = await axios.get('http://127.0.0.1:8000/api/get-students/', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStudents(response.data || []);
        } catch (error) {
          console.error("Failed to fetch students:", error);
          setFetchError("Could not load students. Please try again.");
          setStudents([]);
        } finally {
          setIsLoadingStudents(false);
        }
      };
      fetchStudents();
    }
  }, [isOpen, openStudentPopover, getToken, students.length, isLoadingStudents]); // Added dependencies


  // (handleChange, toggleStudentSelection, handleRemoveStudent remain the same)
  const handleChange = (field, value) => {
    setAssignmentData(prevData => ({ ...prevData, [field]: value }));
  };
  const toggleStudentSelection = (studentId) => {
    const currentIds = assignmentData.assigned_student_ids;
    const newIds = currentIds.includes(studentId)
      ? currentIds.filter(id => id !== studentId)
      : [...currentIds, studentId];
    handleChange('assigned_student_ids', newIds);
  };
  const handleRemoveStudent = (studentId) => {
    handleChange(
      'assigned_student_ids',
      assignmentData.assigned_student_ids.filter(id => id !== studentId)
    );
  };


  // (filteredStudents and selectedStudents remain the same)
  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return !assignmentData.assigned_student_ids.includes(student.id) && fullName.includes(searchLower);
  });
  const selectedStudents = students.filter(student =>
    assignmentData.assigned_student_ids.includes(student.id)
  );


  // Handle form submission with sonner feedback
  const handleSubmit = async () => {
    setIsSubmitting(true); // <-- Start loading state
    console.log("Attempting to create assignment:", assignmentData);

    // 1. Frontend Validation
    if (!assignmentData.title.trim()) {
        toast.error("Assignment title cannot be empty.");
        setIsSubmitting(false);
        return;
    }
    if (!(assignmentData.deadline instanceof Date) || !isValid(assignmentData.deadline)) {
        toast.error("Invalid deadline date selected.");
        setIsSubmitting(false);
        return;
    }
     if (assignmentData.assigned_student_ids.length === 0) {
        toast.warning("Please assign the assignment to at least one student.");
        setIsSubmitting(false);
        return;
    }

    // 2. Prepare data for API (adjust format if needed by your backend)
    const dataToSend = {
        ...assignmentData,
        // Format deadline if your backend expects a specific string format (e.g., ISO)
        deadline: assignmentData.deadline.toISOString(),
    };

    // 3. API Call with try...catch and sonner feedback
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available.");
      }

      // --- Replace with your ACTUAL API endpoint and method ---
      console.log("Sending data to API:", dataToSend);
      const response = await axios.post('http://127.0.0.1:8000/api/assessments/', assignmentData, { // Your actual endpoint
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // --- Mock Success (Remove this when using real API call) ---
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      console.log("Mock API Success");
      // --- End Mock Success ---

      // Assuming API call was successful (e.g., response.status === 201)
      toast.success("Assignment created successfully!"); // <-- Success toast
      onClose(); // Close dialog on success

    } catch (error) {
      console.error("API Error creating assignment:", error);
      // Provide specific error message if possible, otherwise generic
      const errorMessage = error.response?.data?.detail || // Check for specific backend error detail
                           error.message || // General error message
                           "An unexpected error occurred.";
      toast.error(`Failed to create assignment: ${errorMessage}`); // <-- Failure toast
    } finally {
      setIsSubmitting(false); // <-- Stop loading state regardless of outcome
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setOpenStudentPopover(false);
            setSearchTerm("");
            // Optionally reset form fields here if desired when closing manually
        }
        onClose();
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-indigo-900">Create New Assignment</DialogTitle>
          <DialogDescription>
            Fill in the details for the new assignment.
          </DialogDescription>
        </DialogHeader>

        {/* Form Content Area */}
        <div className="grid gap-6 py-4">
          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" placeholder="e.g., Week 3 - Algorithms" className="col-span-3" value={assignmentData.title} onChange={(e) => handleChange('title', e.target.value)} disabled={isSubmitting}/>
          </div>
          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" placeholder="Provide a brief description..." className="col-span-3" value={assignmentData.description} onChange={(e) => handleChange('description', e.target.value)} disabled={isSubmitting}/>
          </div>
          {/* Deadline */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="deadline-calendar" className="text-right pt-2">Deadline</Label>
            <div className="col-span-3">
              <Calendar id="deadline-calendar" mode="single" selected={assignmentData.deadline} onSelect={(date) => handleChange('deadline', date || undefined)} className="rounded-md border p-0 justify-center" disabled={isSubmitting}/>
              <p className="text-sm text-muted-foreground mt-2">Selected: {assignmentData.deadline && isValid(assignmentData.deadline) ? format(assignmentData.deadline, 'PPP') : 'No date selected'}</p>
            </div>
          </div>
          {/* Assign To */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2">Assign to</Label>
            <div className="col-span-3 space-y-3">
              {/* Selected Students Badges */}
              <div className="flex flex-wrap gap-2 min-h-[24px]">
                {selectedStudents.length === 0 && !assignmentData.assigned_student_ids.length && (<p className="text-sm text-muted-foreground">No students assigned yet.</p>)}
                {selectedStudents.map((student) => (
                  <Badge key={student.id} variant="secondary" className="bg-indigo-100 text-indigo-800 pl-2 pr-1 py-1 flex items-center gap-1 text-sm">
                    <span>{`${student.first_name} ${student.last_name}`}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-800 rounded-full" onClick={() => handleRemoveStudent(student.id)} aria-label={`Remove ${student.first_name} ${student.last_name}`} disabled={isSubmitting}> <X className="h-3 w-3" /> </Button>
                  </Badge>
                ))}
                {assignmentData.assigned_student_ids.length > 0 && selectedStudents.length === 0 && isLoadingStudents && (<Badge variant="outline" className="text-muted-foreground">Loading selected...</Badge>)}
              </div>
              {/* Student Selector Popover */}
              <Popover open={openStudentPopover} onOpenChange={setOpenStudentPopover}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openStudentPopover} className="w-full justify-between" disabled={isSubmitting}>
                    {assignmentData.assigned_student_ids.length > 0 ? `Add/Remove Students (${assignmentData.assigned_student_ids.length} selected)` : "Add students"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  {/* Search */}
                  <div className="px-3 py-2 border-b">
                    <div className="relative flex items-center">
                      <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-8 w-full h-8 border-0 shadow-none focus-visible:ring-0" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={isLoadingStudents} />
                    </div>
                  </div>
                  {/* List */}
                  <ScrollArea className="h-60">
                    {isLoadingStudents && (<div className="flex items-center justify-center p-4 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading students...</div>)}
                    {fetchError && !isLoadingStudents && (<div className="p-4 text-center text-sm text-destructive">{fetchError}</div>)}
                    {!isLoadingStudents && !fetchError && (
                      <div className="p-1">
                        {filteredStudents.length === 0 && students.length > 0 ? (<div className="text-center p-4 text-sm text-muted-foreground">{searchTerm ? "No matches found" : "All available students assigned"}</div>)
                         : filteredStudents.length === 0 && students.length === 0 ? (<div className="text-center p-4 text-sm text-muted-foreground">No students available.</div>)
                         : (filteredStudents.map((student) => (
                          <div key={student.id} className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer" onClick={() => toggleStudentSelection(student.id)}>
                            <div><p className="font-medium">{`${student.first_name} ${student.last_name}`}</p><p className="text-xs text-muted-foreground">ID: {student.id}</p></div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>))
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {/* Preferred Criteria */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preferred_criteria" className="text-right">Preferred Criteria</Label>
            <Textarea id="preferred_criteria" placeholder="e.g., Use Python 3.10..." className="col-span-3" value={assignmentData.preferred_criteria} onChange={(e) => handleChange('preferred_criteria', e.target.value)} disabled={isSubmitting}/>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting} // <-- Disable button while submitting
          >
            {isSubmitting ? ( // <-- Show loading indicator on button
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              "Create Assignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}