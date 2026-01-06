/**
 * Goal Mapper - Standardizzazione degli obiettivi
 *
 * Gestisce:
 * - Conversione tra goal canonici (inglese) e database (italiano)
 * - Configurazione parametri per ogni goal (reps, rest, intensity)
 * - Validazione e migrazione valori legacy
 *
 * @module goalMapper
 */

import type { Goal } from '../types';

// ============================================
// TYPES
// ============================================

/**
 * Goal canonici usati internamente (in inglese per codice)
 */
export type CanonicalGoal =
  | 'strength'
  | 'hypertrophy'
  | 'toning'
  | 'fat_loss'
  | 'endurance'
  | 'sport_performance'
  | 'wellness'
  | 'motor_recovery'
  | 'prenatal'
  | 'postnatal'
  | 'disability';

/**
 * Goal per il database (in italiano per UI e persistenza)
 */
export type DatabaseGoal =
  | 'forza'
  | 'ipertrofia'
  | 'tonificazione'
  | 'dimagrimento'
  | 'resistenza'
  | 'prestazioni_sportive'
  | 'benessere'
  | 'motor_recovery'
  | 'pre_partum'
  | 'post_partum'
  | 'disabilita';

export interface GoalConfig {
  canonical: CanonicalGoal;
  database: DatabaseGoal;
  displayKey: string; // i18n key per traduzione UI
  icon: string;
  color: string;
  category: 'fitness' | 'health' | 'sport' | 'special';
  // Training parameters
  primaryRep: number;    // Rep range principale
  repRange: [number, number];
  restSeconds: [number, number];
  sets: number;
  targetRIR: number;
  intensity: number;     // % 1RM medio
  volumeMultiplier: number; // Moltiplicatore volume rispetto a ipertrofia base
}

// ============================================
// GOAL CONFIGURATIONS
// ============================================

