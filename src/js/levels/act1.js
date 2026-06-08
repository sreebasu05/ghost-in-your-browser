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

const getStartContent = () => {
  const startContent = document.querySelector('#view-start .start-content').innerHTML;
  return `
    <div style="display: flex; flex-direction: column; width: 100%; height: 300%;">
      <style>
        #view-game .start-page { flex: 0 0 33.333% !important; height: 33.333% !important; min-height: 33.333% !important; }
      </style>
      ${startContent}
      <div class="start-page" style="justify-content: flex-start; padding-top: 60px;">
      <div style="padding:24px; max-width: 700px; text-align: left; width: 100%;">
        <p style="color:var(--text-content-muted);margin-bottom:16px;">> System Event Log...</p>
        <p style="color:var(--text-content-muted);margin-bottom:4px;">> Process 0x8B5CF6 attempted to evade detection</p>
        <p style="color:var(--text-content-muted);margin-bottom:4px;">> Attempting visual lock... FAILED</p>
        <p style="color:var(--color-error);margin-bottom:4px;">> Target went INVISIBLE</p>
        <p style="color:var(--text-content-muted);margin-bottom:16px;">> Recommend: search scan to locate hidden entities</p>
        <p style="color:var(--text-content-muted);">---</p>
        <p style="color:var(--text-content-muted);margin-top:12px; line-height: 1.6;">
          The system kernel identified anomalies in the sector cache. Data fragments scattered across the memory pool suggest a hidden presence. 
          While executing routine garbage collection, the daemon process encountered an unhandled exception triggered by a malicious <span class="ghost-hidden-word">GHOST</span> entity.
          This entity operates by intercepting DOM painting cycles and rewriting the display buffer before frames are rendered.
          Administrators are advised to initiate a manual search protocol to isolate the rogue <span class="ghost-hidden-word">GHOST</span> thread.
          Failure to do so will result in cascading visual artifacts and potential corruption of the active viewport.
        </p>
      </div>
    </div>
  </div>
  `;
};

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
      browserUI.setContent(getStartContent());
      
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
      
      viewGame.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #202124; color: #e8eaed; font-family: arial, sans-serif;">
          <div style="font-size: 80px; font-weight: bold; letter-spacing: -2px; margin-bottom: 24px; text-shadow: 0 0 20px rgba(179, 49, 241, 0.4);">
            <span class="gg-g">G</span><span class="gg-h">h</span><span class="gg-o">o</span><span class="gg-s">s</span><span class="gg-t">t</span><span class="gg-g2">g</span><span class="gg-l">l</span><span class="gg-e">e</span>
          </div>
          <div style="display: flex; align-items: center; background: #303134; border: 1px solid #5f6368; border-radius: 24px; padding: 10px 20px; width: 100%; max-width: 584px; margin-bottom: 24px;">
            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #9aa0a6; width: 20px; height: 20px; margin-right: 12px;"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
            <input type="text" style="background: transparent; border: none; outline: none; color: #e8eaed; width: 100%; font-size: 16px;" value="how to exorcise a browser window" readonly>
            <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-left: 8px;">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--ghost-color)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C7.03 2 3 6.03 3 11v11a1 1 0 0 0 1.7.7l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3 2.3 2.3a1 1 0 0 0 1.7-.7V11c0-4.97-4.03-9-9-9z"></path></svg>
            </div>
          </div>
          <div style="display: flex; gap: 12px;">
            <button style="background: #303134; border: 1px solid #303134; border-radius: 4px; color: #e8eaed; font-family: arial, sans-serif; font-size: 14px; padding: 10px 16px; cursor: default;">Ghost Search</button>
            <button style="background: #303134; border: 1px solid #303134; border-radius: 4px; color: #e8eaed; font-family: arial, sans-serif; font-size: 14px; padding: 10px 16px; cursor: default;">I'm Feeling Spooky</button>
          </div>
        </div>
      `;

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
      viewGame.innerHTML = getStartContent();
      viewGame.scrollTop = viewGame.scrollHeight;
      browserUI.setUrl('https://ghost.browser');
      
      ghost.setState('captured');
      import('../game.js').then(game => game.logToConsole(null, 'GHOST CAPTURED! PURGING FROM MEMORY...', 'info'));

      // Break the text and make it fall down, but ONLY the visible text in the 3rd section
      const startPages = viewGame.querySelectorAll('.start-page');
      const lastStartPage = startPages[startPages.length - 1];
      const textNodes = lastStartPage.querySelectorAll('p, h1, span, kbd');
      
      textNodes.forEach((node) => {
        // Calculate a random direction and delay for each word/paragraph
        const delay = Math.random() * 0.4; // 0 to 0.4s delay
        const rotate = (Math.random() - 0.5) * 60; // -30 to 30 deg rotation
        
        // Use a slight timeout to ensure styles apply before transition
        setTimeout(() => {
          node.style.transition = `transform 1.2s cubic-bezier(0.55, 0.085, 0.68, 0.53) ${delay}s, opacity 1.2s ease ${delay}s`;
          node.style.transform = `translateY(500vh) rotate(${rotate}deg)`;
          node.style.opacity = '0';
        }, 50);
      });

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
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
