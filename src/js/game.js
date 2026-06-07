/**
 * game.js — Core game loop
 *
 * Manages the level flow, keyboard capture, hints, scoring,
 * mouse tracking, power bar, and retry phase.
 */

import { getShortcutById, getPlatform, renderCreatureText } from '../data/shortcuts.js';
import { calculateScore, calculateStars, renderStars } from './scoring.js';
import * as ghost from './ghost.js';
import * as browserUI from './browser-ui.js';
import { ACT1_LEVELS, ACT1_RETRY_CHALLENGES } from './levels/act1.js';
import { ACT2_LEVELS, ACT2_RETRY_CHALLENGES } from './levels/act2.js';
import { ACT3_LEVELS, ACT3_RETRY_CHALLENGES } from './levels/act3.js';

// ==========================================
// STATE
// ==========================================

const state = {
  // Current act/level
  levels: [],
  currentLevelIndex: 0,
  currentShortcut: null,
  isRetryPhase: false,
  retryQueue: [],
  retryChallenges: {},

  // Per-level
  levelStartTime: 0,
  wrongAttempts: 0,
  hintsUsed: 0,
  hintsRevealed: 0,

  // Per-act
  actStartTime: 0,
  mouseAttempts: 0,
  totalHints: 0,
  results: [], // { shortcutId, score, stars, wrongAttempts, hintsUsed }

  // Ghost power
  power: 100,

  // Active state
  isActive: false,
  keyHandler: null,
  mouseHandler: null,
};

// ==========================================
// DOM REFS
// ==========================================

let challengeText, challengeSubtext, hintBtn, hintLabel, powerBar, powerLabel, levelIndicator;
let hintOverlay, hintText;
let reinforcement, reinforcementKeys, reinforcementAction;
let mouseSpookedEl;

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
  reinforcement = document.getElementById('reinforcement');
  reinforcementKeys = document.getElementById('reinforcement-keys');
  reinforcementAction = document.getElementById('reinforcement-action');
  mouseSpookedEl = document.getElementById('mouse-spooked');
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

  if (actId === 'act1') {
    state.levels = ACT1_LEVELS;
    state.retryChallenges = ACT1_RETRY_CHALLENGES;
  } else if (actId === 'act2') {
    state.levels = ACT2_LEVELS;
    state.retryChallenges = ACT2_RETRY_CHALLENGES;
  } else if (actId === 'act3') {
    state.levels = ACT3_LEVELS;
    state.retryChallenges = ACT3_RETRY_CHALLENGES;
  } else {
    state.levels = ACT1_LEVELS;
    state.retryChallenges = ACT1_RETRY_CHALLENGES;
  }

  state.currentLevelIndex = 0;
  state.isRetryPhase = false;
  state.retryQueue = [];
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
    maxScore: state.results.length * 175,
  };
}

// ==========================================
// LEVEL FLOW
// ==========================================

function startLevel() {
  if (!state.isActive) return;

  const level = state.isRetryPhase
    ? state.retryQueue[state.currentLevelIndex]
    : state.levels[state.currentLevelIndex];

  if (!level) {
    // No more levels
    if (!state.isRetryPhase) {
      startRetryPhase();
    } else {
      handleWin();
    }
    return;
  }

  // Get shortcut data
  const shortcut = getShortcutById(level.shortcutId);
  state.currentShortcut = shortcut;
  state.levelStartTime = Date.now();
  state.wrongAttempts = 0;
  state.hintsUsed = 0;
  state.hintsRevealed = 0;

  // Set up the browser state
  level.setup();

  // Update UI
  const platform = getPlatform();
  const challengeStr = state.isRetryPhase
    ? state.retryChallenges[level.shortcutId] || shortcut.story
    : level.challenge;
  challengeText.textContent = renderCreatureText(challengeStr);

  const totalLevels = state.isRetryPhase ? state.retryQueue.length : state.levels.length;
  const label = state.isRetryPhase ? 'R' : 'L';
  levelIndicator.textContent = `${label}${state.currentLevelIndex + 1}`;

  // Check for macOS simulated shortcut warning
  if (challengeSubtext) {
    const keys = shortcut.keys[platform];
    if (platform === 'mac' && keys.mods.includes('ctrl')) {
      challengeSubtext.textContent = `⚠️ macOS: In this one, use Ctrl instead of Cmd`;
      challengeSubtext.classList.remove('hidden');
    } else {
      challengeSubtext.classList.add('hidden');
    }
  }

  // Reset hints
  hintLabel.textContent = `Hint (${3 - state.hintsRevealed})`;
  hintBtn.disabled = state.isRetryPhase; // No hints during retry
  hintOverlay.classList.add('hidden');

  // Listen for keys
  if (state.keyHandler) {
    document.removeEventListener('keydown', state.keyHandler);
  }
  state.keyHandler = (e) => onKeyDown(e, level);
  document.addEventListener('keydown', state.keyHandler);
}

