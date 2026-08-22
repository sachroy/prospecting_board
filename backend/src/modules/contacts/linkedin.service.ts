import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../../utils/logger';

export interface LinkedInContact {
  name: string;
  role: string;
  company: string;
  linkedinUrl: string;
  profileImageUrl?: string;
  location?: string;
  summary?: string;
}

export interface LinkedInSearchParams {
  company: string;
  roles: string[];
  limit?: number;
}

export class LinkedInService {
  private readonly LINKEDIN_SEARCH_URL = 'https://www.linkedin.com/search/results/people/';
  private readonly SCRAPING_BEE_API_KEY = process.env.SCRAPING_BEE_API_KEY;
  private readonly BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;

  /**
   * Search for contacts on LinkedIn based on company and roles
   */
  async searchContacts(params: LinkedInSearchParams): Promise<LinkedInContact[]> {
    try {
      logger.info('Searching LinkedIn contacts', { company: params.company, roles: params.roles });

      const contacts: LinkedInContact[] = [];

      // Search for each role
      for (const role of params.roles) {
        const roleContacts = await this.searchByRole(params.company, role, params.limit || 5);
        contacts.push(...roleContacts);
      }

      logger.info(`Found ${contacts.length} LinkedIn contacts`, { company: params.company });
      return contacts;
    } catch (error) {
      logger.error('Error searching LinkedIn contacts', { error, params });
      throw new Error('Failed to search LinkedIn contacts');
    }
  }

  /**
   * Search for contacts by specific role
   */
  private async searchByRole(company: string, role: string, limit: number): Promise<LinkedInContact[]> {
    try {
      // Use ScrapingBee or Bright Data for LinkedIn scraping
      if (this.SCRAPING_BEE_API_KEY) {
        return await this.searchWithScrapingBee(company, role, limit);
      } else if (this.BRIGHT_DATA_API_KEY) {
        return await this.searchWithBrightData(company, role, limit);
      } else {
        // Fallback to mock data for development
        logger.warn('No scraping service configured, returning mock data');
        return this.getMockContacts(company, role, limit);
      }
    } catch (error) {
      logger.error('Error searching by role', { error, company, role });
      return [];
    }
  }

  /**
   * Search using ScrapingBee API
   */
  private async searchWithScrapingBee(company: string, role: string, limit: number): Promise<LinkedInContact[]> {
    try {
      const searchQuery = `${role} at ${company}`;
      const url = `${this.LINKEDIN_SEARCH_URL}?keywords=${encodeURIComponent(searchQuery)}`;

      const response = await axios.get('https://app.scrapingbee.com/api/v1/', {
        params: {
          api_key: this.SCRAPING_BEE_API_KEY,
          url: url,
          render_js: 'true',
          premium_proxy: 'true',
          country_code: 'us'
        },
        timeout: 30000
      });

      return this.parseLinkedInSearchResults(response.data, company, role, limit);
    } catch (error) {
      logger.error('ScrapingBee error', { error, company, role });
      throw error;
    }
  }

