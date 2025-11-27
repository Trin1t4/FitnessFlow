/**
 * Location Adapter
 * Adatta gli esercizi alla location scelta (palestra/casa)
 * Implementa la logica client-side per evitare chiamate API non necessarie
 */

import { Exercise, PatternId } from '../types';
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
import { MACHINE_EXERCISE_MAP, convertToMachineVariant } from './exerciseMapping';

export type LocationType = 'gym' | 'home';
export type HomeType = 'bodyweight' | 'with_equipment';

export interface HomeEquipment {
  barbell: boolean;
  dumbbellMaxKg: number;
  kettlebellKg?: number[];
  bands: boolean;
  pullupBar: boolean;
  bench: boolean;
}

export interface LocationAdaptationOptions {
  location: LocationType;
  homeType?: HomeType;
  equipment?: HomeEquipment;
}

/**
 * Mappa pattern -> varianti
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
 * Mappa inversa: macchina -> bodyweight
 */
const BODYWEIGHT_ALTERNATIVES: Record<string, string> = {
  'leg press': 'Bodyweight Squat',
  'leg curl machine': 'Nordic Hamstring Curl',
  'leg curl (machine)': 'Nordic Hamstring Curl',
  'hip thrust machine': 'Glute Bridge',
  'chest press machine': 'Standard Push-up',
  'shoulder press machine': 'Pike Push-up',
  'lat pulldown machine': 'Standard Pull-up',
  'lat pulldown (machine)': 'Standard Pull-up',
  'assisted pull-up': 'Negative Pull-up',
  'seated cable row': 'Inverted Row',
  'seated row machine': 'Inverted Row',
  'ab crunch machine': 'Plank',
  'cable crunch': 'Plank',
  'back squat': 'Bodyweight Squat',
  'front squat': 'Bodyweight Squat',
  'goblet squat': 'Bodyweight Squat',
  'conventional deadlift': 'Bodyweight Hip Hinge',
  'romanian deadlift (rdl)': 'Bodyweight Hip Hinge',
  'sumo deadlift': 'Bodyweight Hip Hinge',
  'trap bar deadlift': 'Bodyweight Hip Hinge',
  'flat barbell bench press': 'Standard Push-up',
  'incline bench press': 'Decline Push-up',
  'decline bench press': 'Standard Push-up',
  'dumbbell bench press': 'Standard Push-up',
  'military press (barbell)': 'Pike Push-up',
  'dumbbell shoulder press': 'Pike Push-up',
  'arnold press': 'Pike Push-up',
  'push press': 'Pike Push-up',
  'barbell row': 'Inverted Row',
  'dumbbell row': 'Inverted Row',
  't-bar row': 'Inverted Row',
  'tricep pushdown': 'Diamond Push-up',
  'skull crushers': 'Diamond Push-up',
  'barbell curl': 'Chin-up (Supinated)',
  'hammer curl': 'Neutral Grip Pull-up',
  'seated calf raise': 'Standing Calf Raise',
  'pallof press': 'Side Plank'
};

/**
 * Esercizi che richiedono sbarra
 */
const PULLUP_BAR_EXERCISES = [
  'standard pull-up',
  'pull-up',
  'wide grip pull-up',
  'chin-up',
  'chin-up (supinated)',
  'neutral grip pull-up',
  'negative pull-up',
  'hanging leg raise'
];

/**
 * Alternative senza sbarra
 */
const NO_PULLUP_BAR_ALTERNATIVES: Record<string, string> = {
  'standard pull-up': 'Inverted Row',
  'pull-up': 'Inverted Row',
  'wide grip pull-up': 'Inverted Row',
  'chin-up': 'Inverted Row',
  'chin-up (supinated)': 'Inverted Row',
  'neutral grip pull-up': 'Inverted Row',
  'negative pull-up': 'Inverted Row',
  'hanging leg raise': 'Lying Leg Raise'
};

/**
 * Trova variante bodyweight per un esercizio
 */
function findBodyweightAlternative(exerciseName: string, pattern: string): string {
  const lowerName = exerciseName.toLowerCase();

  // Prima cerca nella mappa diretta
  if (BODYWEIGHT_ALTERNATIVES[lowerName]) {
    return BODYWEIGHT_ALTERNATIVES[lowerName];
  }

  // Poi cerca nelle varianti del pattern
  const variants = PATTERN_VARIANTS[pattern];
  if (variants) {
    const bodyweightVariant = variants.find(
      v => v.equipment === 'bodyweight' || v.equipment === 'both'
    );
    if (bodyweightVariant) {
      return bodyweightVariant.name;
    }
  }

  // Fallback: mantieni originale
  return exerciseName;
}

/**
 * Trova variante gym per un esercizio bodyweight
 */
function findGymAlternative(exerciseName: string, pattern: string): string {
  const lowerName = exerciseName.toLowerCase();

  // Prima prova la mappa macchine esistente
  const machineVariant = convertToMachineVariant(exerciseName);
  if (machineVariant !== exerciseName) {
    return machineVariant;
  }

  // Poi cerca nelle varianti del pattern
  const variants = PATTERN_VARIANTS[pattern];
  if (variants) {
    const gymVariant = variants.find(
      v => v.equipment === 'gym' || v.equipment === 'both'
    );
    if (gymVariant) {
      return gymVariant.name;
    }
  }

  // Fallback: mantieni originale
  return exerciseName;
}

