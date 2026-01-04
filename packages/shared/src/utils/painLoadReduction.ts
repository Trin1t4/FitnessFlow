/**
 * Pain Load Reduction System (Simplified)
 * TrainSmart - Sistema di riduzione carico basato su fastidio
 *
 * Questo sistema riduce automaticamente il carico quando l'utente segnala fastidio.
 * NON classifica il tipo di dolore - lascia questo ai professionisti.
 *
 * Principi:
 * 1. Fastidio lieve → riduci leggermente, continua
 * 2. Fastidio moderato → riduci significativamente
 * 3. Fastidio severo → stop, consiglia professionista
 * 4. Fastidio ricorrente → consiglia professionista
 */

// =============================================================================
// TYPES (Semplificati)
// =============================================================================

/** Severità del fastidio - scala semplice */
export type DiscomfortSeverity = 'none' | 'mild' | 'moderate' | 'severe';

/** Report fastidio dall'utente */
export interface DiscomfortReport {
  /** Intensità 0-10 (verrà convertita in severity) */
  intensity: number;
  /** Zona del corpo */
  area: string;
  /** Il fastidio aumenta durante l'esercizio? */
  increasesDuringExercise?: boolean;
  /** È ricorrente (segnalato in sessioni precedenti)? */
  isRecurring?: boolean;
}

/** Risultato della riduzione carico */
export interface LoadReductionResult {
  /** Moltiplicatore volume (0.0 - 1.0, dove 0 = salta esercizio) */
  volumeMultiplier: number;
  /** Moltiplicatore intensità (0.0 - 1.0) */
  intensityMultiplier: number;
  /** Moltiplicatore riposo (1.0 - 2.0) */
  restMultiplier: number;
  /** Saltare completamente l'esercizio? */
  skipExercise: boolean;
  /** Messaggio per l'utente */
  message: string;
  /** Suggerimenti specifici */
  suggestions: string[];
  /** Consigliare visita da professionista? */
  consultProfessional: boolean;
  /** Livello di confidenza nella raccomandazione */
  confidence: 'high' | 'moderate' | 'low';
}

// =============================================================================
// SEVERITY CLASSIFICATION (Semplice, non clinica)
// =============================================================================

/**
 * Converte intensità numerica (0-10) in severità
 */
export function intensityToSeverity(intensity: number): DiscomfortSeverity {
  if (intensity <= 0) return 'none';
  if (intensity <= 3) return 'mild';
  if (intensity <= 6) return 'moderate';
  return 'severe';
}

/**
 * Converte severità in range numerico per display
 */
export function severityToIntensityRange(severity: DiscomfortSeverity): string {
  switch (severity) {
    case 'none':
      return '0';
    case 'mild':
      return '1-3';
    case 'moderate':
      return '4-6';
    case 'severe':
      return '7-10';
  }
}

// =============================================================================
// RED FLAGS - Situazioni che richiedono attenzione immediata
// =============================================================================

interface RedFlag {
  check: (report: DiscomfortReport) => boolean;
  message: string;
}

const RED_FLAGS: RedFlag[] = [
  {
    check: (r) => r.intensity >= 8 && r.increasesDuringExercise === true,
    message:
      'Fastidio intenso che peggiora con il movimento. ' +
      'Ti consigliamo di fermarti e consultare un professionista.'
  },
  {
    check: (r) => r.isRecurring === true && r.intensity >= 5,
    message:
      'Fastidio ricorrente. Questo potrebbe indicare un problema che richiede ' +
      'attenzione professionale. Considera di consultare un fisioterapista o medico sportivo.'
  },
  {
    check: (r) =>
      r.area.toLowerCase().includes('chest') ||
      r.area.toLowerCase().includes('petto') ||
      r.area.toLowerCase().includes('torace'),
    message:
      'Fastidio al petto durante l\'esercizio. Per sicurezza, fermati e ' +
      'consulta un medico prima di continuare.'
  }
];

/**
 * Verifica se ci sono red flags nel report
 */
function checkRedFlags(report: DiscomfortReport): string[] {
  return RED_FLAGS.filter((flag) => flag.check(report)).map((flag) => flag.message);
}

// =============================================================================
// LOAD REDUCTION CALCULATION
// =============================================================================

/**
 * Calcola la riduzione del carico basata sul report di fastidio.
 *
 * Logica semplice e trasparente:
 * - Nessun fastidio → 100% del programma
 * - Fastidio lieve → 80% volume/intensità
 * - Fastidio moderato → 50-60% volume/intensità
 * - Fastidio severo → stop esercizio
 * - Ricorrente → consiglia professionista
 */
