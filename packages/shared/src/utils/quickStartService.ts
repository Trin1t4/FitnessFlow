/**
 * Quick Start Service
 *
 * Servizio per il nuovo flusso di onboarding rapido (3 minuti)
 * con calibrazione progressiva nelle prime 4 sessioni.
 */

import type {
  QuickStartData,
  QuickStartExperience,
  InitialLevel,
  ConservativeProgramParams,
  InitialWeightStrategy,
  CalibrationData,
  Session1Calibration,
  Session2Calibration,
  Session3Calibration,
  UnlockAssessment,
  FeelerSetResult,
  RIRPerception,
  RecoveryTrend,
  TechQuizResult,
  SessionData,
  WeeklyCheck,
} from '../types/quickStart.types';

import {
  EXPERIENCE_SCORE_MAP,
  CONSERVATIVE_PARAMS,
  INITIAL_WEIGHT_ESTIMATES,
  RIR_CONSISTENCY_THRESHOLD,
  MAX_SESSION_RPE_FOR_UNLOCK,
  CALIBRATION_SESSIONS_REQUIRED,
} from '../types/quickStart.types';

// ============================================================
// LIVELLO INIZIALE
// ============================================================

/**
 * Calcola il punteggio esperienza basato sui 3 pattern fondamentali
 */
export function calculateExperienceScore(experience: QuickStartExperience): number {
  return (
    EXPERIENCE_SCORE_MAP[experience.squat] +
    EXPERIENCE_SCORE_MAP[experience.push] +
    EXPERIENCE_SCORE_MAP[experience.hinge]
  );
}

/**
 * Determina il livello iniziale basato su Quick Start data
 * Approccio CONSERVATIVO: in caso di dubbio, beginner
 */
export function determineInitialLevel(data: QuickStartData): InitialLevel {
  const expScore = calculateExperienceScore(data.experience);

  // Se ha dolori attivi -> sempre beginner
  if (data.painAreas.length > 0) {
    return 'beginner';
  }

  // Se non ha mai fatto nessun esercizio fondamentale -> beginner
  if (expScore === 0) {
    return 'beginner';
  }

  // Se fa regolarmente almeno 2 su 3 -> intermediate (ma con safety cap)
  if (expScore >= 4) {
    return 'intermediate';
  }

  return 'beginner';
}

/**
 * Ottiene i parametri conservativi per il livello
 */
export function getConservativeParams(level: InitialLevel): ConservativeProgramParams {
  return CONSERVATIVE_PARAMS[level];
}

// ============================================================
// STRATEGIA PESI INIZIALI
// ============================================================

/**
 * Determina la strategia per i pesi iniziali
 */
export function getInitialWeightStrategy(
  data: QuickStartData,
  level: InitialLevel
): InitialWeightStrategy {
  if (data.location === 'home') {
    // Bodyweight: usa sempre la variante più facile
    return {
      type: 'bodyweight',
      strategy: 'easiest_variant',
      progressionUnlocked: false,
    };
  }

  // Gym: pesi molto conservativi basati su % peso corporeo
  return {
    type: 'weighted',
    strategy: 'feeler_sets',
    initialEstimates: INITIAL_WEIGHT_ESTIMATES[level],
  };
}

/**
 * Calcola il peso iniziale per un esercizio specifico
 */
export function calculateInitialWeight(
  exercisePattern: string,
  bodyWeight: number,
  level: InitialLevel
): number {
  const estimates = INITIAL_WEIGHT_ESTIMATES[level];

  const patternToEstimate: Record<string, keyof typeof estimates> = {
    lower_push: 'squat',
    lower_pull: 'deadlift',
    horizontal_push: 'bench',
    horizontal_pull: 'row',
    vertical_push: 'press',
    vertical_pull: 'row', // Usa row come proxy
  };

  const estimateKey = patternToEstimate[exercisePattern] || 'squat';
  const percentage = estimates[estimateKey];

  // Arrotonda a 2.5kg più vicini
  const rawWeight = bodyWeight * percentage;
  return Math.round(rawWeight / 2.5) * 2.5;
}

// ============================================================
// FEELER SETS (Sessione 1)
// ============================================================

/**
 * Calcola il peso per il feeler set (50% del peso di lavoro stimato)
 */
