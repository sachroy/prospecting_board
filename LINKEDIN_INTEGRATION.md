# LinkedIn Contact Integration Guide

## Overview

This document describes the dynamic LinkedIn contact pulling feature that fetches contact information based on the customer name (Section 1) and selected roles (Section 4).

---

## Features

### 1. Dynamic Contact Search
- Automatically searches LinkedIn for contacts based on:
  - Customer/Company name from Section 1
  - Selected roles from Section 4 (IT Leadership, Application Development, Cybersecurity, etc.)
- Displays real contact information including:
  - Name
  - Role/Title
  - Email (when available)
  - LinkedIn profile URL
  - Professional summary

### 2. Role Selection
- Checkboxes added to each subsection in Section 4
- Users can select which roles to search for
- All roles are selected by default
- Flexible search based on user needs

### 3. Real-time Updates
- "Load Contacts from LinkedIn" button in Section 4
- Fetches contacts dynamically when clicked
- Updates contact cards with real data
- Visual indicators show LinkedIn-verified contacts

---

## Architecture

### Backend Components

#### 1. LinkedIn Service (`linkedin.service.ts`)
- **Purpose**: Handles LinkedIn scraping and data extraction
- **Key Methods**:
  - `searchContacts()`: Search for contacts by company and roles
  - `getContactDetails()`: Fetch detailed profile information
  - `parseLinkedInSearchResults()`: Extract data from HTML
- **Integrations**:
  - ScrapingBee API (primary)
  - Bright Data API (alternative)
  - Mock data fallback for development

#### 2. Contacts Service (`contacts.service.ts`)
- **Purpose**: Business logic for contact management
- **Key Methods**:
  - `searchLinkedInContacts()`: Search LinkedIn via service
  - `syncContactsFromLinkedIn()`: Save contacts to database
  - `getContactsByCustomer()`: Retrieve saved contacts
  - `createContact()`, `updateContact()`, `deleteContact()`: CRUD operations

#### 3. Contacts Controller (`contacts.controller.ts`)
- **Purpose**: HTTP request handlers
- **Endpoints**:
  - `POST /api/v1/contacts/search`: Search LinkedIn
  - `POST /api/v1/contacts/sync`: Sync and save contacts
  - `GET /api/v1/contacts/:customerId`: Get saved contacts
  - `GET /api/v1/contacts/linkedin/profile`: Get profile details

#### 4. Contacts Routes (`contacts.routes.ts`)
- **Purpose**: API route definitions with validation
- **Security**: All routes require authentication
- **Validation**: Input validation using express-validator

### Frontend Components

#### 1. State Management
```javascript
state = {
  customerName: '',
  industry: '',
  linkedInContacts: [],
  selectedRoles: []
}
```

#### 2. Key Functions
- `fetchLinkedInContacts()`: Main function to fetch contacts
- `getSelectedRoles()`: Extract selected roles from checkboxes
- `updateContactsDisplay()`: Update UI with fetched data
- `addRoleSelectionUI()`: Add checkboxes and button to UI
- `generateMockContactsForRoles()`: Fallback mock data

---

## API Endpoints

### Search LinkedIn Contacts
```http
POST /api/v1/contacts/search
Content-Type: application/json
Authorization: Bearer {token}

{
  "company": "Acme Corporation",
  "roles": [
    "Chief Information Officer",
    "VP of Application Development",
    "Chief Information Security Officer"
  ],
  "limit": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Jane Smith",
      "role": "Chief Information Officer",
      "company": "Acme Corporation",
      "linkedinUrl": "https://www.linkedin.com/in/janesmith",
      "email": "jane.smith@acme.com",
      "location": "San Francisco, CA",
      "summary": "Leading digital transformation initiatives"
    }
  ],
  "count": 1
}
```

### Sync Contacts to Database
```http
POST /api/v1/contacts/sync
Content-Type: application/json
Authorization: Bearer {token}

{
  "customerId": "uuid",
  "company": "Acme Corporation",
  "roles": ["Chief Information Officer"]
}
```

### Get Customer Contacts
```http
GET /api/v1/contacts/{customerId}
Authorization: Bearer {token}
```

---

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd prospecting-board/backend
npm install axios cheerio express-validator
```

#### Environment Variables
Add to `.env`:
```bash
# LinkedIn Scraping Services
SCRAPING_BEE_API_KEY=your_scraping_bee_key
BRIGHT_DATA_API_KEY=your_bright_data_key

# API Configuration
API_BASE_URL=http://localhost:3000
```

#### Database Migration
The Contact model is already defined in `prisma/schema.prisma`:
```bash
npx prisma migrate dev --name add_contacts
npx prisma generate
```

### 2. Frontend Setup

#### Update API Base URL
In `js/app.js`, update the API URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api/v1';
```

