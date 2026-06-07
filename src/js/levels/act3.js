/**
 * act3.js — Navigation & Windows
 */
import * as browserUI from '../browser-ui.js';
import * as ghost from '../ghost.js';

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

export const ACT3_LEVELS = [
  {
    shortcutId: 'back',
    challenge: 'It retreated to the previous page. Follow it back!',
    setup() {
      // Seed the history buffer to trap native back/forward
      window.history.pushState({ step: 'past' }, '', '#past');
      window.history.pushState({ step: 'present' }, '', '#present');

      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser/level3/past');
      browserUI.setContent(`
        <div style="padding:40px;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">History: 2 Minutes Ago</h2>
          <p style="color:var(--text-secondary);">You're in the past...</p>
        </div>
      `);
      
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      // Simulate going back
      browserUI.setContent(`
        <div style="padding:40px;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">History: 4 Minutes Ago</h2>
        </div>
      `);
      browserUI.setUrl('https://ghost.browser/level3/older');
      await ghost.playHit();
      
      ghost.setState('flee');
      await delay(300);
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'forward',
    challenge: 'It is trying to escape forward. Leap ahead to intercept!',
    setup() {
      // Handled by previous onSuccess
    },
    async onSuccess() {
      // Simulate going forward
      browserUI.setContent(`
        <div style="padding:40px;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">Present Day</h2>
        </div>
      `);
      browserUI.setUrl('https://ghost.browser/level3/present');
      await ghost.playHit();
      
      ghost.setState('panic');
      await delay(300);
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'new_window',
    challenge: 'It escaped your browser. Deploy a second window to surround it!',
    setup() {
      // Handled by previous onSuccess
    },
    async onSuccess() {
      await ghost.playHit();
      
      // Slide window transition
      const browserEl = document.getElementById('game-browser');
      browserEl.classList.add('slide-window-out');
      await delay(500);
      
      // Reset position and slide in as new window
      browserEl.classList.remove('slide-window-out');
      browserEl.classList.add('slide-window-in');
      browserUI.setTabs([
        { label: 'New Tab', active: true, favicon: '📄' },
      ]);
      browserUI.setUrl('');
      browserUI.setContent(`
        <div style="padding:40px;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">Window 2</h2>
        </div>
      `);
      
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      
      await delay(500);
      browserEl.classList.remove('slide-window-in');
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'incognito',
    challenge: 'It slipped into stealth mode. Boot your incognito window!',
    setup() {
      // Handled by previous onSuccess
    },
    async onSuccess() {
      await ghost.playHit();
      
      const browserEl = document.getElementById('game-browser');
      browserEl.classList.add('slide-window-out');
      await delay(500);
      
      // Enter incognito
      browserEl.classList.remove('slide-window-out');
      browserEl.classList.add('slide-window-in');
      browserEl.classList.add('incognito-mode');
      
      // Toggle icons
      document.querySelector('.normal-profile').classList.add('hidden');
      document.querySelector('.incognito-profile').classList.remove('hidden');
      
      browserUI.setTabs([
        { label: 'Incognito Tab', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('');
      browserUI.setContent(`
        <div style="padding:40px;text-align:center;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">You've gone incognito</h2>
          <p style="color:var(--text-muted);">The ghost is trapped.</p>
        </div>
      `);
      
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      
      await delay(500);
      browserEl.classList.remove('slide-window-in');
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'close_window',
    challenge: 'Cut off its escape route. Collapse the secondary window!',
    setup() {
      // Handled by previous onSuccess
    },
    async onSuccess() {
      await ghost.playHit();
      
      const browserEl = document.getElementById('game-browser');
      browserEl.classList.add('slide-window-out');
      await delay(500);
      
      // Exit incognito, back to window 1
      browserEl.classList.remove('slide-window-out', 'incognito-mode');
      document.querySelector('.normal-profile').classList.remove('hidden');
      document.querySelector('.incognito-profile').classList.add('hidden');
      
      browserEl.classList.add('slide-window-in');
      
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser/cornered');
      browserUI.setContent(`
        <div style="padding:40px;text-align:center;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">Cornered!</h2>
        </div>
      `);
      
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      
      await delay(500);
      browserEl.classList.remove('slide-window-in');
      ghost.setState('panic');
      await delay(500);
      ghost.setState('hidden');
    }
  }
];

export const ACT3_RETRY_CHALLENGES = {
  back: 'Go back!',
  forward: 'Leap ahead!',
  new_window: 'New window!',
  incognito: 'Go stealth!',
  close_window: 'Close the window!',
};
