# LinkedIn OAuth Integration - Complete Setup Guide

## Overview

This guide explains how to set up LinkedIn OAuth authentication to enable automatic contact search in Section 4 of the Prospecting Board.

---

## How It Works

1. **User Authentication**: User logs into LinkedIn via OAuth popup
2. **Search Generation**: App generates LinkedIn search URLs based on:
   - Customer name from Section 1
   - Selected roles from Section 4
3. **Automated Search**: Opens LinkedIn search tabs with pre-filled queries
4. **Manual Review**: User reviews results and copies contact information
5. **Contact Population**: User pastes information into contact cards

---

## Setup Instructions

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create app"
3. Fill in app details:
   - **App name**: Prospecting Board
   - **LinkedIn Page**: Your company page
   - **App logo**: Upload your logo
   - **Legal agreement**: Accept terms

4. In app settings, add:
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/linkedin/callback` (development)
     - `https://your-domain.com/auth/linkedin/callback` (production)

5. Request access to:
   - Sign In with LinkedIn
   - Share on LinkedIn (optional)

6. Copy your credentials:
   - **Client ID**
   - **Client Secret**

### Step 2: Configure Backend

Add to `backend/.env`:

```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback

# For production
# LINKEDIN_REDIRECT_URI=https://your-domain.com/auth/linkedin/callback
```

### Step 3: Update Frontend Configuration

In `js/app.js`, update the API base URL (line ~745):

```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';
// For production: 'https://your-backend-domain.com/api/v1'
```

### Step 4: Install Dependencies

```bash
cd prospecting-board/backend
npm install axios
```

### Step 5: Start the Application

```bash
# Terminal 1: Start backend
cd prospecting-board/backend
npm run dev

# Terminal 2: Open frontend
cd prospecting-board
# Open index.html in browser or use live server
```

---

## User Flow

### 1. Initial Setup (One-time)

1. Open Prospecting Board
2. Enter customer name in Section 1
3. Scroll to Section 4
4. Click "Load Contacts from LinkedIn"
5. Click "Connect to LinkedIn" when prompted
6. Log in to LinkedIn in popup window
7. Authorize the app
8. See "Connected as [Your Name]" confirmation

### 2. Searching for Contacts

1. Enter customer/company name in Section 1
2. Go to Section 4
3. Select roles using checkboxes (or leave all selected)
4. Click "Load Contacts from LinkedIn"
5. LinkedIn search tabs open automatically
6. Review search results in each tab
7. Copy contact information
8. Paste into contact cards in Section 4

---

## Features

### Automatic Search URL Generation

The app generates optimized LinkedIn search queries:

```
Chief Information Officer at Microsoft
VP of Application Development at Microsoft
Chief Information Security Officer at Microsoft
```

### Multiple Role Search

Search for multiple roles simultaneously:
- IT Leadership (CIO)
- Application Development (VP)
- Cybersecurity (CISO)
- Network Operations (Director)
- Application Performance (Head)

### Smart Instructions

After opening search tabs, the app shows:
- List of searches performed
- Step-by-step instructions
- Tips for finding contacts
- How to save profiles

### Persistent Connection

LinkedIn connection persists across sessions:
- Token stored in localStorage
- Auto-reconnect on page load
- Manual reconnect if expired

---

## API Endpoints

### GET /api/v1/auth/linkedin/login
Initiate LinkedIn OAuth flow

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://www.linkedin.com/oauth/v2/authorization?...",
    "state": "random_state_string"
  }
}
```

### GET /api/v1/auth/linkedin/callback
Handle OAuth callback

**Query Parameters:**
- `code`: Authorization code from LinkedIn
- `state`: CSRF protection state

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "linkedin_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "accessToken": "access_token",
    "expiresIn": 5184000
  }
}
```

### POST /api/v1/auth/linkedin/search-urls
Generate search URLs

**Request:**
```json
{
  "company": "Microsoft",
  "roles": [
    "Chief Information Officer",
    "VP of Application Development"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "role": "Chief Information Officer",
      "url": "https://www.linkedin.com/search/results/people/?keywords=Chief%20Information%20Officer%20at%20Microsoft"
    },
    {
      "role": "VP of Application Development",
      "url": "https://www.linkedin.com/search/results/people/?keywords=VP%20of%20Application%20Development%20at%20Microsoft"
    }
  ]
}
```

---

## Security Considerations

### OAuth State Parameter
- Random state generated for each auth request
- Stored in localStorage
- Validated on callback to prevent CSRF

### Token Storage
- Access tokens stored in localStorage
- Tokens encrypted in database
- Automatic token refresh when expired

### Popup Security
- OAuth opens in controlled popup window
- Origin validation on postMessage
- Automatic cleanup after auth

