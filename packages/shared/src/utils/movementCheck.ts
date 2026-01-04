/**
 * Movement Check System
 * TrainSmart - Sistema di verifica movimenti fondamentali
 *
 * NOTA: Questo NON è uno screening clinico.
 * È una semplice verifica per ottimizzare il programma di allenamento.
 */

// =============================================================================
// TYPES
// =============================================================================

/** Zone del corpo tracciate */
export type BodyArea =
  | 'lower_back'
  | 'hip'
  | 'knee'
  | 'shoulder'
  | 'ankle'
  | 'neck'
  | 'wrist'
  | 'elbow';

/** Movimenti fondamentali da verificare */
export type FundamentalMovement =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'carry'
  | 'rotation';

/** Singola verifica movimento */
export interface MovementCheck {
  id: string;
  name: string;
  movement: FundamentalMovement;
  relatedAreas: BodyArea[];
  instruction: string;
  whatToNotice: string;
  videoRef?: string;
}

/** Risultato di una verifica */
export interface MovementCheckResult {
  movement: FundamentalMovement;
  comfortable: boolean;
  discomfortAreas?: BodyArea[];
  notes?: string;
}

/** Profilo movimenti dell'utente */
export interface MovementProfile {
  comfortableMovements: FundamentalMovement[];
  uncomfortableMovements: FundamentalMovement[];
  areasOfConcern: BodyArea[];
  overallStatus: 'good' | 'some_limitations' | 'needs_attention';
  recommendation: string;
}

// =============================================================================
// MOVEMENT CHECKS DATABASE
// =============================================================================

export const MOVEMENT_CHECKS: MovementCheck[] = [
  // LOWER BODY
  {
    id: 'squat_check',
    name: 'Squat a corpo libero',
    movement: 'squat',
    relatedAreas: ['knee', 'hip', 'lower_back', 'ankle'],
    instruction:
      'Esegui uno squat lento scendendo fino a dove ti senti comodo. Tieni i piedi alla larghezza delle spalle. Non forzare la profondità.',
    whatToNotice: 'Noti fastidio a ginocchia, anche, schiena o caviglie?',
    videoRef: 'squat_check'
  },
  {
    id: 'hinge_check',
    name: 'Piegarsi in avanti (Hip Hinge)',
    movement: 'hinge',
    relatedAreas: ['lower_back', 'hip'],
    instruction:
      'Con le ginocchia leggermente piegate, piegati in avanti dalla vita come per raccogliere qualcosa da terra. Tieni la schiena dritta.',
    whatToNotice: 'Noti fastidio alla zona lombare o dietro le cosce?',
    videoRef: 'hinge_check'
  },
  {
    id: 'lunge_check',
    name: 'Affondo sul posto',
    movement: 'lunge',
    relatedAreas: ['knee', 'hip', 'ankle'],
    instruction:
      'Fai un passo avanti e piega entrambe le ginocchia. Non serve andare troppo in basso. Torna su e ripeti dall\'altro lato.',
    whatToNotice: 'Noti fastidio alle ginocchia o difficoltà di equilibrio?',
    videoRef: 'lunge_check'
  },

  // UPPER BODY PUSH
  {
    id: 'push_horizontal_check',
    name: 'Spinta orizzontale',
    movement: 'push_horizontal',
    relatedAreas: ['shoulder', 'elbow', 'wrist'],
    instruction:
      'Mettiti di fronte a un muro e spingi con le mani come se facessi un push-up contro il muro.',
    whatToNotice: 'Noti fastidio a spalle, gomiti o polsi?',
    videoRef: 'wall_push_check'
  },
  {
    id: 'push_vertical_check',
    name: 'Braccia sopra la testa',
    movement: 'push_vertical',
    relatedAreas: ['shoulder', 'neck'],
    instruction:
      'Alza entrambe le braccia sopra la testa come per prendere qualcosa da uno scaffale alto. Mantieni per qualche secondo.',
    whatToNotice: 'Noti fastidio alle spalle o al collo? Riesci ad alzare completamente le braccia?',
    videoRef: 'overhead_check'
  },

  // UPPER BODY PULL
  {
    id: 'pull_horizontal_check',
    name: 'Tirare verso di te',
    movement: 'pull_horizontal',
    relatedAreas: ['shoulder', 'elbow', 'lower_back'],
    instruction:
      'Simula di tirare una corda o di remare. Porta i gomiti indietro stringendo le scapole.',
    whatToNotice: 'Noti fastidio a spalle, gomiti o schiena?',
    videoRef: 'row_check'
  },
  {
    id: 'pull_vertical_check',
    name: 'Tirare dall\'alto',
    movement: 'pull_vertical',
    relatedAreas: ['shoulder', 'elbow'],
    instruction:
      'Alza le braccia sopra la testa e simula di tirare qualcosa verso il basso, come una lat machine.',
    whatToNotice: 'Noti fastidio alle spalle o ai gomiti?',
    videoRef: 'pulldown_check'
  },

  // CORE & CARRY
  {
    id: 'carry_check',
    name: 'Trasportare peso',
    movement: 'carry',
    relatedAreas: ['shoulder', 'lower_back', 'hip'],
    instruction:
      'Immagina di portare due borse della spesa pesanti, una per mano. Cammina per qualche passo.',
    whatToNotice: 'Noti fastidio a spalle, schiena o difficoltà a mantenere la postura?',
    videoRef: 'carry_check'
  },
  {
    id: 'rotation_check',
    name: 'Rotazione del busto',
    movement: 'rotation',
    relatedAreas: ['lower_back', 'hip'],
    instruction:
      'In piedi con i piedi fermi, ruota il busto a destra e poi a sinistra, lasciando che le braccia seguano il movimento.',
    whatToNotice: 'Noti fastidio alla schiena durante la rotazione?',
    videoRef: 'rotation_check'
  }
];

