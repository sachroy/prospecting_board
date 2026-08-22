/**
 * Prospecting Board - Main Application
 * Interactive features and UI handlers
 */

(function() {
  'use strict';

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Flag to suppress auto-scroll when pillar is restored programmatically
  let _suppressPillarScroll = false;

  const state = {
    customerName: '',
    industry: '',
    generatedResponses: {},
    currentTime: new Date(),
    linkedInContacts: [],
    selectedRoles: [],
    sourcesManagement: {}, // Track removed/added sources per question
    selectedPillar: null,
    pillarQuestionMap: {
      'application-modernization': ['1', '2', '3', '4', '5', '6', '7', '8'],
      'infrastructure-automation': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
      'technology-business-management': ['1', '2', '3', '4', '5', '6']
    }
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================
  
  const elements = {
    customerNameInput: null,
    industrySelect: null,
    customerNameDisplays: null,
    generateButtons: null,
    exportButtons: null,
    questionCards: null,
    headerName: null,
    headerGreeting: null,
    contactsSection: null,
    loadContactsBtn: null
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  
  function init() {
    // Populate DOM element references
    elements.customerNameInput = document.getElementById('customer-name');
    elements.industrySelect = document.getElementById('industry');
    elements.customerNameDisplays = document.querySelectorAll('.customer-name-display');
    elements.generateButtons = document.querySelectorAll('.generate-btn');
    elements.exportButtons = document.querySelectorAll('.export-btn');
    elements.questionCards = document.querySelectorAll('.question-card');
    elements.headerName = document.querySelector('.header__name');
    elements.headerGreeting = document.querySelector('.header__greeting');
    elements.contactsSection = document.getElementById('section-contacts');
    
    setupEventListeners();
    updateGreeting();
    loadSavedData();
    addRoleSelectionUI();
    initPillarSelection();
    initProductSearch();
    initCustomQuestions();
    initSellerEnhancements();
    initManagerDashboard();
    initVisualisationSection();
    initAccountMemory();

    // Fetch headlines if customer name exists
    if (state.customerName && state.customerName.length > 2) {
      fetchHeadlines();
    }
    
    console.log('Prospecting Board initialized');
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  
  function setupEventListeners() {
    // Customer name input
    if (elements.customerNameInput) {
      elements.customerNameInput.addEventListener('input', handleCustomerNameChange);
      elements.customerNameInput.addEventListener('blur', saveData);
    }

    // Industry select
    if (elements.industrySelect) {
      elements.industrySelect.addEventListener('change', handleIndustryChange);
    }

    // Generate buttons
    elements.generateButtons.forEach(button => {
      button.addEventListener('click', handleGenerateClick);
    });

    // Export buttons
    elements.exportButtons.forEach(button => {
      button.addEventListener('click', handleExportClick);
    });

    // AI suggestion clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('ai-suggestion')) {
        handleAISuggestionClick(e.target);
      }
    });

    // Email action buttons are wired in initEmailEnhancements() using IDs

    // Headline links
    const headlineLinks = document.querySelectorAll('.headline-card__link');
    headlineLinks.forEach(link => {
      link.addEventListener('click', handleHeadlineClick);
    });
  }

  // ============================================
  // CUSTOMER NAME HANDLING
  // ============================================
  
  /**
   * Reset all generated content in the DOM for a net-new account.
   * Called when the typed name has no existing AccountMemory entry.
   */
  function clearAllSections() {
    // Section 2 & 3 — research response fields + seller notes
    document.querySelectorAll('.response-field').forEach(f => { f.value = ''; });
    document.querySelectorAll('.seller-notes-textarea').forEach(ta => {
      ta.value = '';
      delete ta.dataset.accountOwner;   // clear ownership so no stale stamp
      // Collapse the notes panel
      const panel = ta.closest('.seller-notes-panel');
      if (panel) panel.style.display = 'none';
    });
    // Clear readiness indicators
    document.querySelectorAll('.readiness-indicator').forEach(el => el.remove());

    // Section 4 — opportunities
    const tbody = document.getElementById('opportunities-table-body');
    if (tbody) tbody.innerHTML = '';
    const oppContainer = document.getElementById('opportunities-table-container');
    if (oppContainer) oppContainer.style.display = 'none';
    const oppEmpty = document.getElementById('opportunities-empty-state');
    if (oppEmpty) oppEmpty.style.display = '';
    const freshBanner = document.getElementById('opp-freshness-banner');
    if (freshBanner) freshBanner.remove();

    // Section 5 — IBM product research
    const queryResponse = document.getElementById('query-response-area');
    if (queryResponse) queryResponse.style.display = 'none';
    const queryField = document.getElementById('query-response-field');
    if (queryField) queryField.value = '';
    const prodContainer = document.getElementById('selected-product-container');
    if (prodContainer) prodContainer.style.display = 'none';
    const prodEmpty = document.getElementById('product-empty-state');
    if (prodEmpty) prodEmpty.style.display = '';
    const prodQuestions = document.getElementById('product-questions-container');
    if (prodQuestions) prodQuestions.innerHTML = '';

    // Section 6 — competitive intelligence
    const compResponse = document.getElementById('competitive-response-area');
    if (compResponse) compResponse.style.display = 'none';
    const compField = document.getElementById('competitive-response-field');
    if (compField) compField.value = '';

    // Section 7 — headlines
    const headlinesGrid = document.querySelector('.headlines-grid');
    if (headlinesGrid) headlinesGrid.innerHTML = '';

    // Section 9 — visualisation
    const visOutput = document.getElementById('vis-output');
    if (visOutput) visOutput.style.display = 'none';
    const visImg = document.getElementById('vis-output-img');
    if (visImg) { visImg.src = ''; visImg.dataset.downloadUrl = ''; }

    // Section 10 — email
    const emailBody = document.getElementById('email-content-body');
    if (emailBody) emailBody.innerHTML = '';
    const emailSubject = document.getElementById('email-subject-input');
    if (emailSubject) emailSubject.value = 'Strategic Insights for [Customer Name]';

    // Account history timeline
    const timeline = document.getElementById('account-timeline');
    if (timeline) timeline.style.display = 'none';
    const coverage = document.getElementById('pillar-coverage-strip');
    if (coverage) coverage.style.display = 'none';

    // Reset in-memory generated responses
    state.generatedResponses = {};
    state.selectedPillar     = null;

    // Reset pillar pill selection
    document.querySelectorAll('.pillar-pill').forEach(p => p.classList.remove('active'));
  }

  /**
   * Remove hidden-until-pillar from every gated section so the seller
   * can access any section without being forced to pick a pillar first.
   * Persists the revealed state to AccountMemory so it survives account switches.
   */
  function revealAllSections() {
    document.querySelectorAll('.section.hidden-until-pillar').forEach(s => {
      s.classList.remove('hidden-until-pillar');
      s.classList.add('revealed');
    });
    // Persist so the state is restored when switching back to this account
    if (window.AccountMemory && state.customerName) {
      window.AccountMemory.setSectionsRevealed(state.customerName, true);
    }
    // Re-render switcher so the button updates to a "hide" affordance
    renderAccountSwitcher();
    showNotification('✓ All sections unlocked');
  }

  function handleCustomerNameChange(e) {
    const newName = e.target.value.trim();
    state.customerName = e.target.value;
    updateCustomerNameDisplays();
    wireLinkedInSearchLinks();

    // If this is a net-new account (no saved data), clear all sections
    if (newName.length > 1 && window.AccountMemory) {
      const existing = window.AccountMemory.listAccounts();
      const isKnown  = existing.some(
        n => window.AccountMemory.normalise(n) === window.AccountMemory.normalise(newName)
      );
      if (!isKnown) {
        clearAllSections();
      } else {
        // Touch lastVisited so the 7-day prune window is refreshed on every visit
        const acct = window.AccountMemory.getAccount(newName);
        if (acct) window.AccountMemory.saveAccount(newName, acct);
      }
    }

    // Auto-fetch headlines when customer name is entered (debounced)
    if (state.customerName && state.customerName.length > 2) {
      debouncedFetchHeadlines();
    }
  }

  function updateCustomerNameDisplays() {
    wireLinkedInSearchLinks();
    const displayText = state.customerName || 'Selected Customer';
    elements.customerNameDisplays.forEach(element => {
      element.textContent = displayText;
    });
  }
  
  // Debounced version of fetchHeadlines to avoid too many API calls
  const debouncedFetchHeadlines = debounce(() => {
    fetchHeadlines();
  }, 1500);

  // ============================================
  // INDUSTRY HANDLING
  // ============================================
  
  function handleIndustryChange(e) {
    state.industry = e.target.value;
    saveData();
    console.log('Industry changed to:', state.industry);
    
    // Show success message
    showSuccessMessage(e.target.closest('.section'), 'Industry updated successfully');
  }

  // ============================================
  // GENERATE BUTTON HANDLING
  // ============================================
  /**
   * Get context information for each automation pillar
   */
  function getPillarContext(pillar) {
    const contexts = {
      'application-modernization': {
        name: 'Application Modernization',
        solutions: 'IBM Cloud Pak for Applications, Red Hat OpenShift, IBM Mono2Micro, IBM Application Discovery and Delivery Intelligence (ADDI), IBM webMethods Hybrid Integration',
        focus: 'modernizing legacy applications, containerization, microservices, cloud-native development, hybrid integration'
      },
      'infrastructure-automation': {
        name: 'Infrastructure Automation',
        solutions: 'IBM Cloud Pak for Watson AIOps, Red Hat Ansible Automation Platform, IBM Turbonomic, IBM Instana, IBM Concert Platform, HashiCorp Vault, HashiCorp Terraform, IBM Verify',
        focus: 'IT operations automation, AIOps, infrastructure optimization, observability, identity and access management, infrastructure as code'
      },
      'technology-business-management': {
        name: 'Technology Business Management',
        solutions: 'IBM Apptio, IBM Apptio TargetProcess, IBM Cloudability, IBM Planning Analytics, IBM Envizi',
        focus: 'IT financial management, cost optimization, cloud cost management, agile portfolio management, sustainability reporting, technology investment planning'
      }
    };
    
    return contexts[pillar] || {
      name: 'Automation',
      solutions: 'IBM automation solutions',
      focus: 'digital transformation and automation'
    };
  }

  /**
   * Get product-specific context for Infrastructure Automation questions
   */
  function getInfrastructureProductContext(questionNumber) {
    const productMap = {
      '1': 'HashiCorp Terraform',
      '2': 'HashiCorp Terraform',
      '3': 'IBM Verify',
      '4': 'HashiCorp Vault',
      '5': 'HashiCorp Vault',
      '6': 'IBM SevOne, IBM NS1, IBM Cloud Pak for Watson AIOps',
      '7': 'IBM SevOne, IBM NS1, IBM Cloud Pak for Watson AIOps',
      '8': 'IBM SevOne, IBM NS1, IBM Cloud Pak for Watson AIOps',
      '9': 'IBM SevOne, IBM NS1, IBM Cloud Pak for Watson AIOps',
      '10': 'IBM SevOne, IBM NS1, IBM Cloud Pak for Watson AIOps',
      '11': 'IBM SevOne, IBM NS1, IBM Cloud Pak for Watson AIOps'
    };
    
    return productMap[questionNumber] || null;
  }

  
  /**
   * Read seller notes for a given question card from localStorage.
   * Returns the trimmed string or empty string if none.
   */
  function getSellerNotesForCard(questionCard) {
    const qNum = questionCard.querySelector('.question-card__number')?.textContent || '';
    // Also check live textarea in case it hasn't been persisted yet
    const liveTa = questionCard.querySelector('.seller-notes-textarea');
    if (liveTa && liveTa.value.trim()) return liveTa.value.trim();
    return localStorage.getItem(`notes-${qNum}`)?.trim() || '';
  }

  async function handleGenerateClick(e) {
    const button = e.currentTarget;
    const questionCard = button.closest('.question-card');
    const responseContainer = questionCard.querySelector('.question-card__response');
    const responseField = questionCard.querySelector('.response-field');
    
    if (!state.customerName) {
      alert('Please enter a customer name first');
      elements.customerNameInput.focus();
      return;
    }

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
      // Get question text
      const question = questionCard.querySelector('.question-card__question').textContent;
      
      // Check if this is a Section 3 (Automation Pillar) question
      const pillarAttribute = questionCard.getAttribute('data-pillar-question');
      const isSection3 = pillarAttribute !== null;
      
      // For Section 3, enhance the question with structured context
      // Read any seller notes for this card — used to enrich the prompt
      const sellerNotes = getSellerNotesForCard(questionCard);
      const sellerNotesBlock = sellerNotes
        ? `\n\nSELLER'S FIRST-HAND OBSERVATIONS (from direct customer conversation — treat as higher-confidence than public research):\n${sellerNotes}\n\nWhere the seller's observations confirm or contradict public research, prioritise the seller's observations in your response.`
        : '';

      let queryQuestion = question;
      if (isSection3) {
        const pillarContext = getPillarContext(pillarAttribute);
        
        // Get question number for product-specific recommendations
        const questionNumber = questionCard.querySelector('.question-card__number')?.textContent;
        
        // Check if this is Infrastructure Automation with specific product mapping
        let specificProducts = pillarContext.solutions;
        if (pillarAttribute === 'infrastructure-automation' && questionNumber) {
          const productContext = getInfrastructureProductContext(questionNumber);
          if (productContext) {
            specificProducts = productContext;
          }
        }
        
        queryQuestion = `You are a sales research assistant. Answer this question about ${state.customerName} (${state.industry || 'Technology'} industry):

"${question}"
${sellerNotesBlock}

CRITICAL: You MUST structure your response in exactly TWO parts:

PART 1 - CUSTOMER'S PUBLIC STATEMENTS & CURRENT STATE:
Search ${state.customerName}'s annual reports, 10-K filings, analyst reports, and media coverage. Summarize what they have publicly shared about this specific topic.${sellerNotes ? ' Also incorporate the seller\'s first-hand observations above.' : ' If no public information exists, write: "No public information found on this topic for ' + state.customerName + '."'}

PART 2 - IBM SOLUTIONS TO LEAD WITH:
Recommend how an IBM seller should lead with these specific products: ${specificProducts}
Include specific capabilities, use cases, and value proposition for ${state.customerName}.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

**Customer's Public Statements & Current State:**
[Your research findings about ${state.customerName} on this topic${sellerNotes ? ', informed by the seller\'s direct observations' : ''}]

**IBM Solutions to Lead With:**
[Your recommendations focusing on: ${specificProducts}]

**Value Proposition:**
[How these solutions address ${state.customerName}'s needs]`;
      } else {
        // Section 2 plain question — append seller notes if present
        if (sellerNotes) {
          queryQuestion = `${question}${sellerNotesBlock}`;
        }
      }
      
      let response, sources;
      
      // Priority 1: Try Research API (Serper + OpenAI) - Free tier available
      if (window.ResearchAPI && window.ResearchAPI.areAPIsConfigured()) {
        try {
          console.log('Using Research API (Serper + OpenAI)');
          const result = await window.ResearchAPI.researchCustomer(
            state.customerName,
            state.industry || 'Technology',
            queryQuestion
          );
          response = result.response;
          sources = result.sources;
        } catch (error) {
          console.error('Research API error:', error);
          // Fall through to next option
          response = null;
        }
      }
      
      // Priority 2: Try IBM docs backend if Research API failed or not configured
      if (!response) {
        const backendAvailable = window.IBMDocsIntegration &&
                                await window.IBMDocsIntegration.checkHealth();
        
        if (backendAvailable) {
          console.log('Using IBM Documentation API');
          const apiResponse = await window.IBMDocsIntegration.generateResponse(
            queryQuestion,
            state.customerName,
            state.industry || 'Technology'
          );
          
          const formatted = window.IBMDocsIntegration.formatResponse(apiResponse, state.customerName);
          response = formatted.response;
          sources = formatted.sources;
        }
      }
      
      // Priority 3: Fallback to mock data
      if (!response) {
        console.log('No APIs configured, using mock data');
        const mockData = generateMockResponseWithSources(questionCard);
        response = mockData.response;
        sources = mockData.sources;
      }
      
      // Get question number first
      const questionNumber = questionCard.querySelector('.question-card__number').textContent;
      
      // Apply source modifications (removed/added sources)
      const modifiedSources = applySourceModifications(sources, questionNumber);
      
      // Update UI
      responseField.value = response;
      responseContainer.style.display = 'block';
      
      // Add sources citation with modified sources
      addSourcesCitation(responseContainer, modifiedSources, questionNumber);
      
      // Clear source management state after successful regeneration
      if (state.sourcesManagement[questionNumber]) {
        state.sourcesManagement[questionNumber] = {
          removed: [],
          added: []
        };
      }
      
      // Reset button
      button.classList.remove('loading');
      button.disabled = false;
      button.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Regenerate
      `;
      
      // Smooth scroll to response
      responseContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Add AI suggestions if they don't exist
      if (!responseContainer.querySelector('.ai-suggestions')) {
        addAISuggestions(responseContainer, questionCard);
      }
      
      // Save response
      state.generatedResponses[questionNumber] = response;
      saveData();
      // Log to manager coverage
      logCoverageSession(questionCard);
      // Notify AccountMemory so this session is persisted per-account
      document.dispatchEvent(new CustomEvent('pb:responseSaved', {
        detail: {
          customerName: state.customerName,
          pillar: questionCard.getAttribute('data-pillar-question') || '',
          questionId: window.AccountMemory?.buildQuestionId(questionCard) || questionNumber,
          responseText: response
        }
      }));
      
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Get question number
      const questionNumber = questionCard.querySelector('.question-card__number').textContent;
      
      // Show error and fallback to mock data
      const { response, sources } = generateMockResponseWithSources(questionCard);
      
      // Apply source modifications even for error fallback
      const modifiedSources = applySourceModifications(sources, questionNumber);
      
      responseField.value = response;
      responseContainer.style.display = 'block';
      addSourcesCitation(responseContainer, modifiedSources, questionNumber);
      
      // Clear source management state after regeneration
      if (state.sourcesManagement[questionNumber]) {
        state.sourcesManagement[questionNumber] = {
          removed: [],
          added: []
        };
      }
      
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

  /**
   * Add AI suggestion follow-ups to a response
   */
  function addAISuggestions(responseContainer, questionCard) {
    const question = questionCard.querySelector('.question-card__question').textContent;
    const suggestions = generateAISuggestions(question);
    
    if (suggestions.length === 0) return;
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'ai-suggestions';
    suggestionsDiv.innerHTML = `
      <div class="ai-suggestions__header">
        <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>AI Suggested Follow-ups:</span>
      </div>
      <ul class="ai-suggestions__list">
        ${suggestions.map(s => `<li class="ai-suggestion">${s}</li>`).join('')}
      </ul>
    `;
    
    responseContainer.appendChild(suggestionsDiv);
  }

  /**
   * Generate AI suggestions based on the question
   */
  function generateAISuggestions(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('strategic priorities')) {
      return [
        'How do these align with current market trends?',
        'What metrics define success for these priorities?',
        'What resources are allocated to each priority?'
      ];
    } else if (lowerQuestion.includes('prompted')) {
      return [
        'What specific market disruptions influenced these decisions?',
        'How did customer feedback shape these priorities?',
        'What competitive pressures drove these changes?'
      ];
    } else if (lowerQuestion.includes('differentiate')) {
      return [
        'What unique capabilities set you apart?',
        'How do customers perceive your competitive advantages?',
        'What innovations are competitors unable to replicate?'
      ];
    } else if (lowerQuestion.includes('it imperatives')) {
      return [
        'Which technologies are critical to these initiatives?',
        'What infrastructure changes are required?',
        'How does this impact your cloud strategy?'
      ];
    } else if (lowerQuestion.includes('application development')) {
      return [
        'What development methodologies are you adopting?',
        'How are you addressing technical debt?',
        'What role does AI/ML play in your applications?'
      ];
    } else if (lowerQuestion.includes('cybersecurity')) {
      return [
        'What are your top security concerns?',
        'How are you implementing zero-trust?',
        'What compliance requirements drive your security strategy?'
      ];
    } else if (lowerQuestion.includes('network performance') || lowerQuestion.includes('detect and prioritize')) {
      return [
        'What monitoring tools are currently in use?',
        'How are network incidents prioritized and escalated?',
        'What percentage of issues are resolved proactively vs reactively?'
      ];
    } else if (lowerQuestion.includes('dns resolution') || lowerQuestion.includes('ddos')) {
      return [
        'What DNS infrastructure is currently deployed?',
        'How do you handle geographic distribution of DNS services?',
        'What DDoS mitigation strategies are in place?'
      ];
    } else if (lowerQuestion.includes('applications always receive') || lowerQuestion.includes('scaling actions')) {
      return [
        'What triggers currently initiate scaling actions?',
        'How long does it typically take to scale resources?',
        'What percentage of scaling is proactive vs reactive?'
      ];
    } else if (lowerQuestion.includes('manually configuring monitoring') || lowerQuestion.includes('zero configuration observability')) {
      return [
        'How much time is spent on manual monitoring configuration?',
        'What tools are currently used for observability?',
        'How quickly can you identify root causes today?'
      ];
    } else if (lowerQuestion.includes('consolidate siloed monitoring') || lowerQuestion.includes('ai powered it ops hub')) {
      return [
        'How many different monitoring tools are in use?',
        'What is your current mean time to resolution (MTTR)?',
        'What percentage of incidents require manual intervention?'
      ];
    }
    
    // Default suggestions
    return [
      'Can you provide specific examples?',
      'What timeline are you working with?',
      'What challenges do you anticipate?'
    ];
  }

  // ============================================
  // MOCK RESPONSE GENERATION WITH SOURCES
  // ============================================
  
  /**
   * Generate mock response with source citations
   */
  function generateMockResponseWithSources(questionCard) {
    const question = questionCard.querySelector('.question-card__question').textContent;
    const customerName = state.customerName || 'the customer';
    const industry = state.industry || 'their industry';
    
    // Generate sources based on question type
    const sources = generateSourcesForQuestion(question, customerName);
    const response = generateMockResponse(questionCard);
    
    return { response, sources };
  }
  
  /**
   * Generate relevant sources for a question
   */
  function generateSourcesForQuestion(question, customerName) {
    const lowerQuestion = question.toLowerCase();
    const sources = [];
    const companySlug = customerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const searchQuery = encodeURIComponent(`${customerName} ${question}`);
    
    // ALWAYS add Annual Report and 10-K first (highest priority company documents)
    sources.push(
      { name: `${customerName} Annual Report 2025`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' annual report 2025')}`, type: 'Company Report', priority: 1 },
      { name: `${customerName} 10-K Filing`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' 10-K SEC filing')}`, type: 'Financial Report', priority: 1 }
    );
    
    // Add sources based on question content (6-8 sources to demonstrate pagination)
    if (lowerQuestion.includes('challenge') || lowerQuestion.includes('problem')) {
      sources.push(
        { name: 'Gartner Industry Analysis', url: `https://www.google.com/search?q=${encodeURIComponent('Gartner ' + customerName + ' analysis')}`, type: 'Research' },
        { name: `${customerName} Press Releases`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' press releases')}`, type: 'News' },
        { name: `${customerName} Q4 Earnings Call`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' earnings call transcript')}`, type: 'Financial Report' },
        { name: 'Industry Analyst Reports', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' analyst reports')}`, type: 'Research' },
        { name: `${customerName} Customer Reviews`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' customer reviews')}`, type: 'Reviews' }
      );
    } else if (lowerQuestion.includes('initiative') || lowerQuestion.includes('project')) {
      sources.push(
        { name: `${customerName} Investor Presentation Q4 2025`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' investor presentation 2025')}`, type: 'Company Report' },
        { name: 'LinkedIn Company Updates', url: `https://www.linkedin.com/company/${companySlug}`, type: 'Social Media' },
        { name: 'TechCrunch News', url: `https://www.google.com/search?q=site:techcrunch.com+${encodeURIComponent(customerName)}`, type: 'News' },
        { name: `${customerName} Strategic Roadmap`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' strategic roadmap')}`, type: 'Company Report' },
        { name: 'Industry Conference Presentations', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' conference presentations')}`, type: 'Events' },
        { name: `${customerName} Innovation Blog`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' innovation blog')}`, type: 'Company Blog' },
        { name: 'Partner Ecosystem Analysis', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' partnerships')}`, type: 'Research' }
      );
    } else if (lowerQuestion.includes('technology') || lowerQuestion.includes('stack')) {
      sources.push(
        { name: 'BuiltWith Technology Profile', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' technology stack')}`, type: 'Tech Analysis' },
        { name: `${customerName} Engineering Blog`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' engineering blog')}`, type: 'Company Blog' },
        { name: 'Stack Overflow Insights', url: `https://stackoverflow.com/search?q=${encodeURIComponent(customerName)}`, type: 'Developer Community' },
        { name: `${customerName} GitHub Repositories`, url: `https://github.com/search?q=${encodeURIComponent(customerName)}`, type: 'Open Source' },
        { name: 'Technology Architecture Diagrams', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' architecture')}`, type: 'Tech Analysis' },
        { name: 'Developer Documentation', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' developer docs')}`, type: 'Documentation' }
      );
    } else if (lowerQuestion.includes('competitor') || lowerQuestion.includes('market')) {
      sources.push(
        { name: 'Forrester Market Research', url: `https://www.google.com/search?q=${encodeURIComponent('Forrester ' + customerName)}`, type: 'Research' },
        { name: 'IDC Industry Report', url: `https://www.google.com/search?q=${encodeURIComponent('IDC ' + customerName + ' report')}`, type: 'Research' },
        { name: 'Competitive Analysis Report', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' competitive analysis')}`, type: 'Research' },
        { name: 'Market Share Data', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' market share')}`, type: 'Research' },
        { name: 'Industry Trends Report', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' industry trends')}`, type: 'Research' },
        { name: 'SWOT Analysis', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' SWOT analysis')}`, type: 'Research' }
      );
    } else if (lowerQuestion.includes('decision') || lowerQuestion.includes('stakeholder')) {
      sources.push(
        { name: `${customerName} Leadership Team`, url: `https://www.linkedin.com/company/${companySlug}/people/`, type: 'LinkedIn' },
        { name: `${customerName} Organizational Chart`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' leadership team')}`, type: 'Company Data' },
        { name: 'ZoomInfo Contact Database', url: `https://www.google.com/search?q=site:zoominfo.com+${encodeURIComponent(customerName)}`, type: 'Contact Database' },
        { name: 'Executive Bios & Backgrounds', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' executive team')}`, type: 'Company Data' },
        { name: 'Board of Directors Information', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' board of directors')}`, type: 'Company Data' },
        { name: 'Decision-Making Process Analysis', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' procurement process')}`, type: 'Research' }
      );
    } else if (lowerQuestion.includes('budget') || lowerQuestion.includes('investment')) {
      sources.push(
        { name: `${customerName} Financial Statements`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' financial statements')}`, type: 'Financial Report' },
        { name: 'IT Spending Forecast 2026', url: `https://www.google.com/search?q=${encodeURIComponent('IT spending forecast 2026 ' + customerName)}`, type: 'Research' },
        { name: 'Industry Benchmark Report', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' industry benchmark')}`, type: 'Research' },
        { name: 'Capital Expenditure Analysis', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' capex analysis')}`, type: 'Financial Report' },
        { name: 'Budget Allocation Trends', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' budget allocation')}`, type: 'Research' },
        { name: 'Investment Priorities Report', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' investment priorities')}`, type: 'Research' }
      );
    } else {
      // Default sources
      sources.push(
        { name: `${customerName} Company Website`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' official website')}&btnI=1`, type: 'Company Website' },
        { name: 'Industry News & Analysis', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' news')}`, type: 'News' },
        { name: 'Market Research Reports', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' market research')}`, type: 'Research' },
        { name: `${customerName} About Us`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' about us')}`, type: 'Company Website' },
        { name: 'Recent Press Coverage', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' press coverage')}`, type: 'News' },
        { name: 'Company Overview & Profile', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' company profile')}`, type: 'Company Data' }
      );
    }
    
    return sources;
  }
  
  function generateMockResponse(questionCard) {
    const question = questionCard.querySelector('.question-card__question').textContent;
    const customerName = state.customerName || 'the customer';
    const industry = state.industry || 'their industry';
    
    const responses = {
      'strategic priorities': `Based on recent market analysis and ${industry} sector trends, ${customerName} is focusing on three key strategic priorities:\n\n1. Digital Transformation & Modernization: Upgrading legacy infrastructure and adopting cloud-native architectures to improve operational agility, reduce technical debt, and enable faster innovation cycles.\n\n2. Customer Experience & Engagement: Leveraging AI-driven personalization, omnichannel capabilities, and data analytics to deliver superior customer experiences and drive competitive differentiation in ${industry}.\n\n3. Operational Excellence & Efficiency: Implementing intelligent automation, advanced analytics, and process optimization to streamline operations, reduce costs, and improve decision-making across the organization.\n\nThese strategic priorities align with broader ${industry} industry trends and position ${customerName} to capitalize on emerging market opportunities while addressing current operational challenges.`,
      
      'prompted these priorities': `Several key factors have driven ${customerName}'s current strategic priorities:\n\n• Market Disruption: ${industry} sector experiencing rapid digital transformation with new competitors leveraging cloud-native technologies and AI capabilities\n\n• Leadership Vision: Executive team recognizing need for technology modernization to maintain competitive position and drive growth\n\n• Performance Gaps: Analysis revealing inefficiencies in legacy systems impacting customer satisfaction scores and operational costs\n\n• Regulatory Pressures: Evolving compliance requirements in ${industry} necessitating enhanced security controls and data governance\n\n• Customer Expectations: Rising demand for seamless digital experiences, real-time services, and personalized interactions across all touchpoints\n\n• Competitive Pressure: Key competitors in ${industry} gaining market share through superior digital capabilities and faster innovation`,
      
      'differentiate': `${customerName} is differentiating itself in the ${industry} market through:\n\n• Technology Innovation: Early adoption and strategic implementation of emerging technologies including AI/ML, advanced analytics, and cloud-native architectures\n\n• Customer-Centric Design: Deep focus on user experience research, journey mapping, and continuous feedback loops to deliver superior customer satisfaction\n\n• Operational Agility: Modern development practices (DevOps, CI/CD) enabling faster time-to-market and rapid response to market changes\n\n• Data-Driven Intelligence: Advanced analytics platform providing real-time insights for strategic decision-making and predictive capabilities\n\n• Strategic Partnerships: Ecosystem of technology alliances with leading providers to access best-in-class solutions and accelerate innovation\n\n• Industry Expertise: Deep domain knowledge in ${industry} combined with technical excellence to deliver tailored solutions`,
      
      'IT imperatives': `${customerName}'s strategic business initiatives translate to the following critical IT imperatives:\n\n• Cloud Migration & Modernization: Accelerating migration of 70%+ workloads to hybrid/multi-cloud infrastructure to improve scalability, reduce costs, and enable innovation\n\n• API-First Architecture: Building comprehensive integration layer with modern API management to enable seamless connectivity across systems and partners\n\n• Zero-Trust Security: Implementing enterprise-wide zero-trust security framework to protect against evolving threats and meet ${industry} compliance requirements\n\n• Unified Data Platform: Establishing cloud-based data lake and analytics infrastructure to enable AI/ML initiatives and data-driven decision making\n\n• DevOps Transformation: Adopting CI/CD pipelines, infrastructure as code, and automated testing to accelerate delivery and improve quality\n\n• Application Modernization: Refactoring legacy applications to microservices architecture for improved agility and maintainability`,
      
      'Application development': `${customerName} has identified several critical application development and integration initiatives:\n\n• Legacy Application Modernization: Systematic refactoring of monolithic applications into cloud-native microservices architecture to improve scalability and reduce technical debt\n\n• Cloud-Native Development: Building new applications on Kubernetes and serverless platforms to leverage auto-scaling, resilience, and cost optimization\n\n• Enterprise API Strategy: Implementing comprehensive API management platform to enable secure, scalable integration across internal systems and external partners\n\n• Low-Code/No-Code Platforms: Deploying citizen developer tools to accelerate delivery of business applications and reduce IT backlog\n\n• Mobile-First Applications: Developing progressive web apps and native mobile applications to meet customer expectations for anytime, anywhere access\n\n• Integration Modernization: Replacing legacy ESB with modern integration patterns (event-driven, API-led) to improve real-time data flow\n\nThese initiatives directly support ${customerName}'s digital transformation goals and competitive positioning in ${industry}.`,
      
      'cybersecurity': `${customerName} faces several critical cybersecurity and identity management challenges:\n\n• Zero-Trust Architecture: Transitioning from traditional perimeter-based security to comprehensive zero-trust model with continuous verification and least-privilege access\n\n• Secrets & Credentials Management: Need for centralized vault solution to securely manage API keys, certificates, passwords, and sensitive configuration data across hybrid infrastructure\n\n• Identity Governance & Administration: Implementing robust IAM platform with MFA, conditional access, lifecycle management, and privileged access controls\n\n• Compliance & Audit: Meeting evolving regulatory requirements specific to ${industry} including SOC 2, ISO 27001, GDPR, and industry-specific mandates\n\n• Cloud Security Posture: Securing multi-cloud environments, SaaS applications, and ensuring consistent security policies across hybrid infrastructure\n\n• Threat Detection & Response: Enhancing SIEM capabilities, security operations center (SOC), and incident response procedures to detect and mitigate threats in real-time\n\n• Application Security: Implementing DevSecOps practices, vulnerability management, and secure software development lifecycle (SDLC)`
    };
    
    // Find matching response based on question keywords
    for (const [key, response] of Object.entries(responses)) {
      if (question.toLowerCase().includes(key)) {
        return response;
      }
    }
    
    // Default response
    return `Based on our research of ${customerName} in the ${industry} sector, we've identified several key insights:\n\n• Strategic focus on digital transformation and innovation\n• Investment in modern technology infrastructure\n• Emphasis on customer experience and operational efficiency\n• Commitment to security and compliance\n\nWe recommend further discussion to explore how our solutions can support these initiatives.`;
  }
  /**
   * Add sources citation to response container
   */
  function addSourcesCitation(responseContainer, sources, questionNumber) {
    // Remove existing sources if any
    const existingSources = responseContainer.querySelector('.response-sources');
    if (existingSources) {
      existingSources.remove();
    }
    
    if (!sources || sources.length === 0) return;
    
    const SOURCES_PER_PAGE = 3;
    const hasMoreSources = sources.length > SOURCES_PER_PAGE;
    
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'response-sources';
    sourcesDiv.innerHTML = `
      <div class="response-sources__header">
        <svg class="response-sources__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8L6 4L10 8M6 4V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="response-sources__title">Sources</span>
      </div>
      <div class="response-sources__list">
        ${sources.map((source, index) => `
          <div class="source-item ${index >= SOURCES_PER_PAGE ? 'source-item--hidden' : ''}" data-source-index="${index}" style="${index >= SOURCES_PER_PAGE ? 'display: none !important;' : ''}">
            <span class="source-item__number">[${index + 1}]</span>
            <a href="${source.url}" class="source-item__link" target="_blank" rel="noopener noreferrer">
              <span class="source-item__name">${source.name}</span>
              <span class="source-item__type">${source.type}</span>
            </a>
            <button class="source-item__remove" data-source-index="${index}" title="Remove source">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        `).join('')}
      </div>
      ${hasMoreSources ? `
        <button class="show-more-sources-btn" data-expanded="false" data-sources-per-page="${SOURCES_PER_PAGE}">
          <svg class="show-more-sources-btn__icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5L7 9L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="show-more-sources-btn__text">Show ${sources.length - SOURCES_PER_PAGE} more source${sources.length - SOURCES_PER_PAGE === 1 ? '' : 's'}</span>
        </button>
      ` : ''}
      <button class="add-source-btn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Add Source
      </button>
    `;
    
    // Insert before AI suggestions or at the end
    const aiSuggestions = responseContainer.querySelector('.ai-suggestions');
    if (aiSuggestions) {
      responseContainer.insertBefore(sourcesDiv, aiSuggestions);
    } else {
      responseContainer.appendChild(sourcesDiv);
    }
    
    // Add event listeners for remove buttons
    sourcesDiv.querySelectorAll('.source-item__remove').forEach(btn => {
      btn.addEventListener('click', (e) => handleRemoveSource(e, questionNumber, sources));
    });
    
    // Add event listener for show more button
    const showMoreBtn = sourcesDiv.querySelector('.show-more-sources-btn');
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', () => handleShowMoreSources(showMoreBtn, sourcesDiv));
    }
    
    // Add event listener for add source button
    const addBtn = sourcesDiv.querySelector('.add-source-btn');
    addBtn.addEventListener('click', () => {
      handleAddSourceClick(responseContainer, questionNumber);
    });
  }

  /**
   * Handle show more sources button click
   */
  function handleShowMoreSources(button, sourcesDiv) {
    const isExpanded = button.dataset.expanded === 'true';
    const allSources = sourcesDiv.querySelectorAll('.source-item');
    const sourcesPerPage = parseInt(button.dataset.sourcesPerPage) || 3;
    const icon = button.querySelector('.show-more-sources-btn__icon');
    const text = button.querySelector('.show-more-sources-btn__text');
    
    if (isExpanded) {
      // Collapse - hide sources beyond first page
      allSources.forEach((source, index) => {
        if (index >= sourcesPerPage) {
          source.classList.add('source-item--hidden');
          source.style.display = 'none';
        }
      });
      button.dataset.expanded = 'false';
      icon.style.transform = 'rotate(0deg)';
      const hiddenCount = allSources.length - sourcesPerPage;
      text.textContent = `Show ${hiddenCount} more source${hiddenCount === 1 ? '' : 's'}`;
    } else {
      // Expand - show all sources
      allSources.forEach(source => {
        source.classList.remove('source-item--hidden');
        source.style.display = 'flex';
      });
      button.dataset.expanded = 'true';
      icon.style.transform = 'rotate(180deg)';
      text.textContent = 'Show less';
    }
  }


  /**
   * Apply source modifications (removed/added) to a source list
   */
  function applySourceModifications(originalSources, questionNumber) {
    if (!state.sourcesManagement[questionNumber]) {
      return originalSources;
    }
    
    const { removed, added } = state.sourcesManagement[questionNumber];
    
    // Filter out removed sources
    let modifiedSources = originalSources.filter(source => {
      return !removed.some(removedSource =>
        removedSource.url === source.url && removedSource.name === source.name
      );
    });
    
    // Add new sources
    if (added && added.length > 0) {
      modifiedSources = [...modifiedSources, ...added];
    }
    
    return modifiedSources;
  }

  /**
   * Handle removing a source
   */
  function handleRemoveSource(event, questionNumber, allSources) {
    const button = event.currentTarget;
    const sourceIndex = parseInt(button.dataset.sourceIndex);
    const sourceItem = button.closest('.source-item');
    
    // Initialize source management for this question if needed
    if (!state.sourcesManagement[questionNumber]) {
      state.sourcesManagement[questionNumber] = {
        removed: [],
        added: []
      };
    }
    
    // Add to removed list
    const removedSource = allSources[sourceIndex];
    state.sourcesManagement[questionNumber].removed.push(removedSource);
    
    // Animate removal
    sourceItem.style.opacity = '0.5';
    sourceItem.style.textDecoration = 'line-through';
    button.disabled = true;
    
    // Save state
    saveData();
    
    showNotification('Source removed. Click Regenerate to update response.');
  }

  /**
   * Handle add source button click - Opens modal
   */
  function handleAddSourceClick(responseContainer, questionNumber) {
    // Check if modal already exists
    if (document.querySelector('.add-source-modal-wrapper')) {
      return;
    }
    
    // Create a wrapper that contains both backdrop and modal
    const wrapper = document.createElement('div');
    wrapper.className = 'add-source-modal-wrapper';
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: relative;
      width: 90%;
      max-width: 500px;
      background-color: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: scaleIn 0.2s ease-out;
    `;
    
    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; border-bottom: 1px solid #E8E5DF;">
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; font-weight: 500; color: #2C2C2C; margin: 0;">Add New Source</h3>
        <button class="add-source-modal__close" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; background: none; cursor: pointer; border-radius: 6px; transition: background-color 0.2s;" aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div style="padding: 32px;">
        <div style="margin-bottom: 24px;">
          <label for="source-name-${questionNumber}" style="display: block; font-size: 0.9375rem; font-weight: 500; color: #2C2C2C; margin-bottom: 8px;">Source Name *</label>
          <input
            type="text"
            style="width: 100%; padding: 12px 16px; border: 1px solid #E8E5DF; border-radius: 8px; font-size: 0.9375rem; transition: border-color 0.2s;"
            placeholder="e.g., TechCrunch Article"
            id="source-name-${questionNumber}"
            required
          >
        </div>
        <div style="margin-bottom: 24px;">
          <label for="source-url-${questionNumber}" style="display: block; font-size: 0.9375rem; font-weight: 500; color: #2C2C2C; margin-bottom: 8px;">URL *</label>
          <input
            type="url"
            style="width: 100%; padding: 12px 16px; border: 1px solid #E8E5DF; border-radius: 8px; font-size: 0.9375rem; transition: border-color 0.2s;"
            placeholder="https://example.com/article"
            id="source-url-${questionNumber}"
            required
          >
        </div>
        <div style="margin-bottom: 0;">
          <label for="source-type-${questionNumber}" style="display: block; font-size: 0.9375rem; font-weight: 500; color: #2C2C2C; margin-bottom: 8px;">Source Type</label>
          <select style="width: 100%; padding: 12px 16px; border: 1px solid #E8E5DF; border-radius: 8px; font-size: 0.9375rem; cursor: pointer; background-color: white;" id="source-type-${questionNumber}">
            <option value="Web Source">Web Source</option>
            <option value="Research">Research</option>
            <option value="News">News</option>
            <option value="Company Data">Company Data</option>
            <option value="Financial Report">Financial Report</option>
            <option value="Tech News">Tech News</option>
            <option value="Documentation">Documentation</option>
          </select>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 12px; padding: 24px 32px; border-top: 1px solid #E8E5DF;">
        <button class="add-source-modal__cancel" style="padding: 12px 32px; border: 1px solid #E8E5DF; background-color: white; color: #6B6B6B; border-radius: 8px; font-size: 0.9375rem; font-weight: 500; cursor: pointer; transition: all 0.2s;">Cancel</button>
        <button class="add-source-modal__submit" style="padding: 12px 32px; border: none; background-color: #2C2C2C; color: white; border-radius: 8px; font-size: 0.9375rem; font-weight: 500; cursor: pointer; transition: all 0.2s;">Add Source</button>
      </div>
    `;
    
    wrapper.appendChild(modal);
    document.body.appendChild(wrapper);
    
    // Close modal function
    const closeModal = () => {
      wrapper.style.animation = 'fadeOut 0.2s ease-out';
      modal.style.animation = 'scaleOut 0.2s ease-out';
      
      setTimeout(() => {
        wrapper.remove();
      }, 200);
    };
    
    // Prevent clicks on modal content from closing
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Add event listeners
    const closeBtn = modal.querySelector('.add-source-modal__close');
    const cancelBtn = modal.querySelector('.add-source-modal__cancel');
    const submitBtn = modal.querySelector('.add-source-modal__submit');
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    wrapper.addEventListener('click', closeModal);
    submitBtn.addEventListener('click', () => handleAddSource(modal, questionNumber, responseContainer, closeModal));
    
    // Hover effects
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.backgroundColor = '#FEFEFE');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.backgroundColor = 'transparent');
    cancelBtn.addEventListener('mouseenter', () => cancelBtn.style.backgroundColor = '#FEFEFE');
    cancelBtn.addEventListener('mouseleave', () => cancelBtn.style.backgroundColor = 'white');
    submitBtn.addEventListener('mouseenter', () => submitBtn.style.backgroundColor = '#3A3A3A');
    submitBtn.addEventListener('mouseleave', () => submitBtn.style.backgroundColor = '#2C2C2C');
    
    // ESC key to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
    
    // Focus first input
    setTimeout(() => {
      modal.querySelector(`#source-name-${questionNumber}`).focus({ preventScroll: true });
    }, 100);
  }

  /**
   * Handle adding a new source
   */
  function handleAddSource(modal, questionNumber, responseContainer, closeModal) {
    const nameInput = modal.querySelector(`#source-name-${questionNumber}`);
    const urlInput = modal.querySelector(`#source-url-${questionNumber}`);
    const typeSelect = modal.querySelector(`#source-type-${questionNumber}`);
    
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    const type = typeSelect.value;
    
    // Validate
    if (!name || !url) {
      // Show validation error in modal
      nameInput.style.borderColor = !name ? 'var(--color-error)' : '';
      urlInput.style.borderColor = !url ? 'var(--color-error)' : '';
      showNotification('Please enter both name and URL', 'error');
      return;
    }
    
    // Initialize source management for this question if needed
    if (!state.sourcesManagement[questionNumber]) {
      state.sourcesManagement[questionNumber] = {
        removed: [],
        added: []
      };
    }
    
    // Add to added list
    const newSource = { name, url, type };
    state.sourcesManagement[questionNumber].added.push(newSource);
    
    // Add to display
    const sourcesList = responseContainer.querySelector('.response-sources__list');
    const currentCount = sourcesList.querySelectorAll('.source-item').length;
    
    const sourceItem = document.createElement('div');
    sourceItem.className = 'source-item source-item--new';
    sourceItem.innerHTML = `
      <span class="source-item__number">[${currentCount + 1}]</span>
      <a href="${url}" class="source-item__link" target="_blank" rel="noopener noreferrer">
        <span class="source-item__name">${name}</span>
        <span class="source-item__type">${type}</span>
      </a>
      <button class="source-item__remove" title="Remove source">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    `;
    
    sourcesList.appendChild(sourceItem);
    
    // Add remove listener for new source
    const removeBtn = sourceItem.querySelector('.source-item__remove');
    removeBtn.addEventListener('click', () => {
      // Remove from added list
      const index = state.sourcesManagement[questionNumber].added.indexOf(newSource);
      if (index > -1) {
        state.sourcesManagement[questionNumber].added.splice(index, 1);
      }
      sourceItem.remove();
      saveData();
    });
    
    // Close modal
    closeModal();
    
    // Save state
    saveData();
    
    showNotification('Source added. Click Regenerate to include in response.');
  }

  // ============================================
  // AI SUGGESTION HANDLING
  // ============================================
  
  function handleAISuggestionClick(suggestionElement) {
    const suggestionText = suggestionElement.textContent;
    console.log('AI suggestion clicked:', suggestionText);
    
    // Find the parent question card
    const questionCard = suggestionElement.closest('.question-card');
    if (!questionCard) return;
    
    const responseContainer = questionCard.querySelector('.question-card__response');
    const responseField = questionCard.querySelector('.response-field');
    const generateBtn = questionCard.querySelector('.generate-btn');
    
    if (!responseField || !generateBtn || !responseContainer) return;
    
    // Make sure response container is visible
    responseContainer.style.display = 'block';
    
    // Animate the suggestion
    suggestionElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
      suggestionElement.style.transform = '';
    }, 150);
    
    // Show loading state
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
      </svg>
      Generating follow-up...
    `;
    
    // Show notification
    showNotification(`Generating response for: "${suggestionText}"`);
    
    // Generate follow-up response using Research API if available
    (async () => {
      let followUpResponse, sources;
      
      // Check if this is a Section 3 question
      const pillarAttribute = questionCard.getAttribute('data-pillar-question');
      const isSection3 = pillarAttribute !== null;
      
      // For Section 3, enhance the follow-up question
      let queryQuestion = suggestionText;
      if (isSection3) {
        const pillarContext = getPillarContext(pillarAttribute);
        
        // Get question number for product-specific recommendations
        const questionNumber = questionCard.querySelector('.question-card__number')?.textContent;
        
        // Check if this is Infrastructure Automation with specific product mapping
        let specificProducts = pillarContext.solutions;
        if (pillarAttribute === 'infrastructure-automation' && questionNumber) {
          const productContext = getInfrastructureProductContext(questionNumber);
          if (productContext) {
            specificProducts = productContext;
          }
        }
        
        queryQuestion = `You are a sales research assistant. Answer this follow-up question about ${state.customerName} (${state.industry || 'Technology'} industry):

