# 🚀 Team Setup Guide - Prospecting Board

## Quick Start (No Software Required!)

This application works **immediately** without any setup. Simply open `index.html` in your web browser and start using it with mock data.

### ✅ What Works Out of the Box:
- ✅ All sections and features
- ✅ Customer and industry selection
- ✅ All question generation with mock responses
- ✅ Custom questions in all sections
- ✅ AI-generated follow-up suggestions
- ✅ Export to PDF/PowerPoint
- ✅ Data persistence (saved in browser)

---

## 📂 How to Use

### Option 1: Open Locally (Recommended)
1. Download/copy the entire `prospecting-board` folder to your computer
2. Double-click `index.html` to open in your default browser
3. Start using immediately!

### Option 2: Share via Network
1. Place the folder on a shared drive or web server
2. Team members can access via file path or URL
3. Each user's data is saved locally in their browser

---

## 🔧 Optional: API Integration Setup

**Note:** API integration is **completely optional**. The application works perfectly with mock data for demonstrations and testing.

### Why Add API Integration?
- Get real-time data from external sources
- Access live IBM documentation
- Retrieve actual news and research
- Generate responses using AI services

### Available API Integrations

#### 1. **Research API** (News, Web Search, Company Data)
**Location:** `js/research-api.js` (lines 10-20)

```javascript
// Find this section in js/research-api.js
const API_CONFIG = {
  newsApiKey: '',              // Get from: https://newsapi.org
  serpApiKey: '',              // Get from: https://serpapi.com
  openaiApiKey: '',            // Get from: https://openai.com
  perplexityApiKey: ''         // Get from: https://perplexity.ai
};
```

**How to Update:**
1. Open `js/research-api.js` in any text editor (Notepad, TextEdit, VS Code)
2. Find the `API_CONFIG` object (around line 10)
3. Replace empty strings `''` with your API keys
4. Save the file
5. Refresh your browser

**Example:**
```javascript
const API_CONFIG = {
  newsApiKey: 'your-news-api-key-here',
  serpApiKey: 'your-serp-api-key-here',
  openaiApiKey: 'your-openai-key-here',
  perplexityApiKey: 'your-perplexity-key-here'
};
```

---

#### 2. **IBM Docs Integration** (IBM Documentation & Watsonx)
**Location:** `js/ibm-docs-integration.js` (lines 5-15)

```javascript
// Find this section in js/ibm-docs-integration.js
const IBM_CONFIG = {
  backendUrl: 'http://localhost:3000',  // Your backend server URL
  watsonxApiKey: '',                     // IBM Watsonx API key
  watsonxProjectId: ''                   // IBM Watsonx Project ID
};
```

**How to Update:**
1. Open `js/ibm-docs-integration.js` in any text editor
2. Find the `IBM_CONFIG` object (around line 5)
3. Update the values:
   - `backendUrl`: Your backend server URL (if running the backend)
   - `watsonxApiKey`: Your IBM Watsonx API key
   - `watsonxProjectId`: Your IBM Watsonx project ID
4. Save the file
5. Refresh your browser

**Example:**
```javascript
const IBM_CONFIG = {
  backendUrl: 'https://your-backend-server.com',
  watsonxApiKey: 'your-watsonx-api-key',
  watsonxProjectId: 'your-project-id'
};
```

---

#### 3. **LinkedIn Integration** (Contact Search)
**Location:** `js/linkedin-search.js` (lines 8-12)

```javascript
// Find this section in js/linkedin-search.js
const LINKEDIN_CONFIG = {
  backendUrl: 'http://localhost:3000',  // Your backend server URL
  enabled: false                         // Set to true when configured
};
```

**How to Update:**
1. Open `js/linkedin-search.js` in any text editor
2. Find the `LINKEDIN_CONFIG` object (around line 8)
3. Update `backendUrl` to your backend server
4. Set `enabled: true` when ready
5. Save the file
6. Refresh your browser

---

## 🎯 API Priority System

The application uses a smart fallback system:

1. **First Priority:** Research API (if configured)
2. **Second Priority:** IBM Docs API (if configured)
3. **Fallback:** Mock data (always works)

This means:
- ✅ If no APIs are configured → Mock data is used
- ✅ If only one API is configured → That API is used, then mock data
- ✅ If multiple APIs are configured → Best available API is used

