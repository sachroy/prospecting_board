import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import { logger } from '../../utils/logger';

interface IBMDocSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: 'ibm.com' | 'ibm-docs' | 'ibm-redbooks' | 'ibm-developer';
  relevanceScore: number;
  lastUpdated?: string;
}

interface IBMDocContent {
  title: string;
  content: string;
  url: string;
  metadata: {
    product?: string;
    version?: string;
    category?: string;
    lastUpdated?: string;
  };
}

export class IBMDocsService {
  private readonly IBM_DOCS_BASE = 'https://www.ibm.com/docs/en';
  private readonly IBM_COM_BASE = 'https://www.ibm.com';
  private readonly IBM_DEVELOPER_BASE = 'https://developer.ibm.com';
  private readonly IBM_REDBOOKS_BASE = 'https://www.redbooks.ibm.com';
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      logger.info('OpenAI client initialized with model:', process.env.OPENAI_MODEL || 'gpt-4-turbo-preview');
    } else {
      logger.warn('OpenAI API key not found. AI-enhanced responses will be disabled.');
    }
  }

  /**
   * Search across all IBM documentation sources
   */
  async searchIBMDocumentation(
    query: string,
    options: {
      sources?: Array<'ibm.com' | 'ibm-docs' | 'ibm-redbooks' | 'ibm-developer'>;
      maxResults?: number;
      industry?: string;
      product?: string;
    } = {}
  ): Promise<IBMDocSearchResult[]> {
    const {
      sources = ['ibm.com', 'ibm-docs', 'ibm-developer'],
      maxResults = 10,
      industry,
      product,
    } = options;

    logger.info('Searching IBM documentation', { query, sources, industry, product });

    try {
      const searchPromises = sources.map(source => 
        this.searchBySource(source, query, { industry, product })
      );

      const results = await Promise.allSettled(searchPromises);
      
      const allResults: IBMDocSearchResult[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        } else {
          logger.error(`Failed to search ${sources[index]}`, result.reason);
        }
      });

      // Sort by relevance and limit results
      return allResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);

    } catch (error) {
      logger.error('Error searching IBM documentation', error);
      throw new Error('Failed to search IBM documentation');
    }
  }

  /**
   * Search specific IBM source
   */
  private async searchBySource(
    source: string,
    query: string,
    filters: { industry?: string; product?: string }
  ): Promise<IBMDocSearchResult[]> {
    switch (source) {
      case 'ibm-docs':
        return this.searchIBMDocs(query, filters);
      case 'ibm.com':
        return this.searchIBMCom(query, filters);
      case 'ibm-developer':
        return this.searchIBMDeveloper(query, filters);
      case 'ibm-redbooks':
        return this.searchIBMRedbooks(query, filters);
      default:
        return [];
    }
  }

  /**
   * Search IBM Documentation (www.ibm.com/docs)
   */
  private async searchIBMDocs(
    query: string,
    filters: { industry?: string; product?: string }
  ): Promise<IBMDocSearchResult[]> {
    try {
      const searchUrl = `${this.IBM_DOCS_BASE}/search`;
      const params = new URLSearchParams({
        q: query,
        ...(filters.product && { product: filters.product }),
      });

      const response = await axios.get(`${searchUrl}?${params}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProspectingBoard/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results: IBMDocSearchResult[] = [];

      // Parse search results (adjust selectors based on actual IBM Docs structure)
      $('.search-result').each((_, element) => {
        const $el = $(element);
        const title = $el.find('.result-title').text().trim();
        const url = $el.find('a').attr('href');
        const snippet = $el.find('.result-snippet').text().trim();
        const lastUpdated = $el.find('.last-updated').text().trim();

        if (title && url) {
          results.push({
            title,
            url: url.startsWith('http') ? url : `${this.IBM_DOCS_BASE}${url}`,
            snippet,
            source: 'ibm-docs',
            relevanceScore: this.calculateRelevance(title, snippet, query),
            lastUpdated,
          });
        }
      });

      return results;
    } catch (error) {
      logger.error('Error searching IBM Docs', error);
      return [];
    }
  }

  /**
   * Search IBM.com
   */
  private async searchIBMCom(
    query: string,
    filters: { industry?: string; product?: string }
  ): Promise<IBMDocSearchResult[]> {
    try {
      const searchUrl = `${this.IBM_COM_BASE}/search`;
      const params = new URLSearchParams({
        q: query,
        lang: 'en',
        cc: 'us',
        ...(filters.industry && { industry: filters.industry }),
      });

      const response = await axios.get(`${searchUrl}?${params}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProspectingBoard/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results: IBMDocSearchResult[] = [];

      // Parse IBM.com search results
      $('.bx--search-result').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h3').text().trim();
        const url = $el.find('a').attr('href');
        const snippet = $el.find('.bx--search-result__snippet').text().trim();

        if (title && url) {
          results.push({
            title,
            url: url.startsWith('http') ? url : `${this.IBM_COM_BASE}${url}`,
            snippet,
            source: 'ibm.com',
            relevanceScore: this.calculateRelevance(title, snippet, query),
          });
        }
      });

      return results;
    } catch (error) {
      logger.error('Error searching IBM.com', error);
      return [];
    }
  }

  /**
   * Search IBM Developer
   */
  private async searchIBMDeveloper(
    query: string,
    _filters: { industry?: string; product?: string }
  ): Promise<IBMDocSearchResult[]> {
    try {
      const searchUrl = `${this.IBM_DEVELOPER_BASE}/search`;
      const params = new URLSearchParams({
        q: query,
        type: 'article,tutorial,pattern',
      });

      const response = await axios.get(`${searchUrl}?${params}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProspectingBoard/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results: IBMDocSearchResult[] = [];

      // Parse IBM Developer search results
      $('.search-result-item').each((_, element) => {
        const $el = $(element);
        const title = $el.find('.title').text().trim();
        const url = $el.find('a').attr('href');
        const snippet = $el.find('.description').text().trim();

        if (title && url) {
          results.push({
            title,
            url: url.startsWith('http') ? url : `${this.IBM_DEVELOPER_BASE}${url}`,
            snippet,
            source: 'ibm-developer',
            relevanceScore: this.calculateRelevance(title, snippet, query),
          });
        }
      });

      return results;
    } catch (error) {
      logger.error('Error searching IBM Developer', error);
      return [];
    }
  }

  /**
   * Search IBM Redbooks
   */
  private async searchIBMRedbooks(
    query: string,
    _filters: { industry?: string; product?: string }
  ): Promise<IBMDocSearchResult[]> {
    try {
      const searchUrl = `${this.IBM_REDBOOKS_BASE}/search`;
      const params = new URLSearchParams({
        searchText: query,
      });

      const response = await axios.get(`${searchUrl}?${params}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProspectingBoard/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results: IBMDocSearchResult[] = [];

      // Parse Redbooks search results
      $('.redbook-item').each((_, element) => {
        const $el = $(element);
        const title = $el.find('.title').text().trim();
        const url = $el.find('a').attr('href');
        const snippet = $el.find('.abstract').text().trim();

        if (title && url) {
          results.push({
            title,
            url: url.startsWith('http') ? url : `${this.IBM_REDBOOKS_BASE}${url}`,
            snippet,
            source: 'ibm-redbooks',
            relevanceScore: this.calculateRelevance(title, snippet, query),
          });
        }
      });

      return results;
    } catch (error) {
      logger.error('Error searching IBM Redbooks', error);
      return [];
    }
  }

  /**
   * Fetch full content from IBM documentation page
   */
  async fetchDocumentContent(url: string): Promise<IBMDocContent | null> {
    try {
      logger.info('Fetching IBM document content', { url });

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProspectingBoard/1.0)',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Extract content (adjust selectors based on actual page structure)
      const title = $('h1').first().text().trim() || $('title').text().trim();
      const content = $('.doc-content, .article-content, main').text().trim();
      
      // Extract metadata
      const product = $('meta[name="product"]').attr('content');
      const version = $('meta[name="version"]').attr('content');
      const category = $('meta[name="category"]').attr('content');
      const lastUpdated = $('meta[name="last-updated"]').attr('content');

      return {
        title,
        content,
        url,
        metadata: {
          product,
          version,
          category,
          lastUpdated,
        },
      };
    } catch (error) {
      logger.error('Error fetching document content', { url, error });
      return null;
    }
  }

  /**
   * Get IBM documentation relevant to specific industry and topic
   */
  async getIndustrySpecificDocs(
    industry: string,
    topic: string,
    maxResults: number = 5
  ): Promise<IBMDocSearchResult[]> {
    const query = `${industry} ${topic}`;
    return this.searchIBMDocumentation(query, {
      sources: ['ibm.com', 'ibm-docs'],
      maxResults,
      industry,
    });
  }

  /**
   * Get IBM product documentation
   */
  async getProductDocumentation(
    product: string,
    topic?: string,
    maxResults: number = 5
  ): Promise<IBMDocSearchResult[]> {
    const query = topic ? `${product} ${topic}` : product;
    return this.searchIBMDocumentation(query, {
      sources: ['ibm-docs', 'ibm-developer'],
      maxResults,
      product,
    });
  }

  /**
   * Calculate relevance score for search result
   */
  private calculateRelevance(title: string, snippet: string, query: string): number {
    const queryTerms = query.toLowerCase().split(' ');
    const titleLower = title.toLowerCase();
    const snippetLower = snippet.toLowerCase();

    let score = 0;

    // Title matches are worth more
    queryTerms.forEach(term => {
      if (titleLower.includes(term)) score += 3;
      if (snippetLower.includes(term)) score += 1;
    });

    // Exact phrase match bonus
    if (titleLower.includes(query.toLowerCase())) score += 5;

    return score;
  }

  /**
   * Extract key insights from IBM documentation for a specific question
   */
  async extractInsights(
    question: string,
    _customerName: string,
    industry: string
  ): Promise<{
    insights: string[];
    sources: IBMDocSearchResult[];
  }> {
    try {
      // Search for relevant documentation
      const searchResults = await this.searchIBMDocumentation(
        `${industry} ${question}`,
        {
          sources: ['ibm.com', 'ibm-docs', 'ibm-developer'],
          maxResults: 5,
          industry,
        }
      );

      // Fetch content from top results
      const contentPromises = searchResults.slice(0, 3).map(result =>
        this.fetchDocumentContent(result.url)
      );

      const contents = await Promise.allSettled(contentPromises);
      
      const insights: string[] = [];
      contents.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const content = result.value.content;
          // Extract key sentences (simplified - in production, use NLP)
          const sentences = content.split('.').slice(0, 3);
          insights.push(...sentences.map(s => s.trim()).filter(s => s.length > 20));
        }
      });

      return {
        insights: insights.slice(0, 5), // Top 5 insights
        sources: searchResults,
      };
    } catch (error) {
      logger.error('Error extracting insights', error);
      return {
        insights: [],
        sources: [],
      };
    }
  }

  /**
   * Generate AI-enhanced response using OpenAI and IBM documentation
   */
  async generateAIResponse(
    question: string,
    customerName: string,
    industry: string,
    ibmDocs: IBMDocSearchResult[]
  ): Promise<string> {
    if (!this.openai) {
      // Fallback to template-based response
      return this.generateTemplateResponse(question, customerName, industry, ibmDocs);
    }

    try {
      // Prepare context from IBM documentation
      const docsContext = ibmDocs
        .slice(0, 5) // Use top 5 most relevant docs
        .map((doc, index) => `[${index + 1}] ${doc.title}\n${doc.snippet}\nSource: ${doc.url}`)
        .join('\n\n');

      // Create prompt for OpenAI
      const prompt = `You are an IBM solutions expert providing technical and business insights.

Customer: ${customerName}
Industry: ${industry}
Question: ${question}

Based on the following IBM documentation and resources, provide a direct, informative response that:
1. Directly answers the question with specific details
2. References relevant IBM solutions and products
3. Includes industry-specific insights when applicable
4. Provides concrete examples and use cases
5. Uses a clear, professional tone without email formatting

IBM Documentation Context:
${docsContext}

Provide a straightforward, informative response. Do not format as an email or letter. Focus on delivering factual information and insights.`;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert IBM solutions consultant with deep knowledge of IBM products, services, and industry best practices. You help sales professionals prepare for customer meetings by providing insightful, accurate, and actionable information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      });

      const response = completion.choices[0]?.message?.content || '';
      
      logger.info('OpenAI response generated', {
        model: completion.model,
        tokens: completion.usage?.total_tokens,
        question: question.substring(0, 50)
      });

      return response;
    } catch (error) {
      logger.error('Error generating AI response:', error);
      // Fallback to template-based response
      return this.generateTemplateResponse(question, customerName, industry, ibmDocs);
    }
  }

  /**
   * Generate template-based response (fallback when OpenAI is not available)
   */
  private generateTemplateResponse(
    _question: string,
    customerName: string,
    industry: string,
    ibmDocs: IBMDocSearchResult[]
  ): string {
    const topDocs = ibmDocs.slice(0, 3);
    
    let response = `Based on IBM documentation and industry insights for ${customerName} in the ${industry} sector:\n\n`;
    
    if (topDocs.length > 0) {
      response += `Key findings from IBM resources:\n\n`;
      topDocs.forEach((doc, index) => {
        response += `${index + 1}. **${doc.title}**\n`;
        response += `   ${doc.snippet}\n`;
        response += `   Reference: ${doc.source}\n\n`;
      });
    }
    
    response += `\nFor more detailed information and specific recommendations tailored to ${customerName}, `;
    response += `please refer to the IBM documentation sources provided below.`;
    
    return response;
  }
}

export const ibmDocsService = new IBMDocsService();

// Made with Bob