export function calculateFeelerSetWeight(workingWeight: number): number {
  const feelerWeight = workingWeight * 0.5;
  return Math.round(feelerWeight / 2.5) * 2.5;
}

/**
 * Analizza il feedback del feeler set e calcola il peso di lavoro
 */
export function analyzeFeelerSetFeedback(
  exerciseName: string,
  initialWeight: number,
  feedbackAdjustment: number // Da FEELER_SET_OPTIONS
): FeelerSetResult {
  const adjustedWeight = initialWeight * (1 + feedbackAdjustment);
  const roundedWeight = Math.round(adjustedWeight / 2.5) * 2.5;

  // Determina confidenza basata sull'aggiustamento
  let confidence: 'low' | 'medium' | 'high';
  if (Math.abs(feedbackAdjustment) >= 0.15) {
    confidence = 'low'; // Grande aggiustamento = stima iniziale imprecisa
  } else if (Math.abs(feedbackAdjustment) >= 0.075) {
    confidence = 'medium';
  } else {
    confidence = 'high';
  }

  return {
    exerciseName,
    initialWeight,
    feelerRPE: feedbackAdjustment === 0 ? 5 : feedbackAdjustment > 0 ? 3 : 7,
    adjustedWeight: roundedWeight,
    confidence,
  };
}

// ============================================================
// RIR CALIBRATION (Sessione 2)
// ============================================================

/**
 * Analizza la percezione RIR dell'utente per un esercizio
 */
export function analyzeRIRPerception(
  exerciseName: string,
  rirValues: number[]
): RIRPerception {
  if (rirValues.length === 0) {
    return {
      exerciseName,
      reportedRIR: [],
      avgRIR: 0,
      consistencyScore: 0,
    };
  }

  const avgRIR = rirValues.reduce((a, b) => a + b, 0) / rirValues.length;

  // Calcola deviazione standard per consistenza
  const variance =
    rirValues.reduce((sum, val) => sum + Math.pow(val - avgRIR, 2), 0) /
    rirValues.length;
  const stdDev = Math.sqrt(variance);

  // Consistenza: 1 = perfetta, 0 = molto inconsistente
  // Consideriamo consistente se stdDev < 1.5
  const consistencyScore = Math.max(0, 1 - stdDev / 3);

  return {
    exerciseName,
    reportedRIR: rirValues,
    avgRIR,
    consistencyScore,
  };
}

/**
 * Calcola l'aggiustamento peso basato sulla percezione RIR
 */
export function calculateWeightAdjustmentFromRIR(
  targetRIR: number,
  avgReportedRIR: number
): number {
  const rirDifference = avgReportedRIR - targetRIR;

  // Se RIR troppo alto (facile) -> aumenta peso
  // Se RIR troppo basso (difficile) -> diminuisci peso
  // ~2.5% per punto RIR
  return rirDifference * 0.025;
}

// ============================================================
// PAIN PATTERN CHECK (Sessione 3)
// ============================================================

/**
 * Valuta il trend di recupero basato sulle prime 2 sessioni
 */
export function evaluateRecoveryTrend(
  session1Pain: string[],
  session2Pain: string[],
  session3PrePain: { areas: string[]; trend: RecoveryTrend }
): RecoveryTrend {
  // Se l'utente riporta peggioramento esplicito
  if (session3PrePain.trend === 'worsening') {
    return 'worsening';
  }

  // Conta le zone di dolore nel tempo
  const s1Count = session1Pain.length;
  const s3Count = session3PrePain.areas.length;

  if (s3Count < s1Count) {
    return 'improving';
  } else if (s3Count > s1Count) {
    return 'worsening';
  }

  return 'stable';
}

// ============================================================
// UNLOCK ASSESSMENT (Sessione 4)
// ============================================================

/**
 * Calcola la consistenza media RIR attraverso tutte le sessioni
 */
export function calculateOverallRIRConsistency(
  session2Data: Session2Calibration | undefined
): number {
  if (!session2Data) return 0;

  const perceptions = Object.values(session2Data.rirPerception);
  if (perceptions.length === 0) return 0;

  const avgConsistency =
    perceptions.reduce((sum, p) => sum + p.consistencyScore, 0) /
    perceptions.length;

  return avgConsistency;
}