"${suggestionText}"

CRITICAL: You MUST structure your response in exactly TWO parts:

PART 1 - CUSTOMER'S PUBLIC STATEMENTS & CURRENT STATE:
Search ${state.customerName}'s annual reports, 10-K filings, analyst reports, and media coverage. Summarize what they have publicly shared about this specific topic. If no public information exists, write: "No public information found on this topic for ${state.customerName}."

PART 2 - IBM SOLUTIONS TO LEAD WITH:
Recommend how an IBM seller should lead with these specific products: ${specificProducts}
Include specific capabilities, use cases, and value proposition for ${state.customerName}.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

**Customer's Public Statements & Current State:**
[Your research findings about ${state.customerName} on this topic]

**IBM Solutions to Lead With:**
[Your recommendations focusing on: ${specificProducts}]

**Value Proposition:**
[How these solutions address ${state.customerName}'s needs]`;
      }
      
      // Try Research API first
      if (window.ResearchAPI && window.ResearchAPI.areAPIsConfigured()) {
        try {
          console.log('Using Research API for follow-up question');
          const result = await window.ResearchAPI.researchCustomer(
            state.customerName,
            state.industry || 'Technology',
            queryQuestion
          );
          followUpResponse = result.response;
          sources = result.sources;
        } catch (error) {
          console.error('Research API failed for follow-up, using fallback:', error);
          const fallback = generateFollowUpResponseWithSources(suggestionText, questionCard);
          followUpResponse = fallback.response;
          sources = fallback.sources;
        }
      } else {
        // Fallback to mock data
        console.log('No Research API configured, using mock data for follow-up');
        const fallback = generateFollowUpResponseWithSources(suggestionText, questionCard);
        followUpResponse = fallback.response;
        sources = fallback.sources;
      }
      
      // Append to existing response or create new
      const currentResponse = responseField.value;
      if (currentResponse && currentResponse.trim()) {
        responseField.value = currentResponse + '\n\n---\n\n**Follow-up: ' + suggestionText + '**\n\n' + followUpResponse;
      } else {
        responseField.value = '**Follow-up: ' + suggestionText + '**\n\n' + followUpResponse;
      }
      
      // Get question number
      const questionNumber = questionCard.querySelector('.question-card__number').textContent;
      
      // Add or update sources for follow-up
      if (sources && sources.length > 0) {
        const existingSources = responseContainer.querySelector('.response-sources');
        if (existingSources) {
          // Get all existing sources
          const sourcesList = existingSources.querySelector('.response-sources__list');
          const existingSourceItems = Array.from(sourcesList.querySelectorAll('.source-item'));
          
          // Merge new sources with existing ones (avoid duplicates)
          const allSources = existingSourceItems.map(item => {
            const link = item.querySelector('.source-item__link');
            return {
              name: item.querySelector('.source-item__name').textContent,
              url: link.href,
              type: item.querySelector('.source-item__type').textContent
            };
          });
          
          // Add new sources that don't already exist
          sources.forEach(source => {
            if (!allSources.some(s => s.url === source.url)) {
              allSources.push(source);
            }
          });
          
          // Rebuild the entire sources section with proper pagination
          addSourcesCitation(responseContainer, allSources, questionNumber);
        } else {
          addSourcesCitation(responseContainer, sources, questionNumber);
        }
      }
      
      // Auto-expand textarea
      responseField.style.height = 'auto';
      responseField.style.height = responseField.scrollHeight + 'px';
      
      // Reset button
      generateBtn.classList.remove('loading');
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Regenerate
      `;
      
      // Scroll to show new content
      responseField.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Save updated response
      state.generatedResponses[questionNumber] = responseField.value;
      saveData();
      
      showNotification('Follow-up response added!');
    })();
  }
  
  // ============================================
  // FOLLOW-UP RESPONSE GENERATION
  // ============================================
  
  function generateFollowUpResponse(followUpQuestion, questionCard) {
    const customerName = state.customerName || 'the customer';
    const industry = state.industry || 'their industry';
    
    // Generate contextual responses based on the follow-up question
    const responses = {
      'market trends': `Current market trends in ${industry} show:\n• Increased adoption of cloud-native technologies\n• Growing focus on AI and automation\n• Emphasis on customer experience and digital channels\n• Rising importance of data security and privacy\n\n${customerName}'s priorities align well with these trends, positioning them competitively.`,
      
      'metrics': `Key success metrics for ${customerName} include:\n• Time-to-market reduction (target: 40% improvement)\n• Customer satisfaction scores (target: 85%+)\n• Operational cost savings (target: 25% reduction)\n• System uptime and reliability (target: 99.9%)\n• Employee productivity gains (target: 30% improvement)`,
      
      'resources': `Resource allocation for ${customerName}:\n• Budget: $15-20M allocated across initiatives\n• Team: 50+ FTEs dedicated to transformation\n• Timeline: 18-24 month implementation roadmap\n• Technology Partners: Strategic partnerships with leading vendors\n• Executive Sponsorship: C-level commitment and oversight`,
      
      'technology investments': `Planned technology investments include:\n• Cloud infrastructure and migration ($5M)\n• Application modernization ($4M)\n• Security and compliance tools ($3M)\n• Data analytics and AI platforms ($2M)\n• Integration and API management ($1.5M)`,
      
      'IT budget': `IT budget allocation:\n• Infrastructure: 35%\n• Application development: 30%\n• Security: 20%\n• Operations and maintenance: 10%\n• Innovation and R&D: 5%`,
      
      'legacy systems': `Legacy systems being replaced:\n• Mainframe applications (20+ years old)\n• Monolithic ERP system\n• Custom-built CRM platform\n• On-premise data warehouses\n• Legacy integration middleware`,
      
      'cloud platforms': `Cloud platform strategy:\n• Primary: AWS for core infrastructure\n• Secondary: Azure for Microsoft workloads\n• Multi-cloud approach for resilience\n• Hybrid cloud for sensitive data\n• Serverless and containerization (Kubernetes)`,
      
      'integration patterns': `Preferred integration patterns:\n• API-first architecture with REST/GraphQL\n• Event-driven architecture for real-time data\n• Microservices for modularity\n• Service mesh for inter-service communication\n• Enterprise service bus for legacy integration`,
      
      'security challenges': `Key security challenges:\n• Securing distributed cloud environments\n• Managing identity across hybrid infrastructure\n• Protecting sensitive customer data\n• Meeting compliance requirements (SOC 2, GDPR)\n• Detecting and responding to threats in real-time`,
      
      'identity management': `Identity management priorities:\n• Single sign-on (SSO) across all applications\n• Multi-factor authentication (MFA) enforcement\n• Role-based access control (RBAC)\n• Privileged access management (PAM)\n• Identity governance and lifecycle management`
    };
    
    // Find matching response based on keywords
    const lowerQuestion = followUpQuestion.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return response;
      }
    }
    
    // Default follow-up response
    return `Regarding "${followUpQuestion}":\n\n${customerName} is taking a strategic approach that considers:\n• Current capabilities and gaps\n• Industry best practices\n• Competitive positioning\n• Resource constraints and opportunities\n• Long-term scalability and flexibility\n\nThis aligns with their overall transformation objectives and positions them for success in ${industry}.`;
  }

  /**
   * Generate follow-up response with sources
   */
  function generateFollowUpResponseWithSources(followUpQuestion, questionCard) {
    const customerName = state.customerName || 'the customer';
    const response = generateFollowUpResponse(followUpQuestion, questionCard);
    const sources = generateSourcesForFollowUp(followUpQuestion, customerName);
    
    return { response, sources };
  }
  
  /**
   * Generate sources for follow-up questions (6-8 sources to demonstrate pagination)
   */
  function generateSourcesForFollowUp(followUpQuestion, customerName) {
    const lowerQuestion = followUpQuestion.toLowerCase();
    const sources = [];
    
    if (lowerQuestion.includes('market') || lowerQuestion.includes('trend')) {
      sources.push(
        { name: 'Gartner Market Guide 2026', url: `https://www.google.com/search?q=${encodeURIComponent('Gartner market guide 2026 ' + customerName)}`, type: 'Research' },
        { name: 'Industry Trend Analysis', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' industry trends 2026')}`, type: 'Research' },
        { name: 'Forrester Wave Report', url: `https://www.google.com/search?q=${encodeURIComponent('Forrester wave ' + customerName)}`, type: 'Research' },
        { name: `${customerName} Market Position`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' market position analysis')}`, type: 'Research' },
        { name: 'Competitive Landscape 2026', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' competitive landscape')}`, type: 'Research' },
        { name: 'Market Share Data', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' market share data')}`, type: 'Research' }
      );
    } else if (lowerQuestion.includes('metric') || lowerQuestion.includes('kpi')) {
      sources.push(
        { name: `${customerName} Performance Dashboard`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' performance metrics KPI')}`, type: 'Internal Data' },
        { name: 'Industry Benchmarks Report', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' industry benchmarks')}`, type: 'Research' },
        { name: 'KPI Framework Guide', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' KPI framework')}`, type: 'Documentation' },
        { name: `${customerName} Analytics Platform`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' analytics platform')}`, type: 'Tech Analysis' },
        { name: 'Performance Metrics Best Practices', url: `https://www.google.com/search?q=${encodeURIComponent('performance metrics best practices')}`, type: 'Research' },
        { name: 'Business Intelligence Reports', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' business intelligence')}`, type: 'Internal Data' }
      );
    } else if (lowerQuestion.includes('resource') || lowerQuestion.includes('budget')) {
      sources.push(
        { name: `${customerName} Budget Allocation`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' IT budget allocation')}`, type: 'Financial Data' },
        { name: 'IT Spending Trends 2026', url: `https://www.google.com/search?q=${encodeURIComponent('IT spending trends 2026')}`, type: 'Research' },
        { name: `${customerName} Financial Planning`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' financial planning')}`, type: 'Financial Data' },
        { name: 'Resource Allocation Strategy', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' resource allocation')}`, type: 'Research' },
        { name: 'Budget Optimization Guide', url: `https://www.google.com/search?q=${encodeURIComponent('IT budget optimization')}`, type: 'Research' },
        { name: 'Cost Management Framework', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' cost management')}`, type: 'Financial Data' }
      );
    } else if (lowerQuestion.includes('technology') || lowerQuestion.includes('platform')) {
      sources.push(
        { name: 'Technology Stack Analysis', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' technology stack')}`, type: 'Tech Analysis' },
        { name: `${customerName} Tech Blog`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' technology blog')}`, type: 'Company Blog' },
        { name: 'Platform Architecture Review', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' platform architecture')}`, type: 'Tech Analysis' },
        { name: `${customerName} Engineering Insights`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' engineering insights')}`, type: 'Company Blog' },
        { name: 'Technology Roadmap', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' technology roadmap')}`, type: 'Company Data' },
        { name: 'Platform Evaluation Report', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' platform evaluation')}`, type: 'Research' }
      );
    } else if (lowerQuestion.includes('security') || lowerQuestion.includes('compliance')) {
      sources.push(
        { name: 'Security Framework Guide', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' security framework')}`, type: 'Documentation' },
        { name: 'Compliance Requirements 2026', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' compliance requirements')}`, type: 'Regulatory' },
        { name: `${customerName} Security Posture`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' security posture')}`, type: 'Tech Analysis' },
        { name: 'Regulatory Compliance Guide', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' regulatory compliance')}`, type: 'Regulatory' },
        { name: 'Security Best Practices', url: `https://www.google.com/search?q=${encodeURIComponent('security best practices 2026')}`, type: 'Documentation' },
        { name: 'Audit & Compliance Reports', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' audit reports')}`, type: 'Regulatory' }
      );
    } else {
      sources.push(
        { name: 'Industry Best Practices', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' best practices')}`, type: 'Research' },
        { name: `${customerName} Case Studies`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' case studies')}`, type: 'Company Data' },
        { name: `${customerName} White Papers`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' white papers')}`, type: 'Research' },
        { name: 'Implementation Guide', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' implementation guide')}`, type: 'Documentation' },
        { name: `${customerName} Success Stories`, url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' success stories')}`, type: 'Company Data' },
        { name: 'Industry Analysis Report', url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' industry analysis')}`, type: 'Research' }
      );
    }
    
    return sources;
  }

  // ============================================
  // EXPORT HANDLING
  // ============================================
  
  function handleExportClick(e) {
    const button = e.currentTarget;
    const exportType = button.textContent.trim();
    const section = button.closest('.section');
    const sectionTitle = section.querySelector('.section__title').textContent;
    
    console.log(`Exporting ${sectionTitle} as ${exportType}`);
    
    // Animate button
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
    
    // Show loading notification
    showNotification(`Preparing ${exportType} export for ${sectionTitle}...`);
    
    // Delay to show loading state
    setTimeout(() => {
      if (exportType === 'PDF') {
        exportToPDF(section, sectionTitle);
      } else if (exportType === 'PPT') {
        exportToPPT(section, sectionTitle);
      }
    }, 500);
  }
  
  // ============================================
  // PDF EXPORT
  // ============================================
  
  function exportToPDF(section, sectionTitle) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      const customerName = state.customerName || 'Customer';
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      
      // Helper function to clean markdown formatting
      function cleanMarkdown(text) {
        if (!text) return '';
        return text
          .replace(/\*\*/g, '')  // Remove bold markers (**)
          .replace(/\*/g, '')    // Remove italic/bullet markers (*)
          .replace(/^[•\-]\s+/gm, '• ') // Normalize bullets
          .replace(/#{1,6}\s/g, '') // Remove markdown headers
          .trim();
      }
      
      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Prospecting Board', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Customer: ${customerName}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;
      
      // Section Title
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(sectionTitle, margin, yPosition);
      yPosition += 10;
      
      // Content
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      // Check if this is Section 5 (Product Research) with query response
      const queryResponseArea = section.querySelector('#query-response-area');
      const queryQuestionText = section.querySelector('#query-question-text');
      const queryResponseField = section.querySelector('#query-response-field');
      
      if (queryResponseArea && queryResponseArea.style.display !== 'none' && queryQuestionText && queryResponseField) {
        // Export Section 5 query response
        const question = cleanMarkdown(queryQuestionText.textContent || '');
        const response = cleanMarkdown(queryResponseField.value || 'No response generated yet.');
        
        if (question && response !== 'No response generated yet.') {
          // Question
          doc.setFont(undefined, 'bold');
          const questionLines = doc.splitTextToSize(`Question: ${question}`, maxWidth);
          doc.text(questionLines, margin, yPosition);
          yPosition += (questionLines.length * 5) + 5;
          
          // Response
          doc.setFont(undefined, 'normal');
          const responseLines = doc.splitTextToSize(response, maxWidth);
          
          responseLines.forEach(line => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += 5;
          });
        } else {
          doc.text('No query response available. Please search for an IBM product first.', margin, yPosition);
        }
      } else {
        // Export regular question cards (for all other sections)
        const questionCards = section.querySelectorAll('.question-card');
        
        if (questionCards.length === 0) {
          doc.text('No questions available in this section.', margin, yPosition);
        } else {
          questionCards.forEach((card, index) => {
            const question = cleanMarkdown(card.querySelector('.question-card__question')?.textContent || '');
            const responseField = card.querySelector('.response-field');
            const response = cleanMarkdown(responseField?.value || 'No response generated yet.');
            const sellerNotes = getSellerNotesForCard(card);
            
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = margin;
            }
            
            // Question
            doc.setFont(undefined, 'bold');
            const questionLines = doc.splitTextToSize(`Q${index + 1}: ${question}`, maxWidth);
            doc.text(questionLines, margin, yPosition);
            yPosition += (questionLines.length * 5) + 5;
            
            // AI Response
            doc.setFont(undefined, 'normal');
            const responseLines = doc.splitTextToSize(response, maxWidth);
            
            responseLines.forEach(line => {
              if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = margin;
              }
              doc.text(line, margin, yPosition);
              yPosition += 5;
            });

            // Seller's Observations (if any)
            if (sellerNotes) {
              yPosition += 4;
              if (yPosition > pageHeight - 30) { doc.addPage(); yPosition = margin; }
              doc.setFont(undefined, 'bold');
              doc.setFontSize(9);
              doc.setTextColor(146, 64, 14); // amber
              doc.text('Seller\'s Observations:', margin, yPosition);
              yPosition += 5;
              doc.setFont(undefined, 'normal');
              const notesLines = doc.splitTextToSize(sellerNotes, maxWidth);
              notesLines.forEach(line => {
                if (yPosition > pageHeight - 20) { doc.addPage(); yPosition = margin; }
                doc.text(line, margin, yPosition);
                yPosition += 5;
              });
              doc.setTextColor(0, 0, 0); // reset
              doc.setFontSize(10);
            }
            
            yPosition += 10; // Space between questions
          });
        }
      }
      
      // Save the PDF
      const filename = `${sectionTitle.replace(/[^a-z0-9]/gi, '_')}_${customerName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      doc.save(filename);
      
      showNotification(`✓ PDF exported successfully: ${filename}`);
    } catch (error) {
      console.error('PDF export error:', error);
      showNotification('❌ PDF export failed. Please try again.');
    }
  }
  
  // ============================================
  // POWERPOINT EXPORT
  // ============================================
  
  function exportToPPT(section, sectionTitle) {
    try {
      const pptx = new PptxGenJS();
      
      const customerName = state.customerName || 'Customer';
      
      // Helper function to clean markdown formatting
      function cleanMarkdown(text) {
        if (!text) return '';
        return text
          .replace(/\*\*/g, '')  // Remove bold markers (**)
          .replace(/\*/g, '')    // Remove italic/bullet markers (*)
          .replace(/^[•\-]\s+/gm, '• ') // Normalize bullets
          .replace(/#{1,6}\s/g, '') // Remove markdown headers
          .trim();
      }
      
      // Title Slide
      let slide = pptx.addSlide();
      slide.background = { color: 'F5F3EE' };
      
      slide.addText('Prospecting Board', {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 1,
        fontSize: 44,
        bold: true,
        color: '2C2C2C',
        align: 'center'
      });
      
      slide.addText(sectionTitle, {
        x: 0.5,
        y: 2.7,
        w: 9,
        h: 0.6,
        fontSize: 28,
        color: '4A4A4A',
        align: 'center'
      });
      
      slide.addText(`Customer: ${customerName}`, {
        x: 0.5,
        y: 4,
        w: 9,
        h: 0.4,
        fontSize: 16,
        color: '8B8B8B',
        align: 'center'
      });
      
      slide.addText(new Date().toLocaleDateString(), {
        x: 0.5,
        y: 4.5,
        w: 9,
        h: 0.4,
        fontSize: 14,
        color: '8B8B8B',
        align: 'center'
      });
      
      // Check if this is Section 5 (Product Research) with query response
      const queryResponseArea = section.querySelector('#query-response-area');
      const queryQuestionText = section.querySelector('#query-question-text');
      const queryResponseField = section.querySelector('#query-response-field');
      
      if (queryResponseArea && queryResponseArea.style.display !== 'none' && queryQuestionText && queryResponseField) {
        // Export Section 5 query response
        const question = cleanMarkdown(queryQuestionText.textContent || '');
        const response = cleanMarkdown(queryResponseField.value || 'No response generated yet.');
        
        if (question && response !== 'No response generated yet.') {
          slide = pptx.addSlide();
          slide.background = { color: 'FFFFFF' };
          
          // Question as title
          slide.addText('Product Research Query', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.5,
            fontSize: 18,
            bold: true,
            color: '4A4A4A'
          });
          
          slide.addText(question, {
            x: 0.5,
            y: 1.2,
            w: 9,
            h: 1,
            fontSize: 16,
            color: '2C2C2C',
            valign: 'top'
          });
          
          // Response
          slide.addText(response, {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 4,
            fontSize: 12,
            color: '2C2C2C',
            valign: 'top'
          });
        } else {
          slide = pptx.addSlide();
          slide.background = { color: 'FFFFFF' };
          slide.addText('No query response available. Please search for an IBM product first.', {
            x: 0.5,
            y: 3,
            w: 9,
            h: 1,
            fontSize: 16,
            color: '8B8B8B',
            align: 'center'
          });
        }
      } else {
        // Content Slides for regular question cards
        const questionCards = section.querySelectorAll('.question-card');
        
        if (questionCards.length === 0) {
          slide = pptx.addSlide();
          slide.background = { color: 'FFFFFF' };
          slide.addText('No questions available in this section.', {
            x: 0.5,
            y: 3,
            w: 9,
            h: 1,
            fontSize: 16,
            color: '8B8B8B',
            align: 'center'
          });
        } else {
          questionCards.forEach((card, index) => {
            const question = cleanMarkdown(card.querySelector('.question-card__question')?.textContent || '');
            const responseField = card.querySelector('.response-field');
            const response = cleanMarkdown(responseField?.value || 'No response generated yet.');
            const sellerNotes = getSellerNotesForCard(card);
            
            slide = pptx.addSlide();
            slide.background = { color: 'FFFFFF' };
            
            // Question as title
            slide.addText(`Question ${index + 1}`, {
              x: 0.5,
              y: 0.5,
              w: 9,
              h: 0.5,
              fontSize: 18,
              bold: true,
              color: '4A4A4A'
            });
            
            slide.addText(question, {
              x: 0.5,
              y: 1.2,
              w: 9,
              h: 0.8,
              fontSize: 14,
              color: '2C2C2C',
              valign: 'top'
            });
            
            // AI Response — compress height if seller notes present
            const responseH = sellerNotes ? 2.8 : 4;
            slide.addText(response, {
              x: 0.5,
              y: 2.2,
              w: 9,
              h: responseH,
              fontSize: 11,
              color: '2C2C2C',
              valign: 'top'
            });

            // Seller's Observations box — amber tint, bottom of slide
            if (sellerNotes) {
              slide.addText('Seller\'s Observations', {
                x: 0.5,
                y: 5.2,
                w: 9,
                h: 0.3,
                fontSize: 10,
                bold: true,
                color: '92400E'
              });
              slide.addText(sellerNotes, {
                x: 0.5,
                y: 5.55,
                w: 9,
                h: 1.6,
                fontSize: 10,
                color: '78350F',
                fill: { color: 'FFFBEB' },
                valign: 'top',
                wrap: true
              });
            }
          });
        }
      }
      
      // Save the PowerPoint
      const filename = `${sectionTitle.replace(/[^a-z0-9]/gi, '_')}_${customerName.replace(/[^a-z0-9]/gi, '_')}.pptx`;
      pptx.writeFile({ fileName: filename });
      
      showNotification(`✓ PowerPoint exported successfully: ${filename}`);
    } catch (error) {
      console.error('PPT export error:', error);
      showNotification('❌ PowerPoint export failed. Please try again.');
    }
  }

  // ============================================
  // EMAIL HANDLING
  // ============================================
  
  function handleEditEmail() {
    const emailContent = document.querySelector('.email-content');
    if (emailContent) {
      emailContent.contentEditable = true;
      emailContent.style.border = '1px dashed var(--color-border-medium)';
      emailContent.style.padding = 'var(--space-md)';
      emailContent.focus();
      
      showNotification('Email is now editable. Click anywhere outside to save changes.');
      
      emailContent.addEventListener('blur', function() {
        this.contentEditable = false;
        this.style.border = 'none';
        this.style.padding = '0';
      }, { once: true });
    }
  }

  function handleHeadlineClick(e) {
    e.preventDefault();
    
    const headlineCard = e.currentTarget.closest('.headline-card');
    const url = headlineCard.dataset.url;
    
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      showNotification('📰 No article URL available. Please fetch headlines first.');
    }
  }

  // ============================================
  // NEWS/HEADLINES FUNCTIONALITY
  // ============================================
  
  const NEWS_API_KEY = (window.__API_KEYS__ || {}).NEWS_API_KEY || ''; // Set in js/api-keys.local.js
  const NEWS_API_URL = 'https://newsapi.org/v2/everything';
  
  /**
   * Fetch news headlines for the customer
   */
  async function fetchHeadlines() {
    if (!state.customerName) {
      showNotification('Please enter a customer name first');
      return;
    }
    
    // Check if API key is configured
    if (NEWS_API_KEY === 'YOUR_API_KEY_HERE') {
      showNotification('⚠️ News API key not configured. Using mock headlines.');
      updateHeadlinesDisplay(generateMockHeadlines());
      return;
    }
    
    try {
      showNotification('Fetching latest headlines...');
      
      const query = encodeURIComponent(`${state.customerName} technology OR ${state.customerName} digital transformation`);
      const url = `${NEWS_API_URL}?q=${query}&sortBy=publishedAt&language=en&pageSize=6&apiKey=${NEWS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'ok' && data.articles && data.articles.length > 0) {
        updateHeadlinesDisplay(data.articles);
        showNotification(`✓ Found ${data.articles.length} recent headlines`);

        // ── Account Memory: log headlines ──
        if (window.AccountMemory && state.customerName) {
          const titles = data.articles.slice(0, 3).map(a => a.title?.substring(0, 60) || '').filter(Boolean);
          window.AccountMemory.logActivity(
            state.customerName,
            'headlines',
            `${data.articles.length} headlines fetched — "${titles[0] || ''}"`,
            { count: data.articles.length, titles }
          );
        }
      } else {
        showNotification('No recent headlines found. Using mock data.');
        updateHeadlinesDisplay(generateMockHeadlines());
      }
    } catch (error) {
      console.error('Error fetching headlines:', error);
      showNotification('❌ Failed to fetch headlines. Using mock data.');
      updateHeadlinesDisplay(generateMockHeadlines());
    }
  }
  
  /**
   * Generate mock headlines when API is not available
   */
  function generateMockHeadlines() {
    const customerName = state.customerName || 'Selected Customer';
    return [
      {
        title: `${customerName} announces major cloud migration initiative to enhance digital capabilities`,
        source: { name: 'TechCrunch' },
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' cloud migration')}`
      },
      {
        title: `${customerName} invests $500M in AI and automation technologies to drive innovation`,
        source: { name: 'Reuters' },
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' AI investment')}`
      },
      {
        title: `${customerName} announces strategic partnership for cybersecurity enhancement`,
        source: { name: 'Bloomberg' },
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' cybersecurity')}`
      },
      {
        title: `${customerName} expands digital transformation efforts with new technology investments`,
        source: { name: 'Wall Street Journal' },
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' digital transformation')}`
      },
      {
        title: `${customerName} launches new customer experience platform powered by AI`,
        source: { name: 'Forbes' },
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' customer experience AI')}`
      },
      {
        title: `${customerName} reports strong growth in cloud services and digital offerings`,
        source: { name: 'CNBC' },
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        url: `https://www.google.com/search?q=${encodeURIComponent(customerName + ' cloud growth')}`
      }
    ];
  }
  
  /**
   * Update headlines display with fetched or mock data
   */
  function updateHeadlinesDisplay(articles) {
    const headlinesGrid = document.querySelector('.headlines-grid');
    if (!headlinesGrid) return;
    
    headlinesGrid.innerHTML = '';
    
    articles.slice(0, 6).forEach((article, index) => {
      const publishedDate = new Date(article.publishedAt);
      const timeAgo = getTimeAgo(publishedDate);
      
      const card = document.createElement('article');
      card.className = 'headline-card';
      card.dataset.url = article.url;
      card.innerHTML = `
        <div class="headline-card__header">
          <span class="headline-card__number">${String(index + 1).padStart(2, '0')}</span>
          <div class="headline-card__meta">
            <span class="headline-card__source">${article.source.name.toUpperCase()}</span>
            <span class="headline-card__separator">•</span>
            <span class="headline-card__time">${timeAgo}</span>
          </div>
        </div>
        <h3 class="headline-card__title">${article.title}</h3>
        <a href="${article.url}" class="headline-card__link" aria-label="Read full article" target="_blank">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 13L13 7M13 7H7M13 7V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      `;
      
      headlinesGrid.appendChild(card);
    });
    
    // Re-attach click handlers to new links
    const headlineLinks = document.querySelectorAll('.headline-card__link');
    headlineLinks.forEach(link => {
      link.addEventListener('click', handleHeadlineClick);
    });
  }
  
  /**
   * Get human-readable time ago string
   */
  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  function handleSendEmail() {
    if (!state.customerName) {
      alert('Please enter a customer name first');
      return;
    }
    
    const subject = document.querySelector('.email-field__input').value;
    const body = document.querySelector('.email-content').innerText;
    
    // In a real implementation, this would integrate with Microsoft Graph API
    console.log('Sending email via Outlook...');
    console.log('Subject:', subject);
    console.log('Body:', body);
    
    // Create mailto link as fallback
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // If a diagram has been inserted into the email, download it as a PNG
    // so the seller can attach it manually in Outlook.
    const diagramImg = document.querySelector('#email-content-body .email-diagram-block__img');
    const hasDiagram = diagramImg && diagramImg.src && diagramImg.src.startsWith('data:');

    const confirmMsg = hasDiagram
      ? 'The diagram will be downloaded as a PNG so you can attach it in Outlook.\n\nOpen Outlook to send this email?'
      : 'Open Outlook to send this email?';

    if (confirm(confirmMsg)) {
      // Auto-download the diagram PNG before Outlook opens
      if (hasDiagram) {
        const a = document.createElement('a');
        const topic = (diagramImg.alt || 'diagram').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const customer = (state.customerName || 'customer').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.href = diagramImg.src;
        a.download = `${customer}_${topic}.png`;
        a.click();
      }

      window.location.href = mailtoLink;

      // ── Account Memory: log email sent ──
      if (window.AccountMemory && state.customerName) {
        window.AccountMemory.logActivity(
          state.customerName,
          'email',
          `Email sent — subject: "${subject.substring(0, 60)}${subject.length > 60 ? '…' : ''}"`,
          { subject, sentAt: new Date().toISOString() }
        );
      }
    }
  }

  // ============================================
  // GREETING UPDATE
  // ============================================
  
  function updateGreeting() {
    const hour = state.currentTime.getHours();
    let greeting = 'Good evening';
    
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 18) {
      greeting = 'Good afternoon';
    }
    
    if (elements.headerGreeting) {
      const userName = elements.headerName ? elements.headerName.textContent : 'User';
      elements.headerGreeting.innerHTML = `${greeting}, <span class="header__name">${userName}</span>.`;
    }
  }

  // ============================================
  // DATA PERSISTENCE
  // ============================================
  
  function saveData() {
    // Legacy flat save — kept so nothing breaks if AccountMemory isn't loaded yet
    const data = {
      customerName: state.customerName,
      industry: state.industry,
      generatedResponses: state.generatedResponses,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem('prospectingBoardData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
    // Also snapshot into the per-account store
    if (window.AccountMemory && state.customerName) {
      window.AccountMemory.snapshotCurrentState(state);
    }
  }

  function loadSavedData() {
    try {
      const savedData = localStorage.getItem('prospectingBoardData');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.customerName && elements.customerNameInput) {
          elements.customerNameInput.value = data.customerName;
          state.customerName = data.customerName;
          updateCustomerNameDisplays();
        }
        if (data.industry && elements.industrySelect) {
          elements.industrySelect.value = data.industry;
          state.industry = data.industry;
        }
        if (data.generatedResponses) {
          state.generatedResponses = data.generatedResponses;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // ============================================
  // UI NOTIFICATIONS
  // ============================================
  
  function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background-color: var(--color-accent);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: slideInUp 0.3s ease-out;
      max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  function showSuccessMessage(section, message) {
    const existingMessage = section.querySelector('.success-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      ${message}
    `;
    
    section.querySelector('.section__content').appendChild(successMessage);
    
    setTimeout(() => {
      successMessage.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        successMessage.remove();
      }, 300);
    }, 3000);
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================
  // LINKEDIN CONTACTS INTEGRATION
  // ============================================
  
  const API_BASE_URL = 'http://localhost:3000/api/v1'; // Update with your backend URL
  
  /**
   * Fetch LinkedIn contacts based on customer name and roles
   */
  async function fetchLinkedInContacts() {
    if (!state.customerName) {
      alert('Please enter a customer name first');
      elements.customerNameInput.focus();
      return;
    }

    // Get selected roles from Section 4
    const roles = getSelectedRoles();
    
    if (roles.length === 0) {
      showNotification('Please select at least one role to search for contacts');
      return;
    }

    try {
      showNotification('Searching LinkedIn for contacts...');
      
      const response = await fetch(`${API_BASE_URL}/contacts/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}` // Implement auth token retrieval
        },
        body: JSON.stringify({
          company: state.customerName,
          roles: roles,
          limit: 5
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        state.linkedInContacts = data.data;
        updateContactsDisplay(data.data);
        showNotification(`✓ Found ${data.count} contacts on LinkedIn`);
      } else {
        throw new Error('No contacts found');
      }
    } catch (error) {
      console.error('Error fetching LinkedIn contacts:', error);
      showNotification('❌ Failed to fetch LinkedIn contacts. Using mock data.');
      
      // Fallback to mock data
      const mockContacts = generateMockContactsForRoles(roles);
      state.linkedInContacts = mockContacts;
      updateContactsDisplay(mockContacts);
    }
  }

  /**
   * Get selected roles from the contacts section
   */
  function getSelectedRoles() {
    const roles = [];
    const subsections = elements.contactsSection?.querySelectorAll('.subsection');
    
    if (!subsections) return [];

    subsections.forEach(subsection => {
      const title = subsection.querySelector('.subsection__title')?.textContent;
      const checkbox = subsection.querySelector('.role-checkbox');
      
      if (checkbox && checkbox.checked && title) {
        // Map subsection titles to role titles
        const roleMapping = {
          'IT Leadership': 'Chief Information Officer',
          'Application Development & Integration': 'VP of Application Development',
          'Cybersecurity & Identity Management': 'Chief Information Security Officer',
          'Network Automation & Management': 'Director of Network Operations',
          'ARM, APM & CVEs': 'Head of Application Performance'
        };
        
        const role = roleMapping[title] || title;
        roles.push(role);
      }
    });

    return roles;
  }

  /**
   * Simple LinkedIn search - opens search tabs directly
   */
  function simpleLinkedInSearch() {
    if (!state.customerName) {
      alert('Please enter a customer name first');
      elements.customerNameInput.focus();
      return;
    }

    // Get selected roles
    const roles = getSelectedRoles();
    
    if (roles.length === 0) {
      showNotification('Please select at least one role to search for');
      return;
    }

    showNotification('Opening LinkedIn search tabs...');
    
    // Generate search URLs for each role
    const searchUrls = roles.map(role => ({
      role: role,
      url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(role + ' at ' + state.customerName)}`
    }));
    
    // Open search tabs with delay to avoid popup blocker
    searchUrls.forEach((search, index) => {
      setTimeout(() => {
        window.open(search.url, '_blank');
      }, index * 500);
    });
    
    showNotification(`✓ Opened ${searchUrls.length} LinkedIn search tabs`);
  }

  /**
   * Update contacts display with fetched data
   */
  function updateContactsDisplay(contacts) {
    if (!elements.contactsSection) return;

    const subsections = elements.contactsSection.querySelectorAll('.subsection');
    
    subsections.forEach(subsection => {
      const title = subsection.querySelector('.subsection__title')?.textContent;
      const contactCard = subsection.querySelector('.contact-card');
      
      if (!contactCard) return;

      // Find matching contact for this subsection
      const contact = contacts.find(c => {
        const roleMatch = c.role.toLowerCase().includes(title.toLowerCase()) ||
                         title.toLowerCase().includes(c.role.toLowerCase());
        return roleMatch;
      });

      if (contact) {
        // Update contact card with real data
        const nameElement = contactCard.querySelector('.contact-card__name');
        const roleElement = contactCard.querySelector('.contact-card__role');
        const emailElement = contactCard.querySelector('.contact-card__email');
        const linkedinElement = contactCard.querySelector('.contact-card__linkedin');
        const focusElement = contactCard.querySelector('.contact-card__focus');

        if (nameElement) {
          // name element is now an <input> — use .value; also sync the Section 10 dropdown
          if (nameElement.tagName === 'INPUT') {
            nameElement.value = contact.name || '';
          } else {
            nameElement.textContent = contact.name;
          }
          syncEmailPersonaDropdown();
        }
        if (roleElement) roleElement.textContent = contact.role;
        
        if (emailElement && contact.email) {
          emailElement.textContent = contact.email;
          emailElement.href = `mailto:${contact.email}`;
        } else if (emailElement) {
          emailElement.textContent = 'Email not available';
          emailElement.removeAttribute('href');
        }
        
        if (linkedinElement && contact.linkedinUrl) {
          linkedinElement.href = contact.linkedinUrl;
          linkedinElement.target = '_blank';
        }
        
        if (focusElement && contact.summary) {
          focusElement.textContent = `Focus: ${contact.summary}`;
        }

        // Add visual indicator that data is from LinkedIn
        contactCard.classList.add('linkedin-verified');
        
        // Add LinkedIn badge
        if (!contactCard.querySelector('.linkedin-badge')) {
          const badge = document.createElement('span');
          badge.className = 'linkedin-badge';
          badge.innerHTML = '✓ LinkedIn';
          badge.style.cssText = `
            display: inline-block;
            background: #0077B5;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            margin-left: 0.5rem;
          `;
          roleElement?.appendChild(badge);
        }
      }
    });
  }

  /**
   * Wire all "Search LinkedIn" links in Section 7 with a live search URL
   * built from the current customer name. Called on customer name change.
   */
  function wireLinkedInSearchLinks() {
    const customer = (state.customerName || '').trim();
    document.querySelectorAll('.contact-card__linkedin--search').forEach(link => {
      const role = link.dataset.role || '';
      if (customer && role) {
        const query = encodeURIComponent(role + ' at ' + customer);
        link.href = `https://www.linkedin.com/search/results/people/?keywords=${query}&origin=GLOBAL_SEARCH_HEADER`;
      } else {
        link.href = '#';
      }
    });
  }

  /**
   * Generate mock contacts for selected roles (fallback)
   */
  function generateMockContactsForRoles(roles) {
    const mockData = {
      'Chief Information Officer': {
        name: 'Jane Smith',
        role: 'Chief Information Officer',
        company: state.customerName,
        linkedinUrl: 'https://www.linkedin.com/in/janesmith',
        email: 'jane.smith@company.com',
        summary: 'Overall IT strategy, digital transformation, technology roadmap'
      },
      'VP of Application Development': {
        name: 'John Doe',
        role: 'VP of Application Development',
        company: state.customerName,
        linkedinUrl: 'https://www.linkedin.com/in/johndoe',
        email: 'john.doe@company.com',
        summary: 'Modernization, cloud-native applications, API strategy, microservices architecture'
      },
      'Chief Information Security Officer': {
        name: 'Sarah Johnson',
        role: 'Chief Information Security Officer',
        company: state.customerName,
        linkedinUrl: 'https://www.linkedin.com/in/sarahjohnson',
        email: 'sarah.j@company.com',
        summary: 'Zero-trust architecture, secrets management, identity governance, compliance'
      },
      'Director of Network Operations': {
        name: 'Michael Chen',
        role: 'Director of Network Operations',
        company: state.customerName,
        linkedinUrl: 'https://www.linkedin.com/in/michaelchen',
        email: 'm.chen@company.com',
        summary: 'Software-defined networking, network automation, infrastructure as code'
      },
      'Head of Application Performance': {
        name: 'Lisa Anderson',
        role: 'Head of Application Performance',
        company: state.customerName,
        linkedinUrl: 'https://www.linkedin.com/in/lisaanderson',
        email: 'l.anderson@company.com',
        summary: 'Application monitoring, performance optimization, vulnerability management, CVE tracking'
      }
    };

    return roles.map(role => mockData[role]).filter(Boolean);
  }

  /**
   * Get authentication token (implement based on your auth system)
   */
  function getAuthToken() {
    // TODO: Implement actual token retrieval from your auth system
    // For now, return empty string (will use mock data)
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Add role selection checkboxes to contacts section
   */
  function addRoleSelectionUI() {
    if (!elements.contactsSection) return;

    const subsections = elements.contactsSection.querySelectorAll('.subsection');
    
    subsections.forEach(subsection => {
      const title = subsection.querySelector('.subsection__title');
      if (!title || title.querySelector('.role-checkbox')) return;

      // Add checkbox to subsection title
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'role-checkbox';
      checkbox.checked = false;
      checkbox.style.cssText = `
        margin-right: 0.5rem;
        cursor: pointer;
        width: 1.2rem;
        height: 1.2rem;
        vertical-align: middle;
      `;
      
      title.insertBefore(checkbox, title.firstChild);
    });

    // LinkedIn button is now handled by linkedin-search.js
  }



  // ============================================
  // START APPLICATION
  // ============================================
  // ============================================
  // CUSTOM QUESTIONS - SECTION 2
  // ============================================

  let customQuestionCounter = 0;

  /**
   * Initialize custom questions feature
   */
  function initCustomQuestions() {
    // Section 2 custom questions (original)
    const addBtn = document.getElementById('add-custom-question-btn');
    const inputContainer = document.getElementById('custom-question-input-container');
    const generateBtn = document.getElementById('generate-custom-question-btn');
    const cancelBtn = document.getElementById('cancel-custom-question-btn');
    const textarea = document.getElementById('custom-question-textarea');

    if (addBtn && inputContainer && generateBtn && cancelBtn && textarea) {
      // Show input when add button clicked
      addBtn.addEventListener('click', () => {
        inputContainer.style.display = 'block';
        textarea.value = '';
        textarea.focus();
        addBtn.style.display = 'none';
      });

      // Cancel button
      cancelBtn.addEventListener('click', () => {
        inputContainer.style.display = 'none';
        addBtn.style.display = 'inline-flex';
        textarea.value = '';
      });

      // Generate answer button
      generateBtn.addEventListener('click', () => {
        handleCustomQuestionGenerate();
      });

      // Allow Enter key to submit (Shift+Enter for new line)
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleCustomQuestionGenerate();
        }
      });
    }

    // Section 3 pillar-specific custom questions
    const pillars = ['application-modernization', 'infrastructure-automation', 'technology-business-management'];
    
    pillars.forEach(pillar => {
      const pillarAddBtn = document.querySelector(`.add-custom-question-btn[data-pillar="${pillar}"]`);
      const pillarInputContainer = document.querySelector(`.custom-question-input-container[data-pillar="${pillar}"]`);
      
      if (!pillarAddBtn || !pillarInputContainer) return;
      
      const pillarTextarea = pillarInputContainer.querySelector('.custom-question-textarea');
      const pillarGenerateBtn = pillarInputContainer.querySelector('.generate-custom-question-btn');
      const pillarCancelBtn = pillarInputContainer.querySelector('.cancel-custom-question-btn');
      
      if (!pillarTextarea || !pillarGenerateBtn || !pillarCancelBtn) return;

      // Show input when add button clicked
      pillarAddBtn.addEventListener('click', () => {
        pillarInputContainer.style.display = 'block';
        pillarTextarea.value = '';
        pillarTextarea.focus();
        pillarAddBtn.style.display = 'none';
      });

      // Cancel button
      pillarCancelBtn.addEventListener('click', () => {
        pillarInputContainer.style.display = 'none';
        pillarAddBtn.style.display = 'inline-flex';
        pillarTextarea.value = '';
      });

      // Generate answer button
      pillarGenerateBtn.addEventListener('click', () => {
        handlePillarCustomQuestionGenerate(pillar, pillarTextarea, pillarInputContainer, pillarAddBtn);
      });

      // Allow Enter key to submit (Shift+Enter for new line)
      pillarTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handlePillarCustomQuestionGenerate(pillar, pillarTextarea, pillarInputContainer, pillarAddBtn);
        }
      });
    });

  /**
   * Handle custom question generation for Section 3 pillars
   */
  async function handlePillarCustomQuestionGenerate(pillar, textarea, inputContainer, addBtn) {
    const question = textarea.value.trim();

    if (!question) {
      alert('Please enter a question');
      return;
    }

    if (!state.customerName) {
      alert('Please enter a customer name in Section 1 first');
      elements.customerNameInput.focus();
      return;
    }

    // Increment counter and create question card
    customQuestionCounter++;
    const questionNumber = `C${customQuestionCounter}`;
    
    createPillarCustomQuestionCard(pillar, questionNumber, question);

    // Hide input and show add button
    inputContainer.style.display = 'none';
    addBtn.style.display = 'inline-flex';
    textarea.value = '';

    // Generate response
    await generatePillarCustomQuestionResponse(pillar, questionNumber, question);
  }

  /**
   * Create custom question card for a specific pillar
   */
  function createPillarCustomQuestionCard(pillar, questionNumber, question) {
    const container = document.querySelector(`.custom-questions-container[data-pillar="${pillar}"]`);
    
    if (!container) {
      console.error(`Container not found for pillar: ${pillar}`);
      return;
    }
    
    const card = document.createElement('div');
    card.className = 'custom-question-card';
    card.id = `custom-question-${pillar}-${questionNumber}`;
    card.innerHTML = `
      <div class="custom-question-card__header">
        <span class="custom-question-card__number">${questionNumber}</span>
        <h4 class="custom-question-card__question">${question}</h4>
        <div class="custom-question-card__actions">
          <button class="delete-question-btn" onclick="deletePillarCustomQuestion('${pillar}', '${questionNumber}')" title="Delete question">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      <button class="generate-btn" data-custom-question="${questionNumber}" data-pillar="${pillar}">
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Generating...
      </button>
      <div class="custom-question-card__response" style="display: none;">
        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
      </div>
    `;

    container.appendChild(card);
  }


  /**
   * Generate response for pillar-specific custom question
   */
  async function generatePillarCustomQuestionResponse(pillar, questionNumber, question) {
    const card = document.getElementById(`custom-question-${pillar}-${questionNumber}`);
    const button = card.querySelector('.generate-btn');
    const responseContainer = card.querySelector('.custom-question-card__response');
    const responseField = card.querySelector('.response-field');

    // Show loading state
    button.classList.add('loading');
    button.disabled = true;

    try {
      let response, sources;
      
      // Create comprehensive query that includes both customer context and IBM solution alignment
      const pillarContext = getPillarContext(pillar);
      const enhancedQuestion = `For ${state.customerName} in the ${state.industry || 'Technology'} industry:

PART 1 - Customer Context (from annual reports, 10-K filings, analyst reports, media):
${question}

PART 2 - IBM Solution Alignment:
What IBM ${pillarContext.name} solutions can address this need? Include specific products, capabilities, and use cases.

Please structure the response as:
1. Customer's Current State & Challenges (from their public disclosures)
2. Relevant IBM Solutions & Capabilities
3. Value Proposition & Business Impact`;

      // Priority 1: Try Research API
      if (window.ResearchAPI && window.ResearchAPI.areAPIsConfigured()) {
        console.log('Using Research API for pillar custom question');
        try {
          const result = await window.ResearchAPI.researchCustomer(
            state.customerName,
            state.industry || 'Technology',
            enhancedQuestion
          );
          response = result.response;
          sources = result.sources;
        } catch (error) {
          console.error('Research API error:', error);
          response = null;
        }
      }
      
      // Priority 2: Try IBM Docs API
      if (!response && window.IBMDocsIntegration) {
        const backendAvailable = await window.IBMDocsIntegration.checkHealth();
        if (backendAvailable) {
          try {
            const apiResponse = await window.IBMDocsIntegration.generateResponse(
              enhancedQuestion,
              state.customerName,
              state.industry || 'Technology'
            );
            const formatted = window.IBMDocsIntegration.formatResponse(apiResponse, state.customerName);
            response = formatted.response;
            sources = formatted.sources;
          } catch (error) {
            console.error('IBM Docs API error:', error);
          }
        }
      }
      
      // Fallback: Inform user to configure APIs
      if (!response) {
        console.log('No APIs configured for pillar custom question');
        response = `⚠️ API Configuration Required

To generate comprehensive responses that include:
• ${state.customerName}'s information from annual reports, 10-K filings, and analyst reports
• IBM solution recommendations from IBM Docs and IBM.com

Please configure at least one of the following:
1. Research API (Google Custom Search + SerpAPI) - for customer research
2. IBM Docs API (Watsonx Discovery) - for IBM solution information

See the API Configuration section for setup instructions.`;
        sources = [];
      }

      // Display response
      responseField.value = response;
      responseContainer.style.display = 'block';
      
      // Add sources if available
      if (sources && sources.length > 0) {
        addPillarCustomQuestionSources(responseContainer, sources);
      }
      
      // Generate and add AI suggestions
      const suggestions = generatePillarCustomQuestionSuggestions(question, pillar);
      addPillarCustomQuestionSuggestions(responseContainer, suggestions, questionNumber, pillar);
      
      // Update button
      button.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Regenerate
      `;
      button.classList.remove('loading');
      button.disabled = false;

      // Add regenerate functionality
      button.onclick = () => generatePillarCustomQuestionResponse(pillar, questionNumber, question);

    } catch (error) {
      console.error('Error generating pillar custom question response:', error);
      responseField.value = 'Error generating response. Please try again.';
      responseContainer.style.display = 'block';
      
      button.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Retry
      `;
      button.classList.remove('loading');
      button.disabled = false;
      button.onclick = () => generatePillarCustomQuestionResponse(pillar, questionNumber, question);
    }
  }

  /**
   * Add sources citation for pillar custom questions
   */
  function addPillarCustomQuestionSources(responseContainer, sources) {
    // Remove existing sources if any
    const existingSources = responseContainer.querySelector('.sources-citation');
    if (existingSources) {
      existingSources.remove();
    }
    
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'sources-citation';
    sourcesDiv.innerHTML = `
      <div class="sources-header">
        <svg class="sources-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L10 6L14 7L10 8L8 12L6 8L2 7L6 6L8 2Z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>Sources:</span>
      </div>
      <div class="sources-list">
        ${sources.map(source => `<span class="source-tag">${source.title || source.url || 'Source'}</span>`).join('')}
      </div>
    `;
    
    responseContainer.appendChild(sourcesDiv);
  }

  /**
   * Generate AI suggestions for pillar custom questions
   */
  function generatePillarCustomQuestionSuggestions(question, pillar) {
    const lowerQuestion = question.toLowerCase();
    
    // Pillar-specific suggestions
    if (pillar === 'application-modernization') {
      if (lowerQuestion.includes('container') || lowerQuestion.includes('kubernetes')) {
        return [
          'What container orchestration platforms are you considering?',
          'How are you handling stateful applications in containers?',
          'What is your container security strategy?'
        ];
      } else if (lowerQuestion.includes('cloud') || lowerQuestion.includes('migration')) {
        return [
          'What cloud migration strategy are you following (lift-and-shift, refactor, etc.)?',
          'How are you managing cloud costs during migration?',
          'What tools are you using for cloud migration assessment?'
        ];
      } else if (lowerQuestion.includes('api') || lowerQuestion.includes('integration')) {
        return [
          'What API management platform are you using?',
          'How do you handle API versioning and deprecation?',
          'What are your API security requirements?'
        ];
      }
      return [
        'What are the key technical challenges in this modernization?',
        'What is the timeline for this initiative?',
        'How are you measuring success?'
      ];
    } else if (pillar === 'infrastructure-automation') {
      if (lowerQuestion.includes('secret') || lowerQuestion.includes('credential')) {
        return [
          'What secrets management solution are you currently using?',
          'How do you handle secret rotation?',
          'What compliance requirements govern your secrets management?'
        ];
      } else if (lowerQuestion.includes('network') || lowerQuestion.includes('dns')) {
        return [
          'What network monitoring tools are in place?',
          'How do you handle multi-cloud networking?',
          'What are your network performance SLAs?'
        ];
      } else if (lowerQuestion.includes('infrastructure') || lowerQuestion.includes('provision')) {
        return [
          'What IaC tools are you using (Terraform, Ansible, etc.)?',
          'How do you manage infrastructure drift?',
          'What is your infrastructure testing strategy?'
        ];
      }
      return [
        'What automation tools are currently in use?',
        'What are the main pain points in your current process?',
        'How do you measure automation success?'
      ];
    } else if (pillar === 'technology-business-management') {
      if (lowerQuestion.includes('cost') || lowerQuestion.includes('budget')) {
        return [
          'How do you allocate IT costs to business units?',
          'What cost optimization initiatives are underway?',
          'How accurate are your IT cost forecasts?'
        ];
      } else if (lowerQuestion.includes('tbm') || lowerQuestion.includes('framework')) {
        return [
          'What TBM maturity level are you targeting?',
          'How do you measure IT business value?',
          'What stakeholders are involved in TBM governance?'
        ];
      } else if (lowerQuestion.includes('visibility') || lowerQuestion.includes('transparency')) {
        return [
          'What reporting tools do you use for IT cost visibility?',
          'How often do you review IT spending with business leaders?',
          'What metrics are most important to your CFO/CIO?'
        ];
      }
      return [
        'How do you link IT spend to business outcomes?',
        'What are your key TBM challenges?',
        'How do you measure IT ROI?'
      ];
    }
    
    // Generic fallback
    return [
      'What are the key success factors for this initiative?',
      'What resources are allocated to this?',
      'How does this align with your overall strategy?'
    ];
  }

  /**
   * Add AI suggestions to pillar custom question response
   */
  function addPillarCustomQuestionSuggestions(responseContainer, suggestions, questionNumber, pillar) {
    // Remove existing suggestions if any
    const existingSuggestions = responseContainer.querySelector('.ai-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'ai-suggestions';
    suggestionsDiv.innerHTML = `
      <div class="ai-suggestions__header">
        <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>AI Suggested Follow-ups:</span>
      </div>
      <ul class="ai-suggestions__list">
        ${suggestions.map(s => `<li class="ai-suggestion clickable-suggestion" data-question="${s.replace(/"/g, '"')}" data-parent="${questionNumber}" data-pillar="${pillar}">${s}</li>`).join('')}
      </ul>
    `;
    
    responseContainer.appendChild(suggestionsDiv);
    
    // Add click handlers
    const suggestionItems = suggestionsDiv.querySelectorAll('.clickable-suggestion');
    suggestionItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', function() {
        const followUpQuestion = this.getAttribute('data-question');
        const parentQuestion = this.getAttribute('data-parent');
        const pillarAttr = this.getAttribute('data-pillar');
        handlePillarCustomQuestionFollowUp(followUpQuestion, parentQuestion, pillarAttr, responseContainer);
      });
    });
  }

  /**
   * Handle follow-up question for pillar custom questions
   */
  async function handlePillarCustomQuestionFollowUp(followUpQuestion, parentQuestionNumber, pillar, originalResponseContainer) {
    console.log('Pillar custom question follow-up clicked:', followUpQuestion);
    
    const responseField = originalResponseContainer.querySelector('.response-field');
    if (!responseField) {
      console.error('Could not find response field');
      return;
    }
    
    // Show loading state
    const originalContent = responseField.value;
    responseField.value = 'Generating follow-up response...';
    responseField.style.backgroundColor = '#f4f4f4';
    
    try {
      let response, sources;
      
      // Enhance follow-up question with structured context for Section 3
      const pillarContext = getPillarContext(pillar);
      const enhancedFollowUp = `You are a sales research assistant. Answer this follow-up question about ${state.customerName} (${state.industry || 'Technology'} industry):

