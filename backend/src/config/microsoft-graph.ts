/**
 * Microsoft Graph API Configuration
 * Integration with Microsoft Outlook for email functionality
 */

import { ConfidentialClientApplication, AuthorizationUrlRequest, AuthorizationCodeRequest } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { logger } from '../utils/logger';

export interface MSGraphConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  authority: string;
  scopes: string[];
}

export interface MSGraphTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresOn: Date;
  scopes: string[];
}

class MicrosoftGraphService {
  private config: MSGraphConfig;
  private msalClient!: ConfidentialClientApplication;

  constructor() {
    this.config = {
      clientId: process.env.MS_CLIENT_ID || '',
      clientSecret: process.env.MS_CLIENT_SECRET || '',
      tenantId: process.env.MS_TENANT_ID || '',
      redirectUri: process.env.MS_REDIRECT_URI || '',
      authority: process.env.MS_AUTHORITY || `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}`,
      scopes: (process.env.MS_SCOPES || 'Mail.Send Mail.Read User.Read').split(' '),
    };

    this.validateConfig();
    this.initializeMSAL();
  }

  private validateConfig(): void {
    const requiredFields: (keyof MSGraphConfig)[] = [
      'clientId',
      'clientSecret',
      'tenantId',
      'redirectUri',
    ];

    const missingFields = requiredFields.filter(field => !this.config[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required Microsoft Graph configuration: ${missingFields.join(', ')}`
      );
    }

    logger.info('Microsoft Graph configuration validated successfully');
  }

  private initializeMSAL(): void {
    const msalConfig = {
      auth: {
        clientId: this.config.clientId,
        authority: this.config.authority,
        clientSecret: this.config.clientSecret,
      },
      system: {
        loggerOptions: {
          loggerCallback: (_level: any, message: string, containsPii: boolean) => {
            if (containsPii) return;
            logger.debug(`MSAL: ${message}`);
          },
          piiLoggingEnabled: false,
          logLevel: 3, // Info level
        },
      },
    };

    this.msalClient = new ConfidentialClientApplication(msalConfig);
    logger.info('MSAL client initialized successfully');
  }

  /**
   * Generate authorization URL for Microsoft OAuth flow
   */
  async getAuthorizationUrl(state?: string): Promise<string> {
    try {
      const authCodeUrlParameters: AuthorizationUrlRequest = {
        scopes: this.config.scopes,
        redirectUri: this.config.redirectUri,
        ...(state && { state }),
      };

      const authUrl = await this.msalClient.getAuthCodeUrl(authCodeUrlParameters);
      logger.debug('Generated Microsoft authorization URL', { state });
      
      return authUrl;
    } catch (error: any) {
      logger.error('Failed to generate Microsoft authorization URL', { error: error.message });
      throw new Error('Failed to generate Microsoft authorization URL');
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<MSGraphTokenResponse> {
    try {
      const tokenRequest: AuthorizationCodeRequest = {
        code,
        scopes: this.config.scopes,
        redirectUri: this.config.redirectUri,
      };

      const response = await this.msalClient.acquireTokenByCode(tokenRequest);

      if (!response) {
        throw new Error('No token response received');
      }

      logger.info('Successfully exchanged authorization code for Microsoft token');

      return {
        accessToken: response.accessToken,
        refreshToken: undefined, // MSAL handles refresh tokens internally
        expiresOn: response.expiresOn || new Date(Date.now() + 3600000),
        scopes: response.scopes || this.config.scopes,
      };
    } catch (error: any) {
      logger.error('Failed to exchange code for Microsoft token', {
        error: error.message,
      });
      throw new Error('Failed to authenticate with Microsoft');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<MSGraphTokenResponse> {
    try {
      const refreshTokenRequest = {
        refreshToken,
        scopes: this.config.scopes,
      };

      const response = await this.msalClient.acquireTokenByRefreshToken(refreshTokenRequest);

      if (!response) {
        throw new Error('No token response received');
      }

      logger.info('Successfully refreshed Microsoft access token');

      return {
        accessToken: response.accessToken,
        refreshToken: undefined, // MSAL handles refresh tokens internally
        expiresOn: response.expiresOn || new Date(Date.now() + 3600000),
        scopes: response.scopes || this.config.scopes,
      };
    } catch (error: any) {
      logger.error('Failed to refresh Microsoft access token', {
        error: error.message,
      });
      throw new Error('Failed to refresh Microsoft token');
    }
  }

  /**
   * Create authenticated Graph API client
   */
  getGraphClient(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Send email via Microsoft Graph API
   */
  async sendEmail(
    accessToken: string,
    to: string | string[],
    subject: string,
    body: string,
    isHtml: boolean = true
  ): Promise<void> {
    try {
      const client = this.getGraphClient(accessToken);

      const recipients = Array.isArray(to) ? to : [to];

      const message = {
        subject,
        body: {
          contentType: isHtml ? 'HTML' : 'Text',
          content: body,
        },
        toRecipients: recipients.map(email => ({
          emailAddress: {
            address: email,
          },
        })),
      };

      await client.api('/me/sendMail').post({
        message,
        saveToSentItems: true,
      });

      logger.info('Email sent successfully via Microsoft Graph', {
        to: recipients,
        subject,
      });
    } catch (error: any) {
      logger.error('Failed to send email via Microsoft Graph', {
        error: error.message,
        to,
        subject,
      });
      throw new Error('Failed to send email');
    }
  }

  /**
   * Get user profile from Microsoft Graph
   */
  async getUserProfile(accessToken: string): Promise<any> {
    try {
      const client = this.getGraphClient(accessToken);
      const user = await client.api('/me').get();

      logger.info('Successfully retrieved Microsoft user profile', {
        userId: user.id,
      });

      return user;
    } catch (error: any) {
      logger.error('Failed to get Microsoft user profile', {
        error: error.message,
      });
      throw new Error('Failed to retrieve user profile');
    }
  }

  /**
   * Get user's mailbox settings
   */
  async getMailboxSettings(accessToken: string): Promise<any> {
    try {
      const client = this.getGraphClient(accessToken);
      const settings = await client.api('/me/mailboxSettings').get();

      logger.info('Successfully retrieved mailbox settings');
      return settings;
    } catch (error: any) {
      logger.error('Failed to get mailbox settings', {
        error: error.message,
      });
      throw new Error('Failed to retrieve mailbox settings');
    }
  }

  /**
   * Create draft email
   */
  async createDraftEmail(
    accessToken: string,
    to: string | string[],
    subject: string,
    body: string,
    isHtml: boolean = true
  ): Promise<any> {
    try {
      const client = this.getGraphClient(accessToken);

      const recipients = Array.isArray(to) ? to : [to];

      const message = {
        subject,
        body: {
          contentType: isHtml ? 'HTML' : 'Text',
          content: body,
        },
        toRecipients: recipients.map(email => ({
          emailAddress: {
            address: email,
          },
        })),
      };

      const draft = await client.api('/me/messages').post(message);

      logger.info('Draft email created successfully', {
        draftId: draft.id,
        subject,
      });

      return draft;
    } catch (error: any) {
      logger.error('Failed to create draft email', {
        error: error.message,
      });
      throw new Error('Failed to create draft email');
    }
  }

  /**
   * Get user's recent emails
   */
  async getRecentEmails(accessToken: string, top: number = 10): Promise<any[]> {
    try {
      const client = this.getGraphClient(accessToken);
      
      const messages = await client
        .api('/me/messages')
        .top(top)
        .select('subject,from,receivedDateTime,bodyPreview')
        .orderby('receivedDateTime DESC')
        .get();

      logger.info('Successfully retrieved recent emails', {
        count: messages.value.length,
      });

      return messages.value;
    } catch (error: any) {
      logger.error('Failed to get recent emails', {
        error: error.message,
      });
      throw new Error('Failed to retrieve emails');
    }
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserProfile(accessToken);
      return true;
    } catch (error) {
      logger.warn('Microsoft token validation failed', { error });
      return false;
    }
  }

  /**
   * Get configuration (for debugging)
   */
  getConfig(): Partial<MSGraphConfig> {
    return {
      clientId: this.config.clientId,
      tenantId: this.config.tenantId,
      redirectUri: this.config.redirectUri,
      authority: this.config.authority,
      scopes: this.config.scopes,
      // Don't expose client secret
    };
  }
}

// Export singleton instance
export const microsoftGraphService = new MicrosoftGraphService();

// Made with Bob
