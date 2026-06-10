/**
 * ghost.js — Ghost movement and animation state management
 *
 * The ghost is a DOM element positioned absolutely within the fake browser.
 * This module handles moving it to browser elements and toggling animation states.
 */

const ANIMATION_STATES = ['idle', 'hit', 'flee', 'taunt', 'panic', 'captured', 'hidden', 'screensaver'];

let ghostEl = null;

/**
 * Initialize the ghost module with the ghost DOM element.
 * @param {HTMLElement} element
 */
export function initGhost(element) {
  ghostEl = element;
}

export function resetGhostStyles() {
  if (ghostEl) {
    ghostEl.style.top = '';
    ghostEl.style.left = '';
    ghostEl.style.opacity = '';
    ghostEl.style.zIndex = '';
    ghostEl.style.transform = '';
    ghostEl.style.transition = '';
    ghostEl.classList.remove('ghost-shiver-intense', 'incognito-shiver');
  }
  setState('hidden');
}

/**
 * Show the ghost and set to idle.
 */
export function show() {
  if (!ghostEl) return;
  ghostEl.classList.remove('hidden');
  setState('idle');
}

/**
 * Hide the ghost.
 */
export function hide() {
  setState('hidden');
}

/**
 * Set the ghost's animation state.
 * @param {'idle'|'hit'|'flee'|'taunt'|'panic'|'captured'|'hidden'} state
 */
export function setState(state) {
  if (!ghostEl) return;

  // Remove all state classes
  ANIMATION_STATES.forEach(s => {
    ghostEl.classList.remove(`ghost--${s}`);
  });

  // Apply new state
  ghostEl.classList.add(`ghost--${state}`);
  ghostEl.style.transition = ''; // Clean up any inline overrides
}

/**
 * Move the ghost to a position relative to a target element.
 * The ghost is positioned absolutely within the fake browser container.
 *
 * @param {HTMLElement} targetEl - The element to position near
 * @param {'on'|'inside'|'below'} position - Where relative to the target
 */
export function moveTo(targetEl, position = 'on') {
  if (!ghostEl || !targetEl) return;

  const browserEl = ghostEl.parentElement;
  const browserRect = browserEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  let top, left;

  switch (position) {
    case 'on':
      // Center on top of the element
      const ghostH = ghostEl.offsetHeight || 36;
      const ghostW = ghostEl.offsetWidth || 36;
      top = targetRect.top - browserRect.top + (targetRect.height / 2) - (ghostH / 2);
      left = targetRect.left - browserRect.left + (targetRect.width / 2) - (ghostW / 2);
      break;

    case 'inside':
      // Inside the element, offset slightly from center
      const ghostHInside = ghostEl.offsetHeight || 36;
      top = targetRect.top - browserRect.top + (targetRect.height / 2) - (ghostHInside / 2);
      left = targetRect.left - browserRect.left + (targetRect.width * 0.6);
      break;

    case 'left-inside':
      // Inside the element, but hugging the left edge (like an icon)
      const ghostHLeft = ghostEl.offsetHeight || 36;
      top = targetRect.top - browserRect.top + (targetRect.height / 2) - (ghostHLeft / 2);
      left = targetRect.left - browserRect.left + 12;
      break;

    case 'below':
      // Below the visible area of the content
      const ghostWBelow = ghostEl.offsetWidth || 36;
      top = targetRect.bottom - browserRect.top + 40;
      left = targetRect.left - browserRect.left + (targetRect.width / 2) - (ghostWBelow / 2);
      break;

    default:
      top = targetRect.top - browserRect.top;
      left = targetRect.left - browserRect.left;
  }

  ghostEl.style.top = `${top}px`;
  ghostEl.style.left = `${left}px`;
}

/**
 * Move the ghost to absolute pixel coordinates within the browser.
 * @param {number} top
 * @param {number} left
 */
export function moveToPosition(top, left) {
  if (!ghostEl) return;
  ghostEl.style.top = `${top}px`;
  ghostEl.style.left = `${left}px`;
}

/**
 * Play the hit animation, then resolve.
 * @returns {Promise<void>}
 */
export function playHit() {
  return new Promise(resolve => {
    setState('hit');
    setTimeout(() => {
      setState('idle');
      resolve();
    }, 400);
  });
}

/**
 * Play the taunt animation, then resolve.
 * @returns {Promise<void>}
 */
export function playTaunt() {
  return new Promise(resolve => {
    setState('taunt');
    setTimeout(() => {
      setState('idle');
      resolve();
    }, 300);
  });
}

/**
 * Play captured animation (shrink and disappear).
 * @returns {Promise<void>}
 */
export function playCaptured() {
  return new Promise(resolve => {
    setState('captured');
    setTimeout(resolve, 800);
  });
}
