/**
 * act2.js — Tab Warfare
 */
import * as browserUI from '../browser-ui.js';
import * as ghost from '../ghost.js';
import { wrapSelectPageHTML, getGhostgleHTML } from '../templates.js';
import { delay, triggerTextShatter, fadeViewOut } from '../utils.js';

export const ACT2_LEVELS = [
  {
    shortcutId: 'next_tab',
    challenge: 'It spawned a clone and jumped right. Follow it.',
    setup() {
      // Start with only 1 tab
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('chrome://newtab/');
      browserUI.setContent(wrapSelectPageHTML());
      
      const ghostEl = document.getElementById('ghost');

      if (!window.__isActTransition) {
        ghost.show();
        ghost.setState('idle');

        // Slowly open 1 new tab (Ghostgle)
        (async () => {
          await delay(1000);
          browserUI.addTab('Ghostgle', false);
          await delay(1000);

          const tab = browserUI.getTab(1);
          if (tab && ghostEl) {
            ghostEl.style.transition = 'left 1.5s ease-in-out, top 1.5s ease-in-out';
            ghost.moveTo(tab, 'on');
          }
          browserUI.infectTab(1);
        })();
      } else {
        // During initial Act transition: open the tab but let startDisruption move the ghost
        (async () => {
          await delay(1000);
          browserUI.addTab('Ghostgle', false);
          browserUI.infectTab(1);
        })();
      }
    },
    async onSuccess() {
      // User is now on Ghostgle
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: true, infected: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser/new-tab');
      browserUI.setContent(getGhostgleHTML());
      await ghost.playHit();
      
      // Ghost escapes from Ghostgle back to Ghost in Your Browser
      ghost.setState('flee');
      const tab = browserUI.getTab(0);
      if (tab) ghost.moveTo(tab, 'on');
      await delay(300);
      browserUI.infectTab(0);
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'prev_tab',
    challenge: 'It doubled back to the first tab. Jump left!',
    setup() {
      // User is on Ghostgle, Ghost is on Ghost in Your Browser
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, infected: true, favicon: 'ghost' },
        { label: 'Ghostgle', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser/new-tab');
      browserUI.setContent(getGhostgleHTML());
      
      const tab = browserUI.getTab(0);
      if (tab) ghost.moveTo(tab, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      // User jumps left to Ghost in Your Browser.
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
      ]);
      browserUI.setUrl('chrome://newtab/');
      browserUI.setContent(wrapSelectPageHTML());
      await ghost.playHit();
      
      ghost.setState('panic');
      await delay(1000); // wait 1 second
      
      // The original first tab goes down! (closes)
      await browserUI.removeTab(0);
      ghost.setState('hidden');
    }
  },
  {
    shortcutId: 'reopen_tab',
    challenge: 'It deleted your Ghost in Your Browser tab! Restore it from the void.',
    setup() {
      // After removing Tab 0, the active tab is Ghostgle (now at index 0)
      browserUI.setTabs([
        { label: 'Ghostgle', active: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser/new-tab');
      browserUI.setContent(getGhostgleHTML());
      
      ghost.setState('hidden');
    },
    async onSuccess() {
      // Tab is restored
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
      ]);
      browserUI.setUrl('chrome://newtab/');
      browserUI.setContent(wrapSelectPageHTML());
      
      // Ghost reappears on the restored tab
      const tab0 = browserUI.getTab(0);
      if (tab0) ghost.moveTo(tab0, 'on');
      ghost.show();
      await ghost.playHit();
      
      ghost.setState('flee');
      await delay(200);
      
      // Opens 10 new tabs
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, infected: true, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
      ]);
      
      // Jumps to tab 5 (index 4)
      const tab5 = browserUI.getTab(4);
      if (tab5) ghost.moveTo(tab5, 'on');
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'jump_tab',
    challenge: 'It spawned decoys and hid on Tab 5. Jump straight to it!',
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, infected: true, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
      ]);
      
      const tab5 = browserUI.getTab(4);
      if (tab5) ghost.moveTo(tab5, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      // User successfully jumped to the correct tab. Let's find out which tab they jumped to:
      const infectedTab = document.querySelector('.tab.infected');
      const expectedIndex = infectedTab ? parseInt(infectedTab.dataset.index) : 4;

      const tabObjects = [];
      for (let i = 0; i < 10; i++) {
        tabObjects.push({
          label: i === 0 ? 'Ghost in Your Browser' : 'Ghostgle',
          active: i === expectedIndex,
          infected: i === 9, // Ghost flees to the 10th tab (index 9)
          favicon: 'ghost'
        });
      }
      browserUI.setTabs(tabObjects);
      browserUI.setUrl('https://ghost.browser/new-tab');
      browserUI.setContent(getGhostgleHTML());
      await ghost.playHit();
      
      ghost.setState('flee');
      const lastTab = browserUI.getTab(9);
      if (lastTab) ghost.moveTo(lastTab, 'on');
      await delay(300);
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'last_tab',
    challenge: 'It fled to the very last tab. Snap to the edge to pin it!',
    setup() {
      const tabObjects = [];
      for (let i = 0; i < 10; i++) {
        tabObjects.push({
          label: i === 0 ? 'Ghost in Your Browser' : 'Ghostgle',
          active: i === 4, // Make tab 5 active as starting position
          infected: i === 9,
          favicon: 'ghost'
        });
      }
      browserUI.setTabs(tabObjects);
      browserUI.setUrl('https://ghost.browser/new-tab');
      browserUI.setContent(getGhostgleHTML());
      
      const lastTab = browserUI.getTab(9);
      if (lastTab) ghost.moveTo(lastTab, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      const tabObjects = [];
      for (let i = 0; i < 10; i++) {
        tabObjects.push({
          label: i === 0 ? 'Ghost in Your Browser' : 'Ghostgle',
          active: i === 9,
          infected: i === 9,
          favicon: 'ghost'
        });
      }
      browserUI.setTabs(tabObjects);
      browserUI.setUrl('https://ghost.browser/new-tab');
      browserUI.setContent(getGhostgleHTML());
      // Flash white
      const browserEl = document.getElementById('game-browser');
      browserEl.classList.add('flash-white');
      browserEl.style.boxShadow = 'inset 0 0 0 9999px white';
      
      ghost.setState('captured');
      import('../game.js').then(game => game.logToConsole(null, 'GHOST CAPTURED! PURGING FROM MEMORY...', 'info'));

      const viewGame = document.getElementById('view-game');
      triggerTextShatter(viewGame);

      await delay(1500);
      browserEl.style.boxShadow = '';
      ghost.setState('hidden');

      // Slowly transition to the captured page by fading out the current view
      await fadeViewOut(viewGame, 2000);
    }
  }
];

export const ACT2_RETRY_CHALLENGES = {
  next_tab: 'Jump right!',
  prev_tab: 'Jump left!',
  reopen_tab: 'Restore the tab!',
  jump_tab: 'Jump straight to 5!',
  last_tab: 'Snap to the last tab!',
};
