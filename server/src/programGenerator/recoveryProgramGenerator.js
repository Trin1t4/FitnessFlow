import { getExerciseForLocation } from './exerciseSubstitutions.js';

// ===== PROGRAMMI PER ZONA E FASE =====

const RECOVERY_PROGRAMS = {
  shoulder: {
    phase1: {
      name: 'Fase 1: Mobilità e Controllo Scapolare',
      weeks: 2,
      frequency: 4,
      exercises: [
        {
          name_gym: 'Scapular Wall Slides',
          name_home: 'Scapular Wall Slides',
          sets: 3,
          reps: '10-12',
          rest: 60,
          notes: 'Controllo scapolare lento',
          equipment_needed: null,
        },
        {
          name_gym: 'Face Pulls Cavi',
          name_home: 'Face Pulls Elastico',
          sets: 3,
          reps: '12-15',
          rest: 60,
          notes: 'Attivazione posteriori spalla',
          equipment_needed: 'resistance_band',
        },
        {
          name_gym: 'Pendulum Swings',
          name_home: 'Pendulum Swings',
          sets: 3,
          reps: '30s per direzione',
          rest: 30,
          notes: 'ROM passivo',
          equipment_needed: null,
        },
        {
          name_gym: 'Plank Scapular Protraction',
          name_home: 'Plank Scapular Protraction',
          sets: 3,
          reps: '8-10',
          rest: 60,
          notes: 'Stabilità dinamica',
          equipment_needed: null,
        },
        {
          name_gym: 'External Rotation 90/90',
          name_home: 'External Rotation Elastico',
          sets: 3,
          reps: '10-12',
          rest: 45,
          notes: 'Cuffia rotatori',
          equipment_needed: 'dumbbell_or_band',
        },
      ],
    },
    phase2: {
      name: 'Fase 2: Rinforzo Progressivo',
      weeks: 4,
      frequency: 4,
      exercises: [
        {
          name_gym: 'Push-up',
          name_home: 'Push-up',
          sets: 3,
          reps: '8-10',
          rest: 90,
          notes: 'Progressione: ginocchia → standard',
          equipment_needed: null,
        },
        {
          name_gym: 'Band Pull-Aparts',
          name_home: 'Band Pull-Aparts',
          sets: 3,
          reps: '15-20',
          rest: 60,
          notes: 'Rinforzo posteriori',
          equipment_needed: 'resistance_band',
        },
        {
          name_gym: 'Shoulder External Rotation Manubri',
          name_home: 'Shoulder External Rotation Elastico',
          sets: 3,
          reps: '12-15',
          rest: 60,
          notes: 'Cuffia rotatori',
          equipment_needed: 'dumbbell_or_band',
        },
        {
          name_gym: 'YTW Prone',
          name_home: 'YTW su Pavimento',
          sets: 3,
          reps: '10 per lettera',
          rest: 90,
          notes: 'Stabilizzatori scapolari',
          equipment_needed: null,
        },
        {
          name_gym: 'Dead Hang',
          name_home: 'Dead Hang (porta/sbarra)',
          sets: 3,
          reps: '10-20s',
          rest: 90,
          notes: 'Decompressione',
          equipment_needed: 'pullup_bar',
        },
      ],
    },
    phase3: {
      name: 'Fase 3: Ritorno all\'Attività',
      weeks: 4,
      frequency: 3,
      exercises: [
        {
          name_gym: 'Push-up Standard',
          name_home: 'Push-up Standard',
          sets: 3,
          reps: '10-15',
          rest: 120,
          notes: 'Full ROM',
          equipment_needed: null,
        },
        {
          name_gym: 'Pike Push-up',
          name_home: 'Pike Push-up',
          sets: 3,
          reps: '8-12',
          rest: 120,
          notes: 'Overhead pressing',
          equipment_needed: null,
        },
        {
          name_gym: 'Inverted Row',
          name_home: 'Inverted Row (tavolo/sbarra bassa)',
          sets: 3,
          reps: '10-12',
          rest: 120,
          notes: 'Pulling orizzontale',
          equipment_needed: 'low_bar',
        },
        {
          name_gym: 'Turkish Get-Up Kettlebell',
          name_home: 'Turkish Get-Up (peso improvvisato)',
          sets: 3,
          reps: '3-5 per lato',
          rest: 150,
          notes: 'Stabilità overhead dinamica',
          equipment_needed: 'kettlebell_or_weight',
        },
        {
          name_gym: 'Landmine Press',
          name_home: 'Pike Push-up Avanzato',
          sets: 3,
          reps: '10-12',
          rest: 120,
          notes: 'Overhead pattern',
          equipment_needed: 'barbell',
        },
      ],
    },
  },
  // Altre zone come knee, lower_back, cervical seguono struttura analoga
};

