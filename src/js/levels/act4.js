import * as browserUI from '../browser-ui.js';
import * as ghost from '../ghost.js';
import { getSystemEventLogHTML } from '../templates.js';
import { delay, triggerTextShatter, fadeViewOut } from '../utils.js';

export const ACT4_LEVELS = [
  {
    shortcutId: 'scroll_up',
    challenge: 'The ghost doubled back upward! Scroll up to intercept.',
    setup() {
      browserUI.setTabs([{ label: 'Ghost in Your Browser', active: true, favicon: 'ghost' }]);
      browserUI.setUrl('https://ghost.browser');
      browserUI.setContent(getSystemEventLogHTML('trace', true));
      
      const content = document.getElementById('view-game');
      content.scrollTop = content.scrollHeight; // Scroll down to the Select Operation page
      
      ghost.setState('hidden');
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = '9'; // Send behind toolbar/titlebar
      }
    },
    async onSuccess() {
      await browserUI.scrollUpContent();
      
      const target = document.getElementById('trace-2');
      const content = document.getElementById('view-game');
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = ''; // Restore default z-index so it sits on top of toolbar/tabs
      }
      if (target && ghostDOM) {
        const rect = target.getBoundingClientRect();
        const parentRect = ghostDOM.parentElement.getBoundingClientRect();
        ghostDOM.style.transition = 'none';
        ghostDOM.style.left = (rect.left - parentRect.left - 20) + 'px';
        ghostDOM.style.top = (rect.top - parentRect.top - 40) + 'px';
        void ghostDOM.offsetWidth;
      }
      ghost.show();
      ghost.setState('hit');
      await delay(500);
      ghost.setState('hidden');
    }
  },
  {
    shortcutId: 'find_next',
    challenge: 'Found one trace, but it left more. Jump to the next match.',
    setup() {
      browserUI.setUrl('https://ghost.browser');
      browserUI.showFindBar('GHOST');
      
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = '';
      }
      
      browserUI.setContent(getSystemEventLogHTML('trace', false));
      
      const trace2 = document.getElementById('trace-2');
      if (trace2) {
        ghost.moveTo(trace2, 'on');
      }
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      const trace1 = document.getElementById('trace-1');
      const trace2 = document.getElementById('trace-2');
      if (trace1) {
        trace1.style.background = 'rgba(255,255,0,0.5)';
      }
      if (trace2) {
        trace2.style.background = 'var(--ghost-color)';
        ghost.moveTo(trace2, 'on');
      }
      await ghost.playHit();
      
      browserUI.hideFindBar();
      if (trace1) {
        trace1.style.background = '';
      }
      if (trace2) {
        trace2.style.background = '';
      }
      
      ghost.setState('panic');
      await delay(300);
    }
  },
  {
    shortcutId: 'hard_reload',
    challenge: 'Hiding in cached files. Force a deep reload!',
    setup() {
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = '';
      }
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
    shortcutId: 'stop_load',
    challenge: 'Infinite loading loop. Hit emergency stop!',
    setup() {
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = '';
      }
      browserUI.setContent(`
        <div style="display:flex; justify-content:center; align-items:center; height:100%; width:100%;">
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
            border-top-color: var(--ghost-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
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
        <div style="position:relative; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; width:100%; font-family:var(--font-mono); color: var(--text-primary); overflow: hidden; background: radial-gradient(circle at center, rgba(179, 49, 241, 0.04) 0%, rgba(10, 10, 10, 0.9) 100%);">
          <!-- Background Map Overlay -->
          <div style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0.15; pointer-events:none; z-index:0; display:flex; justify-content:center; align-items:center;">
            <svg width="100%" height="100%" viewBox="0 0 800 600" style="filter: drop-shadow(0 0 10px rgba(179, 49, 241, 0.5));">
              <!-- Network links -->
              <line x1="200" y1="150" x2="350" y2="250" stroke="var(--ghost-color)" stroke-width="2" stroke-dasharray="5,5" />
              <line x1="350" y1="250" x2="600" y2="180" stroke="var(--ghost-color)" stroke-width="2" stroke-dasharray="5,5" />
              <line x1="350" y1="250" x2="500" y2="450" stroke="var(--ghost-color)" stroke-width="2" stroke-dasharray="5,5" />
              <line x1="200" y1="150" x2="150" y2="350" stroke="var(--ghost-color)" stroke-dasharray="3,3" />
              <line x1="150" y1="350" x2="300" y2="480" stroke="var(--ghost-color)" stroke-dasharray="3,3" />
              <line x1="300" y1="480" x2="500" y2="450" stroke="var(--ghost-color)" stroke-dasharray="3,3" />
              <!-- Map nodes -->
              <circle cx="200" cy="150" r="10" fill="none" stroke="var(--ghost-color)" stroke-width="2" />
              <circle cx="200" cy="150" r="4" fill="var(--ghost-color)" />
              <text x="190" y="130" fill="var(--text-content-muted)" font-size="10" font-family="var(--font-mono)">ACT 1: BASICS</text>
              
              <circle cx="600" cy="180" r="10" fill="none" stroke="var(--ghost-color)" stroke-width="2" />
              <circle cx="600" cy="180" r="4" fill="var(--ghost-color)" />
              <text x="590" y="160" fill="var(--text-content-muted)" font-size="10" font-family="var(--font-mono)">ACT 2: TABWAR</text>
              
              <circle cx="150" cy="350" r="10" fill="none" stroke="var(--ghost-color)" stroke-width="2" />
              <circle cx="150" cy="350" r="4" fill="var(--ghost-color)" />
              <text x="140" y="330" fill="var(--text-content-muted)" font-size="10" font-family="var(--font-mono)">ACT 3: NAVWIN</text>
              
              <circle cx="500" cy="450" r="10" fill="none" stroke="var(--ghost-color)" stroke-width="2" />
              <circle cx="500" cy="450" r="4" fill="var(--ghost-color)" />
              <text x="490" y="430" fill="var(--text-content-muted)" font-size="10" font-family="var(--font-mono)">ACT 4: MASTERY</text>
              
              <!-- Containment Target Center -->
              <circle cx="350" cy="250" r="24" fill="none" stroke="var(--color-error)" stroke-width="2" stroke-dasharray="4,4" />
              <circle cx="350" cy="250" r="14" fill="none" stroke="var(--ghost-color)" stroke-width="1.5" />
              <circle cx="350" cy="250" r="5" fill="var(--color-error)" />
              <text x="365" y="235" fill="var(--ghost-color)" font-size="11" font-weight="bold" font-family="var(--font-mono)">ENTITY_ROOT</text>
            </svg>
          </div>
          
          <!-- Diagnostics Content Panel -->
          <div style="z-index:1; display:flex; flex-direction:column; align-items:center; max-width:480px; width:90%; padding:20px; border-radius:10px; background:rgba(20, 20, 20, 0.85); border:1px solid rgba(179, 49, 241, 0.25); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px);">
            <h1 class="distorted-page" style="color:var(--color-error); font-size:36px; font-weight:bold; letter-spacing:8px; text-shadow:0 0 15px rgba(248,113,113,0.7); margin:0; animation: text-glitch 0.15s infinite alternate;">
              CANCELLED
            </h1>
            <p style="color:var(--text-content-muted); font-size:10px; margin-top:8px; letter-spacing:2px; text-transform:uppercase;">
              Exorcism protocol initiated. Monitoring root node...
            </p>
            
            <!-- Root diagnostic panel -->
            <div style="width:100%; margin-top:20px; border-top:1px solid rgba(179,49,241,0.2); padding-top:16px; display:grid; grid-template-columns: 1fr; gap:12px; font-size:11px; text-align:left;">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed rgba(255,255,255,0.05); padding-bottom:8px;">
                <span style="color:var(--text-secondary);">TARGET ENTITY:</span>
                <span style="color:var(--ghost-color); font-weight:bold;">0x8B5CF6 (GHOST_DAEMON)</span>
              </div>
              
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed rgba(255,255,255,0.05); padding-bottom:8px;">
                <span style="color:var(--text-secondary);">CONTAINMENT LOC:</span>
                <span id="spooky-location" style="color:var(--ghost-color); font-weight: bold; letter-spacing: 2.5px; font-family: var(--font-mono); text-shadow: 0 0 8px var(--ghost-color-glow);">
                  Loading...
                </span>
              </div>
              
              <div style="margin-top:8px;">
                <span style="color:var(--text-secondary); display:block; margin-bottom:8px; font-weight:bold;">ENTITY TRACKING LOGS (SECTORS VISITED):</span>
                <div style="display:flex; flex-direction:column; gap:6px; background:rgba(0,0,0,0.4); padding:10px; border-radius:6px; font-size:10px; color:var(--text-content-muted); border:1px solid rgba(255,255,255,0.02);">
                  <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-success);">✓ SECTOR_1_BASICS:</span><span>VISITED [PURGED]</span></div>
                  <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-success);">✓ SECTOR_2_TABWAR:</span><span>VISITED [CONTAINED]</span></div>
                  <div style="display:flex; justify-content:space-between;"><span style="color:var(--color-success);">✓ SECTOR_3_NAVWIN:</span><span>VISITED [ISOLATED]</span></div>
                  <div style="display:flex; justify-content:space-between;"><span style="color:var(--ghost-color); font-weight:bold;">☠ SECTOR_4_ZOOM:</span><span style="color:var(--ghost-color);">ACTIVE INTERCEPT</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `);
      
      // Start jumbling location animation
      if (window.spookyLocationInterval) {
        clearInterval(window.spookyLocationInterval);
      }
      const chars = "☠☣☢⚡⚙⚛0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ?$#@!";
      const targetText = "SECTOR_9_CONTAINMENT";
      window.spookyLocationInterval = setInterval(() => {
        const el = document.getElementById('spooky-location');
        if (el) {
          el.textContent = Array.from(targetText).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
        }
      }, 80);

      await ghost.playHit();
      ghost.setState('idle');
      await delay(300);
    }
  },
  {
    shortcutId: 'zoom_in',
    challenge: 'It shrunk to microscopic size. Zoom in!',
    setup() {
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = '';
      }
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(0.15)'; // extremely tiny zoom scale
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '6px';
        ghostEl.style.height = '6px';
      }
      ghost.moveTo(content, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(1.5)'; // scaled back up larger
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '54px';
        ghostEl.style.height = '54px';
      }
      await ghost.playHit();
      ghost.setState('panic');
      await delay(200); // split second pause

      // Instantly zoom out a lot (to scale(4) with a huge ghost) to transition to zoom_out level
      if (content) {
        content.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        content.style.transform = 'scale(4)';
      }
      if (ghostEl) {
        ghostEl.style.transition = 'width 0.5s ease, height 0.5s ease';
        ghostEl.style.width = '144px';
        ghostEl.style.height = '144px';
      }
      await delay(500);
    }
  },
  {
    shortcutId: 'zoom_out',
    challenge: 'It grew enormous. Zoom out!',
    setup() {
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = '';
      }
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(4)'; // extremely huge zoom scale
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '144px';
        ghostEl.style.height = '144px';
      }
      ghost.moveTo(content, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(0.3)'; // scaled back down smaller
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '12px';
        ghostEl.style.height = '12px';
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
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = '';
      }
      const content = document.getElementById('view-game');
      if (content) {
        content.style.transition = 'transform 0.3s ease';
        content.style.transform = 'scale(0.3)';
        ghost.moveTo(content, 'on');
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.width = '36px';
        ghostEl.style.height = '36px';
      }
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      // Clear jumble animation and set final clean location
      if (window.spookyLocationInterval) {
        clearInterval(window.spookyLocationInterval);
        window.spookyLocationInterval = null;
      }
      const locEl = document.getElementById('spooky-location');
      if (locEl) {
        locEl.textContent = "SECTOR_9_CONTAINMENT";
        locEl.style.color = "var(--color-success)";
        locEl.style.textShadow = "0 0 12px rgba(74, 222, 128, 0.6)";
      }

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
    shortcutId: 'bookmark',
    challenge: 'Bookmark the page to save its location!',
    setup() {
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = '';
      }
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
      const ghostDOM = document.getElementById('ghost');
      if (ghostDOM) {
        ghostDOM.style.zIndex = '';
      }
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
      
      ghost.setState('captured');
      import('../game.js').then(game => game.logToConsole(null, 'GHOST CAPTURED! PURGING FROM MEMORY...', 'info'));

      const viewGame = document.getElementById('view-game');
      const textNodes = viewGame.querySelectorAll('p, h1, span, div, kbd');
      textNodes.forEach((node) => {
        const delayVal = Math.random() * 0.4;
        const rotate = (Math.random() - 0.5) * 60;
        setTimeout(() => {
          node.style.transition = `transform 1.2s cubic-bezier(0.55, 0.085, 0.68, 0.53) ${delayVal}s, opacity 1.2s ease ${delayVal}s`;
          node.style.transform = `translateY(500vh) rotate(${rotate}deg)`;
          node.style.opacity = '0';
        }, 50);
      });

      await delay(1500);
      browserEl.style.boxShadow = '';
      ghost.setState('hidden');

      // Slowly transition to the captured page by fading out the current view
      viewGame.style.transition = 'opacity 2s ease-in-out';
      viewGame.style.opacity = '0';
      
      await delay(2000);
      
      viewGame.style.opacity = '1';
      viewGame.style.transition = '';
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
