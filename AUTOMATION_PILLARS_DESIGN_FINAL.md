# Automation Pillars Feature - Final Design

## Overview
Create a new Section 3 called "Automation Pillars" with a choice list that dynamically displays relevant questions. Big Picture Strategy remains separate in Section 2.

---

## 1. Section Structure

### New Layout:
- **Section 1**: Customer & Industry
- **Section 2**: Big Picture Strategy (Q01-Q04) - always visible
- **Section 3**: Automation Pillars (NEW) - choice list + dynamic questions (Q05-Q13)
- **Section 4**: Potential Opportunities (was Section 3)
- **Section 5**: Tech Headlines (was Section 4)
- **Section 6+**: Other sections

---

## 2. Three Automation Pillars - Question Distribution

### Pillar 1: Application Modernization
**Questions**: Q05
**Subsections Visible**:
- Application Development & Integration
  - Q05: Application development and Integration projects

### Pillar 2: Infrastructure Automation
**Questions**: Q06, Q07, Q08, Q09, Q10
**Subsections Visible**:
- Infrastructure Lifecycle Management
  - Q06: Infrastructure provisioning processes
  - Q07: Configuration drift incidents
- Identity & Access Management (renamed from "Cybersecurity & Identity Management")
  - Q08: Identity management challenges
- Network Management
  - Q09: Network performance issues
  - Q10: DNS resolution challenges

### Pillar 3: Technology Business Management
**Questions**: Q11, Q12, Q13
**Subsections Visible**:
- IT Operations
  - Q11: Resource scaling
  - Q12: Observability platform
  - Q13: Consolidate monitoring data

---

## 3. Visual Design

```
┌─────────────────────────────────────────────────────────────────┐
│  Section 3                                                        │
│  Automation Pillars                                               │
│  Select your focus area to see relevant questions                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Select Focus Area:                                               │
│                                                                   │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────┐│
│  │ 📱 Application       │ │ ⚙️ Infrastructure    │ │📊Technology││
│  │    Modernization     │ │    Automation        │ │   Business││
│  │                      │ │                      │ │ Management││
│  └──────────────────────┘ └──────────────────────┘ └──────────┘│
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  [Questions appear here based on selection]                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Complete HTML Structure

```html
<!-- Section 2: Big Picture Strategy (UNCHANGED) -->
<section class="section" id="section-research">
    <div class="section__header">
        <div class="section__header-left">
            <span class="section__label">Section 2</span>
            <h2 class="section__title">Big Picture Strategy</h2>
        </div>
        <div class="section__header-right">
            <button class="export-btn" aria-label="Export as PDF" title="Export as PDF">
                <svg class="export-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>PDF</span>
            </button>
            <button class="export-btn" aria-label="Export as PowerPoint" title="Export as PowerPoint">
                <svg class="export-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>PPT</span>
            </button>
        </div>
    </div>

    <div class="section__content">
        <!-- Big Picture Strategy subsection with Q01-Q04 -->
        <div class="subsection">
            <h3 class="subsection__title">Big Picture Strategy</h3>
            
            <!-- Q01 -->
            <div class="question-card">
                <div class="question-card__header">
                    <span class="question-card__number">01</span>
                    <h4 class="question-card__question">What are your top 3–5 strategic priorities over the next 1–3 years?</h4>
                </div>
                <!-- ... rest of Q01 -->
            </div>

            <!-- Q02 -->
            <div class="question-card">
                <div class="question-card__header">
                    <span class="question-card__number">02</span>
                    <h4 class="question-card__question">What prompted these priorities (market changes, leadership vision, performance gaps)?</h4>
                </div>
                <!-- ... rest of Q02 -->
            </div>

            <!-- Q03 -->
            <div class="question-card">
                <div class="question-card__header">
                    <span class="question-card__number">03</span>
                    <h4 class="question-card__question">How do these initiatives differentiate you from your competitors?</h4>
                </div>
                <!-- ... rest of Q03 -->
            </div>

            <!-- Q04 -->
            <div class="question-card">
                <div class="question-card__header">
                    <span class="question-card__number">04</span>
                    <h4 class="question-card__question">How do these strategic initiatives relate to specific IT imperatives?</h4>
                </div>
                <!-- ... rest of Q04 -->
            </div>
        </div>
    </div>
</section>

