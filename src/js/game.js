/**
 * game.js — Core game loop
 *
 * Manages the level flow, keyboard capture, hints, scoring,
 * mouse tracking, power bar, and retry phase.
 */

import { getShortcutById, getPlatform, renderCreatureText, isArc } from '../data/shortcuts.js';
import { calculateScore, calculateStars, renderStars } from './scoring.js';
import * as ghost from './ghost.js';
import * as browserUI from './browser-ui.js';
import { getGhostgleHTML } from './templates.js';
import { ACT1_LEVELS, ACT1_RETRY_CHALLENGES } from './levels/act1.js';
import { ACT2_LEVELS, ACT2_RETRY_CHALLENGES } from './levels/act2.js';
import { ACT3_LEVELS, ACT3_RETRY_CHALLENGES } from './levels/act3.js';
import { ACT4_LEVELS, ACT4_RETRY_CHALLENGES } from './levels/act4.js';

// ==========================================
// STATE
// ==========================================

const state = {
  // Current act/level
  levels: [],
  currentLevelIndex: 0,
  currentShortcut: null,

  // Per-level
  levelStartTime: 0,
  wrongAttempts: 0,
  hintsUsed: 0,
  hintsRevealed: 0,

  // Arc-only: this level's shortcut is reserved by Arc's chrome (⌘T/⌘L),
  // so the page can't intercept it. When true, the player can press Enter
  // to bypass the level (the real success animation still plays).
  arcReservedActive: false,

  // Per-act
  actStartTime: 0,
  mouseAttempts: 0,
  totalHints: 0,
  results: [], // { shortcutId, score, stars, wrongAttempts, hintsUsed }

  // Ghost power
  power: 100,

  // Active state
  isActive: false,
  isAnimating: false,
  keyHandler: null,
  mouseHandler: null,
};

// ==========================================
// DOM REFS
// ==========================================

let challengeText, challengeSubtext, hintBtn, hintLabel, powerBar, powerLabel, levelIndicator;
let hintOverlay, hintText;
let devtoolsLogs;
let mouseSpookedEl;
let arcNoticeEl;

function cacheDom() {
  challengeText = document.getElementById('challenge-text');
  challengeSubtext = document.getElementById('challenge-subtext');
  hintBtn = document.getElementById('hint-btn');
  hintLabel = document.getElementById('hint-label');
  powerBar = document.getElementById('power-bar');
  powerLabel = document.getElementById('power-label');
  levelIndicator = document.getElementById('level-indicator');
  hintOverlay = document.getElementById('hint-overlay');
  hintText = document.getElementById('hint-text');
  devtoolsLogs = document.getElementById('devtools-logs');
  mouseSpookedEl = document.getElementById('mouse-spooked');
  arcNoticeEl = document.getElementById('arc-notice');
}

// ==========================================
// PUBLIC API
// ==========================================

/**
 * Initialize and start an Act.
 * @param {string} actId - 'act1', 'act2', 'act3'
 * @param {Function} onWin - Called when the act is completed.
 */
export function startAct(actId, onWin) {
  cacheDom();
  browserUI.initBrowserUI();
  ghost.initGhost(document.getElementById('ghost'));

  const viewGame = document.getElementById('view-game');
  if (viewGame) {
    viewGame.style.opacity = '';
    viewGame.style.transition = '';
  }

  if (actId === 'act1') {
    state.levels = ACT1_LEVELS;
  } else if (actId === 'act2') {
    state.levels = ACT2_LEVELS;
  } else if (actId === 'act3') {
    state.levels = ACT3_LEVELS;
  } else if (actId === 'act4') {
    state.levels = ACT4_LEVELS;
  } else {
    state.levels = ACT1_LEVELS;
  }

  state.currentLevelIndex = 0;
  state.actStartTime = Date.now();
  state.mouseAttempts = 0;
  state.totalHints = 0;
  state.results = [];
  state.power = 100;
  state.onWin = onWin;
  state.isActive = true;

  updatePower();
  startMouseTracking();
  
  startLevel();
}

/**
 * Stop the game and clean up event listeners.
 */
export function stopGame() {
  state.isActive = false;
  if (state.keyHandler) {
    document.removeEventListener('keydown', state.keyHandler);
    state.keyHandler = null;
  }
  stopMouseTracking();
}

/**
 * Get the final stats for the win screen.
 */
