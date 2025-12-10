/**
 * STRESS TEST REALE - Program Generator
 * Testa il sistema con le funzioni reali
 */

import {
  generateProgramWithSplit,
  validateProgramInput,
  adaptWorkoutToRuntime,
  generateDefaultBaselines,
  formatValidationResult
} from './packages/shared/src/utils';

import type {
  RuntimeContext,
  ValidationResult
} from './packages/shared/src/utils';

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function logTest(name: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, data?: any) {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} ${name}: ${message}`);
  results.push({ name, status, message, data });
}

// Baseline validi per test
const validBaselines = {
  lower_push: { reps: 12, weight10RM: 60, difficulty: 5, variantId: 'squat', variantName: 'Barbell Squat' },
  lower_pull: { reps: 10, weight10RM: 80, difficulty: 6, variantId: 'deadlift', variantName: 'Deadlift' },
  horizontal_push: { reps: 10, weight10RM: 50, difficulty: 5, variantId: 'bench', variantName: 'Bench Press' },
  vertical_push: { reps: 8, weight10RM: 30, difficulty: 6, variantId: 'ohp', variantName: 'Overhead Press' },
  vertical_pull: { reps: 8, weight10RM: 40, difficulty: 7, variantId: 'pulldown', variantName: 'Lat Pulldown' },
  core: { reps: 30, weight10RM: 0, difficulty: 4, variantId: 'plank', variantName: 'Plank' }
};

// ============================================================================
// TEST 1: VALIDAZIONE COMBINAZIONI IMPOSSIBILI
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📋 TEST 1: VALIDAZIONE COMBINAZIONI IMPOSSIBILI');
console.log('='.repeat(80) + '\n');

// Test: Home + Machines
const test1a = validateProgramInput({
  level: 'intermediate',
  goal: 'massa',
  location: 'home',
  trainingType: 'machines',
  frequency: 3,
  baselines: validBaselines,
  painAreas: []
});

if (test1a.corrections.some(c => c.field === 'trainingType' && c.correctedValue === 'bodyweight')) {
  logTest('Home + Machines', 'PASS', 'Corretto automaticamente a bodyweight', test1a.corrections);
} else {
  logTest('Home + Machines', 'FAIL', 'Non corretto', test1a);
}

// Test: Beginner + Frequenza 6
const test1b = validateProgramInput({
  level: 'beginner',
  goal: 'forza',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 6,
  baselines: validBaselines,
  painAreas: []
});

if (test1b.corrections.some(c => c.field === 'frequency' && c.correctedValue === 4)) {
  logTest('Beginner + 6x/week', 'PASS', 'Frequenza ridotta a 4', test1b.corrections);
} else if (test1b.warnings.some(w => w.code === 'FREQUENCY_TOO_HIGH')) {
  logTest('Beginner + 6x/week', 'WARN', 'Warning generato ma non corretto', test1b.warnings);
} else {
  logTest('Beginner + 6x/week', 'FAIL', 'Nessuna azione', test1b);
}

// Test: Frequenza 7
const test1c = validateProgramInput({
  level: 'advanced',
  goal: 'massa',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 7,
  baselines: validBaselines,
  painAreas: []
});

if (test1c.corrections.some(c => c.field === 'frequency' && c.correctedValue === 6)) {
  logTest('Frequenza 7', 'PASS', 'Corretto a 6 (almeno 1 giorno riposo)', test1c.corrections);
} else {
  logTest('Frequenza 7', 'FAIL', 'Non corretto', test1c);
}

// ============================================================================
// TEST 2: VALIDAZIONE BASELINE
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📋 TEST 2: VALIDAZIONE BASELINE');
console.log('='.repeat(80) + '\n');

// Test: Baseline tutti null
const test2a = validateProgramInput({
  level: 'intermediate',
  goal: 'massa',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: {} as any,
  painAreas: []
});

if (test2a.shouldBlock && test2a.errors.some(e => e.code === 'NO_BASELINES')) {
  logTest('Baseline tutti null', 'PASS', 'Bloccato correttamente', test2a.errors);
} else {
  logTest('Baseline tutti null', 'FAIL', 'Non bloccato', test2a);
}

// Test: Baseline con reps 0
const test2b = validateProgramInput({
  level: 'intermediate',
  goal: 'massa',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: {
    lower_push: { reps: 0, weight10RM: 60, difficulty: 5, variantId: 'squat', variantName: 'Squat' },
    lower_pull: { reps: 10, weight10RM: 80, difficulty: 6, variantId: 'deadlift', variantName: 'Deadlift' },
    horizontal_push: null as any,
    vertical_push: null as any,
    vertical_pull: { reps: 8, weight10RM: 40, difficulty: 7, variantId: 'pulldown', variantName: 'Lat Pulldown' },
    core: { reps: 30, weight10RM: 0, difficulty: 4, variantId: 'plank', variantName: 'Plank' }
  },
  painAreas: []
});

if (test2b.corrections.some(c => c.field.includes('reps') && c.correctedValue === 10)) {
  logTest('Baseline reps 0', 'PASS', 'Corretto a default 10', test2b.corrections);
} else if (test2b.warnings.some(w => w.code === 'INVALID_BASELINE_REPS')) {
  logTest('Baseline reps 0', 'WARN', 'Warning ma non corretto', test2b.warnings);
} else {
  logTest('Baseline reps 0', 'FAIL', 'Non gestito', test2b);
}

// ============================================================================
// TEST 3: PAIN AREAS MULTIPLE
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📋 TEST 3: PAIN AREAS MULTIPLE');
console.log('='.repeat(80) + '\n');

// Test: 3 severe pain
const test3a = validateProgramInput({
  level: 'intermediate',
  goal: 'massa',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: validBaselines,
  painAreas: [
    { area: 'lower_back', severity: 'severe' },
    { area: 'left_knee', severity: 'severe' },
    { area: 'right_knee', severity: 'severe' }
  ]
});

if (test3a.shouldBlock && test3a.suggestRest) {
  logTest('3 severe pain areas', 'PASS', 'Bloccato + riposo suggerito', test3a.errors);
} else if (test3a.suggestRest) {
  logTest('3 severe pain areas', 'WARN', 'Riposo suggerito ma non bloccato', test3a);
} else {
  logTest('3 severe pain areas', 'FAIL', 'Non gestito', test3a);
}

// Test: Dolore bilaterale
const test3b = validateProgramInput({
  level: 'intermediate',
  goal: 'massa',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: validBaselines,
  painAreas: [
    { area: 'left_shoulder', severity: 'severe' },
    { area: 'right_shoulder', severity: 'severe' }
  ]
});

if (test3b.warnings.some(w => w.code === 'BILATERAL_SEVERE_PAIN')) {
  logTest('Dolore bilaterale spalle', 'PASS', 'Warning bilaterale generato', test3b.warnings);
} else {
  logTest('Dolore bilaterale spalle', 'FAIL', 'Non rilevato', test3b);
}

// ============================================================================
// TEST 4: GOAL CONFLITTUALI
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📋 TEST 4: GOAL CONFLITTUALI');
console.log('='.repeat(80) + '\n');

// Test: Forza + Dimagrimento
const test4a = validateProgramInput({
  level: 'intermediate',
  goal: 'forza',
  goals: ['forza', 'dimagrimento'],
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: validBaselines,
  painAreas: []
});

if (test4a.warnings.some(w => w.code === 'CONFLICTING_GOALS')) {
  logTest('Forza + Dimagrimento', 'PASS', 'Conflitto rilevato', test4a.warnings);
} else {
  logTest('Forza + Dimagrimento', 'FAIL', 'Conflitto non rilevato', test4a);
}

// Test: 3 goals
const test4b = validateProgramInput({
  level: 'intermediate',
  goal: 'forza',
  goals: ['forza', 'massa', 'resistenza'],
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: validBaselines,
  painAreas: []
});

if (test4b.warnings.some(w => w.code === 'TOO_MANY_GOALS')) {
  logTest('3 goals', 'PASS', 'Warning 3 goals generato', test4b.warnings);
} else {
  logTest('3 goals', 'FAIL', 'Warning non generato', test4b);
}

// ============================================================================
// TEST 5: DURATA SESSIONE
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📋 TEST 5: DURATA SESSIONE');
console.log('='.repeat(80) + '\n');

// Test: 15 minuti
const test5a = validateProgramInput({
  level: 'intermediate',
  goal: 'massa',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: validBaselines,
  painAreas: [],
  sessionDuration: 15
});

if (test5a.errors.some(e => e.code === 'SESSION_TOO_SHORT')) {
  logTest('Sessione 15 min', 'PASS', 'Errore tempo insufficiente', test5a.errors);
} else {
  logTest('Sessione 15 min', 'FAIL', 'Non rilevato', test5a);
}

// Test: Forza + 30 minuti
const test5b = validateProgramInput({
  level: 'intermediate',
  goal: 'forza',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: validBaselines,
  painAreas: [],
  sessionDuration: 30
});

if (test5b.warnings.some(w => w.code === 'STRENGTH_TIME_CONFLICT')) {
  logTest('Forza + 30 min', 'PASS', 'Conflitto tempo/forza rilevato', test5b.warnings);
} else {
  logTest('Forza + 30 min', 'FAIL', 'Non rilevato', test5b);
}

// ============================================================================
// TEST 6: RUNTIME ADAPTATION (CAMBIO SEDUTA)
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📋 TEST 6: RUNTIME ADAPTATION (CAMBIO SEDUTA)');
console.log('='.repeat(80) + '\n');

// Test: Cambio location gym -> home
const test6a = adaptWorkoutToRuntime(
  {
    location: 'gym',
    trainingType: 'equipment',
    painAreas: [],
    sessionDuration: 60,
    goal: 'massa',
    level: 'intermediate'
  },
  {
    actualLocation: 'home'
  }
);

if (test6a.locationChanged && test6a.exerciseReplacements.length > 0) {
  logTest('Gym -> Home', 'PASS', `Location cambiata, ${test6a.exerciseReplacements.length} sostituzioni`, test6a);
} else if (test6a.locationChanged) {
  logTest('Gym -> Home', 'WARN', 'Location cambiata ma nessuna sostituzione', test6a);
} else {
  logTest('Gym -> Home', 'FAIL', 'Non rilevato', test6a);
}

// Test: Nuovo dolore
const test6b = adaptWorkoutToRuntime(
  {
    location: 'gym',
    trainingType: 'equipment',
    painAreas: [],
    sessionDuration: 60,
    goal: 'massa',
    level: 'intermediate'
  },
  {
    emergingPainAreas: [{ area: 'lower_back', severity: 'moderate' }]
  }
);

if (test6b.painAdaptations.length > 0 && test6b.volumeMultiplier < 1) {
  logTest('Nuovo dolore', 'PASS', `Pain adaptation + volume x${test6b.volumeMultiplier}`, test6b);
} else if (test6b.painAdaptations.length > 0) {
  logTest('Nuovo dolore', 'WARN', 'Pain rilevato ma volume non ridotto', test6b);
} else {
  logTest('Nuovo dolore', 'FAIL', 'Non rilevato', test6b);
}

// Test: Screening critico
const test6c = adaptWorkoutToRuntime(
  {
    location: 'gym',
    trainingType: 'equipment',
    painAreas: [],
    sessionDuration: 60,
    goal: 'massa',
    level: 'intermediate'
  },
  {
    screeningResults: {
      screening: { sleep: 2, stress: 9, painAreas: [], timestamp: new Date().toISOString() },
      recommendations: {
        intensityMultiplier: 0.6,
        shouldReduceVolume: true,
        shouldFocusOnRecovery: true,
        volumeReduction: 0.4
      },
      warnings: ['Sonno critico', 'Stress alto']
    }
  }
);

if (test6c.shouldSuggestRest) {
  logTest('Screening critico', 'PASS', 'Riposo suggerito', test6c);
} else if (test6c.volumeMultiplier < 0.7) {
  logTest('Screening critico', 'WARN', `Volume ridotto x${test6c.volumeMultiplier} ma no rest`, test6c);
} else {
  logTest('Screening critico', 'FAIL', 'Non gestito', test6c);
}

// Test: Detraining
const test6d = adaptWorkoutToRuntime(
  {
    location: 'gym',
    trainingType: 'equipment',
    painAreas: [],
    sessionDuration: 60,
    goal: 'massa',
    level: 'intermediate'
  },
  {
    detrainingFactor: 0.8
  }
);

if (test6d.detrainingAdjustment === 0.8 && test6d.intensityMultiplier < 1) {
  logTest('Detraining', 'PASS', `Intensità ridotta x${test6d.intensityMultiplier}`, test6d);
} else {
  logTest('Detraining', 'FAIL', 'Non gestito', test6d);
}

// Test: RPE troppo alto sessione precedente
const test6e = adaptWorkoutToRuntime(
  {
    location: 'gym',
    trainingType: 'equipment',
    painAreas: [],
    sessionDuration: 60,
    goal: 'massa',
    level: 'intermediate'
  },
  {
    previousSessionFeedback: {
      averageRPE: 9.5,
      completionRate: 0.6 // Sotto 0.7 per triggerare volume reduction
    }
  }
);

if (test6e.intensityMultiplier < 1 && test6e.volumeMultiplier < 1) {
  logTest('RPE alto + incompletato', 'PASS', `Intensity x${test6e.intensityMultiplier}, Volume x${test6e.volumeMultiplier}`, test6e);
} else if (test6e.intensityMultiplier < 1 || test6e.volumeMultiplier < 1) {
  logTest('RPE alto + incompletato', 'PASS', `Intensity x${test6e.intensityMultiplier} o Volume x${test6e.volumeMultiplier} ridotto`, test6e);
} else {
  logTest('RPE alto + incompletato', 'FAIL', 'Non gestito', test6e);
}

// Test: Tempo ridotto
const test6f = adaptWorkoutToRuntime(
  {
    location: 'gym',
    trainingType: 'equipment',
    painAreas: [],
    sessionDuration: 60,
    goal: 'massa',
    level: 'intermediate'
  },
  {
    availableTime: 30
  }
);

if (test6f.timeCompression && test6f.timeCompression.availableDuration === 30) {
  logTest('Tempo ridotto', 'PASS', `Compressione ${test6f.timeCompression.originalDuration} -> ${test6f.timeCompression.availableDuration}`, test6f);
} else {
  logTest('Tempo ridotto', 'FAIL', 'Non gestito', test6f);
}

// ============================================================================
// TEST 7: GENERAZIONE PROGRAMMA COMPLETA
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📋 TEST 7: GENERAZIONE PROGRAMMA COMPLETA');
console.log('='.repeat(80) + '\n');

// Test: Programma normale
const test7a = generateProgramWithSplit({
  level: 'intermediate',
  goal: 'massa',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: validBaselines,
  painAreas: []
});

if (test7a.weeklySplit && test7a.weeklySplit.days.length === 4) {
  logTest('Programma normale', 'PASS', `Split: ${test7a.split}, ${test7a.weeklySplit.days.length} giorni`, test7a);
} else if (test7a.error) {
  logTest('Programma normale', 'FAIL', test7a.message, test7a);
} else {
  logTest('Programma normale', 'WARN', 'Generato con anomalie', test7a);
}

// Test: Programma con runtime context
const test7b = generateProgramWithSplit(
  {
    level: 'intermediate',
    goal: 'massa',
    location: 'gym',
    trainingType: 'equipment',
    frequency: 4,
    baselines: validBaselines,
    painAreas: [],
    sessionDuration: 60
  },
  {
    actualLocation: 'home',
    emergingPainAreas: [{ area: 'lower_back', severity: 'mild' }],
    availableTime: 45
  }
);

if (test7b.runtimeWarnings && test7b.runtimeWarnings.length > 0) {
  logTest('Programma + Runtime', 'PASS', `${test7b.runtimeWarnings.length} warning runtime`, test7b);
} else if (test7b.weeklySplit) {
  logTest('Programma + Runtime', 'WARN', 'Generato ma nessun warning runtime', test7b);
} else {
  logTest('Programma + Runtime', 'FAIL', 'Errore', test7b);
}

// Test: Programma che dovrebbe essere bloccato
const test7c = generateProgramWithSplit({
  level: 'beginner',
  goal: 'forza',
  location: 'home',
  trainingType: 'machines',
  frequency: 7,
  baselines: {} as any,
  painAreas: [
    { area: 'lower_back', severity: 'severe' },
    { area: 'left_knee', severity: 'severe' },
    { area: 'right_knee', severity: 'severe' }
  ]
});

if (test7c.blocked || test7c.error) {
  logTest('Nightmare scenario', 'PASS', 'Bloccato correttamente', test7c);
} else {
  logTest('Nightmare scenario', 'FAIL', 'Non bloccato!', test7c);
}

// Test: Programma che suggerisce riposo
const test7d = generateProgramWithSplit(
  {
    level: 'intermediate',
    goal: 'massa',
    location: 'gym',
    trainingType: 'equipment',
    frequency: 4,
    baselines: validBaselines,
    painAreas: []
  },
  {
    screeningResults: {
      screening: { sleep: 2, stress: 9, painAreas: [], timestamp: new Date().toISOString() },
      recommendations: {
        intensityMultiplier: 0.5,
        shouldReduceVolume: true,
        shouldFocusOnRecovery: true,
        volumeReduction: 0.5
      },
      warnings: ['CRITICO']
    }
  }
);

if (test7d.suggestRest) {
  logTest('Suggerimento riposo', 'PASS', 'Riposo suggerito', test7d);
} else if (test7d.runtimeWarnings && test7d.runtimeWarnings.length > 0) {
  logTest('Suggerimento riposo', 'WARN', 'Warning ma non suggerisce riposo', test7d);
} else {
  logTest('Suggerimento riposo', 'FAIL', 'Non gestito', test7d);
}

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📊 RISULTATI STRESS TEST REALE');
console.log('='.repeat(80));

const passed = results.filter(r => r.status === 'PASS').length;
const warned = results.filter(r => r.status === 'WARN').length;
const failed = results.filter(r => r.status === 'FAIL').length;

console.log(`\n✅ PASSED:   ${passed}`);
console.log(`⚠️  WARNINGS: ${warned}`);
console.log(`❌ FAILED:   ${failed}`);
console.log(`\n📈 Total tests: ${results.length}`);

if (failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  results.filter(r => r.status === 'FAIL').forEach(r => console.log(`   - ${r.name}: ${r.message}`));
}

if (warned > 0) {
  console.log('\n⚠️  WARNINGS:');
  results.filter(r => r.status === 'WARN').forEach(r => console.log(`   - ${r.name}: ${r.message}`));
}

console.log('\n' + '='.repeat(80));
console.log('🏁 TEST COMPLETATO');
console.log('='.repeat(80) + '\n');
