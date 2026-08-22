# Prospecting Board - Sharing Guide

## Quick Answer
✅ **Yes, you can share this dashboard!** Your colleagues can use it with minimal setup.

## Sharing Options

### Option 1: Share the Folder (Recommended)
**Best for:** Colleagues on the same network or using shared drives

1. **Copy the entire `prospecting-board` folder** to:
   - Shared network drive
   - Cloud storage (Google Drive, OneDrive, Dropbox)
   - Email as a ZIP file
   - GitHub/GitLab repository

2. **Your colleague needs to:**
   - Extract/download the folder
   - Open `index.html` in any modern web browser
   - That's it! No installation required.

### Option 2: Host on a Web Server (Best for Teams)
**Best for:** Multiple users, remote access

1. **Deploy to a web server:**
   - GitHub Pages (free)
   - Netlify (free)
   - Vercel (free)
   - Your company's internal web server

2. **Your colleagues:**
   - Just visit the URL
   - Bookmark it for easy access
   - No setup needed at all

---

## What Your Colleagues Need

### ✅ Required (Everyone Has This)
- **Modern web browser**: Chrome, Firefox, Safari, or Edge
- **Internet connection**: For news headlines and source links
- That's it!

### ❌ NOT Required
- ❌ No Node.js installation
- ❌ No npm packages
- ❌ No database setup
- ❌ No server configuration
- ❌ No special software

---

## Setup Steps for Colleagues

### If Sharing the Folder:

```
1. Receive the prospecting-board folder
2. Extract if it's a ZIP file
3. Double-click index.html
4. Dashboard opens in browser
5. Start using immediately!
```

### Personalization (Optional):

Each colleague can personalize their copy:

**To change the name in greeting:**
1. Open `index.html` in a text editor
2. Find line 23: `<span class="header__name">Sachin</span>`
3. Replace "Sachin" with their name
4. Save and refresh browser

---

## Features That Work Offline

✅ **Works without internet:**
- Customer name and industry selection
- Generate AI responses (mock data)
- All UI interactions
- Data persistence (saves in browser)

⚠️ **Requires internet:**
- Real news headlines (falls back to mock data)
- Source links (opens searches)
- LinkedIn contact search
- IBM logo display

---

## Data Privacy & Storage

### Where Data is Stored:
- **Browser's localStorage** (on each user's computer)
- **Not shared** between users
- **Not sent** to any server
- **Persists** until browser cache is cleared

### Each User Has:
- Their own customer data
- Their own generated responses
- Their own saved information
- Complete privacy

---

## NewsAPI Key (Optional)

The dashboard includes a NewsAPI key for real headlines. Your colleagues can:

**Option A: Use the existing key** (easiest)
- Already configured in the code
- Shared API key: `<YOUR_NEWS_API_KEY>`
- Free tier: 100 requests/day
- Works for small teams

**Option B: Get their own key** (recommended for heavy use)
1. Visit https://newsapi.org
2. Sign up for free account
3. Get API key
4. Replace in `js/app.js` line 912

---

## Deployment Guide (For IT Teams)

### GitHub Pages (Free Hosting)

```bash
# 1. Create GitHub repository
# 2. Upload prospecting-board folder
# 3. Enable GitHub Pages in Settings
# 4. Access at: https://username.github.io/prospecting-board
```

### Netlify (Free Hosting)

```bash
# 1. Sign up at netlify.com
# 2. Drag and drop the prospecting-board folder
# 3. Get instant URL: https://your-site.netlify.app
```

### Internal Web Server

```bash
# Copy folder to web server directory
cp -r prospecting-board /var/www/html/

# Access at: http://your-server/prospecting-board
```

---

## Troubleshooting

### "IBM Logo Not Showing"
- **Cause**: No internet connection
- **Fix**: Logo loads from external source, needs internet
- **Alternative**: Works fine without logo

### "Headlines Not Loading"
- **Cause**: API rate limit or no internet
- **Fix**: Automatically falls back to mock headlines
- **Note**: Still fully functional

### "Data Not Saving"
- **Cause**: Browser privacy mode or cookies disabled
- **Fix**: Use normal browser mode
- **Note**: Each browser session is independent

### "Different Name in Greeting"
- **Cause**: HTML file has hardcoded name
- **Fix**: Edit `index.html` line 23 to change name

---

## Best Practices for Teams

### 1. **Centralized Hosting**
- Host on company intranet
- Everyone uses same URL
- Easy updates for all users

### 2. **Version Control**
- Keep in Git repository
- Track changes
- Easy rollback if needed

### 3. **Documentation**
- Share this guide with team
- Create internal wiki page
- Record training video

### 4. **Customization**
- Each team can customize their copy
- Change branding, colors, industries
- Add company-specific features

---

## Quick Start Email Template

```
Subject: Access to Prospecting Board Dashboard

Hi [Colleague Name],

I'm sharing the Prospecting Board dashboard with you!

QUICK START:
1. Download the attached prospecting-board.zip
2. Extract the folder
3. Open index.html in your browser
4. Start prospecting!

NO SETUP REQUIRED - Just open and use!

Features:
✓ AI-powered research questions
✓ Real-time news headlines
✓ LinkedIn contact search
✓ Source citations

Questions? Let me know!

Best,
Sachin
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Can Share?** | ✅ Yes, easily |
| **Setup Required?** | ❌ No, just open HTML |
| **Internet Needed?** | ⚠️ Optional (for news/links) |
| **Installation?** | ❌ None |
| **Cost?** | 💰 Free |
| **Data Shared?** | ❌ No, stored locally |
| **Browser?** | ✅ Any modern browser |

**Bottom Line:** Share the folder, colleagues open `index.html`, and they're ready to go! 🚀