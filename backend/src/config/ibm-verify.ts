/**
 * IBM Verify Configuration
 * OAuth 2.0 / OpenID Connect setup for IBM Security Verify
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface IBMVerifyConfig {
  tenantUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  tokenEndpoint: string;
  authEndpoint: string;
  userInfoEndpoint: string;
}

export interface IBMVerifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope: string;
}

export interface IBMVerifyUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  preferred_username?: string;
}

class IBMVerifyService {
  private config: IBMVerifyConfig;
  private httpClient: AxiosInstance;

  constructor() {
    this.config = {
      tenantUrl: process.env.IBM_VERIFY_TENANT_URL || '',
      clientId: process.env.IBM_VERIFY_CLIENT_ID || '',
      clientSecret: process.env.IBM_VERIFY_CLIENT_SECRET || '',
      redirectUri: process.env.IBM_VERIFY_REDIRECT_URI || '',
      scope: process.env.IBM_VERIFY_SCOPE || 'openid profile email',
      tokenEndpoint: process.env.IBM_VERIFY_TOKEN_ENDPOINT || '/v1.0/endpoint/default/token',
      authEndpoint: process.env.IBM_VERIFY_AUTH_ENDPOINT || '/v1.0/endpoint/default/authorize',
      userInfoEndpoint: process.env.IBM_VERIFY_USERINFO_ENDPOINT || '/v1.0/endpoint/default/userinfo',
    };

    this.validateConfig();

    this.httpClient = axios.create({
      baseURL: this.config.tenantUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  private validateConfig(): void {
    const requiredFields: (keyof IBMVerifyConfig)[] = [
      'tenantUrl',
      'clientId',
      'clientSecret',
      'redirectUri',
    ];

    const missingFields = requiredFields.filter(field => !this.config[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required IBM Verify configuration: ${missingFields.join(', ')}`
      );
    }

    logger.info('IBM Verify configuration validated successfully');
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      ...(state && { state }),
    });

    const authUrl = `${this.config.tenantUrl}${this.config.authEndpoint}?${params.toString()}`;
    logger.debug('Generated IBM Verify authorization URL', { state });
    
    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<IBMVerifyTokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      });

      const response = await this.httpClient.post<IBMVerifyTokenResponse>(
        this.config.tokenEndpoint,
        params.toString()
      );

      logger.info('Successfully exchanged authorization code for token');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to exchange code for token', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Failed to authenticate with IBM Verify');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<IBMVerifyTokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      const response = await this.httpClient.post<IBMVerifyTokenResponse>(
        this.config.tokenEndpoint,
        params.toString()
      );

      logger.info('Successfully refreshed access token');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to refresh access token', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Failed to refresh IBM Verify token');
    }
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<IBMVerifyUserInfo> {
    try {
      const response = await this.httpClient.get<IBMVerifyUserInfo>(
        this.config.userInfoEndpoint,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      logger.info('Successfully retrieved user info from IBM Verify', {
        userId: response.data.sub,
      });
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get user info', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Failed to retrieve user information from IBM Verify');
    }
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      logger.warn('Token validation failed', { error });
      return false;
    }
  }

  /**
   * Revoke token (logout)
   */
  async revokeToken(token: string, tokenTypeHint: 'access_token' | 'refresh_token' = 'access_token'): Promise<void> {
    try {
      const params = new URLSearchParams({
        token,
        token_type_hint: tokenTypeHint,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      await this.httpClient.post(
        '/v1.0/endpoint/default/revoke',
        params.toString()
      );

      logger.info('Successfully revoked token');
    } catch (error: any) {
      logger.error('Failed to revoke token', {
        error: error.message,
        response: error.response?.data,
      });
      // Don't throw error - revocation failure shouldn't block logout
    }
  }

  /**
   * Get configuration (for debugging)
   */
  getConfig(): Partial<IBMVerifyConfig> {
    return {
      tenantUrl: this.config.tenantUrl,
      clientId: this.config.clientId,
      redirectUri: this.config.redirectUri,
      scope: this.config.scope,
      // Don't expose client secret
    };
  }
}

// Export singleton instance
export const ibmVerifyService = new IBMVerifyService();

// Made with Bob
