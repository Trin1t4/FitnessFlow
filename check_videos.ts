/**
 * Check video coverage with proper Italian → English mapping
 */

import {
  LOWER_PUSH_VARIANTS,
  LOWER_PULL_VARIANTS,
  HORIZONTAL_PUSH_VARIANTS,
  VERTICAL_PUSH_VARIANTS,
  VERTICAL_PULL_VARIANTS,
  HORIZONTAL_PULL_VARIANTS,
  CORE_VARIANTS,
  PREGNANCY_RECOVERY_VARIANTS,
  POSTPARTUM_PHASE1_VARIANTS,
  POSTPARTUM_PHASE2_VARIANTS,
  POSTPARTUM_PHASE3_VARIANTS,
} from './packages/shared/src/utils/exerciseVariants';

// Video esistenti
const EXISTING_VIDEOS = new Set([
  'ab-wheel-rollout',
  'arnold-press',
  'assisted-pull-up',
  'back-squat',
  'barbell-curl',
  'barbell-row',
  'bear-hold',
  'bird-dog',
  'bird-dog-modified',
  'bodyweight-hip-hinge',
  'bodyweight-squat',
  'bridge-ball-squeeze',
  'bulgarian-split-squat',
  'cable-crunch',
  'cat-cow',
  'chest-dips',
  'chin-up',
  'clamshells',
  'connection-breath',
  'conventional-deadlift',
  'dead-bug',
  'dead-bug-heel-slides',
  'dead-bug-progression',
  'decline-push-up',
  'deep-squat-hold',
  'diamond-push-up',
  'diaphragmatic-breathing',
  'dumbbell-bench-press',
  'dumbbell-row',
  'dumbbell-shoulder-press',
  'face-pull',
  'flat-barbell-bench-press',
  'front-raise',
  'front-squat',
  'glute-bridge',
  'goblet-squat',
  'good-morning',
  'half-kneeling-chop',
  'hammer-curl',
  'hanging-leg-raise',
  'happy-baby-stretch',
  'hip-thrust',
  'incline-push-up',
  'inverted-row',
  'knee-push-up',
  'lateral-raise',
  'lat-pulldown',
  'leg-curl',
  'leg-extension',
  'leg-press',
  'lunges',
  'military-press',
  'modified-squat',
  'nordic-hamstring-curl',
  'one-arm-push-up',
  'pallof-press',
  'pallof-press-kneeling',
  'pelvic-floor-activation',
  'pelvic-tilts',
  'pike-push-up',
  'pistol-squat',
  'plank',
  'romanian-deadlift',
  'seated-cable-row',
  'seated-calf-raise',
  'seated-knee-lifts',
  'seated-row-band',
  'shoulder-blade-squeeze',
  'side-lying-leg-lift',
  'side-plank-modified',
  'skull-crushers',
  'squat-to-stand',
  'standard-pull-up',
  'standard-push-up',
  'standing-calf-raise',
  'standing-hip-circles',
  'standing-leg-curl',
  'standing-march',
  'step-up',
  'sumo-deadlift',
  'supine-marching',
  't-bar-row',
  'toe-taps',
  'tricep-dips',
  'tricep-pushdown',
  'wall-handstand-push-up',
  'wall-push-up',
  'wall-sit-breathing',
]);

