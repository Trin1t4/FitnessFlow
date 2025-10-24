// ===== FORMULE E CALCOLI =====

export function calculateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
}

export function calculateTargetWeight(oneRepMax, percentage) {
  return Math.round((oneRepMax * percentage) / 2.5) * 2.5;
}

// ===== IMPORTS =====
import { 
  getExerciseForLocation
} from './exerciseSubstitutions.js';

// ===== MAPPATURA BODY PARTS -> ESERCIZI =====

const BODY_PART_EXERCISES = {
  chest: ['Panca Piana', 'Panca Inclinata', 'Chest Press', 'Chest Fly', 'Push-up'],
  arms: ['Curl bilanciere', 'French Press', 'Dips', 'Hammer Curl', 'Triceps Pushdown', 'Concentration Curl'],
  shoulders: ['Military Press', 'Alzate laterali', 'Face Pull', 'Arnold Press', 'Shoulder Press'],
  back_width: ['Trazioni', 'Lat Machine', 'Pull-down', 'Straight Arm Pulldown'],
  back_thickness: ['Rematore', 'Rematore Bilanciere', 'Seal Row', 'T-Bar Row', 'Chest Supported Row'],
  legs: ['Squat', 'Leg Press', 'Leg Extension', 'Bulgarian Split Squat', 'Hack Squat'],
  glutes: ['Hip Thrust', 'Glute Bridge', 'Romanian Deadlift', 'Abductor Machine', 'Kickback'],
  abs: ['Crunch', 'Cable Crunch', 'Ab Wheel', 'Hanging Leg Raise', 'Russian Twist'],
  calves: ['Calf Raises', 'Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise'],
};

const SOCCER_ROLE_EXERCISES = {
  portiere: ['Box Jump', 'Lateral Bound', 'Med Ball Slam', 'Single Leg RDL', 'Split Squat Jump', 'Plank with Reach'],
  difensore: ['Squat', 'Deadlift', 'Rematore Bilanciere', 'Panca Piana', 'Core Rotation', 'Farmer Walk'],
  centrocampista: ['Burpees', 'Mountain Climbers', 'Step-up', 'Battle Ropes', 'Box Step', 'Kettlebell Swing'],
  attaccante: ['Sprint Drills', 'Jump Squat', 'Power Clean', 'Box Jump', 'Single Leg Bound', 'Explosive Push-up'],
};

function getExercisesForBodyPart(bodyPart, level) {
  const exercises = BODY_PART_EXERCISES[bodyPart] || [];
  if (level === 'beginner') {
    return exercises.slice(0, 1);
  } else if (level === 'intermediate') {
    return exercises.slice(0, 2);
  } else {
    return exercises.slice(0, 2);
  }
}

function getExercisesForSoccerRole(role, level) {
  const exercises = SOCCER_ROLE_EXERCISES[role] || [];
  if (level === 'beginner') {
    return exercises.slice(0, 2);
  } else if (level === 'intermediate') {
    return exercises.slice(0, 3);
  } else {
    return exercises.slice(0, 3);
  }
}

// ===== REGOLE SICUREZZA ESERCIZI =====

const PREGNANCY_UNSAFE_EXERCISES = [
  'Crunch', 'Sit-up', 'V-ups', 'Leg Raises', 'Bicycle Crunch',
  'Panca Piana', 'Bench Press', 'Floor Press',
  'Stacco', 'Deadlift', 'Romanian Deadlift', 'Good Morning',
  'Box Jump', 'Burpees', 'Jump Squat', 'Jump Lunge',
  'Front Squat', 'Back Squat',
];

const PREGNANCY_SAFE_EXERCISES_BY_TRIMESTER = {
  1: {
    recommended: [
      'Squat (leggero)', 'Goblet Squat', 'Wall Sit', 'Incline Chest Press',
      'Cable Row', 'Lat Pulldown', 'Shoulder Press (leggero)', 'Lateral Raise',
      'Bicep Curl', 'Triceps Extension', 'Bird Dog', 'Side Plank', 'Pelvic Tilt', 'Cat-Cow',
    ],
    modifications: [
      'Mantenere carichi moderati (50-60% 1RM)',
      'Evitare Valsalva - respirare sempre',
      'Stop immediato se dolore o pressione pelvica',
    ],
  },
  2: {
    recommended: [
      'Goblet Squat', 'Wall Sit', 'Incline Chest Press (45°)', 'Cable Row',
      'Lat Pulldown', 'Seated Shoulder Press', 'Lateral Raise', 'Bicep Curl',
      'Triceps Pushdown', 'Bird Dog', 'Modified Side Plank', 'Pelvic Tilt',
      'Cat-Cow', 'Glute Bridge (elevato)',
    ],
    modifications: [
      'NO esercizi supini (sostituire con inclinata 45°+)',
      'Carichi ridotti (40-50% 1RM)',
      'Focus su stabilità e mobilità',
      'Pause frequenti e idratazione',
    ],
  },
  3: {
    recommended: [
      'Wall Sit (breve)', 'Incline Chest Press (60°)', 'Seated Cable Row',
      'Lat Pulldown (leggero)', 'Seated Shoulder Press (leggero)', 'Lateral Raise (leggero)',
      'Bicep Curl', 'Triceps Pushdown', 'Bird Dog (modificato)', 'Wall Push-ups',
      'Pelvic Tilt', 'Cat-Cow', 'Breathing exercises',
    ],
    modifications: [
      'Carichi minimi (30-40% 1RM)',
      'NO esercizi supini, NO addominali diretti',
      'Priorità: mobilità, respirazione, postura',
      'Range motion ridotto per comfort',
      'Preparazione al parto - focus pavimento pelvico',
    ],
  },
};

