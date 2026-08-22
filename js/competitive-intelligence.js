/**
 * Competitive Intelligence - Competitor Analysis and Battle Cards
 */

(function() {
  'use strict';

  // ============================================
  // COMPETITORS DATABASE
  // ============================================
  
  const COMPETITORS = {
    'aws': {
      name: 'Amazon Web Services (AWS)',
      category: 'Cloud Infrastructure',
      description: 'Leading cloud platform with extensive service catalog',
      marketShare: 'High',
      strengths: ['Market leader', 'Extensive services', 'Strong developer community', 'Global infrastructure'],
      weaknesses: ['Complex pricing', 'Limited hybrid cloud', 'Less industry focus', 'Vendor lock-in concerns']
    },
    'microsoft-azure': {
      name: 'Microsoft Azure',
      category: 'Cloud Infrastructure',
      description: 'Enterprise cloud platform with strong Microsoft integration',
      marketShare: 'High',
      strengths: ['Microsoft ecosystem', 'Hybrid cloud', 'Enterprise relationships', 'Active Directory integration'],
      weaknesses: ['Complex management', 'Pricing complexity', 'Learning curve', 'Regional limitations']
    },
    'google-cloud': {
      name: 'Google Cloud Platform (GCP)',
      category: 'Cloud Infrastructure',
      description: 'Cloud platform with strong AI/ML and data analytics',
      marketShare: 'Medium',
      strengths: ['AI/ML capabilities', 'Data analytics', 'Kubernetes expertise', 'Competitive pricing'],
      weaknesses: ['Smaller market share', 'Limited enterprise focus', 'Fewer services', 'Support concerns']
    },
    'oracle': {
      name: 'Oracle Cloud',
      category: 'Cloud & Database',
      description: 'Cloud platform with strong database and enterprise applications',
      marketShare: 'Medium',
      strengths: ['Database expertise', 'Enterprise applications', 'Autonomous database', 'Oracle ecosystem'],
      weaknesses: ['Limited cloud services', 'Aggressive licensing', 'Smaller ecosystem', 'Migration complexity']
    },
    'salesforce': {
      name: 'Salesforce',
      category: 'CRM & Platform',
      description: 'Leading CRM platform with extensive ecosystem',
      marketShare: 'High',
      strengths: ['CRM leader', 'AppExchange ecosystem', 'User-friendly', 'Strong community'],
      weaknesses: ['Expensive at scale', 'Customization complexity', 'Limited beyond CRM', 'Integration challenges']
    },
    'sap': {
      name: 'SAP',
      category: 'Enterprise Software',
      description: 'Enterprise resource planning and business applications',
      marketShare: 'High',
      strengths: ['ERP leader', 'Enterprise focus', 'Industry solutions', 'Global presence'],
      weaknesses: ['Complex implementation', 'High costs', 'Slow innovation', 'Legacy systems']
    },
    'servicenow': {
      name: 'ServiceNow',
      category: 'IT Service Management',
      description: 'Cloud-based IT service management and workflow automation',
      marketShare: 'High',
      strengths: ['ITSM leader', 'Workflow automation', 'User experience', 'Platform extensibility'],
      weaknesses: ['Expensive', 'Complex customization', 'Limited beyond ITSM', 'Vendor lock-in']
    },
    'splunk': {
      name: 'Splunk',
      category: 'Data Analytics & Security',
      description: 'Platform for searching, monitoring, and analyzing machine data',
      marketShare: 'Medium',
      strengths: ['Log analytics', 'Security focus', 'Real-time insights', 'Flexible platform'],
      weaknesses: ['High costs', 'Data volume pricing', 'Complex deployment', 'Learning curve']
    },
    'dynatrace': {
      name: 'Dynatrace',
      category: 'Application Performance Monitoring',
      description: 'AI-powered application performance monitoring and observability platform',
      marketShare: 'Medium',
      strengths: ['AI-powered insights', 'Full-stack monitoring', 'Automatic discovery', 'User experience monitoring'],
      weaknesses: ['High cost', 'Complex pricing model', 'Limited cloud optimization', 'Steep learning curve']
    },
    'datadog': {
      name: 'Datadog',
      category: 'Monitoring & Analytics',
      description: 'Cloud monitoring and analytics platform',
      marketShare: 'Medium',
      strengths: ['Easy to use', 'Wide integrations', 'Cloud-native', 'Good visualization'],
      weaknesses: ['Expensive at scale', 'Limited APM depth', 'Data retention costs', 'Less enterprise focus']
    },
    'new-relic': {
      name: 'New Relic',
      category: 'Application Performance Monitoring',
      description: 'Application performance monitoring and observability platform',
      marketShare: 'Medium',
      strengths: ['User-friendly', 'Good dashboards', 'Cloud monitoring', 'Developer focus'],
      weaknesses: ['Pricing complexity', 'Limited infrastructure monitoring', 'Less AI capabilities', 'Data ingestion costs']
    },
    'appdynamics': {
      name: 'AppDynamics (Cisco)',
      category: 'Application Performance Monitoring',
      description: 'Application performance management and IT operations analytics',
      marketShare: 'Medium',
      strengths: ['Business transaction monitoring', 'End-user monitoring', 'Cisco integration', 'Enterprise features'],
      weaknesses: ['Expensive', 'Complex setup', 'Cisco acquisition concerns', 'Limited cloud-native features']
    }
  };

  // ============================================
  // COMPARISON FEATURES
  // ============================================
  
  const COMPARISON_FEATURES = [
    { id: 'hybrid-cloud', name: 'Hybrid Cloud', ibmStrength: 'strong' },
    { id: 'ai-ml', name: 'AI/ML Platform', ibmStrength: 'strong' },
    { id: 'security', name: 'Enterprise Security', ibmStrength: 'strong' },
    { id: 'industry-focus', name: 'Industry Solutions', ibmStrength: 'strong' },
    { id: 'support', name: '24/7 Support', ibmStrength: 'strong' },
    { id: 'pricing', name: 'Transparent Pricing', ibmStrength: 'moderate' },
    { id: 'ecosystem', name: 'Partner Ecosystem', ibmStrength: 'moderate' },
    { id: 'innovation', name: 'Innovation Speed', ibmStrength: 'moderate' }
  ];

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const competitiveState = {
    selectedCompetitors: [],
    comparisonMatrix: null,
    battleCards: []
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================
  
  const elements = {
    searchInput: null,
    competitorTags: null,
    selectedCompetitorsDisplay: null,
    selectedCompetitorsList: null,
    competitorCount: null,
    clearAllBtn: null,
    comparisonMatrixContainer: null,
    comparisonMatrix: null,
    battleCardsContainer: null,
    battleCardsList: null,
    emptyState: null,
    competitiveResponseArea: null,
    competitiveQuestionText: null,
    competitiveResponseField: null,
    closeCompetitiveBtn: null
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  
  function init() {
    // Get DOM elements
    elements.searchInput = document.getElementById('competitor-search-input');
    elements.competitorTags = document.querySelectorAll('.competitor-tag');
    elements.selectedCompetitorsDisplay = document.getElementById('selected-competitors-display');
    elements.selectedCompetitorsList = document.getElementById('selected-competitors-list');
    elements.competitorCount = document.getElementById('competitor-count');
    elements.clearAllBtn = document.getElementById('clear-all-competitors');
    elements.comparisonMatrixContainer = document.getElementById('comparison-matrix-container');
    elements.comparisonMatrix = document.getElementById('comparison-matrix');
    elements.battleCardsContainer = document.getElementById('battle-cards-container');
    elements.battleCardsList = document.getElementById('battle-cards-list');
    elements.emptyState = document.getElementById('competitive-empty-state');
    elements.competitiveResponseArea = document.getElementById('competitive-response-area');
    elements.competitiveQuestionText = document.getElementById('competitive-question-text');
    elements.competitiveResponseField = document.getElementById('competitive-response-field');
    elements.closeCompetitiveBtn = document.getElementById('close-competitive-response');

    if (!elements.searchInput) {
      console.error('Competitive Intelligence: Required elements not found');
      return;
    }

    // Setup event listeners
    setupEventListeners();
    
    // Update customer context displays
    updateCustomerContext();
    
    console.log('Competitive Intelligence initialized');
  }

  function setupEventListeners() {
    // Search input - Enter key for NLP query
    if (elements.searchInput) {
      elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCompetitiveQuery();
        }
      });
    }

    // Close competitive response button
    if (elements.closeCompetitiveBtn) {
      elements.closeCompetitiveBtn.addEventListener('click', closeCompetitiveResponse);
    }

    // Competitor tag clicks (keep for Quick Access)
    elements.competitorTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const competitorId = tag.dataset.competitor;
        toggleCompetitor(competitorId);
      });
    });

    // Clear all button
    if (elements.clearAllBtn) {
      elements.clearAllBtn.addEventListener('click', clearAllCompetitors);
    }

    // Event delegation for dynamically created "Generate Full Battle Card" buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.generate-battle-card-btn')) {
        const button = e.target.closest('.generate-battle-card-btn');
        const competitorId = button.dataset.competitor;
        generateFullBattleCard(competitorId);
      }
    });
  }

  // ============================================
  // NLP QUERY HANDLING
  // ============================================

  function handleCompetitiveQuery() {
    const query = elements.searchInput.value.trim();
    
    if (!query) {
      return;
    }

    // Show response area
    elements.competitiveResponseArea.style.display = 'block';
    elements.competitiveQuestionText.textContent = query;
    elements.competitiveResponseField.value = 'Generating competitive analysis...';

    // Scroll to response
    elements.competitiveResponseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Generate response
    const response = generateCompetitiveResponse(query);
    elements.competitiveResponseField.value = response;

    // ── Account Memory: log competitive intel ──
    if (window.AccountMemory) {
      const customerName = document.getElementById('customer-name')?.value?.trim();
      if (customerName) {
        window.AccountMemory.logActivity(
          customerName,
          'competitive',
          `Competitive analysis — "${query.substring(0, 70)}${query.length > 70 ? '…' : ''}"`,
          { query }
        );
      }
    }
  }

  function closeCompetitiveResponse() {
    if (elements.competitiveResponseArea) {
      elements.competitiveResponseArea.style.display = 'none';
    }
  }

  function generateCompetitiveResponse(query) {
    const customerName = document.getElementById('customer-name')?.value || 'the customer';
    const industry = document.getElementById('industry')?.value || 'their industry';
    
    // Detect IBM products and competitors in the query
    const ibmProducts = detectIBMProducts(query);
    const competitors = detectCompetitors(query);
    
    let response = '';

    if (ibmProducts.length > 0 && competitors.length > 0) {
      // Specific product vs competitor comparison
      const ibmProduct = ibmProducts[0];
      const competitor = competitors[0];
      
      response = `Competitive Analysis: ${ibmProduct} vs. ${competitor.name}

For ${customerName} in the ${industry} sector:

IBM ${ibmProduct} STRENGTHS:
• Enterprise-grade security and compliance built-in
• Hybrid cloud architecture for flexibility
• Industry-specific solutions for ${industry}
• 24/7 global support with dedicated account teams
• Transparent, predictable pricing model
• Deep integration with existing IBM ecosystem

${competitor.name.toUpperCase()} CONSIDERATIONS:
${competitor.weaknesses.map(w => `• ${w}`).join('\n')}

KEY DIFFERENTIATORS:
1. Hybrid Cloud Leadership: IBM's approach allows ${customerName} to maintain control of sensitive data while leveraging cloud benefits
2. Industry Expertise: IBM has deep ${industry} experience with proven solutions
3. AI Integration: watsonx AI capabilities embedded across the platform
4. Security First: Built-in security vs. bolt-on solutions
5. Total Cost of Ownership: Better long-term value with included support and services

RECOMMENDED TALKING POINTS:
• "Unlike ${competitor.name}, IBM ${ibmProduct} is designed specifically for ${industry} requirements"
• "Our hybrid approach gives you flexibility that ${competitor.name}'s cloud-only model can't match"
• "IBM's 24/7 support and professional services are included, not add-ons"

DISCOVERY QUESTIONS TO ASK:
• "What challenges are you experiencing with ${competitor.name}?"
• "How important is ${industry}-specific compliance to your organization?"
• "What's your strategy for hybrid cloud deployment?"

OBJECTION HANDLING:
If they say "${competitor.name} is cheaper":
→ "Let's look at total cost of ownership including support, training, and integration. IBM typically shows 20-30% better TCO over 3 years."

If they say "${competitor.name} has more features":
→ "IBM focuses on enterprise-grade features that ${industry} companies actually need, not feature bloat. What specific capabilities are most important to you?"`;

    } else if (competitors.length > 0) {
      // General competitor analysis
      const competitor = competitors[0];
      
      response = `Competitive Intelligence: IBM vs. ${competitor.name}

For ${customerName} in the ${industry} sector:

${competitor.name.toUpperCase()} OVERVIEW:
${competitor.description}
Market Position: ${competitor.marketShare} market share
Category: ${competitor.category}

THEIR STRENGTHS:
${competitor.strengths.map(s => `• ${s}`).join('\n')}

THEIR WEAKNESSES (IBM ADVANTAGES):
${competitor.weaknesses.map(w => `• ${w}`).join('\n')}

IBM'S COMPETITIVE ADVANTAGES:
• Hybrid Cloud Excellence: Industry-leading hybrid cloud platform
• AI Leadership: watsonx and decades of AI research
• Industry Solutions: Purpose-built solutions for ${industry}
• Enterprise Security: Built-in, not bolted-on
• Global Support: 24/7 support with dedicated teams
• Partner Ecosystem: Extensive network of certified partners

RECOMMENDED APPROACH FOR ${customerName}:
1. Lead with hybrid cloud flexibility
2. Emphasize ${industry}-specific expertise
3. Highlight IBM's AI capabilities (watsonx)
4. Focus on total cost of ownership, not just initial price
5. Leverage IBM's proven track record in ${industry}

NEXT STEPS:
• Schedule technical deep-dive on specific use cases
• Provide ${industry} customer success stories
• Arrange proof-of-concept for critical workloads`;

    } else {
      // Generic competitive guidance
      response = `Competitive Strategy Guidance

For ${customerName} in the ${industry} sector:

IBM'S CORE COMPETITIVE ADVANTAGES:
• Hybrid Cloud Leadership: Best-in-class hybrid cloud platform
• AI & Data: watsonx platform with enterprise-grade AI
• Industry Expertise: Deep ${industry} knowledge and solutions
• Security & Compliance: Built-in security, not add-ons
• Global Scale: Worldwide presence with local support
• Innovation: Continuous R&D investment in emerging technologies

KEY DIFFERENTIATORS BY CATEGORY:
1. Cloud Infrastructure: Hybrid approach vs. cloud-only competitors
2. AI/ML: watsonx vs. generic AI platforms
3. Security: Integrated security vs. third-party solutions
4. Support: Included 24/7 support vs. tiered support models
5. Industry Focus: Purpose-built solutions vs. generic platforms

COMPETITIVE POSITIONING FOR ${industry}:
• Emphasize regulatory compliance and data sovereignty
• Highlight industry-specific solutions and expertise
• Focus on long-term partnership, not just technology
• Demonstrate proven ROI with similar customers

DISCOVERY QUESTIONS:
• "What are your top 3 technology priorities for the next 12 months?"
• "What challenges are you facing with your current vendors?"
• "How important is ${industry}-specific expertise to your selection?"
• "What's your strategy for hybrid cloud and AI adoption?"

To get more specific competitive analysis, try asking:
• "How does IBM watsonx compare to AWS SageMaker?"
• "How does IBM Cloud compare to Microsoft Azure?"
• "How does IBM Instana compare to Splunk?"`;
    }

    return response;
  }

  function detectIBMProducts(query) {
    const products = ['watsonx', 'instana', 'turbonomic', 'maximo', 'apptio', 'concert', 'verify', 'vault', 'sevone', 'ns1', 'webmethods'];
    const found = [];
    
    const queryLower = query.toLowerCase();
    products.forEach(product => {
      if (queryLower.includes(product)) {
        found.push(product.charAt(0).toUpperCase() + product.slice(1));
      }
    });
    
    return found;
  }

  function detectCompetitors(query) {
    const found = [];
    const queryLower = query.toLowerCase();
    
    Object.entries(COMPETITORS).forEach(([id, competitor]) => {
      const nameWords = competitor.name.toLowerCase().split(' ');
      if (nameWords.some(word => queryLower.includes(word)) || queryLower.includes(id)) {
        found.push(competitor);
      }
    });
    
    return found;
  }

  // ============================================
  // COMPETITOR SELECTION
  // ============================================
  
  function toggleCompetitor(competitorId) {
    const competitor = COMPETITORS[competitorId];
    if (!competitor) return;

    const index = competitiveState.selectedCompetitors.findIndex(c => c.id === competitorId);
    
    if (index > -1) {
      // Remove competitor
      competitiveState.selectedCompetitors.splice(index, 1);
    } else {
      // Add competitor (max 3)
      if (competitiveState.selectedCompetitors.length >= 3) {
        alert('Maximum 3 competitors can be selected for comparison');
        return;
      }
      competitiveState.selectedCompetitors.push({
        id: competitorId,
        ...competitor
      });
    }

    updateUI();
  }

  function clearAllCompetitors() {
    competitiveState.selectedCompetitors = [];
    updateUI();
  }

  // ============================================
  // UI UPDATES
  // ============================================
  
  function updateUI() {
    updateCompetitorTags();
    updateSelectedCompetitorsList();
    updateComparisonMatrix();
    updateBattleCards();
    updateEmptyState();
  }

  function updateCompetitorTags() {
    elements.competitorTags.forEach(tag => {
      const competitorId = tag.dataset.competitor;
      const isSelected = competitiveState.selectedCompetitors.some(c => c.id === competitorId);
      tag.classList.toggle('active', isSelected);
    });
  }

  function updateSelectedCompetitorsList() {
    const count = competitiveState.selectedCompetitors.length;
    
    if (count === 0) {
      elements.selectedCompetitorsDisplay.style.display = 'none';
      return;
    }

    elements.selectedCompetitorsDisplay.style.display = 'block';
    elements.competitorCount.textContent = count;

    elements.selectedCompetitorsList.innerHTML = competitiveState.selectedCompetitors.map(comp => `
      <div class="selected-competitor-chip">
        <span class="competitor-chip-name">${comp.name}</span>
        <button class="remove-competitor-btn" data-competitor="${comp.id}" aria-label="Remove ${comp.name}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10 4L4 10M4 4L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `).join('');

    // Add remove button listeners
    elements.selectedCompetitorsList.querySelectorAll('.remove-competitor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleCompetitor(btn.dataset.competitor);
      });
    });
  }

  function updateComparisonMatrix() {
    if (competitiveState.selectedCompetitors.length === 0) {
      elements.comparisonMatrixContainer.style.display = 'none';
      return;
    }

    elements.comparisonMatrixContainer.style.display = 'block';
    
    const matrix = generateComparisonMatrix();
    elements.comparisonMatrix.innerHTML = matrix;
  }

  function generateComparisonMatrix() {
    const competitors = competitiveState.selectedCompetitors;
    
    let html = '<table class="comparison-table"><thead><tr>';
    html += '<th class="feature-column">Feature</th>';
    html += '<th class="ibm-column">IBM Solution</th>';
    competitors.forEach(comp => {
      html += `<th class="competitor-column">${comp.name}</th>`;
    });
    html += '</tr></thead><tbody>';

    COMPARISON_FEATURES.forEach(feature => {
      html += '<tr>';
      html += `<td class="feature-name">${feature.name}</td>`;
      html += `<td class="rating rating-${feature.ibmStrength}">${getRatingIcon(feature.ibmStrength)}</td>`;
      
      competitors.forEach(comp => {
        const rating = getCompetitorRating(comp.id, feature.id);
        html += `<td class="rating rating-${rating}">${getRatingIcon(rating)}</td>`;
      });
      
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }

  function getCompetitorRating(competitorId, featureId) {
    // Simplified rating logic - in production, this would come from a database
    const ratings = {
      'aws': { 'hybrid-cloud': 'weak', 'ai-ml': 'moderate', 'security': 'strong' },
      'microsoft-azure': { 'hybrid-cloud': 'strong', 'ai-ml': 'moderate', 'security': 'strong' },
      'google-cloud': { 'hybrid-cloud': 'weak', 'ai-ml': 'strong', 'security': 'moderate' }
    };
    
    return ratings[competitorId]?.[featureId] || 'moderate';
  }

  function getRatingIcon(rating) {
    const icons = {
      'strong': '✅',
      'moderate': '⚠️',
      'weak': '❌'
    };
    return icons[rating] || '⚠️';
  }

  function updateBattleCards() {
    if (competitiveState.selectedCompetitors.length === 0) {
      elements.battleCardsContainer.style.display = 'none';
      return;
    }

    elements.battleCardsContainer.style.display = 'block';
    
    const customerName = document.getElementById('customer-name')?.value || 'the customer';
    const industry = document.getElementById('industry')?.value || 'their industry';

    elements.battleCardsList.innerHTML = competitiveState.selectedCompetitors.map(comp => 
      generateBattleCard(comp, customerName, industry)
    ).join('');

    // Add generate button listeners
    elements.battleCardsList.querySelectorAll('.generate-battle-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const competitorId = btn.dataset.competitor;
        generateFullBattleCard(competitorId);
      });
    });
  }

  function generateBattleCard(competitor, customerName, industry) {
    return `
      <div class="battle-card">
        <div class="battle-card__header">
          <h4 class="battle-card__title">IBM vs. ${competitor.name}</h4>
          <span class="battle-card__category">${competitor.category}</span>
        </div>

        <div class="battle-card__section">
          <h5 class="battle-card__section-title">💪 IBM Strengths</h5>
          <ul class="battle-card__list">
            <li>Superior hybrid cloud capabilities for ${industry}</li>
            <li>Industry-specific solutions and expertise</li>
            <li>Enterprise-grade security and compliance</li>
            <li>Dedicated support and consulting services</li>
          </ul>
        </div>

        <div class="battle-card__section">
          <h5 class="battle-card__section-title">⚠️ ${competitor.name} Strengths (Acknowledge)</h5>
          <ul class="battle-card__list">
            ${competitor.strengths.slice(0, 3).map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div class="battle-card__section">
          <h5 class="battle-card__section-title">🎤 Key Talking Points</h5>
          <ul class="battle-card__list">
            <li>"While ${competitor.name} has breadth, IBM has depth in ${industry}"</li>
            <li>"IBM's hybrid cloud approach gives ${customerName} flexibility"</li>
            <li>"Our AI capabilities are purpose-built for enterprise needs"</li>
          </ul>
        </div>

        <div class="battle-card__section">
          <h5 class="battle-card__section-title">❓ Discovery Questions</h5>
          <ul class="battle-card__list">
            <li>What's your current relationship with ${competitor.name}?</li>
            <li>How important is hybrid cloud flexibility for ${customerName}?</li>
            <li>What ${industry}-specific requirements do you have?</li>
          </ul>
        </div>

        <button class="generate-battle-card-btn" data-competitor="${competitor.id}">
          <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
          </svg>
          Generate Full Battle Card
        </button>
      </div>
    `;
  }

  function generateFullBattleCard(competitorId) {
    console.log('Generating full battle card for:', competitorId);
    
    const competitor = COMPETITORS[competitorId];
    if (!competitor) {
      alert('Competitor not found');
      return;
    }

    const customerName = document.getElementById('customer-name')?.value || 'the customer';
    const industrySelect = document.getElementById('industry');
    const industry = industrySelect?.options[industrySelect.selectedIndex]?.text || 'their industry';

    // Create comprehensive battle card content
    const battleCardContent = `
═══════════════════════════════════════════════════════════════
                    COMPREHENSIVE BATTLE CARD
                    IBM vs. ${competitor.name}
═══════════════════════════════════════════════════════════════

CUSTOMER CONTEXT:
• Customer: ${customerName}
• Industry: ${industry}
• Competitor: ${competitor.name} (${competitor.category})

═══════════════════════════════════════════════════════════════
SECTION 1: EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════

${competitor.name} is a ${competitor.marketShare.toLowerCase()} market share player in ${competitor.category}. While they have established presence, IBM offers superior value through hybrid cloud leadership, industry-specific solutions, and comprehensive support.

KEY RECOMMENDATION: Position IBM as the strategic partner for ${customerName}'s long-term ${industry} transformation, emphasizing our proven track record and integrated approach.

═══════════════════════════════════════════════════════════════
SECTION 2: COMPETITIVE POSITIONING
═══════════════════════════════════════════════════════════════

IBM STRENGTHS vs. ${competitor.name}:
✓ Hybrid Cloud Leadership - Flexibility to run workloads anywhere
✓ Industry Expertise - Deep ${industry} experience and solutions
✓ AI Integration - watsonx AI embedded across all platforms
✓ Enterprise Security - Built-in, not bolt-on security
✓ Global Support - 24/7 support with dedicated account teams
✓ Transparent Pricing - Predictable costs, no hidden fees
✓ Open Standards - Avoid vendor lock-in with open technologies

${competitor.name} WEAKNESSES:
${competitor.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

═══════════════════════════════════════════════════════════════
SECTION 3: KEY DIFFERENTIATORS
═══════════════════════════════════════════════════════════════

1. HYBRID CLOUD ARCHITECTURE
   IBM: True hybrid cloud with Red Hat OpenShift
   ${competitor.name}: ${competitor.weaknesses.includes('Limited hybrid cloud') ? 'Limited hybrid capabilities' : 'Cloud-focused approach'}
   
   Impact: ${customerName} maintains control of sensitive data while leveraging cloud benefits

2. INDUSTRY SOLUTIONS
   IBM: Pre-built ${industry} solutions with proven ROI
   ${competitor.name}: Generic platform requiring customization
   
   Impact: Faster time-to-value with industry best practices built-in

3. AI & AUTOMATION
   IBM: watsonx AI integrated across all products
   ${competitor.name}: ${competitor.strengths.includes('AI/ML capabilities') ? 'Strong AI but less integrated' : 'Limited AI capabilities'}
   
   Impact: Intelligent automation reduces operational costs by 30-40%

4. TOTAL COST OF OWNERSHIP
   IBM: Transparent pricing with included support and services
   ${competitor.name}: ${competitor.weaknesses.includes('Complex pricing') || competitor.weaknesses.includes('High costs') ? 'Complex pricing with add-on costs' : 'Competitive but less transparent pricing'}
   
   Impact: Better long-term value with predictable costs

═══════════════════════════════════════════════════════════════
SECTION 4: RECOMMENDED TALKING POINTS
═══════════════════════════════════════════════════════════════

Opening Statement:
"${customerName}, while ${competitor.name} is a solid platform, IBM offers something unique for ${industry} organizations - a complete hybrid cloud solution with AI built-in, backed by decades of ${industry} expertise."

Key Messages:
1. "Unlike ${competitor.name}, IBM's hybrid approach gives you the flexibility to run workloads where they make the most sense - on-premises, in the cloud, or at the edge."

2. "We've helped over 500 ${industry} organizations transform their operations with proven solutions, not generic platforms that require extensive customization."

3. "IBM's watsonx AI is embedded across our entire portfolio, giving you intelligent automation out of the box, not as an expensive add-on."

4. "Our transparent pricing model means no surprises - support, updates, and professional services are included, not charged separately like with ${competitor.name}."

5. "With IBM, you're not just buying technology - you're getting a strategic partner with 24/7 global support and dedicated account teams."

═══════════════════════════════════════════════════════════════
SECTION 5: DISCOVERY QUESTIONS
═══════════════════════════════════════════════════════════════

Current State Assessment:
□ "What's your current relationship with ${competitor.name}?"
□ "What challenges are you experiencing with their platform?"
□ "How satisfied are you with their support and response times?"
□ "What unexpected costs have you encountered?"

Strategic Direction:
□ "What are your top 3 strategic priorities for the next 2-3 years?"
□ "How important is hybrid cloud flexibility for ${customerName}?"
□ "What role does AI play in your digital transformation strategy?"
□ "What ${industry}-specific compliance requirements do you have?"

Technical Requirements:
□ "What's your current cloud strategy - public, private, or hybrid?"
□ "How do you handle sensitive data and regulatory compliance?"
□ "What integration challenges are you facing with existing systems?"
□ "What's your approach to application modernization?"

Business Impact:
□ "What metrics define success for your IT initiatives?"
□ "How do you measure ROI on technology investments?"
□ "What's your budget cycle and decision-making process?"
□ "Who else should be involved in this evaluation?"

═══════════════════════════════════════════════════════════════
SECTION 6: OBJECTION HANDLING
═══════════════════════════════════════════════════════════════

OBJECTION: "We're already invested in ${competitor.name}"
RESPONSE: "I understand, and we're not suggesting you rip and replace everything. IBM's hybrid approach actually works alongside ${competitor.name}, giving you the flexibility to migrate at your own pace while leveraging your existing investments. Many of our ${industry} clients started with a hybrid approach and saw immediate value."

OBJECTION: "${competitor.name} is cheaper"
RESPONSE: "Let's look at total cost of ownership. While ${competitor.name}'s initial pricing may seem lower, when you factor in support costs, professional services, training, and hidden fees, IBM often delivers better long-term value. Plus, our ${industry} solutions reduce implementation time by 40%, which translates to faster ROI."

OBJECTION: "We don't need hybrid cloud"
RESPONSE: "That's a common perspective, but consider this: ${industry} regulations often require certain data to stay on-premises. Hybrid cloud isn't just about where workloads run - it's about having options. What happens when regulations change or you acquire a company with different requirements? IBM gives you that flexibility without starting over."

OBJECTION: "${competitor.name} has better [specific feature]"
RESPONSE: "You're right that ${competitor.name} has strong capabilities in that area. However, let's look at the complete picture. IBM's integrated approach means you get that functionality plus AI, security, and ${industry} expertise in one platform. Would you rather manage multiple vendors or have one strategic partner?"

OBJECTION: "IBM is too expensive"
RESPONSE: "I appreciate your concern about costs. Let me share how we've helped similar ${industry} organizations. Our transparent pricing model means you know exactly what you're paying for - no surprise bills. Plus, our ${industry} solutions typically reduce implementation costs by 30-40% compared to generic platforms. Can we schedule a TCO analysis to compare apples to apples?"

═══════════════════════════════════════════════════════════════
SECTION 7: PROOF POINTS & CASE STUDIES
═══════════════════════════════════════════════════════════════

${industry.toUpperCase()} SUCCESS STORIES:

1. Similar Organization Case Study
   • Challenge: Legacy systems, high costs, security concerns
   • Solution: IBM hybrid cloud with watsonx AI
   • Results: 40% cost reduction, 60% faster deployment, zero security incidents
   
2. Competitive Displacement
   • Previous Vendor: ${competitor.name}
   • Reason for Switch: Limited ${industry} features, high TCO, poor support
   • IBM Advantage: Industry solutions, better ROI, dedicated support
   
3. Industry Benchmark
   • Average IBM customer in ${industry}: 35% operational cost reduction
   • Time to value: 3-6 months vs. 12-18 months with generic platforms
   • Customer satisfaction: 4.7/5.0 rating

═══════════════════════════════════════════════════════════════
SECTION 8: NEXT STEPS & CALL TO ACTION
═══════════════════════════════════════════════════════════════

Immediate Actions:
1. Schedule technical deep-dive with IBM architects
2. Arrange ${industry} reference customer call
3. Conduct TCO analysis comparing IBM vs. ${competitor.name}
4. Provide proof-of-concept proposal

30-Day Plan:
Week 1: Discovery workshop with key stakeholders
Week 2: Technical assessment and architecture review
Week 3: Business case development and ROI analysis
Week 4: Executive presentation and proposal delivery

Success Metrics:
□ Technical requirements validated
□ Business case approved
□ Budget allocated
□ Timeline agreed
□ Stakeholders aligned

═══════════════════════════════════════════════════════════════
INTERNAL RESOURCES & CONTACTS
═══════════════════════════════════════════════════════════════

IBM Specialists to Engage:
• ${industry} Industry Leader: [Contact your account team]
• Hybrid Cloud Architect: [Contact your account team]
• watsonx AI Specialist: [Contact your account team]
• Competitive Intelligence: [Contact your account team]

Additional Resources:
• ${industry} Solution Briefs
• ${competitor.name} Comparison White Paper
• Customer Reference List
• ROI Calculator
• Proof-of-Concept Templates

═══════════════════════════════════════════════════════════════
                        END OF BATTLE CARD
═══════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Customer: ${customerName}
Industry: ${industry}
Competitor: ${competitor.name}
`;

    // Create a modal or new window to display the battle card
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 8px;
      max-width: 1000px;
      max-height: 90vh;
      overflow: auto;
      padding: 30px;
      position: relative;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
      position: sticky;
      top: 0;
      right: 0;
      float: right;
      background: #4A4A4A;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 20px;
      z-index: 1;
    `;
    closeBtn.onclick = () => document.body.removeChild(modal);

    const pdfBtn = document.createElement('button');
    pdfBtn.innerHTML = `
      <svg class="export-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" style="margin-right: 8px;">
        <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>PDF</span>
    `;
    pdfBtn.style.cssText = `
      position: sticky;
      top: 0;
      float: right;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #8B8B8B;
      background-color: transparent;
      border: 1px solid #D4D4D4;
      border-radius: 20px;
      cursor: pointer;
      margin-bottom: 20px;
      margin-right: 10px;
      z-index: 1;
      transition: all 0.2s ease;
    `;
    pdfBtn.onmouseover = () => {
      pdfBtn.style.color = '#2C2C2C';
      pdfBtn.style.backgroundColor = '#F5F3EE';
      pdfBtn.style.borderColor = '#4A4A4A';
      pdfBtn.style.transform = 'translateY(-1px)';
    };
    pdfBtn.onmouseout = () => {
      pdfBtn.style.color = '#8B8B8B';
      pdfBtn.style.backgroundColor = 'transparent';
      pdfBtn.style.borderColor = '#D4D4D4';
      pdfBtn.style.transform = 'translateY(0)';
    };
    pdfBtn.onclick = () => {
      downloadBattleCardAsPDF(battleCardContent, competitor.name, customerName);
    };

    const copyBtn = document.createElement('button');
    copyBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px;">
        <rect x="5" y="5" width="9" height="9" stroke="currentColor" stroke-width="1.5" rx="1"/>
        <path d="M3 11V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span>Copy</span>
    `;
    copyBtn.style.cssText = `
      position: sticky;
      top: 0;
      right: 100px;
      float: right;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #8B8B8B;
      background-color: transparent;
      border: 1px solid #D4D4D4;
      border-radius: 20px;
      cursor: pointer;
      margin-bottom: 20px;
      margin-right: 10px;
      z-index: 1;
      transition: all 0.2s ease;
    `;
    copyBtn.onmouseover = () => {
      copyBtn.style.color = '#2C2C2C';
      copyBtn.style.backgroundColor = '#F5F3EE';
      copyBtn.style.borderColor = '#4A4A4A';
      copyBtn.style.transform = 'translateY(-1px)';
    };
    copyBtn.onmouseout = () => {
      copyBtn.style.color = '#8B8B8B';
      copyBtn.style.backgroundColor = 'transparent';
      copyBtn.style.borderColor = '#D4D4D4';
      copyBtn.style.transform = 'translateY(0)';
    };
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(battleCardContent);
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px;">
          <path d="M3 8L6 11L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Copied!</span>
      `;
      copyBtn.style.color = '#4CAF50';
      copyBtn.style.borderColor = '#4CAF50';
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.color = '#8B8B8B';
        copyBtn.style.borderColor = '#D4D4D4';
      }, 2000);
    };

    const pre = document.createElement('pre');
    pre.style.cssText = `
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #2C2C2C;
      clear: both;
    `;
    pre.textContent = battleCardContent;

    content.appendChild(pdfBtn);
    content.appendChild(copyBtn);
    content.appendChild(closeBtn);
    content.appendChild(pre);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  function downloadBattleCardAsPDF(content, competitorName, customerName) {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    const date = new Date().toLocaleDateString();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Battle Card - IBM vs ${competitorName} - ${customerName}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            max-width: 100%;
            margin: 0;
            padding: 20px;
          }
          pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            font-family: 'Courier New', monospace;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <pre>${content}</pre>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  }

  function updateEmptyState() {
    const hasCompetitors = competitiveState.selectedCompetitors.length > 0;
    elements.emptyState.style.display = hasCompetitors ? 'none' : 'block';
  }

  // ============================================
  // CUSTOMER CONTEXT
  // ============================================
  
  function updateCustomerContext() {
    // Update industry display
    const industrySelect = document.getElementById('industry');
    const industryDisplays = document.querySelectorAll('.industry-display');
    
    if (industrySelect && industryDisplays.length > 0) {
      const updateIndustryDisplay = () => {
        const selectedOption = industrySelect.options[industrySelect.selectedIndex];
        const industryText = selectedOption ? selectedOption.text : 'Selected Industry';
        industryDisplays.forEach(display => {
          display.textContent = industryText;
        });
      };
      
      industrySelect.addEventListener('change', updateIndustryDisplay);
      updateIndustryDisplay();
    }
  }

  // ============================================
  // INITIALIZE ON DOM READY
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

// Made with Bob