<!-- Section 3: Automation Pillars (NEW) -->
<section class="section" id="section-automation-pillars">
    <div class="section__header">
        <div class="section__header-left">
            <span class="section__label">Section 3</span>
            <h2 class="section__title">Automation Pillars</h2>
            <p class="section__subtitle">Select your focus area to see relevant questions</p>
        </div>
        <div class="section__header-right">
            <button class="export-btn" aria-label="Export as PDF" title="Export as PDF">
                <svg class="export-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>PDF</span>
            </button>
            <button class="export-btn" aria-label="Export as PowerPoint" title="Export as PowerPoint">
                <svg class="export-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L12 8L18 10L12 12L10 18L8 12L2 10L8 8L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>PPT</span>
            </button>
        </div>
    </div>

    <div class="section__content">
        <!-- Pillar Choice List -->
        <div class="pillar-choice-list">
            <label class="pillar-choice-list__label">Select Focus Area:</label>
            <div class="pillar-pills">
                <button class="pillar-pill" data-pillar="application-modernization">
                    <span class="pillar-pill__icon">📱</span>
                    <span class="pillar-pill__text">Application Modernization</span>
                </button>
                <button class="pillar-pill" data-pillar="infrastructure-automation">
                    <span class="pillar-pill__icon">⚙️</span>
                    <span class="pillar-pill__text">Infrastructure Automation</span>
                </button>
                <button class="pillar-pill" data-pillar="technology-business-management">
                    <span class="pillar-pill__icon">📊</span>
                    <span class="pillar-pill__text">Technology Business Management</span>
                </button>
            </div>
        </div>

        <div class="pillar-divider"></div>

        <!-- Dynamic Questions Container -->
        <div id="pillar-questions-container">
            
            <!-- Application Development & Integration -->
            <div class="subsection" data-pillar-subsection="application-modernization">
                <h3 class="subsection__title">Application Development & Integration</h3>
                
                <div class="question-card" data-question-number="05" data-pillar-question="application-modernization">
                    <div class="question-card__header">
                        <span class="question-card__number">05</span>
                        <h4 class="question-card__question">What Application development and Integration projects/initiatives are important for modernization of old IT applications and building new applications and platforms?</h4>
                    </div>
                    <button class="generate-btn">
                        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
                        </svg>
                        Generate
                    </button>
                    <div class="question-card__response" style="display: none;">
                        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
                        <div class="ai-suggestions">
                            <div class="ai-suggestions__header">
                                <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                <span>AI Suggested Follow-ups:</span>
                            </div>
                            <ul class="ai-suggestions__list">
                                <li class="ai-suggestion">What legacy systems are being replaced?</li>
                                <li class="ai-suggestion">What cloud platforms are being adopted?</li>
                                <li class="ai-suggestion">What integration patterns are preferred?</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Infrastructure Lifecycle Management -->
            <div class="subsection" data-pillar-subsection="infrastructure-automation">
                <h3 class="subsection__title">Infrastructure Lifecycle Management</h3>
                
                <div class="question-card" data-question-number="06" data-pillar-question="infrastructure-automation">
                    <div class="question-card__header">
                        <span class="question-card__number">06</span>
                        <h4 class="question-card__question">What processes currently are used to provision and manage infrastructure across your cloud environments, and how much manual effort is involved?</h4>
                    </div>
                    <button class="generate-btn">
                        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
                        </svg>
                        Generate
                    </button>
                    <div class="question-card__response" style="display: none;">
                        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
                        <div class="ai-suggestions">
                            <div class="ai-suggestions__header">
                                <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                <span>AI Suggested Follow-ups:</span>
                            </div>
                            <ul class="ai-suggestions__list">
                                <li class="ai-suggestion">What tools are currently in use?</li>
                                <li class="ai-suggestion">What percentage of provisioning is automated?</li>
                                <li class="ai-suggestion">How long does typical provisioning take?</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="question-card" data-question-number="07" data-pillar-question="infrastructure-automation">
                    <div class="question-card__header">
                        <span class="question-card__number">07</span>
                        <h4 class="question-card__question">Are there any recent incidents where a configuration drift or inconsistent environment caused an outage or delayed a release?</h4>
                    </div>
                    <button class="generate-btn">
                        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
                        </svg>
                        Generate
                    </button>
                    <div class="question-card__response" style="display: none;">
                        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
                        <div class="ai-suggestions">
                            <div class="ai-suggestions__header">
                                <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                <span>AI Suggested Follow-ups:</span>
                            </div>
                            <ul class="ai-suggestions__list">
                                <li class="ai-suggestion">What was the business impact?</li>
                                <li class="ai-suggestion">How was the issue detected and resolved?</li>
                                <li class="ai-suggestion">What preventive measures were implemented?</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Identity & Access Management (RENAMED) -->
            <div class="subsection" data-pillar-subsection="infrastructure-automation">
                <h3 class="subsection__title">Identity & Access Management</h3>
                
                <div class="question-card" data-question-number="08" data-pillar-question="infrastructure-automation">
                    <div class="question-card__header">
                        <span class="question-card__number">08</span>
                        <h4 class="question-card__question">What challenges are they facing around cybersecurity, secrets management and Identity management?</h4>
                    </div>
                    <button class="generate-btn">
                        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
                        </svg>
                        Generate
                    </button>
                    <div class="question-card__response" style="display: none;">
                        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
                        <div class="ai-suggestions">
                            <div class="ai-suggestions__header">
                                <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                <span>AI Suggested Follow-ups:</span>
                            </div>
                            <ul class="ai-suggestions__list">
                                <li class="ai-suggestion">What zero-trust initiatives are underway?</li>
                                <li class="ai-suggestion">How are secrets currently managed?</li>
                                <li class="ai-suggestion">What compliance requirements must be met?</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Network Management -->
            <div class="subsection" data-pillar-subsection="infrastructure-automation">
                <h3 class="subsection__title">Network Management</h3>
                
                <div class="question-card" data-question-number="09" data-pillar-question="infrastructure-automation">
                    <div class="question-card__header">
                        <span class="question-card__number">09</span>
                        <h4 class="question-card__question">How do you currently detect and prioritize network performance issues across your hybrid‑cloud environment, and what's the average time it takes to move from detection to remediation?</h4>
                    </div>
                    <button class="generate-btn">
                        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
                        </svg>
                        Generate
                    </button>
                    <div class="question-card__response" style="display: none;">
                        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
                        <div class="ai-suggestions">
                            <div class="ai-suggestions__header">
                                <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                <span>AI Suggested Follow-ups:</span>
                            </div>
                            <ul class="ai-suggestions__list">
                                <li class="ai-suggestion">What monitoring tools are currently in use?</li>
                                <li class="ai-suggestion">How are network incidents prioritized and escalated?</li>
                                <li class="ai-suggestion">What percentage of issues are resolved proactively vs reactively?</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="question-card" data-question-number="10" data-pillar-question="infrastructure-automation">
                    <div class="question-card__header">
                        <span class="question-card__number">10</span>
                        <h4 class="question-card__question">What challenges do you face in ensuring low‑latency, reliable DNS resolution for your global user base, especially during traffic spikes or DDoS events?</h4>
                    </div>
                    <button class="generate-btn">
                        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
                        </svg>
                        Generate
                    </button>
                    <div class="question-card__response" style="display: none;">
                        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
                        <div class="ai-suggestions">
                            <div class="ai-suggestions__header">
                                <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                <span>AI Suggested Follow-ups:</span>
                            </div>
                            <ul class="ai-suggestions__list">
                                <li class="ai-suggestion">What DNS infrastructure is currently deployed?</li>
                                <li class="ai-suggestion">How do you handle geographic distribution of DNS services?</li>
                                <li class="ai-suggestion">What DDoS mitigation strategies are in place?</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- IT Operations -->
            <div class="subsection" data-pillar-subsection="technology-business-management">
                <h3 class="subsection__title">IT Operations</h3>
                
                <div class="question-card" data-question-number="11" data-pillar-question="technology-business-management">
                    <div class="question-card__header">
                        <span class="question-card__number">11</span>
                        <h4 class="question-card__question">How do you currently ensure that applications always receive the right resources when demand spikes, and are those scaling actions automated or manual?</h4>
                    </div>
                    <button class="generate-btn">
                        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
                        </svg>
                        Generate
                    </button>
                    <div class="question-card__response" style="display: none;">
                        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
                        <div class="ai-suggestions">
                            <div class="ai-suggestions__header">
                                <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                <span>AI Suggested Follow-ups:</span>
                            </div>
                            <ul class="ai-suggestions__list">
                                <li class="ai-suggestion">What triggers currently initiate scaling actions?</li>
                                <li class="ai-suggestion">How long does it typically take to scale resources?</li>
                                <li class="ai-suggestion">What percentage of scaling is proactive vs reactive?</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="question-card" data-question-number="12" data-pillar-question="technology-business-management">
                    <div class="question-card__header">
                        <span class="question-card__number">12</span>
                        <h4 class="question-card__question">What challenges do you face with manually configuring monitoring and root cause analysis, and would an AI driven, zero configuration observability platform that discovers services automatically be valuable?</h4>
                    </div>
                    <button class="generate-btn">
                        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
                        </svg>
                        Generate
                    </button>
                    <div class="question-card__response" style="display: none;">
                        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
                        <div class="ai-suggestions">
                            <div class="ai-suggestions__header">
                                <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                <span>AI Suggested Follow-ups:</span>
                            </div>
                            <ul class="ai-suggestions__list">
                                <li class="ai-suggestion">How much time is spent on manual monitoring configuration?</li>
                                <li class="ai-suggestion">What tools are currently used for observability?</li>
                                <li class="ai-suggestion">How quickly can you identify root causes today?</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="question-card" data-question-number="13" data-pillar-question="technology-business-management">
                    <div class="question-card__header">
                        <span class="question-card__number">13</span>
                        <h4 class="question-card__question">How do you currently consolidate siloed monitoring data and automate remediation, and could an AI powered IT Ops hub that unifies insights and triggers actions improve your incident resolution speed?</h4>
                    </div>
                    <button class="generate-btn">
                        <svg class="generate-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
                        </svg>
                        Generate
                    </button>
                    <div class="question-card__response" style="display: none;">
                        <textarea class="response-field" placeholder="AI-generated response will appear here..." rows="4"></textarea>
                        <div class="ai-suggestions">
                            <div class="ai-suggestions__header">
                                <svg class="ai-suggestions__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2V8M8 8V14M8 8H14M8 8H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                <span>AI Suggested Follow-ups:</span>
                            </div>
                            <ul class="ai-suggestions__list">
                                <li class="ai-suggestion">How many different monitoring tools are in use?</li>
                                <li class="ai-suggestion">What is your current mean time to resolution (MTTR)?</li>
                                <li class="ai-suggestion">What percentage of incidents require manual intervention?</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- No Selection Message -->
        <div class="no-pillar-message" id="no-pillar-message">
            <svg class="info-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>Please select an automation pillar above to see relevant questions.</p>
        </div>

        <div class="source-filter">
            <span class="source-filter__label">Sources:</span>
            <span class="source-filter__count">12 sources</span>
            <select class="source-filter__select" aria-label="Filter sources">
                <option value="all">All sources</option>
                <option value="web">Web sources</option>
                <option value="news">News sources</option>
            </select>
        </div>
    </div>