const DISABILITY_COMPLEX_EXERCISES = [
  'Clean', 'Snatch', 'Clean & Jerk',
  'Bulgarian Split Squat', 'Single Leg RDL', 'Pistol Squat',
  'Overhead Squat', 'Snatch Grip Deadlift',
];

const DISABILITY_SPECIFIC_EXERCISES = {
  paraplegia: {
    recommended: [
      'Chest Press Machine', 'Shoulder Press Machine', 'Lat Pulldown', 'Seated Row',
      'Cable Fly', 'Triceps Pushdown', 'Bicep Curl', 'Cable Crunch',
    ],
    avoid: [
      'Squat', 'Deadlift', 'Leg Press', 'Lunges', 'Romanian Deadlift',
      'Bulgarian Split Squat', 'Calf Raises', 'Leg Extension', 'Leg Curl',
    ],
    modifications: [
      'Usare sempre macchine con seduta stabile',
      'Focus su upper body e core',
      'Evitare esercizi che richiedono equilibrio',
    ],
  },
  tetraplegia: {
    recommended: [
      'Chest Press Machine assistito', 'Lat Machine con supporto',
      'Cable exercises con assistenza', 'Core exercises da seduti',
    ],
    avoid: [
      'Squat', 'Deadlift', 'Overhead Press', 'Barbell exercises',
      'Free weights senza supervisione',
    ],
    modifications: [
      'Tutto da seduti con massimo supporto',
      'Usare macchine con cinture di sicurezza',
      'Assistenza necessaria per tutti gli esercizi',
    ],
  },
  hemiplegia: {
    recommended: [
      'Cable exercises unilaterali', 'Machine exercises', 'Leg Press (lato funzionale)',
      'Chest Press Machine', 'Lat Pulldown', 'Seated Row', 'Core stability exercises',
    ],
    avoid: [
      'Barbell Squat', 'Barbell Deadlift', 'Standing Overhead Press',
      'Esercizi che richiedono coordinazione bilaterale',
    ],
    modifications: [
      'Lavorare più sul lato debole',
      'Usare macchine per stabilità',
      'Evitare bilancieri, preferire manubri/cavi',
    ],
  },
  amputazione_arti_inferiori: {
    recommended: [
      'Chest Press', 'Shoulder Press', 'Lat Pulldown', 'Seated Row',
      'Cable Fly', 'Leg Press (se protesi)', 'Core exercises da seduti',
    ],
    avoid: [
      'Standing Squat', 'Standing Deadlift', 'Lunges',
      'Bulgarian Split Squat', 'Standing Calf Raises',
    ],
    modifications: [
      'Tutti gli esercizi upper body standard',
      'Lower body solo se con protesi adeguata',
      'Focus su stabilità del core',
    ],
  },
  amputazione_arti_superiori: {
    recommended: [
      'Leg Press', 'Squat con supporto', 'Romanian Deadlift con trap bar',
      'Leg Extension', 'Leg Curl', 'Cable exercises (lato funzionale)',
      'Machine exercises unilaterali',
    ],
    avoid: [
      'Barbell Bench Press', 'Barbell Squat', 'Barbell Overhead Press',
      'Esercizi che richiedono presa bilaterale',
    ],
    modifications: [
      'Usare macchine e cavi per upper body',
      'Lower body standard se equilibrio ok',
      'Evitare bilancieri',
    ],
  },
  sclerosi_multipla: {
    recommended: [
      'Machine exercises', 'Cable exercises seduti', 'Leg Press',
      'Chest Press Machine', 'Lat Pulldown', 'Seated Row',
      'Leg Extension', 'Leg Curl',
    ],
    avoid: [
      'Free weights complessi', 'Olympic lifts', 'Esercizi ad alta coordinazione',
      'Deadlift', 'Overhead Press standing',
    ],
    modifications: [
      'Privilegiare macchine guidate',
      'Evitare affaticamento eccessivo',
      'Adattare in base alla fatica giornaliera',
    ],
  },
  distrofia_muscolare: {
    recommended: [
      'Machine exercises a basso carico', 'Cable exercises', 'Leg Press leggero',
      'Chest Press Machine', 'Lat Pulldown', 'Core exercises isometrici',
    ],
    avoid: [
      'Carichi pesanti', 'Esercizi eccentrici intensi', 'Deadlift',
      'Squat pesanti', 'Overhead Press',
    ],
    modifications: [
      'Carichi molto bassi, alto volume',
      'Focus su mantenimento forza',
      'Evitare progressione aggressiva',
    ],
  },
  cerebral_palsy: {
    recommended: [
      'Machine exercises con supporto', 'Cable exercises seduti', 'Leg Press',
      'Chest Press Machine', 'Lat Machine', 'Seated exercises',
    ],
    avoid: [
      'Free weights in piedi', 'Esercizi instabili', 'Olympic lifts',
      'Bulgarian Split Squat', 'Single leg exercises',
    ],
    modifications: [
      'Tutto da seduti o con massimo supporto',
      'Macchine guidate prioritarie',
      'Focus su pattern motori semplici',
    ],
  },
  altra: {
    recommended: ['Machine exercises', 'Cable exercises', 'Esercizi adattabili'],
    avoid: ['Olympic lifts', 'Esercizi complessi multi-articolari'],
    modifications: ['Adattare caso per caso', 'Consultare specialista'],
  },
};

