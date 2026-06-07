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
    challenge: 'Your tab is locked. Open a new one.',
    setup() {
      browserUI.setTabs([
        { label: 'Locked Tab', active: true, favicon: '🔒' },
      ]);
      browserUI.setUrl('https://ghost.browser/locked');
      browserUI.setContent('<div style="display:flex;align-items:center;justify-content:center;height:100%;opacity:0.3;"><p style="font-size:18px;color:var(--color-error);">SYSTEM LOCKED</p></div>');
      browserUI.lockContent();

      // Ghost sits on the active tab
      const tab = browserUI.getTab(0);
      if (tab) ghost.moveTo(tab, 'on');
      ghost.setState('idle');
    },
    async onSuccess() {
      // New tab slides in
      const newTab = browserUI.addTab('New Tab', true);
      browserUI.unlockContent();
      browserUI.setContent('');
      browserUI.setUrl('https://ghost.browser/new-tab');
      await ghost.playHit();

      // Ghost follows to the new tab (transition to L2)
      await delay(300);
      ghost.setState('flee');
      ghost.moveTo(newTab, 'on');
      await delay(300);

      // Infect the new tab
      browserUI.infectTab(1);
      ghost.setState('idle');
    },
  },

  // ─────────────────────────────────────────────
  // Level 2: ⌘+W — Close Tab
  // ─────────────────────────────────────────────
  {
    shortcutId: 'close_tab',
    challenge: 'It followed you. Close this tab.',
    setup() {
      // State from L1 success: 2 tabs, ghost on Tab 2 (active, infected), Tab 1 clean
      browserUI.setTabs([
        { label: 'Locked Tab', active: false, favicon: '📄' },
        { label: 'New Tab', active: true, infected: true, favicon: '👻' },
      ]);
      browserUI.setUrl('https://ghost.browser/infected');

      const tab = browserUI.getTab(1);
      if (tab) ghost.moveTo(tab, 'on');
      ghost.setState('idle');
    },
    async onSuccess() {
      await ghost.playHit();

      // Close the infected tab
      await browserUI.removeTab(1);
      browserUI.setUrl('https://ghost.browser');
      browserUI.setContent('');

      // Ghost ejected — lands in URL bar
      await delay(200);
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
        { label: 'Locked Tab', active: true, favicon: '📄' },
      ]);
      browserUI.glitchUrl();
      browserUI.setContent('');

      const addressBar = document.getElementById('game-address-bar');
      ghost.moveTo(addressBar, 'inside');
      ghost.setState('idle');
    },
    async onSuccess() {
      // URL highlights, ghost exposed
      await browserUI.focusUrl();
      await ghost.playHit();

      // Ghost panics, jumps to content area, corrupts page
      ghost.setState('flee');
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      await delay(300);

      browserUI.showStatic();
      ghost.setState('idle');
    },
  },

  // ─────────────────────────────────────────────
  // Level 4: ⌘+R — Reload
  // ─────────────────────────────────────────────
  {
    shortcutId: 'reload',
    challenge: 'Page corrupted. Reload.',
    setup() {
      browserUI.setTabs([
        { label: 'Locked Tab', active: true, favicon: '📄' },
      ]);
      browserUI.resetUrl();
      browserUI.setContent(`
        <div class="start-content" style="padding:40px;opacity:0.75;user-select:none;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:580px;gap:16px;">
          <div class="live-monitor-badge" style="color:var(--color-error);text-shadow:0 0 10px rgba(248,113,113,0.4);">LI░E M█NIT▓R</div>
          <h1 class="start-title" style="color:var(--color-error);font-family:var(--font-mono);font-size:34px;font-weight:700;display:flex;align-items:center;gap:10px;"><span class="cmd-prompt" style="color:var(--color-error);">$</span> gh░st in y▓ur br█wser</h1>
          <p class="start-tagline" style="color:var(--color-error);font-size:13px;font-family:var(--font-mono);text-align:center;line-height:1.6;margin-bottom:8px;">R░g█e pr█ce▒s det▓ct█d. C░i█k to t█rmin▓te.</p>
          <div class="diagnostic-logs" style="border-color:rgba(248,113,113,0.25);background:rgba(248,113,113,0.03);color:var(--color-error);font-family:var(--font-mono);font-size:11px;padding:16px 24px;width:100%;max-width:440px;display:flex;flex-direction:column;gap:8px;align-items:flex-start;margin-bottom:12px;">
            <p class="diag-line">> Sc▒nni█g mem░ry alloc█tion...</p>
            <p class="diag-line">> FA█T█L ERR░R: GH░ST_0x8B5CF6</p>
            <p class="diag-line">> Status: <span style="color:var(--color-error);font-weight:700;text-shadow:0 0 8px rgba(248,113,113,0.4);">CORRUPTED</span></p>
            <p class="diag-line">> Action required: SYS█EM RE░OAD</p>
          </div>
        </div>
      `);
      browserUI.showStatic();

      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      ghost.setState('idle');
    },
    async onSuccess() {
      browserUI.spinReload();
      await browserUI.clearWithScanline();
      await ghost.playHit();

      // Ghost fled below the fold
      browserUI.setContent(`
        <div style="padding:24px;min-height:850px;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <p style="color:var(--text-content-muted);margin-bottom:12px;">System log cleared.</p>
            <p style="color:var(--text-content-muted);">Page reloaded successfully.</p>
          </div>
          <div class="scroll-indicator" style="position:static;margin-top:auto;padding-bottom:80px;">↓ it went this way</div>
        </div>
      `);

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
    challenge: 'It went below. Scroll down.',
    setup() {
      browserUI.setTabs([
        { label: 'Locked Tab', active: true, favicon: '📄' },
      ]);
      browserUI.resetUrl();
      browserUI.setContent(`
        <div style="padding:24px;min-height:850px;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <p style="color:var(--text-content-muted);margin-bottom:12px;">System log cleared.</p>
            <p style="color:var(--text-content-muted);">Page reloaded successfully.</p>
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
        { label: 'Locked Tab', active: true, favicon: '📄' },
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
  new_tab: 'Tab locked again!',
  close_tab: 'It infested a tab!',
  address_bar: "It's in the URL!",
  reload: 'Page corrupted!',
  scroll_down: 'It fled below!',
  find: "It's invisible!",
};

// Utility
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
