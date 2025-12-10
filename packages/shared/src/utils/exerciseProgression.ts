/**
 * EXERCISE PROGRESSION SYSTEM
 *
 * Sistema intelligente per gestire:
 * - Downgrade esercizi a casa quando troppo difficili
 * - Riduzione carico in palestra
 * - Tracking RPE, RIR e difficoltà percepita
 * - Auto-adjustment basato su feedback real-time
 */

import {
  LOWER_PUSH_VARIANTS,
  LOWER_PULL_VARIANTS,
  HORIZONTAL_PUSH_VARIANTS,
  VERTICAL_PUSH_VARIANTS,
  VERTICAL_PULL_VARIANTS,
  HORIZONTAL_PULL_VARIANTS,
  CORE_VARIANTS,
  ExerciseVariant
} from './exerciseVariants';

export interface DifficultyFeedback {
  rpe: number;        // 1-10 (Rating of Perceived Exertion)
  rir: number;        // 0-5 (Reps In Reserve)
  difficulty: number; // 1-10 (Difficoltà percepita dell'esercizio)
  completedReps: number;
  targetReps: number;
  weight?: number;
  notes?: string;
}

export interface ProgressionResult {
  action: 'maintain' | 'downgrade' | 'upgrade' | 'reduce_weight' | 'increase_weight';
  reason: string;
  newExercise?: string;
  newWeight?: number;
  newDifficulty?: number;
  recommendation: string;
}

/**
 * Pattern to variants mapping
 */
const PATTERN_VARIANTS: Record<string, ExerciseVariant[]> = {
  lower_push: LOWER_PUSH_VARIANTS,
  lower_pull: LOWER_PULL_VARIANTS,
  horizontal_push: HORIZONTAL_PUSH_VARIANTS,
  vertical_push: VERTICAL_PUSH_VARIANTS,
  vertical_pull: VERTICAL_PULL_VARIANTS,
  horizontal_pull: HORIZONTAL_PULL_VARIANTS,
  core: CORE_VARIANTS
};

/**
 * Exercise progression chains - from easiest to hardest
 * Used for downgrade/upgrade logic
 */