</section>
```

---

## 5. CSS Styling

```css
/* Pillar Choice List */
.pillar-choice-list {
    margin-bottom: 2rem;
}

.pillar-choice-list__label {
    display: block;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
}

.pillar-pills {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Pillar Pill Buttons */
.pillar-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: var(--color-bg-card);
    border: 2px solid var(--color-border);
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.pillar-pill:hover {
    border-color: var(--color-accent);
    background: var(--color-bg-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pillar-pill.active {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
}

.pillar-pill__icon {
    font-size: 1.25rem;
}

.pillar-pill__text {
    white-space: nowrap;
}

/* Pillar Divider */
.pillar-divider {
    height: 1px;
    background: var(--color-border);
    margin: 2rem 0;
}

/* Questions Container */
#pillar-questions-container {
    display: none;
}

#pillar-questions-container.active {
    display: block;
}

/* No Pillar Message */
.no-pillar-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    color: var(--color-text-secondary);
}

.no-pillar-message.hidden {
    display: none;
}

.no-pillar-message .info-icon {
    margin-bottom: 1rem;
    color: var(--color-accent);
}

.no-pillar-message p {
    font-size: 1rem;
    max-width: 400px;
}

/* Hidden Questions/Subsections */
.question-card.hidden-by-pillar,
.subsection.hidden-by-pillar {
    display: none !important;
}