export function isExerciseSafeForPregnancy(exerciseName) {
  return !PREGNANCY_UNSAFE_EXERCISES.some(unsafe => 
    exerciseName.toLowerCase().includes(unsafe.toLowerCase())
  );
}

export function isExerciseSafeForDisability(exerciseName, disabilityType) {
  if (disabilityType && DISABILITY_SPECIFIC_EXERCISES[disabilityType]) {
    const specificAvoid = DISABILITY_SPECIFIC_EXERCISES[disabilityType].avoid;
    const isInAvoidList = specificAvoid.some(avoid => 
      exerciseName.toLowerCase().includes(avoid.toLowerCase())
    );
    if (isInAvoidList) return false;
  }
  return !DISABILITY_COMPLEX_EXERCISES.some(complex => 
    exerciseName.toLowerCase().includes(complex.toLowerCase())
  );
}

export function getRecommendedExercisesForDisability(disabilityType) {
  if (DISABILITY_SPECIFIC_EXERCISES[disabilityType]) {
    return DISABILITY_SPECIFIC_EXERCISES[disabilityType].recommended;
  }
  return [];
}

export function getDisabilityModifications(disabilityType) {
  if (DISABILITY_SPECIFIC_EXERCISES[disabilityType]) {
    return DISABILITY_SPECIFIC_EXERCISES[disabilityType].modifications;
  }
  return [];
}

export function getPregnancySafeAlternative(exerciseName) {
  const alternatives = {
    'Panca Piana': 'Panca Inclinata 45°',
    'Bench Press': 'Incline Press',
    'Floor Press': 'Standing Cable Press',
    'Stacco': 'Hip Thrust',
    'Deadlift': 'Goblet Squat',
    'Romanian Deadlift': 'Cable Pull Through',
    'Good Morning': 'Cable Pull Through',
    'Squat': 'Goblet Squat',
    'Front Squat': 'Goblet Squat',
    'Back Squat': 'Goblet Squat',
    'Crunch': 'Bird Dog',
    'Sit-up': 'Dead Bug',
    'V-ups': 'Dead Bug',
    'Leg Raises': 'Side Plank',
    'Bicycle Crunch': 'Side Plank',
    'Box Jump': 'Step-ups',
    'Burpees': 'Modified Burpees (no jump)',
    'Jump Squat': 'Bodyweight Squat',
    'Jump Lunge': 'Static Lunge',
  };
  
  for (const [unsafe, safe] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(unsafe.toLowerCase())) {
      return safe;
    }
  }
  return exerciseName;
}

export function getDisabilitySafeAlternative(exerciseName) {
  const alternatives = {
    'Bulgarian Split Squat': 'Leg Press',
    'Single Leg RDL': 'Seated Leg Curl',
    'Pistol Squat': 'Chair Squat',
    'Overhead Squat': 'Goblet Squat',
    'Snatch Grip Deadlift': 'Trap Bar Deadlift',
    'Clean': 'Dumbbell Clean',
    'Snatch': 'Dumbbell Snatch',
    'Clean & Jerk': 'Push Press',
  };
  
  for (const [complex, simple] of Object.entries(alternatives)) {
    if (exerciseName.toLowerCase().includes(complex.toLowerCase())) {
      return simple;
    }
  }
  return exerciseName;
}

// ===== GENERAZIONE PROGRAMMA =====