/**
 * Calcola la media RPE delle sessioni
 */
export function calculateAvgSessionRPE(sessionData: SessionData[]): number {
  if (sessionData.length === 0) return 0;

  return (
    sessionData.reduce((sum, s) => sum + s.sessionRPE, 0) / sessionData.length
  );
}

/**
 * Determina se sbloccare la modalità intermediate
 */
export function shouldUnlockIntermediateMode(
  calibrationData: CalibrationData,
  sessionHistory: SessionData[]
): UnlockAssessment {
  // Check 1: Completamento sessioni
  if (calibrationData.sessionsCompleted < CALIBRATION_SESSIONS_REQUIRED) {
    return {
      unlock: false,
      reason: 'Completa ancora qualche sessione',
      sessionsCompleted: calibrationData.sessionsCompleted,
      rirConsistency: 0,
      painTrend: 'stable',
      avgSessionRPE: 0,
    };
  }

  // Check 2: Consistenza RIR
  const rirConsistency = calculateOverallRIRConsistency(calibrationData.session2);
  if (rirConsistency < RIR_CONSISTENCY_THRESHOLD) {
    return {
      unlock: false,
      reason: 'Stiamo ancora imparando il tuo feeling dello sforzo',
      sessionsCompleted: calibrationData.sessionsCompleted,
      rirConsistency,
      painTrend: calibrationData.session3?.recoveryTrend || 'stable',
      avgSessionRPE: calculateAvgSessionRPE(sessionHistory),
    };
  }

  // Check 3: Nessun peggioramento dolore
  const painTrend = calibrationData.session3?.recoveryTrend || 'stable';
  if (painTrend === 'worsening') {
    return {
      unlock: false,
      reason: "Manteniamo intensità moderate finché il fastidio non migliora",
      sessionsCompleted: calibrationData.sessionsCompleted,
      rirConsistency,
      painTrend,
      avgSessionRPE: calculateAvgSessionRPE(sessionHistory),
    };
  }

  // Check 4: RPE medio nelle sessioni
  const avgSessionRPE = calculateAvgSessionRPE(sessionHistory);
  if (avgSessionRPE > MAX_SESSION_RPE_FOR_UNLOCK) {
    return {
      unlock: false,
      reason: 'Le sessioni sembrano già impegnative, consolidiamo',
      sessionsCompleted: calibrationData.sessionsCompleted,
      rirConsistency,
      painTrend,
      avgSessionRPE,
    };
  }

  return {
    unlock: true,
    reason: 'Pronto per il livello successivo!',
    sessionsCompleted: calibrationData.sessionsCompleted,
    rirConsistency,
    painTrend,
    avgSessionRPE,
  };
}

// ============================================================
// QUIZ TECNICO RIDOTTO
// ============================================================

/**
 * Valuta il risultato del quiz tecnico e determina quali feature sbloccare
 */
export function evaluateTechQuiz(score: number): TechQuizResult {
  const passed = score >= 60;

  return {
    score,
    passed,
    unlockedFeatures: {
      heavyDays: passed,
      autoProgression: passed,
      volumeBoost: passed,
      advancedVariants: passed,
    },
  };
}

// ============================================================
// CALIBRATION DATA MANAGEMENT
// ============================================================

/**
 * Crea un nuovo CalibrationData per un utente
 */