/* Responsive Design */
@media (max-width: 768px) {
    .pillar-pills {
        flex-direction: column;
    }
    
    .pillar-pill {
        width: 100%;
        justify-content: center;
    }
}
```

---

## 6. JavaScript Logic

```javascript
// Add to state object
const state = {
    // ... existing state
    selectedPillar: null,
    pillarQuestionMap: {
        'application-modernization': ['05'],
        'infrastructure-automation': ['06', '07', '08', '09', '10'],
        'technology-business-management': ['11', '12', '13']
    }
};

// Initialize pillar selection
function initPillarSelection() {
    const pillarPills = document.querySelectorAll('.pillar-pill');
    const questionsContainer = document.getElementById('pillar-questions-container');
    const noSelectionMessage = document.getElementById('no-pillar-message');
    
    // Initially hide questions, show message
    if (questionsContainer) {
        questionsContainer.classList.remove('active');
    }
    if (noSelectionMessage) {
        noSelectionMessage.classList.remove('hidden');
    }
    
    // Add click handlers to pillar pills
    pillarPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const pillar = pill.dataset.pillar;
            selectPillar(pillar, pill, pillarPills, questionsContainer, noSelectionMessage);
        });
    });
}

// Select a pillar and show relevant questions
function selectPillar(pillar, selectedPill, allPills, questionsContainer, noSelectionMessage) {
    // Update pill states
    allPills.forEach(pill => {
        if (pill === selectedPill) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
    
    // Show questions container, hide message
    if (questionsContainer) {
        questionsContainer.classList.add('active');
    }
    if (noSelectionMessage) {
        noSelectionMessage.classList.add('hidden');
    }
    
    // Filter questions
    filterQuestionsByPillar(pillar);
    
    // Update state
    state.selectedPillar = pillar;
    saveData();
}

// Filter questions based on selected pillar
function filterQuestionsByPillar(pillar) {
    const allowedQuestions = state.pillarQuestionMap[pillar];
    const allQuestionCards = document.querySelectorAll('[data-pillar-question]');
    const allSubsections = document.querySelectorAll('[data-pillar-subsection]');
    
    // Show/hide questions
    allQuestionCards.forEach(card => {
        const cardPillars = card.dataset.pillarQuestion.split(',');
        if (cardPillars.includes(pillar)) {
            card.classList.remove('hidden-by-pillar');
        } else {
            card.classList.add('hidden-by-pillar');
        }
    });
    
    // Show/hide subsections
    allSubsections.forEach(subsection => {
        const subsectionPillars = subsection.dataset.pillarSubsection.split(',');
        const visibleQuestions = subsection.querySelectorAll('[data-pillar-question]:not(.hidden-by-pillar)');
        
        if (subsectionPillars.includes(pillar) && visibleQuestions.length > 0) {
            subsection.classList.remove('hidden-by-pillar');
        } else {
            subsection.classList.add('hidden-by-pillar');
        }
    });
}

// Add to init() function
function init() {
    // ... existing init code
    initPillarSelection();
    
    // Restore pillar selection if saved
    if (state.selectedPillar) {
        const savedPill = document.querySelector(`[data-pillar="${state.selectedPillar}"]`);
        if (savedPill) {
            const allPills = document.querySelectorAll('.pillar-pill');
            const questionsContainer = document.getElementById('pillar-questions-container');
            const noSelectionMessage = document.getElementById('no-pillar-message');
            selectPillar(state.selectedPillar, savedPill, allPills, questionsContainer, noSelectionMessage);
        }
    }
}
```

---

## 7. Summary of Changes

### Question Distribution (FINAL):
- **Application Modernization**: Q05 (1 question)
- **Infrastructure Automation**: Q06, Q07, Q08, Q09, Q10 (5 questions)
- **Technology Business Management**: Q11, Q12, Q13 (3 questions)

### Subsection Changes:
- **Renamed**: "Cybersecurity & Identity Management" → "Identity & Access Management"
- **Moved**: All questions Q05-Q13 from Section 2 to new Section 3
- **Kept**: Big Picture Strategy (Q01-Q04) remains in Section 2

### Section Renumbering:
- Section 3 → Section 4 (Potential Opportunities)
- Section 4 → Section 5 (Tech Headlines)
- Section 5 → Section 6 (Contacts)
- And so on...

---

**This is the final design ready for implementation!**