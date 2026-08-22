# LinkedIn OAuth - Step-by-Step Credential Setup

## Prerequisites
- You have a LinkedIn account (personal or company)
- You have access to create a LinkedIn Company Page (or use existing one)

---

## Step 1: Create a LinkedIn Company Page (If You Don't Have One)

1. Go to https://www.linkedin.com/company/setup/new/
2. Select page type: **Company**
3. Fill in:
   - **Company name**: Your company name (or "Prospecting Board Test" for testing)
   - **LinkedIn public URL**: Choose a unique URL
   - **Website**: Your website (or use a placeholder)
   - **Industry**: Select your industry
   - **Company size**: Select size
   - **Company type**: Select type
4. Click **Create page**
5. **Important**: Keep this page open, you'll need it in Step 2

---

## Step 2: Create LinkedIn Developer App

### 2.1 Access LinkedIn Developers Portal

1. Go to https://www.linkedin.com/developers/
2. Click **"Create app"** button (top right)

### 2.2 Fill in App Information

**Page 1 - App Details:**
- **App name**: `Prospecting Board` (or your preferred name)
- **LinkedIn Page**: Select the company page you created/own
- **App logo**: Upload any logo (minimum 300x300px)
  - You can use a simple icon or company logo
  - PNG or JPG format
- **Legal agreement**: Check the box to agree to LinkedIn API Terms of Use
- Click **"Create app"**

### 2.3 Verify Your App

LinkedIn will send a verification link to the email associated with your company page:
1. Check your email
2. Click the verification link
3. Return to the LinkedIn Developers portal

---

## Step 3: Configure App Settings

### 3.1 Navigate to Auth Tab

1. In your app dashboard, click the **"Auth"** tab
2. You'll see your credentials here

### 3.2 Copy Your Credentials

