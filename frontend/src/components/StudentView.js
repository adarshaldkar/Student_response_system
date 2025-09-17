import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { ratingScale } from "../data/mock";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, FileDown, Phone, Users, Linkedin, Heart } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import Footer from "./Footer";
import { BACKEND_URL, API } from '../config/api';

const StudentView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [studentName, setStudentName] = useState("");
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (formId) {
      fetchFormData();
    } else {
      setError("No form selected. Please use a valid form link.");
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    if (formData) {
      // Initialize ratings matrix with default values
      const initialRatings = {};
      formData.subjects.forEach((subject) => {
        initialRatings[subject] = {};
        formData.evaluation_criteria.forEach((criteria) => {
          initialRatings[subject][criteria] = 5; // Default to 5 as shown in UI
        });
      });
      setRatings(initialRatings);
    }
  }, [formData]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      console.log('Fetching form data for formId:', formId);
      const response = await axios.get(`${API}/forms/${formId}`);
      console.log('Form data received:', response.data);
      setFormData(response.data);
      setError("");
    } catch (error) {
      console.error("Failed to fetch form data:", error);
      if (error.response?.status === 404) {
        setError(
          "Feedback form not found. The form may have been removed or the link is invalid."
        );
      } else {
        setError("Failed to load feedback form. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (subject, criteria, value) => {
    setRatings((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [criteria]: parseInt(value),
      },
    }));
  };

  const calculateAverage = (subject) => {
    if (!ratings[subject]) return 0;
    const values = Object.values(ratings[subject]);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return (sum / values.length).toFixed(1);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!comments.trim()) {
      setError('Please provide some comments');
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      // Generate a unique student_id based on name and timestamp
      const generateStudentId = () => {
        const name = studentName.trim().toLowerCase().replace(/\s+/g, '_');
        const timestamp = Date.now().toString().slice(-6);
        return `${name}_${timestamp}`;
      };
      
      const feedbackData = {
        form_id: formId,
        student_id: generateStudentId(),
        student_name: studentName.trim() || null,
        ratings,
        comments: comments.trim() || null,
      };

      console.log('Submitting feedback data:', feedbackData);
      await axios.post(`${API}/feedback`, feedbackData);

      // Export to Excel
      exportToExcel(feedbackData);

      // Show success toast
      toast({
        title: "Success!",
        description: "Feedback submitted successfully!",
        variant: "default",
      });

      // Reset form
      setStudentName('');
      setComments('');
      setSuccess(''); // Clear any existing success message
      const initialRatings = {};
      formData.subjects.forEach((subject) => {
        initialRatings[subject] = {};
        formData.evaluation_criteria.forEach((criteria) => {
          initialRatings[subject][criteria] = 5;
        });
      });
      setRatings(initialRatings);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      if (error.response?.status === 400) {
        setError(
          error.response.data.detail ||
            "You have already submitted feedback for this form."
        );
      } else {
        setError("Failed to submit feedback. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const exportToExcel = (feedbackData) => {
    const workbook = XLSX.utils.book_new();

    // Calculate averages for export
    const averages = {};
    formData.subjects.forEach((subject) => {
      averages[subject] = calculateAverage(subject);
    });

    // Create main feedback sheet
    const worksheetData = [
      ["Student ID", feedbackData.student_id],
      ["Student Name", feedbackData.student_name || "Not provided"],
      ["Form", formData.title],
      ["Year", formData.year],
      ["Section", formData.section],
      ["Department", formData.department],
      ["Submitted On", new Date().toLocaleString()],
      [""],
      ["Evaluation Criteria", ...formData.subjects],
      ['Student Name', feedbackData.student_name || 'Not provided'],
      ['Form', formData.title],
      ['Year', formData.year],
      ['Section', formData.section],
      ['Department', formData.department],
      ['Submitted On', new Date().toLocaleString()],
      [''],
      ['Evaluation Criteria', ...formData.subjects],
    ];

    formData.evaluation_criteria.forEach((criteria) => {
      const row = [criteria];
      formData.subjects.forEach((subject) => {
        row.push(ratings[subject][criteria]);
      });
      worksheetData.push(row);
    });

    // Add averages row
    const averageRow = ["Average Rating"];
    formData.subjects.forEach((subject) => {
      averageRow.push(averages[subject]);
    });
    worksheetData.push([""], averageRow);

    // Add comments
    if (comments.trim()) {
      worksheetData.push([""], ["Comments", comments]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");

    // // Download file
    // const fileName = `Feedback_${formData.year}_${formData.department}_${formData.section}_${feedbackData.student_name || 'Anonymous'}.xlsx`;
    // XLSX.writeFile(workbook, fileName);
  };

  const getRatingColor = (value) => {
    const scale = ratingScale.find((s) => s.value === value);
    return scale ? scale.color : "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button onClick={() => navigate("/")} variant="outline">
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8"
      style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}
    >
      <div
        className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 container-responsive"
        style={{ width: "100%", maxWidth: "100%" }}
      >
        <Card
          className="mb-6 sm:mb-8"
          style={{ width: "100%", maxWidth: "100%" }}
        >
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Teacher Feedback Collection System
            </CardTitle>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-sm sm:text-base text-gray-600">
                Submit your feedback for all subjects
              </p>
              {formData && (
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                  <p className="text-sm sm:text-base text-blue-900 font-medium">
                    {formData.title} - {formData.year} {formData.department} -
                    Section {formData.section}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}


            <div className="mb-4 sm:mb-6">
              <div>
                <Label
                  htmlFor="studentName"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Student Name (Required)*
                </Label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={submitting}
                  className="h-10 sm:h-11 max-w-md"
                />
              </div>
            </div>

            {/* Feedback Matrix Table */}
            <div className="mb-6 sm:mb-8">
              {/* Mobile View - Card Layout */}
              <div className="block lg:hidden space-y-4">
                {formData?.subjects.map((subject) => (
                  <Card key={subject} className="border border-gray-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium text-gray-700 text-center">
                        {subject}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {formData.evaluation_criteria.map((criteria) => (
                        <div
                          key={`${subject}-${criteria}`}
                          className="flex items-center justify-between p-2 border border-gray-200 rounded"
                        >
                          <span className="text-sm font-medium text-gray-900 flex-1">
                            {criteria}
                          </span>
                          <div className="ml-3">
                            <Select
                              value={
                                ratings[subject]?.[criteria]?.toString() || "5"
                              }
                              onValueChange={(value) =>
                                handleRatingChange(subject, criteria, value)
                              }
                              disabled={submitting}
                            >
                              <SelectTrigger
                                className={`w-16 h-8 text-white font-medium ${getRatingColor(
                                  parseInt(ratings[subject]?.[criteria] || 5)
                                )}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {ratingScale.map((scale) => (
                                  <SelectItem
                                    key={scale.value}
                                    value={scale.value.toString()}
                                  >
                                    {scale.value} - {scale.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                      {/* Average for this subject */}
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            Your Average Rating
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {calculateAverage(subject)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden lg:block" style={{width: '100%', overflowX: 'auto'}}>
                <div className="overflow-x-auto table-responsive -mx-3 sm:-mx-4 lg:-mx-6 xl:-mx-8 px-3 sm:px-4 lg:px-6 xl:px-8" style={{WebkitOverflowScrolling: 'touch'}}>
                  <div className="min-w-[1200px]" style={{width: '100%'}}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="sticky left-0 bg-gray-100 p-4 text-left font-medium text-gray-700 border border-gray-300 w-64">
                            Evaluation Criteria
                          </th>
                          {formData?.subjects.map((subject) => (
                            <th key={subject} className="p-4 text-center font-medium text-gray-700 border border-gray-300 min-w-40">
                              {subject}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formData?.evaluation_criteria.map((criteria) => (
                          <tr key={criteria} className="hover:bg-gray-50">
                            <td className="sticky left-0 bg-white p-4 text-sm text-gray-900 border border-gray-300 font-medium align-middle">
                              {criteria}
                            </td>
                            {formData.subjects.map((subject) => (
                              <td key={`${criteria}-${subject}`} className="p-4 border border-gray-300 text-center align-middle">
                                <div className="flex justify-center items-center">
                                  <Select
                                    value={ratings[subject]?.[criteria]?.toString() || '5'}
                                    onValueChange={(value) => handleRatingChange(subject, criteria, value)}
                                    disabled={submitting}
                                  >
                                    <SelectTrigger className={`w-20 h-10 text-white font-medium ${getRatingColor(parseInt(ratings[subject]?.[criteria] || 5))}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-50">
                                      {ratingScale.map((scale) => (
                                        <SelectItem key={scale.value} value={scale.value.toString()}>
                                          {scale.value} - {scale.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                        {/* Average Row */}
                        <tr className="bg-blue-50">
                          <td className="sticky left-0 bg-blue-100 p-4 text-sm font-bold text-gray-900 border border-gray-300 align-middle">
                            Your Average Rating
                          </td>

                          {formData?.subjects.map((subject) => (
                            <td key={`avg-${subject}`} className="p-4 border border-gray-300 text-center align-middle">
                              <span className="text-lg font-bold text-blue-600">
                                {calculateAverage(subject)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-8">
              <Label
                htmlFor="comments"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Additional Comments (Required)*:
              </Label>
              <Textarea
                id="comments"
                placeholder="Any specific suggestions or comments..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-24"
                disabled={submitting}
              />
            </div>
            {/* Submit Button */}
            <div className="text-center mb-8 mt-4">
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>

            {/* Rating Scale Legend */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Rating Scale:
              </h4>
              <div className="flex flex-wrap gap-4">
                {ratingScale.map((scale) => (
                  <div key={scale.value} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${scale.color}`}></div>
                    <span className="text-sm text-gray-700">
                      {scale.label} ({scale.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Footer */}
    

        
        

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentView;