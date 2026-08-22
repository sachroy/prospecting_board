# OpenAI API Setup Guide

## Getting Your OpenAI API Key

### Step 1: Create an OpenAI Account

1. Go to [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Sign up with your email or Google/Microsoft account
3. Verify your email address

### Step 2: Add Payment Method

1. Go to [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. Click "Add payment method"
3. Enter your credit card information
4. Set up billing limits (recommended: $50/month to start)

**Note**: OpenAI requires a payment method even for API usage. There's no free tier for API access, but costs are usage-based and typically very affordable for development.

### Step 3: Generate API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Give it a name (e.g., "Prospecting Dashboard")
4. Copy the key immediately (you won't be able to see it again!)
5. Store it securely

### Step 4: Configure Your Application

1. Navigate to your backend directory:
   ```bash
   cd prospecting-board/backend
   ```

2. Create a `.env` file (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

3. Add your OpenAI API key to `.env`:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=sk-your-actual-api-key-here
   OPENAI_MODEL=gpt-4-turbo-preview
   OPENAI_MAX_TOKENS=2000
   OPENAI_TEMPERATURE=0.7
   ```

4. Restart your backend server:
   ```bash
   npm run dev
   ```

## API Key Security Best Practices

### ✅ DO:
- Store API keys in `.env` files (never commit to git)
- Use different keys for development and production
- Set usage limits in OpenAI dashboard
- Rotate keys periodically
- Monitor usage in OpenAI dashboard

### ❌ DON'T:
- Commit `.env` files to version control
- Share API keys in chat, email, or screenshots
- Use production keys in development
- Expose keys in client-side code
- Leave unused keys active

## Cost Estimation

### GPT-4 Turbo Pricing (as of 2024):
- **Input**: $0.01 per 1K tokens (~750 words)
- **Output**: $0.03 per 1K tokens (~750 words)

### Typical Usage for Prospecting Dashboard:
- **Per question response**: ~500 input tokens + ~300 output tokens
- **Cost per response**: ~$0.01
- **100 responses**: ~$1.00
- **1000 responses**: ~$10.00

### Monthly Estimates:
- **Light usage** (10 responses/day): ~$3/month
- **Medium usage** (50 responses/day): ~$15/month
- **Heavy usage** (200 responses/day): ~$60/month

## Alternative: Use GPT-3.5 Turbo (Cheaper)

For development or cost savings, use GPT-3.5 Turbo:

```env
OPENAI_MODEL=gpt-3.5-turbo
```

**GPT-3.5 Turbo Pricing**:
- **Input**: $0.0005 per 1K tokens (20x cheaper)
- **Output**: $0.0015 per 1K tokens (20x cheaper)
- **Cost per response**: ~$0.0005
- **1000 responses**: ~$0.50/month

## Testing Your Setup

### 1. Check Backend Logs

After starting the server, you should see:
```
OpenAI client initialized with model: gpt-4-turbo-preview
```

### 2. Test API Endpoint

```bash
curl -X POST http://localhost:3000/api/ibm-docs/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are your strategic priorities?",
    "customerName": "Test Company",
    "industry": "Technology"
  }'
```

### 3. Check Response Quality

With OpenAI enabled, responses should:
- Be more coherent and contextual
- Include specific IBM product recommendations
- Reference actual IBM documentation
- Provide actionable insights

## Troubleshooting

### Error: "Invalid API Key"
- Verify key is correct in `.env`
- Check for extra spaces or quotes
- Ensure key starts with `sk-`
- Verify key is active in OpenAI dashboard

### Error: "Rate Limit Exceeded"
- You've hit OpenAI's rate limits
- Wait a few minutes and try again
- Upgrade to higher tier in OpenAI dashboard
- Implement request queuing in code

### Error: "Insufficient Quota"
- Add payment method in OpenAI dashboard
- Check billing limits
- Verify credit card is valid
- Contact OpenAI support if needed

### High Costs
- Switch to GPT-3.5 Turbo
- Reduce `OPENAI_MAX_TOKENS`
- Implement response caching
- Set usage limits in OpenAI dashboard

## Monitoring Usage

### OpenAI Dashboard
1. Go to [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. View daily/monthly usage
3. Set up usage alerts
4. Download usage reports

### Application Logs
The backend logs all OpenAI API calls:
```
[INFO] OpenAI API call - Model: gpt-4-turbo-preview, Tokens: 823
[INFO] OpenAI response generated in 2.3s
```

## Advanced Configuration

### Adjust Response Quality

**More Creative** (higher temperature):
```env
OPENAI_TEMPERATURE=0.9
```

**More Focused** (lower temperature):
```env
OPENAI_TEMPERATURE=0.3
```

### Increase Response Length

```env
OPENAI_MAX_TOKENS=4000
```

**Note**: Higher token limits = higher costs

### Use Different Models

```env
# GPT-4 Turbo (best quality, higher cost)
OPENAI_MODEL=gpt-4-turbo-preview

# GPT-4 (stable, higher cost)
OPENAI_MODEL=gpt-4

# GPT-3.5 Turbo (fast, lower cost)
OPENAI_MODEL=gpt-3.5-turbo

# GPT-3.5 Turbo 16K (longer context)
OPENAI_MODEL=gpt-3.5-turbo-16k
```

## Without OpenAI (Fallback Mode)

The system works without OpenAI by:
1. Using IBM documentation search results
2. Extracting relevant content
3. Formatting responses based on templates
4. Providing source citations

**To disable OpenAI**:
- Remove or comment out `OPENAI_API_KEY` in `.env`
- System automatically falls back to template-based responses

## Support Resources

- **OpenAI Documentation**: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **API Reference**: [https://platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference)
- **Community Forum**: [https://community.openai.com](https://community.openai.com)
- **Status Page**: [https://status.openai.com](https://status.openai.com)

## Next Steps

1. ✅ Get OpenAI API key
2. ✅ Add to `.env` file
3. ✅ Restart backend server
4. ✅ Test with a question
5. ✅ Monitor usage and costs
6. ✅ Adjust settings as needed

Once configured, your Prospecting Dashboard will generate high-quality, contextual responses powered by GPT-4 and IBM documentation!