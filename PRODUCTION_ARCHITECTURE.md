# Prospecting Board - Production Architecture

## Overview
Production-ready architecture with IBM Verify authentication and Microsoft Graph API integration for Outlook.

---

## Architecture Stack

### Frontend
- **Framework**: React 18+ or Next.js 14+
- **State Management**: Redux Toolkit or Zustand
- **UI Library**: Existing custom CSS (maintain design aesthetic)
- **HTTP Client**: Axios with interceptors
- **Authentication**: IBM Verify SDK + MSAL.js (Microsoft Authentication Library)

### Backend
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL 15+ (primary) + Redis (caching/sessions)
- **ORM**: Prisma or TypeORM
- **API Documentation**: OpenAPI/Swagger

### Authentication & Authorization
- **Identity Provider**: IBM Verify (IBM Security Verify)
- **Protocol**: OAuth 2.0 / OpenID Connect (OIDC)
- **Microsoft Integration**: Microsoft Graph API via MSAL
- **Session Management**: JWT tokens + Redis

### External Services
- **Web Scraping**: Puppeteer + Bright Data or ScrapingBee
- **AI Services**: OpenAI GPT-4 API + Anthropic Claude API
- **Email**: Microsoft Graph API (Outlook)
- **Export**: jsPDF + pptxgenjs
- **Search**: Elasticsearch or Algolia (optional)

### Infrastructure
- **Hosting**: AWS, Azure, or IBM Cloud
- **Container**: Docker + Kubernetes
- **CI/CD**: GitHub Actions or GitLab CI
- **Monitoring**: Datadog, New Relic, or IBM Instana
- **Logging**: ELK Stack or Splunk

---

## Authentication Flow with IBM Verify

### 1. IBM Verify Setup

```yaml
IBM Verify Configuration:
  Tenant URL: https://[tenant].verify.ibm.com
  Client ID: [Your Application Client ID]
  Client Secret: [Your Application Client Secret]
  Redirect URI: https://prospecting-board.com/auth/callback
  Scopes:
    - openid
    - profile
    - email
  Token Endpoint: https://[tenant].verify.ibm.com/v1.0/endpoint/default/token
  Authorization Endpoint: https://[tenant].verify.ibm.com/v1.0/endpoint/default/authorize
  UserInfo Endpoint: https://[tenant].verify.ibm.com/v1.0/endpoint/default/userinfo
```

### 2. Authentication Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant IBMVerify
    participant MSGraph
    participant Database

    User->>Frontend: Access Dashboard
    Frontend->>Backend: Check Auth Status
    Backend->>Frontend: Not Authenticated
    Frontend->>User: Show Login Page
    
    User->>Frontend: Click "Login with IBM Verify"
    Frontend->>IBMVerify: Redirect to IBM Verify Login
    User->>IBMVerify: Enter Credentials + MFA
    IBMVerify->>Frontend: Redirect with Auth Code
    
    Frontend->>Backend: Send Auth Code
    Backend->>IBMVerify: Exchange Code for Tokens
    IBMVerify->>Backend: Return Access Token + ID Token
    Backend->>IBMVerify: Validate Token & Get User Info
    IBMVerify->>Backend: Return User Profile
    
    Backend->>Database: Store/Update User Session
    Backend->>Frontend: Return JWT + User Data
    Frontend->>Frontend: Store JWT in Memory/Cookie
    
    User->>Frontend: Click "Connect Outlook"
    Frontend->>Backend: Request MS Auth
    Backend->>MSGraph: Initiate OAuth Flow
    MSGraph->>User: Microsoft Login Consent
    User->>MSGraph: Approve Permissions
    MSGraph->>Backend: Return MS Access Token
    Backend->>Database: Store MS Token (encrypted)
    Backend->>Frontend: Outlook Connected
    
    Frontend->>User: Dashboard Ready