// =============================================================================
// EVALUATION FUNCTIONS
// =============================================================================

/**
 * Valuta i risultati dei movement check.
 * NON fornisce diagnosi - solo suggerimenti per ottimizzare il programma.
 */
export function evaluateMovementChecks(
  results: MovementCheckResult[]
): MovementProfile {
  const comfortable = results
    .filter((r) => r.comfortable)
    .map((r) => r.movement);

  const uncomfortable = results
    .filter((r) => !r.comfortable)
    .map((r) => r.movement);

  // Raccogli tutte le aree di fastidio
  const areasOfConcern = results
    .filter((r) => !r.comfortable && r.discomfortAreas)
    .flatMap((r) => r.discomfortAreas || []);

  // Rimuovi duplicati
  const uniqueAreas = Array.from(new Set(areasOfConcern));

  // Determina status generale
  let overallStatus: 'good' | 'some_limitations' | 'needs_attention';
  let recommendation: string;

  if (uncomfortable.length === 0) {
    overallStatus = 'good';
    recommendation =
      'Ottimo! Tutti i movimenti sono confortevoli. ' +
      'Puoi seguire il programma standard senza restrizioni.';
  } else if (uncomfortable.length <= 2) {
    overallStatus = 'some_limitations';
    recommendation =
      `Alcuni movimenti (${uncomfortable.join(', ')}) causano fastidio. ` +
      'Il tuo programma eviterà questi pattern e userà alternative sicure. ' +
      'Se il fastidio persiste, considera di consultare un professionista.';
  } else {
    overallStatus = 'needs_attention';
    recommendation =
      'Diversi movimenti causano fastidio. ' +
      'Ti consigliamo di consultare un professionista (fisioterapista, medico sportivo) ' +
      'prima di iniziare un programma intensivo. ' +
      'Nel frattempo, useremo un programma molto conservativo con esercizi a basso impatto.';
  }

  return {
    comfortableMovements: comfortable,
    uncomfortableMovements: uncomfortable,
    areasOfConcern: uniqueAreas,
    overallStatus,
    recommendation
  };
}

/**
 * Verifica se un movimento specifico è appropriato per l'utente.
 */
export function isMovementAppropriate(
  movement: FundamentalMovement,
  profile: MovementProfile
): boolean {
  return profile.comfortableMovements.includes(movement);
}

/**
 * Ottieni i movement check per una specifica area del corpo.
 */
export function getChecksForArea(area: BodyArea): MovementCheck[] {
  return MOVEMENT_CHECKS.filter((check) => check.relatedAreas.includes(area));
}

/**
 * Ottieni il movement check per un movimento specifico.
 */
export function getCheckForMovement(
  movement: FundamentalMovement
): MovementCheck | undefined {
  return MOVEMENT_CHECKS.find((check) => check.movement === movement);
}

/**
 * Crea un template vuoto per i risultati.
 */
export function createEmptyResults(): MovementCheckResult[] {
  return MOVEMENT_CHECKS.map((check) => ({
    movement: check.movement,
    comfortable: true,
    discomfortAreas: [],
    notes: ''
  }));
}

// =============================================================================
// MAPPING TO EXERCISE CATEGORIES
// =============================================================================

/** Mappa movimenti fondamentali → categorie esercizi */
export const MOVEMENT_TO_EXERCISE_CATEGORY: Record<FundamentalMovement, string[]> = {
  squat: ['lower_push', 'squat_variations'],
  hinge: ['lower_pull', 'deadlift_variations', 'hip_hinge'],
  lunge: ['lower_push', 'unilateral_leg'],
  push_horizontal: ['upper_push_horizontal', 'chest', 'triceps'],
  push_vertical: ['upper_push_vertical', 'shoulders', 'triceps'],
  pull_horizontal: ['upper_pull_horizontal', 'back', 'biceps'],
  pull_vertical: ['upper_pull_vertical', 'back', 'biceps'],
  carry: ['core', 'loaded_carry', 'grip'],
  rotation: ['core', 'rotational']
};

/**
 * Ottieni le categorie di esercizi da evitare basandosi sul profilo.
 */
export function getCategoriesToAvoid(profile: MovementProfile): string[] {
  const categories: string[] = [];

  profile.uncomfortableMovements.forEach((movement) => {
    const related = MOVEMENT_TO_EXERCISE_CATEGORY[movement] || [];
    categories.push(...related);
  });

  return Array.from(new Set(categories));
}

/**
 * Ottieni le categorie di esercizi sicure basandosi sul profilo.
 */
export function getSafeCategories(profile: MovementProfile): string[] {
  const categories: string[] = [];

  profile.comfortableMovements.forEach((movement) => {
    const related = MOVEMENT_TO_EXERCISE_CATEGORY[movement] || [];
    categories.push(...related);
  });

  return Array.from(new Set(categories));
}

// =============================================================================
// EXPORT STATS
// =============================================================================

export const MOVEMENT_CHECK_COUNT = MOVEMENT_CHECKS.length;
