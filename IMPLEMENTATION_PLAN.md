# Automation Pillars - Implementation Plan

## Overview
Implement the Automation Pillars feature with Section 4+ hidden until a pillar is selected.

---

## User Experience Flow

### Initial State (Page Load)
**Visible:**
- Section 1: Customer & Industry
- Section 2: Research your Client (with Big Picture Strategy subsection Q01-Q04)
- Section 3: Automation Pillars (choice list + "Please select" message)

**Hidden:**
- Section 4: Potential Opportunities
- Section 5: Tech Headlines  
- Section 6+: All remaining sections

### After Pillar Selection
**Visible:**
- Section 1: Customer & Industry
- Section 2: Research your Client (with Big Picture Strategy Q01-Q04)
- Section 3: Automation Pillars (choice list + filtered questions Q05-Q13)
- Section 4: Potential Opportunities (revealed with animation)
- Section 5: Tech Headlines (revealed with animation)
- Section 6+: All remaining sections (revealed with animation)

---

## Implementation Steps

### Step 1: Modify HTML Structure

1. **Section 2: NO CHANGES**
   - Keep title as "Research your Client"
   - Keep subsection "Big Picture Strategy" with Q01-Q04
   - Leave everything exactly as is

2. **Create new Section 3: Automation Pillars**
   - Add pillar choice list (3 pill buttons)
   - Move Q05-Q13 from Section 2 to new Section 3
   - Add data attributes for filtering
   - Rename "Cybersecurity & Identity Management" to "Identity & Access Management"
   - Add "no selection" message
   - Add questions container

3. **Update section numbers for existing sections**
   - Current Section 3 (Potential Opportunities) → Section 4
   - Current Section 4 (Tech Headlines) → Section 5
   - Update all subsequent section numbers

4. **Add class to sections 4+**
   - Add `hidden-until-pillar` class to all sections from 4 onwards

### Step 2: Add CSS Styles

Add to `css/components.css` or `css/sections.css`:

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

.pillar-divider {
    height: 1px;
    background: var(--color-border);
    margin: 2rem 0;
}

#pillar-questions-container {
    display: none;
}

#pillar-questions-container.active {
    display: block;
}

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

/* Hidden sections until pillar selected */
.section.hidden-until-pillar {
    display: none;
}

.section.revealed {
    display: block;
    animation: revealSection 0.5s ease-out;
}

@keyframes revealSection {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Hidden questions/subsections by pillar filter */
.question-card.hidden-by-pillar,
.subsection.hidden-by-pillar {
    display: none !important;
}

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

### Step 3: Add JavaScript Logic

Add to `js/app.js`:

```javascript
// Update state object
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
    const hiddenSections = document.querySelectorAll('.section.hidden-until-pillar');
    
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
            selectPillar(pillar, pill, pillarPills, questionsContainer, noSelectionMessage, hiddenSections);
        });
    });
}

// Select a pillar and show relevant questions + reveal hidden sections
function selectPillar(pillar, selectedPill, allPills, questionsContainer, noSelectionMessage, hiddenSections) {
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
    
    // Reveal hidden sections with animation
    hiddenSections.forEach((section, index) => {
        setTimeout(() => {
            section.classList.remove('hidden-until-pillar');
            section.classList.add('revealed');
        }, index * 100); // Stagger animation
    });
    
    // Smooth scroll to show the revealed content
    setTimeout(() => {
        questionsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
    
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
            const hiddenSections = document.querySelectorAll('.section.hidden-until-pillar');
            selectPillar(state.selectedPillar, savedPill, allPills, questionsContainer, noSelectionMessage, hiddenSections);
        }
    }
}
```

---

## Section Structure Summary

**Section 1**: Customer & Industry (unchanged)

**Section 2**: Research your Client (unchanged)
- Big Picture Strategy subsection with Q01-Q04

**Section 3**: Automation Pillars (NEW)
- Pillar choice list
- Application Development & Integration (Q05)
- Infrastructure Lifecycle Management (Q06, Q07)
- Identity & Access Management (Q08) - renamed
- Network Management (Q09, Q10)
- IT Operations (Q11, Q12, Q13)

**Section 4**: Potential Opportunities (was Section 3, hidden initially)

**Section 5**: Tech Headlines (was Section 4, hidden initially)

**Section 6+**: All other sections (hidden initially)

---

## Question Distribution

### Application Modernization (1 question)
- Q05: Application Development & Integration

### Infrastructure Automation (5 questions)
- Q06, Q07: Infrastructure Lifecycle Management
- Q08: Identity & Access Management
- Q09, Q10: Network Management

### Technology Business Management (3 questions)
- Q11, Q12, Q13: IT Operations

---

## Testing Checklist

- [ ] Page loads with only Sections 1, 2, 3 visible
- [ ] Section 2 title is "Research your Client" (unchanged)
- [ ] Section 2 has "Big Picture Strategy" subsection with Q01-Q04
- [ ] Section 4+ are hidden initially
- [ ] Clicking a pillar shows filtered questions in Section 3
- [ ] Clicking a pillar reveals Section 4+ with animation
- [ ] Switching pillars updates questions correctly
- [ ] Switching pillars keeps Section 4+ visible
- [ ] Selection persists in localStorage
- [ ] Responsive design works on mobile
- [ ] Smooth scroll works properly
- [ ] All animations are smooth

---

**Ready to implement!**