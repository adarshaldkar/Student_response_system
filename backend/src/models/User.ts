import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student'
}

export interface IUser extends Document {
  id: string;
  username: string;
  email: string;
  hashedPassword: string;
  role: UserRole;
  googleId?: string;
  name?: string; // Display name for users, especially Google users
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  hashedPassword: {
    type: String,
    required: false // Optional for Google users
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  name: {
    type: String,
    trim: true // Display name for the user
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);