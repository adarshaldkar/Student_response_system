import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedbackForm extends Document {
  id: string;
  title: string;
  year: string;
  section: string;
  department: string;
  subjects: string[];
  evaluationCriteria: string[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  shareableLink: string;
}

const FeedbackFormSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  subjects: [{
    type: String,
    required: true,
    trim: true
  }],
  evaluationCriteria: [{
    type: String,
    required: true,
    trim: true
  }],
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  shareableLink: {
    type: String,
    default: ''
  }
});

// Create indexes
FeedbackFormSchema.index({ createdBy: 1 });
FeedbackFormSchema.index({ isActive: 1 });

export const FeedbackForm = mongoose.model<IFeedbackForm>('FeedbackForm', FeedbackFormSchema);