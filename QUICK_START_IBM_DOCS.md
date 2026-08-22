# Quick Start Guide: IBM Documentation Integration

## Overview
The Prospecting Dashboard now integrates with IBM documentation sources (IBM.com, IBM Docs, IBM Developer, IBM Redbooks) to generate AI-powered responses based on real IBM content.

## Setup Instructions

### 1. Start the Backend Server

```bash
cd prospecting-board/backend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The backend will start on `http://localhost:3000`

### 2. Open the Frontend

Open `prospecting-board/index.html` in your browser, or use a local server:

```bash
# Using Python
cd prospecting-board
python3 -m http.server 8000

# Then open http://localhost:8000
```

### 3. Test the Integration

1. **Enter Customer Information**
   - Fill in the "Customer Name" field (e.g., "Acme Corporation")
   - Select an "Industry" (e.g., "Financial Services")

2. **Generate Responses**
   - Click any "Generate" button next to a question
   - The system will:
     - Check if the backend is available
     - If available: Query IBM documentation and generate response
     - If unavailable: Fall back to mock data
   - Watch the browser console for integration status

3. **View Results**
   - Generated response appears in the text area
   - Sources are listed below with links to IBM documentation
   - AI-suggested follow-up questions appear at the bottom

## API Endpoints

The backend exposes these endpoints:

### Health Check
```bash
curl http://localhost:3000/health
```

### Search IBM Documentation
```bash
curl -X POST http://localhost:3000/api/ibm-docs/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "hybrid cloud strategy",
    "sources": ["ibm.com", "ibm-docs"],
    "maxResults": 10
  }'
```

### Generate Response
```bash
curl -X POST http://localhost:3000/api/ibm-docs/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are your strategic priorities for 2026?",
    "customerName": "Acme Corporation",
    "industry": "Financial Services"
  }'
```

### Get Industry-Specific Docs
```bash
curl http://localhost:3000/api/ibm-docs/industry/financial-services/topic/digital-transformation
```

### Get Product Documentation
```bash
curl http://localhost:3000/api/ibm-docs/product/watsonx
```

### Extract Insights
```bash
curl -X POST http://localhost:3000/api/ibm-docs/insights \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What IT imperatives are driving your business?",
    "customerName": "Acme Corporation",
    "industry": "Financial Services"
  }'
```

## Features

### 1. **Intelligent Fallback**
- Automatically detects if backend is available
- Falls back to mock data if backend is down
- Seamless user experience

### 2. **Response Caching**
- Frontend caches responses for 5 minutes
- Reduces API calls and improves performance
- Cache is per question/customer/industry combination

### 3. **Source Attribution**
- All responses include source citations
- Links to original IBM documentation
- Relevance scores for each source

### 4. **Multi-Source Search**
- Searches across multiple IBM platforms:
  - IBM.com
  - IBM Docs
  - IBM Developer
  - IBM Redbooks
- Aggregates and ranks results

### 5. **Industry-Specific Content**
- Tailors responses based on selected industry
- Provides relevant IBM solutions and case studies
- Industry-specific terminology and examples

## Troubleshooting

### Backend Not Starting
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>

# Restart the backend
npm run dev
```

### CORS Errors
The backend is configured to accept requests from `http://localhost:8000`. If using a different port, update `.env`:

```env
CORS_ORIGIN=http://localhost:YOUR_PORT
```

### No Responses Generated
1. Check browser console for errors
2. Verify backend is running: `curl http://localhost:3000/health`
3. Check backend logs for errors
4. Ensure customer name and industry are filled in

### TypeScript Compilation Errors
The IBM docs module compiles cleanly. Other existing errors in the codebase don't affect the IBM docs integration.

## Environment Variables

Create a `.env` file in `prospecting-board/backend/`:

```env
# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:8000

# IBM Docs Configuration
IBM_DOCS_CACHE_TTL=3600
IBM_DOCS_MAX_RESULTS=10
IBM_DOCS_REQUEST_TIMEOUT=10000
IBM_DOCS_RATE_LIMIT_WINDOW=60000
IBM_DOCS_RATE_LIMIT_MAX=30

# Optional: OpenAI for enhanced responses
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
```

## Architecture

```
Frontend (index.html)
    ↓
ibm-docs-integration.js (API Client)
    ↓
Backend API (Express)
    ↓
IBMDocsService
    ↓
IBM Documentation Sources
```

## Next Steps

1. **Add OpenAI Integration**
   - Set `OPENAI_API_KEY` in `.env`
   - Responses will be enhanced with GPT-4

2. **Customize Sources**
   - Modify `ibm-docs.service.ts` to add more sources
   - Adjust relevance scoring algorithm

3. **Add Authentication**
   - Implement IBM Verify authentication
   - Secure API endpoints

4. **Deploy to Production**
   - Follow `DEPLOYMENT_GUIDE.md`
   - Configure production environment variables
   - Set up monitoring and logging

## Support

For detailed API documentation, see:
- `prospecting-board/backend/IBM_DOCS_INTEGRATION.md`

For architecture details, see:
- `prospecting-board-architecture.md`
- `prospecting-board/PRODUCTION_ARCHITECTURE.md`