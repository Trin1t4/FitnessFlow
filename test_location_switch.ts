/**
 * TEST CAMBIO LOCATION - Scenari Reali
 *
 * Scenari:
 * 1. Donna 40kg, Squat 80kg (2x bodyweight!) - FORTE
 * 2. Uomo 90kg, BMI 27, Squat 70kg (0.78x bodyweight) - PRINCIPIANTE/SOVRAPPESO
 *
 * Per ogni persona: Forza, Ipertrofia, Dimagrimento
 * Per ogni goal: Gym -> Home switch
 */

import {
  generateProgramWithSplit,
  adaptWorkoutToRuntime,
  calculateWeightFromRIR,
  calculate1RMFromNRM,
  getTargetRIR
} from './packages/shared/src/utils';

// ============================================================================
// PROFILI UTENTE
// ============================================================================

// DONNA: 40kg, Squat 80kg (AVANZATA - 2x BW!)
const DONNA_AVANZATA = {
  name: 'Sara - Donna Avanzata',
  weight: 40,
  level: 'advanced' as const,
  // Baseline realistici per donna avanzata
  // Squat 80kg x 10 = ~107kg 1RM (2.67x BW!)
  baselines: {
    lower_push: { reps: 10, weight10RM: 80, difficulty: 8, variantId: 'squat', variantName: 'Barbell Back Squat', testDate: '2025-11-20' },
    lower_pull: { reps: 8, weight10RM: 70, difficulty: 8, variantId: 'deadlift', variantName: 'Conventional Deadlift', testDate: '2025-11-20' },
    horizontal_push: { reps: 10, weight10RM: 45, difficulty: 7, variantId: 'bench', variantName: 'Barbell Bench Press', testDate: '2025-11-18' },
    vertical_push: { reps: 8, weight10RM: 30, difficulty: 7, variantId: 'ohp', variantName: 'Overhead Press', testDate: '2025-11-18' },
    vertical_pull: { reps: 12, weight10RM: 50, difficulty: 6, variantId: 'pulldown', variantName: 'Lat Pulldown', testDate: '2025-11-15' }, // Potrebbe fare pull-up
    core: { reps: 60, weight10RM: 0, difficulty: 5, variantId: 'plank', variantName: 'Plank', testDate: '2025-11-15' }
  }
};

// UOMO: 90kg, BMI 27, Squat 70kg (PRINCIPIANTE - 0.78x BW)
const UOMO_PRINCIPIANTE = {
  name: 'Marco - Uomo Principiante/Sovrappeso',
  weight: 90,
  bmi: 27,
  level: 'beginner' as const,
  // Baseline realistici per principiante sovrappeso
  // Squat 70kg x 10 = ~93kg 1RM (1.03x BW)
  baselines: {
    lower_push: { reps: 10, weight10RM: 70, difficulty: 7, variantId: 'squat', variantName: 'Barbell Back Squat', testDate: '2025-12-01' },
    lower_pull: { reps: 8, weight10RM: 80, difficulty: 8, variantId: 'deadlift', variantName: 'Conventional Deadlift', testDate: '2025-12-01' },
    horizontal_push: { reps: 8, weight10RM: 50, difficulty: 7, variantId: 'bench', variantName: 'Barbell Bench Press', testDate: '2025-11-28' },
    vertical_push: { reps: 6, weight10RM: 35, difficulty: 8, variantId: 'ohp', variantName: 'Overhead Press', testDate: '2025-11-28' },
    vertical_pull: { reps: 5, weight10RM: 60, difficulty: 9, variantId: 'pulldown', variantName: 'Lat Pulldown', testDate: '2025-11-25' }, // Difficoltà pull-up per peso
    core: { reps: 30, weight10RM: 0, difficulty: 7, variantId: 'plank', variantName: 'Plank', testDate: '2025-11-25' }
  }
};

const GOALS = ['forza', 'ipertrofia', 'dimagrimento'] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function printSeparator(title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`📋 ${title}`);
  console.log('='.repeat(80));
}

function printSubSeparator(title: string) {
  console.log('\n' + '-'.repeat(60));
  console.log(`  ${title}`);
  console.log('-'.repeat(60));
}

function printExercise(ex: any, index: number) {
  const weight = ex.weight ? ` @ ${ex.weight}` : '';
  const sets = typeof ex.sets === 'number' ? ex.sets : ex.sets;
  const reps = typeof ex.reps === 'number' ? ex.reps : ex.reps;
  console.log(`    ${index + 1}. ${ex.name}: ${sets}x${reps}${weight} (${ex.rest})`);
  if (ex.notes && ex.notes.length < 100) {
    console.log(`       📝 ${ex.notes}`);
  }
}

