/**
 * RIR CALIBRATION SYSTEM - TrainSmart
 * 
 * Calibra il Reps In Reserve (RIR) riportato dall'utente basandosi sul livello.
 * I principianti tendono a sottostimare significativamente le reps rimanenti.
 * 
 * REFERENCE:
 * - Zourdos MC et al. (2016) - Novel Resistance Training-Specific RPE Scale
 * - Helms ER et al. (2016) - Application of the Repetitions in Reserve-Based
 *   Rating of Perceived Exertion Scale for Resistance Training
 * - Steele J et al. (2017) - Trainee self-regulation of effort during resistance training
 * 
 * FINDINGS CHIAVE:
 * - Beginners sovrastimano RIR di 2-4 punti (dicono RIR 3, sono a RIR 0-1)
 * - Intermediate sovrastimano di 1-2 punti
 * - Advanced sono accurati entro ±1 punto
 */

// ============================================================================
// TYPES
// ============================================================================

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface RIRCalibrationConfig {
  /** Range di incertezza tipico (es. ±2 significa RIR potrebbe essere ±2 dal riportato) */
  uncertaintyRange: number;
  /** Direzione bias: 'over' = tendono a sovrastimare RIR, 'under' = sottostimano, 'none' = accurato */
  biasDirection: 'over' | 'under' | 'none';
  /** Correzione media da applicare (positivo = aggiungi al RIR reale stimato) */
  biasCorrection: number;
  /** Sessioni minime prima di applicare adjustment significativi */
  minSessionsBeforeAdjustment: number;
  /** Adjustment massimo applicabile in una sessione (%) */
  maxAdjustmentPercent: number;
  /** Confidence necessaria per applicare adjustment automatici */
  confidenceThreshold: 'low' | 'medium' | 'high';
}

export interface CalibratedRIR {
  /** RIR riportato dall'utente */
  reportedRIR: number;
  /** RIR stimato reale dopo calibrazione */
  calibratedRIR: number;
  /** Range di confidenza [min, max] */
  confidenceRange: [number, number];
  /** Livello di confidenza nella stima */
  confidence: 'low' | 'medium' | 'high';
  /** Spiegazione della calibrazione */
  explanation: string;
  explanationIt: string;
}

export interface AdjustmentDecision {
  shouldAdjust: boolean;
  adjustmentPercent: number;
  reason: string;
  reasonIt: string;
  confidence: 'low' | 'medium' | 'high';
  /** Se l'utente è ancora in "learning period" */
  isLearningPeriod: boolean;
}

// ============================================================================
// CALIBRATION CONFIGURATION BY LEVEL
// ============================================================================

export const RIR_CALIBRATION_CONFIG: Record<UserLevel, RIRCalibrationConfig> = {
  beginner: {
    // Beginners sovrastimano massivamente - quando dicono RIR 2, sono probabilmente a RIR 0
    uncertaintyRange: 2.5,
    biasDirection: 'over',
    biasCorrection: -2, // Sottrai 2 dal RIR riportato
    minSessionsBeforeAdjustment: 8, // Più tempo per imparare
    maxAdjustmentPercent: 5, // Adjustment conservativi
    confidenceThreshold: 'high' // Solo con alta confidenza
  },
  intermediate: {
    // Intermediate ancora sovrastimano ma meno
    uncertaintyRange: 1.5,
    biasDirection: 'over',
    biasCorrection: -1, // Sottrai 1
    minSessionsBeforeAdjustment: 4,
    maxAdjustmentPercent: 10,
    confidenceThreshold: 'medium'
  },
  advanced: {
    // Advanced sono relativamente accurati
    uncertaintyRange: 0.5,
    biasDirection: 'none',
    biasCorrection: 0,
    minSessionsBeforeAdjustment: 2,
    maxAdjustmentPercent: 15,
    confidenceThreshold: 'low' // Possono fidarsi di più del loro input
  }
};

// ============================================================================
// TARGET RIR BY GOAL AND LEVEL
// ============================================================================

/**
 * RIR target basato su goal e giorno della settimana (DUP)
 */
export const TARGET_RIR_MATRIX: Record<string, Record<string, Record<string, number>>> = {
  // Goal -> Level -> DayType -> Target RIR
  ipertrofia: {
    beginner: { heavy: 3, moderate: 4, light: 5 },
    intermediate: { heavy: 2, moderate: 3, light: 4 },
    advanced: { heavy: 1, moderate: 2, light: 3 }
  },
  forza: {
    beginner: { heavy: 2, moderate: 3, light: 4 },
    intermediate: { heavy: 1, moderate: 2, light: 3 },
    advanced: { heavy: 0, moderate: 1, light: 2 }
  },
  resistenza: {
    beginner: { heavy: 4, moderate: 5, light: 6 },
    intermediate: { heavy: 3, moderate: 4, light: 5 },
    advanced: { heavy: 2, moderate: 3, light: 4 }
  },
  dimagrimento: {
    beginner: { heavy: 3, moderate: 4, light: 5 },
    intermediate: { heavy: 2, moderate: 3, light: 4 },
    advanced: { heavy: 2, moderate: 3, light: 4 }
  }
};

