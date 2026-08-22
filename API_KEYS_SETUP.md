# API Keys Setup Guide - Production Ready Configuration

This guide walks you through obtaining all necessary API keys to make the Prospecting Board fully production-ready with real-time data.

---

## 🎯 Quick Overview

**Required for Real-Time Research (Section 2):**
- ✅ Serper API (Google Search) - **FREE tier: 2,500 searches/month**
- ✅ OpenAI API - **$5 free credit for new accounts**

**Optional for Enhanced Features:**
- IBM Docs Integration (already configured)
- LinkedIn Scraping (ScrapingBee/Bright Data)
- Microsoft Graph API (Outlook integration)

---

## 1️⃣ Serper API Setup (Google Search)

### What is Serper?
Serper provides real-time Google Search results via API. It powers the research functionality in Section 2.

### Get Your Free API Key

**Step 1: Sign Up**
1. Go to: https://serper.dev
2. Click "Sign Up" or "Get Started"
3. Sign up with Google, GitHub, or email
4. No credit card required for free tier

**Step 2: Get API Key**
1. After login, you'll see your dashboard
2. Your API key is displayed immediately
3. Copy the key (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

**Step 3: Free Tier Details**
- ✅ 2,500 searches per month FREE
- ✅ No credit card required
- ✅ No expiration
- ✅ Real-time Google results
- ✅ Includes news, images, and web results

**Pricing (if you need more):**
- $50/month = 5,000 searches
- $200/month = 25,000 searches
- Enterprise plans available

---

## 2️⃣ OpenAI API Setup

### What is OpenAI?
OpenAI provides GPT-4 and other AI models for generating intelligent responses, analysis, and insights.

### Get Your API Key

**Step 1: Create Account**
1. Go to: https://platform.openai.com/signup
2. Sign up with email or Google
3. Verify your email address
4. Complete phone verification

**Step 2: Get Free Credits**
1. New accounts get **$5 in free credits**
2. Credits expire after 3 months
3. Enough for ~1,000-2,000 AI requests

**Step 3: Get API Key**
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it: "Prospecting Board"
4. Copy the key (format: `<YOUR_OPENAI_API_KEY>`)
5. ⚠️ **IMPORTANT**: Save it immediately - you can't view it again!

**Step 4: Set Up Billing (Optional)**
1. Go to: https://platform.openai.com/account/billing
2. Add payment method for usage beyond free credits
3. Set usage limits to control costs

**Pricing:**
- GPT-4 Turbo: $0.01 per 1K input tokens, $0.03 per 1K output tokens
- GPT-3.5 Turbo: $0.0005 per 1K input tokens, $0.0015 per 1K output tokens
- Average research query: ~$0.02-0.05

**Cost Estimation:**
- 100 research queries/month ≈ $3-5
- 500 research queries/month ≈ $15-25
- 1,000 research queries/month ≈ $30-50

---

## 3️⃣ Configure Your Application

### Option A: Frontend Configuration (Quick Start)

**For Development/Testing:**

1. **Open the research API file:**
   ```bash
   cd prospecting-board
   open js/research-api.js
   ```

2. **Add your API keys (lines 11-12):**
   ```javascript
   const SERPER_API_KEY = 'your_serper_api_key_here';
   const OPENAI_API_KEY = 'your_openai_api_key_here';
   ```

3. **Save the file**

4. **Test it:**
   - Open `index.html` in your browser
   - Enter a customer name
   - Click any "Generate" button in Section 2
   - You should see real research results!

### Option B: Backend Configuration (Production)

**For Production Deployment:**

1. **Navigate to backend:**
   ```bash
   cd prospecting-board/backend
   ```

2. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env file:**
   ```bash
   nano .env
   # or use your preferred editor
   ```

4. **Add your API keys:**
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
   OPENAI_MODEL=gpt-4-turbo-preview
   OPENAI_MAX_TOKENS=2000
   OPENAI_TEMPERATURE=0.7

   # Serper API (for research)
   SERPER_API_KEY=your-serper-api-key-here
   ```

5. **Install dependencies:**
   ```bash
   npm install
   ```

6. **Start the backend:**
   ```bash
   npm run dev
   ```

7. **Update frontend to use backend:**
   In `js/research-api.js`, change the API endpoint:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api/v1';
   ```

---

## 4️⃣ Verify Everything Works

### Test Checklist

**1. Test Serper API:**
```bash
curl -X POST https://google.serper.dev/search \
  -H 'X-API-KEY: your_serper_key' \
  -H 'Content-Type: application/json' \
  -d '{"q":"IBM technology"}'
```

Expected: JSON response with search results

**2. Test OpenAI API:**
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_openai_key" \
  -d '{
    "model": "gpt-4-turbo-preview",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }'
