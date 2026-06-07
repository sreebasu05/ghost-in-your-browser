/**
 * act4.js — Page Mastery
 */
import * as browserUI from '../browser-ui.js';
import * as ghost from '../ghost.js';

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

export const ACT4_LEVELS = [
  {
    shortcutId: 'scroll_up',
    challenge: 'The ghost doubled back upward! Scroll up to intercept.',
    setup() {
      browserUI.setTabs([{ label: 'Ghost in Your Browser', active: true, favicon: 'ghost' }]);
      browserUI.setUrl('https://ghost.browser/scroll');
      browserUI.setContent(`
        <div style="padding:40px; height: 1200px;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">Scroll Down...</h2>
          <p style="color:var(--text-secondary); margin-top: 800px;">It's down here.</p>
        </div>
      `);
      
      const content = document.getElementById('view-game');
      // Simulate being scrolled down
      content.scrollTop = 800;
      ghost.moveTo(content, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      const content = document.getElementById('view-game');
      content.scrollTop = 0; // scroll up
      await ghost.playHit();
      ghost.setState('flee');
      await delay(300);
    }
  },
  {
    shortcutId: 'find_next',
    challenge: 'Found one trace, but it left more. Jump to the next match.',
    setup() {
      browserUI.setContent(`
        <div style="padding:40px;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">Search Results</h2>
          <p style="color:var(--text-secondary);">1. Trace found <span style="background:rgba(255,255,0,0.5);color:white;padding:2px 4px;border-radius:2px;">here</span></p>
          <p style="color:var(--text-secondary);margin-top:200px;">2. Trace found <span style="background:rgba(255,255,0,0.5);color:white;padding:2px 4px;border-radius:2px;">here</span></p>
        </div>
      `);
      ghost.setState('idle');
    },
    async onSuccess() {
      await ghost.playHit();
      ghost.setState('panic');
      await delay(300);
    }
  },
  {
    shortcutId: 'hard_reload',
    challenge: 'Hiding in cached files. Force a deep reload!',
    setup() {
      // Handled
    },
    async onSuccess() {
      // Screen wipe
      const browserEl = document.getElementById('game-browser');
      browserEl.style.filter = 'invert(1) hue-rotate(180deg)';
      await ghost.playHit();
      await delay(200);
      browserEl.style.filter = '';
      ghost.setState('flee');
      await delay(300);
    }
  },
  {
    shortcutId: 'zoom_in',
    challenge: 'It shrunk to microscopic size. Zoom in!',
    setup() {
      const browserEl = document.getElementById('game-browser');
      browserEl.style.transition = 'transform 0.3s ease';
      browserEl.style.transform = 'scale(0.8)';
    },
    async onSuccess() {
      const browserEl = document.getElementById('game-browser');
      browserEl.style.transform = 'scale(1.2)';
      await ghost.playHit();
      ghost.setState('panic');
      await delay(300);
    }
  },
  {
    shortcutId: 'zoom_out',
    challenge: 'It grew enormous. Zoom out!',
    setup() {
      // Handled
    },
    async onSuccess() {
      const browserEl = document.getElementById('game-browser');
      browserEl.style.transform = 'scale(0.5)';
      await ghost.playHit();
      ghost.setState('idle');
      await delay(300);
    }
  },
  {
    shortcutId: 'zoom_reset',
    challenge: 'Snap viewport to normal to trap it!',
    setup() {
      // Handled
    },
    async onSuccess() {
      const browserEl = document.getElementById('game-browser');
      browserEl.style.transform = 'scale(1)';
      await delay(300);
      browserEl.style.transition = ''; // remove transition
      await ghost.playHit();
      ghost.setState('panic');
      await delay(300);
    }
  },
  {
    shortcutId: 'stop_load',
    challenge: 'Infinite loading loop. Hit emergency stop!',
    setup() {
      browserUI.setContent(`
        <div style="padding:40px;text-align:center;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">Loading...</h2>
          <div class="spinner"></div>
        </div>
      `);
      // Add a simple spinner CSS
      if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.innerHTML = `
          .spinner {
            width: 50px; height: 50px;
            border: 5px solid rgba(255,255,255,0.1);
            border-top-color: #00ffcc;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
      }
    },
    async onSuccess() {
      const style = document.getElementById('spinner-style');
      if (style) style.remove();
      
      browserUI.setContent(`
        <div style="padding:40px;text-align:center;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">Stopped.</h2>
        </div>
      `);
      await ghost.playHit();
      ghost.setState('idle');
      await delay(300);
    }
  },
  {
    shortcutId: 'bookmark',
    challenge: 'Bookmark the page to save its location!',
    setup() {
      // Handled
    },
    async onSuccess() {
      await ghost.playHit();
      ghost.setState('flee');
      await delay(300);
    }
  },
  {
    shortcutId: 'print',
    challenge: 'Print the page to capture a hard copy!',
    setup() {
      // Handled
    },
    async onSuccess() {
      // Flash white
      const browserEl = document.getElementById('game-browser');
      browserEl.classList.add('flash-white');
      
      // We need to define flash-white in css or manually
      browserEl.style.boxShadow = 'inset 0 0 0 9999px white';
      
      await ghost.playHit();
      await delay(200);
      browserEl.style.boxShadow = '';
      
      ghost.setState('panic');
      await delay(500);
      ghost.setState('hidden'); // Captured!
    }
  }
];

export const ACT4_RETRY_CHALLENGES = {
  scroll_up: 'Scroll up!',
  find_next: 'Find next!',
  hard_reload: 'Hard reload!',
  zoom_in: 'Zoom in!',
  zoom_out: 'Zoom out!',
  zoom_reset: 'Reset zoom!',
  stop_load: 'Stop loading!',
  bookmark: 'Bookmark it!',
  print: 'Print it!',
};
