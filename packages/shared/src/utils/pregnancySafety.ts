/**
 * ============================================================================
 * PREGNANCY SAFETY MODULE - Fix Critico #1
 * ============================================================================
 *
 * Questo modulo gestisce la sicurezza degli esercizi per donne in gravidanza.
 * DEVE essere integrato in weeklySplitGenerator.ts
 *
 * Controindicazioni basate su:
 * - ACOG Guidelines (American College of Obstetricians and Gynecologists)
 * - Position Statement ACSM su esercizio in gravidanza
 *
 * @module pregnancySafety
 * @version 1.0.0
 */

// ============================================================================
// TYPES
// ============================================================================

export type Trimester = 1 | 2 | 3;

export interface PregnancyContext {
  isPregnancy: boolean;
  trimester?: Trimester;
  hasComplications?: boolean;
}

// ============================================================================
// CONSTANTS - Esercizi Controindicati
// ============================================================================

/**
 * Esercizi PRONI (a pancia in giù)
 * Controindicati dal 2° trimestre per compressione addominale
 */
const PRONE_EXERCISES = [
  'superman',
  'prone',
  'floor pull',
  'cobra',
  'back extension',
  'hyperextension',
  'reverse hyper',
  'prone y',
  'prone i',
  'prone t',
  'prone w',
  'seal row',
  'lying leg curl',  // Se prono
  'lying hamstring',
];

/**
 * Esercizi SUPINI (a pancia in su)
 * Controindicati dal 2° trimestre per compressione vena cava
 */
const SUPINE_EXERCISES = [
  'crunch',
  'sit-up',
  'situp',
  'sit up',
  'dead bug',
  'leg raise',
  'lying leg raise',
  'bicycle crunch',
  'v-up',
  'v up',
  'hollow',
  'panca piana',
  'bench press',
  'floor press',
  'dumbbell press',  // Se supino
  'glute bridge',    // Brevi durate OK, lunghe no
  'hip thrust',      // Può essere modificato
];

/**
 * Esercizi ad IMPATTO
 * Controindicati per tutto il periodo
 */
const IMPACT_EXERCISES = [
  'jump',
  'jumping',
  'box jump',
  'burpee',
  'burpees',
  'plyometric',
  'plyo',
  'bound',
  'hop',
  'skip',
  'tuck jump',
  'star jump',
  'squat jump',
  'lunge jump',
  'broad jump',
  'depth jump',
  'drop jump',
];

/**
 * Esercizi con CARICO ASSIALE PESANTE
 * Controindicati o da modificare significativamente
 */
const HEAVY_AXIAL_LOAD_EXERCISES = [
  'back squat',
  'front squat',
  'overhead squat',
  'deadlift',
  'stacco',
  'romanian deadlift',
  'stacco rumeno',
  'good morning',
  'barbell row',
  'bent over row',
];

/**
 * Esercizi che richiedono EQUILIBRIO AVANZATO
 * Problematici dal 2° trimestre per cambiamento baricentro
 */
const BALANCE_EXERCISES = [
  'pistol',
  'single leg squat',
  'bulgarian split',
  'walking lunge',
  'step up',  // Altezze elevate
];

/**
 * Esercizi con VALSALVA o PRESSIONE INTRA-ADDOMINALE ELEVATA
 */
const HIGH_IAP_EXERCISES = [
  'plank',  // Lunghe durate
  'l-sit',
  'dragon flag',
  'ab wheel',
  'rollout',
];

// ============================================================================
// ALTERNATIVE SICURE
// ============================================================================

/**
 * Mapping esercizio unsafe → alternativa sicura
 * Le alternative sono selezionate per:
 * - Stesso pattern motorio quando possibile
 * - Posizione laterale, in piedi, o seduta
 * - Basso impatto
 */