```

### 3. Token Management

```javascript
// Token Storage Strategy
{
  "ibm_verify": {
    "access_token": "encrypted_in_database",
    "refresh_token": "encrypted_in_database",
    "expires_at": "timestamp",
    "token_type": "Bearer"
  },
  "microsoft_graph": {
    "access_token": "encrypted_in_database",
    "refresh_token": "encrypted_in_database",
    "expires_at": "timestamp",
    "scopes": ["Mail.Send", "Mail.Read", "User.Read"]
  },
  "session": {
    "jwt": "httpOnly_secure_cookie",
    "csrf_token": "session_storage",
    "user_id": "uuid"
  }
}
```

---

## Backend API Structure

### Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── ibm-verify.ts
│   │   ├── microsoft-graph.ts
│   │   └── environment.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.types.ts
│   │   ├── research/
│   │   │   ├── research.controller.ts
│   │   │   ├── research.service.ts
│   │   │   ├── scraper.service.ts
│   │   │   ├── ai.service.ts
│   │   │   └── research.routes.ts
│   │   ├── contacts/
│   │   │   ├── contacts.controller.ts
│   │   │   ├── contacts.service.ts
│   │   │   ├── linkedin.service.ts
│   │   │   └── contacts.routes.ts
│   │   ├── email/
│   │   │   ├── email.controller.ts
│   │   │   ├── email.service.ts
│   │   │   ├── outlook.service.ts
│   │   │   └── email.routes.ts
│   │   ├── export/
│   │   │   ├── export.controller.ts
│   │   │   ├── pdf.service.ts
│   │   │   ├── ppt.service.ts
│   │   │   └── export.routes.ts
│   │   └── users/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       └── users.routes.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── customer.model.ts
│   │   ├── research.model.ts
│   │   └── session.model.ts
│   ├── utils/
│   │   ├── encryption.ts
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env.production
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

### API Endpoints

```yaml
Authentication Endpoints:
  POST /api/v1/auth/login
    - Initiates IBM Verify OAuth flow
    - Returns: Authorization URL
  
  GET /api/v1/auth/callback
    - Handles IBM Verify callback
    - Exchanges code for tokens
    - Returns: JWT + User data
  
  POST /api/v1/auth/refresh
    - Refreshes expired tokens
    - Returns: New JWT
  
  POST /api/v1/auth/logout
    - Invalidates session
    - Clears tokens
  
  GET /api/v1/auth/microsoft/connect
    - Initiates Microsoft OAuth flow
    - Returns: MS Authorization URL
  
  GET /api/v1/auth/microsoft/callback
    - Handles Microsoft callback
    - Stores MS tokens
    - Returns: Success status

Research Endpoints:
  POST /api/v1/research/generate
    - Body: { customerId, questionId, question }
    - Triggers AI research generation
    - Returns: Generated insights
  
  GET /api/v1/research/headlines/:customerId
    - Fetches tech headlines for customer
    - Returns: Array of headlines
  
  POST /api/v1/research/scrape
    - Body: { url, selectors }
    - Scrapes web data
    - Returns: Scraped content

Contacts Endpoints:
  GET /api/v1/contacts/:customerId
    - Fetches contact personas
    - Returns: Array of contacts
  
  POST /api/v1/contacts/search
    - Body: { company, role }
    - Searches LinkedIn/databases
    - Returns: Contact matches

Email Endpoints:
  POST /api/v1/email/compose
    - Body: { customerId, sections }
    - Generates email summary
    - Returns: Email content
  
  POST /api/v1/email/send
    - Body: { to, subject, body }
    - Sends via Microsoft Graph API
    - Returns: Send status

Export Endpoints:
  POST /api/v1/export/pdf
    - Body: { sectionId, data }
    - Generates PDF
    - Returns: PDF file URL
  
  POST /api/v1/export/ppt
    - Body: { sectionId, data }
    - Generates PowerPoint
    - Returns: PPT file URL

Customer Endpoints:
  GET /api/v1/customers
    - Lists user's customers
    - Returns: Array of customers
  
  POST /api/v1/customers
    - Body: { name, industry }
    - Creates new customer
    - Returns: Customer object
  
  GET /api/v1/customers/:id
    - Fetches customer details
    - Returns: Customer object
  
  PUT /api/v1/customers/:id
    - Updates customer
    - Returns: Updated customer
  
  DELETE /api/v1/customers/:id
    - Deletes customer
    - Returns: Success status
