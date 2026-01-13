/**
 * ============================================================================
 * UNIVERSAL SAFETY CAPS
 * ============================================================================
 *
 * Modulo centrale per TUTTI i safety checks in TrainSmart.
 *
 * PROBLEMA RISOLTO:
 * I safety caps (getMaxAllowedIntensity, applySafetyCap) esistevano solo in
 * weeklySplitGenerator.ts. Se un utente passava per generateWeeklyScheduleAPI,
 * bypassava completamente i controlli di sicurezza.
 *
 * SOLUZIONE:
 * Questo modulo DEVE essere importato da QUALSIASI generatore di programmi.
 * Applica limiti basati su: level, goal, quizScore, practicalScore, discrepancy.
 *
 * @module safetyCaps
 * @version 1.0.0
 */

import type { Level } from '../types';
import { toCanonicalGoal, getGoalConfig, type CanonicalGoal } from './goalMapper';

// ============================================================================
// TYPES
// ============================================================================

export type DayType = 'heavy' | 'moderate' | 'volume';
export type DiscrepancyType = 'none' | 'minor' | 'major';

export interface SafetyContext {
  level: Level;
  goal: string;
  quizScore?: number;
  practicalScore?: number;
  discrepancyType?: DiscrepancyType;
  userAge?: number;
  hasMedicalConditions?: boolean;
}

export interface SafetyResult {
  maxAllowedIntensity: DayType;
  allowHeavyDays: boolean;
  minRIR: number;
  maxSets: number;
  warnings: string[];
  restrictions: string[];
}