export function createCalibrationData(
  userId: string,
  quickStartData: QuickStartData
): CalibrationData {
  const now = new Date().toISOString();

  return {
    userId,
    quickStartData,
    sessionsCompleted: 0,
    intermediateModeUnlocked: false,
    quizCompleted: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Aggiorna CalibrationData dopo la sessione 1
 */
export function updateCalibrationSession1(
  calibration: CalibrationData,
  session1Data: Session1Calibration
): CalibrationData {
  return {
    ...calibration,
    sessionsCompleted: Math.max(calibration.sessionsCompleted, 1),
    session1: session1Data,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Aggiorna CalibrationData dopo la sessione 2
 */
export function updateCalibrationSession2(
  calibration: CalibrationData,
  session2Data: Session2Calibration
): CalibrationData {
  return {
    ...calibration,
    sessionsCompleted: Math.max(calibration.sessionsCompleted, 2),
    session2: session2Data,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Aggiorna CalibrationData dopo la sessione 3
 */
export function updateCalibrationSession3(
  calibration: CalibrationData,
  session3Data: Session3Calibration
): CalibrationData {
  return {
    ...calibration,
    sessionsCompleted: Math.max(calibration.sessionsCompleted, 3),
    session3: session3Data,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Aggiorna CalibrationData dopo l'unlock assessment
 */
export function updateCalibrationUnlock(
  calibration: CalibrationData,
  unlockAssessment: UnlockAssessment,
  quizResult?: TechQuizResult
): CalibrationData {
  return {
    ...calibration,
    sessionsCompleted: Math.max(calibration.sessionsCompleted, 4),
    unlockAssessment,
    intermediateModeUnlocked: unlockAssessment.unlock,
    quizCompleted: !!quizResult,
    quizScore: quizResult?.score,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================
// WEEKLY CHECK ANALYSIS
// ============================================================

/**
 * Analizza i weekly check per insights di lungo termine
 */
export function analyzeWeeklyChecks(checks: WeeklyCheck[]): {
  avgEnergy: number;
  avgSleep: number;
  totalSkipped: number;
  mainSkipReason?: string;
  overallTrend: 'improving' | 'stable' | 'declining';
} {
  if (checks.length === 0) {
    return {
      avgEnergy: 0,
      avgSleep: 0,
      totalSkipped: 0,
      overallTrend: 'stable',
    };
  }

  const avgEnergy =
    checks.reduce((sum, c) => sum + c.energyLevel, 0) / checks.length;
  const avgSleep =
    checks.reduce((sum, c) => sum + c.sleepQuality, 0) / checks.length;
  const totalSkipped = checks.reduce((sum, c) => sum + c.skippedDays, 0);

  // Trova il motivo di skip più comune
  const skipReasons = checks
    .filter((c) => c.skipReason)
    .map((c) => c.skipReason!);
  const reasonCounts = skipReasons.reduce(
    (acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const mainSkipReason = Object.entries(reasonCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  // Calcola trend confrontando prima e seconda metà
  const midpoint = Math.floor(checks.length / 2);
  if (midpoint > 0) {
    const firstHalfEnergy =
      checks.slice(0, midpoint).reduce((sum, c) => sum + c.energyLevel, 0) /
      midpoint;
    const secondHalfEnergy =
      checks.slice(midpoint).reduce((sum, c) => sum + c.energyLevel, 0) /
      (checks.length - midpoint);

    const diff = secondHalfEnergy - firstHalfEnergy;
    const overallTrend =
      diff > 0.5 ? 'improving' : diff < -0.5 ? 'declining' : 'stable';

    return {
      avgEnergy,
      avgSleep,
      totalSkipped,
      mainSkipReason,
      overallTrend,
    };
  }

  return {
    avgEnergy,
    avgSleep,
    totalSkipped,
    mainSkipReason,
    overallTrend: 'stable',
  };
}

// ============================================================
// GOAL MAPPING (Quick Start -> Program Generator)
// ============================================================

/**
 * Mappa i goal Quick Start ai goal del program generator
 */
export function mapQuickStartGoalToProgram(
  goal: QuickStartData['goal']
): string {
  const mapping: Record<QuickStartData['goal'], string> = {
    forza: 'forza',
    massa: 'ipertrofia',
    dimagrimento: 'dimagrimento',
    resistenza: 'resistenza',
    generale: 'tonificazione',
  };

  return mapping[goal];
}

/**
 * Genera opzioni complete per il program generator dal Quick Start data
 */
export function generateProgramOptionsFromQuickStart(
  data: QuickStartData,
  level: InitialLevel
): {
  level: 'beginner' | 'intermediate';
  goal: string;
  location: 'gym' | 'home';
  frequency: number;
  baselines: Record<string, unknown>;
  quizScore: number;
  practicalScore: number;
  discrepancyType: 'none';
} {
  const params = getConservativeParams(level);

  return {
    level,
    goal: mapQuickStartGoalToProgram(data.goal),
    location: data.location,
    frequency: data.frequency,
    baselines: {}, // Nessuna baseline iniziale
    quizScore: level === 'beginner' ? 30 : 50, // Score conservativo
    practicalScore: level === 'beginner' ? 30 : 50,
    discrepancyType: 'none',
  };
}
