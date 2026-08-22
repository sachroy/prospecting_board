# Automation Pillars Feature - Complete Design Document

## Overview
Add a dynamic filtering system that allows users to select an "Automation Pillar" and see only relevant questions in Section 2.

---

## 1. Visual Design & Placement

### Location
- **Positioned**: Between Section 2 (Research your Client) and Section 3 (Potential Opportunities)
- **Section Label**: "Automation Focus"
- **Section Title**: "Select Your Automation Pillar"

### Layout
Three card-based options displayed horizontally (responsive to stack on mobile):

```
┌─────────────────────────────────────────────────────────────────┐
│  Automation Focus                                                │
│  Select Your Automation Pillar                                   │
│  Choose a focus area to see relevant questions                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   [Icon]     │  │   [Icon]     │  │   [Icon]     │          │
│  │              │  │              │  │              │          │
│  │ Application  │  │Infrastructure│  │  Technology  │          │
│  │Modernization │  │  Automation  │  │   Business   │          │
│  │              │  │              │  │  Management  │          │
│  │ Description  │  │ Description  │  │ Description  │          │
│  │              │  │              │  │              │          │
│  │  [Select]    │  │  [Select]    │  │  [Select]    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  [Show All Questions]  Status: No pillar selected                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Three Automation Pillars

### Pillar 1: Application Modernization
**Icon**: Document/Code icon
**Description**: "Modernize legacy applications, build new platforms, and integrate systems"
**Relevant Questions**:
- Q01: Strategic priorities (Big Picture)
- Q02: What prompted priorities (Big Picture)
- Q03: Differentiation from competitors (Big Picture)
- Q04: IT imperatives (Big Picture)
- Q05: Application development projects (Application Development & Integration)

### Pillar 2: Infrastructure Automation
**Icon**: Network/Server icon
**Description**: "Automate provisioning, configuration management, and infrastructure lifecycle"
**Relevant Questions**:
- Q01: Strategic priorities (Big Picture)
- Q02: What prompted priorities (Big Picture)
- Q04: IT imperatives (Big Picture)
- Q06: Infrastructure provisioning processes (Infrastructure Lifecycle Management)
- Q07: Configuration drift incidents (Infrastructure Lifecycle Management)
- Q11: Resource scaling (IT Operations)
- Q13: Consolidate monitoring data (IT Operations)

### Pillar 3: Technology Business Management
**Icon**: Chart/Dashboard icon
**Description**: "Optimize IT costs, resource allocation, and business value delivery"
**Relevant Questions**:
- Q01: Strategic priorities (Big Picture)
- Q02: What prompted priorities (Big Picture)
- Q03: Differentiation from competitors (Big Picture)
- Q04: IT imperatives (Big Picture)
- Q11: Resource scaling (IT Operations)
- Q12: Observability platform (IT Operations)
- Q13: Consolidate monitoring data (IT Operations)

---

## 3. User Interaction Flow

### Initial State
- All three pillar cards displayed
- All questions in Section 2 visible
- Status message: "No pillar selected - showing all questions"

### When User Selects a Pillar
1. Selected card gets highlighted with accent color
2. Other cards fade slightly (opacity: 0.6)
3. Section 2 questions filter to show only relevant ones
4. Irrelevant subsections hide completely
5. Question numbers remain unchanged
6. Status message updates: "Showing [Pillar Name] questions"
7. "Show All Questions" button becomes prominent

### When User Clicks "Show All Questions"
1. All pillar cards return to normal state
2. All Section 2 questions become visible again
3. Status message: "No pillar selected - showing all questions"

---

## 4. HTML Structure

```html
<!-- Section 2.5: Automation Pillars -->
<section class="section" id="section-automation-pillars">
    <div class="section__header">
        <div class="section__header-left">
            <span class="section__label">Automation Focus</span>
            <h2 class="section__title">Select Your Automation Pillar</h2>
            <p class="section__subtitle">Choose a focus area to see relevant questions</p>
        </div>
    </div>

    <div class="section__content">
        <div class="pillar-selection">
            <div class="pillar-cards">
                <!-- Pillar Card 1 -->
                <div class="pillar-card" data-pillar="application-modernization">
                    <div class="pillar-card__icon">
                        <!-- SVG Icon -->
                    </div>
                    <h3 class="pillar-card__title">Application Modernization</h3>
                    <p class="pillar-card__description">Modernize legacy applications, build new platforms, and integrate systems</p>
                    <button class="pillar-card__button">Select</button>
                </div>

                <!-- Pillar Card 2 -->
                <div class="pillar-card" data-pillar="infrastructure-automation">
                    <div class="pillar-card__icon">
                        <!-- SVG Icon -->
                    </div>
                    <h3 class="pillar-card__title">Infrastructure Automation</h3>
                    <p class="pillar-card__description">Automate provisioning, configuration management, and infrastructure lifecycle</p>
                    <button class="pillar-card__button">Select</button>
                </div>

                <!-- Pillar Card 3 -->
                <div class="pillar-card" data-pillar="technology-business-management">
                    <div class="pillar-card__icon">
                        <!-- SVG Icon -->
                    </div>
                    <h3 class="pillar-card__title">Technology Business Management</h3>
                    <p class="pillar-card__description">Optimize IT costs, resource allocation, and business value delivery</p>
                    <button class="pillar-card__button">Select</button>
                </div>
            </div>

            <div class="pillar-selection__actions">
                <button class="btn btn--secondary" id="show-all-questions">Show All Questions</button>
                <span class="pillar-selection__status">No pillar selected - showing all questions</span>
            </div>
        </div>
    </div>
