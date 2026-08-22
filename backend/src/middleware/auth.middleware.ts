import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TODO: Implement JWT verification
    // For now, this is a placeholder
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided'
      });
      return;
    }

    // Mock user for development
    req.user = {
      id: 'mock-user-id',
      email: 'user@example.com'
    };

    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if not
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Mock user for development
      req.user = {
        id: 'mock-user-id',
        email: 'user@example.com'
      };
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error', { error });
    next();
  }
};

// Made with Bob
