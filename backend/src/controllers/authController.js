import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../db/index.js';
import { logger } from '../utils/logger.js';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.enum(['analyst', 'reviewer', 'admin']).optional().default('analyst'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'docupulse_super_secret_jwt_key_2026_idp_secure!';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

export const register = async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email, password, name, role } = parseResult.data;

    const existingUser = await db.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await db.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'analyst',
      },
    });

    const token = generateToken(user);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Registration failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Internal server error during registration',
    });
  }
};

export const login = async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parseResult.data;

    const user = await db.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Internal server error during login',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get profile failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Internal server error fetching user profile',
    });
  }
};

// Auto seed demo user if none exists
export const initDemoUser = async () => {
  try {
    const demoEmail = 'demo@docupulse.ai';
    const existing = await db.users.findUnique({ where: { email: demoEmail } });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('DocuPulse2026!', salt);
      await db.users.create({
        data: {
          email: demoEmail,
          password: hashedPassword,
          name: 'Sarah Connor (Lead IDP Analyst)',
          role: 'admin',
        },
      });
      logger.info('Initialized default demo account: demo@docupulse.ai / DocuPulse2026!');
    }
  } catch (e) {
    logger.warn('Could not init demo user', { error: e.message });
  }
};