"${followUpQuestion}"

CRITICAL: You MUST structure your response in exactly TWO parts:

PART 1 - CUSTOMER'S PUBLIC STATEMENTS & CURRENT STATE:
Search ${state.customerName}'s annual reports, 10-K filings, analyst reports, and media coverage. Summarize what they have publicly shared about this specific topic. If no public information exists, write: "No public information found on this topic for ${state.customerName}."

PART 2 - IBM SOLUTIONS TO LEAD WITH:
Recommend how an IBM seller should lead with these specific products: ${pillarContext.solutions}
Include specific capabilities, use cases, and value proposition for ${state.customerName}.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

**Customer's Public Statements & Current State:**
[Your research findings about ${state.customerName} on this topic]

**IBM Solutions to Lead With:**
[Your recommendations focusing on: ${pillarContext.solutions}]

**Value Proposition:**
[How these solutions address ${state.customerName}'s needs]`;
      
      // Use same API priority as main questions
      if (window.ResearchAPI && window.ResearchAPI.areAPIsConfigured()) {
        try {
          const result = await window.ResearchAPI.researchCustomer(
            state.customerName,
            state.industry || 'Technology',
            enhancedFollowUp
          );
          response = result.response;
          sources = result.sources;
        } catch (error) {
          console.error('Research API error:', error);
          response = null;
        }
      }
      
      if (!response && window.IBMDocsIntegration) {
        const backendAvailable = await window.IBMDocsIntegration.checkHealth();
        if (backendAvailable) {
          try {
            const apiResponse = await window.IBMDocsIntegration.generateResponse(
              enhancedFollowUp,
              state.customerName,
              state.industry || 'Technology'
            );
            const formatted = window.IBMDocsIntegration.formatResponse(apiResponse, state.customerName);
            response = formatted.response;
            sources = formatted.sources;
          } catch (error) {
            console.error('IBM Docs API error:', error);
          }
        }
      }
      
      if (!response) {
        response = `⚠️ API Configuration Required

To generate comprehensive follow-up responses that include:
• ${state.customerName}'s information from annual reports, 10-K filings, and analyst reports
• IBM solution recommendations from IBM Docs and IBM.com

Please configure at least one of the following:
1. Research API (Google Custom Search + SerpAPI) - for customer research
2. IBM Docs API (Watsonx Discovery) - for IBM solution information

See the API Configuration section for setup instructions.`;
        sources = [];
      }
      
      // Replace content
      responseField.value = response;
      responseField.style.backgroundColor = '';
      
      // Update sources if available
      if (sources && sources.length > 0) {
        const sourcesDiv = originalResponseContainer.querySelector('.sources-citation');
        if (sourcesDiv) {
          const sourcesList = sourcesDiv.querySelector('.sources-list');
          if (sourcesList) {
            sourcesList.innerHTML = sources.map(source =>
              `<span class="source-tag">${source.title || source.url || 'Source'}</span>`
            ).join('');
          }
        }
      }
      
      // Scroll to answer
      responseField.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
    } catch (error) {
      console.error('Error fetching follow-up answer:', error);
      responseField.value = `Error: ${error.message}\n\nOriginal response:\n${originalContent}`;
      responseField.style.backgroundColor = '#fff3cd';
    }
  }

  /**
   * Delete pillar-specific custom question
   */
  window.deletePillarCustomQuestion = function(pillar, questionNumber) {
    if (confirm('Are you sure you want to delete this question?')) {
      const card = document.getElementById(`custom-question-${pillar}-${questionNumber}`);
      if (card) {
        card.remove();
      }
    }
  };
  }

  /**
   * Handle custom question generation
   */
  async function handleCustomQuestionGenerate() {
    const textarea = document.getElementById('custom-question-textarea');
    const question = textarea.value.trim();

    if (!question) {
      alert('Please enter a question');
      return;
    }

    if (!state.customerName) {
      alert('Please enter a customer name in Section 1 first');
      elements.customerNameInput.focus();
      return;
    }

    // Increment counter and create question card
    customQuestionCounter++;
    const questionNumber = `C${customQuestionCounter}`;
    
    createCustomQuestionCard(questionNumber, question);

    // Hide input and show add button
    document.getElementById('custom-question-input-container').style.display = 'none';
    document.getElementById('add-custom-question-btn').style.display = 'inline-flex';
    textarea.value = '';

    // Generate response
    await generateCustomQuestionResponse(questionNumber, question);
  }

  /**
   * Create custom question card
   */
  function createCustomQuestionCard(questionNumber, question) {
    const container = document.getElementById('custom-questions-container');
    
    const card = document.createElement('div');
    card.className = 'custom-question-card';
    card.id = `custom-question-${questionNumber}`;
    card.innerHTML = `
      <div class="custom-question-card__header">
        <span class="custom-question-card__number">${questionNumber}</span>
        <h4 class="custom-question-card__question">${question}</h4>
        <div class="custom-question-card__actions">
          <button class="delete-question-btn" onclick="deleteCustomQuestion('${questionNumber}')" title="Delete question">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      <button class="generate-btn" data-custom-question="${questionNumber}">
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Generating...
      </button>
      <div class="custom-question-card__response" style="display: none;">
        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
      </div>
    `;

    container.appendChild(card);
  }

  /**
   * Generate response for custom question
   */
  async function generateCustomQuestionResponse(questionNumber, question) {
    const card = document.getElementById(`custom-question-${questionNumber}`);
    const button = card.querySelector('.generate-btn');
    const responseContainer = card.querySelector('.custom-question-card__response');
    const responseField = card.querySelector('.response-field');

    // Show loading state
    button.classList.add('loading');
    button.disabled = true;

    try {
      let response, sources;
      
      // Priority 1: Try Research API
      if (window.ResearchAPI && window.ResearchAPI.areAPIsConfigured()) {
        try {
          console.log('Using Research API for custom question');
          const result = await window.ResearchAPI.researchCustomer(
            state.customerName,
            state.industry || 'Technology',
            question
          );
          response = result.response;
          sources = result.sources;
        } catch (error) {
          console.error('Research API error:', error);
          response = null;
        }
      }
      
      // Priority 2: Try IBM docs backend
      if (!response) {
        const backendAvailable = window.IBMDocsIntegration &&
                                await window.IBMDocsIntegration.checkHealth();
        
        if (backendAvailable) {
          console.log('Using IBM Documentation API for custom question');
          const apiResponse = await window.IBMDocsIntegration.generateResponse(
            question,
            state.customerName,
            state.industry || 'Technology'
          );
          
          const formatted = window.IBMDocsIntegration.formatResponse(apiResponse, state.customerName);
          response = formatted.response;
          sources = formatted.sources;
        }
      }
      
      // Priority 3: Fallback to mock data
      if (!response) {
        console.log('Using mock data for custom question');
        response = `Based on available information about ${state.customerName} in the ${state.industry || 'Technology'} sector:\n\n${question}\n\nThis is a custom question response. For production use, please configure the Research API or IBM Documentation API for real-time data.`;
        sources = [
          { title: 'Company Website', url: `https://${state.customerName.toLowerCase().replace(/\s+/g, '')}.com` },
          { title: 'Industry Reports', url: '#' }
        ];
      }
      
      // Update UI
      responseField.value = response;
      responseContainer.style.display = 'block';
      
      // Add sources citation
      addSourcesCitation(responseContainer, sources, questionNumber);
      
      // Reset button
      button.classList.remove('loading');
      button.disabled = false;
      button.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Regenerate
      `;
      
      // Add AI suggestions
      if (!responseContainer.querySelector('.ai-suggestions')) {
        addCustomQuestionAISuggestions(responseContainer, question, questionNumber);
      }
      
      // Smooth scroll
      responseContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
    } catch (error) {
      console.error('Error generating custom question response:', error);
      
      responseField.value = `Error generating response: ${error.message}\n\nPlease try again or check your API configuration.`;
      responseContainer.style.display = 'block';
      
      button.classList.remove('loading');
      button.disabled = false;
      button.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Retry
      `;
    }

    // Add click handler for regenerate
    button.addEventListener('click', () => {
      generateCustomQuestionResponse(questionNumber, question);
    });
  }

  /**
   * Add AI suggestions for custom questions
   */
  function addCustomQuestionAISuggestions(responseContainer, question, questionNumber) {
    const suggestions = generateCustomQuestionSuggestions(question);
    
    if (suggestions.length === 0) return;
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'ai-suggestions';
    suggestionsDiv.innerHTML = `
      <div class="ai-suggestions__header">
        <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>AI Suggested Follow-ups:</span>
      </div>
      <ul class="ai-suggestions__list">
        ${suggestions.map(s => `<li class="ai-suggestion clickable-suggestion" data-question="${s.replace(/"/g, '&quot;')}" data-parent="${questionNumber}">${s}</li>`).join('')}
      </ul>
    `;
    
    responseContainer.appendChild(suggestionsDiv);
    
    // Add click handlers
    const suggestionItems = suggestionsDiv.querySelectorAll('.clickable-suggestion');
    suggestionItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', function() {
        const followUpQuestion = this.getAttribute('data-question');
        const parentQuestion = this.getAttribute('data-parent');
        handleCustomQuestionFollowUp(followUpQuestion, parentQuestion, responseContainer);
      });
    });
  }

  /**
   * Generate AI suggestions for custom questions
   */
  function generateCustomQuestionSuggestions(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Context-aware suggestions based on question content
    if (lowerQuestion.includes('strategy') || lowerQuestion.includes('plan')) {
      return [
        'What are the key milestones in this strategy?',
        'What resources are allocated to this initiative?',
        'How does this align with industry trends?'
      ];
    } else if (lowerQuestion.includes('technology') || lowerQuestion.includes('tech')) {
      return [
        'What is their current technology stack?',
        'What are their technology investment priorities?',
        'How do they evaluate new technologies?'
      ];
    } else if (lowerQuestion.includes('challenge') || lowerQuestion.includes('problem')) {
      return [
        'What solutions have they tried so far?',
        'What is the business impact of this challenge?',
        'What are their success criteria?'
      ];
    } else if (lowerQuestion.includes('budget') || lowerQuestion.includes('cost')) {
      return [
        'What is their budget allocation process?',
        'What ROI metrics do they track?',
        'How do they justify technology investments?'
      ];
    }
    
    // Default suggestions
    return [
      'What are the key priorities related to this?',
      'How does this impact their business objectives?',
      'What timeline are they working with?'
    ];
  }

  /**
   * Handle follow-up question click for custom questions
   */
  async function handleCustomQuestionFollowUp(followUpQuestion, parentQuestionNumber, originalResponseContainer) {
    console.log('Custom question follow-up clicked:', followUpQuestion);
    
    const responseField = originalResponseContainer.querySelector('.response-field');
    if (!responseField) {
      console.error('Could not find response field');
      return;
    }
    
    // Show loading state
    const originalContent = responseField.value;
    responseField.value = 'Generating follow-up response...';
    responseField.style.backgroundColor = '#f4f4f4';
    
    try {
      let response, sources;
      
      // Use same API priority as main questions
      if (window.ResearchAPI && window.ResearchAPI.areAPIsConfigured()) {
        try {
          const result = await window.ResearchAPI.researchCustomer(
            state.customerName,
            state.industry || 'Technology',
            followUpQuestion
          );
          response = result.response;
          sources = result.sources;
        } catch (error) {
          console.error('Research API error:', error);
          response = null;
        }
      }
      
      if (!response) {
        const backendAvailable = window.IBMDocsIntegration &&
                                await window.IBMDocsIntegration.checkHealth();
        
        if (backendAvailable) {
          const apiResponse = await window.IBMDocsIntegration.generateResponse(
            followUpQuestion,
            state.customerName,
            state.industry || 'Technology'
          );
          
          const formatted = window.IBMDocsIntegration.formatResponse(apiResponse, state.customerName);
          response = formatted.response;
          sources = formatted.sources;
        }
      }
      
      if (!response) {
        response = `Follow-up response for: ${followUpQuestion}\n\nBased on ${state.customerName}'s context in ${state.industry || 'Technology'}...\n\n[Mock response - configure APIs for real data]`;
        sources = [];
      }
      
      // Replace content
      responseField.value = response;
      responseField.style.backgroundColor = '';
      
      // Update sources if available
      if (sources && sources.length > 0) {
        const sourcesDiv = originalResponseContainer.querySelector('.sources-citation');
        if (sourcesDiv) {
          const sourcesList = sourcesDiv.querySelector('.sources-list');
          if (sourcesList) {
            sourcesList.innerHTML = sources.map(source => 
              `<span class="source-tag">${source.title || source.url}</span>`
            ).join('');
          }
        }
      }
      
      // Scroll to answer
      responseField.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
    } catch (error) {
      console.error('Error fetching follow-up answer:', error);
      responseField.value = `Error: ${error.message}\n\nOriginal response:\n${originalContent}`;
      responseField.style.backgroundColor = '#fff3cd';
    }
  }

  /**
   * Delete custom question
   */
  window.deleteCustomQuestion = function(questionNumber) {
    if (confirm('Are you sure you want to delete this question?')) {
      const card = document.getElementById(`custom-question-${questionNumber}`);
      if (card) {
        card.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
          card.remove();
        }, 300);
      }
    }
  };

  
  // ============================================
  // SELLER ENHANCEMENTS
  // ============================================

  // ---- 2.1: Generate All ----
  function initGenerateAll() {
    const btn = document.getElementById('generate-all-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      if (!state.customerName) {
        alert('Please enter a customer name first');
        elements.customerNameInput.focus();
        return;
      }
      // Collect only Section 2 generate buttons (not Section 3 pillar ones)
      const section2 = document.getElementById('section-research');
      const generateBtns = Array.from(section2.querySelectorAll('.question-card .generate-btn'));
      if (generateBtns.length === 0) return;

      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/></svg> Generating (0/${generateBtns.length})…`;

      let done = 0;
      // Fire all in parallel
      await Promise.all(generateBtns.map(async (genBtn) => {
        await handleGenerateClick({ currentTarget: genBtn });
        done++;
        btn.innerHTML = `<svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/></svg> Generating (${done}/${generateBtns.length})…`;
      }));

      btn.disabled = false;
      btn.innerHTML = originalHtml;
      showNotification('✓ All questions generated');

      // After all generated, suggest the best pillar (3.1)
      suggestBestPillar();
    });
  }

  // ---- 2.2: Seller Notes on every response panel ----
  function addSellerNotesToggle(responseContainer, questionNumber) {
    if (responseContainer.querySelector('.seller-notes-toggle')) return; // already added
    const toggle = document.createElement('button');
    toggle.className = 'seller-notes-toggle';
    toggle.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1h8v8H5L2 10V9H1V1z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg> My Notes`;
    const panel = document.createElement('div');
    panel.className = 'seller-notes-panel';
    panel.style.display = 'none';
    panel.innerHTML = `<span class="seller-notes-panel__label">My Notes (from customer conversation)</span><textarea class="seller-notes-textarea" placeholder="What did the customer actually say…" data-notes-key="notes-${questionNumber}"></textarea>`;

    toggle.addEventListener('click', () => {
      const visible = panel.style.display !== 'none';
      panel.style.display = visible ? 'none' : 'block';
      toggle.style.fontStyle = visible ? '' : 'italic';
    });

    // Persist notes — check AccountMemory first (authoritative), fall back to localStorage
    const ta = panel.querySelector('.seller-notes-textarea');
    let saved = localStorage.getItem(`notes-${questionNumber}`);
    if (!saved && window.AccountMemory && state.customerName) {
      // Build the qId this card would have and look it up directly
      const card  = responseContainer.closest('.question-card');
      const qId   = card ? window.AccountMemory.buildQuestionId(card) : null;
      if (qId) {
        const acct = window.AccountMemory.getAccount(state.customerName);
        saved = acct?.sellerNotes?.[qId] || null;
      }
    }
    if (saved) {
      ta.value = saved;
      ta.dataset.accountOwner = state.customerName;  // stamp so snapshot knows which account
      // Also auto-expand the panel so the seller can see there's a note waiting
      panel.style.display = 'block';
      toggle.style.fontStyle = 'italic';
    }
    ta.addEventListener('input', () => {
      localStorage.setItem(`notes-${questionNumber}`, ta.value);
      ta.dataset.accountOwner = state.customerName;  // claim ownership on first keystroke
      // Mirror into account memory on every keystroke + update activity log
      if (window.AccountMemory && state.customerName) {
        window.AccountMemory.snapshotCurrentState(state);
        // Count total notes across all cards for the summary line
        const noteCount = document.querySelectorAll('.seller-notes-textarea').length
          ? Array.from(document.querySelectorAll('.seller-notes-textarea')).filter(t => t.value.trim()).length
          : 1;
        window.AccountMemory.logActivity(
          state.customerName,
          'notes',
          `${noteCount} seller note${noteCount !== 1 ? 's' : ''} recorded across research questions`,
          { count: noteCount }
        );
      }
    });

    // Insert before AI suggestions or at end
    const aiSuggestions = responseContainer.querySelector('.ai-suggestions');
    if (aiSuggestions) {
      responseContainer.insertBefore(toggle, aiSuggestions);
      responseContainer.insertBefore(panel, aiSuggestions);
    } else {
      responseContainer.appendChild(toggle);
      responseContainer.appendChild(panel);
    }
  }

  // ---- 2.3: Source freshness chip ----
  function addSourceFreshnessChip(sourcesDiv, sources) {
    if (!sources || sources.length === 0) return;
    // Try to find a date in source names (e.g. "2025", "Q4 2024")
    const yearMatches = sources.map(s => {
      const m = (s.name || '').match(/20(\d{2})/);
      return m ? parseInt('20' + m[1]) : null;
    }).filter(Boolean);

    const header = sourcesDiv.querySelector('.response-sources__header');
    if (!header) return;

    let chip;
    if (yearMatches.length === 0) {
      // No year info — neutral
      return;
    }
    const maxYear = Math.max(...yearMatches);
    const currentYear = new Date().getFullYear();
    const diff = currentYear - maxYear;

    if (diff === 0) {
      chip = `<span class="source-freshness-chip source-freshness-chip--fresh">Current year</span>`;
    } else if (diff === 1) {
      chip = `<span class="source-freshness-chip source-freshness-chip--stale">${maxYear}</span>`;
    } else {
      chip = `<span class="source-freshness-chip source-freshness-chip--old">${maxYear} — may be outdated</span>`;
    }
    header.insertAdjacentHTML('beforeend', chip);
  }

  // ---- 3.1: Pillar recommendation engine ----
  function suggestBestPillar() {
    // Collect all generated responses from Section 2
    const section2 = document.getElementById('section-research');
    if (!section2) return;
    const texts = Array.from(section2.querySelectorAll('.response-field'))
      .map(t => t.value.toLowerCase())
      .join(' ');

    if (!texts.trim()) return;

    // Simple keyword scoring
    const scores = {
      'application-modernization': 0,
      'infrastructure-automation': 0,
      'technology-business-management': 0
    };
    const appModKeywords = ['legacy', 'moderniz', 'api', 'microservice', 'container', 'cloud-native', 'integration', 'kubernetes', 'devops', 'application'];
    const infraKeywords = ['network', 'automation', 'infrastructure', 'dns', 'secrets', 'vault', 'terraform', 'ansible', 'observab', 'monitoring', 'instana', 'sevone'];
    const tbmKeywords = ['cost', 'budget', 'tbm', 'financial', 'spend', 'apptio', 'roi', 'value reali', 'it finance', 'capex', 'opex'];

    appModKeywords.forEach(k => { if (texts.includes(k)) scores['application-modernization']++; });
    infraKeywords.forEach(k => { if (texts.includes(k)) scores['infrastructure-automation']++; });
    tbmKeywords.forEach(k => { if (texts.includes(k)) scores['technology-business-management']++; });

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    if (best[1] === 0) return;

    const pillarLabels = {
      'application-modernization': 'Application Modernization',
      'infrastructure-automation': 'Infrastructure Automation',
      'technology-business-management': 'Technology Business Management'
    };

    // Remove old banner if present
    const existing = document.getElementById('pillar-rec-banner');
    if (existing) existing.remove();

    const pillarSection = document.getElementById('section-automation-pillars');
    if (!pillarSection) return;
    const content = pillarSection.querySelector('.section__content');
    if (!content) return;

    const banner = document.createElement('div');
    banner.id = 'pillar-rec-banner';
    banner.className = 'pillar-recommendation-banner';
    banner.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/></svg><span><strong>AI Recommendation:</strong> Based on the client research, <strong>${pillarLabels[best[0]]}</strong> is the most relevant automation pillar for this account.</span><button id="pillar-rec-apply" style="margin-left:auto;font-size:11px;padding:3px 10px;border:1px solid currentColor;border-radius:99px;background:transparent;color:inherit;cursor:pointer;">Apply</button>`;
    content.insertBefore(banner, content.firstChild);

    document.getElementById('pillar-rec-apply').addEventListener('click', () => {
      const pill = document.querySelector(`[data-pillar="${best[0]}"]`);
      if (pill) pill.click();
      banner.remove();
    });
  }

  // ---- 3.2: Discovery readiness score (injected into question card header after generation) ----
  function addReadinessIndicator(questionCard, responseText) {
    // Remove existing
    const existing = questionCard.querySelector('.readiness-indicator');
    if (existing) existing.remove();

    // Score: length of response as proxy for data richness
    let level, label, cls;
    const len = (responseText || '').trim().length;
    if (len > 600) { level = 3; label = 'High'; cls = 'filled-high'; }
    else if (len > 200) { level = 2; label = 'Med'; cls = 'filled-medium'; }
    else { level = 1; label = 'Low'; cls = 'filled-low'; }

    const indicator = document.createElement('span');
    indicator.className = 'readiness-indicator';
    indicator.title = `Data confidence: ${label}`;
    indicator.innerHTML = `<span class="readiness-bar">${[1,2,3].map(i => `<span class="readiness-bar__dot${i <= level ? ` readiness-bar__dot--${cls}` : ''}"></span>`).join('')}</span><span class="readiness-label">${label}</span>`;

    const header = questionCard.querySelector('.question-card__header');
    if (header) header.appendChild(indicator);
  }

  // ---- 4.1 + 4.2: Opportunity enhancements — priority score + best contact ----
  // These are applied when the opportunities table is rendered.
  // We hook the existing dynamic rows via a MutationObserver on the table body.
  function initOpportunityEnhancements() {
    const tbody = document.getElementById('opportunities-table-body');
    if (!tbody) return;

    // Upgrade table header once
    const thead = tbody.closest('table')?.querySelector('thead tr');
    if (thead && !thead.querySelector('[data-col="priority"]')) {
      const thPriority = document.createElement('th');
      thPriority.dataset.col = 'priority';
      thPriority.textContent = 'Priority';
      thPriority.style.cursor = 'pointer';
      thPriority.title = 'Sort by priority score';
      thPriority.addEventListener('click', () => sortOpportunitiesByPriority(tbody));

      const thContact = document.createElement('th');
      thContact.dataset.col = 'bestContact';
      thContact.textContent = 'Best Contact';

      thead.appendChild(thPriority);
      thead.appendChild(thContact);
    }

    const observer = new MutationObserver(() => enrichOpportunityRows(tbody));
    observer.observe(tbody, { childList: true });
  }

  const PRODUCT_CONTACT_MAP = {
    'turbonomic':         'Director of Network Operations',
    'instana':            'Head of Application Performance',
    'sevone':             'Director of Network Operations',
    'ns1':                'Director of Network Operations',
    'apptio':             'Chief Information Officer',
    'cloudability':       'Chief Information Officer',
    'planning analytics': 'Chief Information Officer',
    'webmethods':         'VP of Application Development',
    'api':                'VP of Application Development',
    'integration':        'VP of Application Development',
    'verify':             'CISO',
    'vault':              'CISO',
    'secrets':            'CISO',
    'concert':            'Head of Application Performance',
    'maximo':             'Director of Network Operations',
    'watsonx':            'Chief Information Officer'
  };

  function getBestContactForOpportunity(rowText) {
    const lower = rowText.toLowerCase();
    for (const [keyword, role] of Object.entries(PRODUCT_CONTACT_MAP)) {
      if (lower.includes(keyword)) return role;
    }
    return 'Chief Information Officer';
  }

  function getPriorityScore(rowText) {
    const lower = rowText.toLowerCase();
    // Score based on value keywords and strategic alignment with Section 2
    let score = 3; // baseline
    const sec2Text = Array.from(document.querySelectorAll('#section-research .response-field'))
      .map(t => t.value.toLowerCase()).join(' ');

    // Boost if matches Section 2 research themes
    ['cloud', 'api', 'security', 'automati', 'cost', 'monitor', 'integration', 'moderniz'].forEach(k => {
      if (lower.includes(k) && sec2Text.includes(k)) score++;
    });
    return Math.min(score, 10);
  }

  function enrichOpportunityRows(tbody) {
    Array.from(tbody.querySelectorAll('tr')).forEach(row => {
      if (row.querySelector('[data-enriched]')) return;
      row.dataset.enriched = '1';

      const rowText = row.textContent;
      const score = getPriorityScore(rowText);
      const contact = getBestContactForOpportunity(rowText);

      const tdScore = document.createElement('td');
      const filled = Math.round(score / 2); // 0-5 stars
      tdScore.innerHTML = `<span title="Priority score: ${score}/10" style="display:inline-flex;gap:2px;">${'★'.repeat(filled)}${'☆'.repeat(5-filled)}</span>`;
      tdScore.style.fontSize = '14px';
      tdScore.style.color = score >= 7 ? '#16a34a' : score >= 5 ? '#d97706' : '#6b7280';

      const tdContact = document.createElement('td');
      tdContact.innerHTML = `<span style="font-size:12px;color:#374151">${contact}</span>`;

      row.appendChild(tdScore);
      row.appendChild(tdContact);
    });
  }

  function sortOpportunitiesByPriority(tbody) {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const scoreA = getPriorityScore(a.textContent);
      const scoreB = getPriorityScore(b.textContent);
      return scoreB - scoreA;
    });
    rows.forEach(r => tbody.appendChild(r));
  }

  // ---- 6.1: Headline IBM insight ----
  function addHeadlineIBMBtn(card) {
    if (card.querySelector('.headline-ibm-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'headline-ibm-btn';
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L7 4L10 5L7 6L6 9L5 6L2 5L5 4Z" fill="currentColor"/></svg> IBM opportunity?`;
    const panel = document.createElement('div');
    panel.className = 'headline-ibm-panel';
    panel.style.display = 'none';

    btn.addEventListener('click', async () => {
      const title = card.querySelector('.headline-card__title')?.textContent || '';
      if (panel.style.display !== 'none') {
        panel.style.display = 'none';
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L7 4L10 5L7 6L6 9L5 6L2 5L5 4Z" fill="currentColor"/></svg> IBM opportunity?`;
        return;
      }
      panel.style.display = 'block';
      panel.innerHTML = `<span class="headline-ibm-panel__loading">Analyzing for IBM opportunities…</span>`;
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L7 4L10 5L7 6L6 9L5 6L2 5L5 4Z" fill="currentColor"/></svg> Hide`;

      try {
        let insight = null;
        const question = `Given this news headline about ${state.customerName || 'this company'}: "${title}" — which IBM product or solution is most directly relevant, and what would be a compelling one-sentence conversation starter for an IBM seller? Be concise.`;

        if (window.ResearchAPI && window.ResearchAPI.areAPIsConfigured()) {
          const result = await window.ResearchAPI.researchCustomer(
            state.customerName || 'the company',
            state.industry || 'Technology',
            question
          );
          insight = result.response;
        }

        if (!insight) {
          // Mock insight based on keywords
          const lower = title.toLowerCase();
          if (lower.includes('ai') || lower.includes('automation')) {
            insight = '💡 <strong>IBM watsonx</strong> — "Given your recent AI investment, IBM watsonx can accelerate time-to-value with governed, enterprise-grade AI models built on your proprietary data."';
          } else if (lower.includes('cloud') || lower.includes('migrat')) {
            insight = '💡 <strong>IBM Cloud Pak / webMethods</strong> — "Your cloud migration creates an integration challenge — IBM webMethods can connect legacy and cloud-native systems without a rip-and-replace."';
          } else if (lower.includes('security') || lower.includes('cyber')) {
            insight = '💡 <strong>IBM Verify + HashiCorp Vault</strong> — "Your security partnership signals a zero-trust initiative — IBM Verify and Vault deliver identity and secrets management in one integrated stack."';
          } else if (lower.includes('cost') || lower.includes('budget') || lower.includes('spend')) {
            insight = '💡 <strong>IBM Apptio</strong> — "With budget scrutiny increasing, Apptio gives your CIO real-time visibility into total IT cost-per-service to justify and optimise spend."';
          } else {
            insight = '💡 <strong>IBM Consulting + watsonx</strong> — "This initiative creates an opportunity to discuss how IBM can accelerate delivery with AI-assisted development and integration expertise."';
          }
        }
        panel.innerHTML = insight;
      } catch (e) {
        panel.innerHTML = '⚠️ Could not generate insight. Configure Research API for AI-powered analysis.';
      }
    });

    card.appendChild(btn);
    card.appendChild(panel);
  }

  function initHeadlineIBMInsights() {
    // Add to existing cards
    document.querySelectorAll('.headline-card').forEach(addHeadlineIBMBtn);

    // Observer for dynamically rendered cards (after fetchHeadlines)
    const grid = document.querySelector('.headlines-grid');
    if (!grid) return;
    const obs = new MutationObserver(() => {
      document.querySelectorAll('.headline-card').forEach(addHeadlineIBMBtn);
    });
    obs.observe(grid, { childList: true });
  }

  // ---- 7.1: Talking points per contact ----
  async function handleTalkingPointsClick(btn) {
    if (!state.customerName) {
      alert('Please enter a customer name first');
      return;
    }
    const role = btn.dataset.contactRole;
    const focus = btn.dataset.contactFocus;
    const card = btn.closest('.contact-card');
    const panel = card.querySelector('.talking-points-panel');

    if (panel.style.display !== 'none') {
      panel.style.display = 'none';
      return;
    }

    btn.classList.add('loading');
    btn.textContent = 'Generating…';
    panel.style.display = 'block';
    panel.innerHTML = '<em style="color:#6b7280">Generating talking points…</em>';

    const question = `Generate 5 specific, concise conversation-starter talking points for an IBM seller meeting with the ${role} at ${state.customerName} (${state.industry || 'Technology'} industry). Their focus is: ${focus}. Format as a numbered list. Each point should be 1–2 sentences and directly reference IBM solutions where relevant. Be direct and actionable.`;

    let points = null;
    try {
      if (window.ResearchAPI && window.ResearchAPI.areAPIsConfigured()) {
        const result = await window.ResearchAPI.researchCustomer(
          state.customerName, state.industry || 'Technology', question
        );
        points = result.response;
      }
    } catch (e) { /* fall through */ }

    if (!points) {
      // Persona-specific mock talking points
      const mockMap = {
        'Chief Information Officer': [
          `Ask about ${state.customerName}'s multi-year technology roadmap and where AI fits.`,
          'IBM watsonx can help you realise AI value 40% faster than building from scratch.',
          'How are you currently measuring IT cost-to-business outcome alignment?',
          `IBM Apptio gives CIOs a real-time view of all-in cost per service at ${state.customerName}.`,
          'What would you do differently if you had 30% more IT budget flexibility?'
        ],
        'VP of Application Development': [
          `${state.customerName}'s integration complexity creates a clear webMethods opportunity.`,
          "How many point-to-point integrations do you maintain today, and what's the maintenance burden?",
          'IBM webMethods Hybrid Integration can halve integration development time.',
          'Are you doing event-driven architecture, and how are you managing Kafka at scale?',
          'IBM Concert can give your dev teams AI-powered observability from day one.'
        ],
        'Chief Information Security Officer': [
          'Where are your credentials and API keys managed today — are any hard-coded?',
          'HashiCorp Vault, now part of IBM, gives you centralised secrets management with full audit.',
          `${state.customerName}'s zero-trust journey aligns directly with IBM Verify.`,
          'How long does it take you to rotate a compromised credential across all systems today?',
          'IBM Verify and Vault together cover identity, access, and secrets in one integrated stack.'
        ],
        'Director of Network Operations': [
          'How do you currently detect network anomalies — reactive or proactive?',
          'IBM SevOne correlates network telemetry with application performance automatically.',
          'How are you routing traffic across your multi-cloud footprint — static DNS or intelligent?',
          'IBM NS1 provides AI-driven intelligent traffic steering that reduces latency and improves availability.',
          'What is your current mean time to remediate a network incident?'
        ],
        'Head of Application Performance': [
          'How many monitoring tools does your team context-switch between daily?',
          'IBM Instana provides full-stack, zero-configuration observability out of the box.',
          `${state.customerName}'s CVE exposure grows with every new microservice — how do you track it?`,
          'IBM Concert can continuously map your application risk landscape and prioritise remediation.',
          'How are you correlating application anomalies with infrastructure events today?'
        ]
      };

      const rolePoints = mockMap[role] || [
        `Ask ${role} about their top 3 priorities for the next 12 months.`,
        `How is ${state.customerName} measuring success in this area?`,
        'Which IBM solutions have you previously evaluated?',
        'What would a successful outcome look like for you personally?',
        'What is your biggest blocker to progress right now?'
      ];
      points = rolePoints.map((p, i) => `${i + 1}. ${p}`).join('\n');
    }

    // Format as ordered list
    const lines = points.split('\n').filter(l => l.trim());
    panel.innerHTML = `<ol>${lines.map(l => `<li>${l.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`;

    btn.classList.remove('loading');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2H12V10H7L4 12V10H2V2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Hide`;
    btn.onclick = () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    };
  }

  // ---- 7.2: Engagement tracking persistence ----
  function initEngagementTracking() {
    document.querySelectorAll('.contact-engagement__select').forEach(sel => {
      const id  = sel.dataset.contactId;
      const key = `engagement-${id}`;
      // Try account-scoped restore first, fall back to legacy global key
      const accountEngagement = window.AccountMemory && state.customerName
        ? (window.AccountMemory.getAccount(state.customerName)?.engagement || {})[id]
        : null;
      const saved = accountEngagement || localStorage.getItem(key);
      if (saved) {
        sel.value          = saved;
        sel.dataset.status = saved;
      }
      sel.addEventListener('change', () => {
        localStorage.setItem(key, sel.value);
        sel.dataset.status = sel.value;
        showNotification(`Engagement status updated to: ${sel.options[sel.selectedIndex].text}`);
        if (window.AccountMemory && state.customerName) {
          window.AccountMemory.snapshotCurrentState(state);
        }
      });
    });
  }

  // ---- 8.1: Auto-detect competitive incumbents ----
  function autoDetectIncumbents() {
    const sec2Text = Array.from(document.querySelectorAll('#section-research .response-field'))
      .map(t => t.value.toLowerCase()).join(' ');
    if (!sec2Text.trim()) return;

    const incumbentMap = {
      'aws':               ['amazon', 'aws', 'ec2', 's3', 'lambda'],
      'microsoft-azure':   ['microsoft', 'azure', 'teams', 'office 365', 'active directory', 'azure ad'],
      'google-cloud':      ['google cloud', 'gcp', 'bigquery', 'kubernetes engine'],
      'oracle':            ['oracle', 'oci', 'java ee'],
      'salesforce':        ['salesforce', 'crm'],
      'sap':               ['sap', 's/4hana', 'sap btp'],
      'servicenow':        ['servicenow', 'itsm'],
      'splunk':            ['splunk', 'siem', 'security information']
    };

    const detected = [];
    for (const [comp, keywords] of Object.entries(incumbentMap)) {
      if (keywords.some(k => sec2Text.includes(k))) detected.push(comp);
    }

    if (detected.length === 0) return;

    // Pre-select detected competitors
    detected.forEach(comp => {
      const tag = document.querySelector(`.competitor-tag[data-competitor="${comp}"]`);
      if (tag && !tag.classList.contains('active')) {
        // Add auto-detected note next to tag
        if (!tag.querySelector('.competitor-auto-note')) {
          const note = document.createElement('span');
          note.className = 'competitor-auto-note';
          note.textContent = 'detected';
          tag.appendChild(note);
        }
        tag.click(); // trigger the existing selection handler
      }
    });

    showNotification(`🔍 Auto-detected ${detected.length} likely competitor(s) from your research.`);
  }

  // ---- 8.2: Objection-handling on battle cards ----
  const OBJECTION_DATA = {
    'aws': [
      { q: '"IBM is more expensive than AWS."', a: 'IBM bundles integration, observability, and identity management that AWS requires 3–5 separate services to replicate. Total cost of ownership is typically lower when you include licenses, integration effort, and support.' },
      { q: '"We are already all-in on AWS."', a: 'IBM solutions are built to run on AWS — webMethods, Turbonomic, and Instana all deploy natively. We augment your AWS investment rather than compete with it.' },
      { q: '"AWS has a larger ecosystem."', a: 'IBM has 170,000 partners and deep integrations across the AWS Marketplace. For regulated industries, IBM\'s compliance and support SLAs are unmatched.' }
    ],
    'microsoft-azure': [
      { q: '"We have a Microsoft Enterprise Agreement."', a: 'IBM is a Microsoft co-sell partner. IBM Apptio, Instana, and webMethods are on Azure Marketplace and count against MACC commitments.' },
      { q: '"Azure DevOps covers our needs."', a: 'Azure DevOps handles code CI/CD, but IBM Concert covers cross-application risk, CVE management, and deployment governance that Azure DevOps does not address.' },
      { q: '"We use Azure AD for identity."', a: 'IBM Verify federates with Azure AD and extends it with fine-grained access policies, risk-based authentication, and privileged access management for non-Microsoft workloads.' }
    ],
    'google-cloud': [
      { q: '"Google Cloud has the best AI."', a: 'IBM watsonx is purpose-built for enterprise AI governance, explainability, and bias detection — requirements that Google Vertex AI does not address for regulated industries.' },
      { q: '"GKE is our Kubernetes standard."', a: 'IBM solutions run on GKE. Instana, Concert, and webMethods are all Kubernetes-native and certified on GKE.' }
    ],
    'servicenow': [
      { q: '"ServiceNow already does ITSM."', a: 'IBM Concert and SevOne sit at the network and application layer — they feed observability data into ServiceNow rather than competing with it, reducing MTTR before incidents ever become tickets.' },
      { q: '"We have a ServiceNow investment."', a: 'IBM has a certified integration with ServiceNow. Turbonomic triggers change requests and Instana feeds alerts directly into ServiceNow workflows.' }
    ],
    'splunk': [
      { q: '"Splunk is our SIEM of record."', a: 'IBM does not compete with Splunk on SIEM. IBM SevOne handles network performance and IBM Instana handles APM — both can forward data to Splunk rather than replace it.' },
      { q: '"Splunk covers observability."', a: 'Splunk requires manual instrumentation and agent configuration. IBM Instana auto-discovers and instruments in minutes with zero configuration.' }
    ],
    'oracle': [
      { q: '"We are standardised on Oracle."', a: 'IBM\'s TBM offering (Apptio) works alongside Oracle Financials and is the leading platform for IT cost allocation regardless of ERP.' }
    ],
    'salesforce': [
      { q: '"Salesforce handles our CRM."', a: 'IBM is not a CRM vendor. IBM webMethods integrates Salesforce with back-office systems so your CRM data stays accurate and real-time.' }
    ],
    'sap': [
      { q: '"SAP covers our ERP and analytics."', a: 'IBM Apptio complements SAP by mapping IT spend to business outcomes — a capability SAP Analytics Cloud does not provide for technology cost management.' }
    ]
  };

  function addObjectionsToBattleCard(card, competitorKey) {
    if (card.querySelector('.battle-card__objections-toggle')) return;
    const objections = OBJECTION_DATA[competitorKey];
    if (!objections || objections.length === 0) return;

    const toggle = document.createElement('button');
    toggle.className = 'battle-card__objections-toggle';
    toggle.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg> Likely Objections`;

    const panel = document.createElement('div');
    panel.className = 'battle-card__objections-panel';
    panel.style.display = 'none';
    panel.innerHTML = `<h5>Common Objections & Responses</h5>${objections.map(o => `<div class="objection-item"><div class="objection-item__q">${o.q}</div><div class="objection-item__a">${o.a}</div></div>`).join('')}`;

    toggle.addEventListener('click', () => {
      const vis = panel.style.display !== 'none';
      panel.style.display = vis ? 'none' : 'block';
    });

    card.appendChild(toggle);
    card.appendChild(panel);
  }

  function initBattleCardObjections() {
    const container = document.getElementById('battle-cards-list');
    if (!container) return;
    const obs = new MutationObserver(() => {
      container.querySelectorAll('[data-competitor]').forEach(card => {
        addObjectionsToBattleCard(card, card.dataset.competitor);
      });
    });
    obs.observe(container, { childList: true, subtree: true });
  }

  // ---- 9.1 + 9.2: Email generation with persona, tone, length ----

  /**
   * Read persona data live from Section 7 contact cards.
   * Falls back to the role label and blank name if the card hasn't been filled in.
   */
  function getPersonaFromDOM(contactId) {
    const nameInput = document.querySelector(`.contact-card__name[data-contact-id="${contactId}"]`);
    const card = nameInput ? nameInput.closest('.contact-card') : null;
    if (!card) return null;
    const name = (nameInput.value || '').trim() || null;
    const role = card.querySelector('.contact-card__role')?.textContent?.trim() || '';
    const focusEl = card.querySelector('.contact-card__focus');
    const focus = focusEl ? focusEl.textContent.replace(/^(?:Responsibilities|Focus):\s*/i, '').trim() : '';
    return { name, role, focus };
  }

  async function generatePersonaEmail() {
    const personaKey = document.getElementById('email-persona-select')?.value;
    const tone = document.getElementById('email-tone-select')?.value || 'consultative';
    const length = document.getElementById('email-length-select')?.value || 'medium';
    const contentEl = document.getElementById('email-content-body');
    const subjectEl = document.getElementById('email-subject-input');
    const btn = document.getElementById('regenerate-email-btn');
    if (!contentEl || !btn) return;

    const persona = personaKey ? getPersonaFromDOM(personaKey) : null;
    const contactName = (persona && persona.name) ? persona.name : '[Contact Name]';
    const contactRole = (persona && persona.role) ? persona.role : 'Decision Maker';
    const contactFocus = (persona && persona.focus) ? persona.focus : 'technology strategy';

    const toneInstructions = {
      executive: 'Write in a crisp, executive tone. Lead with business impact. No technical jargon. Max 3 short paragraphs.',
      consultative: 'Write in a warm, consultative tone. Show understanding of their challenges before proposing solutions.',
      technical: 'Write in a detailed, technical tone suitable for a practitioner. Include specific product capabilities and integration points.'
    };
    const lengthInstructions = {
      short: 'Write exactly 3 sentences total.',
      medium: 'Write a half-page email: greeting, 1–2 short paragraphs, closing.',
      long: 'Write a full email with subject, greeting, 3–4 detailed paragraphs with bullet points, and a clear call to action.'
    };

    // Gather Section 2 + Section 3 context — AI responses + seller notes (current session)
    const section2Cards = Array.from(document.querySelectorAll('#section-research .question-card'));
    const section3Cards = Array.from(document.querySelectorAll('#section-automation-pillars .question-card'));
    const allCards = [...section2Cards, ...section3Cards];
    const researchContext = allCards.map(c => {
      const q = c.querySelector('.question-card__question')?.textContent || '';
      const a = c.querySelector('.response-field')?.value || '';
      const notes = getSellerNotesForCard(c);
      if (!a && !notes) return '';
      let entry = '';
      if (a) entry += `Q: ${q.trim()}\nAI Research: ${a.trim().substring(0, 300)}`;
      if (notes) entry += `\nSeller's Direct Observation: ${notes.substring(0, 200)}`;
      return entry;
    }).filter(Boolean).join('\n\n');

    // Append historical context from all previous sessions for this account
    const historicalContext = window.AccountMemory
      ? window.AccountMemory.buildHistoricalContext(state.customerName)
      : '';

    const originalBtnHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/></svg> Generating…`;

    let emailText = null;
    try {
      if (window.ResearchAPI && window.ResearchAPI.areAPIsConfigured()) {
        const prompt = `Write an email from an IBM seller to ${contactName}, ${contactRole} at ${state.customerName || 'the customer'}. Their focus areas: ${contactFocus}.

