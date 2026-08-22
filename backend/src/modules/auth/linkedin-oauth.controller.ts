import { Request, Response, NextFunction } from 'express';
import { linkedInOAuthService } from './linkedin-oauth.service';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

export class LinkedInOAuthController {
  /**
   * Initiate LinkedIn OAuth flow
   * GET /api/v1/auth/linkedin/login
   */
  async initiateLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Generate state for CSRF protection
      const state = crypto.randomBytes(16).toString('hex');
      
      // Store state in session or database
      // For now, we'll send it to client to store
      const authUrl = linkedInOAuthService.getAuthorizationUrl(state);

      logger.info('LinkedIn OAuth initiated', { userId: req.user?.id });

      res.json({
        success: true,
        data: {
          authUrl,
          state
        }
      });
    } catch (error) {
      logger.error('Error initiating LinkedIn OAuth', { error });
      next(error);
    }
  }

  /**
   * Handle LinkedIn OAuth callback
   * GET /api/v1/auth/linkedin/callback
   */
  async handleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, state: _state } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Authorization code is required'
        });
        return;
      }

      // TODO: Validate state for CSRF protection

      // Exchange code for access token
      const tokenData = await linkedInOAuthService.exchangeCodeForToken(code);

      // Get LinkedIn profile
      const profile = await linkedInOAuthService.getProfile(tokenData.access_token);

      // Store tokens in database (encrypted)
      // TODO: Implement token storage

      logger.info('LinkedIn OAuth successful', { 
        linkedInId: profile.id,
        userId: req.user?.id 
      });

      res.json({
        success: true,
        data: {
          profile,
          accessToken: tokenData.access_token,
          expiresIn: tokenData.expires_in
        }
      });
    } catch (error) {
      logger.error('Error in LinkedIn OAuth callback', { error });
      next(error);
    }
  }

  /**
   * Generate LinkedIn search URLs
   * POST /api/v1/auth/linkedin/search-urls
   */
  async generateSearchUrls(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { company, roles } = req.body;

      if (!company || !roles || !Array.isArray(roles)) {
        res.status(400).json({
          success: false,
          error: 'Company name and roles array are required'
        });
        return;
      }

      const searchUrls = linkedInOAuthService.generateMultipleSearchUrls(company, roles);

      logger.info('Generated LinkedIn search URLs', { 
        company, 
        roleCount: roles.length,
        userId: req.user?.id 
      });

      res.json({
        success: true,
        data: searchUrls
      });
    } catch (error) {
      logger.error('Error generating search URLs', { error });
      next(error);
    }
  }

  /**
   * Validate LinkedIn token
   * GET /api/v1/auth/linkedin/validate
   */
  async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Access token is required'
        });
        return;
      }

      const isValid = await linkedInOAuthService.validateToken(token);

      res.json({
        success: true,
        data: {
          valid: isValid
        }
      });
    } catch (error) {
      logger.error('Error validating LinkedIn token', { error });
      next(error);
    }
  }

  /**
   * Refresh LinkedIn token
   * POST /api/v1/auth/linkedin/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
        return;
      }

      const tokenData = await linkedInOAuthService.refreshAccessToken(refreshToken);

      logger.info('LinkedIn token refreshed', { userId: req.user?.id });

      res.json({
        success: true,
        data: {
          accessToken: tokenData.access_token,
          expiresIn: tokenData.expires_in
        }
      });
    } catch (error) {
      logger.error('Error refreshing LinkedIn token', { error });
      next(error);
    }
  }
}

export const linkedInOAuthController = new LinkedInOAuthController();

// Made with Bob