export function generateProgram(input) {
  const { level, frequency, location, hasGym, equipment, painAreas, assessments, goal, disabilityType, sportRole } = input;
  
  const specificBodyParts = input.specificBodyParts?.map(part => 
    part === 'upper_chest' ? 'chest' : part
  );

  let split;
  let daysPerWeek;
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
  if (level === "beginner") {
    progression = "wave_loading";
  } else if (level === "intermediate") {
    progression = "ondulata_settimanale";
  } else {
    progression = "ondulata_giornaliera";
  }

  const weeklySchedule = generateWeeklySchedule(
    split, daysPerWeek, location || 'gym', hasGym, equipment, painAreas,
    assessments, level, goal, specificBodyParts, disabilityType, sportRole
  );

  const includesDeload = level === "intermediate" || level === "advanced";
  const deloadFrequency = includesDeload ? 4 : undefined;
  const requiresEndCycleTest = goal === "strength" || goal === "muscle_gain" || goal === "performance";

  let totalWeeks = 4;
  if (goal === "strength") totalWeeks = 8;
  else if (goal === "muscle_gain") totalWeeks = 12;
  else if (goal === "performance") totalWeeks = 8;
  else if (goal === "pregnancy") totalWeeks = 4;
  else if (goal === "disability") totalWeeks = 6;

  return {
    name: `Programma ${split.toUpperCase()} - ${level}`,
    description: `${daysPerWeek}x/settimana, progressione ${progression}${includesDeload ? ' (con deload ogni 4 settimane)' : ''}`,
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

function generateWeeklySchedule(split, daysPerWeek, location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const schedule = [];
  
  if (split === "full_body") {
    for (let i = 0; i < daysPerWeek; i++) {
      const dayName = i % 2 === 0 ? "Full Body A" : "Full Body B";
      schedule.push({
        dayName,
        exercises: generateFullBodyDay(i % 2 === 0 ? "A" : "B", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole),
      });
    }
  } else if (split === "upper_lower") {
    schedule.push(
      { dayName: "Upper A", exercises: generateUpperDay("A", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Lower A", exercises: generateLowerDay("A", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Upper B", exercises: generateUpperDay("B", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Lower B", exercises: generateLowerDay("B", location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
    );
  } else {
    schedule.push(
      { dayName: "Push", exercises: generatePushDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Pull", exercises: generatePullDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      { dayName: "Legs", exercises: generateLegsDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
    );
    if (daysPerWeek >= 6) {
      schedule.push(
        { dayName: "Push B", exercises: generatePushDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
        { dayName: "Pull B", exercises: generatePullDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
        { dayName: "Legs B", exercises: generateLegsDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) },
      );
    }
  }
  return schedule;
}

function generateFullBodyDay(variant, location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') {
      return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    } else if (goal === 'disability') {
      return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    }
    return name;
  };

  if (!painAreas.includes("knee") && !painAreas.includes("lower_back")) {
    const squat = safeExercise("Squat");
    exercises.push(createExercise(squat, location, hasGym, equipment, baseLoad.squat, level, goal, "compound"));
  } else {
    exercises.push(createExercise("Leg Press", location, hasGym, equipment, baseLoad.squat * 1.3, level, goal, "compound"));
  }

  if (!painAreas.includes("lower_back")) {
    const hinge = safeExercise(variant === "A" ? "Stacco" : "Romanian Deadlift");
    exercises.push(createExercise(hinge, location, hasGym, equipment, baseLoad.deadlift, level, goal, "compound"));
  }

  if (!painAreas.includes("shoulder")) {
    const push = safeExercise(variant === "A" ? "Panca Piana" : "Panca Inclinata");
    exercises.push(createExercise(push, location, hasGym, equipment, baseLoad.bench, level, goal, "compound"));
  }

  exercises.push(createExercise(variant === "A" ? "Trazioni" : "Rematore", location, hasGym, equipment, baseLoad.pull, level, goal, "compound"));

  if (!painAreas.includes("shoulder")) {
    exercises.push(createExercise("Military Press", location, hasGym, equipment, baseLoad.press, level, goal, "accessory"));
  }

  const coreExercise = goal === 'pregnancy' ? 'Bird Dog' : 'Plank';
  exercises.push(createExercise(coreExercise, location, hasGym, equipment, 0, level, goal, "core"));

  const existingExercises = new Set(exercises.map(ex => ex.name?.toLowerCase()));

  if (specificBodyParts && specificBodyParts.length > 0) {
    specificBodyParts.forEach(bodyPart => {
      const extraExercises = getExercisesForBodyPart(bodyPart, level);
      extraExercises.forEach(ex => {
        if (existingExercises.has(ex.toLowerCase())) return;
        
        let safeEx = ex;
        if (goal === 'pregnancy' && !isExerciseSafeForPregnancy(ex)) {
          safeEx = getPregnancySafeAlternative(ex);
        } else if (goal === 'disability' && !isExerciseSafeForDisability(ex, disabilityType)) {
          safeEx = getDisabilitySafeAlternative(ex);
        }
        
        const shouldSkip = painAreas.some(area => {
          if (area === 'knee' && (safeEx.toLowerCase().includes('squat') || safeEx.toLowerCase().includes('lunge'))) return true;
          if (area === 'shoulder' && safeEx.toLowerCase().includes('press')) return true;
          if (area === 'lower_back' && safeEx.toLowerCase().includes('deadlift')) return true;
          return false;
        });
        
        if (!shouldSkip && !existingExercises.has(safeEx.toLowerCase())) {
          exercises.push(createExercise(safeEx, location, hasGym, equipment, 0, level, goal, "isolation"));
          existingExercises.add(safeEx.toLowerCase());
        }
      });
    });
  }

  if (sportRole && goal === 'performance') {
    const roleExercises = getExercisesForSoccerRole(sportRole, level);
    roleExercises.forEach(ex => {
      if (existingExercises.has(ex.toLowerCase())) return;
      
      const shouldSkip = painAreas.some(area => {
        if (area === 'knee' && (ex.toLowerCase().includes('squat') || ex.toLowerCase().includes('jump'))) return true;
        if (area === 'shoulder' && ex.toLowerCase().includes('press')) return true;
        if (area === 'ankles' && ex.toLowerCase().includes('jump')) return true;
        return false;
      });
      
      if (!shouldSkip && !existingExercises.has(ex.toLowerCase())) {
        exercises.push(createExercise(ex, location, hasGym, equipment, 0, level, goal, "accessory"));
        existingExercises.add(ex.toLowerCase());
      }
    });
  }

  return exercises;
}

function generateUpperDay(variant, location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') {
      return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    } else if (goal === 'disability') {
      return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    }
    return name;
  };

  if (variant === "A") {
    const bench = safeExercise("Panca Piana");
    exercises.push(createExercise(bench, location, hasGym, equipment, baseLoad.bench, level, goal, "compound"));
    exercises.push(createExercise("Trazioni", location, hasGym, equipment, baseLoad.pull, level, goal, "compound"));
  } else {
    const incline = safeExercise("Panca Inclinata");
    exercises.push(createExercise(incline, location, hasGym, equipment, baseLoad.bench * 0.85, level, goal, "compound"));
    exercises.push(createExercise("Rematore Bilanciere", location, hasGym, equipment, baseLoad.pull * 0.9, level, goal, "compound"));
  }

  exercises.push(createExercise("Military Press", location, hasGym, equipment, baseLoad.press, level, goal, "accessory"));
  exercises.push(createExercise(variant === "A" ? "Curl bilanciere" : "French Press", location, hasGym, equipment, 0, level, goal, "isolation"));

  const existingExercises = new Set(exercises.map(ex => ex.name?.toLowerCase()));

  if (specificBodyParts && specificBodyParts.length > 0) {
    specificBodyParts.forEach(bodyPart => {
      if (['chest', 'arms', 'shoulders', 'back_width', 'back_thickness'].includes(bodyPart)) {
        const extraExercises = getExercisesForBodyPart(bodyPart, level);
        extraExercises.forEach(ex => {
          if (existingExercises.has(ex.toLowerCase())) return;
          
          let safeEx = ex;
          if (goal === 'pregnancy' && !isExerciseSafeForPregnancy(ex)) {
            safeEx = getPregnancySafeAlternative(ex);
          } else if (goal === 'disability' && !isExerciseSafeForDisability(ex, disabilityType)) {
            safeEx = getDisabilitySafeAlternative(ex);
          }
          
          const shouldSkip = painAreas.some(area => {
            if (area === 'shoulder' && safeEx.toLowerCase().includes('press')) return true;
            return false;
          });
          
          if (!shouldSkip && !existingExercises.has(safeEx.toLowerCase())) {
            exercises.push(createExercise(safeEx, location, hasGym, equipment, 0, level, goal, "isolation"));
            existingExercises.add(safeEx.toLowerCase());
          }
        });
      }
    });
  }

  if (sportRole && goal === 'performance') {
    const roleExercises = getExercisesForSoccerRole(sportRole, level);
    roleExercises.forEach(ex => {
      if (existingExercises.has(ex.toLowerCase())) return;
      
      const shouldSkip = painAreas.some(area => {
        if (area === 'knee' && (ex.toLowerCase().includes('squat') || ex.toLowerCase().includes('jump'))) return true;
        if (area === 'shoulder' && ex.toLowerCase().includes('press')) return true;
        if (area === 'ankles' && ex.toLowerCase().includes('jump')) return true;
        return false;
      });
      
      if (!shouldSkip && !existingExercises.has(ex.toLowerCase())) {
        exercises.push(createExercise(ex, location, hasGym, equipment, 0, level, goal, "accessory"));
        existingExercises.add(ex.toLowerCase());
      }
    });
  }

  return exercises;
}

function generateLowerDay(variant, location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') {
      return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    } else if (goal === 'disability') {
      return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    }
    return name;
  };

  if (variant === "A") {
    const squat = safeExercise("Squat");
    exercises.push(createExercise(squat, location, hasGym, equipment, baseLoad.squat, level, goal, "compound"));
    const rdl = safeExercise("Romanian Deadlift");
    exercises.push(createExercise(rdl, location, hasGym, equipment, baseLoad.deadlift * 0.7, level, goal, "compound"));
  } else {
    const frontSquat = safeExercise("Front Squat");
    exercises.push(createExercise(frontSquat, location, hasGym, equipment, baseLoad.squat * 0.8, level, goal, "compound"));
    const deadlift = safeExercise("Stacco");
    exercises.push(createExercise(deadlift, location, hasGym, equipment, baseLoad.deadlift, level, goal, "compound"));
  }

  exercises.push(createExercise("Leg Curl", location, hasGym, equipment, 0, level, goal, "isolation"));
  
  if (!painAreas.includes("ankles")) {
    exercises.push(createExercise("Calf Raises", location, hasGym, equipment, 0, level, goal, "isolation"));
  }

  const existingExercises = new Set(exercises.map(ex => ex.name?.toLowerCase()));

  if (specificBodyParts && specificBodyParts.length > 0) {
    specificBodyParts.forEach(bodyPart => {
      if (['legs', 'glutes', 'calves', 'abs'].includes(bodyPart)) {
        const extraExercises = getExercisesForBodyPart(bodyPart, level);
        extraExercises.forEach(ex => {
          if (existingExercises.has(ex.toLowerCase())) return;
          
          let safeEx = ex;
          if (goal === 'pregnancy' && !isExerciseSafeForPregnancy(ex)) {
            safeEx = getPregnancySafeAlternative(ex);
          } else if (goal === 'disability' && !isExerciseSafeForDisability(ex, disabilityType)) {
            safeEx = getDisabilitySafeAlternative(ex);
          }
          
          const shouldSkip = painAreas.some(area => {
            if (area === 'knee' && (safeEx.toLowerCase().includes('squat') || safeEx.toLowerCase().includes('lunge'))) return true;
            if (area === 'lower_back' && safeEx.toLowerCase().includes('deadlift')) return true;
            if (area === 'ankles' && (safeEx.toLowerCase().includes('calf') || safeEx.toLowerCase().includes('jump'))) return true;
            return false;
          });
          
          if (!shouldSkip && !existingExercises.has(safeEx.toLowerCase())) {
            exercises.push(createExercise(safeEx, location, hasGym, equipment, 0, level, goal, "isolation"));
            existingExercises.add(safeEx.toLowerCase());
          }
        });
      }
    });
  }

  if (sportRole && goal === 'performance') {
    const roleExercises = getExercisesForSoccerRole(sportRole, level);
    roleExercises.forEach(ex => {
      if (existingExercises.has(ex.toLowerCase())) return;
      
      const shouldSkip = painAreas.some(area => {
        if (area === 'knee' && (ex.toLowerCase().includes('squat') || ex.toLowerCase().includes('jump'))) return true;
        if (area === 'shoulder' && ex.toLowerCase().includes('press')) return true;
        if (area === 'ankles' && ex.toLowerCase().includes('jump')) return true;
        return false;
      });
      
      if (!shouldSkip && !existingExercises.has(ex.toLowerCase())) {
        exercises.push(createExercise(ex, location, hasGym, equipment, 0, level, goal, "accessory"));
        existingExercises.add(ex.toLowerCase());
      }
    });
  }

  return exercises;
}

function generatePushDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') {
      return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    } else if (goal === 'disability') {
      return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    }
    return name;
  };

  const bench = safeExercise("Panca Piana");
  exercises.push(createExercise(bench, location, hasGym, equipment, baseLoad.bench, level, goal, "compound"));
  exercises.push(createExercise("Military Press", location, hasGym, equipment, baseLoad.press, level, goal, "compound"));
  exercises.push(createExercise("Dips", location, hasGym, equipment, 0, level, goal, "compound"));
  exercises.push(createExercise("Croci manubri", location, hasGym, equipment, 0, level, goal, "isolation"));
  exercises.push(createExercise("French Press", location, hasGym, equipment, 0, level, goal, "isolation"));

  const existingExercises = new Set(exercises.map(ex => ex.name?.toLowerCase()));

  if (specificBodyParts && specificBodyParts.length > 0) {
    specificBodyParts.forEach(bodyPart => {
      if (['chest', 'arms', 'shoulders'].includes(bodyPart)) {
        const extraExercises = getExercisesForBodyPart(bodyPart, level);
        extraExercises.forEach(ex => {
          if (existingExercises.has(ex.toLowerCase())) return;
          
          let safeEx = ex;
          if (goal === 'pregnancy' && !isExerciseSafeForPregnancy(ex)) {
            safeEx = getPregnancySafeAlternative(ex);
          } else if (goal === 'disability' && !isExerciseSafeForDisability(ex, disabilityType)) {
            safeEx = getDisabilitySafeAlternative(ex);
          }
          
          const shouldSkip = painAreas.some(area => {
            if (area === 'shoulder' && safeEx.toLowerCase().includes('press')) return true;
            return false;
          });
          
          if (!shouldSkip && !existingExercises.has(safeEx.toLowerCase())) {
            exercises.push(createExercise(safeEx, location, hasGym, equipment, 0, level, goal, "isolation"));
            existingExercises.add(safeEx.toLowerCase());
          }
        });
      }
    });
  }

  if (sportRole && goal === 'performance') {
    const roleExercises = getExercisesForSoccerRole(sportRole, level);
    roleExercises.forEach(ex => {
      if (existingExercises.has(ex.toLowerCase())) return;
      
      const shouldSkip = painAreas.some(area => {
        if (area === 'knee' && (ex.toLowerCase().includes('squat') || ex.toLowerCase().includes('jump'))) return true;
        if (area === 'shoulder' && ex.toLowerCase().includes('press')) return true;
        if (area === 'ankles' && ex.toLowerCase().includes('jump')) return true;
        return false;
      });
      
      if (!shouldSkip && !existingExercises.has(ex.toLowerCase())) {
        exercises.push(createExercise(ex, location, hasGym, equipment, 0, level, goal, "accessory"));
        existingExercises.add(ex.toLowerCase());
      }
    });
  }

  return exercises;
}

function generatePullDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') {
      return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    } else if (goal === 'disability') {
      return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    }
    return name;
  };

  const deadlift = safeExercise("Stacco");
  exercises.push(createExercise(deadlift, location, hasGym, equipment, baseLoad.deadlift, level, goal, "compound"));
  const pullup = safeExercise("Trazioni");
  exercises.push(createExercise(pullup, location, hasGym, equipment, baseLoad.pull, level, goal, "compound"));
  const row = safeExercise("Rematore Bilanciere");
  exercises.push(createExercise(row, location, hasGym, equipment, baseLoad.pull * 0.9, level, goal, "compound"));
  const curl = safeExercise("Curl bilanciere");
  exercises.push(createExercise(curl, location, hasGym, equipment, 0, level, goal, "isolation"));
  const facePull = safeExercise("Face Pull");
  exercises.push(createExercise(facePull, location, hasGym, equipment, 0, level, goal, "isolation"));

  const existingExercises = new Set(exercises.map(ex => ex.name?.toLowerCase()));

  if (specificBodyParts && specificBodyParts.length > 0) {
    specificBodyParts.forEach(bodyPart => {
      if (['back_width', 'back_thickness', 'arms'].includes(bodyPart)) {
        const extraExercises = getExercisesForBodyPart(bodyPart, level);
        extraExercises.forEach(ex => {
          if (existingExercises.has(ex.toLowerCase())) return;
          
          let safeEx = ex;
          if (goal === 'pregnancy' && !isExerciseSafeForPregnancy(ex)) {
            safeEx = getPregnancySafeAlternative(ex);
          } else if (goal === 'disability' && !isExerciseSafeForDisability(ex, disabilityType)) {
            safeEx = getDisabilitySafeAlternative(ex);
          }
          
          const shouldSkip = painAreas.some(area => {
            if (area === 'shoulder' && safeEx.toLowerCase().includes('press')) return true;
            if (area === 'lower_back' && (safeEx.toLowerCase().includes('deadlift') || safeEx.toLowerCase().includes('row'))) return true;
            return false;
          });
          
          if (!shouldSkip && !existingExercises.has(safeEx.toLowerCase())) {
            exercises.push(createExercise(safeEx, location, hasGym, equipment, 0, level, goal, "isolation"));
            existingExercises.add(safeEx.toLowerCase());
          }
        });
      }
    });
  }

  if (sportRole && goal === 'performance') {
    const roleExercises = getExercisesForSoccerRole(sportRole, level);
    roleExercises.forEach(ex => {
      if (existingExercises.has(ex.toLowerCase())) return;
      
      const shouldSkip = painAreas.some(area => {
        if (area === 'knee' && (ex.toLowerCase().includes('squat') || ex.toLowerCase().includes('jump'))) return true;
        if (area === 'shoulder' && ex.toLowerCase().includes('press')) return true;
        if (area === 'ankles' && ex.toLowerCase().includes('jump')) return true;
        return false;
      });
      
      if (!shouldSkip && !existingExercises.has(ex.toLowerCase())) {
        exercises.push(createExercise(ex, location, hasGym, equipment, 0, level, goal, "accessory"));
        existingExercises.add(ex.toLowerCase());
      }
    });
  }

  return exercises;
}