// ============================================================================
// CORE CALIBRATION FUNCTIONS
// ============================================================================

/**
 * Calibra il RIR riportato dall'utente basandosi sul livello
 */
export function calibrateRIR(
  reportedRIR: number,
  level: UserLevel,
  sessionNumber: number = 0
): CalibratedRIR {
  const config = RIR_CALIBRATION_CONFIG[level];
  
  // Applica correzione bias
  let calibratedRIR = reportedRIR + config.biasCorrection;
  
  // Clamp a 0-10
  calibratedRIR = Math.max(0, Math.min(10, calibratedRIR));
  
  // Calcola range di confidenza
  const confidenceRange: [number, number] = [
    Math.max(0, calibratedRIR - config.uncertaintyRange),
    Math.min(10, calibratedRIR + config.uncertaintyRange)
  ];
  
  // Determina confidence level
  let confidence: 'low' | 'medium' | 'high';
  if (level === 'advanced') {
    confidence = 'high';
  } else if (level === 'intermediate') {
    confidence = sessionNumber > 10 ? 'medium' : 'low';
  } else {
    confidence = sessionNumber > 20 ? 'medium' : 'low';
  }
  
  // Genera spiegazione
  let explanation = '';
  let explanationIt = '';
  
  if (config.biasCorrection !== 0) {
    if (config.biasDirection === 'over') {
      explanation = `As a ${level}, you likely have ${Math.abs(config.biasCorrection)} more reps than you think`;
      explanationIt = `Come ${level === 'beginner' ? 'principiante' : 'intermedio'}, probabilmente hai ${Math.abs(config.biasCorrection)} reps in più di quanto pensi`;
    }
  } else {
    explanation = 'Your RIR estimate is likely accurate';
    explanationIt = 'La tua stima RIR è probabilmente accurata';
  }
  
  return {
    reportedRIR,
    calibratedRIR: Math.round(calibratedRIR * 10) / 10,
    confidenceRange,
    confidence,
    explanation,
    explanationIt
  };
}

/**
 * Determina se applicare un adjustment basato sul RIR
 */
export function shouldApplyWeightAdjustment(
  reportedRIR: number,
  targetRIR: number,
  level: UserLevel,
  sessionCount: number,
  exerciseSessionCount: number = sessionCount
): AdjustmentDecision {
  const config = RIR_CALIBRATION_CONFIG[level];
  const calibrated = calibrateRIR(reportedRIR, level, sessionCount);
  
  // Check learning period
  const isLearningPeriod = exerciseSessionCount < config.minSessionsBeforeAdjustment;
  
  if (isLearningPeriod) {
    return {
      shouldAdjust: false,
      adjustmentPercent: 0,
      reason: `Learning period: ${exerciseSessionCount}/${config.minSessionsBeforeAdjustment} sessions completed`,
      reasonIt: `Periodo di apprendimento: ${exerciseSessionCount}/${config.minSessionsBeforeAdjustment} sessioni completate`,
      confidence: 'low',
      isLearningPeriod: true
    };
  }
  
  // Check if target is within confidence range
  const [rangeMin, rangeMax] = calibrated.confidenceRange;
  
  if (targetRIR >= rangeMin && targetRIR <= rangeMax) {
    return {
      shouldAdjust: false,
      adjustmentPercent: 0,
      reason: `Target RIR ${targetRIR} is within confidence range [${rangeMin.toFixed(1)}-${rangeMax.toFixed(1)}]`,
      reasonIt: `RIR target ${targetRIR} è nel range di confidenza [${rangeMin.toFixed(1)}-${rangeMax.toFixed(1)}]`,
      confidence: calibrated.confidence,
      isLearningPeriod: false
    };
  }
  
  // Calcola adjustment necessario
  const rirDifference = targetRIR - calibrated.calibratedRIR;
  
  // Ogni punto di RIR ≈ 2.5-3% di carico
  const adjustmentPercent = Math.round(rirDifference * 2.5);
  
  // Clamp al massimo consentito
  const clampedAdjustment = Math.max(
    -config.maxAdjustmentPercent,
    Math.min(config.maxAdjustmentPercent, adjustmentPercent)
  );
  
  // Solo applica se confidence è sufficiente
  const confidenceOk = 
    config.confidenceThreshold === 'low' ||
    (config.confidenceThreshold === 'medium' && calibrated.confidence !== 'low') ||
    (config.confidenceThreshold === 'high' && calibrated.confidence === 'high');
  
  if (!confidenceOk) {
    return {
      shouldAdjust: false,
      adjustmentPercent: 0,
      reason: `Confidence too low (${calibrated.confidence}) for adjustment`,
      reasonIt: `Confidenza troppo bassa (${calibrated.confidence}) per adjustment`,
      confidence: calibrated.confidence,
      isLearningPeriod: false
    };
  }
  
  const direction = clampedAdjustment > 0 ? 'increase' : 'decrease';
  const directionIt = clampedAdjustment > 0 ? 'aumentare' : 'diminuire';
  
  return {
    shouldAdjust: Math.abs(clampedAdjustment) >= 2.5, // Solo se almeno 2.5%
    adjustmentPercent: clampedAdjustment,
    reason: `Calibrated RIR ${calibrated.calibratedRIR.toFixed(1)} vs target ${targetRIR}: ${direction} by ${Math.abs(clampedAdjustment)}%`,
    reasonIt: `RIR calibrato ${calibrated.calibratedRIR.toFixed(1)} vs target ${targetRIR}: ${directionIt} del ${Math.abs(clampedAdjustment)}%`,
    confidence: calibrated.confidence,
    isLearningPeriod: false
  };
}

