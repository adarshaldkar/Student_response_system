import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentFeedback extends Document {
  id: string;
  formId: string;
  studentId: string;
  studentName?: string;
  ratings: { [subject: string]: { [criteria: string]: number } };
  comments?: string;
  submittedAt: Date;
  averages: { [subject: string]: number };
}

const StudentFeedbackSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  formId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    trim: true
  },
  ratings: {
    type: Schema.Types.Mixed,
    required: true
  },
  comments: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  averages: {
    type: Schema.Types.Mixed,
    default: {}
  }
});

// Create indexes
StudentFeedbackSchema.index({ formId: 1 });
StudentFeedbackSchema.index({ studentId: 1 });
StudentFeedbackSchema.index({ formId: 1, studentId: 1 }, { unique: true });

export const StudentFeedback = mongoose.model<IStudentFeedback>('StudentFeedback', StudentFeedbackSchema);