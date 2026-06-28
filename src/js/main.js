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
  
  // Initialize and run the background diagnostic binary/hex log stream
  initDiagnosticStream();

  // Start ghost screensaver
  ghost.initGhost(document.getElementById('ghost'));
  ghost.resetGhostStyles();
  ghost.show();
  ghost.setState('screensaver');

  updateActLockStates();
  checkMobileUserAgent();

  document.addEventListener('keydown', handleStartKey);

  // Click handler to scroll down from Page 1 to Page 2
  const startPrompt = document.querySelector('.start-prompt');
  if (startPrompt) {
    startPrompt.style.cursor = 'pointer';
    startPrompt.onclick = () => {
      if (currentView !== 'start') return;
      const page2 = document.getElementById('start-page-2');
      if (page2) {
        document.getElementById('view-start').scrollTo({
          top: page2.offsetTop,
          behavior: 'smooth'
        });
      }
    };
  }

  // Click handlers for Act Cards
  document.querySelectorAll('.act-box').forEach(box => {
    const act = box.getAttribute('data-act');
    box.onclick = () => {
      if (currentView !== 'start') return;

      const actNum = act;
      let isLocked = false;
      if (actNum !== '1') {
        const prevActNum = parseInt(actNum, 10) - 1;
        const isPrevActCompleted = localStorage.getItem(`ghost-game-act${prevActNum}-completed`) === 'true';
        if (!isPrevActCompleted) {
          isLocked = true;
        }
      }

      if (isLocked) {
        box.classList.add('screen-shake');
        setTimeout(() => box.classList.remove('screen-shake'), 150);
        return;
      }

      document.removeEventListener('keydown', handleStartKey);
      startDisruption('act' + act);
    };
  });
}

function checkMobileUserAgent() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                   || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  if (isMobile) {
    const guidelinesText = document.querySelector('.guidelines-text');
    if (guidelinesText) {
      guidelinesText.innerHTML = '<strong>This game requires a keyboard.</strong> Please open this page on a desktop computer to play.';
    }
    
    // Hide operations header and acts grid
    const label = document.querySelector('.act-menu-label');
    const grid = document.querySelector('.act-grid');
    if (label) label.style.display = 'none';
    if (grid) grid.style.display = 'none';
  }
}

const actShortcuts = {
  '1': '<span class="instruction-press">Press</span> <kbd>⌘</kbd> + <kbd>B</kbd>',
  '2': '<span class="instruction-press">Press</span> <kbd>⌘</kbd> + <kbd>E</kbd>',
  '3': '<span class="instruction-press">Press</span> <kbd>⌘</kbd> + <kbd>I</kbd>',
  '4': '<span class="instruction-press">Press</span> <kbd>⌘</kbd> + <kbd>O</kbd>'
};