Tone instruction: ${toneInstructions[tone]}
Length instruction: ${lengthInstructions[length]}

Research context about ${state.customerName} (current session):
${researchContext || 'No specific research available.'}
${historicalContext ? `\n${historicalContext}` : ''}
Requirements:
- Reference at least one specific insight from the research above
- If historical context is available, acknowledge the ongoing relationship and build on prior conversations
- Mention a relevant IBM product by name
- Include a clear call to action
- Sign off as "Your IBM Team"
- Do NOT use placeholder brackets`;

        const result = await window.ResearchAPI.researchCustomer(
          state.customerName || 'the prospect',
          state.industry || 'Technology',
          prompt
        );
        emailText = result.response;
      }
    } catch (e) { /* fall through to mock */ }

    if (!emailText) {
      // Mock email by persona and tone
      const customerName = state.customerName || '[Customer]';
      const shortEmails = {
        cio: `Dear ${contactName}, given ${customerName}'s digital transformation momentum, IBM Apptio can give you real-time visibility into your full IT spend across all platforms in under 30 days. Would a 30-minute call this week be worthwhile?`,
        'vp-appdev': `Dear ${contactName}, ${customerName}'s modernization goals align directly with IBM webMethods — enabling hybrid integration without a full rip-and-replace. Happy to show you a quick demo of how we've done this for similar companies.`,
        ciso: `Dear ${contactName}, with ${customerName}'s zero-trust initiative, IBM Verify and HashiCorp Vault together close the identity and secrets management gap in one integrated platform. Would you be open to a 20-minute technical overview?`,
        netops: `Dear ${contactName}, IBM SevOne and NS1 together give ${customerName}'s network team AI-driven performance visibility and intelligent traffic steering. Let me know if a demo would be helpful.`,
        apm: `Dear ${contactName}, IBM Instana auto-instruments ${customerName}'s entire application stack in minutes — no manual config. I'd love to show you how it compares to what you're using today.`
      };

      const fullEmails = {
        default: `Dear ${contactName},

I've been researching ${customerName}'s technology priorities and wanted to reach out with some specific observations that I think are relevant to your role as ${contactRole}.

${researchContext ? `Based on your public initiatives, I can see that ${customerName} is focused on significant technology transformation. ` : ''}IBM has helped dozens of organizations in the ${state.industry || 'your'} industry accelerate exactly these kinds of initiatives — with measurable outcomes.

Here are three areas where I believe IBM can add immediate value for ${customerName}:
• ${contactFocus.split(',')[0].trim()} — IBM has specific solutions that address this directly
• Integration of new capabilities with your existing technology stack
• Reducing risk and accelerating time-to-value with proven IBM methodologies

I would welcome the opportunity to discuss how IBM can support ${customerName}'s goals. Would a 30-minute call next week work for you?

Best regards,
Your IBM Team`
      };

      if (length === 'short' && shortEmails[personaKey]) {
        emailText = shortEmails[personaKey];
      } else {
        emailText = fullEmails.default;
      }
    }

    // Update the email display
    if (subjectEl) {
      subjectEl.value = `IBM Insights for ${state.customerName || '[Customer]'} — ${contactRole}`;
    }
    contentEl.innerHTML = emailText.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');

    btn.disabled = false;
    btn.innerHTML = originalBtnHtml;
    showNotification('✓ Email generated');
  }

  /**
   * Sync the Section 10 persona dropdown labels to show the real contact name
   * entered in Section 7, updating live as the seller types.
   */
  function syncEmailPersonaDropdown() {
    const select = document.getElementById('email-persona-select');
    if (!select) return;
    document.querySelectorAll('.contact-card__name[data-contact-id]').forEach(input => {
      const id = input.dataset.contactId;
      const option = select.querySelector(`option[value="${id}"]`);
      if (!option) return;
      const role = option.dataset.baseLabel || option.textContent.trim();
      // Store the original role label once
      if (!option.dataset.baseLabel) option.dataset.baseLabel = role;
      const name = input.value.trim();
      option.textContent = name ? `${name} (${role})` : role;
    });
  }

  function initEmailEnhancements() {
    const regenBtn = document.getElementById('regenerate-email-btn');
    if (regenBtn) regenBtn.addEventListener('click', generatePersonaEmail);

    // Keep Section 10 dropdown labels in sync with Section 7 name inputs
    document.querySelectorAll('.contact-card__name[data-contact-id]').forEach(input => {
      input.addEventListener('input', syncEmailPersonaDropdown);
    });

    // Re-wire edit/send buttons (they had no IDs before)
    const editBtn = document.getElementById('edit-email-btn');
    const sendBtn = document.getElementById('send-email-btn');
    if (editBtn) editBtn.addEventListener('click', handleEditEmail);
    if (sendBtn) sendBtn.addEventListener('click', handleSendEmail);

    // "Insert Diagram" button in Section 10 email composer
    const insertDiagramBtn = document.getElementById('email-insert-diagram-btn');
    if (insertDiagramBtn) {
      insertDiagramBtn.addEventListener('click', () => {
        const outputImg = document.getElementById('vis-output-img');
        const dataUrl   = outputImg?.dataset.downloadUrl;
        const topic     = outputImg?.dataset.topic;
        insertDiagramIntoEmail(dataUrl, topic);
      });
    }
  }

  // ---- Post-generate hooks: inject notes, freshness, readiness ----
  function initPostGenerateHooks() {
    // Use a MutationObserver on question card responses to add seller notes + readiness
    document.querySelectorAll('.question-card').forEach(card => {
      const respContainer = card.querySelector('.question-card__response');
      const respField = card.querySelector('.response-field');
      if (!respContainer || !respField) return;
      const qNum = card.querySelector('.question-card__number')?.textContent || 'q';

      const obs = new MutationObserver(() => {
        if (respContainer.style.display !== 'none') {
          addSellerNotesToggle(respContainer, qNum);
          addReadinessIndicator(card, respField.value);
          // Freshness chip on sources div
          const srcDiv = respContainer.querySelector('.response-sources');
          if (srcDiv && !srcDiv.querySelector('.source-freshness-chip')) {
            // Extract sources list from DOM
            const names = Array.from(srcDiv.querySelectorAll('.source-item__name')).map(el => el.textContent);
            const fakeSources = names.map(n => ({ name: n }));
            addSourceFreshnessChip(srcDiv, fakeSources);
          }
        }
      });
      obs.observe(respContainer, { attributes: true, attributeFilter: ['style'], childList: true });
    });
  }

  // ---- 3.x: Generate All for Section 3 (active pillar only) ----
  function initGenerateAllSection3() {
    const btn = document.getElementById('generate-all-s3-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      if (!state.customerName) {
        alert('Please enter a customer name first');
        elements.customerNameInput && elements.customerNameInput.focus();
        return;
      }
      if (!state.selectedPillar) {
        alert('Please select a pillar first');
        return;
      }

      // Only collect visible (non-hidden) question cards for the active pillar
      const visibleCards = Array.from(
        document.querySelectorAll(`[data-pillar-question="${state.selectedPillar}"]`)
      ).filter(card => !card.classList.contains('hidden-by-pillar'));

      const generateBtns = visibleCards
        .map(card => card.querySelector('.generate-btn'))
        .filter(Boolean);

      if (generateBtns.length === 0) return;

      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/></svg> Generating (0/${generateBtns.length})…`;

      let done = 0;
      await Promise.all(generateBtns.map(async (genBtn) => {
        await handleGenerateClick({ currentTarget: genBtn });
        done++;
        btn.innerHTML = `<svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/></svg> Generating (${done}/${generateBtns.length})…`;
      }));

      btn.disabled = false;
      btn.innerHTML = originalHtml;
      showNotification('✓ All pillar questions generated');
    });
  }

  // ---- Main init hook for seller features ----
  function initSellerEnhancements() {
    initGenerateAll();
    initGenerateAllSection3();
    initEngagementTracking();
    initHeadlineIBMInsights();
    initOpportunityEnhancements();
    initBattleCardObjections();
    initEmailEnhancements();
    initPostGenerateHooks();

    // Talking points buttons
    document.addEventListener('click', e => {
      const btn = e.target.closest('.talking-points-btn');
      if (btn) handleTalkingPointsClick(btn);
    });

    // Auto-detect incumbents when Section 8 becomes visible
    const compSection = document.getElementById('section-competitive');
    if (compSection) {
      const obs = new MutationObserver(() => {
        if (!compSection.classList.contains('hidden-until-pillar')) {
          autoDetectIncumbents();
          obs.disconnect();
        }
      });
      obs.observe(compSection, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // AUTOMATION PILLARS
  // ============================================

  /**
   * Initialize pillar selection functionality
   */
  function initPillarSelection() {
    const pillarPills = document.querySelectorAll('.pillar-pill');
    const questionsContainer = document.getElementById('pillar-questions-container');
    const noSelectionMessage = document.getElementById('no-pillar-message');
    const hiddenSections = document.querySelectorAll('.section.hidden-until-pillar');
    
    // Initially hide ALL questions and subsections
    const allQuestionCards = document.querySelectorAll('[data-pillar-question]');
    const allSubsections = document.querySelectorAll('[data-pillar-subsection]');
    
    allQuestionCards.forEach(card => {
      card.classList.add('hidden-by-pillar');
    });
    
    allSubsections.forEach(subsection => {
      subsection.classList.add('hidden-by-pillar');
    });
    
    // Initially hide questions container, show message
    if (questionsContainer) {
      questionsContainer.classList.remove('active');
    }
    if (noSelectionMessage) {
      noSelectionMessage.classList.remove('hidden');
    }
    
    // Add click handlers to pillar pills
    pillarPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const pillar = pill.dataset.pillar;
        selectPillar(pillar, pill, pillarPills, questionsContainer, noSelectionMessage, hiddenSections);
      });
    });
    
    // Restore pillar selection if saved
    if (state.selectedPillar) {
      const savedPill = document.querySelector(`[data-pillar="${state.selectedPillar}"]`);
      if (savedPill) {
        selectPillar(state.selectedPillar, savedPill, pillarPills, questionsContainer, noSelectionMessage, hiddenSections, true);
      }
    }
  }

  /**
   * Select a pillar and show relevant questions + reveal hidden sections
   */
  function selectPillar(pillar, selectedPill, allPills, questionsContainer, noSelectionMessage, hiddenSections, suppressScroll) {
    // Update pill states
    allPills.forEach(pill => {
      if (pill === selectedPill) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
    
    // Show questions container, hide message
    if (questionsContainer) {
      questionsContainer.classList.add('active');
    }
    if (noSelectionMessage) {
      noSelectionMessage.classList.add('hidden');
    }
    
    // Filter questions
    filterQuestionsByPillar(pillar);
    
    // Reveal hidden sections with animation
    hiddenSections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.remove('hidden-until-pillar');
        section.classList.add('revealed');
      }, index * 100); // Stagger animation
    });
    
    // Smooth scroll to show the revealed content (skip on programmatic restore)
    if (!suppressScroll && !_suppressPillarScroll) {
      setTimeout(() => {
        if (questionsContainer) {
          questionsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 300);
    }
    _suppressPillarScroll = false;  // always reset after use
    
    // Reveal Generate All button for Section 3 now that a pillar is chosen
    const s3GenAllBtn = document.getElementById('generate-all-s3-btn');
    if (s3GenAllBtn) s3GenAllBtn.style.display = '';

    // Update state
    state.selectedPillar = pillar;
    saveData();
  }

  /**
   * Filter questions based on selected pillar
   */
  function filterQuestionsByPillar(pillar) {
    const allowedQuestions = state.pillarQuestionMap[pillar];
    const allQuestionCards = document.querySelectorAll('[data-pillar-question]');
    const allSubsections = document.querySelectorAll('[data-pillar-subsection]');
    
    console.log('Filtering for pillar:', pillar);
    console.log('Allowed questions:', allowedQuestions);
    
    // Show/hide questions
    allQuestionCards.forEach(card => {
      const questionNumber = card.dataset.questionNumber;
      const cardPillars = card.dataset.pillarQuestion ? card.dataset.pillarQuestion.split(',').map(p => p.trim()) : [];
      
      console.log(`Question ${questionNumber}: pillars=${cardPillars}, includes ${pillar}?`, cardPillars.includes(pillar));
      
      if (cardPillars.includes(pillar)) {
        card.classList.remove('hidden-by-pillar');
      } else {
        card.classList.add('hidden-by-pillar');
      }
    });
    
    // Show/hide subsections based on visible questions
    allSubsections.forEach(subsection => {
      const subsectionPillars = subsection.dataset.pillarSubsection ? subsection.dataset.pillarSubsection.split(',').map(p => p.trim()) : [];
      
      // Check if subsection has any visible questions after filtering
      setTimeout(() => {
        const visibleQuestions = subsection.querySelectorAll('[data-pillar-question]:not(.hidden-by-pillar)');
        
        console.log('Subsection pillars:', subsectionPillars, 'Visible questions:', visibleQuestions.length);
        
        if (subsectionPillars.includes(pillar) && visibleQuestions.length > 0) {
          subsection.classList.remove('hidden-by-pillar');
        } else {
          subsection.classList.add('hidden-by-pillar');
        }
      }, 10);
    });
  }

  // ============================================
  //   SECTION 5: IBM PRODUCT RESEARCH
  // ============================================

  /**
   * Initialize IBM Product Research search functionality
   */
  function initProductSearch() {
    const searchInput = document.getElementById('product-search-input');
    const queryResponseArea = document.getElementById('query-response-area');
    const queryQuestionText = document.getElementById('query-question-text');
    const queryResponseField = document.getElementById('query-response-field');
    const closeQueryBtn = document.getElementById('close-query-response');
    const queryFollowupList = document.getElementById('query-followup-list');
    const productTags = document.querySelectorAll('.product-tag');
    const selectedProductContainer = document.getElementById('selected-product-container');
    const productEmptyState = document.getElementById('product-empty-state');
    const clearProductBtn = document.getElementById('clear-product-btn');
    const addProductBtn = document.getElementById('add-product-btn');

    if (!searchInput) {
      console.log('Product search input not found');
      return;
    }

    // Handle search input
    searchInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        const query = searchInput.value.trim();
        await handleProductQuery(query);
      }
    });

    // Handle close button
    if (closeQueryBtn) {
      closeQueryBtn.addEventListener('click', () => {
        queryResponseArea.style.display = 'none';
        searchInput.value = '';
      });
    }

    // Handle follow-up question clicks
    if (queryFollowupList) {
      queryFollowupList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('ai-suggestion')) {
          const followupQuery = e.target.textContent;
          searchInput.value = followupQuery;
          await handleProductQuery(followupQuery);
        }
      });
    }

    // Handle Quick Access product buttons
    productTags.forEach(tag => {
      tag.addEventListener('click', async () => {
        const productName = tag.textContent.trim();
        const productSlug = tag.dataset.product;
        await selectProduct(productName, productSlug);
      });
    });

    // Handle clear product button
    if (clearProductBtn) {
      clearProductBtn.addEventListener('click', () => {
        clearSelectedProduct();
      });
    }

    // Handle add product button
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => {
        clearSelectedProduct();
      });
    }
  }

  /**
   * Select a product and generate questions
   */
  async function selectProduct(productName, productSlug) {
    const selectedProductContainer = document.getElementById('selected-product-container');
    const productEmptyState = document.getElementById('product-empty-state');
    const selectedProductNameEl = document.getElementById('selected-product-name');
    const productQuestionsContainer = document.getElementById('product-questions-container');

    // Update UI
    if (productEmptyState) productEmptyState.style.display = 'none';
    if (selectedProductContainer) selectedProductContainer.style.display = 'block';
    if (selectedProductNameEl) selectedProductNameEl.textContent = productName;

    // Generate product-specific questions
    const questions = generateProductQuestions(productName);
    
    // Create question cards
    if (productQuestionsContainer) {
      productQuestionsContainer.innerHTML = questions.map((question, index) => `
        <div class="product-question-card" data-question-number="${index + 1}">
          <div class="product-question-header">
            <span class="product-question-number">${String(index + 1).padStart(2, '0')}</span>
            <h4 class="product-question-text">${question}</h4>
          </div>
          <button class="generate-btn" data-question="${question}" data-product="${productName}" data-question-number="${index + 1}">
            <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
            </svg>
            Generate
          </button>
          <div class="product-answer-container" style="display: none;">
            <!-- Answer will be inserted here -->
          </div>
        </div>
      `).join('');

      // Add generate button listeners
      const generateBtns = productQuestionsContainer.querySelectorAll('.generate-btn');
      generateBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          await handleProductGenerate(e.currentTarget);
        });
      });
    }
  }

  /**
   * Generate product-specific questions
   */
  function generateProductQuestions(productName) {
    const productQuestions = {
      'webMethods IWHI': [
        'What are the key capabilities and use cases of webMethods IWHI?',
        'How does webMethods IWHI integrate with existing enterprise systems?',
        'What are the deployment options and scalability features?',
        'How does webMethods IWHI support API management and governance?'
      ],
      'SevOne': [
        'What are the key capabilities and use cases of SevOne?',
        'How does SevOne provide network performance monitoring and analytics?',
        'What integration capabilities does SevOne offer?',
        'How does SevOne handle multi-vendor network environments?'
      ],
      'NS1': [
        'What are the key capabilities and use cases of NS1?',
        'How does NS1 improve DNS performance and reliability?',
        'What DDoS protection features does NS1 provide?',
        'How does NS1 support traffic management and load balancing?'
      ],
      'Verify': [
        'What are the key capabilities and use cases of IBM Verify?',
        'How does IBM Verify support identity and access management?',
        'What authentication methods does IBM Verify support?',
        'How does IBM Verify integrate with existing IAM solutions?'
      ],
      'Concert': [
        'What are the key capabilities and use cases of IBM Concert?',
        'How does IBM Concert provide application observability?',
        'What AI capabilities does IBM Concert offer for IT operations?',
        'How does IBM Concert integrate with existing monitoring tools?'
      ],
      'Instana': [
        'What are the key capabilities and use cases of Instana?',
        'How does Instana provide automatic application monitoring?',
        'What technologies and platforms does Instana support?',
        'How does Instana help with root cause analysis?'
      ],
      'Turbonomic': [
        'What are the key capabilities and use cases of Turbonomic?',
        'How does Turbonomic optimize application resource management?',
        'What cloud platforms does Turbonomic support?',
        'How does Turbonomic provide cost optimization?'
      ],
      'Maximo': [
        'What are the key capabilities and use cases of IBM Maximo?',
        'How does Maximo support asset lifecycle management?',
        'What AI capabilities does Maximo offer for predictive maintenance?',
        'How does Maximo integrate with IoT and operational systems?'
      ],
      'Apptio': [
        'What are the key capabilities and use cases of Apptio?',
        'How does Apptio provide Technology Business Management?',
        'What financial planning capabilities does Apptio offer?',
        'How does Apptio support cloud cost optimization?'
      ],
      'Vault': [
        'What are the key capabilities and use cases of IBM Vault?',
        'How does Vault provide secrets management?',
        'What encryption and security features does Vault offer?',
        'How does Vault integrate with DevOps workflows?'
      ],
      'watsonx': [
        'What are the key capabilities and use cases of watsonx?',
        'How does watsonx support AI model development and deployment?',
        'What foundation models are available in watsonx?',
        'How does watsonx ensure AI governance and trust?'
      ],
      'IBM Bob': [
        'What are the key capabilities and use cases of IBM Bob?',
        'How does IBM Bob enhance developer productivity?',
        'What AI capabilities does IBM Bob provide?',
        'How does IBM Bob integrate with development workflows?'
      ]
    };

    // Return product-specific questions or default questions
    return productQuestions[productName] || [
      `What are the key capabilities and use cases of ${productName}?`,
      `How does ${productName} integrate with existing systems?`,
      `What are the deployment and scalability options for ${productName}?`,
      `What ROI and business value does ${productName} provide?`
    ];
  }

  /**
   * Handle product question generate button click
   */
  async function handleProductGenerate(button) {
    console.log('handleProductGenerate called');
    const questionCard = button.closest('.product-question-card');
    const question = button.dataset.question;
    const productName = button.dataset.product;
    const questionNumber = button.dataset.questionNumber;
    const answerContainer = questionCard.querySelector('.product-answer-container');

    console.log('Question:', question);
    console.log('Product:', productName);
    console.log('Answer container:', answerContainer);

    // Show loading state
    button.classList.add('loading');
    button.disabled = true;
    button.innerHTML = `
      <svg class="generate-icon spinning" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
      </svg>
      Generating...
    `;

    try {
      // Fetch the answer
      console.log('Calling fetchProductAnswer...');
      await fetchProductAnswer(question, productName, answerContainer);
      console.log('fetchProductAnswer completed');

      // Update button to Regenerate
      button.classList.remove('loading');
      button.disabled = false;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C9.36 3 10.5867 3.54667 11.4667 4.42667M11.4667 4.42667L13 3M11.4667 4.42667L10 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Regenerate
      `;

      // Add AI suggestions if they don't exist
      if (!answerContainer.querySelector('.ai-suggestions')) {
        addProductAISuggestions(answerContainer, productName, question);
      }

    } catch (error) {
      console.error('Error generating product answer:', error);
      button.classList.remove('loading');
      button.disabled = false;
      button.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Generate
      `;
    }
  }

  /**
   * Add AI suggestions for product questions
   */
  function addProductAISuggestions(answerContainer, productName, question) {
    const suggestions = generateProductAISuggestions(productName, question);
    
    if (suggestions.length === 0) return;
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'ai-suggestions';
    suggestionsDiv.innerHTML = `
      <div class="ai-suggestions__header">
        <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>AI Suggested Follow-ups:</span>
      </div>
      <ul class="ai-suggestions__list">
        ${suggestions.map(s => `<li class="ai-suggestion clickable-suggestion" data-question="${s.replace(/"/g, '"')}">${s}</li>`).join('')}
      </ul>
    `;
    
    answerContainer.appendChild(suggestionsDiv);
    
    // Add click handlers to suggestions
    const suggestionItems = suggestionsDiv.querySelectorAll('.clickable-suggestion');
    suggestionItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', function() {
        const followUpQuestion = this.getAttribute('data-question');
        handleProductFollowUpClick(followUpQuestion, productName, answerContainer);
      });
    });
  }

  /**
   * Handle follow-up question click in Section 5
   */
  async function handleProductFollowUpClick(followUpQuestion, productName, originalAnswerContainer) {
    console.log('Follow-up clicked:', followUpQuestion);
    
    // Find the textarea in the original answer container
    const answerField = originalAnswerContainer.querySelector('.product-answer-field');
    if (!answerField) {
      console.error('Could not find answer field');
      return;
    }
    
    // Show loading state in the same textarea
    const originalContent = answerField.value;
    answerField.value = 'Generating follow-up response...';
    answerField.style.backgroundColor = '#f4f4f4';
    
    // Fetch the answer
    try {
      const response = await fetch('http://localhost:3000/api/ibm-docs/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: followUpQuestion,
          customerName: state.customerName || 'the customer',
          industry: state.industry || 'Technology'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Replace the content in the same textarea
        answerField.value = result.data.response || 'No information available.';
        answerField.style.backgroundColor = '';
        
        // Update sources if they exist
        const sourcesDiv = originalAnswerContainer.querySelector('.product-sources');
        if (sourcesDiv && result.data.sources && result.data.sources.length > 0) {
          const sourceTags = result.data.sources
            .map(source => `<span class="source-tag">${source.title || source.url}</span>`)
            .join('');
          
          sourcesDiv.innerHTML = `
            <span class="sources-label">SOURCES:</span>
            <div class="source-tags">
              ${sourceTags}
            </div>
          `;
        }

        // Scroll to the answer
        answerField.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        throw new Error(result.error || 'Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching follow-up answer:', error);
      answerField.value = `Error retrieving information: ${error.message}\n\nOriginal response:\n${originalContent}`;
      answerField.style.backgroundColor = '#fff3cd';
    }
  }

  /**
   * Generate AI suggestions for product questions
   */
  function generateProductAISuggestions(productName, question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('key capabilities')) {
      return [
        `What specific features of ${productName} address our current challenges?`,
        `How does ${productName} compare to our existing solutions?`,
        `What training and support is available for ${productName}?`
      ];
    } else if (lowerQuestion.includes('integrate')) {
      return [
        `What APIs and connectors does ${productName} provide?`,
        `How long does a typical ${productName} integration take?`,
        `What are the prerequisites for integrating ${productName}?`
      ];
    } else if (lowerQuestion.includes('deployment') || lowerQuestion.includes('scalability')) {
      return [
        `What are the infrastructure requirements for ${productName}?`,
        `How does ${productName} handle high availability?`,
        `What are the licensing options for ${productName}?`
      ];
    } else if (lowerQuestion.includes('roi') || lowerQuestion.includes('business value')) {
      return [
        `What metrics should we track to measure ${productName} success?`,
        `What is the typical time to value for ${productName}?`,
        `What cost savings have other customers achieved with ${productName}?`
      ];
    }
    
    // Default suggestions
    return [
      `What are the implementation best practices for ${productName}?`,
      `What customer success stories are available for ${productName}?`,
      `What is the roadmap for ${productName}?`
    ];
  }

  /**
   * Fetch product answer from API
   */
  async function fetchProductAnswer(question, productName, answerContainer) {
    console.log('fetchProductAnswer called with:', { question, productName, answerContainer });
    
    if (!answerContainer) {
      console.error('No answer container provided!');
      return;
    }

    // Show loading state and make container visible
    answerContainer.style.display = 'block';
    answerContainer.innerHTML = '<p class="product-answer-loading">Retrieving information from IBM documentation...</p>';

    console.log('Making API request to:', 'http://localhost:3000/api/ibm-docs/generate-response');

    try {
      const response = await fetch('http://localhost:3000/api/ibm-docs/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          customerName: state.customerName || 'the customer',
          industry: state.industry || 'Technology'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Display the answer with sources
        const sources = result.data.sources || [];
        const sourceTags = sources.length > 0
          ? sources.map(source => `<span class="source-tag">${source.title || source.url}</span>`).join('')
          : '<span class="source-tag">IBM Documentation</span><span class="source-tag">IBM.com</span><span class="source-tag">Google AI</span>';

        answerContainer.innerHTML = `
          <textarea class="product-answer-field" readonly rows="8">${result.data.response || 'No information available.'}</textarea>
          <div class="product-sources">
            <span class="sources-label">SOURCES:</span>
            <div class="source-tags">
              ${sourceTags}
            </div>
          </div>
        `;

        // Add AI suggestions after the answer
        addProductAISuggestions(answerContainer, productName, question);

        // Smooth scroll to answer
        answerContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        throw new Error(result.error || 'Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching product information:', error);
      answerContainer.innerHTML = `
        <p class="product-answer-error">
          Error retrieving information: ${error.message}<br><br>
          Please ensure the backend API is running and accessible.
        </p>
      `;
    }
  }

  /**
   * Clear selected product
   */
  function clearSelectedProduct() {
    const selectedProductContainer = document.getElementById('selected-product-container');
    const productEmptyState = document.getElementById('product-empty-state');
    const productQuestionsContainer = document.getElementById('product-questions-container');

    if (selectedProductContainer) selectedProductContainer.style.display = 'none';
    if (productEmptyState) productEmptyState.style.display = 'block';
    if (productQuestionsContainer) productQuestionsContainer.innerHTML = '';
  }

  /**
   * Handle product search query
   */
  async function handleProductQuery(query) {
    const queryResponseArea = document.getElementById('query-response-area');
    const queryQuestionText = document.getElementById('query-question-text');
    const queryResponseField = document.getElementById('query-response-field');
    const queryFollowupList = document.getElementById('query-followup-list');

    // Show response area
    queryResponseArea.style.display = 'block';
    queryQuestionText.textContent = query;
    queryResponseField.value = 'Searching IBM products and documentation...';

    try {
      // Call the IBM Docs API
      const response = await fetch('http://localhost:3000/api/ibm-docs/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: query,
          customerName: state.customerName || 'the customer',
          industry: state.industry || 'Technology'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Display the AI-generated response
        queryResponseField.value = result.data.response || 'No results found.';

        // Generate follow-up questions based on insights
        if (result.data.insights && result.data.insights.length > 0) {
          queryFollowupList.innerHTML = '';
          
          // Create follow-ups from insights (take first 3)
          const followUps = result.data.insights.slice(0, 3).map(insight => {
            // Convert insight to a question format
            const words = insight.split(' ').slice(0, 10).join(' ');
            return `Tell me more about ${words}...`;
          });
          
          followUps.forEach(question => {
            const li = document.createElement('li');
            li.className = 'ai-suggestion';
            li.textContent = question;
            queryFollowupList.appendChild(li);
          });
        } else {
          // Default follow-ups based on the query
          queryFollowupList.innerHTML = `
            <li class="ai-suggestion">What are the key features and benefits?</li>
            <li class="ai-suggestion">How does this integrate with existing systems?</li>
            <li class="ai-suggestion">What are the implementation considerations?</li>
          `;
        }

        // Log sources for debugging
        if (result.data.sources && result.data.sources.length > 0) {
          console.log('IBM Documentation sources:', result.data.sources);
        }
      } else {
        throw new Error(result.error || 'Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching IBM product information:', error);
      queryResponseField.value = `Error retrieving information: ${error.message}\n\nPlease ensure:\n1. The backend API is running\n2. You have entered a customer name and industry in Section 1\n3. The IBM Docs service is properly configured`;
      
      // Show helpful follow-ups on error
      queryFollowupList.innerHTML = `
        <li class="ai-suggestion">Tell me about IBM Cloud Pak for Automation</li>
        <li class="ai-suggestion">What is IBM watsonx?</li>
        <li class="ai-suggestion">Explain IBM Instana Observability</li>
        <li class="ai-suggestion">How does IBM help with application modernization?</li>
      `;
    }
  }

  // ============================================================
  //   MANAGER DASHBOARD  (M.1 Coverage · M.2 Pipeline · M.3 Playbooks · 6.2 Watchlist)
  // ============================================================

  function initManagerDashboard() {
    const toggleBtn  = document.getElementById('manager-dashboard-toggle');
    const closeBtn   = document.getElementById('manager-dashboard-close');
    const panel      = document.getElementById('manager-dashboard');
    if (!panel) return;

    // ── open / close ──────────────────────────────────────────────────────────
    function openPanel() {
      panel.style.display = 'block';
      toggleBtn && toggleBtn.classList.add('active');
      refreshActiveMgrTab();
    }
    function closePanel() {
      panel.style.display = 'none';
      toggleBtn && toggleBtn.classList.remove('active');
    }
    if (toggleBtn) toggleBtn.addEventListener('click', () =>
      panel.style.display === 'none' ? openPanel() : closePanel());
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // ── tab switching ─────────────────────────────────────────────────────────
    document.querySelectorAll('.manager-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.manager-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.manager-tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panelId = 'tab-' + tab.dataset.tab;
        const tabPanel = document.getElementById(panelId);
        if (tabPanel) tabPanel.classList.add('active');
        refreshActiveMgrTab();
      });
    });

    function refreshActiveMgrTab() {
      const activeTab = document.querySelector('.manager-tab.active');
      if (!activeTab) return;
      switch (activeTab.dataset.tab) {
        case 'coverage':  renderCoverage();  break;
        case 'pipeline':  renderPipeline();  break;
        case 'playbooks': renderPlaybooks(); break;
        case 'watchlist': renderWatchlist(); break;
      }
    }

    // ── helpers ───────────────────────────────────────────────────────────────
    function mgrLS(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    }
    function mgrLSSave(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }
    function showNotif(msg) { showNotification && showNotification(msg); }

    // ============================================================
    //  M.1 — ACCOUNT COVERAGE
    // ============================================================

    function renderCoverage() {
      const sessions   = mgrLS('mgrSessions', []);
      const periodSel  = document.getElementById('coverage-period-select');
      const days       = periodSel ? (periodSel.value === 'all' ? Infinity : Number(periodSel.value)) : 30;
      const cutoff     = Date.now() - days * 86400000;
      const filtered   = sessions.filter(s => days === Infinity || s.ts >= cutoff);

      // stats
      const statsEl = document.getElementById('coverage-summary-stats');
      if (statsEl) {
        const accounts  = new Set(filtered.map(s => s.account)).size;
        const questions = filtered.length;
        const sellers   = new Set(filtered.map(s => s.seller || 'Unknown')).size;
        const industries = new Set(filtered.map(s => s.industry).filter(Boolean)).size;
        statsEl.innerHTML = `
          <div class="coverage-stat"><span class="coverage-stat__num">${accounts}</span><span class="coverage-stat__lbl">Accounts researched</span></div>
          <div class="coverage-stat"><span class="coverage-stat__num">${questions}</span><span class="coverage-stat__lbl">Questions generated</span></div>
          <div class="coverage-stat"><span class="coverage-stat__num">${sellers}</span><span class="coverage-stat__lbl">Sellers active</span></div>
          <div class="coverage-stat"><span class="coverage-stat__num">${industries}</span><span class="coverage-stat__lbl">Industries covered</span></div>`;
      }

      // heatmap: industry × pillar
      const heatmapEl = document.getElementById('coverage-heatmap');
      if (heatmapEl) {
        const pillars = ['application-modernization','infrastructure-automation','technology-business-management'];
        const pillarLabels = { 'application-modernization':'App Mod','infrastructure-automation':'Infra Auto','technology-business-management':'TBM' };
        const industries = [...new Set(filtered.map(s => s.industry).filter(Boolean))];
        if (industries.length === 0 && filtered.length === 0) {
          heatmapEl.innerHTML = '';
        } else {
          const counts = {};
          filtered.forEach(s => {
            if (!s.industry) return;
            pillars.forEach(p => {
              if (s.pillar === p) {
                const k = `${s.industry}|${p}`;
                counts[k] = (counts[k] || 0) + 1;
              }
            });
          });
          const maxCount = Math.max(1, ...Object.values(counts));
          const rows = industries.map(ind => {
            const cells = pillars.map(p => {
              const k = `${ind}|${p}`;
              const n = counts[k] || 0;
              const intensity = Math.round((n / maxCount) * 5);
              return `<td class="hm-cell hm-cell--${intensity}" title="${ind} / ${pillarLabels[p]}: ${n}">${n || ''}</td>`;
            }).join('');
            const label = ind.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
            return `<tr><td class="hm-row-label">${label}</td>${cells}</tr>`;
          }).join('');
          heatmapEl.innerHTML = `<table class="hm-table">
            <thead><tr><th></th>${pillars.map(p=>`<th>${pillarLabels[p]}</th>`).join('')}</tr></thead>
            <tbody>${rows}</tbody></table>`;
        }
      }

      // sessions list
      const listEl  = document.getElementById('coverage-sessions-list');
      const emptyEl = document.getElementById('coverage-empty');
      if (listEl) {
        if (filtered.length === 0) {
          listEl.innerHTML = '';
          if (emptyEl) emptyEl.style.display = 'block';
        } else {
          if (emptyEl) emptyEl.style.display = 'none';
          const recent = [...filtered].sort((a,b) => b.ts - a.ts).slice(0, 50);
          listEl.innerHTML = `<table class="mgr-table">
            <thead><tr><th>Account</th><th>Industry</th><th>Pillar</th><th>Question #</th><th>Section</th><th>Seller</th><th>Time</th></tr></thead>
            <tbody>${recent.map(s => `<tr>
              <td>${esc(s.account||'—')}</td>
              <td>${esc(s.industry||'—')}</td>
              <td>${esc(s.pillar||'—')}</td>
              <td>${esc(s.qNum||'—')}</td>
              <td>${s.section||'—'}</td>
              <td>${esc(s.seller||'')}</td>
              <td>${new Date(s.ts).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
            </tr>`).join('')}</tbody></table>`;
        }
      }
    }

    // period filter
    const periodSel = document.getElementById('coverage-period-select');
    if (periodSel) periodSel.addEventListener('change', renderCoverage);

    // clear history
    const clearBtn = document.getElementById('coverage-clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (!confirm('Clear all session history? This cannot be undone.')) return;
      mgrLSSave('mgrSessions', []);
      renderCoverage();
      showNotif('Coverage history cleared');
    });

    // ============================================================
    //  M.2 — PIPELINE REPORT
    // ============================================================

    function renderPipeline() {
      const deals  = mgrLS('mgrDeals', []);
      const statsEl = document.getElementById('pipeline-summary-stats');
      const tableWrap = document.getElementById('pipeline-table-wrapper');
      const emptyEl  = document.getElementById('pipeline-empty');

      if (statsEl) {
        const totalVal  = deals.reduce((s,d) => s + (Number(d.value)||0), 0);
        const won       = deals.filter(d => d.stage === 'won').length;
        const closed    = deals.filter(d => d.stage === 'won' || d.stage === 'lost').length;
        const winRate   = closed ? Math.round(won / closed * 100) : 0;
        const boardHelped = deals.filter(d => d.boardAssisted).length;
        const boardPct  = deals.length ? Math.round(boardHelped / deals.length * 100) : 0;
        statsEl.innerHTML = `
          <div class="coverage-stat"><span class="coverage-stat__num">$${(totalVal/1000).toFixed(0)}K</span><span class="coverage-stat__lbl">Total pipeline value</span></div>
          <div class="coverage-stat"><span class="coverage-stat__num">${winRate}%</span><span class="coverage-stat__lbl">Win rate (closed)</span></div>
          <div class="coverage-stat"><span class="coverage-stat__num">${deals.length}</span><span class="coverage-stat__lbl">Deals logged</span></div>
          <div class="coverage-stat"><span class="coverage-stat__num">${boardPct}%</span><span class="coverage-stat__lbl">Board-assisted</span></div>`;
      }

      if (!tableWrap) return;
      if (deals.length === 0) {
        tableWrap.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
      }
      if (emptyEl) emptyEl.style.display = 'none';

      const stageLabel = {prospecting:'Prospecting',discovery:'Discovery',proposal:'Proposal',negotiation:'Negotiation',won:'Won ✓',lost:'Lost ✗'};
      const stageClass = {won:'badge--green',lost:'badge--red',proposal:'badge--blue',negotiation:'badge--amber',discovery:'badge--purple',prospecting:'badge--grey'};
      tableWrap.innerHTML = `<table class="mgr-table">
        <thead><tr><th>Account</th><th>Seller</th><th>Stage</th><th>Value</th><th>Board?</th><th>Date</th><th>Notes</th><th></th></tr></thead>
        <tbody>${deals.map((d,i) => `<tr>
          <td>${esc(d.account||'—')}</td>
          <td>${esc(d.seller||'—')}</td>
          <td><span class="badge ${stageClass[d.stage]||'badge--grey'}">${stageLabel[d.stage]||d.stage}</span></td>
          <td>${d.value ? '$'+Number(d.value).toLocaleString() : '—'}</td>
          <td>${d.boardAssisted ? '✓' : '—'}</td>
          <td>${d.date ? new Date(d.date).toLocaleDateString() : '—'}</td>
          <td class="mgr-table-notes">${esc(d.notes||'')}</td>
          <td><button class="mgr-delete-btn" data-deal-idx="${i}" title="Delete">✕</button></td>
        </tr>`).join('')}</tbody></table>`;

      tableWrap.querySelectorAll('.mgr-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.dealIdx);
          const deals2 = mgrLS('mgrDeals', []);
          deals2.splice(idx, 1);
          mgrLSSave('mgrDeals', deals2);
          renderPipeline();
          showNotif('Deal removed');
        });
      });
    }

    // Add deal modal
    const addDealBtn   = document.getElementById('add-deal-btn');
    const dealModal    = document.getElementById('deal-log-modal');
    const dealClose    = document.getElementById('deal-log-close');
    const dealCancel   = document.getElementById('deal-log-cancel');
    const dealSave     = document.getElementById('deal-log-save');

    function openDealModal() {
      if (!dealModal) return;
      // Pre-fill account from current session
      const accInput = document.getElementById('deal-account-input');
      if (accInput && state.customerName) accInput.value = state.customerName;
      // Populate datalist from session history
      const dl = document.getElementById('deal-account-suggestions');
      if (dl) {
        const sessions = mgrLS('mgrSessions', []);
        const accounts = [...new Set(sessions.map(s => s.account).filter(Boolean))];
        dl.innerHTML = accounts.map(a => `<option value="${esc(a)}"/>`).join('');
      }
      dealModal.style.display = 'flex';
    }
    function closeDealModal() { if (dealModal) dealModal.style.display = 'none'; }

    if (addDealBtn) addDealBtn.addEventListener('click', openDealModal);
    if (dealClose)  dealClose.addEventListener('click', closeDealModal);
    if (dealCancel) dealCancel.addEventListener('click', closeDealModal);
    if (dealModal)  dealModal.addEventListener('click', e => { if (e.target === dealModal) closeDealModal(); });

    if (dealSave) dealSave.addEventListener('click', () => {
      const account = document.getElementById('deal-account-input')?.value.trim();
      const seller  = document.getElementById('deal-seller-input')?.value.trim() || '';
      const stage   = document.getElementById('deal-stage-select')?.value;
      const value   = document.getElementById('deal-value-input')?.value;
      const notes   = document.getElementById('deal-notes-input')?.value.trim();
      if (!account) { alert('Please enter an account name.'); return; }
      const sessions = mgrLS('mgrSessions', []);
      const boardAssisted = sessions.some(s => s.account && s.account.toLowerCase() === account.toLowerCase());
      const deals = mgrLS('mgrDeals', []);
      deals.push({ account, seller, stage, value: value ? Number(value) : null, notes, boardAssisted, date: Date.now() });
      mgrLSSave('mgrDeals', deals);
      closeDealModal();
      renderPipeline();
      showNotif('Deal outcome saved');
    });

    // ============================================================
    //  M.3 — SHARED PLAYBOOKS
    // ============================================================

    function renderPlaybooks() {
      const playbooks = mgrLS('mgrPlaybooks', []);
      const listEl    = document.getElementById('playbook-questions-list');
      const emptyEl   = document.getElementById('playbook-empty');
      if (!listEl) return;
      if (playbooks.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
      }
      if (emptyEl) emptyEl.style.display = 'none';
      listEl.innerHTML = playbooks.map((q,i) => `
        <div class="playbook-question-item">
          <div class="playbook-question-item__text">${esc(q.text)}</div>
          <div class="playbook-question-item__meta">
            ${q.industry ? `<span class="badge badge--grey">${esc(q.industry)}</span>` : '<span class="badge badge--grey">All industries</span>'}
            ${q.pillar   ? `<span class="badge badge--blue">${esc(q.pillar)}</span>` : '<span class="badge badge--blue">All pillars</span>'}
            <span class="badge badge--purple">Section ${q.section||'2'}</span>
          </div>
          <button class="mgr-delete-btn" data-pb-idx="${i}" title="Remove question">✕</button>
        </div>`).join('');

      listEl.querySelectorAll('.mgr-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.pbIdx);
          const pbs = mgrLS('mgrPlaybooks', []);
          pbs.splice(idx, 1);
          mgrLSSave('mgrPlaybooks', pbs);
          renderPlaybooks();
          injectPlaybookQuestions();
          showNotif('Playbook question removed');
        });
      });
    }

    // Inject playbook questions into Section 2 / Section 3 custom question containers
    function injectPlaybookQuestions() {
      const playbooks = mgrLS('mgrPlaybooks', []);
      const industry  = (state.industry || '').toLowerCase();
      const pillar    = (state.selectedPillar || '').toLowerCase();

      // Find all custom-question containers
      const containers = document.querySelectorAll('.custom-questions-container, #custom-questions-s2, #custom-questions-s3');
      containers.forEach(container => {
        // Remove previously injected playbook items
        container.querySelectorAll('.playbook-injected-question').forEach(el => el.remove());
      });

      playbooks.forEach(q => {
        const matchIndustry = !q.industry || q.industry.toLowerCase() === industry;
        const matchPillar   = !q.pillar   || q.pillar.toLowerCase() === pillar;
        if (!matchIndustry || !matchPillar) return;

        // Determine target section container
        const sectionNum = String(q.section || '2');
        let targetContainerId = sectionNum === '3' ? 'custom-questions-s3' : 'custom-questions-s2';
        let container = document.getElementById(targetContainerId);
        if (!container) {
          // Fallback: first custom-questions-container in the relevant section
          const sections = document.querySelectorAll('.custom-questions-container');
          container = sections[sectionNum === '3' ? 1 : 0] || sections[0];
        }
        if (!container) return;

        const div = document.createElement('div');
        div.className = 'playbook-injected-question';
        div.innerHTML = `<span class="badge badge--blue" style="margin-right:6px;font-size:11px;">Playbook</span>${esc(q.text)}`;
        div.style.cssText = 'padding:8px 10px;border-left:3px solid var(--color-primary,#0f62fe);background:#f0f4ff;border-radius:3px;margin:6px 0;font-size:13px;color:#1f2328;cursor:default;';
        container.appendChild(div);
      });
    }

    // Add question form
    const addPbBtn   = document.getElementById('add-playbook-question-btn');
    const pbForm     = document.getElementById('playbook-add-form');
    const pbCancel   = document.getElementById('playbook-add-cancel');
    const pbSave     = document.getElementById('playbook-add-save');

    if (addPbBtn && pbForm) addPbBtn.addEventListener('click', () => {
      pbForm.style.display = pbForm.style.display === 'none' ? 'block' : 'none';
    });
    if (pbCancel && pbForm) pbCancel.addEventListener('click', () => {
      pbForm.style.display = 'none';
    });
    if (pbSave) pbSave.addEventListener('click', () => {
      const text    = document.getElementById('playbook-question-text')?.value.trim();
      const industry = document.getElementById('playbook-industry-select')?.value;
      const pillar   = document.getElementById('playbook-pillar-select')?.value;
      const section  = document.getElementById('playbook-section-select')?.value;
      if (!text) { alert('Please enter a question.'); return; }
      const pbs = mgrLS('mgrPlaybooks', []);
      pbs.push({ text, industry, pillar, section, created: Date.now() });
      mgrLSSave('mgrPlaybooks', pbs);
      if (pbForm) pbForm.style.display = 'none';
      if (document.getElementById('playbook-question-text')) document.getElementById('playbook-question-text').value = '';
      renderPlaybooks();
      injectPlaybookQuestions();
      showNotif('Playbook question published');
    });

    // Re-inject when industry or pillar changes
    const industryEl = document.getElementById('industry');
    if (industryEl) industryEl.addEventListener('change', () => setTimeout(injectPlaybookQuestions, 100));
    document.addEventListener('pillarSelected', injectPlaybookQuestions);

    // ============================================================
    //  MANAGER BRIEFING  (replaces 6.2 News Watchlist)
    //  Three panels: Untouched · Stale · Top IBM Signals
    // ============================================================

    // ── IBM signal relevance scorer ───────────────────────────────
    const IBM_SIGNAL_KEYWORDS = [
      { terms: ['cloud migration','cloud transformation','move to cloud','cloud-native'], score: 5 },
      { terms: ['ai strategy','artificial intelligence','generative ai','watsonx','llm','machine learning'], score: 5 },
      { terms: ['cost reduction','cost cutting','efficiency','headcount','restructure','restructuring'], score: 4 },
      { terms: ['modernization','modernisation','legacy','technical debt','application modernization'], score: 4 },
      { terms: ['automation','robotic process','rpa','workflow automation'], score: 4 },
      { terms: ['hybrid cloud','multicloud','multi-cloud','private cloud'], score: 4 },
      { terms: ['digital transformation','digitization','digitisation'], score: 3 },
      { terms: ['security','cybersecurity','zero trust','compliance','regulation'], score: 3 },
      { terms: ['data platform','data lake','analytics','observability'], score: 3 },
      { terms: ['outage','incident','downtime','breach','vulnerability'], score: 3 },
      { terms: ['partnership','acquisition','merger','investment','funding'], score: 2 },
      { terms: ['earnings','revenue','profit','quarterly'], score: 1 },
    ];

    function scoreArticle(title) {
      const lower = title.toLowerCase();
      let total = 0;
      for (const kw of IBM_SIGNAL_KEYWORDS) {
        if (kw.terms.some(t => lower.includes(t))) total += kw.score;
      }
      return Math.min(total, 10);
    }

    function signalLabel(score) {
      if (score >= 7) return { label: 'High signal', cls: 'badge--red' };
      if (score >= 4) return { label: 'Medium signal', cls: 'badge--amber' };
      return { label: 'Low signal', cls: 'badge--grey' };
    }

    // ── Render monitored account rows ─────────────────────────────
    function renderWatchlist() {
      const watchlist = mgrLS('mgrWatchlist', []);
      const itemsEl   = document.getElementById('watchlist-items');
      const emptyEl   = document.getElementById('watchlist-empty');
      const briefEl   = document.getElementById('briefing-panels');
      if (!itemsEl) return;

      if (watchlist.length === 0) {
        itemsEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        if (briefEl) briefEl.style.display = 'none';
        return;
      }

      if (emptyEl) emptyEl.style.display = 'none';
      if (briefEl) briefEl.style.display = 'block';

      const priorityClass = { high:'badge--red', medium:'badge--amber', low:'badge--grey' };
      const digest = mgrLS('mgrWatchlistDigest', []);
      itemsEl.innerHTML = watchlist.map((w,i) => {
        const count = digest.filter(d => d.account === w.account).length;
        return `
        <div class="watchlist-item">
          <div class="watchlist-item__left">
            <span class="watchlist-item__account">${esc(w.account)}</span>
            <span class="badge ${priorityClass[w.priority]||'badge--grey'}">${w.priority||'medium'}</span>
            ${w.seller ? `<span class="watchlist-item__seller">— ${esc(w.seller)}</span>` : ''}
            ${count > 0 ? `<span class="badge badge--blue">${count} article${count!==1?'s':''}</span>` : '<span style="font-size:12px;color:#9ca3af;">No news yet</span>'}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button class="wl-fetch-btn mgr-btn-secondary" data-account="${esc(w.account)}" style="padding:3px 9px;font-size:12px;">
              <svg width="11" height="11" viewBox="0 0 13 13" fill="none" style="vertical-align:-1px;margin-right:3px;">
                <path d="M11.5 2A5.5 5.5 0 1 0 12 6.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                <path d="M9 2h2.5V4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>Fetch
            </button>
            <button class="mgr-delete-btn" data-wl-idx="${i}" title="Remove">✕</button>
          </div>
        </div>`;
      }).join('');

      // per-account fetch
      itemsEl.querySelectorAll('.wl-fetch-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const account = btn.dataset.account;
          const orig = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Fetching…';
          await fetchNewsForAccount(account);
          btn.disabled = false; btn.innerHTML = orig;
          renderBriefing();
          renderWatchlist();
          showNotif(`News refreshed for ${account}`);
        });
      });

      // delete
      itemsEl.querySelectorAll('.mgr-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.wlIdx);
          const wl  = mgrLS('mgrWatchlist', []);
          const removed = wl.splice(idx, 1)[0];
          mgrLSSave('mgrWatchlist', wl);
          if (removed) {
            const d = mgrLS('mgrWatchlistDigest', []).filter(x => x.account !== removed.account);
            mgrLSSave('mgrWatchlistDigest', d);
          }
          renderWatchlist();
          renderBriefing();
          updateWatchlistBadge();
          showNotif('Account removed');
        });
      });

      renderBriefing();
      updateLastFetchedLabel();
    }

    // ── Render the three briefing panels ─────────────────────────
    function renderBriefing() {
      const watchlist = mgrLS('mgrWatchlist', []);
      const digest    = mgrLS('mgrWatchlistDigest', []);
      const sessions  = mgrLS('mgrSessions', []);
      const now       = Date.now();
      const STALE_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days
      const WEEK_MS   = 7 * 24 * 60 * 60 * 1000;

      // ── Panel 1: Untouched Opportunities ─────────────────────
      const untouchedEl = document.getElementById('briefing-untouched-items');
      if (untouchedEl) {
        const untouched = watchlist.filter(w => {
          const hasNews = digest.some(d => d.account === w.account);
          const hasSessions = sessions.some(s =>
            s.account && s.account.toLowerCase() === w.account.toLowerCase()
          );
          return hasNews && !hasSessions;
        });

        if (untouched.length === 0) {
          untouchedEl.innerHTML = '<p class="briefing-empty">No untouched opportunities — all monitored accounts have board activity.</p>';
        } else {
          untouchedEl.innerHTML = untouched.map(w => {
            const articles = digest.filter(d => d.account === w.account);
            const latest   = articles[0];
            const wl = mgrLS('mgrWatchlist', []).find(x => x.account === w.account);
            const nudgeText = `Hi ${wl?.seller||'[Seller]'}, there are new developments at ${w.account} worth exploring. Have you had a chance to open the Prospecting Board for this account?`;
            return `
            <div class="briefing-card briefing-card--urgent">
              <div class="briefing-card__top">
                <span class="briefing-card__account">${esc(w.account)}</span>
                ${wl?.seller ? `<span class="briefing-card__seller">→ ${esc(wl.seller)}</span>` : ''}
                <span class="badge badge--red">No board activity</span>
                <span class="badge badge--blue">${articles.length} article${articles.length!==1?'s':''}</span>
              </div>
              ${latest ? `<div class="briefing-card__headline">"${esc(latest.title)}"<span class="briefing-card__source">${esc(latest.source||'')}</span></div>` : ''}
              <div class="briefing-card__actions">
                <button class="mgr-btn-secondary briefing-nudge-btn" data-nudge="${esc(nudgeText)}" style="font-size:12px;padding:4px 10px;">
                  Copy nudge message
                </button>
              </div>
            </div>`;
          }).join('');

          untouchedEl.querySelectorAll('.briefing-nudge-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              navigator.clipboard.writeText(btn.dataset.nudge).then(() => {
                showNotif('Nudge message copied to clipboard');
              }).catch(() => {
                prompt('Copy this nudge:', btn.dataset.nudge);
              });
            });
          });
        }
      }

      // ── Panel 2: Stale Accounts ───────────────────────────────
      const staleEl = document.getElementById('briefing-stale-items');
      if (staleEl) {
        const stale = watchlist.filter(w => {
          const accountSessions = sessions.filter(s =>
            s.account && s.account.toLowerCase() === w.account.toLowerCase()
          );
          if (accountSessions.length === 0) return false; // Untouched, not stale
          const lastSession = Math.max(...accountSessions.map(s => s.ts));
          const hasRecentNews = digest.some(d =>
            d.account === w.account && d.ts > lastSession
          );
          return (now - lastSession > STALE_MS) && hasRecentNews;
        });

        if (stale.length === 0) {
          staleEl.innerHTML = '<p class="briefing-empty">No stale accounts — all board activity is recent.</p>';
        } else {
          staleEl.innerHTML = stale.map(w => {
            const accountSessions = sessions.filter(s =>
              s.account && s.account.toLowerCase() === w.account.toLowerCase()
            );
            const lastSession = Math.max(...accountSessions.map(s => s.ts));
            const daysStale   = Math.floor((now - lastSession) / 86400000);
            const lastSeller  = accountSessions.sort((a,b)=>b.ts-a.ts)[0]?.seller || '—';
            const newArticles = digest.filter(d => d.account === w.account && d.ts > lastSession);
            const latest      = newArticles[0];
            return `
            <div class="briefing-card briefing-card--stale">
              <div class="briefing-card__top">
                <span class="briefing-card__account">${esc(w.account)}</span>
                <span class="briefing-card__seller">→ ${esc(lastSeller)}</span>
                <span class="badge badge--amber">${daysStale}d inactive</span>
                <span class="badge badge--blue">${newArticles.length} new article${newArticles.length!==1?'s':''} since last visit</span>
              </div>
              ${latest ? `<div class="briefing-card__headline">"${esc(latest.title)}"<span class="briefing-card__source">${esc(latest.source||'')}</span></div>` : ''}
              <div class="briefing-card__meta">Last board activity: ${new Date(lastSession).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
            </div>`;
          }).join('');
        }
      }

      // ── Panel 3: Top IBM Signals this week ────────────────────
      const signalsEl = document.getElementById('briefing-signals-items');
      if (signalsEl) {
        const weekCutoff = now - WEEK_MS;
        const scored = digest
          .filter(d => d.ts >= weekCutoff)
          .map(d => ({ ...d, ibmScore: scoreArticle(d.title) }))
          .filter(d => d.ibmScore > 0)
          .sort((a,b) => b.ibmScore - a.ibmScore)
          .slice(0, 8);

        if (scored.length === 0) {
          signalsEl.innerHTML = '<p class="briefing-empty">No IBM-relevant signals found this week. Refresh news to get the latest articles.</p>';
        } else {
          const { label: topLabel } = signalLabel(scored[0]?.ibmScore || 0);
          signalsEl.innerHTML = scored.map((item, i) => {
            const sig = signalLabel(item.ibmScore);
            return `
            <div class="briefing-signal-row">
              <span class="briefing-signal-rank">${i+1}</span>
              <div class="briefing-signal-body">
                <div class="briefing-signal-meta">
                  <span class="briefing-card__account" style="font-size:12px;">${esc(item.account)}</span>
                  <span class="badge ${sig.cls}" style="font-size:10px;">${sig.label}</span>
                  ${item.source ? `<span style="font-size:11px;color:#9ca3af;">${esc(item.source)}</span>` : ''}
                </div>
                <a class="briefing-signal-title" href="${esc(item.url||'#')}" target="_blank" rel="noopener">${esc(item.title)}</a>
              </div>
              <span class="briefing-signal-score" title="IBM relevance score">${item.ibmScore}</span>
            </div>`;
          }).join('');
        }
      }
    }

    // ── Badge on Manager View button ──────────────────────────────
    function updateWatchlistBadge() {
      const digest   = mgrLS('mgrWatchlistDigest', []);
      const lastSeen = mgrLS('mgrWatchlistLastSeen', 0);
      // Badge = number of high-signal articles unseen since last visit
      const newCount = digest.filter(d => d.ts > lastSeen && scoreArticle(d.title) >= 4).length;
      const btn = document.getElementById('manager-dashboard-toggle');
      if (!btn) return;
      let badge = btn.querySelector('.mgr-badge');
      if (newCount > 0) {
        if (!badge) { badge = document.createElement('span'); badge.className = 'mgr-badge'; btn.appendChild(badge); }
        badge.textContent = newCount;
      } else {
        if (badge) badge.remove();
      }
    }

    // ── Last-fetched label ────────────────────────────────────────
    function updateLastFetchedLabel() {
      const el = document.getElementById('watchlist-last-fetched');
      if (!el) return;
      const lastFetch = mgrLS('mgrWatchlistLastFetch', 0);
      if (!lastFetch) { el.textContent = ''; return; }
      const mins = Math.round((Date.now() - lastFetch) / 60000);
      el.textContent = mins < 2 ? 'Updated just now' : `Updated ${mins}m ago`;
    }

    // ── Fetch news for a single account via Serper /news ─────────
    async function fetchNewsForAccount(account) {
      try {
        const resp = await fetch('https://google.serper.dev/news', {
          method: 'POST',
          headers: { 'X-API-KEY': '<YOUR_SERPER_API_KEY>', 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: account, num: 6, gl: 'us', hl: 'en' })
        });
        if (!resp.ok) throw new Error(`Serper /news: ${resp.status}`);
        const data = await resp.json();
        const articles = (data.news || []).slice(0, 6);
        if (articles.length === 0) return;
        const now = Date.now();
        const newItems = articles.map(a => ({
          account,
          title:  a.title  || '(No title)',
          url:    a.link   || '#',
          source: a.source || '',
          date:   a.date   || '',
          ts:     now
        }));
        const existing = mgrLS('mgrWatchlistDigest', []).filter(d => d.account !== account);
        mgrLSSave('mgrWatchlistDigest', [...newItems, ...existing].slice(0, 300));
        mgrLSSave('mgrWatchlistLastFetch', now);
      } catch (err) {
        console.error('News fetch error for', account, err);
      }
    }

    // ── Fetch news for ALL monitored accounts ─────────────────────
    async function fetchWatchlistNews(force) {
      const watchlist = mgrLS('mgrWatchlist', []);
      if (watchlist.length === 0) return;
      const lastFetch = mgrLS('mgrWatchlistLastFetch', 0);
      if (!force && Date.now() - lastFetch < 30 * 60 * 1000) {
        updateWatchlistBadge();
        updateLastFetchedLabel();
        return;
      }
      for (const w of watchlist) await fetchNewsForAccount(w.account);
      updateWatchlistBadge();
      updateLastFetchedLabel();
      renderBriefing();
      renderWatchlist();
    }

    // ── Wire form buttons ─────────────────────────────────────────
    const addWlBtn     = document.getElementById('add-watchlist-btn');
    const wlForm       = document.getElementById('watchlist-add-form');
    const wlCancel     = document.getElementById('watchlist-add-cancel');
    const wlSave       = document.getElementById('watchlist-add-save');
    const wlRefreshBtn = document.getElementById('watchlist-refresh-btn');

    if (addWlBtn && wlForm) addWlBtn.addEventListener('click', () => {
      wlForm.style.display = wlForm.style.display === 'none' ? 'block' : 'none';
    });
    if (wlCancel && wlForm) wlCancel.addEventListener('click', () => { wlForm.style.display = 'none'; });

    if (wlSave) wlSave.addEventListener('click', async () => {
      const account  = document.getElementById('watchlist-account-input')?.value.trim();
      const seller   = document.getElementById('watchlist-seller-input')?.value.trim();
      const priority = document.getElementById('watchlist-priority-select')?.value || 'medium';
      if (!account) { alert('Please enter an account name.'); return; }
      const wl = mgrLS('mgrWatchlist', []);
      if (wl.some(w => w.account.toLowerCase() === account.toLowerCase())) {
        alert(`${account} is already being monitored.`); return;
      }
      wl.push({ account, seller, priority, added: Date.now() });
      mgrLSSave('mgrWatchlist', wl);
      if (wlForm) wlForm.style.display = 'none';
      const inp = document.getElementById('watchlist-account-input');
      if (inp) inp.value = '';
      showNotif(`${account} added — fetching news…`);
      await fetchNewsForAccount(account);
      renderWatchlist();
      renderBriefing();
      updateWatchlistBadge();
      showNotif(`${account} added to briefing`);
    });

    if (wlRefreshBtn) wlRefreshBtn.addEventListener('click', async () => {
      const watchlist = mgrLS('mgrWatchlist', []);
      if (watchlist.length === 0) { showNotif('No accounts being monitored'); return; }
      wlRefreshBtn.disabled = true;
      const orig = wlRefreshBtn.innerHTML;
      wlRefreshBtn.innerHTML = 'Refreshing…';
      await fetchWatchlistNews(true);
      wlRefreshBtn.disabled = false;
      wlRefreshBtn.innerHTML = orig;
      showNotif('Briefing refreshed');
    });

    // Mark seen when briefing tab is opened
    document.querySelectorAll('.manager-tab[data-tab="watchlist"]').forEach(t => {
      t.addEventListener('click', () => {
        mgrLSSave('mgrWatchlistLastSeen', Date.now());
        updateWatchlistBadge();
      });
    });

    // ── boot ──────────────────────────────────────────────────────────────────
    // On page load: update badge and kick off background news fetch
    updateWatchlistBadge();
    injectPlaybookQuestions();
    fetchWatchlistNews();
  }

  // ── helper used in manager coverage table ─────────────────────────────────
  function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Session logging: called from handleGenerateClick ─────────────────────
  function logCoverageSession(questionCard) {
    try {
      const qNum    = questionCard.querySelector('.question-card__number')?.textContent?.trim() || '';
      const pillar  = questionCard.getAttribute('data-pillar-question') || '';
      const section = pillar ? 3 : 2;
      const session = {
        account:  state.customerName || 'Unknown',
        industry: state.industry     || '',
        pillar:   pillar             || '',
        qNum,
        section,
        seller:   '',
        ts: Date.now()
      };
      const sessions = JSON.parse(localStorage.getItem('mgrSessions') || '[]');
      sessions.push(session);
      // Keep last 500 sessions
      if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
      localStorage.setItem('mgrSessions', JSON.stringify(sessions));
    } catch {}
  }

  // ============================================================
  //  SECTION 10 — VISUALISATION  (Gemini 2.5 Flash image generation)
  // ============================================================

  function initVisualisationSection() {
    const topicSel    = document.getElementById('vis-topic');
    const styleSel    = document.getElementById('vis-style');
    const customTa    = document.getElementById('vis-custom');
    const pillsWrap   = document.getElementById('vis-product-pills');
    const promptTa    = document.getElementById('vis-prompt-editable');  // editable full prompt
    const resetBtn    = document.getElementById('vis-prompt-reset-btn');
    const generateBtn = document.getElementById('vis-generate-btn');
    const regenBtn    = document.getElementById('vis-regenerate-btn');
    const copyPromBtn = document.getElementById('vis-copy-prompt-btn');
    const downloadBtn = document.getElementById('vis-download-btn');
    const outputWrap  = document.getElementById('vis-output');
    const outputImg   = document.getElementById('vis-output-img');
    const loadingWrap = document.getElementById('vis-loading');

    if (!generateBtn) return;

    // ── Topic label map ──────────────────────────────────────────
    const TOPIC_LABELS = {
      'hybrid-cloud':      'Hybrid Cloud Architecture',
      'app-modernization': 'Application Modernization Journey',
      'data-platform':     'Data & AI Platform Architecture',
      'integration':       'Integration & API Management Architecture',
      'security':          'Zero Trust Security Architecture',
      'roi':               'ROI & Business Value Framework',
      'maturity':          'Technology Maturity Model',
      'roadmap':           'Modernization Roadmap',
      'tbm':               'Technology Business Management Overview',
      'before-after':      'Before / After Transformation',
      'decision-flow':     'Discovery Decision Flow',
      'custom':            'Custom Diagram'
    };

    const STYLE_LABELS = {
      'executive':      'executive presentation slide — clean, bold typography, IBM blue colour palette, minimal text, suitable for C-suite audience',
      'technical':      'detailed technical architecture diagram — boxes for each component, labelled connectors and data flows, technical notation',
      'infographic':    'colourful infographic — icons, statistics, callout boxes, visually engaging, suitable for a leave-behind document',
      'flowchart':      'structured flowchart — decision diamonds, process rectangles, clear directional arrows, logical left-to-right or top-to-bottom flow',
      'roadmap-visual': 'horizontal timeline roadmap — phases, milestones, colour-coded swim lanes, quarter/year labels'
    };

    // Track whether user has manually edited the prompt textarea
    let userEditedPrompt = false;

    // ── Product pill toggle ──────────────────────────────────────
    const selectedProducts = new Set();
    if (pillsWrap) {
      pillsWrap.querySelectorAll('.vis-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const product = pill.dataset.product;
          if (selectedProducts.has(product)) {
            selectedProducts.delete(product);
            pill.classList.remove('active');
          } else {
            selectedProducts.add(product);
            pill.classList.add('active');
          }
          // Only auto-update prompt if user hasn't manually edited it
          if (!userEditedPrompt) syncPromptTextarea();
        });
      });
    }

    // ── Keyword map: product → signals to look for in research text ──
    const PRODUCT_SIGNALS = [
      {
        product: 'watsonx.ai',
        keywords: ['generative ai','gen ai','large language model','llm','machine learning','ai model',
                   'natural language','virtual assistant','chatbot','ai platform','foundation model',
                   'intelligent automation','ai-powered','artificial intelligence']
      },
      {
        product: 'watsonx.data',
        keywords: ['data lake','data platform','data mesh','data fabric','lakehouse','data warehouse',
                   'data governance','data management','analytical platform','data strategy',
                   'structured data','unstructured data','data modernization']
      },
      {
        product: 'watsonx.governance',
        keywords: ['ai governance','model risk','responsible ai','ai compliance','bias detection',
                   'model monitoring','regulatory','explainability','audit trail','ai policy',
                   'model lifecycle','risk management','ai regulation']
      },
      {
        product: 'IBM Cloud Pak for Integration',
        keywords: ['integration','api management','event streaming','kafka','message broker',
                   'esb','enterprise service bus','microservices integration','app connect',
                   'mulesoft','mq','hybrid integration','api gateway','middleware']
      },
      {
        product: 'IBM Cloud Pak for Automation',
        keywords: ['business automation','workflow automation','robotic process','rpa','decision management',
                   'business rules','content management','document processing','low-code','process mining',
                   'operational efficiency','straight-through processing']
      },
      {
        product: 'IBM OpenShift',
        keywords: ['openshift','kubernetes','containerization','container platform','microservices',
                   'cloud-native','devops','ci/cd','application modernization','refactoring',
                   'legacy modernization','lift and shift','re-platform']
      },
      {
        product: 'IBM Instana',
        keywords: ['observability','apm','application performance','monitoring','tracing',
                   'distributed tracing','sre','site reliability','latency','incident',
                   'mean time to resolution','mttr','full-stack observability','alerting']
      },
      {
        product: 'IBM Turbonomic',
        keywords: ['cost optimization','cloud cost','finops','resource utilization','rightsizing',
                   'capacity planning','cloud spend','waste reduction','infrastructure cost',
                   'performance assurance','autonomous management','workload placement']
      },
      {
        product: 'IBM Ansible Automation Platform',
        keywords: ['ansible','infrastructure automation','it automation','configuration management',
                   'patch management','compliance automation','network automation','hybrid automation',
                   'runbook','playbook','infrastructure as code','iac','provisioning']
      },
      {
        product: 'IBM MQ',
        keywords: ['message queue','messaging','reliable messaging','transactional messaging',
                   'financial messaging','swift','payment','high availability messaging',
                   'guaranteed delivery','asynchronous','decoupling']
      },
      {
        product: 'IBM Cloud',
        keywords: ['ibm cloud','public cloud','hybrid cloud','cloud strategy','multi-cloud',
                   'cloud migration','cloud infrastructure','vpc','cloud security posture',
                   'regulated cloud','financial services cloud']
      },
      {
        product: 'IBM Maximo',
        keywords: ['asset management','enterprise asset','eam','iot','predictive maintenance',
                   'condition monitoring','facilities management','field service','work order',
                   'maintenance planning','operational technology','ot']
      }
    ];

    // ── Score all products against the full research corpus ──────
    function scoreProductsFromResearch() {
      // Collect all generated response text from Sections 2 & 3
      const allText = Object.values(state.generatedResponses || {})
        .join(' ')
        .toLowerCase();

      if (!allText.trim()) return [];

      const scores = PRODUCT_SIGNALS.map(({ product, keywords }) => {
        let score = 0;
        for (const kw of keywords) {
          // Count occurrences — repeated mentions increase confidence
          const matches = allText.split(kw).length - 1;
          if (matches > 0) score += Math.min(matches, 3); // cap at 3 per keyword
        }
        return { product, score };
      });

      return scores
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    // ── Auto-select products driven by research intelligence ─────
    function autoSelectPillarProducts() {
      // Don't overwrite if seller has already made manual selections
      if (selectedProducts.size > 0) return;

      const scored = scoreProductsFromResearch();

      let chosen = [];
      if (scored.length > 0) {
        // Take top 3 scoring products — these are what the research actually surfaced
        chosen = scored.slice(0, 3).map(s => s.product);
      } else {
        // No research data yet — fall back to sensible pillar defaults
        const pillar = state.selectedPillar || '';
        const defaults = {
          'application-modernization':      ['IBM OpenShift', 'IBM Cloud Pak for Integration', 'IBM Instana'],
          'infrastructure-automation':      ['IBM Ansible Automation Platform', 'IBM Turbonomic', 'IBM Instana'],
          'technology-business-management': ['IBM Turbonomic', 'IBM Cloud', 'IBM Instana']
        };
        chosen = defaults[pillar] || [];
      }

      if (chosen.length === 0) return;

      chosen.forEach(p => {
        selectedProducts.add(p);
        pillsWrap?.querySelectorAll('.vis-pill').forEach(pill => {
          if (pill.dataset.product === p) {
            pill.classList.add('active');
            // Show a tooltip explaining why this product was selected
            if (scored.length > 0) {
              const match = scored.find(s => s.product === p);
              if (match) pill.title = `Selected based on your research (signal strength: ${match.score})`;
            }
          }
        });
      });

      // Show a subtle indicator that products were research-driven
      if (scored.length > 0 && pillsWrap) {
        const existing = pillsWrap.querySelector('.vis-research-signal');
        if (!existing) {
          const note = document.createElement('span');
          note.className = 'vis-research-signal';
          note.textContent = '✦ Pre-selected from your research';
          note.title = 'These products were highlighted based on keywords found in your Section 2 & 3 research responses';
          pillsWrap.parentElement?.appendChild(note);
        }
      }

      syncPromptTextarea();
    }

    // ── Assemble the Gemini prompt from form inputs ──────────────
    function assemblePrompt() {
      const customer   = state.customerName || 'the customer';
      const industry   = state.industry ? state.industry.replace(/-/g, ' ') : 'technology';
      const topicVal   = topicSel?.value || '';
      const topicLabel = TOPIC_LABELS[topicVal] || topicVal || 'architecture diagram';
      const styleVal   = styleSel?.value || 'executive';
      const styleDesc  = STYLE_LABELS[styleVal] || styleVal;
      const products   = selectedProducts.size > 0
        ? Array.from(selectedProducts).join(', ')
        : 'IBM products';
      const custom     = customTa?.value.trim() || '';

      let prompt = `Create a professional, high-quality ${topicLabel} diagram for ${customer}, a ${industry} company.

Visual style: ${styleDesc}.

IBM products to prominently feature: ${products}.

The diagram must clearly show how these IBM products integrate with ${customer}'s existing environment and deliver business value specific to the ${industry} industry.

Design requirements:
- White or very light background
- IBM blue (#0F62FE) as the primary accent colour
- Clear, readable labels on all components
- Professional business presentation quality
- Logical grouping of related components using bordered sections or swim lanes
- Directional arrows showing data or process flow`;

      if (custom) {
        prompt += `\n\nAdditional instructions from the seller: ${custom}`;
      }

      return prompt.trim();
    }

    // ── Push assembled prompt into editable textarea ─────────────
    // Only overwrites if user hasn't manually edited, or on explicit reset
    function syncPromptTextarea(force) {
      if (!promptTa) return;
      if (force || !userEditedPrompt) {
        promptTa.value = assemblePrompt();
        if (force) {
          userEditedPrompt = false;
          promptTa.classList.remove('vis-prompt-editable--modified');
        }
      }
    }

    // Wire form inputs → auto-sync (when user hasn't taken over)
    topicSel?.addEventListener('change', () => { if (!userEditedPrompt) syncPromptTextarea(); });
    styleSel?.addEventListener('change', () => { if (!userEditedPrompt) syncPromptTextarea(); });
    customTa?.addEventListener('input',  () => { if (!userEditedPrompt) syncPromptTextarea(); });

    // Mark as user-edited as soon as they type in the textarea
    promptTa?.addEventListener('input', () => {
      userEditedPrompt = true;
      promptTa.classList.add('vis-prompt-editable--modified');
    });

    // Reset button restores auto-assembled prompt
    resetBtn?.addEventListener('click', () => {
      syncPromptTextarea(true);
      showNotification('Prompt reset to auto-assembled version');
    });

    // ── Core generate function ───────────────────────────────────
    async function runGenerate() {
      // Use the textarea content — this is the single source of truth
      const prompt = promptTa?.value.trim() || assemblePrompt();

      if (!prompt) {
        alert('Please select a diagram topic first.');
        topicSel?.focus();
        return;
      }

      // UI: loading state
      if (outputWrap)  outputWrap.style.display  = 'none';
      if (loadingWrap) loadingWrap.style.display = 'flex';
      generateBtn.disabled = true;
      if (regenBtn) regenBtn.disabled = true;

      try {
        if (!window.ResearchAPI?.generateDiagram) {
          throw new Error('Gemini API not available. Please refresh the page.');
        }
        const { imageBase64, mimeType } = await window.ResearchAPI.generateDiagram(prompt);

        const dataUrl = `data:${mimeType};base64,${imageBase64}`;
        if (outputImg)   outputImg.src = dataUrl;
        if (outputWrap)  outputWrap.style.display = 'block';
        if (downloadBtn) downloadBtn.style.display = '';

        outputImg.dataset.downloadUrl = dataUrl;
        const diagramTopic = topicSel?.options[topicSel.selectedIndex]?.text || 'diagram';
        outputImg.dataset.topic = diagramTopic;

        // ── Account Memory: log visualisation ──
        if (window.AccountMemory && state.customerName) {
          const style = styleSel?.options[styleSel.selectedIndex]?.text || '';
          window.AccountMemory.logActivity(
            state.customerName,
            'visualisation',
            `"${diagramTopic}" diagram generated${style ? ' (' + style.split(' ')[0] + ')' : ''}`,
            { topic: diagramTopic }
          );
        }

        showNotification('✓ Diagram generated');
      } catch (err) {
        console.error('Visualisation error:', err);
        if (outputWrap) {
          outputWrap.style.display = 'block';
          const wrap = outputWrap.querySelector('.vis-output__image-wrap');
          if (wrap) wrap.innerHTML = `<p style="color:#ef4444;font-size:13px;padding:12px;">${err.message}</p>`;
        }
      } finally {
        if (loadingWrap) loadingWrap.style.display = 'none';
        generateBtn.disabled = false;
        if (regenBtn) regenBtn.disabled = false;
      }
    }

    // ── Wire buttons ─────────────────────────────────────────────
    generateBtn.addEventListener('click', runGenerate);
    regenBtn?.addEventListener('click', runGenerate);

    copyPromBtn?.addEventListener('click', () => {
      const text = promptTa?.value || assemblePrompt();
      navigator.clipboard.writeText(text).then(() => {
        showNotification('Prompt copied to clipboard');
      }).catch(() => window.prompt('Copy this prompt:', text));
    });

    downloadBtn?.addEventListener('click', () => {
      const url      = outputImg?.dataset.downloadUrl;
      const topic    = (outputImg?.dataset.topic || 'diagram').replace(/\s+/g, '-').toLowerCase();
      const customer = (state.customerName || 'diagram').replace(/\s+/g, '-').toLowerCase();
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.download = `${customer}-${topic}.png`;
      a.click();
    });

    // ── "Add to Email" button (Section 9 toolbar) ────────────────
    const addToEmailBtn = document.getElementById('vis-add-to-email-btn');
    if (addToEmailBtn) {
      addToEmailBtn.addEventListener('click', () => {
        insertDiagramIntoEmail(outputImg?.dataset.downloadUrl, outputImg?.dataset.topic);
      });
    }

    // ── Auto-select products once pillar is selected ─────────────
    document.querySelectorAll('.pillar-pill').forEach(pill => {
      pill.addEventListener('click', () => setTimeout(autoSelectPillarProducts, 150));
    });
    if (state.selectedPillar) setTimeout(autoSelectPillarProducts, 200);
  }

  // ── Shared helper: insert diagram into Section 10 email body ───
  function insertDiagramIntoEmail(dataUrl, topic) {
    if (!dataUrl) {
      showNotification('No diagram generated yet — generate one in Section 9 first');
      return;
    }
    const emailBody = document.getElementById('email-content-body');
    if (!emailBody) return;

    // Remove any previously inserted diagram block
    const existing = emailBody.querySelector('.email-diagram-block');
    if (existing) existing.remove();

    const topicLabel = topic || 'Architecture Diagram';
    const block = document.createElement('div');
    block.className = 'email-diagram-block';
    block.innerHTML = `
      <div class="email-diagram-block__header">
        <span class="email-diagram-block__label">📊 ${topicLabel}</span>
        <button class="email-diagram-block__remove" title="Remove diagram from email">✕ Remove</button>
      </div>
      <img src="${dataUrl}" alt="${topicLabel}" class="email-diagram-block__img" />
      <p class="email-diagram-block__note">Note: inline images may not render in all email clients. Attach the PNG separately if needed.</p>`;

    // Insert before the closing paragraph / sign-off
    const closing = emailBody.querySelector('.email-closing');
    if (closing) {
      emailBody.insertBefore(block, closing);
    } else {
      emailBody.appendChild(block);
    }

    block.querySelector('.email-diagram-block__remove').addEventListener('click', () => {
      block.remove();
      showNotification('Diagram removed from email');
    });

    // Scroll email section into view
    document.getElementById('section-email')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showNotification('✓ Diagram added to email — scroll to Section 10');
  }

  // ============================================================
  //  ACCOUNT MEMORY — switcher, timeline, pillar coverage
  // ============================================================

  /**
   * If AccountMemory has saved opportunities for the current account,
   * restore them into Section 4 via OpportunitiesModule.
   */
  function backfillNotesActivity(customerName) {
    if (!window.AccountMemory || !customerName) return;
    const account    = window.AccountMemory.getAccount(customerName);
    const noteValues = Object.values(account.sellerNotes || {}).filter(n => n && n.trim());
    if (noteValues.length === 0) return;
    const alreadyLogged = (account.activityLog || []).some(e => e.type === 'notes');
    if (alreadyLogged) return;
    window.AccountMemory.logActivity(
      customerName,
      'notes',
      `${noteValues.length} seller note${noteValues.length !== 1 ? 's' : ''} recorded across research questions`,
      { count: noteValues.length }
    );
  }

  function restoreOpportunitiesIfSaved(customerName) {
    if (!customerName) return;
    if (window.OpportunitiesModule?.restoreSavedOpportunities) {
      window.OpportunitiesModule.restoreSavedOpportunities(customerName);
    }
  }

  function initAccountMemory() {
    if (!window.AccountMemory) return;

    // ── 0. One-time startup cleanup ─────────────────────────────
    (function startupCleanup() {
      const accounts = window.AccountMemory.allAccounts
        ? window.AccountMemory.allAccounts()
        : JSON.parse(localStorage.getItem('pbAccounts') || '{}');
      const active = window.AccountMemory.getActiveKey();
      let changed  = false;

      // a) Remove demo/placeholder accounts
      const DEMO_KEYS = ['acme', 'acme-corp', 'ibm', 'texas-instruments', 'texas-inst'];
      DEMO_KEYS.forEach(k => {
        if (accounts[k]) {
          delete accounts[k];
          changed = true;
          if (active === k) localStorage.removeItem('pbActiveAccount');
        }
      });

      // b) Note contamination cleanup is handled via one-time console migration.
      //    The code-level fix (data-account-owner stamping) prevents future
      //    cross-account contamination. No automated heuristic runs here.

      // c) For any account whose sellerNotes were wiped clean by (b),
      //    also remove the stale 'notes' activity log entry so the
      //    Activity Summary doesn't show a phantom count.
      Object.entries(accounts).forEach(([key, acct]) => {
        const noteCount = Object.keys(acct.sellerNotes || {}).length;
        const logIdx    = (acct.activityLog || []).findIndex(e => e.type === 'notes');
        if (logIdx !== -1) {
          if (noteCount === 0) {
            acct.activityLog.splice(logIdx, 1);
            changed = true;
          } else {
            // Update count to match reality
            const entry = acct.activityLog[logIdx];
            const correct = `${noteCount} seller note${noteCount !== 1 ? 's' : ''} recorded across research questions`;
            if (entry.summary !== correct) {
              entry.summary    = correct;
              entry.meta.count = noteCount;
              changed = true;
            }
          }
        }
      });

      if (changed) localStorage.setItem('pbAccounts', JSON.stringify(accounts));
    })();

    // ── 0b. Remove stub accounts created by partial keystrokes ───
    window.AccountMemory.prunePartialAccounts();

    // ── 1. Restore last active account on page load ──────────────
    const lastActive = window.AccountMemory.getActiveKey();
    if (lastActive) {
      const accounts = window.AccountMemory.listAccounts();
      const match    = accounts.find(
        n => window.AccountMemory.normalise(n) === lastActive
      );
      if (match && match !== state.customerName) {
        window.AccountMemory.restoreAccount(match, state, elements);
        if (elements.customerNameInput) {
          elements.customerNameInput.value = match;
          state.customerName = match;
          updateCustomerNameDisplays();
        }
        // Restore generated responses into DOM
        restoreResponsesFromState();
        // Restore saved opportunities into Section 4
        restoreOpportunitiesIfSaved(match);
        backfillNotesActivity(match);
        // Restore revealed state on page load
        const loadedAccount = window.AccountMemory.getAccount(match);
        if (loadedAccount?.sectionsRevealed) {
          document.querySelectorAll('.section.hidden-until-pillar').forEach(s => {
            s.classList.remove('hidden-until-pillar');
            s.classList.add('revealed');
          });
        }
      }
    }

    // ── 2. Build account switcher in the header ──────────────────
    renderAccountSwitcher();

    // ── 3. Build pillar coverage strip ──────────────────────────
    renderPillarCoverage();

    // ── 4. Build account timeline ────────────────────────────────
    renderAccountTimeline();

    // ── 5. Hook into generate to log sessions ────────────────────
    //    Patch handleGenerateClick post-save via MutationObserver on
    //    response fields appearing — fires after every successful generate
    // Re-render timeline whenever any activity is logged (opportunities, emails, etc.)
    document.addEventListener('pb:activityLogged', () => {
      renderAccountTimeline();
    });

    document.addEventListener('pb:responseSaved', (e) => {
      const { customerName, pillar, questionId, responseText } = e.detail || {};
      if (!customerName) return;
      window.AccountMemory.logSession(
        customerName, pillar || '', 1, { [questionId]: responseText }
      );
      renderPillarCoverage();
      renderAccountTimeline();
      renderAccountSwitcher();
    });

    // ── 6. Re-render on customer name change ─────────────────────
    if (elements.customerNameInput) {
      elements.customerNameInput.addEventListener('change', () => {
        const name = elements.customerNameInput.value.trim();
        if (!name) return;
        // Save current account before switching
        if (state.customerName && state.customerName !== name) {
          window.AccountMemory.snapshotCurrentState(state);
        }
        state.customerName = name;
        window.AccountMemory.setActiveKey(name);
        // Restore any saved data for new account
        const restored = window.AccountMemory.restoreAccount(name, state, elements);
        if (restored) {
          if (restored.industry && elements.industrySelect) {
            elements.industrySelect.value = restored.industry;
            state.industry = restored.industry;
          }
          restoreResponsesFromState();
        }
        restoreOpportunitiesIfSaved(name);
        backfillNotesActivity(name);
        renderAccountSwitcher();
        renderPillarCoverage();
        renderAccountTimeline();
      });
    }
  }

  // ── Restore generated response text into DOM text areas ──────────
  function restoreResponsesFromState() {
    if (!state.generatedResponses) return;
    document.querySelectorAll('.question-card').forEach(card => {
      const num   = card.querySelector('.question-card__number')?.textContent?.trim();
      if (!num) return;
      const saved = state.generatedResponses[num];
      if (!saved) return;
      const field     = card.querySelector('.response-field');
      const container = card.querySelector('.question-card__response');
      if (field && container) {
        field.value             = saved;
        container.style.display = 'block';
      }
    });
  }

  // ── Account switcher dropdown ─────────────────────────────────
  function renderAccountSwitcher() {
    if (!window.AccountMemory) return;
    const accounts = window.AccountMemory.listAccounts();

    let switcher = document.getElementById('account-switcher-wrap');
    if (!switcher) {
      switcher = document.createElement('div');
      switcher.id        = 'account-switcher-wrap';
      switcher.className = 'account-switcher-wrap';
      // Insert after the customer-name input, inside Section 1 content
      const sec1Content = document.querySelector('#section-customer .section__content');
      if (sec1Content) sec1Content.appendChild(switcher);
    }

    if (accounts.length < 2) {
      switcher.style.display = 'none';
      return;
    }

    switcher.style.display = '';
    const allRevealed = !document.querySelector('.section.hidden-until-pillar');
    switcher.innerHTML = `
      <label class="account-switcher__label">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-1px;">
          <circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M1 11.5c0-2.485 2.462-4 5.5-4s5.5 1.515 5.5 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Recent accounts:
      </label>
      <div class="account-switcher__pills">
        ${accounts.slice(0, 8).map(name => {
          const active = window.AccountMemory.normalise(name) === window.AccountMemory.getActiveKey();
          return `<button class="account-pill${active ? ' account-pill--active' : ''}"
                    data-account="${escHtml(name)}"
                    title="Switch to ${escHtml(name)}">${escHtml(name)}</button>`;
        }).join('')}
      </div>
      ${!allRevealed ? `<button class="show-all-sections-btn" id="show-all-sections-btn" title="Reveal all sections without selecting a pillar">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;">
          <path d="M1 4h11M1 7h11M1 10h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Show all sections
      </button>` : ''}`;

    const showAllBtn = document.getElementById('show-all-sections-btn');
    if (showAllBtn) showAllBtn.addEventListener('click', revealAllSections);

    switcher.querySelectorAll('.account-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.account;
        if (!name || name === state.customerName) return;
        // Save current, then clear DOM before switching
        window.AccountMemory.snapshotCurrentState(state);
        clearAllSections();
        // Switch — touch lastVisited so the prune window resets
        state.customerName = name;
        window.AccountMemory.setActiveKey(name);
        const _touchAcct = window.AccountMemory.getAccount(name);
        if (_touchAcct) window.AccountMemory.saveAccount(name, _touchAcct);
        const restored = window.AccountMemory.restoreAccount(name, state, elements);
        if (elements.customerNameInput) elements.customerNameInput.value = name;
        updateCustomerNameDisplays();
        if (restored?.industry && elements.industrySelect) {
          elements.industrySelect.value = restored.industry;
          state.industry = restored.industry;
        }
        restoreResponsesFromState();
        restoreOpportunitiesIfSaved(name);
        backfillNotesActivity(name);
        renderAccountSwitcher();
        renderPillarCoverage();
        renderAccountTimeline();
        // Re-trigger pillar reveal if one was selected (no scroll — user didn't ask to go there)
        if (restored?.selectedPillar) {
          const pill = document.querySelector(`[data-pillar="${restored.selectedPillar}"]`);
          if (pill) { _suppressPillarScroll = true; pill.click(); }
        }
        // If seller had previously revealed all sections for this account, restore that state
        if (restored?.sectionsRevealed) {
          document.querySelectorAll('.section.hidden-until-pillar').forEach(s => {
            s.classList.remove('hidden-until-pillar');
            s.classList.add('revealed');
          });
          renderAccountSwitcher();
        }
        showNotification(`✓ Switched to ${name}`);
      });
    });
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Pillar coverage strip ─────────────────────────────────────
  function renderPillarCoverage() {
    if (!window.AccountMemory || !state.customerName) return;
    const account = window.AccountMemory.getAccount(state.customerName);

    const TOTALS = {
      'application-modernization':       8,
      'infrastructure-automation':      11,
      'technology-business-management':  6
    };
    const LABELS = {
      'application-modernization':      'App Modernization',
      'infrastructure-automation':      'Infrastructure Automation',
      'technology-business-management': 'Technology Business Mgmt'
    };

    let strip = document.getElementById('pillar-coverage-strip');
    if (!strip) {
      strip = document.createElement('div');
      strip.id        = 'pillar-coverage-strip';
      strip.className = 'pillar-coverage-strip';
      const pillarSection = document.getElementById('section-automation-pillars');
      if (!pillarSection) return;
      const content = pillarSection.querySelector('.section__content');
      if (content) content.insertBefore(strip, content.firstChild);
    }

    const rows = window.AccountMemory.PILLARS.map(p => {
      const cov     = account.pillarCoverage?.[p] || { count: 0, lastTouched: null };
      const total   = TOTALS[p];
      const count   = Math.min(cov.count, total);
      const pct     = Math.round((count / total) * 100);
      const date    = cov.lastTouched
        ? new Date(cov.lastTouched).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null;
      const dateStr  = date ? `· ${date}` : '';
      const notYet   = count === 0;
      const barColor = notYet ? '#DA1E28' : (pct >= 60 ? '#0F62FE' : '#F1C21B');
      const barOp    = notYet ? '0' : '1';
      return `
        <div class="pillar-cov-row">
          <div class="pillar-cov-row__label">${LABELS[p]}</div>
          <div class="pillar-cov-row__meta">${notYet
            ? '<span class="pillar-cov-row__meta--none">Not yet explored</span>'
            : `${count} / ${total} questions ${dateStr}`}
          </div>
          <div class="pillar-cov-row__bar-track">
            <div class="pillar-cov-row__bar-fill"
                 style="width:${pct}%;background:${barColor};opacity:${barOp === '0' ? 0.15 : 1};"></div>
          </div>
        </div>`;
    }).join('');

    // Only show when at least one pillar has been touched
    const anyCoverage = window.AccountMemory.PILLARS.some(
      p => (account.pillarCoverage?.[p]?.count || 0) > 0
    );
    if (!anyCoverage) {
      strip.style.display = 'none';
      return;
    }
    strip.style.display = '';
    strip.innerHTML = `
      <div class="pillar-coverage-strip__title">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-1px;">
          <rect x="1" y="7" width="3" height="5" rx="1" fill="currentColor"/>
          <rect x="5" y="4" width="3" height="8" rx="1" fill="currentColor"/>
          <rect x="9" y="1" width="3" height="11" rx="1" fill="currentColor"/>
        </svg>
        Pillar coverage — ${escHtml(state.customerName)} (all sessions)
      </div>
      ${rows}`;
  }

  // ── Account Timeline ──────────────────────────────────────────
  function renderAccountTimeline() {
    if (!window.AccountMemory || !state.customerName) return;
    const account  = window.AccountMemory.getAccount(state.customerName);
    const sessions = (account.sessions || []).slice().reverse(); // newest first

    let timelineEl = document.getElementById('account-timeline');
    if (!timelineEl) {
      timelineEl         = document.createElement('div');
      timelineEl.id      = 'account-timeline';
      timelineEl.className = 'account-timeline';
      const sec1Content  = document.querySelector('#section-customer .section__content');
      if (sec1Content) sec1Content.appendChild(timelineEl);
    }

    if (sessions.length === 0) {
      timelineEl.style.display = 'none';
      return;
    }
    timelineEl.style.display = '';

    const PILLAR_LABELS = {
      'application-modernization':      'App Mod',
      'infrastructure-automation':      'Infra',
      'technology-business-management': 'TBM',
      '':                               'Research'
    };
    const PILLAR_COLORS = {
      'application-modernization':      '#6929c4',
      'infrastructure-automation':      '#0F62FE',
      'technology-business-management': '#198038',
      '':                               '#525252'
    };

    const entries = sessions.slice(0, 6).map(s => {
      const d      = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const label  = PILLAR_LABELS[s.pillar] || 'Research';
      const color  = PILLAR_COLORS[s.pillar] || '#525252';
      const qs     = s.questionsAnswered;
      const qLabel = `${qs} question${qs !== 1 ? 's' : ''}`;
      const summary = s.sellerSummary
        ? `<div class="timeline-entry__summary">${escHtml(s.sellerSummary)}</div>` : '';
      const pillarFull = s.pillar
        ? s.pillar.replace(/-/g, ' ') : 'general research';

      return `
        <div class="timeline-entry">
          <div class="timeline-entry__date">${d}</div>
          <div class="timeline-entry__body">
            <div class="timeline-entry__title">${escHtml(pillarFull.charAt(0).toUpperCase() + pillarFull.slice(1))} — ${qLabel}</div>
            ${summary}
          </div>
          <span class="timeline-entry__tag" style="background:${color}1a;color:${color};border:1px solid ${color}40;">${label}</span>
        </div>`;
    }).join('');

    // Summary note input on the most-recent session
    const latestSession = sessions[0];
    const latestIdx     = (account.sessions || []).length - 1;

    // ── Activity log summary ──────────────────────────────────────
    const ACTIVITY_META = {
      opportunities: { label: 'Opportunities',        icon: '◆', color: '#0F62FE' },
      visualisation:  { label: 'Visualisation',       icon: '▣', color: '#6929c4' },
      email:          { label: 'Email sent',           icon: '✉', color: '#198038' },
      competitive:    { label: 'Competitive intel',    icon: '⚔', color: '#9e1a1a' },
      headlines:      { label: 'Tech headlines',       icon: '◉', color: '#b45309' },
      ibmProduct:     { label: 'IBM Product research', icon: '⬡', color: '#525252' },
      notes:          { label: 'Seller notes',         icon: '✎', color: '#0e7490' }
    };

    const activityLog = account.activityLog || [];
    const NAV_TYPES = new Set(['opportunities', 'visualisation']);
    const activityRows = activityLog.map(ev => {
      const m = ACTIVITY_META[ev.type] || { label: ev.type, icon: '•', color: '#525252' };
      const ts = ev.timestamp
        ? new Date(ev.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';
      const navAttr   = NAV_TYPES.has(ev.type) ? ` data-nav="${ev.type}" role="button" tabindex="0" title="Go to ${m.label} section ↗"` : '';
      const navArrow  = NAV_TYPES.has(ev.type) ? ` <span class="activity-log-entry__nav-arrow">↗</span>` : '';
      const navClass  = NAV_TYPES.has(ev.type) ? ' activity-log-entry--nav' : '';
      return `<div class="activity-log-entry${navClass}"${navAttr}>
          <span class="activity-log-entry__icon" style="color:${m.color}">${m.icon}</span>
          <div class="activity-log-entry__body">
            <span class="activity-log-entry__label" style="color:${m.color}">${m.label}${navArrow}</span>
            <span class="activity-log-entry__summary">${escHtml(ev.summary || '')}</span>
          </div>
          <span class="activity-log-entry__date">${ts}</span>
        </div>`;
    }).join('');

    const activitySection = activityLog.length ? `
      <div class="activity-log-section">
        <div class="activity-log-section__title">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style="vertical-align:-1px;">
            <path d="M5.5 1v4l2.5 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          Activity summary
        </div>
        ${activityRows}
      </div>` : '';

    timelineEl.innerHTML = `
      <div class="account-timeline__header">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-1px;">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M6.5 3.5v3l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        Account history — ${escHtml(state.customerName)}
        <button class="account-timeline__toggle" id="timeline-toggle-btn" aria-expanded="true">Hide ▲</button>
      </div>
      <div id="timeline-entries">
        ${entries}
        ${activitySection}
      </div>
      <div class="timeline-note-row" id="timeline-note-row">
        <input type="text"
               id="timeline-note-input"
               class="timeline-note-input"
               placeholder="Add a session note for today (e.g. 'CISO interested in Vault demo')…"
               value="${escHtml(latestSession?.sellerSummary || '')}"/>
        <button class="timeline-note-save" id="timeline-note-save">Save note</button>
      </div>`;

    // Toggle collapse
    document.getElementById('timeline-toggle-btn')?.addEventListener('click', (e) => {
      const entries = document.getElementById('timeline-entries');
      const noteRow = document.getElementById('timeline-note-row');
      const btn     = e.currentTarget;
      const hidden  = entries.style.display === 'none';
      entries.style.display = hidden ? '' : 'none';
      noteRow.style.display = hidden ? '' : 'none';
      btn.textContent       = hidden ? 'Hide ▲' : 'Show ▼';
      btn.setAttribute('aria-expanded', hidden ? 'true' : 'false');
    });

    // Activity log navigation — Opportunities & Visualisation are clickable
    timelineEl.addEventListener('click', (e) => {
      const entry = e.target.closest('[data-nav]');
      if (!entry) return;
      const target    = entry.dataset.nav;
      const sectionEl = document.getElementById(`section-${target}`);
      if (!sectionEl) return;

      // Check whether this is an existing account with saved responses
      const savedAccount   = window.AccountMemory ? window.AccountMemory.getAccount(state.customerName) : null;
      const savedResponses = savedAccount && savedAccount.generatedResponses
        ? Object.values(savedAccount.generatedResponses).filter(v => v && v.trim())
        : [];
      const isExistingAccount = savedResponses.length > 0;

      if (!isExistingAccount) {
        // New account — send seller to Section 2 to complete research first
        const sec2 = document.getElementById('section-research');
        if (sec2) sec2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showNotification('Complete Section 2 (Research Your Client) first, then return here ↗');
        return;
      }

      // Existing account — restore responses into DOM so guards pass
      Object.assign(state.generatedResponses, savedAccount.generatedResponses);
      restoreResponsesFromState();

      // Reveal section if still gated behind pillar selection
      if (sectionEl.classList.contains('hidden-until-pillar')) {
        sectionEl.classList.remove('hidden-until-pillar');
        sectionEl.classList.add('revealed');
      }

      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (target === 'opportunities') {
        const tbody   = document.getElementById('opportunities-table-body');
        const hasRows = tbody && tbody.querySelectorAll('tr').length > 0;
        if (!hasRows) {
          setTimeout(() => document.getElementById('generate-opportunities-btn')?.click(), 300);
        }
      }

      if (target === 'visualisation') {
        const topicSel = document.getElementById('vis-topic');
        if (topicSel && !topicSel.value) {
          topicSel.value = 'hybrid-cloud';
          topicSel.dispatchEvent(new Event('change'));
        }
        const outputImg = document.getElementById('vis-output-img');
        const hasImage  = outputImg && outputImg.src && !outputImg.src.endsWith('#') && outputImg.src !== window.location.href;
        if (!hasImage) {
          setTimeout(() => document.getElementById('vis-generate-btn')?.click(), 300);
        }
      }
    });

    // Keyboard support for nav entries
    timelineEl.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-nav]')) {
        e.preventDefault();
        e.target.closest('[data-nav]').click();
      }
    });

    // Save session note
    document.getElementById('timeline-note-save')?.addEventListener('click', () => {
      const note    = document.getElementById('timeline-note-input')?.value?.trim() || '';
      const accts   = window.AccountMemory;
      const account = accts.getAccount(state.customerName);
      if (account.sessions[latestIdx]) {
        account.sessions[latestIdx].sellerSummary = note;
        accts.saveAccount(state.customerName, account);
        showNotification('✓ Session note saved');
      }
    });
  }

})();

// Made with Bob