  /**
   * Search using Bright Data API
   */
  private async searchWithBrightData(company: string, role: string, limit: number): Promise<LinkedInContact[]> {
    try {
      const searchQuery = `${role} at ${company}`;
      
      const response = await axios.post(
        'https://api.brightdata.com/datasets/v3/trigger',
        {
          dataset_id: 'gd_l7q7dkf244hwjntr0',
          endpoint: 'linkedin_people_search',
          query: searchQuery,
          limit: limit
        },
        {
          headers: {
            'Authorization': `Bearer ${this.BRIGHT_DATA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return this.parseBrightDataResults(response.data, company, role);
    } catch (error) {
      logger.error('Bright Data error', { error, company, role });
      throw error;
    }
  }

  /**
   * Parse LinkedIn search results HTML
   */
  private parseLinkedInSearchResults(html: string, company: string, role: string, limit: number): LinkedInContact[] {
    const $ = cheerio.load(html);
    const contacts: LinkedInContact[] = [];

    $('.reusable-search__result-container').each((_index, element): boolean | void => {
      if (contacts.length >= limit) {
        return false;
      }

      try {
        const $element = $(element);
        
        const name = $element.find('.entity-result__title-text a span').first().text().trim();
        const profileUrl = $element.find('.entity-result__title-text a').attr('href') || '';
        const headline = $element.find('.entity-result__primary-subtitle').text().trim();
        const location = $element.find('.entity-result__secondary-subtitle').text().trim();
        const imageUrl = $element.find('.entity-result__image img').attr('src');

        if (name && profileUrl) {
          contacts.push({
            name,
            role: headline || role,
            company,
            linkedinUrl: profileUrl.split('?')[0], // Clean URL
            profileImageUrl: imageUrl,
            location,
            summary: headline
          });
        }
      } catch (error) {
        logger.error('Error parsing LinkedIn result', { error });
      }
      
      return;
    });

    return contacts;
  }

  /**
   * Parse Bright Data API results
   */
  private parseBrightDataResults(data: any, company: string, role: string): LinkedInContact[] {
    try {
      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map((item: any) => ({
        name: item.name || item.full_name || 'Unknown',
        role: item.headline || item.title || role,
        company: item.company || company,
        linkedinUrl: item.profile_url || item.linkedin_url || '',
        profileImageUrl: item.profile_image || item.image_url,
        location: item.location || item.geo_location,
        summary: item.summary || item.headline
      }));
    } catch (error) {
      logger.error('Error parsing Bright Data results', { error });
      return [];
    }
  }

  /**
   * Get mock contacts for development/testing
   */
  private getMockContacts(company: string, role: string, limit: number): LinkedInContact[] {
    const mockData: Record<string, LinkedInContact[]> = {
      'Chief Information Officer': [
        {
          name: 'Jane Smith',
          role: 'Chief Information Officer',
          company,
          linkedinUrl: 'https://www.linkedin.com/in/janesmith',
          location: 'San Francisco, CA',
          summary: 'Leading digital transformation initiatives'
        }
      ],
      'VP of Application Development': [
        {
          name: 'John Doe',
          role: 'VP of Application Development',
          company,
          linkedinUrl: 'https://www.linkedin.com/in/johndoe',
          location: 'New York, NY',
          summary: 'Driving cloud-native application modernization'
        }
      ],
      'Chief Information Security Officer': [
        {
          name: 'Sarah Johnson',
          role: 'Chief Information Security Officer',
          company,
          linkedinUrl: 'https://www.linkedin.com/in/sarahjohnson',
          location: 'Austin, TX',
          summary: 'Implementing zero-trust security architecture'
        }
      ],
      'Director of Network Operations': [
        {
          name: 'Michael Chen',
          role: 'Director of Network Operations',
          company,
          linkedinUrl: 'https://www.linkedin.com/in/michaelchen',
          location: 'Seattle, WA',
          summary: 'Leading network automation and SDN initiatives'
        }
      ],
      'Head of Application Performance': [
        {
          name: 'Lisa Anderson',
          role: 'Head of Application Performance',
          company,
          linkedinUrl: 'https://www.linkedin.com/in/lisaanderson',
          location: 'Boston, MA',
          summary: 'Optimizing application performance and monitoring'
        }
      ]
    };

    const contacts = mockData[role] || [];
    return contacts.slice(0, limit);
  }

  /**
   * Get contact details from LinkedIn profile URL
   */
  async getContactDetails(linkedinUrl: string): Promise<LinkedInContact | null> {
    try {
      logger.info('Fetching LinkedIn profile details', { linkedinUrl });

      if (this.SCRAPING_BEE_API_KEY) {
        const response = await axios.get('https://app.scrapingbee.com/api/v1/', {
          params: {
            api_key: this.SCRAPING_BEE_API_KEY,
            url: linkedinUrl,
            render_js: 'true',
            premium_proxy: 'true'
          },
          timeout: 30000
        });

        return this.parseLinkedInProfile(response.data);
      }

      return null;
    } catch (error) {
      logger.error('Error fetching LinkedIn profile', { error, linkedinUrl });
      return null;
    }
  }

  /**
   * Parse LinkedIn profile page
   */
  private parseLinkedInProfile(html: string): LinkedInContact | null {
    try {
      const $ = cheerio.load(html);

      const name = $('.text-heading-xlarge').first().text().trim();
      const headline = $('.text-body-medium').first().text().trim();
      const location = $('.text-body-small.inline').first().text().trim();
      const imageUrl = $('.pv-top-card-profile-picture__image').attr('src');
      const about = $('.pv-about__summary-text').text().trim();

      if (!name) return null;

      return {
        name,
        role: headline,
        company: '', // Extract from headline
        linkedinUrl: '',
        profileImageUrl: imageUrl,
        location,
        summary: about
      };
    } catch (error) {
      logger.error('Error parsing LinkedIn profile', { error });
      return null;
    }
  }

  /**
   * Validate LinkedIn URL
   */
  isValidLinkedInUrl(url: string): boolean {
    const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    return linkedInPattern.test(url);
  }

  /**
   * Extract company name from LinkedIn company URL
   */
  extractCompanyFromUrl(url: string): string | null {
    const match = url.match(/linkedin\.com\/company\/([\w-]+)/);
    return match ? match[1] : null;
  }
}

export const linkedInService = new LinkedInService();

// Made with Bob