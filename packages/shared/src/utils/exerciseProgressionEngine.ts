/**
 * Exercise Progression Engine
 *
 * Sistema unificato per gestire la progressione degli esercizi con logica separata per:
 * - Esercizi bodyweight: progressione tramite varianti (non peso)
 * - Esercizi weighted: progressione tramite carico
 *
 * @module exerciseProgressionEngine
 */

import { PROGRESSION_CHAINS } from './exerciseProgression';

// ============================================
// TYPES
// ============================================

export type ExerciseType = 'bodyweight' | 'weighted' | 'mixed';
export type Location = 'gym' | 'home' | 'home_gym';

export interface ExerciseFeedback {
  exerciseName: string;
  exerciseType?: ExerciseType;
  pattern: string;
  targetReps: number;
  completedReps: number;
  targetRIR?: number;
  actualRIR: number;
  currentWeight?: number;
  currentDifficulty?: number;
  location: Location;
  rpe?: number;
}

export interface WeightedProgressionResult {
  action: 'increase_weight' | 'decrease_weight' | 'maintain';
  currentWeight: number;
  suggestedWeight: number;
  percentageChange: number;
  userMessage: string;
  technicalDetails: string;
}

export interface BodyweightProgressionResult {
  action: 'upgrade_variant' | 'downgrade_variant' | 'maintain' | 'add_reps';
  currentVariant: string;
  suggestedVariant?: string;
  currentDifficulty: number;
  suggestedDifficulty?: number;
  repsAdjustment?: number;
  userMessage: string;
  educationalTip?: string;
}

export interface ProgressionResult {
  exerciseType: ExerciseType;
  shouldProgress: boolean;
  weighted?: WeightedProgressionResult;
  bodyweight?: BodyweightProgressionResult;
  autoRegulationApplied: boolean;
  notes: string;
}

// ============================================
// EXERCISE CLASSIFICATION
// ============================================

/**
 * Lista esercizi puramente bodyweight (nessun peso esterno)
 */
const PURE_BODYWEIGHT_EXERCISES = new Set([
  // Push-up variations
  'wall push-up', 'incline push-up', 'knee push-up', 'standard push-up',
  'push-up', 'diamond push-up', 'archer push-up', 'one-arm push-up',
  'decline push-up', 'pike push-up', 'pseudo planche push-up',
  'typewriter push-up', 'clap push-up', 'ring push-up',

  // Pull-up variations
  'pull-up', 'chin-up', 'negative pull-up', 'assisted pull-up',
  'wide grip pull-up', 'neutral grip pull-up', 'archer pull-up',
  'muscle-up', 'l-sit pull-up',

  // Squat variations (bodyweight)
  'bodyweight squat', 'air squat', 'split squat', 'bulgarian split squat',
  'pistol squat', 'shrimp squat', 'skater squat', 'sissy squat',
  'assisted pistol squat', 'box squat',

  // Hinge (bodyweight)
  'glute bridge', 'single leg glute bridge', 'hip thrust',
  'nordic curl', 'slider leg curl', 'reverse nordic curl',

  // Row variations (bodyweight)
  'inverted row', 'australian pull-up', 'archer row',
  'trx row', 'ring row',

  // Core
  'plank', 'side plank', 'dead bug', 'bird dog', 'hollow body hold',
  'hanging leg raise', 'hanging knee raise', 'l-sit', 'dragon flag',
  'ab wheel rollout', 'v-up', 'lying leg raise',

  // HSPU progression
  'wall handstand push-up', 'pike push-up elevated', 'handstand hold',

  // Dips (bodyweight)
  'dips', 'tricep dips', 'chest dips', 'bench dips',

  // Calf (bodyweight)
  'calf raise', 'single leg calf raise'
]);

/**
 * Lista esercizi che richiedono peso/macchina
 */
