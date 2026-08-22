/**
 * Simple LinkedIn Search - No OAuth Required
 * Adds LinkedIn search functionality to Section 4
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    addLinkedInSearchButton();
    addRoleCheckboxes();
  }

  /**
   * Add LinkedIn search button to Section 4
   */
  function addLinkedInSearchButton() {
    const contactsSection = document.getElementById('section-contacts');
    if (!contactsSection) return;

    const sectionContent = contactsSection.querySelector('.section__content');
    if (!sectionContent) return;

    // Check if button already exists
    if (document.getElementById('linkedin-search-btn')) return;

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f5f3ee;
      border-radius: 0.5rem;
      text-align: center;
    `;

    // Create button
    const button = document.createElement('button');
    button.id = 'linkedin-search-btn';
    button.className = 'btn btn--primary';
    button.style.cssText = `
      background: #0077B5;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    `;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" fill="currentColor"/>
      </svg>
      Search LinkedIn for Contacts
    `;

    button.addEventListener('click', searchLinkedIn);

    buttonContainer.appendChild(button);
    sectionContent.insertBefore(buttonContainer, sectionContent.firstChild);
  }

  /**
   * Add checkboxes to role subsections
   */
  function addRoleCheckboxes() {
    const contactsSection = document.getElementById('section-contacts');
    if (!contactsSection) return;

    const subsections = contactsSection.querySelectorAll('.subsection');
    
    subsections.forEach(subsection => {
      const title = subsection.querySelector('.subsection__title');
      if (!title || title.querySelector('.role-checkbox')) return;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'role-checkbox';
      checkbox.checked = false;
      checkbox.style.cssText = `
        margin-right: 0.5rem;
        cursor: pointer;
        width: 1.2rem;
        height: 1.2rem;
        vertical-align: middle;
      `;
      
      title.insertBefore(checkbox, title.firstChild);
    });
  }

  /**
   * Search LinkedIn for contacts
   */
  function searchLinkedIn() {
    // Get customer name
    const customerNameInput = document.getElementById('customer-name');
    const customerName = customerNameInput ? customerNameInput.value.trim() : '';

    if (!customerName) {
      alert('Please enter a customer name in Section 1 first');
      if (customerNameInput) customerNameInput.focus();
      return;
    }

    // Get selected roles
    const roles = getSelectedRoles();
    
    if (roles.length === 0) {
      alert('Please select at least one role to search for');
      return;
    }

    // Generate and open search URLs
    openLinkedInSearches(customerName, roles);
  }

  /**
   * Get selected roles from checkboxes
   */
  function getSelectedRoles() {
    const roles = [];
    const contactsSection = document.getElementById('section-contacts');
    if (!contactsSection) return roles;

    const subsections = contactsSection.querySelectorAll('.subsection');
    
    const roleMapping = {
      'IT Leadership': 'Chief Information Officer',
      'Application Development & Integration': 'VP of Application Development',
      'Cybersecurity & Identity Management': 'Chief Information Security Officer',
      'Network Automation & Management': 'Director of Network Operations',
      'ARM, APM & CVEs': 'Head of Application Performance'
    };

    subsections.forEach(subsection => {
      const title = subsection.querySelector('.subsection__title');
      const checkbox = subsection.querySelector('.role-checkbox');
      
      if (checkbox && checkbox.checked && title) {
        const titleText = title.textContent.replace('☑', '').replace('☐', '').trim();
        const role = roleMapping[titleText] || titleText;
        roles.push(role);
      }
    });

    return roles;
  }

  /**
   * Open LinkedIn search tabs
   */
  function openLinkedInSearches(company, roles) {
    const searchUrls = roles.map(role => ({
      role: role,
      url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(role + ' at ' + company)}`
    }));

    // Open tabs with delay to avoid popup blocker
    searchUrls.forEach((search, index) => {
      setTimeout(() => {
        window.open(search.url, '_blank');
      }, index * 500);
    });

    // Show instructions
    showInstructions(company, searchUrls);
  }

  /**
   * Show instructions modal
   */
  function showInstructions(company, searchUrls) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    `;

    content.innerHTML = `
      <h2 style="margin-top: 0; color: #0077B5;">LinkedIn Search Opened!</h2>
      <p>We've opened ${searchUrls.length} LinkedIn search tabs for you:</p>
      <ul style="margin: 1rem 0;">
        ${searchUrls.map(s => `<li><strong>${s.role}</strong> at ${company}</li>`).join('')}
      </ul>
      <p><strong>Next steps:</strong></p>
      <ol>
        <li>Log into LinkedIn if you haven't already</li>
        <li>Review the search results in each tab</li>
        <li>Click on profiles that match your criteria</li>
        <li>Copy contact information (name, title, email if available)</li>
        <li>Return here and update the contact cards in Section 4</li>
      </ol>
      <p style="color: #666; font-size: 0.9rem; margin-top: 1.5rem;">
        <strong>Tip:</strong> Use LinkedIn's filters to narrow results by location, company, or other criteria.
      </p>
      <button id="close-modal" style="
        background: #0077B5;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 1rem;
      ">Got it!</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close modal
    document.getElementById('close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

})();

// Made with Bob