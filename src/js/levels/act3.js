/**
 * act3.js — Navigation & Windows
 */
import * as browserUI from '../browser-ui.js';
import * as ghost from '../ghost.js';
import { wrapSelectPageHTML, getGibberishHTML, getNewTabHTML, getIncognitoPageHTML, getGhostgleHTML } from '../templates.js';
import { delay, triggerTextShatter } from '../utils.js';

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
      browserUI.setContent(wrapSelectPageHTML());
      
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.classList.remove('incognito-shiver');
      }
      if (!window.__isActTransition) {
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
          
          await delay(2500);

          // 2. Continue slowly off-screen left
          ghostEl.style.transition = 'left 2.5s ease-in-out, top 2.5s ease-in-out';
          ghostEl.style.left = '-150px';
          
          await delay(2500);
        }
      }
    },
    async onSuccess() {
      const swipeBack = document.getElementById('swipe-back-indicator');
      if (swipeBack) swipeBack.classList.remove('show');
      
      // Corrupt gibberish page (history glitch)
      browserUI.setUrl('https://ghost.browser/level3/past');
      browserUI.setContent(getGibberishHTML(false));
      
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
      browserUI.setContent(getGibberishHTML(false));
      
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
        
        await delay(2500);

        // 2. Continue slowly off-screen right
        ghostEl.style.transition = 'left 2.5s ease-in-out, top 2.5s ease-in-out';
        ghostEl.style.left = 'calc(100% + 150px)';
        
        await delay(2500);
      }
    },
    async onSuccess() {
      const swipeForward = document.getElementById('swipe-forward-indicator');
      if (swipeForward) swipeForward.classList.remove('show');

      // Re-initialize ghost position outside screen
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.transition = 'none';
        ghostEl.style.left = 'calc(100% + 150px)';
        ghostEl.style.top = '-150px';
        ghostEl.style.opacity = '0';
        ghostEl.style.filter = 'blur(10px) brightness(3)';
        void ghostEl.offsetWidth; // Reflow
      }
      
      // Removed the slide-window-out/slide-window-in animation here!
      
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser/level3/select-operation');
      browserUI.setContent(wrapSelectPageHTML());
      
      await delay(300);
      
      // Materialize ghost in center
      if (ghostEl) {
        const viewport = document.getElementById('game-content-viewport');
        ghost.moveTo(viewport, 'on');
        
        void ghostEl.offsetWidth;
        ghostEl.style.transition = 'opacity 0.8s ease-in, filter 0.8s ease-in';
        ghostEl.style.opacity = '1';
        ghostEl.style.filter = 'none';
      }
      
      ghost.show();
      ghost.setState('hit');
      await delay(500);
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
        void ghostEl.offsetWidth; // Force layout calculation
        ghostEl.style.left = 'calc(100% + 150px)';
        ghostEl.style.top = '-150px';
        ghostEl.style.opacity = '0';
        ghostEl.style.filter = 'blur(10px) brightness(3)';
        
        await delay(1200);
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
        { label: 'Ghostgle', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghostgle.com');
      browserUI.setContent(getGhostgleHTML());
      
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
    challenge: 'The ghost is fleeing into an incognito window to wipe its trace. Follow it in private mode!',
    async setup() {
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.classList.remove('incognito-shiver');
      }
      ghost.show();
      ghost.setState('idle');
      
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      
      // Wait a moment, then fade the ghost out to simulate entering stealth mode
      await delay(1000);
      if (ghostEl) {
        ghostEl.style.transition = 'opacity 1.0s ease-out, filter 1.0s ease-out';
        ghostEl.style.opacity = '0';
        ghostEl.style.filter = 'blur(12px) opacity(0)';
        await delay(1000);
        ghost.setState('hidden');
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
      browserEl.classList.add('incognito-mode', 'browser-shiver-intense');
      
      // Toggle icons
      document.querySelector('.normal-profile').classList.add('hidden');
      document.querySelector('.incognito-profile').classList.remove('hidden');
      
      browserUI.setTabs([
        { label: 'Incognito Tab', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('chrome://incognito/');
      browserUI.setContent(getIncognitoPageHTML());
      
      // Wait for slide-in animation to finish completely before coordinate calculations
      await delay(550);
      browserEl.classList.remove('slide-window-in');
      void browserEl.offsetWidth; // Force reflow
      ghost.setState('panic');
      
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
        ghostEl.classList.add('ghost-shiver-intense');
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
        ghostEl.classList.remove('incognito-shiver');
        ghostEl.classList.add('ghost-shiver-intense');
      }
    },
    async onSuccess() {
      await ghost.playHit();
      
      const browserEl = document.getElementById('game-browser');
      browserEl.classList.add('slide-window-out');
      await delay(500);
      
      // Exit incognito, back to window 1
      browserEl.classList.remove('slide-window-out', 'incognito-mode', 'browser-shiver-intense');
      document.querySelector('.normal-profile').classList.remove('hidden');
      document.querySelector('.incognito-profile').classList.add('hidden');
      
      browserEl.classList.add('slide-window-in');
      
      browserUI.setTabs([
        { label: 'Ghostgle', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghostgle.com');
      browserUI.setContent(getGhostgleHTML());
      
      // Ghost dies in incognito window - hide the ghost completely so it does not appear in the restored window
      const ghostEl = document.getElementById('ghost');
      if (ghostEl) {
        ghostEl.style.transition = 'none';
        ghostEl.style.opacity = '0';
        ghostEl.classList.remove('ghost-shiver-intense', 'incognito-shiver');
        ghost.setState('hidden');
      }
      
      await delay(550);
      browserEl.classList.remove('slide-window-in');
      
      // Make text fall down
      import('../game.js').then(game => game.logToConsole(null, 'GHOST PURGED FROM MEMORY...', 'info'));

      const viewGame = document.getElementById('view-game');
      triggerTextShatter(viewGame);

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