</section>
```

---

## 5. CSS Styling

```css
/* Pillar Selection Container */
.pillar-selection {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.pillar-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

/* Individual Pillar Card */
.pillar-card {
    background: var(--color-bg-card);
    border: 2px solid var(--color-border);
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
}

.pillar-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.pillar-card.selected {
    border-color: var(--color-accent);
    background: var(--color-bg-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pillar-card.dimmed {
    opacity: 0.6;
}

/* Pillar Card Icon */
.pillar-card__icon {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    color: var(--color-accent);
}

.pillar-card__icon svg {
    width: 100%;
    height: 100%;
}

/* Pillar Card Title */
.pillar-card__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.75rem;
}

/* Pillar Card Description */
.pillar-card__description {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 1.5rem;
    flex-grow: 1;
}

/* Pillar Card Button */
.pillar-card__button {
    padding: 0.75rem 2rem;
    background: var(--color-accent);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pillar-card__button:hover {
    background: var(--color-text-primary);
    transform: scale(1.05);
}

.pillar-card.selected .pillar-card__button {
    background: var(--color-text-primary);
}

/* Actions Section */
.pillar-selection__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
}

.pillar-selection__status {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    font-style: italic;
}

/* Hidden Questions */
.question-card.hidden-by-pillar,
.subsection.hidden-by-pillar {
    display: none !important;
}

/* Responsive Design */
@media (max-width: 768px) {
    .pillar-cards {
        grid-template-columns: 1fr;
    }
    
    .pillar-selection__actions {
        flex-direction: column;
        gap: 1rem;
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
        'application-modernization': ['01', '02', '03', '04', '05'],
        'infrastructure-automation': ['01', '02', '04', '06', '07', '11', '13'],
        'technology-business-management': ['01', '02', '03', '04', '11', '12', '13']
    }
};

// Initialize pillar selection
function initPillarSelection() {
    const pillarCards = document.querySelectorAll('.pillar-card');
    const showAllBtn = document.getElementById('show-all-questions');
    const statusSpan = document.querySelector('.pillar-selection__status');
    
    // Add click handlers to pillar cards
    pillarCards.forEach(card => {
        const button = card.querySelector('.pillar-card__button');
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const pillar = card.dataset.pillar;
            selectPillar(pillar, card, pillarCards, statusSpan);
        });
    });
    
    // Show all questions button
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            clearPillarSelection(pillarCards, statusSpan);
        });
    }
}

// Select a pillar and filter questions
function selectPillar(pillar, selectedCard, allCards, statusSpan) {
    state.selectedPillar = pillar;
    
    // Update card states
    allCards.forEach(card => {
        if (card === selectedCard) {
            card.classList.add('selected');
            card.classList.remove('dimmed');
        } else {
            card.classList.remove('selected');
            card.classList.add('dimmed');
        }
    });
    
    // Filter questions
    filterQuestionsByPillar(pillar);
    
    // Update status
    const pillarName = selectedCard.querySelector('.pillar-card__title').textContent;
    statusSpan.textContent = `Showing ${pillarName} questions`;
    
    // Save to localStorage
    saveData();
}

// Clear pillar selection and show all questions
function clearPillarSelection(allCards, statusSpan) {
    state.selectedPillar = null;
    
    // Reset card states
    allCards.forEach(card => {
        card.classList.remove('selected', 'dimmed');
    });
    
    // Show all questions
    showAllQuestions();
    
    // Update status
    statusSpan.textContent = 'No pillar selected - showing all questions';
    
    // Save to localStorage
    saveData();
}

