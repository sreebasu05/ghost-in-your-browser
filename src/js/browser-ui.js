/**
 * browser-ui.js — Fake browser DOM manipulation
 *
 * Functions to add/remove tabs, change URLs, toggle content states, etc.
 * All operate on the game screen's fake browser (#game-browser).
 */

// --- DOM References (set on init) ---
let tabStrip = null;
let addressBar = null;
let urlText = null;
let contentArea = null;
let findBar = null;
let findTerm = null;
let reloadBtn = null;

/**
 * Initialize with DOM references.
 */
export function initBrowserUI() {
  tabStrip = document.getElementById('game-tab-strip');
  addressBar = document.getElementById('game-address-bar');
  urlText = document.getElementById('game-url-text');
  contentArea = document.getElementById('view-game');
  findBar = document.getElementById('game-find-bar');
  findTerm = document.getElementById('find-term');
  reloadBtn = document.getElementById('btn-reload');
}

// ==========================================
// TABS
// ==========================================

const ICONS = {
  '📄': `<svg class="icon-tab" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
  'file': `<svg class="icon-tab" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
  '🔒': `<svg class="icon-lock" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  'lock': `<svg class="icon-lock" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  '👻': `<svg class="icon-ghost-tab" viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2A9 9 0 0 0 3 11v11a1 1 0 0 0 1.7.7l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3 2.3 2.3a1 1 0 0 0 1.7-.7V11A9 9 0 0 0 12 2zm-3 9a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 9 11zm6 0a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 15 11z"/></svg>`,
  'ghost': `<svg class="icon-ghost-tab" viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2A9 9 0 0 0 3 11v11a1 1 0 0 0 1.7.7l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3 2.3 2.3a1 1 0 0 0 1.7-.7V11A9 9 0 0 0 12 2zm-3 9a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 9 11zm6 0a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 15 11z"/></svg>`,
  '🏆': `<svg class="icon-trophy" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path></svg>`,
  'trophy': `<svg class="icon-trophy" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path></svg>`
};

function getIconSvg(favicon) {
  return ICONS[favicon] || ICONS['📄'];
}

/**
 * Set the tabs in the tab strip.
 * @param {Array<{label: string, active?: boolean, infected?: boolean}>} tabs
 */
export function setTabs(tabs) {
  tabStrip.innerHTML = '';
  tabs.forEach((tab, i) => {
    const el = document.createElement('div');
    el.className = 'tab';
    if (tab.active) el.classList.add('active');
    if (tab.infected) el.classList.add('infected');
    el.dataset.index = i;
    el.innerHTML = `
      <span class="tab-favicon">${getIconSvg(tab.favicon)}</span>
      <span class="tab-label">${tab.label}</span>
      <span class="tab-close"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
    `;
    tabStrip.appendChild(el);
  });
}

/**
 * Add a tab with slide-in animation.
 * @param {string} label
 * @param {boolean} makeActive
 * @returns {HTMLElement} the new tab element
 */
export function addTab(label, makeActive = true) {
  // Deactivate current active tab
  if (makeActive) {
    const current = tabStrip.querySelector('.tab.active');
    if (current) current.classList.remove('active');
  }

  const el = document.createElement('div');
  el.className = 'tab adding';
  if (makeActive) el.classList.add('active');
  el.dataset.index = tabStrip.children.length;
  el.innerHTML = `
    <span class="tab-favicon">${getIconSvg('📄')}</span>
    <span class="tab-label">${label}</span>
    <span class="tab-close"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
  `;
  tabStrip.appendChild(el);

  // Remove animation class after it plays
  setTimeout(() => el.classList.remove('adding'), 300);

  return el;
}

/**
 * Remove a tab with collapse animation.
 * @param {number} index
 * @returns {Promise<void>}
 */
export function removeTab(index) {
  return new Promise(resolve => {
    const tab = tabStrip.children[index];
    if (!tab) { resolve(); return; }

    tab.classList.add('closing');
    setTimeout(() => {
      tab.remove();
      // If the closed tab was active, activate the first remaining tab
      const remaining = tabStrip.querySelector('.tab');
      if (remaining && !tabStrip.querySelector('.tab.active')) {
        remaining.classList.add('active');
      }
      resolve();
    }, 300);
  });
}

/**
 * Mark a tab as infected (glitchy).
 * @param {number} index
 */
export function infectTab(index) {
  const tab = tabStrip.children[index];
  if (tab) tab.classList.add('infected');
}