export function getStats() {
  return {
    timeMs: Date.now() - state.actStartTime,
    mouseAttempts: state.mouseAttempts,
    totalHints: state.totalHints,
    results: state.results,
    totalScore: state.results.reduce((sum, r) => sum + r.score, 0),
    maxScore: state.results.length * 100,
  };
}

// ==========================================
// LEVEL FLOW
// ==========================================

function startLevel() {
  if (!state.isActive) return;

  const level = state.levels[state.currentLevelIndex];

  if (!level) {
    handleWin();
    return;
  }

  // Make sure find bar is cleared
  browserUI.hideFindBar();

  // Get shortcut data
  const shortcut = getShortcutById(level.shortcutId);
  state.currentShortcut = shortcut;
  state.wrongAttempts = 0;
  state.hintsUsed = 0;
  state.hintsRevealed = 0;

  // Set up the browser state
  const setupPromise = level.setup();

  // Update UI
  const platform = getPlatform();
  const challengeStr = level.challenge;

  if (setupPromise instanceof Promise) {
    state.isAnimating = true;
    setupPromise.then(() => {
      if (!state.isActive) return;
      if (window.__isActTransition) {
        // Leave isAnimating as true, transition will call endTransitionBlock()
        return;
      }
      state.isAnimating = false;
      state.levelStartTime = Date.now();
      
      logToConsole(null, `[SYSTEM] ${challengeStr}`, 'info');
      if (platform === 'mac' && shortcut.keys[platform].mods.includes('ctrl')) {
        logToConsole(null, `[WARNING] macOS: In this one, use Ctrl instead of Cmd`, 'fail');
      }
    });
  } else {
    if (window.__isActTransition) {
      state.isAnimating = true;
    } else {
      state.isAnimating = false;
      state.levelStartTime = Date.now();
    }
    
    // If not in transition, log immediately, otherwise endTransitionBlock will log
    if (!window.__isActTransition) {
      logToConsole(null, `[SYSTEM] ${challengeStr}`, 'info');
      if (platform === 'mac' && shortcut.keys[platform].mods.includes('ctrl')) {
        logToConsole(null, `[WARNING] macOS: In this one, use Ctrl instead of Cmd`, 'fail');
      }
    }
  }

  const totalLevels = state.levels.length;
  levelIndicator.textContent = `${state.currentLevelIndex + 1} / ${totalLevels}`;

  // Reset hints
  hintLabel.textContent = `Hint (${3 - state.hintsRevealed})`;
  hintBtn.disabled = false;
  hintOverlay.classList.add('hidden');

  // Arc reserves ⌘T/⌘L at the chrome level, so those keydowns never reach the
  // page and the player can't actually solve the level. On Arc only, surface a
  // notice and let Enter bypass it (full credit — it's Arc's limitation).
  state.arcReservedActive = isArc() && shortcut.arcReserved === true;
  showArcNotice(state.arcReservedActive);

  // Listen for keys
  if (!state.keyHandler) {
    state.keyHandler = (e) => onKeyDown(e, level);
    document.addEventListener('keydown', state.keyHandler);
  } else {
    // Just update the reference if we're reusing it
    document.removeEventListener('keydown', state.keyHandler);
    state.keyHandler = (e) => onKeyDown(e, level);
    document.addEventListener('keydown', state.keyHandler);
  }
}

