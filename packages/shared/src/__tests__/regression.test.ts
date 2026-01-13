/**
 * ============================================================================
 * REGRESSION TESTS
 * ============================================================================
 *
 * Test di regressione per verificare che:
 * 1. Ogni goal genera parametri coerenti
 * 2. Ogni split ha giorni con esercizi diversi (DUP funziona)
 * 3. Safety caps sono applicati correttamente
 * 4. Goal mapping è consistente
 *
 * @module regression.test
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import {
  toCanonicalGoal,
  toProgramGoal,
  toDatabaseGoal,
  getGoalConfig,
  isValidGoal,
  getAllGoals,
  GOAL_CONFIGS
} from '../utils/goalMapper';
import {
  calculateSafetyLimits,
  applySafetyCap,
  applySafetyCapSimple,
  getTargetRIR,
  getRIRConfig,
  getMaxSets,
  createSafetyContext,
  type SafetyContext,
  type DayType
} from '../utils/safetyCaps';
import { generateProgramUnified, type UnifiedProgramOptions } from '../utils/unifiedProgramGenerator';
import type { Level, PatternBaselines } from '../types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const ALL_GOALS_IT = [
  'forza', 'ipertrofia', 'tonificazione', 'dimagrimento', 'resistenza',
  'prestazioni_sportive', 'benessere', 'motor_recovery', 'pre_partum',
  'post_partum', 'disabilita'
];

const ALL_LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

const SAMPLE_BASELINES: PatternBaselines = {
  lower_push: { variantId: 'squat', variantName: 'Squat', difficulty: 5, reps: 10 },
  lower_pull: { variantId: 'deadlift', variantName: 'Stacco Rumeno', difficulty: 5, reps: 10 },
  horizontal_push: { variantId: 'bench', variantName: 'Panca Piana', difficulty: 5, reps: 10 },
  vertical_push: { variantId: 'military', variantName: 'Military Press', difficulty: 5, reps: 10 },
  vertical_pull: { variantId: 'lat', variantName: 'Lat Pulldown', difficulty: 5, reps: 10 },
  core: { variantId: 'plank', variantName: 'Plank', difficulty: 3, reps: 30 }
};

// ============================================================================
// GOAL MAPPING TESTS
// ============================================================================

describe('Goal Mapping Consistency', () => {
  describe('toCanonicalGoal', () => {
    it('should map all Italian goals correctly', () => {
      expect(toCanonicalGoal('forza')).toBe('strength');
      expect(toCanonicalGoal('ipertrofia')).toBe('hypertrophy');
      expect(toCanonicalGoal('tonificazione')).toBe('toning');
      expect(toCanonicalGoal('dimagrimento')).toBe('fat_loss');
      expect(toCanonicalGoal('resistenza')).toBe('endurance');
      expect(toCanonicalGoal('prestazioni_sportive')).toBe('sport_performance');
      expect(toCanonicalGoal('benessere')).toBe('wellness');
      expect(toCanonicalGoal('motor_recovery')).toBe('motor_recovery');
      expect(toCanonicalGoal('pre_partum')).toBe('prenatal');
      expect(toCanonicalGoal('post_partum')).toBe('postnatal');
      expect(toCanonicalGoal('disabilita')).toBe('disability');
    });

    it('should map all English goals correctly', () => {
      expect(toCanonicalGoal('strength')).toBe('strength');
      expect(toCanonicalGoal('hypertrophy')).toBe('hypertrophy');
      expect(toCanonicalGoal('muscle_gain')).toBe('hypertrophy');
      expect(toCanonicalGoal('fat_loss')).toBe('fat_loss');
      expect(toCanonicalGoal('weight_loss')).toBe('fat_loss');
    });

    it('should handle case insensitivity', () => {
      expect(toCanonicalGoal('FORZA')).toBe('strength');
      expect(toCanonicalGoal('Ipertrofia')).toBe('hypertrophy');
      expect(toCanonicalGoal('FAT_LOSS')).toBe('fat_loss');
    });

    it('should default to hypertrophy for unknown goals', () => {
      expect(toCanonicalGoal('unknown_goal')).toBe('hypertrophy');
      expect(toCanonicalGoal('')).toBe('hypertrophy');
      expect(toCanonicalGoal(null as any)).toBe('hypertrophy');
    });
  });

  describe('toProgramGoal', () => {
    it('should map toning to muscle_gain (critical fix)', () => {
      // Questo era il bug: toning veniva mappato in modo inconsistente
      expect(toProgramGoal('tonificazione')).toBe('muscle_gain');
      expect(toProgramGoal('toning')).toBe('muscle_gain');
    });

    it('should map all goals to valid program goals', () => {
      const validProgramGoals = ['strength', 'muscle_gain', 'fat_loss', 'endurance',
                                  'performance', 'motor_recovery', 'pregnancy', 'disability'];

      ALL_GOALS_IT.forEach(goal => {
        const programGoal = toProgramGoal(goal);
        expect(validProgramGoals).toContain(programGoal);
      });
    });
  });

  describe('Round-trip consistency', () => {
    it('should maintain consistency through conversions', () => {
      ALL_GOALS_IT.forEach(goal => {
        const canonical = toCanonicalGoal(goal);
        const config = getGoalConfig(goal);
        const database = toDatabaseGoal(goal);
        const program = toProgramGoal(goal);

        // Il database goal dovrebbe mappare allo stesso canonical
        expect(toCanonicalGoal(database)).toBe(canonical);

        // Config dovrebbe avere tutti i campi richiesti
        expect(config.canonical).toBe(canonical);
        expect(config.database).toBe(database);
        expect(config.program).toBe(program);
      });
    });
  });
});

// ============================================================================
// SAFETY CAPS TESTS
// ============================================================================

describe('Safety Caps', () => {
  describe('calculateSafetyLimits', () => {
    it('should limit beginners to moderate or volume', () => {
      ALL_GOALS_IT.forEach(goal => {
        const context: SafetyContext = {
          level: 'beginner',
          goal
        };

        const limits = calculateSafetyLimits(context);

        // Beginners should NEVER have heavy days
        expect(limits.allowHeavyDays).toBe(false);
        expect(['moderate', 'volume']).toContain(limits.maxAllowedIntensity);
        expect(limits.minRIR).toBeGreaterThanOrEqual(3);
      });
    });

    it('should further restrict with low quiz scores', () => {
      const baseContext: SafetyContext = {
        level: 'intermediate',
        goal: 'strength',
        quizScore: 30,
        practicalScore: 80
      };

      const limits = calculateSafetyLimits(baseContext);

      // Major discrepancy + low quiz = restricted
      expect(limits.maxAllowedIntensity).toBe('volume');
      expect(limits.allowHeavyDays).toBe(false);
      expect(limits.warnings.length).toBeGreaterThan(0);
    });

    it('should restrict special goals (pregnancy, disability, recovery)', () => {
      const specialGoals = ['prenatal', 'postnatal', 'disability', 'motor_recovery'];

      specialGoals.forEach(goal => {
        ALL_LEVELS.forEach(level => {
          const context: SafetyContext = { level, goal };
          const limits = calculateSafetyLimits(context);

          expect(limits.allowHeavyDays).toBe(false);
          expect(limits.maxAllowedIntensity).toBe('volume');
        });
      });
    });
  });

  describe('applySafetyCap', () => {
    it('should cap heavy to moderate for beginners', () => {
      const context: SafetyContext = {
        level: 'beginner',
        goal: 'strength'
      };

      const result = applySafetyCap('heavy', context);
      expect(result).not.toBe('heavy');
    });

    it('should not cap if within limits', () => {
      const context: SafetyContext = {
        level: 'advanced',
        goal: 'strength'
      };

      expect(applySafetyCap('heavy', context)).toBe('heavy');
      expect(applySafetyCap('moderate', context)).toBe('moderate');
      expect(applySafetyCap('volume', context)).toBe('volume');
    });
  });

  describe('applySafetyCapSimple', () => {
    it('should correctly cap intensities', () => {
      // Heavy requested, moderate max -> moderate
      expect(applySafetyCapSimple('heavy', 'moderate')).toBe('moderate');

      // Heavy requested, volume max -> volume
      expect(applySafetyCapSimple('heavy', 'volume')).toBe('volume');

      // Moderate requested, volume max -> volume
      expect(applySafetyCapSimple('moderate', 'volume')).toBe('volume');

      // Within limits -> unchanged
      expect(applySafetyCapSimple('volume', 'heavy')).toBe('volume');
      expect(applySafetyCapSimple('moderate', 'heavy')).toBe('moderate');
    });
  });

  describe('getTargetRIR', () => {
    it('should return valid RIR for all combinations', () => {
      const dayTypes: DayType[] = ['heavy', 'moderate', 'volume'];

      ALL_LEVELS.forEach(level => {
        ALL_GOALS_IT.forEach(goal => {
          dayTypes.forEach(dayType => {
            const rir = getTargetRIR(dayType, goal, level);

            // RIR should be between 1 and 5
            expect(rir).toBeGreaterThanOrEqual(1);
            expect(rir).toBeLessThanOrEqual(5);

            // RIR should respect minimum for level
            const minRIR = level === 'beginner' ? 3 : level === 'intermediate' ? 2 : 1;
            expect(rir).toBeGreaterThanOrEqual(minRIR);
          });
        });
      });
    });

    it('should have heavy <= moderate <= volume for RIR', () => {
      const rirConfig = getRIRConfig('strength', 'advanced');

      // Heavy (più intenso) = RIR più basso
      // Volume (meno intenso) = RIR più alto
      expect(rirConfig.heavy).toBeLessThanOrEqual(rirConfig.moderate);
      expect(rirConfig.moderate).toBeLessThanOrEqual(rirConfig.volume);
    });
  });
});

// ============================================================================
// PROGRAM GENERATION TESTS
// ============================================================================

describe('Program Generation', () => {
  describe('generateProgramUnified', () => {
    it('should generate valid programs for all goal/level combinations', () => {
      const testCases = ALL_LEVELS.flatMap(level =>
        ALL_GOALS_IT.map(goal => ({ level, goal }))
      );

      testCases.forEach(({ level, goal }) => {
        const options: UnifiedProgramOptions = {
          level,
          goal,
          location: 'gym',
          frequency: 3,
          baselines: SAMPLE_BASELINES
        };

        const result = generateProgramUnified(options);

        expect(result.success).toBe(true);
        expect(result.program).toBeDefined();
        expect(result.program!.weeklySplit).toBeDefined();
        expect(result.program!.weeklySplit.days.length).toBeGreaterThan(0);
      });
    });

    it('should produce different exercises across days (DUP test)', () => {
      const options: UnifiedProgramOptions = {
        level: 'intermediate',
        goal: 'ipertrofia',
        location: 'gym',
        frequency: 4,  // Upper/Lower split
        baselines: SAMPLE_BASELINES
      };

      const result = generateProgramUnified(options);

      expect(result.success).toBe(true);

      // Ottieni pattern di esercizi per ogni giorno
      const days = result.program!.weeklySplit.days;
      const exercisePatterns = days.map((day: any) => {
        const exercises = day.exercises || [];
        return exercises.map((e: any) => `${e.name}:${e.dayType}`).sort().join('|');
      });

      // Ci dovrebbero essere pattern diversi (DUP attivo)
      const uniquePatterns = new Set(exercisePatterns);

      // Per un 4-day split, ci aspettiamo almeno 2 pattern unici
      // (Upper A/B sono diversi, Lower A/B sono diversi)
      if (days.length > 1) {
        expect(uniquePatterns.size).toBeGreaterThanOrEqual(2);
      }
    });

    it('should apply safety caps correctly', () => {
      // Beginner con goal forza non dovrebbe avere heavy days
      const options: UnifiedProgramOptions = {
        level: 'beginner',
        goal: 'forza',
        location: 'gym',
        frequency: 3,
        baselines: SAMPLE_BASELINES
      };

      const result = generateProgramUnified(options);

      expect(result.success).toBe(true);

      // Verifica che nessun esercizio abbia dayType 'heavy'
      const days = result.program!.weeklySplit.days;
      days.forEach((day: any) => {
        (day.exercises || []).forEach((exercise: any) => {
          // Beginners: dayType dovrebbe essere capped a moderate o volume
          if (exercise.dayType) {
            expect(exercise.dayType).not.toBe('heavy');
          }
        });
      });
    });

    it('should handle home bodyweight training correctly', () => {
      const options: UnifiedProgramOptions = {
        level: 'intermediate',
        goal: 'tonificazione',
        location: 'home',
        trainingType: 'bodyweight',
        frequency: 3,
        baselines: SAMPLE_BASELINES
      };

      const result = generateProgramUnified(options);

      expect(result.success).toBe(true);
    });

    it('should include medical clearance flag for special goals', () => {
      const specialGoals = ['motor_recovery', 'pre_partum', 'post_partum', 'disabilita'];

      specialGoals.forEach(goal => {
        const options: UnifiedProgramOptions = {
          level: 'intermediate',
          goal,
          location: 'gym',
          frequency: 3,
          baselines: SAMPLE_BASELINES
        };

        const result = generateProgramUnified(options);

        expect(result.success).toBe(true);
        expect(result.program!.requiresMedicalClearance).toBe(true);
      });
    });
  });

  describe('Backward compatibility', () => {
    it('should generate same structure as expected format', () => {
      const options: UnifiedProgramOptions = {
        level: 'intermediate',
        goal: 'ipertrofia',
        location: 'gym',
        frequency: 4,
        baselines: SAMPLE_BASELINES
      };

      const result = generateProgramUnified(options);

      expect(result.program).toHaveProperty('name');
      expect(result.program).toHaveProperty('description');
      expect(result.program).toHaveProperty('splitName');
      expect(result.program).toHaveProperty('frequency');
      expect(result.program).toHaveProperty('weeklySplit');
      expect(result.program!.weeklySplit).toHaveProperty('days');

      // Ogni giorno dovrebbe avere la struttura corretta
      result.program!.weeklySplit.days.forEach((day: any) => {
        expect(day).toHaveProperty('dayName');
        expect(day).toHaveProperty('exercises');
        expect(Array.isArray(day.exercises)).toBe(true);

        day.exercises.forEach((exercise: any) => {
          expect(exercise).toHaveProperty('name');
          expect(exercise).toHaveProperty('sets');
          expect(exercise).toHaveProperty('reps');
          expect(exercise).toHaveProperty('rest');
        });
      });
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  it('should handle full onboarding flow', () => {
    // Simula un utente che fa onboarding completo
    const screeningData = {
      quizScore: 75,
      practicalScore: 70,
      physicalScore: 80,
      finalScore: 75
    };

    const userData = {
      age: 35,
      hasMedicalConditions: false
    };

    // Crea contesto di sicurezza
    const safetyContext = createSafetyContext(
      'intermediate',
      'ipertrofia',
      screeningData,
      userData
    );

    // Verifica limiti
    const limits = calculateSafetyLimits(safetyContext);
    expect(limits.warnings.length).toBe(0);  // Nessun warning per utente normale

    // Genera programma
    const options: UnifiedProgramOptions = {
      level: 'intermediate',
      goal: 'ipertrofia',
      location: 'gym',
      frequency: 4,
      baselines: SAMPLE_BASELINES,
      quizScore: screeningData.quizScore,
      practicalScore: screeningData.practicalScore
    };

    const result = generateProgramUnified(options);

    expect(result.success).toBe(true);
    expect(result.program!.goal).toBe('hypertrophy');  // Canonico
    expect(result.program!.goalDatabase).toBe('ipertrofia');  // Database
    expect(result.program!.goalProgram).toBe('muscle_gain');  // Program
  });

  it('should handle edge case: beginner with pregnancy goal', () => {
    const options: UnifiedProgramOptions = {
      level: 'beginner',
      goal: 'pre_partum',
      location: 'home',
      trainingType: 'bodyweight',
      frequency: 2,
      baselines: SAMPLE_BASELINES
    };

    const result = generateProgramUnified(options);

    expect(result.success).toBe(true);
    expect(result.program!.requiresMedicalClearance).toBe(true);

    // Tutti gli esercizi dovrebbero essere a bassa intensità
    result.program!.weeklySplit.days.forEach((day: any) => {
      (day.exercises || []).forEach((exercise: any) => {
        if (exercise.dayType) {
          expect(exercise.dayType).toBe('volume');
        }
        // RIR alto
        if (exercise.targetRir !== undefined) {
          expect(exercise.targetRir).toBeGreaterThanOrEqual(3);
        }
      });
    });
  });

  it('should handle location switch correctly', () => {
    // Stesso utente, location diversa
    const baseOptions: Omit<UnifiedProgramOptions, 'location' | 'trainingType'> = {
      level: 'intermediate',
      goal: 'ipertrofia',
      frequency: 3,
      baselines: SAMPLE_BASELINES
    };

    const gymResult = generateProgramUnified({
      ...baseOptions,
      location: 'gym',
      trainingType: 'equipment'
    });

    const homeResult = generateProgramUnified({
      ...baseOptions,
      location: 'home',
      trainingType: 'bodyweight'
    });

    expect(gymResult.success).toBe(true);
    expect(homeResult.success).toBe(true);

    // Gli esercizi dovrebbero essere diversi
    const gymExercises = gymResult.program!.weeklySplit.days[0].exercises.map((e: any) => e.name);
    const homeExercises = homeResult.program!.weeklySplit.days[0].exercises.map((e: any) => e.name);

    // Almeno alcuni esercizi dovrebbero essere diversi
    const sameExercises = gymExercises.filter((name: string) => homeExercises.includes(name));
    expect(sameExercises.length).toBeLessThan(gymExercises.length);
  });
});

// ============================================================================
// REGRESSION SPECIFIC TESTS
// ============================================================================

describe('Regression: Identical Exercises Bug', () => {
  it('should NOT produce identical exercise patterns across all days', () => {
    // Questo test verifica il bug originale: schede identiche
    ALL_LEVELS.forEach(level => {
      [3, 4, 5, 6].forEach(frequency => {
        const options: UnifiedProgramOptions = {
          level,
          goal: 'ipertrofia',
          location: 'gym',
          frequency,
          baselines: SAMPLE_BASELINES
        };

        const result = generateProgramUnified(options);

        if (result.success && result.program!.weeklySplit.days.length > 1) {
          const days = result.program!.weeklySplit.days;

          // Crea fingerprint di ogni giorno
          const fingerprints = days.map((day: any) => {
            const exercises = day.exercises || [];
            // Include name + dayType per catturare DUP
            return exercises
              .map((e: any) => `${e.name}:${e.dayType || 'none'}:${e.sets}`)
              .sort()
              .join('|');
          });

          // Non tutti i giorni dovrebbero essere identici
          const uniqueFingerprints = new Set(fingerprints);

          // Se abbiamo più di 1 giorno, dovremmo avere almeno qualche variazione
          // (eccezione: 2 giorni full body potrebbero essere simili)
          if (frequency >= 3) {
            expect(uniqueFingerprints.size).toBeGreaterThan(1);
          }
        }
      });
    });
  });

  it('should apply DUP dayType variation', () => {
    const options: UnifiedProgramOptions = {
      level: 'intermediate',
      goal: 'forza',
      location: 'gym',
      frequency: 4,
      baselines: SAMPLE_BASELINES
    };

    const result = generateProgramUnified(options);

    expect(result.success).toBe(true);

    // Raccogli tutti i dayTypes usati
    const allDayTypes = new Set<string>();
    result.program!.weeklySplit.days.forEach((day: any) => {
      (day.exercises || []).forEach((exercise: any) => {
        if (exercise.dayType) {
          allDayTypes.add(exercise.dayType);
        }
      });
    });

    // Dovremmo avere almeno 2 tipi diversi di dayType
    // (per intermedi/avanzati con goal forza/ipertrofia)
    expect(allDayTypes.size).toBeGreaterThanOrEqual(2);
  });
});
