/**
 * IBM Product Research - Interactive Product Search and Research
 */

(function() {
  'use strict';

  // ============================================
  // IBM PRODUCTS DATABASE
  // ============================================
  
  const IBM_PRODUCTS = {
    'webmethods': {
      name: 'IBM webMethods Hybrid Integration (IWHI)',
      category: 'Integration',
      description: 'Hybrid integration platform for connecting applications, data, and APIs',
      keywords: ['integration', 'api', 'hybrid', 'middleware', 'connectivity']
    },
    'sevone': {
      name: 'SevOne',
      category: 'Network Performance',
      description: 'Network performance monitoring and analytics platform',
      keywords: ['network', 'monitoring', 'performance', 'analytics', 'npm']
    },
    'ns1': {
      name: 'NS1',
      category: 'DNS & Traffic',
      description: 'DNS and traffic management platform for application delivery',
      keywords: ['dns', 'traffic management', 'load balancing', 'application delivery']
    },
    'verify': {
      name: 'IBM Verify',
      category: 'Identity & Access',
      description: 'Identity and access management solution for secure authentication',
      keywords: ['identity', 'access management', 'authentication', 'iam', 'security']
    },
    'concert': {
      name: 'IBM Concert',
      category: 'Application Management',
      description: 'AI-powered application management and optimization platform',
      keywords: ['application management', 'ai', 'optimization', 'automation']
    },
    'instana': {
      name: 'IBM Instana',
      category: 'Observability',
      description: 'Application performance monitoring and observability platform',
      keywords: ['apm', 'monitoring', 'observability', 'performance', 'devops']
    },
    'turbonomic': {
      name: 'IBM Turbonomic',
      category: 'Cloud Optimization',
      description: 'Application resource management for hybrid cloud',
      keywords: ['cloud optimization', 'resource management', 'cost optimization', 'automation']
    },
    'maximo': {
      name: 'IBM Maximo',
      category: 'Asset Management',
      description: 'Enterprise asset management and maintenance platform',
      keywords: ['asset management', 'maintenance', 'iot', 'facilities']
    },
    'apptio': {
      name: 'IBM Apptio',
      category: 'FinOps',
      description: 'Technology business management and FinOps platform',
      keywords: ['finops', 'cost management', 'cloud economics', 'it financial management']
    },
    'vault': {
      name: 'IBM Vault',
      category: 'Data Protection',
      description: 'Data protection and backup solution for enterprise environments',
      keywords: ['backup', 'data protection', 'recovery', 'storage', 'archive']
    },
    'watsonx': {
      name: 'IBM watsonx',
      category: 'AI & Data',
      description: 'AI and data platform for building, deploying, and managing AI models',
      keywords: ['ai', 'machine learning', 'data', 'analytics', 'foundation models', 'generative ai']
    },
    'bob': {
      name: 'IBM Bob',
      category: 'AI Assistant',
      description: 'AI-powered coding assistant and development tool for software engineers',
      keywords: ['ai assistant', 'coding', 'development', 'automation', 'productivity', 'code generation']
    }
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const productState = {
    selectedProduct: null,
    searchResults: [],
    comparisonProducts: []
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================
  
  const elements = {
    searchInput: null,
    productTags: null,
    selectedProductContainer: null,
    productQuestionsContainer: null,
    emptyState: null,
    clearProductBtn: null,
    addProductBtn: null,
    selectedProductName: null,
    queryResponseArea: null,
    queryQuestionText: null,
    queryResponseField: null,
    closeQueryBtn: null,
    queryFollowupList: null
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  
  function init() {
    // Get DOM elements
    elements.searchInput = document.getElementById('product-search-input');
    elements.productTags = document.querySelectorAll('.product-tag');
    elements.selectedProductContainer = document.getElementById('selected-product-container');
    elements.productQuestionsContainer = document.getElementById('product-questions-container');
    elements.emptyState = document.getElementById('product-empty-state');
    elements.clearProductBtn = document.getElementById('clear-product-btn');
    elements.addProductBtn = document.getElementById('add-product-btn');
    elements.selectedProductName = document.getElementById('selected-product-name');
    elements.queryResponseArea = document.getElementById('query-response-area');
    elements.queryQuestionText = document.getElementById('query-question-text');
    elements.queryResponseField = document.getElementById('query-response-field');
    elements.closeQueryBtn = document.getElementById('close-query-response');
    elements.queryFollowupList = document.getElementById('query-followup-list');

    setupEventListeners();
    console.log('Product Research initialized');
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  
  function setupEventListeners() {
    // Search input
    if (elements.searchInput) {
      elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSearchSubmit();
        }
      });
    }

    // Close query response button
    if (elements.closeQueryBtn) {
      elements.closeQueryBtn.addEventListener('click', closeQueryResponse);
    }

    // Quick access product tags
    elements.productTags.forEach(tag => {
      tag.addEventListener('click', handleProductTagClick);
    });

    // Clear product button
    if (elements.clearProductBtn) {
      elements.clearProductBtn.addEventListener('click', clearSelectedProduct);
    }

    // Add product button
    if (elements.addProductBtn) {
      elements.addProductBtn.addEventListener('click', handleAddProduct);
    }
  }

  function handleSearchSubmit() {
    const query = elements.searchInput.value.trim();
    
    if (!query) {
      return;
    }

    // Search for product in query - improved detection
    const queryLower = query.toLowerCase();
    const results = Object.entries(IBM_PRODUCTS).filter(([id, product]) => {
      // Check product name (including partial matches)
      const productNameLower = product.name.toLowerCase();
      const productWords = productNameLower.split(' ');
      
      // Check if any significant word from product name is in query
      const hasProductName = productWords.some(word => {
        if (word.length > 3) { // Only check words longer than 3 chars
          return queryLower.includes(word);
        }
        return false;
      });
      
      // Check product ID (e.g., "instana", "concert")
      const hasProductId = queryLower.includes(id);
      
      // Check keywords
      const hasKeyword = product.keywords.some(keyword =>
        queryLower.includes(keyword.toLowerCase())
      );
      
      // Check description
      const hasDescription = queryLower.includes(product.description.toLowerCase().substring(0, 20));
      
      return hasProductName || hasProductId || hasKeyword || hasDescription;
    });

    if (results.length > 0) {
      const [productId, product] = results[0];
      showQueryResponse(query, productId, product);
    } else {
      // No product found, show generic response
      showQueryResponse(query, null, null);
    }
  }

  function closeQueryResponse() {
    if (elements.queryResponseArea) {
      elements.queryResponseArea.style.display = 'none';
    }
  }

  // ============================================
  // PRODUCT SELECTION
  // ============================================
  
  function handleProductTagClick(e) {
    const productId = e.currentTarget.dataset.product;
    selectProduct(productId);
  }

  function showQueryResponse(query, productId, product) {
    // Show the response area
    elements.queryResponseArea.style.display = 'block';
    elements.queryQuestionText.textContent = query;
    elements.queryResponseField.value = 'Generating response...';

    // Scroll to response area
    elements.queryResponseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const customerName = document.getElementById('customer-name')?.value || 'the customer';
    const industry = document.getElementById('industry')?.value || 'their industry';

    // Generate response immediately (synchronous)
    let response;
    let followupQuestions = [];

    if (!product) {
      // No product found
      response = `I couldn't identify a specific IBM product in your question: "${query}"

Please try mentioning one of these IBM products:
• webMethods IWHI, SevOne, NS1
• Verify, Concert, Instana
• Turbonomic, Maximo, Apptio
• Vault, watsonx

Or click one of the Quick Access buttons below to learn more about that product.`;
      
      followupQuestions = [
        'What IBM products are available for my industry?',
        'How do I choose the right IBM solution?',
        'Can you compare different IBM products?'
      ];
    } else {
      // Generate mock response immediately
      response = `Based on your question about ${product.name}:

${product.name} is ${product.description}

For ${customerName} in the ${industry} sector, ${product.name} can help address:

• ${query.includes('work') || query.includes('how') ? 'Integration and workflow automation' : 'Key business challenges'}
• Scalability and performance optimization
• Industry-specific compliance and security requirements
• Cost optimization and operational efficiency

Key capabilities include:
${product.keywords.slice(0, 3).map(k => `• ${k.charAt(0).toUpperCase() + k.slice(1)}`).join('\n')}

To learn more about how ${product.name} can benefit ${customerName}, I recommend:
1. Reviewing IBM's official documentation
2. Exploring industry-specific use cases
3. Scheduling a technical consultation with IBM experts

Would you like me to provide more specific information about any particular aspect of ${product.name}?`;

      // Generate context-aware follow-up questions
      followupQuestions = generateFollowupQuestions(product, query, customerName, industry);
    }

    // Update UI with response immediately
    elements.queryResponseField.value = response;
    
    // Display follow-up questions
    displayFollowupQuestions(followupQuestions);
  }

  function generateFollowupQuestions(product, query, customerName, industry) {
    const questions = [];
    
    // Question type detection
    const isHowQuestion = query.toLowerCase().includes('how');
    const isWhatQuestion = query.toLowerCase().includes('what');
    const isPricingQuestion = query.toLowerCase().includes('price') || query.toLowerCase().includes('cost');
    const isIntegrationQuestion = query.toLowerCase().includes('integrat');
    
    // Generate contextual follow-ups based on product category
    if (product.category === 'Observability' || product.category === 'Network Performance') {
      questions.push(
        `What metrics does ${product.name} monitor for ${industry} companies?`,
        `How does ${product.name} integrate with existing monitoring tools?`,
        `What is the typical deployment time for ${product.name}?`
      );
    } else if (product.category === 'Identity & Access' || product.category === 'Data Protection') {
      questions.push(
        `What compliance standards does ${product.name} support for ${industry}?`,
        `How does ${product.name} handle multi-factor authentication?`,
        `What are the security best practices for ${product.name}?`
      );
    } else if (product.category === 'Integration' || product.category === 'Application Management') {
      questions.push(
        `What APIs and connectors does ${product.name} support?`,
        `How does ${product.name} handle data transformation?`,
        `What are common integration patterns with ${product.name}?`
      );
    } else if (product.category === 'Cloud Optimization' || product.category === 'FinOps') {
      questions.push(
        `How much can ${customerName} save with ${product.name}?`,
        `What cloud platforms does ${product.name} support?`,
        `How does ${product.name} provide cost visibility?`
      );
    } else if (product.category === 'AI & Data') {
      questions.push(
        `What AI models are available in ${product.name}?`,
        `How does ${product.name} ensure data governance?`,
        `What are ${industry}-specific use cases for ${product.name}?`
      );
    } else {
      // Generic follow-ups
      questions.push(
        `What are the key benefits of ${product.name} for ${industry}?`,
        `How does ${product.name} compare to competitors?`,
        `What is the ROI timeline for ${product.name}?`
      );
    }
    
    return questions;
  }

  function displayFollowupQuestions(questions) {
    if (!elements.queryFollowupList) return;
    
    // Clear existing questions
    elements.queryFollowupList.innerHTML = '';
    
    // Add new questions
    questions.forEach(question => {
      const li = document.createElement('li');
      li.className = 'ai-suggestion';
      li.textContent = question;
      li.style.cursor = 'pointer';
      
      // Make follow-up questions clickable
      li.addEventListener('click', () => {
        elements.searchInput.value = question;
        handleSearchSubmit();
      });
      
      elements.queryFollowupList.appendChild(li);
    });
  }

  function selectProduct(productId) {
    const product = IBM_PRODUCTS[productId];
    
    if (!product) {
      console.error('Product not found:', productId);
      return;
    }

    productState.selectedProduct = productId;
    
    // Update UI
    elements.selectedProductName.textContent = product.name;
    elements.emptyState.style.display = 'none';
    elements.selectedProductContainer.style.display = 'block';
    
    // Generate questions for this product
    generateProductQuestions(productId, product);
    
    // Scroll to product section
    elements.selectedProductContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearSelectedProduct() {
    productState.selectedProduct = null;
    elements.selectedProductContainer.style.display = 'none';
    elements.emptyState.style.display = 'block';
    elements.productQuestionsContainer.innerHTML = '';
  }

  // ============================================
  // DYNAMIC QUESTION GENERATION
  // ============================================
  
  function generateProductQuestions(productId, product) {
    const customerName = document.getElementById('customer-name')?.value || 'the customer';
    const industry = document.getElementById('industry')?.value || 'their industry';
    
    const questions = [
      {
        number: '01',
        text: `What are the key capabilities and use cases of ${product.name}?`,
        suggestions: [
          `What specific features address ${industry} challenges?`,
          'What are the main differentiators from competitors?',
          'What deployment options are available?'
        ]
      },
      {
        number: '02',
        text: `How does ${product.name} address ${customerName}'s ${industry} challenges?`,
        suggestions: [
          `What ${industry}-specific solutions does it offer?`,
          'What customer success stories exist in this industry?',
          'What ROI can be expected?'
        ]
      },
      {
        number: '03',
        text: `What are the integration requirements and capabilities for ${product.name}?`,
        suggestions: [
          'What APIs and connectors are available?',
          'How does it integrate with existing systems?',
          'What data migration support is provided?'
        ]
      },
      {
        number: '04',
        text: `What is the pricing and licensing model for ${product.name}?`,
        suggestions: [
          'What pricing tiers are available?',
          'Are there volume discounts?',
          'What is included in support and maintenance?'
        ]
      },
      {
        number: '05',
        text: `What customer success stories and case studies exist for ${product.name} in ${industry}?`,
        suggestions: [
          'What measurable outcomes have customers achieved?',
          'What implementation timelines are typical?',
          'What best practices are recommended?'
        ]
      }
    ];

    // Clear existing questions
    elements.productQuestionsContainer.innerHTML = '';

    // Generate question cards
    questions.forEach(q => {
      const questionCard = createProductQuestionCard(q, product);
      elements.productQuestionsContainer.appendChild(questionCard);
    });
  }

  function createProductQuestionCard(question, product) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.product = productState.selectedProduct;
    
    card.innerHTML = `
      <div class="question-card__header">
        <span class="question-card__number">${question.number}</span>
        <h4 class="question-card__question">${question.text}</h4>
      </div>
      <button class="generate-btn">
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Generate
      </button>
      <div class="question-card__response" style="display: none;">
        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
        <div class="response-sources">
          <span class="sources-label">Sources:</span>
          <div class="source-tags">
            <span class="source-tag">IBM Documentation</span>
            <span class="source-tag">IBM.com</span>
            <span class="source-tag">Google AI</span>
          </div>
        </div>
        <div class="ai-suggestions">
          <div class="ai-suggestions__header">
            <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span>AI Suggested Follow-ups:</span>
          </div>
          <ul class="ai-suggestions__list">
            ${question.suggestions.map(s => `<li class="ai-suggestion">${s}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    // Add generate button event listener
    const generateBtn = card.querySelector('.generate-btn');
    generateBtn.addEventListener('click', () => handleProductQuestionGenerate(card, product));

    return card;
  }

  // ============================================
  // GENERATE PRODUCT RESPONSES
  // ============================================
  
  async function handleProductQuestionGenerate(card, product) {
    const button = card.querySelector('.generate-btn');
    const responseContainer = card.querySelector('.question-card__response');
    const responseField = card.querySelector('.response-field');
    const question = card.querySelector('.question-card__question').textContent;

    // Show loading state
    button.classList.add('loading');
    button.disabled = true;
    button.innerHTML = `
      <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
      </svg>
      Generating...
    `;

    try {
      // Check if IBM docs backend is available
      const backendAvailable = window.IBMDocsIntegration && 
                              await window.IBMDocsIntegration.checkHealth();
      
      let response;
      
      if (backendAvailable) {
        // Use IBM docs API with product-specific search
        console.log('Using IBM Documentation API for product research');
        const customerName = document.getElementById('customer-name')?.value || 'the customer';
        const industry = document.getElementById('industry')?.value || 'Technology';
        
        const apiResponse = await window.IBMDocsIntegration.getProductDocs(product.name);
        
        if (apiResponse.success) {
          response = formatProductResponse(apiResponse.data, question);
        } else {
          response = generateMockProductResponse(product, question);
        }
      } else {
        // Fallback to mock data
        console.log('Backend unavailable, using mock product data');
        response = generateMockProductResponse(product, question);
      }
      
      // Update UI
      responseField.value = response;
      responseContainer.style.display = 'block';
      
      // Reset button
      button.classList.remove('loading');
      button.disabled = false;
      button.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Regenerate
      `;
      
      // Smooth scroll
      responseContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
    } catch (error) {
      console.error('Error generating product response:', error);
      
      // Fallback to mock data
      const response = generateMockProductResponse(product, question);
      responseField.value = response;
      responseContainer.style.display = 'block';
      
      // Reset button
      button.classList.remove('loading');
      button.disabled = false;
      button.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Regenerate
      `;
    }
  }

  function generateMockProductResponse(product, question) {
    const customerName = document.getElementById('customer-name')?.value || 'your organization';
    const industry = document.getElementById('industry')?.value || 'your industry';
    
    return `${product.name} - ${product.description}

For ${customerName} in the ${industry} sector, ${product.name} offers:

• Enterprise-grade capabilities designed for ${industry} requirements
• Seamless integration with existing infrastructure
• Proven track record with similar organizations
• Comprehensive support and professional services

Key benefits include improved operational efficiency, reduced costs, and enhanced security posture. IBM provides extensive documentation, training resources, and customer success programs to ensure successful implementation.

For detailed product information, pricing, and ${industry}-specific use cases, please refer to IBM's official documentation and consult with an IBM representative.`;
  }

  function formatProductResponse(data, question) {
    // Format API response for display
    if (data.response) {

  // ============================================
  // QUERY-BASED RESPONSE GENERATION
  // ============================================
  
  async function generateResponseForQuery(query, productId, product) {
    const customerName = document.getElementById('customer-name')?.value || 'the customer';
    const industry = document.getElementById('industry')?.value || 'their industry';
    
    // Find the first question card or create a temporary display
    const questionsContainer = elements.productQuestionsContainer;
    if (!questionsContainer) return;
    
    // Create a special query-based question card
    const queryCard = document.createElement('div');
    queryCard.className = 'question-card query-card';
    queryCard.innerHTML = `
      <div class="question-card__header">
        <span class="question-card__number">Q</span>
        <h4 class="question-card__question">${query}</h4>
      </div>
      <div class="question-card__response" style="display: block;">
        <textarea class="response-field" placeholder="Generating response..." rows="6"></textarea>
        <div class="response-sources">
          <span class="sources-label">Sources:</span>
          <div class="source-tags">
            <span class="source-tag">IBM Documentation</span>
            <span class="source-tag">IBM.com</span>
            <span class="source-tag">Google AI</span>
          </div>
        </div>
      </div>
    `;
    
    // Insert at the top of questions container
    questionsContainer.insertBefore(queryCard, questionsContainer.firstChild);
    
    const responseField = queryCard.querySelector('.response-field');
    responseField.value = 'Generating response...';
    
    try {
      // Check if IBM docs backend is available
      const backendAvailable = window.IBMDocsIntegration && 
                              await window.IBMDocsIntegration.checkHealth();
      
      let response;
      
      if (backendAvailable) {
        // Use IBM docs API
        console.log('Using IBM Documentation API for query:', query);
        const apiResponse = await window.IBMDocsIntegration.generateResponse(
          query,
          customerName,
          industry
        );
        
        if (apiResponse.success) {
          response = apiResponse.data.response || apiResponse.data.answer;
        } else {
          response = generateMockQueryResponse(query, product, customerName, industry);
        }
      } else {
        // Fallback to mock data
        console.log('Backend unavailable, using mock data for query');
        response = generateMockQueryResponse(query, product, customerName, industry);
      }
      
      // Update UI with response
      responseField.value = response;
      
      // Smooth scroll to the response
      queryCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
    } catch (error) {
      console.error('Error generating query response:', error);
      
      // Fallback to mock data
      const response = generateMockQueryResponse(query, product, customerName, industry);
      responseField.value = response;
    }
  }

  function generateMockQueryResponse(query, product, customerName, industry) {
    return `Based on your question about ${product.name}:

${product.name} is ${product.description}

For ${customerName} in the ${industry} sector, ${product.name} can help address:

• ${query.includes('work') ? 'Integration and workflow automation' : 'Key business challenges'}
• Scalability and performance optimization
• Industry-specific compliance and security requirements
• Cost optimization and operational efficiency

Key capabilities include:
${product.keywords.slice(0, 3).map(k => `• ${k.charAt(0).toUpperCase() + k.slice(1)}`).join('\n')}

To learn more about how ${product.name} can benefit ${customerName}, I recommend:
1. Reviewing IBM's official documentation
2. Exploring industry-specific use cases
3. Scheduling a technical consultation with IBM experts

Would you like me to provide more specific information about any particular aspect of ${product.name}?`;
  }
      return data.response;
    }
    
    return 'Product information retrieved from IBM documentation. Please review the sources below for detailed information.';
  }

  // ============================================
  // PRODUCT COMPARISON
  // ============================================
  
  function handleAddProduct() {
    // Future enhancement: Allow comparing multiple products
    alert('Product comparison feature coming soon!');
  }

  // ============================================
  // INITIALIZE ON DOM READY
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for external access if needed
  window.ProductResearch = {
    selectProduct,
    clearSelectedProduct,
    getSelectedProduct: () => productState.selectedProduct
  };

})();

// Made with Bob
