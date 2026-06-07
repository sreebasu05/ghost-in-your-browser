/**
 * act2.js — Tab Warfare
 */
import * as browserUI from '../browser-ui.js';
import * as ghost from '../ghost.js';

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

export const ACT2_LEVELS = [
  {
    shortcutId: 'next_tab',
    challenge: 'It spawned clones and jumped right. Follow it.',
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
        { label: 'System Logs', active: false, favicon: '📄' },
        { label: 'Network Scan', active: false, favicon: '📄' },
      ]);
      browserUI.setUrl('https://ghost.browser/tabs');
      browserUI.setContent(`
        <div style="padding:40px;">
          <h2 style="color:var(--text-primary);margin-bottom:16px;">Tab Overview</h2>
          <p style="color:var(--text-secondary);">The ghost is hiding in the adjacent tab.</p>
        </div>
      `);
      
      const tab = browserUI.getTab(1);
      if (tab) {
        ghost.moveTo(tab, 'on');
      }
      ghost.show();
      ghost.setState('idle');
      browserUI.infectTab(1);
    },
    async onSuccess() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, favicon: 'ghost' },
        { label: 'System Logs', active: true, infected: true, favicon: '📄' },
        { label: 'Network Scan', active: false, favicon: '📄' },
      ]);
      await ghost.playHit();
      
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
    challenge: 'It doubled back to the first tab. Reverse cycle!',
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, infected: true, favicon: 'ghost' },
        { label: 'System Logs', active: true, favicon: '📄' },
        { label: 'Network Scan', active: false, favicon: '📄' },
      ]);
      
      const tab = browserUI.getTab(0);
      if (tab) ghost.moveTo(tab, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
        { label: 'System Logs', active: false, favicon: '📄' },
        { label: 'Network Scan', active: false, favicon: '📄' },
      ]);
      await ghost.playHit();
      
      ghost.setState('panic');
      await delay(300);
      
      await browserUI.removeTab(1);
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'reopen_tab',
    challenge: 'It deleted your evidence tab! Restore it from the void.',
    setup() {
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: true, favicon: 'ghost' },
        { label: 'Network Scan', active: false, favicon: '📄' },
      ]);
      
      const content = document.getElementById('view-game');
      ghost.moveTo(content, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      await ghost.playHit();
      
      browserUI.setTabs([
        { label: 'Ghost in Your Browser', active: false, favicon: 'ghost' },
        { label: 'System Logs', active: true, favicon: '📄' },
        { label: 'Network Scan', active: false, favicon: '📄' },
      ]);
      
      ghost.setState('flee');
      await delay(200);
      
      browserUI.setTabs([
        { label: 'T1', active: true, favicon: '📄' },
        { label: 'T2', active: false, favicon: '📄' },
        { label: 'T3', active: false, favicon: '📄' },
        { label: 'T4', active: false, favicon: '📄' },
        { label: 'Ghost Tab', active: false, infected: true, favicon: 'ghost' },
        { label: 'T6', active: false, favicon: '📄' },
        { label: 'T7', active: false, favicon: '📄' },
        { label: 'T8', active: false, favicon: '📄' },
        { label: 'Last Tab', active: false, favicon: '📄' },
      ]);
      
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
        { label: 'T1', active: true, favicon: '📄' },
        { label: 'T2', active: false, favicon: '📄' },
        { label: 'T3', active: false, favicon: '📄' },
        { label: 'T4', active: false, favicon: '📄' },
        { label: 'Ghost Tab', active: false, infected: true, favicon: 'ghost' },
        { label: 'T6', active: false, favicon: '📄' },
        { label: 'T7', active: false, favicon: '📄' },
        { label: 'T8', active: false, favicon: '📄' },
        { label: 'Last Tab', active: false, favicon: '📄' },
      ]);
      
      const tab5 = browserUI.getTab(4);
      if (tab5) ghost.moveTo(tab5, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      browserUI.setTabs([
        { label: 'T1', active: false, favicon: '📄' },
        { label: 'T2', active: false, favicon: '📄' },
        { label: 'T3', active: false, favicon: '📄' },
        { label: 'T4', active: false, favicon: '📄' },
        { label: 'Ghost Tab', active: true, infected: true, favicon: 'ghost' },
        { label: 'T6', active: false, favicon: '📄' },
        { label: 'T7', active: false, favicon: '📄' },
        { label: 'T8', active: false, favicon: '📄' },
        { label: 'Last Tab', active: false, favicon: '📄' },
      ]);
      await ghost.playHit();
      
      ghost.setState('flee');
      const lastTab = browserUI.getTab(8);
      if (lastTab) ghost.moveTo(lastTab, 'on');
      await delay(300);
      browserUI.infectTab(8);
      ghost.setState('idle');
    }
  },
  {
    shortcutId: 'last_tab',
    challenge: 'It fled to the very last tab. Snap to the edge to pin it!',
    setup() {
      browserUI.setTabs([
        { label: 'T1', active: false, favicon: '📄' },
        { label: 'T2', active: false, favicon: '📄' },
        { label: 'T3', active: false, favicon: '📄' },
        { label: 'T4', active: false, favicon: '📄' },
        { label: 'Ghost Tab', active: true, favicon: '📄' },
        { label: 'T6', active: false, favicon: '📄' },
        { label: 'T7', active: false, favicon: '📄' },
        { label: 'T8', active: false, favicon: '📄' },
        { label: 'Last Tab', active: false, infected: true, favicon: 'ghost' },
      ]);
      
      const lastTab = browserUI.getTab(8);
      if (lastTab) ghost.moveTo(lastTab, 'on');
      ghost.show();
      ghost.setState('idle');
    },
    async onSuccess() {
      browserUI.setTabs([
        { label: 'T1', active: false, favicon: '📄' },
        { label: 'T2', active: false, favicon: '📄' },
        { label: 'T3', active: false, favicon: '📄' },
        { label: 'T4', active: false, favicon: '📄' },
        { label: 'Ghost Tab', active: false, favicon: '📄' },
        { label: 'T6', active: false, favicon: '📄' },
        { label: 'T7', active: false, favicon: '📄' },
        { label: 'T8', active: false, favicon: '📄' },
        { label: 'Last Tab', active: true, infected: true, favicon: 'ghost' },
      ]);
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
  prev_tab: 'Reverse cycle!',
  reopen_tab: 'Restore the tab!',
  jump_tab: 'Jump straight to 5!',
  last_tab: 'Snap to the last tab!',
};
