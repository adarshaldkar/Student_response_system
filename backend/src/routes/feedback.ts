import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FeedbackForm } from '../models/FeedbackForm';
import { StudentFeedback } from '../models/StudentFeedback';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../utils/auth';
import { validateStudentFeedbackCreate } from '../utils/validation';

const router = express.Router();

// Submit feedback - POST /api/feedback (Public for students)
router.post('/', async (req, res) => {
  try {
    const { error, value } = validateStudentFeedbackCreate(req.body);
    if (error) {
      return res.status(400).json({ detail: error.details[0].message });
    }

    const { form_id, student_id, student_name, ratings, comments } = value;

    // Check if form exists and is active
    const form = await FeedbackForm.findOne({
      id: form_id,
      isActive: true
    });

    if (!form) {
      return res.status(404).json({ detail: 'Feedback form not found' });
    }

    // Check if student has already submitted feedback for this form
    const existingFeedback = await StudentFeedback.findOne({
      formId: form_id,
      studentId: student_id
    });

    if (existingFeedback) {
      return res.status(400).json({ 
        detail: 'You have already submitted feedback for this form' 
      });
    }

    // Calculate averages for each subject
    const averages: { [subject: string]: number } = {};
    for (const [subject, subjectRatings] of Object.entries(ratings)) {
      const ratingsObj = subjectRatings as { [criteria: string]: number };
      const ratingsValues = Object.values(ratingsObj);
      if (ratingsValues.length > 0) {
        averages[subject] = ratingsValues.reduce((sum, rating) => sum + rating, 0) / ratingsValues.length;
      }
    }

    // Create feedback
    const feedbackId = uuidv4();
    const feedback = new StudentFeedback({
      id: feedbackId,
      formId: form_id,
      studentId: student_id,
      studentName: student_name,
      ratings,
      comments,
      averages
    });

    await feedback.save();

    const response = {
      id: feedback.id,
      form_id: feedback.formId,
      student_id: feedback.studentId,
      student_name: feedback.studentName,
      ratings: feedback.ratings,
      comments: feedback.comments,
      submitted_at: feedback.submittedAt,
      averages: feedback.averages
    };

    return res.json(response);

  } catch (error) {
    console.error('Submit feedback error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get form feedback summary - GET /api/forms/:formId/feedback (Admin only)
router.get('/:formId/feedback', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { formId } = req.params;

    // Check if form exists and belongs to current user
    const form = await FeedbackForm.findOne({
      id: formId,
      createdBy: req.user?.userId
    });

    if (!form) {
      return res.status(404).json({ detail: 'Feedback form not found' });
    }

    // Get all feedbacks for this form
    const feedbacks = await StudentFeedback.find({ formId });

    // Collect ratings for average calculation
    const subjectRatings: { [subject: string]: number[] } = {};
    
    feedbacks.forEach(feedback => {
      for (const [subject, avgRating] of Object.entries(feedback.averages)) {
        if (!subjectRatings[subject]) {
          subjectRatings[subject] = [];
        }
        subjectRatings[subject].push(avgRating as number);
      }
    });

    // Calculate average ratings per subject
    const averageRatingsPerSubject: { [subject: string]: number } = {};
    for (const [subject, ratings] of Object.entries(subjectRatings)) {
      averageRatingsPerSubject[subject] = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
    }

    const formattedFeedbacks = feedbacks.map(feedback => ({
      id: feedback.id,
      form_id: feedback.formId,
      student_id: feedback.studentId,
      student_name: feedback.studentName,
      ratings: feedback.ratings,
      comments: feedback.comments,
      submitted_at: feedback.submittedAt,
      averages: feedback.averages
    }));

    const response = {
      form_id: formId,
      form_title: form.title,
      year: form.year,
      section: form.section,
      department: form.department,
      total_responses: feedbacks.length,
      average_ratings_per_subject: averageRatingsPerSubject,
      feedbacks: formattedFeedbacks
    };

    return res.json(response);

  } catch (error) {
    console.error('Get form feedback error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;