function onKeyDown(e, level) {
  if (!state.isActive) return;

  // If animating success/fail, ignore gameplay but still trap native browser shortcuts
  if (state.isAnimating) {
    if (e.metaKey || e.ctrlKey || e.altKey) {
      e.preventDefault();
    }
    return;
  }

  const shortcut = state.currentShortcut;
  const platform = getPlatform();
  const keys = shortcut.keys[platform];

  // Check for hint key
  if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
    e.preventDefault();
    useHint();
    return;
  }

  // Arc-reserved shortcut (⌘T/⌘L): Enter bypasses the level with full credit.
  // The real shortcut is still accepted below in case the player enabled
  // "website wins" in Arc, so we only special-case Enter here.
  if (state.arcReservedActive && e.key === 'Enter') {
    e.preventDefault();
    completeArcReserved(level, e);
    return;
  }

  // Check if the pressed key matches
  if (matchesShortcut(e, keys, level.shortcutId, platform)) {
    e.preventDefault();
    handleSuccess(level, e);
  } else {
    // If it's a modifier key press alone (e.g. Cmd, Shift, Alt, Ctrl), ignore it without failing
    if (['meta', 'control', 'shift', 'alt'].includes(e.key.toLowerCase())) {
      return;
    }
    // Also, if Cmd is held but they press another random shortcut key, let's trigger a fail and preventDefault
    // so we don't execute other browser behaviors while they are trying to solve this shortcut.
    if (e.metaKey || e.ctrlKey || e.altKey) {
      e.preventDefault();
    }
    
    // CUSTOM FAIL LOGIC for jump_tab cheat (intercept move right / next_tab or move left / prev_tab)
    if (level.shortcutId === 'jump_tab') {
      const nextTabKeys = getShortcutById('next_tab').keys[platform];
      const prevTabKeys = getShortcutById('prev_tab').keys[platform];
      if (matchesShortcut(e, nextTabKeys, 'next_tab', platform) || matchesShortcut(e, prevTabKeys, 'prev_tab', platform)) {
        handleJumpTabCheat(e);
        return;
      }

      // If they press a wrong number key (Cmd+1 to Cmd+8)
      if (e.metaKey || e.ctrlKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 8) {
          e.preventDefault();
          handleFail(e);

          // Update active tab in the browser UI
          const allTabs = document.querySelectorAll('.tab');
          const tabObjects = Array.from(allTabs).map((tab, i) => {
            return {
              label: tab.querySelector('.tab-label').textContent,
              active: i === (num - 1),
              infected: tab.classList.contains('infected'),
              favicon: 'ghost'
            };
          });
          browserUI.setTabs(tabObjects);

          // Update content and URL
          if (num === 1) {
            const selectPage = document.getElementById('start-page-2');
            if (selectPage) {
              browserUI.setContent(`
                <div class="start-page" style="height: 100%; min-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  ${selectPage.innerHTML}
                </div>
              `);
            }
            browserUI.setUrl('chrome://newtab/');
          } else {
            browserUI.setContent(getGhostgleHTML());
            browserUI.setUrl('https://ghost.browser/new-tab');
          }

          // Move ghost back to its infected tab
          const infectedTab = document.querySelector('.tab.infected');
          if (infectedTab) {
            ghost.moveTo(infectedTab, 'on');
          }
          return;
        }
      }
    }

    handleFail(e);
  }
}

function matchesShortcut(e, keys, shortcutId, platform) {
  // Normalize key comparison
  const pressedKey = e.key.toLowerCase();
  
  // Custom aliases for unpreventable/system-level shortcuts
  if (platform === 'mac') {
    if (shortcutId === 'next_tab') {
      if (pressedKey === 'tab' && e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey) return true;
      if ((pressedKey === ']' || pressedKey === '}') && e.metaKey && e.shiftKey && !e.ctrlKey && !e.altKey) return true;
    }
    if (shortcutId === 'prev_tab') {
      if (pressedKey === 'tab' && e.ctrlKey && e.shiftKey && !e.metaKey && !e.altKey) return true;
      if ((pressedKey === '[' || pressedKey === '{') && e.metaKey && e.shiftKey && !e.ctrlKey && !e.altKey) return true;
    }
  } else if (platform === 'win') {
    if (shortcutId === 'next_tab') {
      if (pressedKey === 'pagedown' && e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey) return true;
    }
    if (shortcutId === 'prev_tab') {
      if (pressedKey === 'pageup' && e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey) return true;
    }
  }

  const targetKey = keys.key.toLowerCase();

  // Special case: Space
  if (targetKey === ' ' && pressedKey === ' ') {
    return checkModifiers(e, keys.mods);
  }

  // Special case: number range (1-8 for jump_tab)
  if (targetKey === '1-8') {
    const num = parseInt(pressedKey);
    if (num >= 1 && num <= 8) {
      const infectedTab = document.querySelector('.tab.infected');
      if (infectedTab) {
        const expectedIndex = parseInt(infectedTab.dataset.index);
        const expectedKey = (expectedIndex + 1).toString();
        if (pressedKey !== expectedKey) {
          return false;
        }
      }
      return checkModifiers(e, keys.mods);
    }
    return false;
  }

  // Standard key match
  if (pressedKey === targetKey) {
    return checkModifiers(e, keys.mods);
  }

  return false;
}

function checkModifiers(e, requiredMods) {
  const hasMeta = requiredMods.includes('meta');
  const hasCtrl = requiredMods.includes('ctrl');
  const hasShift = requiredMods.includes('shift');
  const hasAlt = requiredMods.includes('alt');

  if (hasMeta !== e.metaKey) return false;
  if (hasCtrl !== e.ctrlKey) return false;
  if (hasShift !== e.shiftKey) return false;
  if (hasAlt !== e.altKey) return false;

  return true;
}