export const GOAL_CONFIGS: Record<CanonicalGoal, GoalConfig> = {
  strength: {
    canonical: 'strength',
    database: 'forza',
    displayKey: 'goals.strength',
    icon: '💪',
    color: '#FF6B6B',
    category: 'fitness',
    primaryRep: 5,
    repRange: [3, 6],
    restSeconds: [180, 300],
    sets: 5,
    targetRIR: 2,
    intensity: 85,
    volumeMultiplier: 0.8
  },
  hypertrophy: {
    canonical: 'hypertrophy',
    database: 'ipertrofia',
    displayKey: 'goals.hypertrophy',
    icon: '🏋️',
    color: '#4ECDC4',
    category: 'fitness',
    primaryRep: 10,
    repRange: [8, 12],
    restSeconds: [60, 90],
    sets: 4,
    targetRIR: 2,
    intensity: 70,
    volumeMultiplier: 1.0
  },
  toning: {
    canonical: 'toning',
    database: 'tonificazione',
    displayKey: 'goals.toning',
    icon: '✨',
    color: '#9B59B6',
    category: 'fitness',
    primaryRep: 12,
    repRange: [12, 15],
    restSeconds: [45, 60],
    sets: 3,
    targetRIR: 3,
    intensity: 60,
    volumeMultiplier: 0.9
  },
  fat_loss: {
    canonical: 'fat_loss',
    database: 'dimagrimento',
    displayKey: 'goals.fat_loss',
    icon: '🔥',
    color: '#F39C12',
    category: 'fitness',
    primaryRep: 15,
    repRange: [12, 20],
    restSeconds: [30, 45],
    sets: 3,
    targetRIR: 2,
    intensity: 55,
    volumeMultiplier: 1.1
  },
  endurance: {
    canonical: 'endurance',
    database: 'resistenza',
    displayKey: 'goals.endurance',
    icon: '🏃',
    color: '#3498DB',
    category: 'fitness',
    primaryRep: 20,
    repRange: [15, 25],
    restSeconds: [30, 45],
    sets: 3,
    targetRIR: 3,
    intensity: 50,
    volumeMultiplier: 1.2
  },
  sport_performance: {
    canonical: 'sport_performance',
    database: 'prestazioni_sportive',
    displayKey: 'goals.sport_performance',
    icon: '🏆',
    color: '#E74C3C',
    category: 'sport',
    primaryRep: 8,
    repRange: [5, 10],
    restSeconds: [90, 180],
    sets: 4,
    targetRIR: 2,
    intensity: 75,
    volumeMultiplier: 0.9
  },
  wellness: {
    canonical: 'wellness',
    database: 'benessere',
    displayKey: 'goals.wellness',
    icon: '🧘',
    color: '#2ECC71',
    category: 'health',
    primaryRep: 12,
    repRange: [10, 15],
    restSeconds: [60, 90],
    sets: 3,
    targetRIR: 4,
    intensity: 55,
    volumeMultiplier: 0.7
  },
  motor_recovery: {
    canonical: 'motor_recovery',
    database: 'motor_recovery',
    displayKey: 'goals.motor_recovery',
    icon: '🔄',
    color: '#1ABC9C',
    category: 'special',
    primaryRep: 10,
    repRange: [8, 12],
    restSeconds: [90, 120],
    sets: 2,
    targetRIR: 4,
    intensity: 40,
    volumeMultiplier: 0.5
  },
  prenatal: {
    canonical: 'prenatal',
    database: 'pre_partum',
    displayKey: 'goals.prenatal',
    icon: '🤰',
    color: '#FFC0CB',
    category: 'special',
    primaryRep: 12,
    repRange: [10, 15],
    restSeconds: [60, 90],
    sets: 2,
    targetRIR: 4,
    intensity: 50,
    volumeMultiplier: 0.6
  },
  postnatal: {
    canonical: 'postnatal',
    database: 'post_partum',
    displayKey: 'goals.postnatal',
    icon: '👶',
    color: '#87CEEB',
    category: 'special',
    primaryRep: 12,
    repRange: [10, 15],
    restSeconds: [60, 90],
    sets: 3,
    targetRIR: 3,
    intensity: 55,
    volumeMultiplier: 0.7
  },
  disability: {
    canonical: 'disability',
    database: 'disabilita',
    displayKey: 'goals.disability',
    icon: '♿',
    color: '#5DADE2',
    category: 'special',
    primaryRep: 10,
    repRange: [8, 12],
    restSeconds: [90, 120],
    sets: 2,
    targetRIR: 4,
    intensity: 45,
    volumeMultiplier: 0.5
  }
};

// ============================================
// MAPPING TABLES
// ============================================

/**
 * Mappa valori legacy/varianti al goal canonico
 */
const GOAL_ALIASES: Record<string, CanonicalGoal> = {
  // Italiano -> Canonical
  'forza': 'strength',
  'ipertrofia': 'hypertrophy',
  'massa': 'hypertrophy',
  'massa muscolare': 'hypertrophy',
  'tonificazione': 'toning',
  'dimagrimento': 'fat_loss',
  'resistenza': 'endurance',
  'prestazioni_sportive': 'sport_performance',
  'benessere': 'wellness',
  'motor_recovery': 'motor_recovery',
  'pre_partum': 'prenatal',
  'post_partum': 'postnatal',
  'disabilita': 'disability',

  // English variants
  'strength': 'strength',
  'hypertrophy': 'hypertrophy',
  'muscle_mass': 'hypertrophy',
  'toning': 'toning',
  'fat_loss': 'fat_loss',
  'weight_loss': 'fat_loss',
  'endurance': 'endurance',
  'general_fitness': 'endurance',
  'sport_performance': 'sport_performance',
  'wellness': 'wellness',
  'prenatal': 'prenatal',
  'postnatal': 'postnatal',
  'disability': 'disability'
};

// ============================================
// CONVERSION FUNCTIONS
// ============================================

/**
 * Converte qualsiasi valore goal al formato canonico (interno)
 */
