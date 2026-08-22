/**
 * IBM Documentation Integration
 * Connects frontend to IBM docs backend API
 */

(function() {
  'use strict';

  // API Configuration
  const API_BASE_URL = 'http://localhost:3000/api/ibm-docs';
  
  // Cache for API responses
  const responseCache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate AI response using IBM documentation
   */
  async function generateIBMDocsResponse(question, customerName, industry) {
    try {
      // Check cache first
      const cacheKey = `${question}-${customerName}-${industry}`;
      const cached = responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Using cached IBM docs response');
        return cached.data;
      }

      // Call IBM docs API
      const response = await fetch(`${API_BASE_URL}/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          customerName,
          industry
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      responseCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error generating IBM docs response:', error);
      throw error;
    }
  }

  /**
   * Search IBM documentation
   */
  async function searchIBMDocs(query, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Search error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching IBM docs:', error);
      throw error;
    }
  }

  /**
   * Get industry-specific documentation
   */
  async function getIndustryDocs(industry, topic) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/industry/${encodeURIComponent(industry)}/topic/${encodeURIComponent(topic)}`
      );

      if (!response.ok) {
        throw new Error(`Industry docs error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching industry docs:', error);
      throw error;
    }
  }

  /**
   * Get product-specific documentation
   */
  async function getProductDocs(product) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/${encodeURIComponent(product)}`
      );

      if (!response.ok) {
        throw new Error(`Product docs error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product docs:', error);
      throw error;
    }
  }

  /**
   * Extract insights from documentation
   */
  async function extractInsights(question, customerName, industry) {
    try {
      const response = await fetch(`${API_BASE_URL}/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          customerName,
          industry
        })
      });

      if (!response.ok) {
        throw new Error(`Insights error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error extracting insights:', error);
      throw error;
    }
  }

  /**
   * Format IBM docs response for display
   */
  function formatIBMDocsResponse(data, customerName) {
    if (!data.success) {
      return {
        response: 'Unable to generate response from IBM documentation.',
        sources: []
      };
    }

    const { response, sources, insights } = data.data;
    
    // ALWAYS add Annual Report and 10-K first (highest priority company documents)
    const formattedSources = [];
    if (customerName) {
      formattedSources.push(
        {
          name: `${customerName} Annual Report 2025`,
          url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' annual report 2025')}`,
          type: 'Company Report',
          priority: 1
        },
        {
          name: `${customerName} 10-K Filing`,
          url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' 10-K SEC filing')}`,
          type: 'Financial Report',
          priority: 1
        }
      );
    }
    
    // Then add IBM docs sources (limit to 3-4 to keep total around 5-6)
    sources.slice(0, 4).forEach(source => {
      formattedSources.push({
        name: source.title,
        url: source.url,
        type: source.source,
        relevance: source.relevanceScore
      });
    });

    // Combine response with insights if available
    let fullResponse = response;
    if (insights && insights.length > 0) {
      fullResponse += '\n\n**Key Insights:**\n';
      insights.forEach((insight, index) => {
        fullResponse += `${index + 1}. ${insight}\n`;
      });
    }

    return {
      response: fullResponse,
      sources: formattedSources
    };
  }

  /**
   * Check if backend is available
   */
  async function checkBackendHealth() {
    try {
      const response = await fetch('http://localhost:3000/health');
      return response.ok;
    } catch (error) {
      console.warn('Backend not available:', error);
      return false;
    }
  }

  // Export functions to global scope
  window.IBMDocsIntegration = {
    generateResponse: generateIBMDocsResponse,
    search: searchIBMDocs,
    getIndustryDocs,
    getProductDocs,
    extractInsights,
    formatResponse: formatIBMDocsResponse,
    checkHealth: checkBackendHealth
  };

  console.log('IBM Docs Integration loaded');
})();

// Made with Bob
