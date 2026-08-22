import { Router } from 'express';
import { ibmDocsController } from './ibm-docs.controller';

const router = Router();

/**
 * @route   POST /api/ibm-docs/search
 * @desc    Search IBM documentation across all sources
 * @access  Private
 * @body    { query, sources?, maxResults?, industry?, product? }
 */
router.post('/search', (req, res) => ibmDocsController.search(req, res));

/**
 * @route   GET /api/ibm-docs/industry/:industry/topic/:topic
 * @desc    Get industry-specific IBM documentation
 * @access  Private
 * @params  industry, topic
 * @query   maxResults?
 */
router.get('/industry/:industry/topic/:topic', (req, res) =>
  ibmDocsController.getIndustryDocs(req, res)
);

/**
 * @route   GET /api/ibm-docs/product/:product
 * @desc    Get product-specific IBM documentation
 * @access  Private
 * @params  product
 * @query   topic?, maxResults?
 */
router.get('/product/:product', (req, res) =>
  ibmDocsController.getProductDocs(req, res)
);

/**
 * @route   POST /api/ibm-docs/insights
 * @desc    Extract insights from IBM docs for a specific question
 * @access  Private
 * @body    { question, customerName, industry }
 */
router.post('/insights', (req, res) =>
  ibmDocsController.extractInsights(req, res)
);

/**
 * @route   POST /api/ibm-docs/content
 * @desc    Fetch full content from an IBM documentation URL
 * @access  Private
 * @body    { url }
 */
router.post('/content', (req, res) =>
  ibmDocsController.fetchContent(req, res)
);

/**
 * @route   POST /api/ibm-docs/generate-response
 * @desc    Generate AI-powered response using IBM documentation
 * @access  Private
 * @body    { question, customerName, industry, context? }
 */
router.post('/generate-response', (req, res) =>
  ibmDocsController.generateResponse(req, res)
);

export default router;

// Made with Bob
