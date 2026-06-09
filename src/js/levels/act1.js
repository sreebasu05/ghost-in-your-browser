/**
 * act1.js — Level configurations for Act 1: Browser Basics
 *
 * Each level defines:
 *   - shortcutId: references the shortcut in shortcuts.js
 *   - setup(browserUI, ghost): configures the fake browser state and ghost position
 *   - onSuccess(browserUI, ghost): plays the success animation + sets up transition to next level
 *   - challenge: one-line text displayed in the challenge bar
 */

import * as browserUI from '../browser-ui.js';
import * as ghost from '../ghost.js';
import { getSystemEventLogHTML, getGhostgleHTML } from '../templates.js';
import { delay, triggerTextShatter, fadeViewOut } from '../utils.js';

/**
 * Level configs for Act 1.
 * Each level's onSuccess sets up the visual state for the NEXT level's premise.
 */
export const ACT1_LEVELS = [
  // ─────────────────────────────────────────────
  // Level 1: Space — Scroll Down
  // ─────────────────────────────────────────────
  {
    shortcutId: 'scroll_down',
    challenge: 'The ghost fled below. Scroll down.',
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser');
      browserUI.setContent(getSystemEventLogHTML('ghost-hidden-word', true));
      
      const viewStart = document.getElementById('view-start');
      const viewGame = document.getElementById('view-game');
      viewGame.scrollTop = window.__savedScrollTop !== undefined ? window.__savedScrollTop : viewStart.scrollTop;
      viewGame.classList.remove('distorted-page');
    },
    async onSuccess() {
      await browserUI.scrollContent();
      await delay(300);
      ghost.setState('hidden');
    },
  },

  // ─────────────────────────────────────────────
  // Level 2: ⌘+F — Find on Page
  // ─────────────────────────────────────────────
  {
    shortcutId: 'find',
    challenge: "It's invisible in the text. Find it.",
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser');
      
      const viewGame = document.getElementById('view-game');
      viewGame.scrollTop = viewGame.scrollHeight;
      viewGame.classList.remove('distorted-page');
      
      ghost.setState('hidden');
    },
    async onSuccess() {
      browserUI.showFindBar('GHOST');

      const hiddenWords = document.querySelectorAll('.ghost-hidden-word');
      hiddenWords.forEach(el => {
        el.style.background = 'rgba(251, 191, 36, 0.3)';
        el.style.color = 'var(--color-hint)';
        el.style.padding = '2px 4px';
        el.style.borderRadius = '3px';
      });

      const ghostDOM = document.getElementById('ghost');
      if (hiddenWords.length > 0 && ghostDOM) {
        // Move ghost instantaneously to the hidden word
        const rect = hiddenWords[0].getBoundingClientRect();
        const parentRect = ghostDOM.parentElement.getBoundingClientRect();
        ghostDOM.style.transition = 'none'; // Instant teleport
        ghostDOM.style.left = (rect.left - parentRect.left - 20) + 'px';
        ghostDOM.style.top = (rect.top - parentRect.top - 40) + 'px';
        
        // Force reflow
        void ghostDOM.offsetWidth;
      }

      ghost.show();
      ghost.setState('hit');
      await delay(500);
      
      const viewGame = document.getElementById('view-game');
      viewGame.classList.add('distorted-page');
      ghost.setState('idle');
    },
  },

  // ─────────────────────────────────────────────
  // Level 3: ⌘+R — Reload
  // ─────────────────────────────────────────────
  {
    shortcutId: 'reload',
    challenge: 'It is corrupting the display! Reload.',
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, infected: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser');
      
      const viewGame = document.getElementById('view-game');
      viewGame.scrollTop = viewGame.scrollHeight; 
      viewGame.classList.add('distorted-page');
      
    },
    async onSuccess() {
      await browserUI.niceReload();
      await ghost.playHit();

      const viewGame = document.getElementById('view-game');
      viewGame.classList.remove('distorted-page');
      
      ghost.setState('flee');
      const addressBar = document.getElementById('game-address-bar');
      ghost.moveTo(addressBar, 'left-inside');
      await delay(300);

      browserUI.glitchUrl();
      ghost.setState('idle');
    },
  },

  // ─────────────────────────────────────────────
  // Level 4: ⌘+L — Focus Address Bar
  // ─────────────────────────────────────────────
  {
    shortcutId: 'address_bar',
    challenge: "It's blocking the URL. Focus the address bar.",
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, infected: true, favicon: 'ghost' },
      ]);
      const viewGame = document.getElementById('view-game');
      viewGame.classList.remove('distorted-page');

      browserUI.glitchUrl();

      const addressBar = document.getElementById('game-address-bar');
      ghost.moveTo(addressBar, 'left-inside');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      await browserUI.focusUrl();
      await ghost.playHit();

      ghost.setState('flee');
      // Jump to the empty space right of the tab where the "+" button would be
      const gameTabStrip = document.getElementById('game-tab-strip');
      const tabs = gameTabStrip.querySelectorAll('.tab');
      const ghostDOM = document.getElementById('ghost');
      if (tabs.length > 0 && ghostDOM) {
        const lastTab = tabs[tabs.length - 1];
        // We move to the right of the last tab
        const rect = lastTab.getBoundingClientRect();
        const parentRect = ghostDOM.parentElement.getBoundingClientRect();
        
        ghostDOM.style.transition = 'top 0.3s ease, left 0.3s ease';
        ghostDOM.style.left = (rect.right - parentRect.left + 20) + 'px';
        ghostDOM.style.top = (rect.top - parentRect.top + 5) + 'px';
      } else {
        ghost.moveToPosition(50, 800);
      }
      await delay(300);

      ghost.setState('idle');
    },
  },

  // ─────────────────────────────────────────────
  // Level 5: ⌘+T — New Tab
  // ─────────────────────────────────────────────
  {
    shortcutId: 'new_tab',
    challenge: "It's trying to escape! Open a new tab to follow it.",
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, infected: true, favicon: 'ghost' },
      ]);
      const viewGame = document.getElementById('view-game');
      viewGame.classList.remove('distorted-page');
      browserUI.resetUrl();

      // Ensure ghost is positioned at the new tab area
      const gameTabStrip = document.getElementById('game-tab-strip');
      const tabs = gameTabStrip.querySelectorAll('.tab');
      const ghostDOM = document.getElementById('ghost');
      if (tabs.length > 0 && ghostDOM) {
        const lastTab = tabs[tabs.length - 1];
        const rect = lastTab.getBoundingClientRect();
        const parentRect = ghostDOM.parentElement.getBoundingClientRect();
        ghostDOM.style.transition = 'none';
        ghostDOM.style.left = (rect.right - parentRect.left + 20) + 'px';
        ghostDOM.style.top = (rect.top - parentRect.top + 5) + 'px';
      }

      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      // Add the new tab
      const newTab = browserUI.addTab('New Tab', true);
      browserUI.setUrl('https://ghost.browser/new-tab');
      
      const viewGame = document.getElementById('view-game');
      viewGame.innerHTML = '<div style="background: #202124; width: 100%; height: 100%;"></div>';
      
      await ghost.playHit();

      ghost.setState('flee');
      ghost.moveTo(newTab, 'on');
      await delay(300);
      ghost.setState('idle');
    },
  },

  // ─────────────────────────────────────────────
  // Level 6: ⌘+W — Close Tab
  // ─────────────────────────────────────────────
  {
    shortcutId: 'close_tab',
    challenge: "It's trapped on the tab! Close the tab to terminate.",
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, infected: true, favicon: 'ghost' },
        { label: 'New Tab', active: true, favicon: '📄' }
      ]);
      const viewGame = document.getElementById('view-game');
      viewGame.classList.remove('distorted-page');
      viewGame.scrollTop = 0;
      browserUI.setUrl('https://ghost.browser/new-tab');
      
      viewGame.innerHTML = getGhostgleHTML();

      const tab = browserUI.getTab(1); // The new tab
      if (tab) {
        ghost.moveTo(tab, 'on');
      }
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      import('../game.js').then(game => game.stopMouseTracking()); // Dynamically import to avoid circular dependency issues if any
      await browserUI.removeTab(1); // Close the new tab
      
      // Restore the old tab UI
      const viewGame = document.getElementById('view-game');
      viewGame.innerHTML = getSystemEventLogHTML('ghost-hidden-word', true);
      viewGame.scrollTop = viewGame.scrollHeight;
      browserUI.setUrl('https://ghost.browser');
      
      ghost.setState('captured');
      import('../game.js').then(game => game.logToConsole(null, 'GHOST CAPTURED! PURGING FROM MEMORY...', 'info'));

      // Break the text and make it fall down, but ONLY the visible text in the 3rd section
      const startPages = viewGame.querySelectorAll('.start-page');
      const lastStartPage = startPages[startPages.length - 1];
      triggerTextShatter(lastStartPage);

      await delay(1500); // Wait for the poof animation and text fall to finish
      ghost.setState('hidden');

      // Slowly transition to the captured page by fading out the current view
      viewGame.style.transition = 'opacity 2s ease-in-out';
      viewGame.style.opacity = '0';
      
      await delay(2000); // Wait for the fade out to finish
      
      // Reset opacity for future play-throughs just in case
      viewGame.style.opacity = '1';
      viewGame.style.transition = '';
    },
  },
];

/**
 * Retry-phase config.
 * Uses the same shortcut data but with shorter challenge text and no specific setup.
 * The game engine handles retry setup generically.
 */
export const ACT1_RETRY_CHALLENGES = {
  scroll_down: 'It fled below!',
  find: "It's invisible!",
  reload: 'Page corrupted!',
  address_bar: "It's in the URL!",
  bookmark: 'Bookmark it!',
  close_tab: 'Kill it!',
};

// Utility
// End of ACT1 Levels