function analyzeLocationSwitch(profile: typeof DONNA_AVANZATA, goal: string) {
  printSubSeparator(`${profile.name} - Goal: ${goal.toUpperCase()}`);

  // Calcola e mostra 1RM stimati
  console.log('\n  📊 BASELINE E 1RM STIMATI:');
  Object.entries(profile.baselines).forEach(([pattern, baseline]) => {
    if (baseline.weight10RM > 0) {
      const estimated1RM = calculate1RMFromNRM(baseline.weight10RM, 10);
      const ratio = (estimated1RM / profile.weight).toFixed(2);
      console.log(`    ${pattern}: ${baseline.weight10RM}kg x 10 → 1RM ~${Math.round(estimated1RM)}kg (${ratio}x BW)`);
    }
  });

  // 1. GENERA PROGRAMMA GYM
  console.log('\n  🏋️ PROGRAMMA GYM:');
  const gymProgram = generateProgramWithSplit({
    level: profile.level,
    goal: goal as any,
    location: 'gym',
    trainingType: 'equipment',
    frequency: profile.level === 'advanced' ? 4 : 3,
    baselines: profile.baselines,
    painAreas: [],
    sessionDuration: 60,
    userBodyweight: profile.weight // Peso corporeo per location adapter
  });

  if (gymProgram.error) {
    console.log(`    ❌ ERRORE: ${gymProgram.message}`);
    return;
  }

  // Mostra primo giorno
  const gymDay1 = gymProgram.weeklySplit?.days?.[0];
  if (gymDay1) {
    console.log(`\n    📅 ${gymDay1.dayName}:`);
    gymDay1.exercises.slice(0, 5).forEach((ex: any, i: number) => printExercise(ex, i));
    if (gymDay1.exercises.length > 5) {
      console.log(`    ... e altri ${gymDay1.exercises.length - 5} esercizi`);
    }
    console.log(`    ⏱️ Durata stimata: ${gymDay1.estimatedDuration} min`);
  }

  // 2. SIMULA CAMBIO LOCATION A METÀ SETTIMANA
  console.log('\n  🏠 CAMBIO LOCATION: GYM → HOME (a metà settimana)');

  const runtimeAdaptation = adaptWorkoutToRuntime(
    {
      location: 'gym',
      trainingType: 'equipment',
      painAreas: [],
      sessionDuration: 60,
      goal: goal,
      level: profile.level
    },
    {
      actualLocation: 'home'
    }
  );

  console.log('\n    🔄 ADATTAMENTI RUNTIME:');
  console.log(`    • Location changed: ${runtimeAdaptation.locationChanged}`);
  console.log(`    • Volume multiplier: ${runtimeAdaptation.volumeMultiplier}`);
  console.log(`    • Intensity multiplier: ${runtimeAdaptation.intensityMultiplier}`);

  if (runtimeAdaptation.exerciseReplacements.length > 0) {
    console.log('\n    📝 SOSTITUZIONI ESERCIZI:');
    runtimeAdaptation.exerciseReplacements.forEach(rep => {
      console.log(`      ${rep.original} → ${rep.replacement}`);
    });
  }

  // 3. GENERA PROGRAMMA HOME (come se avesse scelto home dall'inizio)
  console.log('\n  🏠 PROGRAMMA HOME (generato da zero):');
  const homeProgram = generateProgramWithSplit({
    level: profile.level,
    goal: goal as any,
    location: 'home',
    trainingType: 'bodyweight',
    frequency: profile.level === 'advanced' ? 4 : 3,
    baselines: profile.baselines,
    painAreas: [],
    sessionDuration: 60,
    userBodyweight: profile.weight // Peso corporeo per location adapter
  });

  if (homeProgram.error) {
    console.log(`    ❌ ERRORE: ${homeProgram.message}`);
    return;
  }

  const homeDay1 = homeProgram.weeklySplit?.days?.[0];
  if (homeDay1) {
    console.log(`\n    📅 ${homeDay1.dayName}:`);
    homeDay1.exercises.slice(0, 5).forEach((ex: any, i: number) => printExercise(ex, i));
    if (homeDay1.exercises.length > 5) {
      console.log(`    ... e altri ${homeDay1.exercises.length - 5} esercizi`);
    }
    console.log(`    ⏱️ Durata stimata: ${homeDay1.estimatedDuration} min`);
  }

  // 4. GENERA PROGRAMMA CON RUNTIME CONTEXT (cambio durante sessione)
  console.log('\n  🔄 PROGRAMMA CON RUNTIME SWITCH (gym→home durante sessione):');
  const switchedProgram = generateProgramWithSplit(
    {
      level: profile.level,
      goal: goal as any,
      location: 'gym',
      trainingType: 'equipment',
      frequency: profile.level === 'advanced' ? 4 : 3,
      baselines: profile.baselines,
      painAreas: [],
      sessionDuration: 60,
      userBodyweight: profile.weight // Peso corporeo per location adapter
    },
    {
      actualLocation: 'home'
    }
  );

  if (switchedProgram.runtimeWarnings) {
    console.log('\n    ⚠️ WARNING RUNTIME:');
    switchedProgram.runtimeWarnings.forEach((w: string) => console.log(`      • ${w}`));
  }

  const switchedDay1 = switchedProgram.weeklySplit?.days?.[0];
  if (switchedDay1) {
    console.log(`\n    📅 ${switchedDay1.dayName} (ADATTATO):`);
    switchedDay1.exercises.slice(0, 5).forEach((ex: any, i: number) => printExercise(ex, i));
    console.log(`    ⏱️ Durata stimata: ${switchedDay1.estimatedDuration} min`);
  }

  // 5. CONFRONTO FINALE
  console.log('\n  📊 CONFRONTO VOLUMI:');

  const gymExercises = gymProgram.weeklySplit?.days?.reduce((acc: number, day: any) =>
    acc + day.exercises.reduce((sum: number, ex: any) => sum + (typeof ex.sets === 'number' ? ex.sets : 3), 0), 0) || 0;

  const homeExercises = homeProgram.weeklySplit?.days?.reduce((acc: number, day: any) =>
    acc + day.exercises.reduce((sum: number, ex: any) => sum + (typeof ex.sets === 'number' ? ex.sets : 3), 0), 0) || 0;

  const switchedExercises = switchedProgram.weeklySplit?.days?.reduce((acc: number, day: any) =>
    acc + day.exercises.reduce((sum: number, ex: any) => sum + (typeof ex.sets === 'number' ? ex.sets : 3), 0), 0) || 0;

  console.log(`    • Gym: ${gymExercises} sets totali/settimana`);
  console.log(`    • Home: ${homeExercises} sets totali/settimana`);
  console.log(`    • Switch: ${switchedExercises} sets totali/settimana`);

  const gymDuration = gymProgram.weeklySplit?.averageDuration || 0;
  const homeDuration = homeProgram.weeklySplit?.averageDuration || 0;
  const switchedDuration = switchedProgram.weeklySplit?.averageDuration || 0;

  console.log(`\n    • Gym avg duration: ${gymDuration} min`);
  console.log(`    • Home avg duration: ${homeDuration} min`);
  console.log(`    • Switch avg duration: ${switchedDuration} min`);
}

