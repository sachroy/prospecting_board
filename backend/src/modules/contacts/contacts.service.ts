import { PrismaClient } from '@prisma/client';
import { linkedInService } from './linkedin.service';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

interface LinkedInSearchParams {
  company: string;
  roles: string[];
  limit?: number;
}

interface SyncContactsParams {
  customerId: string;
  company: string;
  roles: string[];
  userId: string;
}

interface ContactData {
  customerId: string;
  name: string;
  role: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  department?: string;
  responsibilities?: string;
  source?: string;
}

export class ContactsService {
  /**
   * Search LinkedIn for contacts
   */
  async searchLinkedInContacts(params: LinkedInSearchParams) {
    try {
      const contacts = await linkedInService.searchContacts(params);
      return contacts;
    } catch (error) {
      logger.error('Error searching LinkedIn contacts', { error, params });
      throw new Error('Failed to search LinkedIn contacts');
    }
  }

  /**
   * Get contacts for a customer
   */
  async getContactsByCustomer(customerId: string, userId: string) {
    try {
      // Verify customer belongs to user
      const customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          userId: userId
        }
      });

      if (!customer) {
        throw new Error('Customer not found or access denied');
      }

      const contacts = await prisma.contact.findMany({
        where: {
          customerId: customerId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return contacts;
    } catch (error) {
      logger.error('Error fetching customer contacts', { error, customerId, userId });
      throw error;
    }
  }

  /**
   * Create a new contact
   */
  async createContact(contactData: ContactData, userId: string) {
    try {
      // Verify customer belongs to user
      const customer = await prisma.customer.findFirst({
        where: {
          id: contactData.customerId,
          userId: userId
        }
      });

      if (!customer) {
        throw new Error('Customer not found or access denied');
      }

      const contact = await prisma.contact.create({
        data: {
          customerId: contactData.customerId,
          name: contactData.name,
          role: contactData.role,
          email: contactData.email,
          linkedinUrl: contactData.linkedinUrl,
          phone: contactData.phone,
          department: contactData.department,
          responsibilities: contactData.responsibilities,
          source: contactData.source || 'manual'
        }
      });

      logger.info('Contact created', { contactId: contact.id, customerId: contactData.customerId });
      return contact;
    } catch (error) {
      logger.error('Error creating contact', { error, contactData });
      throw error;
    }
  }

  /**
   * Update a contact
   */
  async updateContact(contactId: string, updates: Partial<ContactData>, userId: string) {
    try {
      // Verify contact belongs to user's customer
      const existingContact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          customer: {
            userId: userId
          }
        }
      });

      if (!existingContact) {
        throw new Error('Contact not found or access denied');
      }

      const contact = await prisma.contact.update({
        where: {
          id: contactId
        },
        data: updates
      });

      logger.info('Contact updated', { contactId, userId });
      return contact;
    } catch (error) {
      logger.error('Error updating contact', { error, contactId });
      throw error;
    }
  }

  /**
   * Delete a contact
   */
  async deleteContact(contactId: string, userId: string) {
    try {
      // Verify contact belongs to user's customer
      const existingContact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          customer: {
            userId: userId
          }
        }
      });

      if (!existingContact) {
        throw new Error('Contact not found or access denied');
      }

      await prisma.contact.delete({
        where: {
          id: contactId
        }
      });

      logger.info('Contact deleted', { contactId, userId });
    } catch (error) {
      logger.error('Error deleting contact', { error, contactId });
      throw error;
    }
  }

  /**
   * Get LinkedIn profile details
   */
  async getLinkedInProfile(linkedinUrl: string) {
    try {
      if (!linkedInService.isValidLinkedInUrl(linkedinUrl)) {
        throw new Error('Invalid LinkedIn URL');
      }

      const profile = await linkedInService.getContactDetails(linkedinUrl);
      return profile;
    } catch (error) {
      logger.error('Error fetching LinkedIn profile', { error, linkedinUrl });
      throw error;
    }
  }

  /**
   * Sync contacts from LinkedIn and save to database
   */
  async syncContactsFromLinkedIn(params: SyncContactsParams) {
    try {
      const { customerId, company, roles, userId } = params;

      // Verify customer belongs to user
      const customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          userId: userId
        }
      });

      if (!customer) {
        throw new Error('Customer not found or access denied');
      }

      // Search LinkedIn for contacts
      const linkedInContacts = await linkedInService.searchContacts({
        company,
        roles,
        limit: 5
      });

      // Save contacts to database
      const savedContacts = [];

      for (const linkedInContact of linkedInContacts) {
        try {
          // Check if contact already exists
          const existingContact = await prisma.contact.findFirst({
            where: {
              customerId: customerId,
              linkedinUrl: linkedInContact.linkedinUrl
            }
          });

          if (existingContact) {
            // Update existing contact
            const updated = await prisma.contact.update({
              where: {
                id: existingContact.id
              },
              data: {
                name: linkedInContact.name,
                role: linkedInContact.role,
                responsibilities: linkedInContact.summary,
                source: 'linkedin'
              }
            });
            savedContacts.push(updated);
          } else {
            // Create new contact
            const created = await prisma.contact.create({
              data: {
                customerId: customerId,
                name: linkedInContact.name,
                role: linkedInContact.role,
                linkedinUrl: linkedInContact.linkedinUrl,
                responsibilities: linkedInContact.summary,
                source: 'linkedin'
              }
            });
            savedContacts.push(created);
          }
        } catch (error) {
          logger.error('Error saving individual contact', { error, contact: linkedInContact });
          // Continue with other contacts
        }
      }

      logger.info('Contacts synced from LinkedIn', {
        customerId,
        company,
        count: savedContacts.length
      });

      return savedContacts;
    } catch (error) {
      logger.error('Error syncing contacts from LinkedIn', { error, params });
      throw error;
    }
  }

  /**
   * Get contacts grouped by department/role
   */
  async getContactsGroupedByRole(customerId: string, userId: string) {
    try {
      const contacts = await this.getContactsByCustomer(customerId, userId);

      // Group contacts by role/department
      const grouped: Record<string, any[]> = {};

      contacts.forEach(contact => {
        const key = contact.department || contact.role || 'Other';
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(contact);
      });

      return grouped;
    } catch (error) {
      logger.error('Error grouping contacts', { error, customerId });
      throw error;
    }
  }
}

export const contactsService = new ContactsService();

// Made with Bob