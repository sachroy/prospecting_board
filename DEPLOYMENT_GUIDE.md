# Prospecting Board - Production Deployment Guide

Complete guide for deploying the Prospecting Board dashboard with IBM Verify authentication and Microsoft Outlook integration.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [IBM Verify Setup](#ibm-verify-setup)
3. [Microsoft Azure AD Setup](#microsoft-azure-ad-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Environment Configuration](#environment-configuration)
8. [Testing](#testing)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Services

- **IBM Security Verify** tenant (https://www.ibm.com/verify)
- **Microsoft Azure** subscription (for Azure AD and Graph API)
- **Database**: PostgreSQL 15+ instance
- **Cache**: Redis 7+ instance
- **Hosting**: AWS, Azure, IBM Cloud, or similar
- **Domain**: Custom domain with SSL certificate

### Development Tools

```bash
# Required software
- Node.js 20+ LTS
- npm 10+
- Docker & Docker Compose
- Git
- PostgreSQL client (psql)
- Redis CLI

# Verify installations
node --version  # Should be v20.x.x or higher
npm --version   # Should be v10.x.x or higher
docker --version
psql --version
redis-cli --version
```

---

## IBM Verify Setup

### Step 1: Create IBM Verify Tenant

1. Go to https://www.ibm.com/verify
2. Sign up for IBM Security Verify (free trial available)
3. Complete tenant setup
4. Note your tenant URL: `https://[your-tenant].verify.ibm.com`

### Step 2: Register Application

1. Log into IBM Verify Admin Console
2. Navigate to **Applications** → **Add Application**
3. Select **Custom Application** → **OAuth 2.0 / OIDC**
4. Configure application:

```yaml
Application Name: Prospecting Board
Application Type: Web Application
Grant Types:
  - Authorization Code
  - Refresh Token
Redirect URIs:
  - https://your-domain.com/api/v1/auth/callback
  - http://localhost:3000/api/v1/auth/callback (for development)
Scopes:
  - openid
  - profile
  - email
Token Endpoint Authentication Method: client_secret_post
```

5. **Save** and note the following:
   - Client ID
   - Client Secret
   - Tenant URL

### Step 3: Configure User Access

1. Navigate to **Access Policies**
2. Create new policy for Prospecting Board
3. Assign users/groups who should have access
4. Enable Multi-Factor Authentication (recommended)

### Step 4: Test IBM Verify Configuration

```bash
# Test authorization endpoint
curl "https://[tenant].verify.ibm.com/v1.0/endpoint/default/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/api/v1/auth/callback&scope=openid%20profile%20email"

# Should return HTML login page or redirect
```

---

## Microsoft Azure AD Setup

### Step 1: Register Application in Azure Portal

1. Go to https://portal.azure.com
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**

```yaml
Name: Prospecting Board
Supported account types: Single tenant
Redirect URI:
  Platform: Web
  URI: https://your-domain.com/api/v1/auth/microsoft/callback
```

4. Click **Register**

### Step 2: Configure API Permissions

1. In your app, go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Add the following permissions:

```
- Mail.Send
- Mail.Read
- User.Read
- Calendars.ReadWrite (optional)
- Contacts.Read (optional)
```

4. Click **Add permissions**
5. Click **Grant admin consent** (requires admin privileges)

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `Prospecting Board Production`
4. Expires: 24 months (or custom)
5. Click **Add**
6. **Copy the secret value immediately** (you won't see it again)

### Step 4: Note Configuration Details

From the **Overview** page, copy:
- Application (client) ID
- Directory (tenant) ID
- Client secret (from previous step)

### Step 5: Test Microsoft Graph API

```bash
# Test with your credentials
curl -X POST https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=https://graph.microsoft.com/.default" \
  -d "grant_type=client_credentials"

# Should return access token
```

---

## Database Setup

### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15

# Create database and user
psql postgres
CREATE DATABASE prospecting_board;
CREATE USER pb_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE prospecting_board TO pb_user;
\q
```

### Option 2: Cloud Database (Recommended for Production)

**AWS RDS:**
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier prospecting-board-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password YourSecurePassword \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name your-subnet-group
```

**Azure Database for PostgreSQL:**
```bash
# Create Azure PostgreSQL
az postgres flexible-server create \
  --resource-group prospecting-board-rg \
  --name prospecting-board-db \
  --location eastus \
  --admin-user pbadmin \
  --admin-password YourSecurePassword \
  --sku-name Standard_B1ms \
  --version 15
```

### Redis Setup

```bash
# Local Redis
brew install redis
brew services start redis

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine

# Cloud Redis (AWS ElastiCache, Azure Cache for Redis, etc.)
```

---

## Backend Deployment

### Step 1: Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-org/prospecting-board.git
cd prospecting-board/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` with your actual values:

```bash
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/prospecting_board
REDIS_URL=redis://host:6379

# IBM Verify (from Step 2 of IBM Verify Setup)
IBM_VERIFY_TENANT_URL=https://your-tenant.verify.ibm.com
IBM_VERIFY_CLIENT_ID=your_client_id
IBM_VERIFY_CLIENT_SECRET=your_client_secret
IBM_VERIFY_REDIRECT_URI=https://api.your-domain.com/api/v1/auth/callback

# Microsoft Graph (from Azure AD Setup)
MS_CLIENT_ID=your_microsoft_client_id
MS_CLIENT_SECRET=your_microsoft_client_secret
MS_TENANT_ID=your_tenant_id
MS_REDIRECT_URI=https://api.your-domain.com/api/v1/auth/microsoft/callback

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your_encryption_key_here

# OpenAI
OPENAI_API_KEY=sk-your-key

# Add other services as needed
```

### Step 3: Database Migration

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:prod

# Verify database
npm run prisma:studio
```

### Step 4: Build Application

```bash
# Build TypeScript
npm run build

# Test build
npm run start:prod
```

### Step 5: Deploy with Docker

```bash
# Build Docker image
docker build -t prospecting-board-backend:latest .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### Step 6: Deploy to Cloud

**AWS Elastic Beanstalk:**
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-20 prospecting-board

# Create environment
eb create prospecting-board-prod

# Deploy
eb deploy
```

**Azure App Service:**
```bash
# Create App Service
az webapp create \
  --resource-group prospecting-board-rg \
  --plan prospecting-board-plan \
  --name prospecting-board-api \
  --runtime "NODE:20-lts"

# Deploy
az webapp deployment source config-zip \
  --resource-group prospecting-board-rg \
  --name prospecting-board-api \
  --src backend.zip
```

**IBM Cloud:**
```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh

# Login
ibmcloud login

# Deploy
ibmcloud cf push prospecting-board-api
```

---

## Frontend Deployment

### Step 1: Update Frontend Configuration

```javascript
// Update API endpoint in frontend
// src/config/api.ts
export const API_BASE_URL = 'https://api.your-domain.com/api/v1';
```

### Step 2: Build Frontend

```bash
cd ../  # Back to root
# If using React/Next.js
npm run build

# Output will be in dist/ or .next/ directory
```

### Step 3: Deploy Frontend

**Vercel (Recommended for Next.js):**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**AWS S3 + CloudFront:**
```bash
# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

## Environment Configuration

### Production Checklist

- [ ] All environment variables set correctly
- [ ] Database connection tested
- [ ] Redis connection tested
- [ ] IBM Verify OAuth flow tested
- [ ] Microsoft Graph API tested
- [ ] SSL certificates installed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

### Security Hardening

```bash
# 1. Enable HTTPS only
# 2. Set secure headers (Helmet.js)
# 3. Enable CSRF protection
# 4. Implement rate limiting
# 5. Use environment-specific secrets
# 6. Enable database encryption at rest
# 7. Rotate secrets regularly
# 8. Enable audit logging
# 9. Set up WAF (Web Application Firewall)
# 10. Regular security scans
```

---

## Testing

### Backend API Tests

```bash
cd backend

# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] User can log in with IBM Verify
- [ ] User can connect Microsoft Outlook
- [ ] Customer creation works
- [ ] Research generation works
- [ ] Headlines are fetched
- [ ] Contacts are retrieved
- [ ] Email can be sent via Outlook
- [ ] PDF export works
- [ ] PPT export works
- [ ] Session persists correctly
- [ ] Logout works properly

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js
```

---

## Monitoring & Maintenance

### Application Monitoring

**Datadog Setup:**
```bash
# Install Datadog agent
DD_API_KEY=your_key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"

# Configure APM
# Add to your app
npm install dd-trace
```

**Sentry Setup:**
```bash
# Install Sentry
npm install @sentry/node

# Initialize in app
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Health Checks

```bash
# API health endpoint
curl https://api.your-domain.com/health

# Database health
curl https://api.your-domain.com/health/db

# Redis health
curl https://api.your-domain.com/health/redis
```

### Backup Strategy

```bash
# Automated PostgreSQL backups
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U pb_user prospecting_board > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/

# Set up cron job
0 2 * * * /path/to/backup-script.sh
```

### Log Management

```bash
# View application logs
docker-compose logs -f app

# Search logs
grep "ERROR" logs/app.log

# Rotate logs
logrotate /etc/logrotate.d/prospecting-board
```

---

## Troubleshooting

### Common Issues

**1. IBM Verify Authentication Fails**
```bash
# Check configuration
curl https://your-tenant.verify.ibm.com/.well-known/openid-configuration

# Verify redirect URI matches exactly
# Check client ID and secret
# Ensure scopes are correct
```

**2. Microsoft Graph API Errors**
```bash
# Test token acquisition
# Check API permissions in Azure Portal
# Verify admin consent was granted
# Check token expiration
```

**3. Database Connection Issues**
```bash
# Test connection
psql $DATABASE_URL

# Check firewall rules
# Verify credentials
# Check SSL requirements
```

**4. Redis Connection Issues**
```bash
# Test Redis
redis-cli -h host -p 6379 ping

# Check Redis memory
redis-cli info memory
```

**5. CORS Errors**
```bash
# Verify CORS_ORIGIN in .env
# Check frontend URL matches
# Ensure credentials: true if using cookies
```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm run start:prod

# Check specific module
DEBUG=ibm-verify,microsoft-graph npm run start:prod
```

### Support Resources

- **IBM Verify Documentation**: https://docs.verify.ibm.com
- **Microsoft Graph Documentation**: https://docs.microsoft.com/graph
- **Prisma Documentation**: https://www.prisma.io/docs
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## Post-Deployment Checklist

- [ ] All services running
- [ ] Health checks passing
- [ ] Monitoring dashboards configured
- [ ] Alerts set up
- [ ] Backup tested and verified
- [ ] Documentation updated
- [ ] Team trained on new system
- [ ] Rollback plan documented
- [ ] Performance baseline established
- [ ] Security scan completed

---

## Maintenance Schedule

### Daily
- Monitor error rates
- Check system health
- Review critical alerts

### Weekly
- Review application logs
- Check database performance
- Update dependencies (security patches)

### Monthly
- Full security audit
- Performance optimization review
- Backup restoration test
- Update documentation

### Quarterly
- Rotate secrets and keys
- Review and update access policies
- Capacity planning review
- Disaster recovery drill

---

## Scaling Considerations

### Horizontal Scaling

```yaml
# Kubernetes deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prospecting-board-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: prospecting-board
  template:
    metadata:
      labels:
        app: prospecting-board
    spec:
      containers:
      - name: api
        image: prospecting-board-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

### Database Scaling

- Enable read replicas for heavy read operations
- Implement connection pooling (PgBouncer)
- Consider database sharding for large datasets
- Use Redis for caching frequently accessed data

### CDN Configuration

- Use CloudFront, Cloudflare, or Akamai
- Cache static assets
- Enable compression
- Implement edge caching for API responses

---

## Success Metrics

Track these KPIs post-deployment:

- **Uptime**: Target 99.9%
- **Response Time**: < 200ms (p95)
- **Error Rate**: < 0.1%
- **Authentication Success Rate**: > 99%
- **Email Send Success Rate**: > 98%
- **User Satisfaction**: > 4.5/5

---

**Deployment Complete! 🎉**

For additional support, contact your DevOps team or refer to the technical documentation.