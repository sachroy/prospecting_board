# API Setup Guide - Research Integration

This guide will help you set up the free API integrations for real customer research data.

## Overview

The AI Prospecting Hub now supports real-time customer research using:
- **Serper API** - Google Search results (2,500 free searches/month)
- **OpenAI API** - AI-powered response generation ($5 free credit)

## Step 1: Get Serper API Key (Free)

1. Go to https://serper.dev
2. Click "Sign Up" or "Get Started"
3. Sign up with your email (Google/GitHub login available)
4. Verify your email
5. Go to your Dashboard
6. Copy your API key (starts with a long string of characters)
7. **Free Tier**: 2,500 searches per month

## Step 2: Get OpenAI API Key (Free $5 Credit)

1. Go to https://platform.openai.com
2. Click "Sign Up" (or "Log In" if you have an account)
3. Verify your email and phone number
4. Go to https://platform.openai.com/api-keys
5. Click "Create new secret key"
6. Give it a name (e.g., "Prospecting Board")
7. Copy the key (starts with "sk-")
8. **Important**: Save this key somewhere safe - you can't see it again!
9. **Free Tier**: $5 credit for new accounts (enough for ~100-200 research queries)

## Step 3: Configure the Application

1. Open `prospecting-board/js/research-api.js` in a text editor
2. Find these lines near the top (around line 11-12):

```javascript
const SERPER_API_KEY = ''; // Get free key from https://serper.dev
const OPENAI_API_KEY = ''; // Get free key from https://platform.openai.com
```

3. Paste your API keys between the quotes:

```javascript
const SERPER_API_KEY = 'your-serper-api-key-here';
const OPENAI_API_KEY = 'sk-your-openai-api-key-here';
```

4. Save the file

## Step 4: Test the Integration

1. Open `prospecting-board/index.html` in your browser
2. Enter a customer name (e.g., "Best Buy")
3. Select an industry
4. Click "Generate" on any question in Section 2
5. You should see:
   - "Using Research API (Serper + OpenAI)" in the browser console
   - Real search results being fetched
   - AI-generated response based on actual Google search data
   - Real sources from the web

## How It Works

### Data Flow:
1. **User clicks "Generate"** → Question sent to Research API
2. **Serper API** → Searches Google for relevant information
3. **Search Results** → Extracts top 5 results, snippets, knowledge graph
4. **OpenAI API** → Analyzes search results and generates intelligent response
5. **Display** → Shows AI response + clickable source links

### Fallback Behavior:
- If APIs not configured → Uses improved mock data
- If API error occurs → Falls back to mock data
- If rate limit hit → Falls back to mock data

## Cost Monitoring

### Serper API:
- **Free Tier**: 2,500 searches/month
- **Usage**: ~1 search per question generated
- **Monitor**: Check dashboard at https://serper.dev/dashboard

### OpenAI API:
- **Free Credit**: $5 for new accounts
- **Cost**: ~$0.002-0.005 per question (GPT-3.5-turbo)
- **Estimate**: $5 = 1,000-2,500 questions
- **Monitor**: Check usage at https://platform.openai.com/usage

## Tips for Staying Within Free Tiers

1. **Use Regenerate Sparingly**: Each regeneration uses API credits
2. **Review Mock Data First**: See if mock data is sufficient before using API
3. **Batch Questions**: Generate multiple questions at once when researching
4. **Monitor Usage**: Check your API dashboards weekly
5. **Set Alerts**: Both platforms allow usage alerts

## Troubleshooting

### "No APIs configured, using mock data"
- Check that API keys are properly pasted in `research-api.js`
- Ensure keys are between the quotes with no extra spaces
- Refresh the browser page after saving changes

### "Research API error"
- Check browser console (F12) for detailed error message
- Verify API keys are valid and not expired
- Check if you've hit rate limits
- Ensure you have internet connection

### "OpenAI API error: 429"
- You've hit the rate limit
- Wait a few minutes and try again
- Check your usage at https://platform.openai.com/usage

### "Serper API error: 401"
- Invalid API key
- Double-check the key in `research-api.js`
- Generate a new key from Serper dashboard

## Security Best Practices

⚠️ **Important**: API keys are sensitive credentials!

### For Development:
- Current setup is fine for local testing
- Keys are in JavaScript file (client-side)
- Only you can see them on your computer

### For Production/Deployment:
- **DO NOT** commit API keys to GitHub
- Move keys to environment variables
- Use backend proxy to hide keys from client
- Implement rate limiting and authentication

### Recommended Production Setup:
1. Create backend API endpoint
2. Store keys in environment variables
3. Frontend calls your backend
4. Backend calls Serper/OpenAI with keys
5. Keys never exposed to browser

## Upgrading to Paid Plans

### When to Upgrade:

**Serper API** - Upgrade if you need:
- More than 2,500 searches/month
- Faster response times
- Additional features (images, news, etc.)
- Pricing: https://serper.dev/pricing

**OpenAI API** - Upgrade if you need:
- More than $5 worth of usage
- GPT-4 for better responses
- Higher rate limits
- Pricing: https://openai.com/pricing

## Support

- **Serper Support**: support@serper.dev
- **OpenAI Support**: https://help.openai.com
- **Application Issues**: Check browser console for errors

## Next Steps

After setup, you can:
1. Test with different customers and industries
2. Compare AI responses vs mock data quality
3. Monitor your API usage
4. Adjust prompts in `research-api.js` for better results
5. Implement additional features (caching, error handling, etc.)

---

**Note**: This integration provides real-time research capabilities using free API tiers. For production use with multiple users, consider implementing a backend proxy and proper authentication.