export const PROGRESSION_CHAINS: Record<string, string[]> = {
  // Lower Push - Squat variations
  lower_push_bodyweight: [
    'Box Squat',
    'Assisted Squat',
    'Bodyweight Squat',
    'Split Squat',
    'Bulgarian Split Squat',
    'Pistol Squat (Assisted)',
    'Pistol Squat'
  ],
  lower_push_gym: [
    'Leg Press',
    'Goblet Squat',
    'Smith Machine Squat',
    'Back Squat',
    'Front Squat',
    'Bulgarian Split Squat (Weighted)',
    'Zercher Squat'
  ],

  // Lower Pull - Hinge variations
  lower_pull_bodyweight: [
    'Glute Bridge',
    'Single Leg Glute Bridge',
    'Hip Hinge',
    'Single Leg Hip Hinge',
    'Nordic Curl (Eccentric)',
    'Nordic Curl'
  ],
  lower_pull_gym: [
    'Leg Curl (Machine)',
    'Cable Pull Through',
    'Dumbbell RDL',
    'Romanian Deadlift',
    'Conventional Deadlift',
    'Sumo Deadlift'
  ],

  // Horizontal Push - Push-up/Bench variations
  horizontal_push_bodyweight: [
    'Wall Push-up',
    'Incline Push-up',
    'Knee Push-up',
    'Standard Push-up',
    'Close Grip Push-up',
    'Diamond Push-up',
    'Archer Push-up',
    'One-Arm Push-up (Assisted)'
  ],
  horizontal_push_gym: [
    'Machine Chest Press',
    'Dumbbell Bench Press',
    'Flat Barbell Bench Press',
    'Incline Bench Press',
    'Decline Bench Press',
    'Close Grip Bench Press'
  ],

  // Vertical Push - Shoulder press variations
  vertical_push_bodyweight: [
    'Wall Shoulder Tap',
    'Pike Push-up (Knee)',
    'Pike Push-up',
    'Elevated Pike Push-up',
    'Wall Handstand Hold',
    'Wall Handstand Push-up (Eccentric)',
    'Wall Handstand Push-up'
  ],
  vertical_push_gym: [
    'Machine Shoulder Press',
    'Dumbbell Shoulder Press (Seated)',
    'Dumbbell Shoulder Press (Standing)',
    'Arnold Press',
    'Military Press',
    'Push Press'
  ],

  // Vertical Pull - Pull-up variations
  vertical_pull_bodyweight: [
    'Scapular Pull-up',
    'Dead Hang',
    'Negative Pull-up',
    'Band-Assisted Pull-up',
    'Chin-up',
    'Neutral Grip Pull-up',
    'Standard Pull-up',
    'Wide Grip Pull-up',
    'Muscle-up (Progression)'
  ],
  vertical_pull_gym: [
    'Lat Pulldown (Light)',
    'Lat Pulldown',
    'Wide Grip Lat Pulldown',
    'Assisted Pull-up Machine',
    'Neutral Grip Pull-up',
    'Standard Pull-up',
    'Weighted Pull-up'
  ],

  // Horizontal Pull - Row variations
  horizontal_pull_bodyweight: [
    'Band Row',
    'Inverted Row (High Bar)',
    'Inverted Row',
    'Inverted Row (Feet Elevated)',
    'Archer Row',
    'One-Arm Inverted Row'
  ],
  horizontal_pull_gym: [
    'Machine Row',
    'Seated Cable Row',
    'Dumbbell Row',
    'Chest Supported Row',
    'Barbell Row',
    'T-Bar Row',
    'Pendlay Row'
  ],

  // Core progressions
  core_bodyweight: [
    'Dead Bug',
    'Bird Dog',
    'Plank (Knee)',
    'Plank',
    'Side Plank (Knee)',
    'Side Plank',
    'Lying Leg Raise',
    'Hanging Knee Raise',
    'Hanging Leg Raise',
    'L-Sit'
  ]
};

/**
 * Get the appropriate progression chain for an exercise
 */
function getProgressionChain(pattern: string, location: 'gym' | 'home'): string[] {
  const suffix = location === 'home' ? '_bodyweight' : '_gym';
  return PROGRESSION_CHAINS[pattern + suffix] || PROGRESSION_CHAINS[pattern + '_bodyweight'] || [];
}

/**
 * Find current position in progression chain
 */
function findPositionInChain(exerciseName: string, chain: string[]): number {
  const lowerName = exerciseName.toLowerCase();
  return chain.findIndex(ex =>
    ex.toLowerCase() === lowerName ||
    lowerName.includes(ex.toLowerCase()) ||
    ex.toLowerCase().includes(lowerName)
  );
}

/**
 * Analyze feedback and determine progression/regression action
 */
