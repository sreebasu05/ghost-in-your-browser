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
    // No more levels - user requested no extra repeats (skip retry phase)
    handleWin();
    return;
  }

  // Make sure find bar is cleared
  browserUI.hideFindBar();

  // Get shortcut data
  const shortcut = getShortcutById(level.shortcutId);
  state.currentShortcut = shortcut;
  state.levelStartTime = Date.now();
  state.wrongAttempts = 0;
  state.hintsUsed = 0;
  state.hintsRevealed = 0;

  // Set up the browser state
  level.setup();

  state.isAnimating = false;

  // Update UI
  const platform = getPlatform();
  // Log challenge instruction into the console
  const challengeStr = level.challenge;
  
  logToConsole(null, `[SYSTEM] ${challengeStr}`, 'info');

  const totalLevels = state.levels.length;
  levelIndicator.textContent = `${state.currentLevelIndex + 1} / ${totalLevels}`;

  // Log macOS simulated shortcut warning if applicable
  if (platform === 'mac' && shortcut.keys[platform].mods.includes('ctrl')) {
    logToConsole(null, `[WARNING] macOS: In this one, use Ctrl instead of Cmd`, 'fail');
  }

  // Reset hints
  hintLabel.textContent = `Hint (${3 - state.hintsRevealed})`;
  hintBtn.disabled = false;
  hintOverlay.classList.add('hidden');

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
        handleJumpTabCheat(e);
        return;
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

  // Show success in DevTools console FIRST
  const platform = getPlatform();
  const keysStr = state.currentShortcut.keys[platform].display;
  const actionStr = state.currentShortcut.action;
  logToConsole(keysStr, actionStr, 'success');

  // Play level success animation
  if (level.onSuccess) {
    await level.onSuccess();
  }

  // Advance to next level after a snappy delay
  await delay(500);
  hintOverlay.classList.add('hidden');

  state.currentLevelIndex++;
  startLevel();
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

  entry.appendChild(timeSpan);
  entry.appendChild(msgSpan);
  
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
  const ghostEl = document.getElementById('ghost');
  if (ghostEl && !ghostEl.className.includes('ghost--hidden') && !ghostEl.className.includes('ghost--captured')) {
    ghost.playCaptured();
  }

  // Delay to let the new burst animation finish (approx 1.5 - 2s)
  setTimeout(() => {
    if (state.onWin) state.onWin();
  }, ghostEl.className.includes('ghost--hidden') ? 0 : 2000);
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