export const PREGNANCY_SAFE_ALTERNATIVES: Record<string, string> = {
  // PRONI → Alternative in piedi o laterali
  'Superman': 'Bird Dog',
  'superman': 'Bird Dog',
  'Prone Y-raise': 'Standing Band Y-raise',
  'prone y-raise': 'Standing Band Y-raise',
  'Prone Y Raise': 'Standing Band Y-raise',
  'Floor Pull': 'Seated Cable Row',
  'floor pull': 'Seated Cable Row',
  'Floor Pull (asciugamano)': 'Seated Band Row',
  'Back Extension': 'Standing Hip Hinge',
  'back extension': 'Standing Hip Hinge',
  'Cobra': 'Cat-Cow (solo fase cow)',
  'cobra': 'Cat-Cow',

  // SUPINI → Alternative laterali, in piedi, o inclinate
  'Crunch': 'Pallof Press',
  'crunch': 'Pallof Press',
  'Sit-up': 'Pallof Press',
  'sit-up': 'Pallof Press',
  'Dead Bug': 'Pallof Press Kneeling',
  'dead bug': 'Pallof Press Kneeling',
  'Leg Raise': 'Standing Knee Raise',
  'leg raise': 'Standing Knee Raise',
  'Lying Leg Raise': 'Standing Knee Raise',
  'Bicycle Crunch': 'Standing Oblique Crunch',
  'bicycle crunch': 'Standing Oblique Crunch',
  'V-up': 'Seated Knee Tuck',
  'v-up': 'Seated Knee Tuck',
  'Hollow Hold': 'Side Plank (modificato)',
  'hollow hold': 'Side Plank (modificato)',
  'Panca Piana': 'Incline Dumbbell Press 45°',
  'panca piana': 'Incline Dumbbell Press 45°',
  'Bench Press': 'Incline Dumbbell Press 45°',
  'bench press': 'Incline Dumbbell Press 45°',
  'Floor Press': 'Incline Push-up',
  'floor press': 'Incline Push-up',
  'Glute Bridge': 'Standing Kickback',
  'glute bridge': 'Standing Kickback',
  'Hip Thrust': 'Standing Hip Extension con banda',
  'hip thrust': 'Standing Hip Extension con banda',

  // IMPATTO → Alternative senza salto
  'Jump Squat': 'Goblet Squat',
  'jump squat': 'Goblet Squat',
  'Squat Jump': 'Goblet Squat',
  'squat jump': 'Goblet Squat',
  'Box Jump': 'Step Up (altezza bassa)',
  'box jump': 'Step Up (altezza bassa)',
  'Burpees': 'Squat to Press',
  'burpees': 'Squat to Press',
  'Burpee': 'Squat to Press',
  'burpee': 'Squat to Press',
  'Jump Lunge': 'Alternating Lunge',
  'jump lunge': 'Alternating Lunge',
  'Tuck Jump': 'Bodyweight Squat',
  'tuck jump': 'Bodyweight Squat',
  'Star Jump': 'Lateral Step Out',
  'star jump': 'Lateral Step Out',
  'Broad Jump': 'Walking Lunge',
  'broad jump': 'Walking Lunge',

  // CARICO ASSIALE PESANTE → Versioni modificate
  'Back Squat': 'Goblet Squat',
  'back squat': 'Goblet Squat',
  'Front Squat': 'Goblet Squat',
  'front squat': 'Goblet Squat',
  'Deadlift': 'Sumo Deadlift (leggero)',
  'deadlift': 'Sumo Deadlift (leggero)',
  'Stacco': 'Sumo Deadlift (leggero)',
  'stacco': 'Sumo Deadlift (leggero)',
  'Romanian Deadlift': 'Single Leg RDL (supportato)',
  'romanian deadlift': 'Single Leg RDL (supportato)',
  'Stacco Rumeno': 'Single Leg RDL (supportato)',
  'stacco rumeno': 'Single Leg RDL (supportato)',
  'Good Morning': 'Seated Good Morning (leggero)',
  'good morning': 'Seated Good Morning (leggero)',
  'Barbell Row': 'Seated Cable Row',
  'barbell row': 'Seated Cable Row',

  // EQUILIBRIO → Versioni supportate
  'Pistol Squat': 'Assisted Squat',
  'pistol squat': 'Assisted Squat',
  'Bulgarian Split Squat': 'Split Squat (supportato)',
  'bulgarian split squat': 'Split Squat (supportato)',

  // ALTA PRESSIONE INTRA-ADDOMINALE
  'Plank': 'Wall Plank o Incline Plank',
  'plank': 'Wall Plank o Incline Plank',
  'Ab Wheel': 'Wall Press',
  'ab wheel': 'Wall Press',
  'Rollout': 'Wall Press',
  'rollout': 'Wall Press',
  'L-Sit': 'Seated Knee Raise',
  'l-sit': 'Seated Knee Raise',
};