// ============================================================================
// ANALISI SPECIFICA CARICHI
// ============================================================================

function analyzeLoadAdaptation(profile: typeof DONNA_AVANZATA, goal: string) {
  printSubSeparator(`ANALISI CARICHI: ${profile.name} - ${goal}`);

  const dayTypes = ['heavy', 'moderate', 'volume'] as const;

  console.log('\n  📊 CARICHI CALCOLATI PER SQUAT:');
  console.log(`    Baseline: ${profile.baselines.lower_push.weight10RM}kg x 10 reps`);

  const estimated1RM = calculate1RMFromNRM(profile.baselines.lower_push.weight10RM, 10);
  console.log(`    1RM stimato: ${Math.round(estimated1RM)}kg`);

  dayTypes.forEach(dayType => {
    const targetRIR = getTargetRIR(dayType, goal, profile.level);

    // Per forza: target 5 reps, per ipertrofia: 10 reps, per dimagrimento: 15 reps
    let targetReps = 10;
    if (goal === 'forza') targetReps = 5;
    if (goal === 'dimagrimento') targetReps = 15;

    const suggestedWeight = calculateWeightFromRIR(
      profile.baselines.lower_push.weight10RM,
      targetReps,
      targetRIR
    );

    const effectiveReps = targetReps + targetRIR;
    const percentOf1RM = Math.round((suggestedWeight / estimated1RM) * 100);

    console.log(`\n    ${dayType.toUpperCase()} DAY:`);
    console.log(`      Target: ${targetReps} reps @ RIR ${targetRIR}`);
    console.log(`      Effective reps: ${effectiveReps}`);
    console.log(`      Peso suggerito: ${suggestedWeight}kg (${percentOf1RM}% 1RM)`);
  });

  // A casa non ha pesi - cosa succede?
  console.log('\n  🏠 A CASA (senza pesi):');
  console.log('    → Squat bodyweight: progressione su DIFFICOLTÀ non su carico');
  console.log('    → Esempio progressione:');
  console.log('      1. Squat Bodyweight (base)');
  console.log('      2. Squat Pause (3s in buca)');
  console.log('      3. Squat 1.5 (scendi, risali a metà, riscendi, risali)');
  console.log('      4. Bulgarian Split Squat');
  console.log('      5. Pistol Squat (assisted → full)');
  console.log('      6. Shrimp Squat');

  if (profile.level === 'advanced') {
    console.log('\n    ⚠️ Per atleta avanzata come Sara (Squat 2x BW):');
    console.log('      - Bodyweight troppo facile per stimolo forza');
    console.log('      - Focus su unilaterali (Pistol, Shrimp)');
    console.log('      - Tempo sotto tensione aumentato');
    console.log('      - Alternative: kettlebell/manubri se disponibili');
  } else {
    console.log('\n    ✅ Per principiante come Marco:');
    console.log('      - Bodyweight può essere sufficiente inizialmente');
    console.log('      - Focus su tecnica e ROM completo');
    console.log('      - Progressione graduale verso unilaterali');
  }
}

