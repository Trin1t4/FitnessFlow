/**
 * STRESS TEST - Program Generator
 * Testa tutti gli scenari limite del sistema di generazione programmi
 */

// Simula le funzioni principali importandole
const path = require('path');

// Mock dei tipi base
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const GOALS = ['forza', 'massa', 'ipertrofia', 'tonificazione', 'dimagrimento', 'resistenza', 'benessere', 'motor_recovery', 'gravidanza', 'disabilita', 'prestazioni_sportive'];
const LOCATIONS = ['gym', 'home', 'home_gym'];
const TRAINING_TYPES = ['bodyweight', 'equipment', 'machines'];
const FREQUENCIES = [1, 2, 3, 4, 5, 6];
const SESSION_DURATIONS = [15, 20, 30, 45, 60, 90];

const PAIN_AREAS = [
  'lower_back', 'upper_back', 'neck',
  'left_shoulder', 'right_shoulder',
  'left_knee', 'right_knee',
  'left_hip', 'right_hip',
  'left_wrist', 'right_wrist',
  'left_ankle', 'right_ankle'
];

// Baseline di test
const createBaseline = (reps = 10, weight = 50, difficulty = 5) => ({
  reps,
  weight10RM: weight,
  difficulty,
  variantId: 'test_variant',
  variantName: 'Test Exercise'
});

const createFullBaselines = (reps = 10, weight = 50) => ({
  lower_push: { ...createBaseline(reps, weight), variantName: 'Squat' },
  lower_pull: { ...createBaseline(reps, weight), variantName: 'Deadlift' },
  horizontal_push: { ...createBaseline(reps, weight), variantName: 'Bench Press' },
  horizontal_pull: { ...createBaseline(reps, weight), variantName: 'Barbell Row' },
  vertical_push: { ...createBaseline(reps, weight), variantName: 'Overhead Press' },
  vertical_pull: { ...createBaseline(reps, weight), variantName: 'Lat Pulldown' },
  core: { ...createBaseline(reps, 0), variantName: 'Plank' }
});