const WEIGHTED_EXERCISES = new Set([
  // Barbell
  'back squat', 'front squat', 'deadlift', 'conventional deadlift',
  'sumo deadlift', 'romanian deadlift', 'bench press',
  'flat barbell bench press', 'incline bench press', 'decline bench press',
  'overhead press', 'military press', 'barbell row', 'pendlay row',
  'barbell curl', 'skull crushers', 'good morning',

  // Dumbbell
  'dumbbell bench press', 'dumbbell row', 'dumbbell shoulder press',
  'dumbbell curl', 'hammer curl', 'lateral raise', 'front raise',
  'goblet squat', 'dumbbell rdl', 'concentration curl',

  // Cable
  'lat pulldown', 'seated cable row', 'cable fly', 'face pull',
  'tricep pushdown', 'cable crunch', 'cable pull through',
  'cable kickback', 'straight arm pulldown',

  // Machine
  'leg press', 'leg curl', 'leg extension', 'seated leg curl',
  'lying leg curl', 'hack squat', 'chest press machine',
  'shoulder press machine', 'pec deck',

  // Other weighted
  'hip thrust', 'weighted pull-up', 'weighted dips'
]);

/**
 * Classifica un esercizio come bodyweight, weighted o mixed
 */
export function classifyExercise(exerciseName: string): ExerciseType {
  const normalized = exerciseName.toLowerCase().trim();

  if (PURE_BODYWEIGHT_EXERCISES.has(normalized)) {
    return 'bodyweight';
  }

  if (WEIGHTED_EXERCISES.has(normalized)) {
    return 'weighted';
  }

  // Euristica per esercizi non in lista
  const bodyweightKeywords = ['push-up', 'pull-up', 'plank', 'hollow', 'l-sit', 'pistol', 'nordic'];
  const weightedKeywords = ['barbell', 'dumbbell', 'cable', 'machine', 'press', 'curl', 'row'];

  for (const kw of bodyweightKeywords) {
    if (normalized.includes(kw)) return 'bodyweight';
  }

  for (const kw of weightedKeywords) {
    if (normalized.includes(kw)) return 'weighted';
  }

  return 'mixed';
}

export function isBodyweightExercise(exerciseName: string): boolean {
  return classifyExercise(exerciseName) === 'bodyweight';
}

export function isWeightedExercise(exerciseName: string): boolean {
  return classifyExercise(exerciseName) === 'weighted';
}

// ============================================
// PROGRESSION CHAINS (BODYWEIGHT)
// ============================================

export const BODYWEIGHT_PROGRESSIONS: Record<string, string[]> = {
  horizontal_push: [
    'Wall Push-up',
    'Incline Push-up',
    'Knee Push-up',
    'Standard Push-up',
    'Diamond Push-up',
    'Decline Push-up',
    'Archer Push-up',
    'Pseudo Planche Push-up',
    'One-Arm Push-up'
  ],
  vertical_push: [
    'Pike Push-up (Knees)',
    'Pike Push-up',
    'Elevated Pike Push-up',
    'Wall Handstand Hold',
    'Wall Handstand Push-up (Negative)',
    'Wall Handstand Push-up'
  ],
  vertical_pull: [
    'Dead Hang',
    'Scapular Pull-up',
    'Negative Pull-up',
    'Band-Assisted Pull-up',
    'Chin-up',
    'Standard Pull-up',
    'Wide Grip Pull-up',
    'Archer Pull-up'
  ],
  horizontal_pull: [
    'Inverted Row (High)',
    'Inverted Row',
    'Inverted Row (Feet Elevated)',
    'Archer Row',
    'One-Arm Inverted Row'
  ],
  lower_push: [
    'Assisted Squat',
    'Box Squat',
    'Bodyweight Squat',
    'Split Squat',
    'Bulgarian Split Squat',
    'Skater Squat',
    'Assisted Pistol Squat',
    'Pistol Squat',
    'Shrimp Squat'
  ],
  lower_pull: [
    'Glute Bridge',
    'Single Leg Glute Bridge',
    'Hip Thrust (Bodyweight)',
    'Slider Leg Curl',
    'Nordic Curl (Negative)',
    'Nordic Curl'
  ],
  core: [
    'Dead Bug',
    'Bird Dog',
    'Plank',
    'Side Plank',
    'Hanging Knee Raise',
    'Hanging Leg Raise',
    'Tuck L-Sit',
    'L-Sit',
    'Dragon Flag'
  ]
};

