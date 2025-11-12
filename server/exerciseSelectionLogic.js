import { GOAL_CONFIGS, EXERCISE_PROGRESSIONS } from './GOAL_CONFIGS_COMPLETE.js';

/**
 * Seleziona l'esercizio corretto basato su:
 * - Assessment (quale esercizio e quante reps riesce a fare)
 * - Goal (forza, ipertrofia, etc.)
 * - Livello utente (beginner, intermediate, advanced)
 */
export function selectExerciseByGoal(exerciseBaseName, assessment, goal, weekNumber = 1) {
  const goalConfig = GOAL_CONFIGS[goal] || GOAL_CONFIGS.muscle_gain;
  const progressions = EXERCISE_PROGRESSIONS[exerciseBaseName];
  
  if (!progressions || !progressions[goal]) {
    console.warn(`[SELECT] No progressions found for ${exerciseBaseName} + ${goal}`);
    return null;
  }
  
  const exerciseList = progressions[goal];
  
  // ===== FORZA: Logica speciale =====
  if (goal === 'strength') {
    return selectStrengthExercise(exerciseBaseName, assessment, exerciseList, weekNumber);
  }
  
  // ===== ALTRI GOAL: Selezione per livello =====
  return selectByLevel(exerciseList, assessment);
}

/**
 * FORZA: Selezione + Progressione Lineare
 * - Start da 3 reps
 * - Progressione settimanale: 3-3-3 → 4-3-3 → 4-4-3 → 4-4-4
 * - Quando >= 12 reps → test livello successivo
 * - Se >= 3 reps nel successivo → CAMBIA
 */
function selectStrengthExercise(exerciseBaseName, assessment, exerciseList, weekNumber) {
  const goalConfig = GOAL_CONFIGS.strength;
  
  // Trova esercizio attuale dell'utente dall'assessment
  let currentExerciseLevel = 1;
  let currentMaxReps = 0;
  
  if (assessment && assessment.variant) {
    // Trova il livello dell'esercizio che sta facendo
    const foundExercise = exerciseList.find(ex => 
      ex.name.toLowerCase() === assessment.variant.toLowerCase()
    );
    
    if (foundExercise) {
      currentExerciseLevel = foundExercise.level;
      currentMaxReps = assessment.maxReps || 0;
    }
  }
  
  // Se non ha assessment, inizia dal primo livello
  if (!assessment || currentMaxReps === 0) {
    const firstExercise = exerciseList[0];
    return {
      name: firstExercise.name,
      level: firstExercise.level,
      sets: 3,
      reps: '3-3-3',  // Start sempre da 3
      rest: goalConfig.rest.compound,
      notes: 'Forza - Livello 1: Parti da 3 reps, progressione lineare verso 12',
      progression: 'linear',
      targetReps: firstExercise.unlockReps || 12
    };
  }
  
  // Se ha >= 12 reps → suggerisci test livello successivo
  if (currentMaxReps >= (exerciseList[currentExerciseLevel - 1]?.unlockReps || 12)) {
    const nextExercise = exerciseList[currentExerciseLevel];  // +1 livello
    
    if (nextExercise) {
      return {
        name: nextExercise.name,
        level: nextExercise.level,
        sets: 3,
        reps: '3-3-3',  // Ricomincia da 3
        rest: goalConfig.rest.compound,
        notes: `✅ Livello sbloccato! Test ${nextExercise.name} - Se >= 3 reps, resta qui`,
        progression: 'unlock_test',
        previousExercise: exerciseList[currentExerciseLevel - 1].name,
        targetReps: nextExercise.unlockReps || 12
      };
    } else {
      // Ultimo livello: accumula volume
      return {
        name: exerciseList[currentExerciseLevel - 1].name,
        level: currentExerciseLevel,
        sets: 4,
        reps: calculateLinearReps(currentMaxReps, weekNumber),
        rest: goalConfig.rest.compound,
        notes: 'Forza - Livello massimo: Accumula volume',
        progression: 'volume',
        targetReps: 20  // Continua ad aumentare
      };
    }
  }
  
  // Progressione normale: calcola reps basato su weekNumber
  const currentExercise = exerciseList[currentExerciseLevel - 1];
  const repsString = calculateLinearReps(currentMaxReps, weekNumber);
  
  return {
    name: currentExercise.name,
    level: currentExercise.level,
    sets: 3,
    reps: repsString,
    rest: goalConfig.rest.compound,
    notes: `Forza - Settimana ${weekNumber}: Progressione verso ${currentExercise.unlockReps} reps`,
    progression: 'linear',
    targetReps: currentExercise.unlockReps || 12,
    weeksToUnlock: Math.ceil(((currentExercise.unlockReps || 12) - currentMaxReps) / 3)
  };
}

/**
 * Calcola reps per progressione lineare forza
 * Week 1: 3-3-3
 * Week 2: 4-3-3
 * Week 3: 4-4-3
 * Week 4: 4-4-4
 * Week 5: 5-4-4
 * etc.
 */
function calculateLinearReps(startReps, weekNumber) {
  const baseReps = Math.max(3, startReps);  // Non scendere sotto 3
  const weeksElapsed = weekNumber - 1;
  
  // Ogni 3 settimane aumenta di 1 rep il "target"
  const targetReps = baseReps + Math.floor(weeksElapsed / 3);
  
  // Quali set sono al target?
  const setsAtTarget = (weeksElapsed % 3) + 1;
  
  // Costruisci stringa reps
  const reps = [];
  for (let i = 1; i <= 3; i++) {
    if (i <= setsAtTarget) {
      reps.push(targetReps);
    } else {
      reps.push(targetReps - 1);
    }
  }
  
  return reps.join('-');
}

/**
 * ALTRI GOAL: Selezione per livello
 */
function selectByLevel(exerciseList, assessment) {
  // Se non c'è assessment, usa primo livello
  if (!assessment || !assessment.level) {
    return exerciseList[0];
  }
  
  // Mappa level string a number
  const levelMap = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3
  };
  
  const levelNum = levelMap[assessment.level] || 1;
  
  // Trova esercizio con livello più vicino
  const exercise = exerciseList.find(ex => ex.level === levelNum) || exerciseList[0];
  
  return {
    ...exercise,
    sets: 3,  // Default
    rest: 90  // Default
  };
}

/**
 * Helper: Verifica se utente può passare a livello successivo
 */
export function canUnlockNextLevel(currentExercise, maxReps, goal) {
  if (goal !== 'strength') return false;
  
  const unlockThreshold = GOAL_CONFIGS.strength.unlockThreshold;
  return maxReps >= unlockThreshold;
}

/**
 * Helper: Test livello successivo
 */
export function testNextLevel(exerciseBaseName, currentLevel, goal) {
  const progressions = EXERCISE_PROGRESSIONS[exerciseBaseName];
  if (!progressions || !progressions[goal]) return null;
  
  const exerciseList = progressions[goal];
  const nextExercise = exerciseList.find(ex => ex.level === currentLevel + 1);
  
  return nextExercise || null;
}

console.log('✅ Exercise selection logic loaded');