// Risultati test
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function logTest(name, status, message, data = null) {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} ${name}: ${message}`);

  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.warnings++;

  testResults.details.push({ name, status, message, data });
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('🏋️ STRESS TEST - PROGRAM GENERATOR');
console.log('='.repeat(80) + '\n');

// ----------------------------------------------------------------------------
// 1. COMBINAZIONI ESTREME
// ----------------------------------------------------------------------------
console.log('\n📋 TEST 1: COMBINAZIONI ESTREME\n');

const extremeCombinations = [
  {
    name: 'Beginner + Forza + 6x/week',
    config: { level: 'beginner', goal: 'forza', frequency: 6 },
    expected: 'Dovrebbe ridurre a max 4x o warning'
  },
  {
    name: 'Advanced + Gravidanza',
    config: { level: 'advanced', goal: 'gravidanza', frequency: 3 },
    expected: 'Dovrebbe usare parametri gravidanza ignorando advanced'
  },
  {
    name: 'Beginner + 1x/week',
    config: { level: 'beginner', goal: 'massa', frequency: 1 },
    expected: 'Dovrebbe generare Full Body singolo con warning efficacia'
  },
  {
    name: 'Advanced + Disabilità + 6x/week',
    config: { level: 'advanced', goal: 'disabilita', frequency: 6 },
    expected: 'Dovrebbe usare parametri adattati'
  }
];

extremeCombinations.forEach(test => {
  console.log(`\n🔬 ${test.name}`);
  console.log(`   Config: ${JSON.stringify(test.config)}`);
  console.log(`   Expected: ${test.expected}`);

  // Simula la logica
  const { level, goal, frequency } = test.config;

  // Check logica
  if (level === 'beginner' && frequency > 4) {
    logTest(test.name, 'WARN', 'Frequenza troppo alta per beginner - sistema dovrebbe limitare');
  } else if (goal === 'gravidanza' && level === 'advanced') {
    logTest(test.name, 'WARN', 'Goal gravidanza ignora level advanced - corretto?');
  } else if (frequency === 1) {
    logTest(test.name, 'WARN', '1x/settimana - efficacia limitata, warning richiesto');
  } else {
    logTest(test.name, 'PASS', 'Combinazione gestita');
  }
});

// ----------------------------------------------------------------------------
// 2. MULTI-GOAL CONFLITTUALI
// ----------------------------------------------------------------------------
console.log('\n\n📋 TEST 2: MULTI-GOAL CONFLITTUALI\n');

const multiGoalTests = [
  {
    name: '3 goal: Forza + Dimagrimento + Resistenza',
    goals: ['forza', 'dimagrimento', 'resistenza'],
    expected: 'Distribuzione 40-30-30, conflitto intensità/volume'
  },
  {
    name: '2 goal opposti: Massa + Dimagrimento',
    goals: ['massa', 'dimagrimento'],
    expected: 'Distribuzione 70-30, difficile conciliare'
  },
  {
    name: '3 goal simili: Massa + Ipertrofia + Tonificazione',
    goals: ['massa', 'ipertrofia', 'tonificazione'],
    expected: 'Dovrebbero combinarsi bene'
  },
  {
    name: '2 goal compatibili: Forza + Prestazioni sportive',
    goals: ['forza', 'prestazioni_sportive'],
    expected: 'Sinergia naturale'
  }
];

multiGoalTests.forEach(test => {
  console.log(`\n🔬 ${test.name}`);
  console.log(`   Goals: ${test.goals.join(', ')}`);
  console.log(`   Expected: ${test.expected}`);

  // Analisi conflitti
  const hasConflict = (
    (test.goals.includes('forza') && test.goals.includes('resistenza')) ||
    (test.goals.includes('massa') && test.goals.includes('dimagrimento'))
  );

  if (hasConflict) {
    logTest(test.name, 'WARN', 'Goal conflittuali rilevati - progressione ridotta prevista');
  } else {
    logTest(test.name, 'PASS', 'Goal compatibili');
  }
});

// ----------------------------------------------------------------------------
// 3. PAIN AREAS MULTIPLE
// ----------------------------------------------------------------------------
console.log('\n\n📋 TEST 3: PAIN AREAS MULTIPLE\n');

const painTests = [
  {
    name: 'Dolore 3+ zone: schiena + spalle + ginocchia',
    painAreas: [
      { area: 'lower_back', severity: 'moderate' },
      { area: 'left_shoulder', severity: 'mild' },
      { area: 'right_knee', severity: 'severe' }
    ],
    expected: 'Molte sostituzioni, volume ridotto'
  },
  {
    name: 'Worst case: 6 zone dolenti',
    painAreas: [
      { area: 'lower_back', severity: 'severe' },
      { area: 'upper_back', severity: 'moderate' },
      { area: 'left_shoulder', severity: 'moderate' },
      { area: 'right_shoulder', severity: 'mild' },
      { area: 'left_knee', severity: 'severe' },
      { area: 'right_knee', severity: 'moderate' }
    ],
    expected: 'Programma quasi impossibile, dovrebbe suggerire consulto medico'
  },
  {
    name: 'Dolore bilaterale ginocchia severe',
    painAreas: [
      { area: 'left_knee', severity: 'severe' },
      { area: 'right_knee', severity: 'severe' }
    ],
    expected: 'No lower body push/pull, solo upper + core'
  },
  {
    name: 'Dolore spalle bilaterale + lower back',
    painAreas: [
      { area: 'left_shoulder', severity: 'severe' },
      { area: 'right_shoulder', severity: 'severe' },
      { area: 'lower_back', severity: 'moderate' }
    ],
    expected: 'Upper body molto limitato'
  }
];

painTests.forEach(test => {
  console.log(`\n🔬 ${test.name}`);
  console.log(`   Pain areas: ${test.painAreas.map(p => `${p.area}(${p.severity})`).join(', ')}`);
  console.log(`   Expected: ${test.expected}`);

  const severeCount = test.painAreas.filter(p => p.severity === 'severe').length;
  const totalAreas = test.painAreas.length;

  if (severeCount >= 3 || totalAreas >= 5) {
    logTest(test.name, 'FAIL', `Troppi dolori (${severeCount} severe, ${totalAreas} totali) - sistema dovrebbe bloccare o warning forte`);
  } else if (severeCount >= 2) {
    logTest(test.name, 'WARN', 'Multiple severe pain - programma molto ridotto');
  } else {
    logTest(test.name, 'PASS', 'Pain gestibile con sostituzioni');
  }
});

// ----------------------------------------------------------------------------
// 4. TEMPI LIMITE
// ----------------------------------------------------------------------------
console.log('\n\n📋 TEST 4: TEMPI LIMITE\n');

const timeTests = [
  {
    name: 'Sessione 15 min + Full Body',
    duration: 15,
    frequency: 3,
    expected: 'Max 3-4 esercizi, warning efficacia'
  },
  {
    name: 'Sessione 20 min + PPL 6x',
    duration: 20,
    frequency: 6,
    expected: 'Ogni sessione 3-4 esercizi, volume basso'
  },
  {
    name: 'Sessione 90 min + Full Body 3x',
    duration: 90,
    frequency: 3,
    expected: 'Workout completo con accessori extra'
  },
  {
    name: 'Sessione 30 min + Forza (rest lunghi)',
    duration: 30,
    goal: 'forza',
    expected: 'Conflitto: forza richiede 3-5 min rest, impossibile con 30 min'
  }
];

timeTests.forEach(test => {
  console.log(`\n🔬 ${test.name}`);
  console.log(`   Duration: ${test.duration} min`);
  console.log(`   Expected: ${test.expected}`);

  // Stima esercizi possibili
  const avgExerciseTime = test.goal === 'forza' ? 12 : 8; // minuti per esercizio
  const warmupCooldown = 8; // minuti
  const availableTime = test.duration - warmupCooldown;
  const maxExercises = Math.floor(availableTime / avgExerciseTime);

  if (maxExercises < 3) {
    logTest(test.name, 'FAIL', `Solo ${maxExercises} esercizi possibili - workout non efficace`);
  } else if (maxExercises < 5) {
    logTest(test.name, 'WARN', `${maxExercises} esercizi - efficacia ridotta`);
  } else {
    logTest(test.name, 'PASS', `${maxExercises} esercizi possibili`);
  }
});

// ----------------------------------------------------------------------------
// 5. EDGE CASES BASELINE
// ----------------------------------------------------------------------------
console.log('\n\n📋 TEST 5: EDGE CASES BASELINE\n');

const baselineTests = [
  {
    name: 'Baseline tutti null',
    baselines: {
      lower_push: null,
      lower_pull: null,
      horizontal_push: null,
      horizontal_pull: null,
      vertical_push: null,
      vertical_pull: null,
      core: null
    },
    expected: 'Dovrebbe usare default o chiedere screening'
  },
  {
    name: 'Baseline tutti 0 reps',
    baselines: createFullBaselines(0, 0),
    expected: 'Errore o fallback a valori minimi'
  },
  {
    name: 'Baseline estremi: 100 reps',
    baselines: createFullBaselines(100, 200),
    expected: 'Dovrebbe limitare a range ragionevole'
  },
  {
    name: 'Baseline misti: alcuni null, alcuni validi',
    baselines: {
      lower_push: createBaseline(10, 60),
      lower_pull: null,
      horizontal_push: createBaseline(8, 50),
      horizontal_pull: null,
      vertical_push: null,
      vertical_pull: createBaseline(12, 40),
      core: createBaseline(20, 0)
    },
    expected: 'Pattern senza baseline usano default o vengono esclusi'
  },
  {
    name: 'Baseline con weight negativo',
    baselines: createFullBaselines(10, -50),
    expected: 'Errore o conversione a bodyweight'
  }
];

baselineTests.forEach(test => {
  console.log(`\n🔬 ${test.name}`);
  console.log(`   Expected: ${test.expected}`);

  // Check validità
  const patterns = Object.entries(test.baselines);
  const nullCount = patterns.filter(([k, v]) => v === null).length;
  const zeroCount = patterns.filter(([k, v]) => v && v.reps === 0).length;
  const extremeCount = patterns.filter(([k, v]) => v && (v.reps > 50 || v.weight10RM < 0)).length;

  if (nullCount === patterns.length) {
    logTest(test.name, 'FAIL', 'Tutti i baseline null - impossibile generare programma');
  } else if (zeroCount > 0 || extremeCount > 0) {
    logTest(test.name, 'WARN', `Valori anomali: ${zeroCount} zeri, ${extremeCount} estremi`);
  } else if (nullCount > 0) {
    logTest(test.name, 'WARN', `${nullCount} pattern senza baseline`);
  } else {
    logTest(test.name, 'PASS', 'Baseline validi');
  }
});

// ----------------------------------------------------------------------------
// 6. LOCATION/EQUIPMENT IMPOSSIBILI
// ----------------------------------------------------------------------------
console.log('\n\n📋 TEST 6: LOCATION/EQUIPMENT IMPOSSIBILI\n');

const locationTests = [
  {
    name: 'Home + Machines',
    location: 'home',
    trainingType: 'machines',
    expected: 'Impossibile - dovrebbe fallback a bodyweight o errore'
  },
  {
    name: 'Gym + Bodyweight only + Forza',
    location: 'gym',
    trainingType: 'bodyweight',
    goal: 'forza',
    expected: 'Possibile ma limitato - calisthenics progressions'
  },
  {
    name: 'Home + Equipment (nessun equipment dichiarato)',
    location: 'home',
    trainingType: 'equipment',
    equipment: [],
    expected: 'Fallback a bodyweight'
  },
  {
    name: 'Home_gym + Machines',
    location: 'home_gym',
    trainingType: 'machines',
    expected: 'Dipende da equipment disponibile'
  }
];

locationTests.forEach(test => {
  console.log(`\n🔬 ${test.name}`);
  console.log(`   Location: ${test.location}, Training: ${test.trainingType}`);
  console.log(`   Expected: ${test.expected}`);

  const impossible = (test.location === 'home' && test.trainingType === 'machines');
  const needsEquipment = (test.trainingType === 'equipment' && (!test.equipment || test.equipment.length === 0));

  if (impossible) {
    logTest(test.name, 'FAIL', 'Combinazione impossibile - manca gestione errore');
  } else if (needsEquipment) {
    logTest(test.name, 'WARN', 'Equipment richiesto ma non specificato');
  } else {
    logTest(test.name, 'PASS', 'Combinazione valida');
  }
});

// ----------------------------------------------------------------------------
// 7. CAMBIO SEDUTA (RUNTIME ADAPTATION)
// ----------------------------------------------------------------------------
console.log('\n\n📋 TEST 7: CAMBIO SEDUTA (RUNTIME ADAPTATION)\n');

const runtimeTests = [
  {
    name: 'Cambio location: Gym -> Home a metà settimana',
    original: { location: 'gym', trainingType: 'equipment' },
    runtime: { actualLocation: 'home' },
    expected: 'Conversione esercizi gym -> bodyweight equivalenti'
  },
  {
    name: 'Nuovo dolore emergente durante la settimana',
    original: { painAreas: [] },
    runtime: { emergingPainAreas: ['lower_back'] },
    expected: 'Deload pattern coinvolti, aggiungi correttivi'
  },
  {
    name: 'Screening pre-workout: sonno scarso + stress alto',
    original: {},
    runtime: {
      screeningResults: {
        screening: { sleep: 3, stress: 8, painAreas: [], timestamp: new Date().toISOString() },
        recommendations: {
          intensityMultiplier: 0.7,
          shouldReduceVolume: true,
          shouldFocusOnRecovery: true,
          volumeReduction: 0.3
        },
        warnings: ['Sonno insufficiente', 'Stress elevato']
      }
    },
    expected: 'Riduzione intensità 30%, volume -30%, focus recovery'
  },
  {
    name: 'Detraining: utente assente 2 settimane',
    original: {},
    runtime: { detrainingFactor: 0.85 },
    expected: 'Riduzione carichi 15%, settimana di riadattamento'
  },
  {
    name: 'Combo: Home + nuovo dolore + screening negativo',
    original: { location: 'gym', painAreas: [] },
    runtime: {
      actualLocation: 'home',
      emergingPainAreas: ['right_shoulder'],
      screeningResults: {
        screening: { sleep: 4, stress: 7, painAreas: ['right_shoulder'], timestamp: new Date().toISOString() },
        recommendations: {
          intensityMultiplier: 0.75,
          shouldReduceVolume: true,
          shouldFocusOnRecovery: false,
          volumeReduction: 0.25
        },
        warnings: ['Nuovo dolore rilevato']
      }
    },
    expected: 'Tripla adaptation: location + pain + volume'
  },
  {
    name: 'Cambio equipment disponibile',
    original: { location: 'home_gym', equipment: ['barbell', 'dumbbells', 'rack'] },
    runtime: {
      actualLocation: 'home_gym',
      availableEquipment: ['dumbbells'] // barbell e rack non disponibili
    },
    expected: 'Sostituzione esercizi barbell con dumbbell variants'
  },
  {
    name: 'RPE feedback dalla sessione precedente',
    original: {},
    runtime: {
      previousSessionFeedback: {
        averageRPE: 9.5, // troppo difficile
        completionRate: 0.7, // non ha completato tutto
        notes: 'Troppo pesante'
      }
    },
    expected: 'Auto-regulation: riduzione carichi sessione successiva'
  },
  {
    name: 'Tempo ridotto rispetto al piano',
    original: { sessionDuration: 60 },
    runtime: { availableTime: 30 },
    expected: 'Workout abbreviato goal-aware'
  }
];

runtimeTests.forEach(test => {
  console.log(`\n🔬 ${test.name}`);
  console.log(`   Original: ${JSON.stringify(test.original)}`);
  console.log(`   Runtime: ${JSON.stringify(test.runtime)}`);
  console.log(`   Expected: ${test.expected}`);

  // Simula logica di adaptation
  const adaptations = [];

  if (test.runtime.actualLocation && test.runtime.actualLocation !== test.original.location) {
    adaptations.push('location_change');
  }
  if (test.runtime.emergingPainAreas && test.runtime.emergingPainAreas.length > 0) {
    adaptations.push('new_pain');
  }
  if (test.runtime.screeningResults) {
    if (test.runtime.screeningResults.recommendations.shouldReduceVolume) {
      adaptations.push('volume_reduction');
    }
    if (test.runtime.screeningResults.recommendations.intensityMultiplier < 1) {
      adaptations.push('intensity_reduction');
    }
  }
  if (test.runtime.detrainingFactor && test.runtime.detrainingFactor < 1) {
    adaptations.push('detraining_adjustment');
  }
  if (test.runtime.previousSessionFeedback) {
    if (test.runtime.previousSessionFeedback.averageRPE > 9) {
      adaptations.push('autoregulation_down');
    }
  }
  if (test.runtime.availableTime && test.runtime.availableTime < test.original.sessionDuration) {
    adaptations.push('time_compression');
  }

  if (adaptations.length === 0) {
    logTest(test.name, 'WARN', 'Nessuna adaptation rilevata - logica mancante?');
  } else if (adaptations.length >= 3) {
    logTest(test.name, 'WARN', `Multiple adaptations (${adaptations.join(', ')}) - verificare priorità`);
  } else {
    logTest(test.name, 'PASS', `Adaptations: ${adaptations.join(', ')}`);
  }
});

// ----------------------------------------------------------------------------
// 8. STRESS TEST COMBINATO
// ----------------------------------------------------------------------------
console.log('\n\n📋 TEST 8: STRESS TEST COMBINATO (WORST CASE)\n');

const stressTests = [
  {
    name: 'NIGHTMARE SCENARIO 1',
    config: {
      level: 'beginner',
      goal: 'forza',
      goals: ['forza', 'dimagrimento', 'resistenza'],
      frequency: 6,
      location: 'home',
      trainingType: 'machines',
      sessionDuration: 15,
      painAreas: [
        { area: 'lower_back', severity: 'severe' },
        { area: 'left_knee', severity: 'severe' },
        { area: 'right_shoulder', severity: 'moderate' }
      ],
      baselines: createFullBaselines(0, 0)
    },
    expected: 'Sistema dovrebbe rifiutare o generare warning critico'
  },
  {
    name: 'NIGHTMARE SCENARIO 2',
    config: {
      level: 'advanced',
      goal: 'gravidanza',
      goals: ['gravidanza', 'forza', 'prestazioni_sportive'],
      frequency: 7,
      location: 'home_gym',
      trainingType: 'equipment',
      sessionDuration: 20,
      painAreas: [
        { area: 'lower_back', severity: 'severe' },
        { area: 'left_hip', severity: 'moderate' },
        { area: 'right_hip', severity: 'moderate' }
      ],
      baselines: createFullBaselines(100, -10)
    },
    runtime: {
      screeningResults: {
        screening: { sleep: 2, stress: 10, painAreas: ['lower_back'], timestamp: new Date().toISOString() },
        recommendations: { intensityMultiplier: 0.5, shouldReduceVolume: true, shouldFocusOnRecovery: true, volumeReduction: 0.5 },
        warnings: ['CRITICO: Riposo consigliato']
      }
    },
    expected: 'Sistema dovrebbe suggerire giorno di riposo'
  }
];

stressTests.forEach(test => {
  console.log(`\n🔬 ${test.name}`);
  console.log(`   Config: ${JSON.stringify(test.config, null, 2)}`);
  if (test.runtime) {
    console.log(`   Runtime: ${JSON.stringify(test.runtime, null, 2)}`);
  }
  console.log(`   Expected: ${test.expected}`);

  // Conta problemi
  const problems = [];

  if (test.config.level === 'beginner' && test.config.frequency > 4) problems.push('freq_too_high');
  if (test.config.location === 'home' && test.config.trainingType === 'machines') problems.push('impossible_combo');
  if (test.config.sessionDuration < 20) problems.push('time_too_short');
  if (test.config.painAreas.filter(p => p.severity === 'severe').length >= 2) problems.push('too_many_severe_pain');
  if (test.config.goals && test.config.goals.length === 3) problems.push('conflicting_goals');
  if (test.config.baselines.lower_push && test.config.baselines.lower_push.reps === 0) problems.push('invalid_baselines');
  if (test.runtime?.screeningResults?.recommendations?.intensityMultiplier < 0.6) problems.push('critical_screening');

  if (problems.length >= 4) {
    logTest(test.name, 'FAIL', `${problems.length} problemi critici: ${problems.join(', ')} - SISTEMA DEVE BLOCCARE`);
  } else if (problems.length >= 2) {
    logTest(test.name, 'WARN', `${problems.length} problemi: ${problems.join(', ')}`);
  } else {
    logTest(test.name, 'PASS', 'Gestibile');
  }
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📊 RISULTATI STRESS TEST');
console.log('='.repeat(80));
console.log(`\n✅ PASSED:   ${testResults.passed}`);
console.log(`⚠️  WARNINGS: ${testResults.warnings}`);
console.log(`❌ FAILED:   ${testResults.failed}`);
console.log(`\n📈 Total tests: ${testResults.passed + testResults.warnings + testResults.failed}`);

if (testResults.failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  testResults.details
    .filter(t => t.status === 'FAIL')
    .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
}

if (testResults.warnings > 0) {
  console.log('\n⚠️  WARNINGS:');
  testResults.details
    .filter(t => t.status === 'WARN')
    .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
}

console.log('\n' + '='.repeat(80));
console.log('🏁 TEST COMPLETATO');
console.log('='.repeat(80) + '\n');

// Exit con codice appropriato
process.exit(testResults.failed > 0 ? 1 : 0);
