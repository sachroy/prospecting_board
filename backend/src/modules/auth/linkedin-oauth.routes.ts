import { Router } from 'express';
import { linkedInOAuthController } from './linkedin-oauth.controller';
import { body, query } from 'express-validator';
import { validateRequest } from '../../middleware/validation.middleware';

const router = Router();

/**
 * GET /api/v1/auth/linkedin/login
 * Initiate LinkedIn OAuth flow
 */
router.get(
  '/login',
  linkedInOAuthController.initiateLogin.bind(linkedInOAuthController)
);

/**
 * GET /api/v1/auth/linkedin/callback
 * Handle LinkedIn OAuth callback
 */
router.get(
  '/callback',
  [
    query('code').isString().notEmpty().withMessage('Authorization code is required'),
    query('state').optional().isString(),
    validateRequest
  ],
  linkedInOAuthController.handleCallback.bind(linkedInOAuthController)
);

/**
 * POST /api/v1/auth/linkedin/search-urls
 * Generate LinkedIn search URLs for roles
 */
router.post(
  '/search-urls',
  [
    body('company').isString().notEmpty().withMessage('Company name is required'),
    body('roles').isArray().notEmpty().withMessage('Roles array is required'),
    body('roles.*').isString().withMessage('Each role must be a string'),
    validateRequest
  ],
  linkedInOAuthController.generateSearchUrls.bind(linkedInOAuthController)
);

/**
 * GET /api/v1/auth/linkedin/validate
 * Validate LinkedIn access token
 */
router.get(
  '/validate',
  [
    query('token').isString().notEmpty().withMessage('Access token is required'),
    validateRequest
  ],
  linkedInOAuthController.validateToken.bind(linkedInOAuthController)
);

/**
 * POST /api/v1/auth/linkedin/refresh
 * Refresh LinkedIn access token
 */
router.post(
  '/refresh',
  [
    body('refreshToken').isString().notEmpty().withMessage('Refresh token is required'),
    validateRequest
  ],
  linkedInOAuthController.refreshToken.bind(linkedInOAuthController)
);

export default router;

// Made with Bob