/**
 * Account Memory — js/account-memory.js
 *
 * Gives every named account its own persistent workspace in localStorage.
 * All reads/writes go through this module so app.js never touches the
 * raw storage key directly.
 *
 * Storage layout
 * ──────────────
 * localStorage key: "pbAccounts"  (object keyed by normalised account name)
 * localStorage key: "pbActiveAccount"  (string — the current account key)
 *
 * Each account object:
 * {
 *   displayName       : "Intel"         // original capitalisation
 *   industry          : "semiconductor"
 *   selectedPillar    : "application-modernization" | null
 *   lastVisited       : ISO string
 *   generatedResponses: { "1": "...", "s3-appmod-1": "..." }
 *   sellerNotes       : { "1": "...", "s3-infra-3": "..." }
 *   engagement        : { "cio": "champion", "ciso": "met" }
 *   pillarCoverage    : {
 *     "application-modernization":      { count: 6, lastTouched: ISO }
 *     "infrastructure-automation":      { count: 2, lastTouched: ISO }
 *     "technology-business-management": { count: 0, lastTouched: null }
 *   }
 *   sessions: [
 *     { date: ISO, pillar: string|"", questionsAnswered: number,
 *       sellerSummary: string, responseSnapshot: { qId: text } }
 *   ]
 * }
 */

