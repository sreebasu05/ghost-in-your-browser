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

const START_CONTENT_HTML = `
  <div class="start-page" style="height:100%; min-height:100%;">
    <div class="start-header">
      <div class="live-monitor-badge">LIVE MONITOR</div>
      <h1 class="start-title"><span class="cmd-prompt">$</span> ghost in your browser</h1>
      <p class="start-tagline">Rogue process detected. Click it to terminate.</p>
    </div>
    <div class="diagnostic-logs">
      <p class="diag-line">> Scanning memory allocation...</p>
      <p class="diag-line diagnostic-highlight">> 1 ghost detected in rendering pipeline</p>
      <p class="diag-line">> Status: <span class="status-haunting">HAUNTING</span></p>
      <p class="diag-line">> Action required: Manual exorcism</p>
      <p class="diag-line diag-prompt">> <span class="cursor-blink">_</span></p>
    </div>
  </div>
`;

const CORRUPTED_CONTENT_HTML = `
  <div class="start-page" style="height:100%; min-height:100%;">
    <div class="start-header">
      <div class="live-monitor-badge" style="color:var(--color-error);text-shadow:0 0 10px rgba(248,113,113,0.4);">LI░E M█NIT▓R</div>
      <h1 class="start-title" style="color:var(--color-error);"><span class="cmd-prompt" style="color:var(--color-error);">$</span> gh░st in y▓ur br█wser</h1>
      <p class="start-tagline" style="color:var(--color-error);">R░g█e pr█ce▒s det▓ct█d. C░i█k to t█rmin▓te.</p>
    </div>
    <div class="diagnostic-logs" style="border-color:rgba(248,113,113,0.25);background:rgba(248,113,113,0.03);color:var(--color-error);">
      <p class="diag-line">> Sc▒nni█g mem░ry alloc█tion...</p>
      <p class="diag-line">> FA█T█L ERR░R: GH░ST_0x8B5CF6</p>
      <p class="diag-line">> Status: <span style="color:var(--color-error);font-weight:700;text-shadow:0 0 8px rgba(248,113,113,0.4);">CORRUPTED</span></p>
      <p class="diag-line">> Action required: SYS█EM RE░OAD</p>
      <p class="diag-line diag-prompt">> <span class="cursor-blink" style="color:var(--color-error);">_</span></p>
    </div>
  </div>
`;

/**
 * Level configs for Act 1.
 * Each level's onSuccess sets up the visual state for the NEXT level's premise.
 */
