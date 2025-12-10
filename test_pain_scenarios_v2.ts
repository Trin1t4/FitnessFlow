/**
 * Test completo V2 - Tutte le nuove funzionalità
 *
 * Esegui con: npx tsx test_pain_scenarios_v2.ts
 */

import {
  // Types
  type AllPainAreas,
  type PainType,
  type PainCharacter,
  type PainRecord,
  type UserPainMemory,

  // Labels
  EXTENDED_PAIN_AREA_LABELS,
  LATERALIZED_PAIN_AREA_LABELS,
  PAIN_TYPE_LABELS,
  PAIN_CHARACTER_LABELS,

  // Core functions
  getSeverityCategory,
  getPainAreaLabel,
  getBaseArea,
  areBilateral,

  // DOMS vs Articolare
  evaluatePainType,
  getPainTypeQuestions,

  // Warm-up adattivo
  generateAdaptiveWarmup,

  // Correlazioni
  analyzeExercisePainCorrelations,
  analyzeCyclePainCorrelations,

  // Long-term
  calculateLongTermTrend,
  generateLongTermInsights,

  // Medical alerts
  generateMedicalAlerts,
  hasUrgentAlerts,
  createEmptyPainMemory,

  // Screening
  performPreWorkoutScreening,

  type WeeklyPainSummary,
  type LongTermPainHistory
} from './packages/shared/src/utils/painTracking';

// ============================================================================
// HELPERS
// ============================================================================

