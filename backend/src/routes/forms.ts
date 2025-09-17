import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FeedbackForm } from '../models/FeedbackForm';
import { StudentFeedback } from '../models/StudentFeedback';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../utils/auth';
import { validateFeedbackFormCreate, validateFeedbackFormUpdate } from '../utils/validation';

const router = express.Router();

// Create feedback form - POST /api/forms (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { error, value } = validateFeedbackFormCreate(req.body);
    if (error) {
      return res.status(400).json({ detail: error.details[0].message });
    }

    const { title, year, section, department, subjects, evaluation_criteria } = value;
    const formId = uuidv4();

    // Generate shareable link
    const baseUrl = process.env.FRONTEND_URL;
    const shareableLink = `${baseUrl}/#/student/${formId}`;

    const form = new FeedbackForm({
      id: formId,
      title,
      year,
      section,
      department,
      subjects,
      evaluationCriteria: evaluation_criteria,
      createdBy: req.user?.userId,
      shareableLink
    });

    await form.save();

    const response = {
      id: form.id,
      title: form.title,
      year: form.year,
      section: form.section,
      department: form.department,
      subjects: form.subjects,
      evaluation_criteria: form.evaluationCriteria,
      created_by: form.createdBy,
      created_at: form.createdAt,
      is_active: form.isActive,
      shareable_link: form.shareableLink,
      response_count: 0
    };

    return res.json(response);

  } catch (error) {
    console.error('Create form error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get all feedback forms for current admin - GET /api/forms (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const forms = await FeedbackForm.find({
      createdBy: req.user?.userId,
      isActive: true
    });

    const formResponses = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await StudentFeedback.countDocuments({ formId: form.id });
        
        return {
          id: form.id,
          title: form.title,
          year: form.year,
          section: form.section,
          department: form.department,
          subjects: form.subjects,
          evaluation_criteria: form.evaluationCriteria,
          created_by: form.createdBy,
          created_at: form.createdAt,
          is_active: form.isActive,
          shareable_link: form.shareableLink,
          response_count: responseCount
        };
      })
    );

    return res.json(formResponses);

  } catch (error) {
    console.error('Get forms error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get feedback form by ID - GET /api/forms/:formId (Public for students)
router.get('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await FeedbackForm.findOne({
      id: formId,
      isActive: true
    });

    if (!form) {
      return res.status(404).json({ detail: 'Feedback form not found' });
    }

    const responseCount = await StudentFeedback.countDocuments({ formId });

    const response = {
      id: form.id,
      title: form.title,
      year: form.year,
      section: form.section,
      department: form.department,
      subjects: form.subjects,
      evaluation_criteria: form.evaluationCriteria,
      created_by: form.createdBy,
      created_at: form.createdAt,
      is_active: form.isActive,
      shareable_link: form.shareableLink,
      response_count: responseCount
    };

    return res.json(response);

  } catch (error) {
    console.error('Get form by ID error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Update feedback form - PUT /api/forms/:formId (Admin only)
router.put('/:formId', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { formId } = req.params;
    const { error, value } = validateFeedbackFormUpdate(req.body);
    
    if (error) {
      return res.status(400).json({ detail: error.details[0].message });
    }

    const existingForm = await FeedbackForm.findOne({
      id: formId,
      createdBy: req.user?.userId
    });

    if (!existingForm) {
      return res.status(404).json({ detail: 'Feedback form not found' });
    }

    // Update form
    const updateData: any = {};
    if (value.title) updateData.title = value.title;
    if (value.year) updateData.year = value.year;
    if (value.section) updateData.section = value.section;
    if (value.department) updateData.department = value.department;
    if (value.subjects) updateData.subjects = value.subjects;
    if (value.evaluation_criteria) updateData.evaluationCriteria = value.evaluation_criteria;
    if (value.is_active !== undefined) updateData.isActive = value.is_active;

    await FeedbackForm.updateOne({ id: formId }, { $set: updateData });

    const updatedForm = await FeedbackForm.findOne({ id: formId });
    const responseCount = await StudentFeedback.countDocuments({ formId });

    const response = {
      id: updatedForm!.id,
      title: updatedForm!.title,
      year: updatedForm!.year,
      section: updatedForm!.section,
      department: updatedForm!.department,
      subjects: updatedForm!.subjects,
      evaluation_criteria: updatedForm!.evaluationCriteria,
      created_by: updatedForm!.createdBy,
      created_at: updatedForm!.createdAt,
      is_active: updatedForm!.isActive,
      shareable_link: updatedForm!.shareableLink,
      response_count: responseCount
    };

    return res.json(response);

  } catch (error) {
    console.error('Update form error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Delete feedback form - DELETE /api/forms/:formId (Admin only)
router.delete('/:formId', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { formId } = req.params;

    const existingForm = await FeedbackForm.findOne({
      id: formId,
      createdBy: req.user?.userId
    });

    if (!existingForm) {
      return res.status(404).json({ detail: 'Feedback form not found' });
    }

    // Soft delete - mark as inactive
    await FeedbackForm.updateOne({ id: formId }, { $set: { isActive: false } });

    return res.json({ message: 'Feedback form deleted successfully' });

  } catch (error) {
    console.error('Delete form error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;