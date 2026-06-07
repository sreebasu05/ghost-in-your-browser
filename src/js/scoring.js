/**
 * scoring.js — Score calculation
 */

const SCORING = {
  BASE: 100,
  FIRST_TRY_BONUS: 50,
  SPEED_BONUS_3S: 25,
  SPEED_BONUS_5S: 10,
  WRONG_ATTEMPT_PENALTY: 10,
  HINT_1_PENALTY: 15,
  HINT_2_PENALTY: 20,
  HINT_3_PENALTY: 30,
  MIN_SCORE: 10,
};

/**
 * Calculate numeric score for a single level.
 * @param {number} timeMs - Time taken in milliseconds
 * @param {number} wrongAttempts - Number of wrong key presses
 * @param {number} hintsUsed - Number of hints revealed (0-3)
 * @returns {number}
 */
export function calculateScore(timeMs, wrongAttempts, hintsUsed) {
  let score = SCORING.BASE;

  // First-try bonus
  if (wrongAttempts === 0 && hintsUsed === 0) {
    score += SCORING.FIRST_TRY_BONUS;
  }

  // Speed bonus
  if (timeMs < 3000) {
    score += SCORING.SPEED_BONUS_3S;
  } else if (timeMs < 5000) {
    score += SCORING.SPEED_BONUS_5S;
  }

  // Penalties
  score -= wrongAttempts * SCORING.WRONG_ATTEMPT_PENALTY;

  if (hintsUsed >= 1) score -= SCORING.HINT_1_PENALTY;
  if (hintsUsed >= 2) score -= SCORING.HINT_2_PENALTY;
  if (hintsUsed >= 3) score -= SCORING.HINT_3_PENALTY;

  return Math.max(score, SCORING.MIN_SCORE);
}

/**
 * Calculate star rating for a single level.
 * @param {number} wrongAttempts
 * @param {number} hintsUsed
 * @returns {number} 1-3 stars
 */
export function calculateStars(wrongAttempts, hintsUsed) {
  if (wrongAttempts === 0 && hintsUsed === 0) return 3;
  if (wrongAttempts <= 2 && hintsUsed <= 1) return 2;
  return 1;
}

/**
 * Render stars as a string.
 * @param {number} stars - 1, 2, or 3
 * @returns {string}
 */
export function renderStars(stars) {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars);
}