async function handleSuccess(level, e) {
  if (!state.isActive) return;

  // Block further inputs but keep trapping native shortcuts
  state.isAnimating = true;

  // Calculate score
  const timeMs = Date.now() - state.levelStartTime;
  const score = calculateScore(timeMs, state.wrongAttempts, state.hintsUsed);
  const stars = calculateStars(state.wrongAttempts, state.hintsUsed);

  // Store result
  state.results.push({
    shortcutId: state.currentShortcut.id,
    score,
    stars,
    wrongAttempts: state.wrongAttempts,
    hintsUsed: state.hintsUsed,
  });
  state.totalHints += state.hintsUsed;

  // Drain power (spread evenly across levels)
  const powerDrain = Math.ceil(100 / state.levels.length);
  state.power = Math.max(0, state.power - powerDrain);
  updatePower();

  // Show success in DevTools console first
  const platform = getPlatform();
  const keysStr = e ? formatKeyCombo(e) : state.currentShortcut.keys[platform].display;
  const actionStr = state.currentShortcut.action;
  logToConsole(keysStr, actionStr, 'success');

  // Play level success animation next
  if (level.onSuccess) {
    await level.onSuccess();
  }

  // Advance to next level after a snappy delay
  await delay(500);
  hintOverlay.classList.add('hidden');

  state.currentLevelIndex++;
  startLevel();
}

/**
 * Bypass an Arc-reserved level (⌘T/⌘L) when the player presses Enter.
 *
 * Arc intercepts these shortcuts at the chrome level, so the player can't solve
 * the level normally — that's not their fault, so we award full credit. We still
 * run the level's real onSuccess() animation so the fake browser ends up in the
 * state the NEXT level's setup() expects (a new tab open, address bar focused).
 */
async function completeArcReserved(level, e) {
  if (!state.isActive) return;

  state.isAnimating = true;
  showArcNotice(false);

  // Full credit — Arc's limitation, not a skill gap.
  state.results.push({
    shortcutId: state.currentShortcut.id,
    score: 100,
    stars: 3,
    wrongAttempts: 0,
    hintsUsed: 0,
  });

  // Drain power like a normal completion so the bar stays consistent.
  const powerDrain = Math.ceil(100 / state.levels.length);
  state.power = Math.max(0, state.power - powerDrain);
  updatePower();

  const platform = getPlatform();
  const keysStr = state.currentShortcut.keys[platform].display;
  logToConsole(keysStr, `${state.currentShortcut.action} (Arc-reserved — auto-resolved)`, 'success');

  if (level.onSuccess) {
    await level.onSuccess();
  }

  await delay(500);
  hintOverlay.classList.add('hidden');

  state.currentLevelIndex++;
  startLevel();
}

/**
 * Show or hide the top-right Arc notice toast.
 */
function showArcNotice(show) {
  if (!arcNoticeEl) return;
  arcNoticeEl.classList.toggle('hidden', !show);
}

function handleFail(e) {
  state.wrongAttempts++;

  // Screen shake
  const browser = document.getElementById('game-browser');
  browser.classList.add('screen-shake');
  setTimeout(() => browser.classList.remove('screen-shake'), 150);

  // Ghost taunt
  ghost.playTaunt();

  // Log to console
  if (e) {
    const keyCombo = formatKeyCombo(e);
    logToConsole(keyCombo, 'Incorrect command detected', 'fail');
  }

  // Auto-reveal next hint on failure
  useHint();
}

