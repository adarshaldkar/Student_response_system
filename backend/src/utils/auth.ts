import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../models/User';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const ACCESS_TOKEN_EXPIRE_MINUTES = 30;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const createAccessToken = (data: any): string => {
  const expiresIn = `${ACCESS_TOKEN_EXPIRE_MINUTES}m`;
  return jwt.sign(data, SECRET_KEY, { expiresIn });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  req.user = {
    userId: payload.sub,
    role: payload.role
  };

  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ detail: 'Not enough permissions' });
  }
  next();
};