/**
 * Ottiene il target RIR per una combinazione goal/level/day
 */
export function getTargetRIR(
  goal: string,
  level: UserLevel,
  dayType: 'heavy' | 'moderate' | 'light' = 'moderate'
): number {
  const goalLower = goal.toLowerCase();
  
  // Mappa alias goal
  let goalKey = 'ipertrofia';
  if (goalLower.includes('forza') || goalLower.includes('strength')) {
    goalKey = 'forza';
  } else if (goalLower.includes('resistenza') || goalLower.includes('endurance')) {
    goalKey = 'resistenza';
  } else if (goalLower.includes('dimagrimento') || goalLower.includes('weight') || goalLower.includes('fat')) {
    goalKey = 'dimagrimento';
  }
  
  return TARGET_RIR_MATRIX[goalKey]?.[level]?.[dayType] ?? 3;
}

// ============================================================================
// FEEDBACK ANALYSIS
// ============================================================================

/**
 * Analizza pattern di RIR reporting nel tempo per calibrazione personalizzata
 */
export function analyzeRIRPattern(
  rirHistory: Array<{ reported: number; actual?: number; outcome: 'completed' | 'failed' | 'easy' }>
): {
  estimatedBias: number;
  confidence: 'low' | 'medium' | 'high';
  suggestion: string;
  suggestionIt: string;
} {
  if (rirHistory.length < 5) {
    return {
      estimatedBias: 0,
      confidence: 'low',
      suggestion: 'Need more data to calibrate',
      suggestionIt: 'Servono più dati per calibrare'
    };
  }
  
  // Analizza outcomes
  const outcomes = rirHistory.slice(-10);
  const failedAtHighRIR = outcomes.filter(r => r.outcome === 'failed' && r.reported > 1).length;
  const easyAtLowRIR = outcomes.filter(r => r.outcome === 'easy' && r.reported < 3).length;
  
  let estimatedBias = 0;
  
  // Se falliscono spesso quando dicono RIR > 1, stanno sovrastimando
  if (failedAtHighRIR >= 2) {
    estimatedBias = -2; // Sovrastimano di ~2
  } else if (easyAtLowRIR >= 2) {
    estimatedBias = 1; // Sottostimano leggermente
  }
  
  const confidence = outcomes.length >= 10 ? 'high' : 'medium';
  
  let suggestion = '';
  let suggestionIt = '';
  
  if (estimatedBias < -1) {
    suggestion = 'You tend to overestimate RIR. Push a bit harder!';
    suggestionIt = 'Tendi a sovrastimare il RIR. Puoi spingere di più!';
  } else if (estimatedBias > 0.5) {
    suggestion = 'You tend to underestimate RIR. Good intensity awareness!';
    suggestionIt = 'Tendi a sottostimare il RIR. Buona consapevolezza!';
  } else {
    suggestion = 'Your RIR estimates are well calibrated.';
    suggestionIt = 'Le tue stime RIR sono ben calibrate.';
  }
  
  return {
    estimatedBias,
    confidence,
    suggestion,
    suggestionIt
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const RIRCalibration = {
  calibrateRIR,
  shouldApplyWeightAdjustment,
  getTargetRIR,
  analyzeRIRPattern,
  RIR_CALIBRATION_CONFIG,
  TARGET_RIR_MATRIX
};

export default RIRCalibration;