/**
 * Determina se l'esercizio richiede attrezzatura specifica
 */
function requiresEquipment(exerciseName: string): {
  pullupBar: boolean;
  barbell: boolean;
  dumbbell: boolean;
  bench: boolean;
} {
  const lowerName = exerciseName.toLowerCase();

  return {
    pullupBar: PULLUP_BAR_EXERCISES.includes(lowerName),
    barbell: lowerName.includes('barbell') || lowerName.includes('deadlift'),
    dumbbell: lowerName.includes('dumbbell') || lowerName.includes('goblet'),
    bench: lowerName.includes('bench') || lowerName.includes('chest dips')
  };
}

/**
 * Adatta un singolo esercizio alla location
 */
function adaptExercise(
  exercise: Exercise,
  options: LocationAdaptationOptions
): Exercise {
  const { location, homeType, equipment } = options;

  // Pattern correttivi non vengono modificati
  if (exercise.pattern === 'corrective') {
    return exercise;
  }

  let newName = exercise.name;
  let wasReplaced = false;

  if (location === 'gym') {
    // Converti bodyweight -> gym/macchine
    newName = findGymAlternative(exercise.name, exercise.pattern);
    wasReplaced = newName !== exercise.name;
  } else if (location === 'home') {
    // Casa: dipende da homeType e equipment
    if (homeType === 'bodyweight' || !equipment) {
      // Solo corpo libero
      newName = findBodyweightAlternative(exercise.name, exercise.pattern);
      wasReplaced = newName !== exercise.name;
    } else {
      // Casa con attrezzatura - verifica cosa e' disponibile
      const required = requiresEquipment(exercise.name);

      // Se richiede sbarra ma non ce l'ha
      if (required.pullupBar && !equipment.pullupBar) {
        const lowerName = exercise.name.toLowerCase();
        if (NO_PULLUP_BAR_ALTERNATIVES[lowerName]) {
          newName = NO_PULLUP_BAR_ALTERNATIVES[lowerName];
          wasReplaced = true;
        }
      }

      // Se richiede bilanciere ma non ce l'ha
      if (required.barbell && !equipment.barbell) {
        if (equipment.dumbbellMaxKg > 0) {
          // Usa manubri come alternativa
          newName = exercise.name.replace(/barbell/i, 'Dumbbell');
        } else {
          // Altrimenti bodyweight
          newName = findBodyweightAlternative(exercise.name, exercise.pattern);
        }
        wasReplaced = newName !== exercise.name;
      }

      // Se richiede panca ma non ce l'ha
      if (required.bench && !equipment.bench) {
        newName = findBodyweightAlternative(exercise.name, exercise.pattern);
        wasReplaced = newName !== exercise.name;
      }
    }
  }

  return {
    ...exercise,
    name: newName,
    wasReplaced: wasReplaced || exercise.wasReplaced
  };
}

/**
 * Adatta una lista di esercizi alla location selezionata
 * @param exercises - Lista esercizi originali
 * @param options - Opzioni di location e attrezzatura
 * @returns Lista esercizi adattati
 */
export function adaptExercisesForLocation(
  exercises: Exercise[],
  options: LocationAdaptationOptions
): Exercise[] {
  return exercises.map(exercise => adaptExercise(exercise, options));
}

/**
 * Verifica se un esercizio e' compatibile con la location
 */
export function isExerciseCompatible(
  exerciseName: string,
  pattern: string,
  options: LocationAdaptationOptions
): boolean {
  const { location, homeType, equipment } = options;
  const lowerName = exerciseName.toLowerCase();

  // Cerca la variante nelle liste
  const variants = PATTERN_VARIANTS[pattern];
  if (variants) {
    const variant = variants.find(
      v => v.name.toLowerCase() === lowerName
    );

    if (variant) {
      if (location === 'gym') {
        return variant.equipment === 'gym' || variant.equipment === 'both';
      } else {
        if (homeType === 'bodyweight' || !equipment) {
          return variant.equipment === 'bodyweight' || variant.equipment === 'both';
        }
        // Con attrezzatura - piu' flessibile
        return true;
      }
    }
  }

  // Default: assume compatibile
  return true;
}

/**
 * Ottieni tutte le varianti disponibili per un pattern e location
 */
export function getAvailableVariants(
  pattern: string,
  location: LocationType,
  equipment?: HomeEquipment
): ExerciseVariant[] {
  const variants = PATTERN_VARIANTS[pattern];
  if (!variants) return [];

  return variants.filter(v => {
    if (location === 'gym') {
      return v.equipment === 'gym' || v.equipment === 'both';
    } else {
      // Casa
      if (!equipment) {
        return v.equipment === 'bodyweight';
      }
      // Con attrezzatura
      return v.equipment === 'bodyweight' || v.equipment === 'both';
    }
  });
}
