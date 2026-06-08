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
        <div id="scroll-container" style="padding:40px; height: 1200px; position: relative;">
          <div id="ghost-target-top" style="position: absolute; top: 50px; left: 50%; transform: translateX(-50%); width: 100px; height: 50px; text-align: center; color: var(--text-primary); font-size: 18px; font-weight: bold;">
            Haunting the header!
          </div>
          <p style="color:var(--text-secondary); margin-top: 800px;">It's down here.</p>
        </div>
      `);
      
      const content = document.getElementById('view-game');
      content.scrollTop = 800; // scroll down
      const target = document.getElementById('ghost-target-top');
      if (target) {
        ghost.moveTo(target, 'on');
      } else {
        ghost.moveTo(content, 'on');
      }
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
          <p style="color:var(--text-secondary);">1. Trace found <span id="trace-1" style="background:rgba(255,255,0,0.5);color:white;padding:2px 4px;border-radius:2px;">here</span></p>
          <p style="color:var(--text-secondary);margin-top:200px;">2. Trace found <span id="trace-2" style="background:rgba(255,255,0,0.5);color:white;padding:2px 4px;border-radius:2px;">here</span></p>
        </div>
      `);
      const trace1 = document.getElementById('trace-1');
      if (trace1) ghost.moveTo(trace1, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      const trace2 = document.getElementById('trace-2');
      if (trace2) ghost.moveTo(trace2, 'on');
      await ghost.playHit();
      ghost.setState('panic');
      await delay(300);
    }
  },
  {
    shortcutId: 'hard_reload',
    challenge: 'Hiding in cached files. Force a deep reload!',
    setup() {
      const btnReload = document.getElementById('btn-reload');
      if (btnReload) {
        ghost.moveTo(btnReload, 'on');
      } else {
        const content = document.getElementById('view-game');
        ghost.moveTo(content, 'on');
      }
      ghost.show();
      ghost.setState('idle');
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
      const content = document.getElementById('view-game');
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '12px';
        ghostEl.style.height = '12px';
      }
      ghost.moveTo(content, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(1.2)';
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '36px';
        ghostEl.style.height = '36px';
      }
      await ghost.playHit();
      ghost.setState('panic');
      await delay(300);
    }
  },
  {
    shortcutId: 'zoom_out',
    challenge: 'It grew enormous. Zoom out!',
    setup() {
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(1.2)';
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '90px';
        ghostEl.style.height = '90px';
      }
      ghost.moveTo(content, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(0.8)';
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '36px';
        ghostEl.style.height = '36px';
      }
      await ghost.playHit();
      ghost.setState('idle');
      await delay(300);
    }
  },
  {
    shortcutId: 'zoom_reset',
    challenge: 'Snap viewport to normal to trap it!',
    setup() {
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(0.8)';
        ghost.moveTo(content, 'on');
      }
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(1)';
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '36px';
        ghostEl.style.height = '36px';
      }
      await delay(300);
      if (content) {
        content.style.transition = '';
        content.style.transform = '';
      }
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
          <div id="spinner-container" class="spinner"></div>
        </div>
      `);
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
      const spinner = document.getElementById('spinner-container');
      if (spinner) {
        ghost.moveTo(spinner, 'on');
      } else {
        const content = document.getElementById('view-game');
        ghost.moveTo(content, 'on');
      }
      ghost.show();
      ghost.setState('idle');
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
      const star = document.getElementById('bookmark-icon');
      if (star) {
        ghost.moveTo(star, 'on');
      } else {
        const content = document.getElementById('view-game');
        ghost.moveTo(content, 'on');
      }
      ghost.show();
      ghost.setState('idle');
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
      const content = document.getElementById('view-game');
      if (content) {
        ghost.moveTo(content, 'on');
      }
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      // Flash white
      const browserEl = document.getElementById('game-browser');
      browserEl.classList.add('flash-white');
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
