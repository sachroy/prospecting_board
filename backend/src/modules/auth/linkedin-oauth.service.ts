import axios from 'axios';
import { logger } from '../../utils/logger';

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
}

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class LinkedInOAuthService {
  private readonly CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  private readonly CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  private readonly REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
  private readonly SCOPE = 'r_liteprofile r_emailaddress w_member_social';

  /**
   * Generate LinkedIn OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID!,
      redirect_uri: this.REDIRECT_URI!,
      state: state,
      scope: this.SCOPE
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
    try {
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code: code,
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            redirect_uri: this.REDIRECT_URI
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      logger.info('LinkedIn token exchange successful');
      return response.data;
    } catch (error) {
      logger.error('LinkedIn token exchange failed', { error });
      throw new Error('Failed to exchange LinkedIn authorization code');
    }
  }

  /**
   * Get LinkedIn profile information
   */
  async getProfile(accessToken: string): Promise<LinkedInProfile> {
    try {
      const [profileResponse, emailResponse] = await Promise.all([
        axios.get('https://api.linkedin.com/v2/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }),
        axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      ]);

      const profile = profileResponse.data;
      const email = emailResponse.data?.elements?.[0]?.['handle~']?.emailAddress;

      return {
        id: profile.id,
        firstName: profile.localizedFirstName || profile.firstName?.localized?.en_US,
        lastName: profile.localizedLastName || profile.lastName?.localized?.en_US,
        email: email,
        profilePicture: profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
      };
    } catch (error) {
      logger.error('Failed to fetch LinkedIn profile', { error });
      throw new Error('Failed to fetch LinkedIn profile');
    }
  }

  /**
   * Generate LinkedIn search URL for people
   */
  generateSearchUrl(company: string, role: string): string {
    const searchQuery = `${role} at ${company}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://www.linkedin.com/search/results/people/?keywords=${encodedQuery}`;
  }

  /**
   * Generate multiple search URLs for different roles
   */
  generateMultipleSearchUrls(company: string, roles: string[]): Array<{ role: string; url: string }> {
    return roles.map(role => ({
      role,
      url: this.generateSearchUrl(company, role)
    }));
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<LinkedInTokenResponse> {
    try {
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      logger.info('LinkedIn token refresh successful');
      return response.data;
    } catch (error) {
      logger.error('LinkedIn token refresh failed', { error });
      throw new Error('Failed to refresh LinkedIn access token');
    }
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const linkedInOAuthService = new LinkedInOAuthService();

// Made with Bob