function handleJumpTabCheat(e) {
  state.wrongAttempts++;

  // Screen shake
  const browser = document.getElementById('game-browser');
  browser.classList.add('screen-shake');
  setTimeout(() => browser.classList.remove('screen-shake'), 150);

  // Ghost taunts and jumps away
  ghost.playTaunt();
  
  // Find current active tab
  const activeTab = document.querySelector('.tab.active');
  const allTabs = document.querySelectorAll('.tab');
  let activeIndex = activeTab ? parseInt(activeTab.dataset.index || '0') : 0;
  
  // Update active tab based on which shortcut was pressed
  const platform = getPlatform();
  const nextTabKeys = getShortcutById('next_tab').keys[platform];
  const prevTabKeys = getShortcutById('prev_tab').keys[platform];
  
  if (matchesShortcut(e, nextTabKeys, 'next_tab', platform)) {
    activeIndex = (activeIndex + 1) % allTabs.length;
  } else if (matchesShortcut(e, prevTabKeys, 'prev_tab', platform)) {
    activeIndex = (activeIndex - 1 + allTabs.length) % allTabs.length;
  }
  
  // Update tab strip active class
  const tabObjects = Array.from(allTabs).map((tab, i) => {
    return {
      label: tab.querySelector('.tab-label').textContent,
      active: i === activeIndex,
      infected: tab.classList.contains('infected'),
      favicon: 'ghost'
    };
  });
  
  // Constrain scramble index (0-7), avoiding current ghost position and new active index
  const currentGhostTab = document.querySelector('.tab.infected');
  let currentIndex = currentGhostTab ? parseInt(currentGhostTab.dataset.index || '4') : 4;
  
  let jumpTo = (currentIndex + 2) % 8;
  while (jumpTo === currentIndex || jumpTo === activeIndex || jumpTo === 0) {
    jumpTo = (jumpTo + 1) % 8;
  }
  
  // Set the infected flag on the new ghost tab
  tabObjects.forEach((t, i) => {
    t.infected = (i === jumpTo);
  });
  
  browserUI.setTabs(tabObjects);
  
  // Update viewport content
  if (activeIndex === 0) {
    // Show select operation (Part 2 page)
    const selectPage = document.getElementById('start-page-2');
    if (selectPage) {
      browserUI.setContent(`
        <div class="start-page" style="height: 100%; min-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          ${selectPage.innerHTML}
        </div>
      `);
    }
    browserUI.setUrl('chrome://newtab/');
  } else {
    // Show Ghostgle
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
    browserUI.setUrl('https://ghost.browser/new-tab');
  }
  
  // Position ghost on new scrambled tab
  const newGhostTab = browserUI.getTab(jumpTo);
  if (newGhostTab) ghost.moveTo(newGhostTab, 'on');

  if (e) {
    const keyCombo = formatKeyCombo(e);
    logToConsole(keyCombo, 'Target moved. Re-evaluating...', 'fail');
  }

  useHint();
}

// ==========================================
// HINTS
// ==========================================

function useHint() {
  if (state.isRetryPhase) return;
  if (state.hintsRevealed >= 3) return;

  state.hintsRevealed++;
  state.hintsUsed = state.hintsRevealed;

  const shortcut = state.currentShortcut;
  const platform = getPlatform();

  let text;
  switch (state.hintsRevealed) {
    case 1: text = shortcut.hint1; break;
    case 2: text = shortcut.hint2; break;
    case 3:
      // Show platform-specific hint 3
      text = `Press ${shortcut.keys[platform].display}`;
      break;
  }

  hintText.textContent = renderCreatureText(text);
  hintOverlay.classList.remove('hidden');
  hintLabel.textContent = `Hint (${3 - state.hintsRevealed})`;

  if (state.hintsRevealed >= 3) {
    hintBtn.disabled = true;
  }
}

// ==========================================
// RETRY PHASE
// ==========================================

function startRetryPhase() {
  state.isRetryPhase = true;
  state.currentLevelIndex = 0;

  // Build retry list: prioritize missed shortcuts, fill with random
  const missed = state.results
    .filter(r => r.hintsUsed > 0 || r.wrongAttempts >= 2)
    .map(r => r.shortcutId);

  const all = state.levels.map(l => l.shortcutId);
  const others = all.filter(id => !missed.includes(id));

  // Shuffle and pick
  let retryIds = [...shuffle(missed)];
  if (retryIds.length < 3) {
    retryIds = retryIds.concat(shuffle(others).slice(0, 3 - retryIds.length));
  }
  retryIds = retryIds.slice(0, 3);

  // Build retry level configs (reuse main level setup/onSuccess)
  state.retryQueue = retryIds.map(id => {
    const originalLevel = state.levels.find(l => l.shortcutId === id);
    return {
      shortcutId: id,
      challenge: state.retryChallenges[id] || originalLevel.challenge,
      setup: originalLevel.setup.bind(originalLevel),
      onSuccess: originalLevel.onSuccess.bind(originalLevel),
    };
  });

  // Ghost enters panic mode
  ghost.setState('panic');

  startLevel();
}

// ==========================================
// MOUSE TRACKING
// ==========================================

function startMouseTracking() {
  state.mouseHandler = (e) => {
    state.mouseAttempts++;
    showMouseSpooked(e.clientX, e.clientY);
  };
  document.addEventListener('mousemove', state.mouseHandler);
}