function updateActLockStates() {
  const isAct1Completed = localStorage.getItem('ghost-game-act1-completed') === 'true';
  document.querySelectorAll('.act-box').forEach(box => {
    const act = box.getAttribute('data-act');
    box.classList.remove('locked', 'completed');

    // Add checkmarks and completed styling to completed acts
    const isCompleted = localStorage.getItem(`ghost-game-act${act}-completed`) === 'true';
    const statsContainer = document.getElementById(`act-${act}-stats`);
    const instructionEl = box.querySelector('.start-instruction');

    if (isCompleted) {
      box.classList.add('completed');
      const titleSpan = box.querySelector('.act-box-title');
      if (titleSpan && !titleSpan.textContent.endsWith(' ✓')) {
        titleSpan.textContent = titleSpan.textContent.replace(' ✓', '') + ' ✓';
      }

      // Populate best stats on the right side
      const bestTimeRaw = localStorage.getItem(`ghost-game-act${act}-best-time`);
      const bestScoreRaw = localStorage.getItem(`ghost-game-act${act}-best-score`);
      if (statsContainer) {
        const timeMs = bestTimeRaw ? parseInt(bestTimeRaw, 10) : null;
        let formattedTime = '--:--';
        if (timeMs !== null) {
          const seconds = Math.floor(timeMs / 1000);
          const minutes = Math.floor(seconds / 60);
          const secs = seconds % 60;
          formattedTime = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
        const formattedScore = bestScoreRaw !== null ? bestScoreRaw : '--';
        
        statsContainer.innerHTML = `
          <div class="act-stat-item">
            <span class="act-stat-label">Best Time</span>
            <span class="act-stat-val">${formattedTime}</span>
          </div>
          <div class="act-stat-item">
            <span class="act-stat-label">Best Score</span>
            <span class="act-stat-val">${formattedScore}</span>
          </div>
        `;
      }
    } else {
      if (statsContainer) {
        statsContainer.innerHTML = '';
      }
    }

    // Sequential Locking Logic: Unlocks only if previous act is completed
    let isLocked = false;
    if (act !== '1') {
      const prevActNum = parseInt(act, 10) - 1;
      const isPrevActCompleted = localStorage.getItem(`ghost-game-act${prevActNum}-completed`) === 'true';
      if (!isPrevActCompleted) {
        isLocked = true;
      }
    }

    if (isLocked) {
      box.classList.add('locked');
      box.style.cursor = 'not-allowed';
      if (instructionEl) {
        instructionEl.innerHTML = 'Locked';
      }
    } else {
      box.style.cursor = 'pointer';
      if (instructionEl) {
        instructionEl.innerHTML = actShortcuts[act];
      }
    }
  });
}

function handleStartKey(e) {
  if (currentView !== 'start') return;
  
  // Handle Spacebar to scroll down to the options
  if (e.code === 'Space') {
    e.preventDefault();
    const page2 = document.getElementById('start-page-2');
    if (page2) {
      document.getElementById('view-start').scrollTo({
        top: page2.offsetTop,
        behavior: 'smooth'
      });
    }
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
    // Block selection if targeted act is locked
    const actNum = actId.replace('act', '');
    let isLocked = false;
    if (actNum !== '1') {
      const prevActNum = parseInt(actNum, 10) - 1;
      const isPrevActCompleted = localStorage.getItem(`ghost-game-act${prevActNum}-completed`) === 'true';
      if (!isPrevActCompleted) {
        isLocked = true;
      }
    }

    if (isLocked) {
      return;
    }
    e.preventDefault();
    document.removeEventListener('keydown', handleStartKey);
    startDisruption(actId);
  }
}

// ==========================================
// DISRUPTION TRANSITION
// ==========================================

function startDisruption(actId) {
  // Set transition flag
  window.__isActTransition = true;

  // Hide the real cursor immediately
  document.body.style.cursor = 'none';

  // Spawn the fake real-browser cursor drifting away
  const fakeCursor = document.getElementById('real-browser-cursor');
  fakeCursor.classList.remove('hidden');

  // Show the disconnected mouse badge
  const mouseBadge = document.getElementById('real-mouse-badge');
  if (mouseBadge) {
    mouseBadge.classList.remove('hidden');
  }

  // Open devtools panel and challenge bar smoothly right away
  document.getElementById('devtools-panel').classList.add('is-open');
  challengeBar.classList.remove('hidden');

  // Clear logs from previous runs and inject initial boot sequence
  const devtoolsLogs = document.getElementById('devtools-logs');
  if (devtoolsLogs) {
    devtoolsLogs.innerHTML = '';
    logToConsole(null, 'ERROR: MOUSE DISCONNECTED', 'error');
  }

  // Freeze screensaver ghost immediately
  const ghostEl = document.getElementById('ghost');
  if (ghostEl && ghostEl.classList.contains('ghost--screensaver')) {
    const rect = ghostEl.getBoundingClientRect();
    const parentRect = ghostEl.parentElement.getBoundingClientRect();
    
    // Lock it to its exact current pixel position so it doesn't snap
    ghostEl.style.left = (rect.left - parentRect.left) + 'px';
    ghostEl.style.top = (rect.top - parentRect.top) + 'px';
    ghostEl.style.transform = 'none';
    
    // Remove screensaver animation
    ghostEl.classList.remove('ghost--screensaver');
    void ghostEl.offsetWidth; // Force reflow
  }

  // Transition view to game page immediately so content and URL are displayed under the ghost
  window.__savedScrollTop = document.getElementById('view-start').scrollTop;
  showView('game');
  startGame(actId);

  // Delay the ghost's slow descent and logs
  setTimeout(() => {
    if (devtoolsLogs) {
      logToConsole(null, 'Ghost detection scanner active. Monitoring keystrokes...', 'info');
      logToConsole(null, 'WARNING: Hostile entity hijacking rendering pipeline...', 'fail');
    }

    if (ghostEl) {
      ghostEl.style.transition = 'top 4.0s ease-in-out, left 4.0s ease-in-out';
      
      if (actId === 'act1') {
        ghostEl.style.top = '120vh'; // Translate below viewport
        logToConsole(null, 'WARNING: Entity moving below fold. Page corrupted.', 'fail');
      } else if (actId === 'act2') {
        const tab = browserUI.getTab(0);
        if (tab) {
          ghost.moveTo(tab, 'on');
        }
        logToConsole(null, 'WARNING: Entity nesting in active tab strip.', 'fail');
        
        // After tab is added at 1000ms, move the ghost to the new tab (tab index 1)
        setTimeout(() => {
          const tab1 = browserUI.getTab(1);
          if (tab1) {
            ghost.moveTo(tab1, 'on');
          }
        }, 1100);
      } else if (actId === 'act3') {
        const swipeBack = document.getElementById('swipe-back-indicator');
        if (swipeBack) {
          swipeBack.classList.add('show');
          ghost.moveTo(swipeBack, 'on');
        }
        logToConsole(null, 'WARNING: Entity retreating to previous page.', 'fail');

        // Move off-screen left after 1500ms
        setTimeout(() => {
          if (ghostEl) {
            ghostEl.style.left = '-150px';
          }
        }, 1500);
      } else if (actId === 'act4') {
        ghostEl.style.zIndex = '9'; // behind toolbar/titlebar
        ghostEl.style.top = '-400px'; // way above screen
        logToConsole(null, 'WARNING: Entity ascending to window header.', 'fail');
      }
    }

    // After 4.0 seconds, complete the transition, hide fake cursor/mouse badge and enable gameplay
    setTimeout(() => {
      fakeCursor.classList.add('hidden');
      if (mouseBadge) {
        mouseBadge.classList.add('hidden');
      }
      window.__isActTransition = false;
      
      import('./game.js').then(game => {
        game.endTransitionBlock();
      });
    }, 4000);
  }, 500);
}

// ==========================================
// GAME
// ==========================================

function startGame(actId) {
  startAct(actId, () => {
    localStorage.setItem(`ghost-game-${actId}-completed`, 'true');

    // Persist best stats to localStorage
    const stats = getStats();
    
    const prevBestTimeRaw = localStorage.getItem(`ghost-game-${actId}-best-time`);
    const prevBestTime = prevBestTimeRaw ? parseInt(prevBestTimeRaw, 10) : null;
    const currentBestTime = stats.timeMs;
    if (prevBestTime === null || isNaN(prevBestTime) || currentBestTime < prevBestTime) {
      localStorage.setItem(`ghost-game-${actId}-best-time`, currentBestTime.toString());
    }

    const prevBestScoreRaw = localStorage.getItem(`ghost-game-${actId}-best-score`);
    const prevBestScore = prevBestScoreRaw ? parseInt(prevBestScoreRaw, 10) : null;
    const currentBestScore = stats.totalScore;
    if (prevBestScore === null || isNaN(prevBestScore) || currentBestScore > prevBestScore) {
      localStorage.setItem(`ghost-game-${actId}-best-score`, currentBestScore.toString());
    }

    onGameWin();
  });
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
  mouseEl.textContent = stats.mouseAttempts > 0 ? `${stats.mouseAttempts} times` : '0';

  // Hints
  const hintsEl = document.getElementById('stat-hints');
  if (hintsEl) {
    hintsEl.textContent = stats.totalHints.toString();
  }

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
// BACKGROUND DIAGNOSTIC BINARY STREAM
// ==========================================

let streamIntervalId = null;
function initDiagnosticStream() {
  const container = document.getElementById('diag-stream-bg');
  if (!container) return;

  if (streamIntervalId) {
    clearInterval(streamIntervalId);
  }

  // Pre-fill container
  let content = '';
  const chars = '0123456789ABCDEF ';
  for (let i = 0; i < 400; i++) {
    content += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  container.textContent = content;

  // Slowly roll the stream
  streamIntervalId = setInterval(() => {
    if (currentView !== 'start') return;
    let current = container.textContent;
    let newChars = '';
    for (let i = 0; i < 8; i++) {
      newChars += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    container.textContent = (newChars + current).substring(0, 450);
  }, 150);
}

initStartScreen();

