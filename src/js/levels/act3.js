/**
 * act3.js — Navigation & Windows
 */
import * as browserUI from '../browser-ui.js';
import * as ghost from '../ghost.js';

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const getSelectOperationContent = () => {
  const selectPage = document.getElementById('start-page-2');
  if (selectPage) {
    return `
      <div class="start-page" style="height: 100%; min-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        ${selectPage.innerHTML}
      </div>
    `;
  }
  return '';
};

const getGibberishContent = (isIncognito = false) => {
  const bg = isIncognito ? '#09090b' : '#18181c';
  const color = isIncognito ? '#4c1d95' : '#6a3482';
  const glow = isIncognito ? 'rgba(124, 58, 237, 0.4)' : 'rgba(179, 49, 241, 0.5)';
  const textColor = isIncognito ? '#8b5cf6' : '#a78bfa';
  
  if (isIncognito) {
    return `
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; overflow: hidden; user-select: none; position: relative;">
        <!-- Ring of Huge Numbers surrounding the ghost in incognito -->
        <div class="incognito-container" style="position: relative; display: flex; align-items: center; justify-content: center; width: 450px; height: 450px; z-index: 2;">
          <div class="huge-numbers-ring" style="position: absolute; inset: 0; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 84px; color: rgba(179, 49, 241, 0.15); display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); text-align: center; align-items: center;">
            <div>8</div> <div>3</div> <div>0</div>
            <div>5</div> <div style="font-size: 20px; color: transparent;">GHOST</div>  <div>9</div>
            <div>2</div> <div>7</div> <div>1</div>
          </div>
          <!-- Glowing containment circle in the center -->
          <div style="width: 120px; height: 120px; border-radius: 50%; border: 3px dashed rgba(179, 49, 241, 0.4); box-shadow: 0 0 30px rgba(179, 49, 241, 0.15); display: flex; align-items: center; justify-content: center;">
            <span style="font-family: monospace; font-size: 10px; color: rgba(179, 49, 241, 0.5); letter-spacing: 1px;">CONTAINED</span>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; color: ${color}; font-family: monospace; padding: 40px; overflow: hidden; user-select: none; position: relative;">
      <div style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center;">
        <h2 class="distorted-page" style="font-size: 32px; margin-bottom: 20px; color: #B331F1; text-shadow: 0 0 10px ${glow};">01000111 01001000 01001111 01010011 01010100</h2>
        <p style="color: ${textColor}; font-size: 14px; text-align: center; max-width: 500px; line-height: 1.6;">
          ERR_CORRUPT_HISTORY: Memory pointer out of bounds. The previous session is glitched. Exorcise the rendering pipeline.
        </p>
      </div>
    </div>
  `;
};

export const ACT3_LEVELS = [
  {
    shortcutId: 'back',
    challenge: 'It retreated to the previous page. Follow it back!',
    async setup() {
      // Seed the history buffer
      window.history.pushState({ step: 'past' }, '', '#past');
      window.history.pushState({ step: 'present' }, '', '#present');

      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser/level3/select-operation');
      browserUI.setContent(getSelectOperationContent());
      
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.classList.remove('incognito-shiver');
      }
      ghost.show();
      ghost.setState('idle');
      
      // Wait a bit for initial frame before starting animation
      await delay(500);

      const swipeBack = document.getElementById('swipe-back-indicator');
      if (swipeBack && ghostEl) {
        swipeBack.classList.add('show');
        
        // 1. Move onto the left swipe indicator arrow slowly
        ghostEl.style.transition = 'left 2.5s ease-in-out, top 2.5s ease-in-out';
        ghost.moveTo(swipeBack, 'on');
        
        await new Promise(resolve => {
          const handler = (e) => {
            if (e.propertyName === 'left') {
              ghostEl.removeEventListener('transitionend', handler);
              resolve();
            }
          };
          ghostEl.addEventListener('transitionend', handler);
        });

        // 2. Continue slowly off-screen left
        ghostEl.style.transition = 'left 2.5s ease-in-out, top 2.5s ease-in-out';
        ghostEl.style.left = '-150px';
        
        await new Promise(resolve => {
          const handler = (e) => {
            if (e.propertyName === 'left') {
              ghostEl.removeEventListener('transitionend', handler);
              resolve();
            }
          };
          ghostEl.addEventListener('transitionend', handler);
        });
      }
    },
    async onSuccess() {
      const swipeBack = document.getElementById('swipe-back-indicator');
      if (swipeBack) swipeBack.classList.remove('show');
      
      // Corrupt gibberish page (history glitch)
      browserUI.setUrl('https://ghost.browser/level3/past');
      browserUI.setContent(getGibberishContent(false));
      
      // Fly ghost back in from left to center
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.transition = 'none';
        ghostEl.style.left = '-150px';
        void ghostEl.offsetWidth; // Reflow
        ghostEl.style.transition = 'left 1s cubic-bezier(0.25, 1, 0.5, 1), top 1s cubic-bezier(0.25, 1, 0.5, 1)';
        
        const viewport = document.getElementById('game-content-viewport');
        ghost.moveTo(viewport, 'on');
      }
      
      await ghost.playHit();
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'forward',
    challenge: 'It is trying to escape forward. Leap ahead to intercept!',
    async setup() {
      browserUI.setUrl('https://ghost.browser/level3/past');
      browserUI.setContent(getGibberishContent(false));
      
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.classList.remove('incognito-shiver');
      }
      ghost.show();
      ghost.setState('idle');
      
      const viewport = document.getElementById('game-content-viewport');
      ghost.moveTo(viewport, 'on');
      
      await delay(1000);

      const swipeForward = document.getElementById('swipe-forward-indicator');
      if (swipeForward && ghostEl) {
        swipeForward.classList.add('show');
        
        // 1. Move onto the right swipe indicator arrow slowly
        ghostEl.style.transition = 'left 2.5s ease-in-out, top 2.5s ease-in-out';
        ghost.moveTo(swipeForward, 'on');
        
        await new Promise(resolve => {
          const handler = (e) => {
            if (e.propertyName === 'left') {
              ghostEl.removeEventListener('transitionend', handler);
              resolve();
            }
          };
          ghostEl.addEventListener('transitionend', handler);
        });

        // 2. Continue slowly off-screen right
        ghostEl.style.transition = 'left 2.5s ease-in-out, top 2.5s ease-in-out';
        ghostEl.style.left = 'calc(100% + 150px)';
        
        await new Promise(resolve => {
          const handler = (e) => {
            if (e.propertyName === 'left') {
              ghostEl.removeEventListener('transitionend', handler);
              resolve();
            }
          };
          ghostEl.addEventListener('transitionend', handler);
        });
      }
    },
    async onSuccess() {
      const swipeForward = document.getElementById('swipe-forward-indicator');
      if (swipeForward) swipeForward.classList.remove('show');
      
      // Transitions back to Ghostgle
      browserUI.setUrl('https://ghost.browser/level3/ghostgle');
      browserUI.setContent(`
        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #202124; color: #e8eaed; font-family: arial, sans-serif;">
          <div style="font-size: 80px; font-weight: bold; letter-spacing: -2px; margin-bottom: 24px; text-shadow: 0 0 20px rgba(179, 49, 241, 0.4);">
            <span class="gg-g">G</span><span class="gg-h">h</span><span class="gg-o">o</span><span class="gg-s">s</span><span class="gg-t">t</span><span class="gg-g2">g</span><span class="gg-l">l</span><span class="gg-e">e</span>
          </div>
        </div>
      `);
      
      // Fly ghost back in from the right to center
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.transition = 'none';
        ghostEl.style.left = 'calc(100% + 150px)';
        void ghostEl.offsetWidth; // Reflow
        ghostEl.style.transition = 'left 1s cubic-bezier(0.25, 1, 0.5, 1), top 1s cubic-bezier(0.25, 1, 0.5, 1)';
        
        const viewport = document.getElementById('game-content-viewport');
        ghost.moveTo(viewport, 'on');
      }
      
      await ghost.playHit();
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'new_window',
    challenge: 'It escaped your browser. Deploy a second window to surround it!',
    async setup() {
      const titlebar = document.querySelector('.browser-titlebar');
      if (titlebar) {
        ghost.moveTo(titlebar, 'on');
      } else {
        const content = document.getElementById('view-game');
        ghost.moveTo(content, 'on');
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.classList.remove('incognito-shiver');
      }
      ghost.show();
      ghost.setState('idle');
      
      await delay(1000);
      
      if (ghostEl) {
        // Break out of window diagonally to top-right with fading
        ghostEl.style.transition = 'left 1.2s cubic-bezier(0.25, 1, 0.5, 1), top 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease-out, filter 1.2s ease-out';
        ghostEl.style.left = 'calc(100% + 150px)';
        ghostEl.style.top = '-150px';
        ghostEl.style.opacity = '0';
        ghostEl.style.filter = 'blur(10px) brightness(3)';
        
        await new Promise(resolve => {
          const handler = (e) => {
            if (e.propertyName === 'left') {
              ghostEl.removeEventListener('transitionend', handler);
              resolve();
            }
          };
          ghostEl.addEventListener('transitionend', handler);
        });
      }
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
      browserUI.setUrl('https://ghost.browser/level3/past');
      browserUI.setContent(getGibberishContent(false));
      
      // Wait for slide-in animation to finish completely before calculations
      await delay(550);
      browserEl.classList.remove('slide-window-in');
      void browserEl.offsetWidth; // Force reflow
      ghost.setState('idle');
      
      // Position at center of new window and slowly hop off to the active tab
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.transition = 'none';
        ghostEl.style.left = '-150px';
        ghostEl.style.top = '-150px';
        ghostEl.style.opacity = '0';
        ghostEl.style.filter = 'blur(10px) brightness(3)';
        void ghostEl.offsetWidth; // Reflow
        
        const viewport = document.getElementById('game-content-viewport');
        ghost.moveTo(viewport, 'on');
        
        ghostEl.style.transition = 'opacity 0.8s ease-in, filter 0.8s ease-in';
        ghostEl.style.opacity = '1';
        ghostEl.style.filter = 'none';
        
        // Slowly hop off to the active tab after 1.5 seconds
        setTimeout(() => {
          ghost.setState('flee');
          const tab = browserUI.getTab(0);
          if (tab) {
            ghost.moveTo(tab, 'on');
          }
          ghost.setState('idle');
        }, 1500);
      }
    }
  },
  {
    shortcutId: 'incognito',
    challenge: 'It slipped into stealth mode. Boot your incognito window!',
    async setup() {
      const profile = document.getElementById('browser-profile');
      if (profile) {
        ghost.moveTo(profile, 'on');
      } else {
        const content = document.getElementById('view-game');
        ghost.moveTo(content, 'on');
      }
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.classList.remove('incognito-shiver');
      }
      ghost.show();
      ghost.setState('idle');
      
      await delay(1000);
      
      if (ghostEl) {
        // Go stealth / fade out AND fly diagonally to top-right off-screen (same as new_window)
        ghostEl.style.transition = 'left 1.2s cubic-bezier(0.25, 1, 0.5, 1), top 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease-out, filter 1.2s ease-out';
        ghostEl.style.left = 'calc(100% + 150px)';
        ghostEl.style.top = '-150px';
        ghostEl.style.opacity = '0';
        ghostEl.style.filter = 'blur(10px) brightness(3)';
        
        await new Promise(resolve => {
          const handler = (e) => {
            if (e.propertyName === 'left') {
              ghostEl.removeEventListener('transitionend', handler);
              resolve();
            }
          };
          ghostEl.addEventListener('transitionend', handler);
        });
      }
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
      browserUI.setUrl('https://ghost.browser/level3/past');
      browserUI.setContent(getGibberishContent(true));
      
      // Wait for slide-in animation to finish completely before coordinate calculations
      await delay(550);
      browserEl.classList.remove('slide-window-in');
      void browserEl.offsetWidth; // Force reflow
      ghost.setState('idle');
      
      // Materialize back in center surrounded by huge numbers, trapped & shivering
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.transition = 'none';
        ghostEl.style.opacity = '0';
        ghostEl.style.filter = 'blur(10px) brightness(3)';
        
        // Target the absolute centered incognito-container directly for 100% centering accuracy
        const container = document.querySelector('.incognito-container');
        if (container) {
          ghost.moveTo(container, 'on');
        } else {
          const viewport = document.getElementById('game-content-viewport');
          ghost.moveTo(viewport, 'on');
        }
        
        void ghostEl.offsetWidth; // Reflow
        ghostEl.style.transition = 'opacity 0.8s ease-in, filter 0.8s ease-in';
        ghostEl.style.opacity = '1';
        ghostEl.style.filter = 'none';
        
        // Apply shivering animation
        ghostEl.classList.add('incognito-shiver');
      }
    }
  },
  {
    shortcutId: 'close_window',
    challenge: 'Cut off its escape route. Collapse the secondary window!',
    setup() {
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.transition = 'none';
        // Keep the ghost trapped and shivering in the center of the incognito container
        const container = document.querySelector('.incognito-container');
        if (container) {
          ghost.moveTo(container, 'on');
        } else {
          const viewport = document.getElementById('game-content-viewport');
          ghost.moveTo(viewport, 'on');
        }
        
        ghost.show();
        ghostEl.classList.add('incognito-shiver');
      }
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
      browserUI.setUrl('https://ghost.browser/level3/past');
      browserUI.setContent(getGibberishContent(false));
      
      // Ghost dies in incognito window - hide the ghost completely so it does not appear in the restored window
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.transition = 'none';
        ghostEl.style.opacity = '0';
        ghostEl.classList.remove('incognito-shiver');
        ghost.setState('hidden');
      }
      
      await delay(550);
      browserEl.classList.remove('slide-window-in');
      
      // Make text fall down
      import('../game.js').then(game => game.logToConsole(null, 'GHOST PURGED FROM MEMORY...', 'info'));

      const viewGame = document.getElementById('view-game');
      const textNodes = viewGame.querySelectorAll('h2, p, span, div');
      
      textNodes.forEach((node) => {
        if (node.children.length === 0 && node.textContent.trim().length > 0) {
          const delayTime = Math.random() * 0.4;
          const rotate = (Math.random() - 0.5) * 60;
          setTimeout(() => {
            node.style.transition = `transform 1.2s cubic-bezier(0.55, 0.085, 0.68, 0.53) ${delayTime}s, opacity 1.2s ease ${delayTime}s`;
            node.style.transform = `translateY(500vh) rotate(${rotate}deg)`;
            node.style.opacity = '0';
          }, 50);
        }
      });

      await delay(1500);
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