```

---

## Database Schema

### PostgreSQL Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String      @id @default(uuid())
  email             String      @unique
  firstName         String?
  lastName          String?
  ibmVerifyId       String      @unique
  ibmVerifyToken    String?     @db.Text // Encrypted
  msGraphToken      String?     @db.Text // Encrypted
  msGraphRefresh    String?     @db.Text // Encrypted
  msTokenExpiry     DateTime?
  role              UserRole    @default(USER)
  isActive          Boolean     @default(true)
  lastLogin         DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  customers         Customer[]
  sessions          Session[]
  researchHistory   Research[]
  
  @@index([email])
  @@index([ibmVerifyId])
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model Session {
  id            String    @id @default(uuid())
  userId        String
  token         String    @unique @db.Text
  refreshToken  String?   @db.Text
  expiresAt     DateTime
  ipAddress     String?
  userAgent     String?
  isValid       Boolean   @default(true)
  createdAt     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
}

model Customer {
  id            String      @id @default(uuid())
  userId        String
  name          String
  industry      Industry
  website       String?
  description   String?     @db.Text
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  research      Research[]
  contacts      Contact[]
  headlines     Headline[]
  
  @@index([userId])
  @@index([name])
}

enum Industry {
  AEROSPACE_DEFENSE
  BANKING_FINANCIAL
  ENERGY_UTILITIES
  HEALTHCARE_LIFE_SCIENCES
  INSURANCE
  MANUFACTURING_AUTOMOTIVE
  FEDERAL
  PUBLIC_SECTOR
  RETAIL_CONSUMER_GOODS
  TELECOMMUNICATIONS
}

model Research {
  id            String      @id @default(uuid())
  userId        String
  customerId    String
  questionId    String
  question      String      @db.Text
  response      String      @db.Text
  sources       Json?       // Array of source URLs
  aiModel       String?     // "gpt-4", "claude-3", etc.
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  customer      Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([customerId])
  @@index([questionId])
}

model Contact {
  id            String      @id @default(uuid())
  customerId    String
  name          String
  role          String
  email         String?
  linkedinUrl   String?
  phone         String?
  department    String?
  responsibilities String?  @db.Text
  source        String?     // "linkedin", "company_website", "manual"
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  customer      Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@index([customerId])
  @@index([email])
}

model Headline {
  id            String      @id @default(uuid())
  customerId    String
  title         String      @db.Text
  source        String
  url           String      @db.Text
  publishedAt   DateTime
  summary       String?     @db.Text
  createdAt     DateTime    @default(now())
  
  customer      Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@index([customerId])
  @@index([publishedAt])
}

model AuditLog {
  id            String      @id @default(uuid())
  userId        String?
  action        String
  resource      String
  resourceId    String?
  details       Json?
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime    @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

---

## Environment Configuration

### .env.example

```bash
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://prospecting-board.com
FRONTEND_URL=https://prospecting-board.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prospecting_board
REDIS_URL=redis://localhost:6379

# IBM Verify
IBM_VERIFY_TENANT_URL=https://[tenant].verify.ibm.com
IBM_VERIFY_CLIENT_ID=your_client_id
IBM_VERIFY_CLIENT_SECRET=your_client_secret
IBM_VERIFY_REDIRECT_URI=https://prospecting-board.com/auth/callback
IBM_VERIFY_SCOPE=openid profile email

# Microsoft Graph API
MS_CLIENT_ID=your_microsoft_client_id
MS_CLIENT_SECRET=your_microsoft_client_secret
MS_TENANT_ID=your_tenant_id
MS_REDIRECT_URI=https://prospecting-board.com/auth/microsoft/callback
MS_SCOPES=Mail.Send Mail.Read User.Read

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
ANTHROPIC_MODEL=claude-3-opus-20240229

# Web Scraping
BRIGHT_DATA_API_KEY=your_bright_data_key
SCRAPING_BEE_API_KEY=your_scraping_bee_key

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=prospecting-board-files

# Monitoring
DATADOG_API_KEY=your_datadog_key
SENTRY_DSN=your_sentry_dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://prospecting-board.com

# Session
SESSION_SECRET=your_session_secret
SESSION_MAX_AGE=86400000
```

---

## Security Considerations

### 1. Token Security
- Store tokens encrypted in database using AES-256-GCM
- Use httpOnly, secure, sameSite cookies for JWT
- Implement token rotation
- Set appropriate token expiration times

### 2. API Security
- Rate limiting per user/IP
- Request validation with Joi or Zod
- SQL injection prevention (Prisma ORM)
- XSS protection headers
- CSRF tokens for state-changing operations
- Content Security Policy (CSP)

### 3. Data Protection
- Encrypt sensitive data at rest
- Use TLS 1.3 for data in transit
- Implement field-level encryption for PII
- Regular security audits
- GDPR/CCPA compliance

### 4. Authentication Security
- Multi-factor authentication via IBM Verify
- Password policies (if applicable)
- Account lockout after failed attempts
- Session timeout
- Secure password reset flow

---

## Deployment Strategy

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: prospecting_board
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## Monitoring & Logging

### Application Monitoring
- **Metrics**: Response times, error rates, throughput
- **Alerts**: Set up for critical errors, high latency, downtime
- **Dashboards**: Real-time system health visualization

### Logging Strategy
```javascript
{
  "level": "info",
  "timestamp": "2026-05-04T22:43:54.764Z",
  "userId": "uuid",
  "action": "research.generate",
  "customerId": "uuid",
  "duration": 1234,
  "status": "success",
  "metadata": {}
}
```

---

## Next Steps for Implementation

1. **Set up IBM Verify tenant** and configure OAuth application
2. **Register Microsoft Azure AD app** for Graph API access
3. **Provision infrastructure** (database, Redis, hosting)
4. **Implement backend API** following the structure above
5. **Integrate authentication flows** with IBM Verify + Microsoft
6. **Connect AI services** (OpenAI, Claude)
7. **Implement web scraping** with proper rate limiting
8. **Set up CI/CD pipeline** for automated deployments
9. **Configure monitoring** and alerting
10. **Perform security audit** and penetration testing
11. **Load testing** and performance optimization
12. **Documentation** for API and deployment
