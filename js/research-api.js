/**
 * Research API Integration
 * Integrates Serper API (Google Search), OpenAI, and Gemini for real customer research
 *
 * Free Tiers:
 * - Serper: 2,500 searches/month free
 * - OpenAI: $5 free credit for new accounts
 * - Gemini: Image generation requires billing (gemini-2.5-flash-image)
 */

(function() {
  'use strict';

  // API Configuration
  // Keys are loaded from js/api-keys.local.js (git-ignored) via window.__API_KEYS__.
  // To use your own keys: copy js/api-keys.local.js.example → js/api-keys.local.js and fill them in.
  const _keys = window.__API_KEYS__ || {};
  const SERPER_API_KEY = _keys.SERPER_API_KEY || '';
  const OPENAI_API_KEY = _keys.OPENAI_API_KEY || '';
  const GEMINI_API_KEY = _keys.GEMINI_API_KEY || '';

  const SERPER_API_URL  = 'https://google.serper.dev/search';
  const OPENAI_API_URL  = 'https://api.openai.com/v1/chat/completions';
  const GEMINI_IMAGE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

  /**
   * Check if APIs are configured
   */
  function areAPIsConfigured() {
    return SERPER_API_KEY && OPENAI_API_KEY && 
           SERPER_API_KEY.length > 10 && OPENAI_API_KEY.length > 10;
  }

  /**
   * Search Google using Serper API
   */
  async function searchGoogle(query, numResults = 5) {
    if (!SERPER_API_KEY) {
      throw new Error('Serper API key not configured');
    }

    try {
      const response = await fetch(SERPER_API_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          num: numResults,
          gl: 'us',
          hl: 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Serper API error:', error);
      throw error;
    }
  }

  /**
   * Generate AI response using OpenAI
   */
  async function generateAIResponse(prompt, context) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a business research analyst helping sales professionals understand their customers. Provide detailed, actionable insights based on the search results provided.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nSearch Results Context:\n${context}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  /**
   * Research customer and generate response
   */
  async function researchCustomer(customerName, industry, question) {
    // Build search query
    const searchQuery = `${customerName} ${industry} ${question}`;
    
    console.log('Searching:', searchQuery);
    
    // Search Google
    const searchResults = await searchGoogle(searchQuery, 5);
    
    // Extract relevant information
    const context = extractSearchContext(searchResults);
    
    // Generate AI response
    const prompt = `Based on the search results about ${customerName} in the ${industry} industry, answer this question: ${question}`;
    const aiResponse = await generateAIResponse(prompt, context);
    
    // Extract sources
    const sources = extractSources(searchResults, customerName);
    
    return {
      response: aiResponse,
      sources: sources,
      searchResults: searchResults
    };
  }

  /**
   * Extract context from search results
   */
  function extractSearchContext(searchResults) {
    let context = '';
    
    // Add organic results
    if (searchResults.organic) {
      searchResults.organic.slice(0, 5).forEach((result, index) => {
        context += `\n[${index + 1}] ${result.title}\n${result.snippet}\n`;
      });
    }
    
    // Add knowledge graph if available
    if (searchResults.knowledgeGraph) {
      const kg = searchResults.knowledgeGraph;
      context += `\n\nKnowledge Graph:\n`;
      if (kg.title) context += `Title: ${kg.title}\n`;
      if (kg.type) context += `Type: ${kg.type}\n`;
      if (kg.description) context += `Description: ${kg.description}\n`;
    }
    
    // Add answer box if available
    if (searchResults.answerBox) {
      context += `\n\nFeatured Answer:\n${searchResults.answerBox.answer || searchResults.answerBox.snippet}\n`;
    }
    
    return context;
  }

  /**
   * Extract sources from search results
   * ALWAYS prioritizes Annual Report and 10-K first
   */
  function extractSources(searchResults, customerName) {
    const sources = [];
    
    // ALWAYS add Annual Report and 10-K first (highest priority)
    if (customerName) {
      sources.push(
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
    
    // Then add search results (limit to 3-4 to keep total around 5-6)
    if (searchResults.organic) {
      searchResults.organic.slice(0, 4).forEach(result => {
        sources.push({
          name: result.title,
          url: result.link,
          type: categorizeSource(result.link)
        });
      });
    }
    
    return sources;
  }

  /**
   * Categorize source type based on URL
   */
  function categorizeSource(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('linkedin.com')) return 'LinkedIn';
    if (urlLower.includes('wikipedia.org')) return 'Wikipedia';
    if (urlLower.includes('forbes.com') || urlLower.includes('bloomberg.com')) return 'News';
    if (urlLower.includes('gartner.com') || urlLower.includes('forrester.com')) return 'Research';
    if (urlLower.includes('sec.gov')) return 'Financial Report';
    if (urlLower.includes('techcrunch.com') || urlLower.includes('venturebeat.com')) return 'Tech News';
    if (urlLower.includes('github.com') || urlLower.includes('stackoverflow.com')) return 'Developer Community';
    
    return 'Web Source';
  }

  /**
   * Get API status
   */
  function getAPIStatus() {
    return {
      configured: areAPIsConfigured(),
      serperConfigured: SERPER_API_KEY && SERPER_API_KEY.length > 10,
      openaiConfigured: OPENAI_API_KEY && OPENAI_API_KEY.length > 10,
      geminiConfigured: GEMINI_API_KEY && GEMINI_API_KEY.length > 10
    };
  }

  /**
   * Generate a diagram image via Gemini 2.5 Flash Image
   * Returns { imageBase64, mimeType } or throws on error.
   *
   * @param {string} prompt  — The full assembled prompt text
   */
  async function generateDiagram(prompt) {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');

    const response = await fetch(`${GEMINI_IMAGE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini API error ${response.status}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData) {
        return {
          imageBase64: part.inlineData.data,
          mimeType:    part.inlineData.mimeType || 'image/png'
        };
      }
    }
    // Model returned text instead of an image (rare — usually a safety block)
    const textPart = parts.find(p => p.text);
    throw new Error(textPart?.text || 'Gemini returned no image');
  }

  // Export to global scope
  window.ResearchAPI = {
    researchCustomer,
    searchGoogle,
    generateAIResponse,
    generateDiagram,
    getAPIStatus,
    areAPIsConfigured
  };

})();

// Made with Bob
