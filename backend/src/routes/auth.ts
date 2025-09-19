import express from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { User, UserRole } from '../models/User';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { hashPassword, verifyPassword, createAccessToken, authenticateToken, AuthenticatedRequest } from '../utils/auth';
import { validateUserCreate, validateUserLogin } from '../utils/validation';
import { emailService } from '../services/emailService';

const router = express.Router();

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register endpoint - POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { error, value } = validateUserCreate(req.body);
    if (error) {
      return res.status(400).json({ detail: error.details[0].message });
    }

    const { username, email, password, role } = value;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ detail: 'Username or email already registered' });
    }

    // Create new user
    const hashedPasswordValue = await hashPassword(password);
    const userId = uuidv4();

    const user = new User({
      id: userId,
      username,
      email,
      hashedPassword: hashedPasswordValue,
      role
    });

    await user.save();

    // Create access token
    const accessToken = createAccessToken({
      sub: userId,
      role: role
    });

    return res.json({
      access_token: accessToken,
      token_type: 'bearer',
      role: role,
      user_id: userId,
      name: username // For regular registration, use username as name
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Login endpoint - POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { error, value } = validateUserLogin(req.body);
    if (error) {
      return res.status(400).json({ detail: error.details[0].message });
    }

    const { username, password } = value;

    // Find user
    const user = await User.findOne({ username });
    if (!user || !(await verifyPassword(password, user.hashedPassword))) {
      return res.status(401).json({ detail: 'Incorrect username or password' });
    }

    // Create access token
    const accessToken = createAccessToken({
      sub: user.id,
      role: user.role
    });

    return res.json({
      access_token: accessToken,
      token_type: 'bearer',
      role: user.role,
      user_id: user.id,
      name: user.name || user.username // Return name or fallback to username
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get current user info - GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await User.findOne({ id: req.user?.userId });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name || user.username
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Google OAuth login - POST /api/auth/google-login
router.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ detail: 'Google credential is required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ detail: 'Invalid Google token' });
    }

    const { email, name, sub: googleId } = payload;
    
    if (!email || !name) {
      return res.status(400).json({ detail: 'Insufficient Google profile information' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with Google account
      const userId = uuidv4();
      user = new User({
        id: userId,
        username: email.split('@')[0] + '_' + Date.now(), // Generate unique username
        email,
        hashedPassword: '', // Empty password for Google users
        role: UserRole.ADMIN, // Default to admin for now
        googleId,
        name // Store the actual name from Google
      });
      
      await user.save();
    } else if (!user.name && name) {
      // Update existing user with name if they don't have one
      user.name = name;
      await user.save();
    }

    // Create access token
    const accessToken = createAccessToken({
      sub: user.id,
      role: user.role
    });

    return res.json({
      access_token: accessToken,
      token_type: 'bearer',
      role: user.role,
      user_id: user.id,
      name: user.name || user.username // Return name or fallback to username
    });

  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ detail: 'Google authentication failed' });
  }
});

// Forgot password - POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.trim()) {
      return res.status(400).json({ detail: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user.id });

    // Create new reset token
    const passwordResetToken = new PasswordResetToken({
      userId: user.id,
      token: resetToken,
      expiresAt
    });

    await passwordResetToken.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.username);

    console.log(`Password reset email sent to: ${user.email}`);
    
    return res.json({ 
      message: 'If an account with that email exists, a reset link has been sent.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Verify reset token - GET /api/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ detail: 'Reset token is required' });
    }

    // Find valid token
    const resetToken = await PasswordResetToken.findOne({
      token,
      expiresAt: { $gt: new Date() },
      isUsed: false
    });

    if (!resetToken) {
      return res.status(400).json({ detail: 'Invalid or expired reset token' });
    }

    return res.json({ valid: true });

  } catch (error) {
    console.error('Verify reset token error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

// Reset password - POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ detail: 'Reset token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ detail: 'Password must be at least 6 characters long' });
    }

    // Find valid token
    const resetToken = await PasswordResetToken.findOne({
      token,
      expiresAt: { $gt: new Date() },
      isUsed: false
    });

    if (!resetToken) {
      return res.status(400).json({ detail: 'Invalid or expired reset token' });
    }

    // Find user
    const user = await User.findOne({ id: resetToken.userId });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await User.updateOne(
      { id: user.id },
      { hashedPassword }
    );

    // Mark token as used
    await PasswordResetToken.updateOne(
      { _id: resetToken._id },
      { isUsed: true }
    );

    console.log(`Password reset completed for user: ${user.email}`);
    
    return res.json({ 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;
