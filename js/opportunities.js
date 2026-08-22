/**
 * Potential Opportunities Module
 * AI-powered analysis that maps customer needs to IBM products/solutions
 * Uses real data from IBM.com, IBM Docs, and internet sources via Research API
 * Includes intelligent product matching, synergy detection, and value estimation
 */

(function() {
  'use strict';

  // IBM Products Reference List (for search queries)
  const IBM_PRODUCTS = {
    // Integration & API Management
    'webMethods IWHI': {
      category: 'Integration',
      capabilities: ['Hybrid integration', 'API management', 'B2B integration', 'Event-driven architecture'],
      synergies: ['API Connect', 'Event Automation', 'MQ', 'DataPower'],
      keywords: ['integration', 'api', 'hybrid', 'b2b', 'middleware', 'connect']
    },
    'API Connect': {
      category: 'API Management',
      capabilities: ['API lifecycle management', 'API security', 'Developer portal', 'Analytics'],
      synergies: ['webMethods IWHI', 'DataPower', 'Event Automation'],
      keywords: ['api', 'gateway', 'microservices', 'rest', 'graphql']
    },
    'Event Automation': {
      category: 'Event Streaming',
      capabilities: ['Real-time event streaming', 'Kafka management', 'Event processing', 'Integration'],
      synergies: ['webMethods IWHI', 'API Connect', 'Instana'],
      keywords: ['event', 'streaming', 'kafka', 'real-time', 'messaging']
    },
    'MQ': {
      category: 'Messaging',
      capabilities: ['Enterprise messaging', 'Reliable delivery', 'Transaction support', 'Multi-platform'],
      synergies: ['webMethods IWHI', 'Event Automation', 'CP4I'],
      keywords: ['messaging', 'queue', 'reliable', 'transaction', 'asynchronous']
    },
    'DataPower': {
      category: 'Gateway',
      capabilities: ['API gateway', 'Security gateway', 'Protocol transformation', 'High performance'],
      synergies: ['API Connect', 'webMethods IWHI', 'MQ'],
      keywords: ['gateway', 'security', 'api', 'transformation', 'protocol']
    },
    
    // Application Performance & Observability
    'Instana': {
      category: 'APM',
      capabilities: ['Auto-discovery', 'Real-time monitoring', 'Distributed tracing', 'AI-powered insights'],
      synergies: ['Turbonomic', 'Concert', 'CP4AIOps'],
      keywords: ['apm', 'monitoring', 'observability', 'performance', 'tracing', 'application']
    },
    'Turbonomic': {
      category: 'Cloud Optimization',
      capabilities: ['Resource optimization', 'Cost management', 'Performance assurance', 'Automation'],
      synergies: ['Instana', 'Cloudability', 'ApptioOne'],
      keywords: ['optimization', 'cost', 'resource', 'cloud', 'performance', 'finops']
    },
    'Concert': {
      category: 'Application Management',
      capabilities: ['Application insights', 'Dependency mapping', 'Change impact analysis', 'Mainframe integration'],
      synergies: ['Instana', 'Turbonomic', 'Concert for Z'],
      keywords: ['application', 'mainframe', 'dependency', 'insights', 'management']
    },
    
    // Security & Identity
    'Verify': {
      category: 'Identity & Access',
      capabilities: ['Identity governance', 'MFA', 'SSO', 'Access management', 'Zero-trust'],
      synergies: ['Trusteer', 'Vault', 'Consul'],
      keywords: ['identity', 'access', 'authentication', 'sso', 'mfa', 'iam', 'zero-trust']
    },
    'Trusteer': {
      category: 'Fraud Prevention',
      capabilities: ['Fraud detection', 'Account protection', 'Malware detection', 'Risk analytics'],
      synergies: ['Verify', 'SaferPayments'],
      keywords: ['fraud', 'security', 'threat', 'malware', 'protection']
    },
    'Vault': {
      category: 'Secrets Management',
      capabilities: ['Secrets management', 'Encryption', 'Key management', 'Compliance'],
      synergies: ['Verify', 'Consul', 'Terraform'],
      keywords: ['secrets', 'vault', 'encryption', 'keys', 'credentials', 'security']
    },
    
    // Infrastructure & Automation
    'Terraform': {
      category: 'Infrastructure as Code',
      capabilities: ['Infrastructure provisioning', 'Multi-cloud', 'State management', 'Automation'],
      synergies: ['Vault', 'Consul', 'Turbonomic'],
      keywords: ['infrastructure', 'iac', 'provisioning', 'automation', 'terraform', 'cloud']
    },
    'Consul': {
      category: 'Service Networking',
      capabilities: ['Service discovery', 'Service mesh', 'Network automation', 'Multi-cloud'],
      synergies: ['Terraform', 'Vault', 'Instana'],
      keywords: ['service mesh', 'networking', 'discovery', 'consul', 'microservices']
    },
    
    // FinOps & IT Financial Management
    'ApptioOne': {
      category: 'IT Financial Management',
      capabilities: ['IT cost transparency', 'Budgeting', 'Chargeback', 'Planning'],
      synergies: ['Cloudability', 'Turbonomic', 'Kubecost'],
      keywords: ['finops', 'cost', 'budget', 'financial', 'it spending', 'chargeback']
    },
    'Cloudability': {
      category: 'Cloud Cost Management',
      capabilities: ['Cloud cost optimization', 'Multi-cloud visibility', 'Recommendations', 'Governance'],
      synergies: ['ApptioOne', 'Turbonomic', 'Kubecost'],
      keywords: ['cloud cost', 'optimization', 'finops', 'spending', 'aws', 'azure']
    },
    'Kubecost': {
      category: 'Kubernetes Cost',
      capabilities: ['Kubernetes cost allocation', 'Resource optimization', 'Showback', 'Alerts'],
      synergies: ['Cloudability', 'Turbonomic', 'Instana'],
      keywords: ['kubernetes', 'k8s', 'container', 'cost', 'optimization']
    },
    
    // Asset & Facilities Management
    'Maximo': {
      category: 'Asset Management',
      capabilities: ['Asset lifecycle', 'Maintenance management', 'IoT integration', 'Mobile workforce'],
      synergies: ['Envizi', 'Tririga', 'WatsonX'],
      keywords: ['asset', 'maintenance', 'facilities', 'iot', 'equipment', 'eam']
    },
    'Tririga': {
      category: 'Real Estate Management',
      capabilities: ['Space management', 'Lease management', 'Capital projects', 'Sustainability'],
      synergies: ['Maximo', 'Envizi'],
      keywords: ['real estate', 'facilities', 'space', 'lease', 'workplace']
    },
    'Envizi': {
      category: 'ESG & Sustainability',
      capabilities: ['ESG reporting', 'Carbon tracking', 'Sustainability metrics', 'Compliance'],
      synergies: ['Maximo', 'Tririga', 'EIS Weather'],
      keywords: ['esg', 'sustainability', 'carbon', 'environmental', 'reporting']
    },
    
    // AI & Data
    'WatsonX': {
      category: 'AI Platform',
      capabilities: ['Foundation models', 'AI governance', 'Model training', 'Enterprise AI'],
      synergies: ['Watson Governance', 'RPA', 'Maximo'],
      keywords: ['ai', 'machine learning', 'llm', 'watson', 'artificial intelligence', 'ml']
    },
    'Watson Governance': {
      category: 'AI Governance',
      capabilities: ['Model monitoring', 'Bias detection', 'Explainability', 'Compliance'],
      synergies: ['WatsonX', 'RPA'],
      keywords: ['ai governance', 'model', 'compliance', 'bias', 'explainability']
    },
    'RPA': {
      category: 'Automation',
      capabilities: ['Process automation', 'Bot management', 'Workflow automation', 'AI integration'],
      synergies: ['WatsonX', 'Watson Governance'],
      keywords: ['rpa', 'automation', 'bot', 'process', 'workflow']
    },
    
    // Supply Chain & Commerce
    'Sterling Order Management': {
      category: 'Order Management',
      capabilities: ['Order orchestration', 'Inventory visibility', 'Fulfillment', 'Omnichannel'],
      synergies: ['Supply Chain Intelligence', 'Sterling B2B'],
      keywords: ['order', 'fulfillment', 'inventory', 'commerce', 'omnichannel']
    },
    'Supply Chain Intelligence': {
      category: 'Supply Chain',
      capabilities: ['Supply chain visibility', 'Risk management', 'Analytics', 'Optimization'],
      synergies: ['Sterling Order Management', 'WatsonX'],
      keywords: ['supply chain', 'logistics', 'visibility', 'risk', 'optimization']
    },
    'Sterling B2B': {
      category: 'B2B Integration',
      capabilities: ['B2B integration', 'EDI', 'Partner management', 'File transfer'],
      synergies: ['webMethods IWHI', 'Sterling Order Management', 'Aspera'],
      keywords: ['b2b', 'edi', 'partner', 'integration', 'trading']
    },
    
    // DevOps & Development
    'UrbanCode': {
      category: 'DevOps',
      capabilities: ['Deployment automation', 'Release management', 'Pipeline orchestration', 'Multi-platform'],
      synergies: ['Terraform', 'Instana', 'Concert'],
      keywords: ['devops', 'deployment', 'ci/cd', 'release', 'automation']
    },
    'WebSphere Liberty': {
      category: 'Application Server',
      capabilities: ['Java runtime', 'Microservices', 'Cloud-native', 'High performance'],
      synergies: ['UrbanCode', 'Instana', 'Concert'],
      keywords: ['java', 'application server', 'websphere', 'runtime', 'microservices']
    },
    
    // Specialized Solutions
    'SevOne': {
      category: 'Network Performance',
      capabilities: ['Network monitoring', 'Performance analytics', 'Capacity planning', 'Multi-vendor'],
      synergies: ['NS1', 'Instana'],
      keywords: ['network', 'monitoring', 'performance', 'nms', 'capacity']
    },
    'NS1': {
      category: 'DNS & Traffic',
      capabilities: ['DNS management', 'Traffic steering', 'DDoS protection', 'Global load balancing'],
      synergies: ['SevOne', 'DataPower'],
      keywords: ['dns', 'traffic', 'ddos', 'load balancing', 'network']
    },
    'Aspera': {
      category: 'File Transfer',
      capabilities: ['High-speed transfer', 'Large file handling', 'Global distribution', 'Security'],
      synergies: ['Sterling B2B', 'MQ'],
      keywords: ['file transfer', 'aspera', 'large files', 'fast', 'distribution']
    },
    'SaferPayments': {
      category: 'Payment Security',
      capabilities: ['Payment fraud detection', 'Real-time screening', 'Risk scoring', 'Compliance'],
      synergies: ['Trusteer', 'Verify'],
      keywords: ['payment', 'fraud', 'financial', 'transaction', 'security']
    },
    'Workload Automation': {
      category: 'Job Scheduling',
      capabilities: ['Job scheduling', 'Workflow automation', 'Cross-platform', 'SLA management'],
      synergies: ['UrbanCode', 'RPA', 'Turbonomic'],
      keywords: ['scheduling', 'batch', 'workflow', 'automation', 'jobs']
    },
    'CP4AIOps': {
      category: 'AIOps',
      capabilities: ['AI-powered operations', 'Incident management', 'Root cause analysis', 'Automation'],
      synergies: ['Instana', 'Turbonomic', 'WatsonX'],
      keywords: ['aiops', 'operations', 'incident', 'automation', 'ai']
    },
    'CP4I': {
      category: 'Integration Platform',
      capabilities: ['Cloud Pak for Integration', 'API management', 'Messaging', 'Event streaming'],
      synergies: ['API Connect', 'MQ', 'Event Automation', 'webMethods IWHI'],
      keywords: ['cloud pak', 'integration', 'platform', 'api', 'messaging']
    },
    'EIS Weather': {
      category: 'Weather Intelligence',
      capabilities: ['Weather data', 'Alerting', 'Risk assessment', 'Industry-specific insights'],
      synergies: ['Envizi', 'Supply Chain Intelligence', 'Maximo'],
      keywords: ['weather', 'climate', 'alerting', 'risk', 'environmental']
    },
    'TargetProcess': {
      category: 'Agile Management',
      capabilities: ['Agile planning', 'Portfolio management', 'Visual boards', 'Reporting'],
      synergies: ['UrbanCode', 'ApptioOne'],
      keywords: ['agile', 'project', 'planning', 'scrum', 'kanban', 'portfolio']
    },
    'Spring Support': {
      category: 'Framework Support',
      capabilities: ['Spring framework support', 'Enterprise support', 'Migration assistance', 'Best practices'],
      synergies: ['WebSphere Liberty', 'UrbanCode'],
      keywords: ['spring', 'java', 'framework', 'support', 'migration']
    },
    'Spectrum Symphony': {
      category: 'HPC',
      capabilities: ['High-performance computing', 'Workload management', 'Resource optimization', 'Grid computing'],
      synergies: ['Turbonomic', 'Workload Automation'],
      keywords: ['hpc', 'high performance', 'computing', 'grid', 'parallel']
    },
    'FTM': {
      category: 'Financial Transaction',
      capabilities: ['Payment processing', 'Transaction management', 'Multi-currency', 'Compliance'],
      synergies: ['SaferPayments', 'Sterling B2B'],
      keywords: ['payment', 'financial', 'transaction', 'ftm', 'banking']
    },
    'ACE/IIB': {
      category: 'Integration',
      capabilities: ['Message broker', 'Integration flows', 'Transformation', 'Routing'],
      synergies: ['webMethods IWHI', 'MQ', 'API Connect'],
      keywords: ['integration', 'broker', 'message', 'ace', 'iib', 'transformation']
    }
  };

  // State management
  let opportunities = [];
  let customerData = {};

  // Initialize
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    attachEventListeners();
  }

  function attachEventListeners() {
    const generateBtn = document.getElementById('generate-opportunities-btn');
    const regenerateBtn = document.getElementById('regenerate-opportunities-btn');
    const addBtn = document.getElementById('add-opportunity-btn');

    if (generateBtn) {
      generateBtn.addEventListener('click', handleGenerateOpportunities);
    }

    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', handleRegenerateOpportunities);
    }

    if (addBtn) {
      addBtn.addEventListener('click', handleAddCustomOpportunity);
    }
  }

  /**
   * Generate opportunities based on Section 2 data
   */
  /**
   * Merge incoming opportunities into the existing set.
   * Deduplication: if an incoming opportunity shares a significant keyword
   * with an existing one (or references the same IBM products), the newer
   * version wins. Otherwise it is appended.
   * Returns { merged: [...], newCount, replacedCount }
   */
  function mergeOpportunities(existing, incoming) {
    if (!existing || existing.length === 0) {
      return { merged: incoming, newCount: incoming.length, replacedCount: 0 };
    }

    // Build a fingerprint for quick comparison — lowercased first 6 words + first product
    function fingerprint(opp) {
      const words = (opp.opportunity || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).slice(0, 6).join(' ');
      const prod  = (opp.products?.[0] || '').toLowerCase().replace(/\s/g, '');
      return `${words}|${prod}`;
    }

    // Also check product overlap — two opps sharing ≥1 product are likely the same need
    function productOverlap(a, b) {
      const setA = new Set((a.products || []).map(p => p.toLowerCase()));
      return (b.products || []).some(p => setA.has(p.toLowerCase()));
    }

    const merged   = [...existing];
    let newCount      = 0;
    let replacedCount = 0;

    incoming.forEach(inc => {
      const fp  = fingerprint(inc);
      const idx = merged.findIndex(ex =>
        fingerprint(ex) === fp || productOverlap(ex, inc)
      );
      if (idx !== -1) {
        merged[idx] = inc;   // newer version wins
        replacedCount++;
      } else {
        merged.push(inc);
        newCount++;
      }
    });

    return { merged, newCount, replacedCount };
  }

  async function handleGenerateOpportunities() {
    const button = document.getElementById('generate-opportunities-btn');
    
    // Get customer data
    customerData = extractCustomerData();
    
    if (!customerData.customerName) {
      alert('Please enter a customer name in Section 1 first');
      return;
    }

    if (customerData.responses.length === 0) {
      alert('Please complete at least one question in Section 2 (Research Your Client) first');
      return;
    }

    // Show loading state
    button.classList.add('loading');
    button.disabled = true;
    button.innerHTML = `
      <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
      </svg>
      Analyzing...
    `;

    try {
      // Analyze customer needs and generate opportunities (current pillar/research)
      const incoming = await analyzeAndGenerateOpportunities(customerData);

      // Load any previously saved opportunities and merge
      const savedData = window.AccountMemory?.getOpportunities?.(customerData.customerName);
      const existing  = savedData?.items || [];
      const { merged, newCount, replacedCount } = mergeOpportunities(existing, incoming);

      // Update module-level variable + display the merged set
      opportunities = merged;
      displayOpportunities(opportunities);
      updateSummaryStats(opportunities);

      // ── Account Memory: save merged set + log summary ──
      if (window.AccountMemory && customerData.customerName) {
        window.AccountMemory.saveOpportunities(customerData.customerName, opportunities);

        const products = [...new Set(opportunities.flatMap(o => o.products))];
        const summary  = existing.length === 0
          ? `${opportunities.length} opportunit${opportunities.length !== 1 ? 'ies' : 'y'} identified — ${products.slice(0,4).join(', ')}${products.length > 4 ? ` +${products.length-4} more` : ''}`
          : `${newCount} new opportunit${newCount !== 1 ? 'ies' : 'y'} added, ${replacedCount} updated — ${opportunities.length} total`;
        window.AccountMemory.logActivity(
          customerData.customerName,
          'opportunities',
          summary,
          { count: opportunities.length, newCount, replacedCount, products }
        );
      }

      // Show freshness banner — include merge context when re-running
      showFreshnessBanner(new Date().toISOString(), true, newCount, replacedCount, existing.length);

      // Show table, hide empty state
      document.getElementById('opportunities-table-container').style.display = 'block';
      document.getElementById('opportunities-empty-state').style.display = 'none';
      
    } catch (error) {
      console.error('Error generating opportunities:', error);
      alert('Error generating opportunities. Please try again.');
    } finally {
      // Reset button
      button.classList.remove('loading');
      button.disabled = false;
      button.innerHTML = `
        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
        </svg>
        Analyze Opportunities
      `;
    }
  }

  /**
   * Extract customer data from Section 1 and Section 2
   */
  function extractCustomerData() {
    const data = {
      customerName: '',
      industry: '',
      responses: []
    };

    // Get customer name and industry from Section 1
    const customerNameInput = document.getElementById('customer-name');
    const industrySelect = document.getElementById('industry');
    
    if (customerNameInput) data.customerName = customerNameInput.value.trim();
    if (industrySelect) data.industry = industrySelect.value;

    // Get all responses from Section 2
    const responseFields = document.querySelectorAll('#section-research .response-field');
    responseFields.forEach(field => {
      const questionCard = field.closest('.question-card');
      const question = questionCard?.querySelector('.question-card__question')?.textContent || '';
      const response = field.value.trim();
      
      if (response) {
        data.responses.push({
          question: question,
          response: response
        });
      }
    });

    return data;
  }

  /**
   * Analyze customer data and generate opportunity recommendations using real data
   */
  async function analyzeAndGenerateOpportunities(data) {
    const opportunities = [];
    
    // Analyze each response and extract needs/challenges
    const needs = extractNeedsFromResponses(data.responses);
    
    // For each identified need, fetch real IBM product data and generate recommendations
    for (const need of needs) {
      try {
        // Find matching IBM products
        const matchedProducts = findMatchingProducts(need);
        
        if (matchedProducts.length > 0) {
          // Fetch real product information from IBM sources
          const productDetails = await fetchRealProductDetails(matchedProducts, need, data);
          
          if (productDetails) {
            opportunities.push({
              opportunity: need.description,
              products: matchedProducts,
              keyCapabilities: productDetails.capabilities,
              howItAddresses: productDetails.solution,
              value: productDetails.value,
              sources: productDetails.sources
            });
          }
        }
      } catch (error) {
        console.error(`Error processing need ${need.type}:`, error);
        // Continue with next need even if one fails
      }
    }

    return opportunities;
  }

  /**
   * Fetch real product details from IBM.com, IBM Docs, and internet sources
   */
  async function fetchRealProductDetails(products, need, customerData) {
    // Check if Research API is available
    const useResearchAPI = window.ResearchAPI && window.ResearchAPI.areAPIsConfigured();
    const useIBMDocs = window.IBMDocsIntegration && await window.IBMDocsIntegration.checkHealth();
    
    if (!useResearchAPI && !useIBMDocs) {
      console.log('No APIs configured, using knowledge base');
      // Fallback to knowledge base
      return {
        capabilities: generateKeyCapabilities(products),
        solution: generateSolutionDescription(need, products),
        value: estimateValue(need, products, customerData.industry),
        sources: []
      };
    }

    try {
      // Build comprehensive search query
      const productsStr = products.join(', ');
      const query = `IBM ${productsStr} capabilities features benefits for ${need.description} in ${customerData.industry} industry`;
      
      let searchResults, aiAnalysis;
      
      // Try Research API first (Serper + OpenAI)
      if (useResearchAPI) {
        console.log(`Fetching real data for: ${productsStr}`);
        
        // Search for product information
        searchResults = await window.ResearchAPI.searchGoogle(query, 5);
        
        // Build context from search results
        const context = buildSearchContext(searchResults, products);
        
        // Generate AI analysis
        const analysisPrompt = `Based on the following search results about IBM products (${productsStr}), provide a detailed analysis for a customer in the ${customerData.industry} industry with this need: "${need.description}".

Search Results:
${context}

Please provide:
1. Key Capabilities: List 4-5 specific capabilities of these IBM products
2. Solution Description: Explain how these products address the customer's need (2-3 sentences)
3. Value Estimate: Provide realistic ROI estimate with percentage improvement and dollar savings range

Format your response as JSON:
{
  "capabilities": ["capability1", "capability2", ...],
  "solution": "detailed solution description",
  "value": "X-Y% improvement, ~$A-BM annual savings/value"
}`;

        const aiResponse = await window.ResearchAPI.generateAIResponse(analysisPrompt, context);
        
        // Parse AI response
        try {
          // Try to extract JSON from various formats
          let jsonStr = aiResponse;
          
          // Remove any combination of quotes and backticks that might wrap the JSON
          // Handle: ```json, """json, ''', """, etc.
          jsonStr = jsonStr.replace(/^[`'"]+(?:json)?[`'"]*\s*/i, '').replace(/\s*[`'"]+$/,'');
          
          // Try to find the JSON object
          const jsonMatch = jsonStr.match(/(\{[\s\S]*?\})/);
          if (jsonMatch) {
            jsonStr = jsonMatch[1];
          }
          
          const parsed = JSON.parse(jsonStr);
          return {
            capabilities: parsed.capabilities || [],
            solution: parsed.solution || '',
            value: parsed.value || '',
            sources: extractSources(searchResults)
          };
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          console.log('AI Response that failed to parse:', aiResponse.substring(0, 500));
          // Extract information from unstructured response
          return parseUnstructuredResponse(aiResponse, searchResults);
        }
      }
      
      // Try IBM Docs API as fallback
      if (useIBMDocs && !aiAnalysis) {
        console.log(`Fetching from IBM Docs for: ${productsStr}`);
        
        const ibmQuery = `${productsStr} capabilities benefits use cases`;
        const ibmResponse = await window.IBMDocsIntegration.searchDocumentation(
          ibmQuery,
          customerData.customerName,
          customerData.industry
        );
        
        if (ibmResponse) {
          return {
            capabilities: extractCapabilitiesFromText(ibmResponse.answer),
            solution: ibmResponse.answer,
            value: estimateValue(need, products, customerData.industry),
            sources: ibmResponse.sources || []
          };
        }
      }
      
    } catch (error) {
      console.error('Error fetching real product details:', error);
    }
    
    // Fallback to knowledge base if APIs fail
    return {
      capabilities: generateKeyCapabilities(products),
      solution: generateSolutionDescription(need, products),
      value: estimateValue(need, products, customerData.industry),
      sources: []
    };
  }

  /**
   * Build search context from results
   */
  function buildSearchContext(searchResults, products) {
    let context = '';
    
    if (searchResults.organic) {
      searchResults.organic.slice(0, 5).forEach((result, index) => {
        context += `\n[${index + 1}] ${result.title}\n${result.snippet}\n`;
      });
    }
    
    if (searchResults.knowledgeGraph) {
      const kg = searchResults.knowledgeGraph;
      context += `\n\nKnowledge Graph:\n`;
      if (kg.description) context += `${kg.description}\n`;
    }
    
    return context;
  }

  /**
   * Extract sources from search results
   */
  function extractSources(searchResults) {
    const sources = [];
    
    if (searchResults.organic) {
      searchResults.organic.slice(0, 3).forEach(result => {
        sources.push({
          name: result.title,
          url: result.link,
          type: result.link.includes('ibm.com') ? 'IBM.com' : 'Web Source'
        });
      });
    }
    
    return sources;
  }

  /**
   * Parse unstructured AI response
   */
  function parseUnstructuredResponse(response, searchResults) {
    // Extract capabilities (look for bullet points or numbered lists)
    const capabilities = [];
    const capabilityMatches = response.match(/(?:•|\d\.)\s*([^\n]+)/g);
    if (capabilityMatches) {
      capabilityMatches.slice(0, 5).forEach(match => {
        const clean = match.replace(/^(?:•|\d\.)\s*/, '').trim();
        if (clean.length > 10) capabilities.push(clean);
      });
    }
    
    // Extract solution description (first substantial paragraph)
    const paragraphs = response.split('\n\n');
    const solution = paragraphs.find(p => p.length > 100) || paragraphs[0] || response.substring(0, 300);
    
    // Extract value estimate (look for percentages and dollar amounts)
    const valueMatch = response.match(/(\d+-\d+%.*?\$\d+-\d+M)/i);
    const value = valueMatch ? valueMatch[1] : 'Significant operational improvement and cost savings expected';
    
    return {
      capabilities: capabilities.length > 0 ? capabilities : ['Advanced capabilities', 'Enterprise-grade features', 'Proven solutions'],
      solution: solution.trim(),
      value: value,
      sources: extractSources(searchResults)
    };
  }

  /**
   * Extract capabilities from text
   */
  function extractCapabilitiesFromText(text) {
    const capabilities = [];
    
    // Look for bullet points or key phrases
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line.match(/^(?:•|-|\*|\d\.)/)) {
        const clean = line.replace(/^(?:•|-|\*|\d\.)\s*/, '').trim();
        if (clean.length > 10 && clean.length < 100) {
          capabilities.push(clean);
        }
      }
    });
    
    return capabilities.slice(0, 5);
  }

  /**
   * Extract needs and challenges from customer responses
   */
  function extractNeedsFromResponses(responses) {
    const needs = [];
    
    responses.forEach(item => {
      const text = `${item.question} ${item.response}`.toLowerCase();
      
      // Digital Transformation
      if (text.includes('digital transformation') || text.includes('moderniz')) {
        needs.push({
          type: 'transformation',
          description: 'Digital transformation and legacy system modernization',
          keywords: ['integration', 'api', 'cloud', 'microservices', 'devops']
        });
      }
      
      // Application Development
      if (text.includes('application') && (text.includes('development') || text.includes('moderniz'))) {
        needs.push({
          type: 'app-dev',
          description: 'Application development and modernization initiatives',
          keywords: ['java', 'microservices', 'api', 'devops', 'cloud']
        });
      }
      
      // Integration
      if (text.includes('integration') || text.includes('api') || text.includes('connect')) {
        needs.push({
          type: 'integration',
          description: 'Enterprise integration and API management',
          keywords: ['integration', 'api', 'hybrid', 'b2b', 'messaging']
        });
      }
      
      // Security & Identity
      if (text.includes('security') || text.includes('identity') || text.includes('access') || text.includes('zero-trust')) {
        needs.push({
          type: 'security',
          description: 'Cybersecurity and identity management enhancement',
          keywords: ['identity', 'access', 'security', 'authentication', 'zero-trust', 'secrets']
        });
      }
      
      // Observability & Performance
      if (text.includes('monitor') || text.includes('observability') || text.includes('performance') || text.includes('apm')) {
        needs.push({
          type: 'observability',
          description: 'Application performance monitoring and observability',
          keywords: ['apm', 'monitoring', 'observability', 'performance', 'tracing']
        });
      }
      
      // Cloud Optimization
      if (text.includes('cloud') && (text.includes('cost') || text.includes('optimization') || text.includes('finops'))) {
        needs.push({
          type: 'cloud-optimization',
          description: 'Cloud cost optimization and FinOps',
          keywords: ['cost', 'optimization', 'finops', 'cloud', 'resource']
        });
      }
      
      // Automation
      if (text.includes('automat') || text.includes('devops') || text.includes('ci/cd')) {
        needs.push({
          type: 'automation',
          description: 'Infrastructure and deployment automation',
          keywords: ['automation', 'devops', 'ci/cd', 'infrastructure', 'terraform']
        });
      }
      
      // Network Management
      if (text.includes('network') && (text.includes('performance') || text.includes('monitoring') || text.includes('dns'))) {
        needs.push({
          type: 'network',
          description: 'Network performance and management',
          keywords: ['network', 'monitoring', 'dns', 'traffic', 'performance']
        });
      }
      
      // Asset Management
      if (text.includes('asset') || text.includes('maintenance') || text.includes('facilities')) {
        needs.push({
          type: 'asset',
          description: 'Asset and facilities management',
          keywords: ['asset', 'maintenance', 'facilities', 'eam', 'iot']
        });
      }
      
      // AI & Analytics
      if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning') || text.includes('analytics')) {
        needs.push({
          type: 'ai',
          description: 'AI and advanced analytics capabilities',
          keywords: ['ai', 'machine learning', 'analytics', 'watson', 'ml']
        });
      }
      
      // Supply Chain
      if (text.includes('supply chain') || text.includes('inventory') || text.includes('order')) {
        needs.push({
          type: 'supply-chain',
          description: 'Supply chain optimization and order management',
          keywords: ['supply chain', 'order', 'inventory', 'fulfillment', 'logistics']
        });
      }
    });
    
    // Remove duplicates
    const uniqueNeeds = [];
    const seenTypes = new Set();
    
    needs.forEach(need => {
      if (!seenTypes.has(need.type)) {
        uniqueNeeds.push(need);
        seenTypes.add(need.type);
      }
    });
    
    return uniqueNeeds;
  }

  /**
   * Find IBM products that match the need
   */
  function findMatchingProducts(need) {
    const matches = [];
    const scores = [];
    
    // Score each product based on keyword matches
    Object.entries(IBM_PRODUCTS).forEach(([productName, product]) => {
      let score = 0;
      
      // Check keyword matches
      need.keywords.forEach(keyword => {
        if (product.keywords.some(pk => pk.includes(keyword) || keyword.includes(pk))) {
          score += 2;
        }
      });
      
      // Bonus for exact category match
      if (product.category.toLowerCase().includes(need.type)) {
        score += 3;
      }
      
      if (score > 0) {
        scores.push({ productName, score, product });
      }
    });
    
    // Sort by score and take top matches
    scores.sort((a, b) => b.score - a.score);
    
    // Take 1-3 products based on scores and synergies
    const topProducts = scores.slice(0, 3);
    
    topProducts.forEach(item => {
      matches.push(item.productName);
    });
    
    // Check for synergies and add complementary products
    if (matches.length > 0) {
      const primaryProduct = matches[0];
      const synergies = IBM_PRODUCTS[primaryProduct]?.synergies || [];
      
      synergies.forEach(synergy => {
        if (!matches.includes(synergy) && matches.length < 4) {
          // Check if synergy product is relevant to the need
          const synergyProduct = IBM_PRODUCTS[synergy];
          if (synergyProduct) {
            const hasRelevance = need.keywords.some(keyword =>
              synergyProduct.keywords.some(pk => pk.includes(keyword) || keyword.includes(pk))
            );
            if (hasRelevance) {
              matches.push(synergy);
            }
          }
        }
      });
    }
    
    return matches;
  }

  /**
   * Generate key capabilities list from products
   */
  function generateKeyCapabilities(products) {
    const capabilities = new Set();
    
    products.forEach(productName => {
      const product = IBM_PRODUCTS[productName];
      if (product) {
        product.capabilities.slice(0, 3).forEach(cap => capabilities.add(cap));
      }
    });
    
    return Array.from(capabilities).slice(0, 5);
  }

  /**
   * Generate solution description
   */
  function generateSolutionDescription(need, products) {
    const descriptions = {
      'transformation': `Enables comprehensive digital transformation through modern integration patterns, API-first architecture, and cloud-native development practices. Supports legacy system modernization while maintaining business continuity.`,
      'app-dev': `Accelerates application development with modern frameworks, microservices architecture, and automated deployment pipelines. Reduces time-to-market and improves application quality.`,
      'integration': `Provides enterprise-grade integration capabilities for hybrid environments, enabling seamless connectivity between cloud and on-premise systems, partners, and applications.`,
      'security': `Implements zero-trust security architecture with comprehensive identity governance, secrets management, and access controls. Ensures compliance and protects against evolving threats.`,
      'observability': `Delivers real-time visibility into application performance with AI-powered insights, distributed tracing, and automated root cause analysis. Reduces MTTR and improves user experience.`,
      'cloud-optimization': `Optimizes cloud spending through intelligent resource management, cost allocation, and automated recommendations. Provides visibility across multi-cloud environments.`,
      'automation': `Automates infrastructure provisioning, deployment processes, and operational tasks. Reduces manual effort, improves consistency, and accelerates delivery cycles.`,
      'network': `Provides comprehensive network performance monitoring, intelligent traffic management, and DDoS protection. Ensures optimal network performance and availability.`,
      'asset': `Streamlines asset lifecycle management, maintenance operations, and facilities management. Improves asset utilization and reduces operational costs.`,
      'ai': `Enables enterprise AI adoption with foundation models, governance frameworks, and integration capabilities. Supports responsible AI deployment at scale.`,
      'supply-chain': `Optimizes supply chain operations with real-time visibility, intelligent order management, and risk mitigation. Improves fulfillment efficiency and customer satisfaction.`
    };
    
    return descriptions[need.type] || `Addresses ${need.description} through ${products.join(', ')} with comprehensive capabilities and proven enterprise-grade solutions.`;
  }

  /**
   * Estimate value and ROI
   */
  function estimateValue(need, products, industry) {
    const valueEstimates = {
      'transformation': {
        efficiency: '25-35%',
        savings: '$3-7M',
        description: 'efficiency improvement in development and operations, ~$3-7M annual savings through modernization'
      },
      'app-dev': {
        efficiency: '30-40%',
        savings: '$2-5M',
        description: 'faster time-to-market, ~$2-5M annual savings through improved development efficiency'
      },
      'integration': {
        efficiency: '40-50%',
        savings: '$2-4M',
        description: 'reduction in integration complexity, ~$2-4M annual savings through automation'
      },
      'security': {
        efficiency: '50-60%',
        savings: '$5-10M',
        description: 'reduction in security incidents, ~$5-10M risk mitigation value'
      },
      'observability': {
        efficiency: '35-45%',
        savings: '$1-3M',
        description: 'reduction in MTTR, ~$1-3M annual savings through improved reliability'
      },
      'cloud-optimization': {
        efficiency: '20-30%',
        savings: '$2-6M',
        description: 'cloud cost reduction, ~$2-6M annual savings based on current spend'
      },
      'automation': {
        efficiency: '40-60%',
        savings: '$1-4M',
        description: 'reduction in manual effort, ~$1-4M annual savings through automation'
      },
      'network': {
        efficiency: '30-40%',
        savings: '$1-2M',
        description: 'improvement in network performance, ~$1-2M annual savings'
      },
      'asset': {
        efficiency: '25-35%',
        savings: '$2-5M',
        description: 'improvement in asset utilization, ~$2-5M annual savings'
      },
      'ai': {
        efficiency: '30-50%',
        savings: '$3-8M',
        description: 'productivity improvement through AI, ~$3-8M value creation'
      },
      'supply-chain': {
        efficiency: '20-30%',
        savings: '$2-4M',
        description: 'improvement in fulfillment efficiency, ~$2-4M annual savings'
      }
    };
    
    const estimate = valueEstimates[need.type] || {
      efficiency: '20-30%',
      savings: '$1-3M',
      description: 'operational improvement, ~$1-3M estimated annual value'
    };
    
    return estimate.description;
  }

  /**
   * Display opportunities in table
   */
  function displayOpportunities(opportunities) {
    const tbody = document.getElementById('opportunities-table-body');
    tbody.innerHTML = '';
    
    opportunities.forEach((opp, index) => {
      const row = document.createElement('tr');
      
      // Build sources HTML if available
      let sourcesHTML = '';
      if (opp.sources && opp.sources.length > 0) {
        sourcesHTML = `
          <div class="opportunity-sources" style="margin-top: 0.5rem; font-size: 0.875rem; color: #666;">
            <strong>Sources:</strong>
            ${opp.sources.map((s, i) => `
              <a href="${s.url}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: none;">
                [${i + 1}] ${s.type}
              </a>
            `).join(' • ')}
          </div>
        `;
      }
      
      row.innerHTML = `
        <td class="opportunity-cell">${opp.opportunity}</td>
        <td class="products-cell">
          ${opp.products.map(p => `<span class="product-tag">${p}</span>`).join('')}
        </td>
        <td class="capabilities-cell">
          <ul>
            ${opp.keyCapabilities.map(cap => `<li>${cap}</li>`).join('')}
          </ul>
        </td>
        <td class="address-cell">
          ${opp.howItAddresses}
          ${sourcesHTML}
        </td>
        <td class="value-cell">
          <span class="value-highlight">${opp.value}</span>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * Update summary statistics
   */
  function updateSummaryStats(opportunities) {
    console.log('updateSummaryStats called with', opportunities.length, 'opportunities');
    const totalOpps = opportunities.length;
    const uniqueProducts = new Set();
    let totalValue = 0;
    
    opportunities.forEach(opp => {
      opp.products.forEach(p => uniqueProducts.add(p));
      
      // Extract value estimate (rough calculation)
      // Handle formats: "~$500K-$750K", "$3-7M", "~$500K-700K", etc.
      console.log('Processing opportunity value:', opp.value);
      
      // Try to match millions first: $X-YM or $XM-$YM
      let match = opp.value.match(/~?\$(\d+)M?-\$?(\d+)M/i);
      if (match) {
        const avg = (parseInt(match[1]) + parseInt(match[2])) / 2;
        console.log('Matched millions:', match[0], 'Average:', avg, 'M');
        totalValue += avg;
      } else {
        // Try to match thousands: $XK-$YK or $X-YK (convert to millions)
        match = opp.value.match(/~?\$(\d+)K?-\$?(\d+)K/i);
        if (match) {
          const avgK = (parseInt(match[1]) + parseInt(match[2])) / 2;
          const avgM = avgK / 1000; // Convert thousands to millions
          console.log('Matched thousands:', match[0], 'Average:', avgK, 'K =', avgM, 'M');
          totalValue += avgM;
        } else {
          console.log('No match found for value:', opp.value);
        }
      }
    });
    
    console.log('Total value calculated:', totalValue, 'M');
    
    document.getElementById('total-opportunities').textContent = totalOpps;
    document.getElementById('total-products').textContent = uniqueProducts.size;
    document.getElementById('total-value').textContent = `$${Math.round(totalValue)}M`;
  }

  /**
   * Regenerate opportunities
   */
  function handleRegenerateOpportunities() {
    // Clear saved opportunities so the next run starts with a clean slate
    const name = document.getElementById('customer-name')?.value?.trim();
    if (name && window.AccountMemory?.saveOpportunities) {
      if (!confirm('This will clear all saved opportunities for this account and run a fresh analysis. Continue?')) return;
      window.AccountMemory.saveOpportunities(name, []);
    }
    handleGenerateOpportunities();
  }

  /**
   * Add custom opportunity
   */
  function handleAddCustomOpportunity() {
    alert('Custom opportunity feature coming soon!');
  }

  // Export for use in other modules
  /**
   * Inject / update the staleness banner above the opportunities table.
   * generatedAt: ISO timestamp. isFresh: true = just generated now.
   */
  function showFreshnessBanner(generatedAt, isFresh, newCount, replacedCount, prevCount) {
    const container = document.getElementById('opportunities-table-container');
    if (!container) return;

    const existing = document.getElementById('opp-freshness-banner');
    if (existing) existing.remove();

    const date    = new Date(generatedAt);
    const now     = new Date();
    const ageDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isStale = ageDays >= 7;

    const banner  = document.createElement('div');
    banner.id     = 'opp-freshness-banner';
    banner.className = 'opp-freshness-banner' + (isStale ? ' opp-freshness-banner--stale' : '');

    const checkIcon = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0;vertical-align:-1px"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 6.5l2 2 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const warnIcon  = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0;vertical-align:-1px"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 4v3M6.5 9h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;

    let message;
    if (isStale) {
      message = `${warnIcon} Analysis may be stale — last updated ${dateStr} (${ageDays} days ago). Consider regenerating.`;
    } else if (!isFresh) {
      // Restored from memory
      message = `${checkIcon} Restored from last session — ${dateStr}${ageDays > 0 ? ` (${ageDays} day${ageDays !== 1 ? 's' : ''} ago)` : ' (today)'}. Hit "Analyze Opportunities" to add more.`;
    } else if (typeof prevCount === 'number' && prevCount > 0) {
      // Re-run with merge context
      const parts = [];
      if (newCount > 0)      parts.push(`${newCount} new opportunit${newCount !== 1 ? 'ies' : 'y'} added`);
      if (replacedCount > 0) parts.push(`${replacedCount} updated`);
      const mergeNote = parts.length ? ` — ${parts.join(', ')}` : ' — no new opportunities found';
      message = `${checkIcon} Analysis merged${mergeNote}. Run another pillar and re-analyze to keep growing the table.`;
    } else {
      // First-time fresh run
      message = `${checkIcon} Analysis complete — ${dateStr}. Research more pillars and re-analyze to expand the table.`;
    }

    banner.innerHTML = message;
    container.insertBefore(banner, container.firstChild);
  }

  /**
   * Restore saved opportunities from AccountMemory into the table.
   * Called on account load. Returns true if data was restored.
   */
  function restoreSavedOpportunities(customerName) {
    if (!window.AccountMemory || !customerName) return false;
    const saved = window.AccountMemory.getOpportunities(customerName);
    if (!saved || !Array.isArray(saved.items) || saved.items.length === 0) return false;

    displayOpportunities(saved.items);
    updateSummaryStats(saved.items);
    document.getElementById('opportunities-table-container').style.display = 'block';
    document.getElementById('opportunities-empty-state').style.display = 'none';
    showFreshnessBanner(saved.generatedAt, false);
    return true;
  }

  window.OpportunitiesModule = {
    generateOpportunities: handleGenerateOpportunities,
    restoreSavedOpportunities,
    getOpportunities: () => opportunities
  };

})();

// Made with Bob