function generateLegsDay(location, hasGym, equipment, painAreas, assessments, level, goal, specificBodyParts, disabilityType, sportRole) {
  const exercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') {
      return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    } else if (goal === 'disability') {
      return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    }
    return name;
  };

  const squat = safeExercise("Squat");
  exercises.push(createExercise(squat, location, hasGym, equipment, baseLoad.squat, level, goal, "compound"));
  const legPress = safeExercise("Leg Press");
  exercises.push(createExercise(legPress, location, hasGym, equipment, baseLoad.squat * 1.5, level, goal, "compound"));
  const rdl = safeExercise("Romanian Deadlift");
  exercises.push(createExercise(rdl, location, hasGym, equipment, baseLoad.deadlift * 0.7, level, goal, "compound"));
  exercises.push(createExercise("Leg Curl", location, hasGym, equipment, 0, level, goal, "isolation"));
  exercises.push(createExercise("Leg Extension", location, hasGym, equipment, 0, level, goal, "isolation"));

  const existingExercises = new Set(exercises.map(ex => ex.name?.toLowerCase()));

  if (specificBodyParts && specificBodyParts.length > 0) {
    specificBodyParts.forEach(bodyPart => {
      if (['legs', 'glutes', 'calves', 'abs'].includes(bodyPart)) {
        const extraExercises = getExercisesForBodyPart(bodyPart, level);
        extraExercises.forEach(ex => {
          if (existingExercises.has(ex.toLowerCase())) return;
          
          let safeEx = ex;
          if (goal === 'pregnancy' && !isExerciseSafeForPregnancy(ex)) {
            safeEx = getPregnancySafeAlternative(ex);
          } else if (goal === 'disability' && !isExerciseSafeForDisability(ex, disabilityType)) {
            safeEx = getDisabilitySafeAlternative(ex);
          }
          
          const shouldSkip = painAreas.some(area => {
            if (area === 'knee' && (safeEx.toLowerCase().includes('squat') || safeEx.toLowerCase().includes('lunge'))) return true;
            if (area === 'lower_back' && safeEx.toLowerCase().includes('deadlift')) return true;
            if (area === 'ankles' && (safeEx.toLowerCase().includes('calf') || safeEx.toLowerCase().includes('jump'))) return true;
            return false;
          });
          
          if (!shouldSkip && !existingExercises.has(safeEx.toLowerCase())) {
            exercises.push(createExercise(safeEx, location, hasGym, equipment, 0, level, goal, "isolation"));
            existingExercises.add(safeEx.toLowerCase());
          }
        });
      }
    });
  }

  if (sportRole && goal === 'performance') {
    const roleExercises = getExercisesForSoccerRole(sportRole, level);
    roleExercises.forEach(ex => {
      if (existingExercises.has(ex.toLowerCase())) return;
      
      const shouldSkip = painAreas.some(area => {
        if (area === 'knee' && (ex.toLowerCase().includes('squat') || ex.toLowerCase().includes('jump'))) return true;
        if (area === 'shoulder' && ex.toLowerCase().includes('press')) return true;
        if (area === 'ankles' && ex.toLowerCase().includes('jump')) return true;
        return false;
      });
      
      if (!shouldSkip && !existingExercises.has(ex.toLowerCase())) {
        exercises.push(createExercise(ex, location, hasGym, equipment, 0, level, goal, "accessory"));
        existingExercises.add(ex.toLowerCase());
      }
    });
  }

  return exercises;
}

