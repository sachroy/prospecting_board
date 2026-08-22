# 📦 Box Sharing Instructions

## For You (The Sharer)

### Step 1: Upload to Box
1. Open Box.com or your Box desktop app
2. Navigate to where you want to store the project
3. Upload the entire **prospecting-board** folder
4. Wait for upload to complete

### Step 2: Share with Your Team
1. Right-click the **prospecting-board** folder in Box
2. Click "Share"
3. Add your team members' email addresses
4. Set permissions to "Viewer" or "Editor" (Viewer is sufficient)
5. Add a message (see template below)
6. Click "Send"

### Recommended Message Template:
```
Hi Team,

I've shared the Prospecting Board application with you on Box.

TO USE:
1. Download the "prospecting-board" folder to your computer
2. Open the folder
3. Double-click "index.html"
4. Start using immediately!

NO SOFTWARE NEEDED - it opens in your web browser.

For detailed instructions, see TEAM_SETUP_GUIDE.md (or .docx) in the folder.

Questions? Let me know!
```

---

## For Your Team (The Recipients)

### How to Access and Use

#### Step 1: Download from Box
1. Check your email for the Box sharing notification
2. Click the link to open Box
3. Find the **prospecting-board** folder
4. Click the "..." menu (three dots) next to the folder name
5. Select "Download"
6. Save to your computer (e.g., Desktop or Documents)
7. Wait for download to complete

#### Step 2: Open the Application
1. Navigate to where you saved the folder
2. Open the **prospecting-board** folder
3. Find **index.html** (it has a browser icon)
4. **Double-click index.html**
5. It will open in your default web browser
6. Start using immediately!

### ⚠️ Important Notes

**✅ DO:**
- Download the entire folder to your computer
- Double-click index.html to open
- Use any modern web browser (Chrome, Firefox, Safari, Edge)
- Bookmark the file location for easy access

**❌ DON'T:**
- Try to open index.html directly from Box (download first!)
- Worry about localhost:8000 (not needed!)
- Install any software
- Run any servers
- Configure anything (works immediately!)

### What You'll See

When you double-click index.html, your browser will open and show:
- **Title:** "Prospecting Board"
- **Section 1:** Customer & Industry input
- **Navigation:** Sections 1-6 in the sidebar
- **Everything works immediately with sample data**

### File Location in Browser

The URL in your browser will look like:
- **Windows:** `file:///C:/Users/YourName/Desktop/prospecting-board/index.html`
- **Mac:** `file:///Users/YourName/Desktop/prospecting-board/index.html`

This is normal! You're opening a local file, not a website.

---

## Alternative: Box Drive (If You Have It)

If you have Box Drive installed and syncing:

1. Wait for the folder to sync to your computer
2. Navigate to your Box Drive folder
3. Find prospecting-board folder
4. Double-click index.html
5. Use directly from Box Drive (no download needed!)

**Location:** Usually at `C:\Users\YourName\Box` (Windows) or `/Users/YourName/Box` (Mac)

---

## Troubleshooting

### "The file won't open"
- **Solution:** Make sure you downloaded the entire folder, not just index.html
- **Check:** The folder should contain css/, js/, and other folders

### "I see code instead of the application"
- **Solution:** Right-click index.html → "Open with" → Choose your web browser
- **Check:** Make sure you're opening with a browser, not a text editor

### "Nothing happens when I double-click"
- **Solution:** Right-click index.html → "Open with" → Select browser (Chrome, Firefox, etc.)
- **Alternative:** Open your browser first, then drag index.html into the browser window

### "Can I use this from Box without downloading?"
- **Not recommended:** Some features may not work properly
- **Best practice:** Download to your computer for full functionality

### "Do I need to be online?"
- **No!** Once downloaded, it works completely offline
- **Exception:** Only if you configure optional API integrations (advanced)

---

## For Advanced Users (Optional)

### Running a Local Server (NOT REQUIRED)

If you want to run the optional backend server (for advanced features):

1. Make sure you have Node.js installed
2. Open Terminal/Command Prompt
3. Navigate to the backend folder:
   ```bash
   cd prospecting-board/backend
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
6. Server runs at http://localhost:3000

**Note:** This is ONLY needed for advanced API features. The main application works without this!

---

## Quick Reference

### What You Need:
- ✅ Computer (Windows or Mac)
- ✅ Web browser (Chrome, Firefox, Safari, Edge)
- ✅ Box account (to download)

### What You DON'T Need:
- ❌ Software installation
- ❌ Server setup
- ❌ localhost:8000
- ❌ Technical knowledge
- ❌ API keys (optional only)
- ❌ Internet connection (after download)

### File to Open:
- **index.html** (in the prospecting-board folder)

### Expected Behavior:
- Opens in your web browser
- Shows "Prospecting Board" title
- All features work immediately
- Data saves automatically in your browser

---

## Support

### Need Help?
1. Check TEAM_SETUP_GUIDE.md (or .docx) in the folder
2. Try the troubleshooting section above
3. Contact the person who shared the folder with you

### Common Questions

**Q: Do I need to install anything?**  
A: No! Just download and open index.html.

**Q: What about localhost:8000?**  
A: Ignore it! That's only for advanced backend features. Not needed for basic use.

**Q: Can multiple people use this?**  
A: Yes! Each person downloads their own copy. Data is saved locally in each person's browser.

**Q: How do I update to a new version?**  
A: Download the new folder from Box and replace your old one. Your data is saved in your browser, so it will still be there.

**Q: Can I edit the files?**  
A: Yes, if you want to customize. But it works perfectly without any changes!

---

## Success Checklist

After downloading and opening, you should be able to:
- [ ] See the Prospecting Board interface
- [ ] Enter a customer name in Section 1
- [ ] Select an industry
- [ ] Navigate between sections
- [ ] Generate questions (with mock data)
- [ ] Add custom questions
- [ ] See AI-generated suggestions
- [ ] Export to PDF/PowerPoint

If all these work, you're all set! 🎉

---

## Summary

**For the sharer:** Upload folder to Box → Share with team → Send instructions

**For the team:** Download folder → Open index.html → Start using!

**No servers, no localhost, no installation required!**