export function calculateLoadReduction(
  report: DiscomfortReport
): LoadReductionResult {
  const severity = intensityToSeverity(report.intensity);
  const redFlagMessages = checkRedFlags(report);
  const hasRedFlags = redFlagMessages.length > 0;

  // Se ci sono red flags, stop immediato
  if (hasRedFlags) {
    return {
      volumeMultiplier: 0,
      intensityMultiplier: 0,
      restMultiplier: 1,
      skipExercise: true,
      message: redFlagMessages[0],
      suggestions: [
        'Fermati e riposa',
        'Non forzare attraverso il dolore',
        'Consulta un professionista prima di riprendere'
      ],
      consultProfessional: true,
      confidence: 'high'
    };
  }

  // Logica basata su severità
  switch (severity) {
    case 'none':
      return {
        volumeMultiplier: 1.0,
        intensityMultiplier: 1.0,
        restMultiplier: 1.0,
        skipExercise: false,
        message: 'Nessun fastidio segnalato. Procedi normalmente.',
        suggestions: [],
        consultProfessional: false,
        confidence: 'high'
      };

    case 'mild':
      return {
        volumeMultiplier: 0.8,
        intensityMultiplier: 0.8,
        restMultiplier: 1.2,
        skipExercise: false,
        message:
          'Fastidio lieve rilevato. Riduciamo leggermente il carico per sicurezza.',
        suggestions: [
          'Esegui il movimento con attenzione alla forma',
          'Se il fastidio aumenta, fermati',
          'Aumenta leggermente i tempi di recupero'
        ],
        consultProfessional: false,
        confidence: 'high'
      };

    case 'moderate':
      return {
        volumeMultiplier: 0.5,
        intensityMultiplier: 0.6,
        restMultiplier: 1.5,
        skipExercise: false,
        message:
          'Fastidio moderato rilevato. Riduciamo significativamente il carico.',
        suggestions: [
          'Riduci il range di movimento se necessario',
          'Fermati se il fastidio supera 5/10',
          'Considera un esercizio alternativo',
          report.isRecurring
            ? 'Il fastidio sembra ricorrente - valuta una visita specialistica'
            : 'Monitora il fastidio nelle prossime sessioni'
        ],
        consultProfessional: report.isRecurring === true,
        confidence: 'moderate'
      };

    case 'severe':
      return {
        volumeMultiplier: 0,
        intensityMultiplier: 0,
        restMultiplier: 1,
        skipExercise: true,
        message:
          'Fastidio significativo rilevato. Saltiamo questo esercizio oggi.',
        suggestions: [
          'Non forzare attraverso il dolore',
          'Passa a un esercizio alternativo per altri gruppi muscolari',
          'Applica ghiaccio se appropriato dopo l\'allenamento',
          'Se il fastidio persiste, consulta un professionista'
        ],
        consultProfessional: true,
        confidence: 'high'
      };
  }
}

// =============================================================================
// QUICK HELPERS
// =============================================================================

/**
 * Versione semplificata per chiamate rapide
 */
export function quickLoadReduction(
  intensity: number,
  isRecurring: boolean = false
): LoadReductionResult {
  return calculateLoadReduction({
    intensity,
    area: 'general',
    isRecurring
  });
}

/**
 * Verifica se un esercizio dovrebbe essere saltato
 */
export function shouldSkipExercise(
  intensity: number,
  isRecurring: boolean = false
): boolean {
  const result = quickLoadReduction(intensity, isRecurring);
  return result.skipExercise;
}

/**
 * Ottieni il moltiplicatore di volume per un dato livello di fastidio
 */
export function getVolumeMultiplier(intensity: number): number {
  const result = quickLoadReduction(intensity);
  return result.volumeMultiplier;
}

/**
 * Ottieni il moltiplicatore di intensità per un dato livello di fastidio
 */
export function getIntensityMultiplier(intensity: number): number {
  const result = quickLoadReduction(intensity);
  return result.intensityMultiplier;
}

// =============================================================================
// EXERCISE-SPECIFIC ADJUSTMENTS
// =============================================================================

/** Aree del corpo e esercizi correlati */
const AREA_EXERCISE_SENSITIVITY: Record<string, string[]> = {
  lower_back: [
    'deadlift',
    'squat',
    'good_morning',
    'bent_over_row',
    'romanian_deadlift'
  ],
  knee: [
    'squat',
    'lunge',
    'leg_press',
    'leg_extension',
    'step_up'
  ],
  shoulder: [
    'overhead_press',
    'lateral_raise',
    'bench_press',
    'pull_up',
    'dip'
  ],
  hip: [
    'squat',
    'deadlift',
    'lunge',
    'hip_thrust',
    'leg_press'
  ]
};

/**
 * Verifica se un esercizio è sensibile per una data area
 */
