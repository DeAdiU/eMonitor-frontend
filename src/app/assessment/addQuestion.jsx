"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTabs,
  DialogTabsList,
  DialogTabsTrigger,
  DialogTabsContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function AddQuestionDialog({ isOpen, onClose, assignmentId }) {
  const [activeTab, setActiveTab] = useState("contest");
  const [contestQuestion, setContestQuestion] = useState({
    contest_id: "1941",
    problem_index: "A"
  });
  const { getToken } = useAuth();
  const router = useRouter();
  const handleContestInputChange = (field, value) => {
    setContestQuestion({
      ...contestQuestion,
      [field]: value
    });
  };
  
  const handleAddContestQuestion = () => {
    console.log("Adding contest question:", contestQuestion);
    const token = getToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .post(`http://127.0.0.1:8000/api/assessments/${assignmentId}/add_question/`, contestQuestion, config)
      .then((response) => {
        console.log(response.data);
        toast.success("Question added successfully!");
        router.refresh();
      })
      .catch((error) => {
        console.error(error?.response?.data);
        toast.error("Failed to add question: " + error.response.data?.detail || error.message);
      });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-indigo-900">Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for this assignment or import from a contest.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="manual" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900">
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="contest" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900">
              From Contest
            </TabsTrigger>
          </TabsList> */}
          
          <TabsContent value="manual" className="space-y-4 ">
            <div className="grid grid-cols-4 items-center gap-4 bg-indigo-50">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" placeholder="Question title" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea id="description" placeholder="Question description..." className="col-span-3" rows={4} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Question Type
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multipleChoice">Multiple Choice</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="shortAnswer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="difficulty" className="text-right">
                Difficulty
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                Points
              </Label>
              <Input id="points" type="number" min="1" defaultValue="10" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input id="tags" placeholder="JavaScript, React, CSS (comma separated)" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">
                Visibility
              </Label>
              <RadioGroup defaultValue="visible" className="col-span-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visible" id="visible" />
                  <Label htmlFor="visible">Visible to students</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hidden" id="hidden" />
                  <Label htmlFor="hidden">Hidden (draft mode)</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          
          <TabsContent value="contest" className="space-y-4">
            <Card className="border-indigo-100 bg-indigo-50">
              <CardHeader className=" rounded-t-lg">
                <CardTitle className="text-indigo-800">Import Question from Contest</CardTitle>
                <CardDescription>
                  Enter the contest ID and problem index to import a question.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contest_id" className="text-right">
                    Contest ID
                  </Label>
                  <Input 
                    id="contest_id" 
                    value={contestQuestion.contest_id}
                    onChange={(e) => handleContestInputChange('contest_id', e.target.value)}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="problem_index" className="text-right">
                    Problem Index
                  </Label>
                  <Input 
                    id="problem_index" 
                    value={contestQuestion.problem_index}
                    onChange={(e) => handleContestInputChange('problem_index', e.target.value)}
                    className="col-span-3" 
                  />
                </div>
                
                {/* <div className="pt-2">
                  <p className="text-sm text-gray-500">
                    Note: After importing, you can modify the question as needed.
                  </p>
                </div> */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {activeTab === "manual" ? (
            <Button className="bg-indigo-600 hover:bg-indigo-700">Add Question</Button>
          ) : (
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleAddContestQuestion}
            >
              Add Question
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
