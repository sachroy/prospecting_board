# IBM Documentation Integration

## Overview

The IBM Documentation Integration service provides comprehensive access to IBM's documentation ecosystem, including IBM.com, IBM Docs, IBM Developer, and IBM Redbooks. This service enables the Prospecting Board to generate AI-powered responses based on official IBM documentation.

---

## Architecture

### Components

1. **IBMDocsService** - Core service for searching and fetching IBM documentation
2. **IBMDocsController** - REST API endpoints for documentation access
3. **IBMDocsRoutes** - Express routes configuration

### Data Sources

- **IBM.com** (`https://www.ibm.com`) - Main IBM website and product pages
- **IBM Documentation** (`https://www.ibm.com/docs/en`) - Official product documentation
- **IBM Developer** (`https://developer.ibm.com`) - Developer resources, tutorials, patterns
- **IBM Redbooks** (`https://www.redbooks.ibm.com`) - Technical publications and best practices

---

## API Endpoints

### 1. Search IBM Documentation

**Endpoint:** `POST /api/ibm-docs/search`

**Description:** Search across all IBM documentation sources

**Request Body:**
```json
{
  "query": "cloud migration strategy",
  "sources": ["ibm.com", "ibm-docs", "ibm-developer"],
  "maxResults": 10,
  "industry": "banking",
  "product": "IBM Cloud"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "cloud migration strategy",
    "results": [
      {
        "title": "Cloud Migration Best Practices",
        "url": "https://www.ibm.com/cloud/learn/cloud-migration",
        "snippet": "Learn about cloud migration strategies...",
        "source": "ibm.com",
        "relevanceScore": 15,
        "lastUpdated": "2026-03-15"
      }
    ],
    "count": 10
  }
}
```

---

### 2. Get Industry-Specific Documentation

**Endpoint:** `GET /api/ibm-docs/industry/:industry/topic/:topic`

**Description:** Get IBM documentation relevant to a specific industry and topic

**Parameters:**
- `industry` - Industry name (e.g., "banking", "healthcare", "retail")
- `topic` - Topic to search (e.g., "digital transformation", "cybersecurity")

**Query Parameters:**
- `maxResults` - Maximum number of results (default: 5)

**Example:**
```
GET /api/ibm-docs/industry/banking/topic/digital-transformation?maxResults=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "industry": "banking",
    "topic": "digital transformation",
    "results": [...],
    "count": 5
  }
}
```

---

### 3. Get Product Documentation

**Endpoint:** `GET /api/ibm-docs/product/:product`

**Description:** Get documentation for a specific IBM product

**Parameters:**
- `product` - IBM product name (e.g., "IBM Cloud", "IBM Watson", "Red Hat OpenShift")

**Query Parameters:**
- `topic` - Specific topic within product (optional)
- `maxResults` - Maximum number of results (default: 5)

**Example:**
```
GET /api/ibm-docs/product/IBM%20Cloud?topic=kubernetes&maxResults=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": "IBM Cloud",
    "topic": "kubernetes",
    "results": [...],
    "count": 5
  }
}
```

---

### 4. Extract Insights

**Endpoint:** `POST /api/ibm-docs/insights`

**Description:** Extract key insights from IBM documentation for a specific question

**Request Body:**
```json
{
  "question": "What are the top strategic priorities for digital transformation?",
  "customerName": "Acme Bank",
  "industry": "banking"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "What are the top strategic priorities...",
    "customerName": "Acme Bank",
    "industry": "banking",
    "insights": [
      "Cloud-first strategy is essential for digital transformation",
      "API-driven architecture enables faster innovation",
      "Security and compliance must be built-in from the start"
    ],
    "sources": [...],
    "sourceCount": 5
  }
}
```

---

### 5. Fetch Document Content

**Endpoint:** `POST /api/ibm-docs/content`

**Description:** Fetch full content from an IBM documentation URL

**Request Body:**
```json
{
  "url": "https://www.ibm.com/docs/en/cloud-paks/cp-integration/2023.2"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "IBM Cloud Pak for Integration",
    "content": "Full document content...",
    "url": "https://www.ibm.com/docs/en/cloud-paks/cp-integration/2023.2",
    "metadata": {
      "product": "IBM Cloud Pak for Integration",
      "version": "2023.2",
      "category": "Integration",
      "lastUpdated": "2026-04-01"
    }
  }
}
```

---

### 6. Generate AI-Powered Response

**Endpoint:** `POST /api/ibm-docs/generate-response`

**Description:** Generate comprehensive response using IBM documentation and AI

**Request Body:**
```json
{
  "question": "What Application development and Integration projects are important for modernization?",
  "customerName": "Acme Corp",
  "industry": "manufacturing",
  "context": "Legacy mainframe systems, moving to cloud"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "What Application development...",
    "customerName": "Acme Corp",
    "industry": "manufacturing",
    "response": {
      "summary": "Based on IBM documentation for manufacturing...",
      "insights": [
        "Modernize legacy applications using IBM Cloud Pak for Applications",
        "Implement API-first architecture for integration",
        "Adopt containerization with Red Hat OpenShift"
      ],
      "sources": [
        {
          "title": "Application Modernization for Manufacturing",
          "url": "https://www.ibm.com/...",
          "snippet": "...",
          "source": "ibm.com"
        }
      ]
    },
    "metadata": {
      "sourceCount": 5,
      "insightCount": 3,
      "generatedAt": "2026-05-15T23:24:00Z"
    }
  }
}
```

---

## Integration with Prospecting Board

### Frontend Integration

Update the Generate button handlers in `prospecting-board/js/app.js`:

```javascript
async function generateResponse(questionId, questionText) {
  const customerName = document.getElementById('customer-name').value;
  const industry = document.getElementById('industry').value;
  
  if (!customerName || !industry) {
    alert('Please enter customer name and select industry first');
    return;
  }
  
  try {
    const response = await fetch('/api/ibm-docs/generate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: questionText,
        customerName,
        industry,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Display response in the UI
      displayResponse(questionId, data.data.response);
    }
  } catch (error) {
    console.error('Error generating response:', error);
  }
}
```

---

## Configuration

### Environment Variables

Add to `.env`:

```env
# IBM Documentation Integration
IBM_DOCS_ENABLED=true
IBM_DOCS_CACHE_TTL=3600
IBM_DOCS_MAX_RESULTS=10
IBM_DOCS_TIMEOUT=15000

# Rate Limiting
IBM_DOCS_RATE_LIMIT=100
IBM_DOCS_RATE_WINDOW=60000
```

---

## Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "node-cache": "^5.1.2"
  }
}
```

Install dependencies:

```bash
cd backend
npm install axios cheerio node-cache
```

---

## Caching Strategy

### Implementation

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ 
  stdTTL: 3600, // 1 hour
  checkperiod: 600 // Check for expired keys every 10 minutes
});

// In IBMDocsService
async searchIBMDocumentation(query: string, options: any) {
  const cacheKey = `search:${query}:${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from IBM
  const results = await this.performSearch(query, options);
  
  // Cache results
  cache.set(cacheKey, results);
  
  return results;
}
```

---

## Rate Limiting

### Implementation

```typescript
import rateLimit from 'express-rate-limit';

const ibmDocsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests to IBM documentation service',
});

// Apply to routes
router.use('/api/ibm-docs', ibmDocsLimiter);
```

---

## Error Handling

### Common Errors

1. **Network Timeout**
   - Retry with exponential backoff
   - Fall back to cached results if available

2. **Rate Limiting**
   - Implement request queuing
   - Return cached results when rate limited

3. **Invalid URLs**
   - Validate URLs before fetching
   - Log invalid URLs for review

4. **Parsing Errors**
   - Handle different HTML structures gracefully
   - Log parsing failures for debugging

---

## Testing

### Unit Tests

```typescript
describe('IBMDocsService', () => {
  it('should search IBM documentation', async () => {
    const results = await ibmDocsService.searchIBMDocumentation(
      'cloud migration',
      { sources: ['ibm.com'], maxResults: 5 }
    );
    
    expect(results).toHaveLength(5);
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('url');
  });
  
  it('should extract insights', async () => {
    const { insights, sources } = await ibmDocsService.extractInsights(
      'What are cloud migration best practices?',
      'Acme Corp',
      'retail'
    );
    
    expect(insights.length).toBeGreaterThan(0);
    expect(sources.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```bash
# Test search endpoint
curl -X POST http://localhost:3000/api/ibm-docs/search \
  -H "Content-Type: application/json" \
  -d '{"query":"kubernetes","sources":["ibm-docs"],"maxResults":5}'

# Test generate response
curl -X POST http://localhost:3000/api/ibm-docs/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "question":"What are modernization priorities?",
    "customerName":"Test Corp",
    "industry":"banking"
  }'
```

---

## Performance Optimization

### 1. Parallel Requests
```typescript
const searchPromises = sources.map(source => 
  this.searchBySource(source, query, filters)
);
const results = await Promise.allSettled(searchPromises);
```

### 2. Request Deduplication
```typescript
const pendingRequests = new Map();

async function dedupedFetch(url: string) {
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url);
  }
  
  const promise = axios.get(url);
  pendingRequests.set(url, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(url);
  }
}
```

### 3. Streaming Responses
For large documents, implement streaming:

```typescript
async streamDocumentContent(url: string, res: Response) {
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(res);
}
```

---

## Security Considerations

1. **URL Validation**
   - Only allow IBM domains
   - Validate URL format before fetching

2. **Content Sanitization**
   - Sanitize HTML content before storing
   - Remove scripts and potentially harmful content

3. **Rate Limiting**
   - Implement per-user rate limits
   - Monitor for abuse patterns

4. **Authentication**
   - Require authentication for all endpoints
   - Log all access for audit purposes

---

## Monitoring & Logging

### Metrics to Track

- Search request count
- Average response time
- Cache hit rate
- Error rate by source
- Most searched queries

### Logging

```typescript
logger.info('IBM docs search', {
  query,
  sources,
  resultCount: results.length,
  duration: Date.now() - startTime,
  userId: req.user.id,
});
```

---

## Future Enhancements

1. **AI-Powered Summarization**
   - Integrate with OpenAI/Claude for better summaries
   - Generate executive summaries from multiple sources

2. **Semantic Search**
   - Implement vector embeddings for better relevance
   - Use similarity search for related documents

3. **Real-time Updates**
   - Subscribe to IBM documentation updates
   - Notify users of relevant new content

4. **Multi-language Support**
   - Support documentation in multiple languages
   - Automatic translation of results

5. **Advanced Filtering**
   - Filter by date range
   - Filter by document type
   - Filter by product version

---

## Support & Troubleshooting

### Common Issues

**Issue:** Search returns no results
- **Solution:** Check if IBM sites are accessible, verify query format

**Issue:** Slow response times
- **Solution:** Enable caching, reduce maxResults, optimize selectors

**Issue:** Parsing errors
- **Solution:** Update cheerio selectors, handle different HTML structures

### Contact

For issues or questions:
- Check logs in `logs/ibm-docs.log`
- Review error messages in console
- Contact development team

---

## License

This integration is part of the Prospecting Board project and follows the same license terms.