function printHeader(title: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

function printSection(title: string) {
  console.log(`\n📋 ${title}`);
  console.log('-'.repeat(50));
}

// ============================================================================
// TEST
// ============================================================================

async function runTests() {
  printHeader('PAIN TRACKING V2 - TEST NUOVE FUNZIONALITÀ');

  // =========================================================================
  // 1. DOLORE LATERALIZZATO
  // =========================================================================
  printSection('1. DOLORE LATERALIZZATO');

  console.log('\n   Zone lateralizzate disponibili:');
  Object.entries(LATERALIZED_PAIN_AREA_LABELS).forEach(([key, label]) => {
    console.log(`     • ${key}: ${label}`);
  });

  // Test getBaseArea
  console.log('\n   Test getBaseArea():');
  console.log(`     left_knee → ${getBaseArea('left_knee')}`);
  console.log(`     right_shoulder → ${getBaseArea('right_shoulder')}`);
  console.log(`     lower_back → ${getBaseArea('lower_back')}`);

  // Test areBilateral
  console.log('\n   Test areBilateral():');
  console.log(`     left_knee + right_knee: ${areBilateral('left_knee', 'right_knee')}`);
  console.log(`     left_knee + left_shoulder: ${areBilateral('left_knee', 'left_shoulder')}`);
  console.log(`     left_hip + right_hip: ${areBilateral('left_hip', 'right_hip')}`);

  // Test getPainAreaLabel
  console.log('\n   Test getPainAreaLabel():');
  console.log(`     left_knee: ${getPainAreaLabel('left_knee')}`);
  console.log(`     lower_back: ${getPainAreaLabel('lower_back')}`);
  console.log(`     right_wrist: ${getPainAreaLabel('right_wrist')}`);

  // =========================================================================
  // 2. TIPO DI DOLORE (DOMS vs ARTICOLARE)
  // =========================================================================
  printSection('2. DOMS vs DOLORE ARTICOLARE');

  console.log('\n   Tipi di dolore:');
  Object.entries(PAIN_TYPE_LABELS).forEach(([key, label]) => {
    console.log(`     • ${key}: ${label}`);
  });

  console.log('\n   Caratteri del dolore:');
  Object.entries(PAIN_CHARACTER_LABELS).forEach(([key, label]) => {
    console.log(`     • ${key}: ${label}`);
  });

  // Test evaluatePainType
  console.log('\n   Test evaluatePainType():');

  // Scenario A: DOMS (indolenzimento post-allenamento)
  const doms = evaluatePainType('lower_back', 4, 'muscular_doms');
  console.log(`\n   A) DOMS lombare severità 4:`);
  console.log(`      Tipo: ${doms.likelyType}`);
  console.log(`      Rischio: ${doms.riskLevel}`);
  console.log(`      Può continuare: ${doms.canContinue}`);
  console.log(`      Messaggio: ${doms.message}`);

  // Scenario B: Dolore articolare
  const joint = evaluatePainType('knee', 5, 'joint');
  console.log(`\n   B) Dolore articolare ginocchio severità 5:`);
  console.log(`      Tipo: ${joint.likelyType}`);
  console.log(`      Rischio: ${joint.riskLevel}`);
  console.log(`      Può continuare: ${joint.canContinue}`);
  console.log(`      Messaggio: ${joint.message}`);
  console.log(`      Consiglio medico: ${joint.medicalAdvice}`);

  // Scenario C: Sintomi nervosi (formicolio)
  const nerve = evaluatePainType('lower_back', 6, undefined, 'tingling');
  console.log(`\n   C) Formicolio lombare severità 6:`);
  console.log(`      Tipo: ${nerve.likelyType}`);
  console.log(`      Rischio: ${nerve.riskLevel}`);
  console.log(`      Può continuare: ${nerve.canContinue}`);
  console.log(`      Messaggio: ${nerve.message}`);
  console.log(`      Consiglio medico: ${nerve.medicalAdvice}`);

  // Scenario D: Dolore osseo
  const bone = evaluatePainType('left_knee', 7, 'bone');
  console.log(`\n   D) Dolore osseo ginocchio sinistro severità 7:`);
  console.log(`      Tipo: ${bone.likelyType}`);
  console.log(`      Rischio: ${bone.riskLevel}`);
  console.log(`      Può continuare: ${bone.canContinue}`);
  console.log(`      Messaggio: ${bone.message}`);
  console.log(`      Consiglio medico: ${bone.medicalAdvice}`);

  // Scenario E: Inferenza da carattere + timing (DOMS)
  const inferredDoms = evaluatePainType('chest', 3, undefined, 'aching', 36);
  console.log(`\n   E) Dolore "aching" al petto, 36h dopo workout:`);
  console.log(`      Tipo inferito: ${inferredDoms.likelyType}`);
  console.log(`      Rischio: ${inferredDoms.riskLevel}`);
  console.log(`      Può continuare: ${inferredDoms.canContinue}`);
  console.log(`      Messaggio: ${inferredDoms.message}`);

  // =========================================================================
  // 3. WARM-UP ADATTIVO
  // =========================================================================
  printSection('3. WARM-UP ADATTIVO');

  const warmup = generateAdaptiveWarmup([
    { area: 'left_knee', severity: 4, painType: 'joint' },
    { area: 'lower_back', severity: 3, painType: 'muscular_doms' },
    { area: 'right_shoulder', severity: 5 }
  ], 5);

  console.log(`\n   Warm-up generato:`);
  console.log(`     Durata base: ${warmup.baseDuration} min`);
  console.log(`     Minuti extra: ${warmup.additionalMinutes} min`);
  console.log(`     Durata totale: ${warmup.totalDuration} min`);

  console.log(`\n   Esercizi generali:`);
  warmup.generalExercises.forEach(ex => {
    console.log(`     • ${ex.name} (${ex.duration}s)`);
  });

  console.log(`\n   Focus areas:`);
  warmup.focusAreas.forEach(focus => {
    console.log(`     ${getPainAreaLabel(focus.area)} [${focus.priority}]:`);
    focus.exercises.slice(0, 2).forEach(ex => {
      console.log(`       • ${ex.name}`);
    });
  });

  console.log(`\n   Note:`);
  warmup.notes.forEach(note => console.log(`     ${note}`));

  // =========================================================================
  // 4. CORRELAZIONE ESERCIZIO-DOLORE
  // =========================================================================
  printSection('4. CORRELAZIONE ESERCIZIO-DOLORE');

  // Crea memoria con storico
  const memory = createEmptyPainMemory('test_user');

  // Simula storico: Squat ha causato dolore al ginocchio 5 volte
  memory.flaggedExercises.push({
    exerciseId: 'squat_1',
    exerciseName: 'Squat',
    painRecords: [
      { area: 'left_knee', severity: 5, timing: 'during_exercise', timestamp: '2024-01-01' },
      { area: 'left_knee', severity: 4, timing: 'during_exercise', timestamp: '2024-01-08' },
      { area: 'left_knee', severity: 6, timing: 'during_exercise', timestamp: '2024-01-15' },
      { area: 'left_knee', severity: 5, timing: 'post_exercise', timestamp: '2024-01-22' },
      { area: 'left_knee', severity: 5, timing: 'during_exercise', timestamp: '2024-01-29' }
    ],
    lastOccurrence: '2024-01-29',
    occurrenceCount: 5,
    averageSeverity: 5,
    status: 'recovery_plan',
    consecutiveIssues: 2
  });

  // Simula storico: Stacco ha causato dolore lombare 3 volte
  memory.flaggedExercises.push({
    exerciseId: 'deadlift_1',
    exerciseName: 'Stacco',
    painRecords: [
      { area: 'lower_back', severity: 4, timing: 'during_exercise', timestamp: '2024-01-05' },
      { area: 'lower_back', severity: 5, timing: 'during_exercise', timestamp: '2024-01-12' },
      { area: 'lower_back', severity: 4, timing: 'post_exercise', timestamp: '2024-01-26' }
    ],
    lastOccurrence: '2024-01-26',
    occurrenceCount: 3,
    averageSeverity: 4.3,
    status: 'warning',
    consecutiveIssues: 1
  });

  const correlations = analyzeExercisePainCorrelations(memory, 3);

  console.log(`\n   Correlazioni trovate: ${correlations.length}`);
  correlations.forEach(corr => {
    console.log(`\n   ${corr.exerciseName} → ${getPainAreaLabel(corr.painArea)}:`);
    console.log(`     Forza: ${corr.correlationStrength}`);
    console.log(`     Episodi: ${corr.occurrences}`);
    console.log(`     Severità media: ${corr.avgSeverityWhenPerformed.toFixed(1)}/10`);
    console.log(`     Confidence: ${(corr.confidence * 100).toFixed(0)}%`);
    console.log(`     Azione suggerita: ${corr.suggestedAction}`);
  });

  // =========================================================================
  // 5. CORRELAZIONE CICLO MESTRUALE
  // =========================================================================
  printSection('5. CORRELAZIONE CICLO MESTRUALE');

  const cycleRecords: PainRecord[] = [
    { area: 'lower_back', severity: 6, timing: 'pre_workout', cyclePhase: 'menstrual', timestamp: '2024-01-01' },
    { area: 'lower_back', severity: 5, timing: 'pre_workout', cyclePhase: 'menstrual', timestamp: '2024-02-01' },
    { area: 'lower_back', severity: 3, timing: 'pre_workout', cyclePhase: 'follicular', timestamp: '2024-01-08' },
    { area: 'lower_back', severity: 2, timing: 'pre_workout', cyclePhase: 'ovulation', timestamp: '2024-01-14' },
    { area: 'lower_back', severity: 4, timing: 'pre_workout', cyclePhase: 'luteal', timestamp: '2024-01-21' },
    { area: 'lower_back', severity: 5, timing: 'pre_workout', cyclePhase: 'menstrual', timestamp: '2024-03-01' }
  ];

  const cycleCorrelations = analyzeCyclePainCorrelations(cycleRecords);

  cycleCorrelations.forEach(corr => {
    console.log(`\n   ${getPainAreaLabel(corr.area)}:`);
    corr.phaseCorrelations.forEach(phase => {
      const marker = phase.isSignificant ? '⚠️' : '  ';
      console.log(`     ${marker} ${phase.phase}: avg ${phase.avgSeverity.toFixed(1)}/10 (${phase.occurrences} episodi)`);
    });
    if (corr.peakPhase) {
      console.log(`     → Fase di picco: ${corr.peakPhase}`);
    }
    corr.insights.forEach(insight => console.log(`     💡 ${insight}`));
  });

  // =========================================================================
  // 6. STORICO LUNGO TERMINE
  // =========================================================================
  printSection('6. STORICO LUNGO TERMINE');

  // Simula storico settimanale (miglioramento)
  const weeklyHistoryImproving: WeeklyPainSummary[] = [
    { weekStart: '2024-01-01', weekEnd: '2024-01-07', avgSeverity: 6, maxSeverity: 7, occurrences: 3, sessionsAffected: 2, totalSessions: 3 },
    { weekStart: '2024-01-08', weekEnd: '2024-01-14', avgSeverity: 5.5, maxSeverity: 6, occurrences: 3, sessionsAffected: 2, totalSessions: 3 },
    { weekStart: '2024-01-15', weekEnd: '2024-01-21', avgSeverity: 5, maxSeverity: 6, occurrences: 2, sessionsAffected: 2, totalSessions: 3 },
    { weekStart: '2024-01-22', weekEnd: '2024-01-28', avgSeverity: 4.5, maxSeverity: 5, occurrences: 2, sessionsAffected: 1, totalSessions: 3 },
    { weekStart: '2024-01-29', weekEnd: '2024-02-04', avgSeverity: 4, maxSeverity: 5, occurrences: 1, sessionsAffected: 1, totalSessions: 3 },
    { weekStart: '2024-02-05', weekEnd: '2024-02-11', avgSeverity: 3.5, maxSeverity: 4, occurrences: 1, sessionsAffected: 1, totalSessions: 3 },
    { weekStart: '2024-02-12', weekEnd: '2024-02-18', avgSeverity: 3, maxSeverity: 4, occurrences: 1, sessionsAffected: 1, totalSessions: 3 },
    { weekStart: '2024-02-19', weekEnd: '2024-02-25', avgSeverity: 2.5, maxSeverity: 3, occurrences: 1, sessionsAffected: 1, totalSessions: 3 }
  ];

  const trendImproving = calculateLongTermTrend(weeklyHistoryImproving);
  console.log(`\n   Trend (8 settimane, severità decrescente): ${trendImproving}`);

  // Simula storico settimanale (peggioramento)
  const weeklyHistoryWorsening: WeeklyPainSummary[] = [
    { weekStart: '2024-01-01', weekEnd: '2024-01-07', avgSeverity: 3, maxSeverity: 4, occurrences: 1, sessionsAffected: 1, totalSessions: 3 },
    { weekStart: '2024-01-08', weekEnd: '2024-01-14', avgSeverity: 3.5, maxSeverity: 4, occurrences: 2, sessionsAffected: 1, totalSessions: 3 },
    { weekStart: '2024-01-15', weekEnd: '2024-01-21', avgSeverity: 4, maxSeverity: 5, occurrences: 2, sessionsAffected: 2, totalSessions: 3 },
    { weekStart: '2024-01-22', weekEnd: '2024-01-28', avgSeverity: 4.5, maxSeverity: 5, occurrences: 2, sessionsAffected: 2, totalSessions: 3 },
    { weekStart: '2024-01-29', weekEnd: '2024-02-04', avgSeverity: 5, maxSeverity: 6, occurrences: 3, sessionsAffected: 2, totalSessions: 3 },
    { weekStart: '2024-02-05', weekEnd: '2024-02-11', avgSeverity: 5.5, maxSeverity: 6, occurrences: 3, sessionsAffected: 3, totalSessions: 3 },
    { weekStart: '2024-02-12', weekEnd: '2024-02-18', avgSeverity: 6, maxSeverity: 7, occurrences: 3, sessionsAffected: 3, totalSessions: 3 },
    { weekStart: '2024-02-19', weekEnd: '2024-02-25', avgSeverity: 6.5, maxSeverity: 7, occurrences: 4, sessionsAffected: 3, totalSessions: 3 }
  ];

  const trendWorsening = calculateLongTermTrend(weeklyHistoryWorsening);
  console.log(`   Trend (8 settimane, severità crescente): ${trendWorsening}`);

  // Test insights
  const longTermHistory: LongTermPainHistory = {
    userId: 'test',
    startDate: '2024-01-01',
    totalRecords: 50,
    areasSummary: [
      { area: 'lower_back', totalOccurrences: 15, avgSeverity: 5, firstSeen: '2024-01-01', lastSeen: '2024-02-25', monthlyTrend: [] },
      { area: 'left_knee', totalOccurrences: 8, avgSeverity: 4, firstSeen: '2024-01-15', lastSeen: '2024-02-20', monthlyTrend: [] }
    ],
    overallTrend: 'worsening',
    insights: []
  };

  const insights = generateLongTermInsights(longTermHistory);
  console.log(`\n   Insights generati:`);
  insights.forEach(i => console.log(`     ${i}`));

  // =========================================================================
  // 7. ALERT MEDICI
  // =========================================================================
  printSection('7. ALERT MEDICI/FISIOTERAPICI');

  // Crea memoria con problemi
  const memoryWithIssues = createEmptyPainMemory('test_user');

  // Dolore cronico (3+ settimane)
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 25);

  memoryWithIssues.chronicPainAreas.push({
    area: 'lower_back',
    firstReported: threeWeeksAgo.toISOString(),
    lastReported: new Date().toISOString(),
    averageSeverity: 5,
    occurrences: 8,
    trend: 'stable',
    weeklyHistory: []
  });

  // Infortuni ricorrenti (5+ episodi)
  memoryWithIssues.flaggedExercises.push({
    exerciseId: 'squat_1',
    exerciseName: 'Squat',
    painRecords: [
      { area: 'left_knee', severity: 5, timing: 'during_exercise', timestamp: '2024-01-01' },
      { area: 'left_knee', severity: 5, timing: 'during_exercise', timestamp: '2024-01-08' },
      { area: 'left_knee', severity: 5, timing: 'during_exercise', timestamp: '2024-01-15' },
      { area: 'left_knee', severity: 5, timing: 'during_exercise', timestamp: '2024-01-22' },
      { area: 'left_knee', severity: 5, timing: 'during_exercise', timestamp: '2024-01-29' },
      { area: 'left_knee', severity: 5, timing: 'during_exercise', timestamp: '2024-02-05' }
    ],
    lastOccurrence: '2024-02-05',
    occurrenceCount: 6,
    averageSeverity: 5,
    status: 'recovery_plan',
    consecutiveIssues: 2
  });

  // Sintomi nervosi
  memoryWithIssues.flaggedExercises.push({
    exerciseId: 'deadlift_1',
    exerciseName: 'Stacco',
    painRecords: [
      { area: 'lower_back', severity: 6, timing: 'during_exercise', timestamp: '2024-02-01', painType: 'nerve', painCharacter: 'tingling' }
    ],
    lastOccurrence: '2024-02-01',
    occurrenceCount: 1,
    averageSeverity: 6,
    status: 'cooldown',
    consecutiveIssues: 1
  });

  const alerts = generateMedicalAlerts(memoryWithIssues);

  console.log(`\n   Alert generati: ${alerts.length}`);
  alerts.forEach(alert => {
    const icon = alert.severity === 'urgent' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`\n   ${icon} [${alert.severity.toUpperCase()}] ${alert.type}`);
    console.log(`      ${alert.message}`);
    console.log(`      → ${alert.recommendation}`);
    console.log(`      Criterio: ${alert.triggerCriteria}`);
  });

  console.log(`\n   Ha alert urgenti: ${hasUrgentAlerts(memoryWithIssues)}`);

  // =========================================================================
  // 8. DOMANDE UI PER TIPO DOLORE
  // =========================================================================
  printSection('8. DOMANDE UI PER IDENTIFICARE TIPO DOLORE');

  const questions = getPainTypeQuestions();
  questions.forEach((q, i) => {
    console.log(`\n   Domanda ${i + 1}: ${q.question}`);
    q.answers.forEach(a => {
      console.log(`     • ${a.label} → ${a.value}`);
    });
  });

  // =========================================================================
  // RIEPILOGO
  // =========================================================================
  printHeader('RIEPILOGO NUOVE FUNZIONALITÀ');

  console.log(`
✅ 1. DOLORE LATERALIZZATO
   - 14 zone lateralizzate (sinistro/destro)
   - Funzioni: getBaseArea(), areBilateral(), getPainAreaLabel()

✅ 2. DOMS vs ARTICOLARE
   - 6 tipi di dolore (DOMS, acuto, articolare, tendineo, nervoso, osseo)
   - 8 caratteri (acuto, sordo, bruciante, pulsante, etc.)
   - Inferenza automatica da carattere + timing
   - DOMS 24-72h = OK, può continuare

✅ 3. WARM-UP ADATTIVO
   - Genera warm-up personalizzato per zone dolorose
   - DOMS = warm-up normale
   - Articolare/altro = warm-up esteso + esercizi specifici

✅ 4. CORRELAZIONE ESERCIZIO-DOLORE
   - Pattern recognition: "ogni volta che fai X, hai male a Y"
   - Forza correlazione: weak/moderate/strong
   - Azione suggerita: monitor/modify/avoid

✅ 5. CORRELAZIONE CICLO MESTRUALE
   - Traccia dolore per fase del ciclo
   - Identifica fasi problematiche
   - Genera insights

✅ 6. STORICO LUNGO TERMINE
   - Trend settimanale/mensile
   - Identifica miglioramenti/peggioramenti
   - Genera insights

✅ 7. ALERT MEDICI
   - Dolore cronico (3+ settimane)
   - Infortuni ricorrenti (5+ episodi)
   - Sintomi nervosi (urgente)
   - Dolore osseo (urgente)

✅ 8. UI HELPERS
   - Domande per identificare tipo dolore
   - Label in italiano per tutte le zone
`);

  console.log('\n✅ Tutti i test completati!');
}

// Run
runTests().catch(console.error);
