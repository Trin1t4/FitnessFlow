// ===== FORMULE E CALCOLI =====

export function calculateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
}

export function calculateTargetWeight(oneRepMax, percentage) {
  return Math.round((oneRepMax * percentage) / 2.5) * 2.5;
}

export function calculateTrainingWeight(oneRM, targetReps, RIR = 2) {
  if (!oneRM || oneRM === 0) return null;
  
  const maxReps = targetReps + RIR;
  const weight = oneRM * (37 - maxReps) / 36;
  
  return Math.round(weight / 2.5) * 2.5;
}

// ===== IMPORTS =====
import { 
  getExerciseForLocation
} from './exerciseSubstitutions.js';

// ===== HELPER: IDENTIFICA TIPO ESERCIZIO =====

function isBodyweightExercise(exerciseName) {
  const bodyweightKeywords = [
    'corpo libero', 'bodyweight', 'push-up', 'pull-up', 'trazioni', 'dips', 
    'plank', 'hollow body', 'superman', 'handstand', 'pike push-up',
    'diamond push-up', 'archer push-up', 'nordic curl', 'pistol squat',
    'jump', 'burpee', 'mountain climber', 'flutter kick', 'bicycle crunch',
    'leg raise', 'australian pull-up', 'inverted row bodyweight', 
    'dead hang', 'scapular', 'floor slide', 'bird dog', 'l-sit'
  ];
  
  const name = exerciseName.toLowerCase();
  return bodyweightKeywords.some(keyword => name.includes(keyword));
}

function hasWeightedEquipment(equipment) {
  if (!equipment) return false;
  
  return !!(
    equipment.barbell ||
    (equipment.dumbbellMaxKg && equipment.dumbbellMaxKg > 0) ||
    (equipment.kettlebellKg && equipment.kettlebellKg.length > 0)
  );
}

// ===== GENERAZIONE PROGRAMMA =====

export function generateProgram(input) {
  const { level, frequency, location, equipment, painAreas, assessments, goal, disabilityType, sportRole } = input;
  
  console.log('[PROGRAM] 🎯 generateProgram called with:', { location, equipment, goal });
  
  // SE PERFORMANCE → USA FILOSOFIA RUBINI
  if (goal === 'performance' && sportRole) {
    return generatePerformanceProgramRubini(input);
  }
  
  const specificBodyParts = input.specificBodyParts?.map(part => 
    part === 'upper_chest' ? 'chest' : part
  );

  let split, daysPerWeek;
  if (frequency <= 3) {
    split = "full_body";
    daysPerWeek = frequency;
  } else if (frequency === 4) {
    split = "upper_lower";
    daysPerWeek = 4;
  } else {
    split = "ppl";
    daysPerWeek = frequency;
  }

  let progression;
  if (level === "beginner") progression = "wave_loading";
  else if (level === "intermediate") progression = "ondulata_settimanale";
  else progression = "ondulata_giornaliera";

  const weeklySchedule = generateWeeklySchedule(
    split, daysPerWeek, location || 'gym', equipment, painAreas,
    assessments, level, goal, specificBodyParts, disabilityType, sportRole
  );

  const includesDeload = level === "intermediate" || level === "advanced";
  const deloadFrequency = includesDeload ? 4 : undefined;
  const requiresEndCycleTest = goal === "strength" || goal === "muscle_gain" || goal === "performance";

  let totalWeeks = 4;
  if (goal === "strength") totalWeeks = 8;
  else if (goal === "muscle_gain") totalWeeks = 12;
  else if (goal === "performance") totalWeeks = 8;

  return {
    name: `Programma ${split.toUpperCase()} - ${level}`,
    description: `${daysPerWeek}x/settimana, progressione ${progression}`,
    split,
    daysPerWeek,
    weeklySchedule,
    progression,
    includesDeload,
    deloadFrequency,
    totalWeeks,
    requiresEndCycleTest,
  };
}

// ===== PROGRAMMA STANDARD =====

