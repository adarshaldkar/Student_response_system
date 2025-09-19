import mongoose, { Document, Schema } from 'mongoose';

export interface IPasswordResetToken extends Document {
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
}

const PasswordResetTokenSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  isUsed: {
    type: Boolean,
    default: false
  }
});

// Create indexes
PasswordResetTokenSchema.index({ token: 1 });
PasswordResetTokenSchema.index({ userId: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 });

export const PasswordResetToken = mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
