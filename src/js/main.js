/**
 * main.js — Entry point
 *
 * Handles screen transitions inside the persistent browser:
 *   Start View → Disruption Overlay → Game View → Win View
 *
 * Keyboard-only navigation between screens.
 */

import { startAct1, stopGame, getStats } from './game.js';
import { getPlatform, getShortcutById } from '../data/shortcuts.js';
import { renderStars } from './scoring.js';
import * as browserUI from './browser-ui.js';

// ==========================================
// VIEWS & OVERLAYS
// ==========================================

const views = {
  start: document.getElementById('view-start'),
  disruption: document.getElementById('view-disruption'),
  game: document.getElementById('view-game'),
  win: document.getElementById('view-win'),
};
const challengeBar = document.getElementById('challenge-bar');
const ghostEl = document.getElementById('ghost');

let currentView = 'start';

function showView(name) {
  // Hide cursor during gameplay/disruption
  document.body.style.cursor = (name === 'game' || name === 'disruption') ? 'none' : 'default';

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
  document.addEventListener('keydown', handleStartKey);
}

function handleStartKey(e) {
  if (currentView !== 'start') return;
  if (e.key === 'Enter') {
    e.preventDefault();
    document.removeEventListener('keydown', handleStartKey);
    startDisruption();
  }
}

// ==========================================
// DISRUPTION TRANSITION
// ==========================================

function startDisruption() {
  showView('disruption');

  // After 2 seconds, start the game
  setTimeout(() => {
    showView('game');
    startGame();
  }, 2000);
}

// ==========================================
// GAME
// ==========================================

function startGame() {
  startAct1(onGameWin);
}

function onGameWin() {
  const stats = getStats();
  populateWinScreen(stats);
  showView('win');

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

  // Time
  const seconds = Math.floor(stats.timeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById('stat-time').textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

  // Mouse attempts
  const mouseEl = document.getElementById('stat-mouse');
  mouseEl.textContent = stats.mouseAttempts > 0
    ? `${stats.mouseAttempts} times 😅`
    : `0 — perfect! 🎯`;

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
