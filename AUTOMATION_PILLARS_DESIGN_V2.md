# Automation Pillars Feature - Design V2 (Revised Structure)

## Overview
Create a new Section 3 called "Automation Pillars" that contains a choice list and dynamically displays relevant questions based on the selected pillar. Big Picture Strategy remains separate in Section 2.

---

## 1. New Section Structure

### Current Structure:
- Section 1: Customer & Industry
- Section 2: Research your Client (Big Picture + All Technical Questions)
- Section 3: Potential Opportunities
- Section 4: Tech Headlines
- Section 5+: Other sections

### New Structure:
- Section 1: Customer & Industry
- **Section 2: Big Picture Strategy** (4 questions - unchanged)
- **Section 3: Automation Pillars** (NEW - choice list + dynamic questions)
- Section 4: Potential Opportunities (was Section 3)
- Section 5: Tech Headlines (was Section 4)
- Section 6+: Other sections (shift down)

---

## 2. Section 3: Automation Pillars Design

### Section Header
```
Section 3
Automation Pillars
Select your focus area to see relevant questions
```

### Choice List (Top of Section)
Three pill-style buttons in a horizontal row:

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
│  │ Application          │ │ Infrastructure       │ │Technology││
│  │ Modernization        │ │ Automation           │ │Business  ││
│  │                      │ │                      │ │Management││
│  └──────────────────────┘ └──────────────────────┘ └──────────┘│
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  [Dynamic Questions Appear Here Based on Selection]              │
│                                                                   │
│  • Application Development & Integration                          │
│    Q05: What Application development projects...                 │
│                                                                   │
│  • Infrastructure Lifecycle Management                            │
│    Q06: What processes for provisioning...                       │
│    Q07: Configuration drift incidents...                         │
│                                                                   │
│  • Cybersecurity & Identity Management                            │
│    Q08: Cybersecurity challenges...                              │
│                                                                   │
│  • Network Management                                             │
│    Q09: Network performance issues...                            │
│    Q10: DNS resolution challenges...                             │
│                                                                   │
│  • IT Operations                                                  │
│    Q11: Resource scaling...                                      │
│    Q12: Observability platform...                                │
│    Q13: Consolidate monitoring data...                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Three Automation Pillars & Question Mapping

### Pillar 1: Application Modernization
**Questions Shown**:
- Q05: Application development projects (Application Development & Integration)

**Subsections Visible**:
- Application Development & Integration

**Subsections Hidden**:
- Infrastructure Lifecycle Management
- Cybersecurity & Identity Management
- Network Management
- IT Operations

### Pillar 2: Infrastructure Automation
**Questions Shown**:
- Q06: Infrastructure provisioning processes (Infrastructure Lifecycle Management)
- Q07: Configuration drift incidents (Infrastructure Lifecycle Management)
- Q11: Resource scaling (IT Operations)
- Q13: Consolidate monitoring data (IT Operations)

**Subsections Visible**:
- Infrastructure Lifecycle Management (Q06, Q07)
- IT Operations (Q11, Q13)

**Subsections Hidden**:
- Application Development & Integration
- Cybersecurity & Identity Management
- Network Management

### Pillar 3: Technology Business Management
**Questions Shown**:
- Q11: Resource scaling (IT Operations)
- Q12: Observability platform (IT Operations)
- Q13: Consolidate monitoring data (IT Operations)

**Subsections Visible**:
- IT Operations (Q11, Q12, Q13)

**Subsections Hidden**:
- Application Development & Integration
- Infrastructure Lifecycle Management
- Cybersecurity & Identity Management
- Network Management

---

## 4. HTML Structure

