import { Router } from 'express';
import { contactsController } from './contacts.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/contacts/search
 * Search for contacts on LinkedIn
 */
router.post(
  '/search',
  [
    body('company').isString().notEmpty().withMessage('Company name is required'),
    body('roles').isArray().notEmpty().withMessage('Roles array is required'),
    body('roles.*').isString().withMessage('Each role must be a string'),
    body('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
    validateRequest
  ],
  contactsController.searchLinkedInContacts.bind(contactsController)
);

/**
 * POST /api/v1/contacts/sync
 * Sync contacts from LinkedIn and save to database
 */
router.post(
  '/sync',
  [
    body('customerId').isUUID().withMessage('Valid customer ID is required'),
    body('company').isString().notEmpty().withMessage('Company name is required'),
    body('roles').isArray().notEmpty().withMessage('Roles array is required'),
    body('roles.*').isString().withMessage('Each role must be a string'),
    validateRequest
  ],
  contactsController.syncContactsFromLinkedIn.bind(contactsController)
);

/**
 * GET /api/v1/contacts/linkedin/profile
 * Get LinkedIn profile details
 */
router.get(
  '/linkedin/profile',
  [
    query('url').isURL().withMessage('Valid LinkedIn URL is required'),
    validateRequest
  ],
  contactsController.getLinkedInProfile.bind(contactsController)
);

/**
 * GET /api/v1/contacts/:customerId
 * Get all contacts for a customer
 */
router.get(
  '/:customerId',
  [
    param('customerId').isUUID().withMessage('Valid customer ID is required'),
    validateRequest
  ],
  contactsController.getCustomerContacts.bind(contactsController)
);

/**
 * POST /api/v1/contacts
 * Create a new contact
 */
router.post(
  '/',
  [
    body('customerId').isUUID().withMessage('Valid customer ID is required'),
    body('name').isString().notEmpty().withMessage('Contact name is required'),
    body('role').isString().notEmpty().withMessage('Contact role is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('linkedinUrl').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('phone').optional().isString(),
    body('department').optional().isString(),
    body('responsibilities').optional().isString(),
    validateRequest
  ],
  contactsController.createContact.bind(contactsController)
);

/**
 * PUT /api/v1/contacts/:contactId
 * Update a contact
 */
router.put(
  '/:contactId',
  [
    param('contactId').isUUID().withMessage('Valid contact ID is required'),
    body('name').optional().isString().notEmpty(),
    body('role').optional().isString().notEmpty(),
    body('email').optional().isEmail(),
    body('linkedinUrl').optional().isURL(),
    body('phone').optional().isString(),
    body('department').optional().isString(),
    body('responsibilities').optional().isString(),
    validateRequest
  ],
  contactsController.updateContact.bind(contactsController)
);

/**
 * DELETE /api/v1/contacts/:contactId
 * Delete a contact
 */
router.delete(
  '/:contactId',
  [
    param('contactId').isUUID().withMessage('Valid contact ID is required'),
    validateRequest
  ],
  contactsController.deleteContact.bind(contactsController)
);

export default router;

// Made with Bob