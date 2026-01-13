/**
 * ============================================================================
 * DEPRECATED - USE @trainsmart/shared goalMapper INSTEAD
 * ============================================================================
 *
 * This file is kept for backward compatibility only.
 * All exports redirect to the unified goalMapper in @trainsmart/shared.
 *
 * Migration guide:
 * - GOAL_MAPPING -> use toProgramGoal() from @trainsmart/shared
 * - mapGoal() -> use toProgramGoal() from @trainsmart/shared
 *
 * @deprecated Use @trainsmart/shared goalMapper instead
 */

import {
  toProgramGoal,
  toCanonicalGoal,
  GOAL_CONFIGS
} from '@trainsmart/shared';

/**
 * @deprecated Use toProgramGoal from @trainsmart/shared
 */
export const GOAL_MAPPING: Record<string, string> = {
  'forza': 'strength',
  'ipertrofia': 'muscle_gain',
  'tonificazione': 'muscle_gain',
  'dimagrimento': 'fat_loss',
  'prestazioni_sportive': 'performance',
  'benessere': 'muscle_gain',
  'resistenza': 'endurance',
  'motor_recovery': 'motor_recovery',
  'gravidanza': 'pregnancy',
  'disabilita': 'disability'
};

export const SPORT_MAPPING: Record<string, string> = {
  'calcio': 'calcio',
  'basket': 'basket',
  'pallavolo': 'pallavolo',
  'rugby': 'rugby',
  'tennis': 'tennis',
  'corsa': 'running',
  'nuoto': 'swimming',
  'ciclismo': 'cycling',
  'crossfit': 'crossfit',
  'powerlifting': 'powerlifting',
  'altro': 'other'
};

/**
 * @deprecated Use toProgramGoal from @trainsmart/shared
 */
export function mapSportRole(sport?: string, role?: string) {
  if (!sport || !role) return undefined;

  return {
    sport: SPORT_MAPPING[sport] || sport,
    role: role.toLowerCase()
  };
}

/**
 * @deprecated Use toProgramGoal from @trainsmart/shared
 */
export function mapGoal(goal: string): string {
  console.warn('[DEPRECATED] mapGoal() from goalMappings.ts is deprecated. Use toProgramGoal() from @trainsmart/shared instead.');
  return toProgramGoal(goal);
}

console.warn('[DEPRECATED] goalMappings.ts is deprecated. Use @trainsmart/shared goalMapper instead.');