```

Expected: JSON response with AI-generated text

**3. Test in Application:**
1. Open the Prospecting Board
2. Enter customer name: "Microsoft"
3. Select industry: "Information Technology"
4. Click "Generate" on any Section 2 question
5. Wait 3-5 seconds
6. You should see:
   - ✅ Real research results
   - ✅ Source citations with URLs
   - ✅ AI-suggested follow-up questions

---

## 5️⃣ Security Best Practices

### ⚠️ NEVER Commit API Keys to Git

**Add to .gitignore:**
```bash
# API Keys and Secrets
.env
.env.local
.env.production
js/research-api.js
**/config/keys.js
```

**Check if keys are exposed:**
```bash
git log -p | grep -i "api.key\|serper\|openai"
```

### 🔒 Secure Storage Options

**Option 1: Environment Variables (Recommended)**
```bash
# On your server
export SERPER_API_KEY="your_key"
export OPENAI_API_KEY="your_key"
```

**Option 2: Secret Management Services**
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager
- HashiCorp Vault

**Option 3: Backend Proxy (Most Secure)**
- Store keys only on backend server
- Frontend calls your backend API
- Backend makes requests to Serper/OpenAI
- Keys never exposed to browser

---

## 6️⃣ Optional: Additional API Keys

### LinkedIn Scraping (Optional)

**ScrapingBee (Recommended):**
1. Go to: https://www.scrapingbee.com
2. Sign up for free trial (1,000 credits)
3. Get API key from dashboard
4. Add to `.env`:
   ```env
   SCRAPING_BEE_API_KEY=your_key_here
   ```

**Bright Data (Alternative):**
1. Go to: https://brightdata.com
2. Sign up for free trial
3. Create a scraping zone
4. Add to `.env`:
   ```env
   BRIGHT_DATA_API_KEY=your_key_here
   BRIGHT_DATA_ZONE=your_zone_name
   ```

### Microsoft Graph API (Outlook Integration)

**Setup:**
1. Go to: https://portal.azure.com
2. Register new application
3. Add Microsoft Graph permissions
4. Get Client ID and Secret
5. Add to `.env`:
   ```env
   MS_CLIENT_ID=your_client_id
   MS_CLIENT_SECRET=your_client_secret
   MS_TENANT_ID=your_tenant_id
   ```

See `DEPLOYMENT_GUIDE.md` for detailed Microsoft setup.

---

## 7️⃣ Cost Management

### Monitor Usage

**Serper Dashboard:**
- https://serper.dev/dashboard
- View daily/monthly usage
- Set up alerts

**OpenAI Dashboard:**
- https://platform.openai.com/usage
- View token usage and costs
- Set spending limits

### Set Budget Limits

**OpenAI:**
1. Go to: https://platform.openai.com/account/billing/limits
2. Set hard limit (e.g., $50/month)
3. Set soft limit for email alerts (e.g., $25/month)

**Serper:**
- Free tier automatically stops at 2,500 searches
- Upgrade only if needed

### Optimize Costs

**Tips to reduce API costs:**
1. ✅ Cache responses for 24 hours
2. ✅ Use GPT-3.5 Turbo for simple queries
3. ✅ Limit max tokens in responses
4. ✅ Implement rate limiting
5. ✅ Use mock data in development

---

## 8️⃣ Troubleshooting

### Common Issues

**"Invalid API Key" Error:**
- ✅ Check for typos in key
- ✅ Ensure no extra spaces
- ✅ Verify key is active in dashboard
- ✅ Check if key has expired

**"Rate Limit Exceeded":**
- ✅ Wait 60 seconds and retry
- ✅ Check usage in dashboard
- ✅ Upgrade plan if needed
- ✅ Implement request throttling

**"Insufficient Credits":**
- ✅ Add payment method to OpenAI
- ✅ Check billing dashboard
- ✅ Verify credit card is valid

**No Results Returned:**
- ✅ Check browser console for errors
- ✅ Verify API keys are correct
- ✅ Test APIs with curl commands
- ✅ Check network tab in DevTools

---

## 9️⃣ Production Deployment Checklist

Before going live:

- [ ] API keys stored securely (not in code)
- [ ] Environment variables configured
- [ ] Backend proxy implemented (recommended)
- [ ] Rate limiting enabled
- [ ] Error handling implemented
- [ ] Usage monitoring set up
- [ ] Budget limits configured
- [ ] Backup/fallback system ready
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Logging enabled
- [ ] Health checks working

---

## 🎉 You're Ready!

Once you've completed this setup:

1. ✅ Real-time Google search results in Section 2
2. ✅ AI-powered insights and analysis
3. ✅ Source citations with clickable links
4. ✅ Intelligent follow-up questions
5. ✅ Production-ready research capabilities

**Estimated Setup Time:** 15-20 minutes

**Monthly Cost (typical usage):**
- Serper: $0 (free tier)
- OpenAI: $10-30 (depending on usage)
- **Total: ~$10-30/month**

---

## 📞 Support Resources

**Serper:**
- Documentation: https://serper.dev/docs
- Support: support@serper.dev

**OpenAI:**
- Documentation: https://platform.openai.com/docs
- Community: https://community.openai.com
- Support: https://help.openai.com

**Prospecting Board:**
- See `README.md` for application help
- See `API_SETUP_GUIDE.md` for detailed API integration
- See `DEPLOYMENT_GUIDE.md` for production deployment

---

**Made with ❤️ by Bob**