```html
<!-- Section 2: Big Picture Strategy (UNCHANGED) -->
<section class="section" id="section-research">
    <div class="section__header">
        <div class="section__header-left">
            <span class="section__label">Section 2</span>
            <h2 class="section__title">Big Picture Strategy</h2>
        </div>
        <!-- Export buttons -->
    </div>

    <div class="section__content">
        <!-- Big Picture Strategy subsection with Q01-Q04 -->
        <div class="subsection">
            <h3 class="subsection__title">Big Picture Strategy</h3>
            <!-- Q01, Q02, Q03, Q04 remain here -->
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
                        <!-- AI suggestions -->
                    </div>
                </div>
            </div>

            <!-- Infrastructure Lifecycle Management -->
            <div class="subsection" data-pillar-subsection="infrastructure-automation">
                <h3 class="subsection__title">Infrastructure Lifecycle Management</h3>
                
                <div class="question-card" data-question-number="06" data-pillar-question="infrastructure-automation">
                    <!-- Q06 content -->
                </div>

                <div class="question-card" data-question-number="07" data-pillar-question="infrastructure-automation">
                    <!-- Q07 content -->
                </div>
            </div>

            <!-- Cybersecurity & Identity Management -->
            <div class="subsection" data-pillar-subsection="none">
                <h3 class="subsection__title">Cybersecurity & Identity Management</h3>
                
                <div class="question-card" data-question-number="08" data-pillar-question="none">
                    <!-- Q08 content -->
                </div>
            </div>

            <!-- Network Management -->
            <div class="subsection" data-pillar-subsection="none">
                <h3 class="subsection__title">Network Management</h3>
                
                <div class="question-card" data-question-number="09" data-pillar-question="none">
                    <!-- Q09 content -->
                </div>

                <div class="question-card" data-question-number="10" data-pillar-question="none">
                    <!-- Q10 content -->
                </div>
            </div>

            <!-- IT Operations -->
            <div class="subsection" data-pillar-subsection="infrastructure-automation,technology-business-management">
                <h3 class="subsection__title">IT Operations</h3>
                
                <div class="question-card" data-question-number="11" data-pillar-question="infrastructure-automation,technology-business-management">
                    <!-- Q11 content -->
                </div>

                <div class="question-card" data-question-number="12" data-pillar-question="technology-business-management">
                    <!-- Q12 content -->
                </div>

                <div class="question-card" data-question-number="13" data-pillar-question="infrastructure-automation,technology-business-management">
                    <!-- Q13 content -->
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
    </div>
</section>

<!-- Section 4: Potential Opportunities (was Section 3) -->
<section class="section" id="section-opportunities">
    <div class="section__header">
        <div class="section__header-left">
            <span class="section__label">Section 4</span>
            <h2 class="section__title">Potential Opportunities</h2>
            <!-- ... -->
        </div>
    </div>
    <!-- ... -->
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
        'infrastructure-automation': ['06', '07', '11', '13'],
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

## 7. Implementation Steps

1. **Move Questions from Section 2 to New Section 3**
   - Keep Big Picture Strategy (Q01-Q04) in Section 2
   - Move all other subsections (Q05-Q13) to new Section 3
   - Add data attributes to questions and subsections

2. **Update Section Numbers**
   - Current Section 3 becomes Section 4
   - Current Section 4 becomes Section 5
   - Update all section labels accordingly

3. **Add Pillar Choice List**
   - Add three pill buttons at top of Section 3
   - Add divider line
   - Add "no selection" message

4. **Add CSS Styles**
   - Add pillar pill styles
   - Add show/hide logic styles
   - Ensure responsive design

5. **Add JavaScript Logic**
   - Initialize pillar selection
   - Handle pill clicks
   - Filter questions dynamically
   - Save/restore selection

6. **Test Thoroughly**
   - Test each pillar selection
   - Test question visibility
   - Test on mobile devices
   - Test localStorage persistence

---

## 8. Benefits of This Approach

1. **Cleaner Separation**: Big Picture stays separate and always visible
2. **Focused Experience**: Users see only relevant technical questions
3. **Better Flow**: Strategic context → Choose focus → See relevant details
4. **Simpler UI**: Pill buttons are cleaner than large cards
5. **Less Scrolling**: Fewer questions visible at once
6. **Clear Intent**: Section title "Automation Pillars" clearly indicates purpose

---

## 9. User Experience Flow

1. User enters customer name and industry (Section 1)
2. User reviews Big Picture Strategy questions (Section 2) - always visible
3. User selects automation focus area (Section 3 pills)
4. Relevant technical questions appear below
5. User generates responses for those questions
6. User continues to Opportunities section (Section 4)

---

**This approach is cleaner and more intuitive! Ready to implement?**