// ============================================================================
// MAIN
// ============================================================================

printSeparator('TEST CAMBIO LOCATION - SCENARI REALI');

console.log(`
👩 SARA (Donna Avanzata):
   • Peso: 40kg
   • Squat: 80kg x 10 (2x bodyweight!)
   • Livello: Advanced

👨 MARCO (Uomo Principiante):
   • Peso: 90kg, BMI: 27
   • Squat: 70kg x 10 (0.78x bodyweight)
   • Livello: Beginner
`);

// Test per ogni persona e goal
for (const goal of GOALS) {
  printSeparator(`GOAL: ${goal.toUpperCase()}`);

  // Sara - Donna Avanzata
  analyzeLocationSwitch(DONNA_AVANZATA, goal);

  // Marco - Uomo Principiante
  analyzeLocationSwitch(UOMO_PRINCIPIANTE, goal);
}

// Analisi carichi specifica
printSeparator('ANALISI DETTAGLIATA CARICHI');
analyzeLoadAdaptation(DONNA_AVANZATA, 'forza');
analyzeLoadAdaptation(UOMO_PRINCIPIANTE, 'forza');
analyzeLoadAdaptation(DONNA_AVANZATA, 'ipertrofia');
analyzeLoadAdaptation(UOMO_PRINCIPIANTE, 'dimagrimento');

// Scenario speciale: Marco con dolore emergente a casa
printSeparator('SCENARIO SPECIALE: MARCO A CASA CON DOLORE EMERGENTE');

console.log('\n  Marco sta facendo il programma a casa quando sente dolore alla schiena...\n');

const marcoWithPain = generateProgramWithSplit(
  {
    level: 'beginner',
    goal: 'dimagrimento',
    location: 'gym',
    trainingType: 'equipment',
    frequency: 3,
    baselines: UOMO_PRINCIPIANTE.baselines,
    painAreas: [],
    sessionDuration: 45,
    userBodyweight: UOMO_PRINCIPIANTE.weight // 90kg per location adapter
  },
  {
    actualLocation: 'home',
    emergingPainAreas: [{ area: 'lower_back', severity: 'moderate' }],
    screeningResults: {
      screening: { sleep: 5, stress: 7, painAreas: ['lower_back'], timestamp: new Date().toISOString() },
      recommendations: {
        intensityMultiplier: 0.8,
        shouldReduceVolume: true,
        shouldFocusOnRecovery: false,
        volumeReduction: 0.2
      },
      warnings: ['Nuovo dolore lombare rilevato']
    }
  }
);

if (marcoWithPain.runtimeWarnings) {
  console.log('  ⚠️ WARNING:');
  marcoWithPain.runtimeWarnings.forEach((w: string) => console.log(`    • ${w}`));
}

if (marcoWithPain.runtimeAdaptation) {
  console.log('\n  🔄 ADATTAMENTI:');
  console.log(`    • Volume: x${marcoWithPain.runtimeAdaptation.volumeMultiplier}`);
  console.log(`    • Intensità: x${marcoWithPain.runtimeAdaptation.intensityMultiplier}`);
}

const painDay1 = marcoWithPain.weeklySplit?.days?.[0];
if (painDay1) {
  console.log(`\n  📅 Workout adattato:`);
  painDay1.exercises.forEach((ex: any, i: number) => printExercise(ex, i));
}

console.log('\n' + '='.repeat(80));
console.log('🏁 TEST COMPLETATO');
console.log('='.repeat(80) + '\n');