---

## 📝 Configuration Checklist

### For Basic Use (No Setup Required)
- [x] Download the folder
- [x] Open `index.html`
- [x] Start using with mock data

### For API Integration (Optional)
- [ ] Obtain API keys from providers
- [ ] Open relevant JS files in text editor
- [ ] Update API configuration objects
- [ ] Save files
- [ ] Refresh browser
- [ ] Test functionality

---

## 🔍 Finding Configuration Files

All configuration is in the `js/` folder:

```
prospecting-board/
├── index.html                    ← Open this to start
├── js/
│   ├── research-api.js          ← News, web search, AI APIs
│   ├── ibm-docs-integration.js  ← IBM Watsonx, documentation
│   ├── linkedin-search.js       ← LinkedIn contact search
│   └── app.js                   ← Main application (no changes needed)
├── css/                         ← Styling (no changes needed)
└── backend/                     ← Optional backend server
```

---

## 🛠️ Editing Configuration Files

### Using Notepad (Windows)
1. Right-click the JS file
2. Select "Open with" → "Notepad"
3. Make your changes
4. File → Save
5. Close Notepad

### Using TextEdit (Mac)
1. Right-click the JS file
2. Select "Open With" → "TextEdit"
3. Make your changes
4. File → Save
5. Close TextEdit

### Using VS Code (Recommended)
1. Open VS Code
2. File → Open Folder → Select `prospecting-board`
3. Navigate to the JS file in the sidebar
4. Make your changes
5. File → Save (or Cmd/Ctrl + S)

---

## 🚨 Troubleshooting

### "The application isn't working"
- **Solution:** Make sure you opened `index.html`, not a JS or CSS file
- **Check:** Look for the title "Prospecting Board" in your browser

### "I updated the API keys but nothing changed"
- **Solution:** Refresh your browser (Ctrl+R or Cmd+R)
- **Check:** Clear browser cache if needed (Ctrl+Shift+R or Cmd+Shift+R)

### "Mock data is still showing after adding API keys"
- **Solution:** Check that you saved the file after editing
- **Check:** Verify API keys are inside the quotes: `'your-key-here'`
- **Check:** Open browser console (F12) to see any error messages

### "Where do I get API keys?"
- **News API:** https://newsapi.org (Free tier available)
- **SERP API:** https://serpapi.com (Free trial available)
- **OpenAI:** https://openai.com (Requires payment)
- **Perplexity:** https://perplexity.ai (API access required)
- **IBM Watsonx:** https://www.ibm.com/watsonx (IBM Cloud account required)

---

## 📊 Data Storage

### Where is my data saved?
- All data is saved in your **browser's local storage**
- Data persists between sessions
- Each browser/computer has its own data

### Sharing data with team
- Use the **Export** buttons (PDF/PPT) to share results
- Data is not automatically synced between team members
- Each person maintains their own customer profiles

### Clearing data
- Click browser settings → Clear browsing data → Local storage
- Or use browser's developer tools (F12) → Application → Local Storage

---

## 🎓 Best Practices

### For Team Rollout
1. ✅ Share the folder via shared drive or email
2. ✅ Send this guide to team members
3. ✅ Start with mock data for training
4. ✅ Add API keys later when ready
5. ✅ Test with one person before full rollout

### For Demonstrations
1. ✅ Use mock data (no setup required)
2. ✅ Pre-fill customer information
3. ✅ Show all features working
4. ✅ Explain API integration is optional

### For Production Use
1. ✅ Configure at least one API integration
2. ✅ Test all features thoroughly
3. ✅ Document your specific API keys (securely)
4. ✅ Train team on export features

---

## 📞 Support

### Need Help?
- Check the troubleshooting section above
- Review the configuration examples
- Verify file paths and API key format
- Check browser console for errors (F12)

### Additional Documentation
- `README.md` - Project overview
- `API_SETUP_GUIDE.md` - Detailed API setup
- `DEPLOYMENT_GUIDE.md` - Advanced deployment options

---

## ✨ Summary

**Remember:** This application works perfectly **without any setup**. API integration is optional and can be added anytime to enhance functionality with real data.

**Quick Start:** Just open `index.html` and start using it!

**Optional Enhancement:** Add API keys to get real-time data when ready.

Happy prospecting! 🎯