/**
 * Ottieni la catena di progressione per un pattern
 */
export function getProgressionChain(pattern: string): string[] {
  return BODYWEIGHT_PROGRESSIONS[pattern] || PROGRESSION_CHAINS[`${pattern}_bodyweight`] || [];
}

/**
 * Trova posizione di un esercizio nella catena
 */
function findInChain(exerciseName: string, chain: string[]): number {
  const normalized = exerciseName.toLowerCase();
  return chain.findIndex(ex =>
    ex.toLowerCase() === normalized ||
    normalized.includes(ex.toLowerCase()) ||
    ex.toLowerCase().includes(normalized)
  );
}

/**
 * Ottieni difficolta di un esercizio (1-10)
 */
export function getExerciseDifficulty(exerciseName: string, pattern: string): number {
  const chain = getProgressionChain(pattern);
  const position = findInChain(exerciseName, chain);

  if (position === -1) return 5; // Default medio

  // Scala da 1 a 10 basata sulla posizione
  return Math.round(1 + (position / Math.max(1, chain.length - 1)) * 9);
}

/**
 * Ottieni variante successiva (upgrade)
 */
export function getNextVariant(exerciseName: string, pattern: string): string | null {
  const chain = getProgressionChain(pattern);
  const position = findInChain(exerciseName, chain);

  if (position === -1 || position >= chain.length - 1) return null;
  return chain[position + 1];
}

/**
 * Ottieni variante precedente (downgrade)
 */
export function getPreviousVariant(exerciseName: string, pattern: string): string | null {
  const chain = getProgressionChain(pattern);
  const position = findInChain(exerciseName, chain);

  if (position <= 0) return null;
  return chain[position - 1];
}

// ============================================
// WEIGHTED PROGRESSION LOGIC
// ============================================

/**
 * Calcola progressione per esercizi con peso
 */
export function calculateWeightedProgression(
  feedback: ExerciseFeedback
): WeightedProgressionResult {
  const { targetReps, completedReps, actualRIR, currentWeight = 0, targetRIR = 2 } = feedback;

  const completionRate = completedReps / targetReps;
  const rirDiff = actualRIR - targetRIR;

  // Troppo difficile: RIR < target o reps non completate
  if (actualRIR < targetRIR || completionRate < 0.9) {
    const reduction = actualRIR === 0 ? 0.10 : 0.05; // -10% se failure, -5% altrimenti
    const suggestedWeight = Math.round(currentWeight * (1 - reduction));

    return {
      action: 'decrease_weight',
      currentWeight,
      suggestedWeight,
      percentageChange: -reduction * 100,
      userMessage: actualRIR === 0
        ? `Cedimento raggiunto! Riduci a ${suggestedWeight}kg per la prossima serie`
        : `RIR troppo basso. Prova ${suggestedWeight}kg`,
      technicalDetails: `RIR target: ${targetRIR}, attuale: ${actualRIR}. Completamento: ${Math.round(completionRate * 100)}%`
    };
  }

  // Troppo facile: RIR > target + 2 e reps completate
  if (rirDiff >= 2 && completionRate >= 1) {
    const increase = rirDiff >= 4 ? 0.075 : 0.05; // +7.5% se molto facile, +5% altrimenti
    const suggestedWeight = Math.round(currentWeight * (1 + increase));

    return {
      action: 'increase_weight',
      currentWeight,
      suggestedWeight,
      percentageChange: increase * 100,
      userMessage: `Ottimo! Puoi aumentare a ${suggestedWeight}kg`,
      technicalDetails: `RIR ${actualRIR} > target ${targetRIR}. Margine per progredire.`
    };
  }

  // Zona ottimale
  return {
    action: 'maintain',
    currentWeight,
    suggestedWeight: currentWeight,
    percentageChange: 0,
    userMessage: 'Perfetto! Mantieni questo peso',
    technicalDetails: `RIR ${actualRIR} in zona target (${targetRIR}). Continua cosi.`
  };
}

// ============================================
// BODYWEIGHT PROGRESSION LOGIC
// ============================================

/**
 * Calcola progressione per esercizi bodyweight
 */
