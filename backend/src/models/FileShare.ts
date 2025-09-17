import mongoose, { Document, Schema } from 'mongoose';

export enum FileShareStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  VIEWED = 'viewed'
}

export interface IFileShare extends Document {
  id: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  senderId: string;
  senderUsername: string;
  receiverId: string;
  receiverUsername: string;
  status: FileShareStatus;
  message?: string;
  sentAt: Date;
  deliveredAt?: Date;
  viewedAt?: Date;
}

const FileShareSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderUsername: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  receiverUsername: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(FileShareStatus),
    default: FileShareStatus.PENDING
  },
  message: {
    type: String,
    trim: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  },
  viewedAt: {
    type: Date
  }
});

// Create indexes for better performance
FileShareSchema.index({ senderId: 1, sentAt: -1 });
FileShareSchema.index({ receiverId: 1, sentAt: -1 });
FileShareSchema.index({ status: 1 });

export const FileShare = mongoose.model<IFileShare>('FileShare', FileShareSchema);