export function toCanonicalGoal(goal: string | Goal): CanonicalGoal {
  const normalized = goal.toLowerCase().trim();
  return GOAL_ALIASES[normalized] || 'hypertrophy'; // Default
}

/**
 * Converte al formato database (italiano)
 */
export function toDatabaseGoal(goal: string | Goal): DatabaseGoal {
  const canonical = toCanonicalGoal(goal);
  return GOAL_CONFIGS[canonical].database;
}

/**
 * Ottieni configurazione completa per un goal
 */
export function getGoalConfig(goal: string | Goal): GoalConfig {
  const canonical = toCanonicalGoal(goal);
  return GOAL_CONFIGS[canonical];
}

// ============================================
// VALIDATION
// ============================================

/**
 * Verifica se un valore e un goal valido
 */
export function isValidGoal(goal: string): boolean {
  const normalized = goal.toLowerCase().trim();
  return normalized in GOAL_ALIASES;
}

/**
 * Ottieni tutti i valori goal validi
 */
export function getAllValidGoals(): string[] {
  return Object.keys(GOAL_ALIASES);
}

/**
 * Ottieni solo i goal canonici
 */
export function getCanonicalGoals(): CanonicalGoal[] {
  return Object.keys(GOAL_CONFIGS) as CanonicalGoal[];
}

/**
 * Ottieni goal per categoria
 */
export function getGoalsByCategory(category: GoalConfig['category']): GoalConfig[] {
  return Object.values(GOAL_CONFIGS).filter(g => g.category === category);
}

// ============================================
// TRAINING PARAMETER HELPERS
// ============================================

/**
 * Ottieni rep range per un goal
 */
export function getRepRangeForGoal(goal: string | Goal): [number, number] {
  return getGoalConfig(goal).repRange;
}

/**
 * Ottieni tempo di rest per un goal
 */
export function getRestTimeForGoal(goal: string | Goal): string {
  const [min, max] = getGoalConfig(goal).restSeconds;
  if (min === max) return `${min}s`;
  if (max >= 180) return `${Math.round(min / 60)}-${Math.round(max / 60)}min`;
  return `${min}-${max}s`;
}

/**
 * Ottieni numero di set per un goal
 */
export function getSetsForGoal(goal: string | Goal): number {
  return getGoalConfig(goal).sets;
}

/**
 * Ottieni RIR target per un goal
 */
export function getRIRForGoal(goal: string | Goal): number {
  return getGoalConfig(goal).targetRIR;
}

/**
 * Ottieni intensita % per un goal
 */
export function getIntensityForGoal(goal: string | Goal): number {
  return getGoalConfig(goal).intensity;
}

/**
 * Ottieni raccomandazione volume settimanale
 */
export function getVolumeRecommendation(goal: string | Goal, level: string): {
  setsPerMuscle: number;
  totalWeeklySets: number;
} {
  const config = getGoalConfig(goal);

  // Base sets per muscle group per week
  const baseSets = level === 'beginner' ? 10 : level === 'intermediate' ? 15 : 20;
  const adjustedSets = Math.round(baseSets * config.volumeMultiplier);

  return {
    setsPerMuscle: adjustedSets,
    totalWeeklySets: adjustedSets * 6 // ~6 major muscle groups
  };
}

// ============================================
// MIGRATION
// ============================================

/**
 * Migra un valore goal legacy al formato corretto
 */
export function migrateGoalValue(oldValue: string): {
  canonical: CanonicalGoal;
  database: DatabaseGoal;
  wasLegacy: boolean;
} {
  const normalized = oldValue.toLowerCase().trim();
  const canonical = toCanonicalGoal(oldValue);
  const database = toDatabaseGoal(oldValue);

  // Check if it was a legacy value
  const wasLegacy = !Object.values(GOAL_CONFIGS).some(
    c => c.canonical === normalized || c.database === normalized
  );

  return { canonical, database, wasLegacy };
}