(function () {
  'use strict';

  const STORE_KEY  = 'pbAccounts';
  const ACTIVE_KEY = 'pbActiveAccount';

  const PILLARS = [
    'application-modernization',
    'infrastructure-automation',
    'technology-business-management'
  ];

  // ── helpers ──────────────────────────────────────────────────────────────

  function normalise(name) {
    return (name || '').trim().toLowerCase().replace(/\s+/g, '-');
  }

  function allAccounts() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveAccounts(accounts) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(accounts)); }
    catch (e) { console.warn('AccountMemory: could not save', e); }
  }

  function emptyAccount(displayName, industry) {
    return {
      displayName,
      industry: industry || '',
      selectedPillar: null,
      lastVisited: new Date().toISOString(),
      generatedResponses: {},
      sellerNotes: {},
      engagement: {},
      pillarCoverage: {
        'application-modernization':      { count: 0, lastTouched: null },
        'infrastructure-automation':      { count: 0, lastTouched: null },
        'technology-business-management': { count: 0, lastTouched: null }
      },
      sessions: [],
      activityLog: [],   // summary events: opportunities, diagrams, emails, competitive, headlines
      savedOpportunities: null, // { items: [...], generatedAt: ISO, customerName }
      sectionsRevealed: false   // true once seller clicks "Show all sections" 
    };
  }

  // ── core API ──────────────────────────────────────────────────────────────

  /**
   * Return (and create if missing) the account record for displayName.
   */
  function getAccount(displayName) {
    const key = normalise(displayName);
    if (!key) return null;
    const accounts = allAccounts();
    if (!accounts[key]) {
      accounts[key] = emptyAccount(displayName, '');
      saveAccounts(accounts);
    }
    return accounts[key];
  }

  /**
   * Persist the full account record for displayName.
   */
  function saveAccount(displayName, data) {
    const key = normalise(displayName);
    if (!key) return;
    const accounts = allAccounts();
    accounts[key] = { ...data, displayName, lastVisited: new Date().toISOString() };
    saveAccounts(accounts);
  }

  /**
   * Return the active account key (normalised name) or null.
   */
  function getActiveKey() {
    return localStorage.getItem(ACTIVE_KEY) || null;
  }

  /**
   * Set the active account key.
   */
  function setActiveKey(displayName) {
    localStorage.setItem(ACTIVE_KEY, normalise(displayName));
  }

  /**
   * Return all saved account display names, sorted by lastVisited desc.
   */
  function listAccounts() {
    const accounts = allAccounts();
    return Object.values(accounts)
      .sort((a, b) => (b.lastVisited || '').localeCompare(a.lastVisited || ''))
      .map(a => a.displayName);
  }

  /**
   * Snapshot the current DOM state into the account store.
   * Called: on every generate, note change, engagement change, pillar switch.
   */
  function snapshotCurrentState(appState) {
    const name = appState.customerName;
    if (!name || name.length < 2) return;

    const account = getAccount(name);
    account.industry       = appState.industry || account.industry;
    account.selectedPillar = appState.selectedPillar || account.selectedPillar;

    // Merge generated responses — never overwrite with empty
    Object.entries(appState.generatedResponses || {}).forEach(([k, v]) => {
      if (v && v.trim()) account.generatedResponses[k] = v;
    });

    // Collect seller note textareas — only save notes that belong to this account.
    // Each textarea is stamped with data-account-owner when restored; we skip any
    // textarea whose owner doesn't match the current account to prevent cross-account
    // note contamination.
    document.querySelectorAll('.seller-notes-textarea').forEach(ta => {
      const card  = ta.closest('.question-card');
      if (!card || !ta.value.trim()) return;
      const owner = ta.dataset.accountOwner;
      // Accept if owner matches, or owner is unset (user just typed it this session)
      if (owner && owner !== name) return;
      const qId = buildQuestionId(card);
      if (qId) account.sellerNotes[qId] = ta.value.trim();
    });

    // Collect engagement selects
    document.querySelectorAll('.contact-engagement__select').forEach(sel => {
      if (sel.dataset.contactId && sel.value && sel.value !== 'not-contacted') {
        account.engagement[sel.dataset.contactId] = sel.value;
      }
    });

    saveAccount(name, account);
  }

  /**
   * Restore a saved account into the DOM and appState.
   * Returns the saved account object so the caller can update its own state.
   */
  function restoreAccount(displayName, appState, elements) {
    const account = getAccount(displayName);
    if (!account) return null;

    // Restore industry
    if (account.industry && elements.industrySelect) {
      elements.industrySelect.value = account.industry;
      appState.industry = account.industry;
    }

    // Restore generated responses into state (DOM update is caller's job)
    if (account.generatedResponses) {
      appState.generatedResponses = { ...account.generatedResponses };
    }

    // Restore seller notes into textareas and stamp owner so snapshots stay clean
    Object.entries(account.sellerNotes || {}).forEach(([qId, note]) => {
      const card = findCardByQuestionId(qId);
      if (!card) return;
      const ta = card.querySelector('.seller-notes-textarea');
      if (ta && note) {
        ta.value = note;
        ta.dataset.accountOwner = displayName;   // stamp ownership
        // Also persist to legacy per-note key so getSellerNotesForCard() still works
        const num = card.querySelector('.question-card__number')?.textContent?.trim();
        if (num) localStorage.setItem(`notes-${num}`, note);
      }
    });

    // Restore engagement selects
    document.querySelectorAll('.contact-engagement__select').forEach(sel => {
      const id  = sel.dataset.contactId;
      const val = account.engagement[id];
      if (val) {
        sel.value          = val;
        sel.dataset.status = val;
        localStorage.setItem(`engagement-${id}`, val);
      }
    });

    setActiveKey(displayName);
    return account;
  }

  /**
   * Log a completed session entry for the account.
   * Call this when a "generate all" or individual generate fires.
   */
  function logSession(displayName, pillar, questionsAnswered, responseSnapshot) {
    if (!displayName) return;
    // Only log sessions for accounts that already exist OR are being created
    // by an intentional action (generate). Guard: name must be > 2 chars.
    if (normalise(displayName).length < 3) return;
    const account = getAccount(displayName);
    const today   = new Date().toISOString().slice(0, 10);

    // Update pillar coverage
    if (pillar && account.pillarCoverage[pillar]) {
      account.pillarCoverage[pillar].count += questionsAnswered;
      account.pillarCoverage[pillar].lastTouched = today;
    }

    // Merge into today's session entry (one entry per day per pillar)
    const existing = account.sessions.find(
      s => s.date === today && s.pillar === (pillar || '')
    );
    if (existing) {
      existing.questionsAnswered += questionsAnswered;
      Object.assign(existing.responseSnapshot || {}, responseSnapshot || {});
    } else {
      account.sessions.push({
        date:              today,
        pillar:            pillar || '',
        questionsAnswered: questionsAnswered,
        sellerSummary:     '',
        responseSnapshot:  responseSnapshot || {}
      });
    }

    // Cap at 50 sessions per account
    if (account.sessions.length > 50) {
      account.sessions = account.sessions.slice(-50);
    }

    saveAccount(displayName, account);
  }

  /**
   * Build a compact historical context string for use in AI prompts.
   * Returns a multi-line string summarising past sessions and all seller notes.
   */
  function buildHistoricalContext(displayName) {
    if (!displayName) return '';
    const account = getAccount(displayName);
    const lines   = [];

    // Past sessions
    const sessions = (account.sessions || []).slice().reverse(); // newest first
    if (sessions.length > 1) { // skip current-only
      lines.push('ACCOUNT HISTORY (previous sessions):');
      sessions.slice(0, 6).forEach(s => {
        const d    = s.date;
        const p    = s.pillar ? s.pillar.replace(/-/g, ' ') : 'general research';
        const q    = s.questionsAnswered;
        const note = s.sellerSummary ? ` — ${s.sellerSummary}` : '';
        lines.push(`  • ${d}: ${p} (${q} question${q !== 1 ? 's' : ''})${note}`);
      });
      lines.push('');
    }

    // All accumulated seller notes
    const notes = Object.entries(account.sellerNotes || {});
    if (notes.length) {
      lines.push('ACCUMULATED SELLER OBSERVATIONS (all sessions):');
      notes.forEach(([, note]) => {
        if (note.trim()) lines.push(`  • ${note.trim().substring(0, 250)}`);
      });
      lines.push('');
    }

    // Pillar coverage summary
    const covered = PILLARS
      .map(p => ({ p, c: account.pillarCoverage?.[p]?.count || 0 }))
      .filter(x => x.c > 0);
    if (covered.length) {
      lines.push('PILLAR RESEARCH COVERAGE (cumulative):');
      covered.forEach(({ p, c }) =>
        lines.push(`  • ${p.replace(/-/g, ' ')}: ${c} question${c !== 1 ? 's' : ''} researched`)
      );
    }

    return lines.join('\n');
  }

  // ── internal helpers ──────────────────────────────────────────────────────

  function buildQuestionId(card) {
    const num    = card.querySelector('.question-card__number')?.textContent?.trim();
    const pillar = card.getAttribute('data-pillar-question');
    if (!num) return null;
    return pillar ? `s3-${pillar}-${num}` : `s2-${num}`;
  }

  function findCardByQuestionId(qId) {
    if (qId.startsWith('s3-')) {
      const parts  = qId.split('-');        // ["s3", pillar-part..., num]
      const num    = parts[parts.length - 1];
      const pillar = parts.slice(1, -1).join('-');
      return document.querySelector(
        `[data-pillar-question="${pillar}"] .question-card__number`
      )?.closest('.question-card[data-question-number="${num}"]') ||
      document.querySelector(
        `.question-card[data-pillar-question="${pillar}"][data-question-number="${num}"]`
      );
    }
    const num = qId.replace('s2-', '');
    return Array.from(
      document.querySelectorAll('#section-research .question-card')
    ).find(c => c.querySelector('.question-card__number')?.textContent?.trim() === num);
  }

  /**
   * Log a summary activity event for the account.
   * type: 'opportunities' | 'visualisation' | 'email' | 'competitive' | 'headlines' | 'personas' | 'ibmProduct'
   * summary: short human-readable string
   * meta: optional small object (e.g. { count: 4, products: [...] })
   */
  function logActivity(displayName, type, summary, meta) {
    if (!displayName || !type) return;
    // Never create a stub account just from activity logging —
    // only write if the account already exists in the store.
    const key = normalise(displayName);
    if (!key || !allAccounts()[key]) return;
    const account = getAccount(displayName);
    if (!account.activityLog) account.activityLog = [];

    const entry = {
      type,
      summary,
      meta: meta || {},
      timestamp: new Date().toISOString()
    };

    // Keep only the latest entry per type (overwrite), plus preserve order
    const idx = account.activityLog.findIndex(e => e.type === type);
    if (idx !== -1) {
      account.activityLog[idx] = entry;
    } else {
      account.activityLog.push(entry);
    }

    saveAccount(displayName, account);

    // Notify the rest of the app so timeline panels re-render immediately
    document.dispatchEvent(new CustomEvent('pb:activityLogged', {
      detail: { customerName: displayName, type, summary }
    }));
  }

  /**
   * Persist the full opportunity rows for an account.
   * items: array of opportunity objects from opportunities.js
   */
  function saveOpportunities(displayName, items) {
    if (!displayName || !Array.isArray(items)) return;
    const account = getAccount(displayName);
    account.savedOpportunities = {
      items,
      generatedAt: new Date().toISOString(),
      customerName: displayName
    };
    saveAccount(displayName, account);
  }

  /**
   * Return { items, generatedAt } for an account, or null if none saved.
   */
  function getOpportunities(displayName) {
    if (!displayName) return null;
    return getAccount(displayName)?.savedOpportunities || null;
  }

  // ── prune stubs ───────────────────────────────────────────────────────────

  /**
   * Remove accounts that were auto-created from partial keystrokes:
   * no generated responses, no sessions, no seller notes, no saved opportunities.
   * Call once on page load to clean up any existing junk entries.
   */
  function prunePartialAccounts() {
    const accounts = allAccounts();
    let changed = false;
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    Object.keys(accounts).forEach(key => {
      const a = accounts[key];
      const hasResponses   = Object.keys(a.generatedResponses || {}).length > 0;
      const hasSessions    = (a.sessions || []).length > 0;
      const hasNotes       = Object.keys(a.sellerNotes || {}).length > 0;
      const hasOpps        = !!(a.savedOpportunities?.items?.length);
      const visitedRecently = (a.lastVisited || '') >= cutoff;
      // Keep if it has any real data OR was visited in the last 7 days
      if (!hasResponses && !hasSessions && !hasNotes && !hasOpps && !visitedRecently) {
        delete accounts[key];
        changed = true;
      }
    });
    if (changed) saveAccounts(accounts);
  }

  // ── export ────────────────────────────────────────────────────────────────

  /**
   * Mark (or unmark) an account as having all sections revealed.
   */
  function setSectionsRevealed(displayName, value) {
    if (!displayName) return;
    const account = getAccount(displayName);
    account.sectionsRevealed = !!value;
    saveAccount(displayName, account);
  }

  window.AccountMemory = {
    normalise,
    getAccount,
    saveAccount,
    setSectionsRevealed,
    getActiveKey,
    setActiveKey,
    listAccounts,
    snapshotCurrentState,
    restoreAccount,
    logSession,
    buildHistoricalContext,
    buildQuestionId,
    logActivity,
    allAccounts,
    saveOpportunities,
    getOpportunities,
    prunePartialAccounts,
    PILLARS
  };

})();