#### Authentication
Implement the `getAuthToken()` function based on your auth system:
```javascript
function getAuthToken() {
  return localStorage.getItem('auth_token') || '';
}
```

### 3. Scraping Service Setup

#### Option A: ScrapingBee (Recommended)
1. Sign up at https://www.scrapingbee.com/
2. Get API key from dashboard
3. Add to `.env` file
4. Supports JavaScript rendering and premium proxies

#### Option B: Bright Data
1. Sign up at https://brightdata.com/
2. Create LinkedIn dataset collector
3. Get API credentials
4. Add to `.env` file

#### Option C: Development Mode
- No API key required
- Uses mock data automatically
- Perfect for testing and development

---

## Usage Guide

### For End Users

1. **Enter Customer Name**
   - Go to Section 1
   - Enter the company/customer name
   - Select industry (optional)

2. **Select Roles**
   - Scroll to Section 4 (Customer Personas & Contacts)
   - Check/uncheck roles you want to search for
   - All roles are selected by default

3. **Load Contacts**
   - Click "Load Contacts from LinkedIn" button
   - Wait for search to complete (2-5 seconds)
   - Contact cards will update with real data

4. **View Results**
   - LinkedIn-verified contacts show a blue badge
   - Click LinkedIn links to view full profiles
   - Email addresses are clickable (when available)

### For Developers

#### Customize Role Mapping
Edit the `roleMapping` object in `getSelectedRoles()`:
```javascript
const roleMapping = {
  'IT Leadership': 'Chief Information Officer',
  'Custom Section': 'Custom Role Title'
};
```

#### Add New Roles
1. Add subsection to HTML in Section 4
2. Add role mapping in JavaScript
3. Add mock data in `generateMockContactsForRoles()`

#### Customize Contact Display
Modify `updateContactsDisplay()` function to change how contacts are shown.

---

## Data Flow

```
User Action (Click "Load Contacts")
    ↓
Frontend: fetchLinkedInContacts()
    ↓
API Request: POST /api/v1/contacts/search
    ↓
Backend: contactsController.searchLinkedInContacts()
    ↓
Service: contactsService.searchLinkedInContacts()
    ↓
LinkedIn Service: linkedInService.searchContacts()
    ↓
External API: ScrapingBee/Bright Data
    ↓
Parse Results: Extract contact data
    ↓
Return to Frontend
    ↓
Update UI: updateContactsDisplay()
    ↓
Show Success Notification
```

---

## Error Handling

### Frontend
- Validates customer name is entered
- Validates at least one role is selected
- Falls back to mock data if API fails
- Shows user-friendly error notifications

### Backend
- Input validation on all endpoints
- Authentication checks
- Rate limiting to prevent abuse
- Detailed error logging
- Graceful fallbacks

---

## Security Considerations

1. **Authentication Required**
   - All API endpoints require valid JWT token
   - User can only access their own customers

2. **Rate Limiting**
   - Prevents abuse of scraping services
   - Configurable limits per user/IP

3. **Data Privacy**
   - Only public LinkedIn data is accessed
   - Complies with LinkedIn's terms of service
   - No password or private data stored

4. **API Key Security**
   - Keys stored in environment variables
   - Never exposed to frontend
   - Encrypted in database

---

## Troubleshooting

### No Contacts Found
- **Check**: Customer name is correct
- **Check**: Roles are selected
- **Check**: API keys are configured
- **Solution**: System will use mock data as fallback

### API Errors
- **Check**: Backend is running
- **Check**: Authentication token is valid
- **Check**: Network connectivity
- **Solution**: Check browser console for details

### Scraping Service Errors
- **Check**: API keys are valid
- **Check**: Service quota not exceeded
- **Check**: LinkedIn is accessible
- **Solution**: System falls back to mock data

---

## Future Enhancements

1. **Advanced Search**
   - Filter by location
   - Filter by experience level
   - Filter by company size

2. **Contact Enrichment**
   - Email verification
   - Phone number lookup
   - Social media profiles

3. **Bulk Operations**
   - Export all contacts to CSV
   - Bulk email campaigns
   - Contact list management

4. **Analytics**
   - Track contact engagement
   - Response rates
   - Best performing roles

5. **AI Integration**
   - Personalized outreach messages
   - Contact scoring
   - Relationship insights

---

## Support

For issues or questions:
- Check logs in browser console (F12)
- Check backend logs for API errors
- Review this documentation
- Contact development team

---

## Made with Bob

This integration was built to provide seamless LinkedIn contact discovery directly within the Prospecting Board application.