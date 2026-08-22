# AI-Driven Revenue Command — Prospecting Board

A personalised, AI-powered dashboard for IBM sellers to research clients, map opportunities, and compose contextual outreach — all in one place.

---

## What it does

| Section | Purpose |
|---|---|
| **1 — Customer & Industry** | Enter the client company and vertical. All downstream sections are scoped to this account. |
| **2 — Research Your Client** | AI-generated answers to strategic research questions using live Google search + GPT-4o-mini. |
| **3 — Automation Pillars** | Deep-dive questions across Application Dev, Infrastructure, IAM, Network, and IT Ops pillars. |
| **4 — Potential Opportunities** | AI-mapped IBM solution opportunities based on the client's profile. |
| **5 — IBM Product Research** | Ask anything about IBM products in the context of the client. |
| **6 — Tech Headlines** | Live news headlines for the client, scored for IBM relevance. |
| **7 — Customer Personas & Contacts** | Role-based contact cards. Enter real contact names (found via LinkedIn search) to personalise emails. |
| **8 — Competitive Intelligence** | Competitor analysis, feature comparison matrix, and battle cards. |
| **9 — Visualisation** | AI-generated architecture diagrams using Gemini. |
| **10 — Email Summary** | Persona-targeted, research-backed email composer. Sends via Outlook (`mailto:`). Diagram auto-downloads as PNG for manual attachment. |

**Account History** remembers your research across sessions. Switch between accounts using the pill switcher in Section 1.

---

## Quick Start (Frontend only — no backend needed)

The frontend runs as a fully static site. No build step required.

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (for the static file server)
- `serve` npm package: `npm install -g serve`

### Run

```bash
cd prospecting-board
serve . -p 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

That's it. The app is fully functional with the bundled API keys.

---

## Using Your Own API Keys

The frontend uses three external APIs, all configured at the top of [`js/research-api.js`](js/research-api.js):

```js
const SERPER_API_KEY = '...';   // Google Search via serper.dev
const OPENAI_API_KEY = '...';   // GPT-4o-mini for AI responses
const GEMINI_API_KEY = '...';   // Gemini for diagram generation (Section 9)
```

To swap in your own keys, edit those three lines in `js/research-api.js`.

| API | Free tier | Sign up |
|---|---|---|
| Serper (Google Search) | 2,500 searches/month | [serper.dev](https://serper.dev) |
| OpenAI | Pay-as-you-go (~$0.15/1M tokens for GPT-4o-mini) | [platform.openai.com](https://platform.openai.com) |
| Gemini | Free tier available | [aistudio.google.com](https://aistudio.google.com) |

---

## Running the Backend (Optional)

The backend enables additional features: Microsoft Graph email sending, LinkedIn contact search, and persistent database storage. It is **not required** to use the core frontend features.

### Prerequisites
- Node.js v18+
- PostgreSQL database
- npm

### Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prospecting_board

# OpenAI
OPENAI_API_KEY=sk-...

# Microsoft Graph (for Outlook email sending)
MS_CLIENT_ID=...
MS_CLIENT_SECRET=...
MS_TENANT_ID=...
MS_AUTHORITY=https://login.microsoftonline.com/<your-tenant-id>

# JWT
JWT_SECRET=<32+ character random string>
```

### Run

```bash
# Run database migrations
npm run prisma:migrate

# Start in development mode (auto-reloads on file changes)
npm run dev
```

Backend runs on [http://localhost:3000](http://localhost:3000). Health check: [http://localhost:3000/health](http://localhost:3000/health).

---

## Architecture

```
prospecting-board/
├── index.html              # Single-page app shell
├── css/                    # Component and layout styles
│   ├── variables.css       # Design tokens (colours, spacing, typography)
│   ├── base.css
│   ├── components.css      # Cards, buttons, contact cards, account switcher
│   ├── layout.css
│   ├── sections.css
│   ├── typography.css
│   └── responsive.css
├── js/
│   ├── app.js              # Main app logic, state, all section handlers
│   ├── research-api.js     # Serper + OpenAI + Gemini API client  ← API keys here
│   ├── account-memory.js   # localStorage account persistence
│   ├── opportunities.js    # Section 4 opportunity mapping
│   ├── product-research.js # Section 5 IBM product research
│   ├── competitive-intelligence.js  # Section 8 competitive analysis
│   ├── ibm-docs-integration.js      # IBM documentation search
│   └── linkedin-search.js  # LinkedIn search tab launcher (Section 7)
└── backend/                # Optional Node.js + Express + Prisma backend
    ├── src/
    │   ├── server.ts
    │   ├── app.ts
    │   ├── config/
    │   │   ├── microsoft-graph.ts   # Outlook email integration
    │   │   └── database.ts
    │   └── modules/
    │       └── ibm-docs/            # IBM documentation API routes
    ├── prisma/
    │   └── schema.prisma
    └── .env.example                 # Template — copy to .env and fill in secrets
```

---

## Account History

The app saves your research per account in browser `localStorage` under the key `pbAccounts`. 

- Accounts with any generated content persist indefinitely
- Accounts with no generated content (browse-only) are retained for **7 days** after the last visit
- Switch between accounts using the **Recent accounts** pill bar in Section 1 (appears after 2+ accounts)
- Click **Show all sections** to unlock all sections without selecting a pillar

---

## Email Workflow (Section 10)

1. Enter a contact name in the relevant **Section 7** contact card (found via the LinkedIn search links)
2. Go to Section 10, select that person's role from the **Send to persona** dropdown
3. Choose tone and length, click **Generate Email**
4. The email is built using your Section 2 + 3 research context, account history, and contact focus areas
5. If a diagram was generated in Section 9, click **Add to email**, then **Send Email** — the PNG downloads automatically so you can attach it in Outlook

---

## Known Limitations

- **LinkedIn contacts** — the app opens LinkedIn search tabs for each role; contact names must be manually entered into the Section 7 name fields (LinkedIn's API prohibits automated data extraction)
- **Email sending** — uses `mailto:` to open Outlook; images cannot be embedded via `mailto:` (the PNG downloads automatically as a workaround)
- **Diagram generation** — requires a Gemini API key with billing enabled for image generation

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

*Made with [IBM Bob](https://www.ibm.com/)*