export function stopMouseTracking() {
  if (state.mouseHandler) {
    document.removeEventListener('mousemove', state.mouseHandler);
    state.mouseHandler = null;
  }
}

let mouseSpookedTimeout = null;

function showMouseSpooked(x, y) {
  if (!mouseSpookedEl) return;

  // Throttle: only show every 2 seconds
  if (mouseSpookedTimeout) return;

  mouseSpookedEl.style.left = `${x + 15}px`;
  mouseSpookedEl.style.top = `${y - 10}px`;
  mouseSpookedEl.classList.remove('hidden');

  // Force re-trigger animation
  mouseSpookedEl.style.animation = 'none';
  mouseSpookedEl.offsetHeight; // reflow
  mouseSpookedEl.style.animation = '';

  mouseSpookedTimeout = setTimeout(() => {
    mouseSpookedEl.classList.add('hidden');
    mouseSpookedTimeout = null;
  }, 800);
}

// ==========================================
// POWER BAR
// ==========================================

function updatePower() {
  if (!powerBar || !powerLabel) return;

  if (state.power === 100) {
    powerBar.style.setProperty('--power-transition', 'none');
    // Force DOM reflow to apply the styling change instantly
    powerBar.offsetHeight;
  } else {
    powerBar.style.removeProperty('--power-transition');
  }

  powerBar.style.setProperty('--power-width', `${state.power}%`);
  powerLabel.textContent = `${Math.round(state.power)}%`;

  powerBar.classList.remove('low', 'critical');
  const powerMeter = powerBar.closest('.power-meter');
  if (powerMeter) {
    powerMeter.classList.remove('low', 'critical');
  }

  if (state.power <= 15) {
    powerBar.classList.add('critical');
    if (powerMeter) powerMeter.classList.add('critical');
  } else if (state.power <= 40) {
    powerBar.classList.add('low');
    if (powerMeter) powerMeter.classList.add('low');
  }
}

// ==========================================
// UI HELPERS
// ==========================================

export function logToConsole(keys, msg, type = 'info') {
  if (!devtoolsLogs) {
    devtoolsLogs = document.getElementById('devtools-logs');
    if (!devtoolsLogs) return;
  }

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

  const entry = document.createElement('div');
  entry.className = `devtools-log-entry ${type}`;
  
  const timeSpan = document.createElement('span');
  timeSpan.className = 'log-time';
  timeSpan.textContent = timeStr;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'log-msg';
  
  if (keys) {
    msgSpan.innerHTML = `[<span class="log-key">${keys}</span>] ${msg}`;
  } else {
    msgSpan.textContent = msg;
  }

  entry.appendChild(msgSpan);
  entry.appendChild(timeSpan);
  
  devtoolsLogs.appendChild(entry);
  devtoolsLogs.scrollTop = devtoolsLogs.scrollHeight;
}

function formatKeyCombo(e) {
  const parts = [];
  if (e.metaKey) parts.push('⌘');
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Option');
  if (e.shiftKey) parts.push('Shift');
  
  let key = e.key;
  if (key === ' ') key = 'Space';
  else if (key.length === 1) key = key.toUpperCase();
  else if (key.startsWith('Arrow')) key = key.replace('Arrow', '');

  // Only append if it's not a modifier itself
  if (!['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
    parts.push(key);
  }

  return parts.join(' + ');
}

// ==========================================
// WIN
// ==========================================

function handleWin() {
  state.isActive = false;
  stopMouseTracking();
  showArcNotice(false);
  const ghostEl = document.getElementById('ghost');
  if (ghostEl && !ghostEl.className.includes('ghost--hidden') && !ghostEl.className.includes('ghost--captured')) {
    ghost.playCaptured();
  }

  // Delay to let the new burst animation finish and final logs to be read (approx 2s)
  setTimeout(() => {
    if (state.onWin) state.onWin();
  }, 2000);
}

// ==========================================
// UTILITIES
// ==========================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function endTransitionBlock() {
  state.isAnimating = false;
  state.levelStartTime = Date.now();
  const level = state.levels[state.currentLevelIndex];
  if (level) {
    const shortcut = getShortcutById(level.shortcutId);
    const platform = getPlatform();
    logToConsole(null, `[SYSTEM] ${level.challenge}`, 'info');
    if (platform === 'mac' && shortcut.keys[platform].mods.includes('ctrl')) {
      logToConsole(null, `[WARNING] macOS: In this one, use Ctrl instead of Cmd`, 'fail');
    }
  }
}