// Mapping Italiano → Video slug
const EXERCISE_TO_VIDEO: Record<string, string> = {
  // LOWER PUSH
  'Squat a Corpo Libero': 'bodyweight-squat',
  'Squat con Pausa': '', // MANCANTE
  'Squat Jump': '', // MANCANTE
  'Split Squat': '', // MANCANTE
  'Affondi Indietro': 'lunges',
  'Squat Bulgaro': 'bulgarian-split-squat',
  'Skater Squat': '', // MANCANTE
  'Shrimp Squat': '', // MANCANTE
  'Pistol Squat': 'pistol-squat',
  'Goblet Squat': 'goblet-squat',
  'Pressa': 'leg-press',
  'Squat con Bilanciere': 'back-squat',
  'Squat Frontale': 'front-squat',
  'Zercher Squat': '', // MANCANTE

  // LOWER PULL
  'Hip Hinge a Corpo Libero': 'bodyweight-hip-hinge',
  'Ponte Glutei': 'glute-bridge',
  'Ponte Glutei a Una Gamba': '', // MANCANTE - single leg glute bridge
  'Stacco Rumeno a Una Gamba': '', // MANCANTE - single leg rdl
  'Hip Thrust Rialzato': 'hip-thrust',
  'Nordic Curl (Solo Eccentrica)': '', // MANCANTE
  'Slider Leg Curl': '', // MANCANTE
  'Nordic Curl': 'nordic-hamstring-curl',
  'Leg Curl': 'leg-curl',
  'Stacco con Trap Bar': '', // MANCANTE - trap bar deadlift
  'Stacco Rumeno': 'romanian-deadlift',
  'Stacco Sumo': 'sumo-deadlift',
  'Stacco da Terra': 'conventional-deadlift',
  'Stacco in Deficit': '', // MANCANTE

  // HORIZONTAL PUSH
  'Push-up su Ginocchia': 'knee-push-up',
  'Piegamenti': 'standard-push-up',
  'Piegamenti Diamante': 'diamond-push-up',
  'Archer Push-up': '', // MANCANTE
  'One Arm Push-up': 'one-arm-push-up',
  'Panca Piana con Bilanciere': 'flat-barbell-bench-press',
  'Panca Inclinata': '', // MANCANTE - incline bench press
  'Panca Declinata': '', // MANCANTE - decline bench press
  'Panca con Manubri': 'dumbbell-bench-press',
  'Dip alle Parallele': 'chest-dips',

  // VERTICAL PUSH
  'Pike Push-up': 'pike-push-up',
  'Verticale al Muro Push-up': 'wall-handstand-push-up',
  'Lento Avanti': 'military-press',
  'Shoulder Press con Manubri': 'dumbbell-shoulder-press',
  'Arnold Press': 'arnold-press',
  'Push Press': '', // MANCANTE

  // VERTICAL PULL
  'Trazioni alla Sbarra': 'standard-pull-up',
  'Trazioni Presa Larga': '', // MANCANTE - wide grip pull-up
  'Chin-up (Supinato)': 'chin-up',
  'Trazioni Presa Neutra': '', // MANCANTE - neutral grip pull-up
  'Lat Machine': 'lat-pulldown',
  'Trazioni Assistite': 'assisted-pull-up',

  // HORIZONTAL PULL
  'Rematore Inverso': 'inverted-row',
  'Rematore con Bilanciere': 'barbell-row',
  'Rematore con Manubrio': 'dumbbell-row',
  'Pulley Basso': 'seated-cable-row',
  'T-Bar Row': 't-bar-row',

  // CORE
  'Plank': 'plank',
  'Plank Laterale': '', // MANCANTE - side plank (abbiamo side-plank-modified)
  'Alzate Gambe alla Sbarra': 'hanging-leg-raise',
  'Ab Wheel Rollout': 'ab-wheel-rollout',
  'Crunch ai Cavi': 'cable-crunch',
  'Pallof Press': 'pallof-press',

  // PREGNANCY/POSTPARTUM
  'Connection Breath': 'connection-breath',
  'Diaphragmatic Breathing': 'diaphragmatic-breathing',
  'Pelvic Floor Activation': 'pelvic-floor-activation',
  'Deep Squat Hold': 'deep-squat-hold',
  'Happy Baby Stretch': 'happy-baby-stretch',
  'Pelvic Tilts': 'pelvic-tilts',
  'Bridge with Ball Squeeze': 'bridge-ball-squeeze',
  'Clamshells': 'clamshells',
  'Bird Dog (Modified)': 'bird-dog-modified',
  'Cat-Cow': 'cat-cow',
  'Squat to Stand': 'squat-to-stand',
  'Dead Bug Heel Slides': 'dead-bug-heel-slides',
  'Toe Taps': 'toe-taps',
  'Supine Marching': 'supine-marching',
  'Dead Bug Progression': 'dead-bug-progression',
  'Pallof Press (Kneeling)': 'pallof-press-kneeling',
  'Side Plank (Modified)': 'side-plank-modified',
  'Bear Hold': 'bear-hold',
  'Wall Sit with Breathing': 'wall-sit-breathing',
  'Seated Knee Lifts': 'seated-knee-lifts',
  'Half Kneeling Chop': 'half-kneeling-chop',
  'Wall Push-up': 'wall-push-up',
  'Seated Row (Band)': 'seated-row-band',
  'Standing Leg Curl': 'standing-leg-curl',
  'Side Lying Leg Lift': 'side-lying-leg-lift',
  'Modified Squat': 'modified-squat',
  'Standing Hip Circles': 'standing-hip-circles',
  'Shoulder Blade Squeeze': 'shoulder-blade-squeeze',
  'Standing March': 'standing-march',

  // ACCESSORI
  'Dip Tricipiti': 'tricep-dips',
  'Pushdown ai Cavi': 'tricep-pushdown',
  'French Press': 'skull-crushers',
  'Curl con Bilanciere': 'barbell-curl',
  'Curl a Martello': 'hammer-curl',
  'Calf Raise in Piedi': 'standing-calf-raise',
  'Calf Raise Seduto': 'seated-calf-raise',
};