// Funzione principale che genera il programma di recupero personalizzato

export function generateRecoveryProgram(input) {
  const {
    location,
    equipment,
    recoveryScreening,
  } = input;

  if (!recoveryScreening) {
    throw new Error('Recovery screening data required');
  }

  const {
    body_area,
    assigned_phase,
    pain_location,
    pain_triggers,
    pain_symptoms,
  } = recoveryScreening;

  console.log('[RECOVERY] 🔄 Generating recovery program for:', {
    body_area,
    assigned_phase,
    location,
  });

  const areaPrograms = RECOVERY_PROGRAMS[body_area];

  if (!areaPrograms) {
    throw new Error(`No recovery program for area: ${body_area}`);
  }

  const phaseKey = `phase${assigned_phase}`;
  const phaseProgram = areaPrograms[phaseKey];

  // Adatta esercizi a location e equipment

  const adaptedExercises = phaseProgram.exercises.map(ex => {
    const hasEquipment = checkEquipmentAvailable(equipment, ex.equipment_needed);
    let finalName = ex.name_gym;

    if (location === 'home') {
      if (!hasEquipment && ex.equipment_needed) {
        finalName = ex.name_home;
      } else if (hasEquipment) {
        finalName = ex.name_gym;
      } else {
        finalName = ex.name_home;
      }
    }

    return {
      name: finalName,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      weight: null,
      notes: ex.notes || '',
    };
  });

  // Personalizza esercizi per profilo dolore

  const customizedExercises = customizeForPainProfile(
    adaptedExercises,
    body_area,
    pain_location,
    pain_triggers,
    pain_symptoms,
  );

  return {
    name: `Recovery ${body_area.toUpperCase()} - Fase ${assigned_phase}`,
    description: phaseProgram.name,
    split: 'recovery',
    daysPerWeek: phaseProgram.frequency,
    weeklySchedule: [
      {
        dayName: 'Recovery Session',
        exercises: customizedExercises,
      },
    ],
    progression: 'phased_recovery',
    currentPhase: assigned_phase,
    totalPhases: 3,
    includesDeload: false,
    totalWeeks: phaseProgram.weeks,
    requiresEndCycleTest: true,
  };
}

// Funzione helper per check equipment disponibile

function checkEquipmentAvailable(equipment, needed) {
  if (!needed) return true;

  const hasResistanceBand = equipment?.resistanceBand || false;
  const hasPullupBar = equipment?.pullupBar || false;
  const hasDumbbells = equipment?.dumbbellMaxKg > 0;
  const hasKettlebell = equipment?.kettlebellKg?.length > 0;
  const hasBarbell = equipment?.barbell || false;

  switch (needed) {
    case 'resistance_band':
      return hasResistanceBand;
    case 'pullup_bar':
    case 'low_bar':
      return hasPullupBar;
    case 'dumbbell_or_band':
      return hasDumbbells || hasResistanceBand;
    case 'kettlebell_or_weight':
      return hasKettlebell || hasDumbbells;
    case 'dumbbells':
      return hasDumbbells;
    case 'kettlebell':
      return hasKettlebell;
    case 'barbell':
    case 'barbell_or_dumbbells':
    case 'barbell_or_band':
      return hasBarbell || hasDumbbells || hasResistanceBand;
    case 'leg_extension_or_band':
      return hasResistanceBand;
    case 'box':
      return false;
    default:
      return true;
  }
}

// Funzione che personalizza gli esercizi in base al profilo del dolore

function customizeForPainProfile(
  exercises,
  bodyArea,
  painLocation,
  painTriggers,
  painSymptoms,
) {
  if (bodyArea === 'shoulder') {
    if (painLocation === 'anterior') {
      return exercises.map(ex => {
        if (ex.name.includes('Face Pull') || ex.name.includes('Pull-Apart')) {
          return { ...ex, sets: ex.sets + 1 };
        }
        return ex;
      });
    }
    if (painSymptoms.includes('radiating')) {
      return [
        { name: 'Nerve Glides C5-C6', sets: 3, reps: '10', rest: 45, notes: 'Mobilizzazione neurale' },
        ...exercises,
      ];
    }
  }
  // Altri adattamenti per altre zone possono essere aggiunti...

  return exercises;
}

export default {
  generateRecoveryProgram,
};
