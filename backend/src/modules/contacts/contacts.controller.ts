import { Request, Response, NextFunction } from 'express';
import { contactsService } from './contacts.service';
import { logger } from '../../utils/logger';

export class ContactsController {
  /**
   * Search for contacts on LinkedIn
   * POST /api/v1/contacts/search
   */
  async searchLinkedInContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { company, roles, limit } = req.body;

      if (!company || !roles || !Array.isArray(roles)) {
        res.status(400).json({
          success: false,
          error: 'Company name and roles array are required'
        });
        return;
      }

      logger.info('Searching LinkedIn contacts', { company, roles, userId: req.user?.id });

      const contacts = await contactsService.searchLinkedInContacts({
        company,
        roles,
        limit: limit || 5
      });

      res.json({
        success: true,
        data: contacts,
        count: contacts.length
      });
    } catch (error) {
      logger.error('Error in searchLinkedInContacts', { error });
      next(error);
    }
  }

  /**
   * Get contacts for a customer
   * GET /api/v1/contacts/:customerId
   */
  async getCustomerContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      logger.info('Fetching customer contacts', { customerId, userId });

      const contacts = await contactsService.getContactsByCustomer(customerId, userId);

      res.json({
        success: true,
        data: contacts,
        count: contacts.length
      });
    } catch (error) {
      logger.error('Error in getCustomerContacts', { error });
      next(error);
    }
  }

  /**
   * Create or update contact
   * POST /api/v1/contacts
   */
  async createContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const contactData = req.body;

      logger.info('Creating contact', { userId, customerId: contactData.customerId });

      const contact = await contactsService.createContact(contactData, userId);

      res.status(201).json({
        success: true,
        data: contact
      });
    } catch (error) {
      logger.error('Error in createContact', { error });
      next(error);
    }
  }

  /**
   * Update contact
   * PUT /api/v1/contacts/:contactId
   */
  async updateContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contactId } = req.params;
      const userId = req.user?.id;
      const updates = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      logger.info('Updating contact', { contactId, userId });

      const contact = await contactsService.updateContact(contactId, updates, userId);

      res.json({
        success: true,
        data: contact
      });
    } catch (error) {
      logger.error('Error in updateContact', { error });
      next(error);
    }
  }

  /**
   * Delete contact
   * DELETE /api/v1/contacts/:contactId
   */
  async deleteContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contactId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      logger.info('Deleting contact', { contactId, userId });

      await contactsService.deleteContact(contactId, userId);

      res.json({
        success: true,
        message: 'Contact deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteContact', { error });
      next(error);
    }
  }

  /**
   * Get LinkedIn profile details
   * GET /api/v1/contacts/linkedin/profile
   */
  async getLinkedInProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        res.status(400).json({
          success: false,
          error: 'LinkedIn URL is required'
        });
        return;
      }

      logger.info('Fetching LinkedIn profile', { url, userId: req.user?.id });

      const profile = await contactsService.getLinkedInProfile(url);

      if (!profile) {
        res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
        return;
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Error in getLinkedInProfile', { error });
      next(error);
    }
  }

  /**
   * Sync contacts from LinkedIn for a customer
   * POST /api/v1/contacts/sync
   */
  async syncContactsFromLinkedIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, company, roles } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      if (!customerId || !company || !roles || !Array.isArray(roles)) {
        res.status(400).json({
          success: false,
          error: 'Customer ID, company name, and roles array are required'
        });
        return;
      }

      logger.info('Syncing contacts from LinkedIn', { customerId, company, roles, userId });

      const contacts = await contactsService.syncContactsFromLinkedIn({
        customerId,
        company,
        roles,
        userId
      });

      res.json({
        success: true,
        data: contacts,
        count: contacts.length,
        message: `Successfully synced ${contacts.length} contacts`
      });
    } catch (error) {
      logger.error('Error in syncContactsFromLinkedIn', { error });
      next(error);
    }
  }
}

export const contactsController = new ContactsController();

// Made with Bob