export function analyzeExerciseFeedback(
  feedback: DifficultyFeedback,
  location: 'gym' | 'home'
): ProgressionResult {
  const { rpe, rir, difficulty, completedReps, targetReps, weight } = feedback;

  // Calculate completion percentage
  const completionRate = completedReps / targetReps;

  // Thresholds
  const RPE_TOO_HIGH = 9;
  const RPE_TOO_LOW = 5;
  const DIFFICULTY_TOO_HIGH = 8;
  const RIR_TOO_LOW = 0;
  const COMPLETION_THRESHOLD = 0.7; // 70% of target reps

  // Case 1: Exercise is too difficult (RPE >= 9 or difficulty >= 8 or couldn't complete reps)
  if (rpe >= RPE_TOO_HIGH || difficulty >= DIFFICULTY_TOO_HIGH || completionRate < COMPLETION_THRESHOLD) {
    if (location === 'home') {
      return {
        action: 'downgrade',
        reason: `Difficolt alta (RPE: ${rpe}, Diff: ${difficulty}, Completato: ${Math.round(completionRate * 100)}%)`,
        recommendation: 'Passiamo a una versione pi facile dello stesso movimento'
      };
    } else {
      // In gym: reduce weight first
      const newWeight = weight ? Math.round(weight * 0.85) : undefined;
      return {
        action: 'reduce_weight',
        reason: `RPE ${rpe}/10 troppo alto`,
        newWeight,
        recommendation: newWeight
          ? `Riduci a ${newWeight}kg (-15%) per le prossime serie`
          : 'Riduci il carico del 15%'
      };
    }
  }

  // Case 2: RIR is 0 (failure) - critical, needs immediate adjustment
  if (rir === RIR_TOO_LOW && rpe >= 10) {
    if (location === 'home') {
      return {
        action: 'downgrade',
        reason: 'Arrivato a cedimento muscolare',
        recommendation: 'Versione pi facile per mantenere la qualit del movimento'
      };
    } else {
      const newWeight = weight ? Math.round(weight * 0.80) : undefined;
      return {
        action: 'reduce_weight',
        reason: 'Cedimento muscolare raggiunto',
        newWeight,
        recommendation: newWeight
          ? `Riduci a ${newWeight}kg (-20%) per evitare overtraining`
          : 'Riduci il carico del 20%'
      };
    }
  }

  // Case 3: Exercise is too easy (RPE <= 5 and completed all reps easily)
  if (rpe <= RPE_TOO_LOW && completionRate >= 1 && rir >= 4) {
    if (location === 'home') {
      return {
        action: 'upgrade',
        reason: `Troppo facile (RPE: ${rpe}, RIR: ${rir})`,
        recommendation: 'Pronto per una progressione pi avanzata'
      };
    } else {
      const newWeight = weight ? Math.round(weight * 1.05) : undefined;
      return {
        action: 'increase_weight',
        reason: `RPE ${rpe}/10 troppo basso`,
        newWeight,
        recommendation: newWeight
          ? `Aumenta a ${newWeight}kg (+5%) per maggior stimolo`
          : 'Aumenta il carico del 5%'
      };
    }
  }

  // Case 4: Optimal zone (RPE 6-8, completed reps, RIR 1-3)
  return {
    action: 'maintain',
    reason: `Zona ottimale (RPE: ${rpe}, RIR: ${rir})`,
    recommendation: 'Continua cos, intensit perfetta!'
  };
}

/**
 * Get downgraded exercise version
 */
export function getDowngradedExercise(
  currentExercise: string,
  pattern: string,
  location: 'gym' | 'home'
): { name: string; difficulty: number; notes: string } | null {
  const chain = getProgressionChain(pattern, location);

  if (chain.length === 0) {
    // Fallback to PATTERN_VARIANTS
    const variants = PATTERN_VARIANTS[pattern];
    if (variants) {
      const currentVariant = variants.find(v =>
        v.name.toLowerCase() === currentExercise.toLowerCase()
      );

      if (currentVariant) {
        // Find easier variant
        const equipment = location === 'home' ? 'bodyweight' : 'gym';
        const easierVariants = variants.filter(v =>
          v.difficulty < currentVariant.difficulty &&
          (v.equipment === equipment || v.equipment === 'both')
        ).sort((a, b) => b.difficulty - a.difficulty); // Most difficult of the easier ones

        if (easierVariants.length > 0) {
          const easier = easierVariants[0];
          return {
            name: easier.name,
            difficulty: easier.difficulty,
            notes: `Downgrade da ${currentExercise} (diff: ${currentVariant.difficulty} -> ${easier.difficulty})`
          };
        }
      }
    }
    return null;
  }

  const currentPosition = findPositionInChain(currentExercise, chain);

  if (currentPosition <= 0) {
    // Already at easiest or not found
    return null;
  }

  const downgradedExercise = chain[currentPosition - 1];

  return {
    name: downgradedExercise,
    difficulty: currentPosition - 1, // Position as proxy for difficulty
    notes: `Progressione ridotta: ${currentExercise} -> ${downgradedExercise}`
  };
}