function createExercise(name, location, hasGym, equipment, baseWeight, level, goal, type) {
  let sets, reps, rest;

  if (level === "beginner") {
    sets = type === "compound" ? 3 : 2;
  } else if (level === "intermediate") {
    sets = type === "compound" ? 4 : 3;
  } else {
    sets = type === "compound" ? 5 : 3;
  }

  if (type === "compound") {
    reps = "5-8";
  } else if (type === "accessory") {
    reps = "8-12";
  } else if (type === "isolation") {
    reps = "12-15";
  } else {
    reps = "30-60s";
  }

  if (type === "compound") {
    rest = 180;
  } else if (type === "accessory") {
    rest = 120;
  } else {
    rest = 60;
  }

  const exerciseOrGiantSet = getExerciseForLocation(name, location, equipment, goal, level);

  if (typeof exerciseOrGiantSet !== 'string') {
    if (goal === 'pregnancy' || goal === 'disability') {
      const safeAlternative = goal === 'pregnancy' 
        ? getPregnancySafeAlternative(name) 
        : getDisabilitySafeAlternative(name);
      
      return {
        name: safeAlternative,
        sets,
        reps,
        rest,
        weight: baseWeight > 0 ? calculateTargetWeight(baseWeight, 0.7) : null,
        notes: `Esercizio adattato per sicurezza (${goal === 'pregnancy' ? 'gravidanza' : 'disabilità'})`,
      };
    }
    return exerciseOrGiantSet;
  }

  return {
    name: exerciseOrGiantSet,
    sets,
    reps,
    rest,
    weight: baseWeight > 0 ? calculateTargetWeight(baseWeight, 0.7) : null,
    notes: type === "compound" ? "Esercizio fondamentale" : "Esercizio complementare",
  };
}

