import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No authentication token provided.',
    });
  }

  const secret = process.env.JWT_SECRET || 'docupulse_super_secret_jwt_key_2026_idp_secure!';

  jwt.verify(token, secret, (err, decodedUser) => {
    if (err) {
      logger.warn('Invalid or expired token attempt', { error: err.message });
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired authentication token.',
      });
    }

    req.user = decodedUser;
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  const secret = process.env.JWT_SECRET || 'docupulse_super_secret_jwt_key_2026_idp_secure!';

  jwt.verify(token, secret, (err, decodedUser) => {
    if (!err) {
      req.user = decodedUser;
    } else {
      req.user = null;
    }
    next();
  });
};