export interface RIRConfig {
  heavy: number;
  moderate: number;
  volume: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * RIR minimi assoluti per livello (letteratura scientifica)
 * Basato su Zourdos et al. (2016), Hackett et al. (2012), Helms et al. (2016)
 */
export const MIN_RIR_BY_LEVEL: Record<Level, number> = {
  beginner: 3,      // Mai sotto RIR 3 - non hanno propriocezione
  intermediate: 2,  // Mai sotto RIR 2
  advanced: 1       // Può arrivare a RIR 1
};

/**
 * RIR target per combinazione level + dayType + goal
 */
export const RIR_MATRIX: Record<Level, Record<DayType, Record<string, number>>> = {
  // BEGINNER: Range conservativo RIR 3-4, NO heavy days reali
  beginner: {
    heavy: {
      strength: 3, hypertrophy: 4, toning: 4, fat_loss: 4, endurance: 4,
      sport_performance: 3, wellness: 4, motor_recovery: 4, prenatal: 4,
      postnatal: 4, disability: 4, default: 4
    },
    moderate: {
      strength: 3, hypertrophy: 4, toning: 4, fat_loss: 4, endurance: 4,
      sport_performance: 3, wellness: 4, motor_recovery: 4, prenatal: 4,
      postnatal: 4, disability: 4, default: 4
    },
    volume: {
      strength: 4, hypertrophy: 4, toning: 4, fat_loss: 4, endurance: 4,
      sport_performance: 4, wellness: 4, motor_recovery: 4, prenatal: 4,
      postnatal: 4, disability: 4, default: 4
    }
  },

  // INTERMEDIATE: DUP moderato RIR 2-4
  intermediate: {
    heavy: {
      strength: 2, hypertrophy: 2, toning: 3, fat_loss: 3, endurance: 3,
      sport_performance: 2, wellness: 3, motor_recovery: 4, prenatal: 4,
      postnatal: 3, disability: 4, default: 2
    },
    moderate: {
      strength: 2, hypertrophy: 3, toning: 3, fat_loss: 3, endurance: 3,
      sport_performance: 2, wellness: 3, motor_recovery: 4, prenatal: 4,
      postnatal: 3, disability: 4, default: 3
    },
    volume: {
      strength: 3, hypertrophy: 3, toning: 4, fat_loss: 4, endurance: 4,
      sport_performance: 3, wellness: 4, motor_recovery: 4, prenatal: 4,
      postnatal: 4, disability: 4, default: 3
    }
  },

  // ADVANCED: DUP completo RIR 1-4
  advanced: {
    heavy: {
      strength: 1, hypertrophy: 1, toning: 2, fat_loss: 2, endurance: 3,
      sport_performance: 1, wellness: 3, motor_recovery: 3, prenatal: 4,
      postnatal: 3, disability: 3, default: 1
    },
    moderate: {
      strength: 2, hypertrophy: 2, toning: 3, fat_loss: 3, endurance: 3,
      sport_performance: 2, wellness: 3, motor_recovery: 4, prenatal: 4,
      postnatal: 3, disability: 4, default: 2
    },
    volume: {
      strength: 3, hypertrophy: 3, toning: 3, fat_loss: 4, endurance: 4,
      sport_performance: 3, wellness: 4, motor_recovery: 4, prenatal: 4,
      postnatal: 4, disability: 4, default: 3
    }
  }
};

/**
 * Sets massimi per combinazione level + goal
 */
export const MAX_SETS_BY_LEVEL: Record<Level, Record<string, number>> = {
  beginner: {
    strength: 4, hypertrophy: 4, toning: 3, fat_loss: 3, endurance: 3,
    sport_performance: 4, wellness: 3, motor_recovery: 2, prenatal: 2,
    postnatal: 3, disability: 2, default: 3
  },
  intermediate: {
    strength: 5, hypertrophy: 5, toning: 4, fat_loss: 4, endurance: 4,
    sport_performance: 5, wellness: 3, motor_recovery: 3, prenatal: 2,
    postnatal: 3, disability: 2, default: 4
  },
  advanced: {
    strength: 6, hypertrophy: 6, toning: 4, fat_loss: 4, endurance: 4,
    sport_performance: 6, wellness: 4, motor_recovery: 3, prenatal: 3,
    postnatal: 4, disability: 3, default: 5
  }
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Calcola tutti i safety caps per un contesto dato
 * ENTRY POINT PRINCIPALE - usa questo per ottenere tutti i limiti
 */
export function calculateSafetyLimits(context: SafetyContext): SafetyResult {
  const { level, goal, quizScore, practicalScore, discrepancyType, userAge, hasMedicalConditions } = context;

  const canonicalGoal = toCanonicalGoal(goal);
  const goalConfig = getGoalConfig(goal);
  const warnings: string[] = [];
  const restrictions: string[] = [];

  // === Calcola intensità massima permessa ===
  let maxAllowedIntensity: DayType = 'heavy';
  let allowHeavyDays = goalConfig.allowHeavyDays;

  // Beginner: mai heavy days
  if (level === 'beginner') {
    maxAllowedIntensity = goalConfig.maxIntensityBeginner;
    allowHeavyDays = false;
    restrictions.push('Beginner: heavy days disabilitati per sicurezza');
  }

  // Goal speciali: limita sempre
  if (goalConfig.category === 'special') {
    maxAllowedIntensity = 'volume';
    allowHeavyDays = false;
    restrictions.push(`Goal ${canonicalGoal}: intensità limitata a volume`);
  }

  // Screening data: applica caps basati su discrepanza
  if (quizScore !== undefined && practicalScore !== undefined) {
    const delta = Math.abs(quizScore - practicalScore);

    if (delta > 40 || discrepancyType === 'major') {
      // Discrepanza grave: forza volume
      maxAllowedIntensity = 'volume';
      allowHeavyDays = false;
      warnings.push(`Discrepanza screening ${delta}%: limitato a volume per sicurezza`);
    } else if (delta > 25 || discrepancyType === 'minor') {
      // Discrepanza media: limita a moderate
      if (maxAllowedIntensity === 'heavy') {
        maxAllowedIntensity = 'moderate';
      }
      allowHeavyDays = false;
      warnings.push(`Discrepanza screening ${delta}%: limitato a moderate`);
    }

    // Quiz score basso: limita
    if (quizScore < 40) {
      maxAllowedIntensity = 'volume';
      allowHeavyDays = false;
      warnings.push(`Quiz score ${quizScore}/100: conoscenza teorica insufficiente`);
    } else if (quizScore < 60) {
      if (maxAllowedIntensity === 'heavy') {
        maxAllowedIntensity = 'moderate';
      }
      warnings.push(`Quiz score ${quizScore}/100: limita a moderate`);
    }
  }

  // Età avanzata: cautela extra
  if (userAge && userAge > 60) {
    if (maxAllowedIntensity === 'heavy') {
      maxAllowedIntensity = 'moderate';
    }
    warnings.push(`Età ${userAge}: cautela extra raccomandata`);
  }

  // Condizioni mediche: forza cautela
  if (hasMedicalConditions) {
    maxAllowedIntensity = 'volume';
    allowHeavyDays = false;
    restrictions.push('Condizioni mediche segnalate: limitato a volume');
  }

  // === Calcola RIR minimo ===
  const minRIR = MIN_RIR_BY_LEVEL[level];

  // === Calcola sets massimi ===
  const maxSetsConfig = MAX_SETS_BY_LEVEL[level];
  const maxSets = maxSetsConfig[canonicalGoal] || maxSetsConfig.default;

  // Log per debugging
  console.log(`[SafetyCaps] Context: level=${level}, goal=${canonicalGoal}`);
  console.log(`[SafetyCaps] Result: maxIntensity=${maxAllowedIntensity}, allowHeavy=${allowHeavyDays}, minRIR=${minRIR}, maxSets=${maxSets}`);
  if (warnings.length > 0) console.warn('[SafetyCaps] Warnings:', warnings);
  if (restrictions.length > 0) console.warn('[SafetyCaps] Restrictions:', restrictions);

  return {
    maxAllowedIntensity,
    allowHeavyDays,
    minRIR,
    maxSets,
    warnings,
    restrictions
  };
}

/**
 * Applica safety cap a un dayType
 * Se dayType richiesto è più intenso del permesso, lo riduce
 */
export function applySafetyCap(
  requestedDayType: DayType,
  context: SafetyContext
): DayType {
  const safety = calculateSafetyLimits(context);
  return applySafetyCapSimple(requestedDayType, safety.maxAllowedIntensity);
}

/**
 * Applica safety cap direttamente (versione semplificata)
 */
export function applySafetyCapSimple(
  requestedDayType: DayType,
  maxAllowed: DayType
): DayType {
  const intensityOrder: DayType[] = ['volume', 'moderate', 'heavy'];
  const requestedIndex = intensityOrder.indexOf(requestedDayType);
  const maxIndex = intensityOrder.indexOf(maxAllowed);

  if (requestedIndex > maxIndex) {
    console.log(`[SafetyCap] Capped ${requestedDayType} → ${maxAllowed}`);
    return maxAllowed;
  }

  return requestedDayType;
}

/**
 * Ottieni il RIR target per una combinazione specifica
 */
export function getTargetRIR(
  dayType: DayType,
  goal: string,
  level: Level
): number {
  const canonicalGoal = toCanonicalGoal(goal);
  const matrix = RIR_MATRIX[level];
  const dayTypeConfig = matrix[dayType];

  // Cerca goal specifico o usa default
  const targetRIR = dayTypeConfig[canonicalGoal] ?? dayTypeConfig.default;

  // Applica minimo assoluto per livello
  const minRIR = MIN_RIR_BY_LEVEL[level];
  const finalRIR = Math.max(targetRIR, minRIR);

  if (finalRIR !== targetRIR) {
    console.log(`[SafetyCaps] RIR adjusted: ${targetRIR} → ${finalRIR} (min for ${level})`);
  }

  return finalRIR;
}

/**
 * Ottieni i parametri RIR per tutti i dayTypes
 */
export function getRIRConfig(
  goal: string,
  level: Level
): RIRConfig {
  return {
    heavy: getTargetRIR('heavy', goal, level),
    moderate: getTargetRIR('moderate', goal, level),
    volume: getTargetRIR('volume', goal, level)
  };
}

/**
 * Ottieni sets massimi per goal e livello
 */
export function getMaxSets(
  goal: string,
  level: Level
): number {
  const canonicalGoal = toCanonicalGoal(goal);
  const config = MAX_SETS_BY_LEVEL[level];
  return config[canonicalGoal] ?? config.default;
}

/**
 * Verifica se un utente può accedere a intensità elevate
 */
export function canAccessIntensity(
  requestedIntensity: DayType,
  context: SafetyContext
): boolean {
  const safety = calculateSafetyLimits(context);
  const intensityOrder: DayType[] = ['volume', 'moderate', 'heavy'];
  const requestedIndex = intensityOrder.indexOf(requestedIntensity);
  const maxIndex = intensityOrder.indexOf(safety.maxAllowedIntensity);

  return requestedIndex <= maxIndex;
}

/**
 * Determina il day type appropriato basandosi su level e goal
 * Utilizzato per DUP - assegna il dayType corretto a ciascun giorno
 */
export function determineDayType(
  dayIndex: number,
  totalDays: number,
  context: SafetyContext
): DayType {
  const safety = calculateSafetyLimits(context);
  const goalConfig = getGoalConfig(context.goal);
  const dupBias = goalConfig.dupBias;

  // Se non può accedere a heavy, usa solo moderate/volume
  if (!safety.allowHeavyDays) {
    // Alterna tra moderate e volume
    return dayIndex % 2 === 0 ? 'moderate' : 'volume';
  }

  // DUP completo: distribuisci basandosi su bias
  const dayTypes: DayType[] = [];
  const heavyDays = Math.round(totalDays * dupBias.heavy);
  const moderateDays = Math.round(totalDays * dupBias.moderate);
  // volumeDays = remaining

  for (let i = 0; i < heavyDays; i++) dayTypes.push('heavy');
  for (let i = 0; i < moderateDays; i++) dayTypes.push('moderate');
  while (dayTypes.length < totalDays) dayTypes.push('volume');

  // Shuffle per evitare pattern prevedibili
  const shuffled = [...dayTypes].sort(() => Math.random() - 0.5);

  return applySafetyCapSimple(shuffled[dayIndex] || 'moderate', safety.maxAllowedIntensity);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formatta un report dei safety limits per logging/UI
 */
export function formatSafetyReport(result: SafetyResult): string {
  const lines = [
    '=== SAFETY REPORT ===',
    `Max Intensity: ${result.maxAllowedIntensity}`,
    `Heavy Days: ${result.allowHeavyDays ? 'Allowed' : 'Blocked'}`,
    `Min RIR: ${result.minRIR}`,
    `Max Sets: ${result.maxSets}`
  ];

  if (result.warnings.length > 0) {
    lines.push('', 'Warnings:');
    result.warnings.forEach(w => lines.push(`  - ${w}`));
  }

  if (result.restrictions.length > 0) {
    lines.push('', 'Restrictions:');
    result.restrictions.forEach(r => lines.push(`  - ${r}`));
  }

  lines.push('=====================');
  return lines.join('\n');
}

/**
 * Crea un contesto di sicurezza da dati di onboarding/screening
 */
export function createSafetyContext(
  level: Level,
  goal: string,
  screeningData?: {
    quizScore?: number;
    practicalScore?: number;
    physicalScore?: number;
    finalScore?: number;
  },
  userData?: {
    age?: number;
    hasMedicalConditions?: boolean;
  }
): SafetyContext {
  let discrepancyType: DiscrepancyType = 'none';

  if (screeningData?.quizScore !== undefined && screeningData?.practicalScore !== undefined) {
    const delta = Math.abs(screeningData.quizScore - screeningData.practicalScore);
    if (delta > 40) discrepancyType = 'major';
    else if (delta > 25) discrepancyType = 'minor';
  }

  return {
    level,
    goal,
    quizScore: screeningData?.quizScore,
    practicalScore: screeningData?.practicalScore,
    discrepancyType,
    userAge: userData?.age,
    hasMedicalConditions: userData?.hasMedicalConditions
  };
}

/**
 * Calcola l'intensità massima basandosi su goal e level
 * Versione legacy per backward compatibility
 */
export function getMaxAllowedIntensity(
  goal: string,
  level: string,
  quizScore?: number,
  discrepancyType?: string
): DayType {
  const context: SafetyContext = {
    level: level as Level,
    goal: toCanonicalGoal(goal),
    quizScore,
    discrepancyType: discrepancyType as DiscrepancyType
  };

  const limits = calculateSafetyLimits(context);
  return limits.maxAllowedIntensity;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  calculateSafetyLimits,
  applySafetyCap,
  applySafetyCapSimple,
  getTargetRIR,
  getRIRConfig,
  getMaxSets,
  canAccessIntensity,
  determineDayType,
  formatSafetyReport,
  createSafetyContext,
  getMaxAllowedIntensity,
  // Constants
  MIN_RIR_BY_LEVEL,
  RIR_MATRIX,
  MAX_SETS_BY_LEVEL
};
