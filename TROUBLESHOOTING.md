# Troubleshooting Guide - Getting Mock Data Instead of Real API Results

## 🔍 Problem: Section 2 Shows Mock Data Despite API Keys Being Configured

If you're seeing mock/placeholder responses in Section 2 instead of real research data, follow these steps:

---

## ✅ Step 1: Hard Refresh Your Browser

The browser is likely caching the old JavaScript file. Try these methods:

### Method 1: Hard Refresh (Recommended)
**Windows/Linux:**
- Chrome/Edge: `Ctrl + Shift + R` or `Ctrl + F5`
- Firefox: `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**
- Chrome/Edge: `Cmd + Shift + R`
- Firefox: `Cmd + Shift + R`
- Safari: `Cmd + Option + R`

### Method 2: Clear Cache Manually
1. Open Developer Tools (`F12`)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Method 3: Incognito/Private Mode
1. Open incognito/private window
2. Navigate to your prospecting board
3. Test if real data appears

---

## ✅ Step 2: Verify API Keys Are Loaded

1. **Open Browser Console** (`F12` → Console tab)

2. **Run this command:**
   ```javascript
   window.ResearchAPI.getAPIStatus()
   ```

3. **Expected Output:**
   ```javascript
   {
     configured: true,
     serperConfigured: true,
     openaiConfigured: true
   }
   ```

4. **If you see `false` values:**
   - The JavaScript file wasn't updated
   - Try hard refresh again
   - Check if file was saved correctly

---

## ✅ Step 3: Test API Keys Directly

### Test Serper API:
```javascript
// In browser console:
fetch('https://google.serper.dev/search', {
  method: 'POST',
  headers: {
    'X-API-KEY': '<YOUR_SERPER_API_KEY>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ q: 'IBM technology' })
})
.then(r => r.json())
.then(d => console.log('Serper works!', d))
.catch(e => console.error('Serper error:', e));
```

**Expected:** Should see search results

### Test OpenAI API:
```javascript
// In browser console:
fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <YOUR_OPENAI_API_KEY>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4-turbo-preview',
    messages: [{role: 'user', content: 'Say hello'}],
    max_tokens: 10
  })
})
.then(r => r.json())
.then(d => console.log('OpenAI works!', d))
.catch(e => console.error('OpenAI error:', e));
```

**Expected:** Should see AI response

**If you see errors:**
- `401 Unauthorized`: API key is invalid or expired
- `429 Too Many Requests`: Rate limit or no credits
- `403 Forbidden`: API key doesn't have access

---

## ✅ Step 4: Check Browser Console for Errors

1. Open Developer Tools (`F12`)
2. Go to Console tab
3. Click "Generate" on any Section 2 question
4. Look for errors in red

### Common Errors:

**Error: "CORS policy"**
- **Cause:** Browser blocking API requests
- **Solution:** APIs should work from file:// or http://localhost
- **Workaround:** Use a local server (see Step 5)

**Error: "Failed to fetch"**
- **Cause:** Network issue or API down
- **Solution:** Check internet connection, try again

**Error: "401 Unauthorized"**
- **Cause:** Invalid API key
- **Solution:** Double-check keys in `js/research-api.js`

**Error: "429 Too Many Requests"**
- **Cause:** Rate limit or no OpenAI credits
- **Solution:** Wait or add payment method to OpenAI

---

## ✅ Step 5: Use a Local Server (If CORS Issues)

Some browsers block API requests from `file://` URLs. Use a local server:

### Option 1: Python (Easiest)
```bash
cd prospecting-board
python -m http.server 8000
# Then open: http://localhost:8000
```

### Option 2: Node.js
```bash
cd prospecting-board
npx http-server -p 8000
# Then open: http://localhost:8000
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## ✅ Step 6: Verify File Was Saved

1. **Open the file:**
   ```bash
   cd prospecting-board
   cat js/research-api.js | grep "SERPER_API_KEY"
   ```

2. **Should see:**
   ```javascript
   const SERPER_API_KEY = '<YOUR_SERPER_API_KEY>';
   ```

3. **If you see empty quotes `''`:**
   - File wasn't saved
   - Re-edit and save again

---

## ✅ Step 7: Check Network Tab

1. Open Developer Tools (`F12`)
2. Go to Network tab
3. Click "Generate" on Section 2 question
4. Look for requests to:
   - `google.serper.dev` (should see 200 OK)
   - `api.openai.com` (should see 200 OK)

**If you don't see these requests:**
- APIs aren't being called
- JavaScript file not loaded
- Hard refresh needed

**If you see 401/403 errors:**
- API keys are invalid
- Check keys in OpenAI/Serper dashboards

**If you see 429 errors:**
- Rate limit hit
- No OpenAI credits
- Add payment method

---

## ✅ Step 8: Force JavaScript Reload

Update the HTML to force browser to reload JavaScript:

1. **Open `index.html`**
2. **Find this line (near bottom):**
   ```html
   <script src="js/research-api.js?v=3.0"></script>
   ```
3. **Change version number:**
   ```html
   <script src="js/research-api.js?v=4.0"></script>
   ```
4. **Save and refresh browser**

---

## 🎯 Quick Diagnostic Checklist

Run through this checklist:

- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Opened in incognito mode
- [ ] Checked console for errors
- [ ] Verified API status returns `true`
- [ ] Tested APIs directly in console
- [ ] Using local server (not file://)
- [ ] Checked Network tab for API calls
- [ ] Verified file was saved with keys
- [ ] Updated version number in HTML

---

## 🔧 Still Not Working?

### Last Resort Solutions:

**1. Completely Clear Browser Data:**
```
Chrome: Settings → Privacy → Clear browsing data
- Time range: All time
- Check: Cached images and files
- Click: Clear data
```

**2. Try Different Browser:**
- If using Chrome, try Firefox
- If using Firefox, try Chrome
- Test in Safari (Mac)

**3. Check API Key Validity:**
- Serper: https://serper.dev/dashboard
- OpenAI: https://platform.openai.com/api-keys
- Verify keys are active and have credits

**4. Re-add API Keys:**
```bash
# Edit the file again
cd prospecting-board
nano js/research-api.js

# Lines 14-15, make sure they look like:
const SERPER_API_KEY = '<YOUR_SERPER_API_KEY>';
const OPENAI_API_KEY = '<YOUR_OPENAI_API_KEY>';

# Save: Ctrl+O, Enter, Ctrl+X
```

---

## 📞 Need More Help?

If you're still seeing mock data after all these steps:

1. **Check browser console** - Screenshot any errors
2. **Check Network tab** - Screenshot API requests
3. **Run API status check** - Screenshot the output
4. **Verify file contents** - Confirm keys are in the file

The issue is almost always:
- ✅ Browser caching (90% of cases)
- ✅ CORS issues (need local server)
- ✅ Invalid/expired API keys
- ✅ No OpenAI credits

---

**Made with ❤️ by Bob**