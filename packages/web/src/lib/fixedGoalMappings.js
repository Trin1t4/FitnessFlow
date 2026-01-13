/**
 * ============================================================================
 * DEPRECATED - USE @trainsmart/shared goalMapper INSTEAD
 * ============================================================================
 *
 * This file is kept for backward compatibility only.
 * Use the unified goalMapper from @trainsmart/shared instead.
 *
 * @deprecated Use @trainsmart/shared goalMapper instead
 */

// Import dynamically since this is a JS file and shared might be TS
const GOAL_MAP = {
  'forza': 'strength',
  'massa': 'muscle_gain',
  'ipertrofia': 'muscle_gain',
  'tonificazione': 'muscle_gain',
  'definizione': 'fat_loss',
  'dimagrimento': 'fat_loss',
  'resistenza': 'endurance',
  'muscle_gain': 'muscle_gain',
  'fat_loss': 'fat_loss',
  'strength': 'strength',
  'endurance': 'endurance'
};

function mapGoal(goal) {
  if (!goal) return 'muscle_gain';
  const mapped = GOAL_MAP[goal.toLowerCase()] || 'muscle_gain';
  console.warn(`[DEPRECATED] fixedGoalMappings.js mapGoal() is deprecated. Use toProgramGoal() from @trainsmart/shared. ${goal} → ${mapped}`);
  return mapped;
}

console.warn('[DEPRECATED] fixedGoalMappings.js is deprecated. Use @trainsmart/shared goalMapper instead.');

module.exports = { GOAL_MAP, mapGoal };
export { GOAL_MAP, mapGoal };