/**
 * Esercizi sicuri per default durante la gravidanza
 * Usati come fallback se non c'è alternativa specifica
 */
export const DEFAULT_SAFE_EXERCISES: Record<string, string> = {
  'core': 'Pallof Press Kneeling',
  'lower_push': 'Goblet Squat',
  'lower_pull': 'Standing Hip Extension',
  'horizontal_push': 'Incline Push-up',
  'horizontal_pull': 'Seated Band Row',
  'vertical_push': 'Seated Dumbbell Press',
  'vertical_pull': 'Lat Pulldown',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Controlla se il goal indica una gravidanza
 */
export function isPregnancyGoal(goal: string | undefined): boolean {
  if (!goal) return false;

  const pregnancyGoals = [
    'prenatal',
    'pregnancy',
    'pre_partum',
    'pre-partum',
    'prepartum',
    'gravidanza',
    // Post-partum ha restrizioni simili nelle prime settimane
    'postnatal',
    'post_partum',
    'post-partum',
    'postpartum',
  ];

  return pregnancyGoals.includes(goal.toLowerCase());
}

/**
 * Controlla se un esercizio è sicuro per la gravidanza
 *
 * @param exerciseName - Nome dell'esercizio
 * @param trimester - Trimestre (1, 2, 3). Default 2 per essere conservativi.
 * @returns true se l'esercizio è sicuro
 */
export function isExerciseSafeForPregnancy(
  exerciseName: string,
  trimester: Trimester = 2
): boolean {
  const nameLower = exerciseName.toLowerCase();

  // SEMPRE controindicati (tutti i trimestri)
  for (const pattern of IMPACT_EXERCISES) {
    if (nameLower.includes(pattern.toLowerCase())) {
      return false;
    }
  }

  // Controindicati dal 2° trimestre
  if (trimester >= 2) {
    for (const pattern of PRONE_EXERCISES) {
      if (nameLower.includes(pattern.toLowerCase())) {
        return false;
      }
    }

    for (const pattern of SUPINE_EXERCISES) {
      if (nameLower.includes(pattern.toLowerCase())) {
        return false;
      }
    }

    for (const pattern of BALANCE_EXERCISES) {
      if (nameLower.includes(pattern.toLowerCase())) {
        return false;
      }
    }
  }

  // Carico assiale pesante - sempre sconsigliato, ma non bloccante
  // (verrà gestito con riduzione carico)

  return true;
}

/**
 * Ottiene un'alternativa sicura per un esercizio controindicato
 *
 * @param exerciseName - Nome dell'esercizio originale
 * @param pattern - Pattern motorio (per fallback)
 * @returns Nome dell'esercizio sicuro alternativo
 */
export function getPregnancySafeAlternative(
  exerciseName: string,
  pattern?: string
): string {
  // 1. Cerca corrispondenza esatta
  if (PREGNANCY_SAFE_ALTERNATIVES[exerciseName]) {
    return PREGNANCY_SAFE_ALTERNATIVES[exerciseName];
  }

  // 2. Cerca corrispondenza case-insensitive
  const nameLower = exerciseName.toLowerCase();
  for (const [unsafe, safe] of Object.entries(PREGNANCY_SAFE_ALTERNATIVES)) {
    if (unsafe.toLowerCase() === nameLower) {
      return safe;
    }
  }

  // 3. Cerca corrispondenza parziale
  for (const [unsafe, safe] of Object.entries(PREGNANCY_SAFE_ALTERNATIVES)) {
    if (nameLower.includes(unsafe.toLowerCase())) {
      return safe;
    }
  }

  // 4. Fallback per pattern
  if (pattern && DEFAULT_SAFE_EXERCISES[pattern]) {
    return DEFAULT_SAFE_EXERCISES[pattern];
  }

  // 5. Fallback generico
  return 'Wall Push-up';
}

/**
 * Filtra e sostituisce un esercizio per renderlo sicuro in gravidanza
 *
 * QUESTA È LA FUNZIONE PRINCIPALE DA CHIAMARE IN createExercise()
 *
 * @param exerciseName - Nome esercizio originale
 * @param pattern - Pattern motorio
 * @param goal - Goal dell'utente
 * @param trimester - Trimestre (default 2)
 * @returns { name: string, wasReplaced: boolean, reason?: string }
 */
export function filterExerciseForPregnancy(
  exerciseName: string,
  pattern: string,
  goal: string,
  trimester: Trimester = 2
): { name: string; wasReplaced: boolean; reason?: string } {
  // Se non è gravidanza, ritorna l'esercizio originale
  if (!isPregnancyGoal(goal)) {
    return { name: exerciseName, wasReplaced: false };
  }

  // Controlla se è sicuro
  if (isExerciseSafeForPregnancy(exerciseName, trimester)) {
    return { name: exerciseName, wasReplaced: false };
  }

  // Non sicuro → trova alternativa
  const alternative = getPregnancySafeAlternative(exerciseName, pattern);

  // Determina il motivo della sostituzione
  let reason = 'Esercizio adattato per gravidanza';
  const nameLower = exerciseName.toLowerCase();

  if (PRONE_EXERCISES.some(p => nameLower.includes(p))) {
    reason = 'Sostituito: posizione prona non sicura in gravidanza';
  } else if (SUPINE_EXERCISES.some(p => nameLower.includes(p))) {
    reason = 'Sostituito: posizione supina limitata dal 2 trimestre';
  } else if (IMPACT_EXERCISES.some(p => nameLower.includes(p))) {
    reason = 'Sostituito: esercizio ad impatto non sicuro';
  }

  console.log(`[PREGNANCY SAFETY] ${exerciseName} -> ${alternative} (${reason})`);

  return {
    name: alternative,
    wasReplaced: true,
    reason
  };
}

// ============================================================================
// PARAMETRI GRAVIDANZA
// ============================================================================

/**
 * Parametri di sicurezza per trimestre
 */
export const PREGNANCY_PARAMS = {
  1: {
    maxIntensity: 'moderate' as const,
    maxRIR: 3,
    maxFrequency: 4,
    avoidProne: false,  // 1° trimestre OK
    avoidSupine: false, // 1° trimestre OK
    notes: 'Primo trimestre: possibile nausea e fatica. Ascolta il corpo.'
  },
  2: {
    maxIntensity: 'volume' as const,
    maxRIR: 4,
    maxFrequency: 3,
    avoidProne: true,   // Evitare posizioni prone
    avoidSupine: true,  // Evitare supine prolungate
    notes: 'Secondo trimestre: evitare posizioni prone e supine prolungate.'
  },
  3: {
    maxIntensity: 'volume' as const,
    maxRIR: 4,
    maxFrequency: 3,
    avoidProne: true,
    avoidSupine: true,
    notes: 'Terzo trimestre: focus su mobilita e preparazione al parto. ROM ridotto normale.'
  }
};

/**
 * Applica limitazioni di intensità per gravidanza
 *
 * In gravidanza:
 * - 1° trimestre: max 'moderate' (no heavy)
 * - 2° e 3° trimestre: max 'volume' (solo volume days)
 */
export function applyPregnancyIntensityCap(
  dayType: 'heavy' | 'moderate' | 'volume',
  goal: string,
  trimester: Trimester = 2
): 'heavy' | 'moderate' | 'volume' {
  if (!isPregnancyGoal(goal)) {
    return dayType;
  }

  const maxIntensity = PREGNANCY_PARAMS[trimester].maxIntensity;

  // Heavy days MAI consentiti in gravidanza - riduci a moderate
  if (dayType === 'heavy') {
    return 'moderate';
  }

  // Se siamo al 2°-3° trimestre (maxIntensity === 'volume'),
  // anche moderate diventa volume
  if (dayType === 'moderate' && maxIntensity === 'volume') {
    return 'volume';
  }

  return dayType;
}

// ============================================================================
// EXPORT AGGREGATO
// ============================================================================

export const PregnancySafety = {
  isPregnancyGoal,
  isExerciseSafeForPregnancy,
  getPregnancySafeAlternative,
  filterExerciseForPregnancy,
  applyPregnancyIntensityCap,
  PREGNANCY_PARAMS,
  PREGNANCY_SAFE_ALTERNATIVES,
};

export default PregnancySafety;
