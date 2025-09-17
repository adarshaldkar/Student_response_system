import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../models/User';
import { hashPassword, verifyPassword, createAccessToken, authenticateToken, AuthenticatedRequest } from '../utils/auth';
import { validateUserCreate, validateUserLogin } from '../utils/validation';

const router = express.Router();

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
      user_id: userId
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
      user_id: user.id
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
      role: user.role
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;