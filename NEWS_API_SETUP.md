# News API Setup for Section 3 Headlines

## Overview
Section 3 (Tech Headlines) can fetch real news articles about your customer using the NewsAPI service.

## Setup Instructions

### Option 1: Use NewsAPI (Recommended)

1. **Get a Free API Key**
   - Go to https://newsapi.org/register
   - Sign up for a free account
   - Copy your API key

2. **Add API Key to Code**
   - Open `prospecting-board/js/app.js`
   - Find line ~706: `const NEWS_API_KEY = 'YOUR_API_KEY_HERE';`
   - Replace `'YOUR_API_KEY_HERE'` with your actual API key
   - Example: `const NEWS_API_KEY = 'abc123def456';`

3. **Test It**
   - Open `index.html` in your browser
   - Enter a customer name (e.g., "Microsoft", "Apple", "IBM")
   - Headlines will automatically refresh after 1.5 seconds
   - Click the arrow on any headline to open the full article

### Option 2: Use Mock Headlines (No API Key Required)

If you don't want to use a real API:
- The app automatically falls back to mock headlines
- Mock headlines are generated based on the customer name
- Clicking arrows opens a Google search for that topic
- This works out of the box with no setup

## How It Works

### Automatic Refresh
- Headlines automatically update when you type a customer name
- Uses debouncing (1.5 second delay) to avoid excessive API calls
- Shows a notification when fetching/updating headlines

### Article Links
- Each headline has a clickable arrow icon
- Opens the full article in a new tab
- Works with both real API articles and mock headlines

### API Limits
- Free NewsAPI tier: 100 requests per day
- Headlines are cached in the browser
- Debouncing reduces unnecessary API calls

## Troubleshooting

**Headlines not updating?**
- Check that you entered the API key correctly
- Make sure you have an internet connection
- Check browser console for error messages
- Free API keys don't work on localhost in production mode

**"News API key not configured" message?**
- This means the API key is still set to 'YOUR_API_KEY_HERE'
- The app will use mock headlines instead
- This is normal if you haven't set up the API yet

**Want to use a different news API?**
- You can modify the `fetchHeadlines()` function
- Alternative APIs: Google News API, Bing News API, Currents API
- Update the `NEWS_API_URL` and request format accordingly

## Features

✅ Automatic headline refresh when customer name changes
✅ Real-time news articles from 50,000+ sources
✅ Clickable links to full articles
✅ Time-ago formatting (e.g., "2h ago", "1d ago")
✅ Graceful fallback to mock headlines
✅ Debounced API calls to save quota
✅ Source attribution for each article

## Example Customer Names to Try

- Technology companies: Microsoft, Apple, Google, Amazon, IBM
- Financial institutions: JPMorgan, Goldman Sachs, Bank of America
- Retail: Walmart, Target, Best Buy
- Healthcare: UnitedHealth, CVS Health, Johnson & Johnson

The more specific the company name, the better the results!