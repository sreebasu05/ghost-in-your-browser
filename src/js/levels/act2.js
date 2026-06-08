/**
 * act2.js — Tab Warfare
 */
import * as browserUI from '../browser-ui.js';
import * as ghost from '../ghost.js';

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const getPart2PageContent = () => {
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
      browserUI.setContent(getPart2PageContent());
      
      const ghostEl = document.getElementById('ghost');
      ghost.show();
      ghost.setState('screensaver');

      // Slowly open 1 new tab (Ghostgle)
      (async () => {
        await delay(1000);
        browserUI.addTab('Ghostgle', false);
        await delay(1000);

        if (ghostEl) {
            // Get the current position of the screensaver ghost
            const rect = ghostEl.getBoundingClientRect();
            const parentRect = ghostEl.parentElement.getBoundingClientRect();
            
            // Temporarily set the position inline to freeze it where it is
            ghostEl.style.transition = 'none';
            ghostEl.style.left = (rect.left - parentRect.left) + 'px';
            ghostEl.style.top = (rect.top - parentRect.top) + 'px';
            ghostEl.style.transform = 'none';
            
            // Remove screensaver class
            ghostEl.classList.remove('ghost--screensaver');
            
            // Force reflow
            void ghostEl.offsetWidth;
            
            // Restore transitions
            ghostEl.style.transition = '';
        }
        const tab = browserUI.getTab(1);
        if (tab) {
          ghost.moveTo(tab, 'on');
        }
        browserUI.infectTab(1);
        ghost.setState('idle');
      })();
    },
    async onSuccess() {
      // User is now on Ghostgle
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, favicon: 'ghost' },
        { label: 'Ghostgle', active: true, infected: true, favicon: 'ghost' },
      ]);
      browserUI.setUrl('https://ghost.browser/new-tab');
      browserUI.setContent(`
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
      `);
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
      browserUI.setContent(`
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
      `);
      
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
      browserUI.setContent(getPart2PageContent());
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
      browserUI.setContent(`
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
      `);
      
      ghost.setState('hidden');
    },
    async onSuccess() {
      // Tab is restored
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
        { label: 'Ghostgle', active: false, favicon: 'ghost' },
      ]);
      browserUI.setUrl('chrome://newtab/');
      browserUI.setContent(getPart2PageContent());
      
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
      browserUI.setContent(`
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
      `);
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
      browserUI.setContent(`
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
      `);
      
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
      browserUI.setContent(`
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
      `);
      await ghost.playHit();
      
      ghost.setState('flee');
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      await delay(300);
      ghost.setState('hidden');
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