function generateWeeklySchedule(split, daysPerWeek, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const schedule = [];
  
  console.log('[PROGRAM] 📅 generateWeeklySchedule with location:', location);
  
  if (split === "full_body") {
    for (let i = 0; i < daysPerWeek; i++) {
      schedule.push({
        dayName: i % 2 === 0 ? "Full Body A" : "Full Body B",
        exercises: generateFullBodyDay(i % 2 === 0 ? "A" : "B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole),
      });
    }
  } else if (split === "upper_lower") {
    schedule.push(
      { dayName: "Upper A", exercises: generateUpperDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Lower A", exercises: generateLowerDay("A", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Upper B", exercises: generateUpperDay("B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Lower B", exercises: generateLowerDay("B", location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
    );
  } else {
    schedule.push(
      { dayName: "Push", exercises: generatePushDay(location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Pull", exercises: generatePullDay(location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Legs", exercises: generateLegsDay(location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
    );
    if (daysPerWeek >= 6) {
      schedule.push(
        { dayName: "Push B", exercises: generatePushDay(location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
        { dayName: "Pull B", exercises: generatePullDay(location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
        { dayName: "Legs B", exercises: generateLegsDay(location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      );
    }
  }
  return schedule;
}

function generateFullBodyDay(variant, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  
  console.log('[PROGRAM] 💪 generateFullBodyDay with location:', location);
  
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (!painAreas.includes("knee") && !painAreas.includes("lower_back")) {
    exercises.push(createExercise(safeExercise("Squat"), location, equipment, baseLoad.squat, level, goal, "compound"));
  } else {
    exercises.push(createExercise("Leg Press", location, equipment, baseLoad.squat * 1.3, level, goal, "compound"));
  }

  if (!painAreas.includes("lower_back")) {
    exercises.push(createExercise(safeExercise(variant === "A" ? "Stacco" : "Romanian Deadlift"), location, equipment, baseLoad.deadlift, level, goal, "compound"));
  }

  if (!painAreas.includes("shoulder")) {
    exercises.push(createExercise(safeExercise(variant === "A" ? "Panca Piana" : "Panca Inclinata"), location, equipment, baseLoad.bench, level, goal, "compound"));
  }

  exercises.push(createExercise(variant === "A" ? "Trazioni" : "Rematore", location, equipment, baseLoad.pull, level, goal, "compound"));

  if (!painAreas.includes("shoulder")) {
    exercises.push(createExercise("Military Press", location, equipment, baseLoad.press, level, goal, "accessory"));
  }

  exercises.push(createExercise(goal === 'pregnancy' ? 'Bird Dog' : 'Plank', location, equipment, 0, level, goal, "core"));

  return exercises;
}

function generateUpperDay(variant, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    exercises.push(createExercise(safeExercise("Panca Piana"), location, equipment, baseLoad.bench, level, goal, "compound"));
    exercises.push(createExercise("Trazioni", location, equipment, baseLoad.pull, level, goal, "compound"));
  } else {
    exercises.push(createExercise(safeExercise("Panca Inclinata"), location, equipment, baseLoad.bench * 0.85, level, goal, "compound"));
    exercises.push(createExercise("Rematore Bilanciere", location, equipment, baseLoad.pull * 0.9, level, goal, "compound"));
  }

  exercises.push(createExercise("Military Press", location, equipment, baseLoad.press, level, goal, "accessory"));
  exercises.push(createExercise(variant === "A" ? "Curl bilanciere" : "French Press", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation"));

  return exercises;
}

function generateLowerDay(variant, location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  if (variant === "A") {
    exercises.push(createExercise(safeExercise("Squat"), location, equipment, baseLoad.squat, level, goal, "compound"));
    exercises.push(createExercise(safeExercise("Romanian Deadlift"), location, equipment, baseLoad.deadlift * 0.7, level, goal, "compound"));
  } else {
    exercises.push(createExercise(safeExercise("Front Squat"), location, equipment, baseLoad.squat * 0.8, level, goal, "compound"));
    exercises.push(createExercise(safeExercise("Stacco"), location, equipment, baseLoad.deadlift, level, goal, "compound"));
  }

  exercises.push(createExercise("Leg Curl", location, equipment, baseLoad.squat * 0.3, level, goal, "isolation"));
  
  if (!painAreas.includes("ankles")) {
    exercises.push(createExercise("Calf Raises", location, equipment, baseLoad.squat * 0.5, level, goal, "isolation"));
  }

  return exercises;
}

function generatePushDay(location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  exercises.push(createExercise(safeExercise("Panca Piana"), location, equipment, baseLoad.bench, level, goal, "compound"));
  exercises.push(createExercise("Military Press", location, equipment, baseLoad.press, level, goal, "compound"));
  exercises.push(createExercise("Dips", location, equipment, 0, level, goal, "compound"));
  exercises.push(createExercise("Croci manubri", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation"));
  exercises.push(createExercise("French Press", location, equipment, baseLoad.bench * 0.3, level, goal, "isolation"));

  return exercises;
}

function generatePullDay(location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  exercises.push(createExercise(safeExercise("Stacco"), location, equipment, baseLoad.deadlift, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Trazioni"), location, equipment, baseLoad.pull, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Rematore Bilanciere"), location, equipment, baseLoad.pull * 0.9, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Curl bilanciere"), location, equipment, baseLoad.bench * 0.3, level, goal, "isolation"));
  exercises.push(createExercise(safeExercise("Face Pull"), location, equipment, baseLoad.pull * 0.2, level, goal, "isolation"));

  return exercises;
}

function generateLegsDay(location, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments || []);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    if (goal === 'disability') return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    return name;
  };

  exercises.push(createExercise(safeExercise("Squat"), location, equipment, baseLoad.squat, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Leg Press"), location, equipment, baseLoad.squat * 1.5, level, goal, "compound"));
  exercises.push(createExercise(safeExercise("Romanian Deadlift"), location, equipment, baseLoad.deadlift * 0.7, level, goal, "compound"));
  exercises.push(createExercise("Leg Curl", location, equipment, baseLoad.squat * 0.3, level, goal, "isolation"));
  exercises.push(createExercise("Leg Extension", location, equipment, baseLoad.squat * 0.3, level, goal, "isolation"));

  return exercises;
}

// ✅ FIX COMPLETO: GESTIONE INTELLIGENTE PESO E REPS
function createExercise(name, location, equipment, baseWeight, level, goal, type) {
  let sets, reps, rest;

  console.log('[PROGRAM] 🎯 createExercise:', { name, location, equipment, goal, type });

  // Sets basati su livello
  if (level === "beginner") {
    sets = type === "compound" ? 3 : 2;
  } else if (level === "intermediate") {
    sets = type === "compound" ? 4 : 3;
  } else {
    sets = type === "compound" ? 5 : 3;
  }

  // Recupero basato su tipo
  if (type === "compound") rest = 180;
  else if (type === "accessory") rest = 120;
  else rest = 60;

  // Chiama exerciseSubstitutions per ottenere esercizio adattato
  const exerciseOrGiantSet = getExerciseForLocation(name, location, equipment, goal || 'muscle_gain', level);

  console.log('[PROGRAM] ✅ getExerciseForLocation returned:', exerciseOrGiantSet);

  // Se è Giant Set, ritorna direttamente
  if (typeof exerciseOrGiantSet !== 'string') {
    if (goal === 'pregnancy' || goal === 'disability') {
      const safeAlternative = goal === 'pregnancy' ? getPregnancySafeAlternative(name) : getDisabilitySafeAlternative(name);
      return {
        name: safeAlternative,
        sets,
        reps: type === "compound" ? "12-15" : "15-20",
        rest,
        weight: null,
        notes: `Esercizio adattato per sicurezza`,
      };
    }
    return exerciseOrGiantSet; // Giant set completo
  }

  // ✅ IDENTIFICA SE È CORPO LIBERO
  const isBodyweight = isBodyweightExercise(exerciseOrGiantSet);
  const hasEquipment = hasWeightedEquipment(equipment);

  console.log('[PROGRAM] 🔍 Exercise analysis:', { 
    name: exerciseOrGiantSet, 
    isBodyweight, 
    hasEquipment,
    location 
  });

  // ✅ DETERMINA REPS BASATO SU TIPO ESERCIZIO
  if (isBodyweight) {
    // CORPO LIBERO → reps alte
    if (type === "compound") reps = "12-15";
    else if (type === "accessory") reps = "15-20";
    else if (type === "isolation") reps = "20-25";
    else if (type === "core") reps = "30-60s";
    else reps = "15-20";
  } else {
    // CON PESI → reps standard
    if (type === "compound") reps = "5";
    else if (type === "accessory") reps = "10";
    else if (type === "isolation") reps = "12";
    else if (type === "core") reps = "30-60s";
    else reps = "10";
  }

  // ✅ CALCOLO PESO
  let trainingWeight = null;
  
  if (isBodyweight) {
    // ❌ CORPO LIBERO = NO PESO
    trainingWeight = null;
    console.log('[PROGRAM] ⭕ No weight (bodyweight exercise)');
    
  } else if (location === 'gym') {
    // ✅ PALESTRA = PESO PIENO
    if (baseWeight > 0) {
      let targetReps = 10;
      if (typeof reps === 'string' && reps.includes('-')) {
        targetReps = parseInt(reps.split('-')[1]);
      } else if (typeof reps === 'string' && !reps.includes('s')) {
        targetReps = parseInt(reps);
      }
      const RIR = level === 'beginner' ? 3 : 2;
      trainingWeight = calculateTrainingWeight(baseWeight, targetReps, RIR);
      console.log('[PROGRAM] ✅ Full weight (gym):', trainingWeight);
    }
    
  } else if (hasEquipment) {
    // ✅ PICCOLI ATTREZZI = PESO CALCOLATO
    if (baseWeight > 0) {
      let targetReps = 10;
      if (typeof reps === 'string' && reps.includes('-')) {
        targetReps = parseInt(reps.split('-')[1]);
      } else if (typeof reps === 'string' && !reps.includes('s')) {
        targetReps = parseInt(reps);
      }
      const RIR = level === 'beginner' ? 3 : 2;
      trainingWeight = calculateTrainingWeight(baseWeight, targetReps, RIR);
      
      // Limita al peso massimo disponibile
      if (equipment.dumbbellMaxKg && trainingWeight > equipment.dumbbellMaxKg) {
        trainingWeight = equipment.dumbbellMaxKg;
        console.log('[PROGRAM] ⚠️ Weight capped to max dumbbell:', trainingWeight);
      } else if (equipment.kettlebellKg && equipment.kettlebellKg.length > 0) {
        const maxKettlebell = Math.max(...equipment.kettlebellKg);
        if (trainingWeight > maxKettlebell) {
          trainingWeight = maxKettlebell;
          console.log('[PROGRAM] ⚠️ Weight capped to max kettlebell:', trainingWeight);
        }
      }
      console.log('[PROGRAM] ✅ Small equipment weight:', trainingWeight);
    }
  }

  return {
    name: exerciseOrGiantSet,
    sets,
    reps,
    rest,
    weight: trainingWeight,
    notes: type === "compound" ? "Esercizio fondamentale" : "Esercizio complementare",
  };
}

function getBaseLoads(assessments) {
  if (!assessments || !Array.isArray(assessments)) {
    console.warn('[PROGRAM] ⚠️ assessments is undefined or not array, using default loads');
    return {
      squat: 50,
      deadlift: 60,
      bench: 40,
      pull: 30,
      press: 30
    };
  }
  
  const findLoad = (exercise) => {
    const assessment = assessments.find((a) =>
      a.exerciseName?.toLowerCase().includes(exercise.toLowerCase())
    );
    return assessment ? assessment.oneRepMax : 50;
  };
  
  return {
    squat: findLoad("squat"),
    deadlift: findLoad("stacco"),
    bench: findLoad("panca"),
    pull: findLoad("trazioni") || findLoad("pull"),
    press: findLoad("press") || findLoad("spalle"),
  };
}

// ===== SAFETY FUNCTIONS =====

function isExerciseSafeForPregnancy(exerciseName) {
  const unsafeExercises = [
    'Crunch', 'Sit-up', 'V-ups', 'Leg Raises', 'Bicycle Crunch',
    'Panca Piana', 'Bench Press', 'Floor Press',
    'Stacco', 'Deadlift', 'Romanian Deadlift', 'Good Morning',
    'Box Jump', 'Burpees', 'Jump Squat', 'Jump Lunge',
    'Front Squat', 'Back Squat',
  ];
  
  return !unsafeExercises.some(unsafe => 
    exerciseName.toLowerCase().includes(unsafe.toLowerCase())
  );
}

function isExerciseSafeForDisability(exerciseName, disabilityType) {
  const complexExercises = [
    'Clean', 'Snatch', 'Clean & Jerk',
    'Bulgarian Split Squat', 'Single Leg RDL', 'Pistol Squat',
    'Overhead Squat', 'Snatch Grip Deadlift',
  ];
  
  return !complexExercises.some(complex => 
    exerciseName.toLowerCase().includes(complex.toLowerCase())
  );
}

function getPregnancySafeAlternative(exerciseName) {
  const alternatives = {
    'Panca Piana': 'Panca Inclinata 45°',
    'Bench Press': 'Incline Press',
    'Stacco': 'Hip Thrust',
    'Deadlift': 'Goblet Squat',
    'Squat': 'Goblet Squat',
    'Crunch': 'Bird Dog',
  };
  
  for (const [unsafe, safe] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(unsafe.toLowerCase())) {
      return safe;
    }
  }
  return exerciseName;
}

function getDisabilitySafeAlternative(exerciseName) {
  const alternatives = {
    'Bulgarian Split Squat': 'Leg Press',
    'Single Leg RDL': 'Seated Leg Curl',
    'Pistol Squat': 'Chair Squat',
  };
  
  for (const [complex, simple] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(complex.toLowerCase())) {
      return simple;
    }
  }
  return exerciseName;
}

// ===== PAIN MANAGEMENT =====

export function analyzePainPersistence(workouts) {
  const painAreas = {};
  workouts.forEach((w) => {
    if (w.painLevel && w.painLevel > 3 && w.painLocation) {
      painAreas[w.painLocation] = (painAreas[w.painLocation] || 0) + 1;
    }
  });
  
  const persistentPain = Object.entries(painAreas)
    .filter(([_, count]) => count >= 3)
    .map(([location, _]) => location);
  
  return {
    hasPersistentPain: persistentPain.length > 0,
    persistentAreas: persistentPain,
  };
}

export function checkRecoveryFromPain(workouts) {
  const lastThree = workouts.slice(0, 3);
  const noPainSessions = lastThree.filter((w) => !w.painLevel || w.painLevel <= 2);
  
  return {
    canReturnToNormal: noPainSessions.length === 3,
    painFreeSessions: noPainSessions.length,
  };
}

export function calculateDetrainingFactor(workouts) {
  if (workouts.length === 0) return 0.7;
  
  const lastWorkout = workouts[0];
  const daysSinceLastWorkout = lastWorkout.completedAt
    ? Math.floor((Date.now() - new Date(lastWorkout.completedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  if (daysSinceLastWorkout < 7) return 1.0;
  if (daysSinceLastWorkout < 14) return 0.95;
  if (daysSinceLastWorkout < 21) return 0.9;
  if (daysSinceLastWorkout < 30) return 0.85;
  return 0.7;
}

export function recalibrateProgram(assessments, detrainingFactor) {
  return assessments.map((a) => ({
    exerciseName: a.exerciseName,
    oneRepMax: a.oneRepMax * detrainingFactor,
  }));
}

// ===== PERFORMANCE RUBINI (stub - completa se necessario) =====

function generatePerformanceProgramRubini(input) {
  // Placeholder - implementa se necessario
  return generateProgram({ ...input, goal: 'strength' });
}