export const ACT1_LEVELS = [
  // ─────────────────────────────────────────────
  // Level 1: ⌘+T — Open New Tab
  // ─────────────────────────────────────────────
  {
    shortcutId: 'new_tab',
    challenge: 'The tab is corrupted. Open a new tab.',
    setup() {
      // Look exactly like landing page
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser');
      browserUI.setContent(START_CONTENT_HTML);
      
      // Ghost fades in on the tab
      ghost.setState('hidden');
      const tab = browserUI.getTab(0);
      if (tab) ghost.moveTo(tab, 'on');
      
      setTimeout(() => {
        ghost.show();
        ghost.setState('idle');
        browserUI.infectTab(0);
      }, 500);
    },
    async onSuccess() {
      // New tab slides in
      const newTab = browserUI.addTab('New Tab', true);
      browserUI.setUrl('https://ghost.browser/new-tab');
      await ghost.playHit();

      // Ghost follows to the new tab (transition to L2)
      await delay(300);
      ghost.setState('flee');
      ghost.moveTo(newTab, 'on');
      await delay(300);

      // New tab loads the landing page
      browserUI.setContent(START_CONTENT_HTML);
      browserUI.setUrl('https://ghost.browser');
      
      // Ghost jumps to content area and corrupts it
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      await delay(400);
      browserUI.setContent(CORRUPTED_CONTENT_HTML);
      browserUI.showStatic();
      ghost.setState('idle');
    },
  },

  // ─────────────────────────────────────────────
  // Level 2: ⌘+R — Reload
  // ─────────────────────────────────────────────
  {
    shortcutId: 'reload',
    challenge: 'Page corrupted. Reload.',
    setup() {
      // State from L1 success
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, infected: true, favicon: 'ghost' },
        { label: 'New Tab', active: true, favicon: '📄' },
      ]);
      browserUI.setUrl('https://ghost.browser');
      browserUI.setContent(CORRUPTED_CONTENT_HTML);
      browserUI.showStatic();

      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      ghost.setState('idle');
    },
    async onSuccess() {
      browserUI.spinReload();
      await browserUI.clearWithScanline();
      await ghost.playHit();

      // Page is fixed
      browserUI.setContent(START_CONTENT_HTML);

      // Ghost flees to address bar
      ghost.setState('flee');
      const addressBar = document.getElementById('game-address-bar');
      ghost.moveTo(addressBar, 'inside');
      await delay(300);

      // Glitch the URL
      browserUI.glitchUrl();
      ghost.setState('idle');
    },
  },

  // ─────────────────────────────────────────────
  // Level 3: ⌘+L — Focus Address Bar
  // ─────────────────────────────────────────────
  {
    shortcutId: 'address_bar',
    challenge: "It's in the URL. Focus the address bar.",
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, infected: true, favicon: 'ghost' },
        { label: 'New Tab', active: true, favicon: '📄' },
      ]);
      browserUI.setContent(START_CONTENT_HTML);
      browserUI.glitchUrl();

      const addressBar = document.getElementById('game-address-bar');
      ghost.moveTo(addressBar, 'inside');
      ghost.setState('idle');
    },
    async onSuccess() {
      // URL highlights, ghost exposed
      await browserUI.focusUrl();
      await ghost.playHit();

      // Ghost panics, jumps back to the Tab and infects it
      ghost.setState('flee');
      const tab = browserUI.getTab(1);
      if (tab) ghost.moveTo(tab, 'on');
      await delay(300);

      browserUI.infectTab(1);
      ghost.setState('idle');
    },
  },

  // ─────────────────────────────────────────────
  // Level 4: ⌘+W — Close Tab
  // ─────────────────────────────────────────────
  {
    shortcutId: 'close_tab',
    challenge: 'It infested the new tab! Close it.',
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, infected: true, favicon: 'ghost' },
        { label: 'New Tab', active: true, infected: true, favicon: '📄' },
      ]);
      browserUI.resetUrl();
      browserUI.setContent(START_CONTENT_HTML);

      const tab = browserUI.getTab(1);
      if (tab) ghost.moveTo(tab, 'on');
      ghost.setState('idle');
    },
    async onSuccess() {
      await ghost.playHit();

      // Close the infected tab
      await browserUI.removeTab(1);
      
      // We are back to tab 0
      browserUI.setContent(`
        <div style="padding:24px;min-height:850px;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <h2 style="color:var(--text-primary);margin-bottom:12px;font-family:var(--font-mono);">Original Tab</h2>
            <p style="color:var(--text-content-muted);">The ghost broke the layout...</p>
          </div>
          <div class="scroll-indicator" style="position:static;margin-top:auto;padding-bottom:80px;">↓ it went this way</div>
        </div>
      `);

      // Ghost ejected — falls below fold
      ghost.setState('flee');
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'below');
      await delay(300);
      ghost.setState('hidden');
    },
  },

  // ─────────────────────────────────────────────
  // Level 5: Space — Scroll Down
  // ─────────────────────────────────────────────
  {
    shortcutId: 'scroll_down',
    challenge: 'It fled below. Scroll down.',
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, infected: true, favicon: 'ghost' },
      ]);
      browserUI.resetUrl();
      browserUI.setContent(`
        <div style="padding:24px;min-height:850px;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <h2 style="color:var(--text-primary);margin-bottom:12px;font-family:var(--font-mono);">Original Tab</h2>
            <p style="color:var(--text-content-muted);">The ghost broke the layout...</p>
          </div>
          <div class="scroll-indicator" style="position:static;margin-top:auto;padding-bottom:80px;">↓ it went this way</div>
        </div>
      `);
      ghost.setState('hidden');
    },
    async onSuccess() {
      await browserUI.scrollContent();

      // Ghost revealed but turns invisible
      browserUI.setContent(`
        <div style="padding:24px;">
          <p style="color:var(--text-content-muted);margin-bottom:16px;">> Scanning memory allocation...</p>
          <p style="color:var(--text-content-muted);margin-bottom:4px;">> Process ghost_0x8B5CF6 detected</p>
          <p style="color:var(--text-content-muted);margin-bottom:4px;">> Attempting visual lock... FAILED</p>
          <p style="color:var(--color-error);margin-bottom:4px;">> Target went INVISIBLE</p>
          <p style="color:var(--text-content-muted);margin-bottom:16px;">> Recommend: search scan</p>
          <p style="color:var(--text-content-muted);">---</p>
          <p style="color:var(--text-content-muted);margin-top:12px;">Lorem ipsum ghost hidden dolor sit amet, GHOST consectetur adipiscing elit. Sed do eiusmod tempor ghost incididunt ut labore et dolore magna aliqua. Ut enim ad GHOST minim veniam, quis nostrud exercitation ghost ullamco laboris nisi ut aliquip.</p>
        </div>
      `);

      // Brief flash of ghost then invisible
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      ghost.show();
      await delay(400);
      ghost.setState('hidden');
    },
  },

  // ─────────────────────────────────────────────
  // Level 6: ⌘+F — Find on Page
  // ─────────────────────────────────────────────
  {
    shortcutId: 'find',
    challenge: "It's invisible. Find it.",
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, infected: true, favicon: 'ghost' },
      ]);
      browserUI.resetUrl();
      browserUI.hideFindBar();
      browserUI.setContent(`
        <div style="padding:24px;">
          <p style="color:var(--text-content-muted);margin-bottom:16px;">> Scanning memory allocation...</p>
          <p style="color:var(--text-content-muted);margin-bottom:4px;">> Process ghost_0x8B5CF6 detected</p>
          <p style="color:var(--text-content-muted);margin-bottom:4px;">> Attempting visual lock... FAILED</p>
          <p style="color:var(--color-error);margin-bottom:4px;">> Target went INVISIBLE</p>
          <p style="color:var(--text-content-muted);margin-bottom:16px;">> Recommend: search scan</p>
          <p style="color:var(--text-content-muted);">---</p>
          <p style="color:var(--text-content-muted);margin-top:12px;">Lorem ipsum ghost hidden dolor sit amet, <span class="ghost-hidden-word">GHOST</span> consectetur adipiscing elit. Sed do eiusmod tempor ghost incididunt ut labore et dolore magna aliqua. Ut enim ad <span class="ghost-hidden-word">GHOST</span> minim veniam, quis nostrud exercitation ghost ullamco laboris nisi ut aliquip.</p>
        </div>
      `);
      ghost.setState('hidden');
    },
    async onSuccess() {
      // Find bar opens, ghost highlighted
      browserUI.showFindBar('GHOST');

      // Highlight the hidden words
      const hiddenWords = document.querySelectorAll('.ghost-hidden-word');
      hiddenWords.forEach(el => {
        el.style.background = 'rgba(251, 191, 36, 0.3)';
        el.style.color = 'var(--color-hint)';
        el.style.padding = '2px 4px';
        el.style.borderRadius = '3px';
      });

      // Ghost revealed and caught
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      ghost.show();
      await delay(500);
    },
  },
];

/**
 * Retry-phase config.
 * Uses the same shortcut data but with shorter challenge text and no specific setup.
 * The game engine handles retry setup generically.
 */
export const ACT1_RETRY_CHALLENGES = {
  new_tab: 'Tab corrupted again!',
  reload: 'Page corrupted!',
  address_bar: "It's in the URL!",
  close_tab: 'It infested a tab!',
  scroll_down: 'It fled below!',
  find: "It's invisible!",
};

// Utility
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
