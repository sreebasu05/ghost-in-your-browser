/**
 * main.js — Entry point
 *
 * Handles screen transitions inside the persistent browser:
 *   Start View → Disruption Overlay → Game View → Win View
 *
 * Keyboard-only navigation between screens.
 */

import { startAct, stopGame, getStats, logToConsole } from './game.js';
import { getPlatform, getShortcutById } from '../data/shortcuts.js';
import { renderStars } from './scoring.js';
import * as browserUI from './browser-ui.js';
import * as ghost from './ghost.js';

// ==========================================
// VIEWS & OVERLAYS
// ==========================================

const views = {
  start: document.getElementById('view-start'),
  game: document.getElementById('view-game'),
  win: document.getElementById('view-win'),
};
const challengeBar = document.getElementById('challenge-bar');
const ghostEl = document.getElementById('ghost');

let currentView = 'start';

function showView(name) {
  // Hide cursor during gameplay
  document.body.style.cursor = (name === 'game') ? 'none' : 'default';

  // Toggle internal browser views
  Object.keys(views).forEach(key => {
    if (key === name) {
      views[key].classList.remove('hidden');
    } else {
      views[key].classList.add('hidden');
    }
  });

  // Show/hide game-specific panels
  if (name === 'game') {
    challengeBar.classList.remove('hidden');
    if (ghostEl) ghostEl.classList.remove('hidden');
  } else {
    challengeBar.classList.add('hidden');
    if (ghostEl) ghostEl.classList.add('hidden');
  }

  currentView = name;
}

// ==========================================
// START SCREEN
// ==========================================

function initStartScreen() {
  browserUI.initBrowserUI();
  browserUI.setTabs([{ label: 'Ghost in Your Browser', active: true, favicon: 'ghost' }]);
  browserUI.setUrl('https://ghost.browser');
  browserUI.hideFindBar();
  document.getElementById('devtools-panel').classList.remove('is-open');
  const devtoolsLogs = document.getElementById('devtools-logs');
  if (devtoolsLogs) devtoolsLogs.innerHTML = '';
  
  // Start ghost screensaver
  ghost.initGhost(document.getElementById('ghost'));
  ghost.show();
  ghost.setState('screensaver');

  document.addEventListener('keydown', handleStartKey);
}

function handleStartKey(e) {
  if (currentView !== 'start') return;
  
  // Handle Spacebar to scroll down to the options
  if (e.code === 'Space') {
    e.preventDefault();
    document.getElementById('view-start').scrollTo({
      top: document.getElementById('view-start').scrollHeight,
      behavior: 'smooth'
    });
    return;
  }
  
  // Require Cmd/Ctrl for the start menu shortcuts
  if (!e.metaKey && !e.ctrlKey) return;

  let actId = null;
  const key = e.key.toLowerCase();
  
  if (key === 'b') actId = 'act1';
  else if (key === 'e') actId = 'act2';
  else if (key === 'i') actId = 'act3';
  else if (key === 'o') actId = 'act4';
  
  if (actId) {
    e.preventDefault();
    document.removeEventListener('keydown', handleStartKey);
    startDisruption(actId);
  }
}

// ==========================================
// DISRUPTION TRANSITION
// ==========================================

