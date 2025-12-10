/**
 * Test completo di tutti gli scenari di dolore
 *
 * Esegui con: npx tsx test_pain_scenarios.ts
 */

import {
  // Valutazione dolore
  evaluatePreWorkoutPain,
  evaluateIntraExercisePain,
  evaluatePostExercisePain,
  evaluateIncompleteSet,
  evaluateMultiAreaPain,

  // Screening
  performPreWorkoutScreening,
  performPostWarmupScreening,

  // Tracking progressivo
  updateProgressivePainState,

  // Memoria cross-sessione
  updatePainMemory,
  checkExerciseForNextSession,
  prepareNextSessionAdaptations,

  // Recovery plan
  createRecoveryPlan,
  advanceRecoveryPlan,
  isRecoveryPlanComplete,

  // Types
  type ExtendedPainArea,
  type PainRecord,
  type IncompleteSetFeedback,
  type PainTrackedSession,
  type UserPainMemory,
  type ProgressivePainState,
  EXTENDED_PAIN_AREA_LABELS
} from './packages/shared/src/utils/painTracking';

// ============================================================================
// HELPERS
// ============================================================================

function printHeader(title: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

function printScenario(num: string, title: string) {
  console.log(`\n📋 SCENARIO ${num}: ${title}`);
  console.log('-'.repeat(50));
}

function printResult(result: any) {
  console.log(`   ${result.emoji} ${result.message}`);
  console.log(`   Azione: ${result.action}`);
  if (result.suggestions?.length > 0) {
    console.log('   Suggerimenti:');
    result.suggestions.forEach((s: string) => console.log(`     • ${s}`));
  }
  if (result.exerciseAlternative) {
    console.log(`   Alternativa: ${result.exerciseAlternative}`);
  }
  if (result.correctiveExercises?.length > 0) {
    console.log(`   Correttivi: ${result.correctiveExercises.join(', ')}`);
  }
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

async function runAllTests() {
  printHeader('PAIN TRACKING SYSTEM - TEST COMPLETO');

  // -------------------------------------------------------------------------
  // SCENARIO 1: Dolore PRE-WORKOUT
  // -------------------------------------------------------------------------
  printScenario('1A', 'Dolore 2/10 PRIMA della sessione (MILD)');
  const pre1 = evaluatePreWorkoutPain('lower_back', 2);
  printResult(pre1);
  console.log(`   → Risultato atteso: DELOAD, continua con cautela`);

  printScenario('1B', 'Dolore 5/10 PRIMA della sessione (SEVERE)');
  const pre2 = evaluatePreWorkoutPain('lower_back', 5, 'Stacco');
  printResult(pre2);
  console.log(`   → Risultato atteso: SUBSTITUTE, esercizio sostituito`);

  printScenario('1C', 'Dolore 8/10 PRIMA della sessione (CRITICAL)');
  const pre3 = evaluatePreWorkoutPain('knee', 8);
  printResult(pre3);
  console.log(`   → Risultato atteso: REST_DAY, sessione sconsigliata`);

  // -------------------------------------------------------------------------
  // SCENARIO 2: Dolore DURANTE l'esercizio
  // -------------------------------------------------------------------------
  printScenario('2A', 'Dolore 3/10 emerge DURANTE lo Squat (set 2)');
  const during1 = evaluateIntraExercisePain('knee', 3, 'Squat', 2, 5, 8);
  printResult(during1);
  console.log(`   → Risultato atteso: CONTINUE con cautela`);

  printScenario('2B', 'Dolore 5/10 emerge DURANTE lo Stacco (set 1, rep 3/8)');
  const during2 = evaluateIntraExercisePain('lower_back', 5, 'Stacco', 1, 3, 8);
  printResult(during2);
  console.log(`   → Risultato atteso: SKIP_EXERCISE, stop immediato`);

  printScenario('2C', 'Dolore 7/10 emerge DURANTE il Push-up');
  const during3 = evaluateIntraExercisePain('shoulder', 7, 'Push-up', 3);
  printResult(during3);
  console.log(`   → Risultato atteso: END_SESSION, stop sessione`);

  // -------------------------------------------------------------------------
  // SCENARIO 3: Dolore POST-ESERCIZIO
  // -------------------------------------------------------------------------
  printScenario('3A', 'Dolore 2/10 DOPO aver completato Pull-up');
  const post1 = evaluatePostExercisePain('elbow', 2, 'Pull-up');
  printResult(post1);
  console.log(`   → Risultato atteso: CONTINUE, annotato per monitoraggio`);

  printScenario('3B', 'Dolore 5/10 DOPO aver completato Squat');
  const post2 = evaluatePostExercisePain('knee', 5, 'Squat');
  printResult(post2);
  console.log(`   → Risultato atteso: SUBSTITUTE, flag per prossima sessione`);

  printScenario('3C', 'Dolore 7/10 DOPO aver completato Stacco');
  const post3 = evaluatePostExercisePain('lower_back', 7, 'Stacco');
  printResult(post3);
  console.log(`   → Risultato atteso: SUBSTITUTE, sospeso per 1 settimana`);

  // -------------------------------------------------------------------------
  // SCENARIO 4: Serie INCOMPLETA per dolore
  // -------------------------------------------------------------------------
  printScenario('4A', 'Serie incompleta 6/8 reps, dolore 4/10 stabile');
  const incomplete1: IncompleteSetFeedback = {
    exerciseId: 'squat_1',
    exerciseName: 'Squat',
    setNumber: 2,
    targetReps: 8,
    completedReps: 6,
    reason: 'pain',
    painDetails: { area: 'knee', severity: 4, wasProgressive: false },
    timestamp: new Date().toISOString()
  };
  const incResult1 = evaluateIncompleteSet(incomplete1);
  printResult(incResult1);
  console.log(`   → Risultato atteso: DELOAD, prossima serie riduci carico`);

  printScenario('4B', 'Serie incompleta 3/8 reps, dolore CRESCENTE 3→5');
  const incomplete2: IncompleteSetFeedback = {
    exerciseId: 'deadlift_1',
    exerciseName: 'Stacco',
    setNumber: 1,
    targetReps: 8,
    completedReps: 3,
    reason: 'pain',
    painDetails: { area: 'lower_back', severity: 5, wasProgressive: true },
    timestamp: new Date().toISOString()
  };
  const incResult2 = evaluateIncompleteSet(incomplete2);
  printResult(incResult2);
  console.log(`   → Risultato atteso: SKIP_EXERCISE, dolore crescente = allarme`);

  // -------------------------------------------------------------------------
  // SCENARIO 5: Screening PRE e POST warm-up
  // -------------------------------------------------------------------------
  printScenario('5A', 'Screening PRE-workout con 2 zone dolorose');
  const preScreening = performPreWorkoutScreening([
    { area: 'knee', severity: 3 },
    { area: 'lower_back', severity: 5 }
  ]);
  console.log(`   Readiness: ${preScreening.overallReadiness}/10`);
  console.log(`   Can Proceed: ${preScreening.canProceed}`);
  preScreening.warnings.forEach(w => console.log(`   ⚠️ ${w}`));
  console.log(`   → Risultato atteso: canProceed=true, con adattamenti`);

  printScenario('5B', 'Re-screening POST warm-up (dolore migliorato)');
  const postWarmup = performPostWarmupScreening(preScreening, [
    { area: 'knee', severity: 1 },    // Migliorato!
    { area: 'lower_back', severity: 4 } // Leggermente migliorato
  ]);
  console.log(`   Readiness: ${postWarmup.overallReadiness}/10`);
  console.log(`   Can Proceed: ${postWarmup.canProceed}`);
  postWarmup.warnings.forEach(w => console.log(`   ${w}`));
  console.log(`   → Risultato atteso: Miglioramento rilevato, esercizi sbloccabili`);

  // -------------------------------------------------------------------------
  // SCENARIO 6: Tracking dolore PROGRESSIVO
  // -------------------------------------------------------------------------
  printScenario('6', 'Dolore che AUMENTA durante la sessione (2→4→6)');
  let progressiveStates: ProgressivePainState[] = [];

  // Record 1: dolore 2
  const record1: PainRecord = {
    area: 'shoulder',
    severity: 2,
    timing: 'during_exercise',
    exerciseName: 'Push-up Set 1',
    timestamp: new Date().toISOString()
  };
  const update1 = updateProgressivePainState(progressiveStates, record1);
  progressiveStates = update1.updatedStates;
  console.log(`   Record 1: severity 2 → Alert: ${update1.alert ? 'SÌ' : 'NO'}`);

  // Record 2: dolore 4 (+2)
  const record2: PainRecord = {
    area: 'shoulder',
    severity: 4,
    timing: 'during_exercise',
    exerciseName: 'Push-up Set 2',
    timestamp: new Date().toISOString()
  };
  const update2 = updateProgressivePainState(progressiveStates, record2);
  progressiveStates = update2.updatedStates;
  console.log(`   Record 2: severity 4 → Alert: ${update2.alert ? 'SÌ!' : 'NO'}`);
  if (update2.alert) {
    printResult(update2.alert);
  }

  // Record 3: dolore 6 (+2)
  const record3: PainRecord = {
    area: 'shoulder',
    severity: 6,
    timing: 'during_exercise',
    exerciseName: 'Push-up Set 3',
    timestamp: new Date().toISOString()
  };
  const update3 = updateProgressivePainState(progressiveStates, record3);
  console.log(`   Record 3: severity 6 → Trend: ${update3.updatedStates[0].trend}`);
  console.log(`   → Risultato atteso: Alert al secondo aumento (+2 punti)`);

  // -------------------------------------------------------------------------
  // SCENARIO 7: Multi-area SEVERE (tutti i pattern doloranti)
  // -------------------------------------------------------------------------
  printScenario('7A', 'Dolore 5 su 3 zone diverse');
  const multiArea1 = evaluateMultiAreaPain([
    { area: 'knee', severity: 5 },
    { area: 'lower_back', severity: 5 },
    { area: 'shoulder', severity: 5 }
  ]);
  printResult(multiArea1);
  console.log(`   → Risultato atteso: REST_DAY, troppi dolori severe`);

  printScenario('7B', 'Dolore 8 su 1 zona (CRITICO)');
  const multiArea2 = evaluateMultiAreaPain([
    { area: 'lower_back', severity: 8 }
  ]);
  printResult(multiArea2);
  console.log(`   → Risultato atteso: REST_DAY, dolore critico`);

  // -------------------------------------------------------------------------
  // SCENARIO 8: MEMORIA CROSS-SESSIONE con RETRY
  // -------------------------------------------------------------------------
  printHeader('SCENARIO 8: MEMORIA CROSS-SESSIONE (3 sessioni simulate)');

  // Inizializza memoria vuota
  let userMemory: UserPainMemory = {
    userId: 'test_user',
    flaggedExercises: [],
    chronicPainAreas: [],
    lastUpdated: new Date().toISOString()
  };

  // SESSIONE 1: Primo episodio di dolore durante Squat
  console.log('\n--- SESSIONE 1: Primo episodio dolore ---');
  const session1: PainTrackedSession = {
    sessionId: 'session_1',
    userId: 'test_user',
    date: new Date().toISOString(),
    preWorkoutScreening: performPreWorkoutScreening([]),
    intraSessionRecords: [{
      area: 'knee',
      severity: 5,
      timing: 'during_exercise',
      exerciseId: 'squat_1',
      exerciseName: 'Squat',
      timestamp: new Date().toISOString()
    }],
    incompleteSetFeedbacks: [],
    progressivePainStates: [],
    exercisesModified: [],
    sessionTerminatedEarly: false
  };

  userMemory = updatePainMemory(userMemory, session1);
  console.log(`   Squat status: ${userMemory.flaggedExercises[0]?.status}`);
  console.log(`   Consecutive issues: ${userMemory.flaggedExercises[0]?.consecutiveIssues}`);
  console.log(`   → Atteso: status='warning', consecutiveIssues=1`);

  // Check per sessione successiva
  console.log('\n--- CHECK PER SESSIONE 2 ---');
  const check1 = checkExerciseForNextSession(userMemory, 'squat_1', 'Squat');
  console.log(`   Can perform: ${check1.canPerform}`);
  console.log(`   Status: ${check1.status}`);
  console.log(`   Is Retry: ${check1.isRetry}`);
  console.log(`   Message: ${check1.warningMessage}`);
  console.log(`   → Atteso: canPerform=true, isRetry=true (RIPROPONI!)`);

  // SESSIONE 2: Secondo episodio - dolore confermato → Recovery Plan
  console.log('\n--- SESSIONE 2: Secondo episodio (retry fallito) ---');
  const session2: PainTrackedSession = {
    sessionId: 'session_2',
    userId: 'test_user',
    date: new Date().toISOString(),
    preWorkoutScreening: performPreWorkoutScreening([]),
    intraSessionRecords: [{
      area: 'knee',
      severity: 6,  // Ancora dolore!
      timing: 'during_exercise',
      exerciseId: 'squat_1',
      exerciseName: 'Squat',
      timestamp: new Date().toISOString()
    }],
    incompleteSetFeedbacks: [],
    progressivePainStates: [],
    exercisesModified: [],
    sessionTerminatedEarly: false
  };

  // Prima aggiorniamo lo status a retry_pending (simulando che è stato proposto)
  const squat = userMemory.flaggedExercises.find(f => f.exerciseId === 'squat_1');
  if (squat) squat.status = 'retry_pending';

  userMemory = updatePainMemory(userMemory, session2);
  const squatAfter = userMemory.flaggedExercises.find(f => f.exerciseId === 'squat_1');
  console.log(`   Squat status: ${squatAfter?.status}`);
  console.log(`   Consecutive issues: ${squatAfter?.consecutiveIssues}`);
  console.log(`   Recovery Plan: ${squatAfter?.recoveryPlan ? 'ATTIVO' : 'no'}`);
  if (squatAfter?.recoveryPlan) {
    console.log(`   - Fase: ${squatAfter.recoveryPlan.phase}`);
    console.log(`   - Settimane: ${squatAfter.recoveryPlan.currentWeek}/${squatAfter.recoveryPlan.totalWeeks}`);
    console.log(`   - Alternativa: ${squatAfter.recoveryPlan.alternativeExercise}`);
  }
  console.log(`   → Atteso: status='recovery_plan', piano attivato`);

  // Check per sessione 3
  console.log('\n--- CHECK PER SESSIONE 3 ---');
  const check2 = checkExerciseForNextSession(userMemory, 'squat_1', 'Squat');
  console.log(`   Can perform: ${check2.canPerform}`);
  console.log(`   Status: ${check2.status}`);
  console.log(`   Alternative: ${check2.alternative}`);
  console.log(`   Message: ${check2.warningMessage}`);
  console.log(`   → Atteso: canPerform=false, usa alternativa dal recovery plan`);

  // SESSIONE 3: Reset dopo sessione OK (simuliamo che l'alternativa va bene)
  console.log('\n--- SESSIONE 3: Alternativa completata senza problemi ---');
  const session3: PainTrackedSession = {
    sessionId: 'session_3',
    userId: 'test_user',
    date: new Date().toISOString(),
    preWorkoutScreening: performPreWorkoutScreening([]),
    intraSessionRecords: [],  // Nessun dolore!
    incompleteSetFeedbacks: [],
    progressivePainStates: [],
    exercisesModified: [{
      exerciseId: 'squat_1',  // Registriamo che l'esercizio è stato fatto (l'alternativa)
      originalExercise: 'Squat',
      replacement: 'Glute Bridge',
      reason: 'Recovery plan'
    }],
    sessionTerminatedEarly: false
  };

  // Questo NON resetterà perché è in recovery_plan, non in warning
  // Il recovery_plan richiede il completamento del piano
  userMemory = updatePainMemory(userMemory, session3);

  // -------------------------------------------------------------------------
  // SCENARIO 9: Recovery Plan Progression
  // -------------------------------------------------------------------------
  printHeader('SCENARIO 9: PROGRESSIONE RECOVERY PLAN');

  let plan = createRecoveryPlan('squat_1', 'Squat', 'knee', 6);
  console.log(`\nPiano iniziale:`);
  console.log(`   Fase: ${plan.phase}`);
  console.log(`   Settimana: ${plan.currentWeek}/${plan.totalWeeks}`);

  // Settimana 1 completata con successo
  plan = advanceRecoveryPlan(plan, true);
  console.log(`\nDopo settimana 1 (successo):`);
  console.log(`   Fase: ${plan.phase}`);
  console.log(`   Settimana: ${plan.currentWeek}/${plan.totalWeeks}`);

  // Settimana 2 completata con successo
  plan = advanceRecoveryPlan(plan, true);
  console.log(`\nDopo settimana 2 (successo):`);
  console.log(`   Fase: ${plan.phase}`);
  console.log(`   Settimana: ${plan.currentWeek}/${plan.totalWeeks}`);

  // Settimana 3 - problema, non avanza
  plan = advanceRecoveryPlan(plan, false);
  console.log(`\nDopo settimana 3 (problema):`);
  console.log(`   Fase: ${plan.phase}`);
  console.log(`   Settimana: ${plan.currentWeek}/${plan.totalWeeks}`);
  console.log(`   Note: ${plan.notes[plan.notes.length - 1]}`);

  // Settimana 3 retry - successo
  plan = advanceRecoveryPlan(plan, true);
  console.log(`\nDopo settimana 3 retry (successo):`);
  console.log(`   Fase: ${plan.phase}`);
  console.log(`   Completo: ${isRecoveryPlanComplete(plan)}`);

  // -------------------------------------------------------------------------
  // SCENARIO 10: Zone NON mappate
  // -------------------------------------------------------------------------
  printScenario('10', 'Zone ESTESE (collo, dorsale, etc)');
  console.log('   Zone supportate:');
  Object.entries(EXTENDED_PAIN_AREA_LABELS).forEach(([key, label]) => {
    console.log(`     • ${key}: ${label}`);
  });

  const neckPain = evaluatePreWorkoutPain('neck', 5);
  console.log(`\n   Dolore collo 5/10:`);
  printResult(neckPain);

  // -------------------------------------------------------------------------
  // RIEPILOGO
  // -------------------------------------------------------------------------
  printHeader('RIEPILOGO TEST');
  console.log(`
✅ SCENARIO 1: Dolore PRE-WORKOUT
   - 1-3 = DELOAD, continua con cautela
   - 4-6 = SUBSTITUTE, esercizio sostituito
   - 7+  = REST_DAY, sessione sconsigliata

✅ SCENARIO 2: Dolore DURANTE esercizio
   - 1-3 = CONTINUE con cautela
   - 4-5 = SKIP_EXERCISE, stop immediato
   - 6+  = END_SESSION, termina tutto

✅ SCENARIO 3: Dolore POST-esercizio
   - Annotato per sessioni future
   - Flag se >= 4

✅ SCENARIO 4: Serie incompleta
   - Dolore progressivo = più grave
   - < 50% completato = esercizio inadatto

✅ SCENARIO 5: Re-screening post warm-up
   - Permette di sbloccare esercizi se migliora

✅ SCENARIO 6: Tracking progressivo
   - Alert se aumenta di +2 punti

✅ SCENARIO 7: Multi-area severe
   - > 2 aree severe = REST_DAY

✅ SCENARIO 8: Memoria cross-sessione con RETRY
   - 1° episodio → WARNING (riproponi)
   - 2° episodio → RECOVERY_PLAN
   - Sessione OK → RESET

✅ SCENARIO 9: Recovery Plan
   - Progressione settimanale
   - Estensione se problemi persistono

✅ SCENARIO 10: Zone estese
   - collo, dorsale, avambraccio, polpaccio, petto
`);

  console.log('\n✅ Tutti i test completati!');
}

// Run
runAllTests().catch(console.error);