/**
 * Get a tab element by index.
 * @param {number} index
 * @returns {HTMLElement|null}
 */
export function getTab(index) {
  return tabStrip.children[index] || null;
}

// ==========================================
// ADDRESS BAR
// ==========================================

/**
 * Set the URL text.
 * @param {string} url
 */
export function setUrl(url) {
  urlText.textContent = url;
  addressBar.classList.remove('glitched', 'focused');
}

/**
 * Scramble the URL with glitch characters.
 */
export function glitchUrl() {
  const glitchChars = '█▓▒░╔╗╚╝║═╬╣╠╩╦';
  const original = urlText.textContent;
  let glitched = '';
  for (let i = 0; i < original.length; i++) {
    if (Math.random() > 0.5) {
      glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
    } else {
      glitched += original[i];
    }
  }
  urlText.textContent = glitched;
  addressBar.classList.add('glitched');
}

/**
 * Highlight the address bar (focus glow).
 * @returns {Promise<void>}
 */
export function focusUrl() {
  return new Promise(resolve => {
    addressBar.classList.remove('glitched');
    addressBar.classList.add('focused');
    urlText.textContent = 'https://ghost.browser';
    setTimeout(resolve, 500);
  });
}

/**
 * Reset address bar to normal state.
 */
export function resetUrl() {
  addressBar.classList.remove('glitched', 'focused');
  urlText.textContent = 'https://ghost.browser';
}

// ==========================================
// CONTENT AREA
// ==========================================

/**
 * Set the content area HTML.
 * @param {string} html
 */
export function setContent(html) {
  contentArea.innerHTML = html;
  contentArea.classList.remove('locked', 'static', 'scanline');
}

/**
 * Lock the content area (grayed out with LOCKED text).
 */
export function lockContent() {
  contentArea.classList.add('locked');
}

/**
 * Unlock the content area.
 */
export function unlockContent() {
  contentArea.classList.remove('locked');
}

/**
 * Show static noise overlay.
 */
export function showStatic() {
  contentArea.classList.add('static');
}

/**
 * Clear static with scanline wipe, then resolve.
 * @returns {Promise<void>}
 */
export function clearWithScanline() {
  return new Promise(resolve => {
    contentArea.classList.remove('static');
    contentArea.classList.add('scanline');
    setTimeout(() => {
      contentArea.classList.remove('scanline');
      resolve();
    }, 600);
  });
}

/**
 * Simulate a scroll-down animation.
 * Moves content up and reveals new content below.
 * @returns {Promise<void>}
 */
export function scrollContent() {
  return new Promise(resolve => {
    contentArea.scrollTo({
      top: contentArea.scrollHeight,
      behavior: 'smooth'
    });
    setTimeout(resolve, 550);
  });
}

/**
 * Simulate a scroll-up animation.
 * Moves content down and reveals content above.
 * @returns {Promise<void>}
 */
export function scrollUpContent() {
  return new Promise(resolve => {
    contentArea.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setTimeout(resolve, 550);
  });
}

/**
 * Show reload button spinning animation.
 */
export function spinReload() {
  if (!reloadBtn) return;
  reloadBtn.classList.add('spinning');
  setTimeout(() => reloadBtn.classList.remove('spinning'), 600);
}

/**
 * Simulate a smooth page reload animation (fade out and in).
 * @returns {Promise<void>}
 */
export function niceReload() {
  return new Promise(resolve => {
    spinReload();
    contentArea.style.transition = 'opacity 0.2s ease';
    contentArea.style.opacity = '0';
    
    setTimeout(() => {
      // Clear static and scanline if any
      contentArea.classList.remove('static', 'scanline', 'distorted-page');
      contentArea.style.opacity = '1';
      setTimeout(() => {
        contentArea.style.transition = '';
        resolve();
      }, 200);
    }, 300);
  });
}

// ==========================================
// FIND BAR
// ==========================================

/**
 * Show the find bar with a search term.
 * @param {string} term
 */
export function showFindBar(term) {
  findTerm.textContent = term;
  findBar.classList.remove('hidden');
}

/**
 * Hide the find bar.
 */
export function hideFindBar() {
  findBar.classList.add('hidden');
}

// ==========================================
// FULL RESET
// ==========================================

/**
 * Reset the entire fake browser to a clean state.
 */
export function resetBrowser() {
  setTabs([{ label: 'New Tab', active: true, favicon: '📄' }]);
  resetUrl();
  setContent('');
  hideFindBar();
  contentArea.classList.remove('locked', 'static', 'scanline');
}