### API Security
- All endpoints require authentication (except OAuth flow)
- Input validation on all requests
- Rate limiting to prevent abuse

---

## Troubleshooting

### Issue: Popup Blocked
**Solution**: 
- Allow popups for your domain
- Check browser popup settings
- Try clicking button again

### Issue: "Failed to connect to LinkedIn"
**Solution**:
- Check backend is running
- Verify LinkedIn app credentials in `.env`
- Check redirect URI matches LinkedIn app settings

### Issue: "Invalid redirect URI"
**Solution**:
- Add redirect URI to LinkedIn app settings
- Ensure URI exactly matches (including http/https)
- No trailing slashes

### Issue: Search tabs not opening
**Solution**:
- Allow popups for your domain
- Check if LinkedIn is accessible
- Try opening one role at a time

### Issue: Token expired
**Solution**:
- Click "Load Contacts from LinkedIn" again
- App will prompt to reconnect
- Tokens refresh automatically

---

## Best Practices

### For Users

1. **Be Specific**: Enter exact company names for better results
2. **Review Results**: Not all search results may be relevant
3. **Save Profiles**: Use LinkedIn's "Save to PDF" for reference
4. **Respect Privacy**: Only use publicly available information
5. **Update Regularly**: Refresh contact information periodically

### For Developers

1. **Token Management**: Implement proper token refresh logic
2. **Error Handling**: Graceful fallbacks for API failures
3. **Rate Limiting**: Respect LinkedIn's usage limits
4. **Logging**: Track OAuth flows for debugging
5. **Testing**: Test with multiple LinkedIn accounts

---

## Compliance

### LinkedIn Terms of Service

This implementation complies with LinkedIn's ToS by:
- Using official OAuth 2.0 flow
- Not automating profile scraping
- Requiring user authentication
- Opening LinkedIn in user's browser
- Letting user manually review and select contacts

### Data Privacy

- No LinkedIn data stored without user consent
- Tokens encrypted in database
- User can disconnect at any time
- Complies with GDPR/CCPA

---

## Advanced Configuration

### Custom Role Mappings

Edit `js/app.js` to customize role titles:

```javascript
const roleMapping = {
  'IT Leadership': 'Chief Information Officer',
  'Custom Role': 'Your Custom Title',
  // Add more mappings
};
```

### Search Query Customization

Modify `generateSearchUrl()` in `linkedin-oauth.service.ts`:

```typescript
generateSearchUrl(company: string, role: string): string {
  // Add location filter
  const searchQuery = `${role} at ${company} in San Francisco`;
  // Add other filters as needed
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`;
}
```

### Token Refresh Interval

Configure automatic token refresh:

```javascript
// Check token every hour
setInterval(async () => {
  if (linkedInAccessToken) {
    const isValid = await validateLinkedInToken(linkedInAccessToken);
    if (!isValid) {
      await refreshLinkedInToken();
    }
  }
}, 3600000); // 1 hour
```

---

## Future Enhancements

### Phase 2
- [ ] Automatic contact extraction from LinkedIn profiles
- [ ] Bulk contact import
- [ ] Contact enrichment with additional data
- [ ] Email finder integration

### Phase 3
- [ ] AI-powered contact matching
- [ ] Automated outreach sequences
- [ ] CRM integration
- [ ] Analytics dashboard

---

## Support

### Common Questions

**Q: Do I need a LinkedIn Premium account?**
A: No, basic LinkedIn account works fine.

**Q: How many searches can I perform?**
A: No limit on searches, but respect LinkedIn's usage policies.

**Q: Can I automate contact extraction?**
A: No, manual review is required to comply with LinkedIn ToS.

**Q: Is my LinkedIn password stored?**
A: No, OAuth tokens are used, never passwords.

**Q: Can I disconnect LinkedIn?**
A: Yes, clear localStorage or click disconnect button.

---

## Files Created

### Backend
- `backend/src/modules/auth/linkedin-oauth.service.ts` - OAuth service
- `backend/src/modules/auth/linkedin-oauth.controller.ts` - API controllers
- `backend/src/modules/auth/linkedin-oauth.routes.ts` - Route definitions

### Frontend
- Updated `js/app.js` with LinkedIn OAuth functions

### Documentation
- `LINKEDIN_OAUTH_SETUP.md` - This file

---

## Quick Reference

### Environment Variables
```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

### Key Functions
- `initiateLinkedInLogin()` - Start OAuth flow
- `searchLinkedInContacts()` - Generate search URLs
- `checkLinkedInConnection()` - Verify connection status

### Storage Keys
- `linkedin_access_token` - Access token
- `linkedin_oauth_state` - CSRF state

---

Made with Bob 🤖