export function isExerciseSensitiveForArea(
  exerciseName: string,
  area: string
): boolean {
  const normalizedExercise = exerciseName.toLowerCase().replace(/\s+/g, '_');
  const sensitiveExercises = AREA_EXERCISE_SENSITIVITY[area.toLowerCase()] || [];

  return sensitiveExercises.some(
    (sensitive) =>
      normalizedExercise.includes(sensitive) || sensitive.includes(normalizedExercise)
  );
}

/**
 * Calcola riduzione carico specifica per esercizio
 */
export function calculateExerciseSpecificReduction(
  exerciseName: string,
  report: DiscomfortReport
): LoadReductionResult {
  const baseReduction = calculateLoadReduction(report);

  // Se l'esercizio è particolarmente sensibile per l'area interessata,
  // aumenta la riduzione
  if (isExerciseSensitiveForArea(exerciseName, report.area)) {
    return {
      ...baseReduction,
      volumeMultiplier: baseReduction.volumeMultiplier * 0.8,
      intensityMultiplier: baseReduction.intensityMultiplier * 0.8,
      message:
        baseReduction.message +
        ` Questo esercizio coinvolge direttamente la zona interessata.`,
      suggestions: [
        ...baseReduction.suggestions,
        'Considera un\'alternativa che non carichi questa zona'
      ]
    };
  }

  return baseReduction;
}

// =============================================================================
// DISCLAIMER (sempre visibile)
// =============================================================================

export const DISCOMFORT_DISCLAIMER =
  'TrainSmart adatta automaticamente il tuo allenamento quando segnali fastidio, ' +
  'ma non può sostituire il parere di un professionista sanitario. ' +
  'Se il fastidio persiste o peggiora, consulta un fisioterapista o medico sportivo.';

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/** @deprecated Use DiscomfortSeverity instead */
export type PainType = 'acute' | 'subacute' | 'chronic' | 'doms' | 'unknown';

/** @deprecated Use DiscomfortReport instead */
export interface PainAssessment {
  intensity: number;
  type?: PainType;
  area: string;
  increasesDuringExercise?: boolean;
  returnsToBaseline24h?: boolean;
  progressiveWorsening?: boolean;
  hasInjuryHistory?: boolean;
  hasSwelling?: boolean;
}

/** @deprecated Use calculateLoadReduction instead */
export function calculateEvidenceBasedLoadReduction(
  assessment: PainAssessment
): LoadReductionResult {
  return calculateLoadReduction({
    intensity: assessment.intensity,
    area: assessment.area,
    increasesDuringExercise: assessment.increasesDuringExercise,
    isRecurring: assessment.hasInjuryHistory
  });
}

/** @deprecated Use calculateLoadReduction instead */
export function calculatePainLoadReduction(assessment: PainAssessment): LoadReductionResult & {
  romRestriction?: string;
  acceptablePainThreshold: number;
  modifications: string[];
  warnings: string[];
  redFlags: string[];
} {
  const result = calculateLoadReduction({
    intensity: assessment.intensity,
    area: assessment.area,
    increasesDuringExercise: assessment.increasesDuringExercise,
    isRecurring: assessment.hasInjuryHistory
  });

  return {
    ...result,
    acceptablePainThreshold: 4,
    modifications: result.suggestions,
    warnings: result.consultProfessional ? ['Consulta un professionista'] : [],
    redFlags: result.skipExercise ? [result.message] : []
  };
}

/** @deprecated Use quickLoadReduction instead */
export function getSimplePainReduction(painIntensity: number): number {
  const result = quickLoadReduction(painIntensity);
  return Math.round((1 - result.volumeMultiplier) * 100);
}

/** @deprecated Use isExerciseSensitiveForArea instead */
export function shouldModifyForPain(
  exerciseName: string,
  painArea: string,
  painIntensity: number
): { modify: boolean; suggestion: string } {
  const isSensitive = isExerciseSensitiveForArea(exerciseName, painArea);

  if (!isSensitive) {
    return { modify: false, suggestion: '' };
  }

  if (painIntensity >= 7) {
    return {
      modify: true,
      suggestion: `Sostituisci ${exerciseName} con un'alternativa che non coinvolga ${painArea}`
    };
  } else if (painIntensity >= 4) {
    return {
      modify: true,
      suggestion: `Riduci carico e ROM per ${exerciseName}, monitora il dolore`
    };
  } else {
    return {
      modify: true,
      suggestion: `Procedi con cautela per ${exerciseName}, ferma se il dolore supera 4/10`
    };
  }
}

export default {
  calculateLoadReduction,
  quickLoadReduction,
  shouldSkipExercise,
  getVolumeMultiplier,
  getIntensityMultiplier,
  isExerciseSensitiveForArea,
  calculateExerciseSpecificReduction,
  intensityToSeverity,
  severityToIntensityRange,
  DISCOMFORT_DISCLAIMER,
  // Legacy exports
  calculatePainLoadReduction,
  getSimplePainReduction,
  shouldModifyForPain
};