function onKeyDown(e, level) {
  if (!state.isActive) return;

  const shortcut = state.currentShortcut;
  const platform = getPlatform();
  const keys = shortcut.keys[platform];

  // Check for hint key
  if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
    e.preventDefault();
    useHint();
    return;
  }

  // Check if the pressed key matches
  if (matchesShortcut(e, keys, level.shortcutId, platform)) {
    e.preventDefault();
    handleSuccess(level);
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
    
    // CUSTOM FAIL LOGIC for jump_tab cheat
    if (level.shortcutId === 'jump_tab') {
      const nextTabKeys = getShortcutById('next_tab').keys[platform];
      if (matchesShortcut(e, nextTabKeys, 'next_tab', platform)) {
        handleJumpTabCheat();
        return;
      }
    }

    handleFail();
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

async function handleSuccess(level) {
  if (!state.isActive) return;

  // Remove key listener during animation
  document.removeEventListener('keydown', state.keyHandler);
  state.keyHandler = null;

  // Calculate score
  const timeMs = Date.now() - state.levelStartTime;
  const score = calculateScore(timeMs, state.wrongAttempts, state.hintsUsed);
  const stars = calculateStars(state.wrongAttempts, state.hintsUsed);

  // Store result (only for main levels, not retries)
  if (!state.isRetryPhase) {
    state.results.push({
      shortcutId: state.currentShortcut.id,
      score,
      stars,
      wrongAttempts: state.wrongAttempts,
      hintsUsed: state.hintsUsed,
    });
    state.totalHints += state.hintsUsed;
  }

  // Drain power
  const powerDrain = state.isRetryPhase ? 7 : 13;
  state.power = Math.max(0, state.power - powerDrain);
  updatePower();

  // Play level success animation
  if (level.onSuccess) {
    await level.onSuccess();
  }

  // Show reinforcement flash
  const platform = getPlatform();
  showReinforcement(
    state.currentShortcut.keys[platform].display,
    state.currentShortcut.action
  );

  // Advance to next level after delay
  await delay(1200);
  hideReinforcement();
  hintOverlay.classList.add('hidden');

  state.currentLevelIndex++;
  startLevel();
}

function handleFail() {
  state.wrongAttempts++;

  // Screen shake
  const browser = document.getElementById('game-browser');
  browser.classList.add('screen-shake');
  setTimeout(() => browser.classList.remove('screen-shake'), 150);

  // Ghost taunt
  ghost.playTaunt();

  // Auto-reveal next hint on failure
  useHint();
}

function handleJumpTabCheat() {
  state.wrongAttempts++;

  // Screen shake
  const browser = document.getElementById('game-browser');
  browser.classList.add('screen-shake');
  setTimeout(() => browser.classList.remove('screen-shake'), 150);

  // Ghost taunts and jumps away
  ghost.playTaunt();
  
  // Ghost jumps to a random tab to annoy player
  const currentGhostTab = document.querySelector('.tab.infected');
  const allTabs = document.querySelectorAll('.tab');
  if (currentGhostTab && allTabs.length > 0) {
    const currentIndex = parseInt(currentGhostTab.dataset.index || '4');
    const jumpTo = (currentIndex + 2) % allTabs.length;
    
    currentGhostTab.classList.remove('infected');
    browserUI.infectTab(jumpTo);
    
    const newGhostTab = browserUI.getTab(jumpTo);
    if (newGhostTab) ghost.moveTo(newGhostTab, 'on');
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

function stopMouseTracking() {
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

  powerBar.style.setProperty('--power-width', `${state.power}%`);
  powerLabel.textContent = `${Math.round(state.power)}%`;

  powerBar.classList.remove('low', 'critical');
  if (state.power <= 15) {
    powerBar.classList.add('critical');
  } else if (state.power <= 40) {
    powerBar.classList.add('low');
  }
}

// ==========================================
// UI HELPERS
// ==========================================

function showReinforcement(keys, action) {
  reinforcementKeys.textContent = keys;
  reinforcementAction.textContent = `— ${action}`;
  reinforcement.classList.remove('hidden');

  // Force re-trigger animation
  reinforcement.style.animation = 'none';
  reinforcement.offsetHeight;
  reinforcement.style.animation = '';
}

function hideReinforcement() {
  reinforcement.classList.add('hidden');
}

// ==========================================
// WIN
// ==========================================

function handleWin() {
  state.isActive = false;
  stopMouseTracking();
  ghost.playCaptured();

  // Delay then callback
  setTimeout(() => {
    if (state.onWin) state.onWin();
  }, 1000);
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

// ==========================================
// NATIVE NAVIGATION TRAP (Popstate)
// ==========================================

// If the browser manages to execute native Back/Forward (e.g. via swipe or unpreventable shortcut),
// this catches the history change (if a buffer was pushed) so the game doesn't unload.
window.addEventListener('popstate', (e) => {
  if (!state.isActive || !state.keyHandler) return;
  
  const level = state.isRetryPhase 
    ? state.retryQueue[state.currentLevelIndex] 
    : state.levels[state.currentLevelIndex];
    
  if (!level) return;

  if (level.shortcutId === 'back' || level.shortcutId === 'forward') {
    // Treat as success because they correctly triggered the browser's back/forward action!
    handleSuccess(level);
  } else {
    // Navigated natively during a different challenge! Trap them again and fail.
    window.history.pushState({ trapped: true }, '', '');
    handleFail();
  }
});

// ==========================================
// UNCAPTURABLE SHORTCUT TRAP (Blur/Visibility)
// ==========================================

// Some system-level shortcuts (like Cmd+Option+Right for next_tab, or Cmd+T for new_tab)
// do NOT fire keydown events in the browser at all. To support them, we listen for the
// page losing focus or becoming hidden. If the current challenge requires leaving the tab,
// we assume they successfully used the shortcut.
function handleBlurOrHidden() {
  if (!state.isActive || !state.keyHandler) return;
  
  const level = state.isRetryPhase 
    ? state.retryQueue[state.currentLevelIndex] 
    : state.levels[state.currentLevelIndex];
    
  if (!level) return;

  const simulateShortcuts = [
    'next_tab', 'prev_tab', 'new_tab', 'close_tab', 
    'new_window', 'incognito', 'close_window'
  ];

  if (simulateShortcuts.includes(level.shortcutId)) {
    handleSuccess(level);
  }
}

window.addEventListener('blur', handleBlurOrHidden);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    handleBlurOrHidden();
  }
});