// FMS e Test Mobilità (da exerciseDescriptions.ts)
const FMS_EXERCISES = [
  'FMS Squat Profondo',
  'FMS Passo Ostacolo',
  'FMS Affondo in Linea',
  'FMS Mobilità Spalle',
  'FMS Alzata Gamba Tesa',
  'FMS Push-up Stabilità',
  'FMS Stabilità Rotatoria',
  'Test Dorsiflessione Caviglia',
  'Test Rotazione Interna Anca',
  'Test Sit and Reach',
  'Test di Thomas',
  'World Greatest Stretch',
  'Couch Stretch',
  'Bretzel Stretch',
  'Stretch 90/90',
  'Pigeon Pose',
  'Hip Circles',
  'Arm Circles',
  'Leg Swings',
  'Thoracic Extension',
  'Quadruped Thoracic Rotation',
];

// Esercizi da locationAdapter (nuovi, tutti mancanti)
const LOCATION_ADAPTER_EXERCISES = [
  'Floor Pull (asciugamano)',
  'Floor Pull Singolo Braccio',
  'Floor Pull Facilitato',
  'Inverted Row (tavolo)', // usa inverted-row
  'Inverted Row Singolo Braccio',
  'Inverted Row Facilitato',
  'Inverted Row Piedi Elevati',
  'Scapular Pull (a terra)',
  'Band Pull-apart',
  'Pseudo Planche Push-up',
  'Elevated Pike Push-up',
  'Elevated Pike Push-up (High)',
  'Wall Handstand Push-up (Eccentric)',
  'Pike Push-up (Knee)',
  'Wall Shoulder Tap',
  'Pistol Squat (Assisted)',
  'Single Leg RDL (Bodyweight)',
  'Hip Thrust (Single Leg)',
  'Hip Thrust (Elevated)',
  'Slider Leg Curl (Single Leg)',
];

// Raccogli tutti gli esercizi dalle varianti
const allExercises = new Map<string, string>();

function addExercises(variants: any[] | undefined | null, source: string) {
  if (!variants || !Array.isArray(variants)) return;
  for (const v of variants) {
    if (v && v.name && !allExercises.has(v.name)) {
      allExercises.set(v.name, source);
    }
  }
}

addExercises(LOWER_PUSH_VARIANTS, 'Lower Push');
addExercises(LOWER_PULL_VARIANTS, 'Lower Pull');
addExercises(HORIZONTAL_PUSH_VARIANTS, 'Horizontal Push');
addExercises(VERTICAL_PUSH_VARIANTS, 'Vertical Push');
addExercises(VERTICAL_PULL_VARIANTS, 'Vertical Pull');
addExercises(HORIZONTAL_PULL_VARIANTS, 'Horizontal Pull');
addExercises(CORE_VARIANTS, 'Core');
addExercises(PREGNANCY_RECOVERY_VARIANTS, 'Pregnancy');
addExercises(POSTPARTUM_PHASE1_VARIANTS, 'Postpartum 1');
addExercises(POSTPARTUM_PHASE2_VARIANTS, 'Postpartum 2');
addExercises(POSTPARTUM_PHASE3_VARIANTS, 'Postpartum 3');

// Aggiungi FMS e mobilità
for (const name of FMS_EXERCISES) {
  if (!allExercises.has(name)) {
    allExercises.set(name, 'FMS / Mobilità');
  }
}

// Aggiungi location adapter
for (const name of LOCATION_ADAPTER_EXERCISES) {
  if (!allExercises.has(name)) {
    allExercises.set(name, 'Location Adapter');
  }
}

// Check coverage
const covered: string[] = [];
const missing: { name: string; source: string }[] = [];

for (const [name, source] of allExercises) {
  const videoSlug = EXERCISE_TO_VIDEO[name];

  if (videoSlug === undefined) {
    // Non nel mapping - potrebbe essere nuovo
    // Prova matching fuzzy
    const slug = name.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/\s+/g, '-')
      .replace(/[()]/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

    if (EXISTING_VIDEOS.has(slug)) {
      covered.push(name);
    } else {
      missing.push({ name, source });
    }
  } else if (videoSlug === '') {
    // Esplicitamente mancante
    missing.push({ name, source });
  } else if (EXISTING_VIDEOS.has(videoSlug)) {
    covered.push(name);
  } else {
    missing.push({ name, source });
  }
}

// Sort missing by source
missing.sort((a, b) => {
  if (a.source !== b.source) return a.source.localeCompare(b.source);
  return a.name.localeCompare(b.name);
});

console.log('='.repeat(70));
console.log('VERIFICA COPERTURA VIDEO');
console.log('='.repeat(70));
console.log(`\nEsercizi totali: ${allExercises.size}`);
console.log(`Con video: ${covered.length}`);
console.log(`MANCANTI: ${missing.length}`);

console.log('\n--- ESERCIZI COPERTI ---');
covered.sort().forEach(name => console.log(`✅ ${name}`));

console.log('\n--- ESERCIZI MANCANTI ---');
let currentSource = '';
for (const { name, source } of missing) {
  if (source !== currentSource) {
    console.log(`\n[${source}]`);
    currentSource = source;
  }
  console.log(`❌ ${name}`);
}
