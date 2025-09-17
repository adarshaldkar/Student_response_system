import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  id: string;
  senderId: string;
  senderUsername: string;
  receiverId: string;
  receiverUsername: string;
  message: string;
  sentAt: Date;
  readAt?: Date;
  isRead: boolean;
}

const ChatSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
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
  message: {
    type: String,
    required: true,
    trim: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

// Create indexes for better performance
ChatSchema.index({ senderId: 1, receiverId: 1, sentAt: -1 });
ChatSchema.index({ receiverId: 1, isRead: 1 });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