function startDisruption(actId) {
  // Hide the real cursor immediately
  document.body.style.cursor = 'none';

  // Spawn the fake real-browser cursor drifting away
  const fakeCursor = document.getElementById('real-browser-cursor');
  fakeCursor.classList.remove('hidden');

  // Open devtools panel and challenge bar smoothly right away
  document.getElementById('devtools-panel').classList.add('is-open');
  challengeBar.classList.remove('hidden');

  // Clear logs from previous runs and inject initial boot sequence
  const devtoolsLogs = document.getElementById('devtools-logs');
  if (devtoolsLogs) {
    devtoolsLogs.innerHTML = '';
    logToConsole(null, 'ERROR: MOUSE SPOOKED.', 'error');
  }

  // Delay the ghost's descent so the user sees the log first
  setTimeout(() => {
    if (devtoolsLogs) {
      logToConsole(null, 'Ghost detection scanner active. Monitoring keystrokes...', 'info');
    }

    // Make the screensaver ghost fly straight down ONLY for Act 1
    const ghostEl = document.getElementById('ghost');
    if (actId === 1 && ghostEl && ghostEl.classList.contains('ghost--screensaver')) {
      // Get current computed position
      const rect = ghostEl.getBoundingClientRect();
      const parentRect = ghostEl.parentElement.getBoundingClientRect();
      
      // Lock it to its exact current pixel position so it doesn't snap
      ghostEl.style.left = (rect.left - parentRect.left) + 'px';
      ghostEl.style.top = (rect.top - parentRect.top) + 'px';
      ghostEl.style.transform = 'none';
      
      // Remove screensaver animation
      ghostEl.classList.remove('ghost--screensaver');
      
      // Force a reflow
      void ghostEl.offsetWidth;
      
      // Now smoothly translate it way down
      ghostEl.style.transition = 'top 2.5s ease-in-out, left 2.5s ease-in-out';
      ghostEl.style.top = (parentRect.height + 400) + 'px'; // way below screen
    }

    // After 2.5 seconds, start the game
    setTimeout(() => {
      // Hide the drifting cursor when it finishes animating
      fakeCursor.classList.add('hidden');
      window.__savedScrollTop = document.getElementById('view-start').scrollTop;
      showView('game');
      startGame(actId);
    }, 2500);
  }, 2000); // 2-second delay for mouse drift before ghost goes down
}

// ==========================================
// GAME
// ==========================================

function startGame(actId) {
  startAct(actId, onGameWin);
}

function onGameWin() {
  const stats = getStats();
  populateWinScreen(stats);
  showView('win');
  document.getElementById('devtools-panel').classList.remove('is-open');

  // Listen for restart
  document.addEventListener('keydown', handleWinKey);
}

// ==========================================
// WIN SCREEN
// ==========================================

function populateWinScreen(stats) {
  const platform = getPlatform();

  // Set win tab state
  browserUI.setTabs([{ label: 'Mission Complete', active: true, favicon: 'trophy' }]);
  browserUI.setUrl('https://ghost.browser/victory');
  browserUI.hideFindBar();

  // Time
  const seconds = Math.floor(stats.timeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById('stat-time').textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

  // Mouse attempts
  const mouseEl = document.getElementById('stat-mouse');
  mouseEl.textContent = stats.mouseAttempts > 0
    ? `${stats.mouseAttempts} times`
    : `0 — perfect!`;

  // Hints
  document.getElementById('stat-hints').textContent = stats.totalHints.toString();

  // Score
  document.getElementById('stat-score').textContent = `${stats.totalScore} / ${stats.maxScore}`;

  // Per-shortcut rows
  const container = document.getElementById('win-shortcuts');
  container.innerHTML = '';

  stats.results.forEach(result => {
    const shortcut = getShortcutById(result.shortcutId);
    if (!shortcut) return;

    const row = document.createElement('div');
    row.className = 'win-shortcut-row';
    row.innerHTML = `
      <span class="win-shortcut-keys">${shortcut.keys[platform].display}</span>
      <span class="win-shortcut-action">${shortcut.action}</span>
      <span class="win-shortcut-stars">${renderStars(result.stars)}</span>
    `;
    container.appendChild(row);
  });
}

function handleWinKey(e) {
  if (currentView !== 'win') return;
  if (e.key === 'Enter') {
    e.preventDefault();
    document.removeEventListener('keydown', handleWinKey);
    resetToStart();
  }
}

// ==========================================
// RESET
// ==========================================

function resetToStart() {
  stopGame();
  showView('start');
  initStartScreen();
}

// ==========================================
// INIT
// ==========================================

initStartScreen();
