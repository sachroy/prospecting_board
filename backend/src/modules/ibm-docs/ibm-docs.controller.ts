import { Request, Response } from 'express';
import { ibmDocsService } from './ibm-docs.service';
import { logger } from '../../utils/logger';

export class IBMDocsController {
  /**
   * Search IBM documentation
   * POST /api/ibm-docs/search
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { query, sources, maxResults, industry, product } = req.body;

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Query parameter is required',
        });
        return;
      }

      const results = await ibmDocsService.searchIBMDocumentation(query, {
        sources,
        maxResults,
        industry,
        product,
      });

      res.json({
        success: true,
        data: {
          query,
          results,
          count: results.length,
        },
      });
    } catch (error) {
      logger.error('Error in IBM docs search', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search IBM documentation',
      });
    }
  }

  /**
   * Get industry-specific documentation
   * GET /api/ibm-docs/industry/:industry/topic/:topic
   */
  async getIndustryDocs(req: Request, res: Response): Promise<void> {
    try {
      const { industry, topic } = req.params;
      const { maxResults = 5 } = req.query;

      const results = await ibmDocsService.getIndustrySpecificDocs(
        industry,
        topic,
        Number(maxResults)
      );

      res.json({
        success: true,
        data: {
          industry,
          topic,
          results,
          count: results.length,
        },
      });
    } catch (error) {
      logger.error('Error getting industry docs', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get industry documentation',
      });
    }
  }

  /**
   * Get product documentation
   * GET /api/ibm-docs/product/:product
   */
  async getProductDocs(req: Request, res: Response): Promise<void> {
    try {
      const { product } = req.params;
      const { topic, maxResults = 5 } = req.query;

      const results = await ibmDocsService.getProductDocumentation(
        product,
        topic as string,
        Number(maxResults)
      );

      res.json({
        success: true,
        data: {
          product,
          topic,
          results,
          count: results.length,
        },
      });
    } catch (error) {
      logger.error('Error getting product docs', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product documentation',
      });
    }
  }

  /**
   * Extract insights for a specific question
   * POST /api/ibm-docs/insights
   */
  async extractInsights(req: Request, res: Response): Promise<void> {
    try {
      const { question, customerName, industry } = req.body;

      if (!question || !customerName || !industry) {
        res.status(400).json({
          success: false,
          error: 'Question, customerName, and industry are required',
        });
        return;
      }

      const result = await ibmDocsService.extractInsights(
        question,
        customerName,
        industry
      );

      res.json({
        success: true,
        data: {
          question,
          customerName,
          industry,
          insights: result.insights,
          sources: result.sources,
          sourceCount: result.sources.length,
        },
      });
    } catch (error) {
      logger.error('Error extracting insights', error);
      res.status(500).json({
        success: false,
        error: 'Failed to extract insights',
      });
    }
  }

  /**
   * Fetch full document content
   * POST /api/ibm-docs/content
   */
  async fetchContent(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({
          success: false,
          error: 'URL parameter is required',
        });
        return;
      }

      const content = await ibmDocsService.fetchDocumentContent(url);

      if (!content) {
        res.status(404).json({
          success: false,
          error: 'Document not found or could not be fetched',
        });
        return;
      }

      res.json({
        success: true,
        data: content,
      });
    } catch (error) {
      logger.error('Error fetching document content', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch document content',
      });
    }
  }

  /**
   * Generate AI-powered response using IBM documentation
   * POST /api/ibm-docs/generate-response
   */
  async generateResponse(req: Request, res: Response): Promise<void> {
    try {
      const { question, customerName, industry } = req.body;

      if (!question || !customerName || !industry) {
        res.status(400).json({
          success: false,
          error: 'Question, customerName, and industry are required',
        });
        return;
      }

      // Search IBM documentation
      const searchResults = await ibmDocsService.searchIBMDocumentation(question, {
        industry,
        maxResults: 10,
      });

      // Generate AI-enhanced response using OpenAI (if available) and IBM docs
      const aiResponse = await ibmDocsService.generateAIResponse(
        question,
        customerName,
        industry,
        searchResults
      );

      // Extract insights
      const { insights } = await ibmDocsService.extractInsights(
        question,
        customerName,
        industry
      );

      res.json({
        success: true,
        data: {
          question,
          customerName,
          industry,
          response: aiResponse,
          insights,
          sources: searchResults.map(s => ({
            title: s.title,
            url: s.url,
            snippet: s.snippet,
            source: s.source,
            relevanceScore: s.relevanceScore,
          })),
          metadata: {
            sourceCount: searchResults.length,
            insightCount: insights.length,
            generatedAt: new Date().toISOString(),
            aiEnhanced: process.env.OPENAI_API_KEY ? true : false,
          },
        },
      });
    } catch (error) {
      logger.error('Error generating response', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate response',
      });
    }
  }
}

export const ibmDocsController = new IBMDocsController();

// Made with Bob