export function calculateBodyweightProgression(
  feedback: ExerciseFeedback
): BodyweightProgressionResult {
  const {
    exerciseName,
    pattern,
    targetReps,
    completedReps,
    actualRIR,
    targetRIR = 2,
    currentDifficulty = 5
  } = feedback;

  const completionRate = completedReps / targetReps;
  const rirDiff = actualRIR - targetRIR;

  // Troppo difficile: downgrade a variante piu facile
  if (actualRIR < 1 || completionRate < 0.7) {
    const previousVariant = getPreviousVariant(exerciseName, pattern);

    if (previousVariant) {
      return {
        action: 'downgrade_variant',
        currentVariant: exerciseName,
        suggestedVariant: previousVariant,
        currentDifficulty,
        suggestedDifficulty: currentDifficulty - 1,
        userMessage: `Passiamo a ${previousVariant} per consolidare la tecnica`,
        educationalTip: 'Nel calisthenics, padroneggiare le basi e fondamentale prima di avanzare'
      };
    }

    // Nessuna variante precedente: riduci reps
    return {
      action: 'add_reps',
      currentVariant: exerciseName,
      currentDifficulty,
      repsAdjustment: -2,
      userMessage: `Riduci a ${Math.max(3, targetReps - 2)} ripetizioni per serie`,
      educationalTip: 'Meglio meno ripetizioni con tecnica perfetta'
    };
  }

  // Troppo facile: upgrade a variante piu difficile
  if (rirDiff >= 3 && completionRate >= 1) {
    const nextVariant = getNextVariant(exerciseName, pattern);

    if (nextVariant) {
      return {
        action: 'upgrade_variant',
        currentVariant: exerciseName,
        suggestedVariant: nextVariant,
        currentDifficulty,
        suggestedDifficulty: currentDifficulty + 1,
        userMessage: `Sei pronto per ${nextVariant}!`,
        educationalTip: 'Inizia con poche ripetizioni della nuova variante e aumenta gradualmente'
      };
    }

    // Nessuna variante successiva: aumenta reps
    return {
      action: 'add_reps',
      currentVariant: exerciseName,
      currentDifficulty,
      repsAdjustment: 2,
      userMessage: `Aumenta a ${targetReps + 2} ripetizioni per serie`,
      educationalTip: 'Hai raggiunto il top della progressione per questo pattern!'
    };
  }

  // Zona ottimale
  return {
    action: 'maintain',
    currentVariant: exerciseName,
    currentDifficulty,
    userMessage: 'Continua cosi! Stai progredendo bene',
    educationalTip: 'Concentrati sulla qualita del movimento'
  };
}

// ============================================
// MAIN PROGRESSION FUNCTION
// ============================================

/**
 * Calcola la progressione appropriata per qualsiasi esercizio
 */
export function calculateProgression(feedback: ExerciseFeedback): ProgressionResult {
  const exerciseType = feedback.exerciseType || classifyExercise(feedback.exerciseName);

  if (exerciseType === 'bodyweight') {
    const bodyweight = calculateBodyweightProgression(feedback);
    return {
      exerciseType,
      shouldProgress: bodyweight.action !== 'maintain',
      bodyweight,
      autoRegulationApplied: true,
      notes: bodyweight.userMessage
    };
  }

  if (exerciseType === 'weighted') {
    const weighted = calculateWeightedProgression(feedback);
    return {
      exerciseType,
      shouldProgress: weighted.action !== 'maintain',
      weighted,
      autoRegulationApplied: true,
      notes: weighted.userMessage
    };
  }

  // Mixed: decide based on weight presence
  if (feedback.currentWeight && feedback.currentWeight > 0) {
    const weighted = calculateWeightedProgression(feedback);
    return {
      exerciseType: 'weighted',
      shouldProgress: weighted.action !== 'maintain',
      weighted,
      autoRegulationApplied: true,
      notes: weighted.userMessage
    };
  }

  const bodyweight = calculateBodyweightProgression(feedback);
  return {
    exerciseType: 'bodyweight',
    shouldProgress: bodyweight.action !== 'maintain',
    bodyweight,
    autoRegulationApplied: true,
    notes: bodyweight.userMessage
  };
}
