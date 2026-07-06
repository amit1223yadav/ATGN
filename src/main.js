import './style.css';

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   Global showToast(message, type, duration) — works from inline onclick too
   Types: 'success' | 'error' | 'info' | 'warning'
   ========================================================================== */

const TOAST_ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

window.showToast = function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  toast.innerHTML = `
    <div class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</div>
    <div class="toast-body">
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close" aria-label="Dismiss notification">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="toast-progress">
      <div class="toast-progress-bar"></div>
    </div>
  `;

  container.appendChild(toast);

  // Animate in — slight delay allows transition to trigger
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
  });

  // Progress bar animation
  const bar = toast.querySelector('.toast-progress-bar');
  bar.style.transitionDuration = `${duration}ms`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => bar.classList.add('toast-progress-shrink'));
  });

  // Auto-dismiss timer
  let autoTimer = setTimeout(() => dismissToast(toast), duration);

  // Pause on hover
  toast.addEventListener('mouseenter', () => {
    clearTimeout(autoTimer);
    bar.style.animationPlayState = 'paused';
    bar.style.transitionDuration = '0ms'; // Freeze progress bar
  });
  toast.addEventListener('mouseleave', () => {
    bar.style.transitionDuration = '1500ms';
    bar.classList.add('toast-progress-shrink');
    autoTimer = setTimeout(() => dismissToast(toast), 1500);
  });

  // Manual dismiss on ✕ button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoTimer);
    dismissToast(toast);
  });

  function dismissToast(el) {
    el.classList.remove('toast-visible');
    el.classList.add('toast-hiding');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. THEME SWITCHER (LIGHT/DARK MODE)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');
  const themeText = themeToggleBtn.querySelector('.theme-text');

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.body.classList.add('dark');
    themeText.textContent = 'Light Mode';
  } else {
    document.body.classList.remove('dark');
    themeText.textContent = 'Dark Mode';
  }

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    showToast(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info', 2000);
    // Sync drawer toggle icon
    syncDrawerThemeToggle(isDark);
  });

  function syncDrawerThemeToggle(isDark) {
    const drawerToggle = document.getElementById('drawer-theme-toggle');
    if (!drawerToggle) return;
    const moonIcon = drawerToggle.querySelector('.drawer-theme-icon-moon');
    const sunIcon  = drawerToggle.querySelector('.drawer-theme-icon-sun');
    const text     = drawerToggle.querySelector('#drawer-theme-text');
    if (isDark) {
      moonIcon.style.display = 'none';
      sunIcon.style.display = '';
      text.textContent = 'Light Mode';
    } else {
      moonIcon.style.display = '';
      sunIcon.style.display = 'none';
      text.textContent = 'Dark Mode';
    }
  }

  // Init drawer icon state on load
  syncDrawerThemeToggle(document.body.classList.contains('dark'));

  // Drawer theme toggle button
  const drawerThemeToggle = document.getElementById('drawer-theme-toggle');
  if (drawerThemeToggle) {
    drawerThemeToggle.addEventListener('click', () => {
      themeToggleBtn.click(); // Delegate to main toggle so all sync
    });
  }

  /* ==========================================================================
     2. SCROLLSPY (STICKY NAV ACTIVE STATE)
     ========================================================================== */
  const navLinks = document.querySelectorAll('.tab-link');
  const sections = Array.from(navLinks).map(link => {
    const id = link.getAttribute('href');
    return document.querySelector(id);
  }).filter(el => el !== null);

  function updateActiveNav() {
    const scrollPosition = window.scrollY + 140; // Spacing adjustment for header + sub-nav
    
    let currentActive = sections[0];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (scrollPosition >= section.offsetTop) {
        currentActive = section;
      } else {
        break;
      }
    }

    if (currentActive) {
      const id = `#${currentActive.id}`;
      navLinks.forEach(link => {
        if (link.getAttribute('href') === id) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActiveNav);
  // Run once to initialize
  updateActiveNav();


  /* ==========================================================================
     3. EXPANDABLE OVERVIEW SECTION
     ========================================================================== */
  const readMoreBtn = document.getElementById('read-more-btn');
  const textContainer = document.getElementById('overview-text-container');

  readMoreBtn.addEventListener('click', () => {
    const isExpanded = textContainer.classList.toggle('expanded');
    readMoreBtn.innerHTML = isExpanded 
      ? `Read Less <svg viewBox="0 0 24 24" width="16" height="16" class="chevron-icon" style="transform: rotate(180deg)"><path d="M7 10l5 5 5-5H7z" fill="currentColor"/></svg>`
      : `Read More <svg viewBox="0 0 24 24" width="16" height="16" class="chevron-icon"><path d="M7 10l5 5 5-5H7z" fill="currentColor"/></svg>`;
  });


  /* ==========================================================================
     4. CONTACTS SEARCH & FILTER SYSTEM
     ========================================================================== */
  const contactTabs = document.querySelectorAll('.filter-tab');
  const searchInput = document.getElementById('contacts-search-input');
  const contactRows = document.querySelectorAll('.contact-row');
  const contactsCount = document.getElementById('contacts-count');
  const noContactsResults = document.getElementById('no-contacts-results');

  let activeDept = 'all';
  let searchQuery = '';

  function filterContacts() {
    let visibleCount = 0;

    contactRows.forEach(row => {
      const dept = row.getAttribute('data-department');
      const name = row.querySelector('.contact-name').textContent.toLowerCase();
      const title = row.querySelector('.contact-title').textContent.toLowerCase();
      
      const deptMatch = activeDept === 'all' || dept === activeDept;
      const searchMatch = name.includes(searchQuery) || title.includes(searchQuery);

      if (deptMatch && searchMatch) {
        row.classList.remove('hidden');
        visibleCount++;
      } else {
        row.classList.add('hidden');
      }
    });

    contactsCount.textContent = `${visibleCount} Contact${visibleCount !== 1 ? 's' : ''}`;
    
    if (visibleCount === 0) {
      noContactsResults.classList.remove('hidden');
      document.getElementById('contacts-table').classList.add('hidden');
    } else {
      noContactsResults.classList.add('hidden');
      document.getElementById('contacts-table').classList.remove('hidden');
    }
  }

  // Filter tabs click
  contactTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      contactTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeDept = tab.getAttribute('data-dept');
      filterContacts();
    });
  });

  // Search input change
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    filterContacts();
  });


  /* ==========================================================================
     5. CONTACT DETAILS REVEAL SIMULATION
     ========================================================================== */
  const revealBtns = document.querySelectorAll('.reveal-btn');

  revealBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('revealed')) {
        showToast('ℹ️ Contact info already revealed.', 'info', 2500);
        return;
      }

      const btnText = btn.querySelector('.btn-text');
      const spinner = btn.querySelector('.spinner');
      const realValue = btn.getAttribute('data-val');

      // Hide text, show loader spinner
      btnText.classList.add('hidden');
      spinner.classList.remove('hidden');

      // Simulate a network database query
      setTimeout(() => {
        spinner.classList.add('hidden');
        btnText.textContent = realValue;
        btnText.classList.remove('hidden');
        btn.classList.add('revealed');
        showToast('🔓 Contact info unlocked! 1 credit used.', 'success', 3500);
      }, 600);
    });
  });


  /* ==========================================================================
     6. TECHNOGRAPHICS FILTER SEARCH
     ========================================================================== */
  const techFilterInput = document.getElementById('tech-filter-input');
  const techCards = document.querySelectorAll('.tech-category-card');
  const techBadges = document.querySelectorAll('.tech-badge');
  const noTechResults = document.getElementById('no-tech-results');

  techFilterInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    let totalMatches = 0;

    if (query === '') {
      // Reset all badges and cards to standard styling
      techBadges.forEach(badge => {
        badge.classList.remove('match', 'fade-badge');
      });
      techCards.forEach(card => card.classList.remove('hidden'));
      noTechResults.classList.add('hidden');
      return;
    }

    techCards.forEach(card => {
      const badgesInCard = card.querySelectorAll('.tech-badge');
      let cardMatches = 0;

      badgesInCard.forEach(badge => {
        const techName = badge.getAttribute('data-name');
        if (techName.includes(query)) {
          badge.classList.add('match');
          badge.classList.remove('fade-badge');
          cardMatches++;
          totalMatches++;
        } else {
          badge.classList.remove('match');
          badge.classList.add('fade-badge');
        }
      });

      if (cardMatches > 0) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });

    if (totalMatches === 0) {
      noTechResults.classList.remove('hidden');
    } else {
      noTechResults.classList.add('hidden');
    }
  });


  /* ==========================================================================
     7. FINANCIALS TABLE ROW EXPANSION
     ========================================================================== */
  const fundingRows = document.querySelectorAll('.funding-row');

  fundingRows.forEach(row => {
    row.addEventListener('click', () => {
      const targetId = row.getAttribute('data-target');
      const detailsRow = document.getElementById(targetId);

      const isExpanded = row.classList.toggle('expanded-row');
      
      if (isExpanded) {
        detailsRow.classList.remove('hidden-details');
      } else {
        detailsRow.classList.add('hidden-details');
      }
    });
  });


  /* ==========================================================================
     8. FAQ ACCORDION COMPONENT
     ========================================================================== */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const currentItem = header.parentElement;
      const currentBody = currentItem.querySelector('.accordion-body');
      const isActive = currentItem.classList.contains('active');

      // Collapse all accordion items first (classical accordion behavior)
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-body').style.maxHeight = '0px';
      });

      // If clicked item wasn't active, expand it
      if (!isActive) {
        currentItem.classList.add('active');
        currentBody.style.maxHeight = `${currentBody.scrollHeight}px`;
      }
    });
  });


  /* ==========================================================================
     9. COMPETITOR COMPARISON MODAL POPUP
     ========================================================================== */
  const compareBtns = document.querySelectorAll('.compare-btn');
  const compareModal = document.getElementById('compare-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  // Modal Table Fields
  const compNameHeader = document.getElementById('compare-comp-header');
  const compNameIntro = document.getElementById('compare-competitor-name');
  const compRev = document.getElementById('compare-comp-rev');
  const compEmp = document.getElementById('compare-comp-emp');
  const compHq = document.getElementById('compare-comp-hq');
  const compFounded = document.getElementById('compare-comp-founded');
  const compTech = document.getElementById('compare-comp-tech');

  function openCompareModal(e) {
    const btn = e.target;
    const targetComp = btn.getAttribute('data-target-company');
    const revenue = btn.getAttribute('data-revenue');
    const employees = btn.getAttribute('data-employees');
    const hq = btn.getAttribute('data-hq');
    const founded = btn.getAttribute('data-founded');
    const tech = btn.getAttribute('data-tech');

    // Populate data
    compNameHeader.textContent = targetComp;
    compNameIntro.textContent = targetComp;
    compRev.textContent = revenue;
    compEmp.textContent = employees;
    compHq.textContent = hq;
    compFounded.textContent = founded;
    compTech.textContent = tech;

    // Show modal
    compareModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Lock body scroll when modal is open
  }

  function closeCompareModal() {
    compareModal.classList.add('hidden');
    document.body.style.overflow = ''; // Unlock body scroll
  }

  compareBtns.forEach(btn => btn.addEventListener('click', openCompareModal));
  modalCloseBtn.addEventListener('click', closeCompareModal);
  modalCancelBtn.addEventListener('click', closeCompareModal);

  // Close modal when clicking backdrop
  compareModal.addEventListener('click', (e) => {
    if (e.target === compareModal) {
      closeCompareModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!compareModal.classList.contains('hidden')) closeCompareModal();
      if (!upgradeModal.classList.contains('hidden')) closeUpgradeModal();
      if (!profileModal.classList.contains('hidden')) closeProfileModal();
      if (!mobileDrawer.classList.contains('hidden-drawer')) closeMobileDrawer();
    }
  });

  /* ==========================================================================
     10. MOBILE HAMBURGER DRAWER MENU
     ========================================================================== */
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerToggle = document.getElementById('mobile-drawer-toggle');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');

  function openMobileDrawer() {
    mobileDrawerToggle.classList.add('active');
    mobileDrawer.classList.remove('hidden-drawer');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    mobileDrawerToggle.classList.remove('active');
    mobileDrawer.classList.add('hidden-drawer');
    document.body.style.overflow = '';
  }

  mobileDrawerToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = mobileDrawerToggle.classList.contains('active');
    if (isActive) {
      closeMobileDrawer();
    } else {
      openMobileDrawer();
    }
  });

  drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  
  // Close drawer when clicking the backdrop
  mobileDrawer.addEventListener('click', (e) => {
    if (e.target === mobileDrawer) {
      closeMobileDrawer();
    }
  });

  /* ==========================================================================
     11. UPGRADE PLAN MODAL PRICING
     ========================================================================== */
  const upgradeModal = document.getElementById('upgrade-modal');
  const headerUpgradeBtn = document.getElementById('header-upgrade-btn');
  const drawerLinkUpgrade = document.getElementById('drawer-link-upgrade');
  const upgradeModalCloseBtn = document.getElementById('upgrade-modal-close-btn');

  function openUpgradeModal() {
    closeMobileDrawer(); // Auto-close drawer if open
    upgradeModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeUpgradeModal() {
    upgradeModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  headerUpgradeBtn.addEventListener('click', openUpgradeModal);
  drawerLinkUpgrade.addEventListener('click', (e) => {
    e.preventDefault();
    openUpgradeModal();
  });
  upgradeModalCloseBtn.addEventListener('click', closeUpgradeModal);

  upgradeModal.addEventListener('click', (e) => {
    if (e.target === upgradeModal) {
      closeUpgradeModal();
    }
  });

  /* ==========================================================================
     12. MY PROFILE SETTINGS MODAL
     ========================================================================== */
  const profileModal = document.getElementById('profile-modal');
  const headerUserAvatar = document.getElementById('header-user-avatar');
  const drawerLinkProfile = document.getElementById('drawer-link-profile');
  const profileModalCloseBtn = document.getElementById('profile-modal-close-btn');
  const profileModalCancelBtn = document.getElementById('profile-modal-cancel-btn');
  const profileUpgradeLink = document.getElementById('profile-upgrade-link');

  function openProfileModal() {
    closeMobileDrawer(); // Auto-close drawer if open
    profileModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeProfileModal() {
    profileModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  headerUserAvatar.addEventListener('click', openProfileModal);
  drawerLinkProfile.addEventListener('click', (e) => {
    e.preventDefault();
    openProfileModal();
  });
  profileModalCloseBtn.addEventListener('click', closeProfileModal);
  profileModalCancelBtn.addEventListener('click', closeProfileModal);
  
  // Link inside profile settings to open upgrade plans
  profileUpgradeLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeProfileModal();
    openUpgradeModal();
  });

  profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
      closeProfileModal();
    }
  });

  /* ==========================================================================
     13. UNLOCK PROFILE MODAL (Sign In / Register)
     ========================================================================== */
  const unlockModal      = document.getElementById('unlock-modal');
  const unlockProfileBtn = document.getElementById('unlock-profile-btn');
  const unlockModalClose = document.getElementById('unlock-modal-close');
  const unlockTabSignin  = document.getElementById('unlock-tab-signin');
  const unlockTabRegister= document.getElementById('unlock-tab-register');
  const unlockSigninForm = document.getElementById('unlock-signin-form');
  const unlockRegisterForm= document.getElementById('unlock-register-form');

  function openUnlockModal() {
    unlockModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeUnlockModal() {
    unlockModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (unlockProfileBtn) unlockProfileBtn.addEventListener('click', openUnlockModal);
  if (unlockModalClose) unlockModalClose.addEventListener('click', closeUnlockModal);

  // Backdrop click
  unlockModal.addEventListener('click', (e) => {
    if (e.target === unlockModal) closeUnlockModal();
  });

  // Tab switching
  unlockTabSignin.addEventListener('click', () => {
    unlockTabSignin.classList.add('active');
    unlockTabRegister.classList.remove('active');
    unlockSigninForm.classList.remove('hidden');
    unlockRegisterForm.classList.add('hidden');
  });
  unlockTabRegister.addEventListener('click', () => {
    unlockTabRegister.classList.add('active');
    unlockTabSignin.classList.remove('active');
    unlockRegisterForm.classList.remove('hidden');
    unlockSigninForm.classList.add('hidden');
  });

  // Sign-in form submit
  unlockSigninForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const pass  = document.getElementById('signin-password').value;
    if (!email || !pass) {
      showToast('⚠️ Please enter your email and password.', 'warning');
      return;
    }
    showToast('🔒 Signing in... Access granted!', 'success', 4000);
    setTimeout(closeUnlockModal, 1200);
  });

  // Register form submit
  unlockRegisterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value.trim();
    const company = document.getElementById('reg-company').value.trim();
    if (!email || !company) {
      showToast('⚠️ Please fill all required fields.', 'warning');
      return;
    }
    showToast('🎉 Account created! Check your email to verify.', 'success', 5000);
    setTimeout(closeUnlockModal, 1500);
  });

  // Close unlock on Escape — already handled globally above

  /* ==========================================================================
     14. SAVE LIST MODAL
     ========================================================================== */
  const savelistModal       = document.getElementById('savelist-modal');
  const saveListBtn         = document.getElementById('save-list-btn');
  const savelistModalClose  = document.getElementById('savelist-modal-close');
  const savelistModalCancel = document.getElementById('savelist-modal-cancel');
  const savelistModalSave   = document.getElementById('savelist-modal-save');
  const createListBtn       = document.getElementById('create-list-btn');
  const newListNameInput    = document.getElementById('new-list-name-input');

  function openSavelistModal() {
    savelistModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeSavelistModal() {
    savelistModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (saveListBtn) saveListBtn.addEventListener('click', openSavelistModal);
  if (savelistModalClose)  savelistModalClose.addEventListener('click',  closeSavelistModal);
  if (savelistModalCancel) savelistModalCancel.addEventListener('click', closeSavelistModal);

  savelistModal.addEventListener('click', (e) => {
    if (e.target === savelistModal) closeSavelistModal();
  });

  // Create new list button
  if (createListBtn) {
    createListBtn.addEventListener('click', () => {
      const name = newListNameInput.value.trim();
      if (!name) {
        showToast('⚠️ Please enter a list name.', 'warning', 2500);
        return;
      }
      // Inject the new list into the DOM
      const listsContainer = savelistModal.querySelector('.savelist-lists');
      const label = document.createElement('label');
      label.className = 'savelist-list-item savelist-new-entry';
      label.innerHTML = `<input type="checkbox" class="savelist-checkbox" checked /><div class="savelist-list-info"><span class="savelist-list-name">📋 ${name}</span><span class="savelist-list-count">0 companies</span></div>`;
      listsContainer.appendChild(label);
      newListNameInput.value = '';
      showToast(`✅ List "${name}" created!`, 'success', 3000);
    });
  }

  // Save button
  if (savelistModalSave) {
    savelistModalSave.addEventListener('click', () => {
      const checked = savelistModal.querySelectorAll('.savelist-checkbox:checked');
      if (checked.length === 0) {
        showToast('⚠️ Select at least one list to save to.', 'warning', 2500);
        return;
      }
      const listNames = Array.from(checked)
        .map(cb => cb.closest('label').querySelector('.savelist-list-name').textContent.replace(/^[^\w]+/, '').trim())
        .slice(0, 2);
      showToast(`📌 PandaDoc saved to ${listNames.join(' & ')}${checked.length > 2 ? ' + more' : ''}`, 'success', 4000);
      closeSavelistModal();
    });
  }
});

// Global helper for password visibility toggle (called from inline onclick)
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.style.opacity = isHidden ? '1' : '0.5';
};