// Filter questions based on selected pillar
function filterQuestionsByPillar(pillar) {
    const allowedQuestions = state.pillarQuestionMap[pillar];
    const allQuestionCards = document.querySelectorAll('.question-card');
    const allSubsections = document.querySelectorAll('.subsection');
    
    // Hide all questions first
    allQuestionCards.forEach(card => {
        const questionNumber = card.querySelector('.question-card__number').textContent;
        if (allowedQuestions.includes(questionNumber)) {
            card.classList.remove('hidden-by-pillar');
        } else {
            card.classList.add('hidden-by-pillar');
        }
    });
    
    // Hide subsections with no visible questions
    allSubsections.forEach(subsection => {
        const visibleQuestions = subsection.querySelectorAll('.question-card:not(.hidden-by-pillar)');
        if (visibleQuestions.length === 0) {
            subsection.classList.add('hidden-by-pillar');
        } else {
            subsection.classList.remove('hidden-by-pillar');
        }
    });
}

// Show all questions
function showAllQuestions() {
    const allQuestionCards = document.querySelectorAll('.question-card');
    const allSubsections = document.querySelectorAll('.subsection');
    
    allQuestionCards.forEach(card => {
        card.classList.remove('hidden-by-pillar');
    });
    
    allSubsections.forEach(subsection => {
        subsection.classList.remove('hidden-by-pillar');
    });
}

// Add to init() function
function init() {
    // ... existing init code
    initPillarSelection();
    
    // Restore pillar selection if saved
    if (state.selectedPillar) {
        const savedCard = document.querySelector(`[data-pillar="${state.selectedPillar}"]`);
        if (savedCard) {
            const allCards = document.querySelectorAll('.pillar-card');
            const statusSpan = document.querySelector('.pillar-selection__status');
            selectPillar(state.selectedPillar, savedCard, allCards, statusSpan);
        }
    }
}
```

---

## 7. Question Mapping Details

### Application Modernization Focus
Shows questions about:
- Strategic priorities and business goals
- Application development initiatives
- Platform modernization
- System integration

**Visible Subsections**:
- Big Picture Strategy (all 4 questions)
- Application Development & Integration (Q05)

**Hidden Subsections**:
- Infrastructure Lifecycle Management
- Cybersecurity & Identity Management
- Network Management
- IT Operations

### Infrastructure Automation Focus
Shows questions about:
- Strategic priorities
- Infrastructure provisioning
- Configuration management
- Resource scaling
- Monitoring consolidation

**Visible Subsections**:
- Big Picture Strategy (Q01, Q02, Q04)
- Infrastructure Lifecycle Management (Q06, Q07)
- IT Operations (Q11, Q13)

**Hidden Subsections**:
- Application Development & Integration
- Cybersecurity & Identity Management
- Network Management (partially)

### Technology Business Management Focus
Shows questions about:
- Strategic priorities
- Competitive differentiation
- Resource optimization
- Cost management
- Observability and monitoring

**Visible Subsections**:
- Big Picture Strategy (all 4 questions)
- IT Operations (Q11, Q12, Q13)

**Hidden Subsections**:
- Application Development & Integration
- Infrastructure Lifecycle Management
- Cybersecurity & Identity Management
- Network Management

---

## 8. Benefits of This Design

1. **User-Focused**: Reduces cognitive load by showing only relevant questions
2. **Flexible**: Users can still see all questions if needed
3. **Persistent**: Selection is saved to localStorage
4. **Visual**: Clear card-based design matches existing aesthetic
5. **Responsive**: Works on all device sizes
6. **Non-Destructive**: Doesn't remove questions, just hides them
7. **Intuitive**: Simple select/deselect interaction pattern

---

## 9. Implementation Steps

1. Add HTML section between Section 2 and Section 3
2. Add CSS styles to `css/components.css` or `css/sections.css`
3. Add JavaScript functions to `js/app.js`
4. Add data attributes to existing question cards for easier filtering
5. Test on different screen sizes
6. Update documentation

---

## 10. Future Enhancements

- Add animation when questions appear/disappear
- Add question count indicator (e.g., "Showing 5 of 13 questions")
- Add keyboard navigation support
- Add ability to select multiple pillars
- Add custom pillar creation
- Add pillar-specific AI prompts for better responses

---

**Ready to implement?** This design maintains the existing aesthetic while adding powerful filtering functionality!