**Copy these values (you'll need them in Step 4):**

1. **Client ID**: 
   - Example: `86p6xxxxxxxx`
   - Click the copy icon next to it

2. **Client Secret**: 
   - Click **"Show"** to reveal it
   - Example: `WPL_AP1.xxxxxxxx.xxxxxxxx`
   - Click the copy icon to copy it
   - **Important**: Keep this secret! Don't share it publicly

### 3.3 Add Redirect URLs

Scroll down to **"OAuth 2.0 settings"** section:

1. Find **"Redirect URLs"** field
2. Click **"Add redirect URL"**
3. Add these URLs (one at a time):

   **For Local Development:**
   ```
   http://localhost:3000/auth/linkedin/callback
   ```

   **For Production (when you deploy):**
   ```
   https://your-domain.com/auth/linkedin/callback
   ```
   (Replace `your-domain.com` with your actual domain)

4. Click **"Update"** after adding each URL

### 3.4 Request API Access

1. Click the **"Products"** tab
2. Find **"Sign In with LinkedIn using OpenID Connect"**
3. Click **"Request access"**
4. Fill in the form:
   - **Why do you need this product?**: "To authenticate users for our prospecting application"
   - **How will you use this product?**: "User authentication and profile access"
5. Click **"Request access"**
6. Wait for approval (usually instant for Sign In with LinkedIn)

---

## Step 4: Add Credentials to Your App

### 4.1 Locate Your .env File

Navigate to your backend directory:
```bash
cd prospecting-board/backend
```

### 4.2 Create/Edit .env File

If `.env` doesn't exist, create it:
```bash
# On Mac/Linux:
touch .env

# On Windows:
type nul > .env
```

### 4.3 Add LinkedIn Credentials

Open `.env` in your text editor and add:

```bash
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=YOUR_CLIENT_ID_HERE
LINKEDIN_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback

# Example (replace with your actual values):
# LINKEDIN_CLIENT_ID=86p6xxxxxxxx
# LINKEDIN_CLIENT_SECRET=WPL_AP1.xxxxxxxx.xxxxxxxx
# LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

**Replace:**
- `YOUR_CLIENT_ID_HERE` with your actual Client ID from Step 3.2
- `YOUR_CLIENT_SECRET_HERE` with your actual Client Secret from Step 3.2

### 4.4 Save the File

Save `.env` and close the editor.

**Important Security Notes:**
- ✅ `.env` should be in `.gitignore` (don't commit to Git)
- ✅ Never share your Client Secret publicly
- ✅ Use different credentials for development and production

---

## Step 5: Verify Configuration

### 5.1 Check Your .env File

Your `.env` should look like this:

```bash
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/prospecting_board

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=86p6xxxxxxxx
LINKEDIN_CLIENT_SECRET=WPL_AP1.xxxxxxxx.xxxxxxxx
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

### 5.2 Install Dependencies

```bash
cd prospecting-board/backend
npm install axios
```

### 5.3 Start the Backend

```bash
npm run dev
```

You should see:
```
🚀 Server running in development mode on port 3000
📍 API available at http://localhost:3000
```

---

## Step 6: Test the Integration

### 6.1 Open the Frontend

1. Open `prospecting-board/index.html` in your browser
2. Or use a live server (recommended)

### 6.2 Test LinkedIn Connection

1. Enter a customer name in Section 1 (e.g., "Microsoft")
2. Scroll to Section 4
3. Click **"Load Contacts from LinkedIn"** button
4. A popup should appear asking you to log in to LinkedIn
5. Log in with your LinkedIn credentials
6. Authorize the app
7. You should see "✓ Successfully connected to LinkedIn!"

### 6.3 Test Contact Search

1. Make sure customer name is entered in Section 1
2. Select roles in Section 4 (checkboxes)
3. Click **"Load Contacts from LinkedIn"**
4. LinkedIn search tabs should open automatically
5. Review the search results

---

## Troubleshooting

### Issue: "Invalid Client ID"
**Solution:**
- Double-check you copied the Client ID correctly
- No extra spaces before/after the ID
- Make sure you saved the `.env` file
- Restart the backend server

### Issue: "Invalid Redirect URI"
**Solution:**
- Check the redirect URI in `.env` matches exactly what you added in LinkedIn app settings
- Include `http://` or `https://`
- No trailing slash
- Port number must match (3000)

### Issue: "Client Secret is invalid"
**Solution:**
- Click "Regenerate" in LinkedIn app settings to get a new secret
- Copy the new secret to `.env`
- Restart backend server

### Issue: Popup Blocked
**Solution:**
- Allow popups for `localhost:3000` in your browser
- Try clicking the button again

### Issue: "App not verified"
**Solution:**
- Check your email for LinkedIn verification link
- Click the verification link
- Wait a few minutes and try again

---

## Quick Reference

### LinkedIn Developer Portal
https://www.linkedin.com/developers/

### Your App Dashboard
https://www.linkedin.com/developers/apps/

### Where to Find Credentials
1. Go to https://www.linkedin.com/developers/apps/
2. Click on your app name
3. Click "Auth" tab
4. Copy Client ID and Client Secret

### .env File Location
```
prospecting-board/backend/.env
```

### Required .env Variables
```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

---

## Next Steps

Once configured:
1. ✅ LinkedIn OAuth is ready to use
2. ✅ You can search for contacts by company and role
3. ✅ Connection persists across sessions
4. ✅ Ready for production deployment (update redirect URI)

---

## Production Deployment

When deploying to production:

1. **Update Redirect URI** in LinkedIn app:
   ```
   https://your-domain.com/auth/linkedin/callback
   ```

2. **Update .env** for production:
   ```bash
   LINKEDIN_REDIRECT_URI=https://your-domain.com/auth/linkedin/callback
   NODE_ENV=production
   ```

3. **Use Environment Variables** (not .env file) on your hosting platform:
   - Heroku: Settings → Config Vars
   - AWS: Environment variables in Elastic Beanstalk
   - Vercel: Environment Variables in project settings

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `LINKEDIN_OAUTH_SETUP.md` for detailed documentation
3. Check browser console (F12) for error messages
4. Check backend logs for API errors

---

Made with Bob 🤖