function getBaseLoads(assessments) {
  const findLoad = (exercise) => {
    const assessment = assessments.find((a) =>
      a.exerciseName.toLowerCase().includes(exercise.toLowerCase()),
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

export async function generateExercisesForDay(params) {
  const { originalExercises, location, equipment, assessments, level, goal, disabilityType } = params;
  
  const specificBodyParts = params.specificBodyParts?.map(part => 
    part === 'upper_chest' ? 'chest' : part
  );

  const adaptedExercises = [];
  const baseLoad = getBaseLoads(assessments);

  const safeExercise = (name) => {
    if (goal === 'pregnancy') {
      return isExerciseSafeForPregnancy(name) ? name : getPregnancySafeAlternative(name);
    } else if (goal === 'disability') {
      return isExerciseSafeForDisability(name, disabilityType) ? name : getDisabilitySafeAlternative(name);
    }
    return name;
  };

  for (const originalExercise of originalExercises) {
    if (originalExercise.type === 'giant_set') {
      adaptedExercises.push(originalExercise);
      continue;
    }

    const exerciseName = originalExercise.name;
    const safeExerciseName = safeExercise(exerciseName);
    
    let baseWeight = 0;
    const exerciseKey = getExerciseKeyForLoad(safeExerciseName);
    if (exerciseKey && exerciseKey in baseLoad) {
      baseWeight = baseLoad[exerciseKey];
    }

    const exerciseType = originalExercise.reps && parseInt(originalExercise.reps) <= 8 
      ? 'compound' 
      : originalExercise.reps && parseInt(originalExercise.reps) <= 12
      ? 'accessory'
      : 'isolation';

    const hasEquipmentCheck = location === 'gym' || (
      equipment.barbell ||
      equipment.bands ||
      equipment.pullupBar ||
      equipment.bench ||
      (equipment.dumbbellMaxKg && equipment.dumbbellMaxKg > 0)
    );
    const hasEquipment = Boolean(hasEquipmentCheck);

    const adaptedExercise = createExercise(
      safeExerciseName,
      location,
      hasEquipment,
      equipment,
      baseWeight,
      level,
      goal,
      exerciseType
    );

    adaptedExercises.push(adaptedExercise);
  }

  return adaptedExercises;
}

function getExerciseKeyForLoad(exerciseName) {
  const name = exerciseName.toLowerCase();
  if (name.includes('squat')) return 'squat';
  if (name.includes('stacco') || name.includes('deadlift')) return 'deadlift';
  if (name.includes('panca') || name.includes('bench') || name.includes('push')) return 'bench';
  if (name.includes('traz') || name.includes('pull') || name.includes('lat') || name.includes('rematore')) return 'pull';
  if (name.includes('press') || name.includes('military') || name.includes('shoulder')) return 'press';
  return null;
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