import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import Footer from './Footer';
import FileSharing from './FileSharing';

import { Plus, Trash2, Download, Upload, Link, Copy, Loader2, LogOut, Edit, AlertTriangle, FileText, RefreshCw, Sparkles, Save, BookOpen, X, Settings, PlusCircle, Share, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { BACKEND_URL, API } from '../config/api';

// Standard Evaluation Criteria
const STANDARD_EVALUATION_CRITERIA = [
  // 1.0 PLANNING AND ORGANISATION
  "Teaching is well planned. Subject coverage schedule announced at the beginning of the semester",
  "Aim / Objectives of the subject made clear",
  "Teacher comes well prepared in the subject",
  "Teacher keeps himself / herself updated",
  "Subject matter organized in logical sequence",
  // 2.0 PRESENTATION / COMMUNICATION
  "Teacher speaks clearly and audibly",
  "Teacher writes and draws legibly",
  "Teacher explains concepts well, provides adequate examples",
  "Teacher's pace and level of instruction are suited to the attainment of students",
  "Teacher uses variety of methods and materials (OHP, Power Points, models etc.)",
  // 3.0 CLASS MANAGEMENT AND STUDENT'S INTERACTION
  "Teacher comes to the class on time and engages students throughout the period",
  "Teacher maintains discipline in the class",
  "Teacher offers assistance and counseling to the needy students",
  "Teacher encourages students' questioning and creativity",
  "Teacher is courteous and impartial in dealing with students"
];

// Detailed Standard Evaluation Criteria with numbering
const DETAILED_STANDARD_EVALUATION_CRITERIA = [
  // 1.0 PLANNING AND ORGANISATION
  "1.1 Teaching is well planned. Subject coverage schedule announced at the beginning of the semester",
  "1.2 Aim / Objectives of the subject made clear",
  "1.3 Teacher comes well prepared in the subject",
  "1.4 Teacher keeps himself / herself updated",
  "1.5 Subject matter organized in logical sequence",
  // 2.0 PRESENTATION / COMMUNICATION
  "2.1 Teacher speaks clearly and audibly",
  "2.2 Teacher writes and draws legibly",
  "2.3 Teacher explains concepts well, provides adequate examples",
  "2.4 Teacher's pace and level of instruction are suited to the attainment of students",
  "2.5 Teacher uses variety of methods and materials (OHP, Power Points, models etc.)",
  // 3.0 CLASS MANAGEMENT AND STUDENT'S INTERACTION
  "3.1 Teacher comes to the class on time and engages regularly",
  "3.2 Teacher maintains discipline in the class",
  "3.3 Teacher offers assistance and counseling to the needy students",
  "3.4 Teacher encourages students' questioning and creativity",
  "3.5 Teacher is courteous and impartial in dealing with students",
  // 4.0 SUBJECT COVERAGE AND STUDENT EVALUATION
  "4.1 Teacher covers the syllabus completely and at appropriate pace",
  "4.2 Teacher gives Assignments, conducts Tests regularly and promptly returns the answer papers",
  "4.3 Teacher select standard questions covering the stipulated portions of the syllabus for both Assignments and Tests",
  "4.4 Teacher's marking of answer papers is fair and impartial",
  "4.5 Teacher provides good feed back on the performance of students after every test"
];

// Error message component
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div className="mt-1 flex items-start">
      <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-red-600 leading-tight">{error}</p>
    </div>
  );
};