/**
 * Get upgraded exercise version
 */
export function getUpgradedExercise(
  currentExercise: string,
  pattern: string,
  location: 'gym' | 'home'
): { name: string; difficulty: number; notes: string } | null {
  const chain = getProgressionChain(pattern, location);

  if (chain.length === 0) {
    // Fallback to PATTERN_VARIANTS
    const variants = PATTERN_VARIANTS[pattern];
    if (variants) {
      const currentVariant = variants.find(v =>
        v.name.toLowerCase() === currentExercise.toLowerCase()
      );

      if (currentVariant) {
        // Find harder variant
        const equipment = location === 'home' ? 'bodyweight' : 'gym';
        const harderVariants = variants.filter(v =>
          v.difficulty > currentVariant.difficulty &&
          (v.equipment === equipment || v.equipment === 'both')
        ).sort((a, b) => a.difficulty - b.difficulty); // Least difficult of the harder ones

        if (harderVariants.length > 0) {
          const harder = harderVariants[0];
          return {
            name: harder.name,
            difficulty: harder.difficulty,
            notes: `Upgrade da ${currentExercise} (diff: ${currentVariant.difficulty} -> ${harder.difficulty})`
          };
        }
      }
    }
    return null;
  }

  const currentPosition = findPositionInChain(currentExercise, chain);

  if (currentPosition === -1 || currentPosition >= chain.length - 1) {
    // Not found or already at hardest
    return null;
  }

  const upgradedExercise = chain[currentPosition + 1];

  return {
    name: upgradedExercise,
    difficulty: currentPosition + 1, // Position as proxy for difficulty
    notes: `Progressione aumentata: ${currentExercise} -> ${upgradedExercise}`
  };
}

/**
 * Get initial weight reduction when switching location
 * Used when adapting gym exercises to home (expect harder due to less stability/leverage)
 */
export function getLocationSwitchAdjustment(
  fromLocation: 'gym' | 'home',
  toLocation: 'gym' | 'home'
): { difficultyModifier: number; recommendation: string } {
  if (fromLocation === 'gym' && toLocation === 'home') {
    return {
      difficultyModifier: 1.3, // Bodyweight exercises feel ~30% harder initially
      recommendation: 'Inizia con una versione pi facile - le varianti a corpo libero richiedono pi controllo'
    };
  }

  if (fromLocation === 'home' && toLocation === 'gym') {
    return {
      difficultyModifier: 0.8, // Gym exercises with machines are ~20% easier
      recommendation: 'Puoi aumentare leggermente il carico rispetto al corpo libero'
    };
  }

  return {
    difficultyModifier: 1.0,
    recommendation: 'Mantieni lo stesso livello di intensit'
  };
}

/**
 * Calculate suggested starting difficulty for location switch
 */
export function getSuggestedStartingExercise(
  originalExercise: string,
  pattern: string,
  toLocation: 'gym' | 'home'
): { name: string; difficulty: number; notes: string } {
  const chain = getProgressionChain(pattern, toLocation);

  if (chain.length === 0) {
    return {
      name: originalExercise,
      difficulty: 5,
      notes: 'Nessuna progressione alternativa trovata'
    };
  }

  // When switching to home, start at ~60% of chain (conservative)
  // When switching to gym, start at ~50% of chain
  const startPosition = toLocation === 'home'
    ? Math.floor(chain.length * 0.4)  // More conservative for home
    : Math.floor(chain.length * 0.5);

  const safePosition = Math.max(0, Math.min(startPosition, chain.length - 1));

  return {
    name: chain[safePosition],
    difficulty: safePosition,
    notes: `Punto di partenza sicuro per ${toLocation === 'home' ? 'casa' : 'palestra'}. Regola dopo il primo set.`
  };
}

export default {
  analyzeExerciseFeedback,
  getDowngradedExercise,
  getUpgradedExercise,
  getLocationSwitchAdjustment,
  getSuggestedStartingExercise,
  PROGRESSION_CHAINS
};