const AdminView = () => {
  const { user, logout } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingForm, setEditingForm] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(null);
  const [showInvalidDialog, setShowInvalidDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [invalidating, setInvalidating] = useState(false);
  const [newlyCreatedForm, setNewlyCreatedForm] = useState(null);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  // Custom Template Builder State
  const [customBuilder, setCustomBuilder] = useState({
    topicName: '',
    questions: ['']
  });
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  
  const [newForm, setNewForm] = useState({
    title: '',
    year: '',
    section: '',
    department: '',
    subjects: [''],
    evaluation_criteria: ['']
  });
  
  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    year: '',
    section: '',
    department: '',
    subjects: '',
    evaluation_criteria: ''
  });
  
  // Edit form field errors
  const [editFieldErrors, setEditFieldErrors] = useState({
    title: '',
    year: '',
    section: '',
    department: '',
    subjects: '',
    evaluation_criteria: ''
  });

  useEffect(() => {
    fetchForms();
  }, []);

  // Load user-specific custom templates
  useEffect(() => {
    if (user?.username) {
      const userTemplateKey = `custom_evaluation_templates_${user.username}`;
      const saved = localStorage.getItem(userTemplateKey);
      setCustomTemplates(saved ? JSON.parse(saved) : []);
    }
  }, [user?.username]);

  // Field validation functions
  const validateField = (fieldName, value, formData = null) => {
    const data = formData || newForm;
    
    switch (fieldName) {
      case 'title':
        if (!value || !value.trim()) {
          return 'Form title is required. Please provide a meaningful title (e.g., "Mid-Semester Feedback").';
        }
        if (value.trim().length < 3) {
          return 'Form title must be at least 3 characters long.';
        }
        return '';
        
      case 'year':
        if (!value || !value.trim()) {
          return 'Year is required. Please specify the academic year (e.g., "3rd Year", "4th Year").';
        }
        return '';
        
      case 'section':
        if (!value || !value.trim()) {
          return 'Section is required. Please specify the section (e.g., "A", "B", "C").';
        }
        return '';
        
      case 'department':
        if (!value || !value.trim()) {
          return 'Department is required. Please specify the department (e.g., "ECE", "CSE", "MECH").';
        }
        return '';
        
      case 'subjects':
        const validSubjects = data.subjects.filter(s => s && s.trim() !== '');
        if (validSubjects.length === 0) {
          return 'At least one subject is required. Please add subjects for evaluation.';
        }
        return '';
        
      case 'evaluation_criteria':
        const validCriteria = data.evaluation_criteria.filter(c => c && c.trim() !== '');
        if (validCriteria.length === 0) {
          return 'At least one evaluation criteria is required. Please add criteria or use the standard template.';
        }
        return '';
        
      default:
        return '';
    }
  };

  // Validate all fields
  const validateAllFields = (formData, isEdit = false) => {
    const errors = {
      title: validateField('title', formData.title, formData),
      year: validateField('year', formData.year, formData),
      section: validateField('section', formData.section, formData),
      department: validateField('department', formData.department, formData),
      subjects: validateField('subjects', null, formData),
      evaluation_criteria: validateField('evaluation_criteria', null, formData)
    };
    
    if (isEdit) {
      setEditFieldErrors(errors);
    } else {
      setFieldErrors(errors);
    }
    
    return Object.values(errors).every(error => error === '');
  };

  // Clear field error-
  const clearFieldError = (fieldName, isEdit = false) => {
    if (isEdit) {
      setEditFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
    } else {
      setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/forms`);
      setForms(response.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch forms:', error);
      setError('Failed to load forms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    setNewForm({
      ...newForm,
      subjects: [...newForm.subjects, '']
    });
  };

  const removeSubject = (index) => {
    if (newForm.subjects.length > 1) {
      const updatedSubjects = newForm.subjects.filter((_, i) => i !== index);
      setNewForm({
        ...newForm,
        subjects: updatedSubjects
      });
    }
  };

  const updateSubject = (index, value) => {
    const updatedSubjects = [...newForm.subjects];
    updatedSubjects[index] = value;
    const updatedForm = {
      ...newForm,
      subjects: updatedSubjects
    };
    setNewForm(updatedForm);
    
    // Clear subjects error if there are now valid subjects
    if (fieldErrors.subjects && updatedSubjects.some(s => s.trim() !== '')) {
      const error = validateField('subjects', null, updatedForm);
      setFieldErrors(prev => ({...prev, subjects: error}));
    }
  };

  const addCriteria = () => {
    setNewForm({
      ...newForm,
      evaluation_criteria: [...newForm.evaluation_criteria, '']
    });
  };

  const removeCriteria = (index) => {
    if (newForm.evaluation_criteria.length > 1) {
      const updatedCriteria = newForm.evaluation_criteria.filter((_, i) => i !== index);
      setNewForm({
        ...newForm,
        evaluation_criteria: updatedCriteria
      });
    }
  };

  const updateCriteria = (index, value) => {
    const updatedCriteria = [...newForm.evaluation_criteria];
    updatedCriteria[index] = value;
    const updatedForm = {
      ...newForm,
      evaluation_criteria: updatedCriteria
    };
    setNewForm(updatedForm);
    
    // Clear criteria error if there are now valid criteria
    if (fieldErrors.evaluation_criteria && updatedCriteria.some(c => c.trim() !== '')) {
      const error = validateField('evaluation_criteria', null, updatedForm);
      setFieldErrors(prev => ({...prev, evaluation_criteria: error}));
    }
  };

  const createForm = async () => {
    const { title, year, section, department, subjects, evaluation_criteria } = newForm;
    
    // Validate all fields and show specific errors
    const isValid = validateAllFields(newForm, false);
    
    if (!isValid) {
      setError('Please fix the errors above before creating the form.');
      return;
    }

    const validSubjects = subjects.filter(s => s.trim() !== '');
    const validCriteria = evaluation_criteria.filter(c => c.trim() !== '');

    try {
      setSubmitting(true);
      setError('');
      
      const formData = {
        title: title.trim(),
        year: year.trim(),
        section: section.trim(),
        department: department.trim(),
        subjects: validSubjects,
        evaluation_criteria: validCriteria
      };

      const response = await axios.post(`${API}/forms`, formData);
      const createdForm = response.data;
      
      // Store newly created form for copy link functionality
      setNewlyCreatedForm({
        id: createdForm.id,
        title: createdForm.title,
        shareable_link: createdForm.shareable_link
      });
      
      // Reset form and clear errors
      setNewForm({
        title: '',
        year: '',
        section: '',
        department: '',
        subjects: [''],
        evaluation_criteria: ['']
      });
      setFieldErrors({
        title: '',
        year: '',
        section: '',
        department: '',
        subjects: '',
        evaluation_criteria: ''
      });

      // Show success toast
      toast.success('Form created successfully!', {
        description: 'Your feedback form has been created and is ready to share.',
        duration: 4000,
      });
      
      // Refresh forms list
      await fetchForms();
      
    } catch (error) {
      console.error('Failed to create form:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to create form. Please try again.';
      setError(errorMessage);
      toast.error('Failed to create form', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    // Fix shareable link to use current domain instead of localhost
    const currentDomain = window.location.origin;
    const formId = text.split('/').pop(); // Extract form ID from the URL
    const correctedUrl = `${currentDomain}/#/student/${formId}`;
    
    navigator.clipboard.writeText(correctedUrl).then(() => {
      toast.success('Link copied successfully!', {
        description: 'The form link has been copied to your clipboard.',
        duration: 3000,
      });
    });
  };

  const clearNewlyCreatedForm = () => {
    setNewlyCreatedForm(null);
  };

  const loadStandardCriteria = () => {
    setNewForm({
      ...newForm,
      evaluation_criteria: [...STANDARD_EVALUATION_CRITERIA]
    });
    
    // Clear evaluation criteria error
    setFieldErrors(prev => ({...prev, evaluation_criteria: ''}));
    
    toast.success('Standard criteria loaded!', {
      description: `${STANDARD_EVALUATION_CRITERIA.length} evaluation criteria have been loaded successfully.`,
      duration: 3000,
    });
  };

  const loadDetailedStandardCriteria = () => {
    setNewForm({
      ...newForm,
      evaluation_criteria: [...DETAILED_STANDARD_EVALUATION_CRITERIA]
    });
    
    // Clear evaluation criteria error
    setFieldErrors(prev => ({...prev, evaluation_criteria: ''}));
    
    toast.success('Detailed standard criteria loaded!', {
      description: `${DETAILED_STANDARD_EVALUATION_CRITERIA.length} detailed evaluation criteria have been loaded successfully.`,
      duration: 3000,
    });
  };

  const clearAllCriteria = () => {
    setNewForm({
      ...newForm,
      evaluation_criteria: ['']
    });
    
    toast.info('Criteria cleared', {
      description: 'All evaluation criteria have been cleared.',
      duration: 2000,
    });
  };

  const saveCustomTemplate = () => {
    const validCriteria = newForm.evaluation_criteria.filter(c => c.trim() !== '');
    
    if (validCriteria.length === 0) {
      toast.error('Cannot save template', {
        description: 'Please add at least one evaluation criteria before saving.',
        duration: 4000,
      });
      return;
    }

    if (!templateName.trim()) {
      toast.error('Template name required', {
        description: 'Please enter a name for your template.',
        duration: 4000,
      });
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      criteria: validCriteria,
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...customTemplates, newTemplate];
    setCustomTemplates(updatedTemplates);
    const userTemplateKey = `custom_evaluation_templates_${user.username}`;
    localStorage.setItem(userTemplateKey, JSON.stringify(updatedTemplates));
    
    setShowSaveTemplate(false);
    setTemplateName('');
    
    toast.success('Template saved!', {
      description: `"${newTemplate.name}" template has been saved with ${validCriteria.length} criteria.`,
      duration: 4000,
    });
  };

  const loadCustomTemplate = (template) => {
    setNewForm({
      ...newForm,
      evaluation_criteria: [...template.criteria]
    });
    
    // Clear evaluation criteria error
    setFieldErrors(prev => ({...prev, evaluation_criteria: ''}));
    
    toast.success('Template loaded!', {
      description: `"${template.name}" template loaded with ${template.criteria.length} criteria.`,
      duration: 3000,
    });
  };

  const deleteCustomTemplate = (templateId, templateName) => {
    const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
    setCustomTemplates(updatedTemplates);
    const userTemplateKey = `custom_evaluation_templates_${user.username}`;
    localStorage.setItem(userTemplateKey, JSON.stringify(updatedTemplates));
    
    toast.success('Template deleted', {
      description: `"${templateName}" template has been removed.`,
      duration: 3000,
    });
  };

  // Custom Template Builder Functions
  const addBuilderQuestion = () => {
    setCustomBuilder({
      ...customBuilder,
      questions: [...customBuilder.questions, '']
    });
  };

  const removeBuilderQuestion = (index) => {
    if (customBuilder.questions.length > 1) {
      const updatedQuestions = customBuilder.questions.filter((_, i) => i !== index);
      setCustomBuilder({
        ...customBuilder,
        questions: updatedQuestions
      });
    }
  };

  const updateBuilderQuestion = (index, value) => {
    const updatedQuestions = [...customBuilder.questions];
    updatedQuestions[index] = value;
    setCustomBuilder({
      ...customBuilder,
      questions: updatedQuestions
    });
  };

  const createCustomTemplate = () => {
    const { topicName, questions } = customBuilder;
    
    if (!topicName.trim()) {
      toast.error('Topic name required', {
        description: 'Please enter a topic name for your template.',
        duration: 4000,
      });
      return;
    }

    const validQuestions = questions.filter(q => q.trim() !== '');
    if (validQuestions.length === 0) {
      toast.error('Questions required', {
        description: 'Please add at least one question to your template.',
        duration: 4000,
      });
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: topicName.trim(),
      criteria: validQuestions,
      createdAt: new Date().toISOString(),
      isCustomCreated: true
    };

    const updatedTemplates = [...customTemplates, newTemplate];
    setCustomTemplates(updatedTemplates);
    const userTemplateKey = `custom_evaluation_templates_${user.username}`;
    localStorage.setItem(userTemplateKey, JSON.stringify(updatedTemplates));
    
    // Reset builder
    setCustomBuilder({ topicName: '', questions: [''] });
    setShowCustomBuilder(false);
    
    toast.success('Custom template created!', {
      description: `"${newTemplate.name}" template created with ${validQuestions.length} questions.`,
      duration: 4000,
    });
  };

  const clearCustomBuilder = () => {
    setCustomBuilder({ topicName: '', questions: [''] });
    setShowCustomBuilder(false);
  };

  const exportFormData = async (formId) => {
    try {
      const response = await axios.get(`${API}/forms/${formId}/feedback`);
      const data = response.data;

      if (data.feedbacks.length === 0) {
        setError('No feedback data to export for this form.');
        return;
      }

      const workbook = XLSX.utils.book_new();
      const feedbacks = data.feedbacks;
      const subjects = Object.keys(feedbacks[0]?.ratings || {});
      const criteria = Object.keys(feedbacks[0]?.ratings[subjects[0]] || {});
      const totalStudents = feedbacks.length;

      // Calculate average ratings for each criteria-subject combination
      const calculateAverageRating = (criterion, subject) => {
        let sum = 0;
        let count = 0;
        feedbacks.forEach(feedback => {
          const rating = feedback.ratings[subject]?.[criterion];
          if (rating && !isNaN(rating)) {
            sum += parseFloat(rating);
            count++;
          }
        });
        return count > 0 ? (sum / count).toFixed(1) : '0.0';
      };

      // SHEET 1: MAIN ANALYSIS (Like your UI format with Statistics)
      const analysisData = [
        [`TEACHER FEEDBACK ANALYSIS - ${data.form_title}`],
        [`${data.year} ${data.department} - Section ${data.section}`],
        [`Generated on: ${new Date().toLocaleString()}`],
        [`Total Responses: ${totalStudents} students`],
        [''],
        // Create header row with subjects
        ['Evaluation Criteria', ...subjects, 'Overall Average']
      ];

      // Add each criteria as a row with averages for each subject
      criteria.forEach(criterion => {
        const row = [criterion];
        let totalForCriterion = 0;
        let subjectCount = 0;

        subjects.forEach(subject => {
          const avg = calculateAverageRating(criterion, subject);
          row.push(avg);
          totalForCriterion += parseFloat(avg);
          subjectCount++;
        });

        // Overall average for this criterion
        const overallAvg = subjectCount > 0 ? (totalForCriterion / subjectCount).toFixed(1) : '0.0';
        row.push(overallAvg);
        
        analysisData.push(row);
      });

      // Add subject averages row
      const subjectAveragesRow = ['Your Average Rating'];
      let grandTotal = 0;
      subjects.forEach(subject => {
        let subjectTotal = 0;
        criteria.forEach(criterion => {
          subjectTotal += parseFloat(calculateAverageRating(criterion, subject));
        });
        const subjectAvg = criteria.length > 0 ? (subjectTotal / criteria.length).toFixed(1) : '0.0';
        subjectAveragesRow.push(subjectAvg);
        grandTotal += parseFloat(subjectAvg);
      });
      
      // Grand average
      const grandAverage = subjects.length > 0 ? (grandTotal / subjects.length).toFixed(1) : '0.0';
      subjectAveragesRow.push(grandAverage);
      analysisData.push(subjectAveragesRow);

      // Add spacing and statistics section
      analysisData.push(['']);
      analysisData.push(['PERFORMANCE STATISTICS:']);
      analysisData.push(['']);
      
      // Subject Performance Ranking
      analysisData.push(['SUBJECT PERFORMANCE RANKING:']);
      analysisData.push(['Rank', 'Subject', 'Average Rating', 'Performance Level', '', '', '']);
      
      const subjectRankings = subjects.map(subject => {
        let subjectTotal = 0;
        criteria.forEach(criterion => {
          subjectTotal += parseFloat(calculateAverageRating(criterion, subject));
        });
        const avg = criteria.length > 0 ? subjectTotal / criteria.length : 0;
        return { subject, average: avg };
      }).sort((a, b) => b.average - a.average);

      subjectRankings.forEach((item, index) => {
        const performanceLevel = item.average >= 4.5 ? 'Excellent' : 
                                item.average >= 4.0 ? 'Very Good' :
                                item.average >= 3.5 ? 'Good' :
                                item.average >= 3.0 ? 'Average' : 'Needs Improvement';
        
        analysisData.push([
          index + 1,
          item.subject,
          item.average.toFixed(1),
          performanceLevel,
          '', '', ''
        ]);
      });

      analysisData.push(['']);
      analysisData.push(['📊 CRITERIA PERFORMANCE ANALYSIS:']);
      analysisData.push(['']);
      analysisData.push(['🏆 TOP PERFORMING CRITERIA:', '', '', '', '', '']);
      analysisData.push(['Rank', 'Teaching Parameter', 'Avg Score', 'Level', 'Visual', '']);

      // Calculate criteria rankings
      const criteriaRankings = criteria.map(criterion => {
        let criteriaTotal = 0;
        subjects.forEach(subject => {
          criteriaTotal += parseFloat(calculateAverageRating(criterion, subject));
        });
        const avg = subjects.length > 0 ? criteriaTotal / subjects.length : 0;
        return { criterion, average: avg };
      }).sort((a, b) => b.average - a.average);

      // Show only top 5 and bottom 3 for better presentation
      const topCriteria = criteriaRankings.slice(0, 5);
      const bottomCriteria = criteriaRankings.slice(-3);
      
      topCriteria.forEach((item, index) => {
        const performanceLevel = item.average >= 4.5 ? 'Excellent' : 
                                item.average >= 4.0 ? 'Very Good' :
                                item.average >= 3.5 ? 'Good' :
                                item.average >= 3.0 ? 'Average' : 'Needs Improvement';
        
        // Create visual representation with stars
        const stars = Math.round(item.average);
        const visual = '★'.repeat(stars) + '☆'.repeat(5-stars);
        
        analysisData.push([
          index + 1,
          item.criterion.length > 45 ? item.criterion.substring(0, 45) + '...' : item.criterion,
          item.average.toFixed(1),
          performanceLevel,
          visual,
          ''
        ]);
      });
      
      if (criteriaRankings.length > 5) {
        analysisData.push(['']);
        analysisData.push(['⚠️ AREAS NEEDING ATTENTION:', '', '', '', '', '']);
        
        bottomCriteria.forEach((item, index) => {
          const performanceLevel = item.average >= 4.5 ? 'Excellent' : 
                                  item.average >= 4.0 ? 'Very Good' :
                                  item.average >= 3.5 ? 'Good' :
                                  item.average >= 3.0 ? 'Average' : 'Needs Improvement';
          
          const stars = Math.round(item.average);
          const visual = '★'.repeat(stars) + '☆'.repeat(5-stars);
          
          analysisData.push([
            criteriaRankings.length - bottomCriteria.length + index + 1,
            item.criterion.length > 45 ? item.criterion.substring(0, 45) + '...' : item.criterion,
            item.average.toFixed(1),
            performanceLevel,
            visual,
            ''
          ]);
        });
      }

      const analysisSheet = XLSX.utils.aoa_to_sheet(analysisData);
      
      // Apply beautiful styling to Analysis Sheet
      const analysisRange = XLSX.utils.decode_range(analysisSheet['!ref'] || 'A1');
      
      // Set column widths for better readability
      analysisSheet['!cols'] = [
        { wch: 50 }, // Evaluation Criteria - wide column
        ...subjects.map(() => ({ wch: 12 })), // Subject columns
        { wch: 15 }, // Overall Average column
        { wch: 8 },  // Rank column
        { wch: 45 }, // Teaching Parameter column
        { wch: 12 }, // Avg Score column
        { wch: 15 }, // Level column
        { wch: 12 }, // Visual column
        { wch: 8 }   // Extra column
      ];
      
      // Style headers and important cells
      for (let R = analysisRange.s.r; R <= analysisRange.e.r; ++R) {
        for (let C = analysisRange.s.c; C <= analysisRange.e.c; ++C) {
          const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!analysisSheet[cell_address]) continue;
          
          const cell = analysisSheet[cell_address];
          
          // Title rows (first 4 rows)
          if (R <= 3) {
            cell.s = {
              font: { bold: true, sz: 14, color: { rgb: '1F4E79' } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: 'E6F2FF' } }
            };
          }
          // Special Title Rows: 6th, 24th, 26th, 33rd, 35th, 43rd (Main Titles)
          else if (R === 5 || R === 23 || R === 25 || R === 32 || R === 34 || R === 42) {
            cell.s = {
              font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: '1F4E79' } },
              border: {
                top: { style: 'thick', color: { rgb: '000000' } },
                bottom: { style: 'thick', color: { rgb: '000000' } },
                left: { style: 'medium', color: { rgb: '000000' } },
                right: { style: 'medium', color: { rgb: '000000' } }
              }
            };
          }
          // Subtitle Row: 22nd (Subtitle formatting)
          else if (R === 21) {
            cell.s = {
              font: { bold: true, sz: 12, color: { rgb: '1F4E79' } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: 'D9E2F3' } },
              border: {
                top: { style: 'medium', color: { rgb: '1F4E79' } },
                bottom: { style: 'medium', color: { rgb: '1F4E79' } },
                left: { style: 'thin', color: { rgb: '1F4E79' } },
                right: { style: 'thin', color: { rgb: '1F4E79' } }
              }
            };
          }
          // "Your Average Rating" row
          else if (analysisSheet[cell_address].v === 'Your Average Rating' || 
                   (R > 5 && R <= 5 + criteria.length + 1 && 
                    analysisSheet[XLSX.utils.encode_cell({ r: R, c: 0 })].v === 'Your Average Rating')) {
            cell.s = {
              font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: '70AD47' } },
              border: {
                top: { style: 'thick', color: { rgb: '000000' } },
                bottom: { style: 'thick', color: { rgb: '000000' } },
                left: { style: 'thick', color: { rgb: '000000' } },
                right: { style: 'thick', color: { rgb: '000000' } }
              }
            };
          }
          // Criteria rows
          else if (R > 5 && R <= 5 + criteria.length) {
            if (C === 0) {
              // Criteria column - center aligned with wrap text
              cell.s = {
                font: { sz: 10, bold: false },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                fill: { fgColor: { rgb: 'F8F9FA' } },
                border: {
                  top: { style: 'thin', color: { rgb: '000000' } },
                  bottom: { style: 'thin', color: { rgb: '000000' } },
                  left: { style: 'thin', color: { rgb: '000000' } },
                  right: { style: 'thin', color: { rgb: '000000' } }
                }
              };
            } else {
              // Rating cells - center aligned with color coding
              const rating = parseFloat(cell.v);
              let bgColor = 'FFFFFF'; // Default white
              
              if (!isNaN(rating)) {
                if (rating >= 4.5) bgColor = 'C6EFCE'; // Light green - Excellent
                else if (rating >= 4.0) bgColor = 'D4F4DD'; // Very light green - Very Good
                else if (rating >= 3.5) bgColor = 'FFEB9C'; // Light yellow - Good
                else if (rating >= 3.0) bgColor = 'FFD2CC'; // Light orange - Average
                else bgColor = 'FFC7CE'; // Light red - Needs Improvement
              }
              
              cell.s = {
                font: { bold: true, sz: 11 },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                fill: { fgColor: { rgb: bgColor } },
                border: {
                  top: { style: 'thin', color: { rgb: '000000' } },
                  bottom: { style: 'thin', color: { rgb: '000000' } },
                  left: { style: 'thin', color: { rgb: '000000' } },
                  right: { style: 'thin', color: { rgb: '000000' } }
                }
              };
            }
          }
          // Statistics section headers
          else if (cell.v && (cell.v.toString().includes('STATISTICS') || 
                              cell.v.toString().includes('RANKING') || 
                              cell.v === 'Rank' || cell.v === 'Subject' || 
                              cell.v === 'Average Rating' || cell.v === 'Performance Level')) {
            cell.s = {
              font: { bold: true, sz: 11, color: { rgb: '1F4E79' } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: 'D9E2F3' } },
              border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
              }
            };
          }
          // Regular statistics data and all other cells
          else {
            // Check if it's a visual star rating
            const isVisualRating = cell.v && cell.v.toString().includes('★');
            // Check if it's a performance level
            const isPerformanceLevel = cell.v && (cell.v === 'Excellent' || cell.v === 'Very Good' || cell.v === 'Good' || cell.v === 'Average' || cell.v === 'Needs Improvement');
            
            let bgColor = 'FFFFFF';
            let fontColor = '000000';
            
            if (isPerformanceLevel) {
              if (cell.v === 'Excellent') { bgColor = 'C6EFCE'; fontColor = '006100'; }
              else if (cell.v === 'Very Good') { bgColor = 'D4F4DD'; fontColor = '0E7A0E'; }
              else if (cell.v === 'Good') { bgColor = 'FFEB9C'; fontColor = '9C5700'; }
              else if (cell.v === 'Average') { bgColor = 'FFD2CC'; fontColor = 'A0522D'; }
              else if (cell.v === 'Needs Improvement') { bgColor = 'FFC7CE'; fontColor = 'C50012'; }
            }
            
            cell.s = {
              font: { sz: isVisualRating ? 12 : 10, bold: isPerformanceLevel || isVisualRating, color: { rgb: fontColor } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: bgColor } },
              border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
              }
            };
          }
        }
      }
      
      // Set row heights for better appearance
      analysisSheet['!rows'] = [];
      for (let i = 0; i <= analysisRange.e.r; i++) {
        if (i <= 3) {
          // Title rows - taller
          analysisSheet['!rows'][i] = { hpx: 25 };
        } else if (i === 5 || i === 21 || i === 23 || i === 25 || i === 32 || i === 34 || i === 42) {
          // Special title/subtitle rows - medium height
          analysisSheet['!rows'][i] = { hpx: 22 };
        } else {
          // Regular rows
          analysisSheet['!rows'][i] = { hpx: 18 };
        }
      }
      
      // Add Excel table format to Analysis sheet
      const analysisTableRange = `A6:${XLSX.utils.encode_col(subjects.length + 1)}${6 + criteria.length}`;
      analysisSheet['!tables'] = [{
        name: 'AnalysisTable',
        range: analysisTableRange,
        headerRow: true,
        totalsRow: false
      }];
      
      XLSX.utils.book_append_sheet(workbook, analysisSheet, '📊 Analysis & Statistics');

      // SHEET 2: STUDENT DETAILS & RESPONSES
      const studentDetailsData = [
        [`🎓 STUDENT PARTICIPATION & DETAILED RESPONSES`],
        [`📋 Form: ${data.form_title}`],
        [`🏫 Class: ${data.year} ${data.department} - Section ${data.section}`],
        [`👥 Total Students Responded: ${totalStudents}`],
        [''],
        ['📝 STUDENT PARTICIPATION LIST:'],
        ['Sr. No.', 'Student ID', 'Student Name', 'Submission Date', '⭐ Overall Rating', '💭 Comments'],
      ];

      // Add student participation details
      feedbacks.forEach((feedback, index) => {
        const submissionDate = new Date(feedback.submitted_at);
        
        // Calculate student's overall rating
        let totalRating = 0;
        let ratingCount = 0;
        subjects.forEach(subject => {
          criteria.forEach(criterion => {
            const rating = feedback.ratings[subject]?.[criterion];
            if (rating && !isNaN(rating)) {
              totalRating += parseFloat(rating);
              ratingCount++;
            }
          });
        });
        
        const overallRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'N/A';
        
        studentDetailsData.push([
          index + 1,
          feedback.student_id,
          feedback.student_name || 'Anonymous',
          submissionDate.toLocaleString(),
          overallRating,
          (feedback.comments || 'No comments').substring(0, 150) + (feedback.comments && feedback.comments.length > 150 ? '...' : '')
        ]);
      });

      // Add visual summary statistics
      studentDetailsData.push(['']);
      studentDetailsData.push(['📊 PARTICIPATION SUMMARY:']);
      studentDetailsData.push(['']);
      studentDetailsData.push(['Metric', 'Value', 'Description']);
      
      // Calculate participation statistics
      const avgOverallRating = feedbacks.length > 0 ? 
        feedbacks.reduce((sum, feedback) => {
          let totalRating = 0;
          let ratingCount = 0;
          subjects.forEach(subject => {
            criteria.forEach(criterion => {
              const rating = feedback.ratings[subject]?.[criterion];
              if (rating && !isNaN(rating)) {
                totalRating += parseFloat(rating);
                ratingCount++;
              }
            });
          });
          return sum + (ratingCount > 0 ? totalRating / ratingCount : 0);
        }, 0) / feedbacks.length : 0;
      
      const excellentCount = feedbacks.filter(f => {
        let totalRating = 0, ratingCount = 0;
        subjects.forEach(subject => {
          criteria.forEach(criterion => {
            const rating = f.ratings[subject]?.[criterion];
            if (rating && !isNaN(rating)) {
              totalRating += parseFloat(rating);
              ratingCount++;
            }
          });
        });
        return ratingCount > 0 && (totalRating / ratingCount) >= 4.5;
      }).length;
      
      const goodCount = feedbacks.filter(f => {
        let totalRating = 0, ratingCount = 0;
        subjects.forEach(subject => {
          criteria.forEach(criterion => {
            const rating = f.ratings[subject]?.[criterion];
            if (rating && !isNaN(rating)) {
              totalRating += parseFloat(rating);
              ratingCount++;
            }
          });
        });
        const avg = ratingCount > 0 ? totalRating / ratingCount : 0;
        return avg >= 4.0 && avg < 4.5;
      }).length;
      
      studentDetailsData.push(['📊 Average Rating', avgOverallRating.toFixed(2) + '/5.0', 'Overall class performance']);
      studentDetailsData.push(['🌟 Excellent Students', excellentCount + '/' + totalStudents, 'Students with 4.5+ rating']);
      studentDetailsData.push(['👍 Good Students', goodCount + '/' + totalStudents, 'Students with 4.0-4.4 rating']);
      studentDetailsData.push(['📈 Response Rate', '100%', 'Based on submitted responses']);
      studentDetailsData.push(['📅 Collection Period', new Date(Math.min(...feedbacks.map(f => new Date(f.submitted_at)))).toLocaleDateString() + ' to ' + new Date(Math.max(...feedbacks.map(f => new Date(f.submitted_at)))).toLocaleDateString(), 'Feedback collection timeframe']);

      const studentDetailsSheet = XLSX.utils.aoa_to_sheet(studentDetailsData);
      
      // Apply beautiful styling to Student Details Sheet
      const studentRange = XLSX.utils.decode_range(studentDetailsSheet['!ref'] || 'A1');
      
      // Set column widths for Student Details sheet
      studentDetailsSheet['!cols'] = [
        { wch: 8 },  // Sr. No
        { wch: 20 }, // Student ID  
        { wch: 25 }, // Student Name
        { wch: 18 }, // Submission Date
        { wch: 15 }, // Overall Rating
        { wch: 50 }, // Comments - wider for better readability
        { wch: 20 }, // Metric
        { wch: 15 }, // Value
        { wch: 40 }  // Description
      ];
      
      // Style Student Details Sheet
      for (let R = studentRange.s.r; R <= studentRange.e.r; ++R) {
        for (let C = studentRange.s.c; C <= studentRange.e.c; ++C) {
          const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!studentDetailsSheet[cell_address]) continue;
          
          const cell = studentDetailsSheet[cell_address];
          
          // Title rows
          if (R <= 3) {
            cell.s = {
              font: { bold: true, sz: 14, color: { rgb: '1F4E79' } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: 'E6F7FF' } }
            };
          }
          // Section headers
          else if (cell.v && (cell.v.toString().includes('PARTICIPATION') || 
                              cell.v.toString().includes('DETAILED') || 
                              cell.v.toString().includes('RESPONSES'))) {
            cell.s = {
              font: { bold: true, sz: 12, color: { rgb: '1F4E79' } },
              alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: 'F0F8FF' } }
            };
          }
          // Table headers
          else if (cell.v && (cell.v === 'Sr. No.' || cell.v === 'Student ID' || 
                              cell.v === 'Student Name' || cell.v.toString().includes('Rating') ||
                              cell.v.toString().includes('Comments') || cell.v.toString().includes('Date'))) {
            cell.s = {
              font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: '4472C4' } },
              border: {
                top: { style: 'thick', color: { rgb: '000000' } },
                bottom: { style: 'thick', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
              }
            };
          }
          // Data cells
          else {
            // Color code rating cells and special values
            const rating = parseFloat(cell.v);
            let bgColor = 'FFFFFF';
            let fontColor = '000000';
            let isBold = false;
            
            // Check for special metric cells
            if (cell.v && (cell.v.toString().includes('📊') || cell.v.toString().includes('🌟') || cell.v.toString().includes('👍') || cell.v.toString().includes('📈') || cell.v.toString().includes('📅'))) {
              bgColor = 'E6F7FF';
              fontColor = '1F4E79';
              isBold = true;
            }
            // Color code numeric ratings
            else if (!isNaN(rating)) {
              if (rating >= 4.5) { bgColor = 'C6EFCE'; fontColor = '006100'; }
              else if (rating >= 4.0) { bgColor = 'D4F4DD'; fontColor = '0E7A0E'; }
              else if (rating >= 3.5) { bgColor = 'FFEB9C'; fontColor = '9C5700'; }
              else if (rating >= 3.0) { bgColor = 'FFD2CC'; fontColor = 'A0522D'; }
              else { bgColor = 'FFC7CE'; fontColor = 'C50012'; }
              isBold = true;
            }
            // Special styling for values like percentages and fractions
            else if (cell.v && (cell.v.toString().includes('/') || cell.v.toString().includes('%'))) {
              fontColor = '1F4E79';
              isBold = true;
            }
            
            cell.s = {
              font: { sz: 10, bold: isBold, color: { rgb: fontColor } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              fill: { fgColor: { rgb: bgColor } },
              border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
              }
            };
          }
        }
      }
      
      // Add Excel table format to Student Details sheet
      const studentTableRange = `A7:F${7 + feedbacks.length}`;
      studentDetailsSheet['!tables'] = [{
        name: 'StudentTable', 
        range: studentTableRange,
        headerRow: true,
        totalsRow: false
      }];
      
      // Add Excel table format to Summary section
      const summaryTableRange = `A${9 + feedbacks.length}:C${13 + feedbacks.length}`;
      if (feedbacks.length > 0) {
        studentDetailsSheet['!tables'].push({
          name: 'SummaryTable',
          range: summaryTableRange,
          headerRow: true,
          totalsRow: false
        });
      }
      
      XLSX.utils.book_append_sheet(workbook, studentDetailsSheet, '👥 Student Details');

      // Generate filename with timestamp
      const fileName = `Feedback_Analysis_${data.year}_${data.department}_${data.section}_${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 5).replace(':', '')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Comprehensive report exported!', {
        description: `Detailed feedback analysis exported as ${fileName}`,
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Failed to export data:', error);
      setError('Failed to export data. Please try again.');
      toast.error('Export failed', {
        description: error.response?.data?.detail || 'Please try again',
        duration: 4000,
      });
    }
  };

  const deleteForm = async (formId) => {
    try {
      setDeleting(true);
      setError('');
      
      await axios.delete(`${API}/forms/${formId}`);
      
      toast.success('Form deleted successfully!', {
        description: 'The feedback form and all its responses have been permanently removed.',
        duration: 4000,
      });
      setShowDeleteDialog(null);
      
      // Refresh forms list
      await fetchForms();
      
    } catch (error) {
      console.error('Failed to delete form:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to delete form. Please try again.';
      setError(errorMessage);
      toast.error('Failed to delete form', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const invalidateForm = async (formId) => {
    try {
      setInvalidating(true);
      setError('');
      
      await axios.patch(`${API}/forms/${formId}/invalidate`);
      
      toast.success('Form link invalidated!', {
        description: 'The feedback form link has been disabled. Students can no longer access it.',
        duration: 4000,
      });
      setShowInvalidDialog(null);
      
      // Refresh forms list
      await fetchForms();
      
    } catch (error) {
      console.error('Failed to invalidate form:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to invalidate form. Please try again.';
      setError(errorMessage);
      toast.error('Failed to invalidate form', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setInvalidating(false);
    }
  };

  const startEdit = (form) => {
    setEditingForm({
      id: form.id,
      title: form.title,
      year: form.year,
      section: form.section,
      department: form.department,
      subjects: [...form.subjects],
      evaluation_criteria: [...form.evaluation_criteria]
    });
    // Clear edit form errors
    setEditFieldErrors({
      title: '',
      year: '',
      section: '',
      department: '',
      subjects: '',
      evaluation_criteria: ''
    });
  };

  const cancelEdit = () => {
    setEditingForm(null);
    // Clear edit form errors
    setEditFieldErrors({
      title: '',
      year: '',
      section: '',
      department: '',
      subjects: '',
      evaluation_criteria: ''
    });
  };

  const saveEdit = async () => {
    const { id, title, year, section, department, subjects, evaluation_criteria } = editingForm;
    
    // Validate all fields and show specific errors
    const isValid = validateAllFields(editingForm, true);
    
    if (!isValid) {
      setError('Please fix the errors above before saving the form.');
      return;
    }

    const validSubjects = subjects.filter(s => s.trim() !== '');
    const validCriteria = evaluation_criteria.filter(c => c.trim() !== '');

    try {
      setSubmitting(true);
      setError('');
      
      const formData = {
        title: title.trim(),
        year: year.trim(),
        section: section.trim(),
        department: department.trim(),
        subjects: validSubjects,
        evaluation_criteria: validCriteria
      };

      await axios.put(`${API}/forms/${id}`, formData);
      
      toast.success('Form updated successfully!', {
        description: 'Your changes have been saved and applied to the feedback form.',
        duration: 4000,
      });
      setEditingForm(null);
      
      // Refresh forms list
      await fetchForms();
      
    } catch (error) {
      console.error('Failed to update form:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update form. Please try again.';
      setError(errorMessage);
      toast.error('Failed to update form', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateEditSubject = (index, value) => {
    const updatedSubjects = [...editingForm.subjects];
    updatedSubjects[index] = value;
    const updatedForm = {
      ...editingForm,
      subjects: updatedSubjects
    };
    setEditingForm(updatedForm);
    
    // Clear subjects error if there are now valid subjects
    if (editFieldErrors.subjects && updatedSubjects.some(s => s.trim() !== '')) {
      const error = validateField('subjects', null, updatedForm);
      setEditFieldErrors(prev => ({...prev, subjects: error}));
    }
  };

  const addEditSubject = () => {
    setEditingForm({
      ...editingForm,
      subjects: [...editingForm.subjects, '']
    });
  };

  const removeEditSubject = (index) => {
    if (editingForm.subjects.length > 1) {
      const updatedSubjects = editingForm.subjects.filter((_, i) => i !== index);
      setEditingForm({
        ...editingForm,
        subjects: updatedSubjects
      });
    }
  };

  const updateEditCriteria = (index, value) => {
    const updatedCriteria = [...editingForm.evaluation_criteria];
    updatedCriteria[index] = value;
    const updatedForm = {
      ...editingForm,
      evaluation_criteria: updatedCriteria
    };
    setEditingForm(updatedForm);
    
    // Clear criteria error if there are now valid criteria
    if (editFieldErrors.evaluation_criteria && updatedCriteria.some(c => c.trim() !== '')) {
      const error = validateField('evaluation_criteria', null, updatedForm);
      setEditFieldErrors(prev => ({...prev, evaluation_criteria: error}));
    }
  };

  const addEditCriteria = () => {
    setEditingForm({
      ...editingForm,
      evaluation_criteria: [...editingForm.evaluation_criteria, '']
    });
  };

  const removeEditCriteria = (index) => {
    if (editingForm.evaluation_criteria.length > 1) {
      const updatedCriteria = editingForm.evaluation_criteria.filter((_, i) => i !== index);
      setEditingForm({
        ...editingForm,
        evaluation_criteria: updatedCriteria
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{
      width: '100%',
      maxWidth: '100%', 
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </CardTitle>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Welcome, <span className="font-medium text-blue-600">{user?.username}</span> - Manage feedback forms and view submissions
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={logout} 
                className="text-red-600 hover:text-red-700 shrink-0"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="create" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 p-1 h-auto bg-gray-100 rounded-lg">
            <TabsTrigger value="create" className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              Create Form
            </TabsTrigger>
            <TabsTrigger value="forms" className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              Manage ({forms.length})
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              Export Data
            </TabsTrigger>
            <TabsTrigger value="fileshare" className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">
              File Share
            </TabsTrigger>
          </TabsList>

          {/* Create New Form */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Create New Feedback Form
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Form Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Mid-Semester Feedback"
                      value={newForm.title}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setNewForm({...newForm, title: newValue});
                        if (fieldErrors.title) {
                          const error = validateField('title', newValue, {...newForm, title: newValue});
                          setFieldErrors(prev => ({...prev, title: error}));
                        }
                      }}
                      onBlur={() => {
                        const error = validateField('title', newForm.title, newForm);
                        setFieldErrors(prev => ({...prev, title: error}));
                      }}
                      disabled={submitting}
                      className={`mt-1 ${fieldErrors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />
                    <ErrorMessage error={fieldErrors.title} />
                  </div>
                  <div>
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department *</Label>
                    <Input
                      id="department"
                      placeholder="e.g., ECE, CSE, MECH"
                      value={newForm.department}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setNewForm({...newForm, department: newValue});
                        if (fieldErrors.department) {
                          const error = validateField('department', newValue, {...newForm, department: newValue});
                          setFieldErrors(prev => ({...prev, department: error}));
                        }
                      }}
                      onBlur={() => {
                        const error = validateField('department', newForm.department, newForm);
                        setFieldErrors(prev => ({...prev, department: error}));
                      }}
                      disabled={submitting}
                      className={`mt-1 ${fieldErrors.department ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />
                    <ErrorMessage error={fieldErrors.department} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year" className="text-sm font-medium text-gray-700">Year *</Label>
                    <Input
                      id="year"
                      placeholder="e.g., 3rd Year, 4th Year"
                      value={newForm.year}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setNewForm({...newForm, year: newValue});
                        if (fieldErrors.year) {
                          const error = validateField('year', newValue, {...newForm, year: newValue});
                          setFieldErrors(prev => ({...prev, year: error}));
                        }
                      }}
                      onBlur={() => {
                        const error = validateField('year', newForm.year, newForm);
                        setFieldErrors(prev => ({...prev, year: error}));
                      }}
                      disabled={submitting}
                      className={`mt-1 ${fieldErrors.year ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />
                    <ErrorMessage error={fieldErrors.year} />
                  </div>
                  <div>
                    <Label htmlFor="section" className="text-sm font-medium text-gray-700">Section *</Label>
                    <Input
                      id="section"
                      placeholder="e.g., A, B, C"
                      value={newForm.section}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setNewForm({...newForm, section: newValue});
                        if (fieldErrors.section) {
                          const error = validateField('section', newValue, {...newForm, section: newValue});
                          setFieldErrors(prev => ({...prev, section: error}));
                        }
                      }}
                      onBlur={() => {
                        const error = validateField('section', newForm.section, newForm);
                        setFieldErrors(prev => ({...prev, section: error}));
                      }}
                      disabled={submitting}
                      className={`mt-1 ${fieldErrors.section ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />
                    <ErrorMessage error={fieldErrors.section} />
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <Label className="text-lg font-medium">
                    Subjects *
                  </Label>
                  <div className="space-y-2 mt-2">
                    {newForm.subjects.map((subject, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Subject ${index + 1}`}
                          value={subject}
                          onChange={(e) => updateSubject(index, e.target.value)}
                          disabled={submitting}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSubject(index)}
                          disabled={newForm.subjects.length === 1 || submitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        addSubject();
                        if (fieldErrors.subjects) {
                          const error = validateField('subjects', null, newForm);
                          setFieldErrors(prev => ({...prev, subjects: error}));
                        }
                      }} 
                      className="w-full"
                      disabled={submitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subject
                    </Button>
                    <ErrorMessage error={fieldErrors.subjects} />
                  </div>
                </div>

                {/* Evaluation Criteria */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-lg font-medium">
                      Evaluation Criteria
                    </Label>
                  </div>
                  
                  {/* Standard Criteria Options */}
                  <div className="mb-4 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 flex-shrink-0" />
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Quick Setup Options</h4>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSaveTemplate(true)}
                        disabled={submitting}
                        className="text-blue-600 hover:text-blue-700 hover:bg-gray-100 text-xs p-1 h-6 w-6"
                        title="Save current criteria as custom template"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">
                      Save time by using templates, or create your own custom criteria.
                    </p>
                    
                    {/* Standard Template */}
                    <div className="space-y-2 mb-3">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={loadStandardCriteria}
                        disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2 sm:py-3 h-auto shadow-sm"
                      >
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="truncate">Load Standard Criteria (15 items)</span>
                      </Button>
                      
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={loadDetailedStandardCriteria}
                        disabled={submitting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-2 sm:py-3 h-auto shadow-sm"
                      >
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="truncate">Load Detailed Standard Criteria (20 items)</span>
                      </Button>
                      
                      {/* Custom Templates */}
                      {customTemplates.map((template) => (
                        <div key={template.id} className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => loadCustomTemplate(template)}
                            disabled={submitting}
                            className="flex-1 bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-blue-400 hover:text-blue-600 text-xs sm:text-sm py-2 h-auto shadow-sm"
                          >
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            <span className="truncate">{template.name} ({template.criteria.length})</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomTemplate(template.id, template.name)}
                            disabled={submitting}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                            title="Delete template"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Clear Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllCriteria}
                      disabled={submitting}
                      className="w-full bg-white border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 text-xs sm:text-sm py-2 h-auto shadow-sm"
                    >
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      <span>Clear All Criteria</span>
                    </Button>
                  </div>
                  
                  {/* Save Template Dialog */}
                  {showSaveTemplate && (
                    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm">Save as Custom Template</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowSaveTemplate(false);
                            setTemplateName('');
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 h-6 w-6"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        Create a reusable template from your current evaluation criteria.
                      </p>
                      <div className="space-y-3">
                        <Input
                          placeholder="Enter template name (e.g., 'Engineering Evaluation', 'Custom Assessment')"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          disabled={submitting}
                          className="text-sm"
                          maxLength={50}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={saveCustomTemplate}
                            disabled={submitting || !templateName.trim()}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-sm"
                          >
                            <Save className="h-3 w-3 mr-2" />
                            Save Template
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowSaveTemplate(false);
                              setTemplateName('');
                            }}
                            size="sm"
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Custom Options Section */}
                  <div className="mb-4 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 flex-shrink-0" />
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Custom Options</h4>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCustomBuilder(!showCustomBuilder)}
                        disabled={submitting}
                        className={`text-blue-600 hover:text-blue-700 hover:bg-gray-100 text-xs p-1 h-6 w-6 ${
                          showCustomBuilder ? 'bg-gray-100' : ''
                        }`}
                        title="Toggle custom template builder"
                      >
                        <PlusCircle className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">
                      Create your own evaluation templates with custom topics and questions.
                    </p>
                    
                    {showCustomBuilder && (
                      <div className="space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <Label className="text-sm font-medium text-gray-900 mb-2 block">
                            Topic/Category Name *
                          </Label>
                          <Input
                            placeholder="e.g., 'PLANNING AND ORGANISATION', 'LAB ASSESSMENT', 'PROJECT EVALUATION'"
                            value={customBuilder.topicName}
                            onChange={(e) => setCustomBuilder({...customBuilder, topicName: e.target.value})}
                            disabled={submitting}
                            className="text-sm"
                            maxLength={60}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-900 mb-2 block">
                            Evaluation Questions
                          </Label>
                          <div className="space-y-2">
                            {customBuilder.questions.map((question, index) => (
                              <div key={index} className="flex gap-2 items-start">
                                <Input
                                  placeholder={`Question ${index + 1} (e.g., 'Teaching is well planned and organized')`}
                                  value={question}
                                  onChange={(e) => updateBuilderQuestion(index, e.target.value)}
                                  disabled={submitting}
                                  className="flex-1 text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeBuilderQuestion(index)}
                                  disabled={customBuilder.questions.length === 1 || submitting}
                                  className="shrink-0 h-9 w-9 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addBuilderQuestion}
                              className="w-full text-xs sm:text-sm"
                              disabled={submitting}
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Add Question
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            onClick={createCustomTemplate}
                            disabled={submitting || !customBuilder.topicName.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm shadow-sm"
                          >
                            <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Create New Template
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={clearCustomBuilder}
                            disabled={submitting}
                            className="text-xs sm:text-sm"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {newForm.evaluation_criteria.map((criteria, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <Input
                          placeholder={`Evaluation criteria ${index + 1}`}
                          value={criteria}
                          onChange={(e) => updateCriteria(index, e.target.value)}
                          disabled={submitting}
                          className="flex-1 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[2.75rem] leading-snug"
                          style={{ lineHeight: '1.25' }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeCriteria(index)}
                          disabled={newForm.evaluation_criteria.length === 1 || submitting}
                          className="shrink-0 h-[2.5rem] w-[2.5rem] sm:h-[2.75rem] sm:w-[2.75rem]"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        addCriteria();
                        if (fieldErrors.evaluation_criteria) {
                          const error = validateField('evaluation_criteria', null, newForm);
                          setFieldErrors(prev => ({...prev, evaluation_criteria: error}));
                        }
                      }} 
                      className="w-full"
                      disabled={submitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Criteria
                    </Button>
                    <ErrorMessage error={fieldErrors.evaluation_criteria} />
                  </div>
                </div>

                <Button 
                  onClick={createForm} 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Form...
                    </>
                  ) : (
                    'Create Feedback Form'
                  )}
                </Button>

                {/* Copy Link Section - Show after form creation */}
                {newlyCreatedForm && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-green-900">
                        ✅ Form Created Successfully!
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearNewlyCreatedForm}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </Button>
                    </div>
                    <p className="text-green-800 mb-4">
                      <strong>{newlyCreatedForm.title}</strong> has been created and is ready to share with students.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => copyToClipboard(newlyCreatedForm.shareable_link)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Form Link
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={clearNewlyCreatedForm}
                        size="lg"
                        className="flex-1 sm:flex-none"
                      >
                        Create Another Form
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Forms */}
          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Manage Forms ({forms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {forms.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No forms created yet</p>
                    <p className="text-gray-400 text-sm mt-2">Create your first feedback form to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {forms.map(form => (
                      <div key={form.id} className="p-4 sm:p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                        {editingForm?.id === form.id ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg text-gray-900">Edit Form</h3>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={cancelEdit}
                                  disabled={submitting}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={saveEdit}
                                  disabled={submitting}
                                >
                                  {submitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    'Save Changes'
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Form Title *</Label>
                                <Input
                                  value={editingForm.title}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setEditingForm({...editingForm, title: newValue});
                                    if (editFieldErrors.title) {
                                      const error = validateField('title', newValue, {...editingForm, title: newValue});
                                      setEditFieldErrors(prev => ({...prev, title: error}));
                                    }
                                  }}
                                  onBlur={() => {
                                    const error = validateField('title', editingForm.title, editingForm);
                                    setEditFieldErrors(prev => ({...prev, title: error}));
                                  }}
                                  disabled={submitting}
                                  className={`mt-1 ${editFieldErrors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                />
                                <ErrorMessage error={editFieldErrors.title} />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Department *</Label>
                                <Input
                                  value={editingForm.department}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setEditingForm({...editingForm, department: newValue});
                                    if (editFieldErrors.department) {
                                      const error = validateField('department', newValue, {...editingForm, department: newValue});
                                      setEditFieldErrors(prev => ({...prev, department: error}));
                                    }
                                  }}
                                  onBlur={() => {
                                    const error = validateField('department', editingForm.department, editingForm);
                                    setEditFieldErrors(prev => ({...prev, department: error}));
                                  }}
                                  disabled={submitting}
                                  className={`mt-1 ${editFieldErrors.department ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                />
                                <ErrorMessage error={editFieldErrors.department} />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Year *</Label>
                                <Input
                                  value={editingForm.year}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setEditingForm({...editingForm, year: newValue});
                                    if (editFieldErrors.year) {
                                      const error = validateField('year', newValue, {...editingForm, year: newValue});
                                      setEditFieldErrors(prev => ({...prev, year: error}));
                                    }
                                  }}
                                  onBlur={() => {
                                    const error = validateField('year', editingForm.year, editingForm);
                                    setEditFieldErrors(prev => ({...prev, year: error}));
                                  }}
                                  disabled={submitting}
                                  className={`mt-1 ${editFieldErrors.year ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                />
                                <ErrorMessage error={editFieldErrors.year} />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Section *</Label>
                                <Input
                                  value={editingForm.section}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setEditingForm({...editingForm, section: newValue});
                                    if (editFieldErrors.section) {
                                      const error = validateField('section', newValue, {...editingForm, section: newValue});
                                      setEditFieldErrors(prev => ({...prev, section: error}));
                                    }
                                  }}
                                  onBlur={() => {
                                    const error = validateField('section', editingForm.section, editingForm);
                                    setEditFieldErrors(prev => ({...prev, section: error}));
                                  }}
                                  disabled={submitting}
                                  className={`mt-1 ${editFieldErrors.section ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                />
                                <ErrorMessage error={editFieldErrors.section} />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">Subjects *</Label>
                              <div className="space-y-2">
                                {editingForm.subjects.map((subject, index) => (
                                  <div key={index} className="flex gap-2">
                                    <Input
                                      placeholder={`Subject ${index + 1}`}
                                      value={subject}
                                      onChange={(e) => updateEditSubject(index, e.target.value)}
                                      disabled={submitting}
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeEditSubject(index)}
                                      disabled={editingForm.subjects.length === 1 || submitting}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => {
                                    addEditSubject();
                                    if (editFieldErrors.subjects) {
                                      const error = validateField('subjects', null, editingForm);
                                      setEditFieldErrors(prev => ({...prev, subjects: error}));
                                    }
                                  }} 
                                  className="w-full"
                                  disabled={submitting}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Subject
                                </Button>
                                <ErrorMessage error={editFieldErrors.subjects} />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">Evaluation Criteria *</Label>
                              <div className="space-y-2">
                                {editingForm.evaluation_criteria.map((criteria, index) => (
                                  <div key={index} className="flex gap-2">
                                    <Input
                                      placeholder={`Evaluation criteria ${index + 1}`}
                                      value={criteria}
                                      onChange={(e) => updateEditCriteria(index, e.target.value)}
                                      disabled={submitting}
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeEditCriteria(index)}
                                      disabled={editingForm.evaluation_criteria.length === 1 || submitting}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => {
                                    addEditCriteria();
                                    if (editFieldErrors.evaluation_criteria) {
                                      const error = validateField('evaluation_criteria', null, editingForm);
                                      setEditFieldErrors(prev => ({...prev, evaluation_criteria: error}));
                                    }
                                  }} 
                                  className="w-full"
                                  disabled={submitting}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Criteria
                                </Button>
                                <ErrorMessage error={editFieldErrors.evaluation_criteria} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg sm:text-xl text-gray-900 truncate">{form.title}</h3>
                                <p className="text-blue-600 font-medium text-sm sm:text-base mt-1">
                                  {form.year} {form.department} - Section {form.section}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                  Created: {new Date(form.created_at).toLocaleString()}
                                </p>
                              </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="secondary" className="text-xs sm:text-sm">
                                  {form.response_count} responses
                                </Badge>
                                {form.is_invalid && (
                                  <Badge variant="destructive" className="text-xs sm:text-sm">
                                    Link Disabled
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {form.subjects.map((subject, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">{subject}</Badge>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Evaluation Criteria: {form.evaluation_criteria.length} items
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 mt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => copyToClipboard(form.shareable_link)}
                                disabled={form.is_invalid}
                                className="text-sm font-medium px-3 py-2 h-9 justify-center hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => exportFormData(form.id)}
                                disabled={form.response_count === 0}
                                className="text-sm font-medium px-3 py-2 h-9 justify-center hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors duration-200"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export ({form.response_count})
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => startEdit(form)}
                                className="text-sm font-medium px-3 py-2 h-9 justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowInvalidDialog(form.id)}
                                disabled={form.is_invalid}
                                className="text-sm font-medium px-3 py-2 h-9 justify-center text-orange-600 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                {form.is_invalid ? 'Link Disabled' : 'Link Invalid'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowDeleteDialog(form.id)}
                                className="text-sm font-medium px-3 py-2 h-9 justify-center text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          {/* Export Data */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Export All Feedback Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-gray-700 text-sm sm:text-base">
                      Export feedback data for individual forms using the "Export Data" button in the Manage Forms section.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">{forms.length}</div>
                        <p className="text-sm text-gray-600">Total Forms</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {forms.reduce((total, form) => total + form.response_count, 0)}
                        </div>
                        <p className="text-sm text-gray-600">Total Responses</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm sm:text-base">Use the individual export buttons in the "Manage Forms" tab to export data per section.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Sharing */}
          <TabsContent value="fileshare">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center space-x-2">
                  <Share className="h-5 w-5 text-blue-600" />
                  <span>File Sharing System</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Share Excel files with other admins and communicate in real-time
                </p>
              </CardHeader>
              <CardContent>
                <FileSharing />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Form
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete this form? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> All feedback responses associated with this form will also be permanently deleted.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => deleteForm(showDeleteDialog)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Form
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Invalidate Link Confirmation Dialog */}
        {showInvalidDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <Ban className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Make Link Invalid
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Confirm you want to make this feedback link invalid.
                  </p>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Students will no longer be able to access this feedback form through the link. Existing responses will remain intact.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInvalidDialog(null)}
                  disabled={invalidating}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => invalidateForm(showInvalidDialog)}
                  disabled={invalidating}
                >
                  {invalidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Invalidating...
                    </>
                  ) : (
                    <>
                      <Ban className="mr-2 h-4 w-4" />
                      Make Invalid
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminView;
