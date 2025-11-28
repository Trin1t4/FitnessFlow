/**
 * Exercise Variants Mapping
 * Database di varianti per creare split intelligenti
 * Ogni pattern ha 3-4 varianti per evitare ripetizioni
 */

export interface ExerciseVariant {
  id: string;
  name: string;
  difficulty: number; // 1-10 scale
  equipment: 'bodyweight' | 'gym' | 'both';
  primary: string[]; // Muscoli primari
  secondary: string[]; // Muscoli secondari
}

/**
 * LOWER PUSH VARIANTS (Squat pattern - Quadriceps dominanti)
 */
export const LOWER_PUSH_VARIANTS: ExerciseVariant[] = [
  {
    id: 'squat_basic',
    name: 'Bodyweight Squat',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core']
  },
  {
    id: 'squat_goblet',
    name: 'Goblet Squat',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core']
  },
  {
    id: 'squat_front',
    name: 'Front Squat',
    difficulty: 6,
    equipment: 'gym',
    primary: ['quadriceps'],
    secondary: ['glutes', 'core', 'upper_back']
  },
  {
    id: 'squat_back',
    name: 'Back Squat',
    difficulty: 5,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core', 'erectors']
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings']
  },
  {
    id: 'bulgarian_split',
    name: 'Bulgarian Split Squat',
    difficulty: 5,
    equipment: 'both',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core']
  },
  {
    id: 'pistol_squat',
    name: 'Pistol Squat',
    difficulty: 8,
    equipment: 'bodyweight',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'core', 'balance']
  }
];

/**
 * LOWER PULL VARIANTS (Deadlift/Hip Hinge - Posterior chain)
 */
export const LOWER_PULL_VARIANTS: ExerciseVariant[] = [
  {
    id: 'hinge_basic',
    name: 'Bodyweight Hip Hinge',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['hamstrings', 'glutes'],
    secondary: ['erectors', 'core']
  },
  {
    id: 'deadlift_conventional',
    name: 'Conventional Deadlift',
    difficulty: 6,
    equipment: 'gym',
    primary: ['hamstrings', 'glutes', 'erectors'],
    secondary: ['lats', 'traps', 'forearms']
  },
  {
    id: 'deadlift_romanian',
    name: 'Romanian Deadlift (RDL)',
    difficulty: 5,
    equipment: 'gym',
    primary: ['hamstrings', 'glutes'],
    secondary: ['erectors', 'lats']
  },
  {
    id: 'deadlift_sumo',
    name: 'Sumo Deadlift',
    difficulty: 5,
    equipment: 'gym',
    primary: ['glutes', 'hamstrings', 'adductors'],
    secondary: ['quadriceps', 'erectors']
  },
  {
    id: 'deadlift_trap_bar',
    name: 'Trap Bar Deadlift',
    difficulty: 4,
    equipment: 'gym',
    primary: ['quadriceps', 'glutes', 'hamstrings'],
    secondary: ['erectors', 'traps']
  },
  {
    id: 'nordic_curl',
    name: 'Nordic Hamstring Curl',
    difficulty: 7,
    equipment: 'bodyweight',
    primary: ['hamstrings'],
    secondary: ['glutes', 'core']
  },
  {
    id: 'leg_curl',
    name: 'Leg Curl (Machine)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['hamstrings'],
    secondary: ['calves']
  }
];

/**
 * HORIZONTAL PUSH VARIANTS (Bench Press pattern - Pectorals)
 */
export const HORIZONTAL_PUSH_VARIANTS: ExerciseVariant[] = [
  {
    id: 'pushup_standard',
    name: 'Standard Push-up',
    difficulty: 4,
    equipment: 'bodyweight',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts', 'core']
  },
  {
    id: 'pushup_diamond',
    name: 'Diamond Push-up',
    difficulty: 6,
    equipment: 'bodyweight',
    primary: ['triceps', 'pectorals'],
    secondary: ['front_delts', 'core']
  },
  {
    id: 'pushup_archer',
    name: 'Archer Push-up',
    difficulty: 7,
    equipment: 'bodyweight',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts', 'core', 'obliques']
  },
  {
    id: 'bench_flat',
    name: 'Flat Barbell Bench Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts']
  },
  {
    id: 'bench_incline',
    name: 'Incline Bench Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['upper_pectorals', 'front_delts'],
    secondary: ['triceps']
  },
  {
    id: 'bench_decline',
    name: 'Decline Bench Press',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lower_pectorals', 'triceps'],
    secondary: ['front_delts']
  },
  {
    id: 'dumbbell_press',
    name: 'Dumbbell Bench Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['pectorals', 'triceps'],
    secondary: ['front_delts', 'stabilizers']
  },
  {
    id: 'dips_chest',
    name: 'Chest Dips',
    difficulty: 6,
    equipment: 'both',
    primary: ['lower_pectorals', 'triceps'],
    secondary: ['front_delts']
  }
];

/**
 * VERTICAL PUSH VARIANTS (Overhead Press - Shoulders)
 */
export const VERTICAL_PUSH_VARIANTS: ExerciseVariant[] = [
  {
    id: 'pike_pushup',
    name: 'Pike Push-up',
    difficulty: 5,
    equipment: 'bodyweight',
    primary: ['front_delts', 'triceps'],
    secondary: ['upper_pectorals', 'core']
  },
  {
    id: 'handstand_wall',
    name: 'Wall Handstand Push-up',
    difficulty: 8,
    equipment: 'bodyweight',
    primary: ['front_delts', 'triceps'],
    secondary: ['traps', 'core']
  },
  {
    id: 'military_press',
    name: 'Military Press (Barbell)',
    difficulty: 6,
    equipment: 'gym',
    primary: ['front_delts', 'triceps'],
    secondary: ['upper_pectorals', 'core']
  },
  {
    id: 'overhead_press_db',
    name: 'Dumbbell Shoulder Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['front_delts', 'triceps'],
    secondary: ['stabilizers', 'core']
  },
  {
    id: 'arnold_press',
    name: 'Arnold Press',
    difficulty: 6,
    equipment: 'gym',
    primary: ['front_delts', 'side_delts'],
    secondary: ['triceps', 'rotator_cuff']
  },
  {
    id: 'push_press',
    name: 'Push Press',
    difficulty: 6,
    equipment: 'gym',
    primary: ['front_delts', 'triceps'],
    secondary: ['quadriceps', 'core', 'power']
  }
];

/**
 * VERTICAL PULL VARIANTS (Pull-up/Lat Pulldown - Lats)
 */
export const VERTICAL_PULL_VARIANTS: ExerciseVariant[] = [
  {
    id: 'pullup_standard',
    name: 'Standard Pull-up',
    difficulty: 7,
    equipment: 'both',
    primary: ['lats', 'biceps'],
    secondary: ['rear_delts', 'traps', 'core']
  },
  {
    id: 'pullup_wide',
    name: 'Wide Grip Pull-up',
    difficulty: 8,
    equipment: 'both',
    primary: ['lats', 'teres_major'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'pullup_chinup',
    name: 'Chin-up (Supinated)',
    difficulty: 6,
    equipment: 'both',
    primary: ['biceps', 'lats'],
    secondary: ['rear_delts', 'core']
  },
  {
    id: 'pullup_neutral',
    name: 'Neutral Grip Pull-up',
    difficulty: 6,
    equipment: 'both',
    primary: ['lats', 'biceps'],
    secondary: ['brachialis', 'rear_delts']
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown (Machine)',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lats', 'biceps'],
    secondary: ['rear_delts', 'traps']
  },
  {
    id: 'assisted_pullup',
    name: 'Assisted Pull-up',
    difficulty: 4,
    equipment: 'gym',
    primary: ['lats', 'biceps'],
    secondary: ['rear_delts', 'core']
  }
];

/**
 * HORIZONTAL PULL VARIANTS (Row pattern - Mid-back)
 * Utilizzato per split avanzati (Pull day in PPL)
 */
export const HORIZONTAL_PULL_VARIANTS: ExerciseVariant[] = [
  {
    id: 'row_inverted',
    name: 'Inverted Row',
    difficulty: 5,
    equipment: 'both',
    primary: ['mid_back', 'biceps'],
    secondary: ['rear_delts', 'core']
  },
  {
    id: 'row_barbell',
    name: 'Barbell Row',
    difficulty: 6,
    equipment: 'gym',
    primary: ['lats', 'mid_back'],
    secondary: ['biceps', 'erectors', 'rear_delts']
  },
  {
    id: 'row_dumbbell',
    name: 'Dumbbell Row',
    difficulty: 5,
    equipment: 'gym',
    primary: ['lats', 'mid_back'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'row_cable',
    name: 'Seated Cable Row',
    difficulty: 4,
    equipment: 'gym',
    primary: ['mid_back', 'lats'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'row_tbar',
    name: 'T-Bar Row',
    difficulty: 6,
    equipment: 'gym',
    primary: ['mid_back', 'lats'],
    secondary: ['biceps', 'erectors']
  }
];

/**
 * CORE VARIANTS
 */
export const CORE_VARIANTS: ExerciseVariant[] = [
  {
    id: 'plank_standard',
    name: 'Plank',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['rectus_abdominis', 'transverse'],
    secondary: ['obliques', 'hip_flexors']
  },
  {
    id: 'plank_side',
    name: 'Side Plank',
    difficulty: 4,
    equipment: 'bodyweight',
    primary: ['obliques', 'transverse'],
    secondary: ['glute_medius', 'shoulder_stabilizers']
  },
  {
    id: 'leg_raise',
    name: 'Hanging Leg Raise',
    difficulty: 6,
    equipment: 'both',
    primary: ['lower_abs', 'hip_flexors'],
    secondary: ['lats', 'grip']
  },
  {
    id: 'ab_wheel',
    name: 'Ab Wheel Rollout',
    difficulty: 7,
    equipment: 'both',
    primary: ['rectus_abdominis', 'transverse'],
    secondary: ['lats', 'hip_flexors']
  },
  {
    id: 'crunch_cable',
    name: 'Cable Crunch',
    difficulty: 4,
    equipment: 'gym',
    primary: ['rectus_abdominis'],
    secondary: ['obliques']
  },
  {
    id: 'pallof_press',
    name: 'Pallof Press',
    difficulty: 5,
    equipment: 'gym',
    primary: ['obliques', 'transverse'],
    secondary: ['shoulder_stabilizers']
  }
];

/**
 * PELVIC FLOOR EXERCISES (Modern approach - not just Kegel)
 * Per post-partum e recupero pavimento pelvico
 */
export const PELVIC_FLOOR_VARIANTS: ExerciseVariant[] = [
  {
    id: 'connection_breath',
    name: 'Connection Breath',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'transverse'],
    secondary: ['diaphragm']
  },
  {
    id: 'diaphragmatic_breathing',
    name: 'Diaphragmatic Breathing',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['diaphragm', 'pelvic_floor'],
    secondary: ['transverse']
  },
  {
    id: 'pelvic_floor_activation',
    name: 'Pelvic Floor Activation',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['pelvic_floor'],
    secondary: ['transverse', 'glutes']
  },
  {
    id: 'deep_squat_hold',
    name: 'Deep Squat Hold',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'hip_flexors'],
    secondary: ['glutes', 'adductors']
  },
  {
    id: 'happy_baby_stretch',
    name: 'Happy Baby Stretch',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'hip_flexors'],
    secondary: ['adductors', 'glutes']
  },
  {
    id: 'pelvic_tilts',
    name: 'Pelvic Tilts',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'transverse'],
    secondary: ['glutes', 'erectors']
  },
  {
    id: 'bridge_ball_squeeze',
    name: 'Bridge with Ball Squeeze',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'adductors', 'glutes'],
    secondary: ['hamstrings', 'transverse']
  },
  {
    id: 'clamshells',
    name: 'Clamshells',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['glutes', 'hip_rotators'],
    secondary: ['pelvic_floor', 'core']
  },
  {
    id: 'bird_dog_modified',
    name: 'Bird Dog (Modified)',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['core', 'pelvic_floor'],
    secondary: ['glutes', 'erectors']
  },
  {
    id: 'cat_cow',
    name: 'Cat-Cow',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['spine_mobility', 'pelvic_floor'],
    secondary: ['transverse', 'erectors']
  },
  {
    id: 'squat_to_stand',
    name: 'Squat to Stand',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['pelvic_floor', 'hip_mobility'],
    secondary: ['hamstrings', 'glutes']
  }
];

/**
 * DIASTASIS RECOVERY EXERCISES
 * Per recupero diastasi dei retti addominali
 */
export const DIASTASIS_RECOVERY_VARIANTS: ExerciseVariant[] = [
  {
    id: 'dead_bug_heel_slides',
    name: 'Dead Bug Heel Slides',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['transverse', 'pelvic_floor'],
    secondary: ['hip_flexors']
  },
  {
    id: 'toe_taps',
    name: 'Toe Taps',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['transverse', 'pelvic_floor'],
    secondary: ['hip_flexors', 'rectus_abdominis']
  },
  {
    id: 'marching',
    name: 'Supine Marching',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['transverse', 'pelvic_floor'],
    secondary: ['hip_flexors']
  },
  {
    id: 'dead_bug_progression',
    name: 'Dead Bug Progression',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['transverse', 'rectus_abdominis'],
    secondary: ['pelvic_floor', 'hip_flexors']
  },
  {
    id: 'pallof_press_kneeling',
    name: 'Pallof Press (Kneeling)',
    difficulty: 3,
    equipment: 'gym',
    primary: ['transverse', 'obliques'],
    secondary: ['pelvic_floor', 'shoulder_stabilizers']
  },
  {
    id: 'side_plank_modified',
    name: 'Side Plank (Modified)',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['obliques', 'transverse'],
    secondary: ['glutes', 'shoulder_stabilizers']
  },
  {
    id: 'bear_hold',
    name: 'Bear Hold',
    difficulty: 3,
    equipment: 'bodyweight',
    primary: ['transverse', 'pelvic_floor'],
    secondary: ['quadriceps', 'shoulders']
  },
  {
    id: 'wall_sit_breathing',
    name: 'Wall Sit with Breathing',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['quadriceps', 'transverse'],
    secondary: ['pelvic_floor', 'glutes']
  },
  {
    id: 'seated_knee_lifts',
    name: 'Seated Knee Lifts',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['transverse', 'hip_flexors'],
    secondary: ['pelvic_floor']
  },
  {
    id: 'half_kneeling_chop',
    name: 'Half Kneeling Chop',
    difficulty: 4,
    equipment: 'gym',
    primary: ['obliques', 'transverse'],
    secondary: ['shoulders', 'glutes']
  }
];

/**
 * PRE-PARTUM SAFE EXERCISES
 * Esercizi sicuri durante la gravidanza
 */
export const PREGNANCY_SAFE_VARIANTS: ExerciseVariant[] = [
  {
    id: 'wall_pushup',
    name: 'Wall Push-up',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['pectorals', 'triceps'],
    secondary: ['core']
  },
  {
    id: 'seated_row_band',
    name: 'Seated Row (Band)',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['lats', 'rhomboids'],
    secondary: ['biceps', 'rear_delts']
  },
  {
    id: 'standing_leg_curl',
    name: 'Standing Leg Curl',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['hamstrings'],
    secondary: ['glutes', 'core']
  },
  {
    id: 'side_lying_leg_lift',
    name: 'Side Lying Leg Lift',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['glutes', 'hip_abductors'],
    secondary: ['core']
  },
  {
    id: 'modified_squat',
    name: 'Modified Squat',
    difficulty: 2,
    equipment: 'bodyweight',
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings']
  },
  {
    id: 'standing_hip_circles',
    name: 'Standing Hip Circles',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['hip_mobility'],
    secondary: ['glutes', 'core']
  },
  {
    id: 'shoulder_blade_squeeze',
    name: 'Shoulder Blade Squeeze',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['rhomboids', 'mid_traps'],
    secondary: ['rear_delts']
  },
  {
    id: 'standing_march',
    name: 'Standing March',
    difficulty: 1,
    equipment: 'bodyweight',
    primary: ['hip_flexors', 'core'],
    secondary: ['glutes']
  }
];

/**
 * ACCESSORY MOVEMENTS (per split avanzati)
 */
export const ACCESSORY_VARIANTS = {
  triceps: [
    { id: 'tricep_dips', name: 'Tricep Dips', difficulty: 5, equipment: 'both' as const },
    { id: 'tricep_pushdown', name: 'Tricep Pushdown', difficulty: 3, equipment: 'gym' as const },
    { id: 'skull_crusher', name: 'Skull Crushers', difficulty: 5, equipment: 'gym' as const }
  ],
  biceps: [
    { id: 'bicep_curl', name: 'Barbell Curl', difficulty: 3, equipment: 'gym' as const },
    { id: 'hammer_curl', name: 'Hammer Curl', difficulty: 3, equipment: 'gym' as const },
    { id: 'chin_up', name: 'Chin-up', difficulty: 6, equipment: 'both' as const }
  ],
  calves: [
    { id: 'calf_raise', name: 'Standing Calf Raise', difficulty: 2, equipment: 'both' as const },
    { id: 'calf_seated', name: 'Seated Calf Raise', difficulty: 2, equipment: 'gym' as const }
  ]
};

/**
 * Trova variante alternativa per un pattern
 * @param patternId - Il pattern base (es. 'lower_push')
 * @param baselineVariantId - La variante usata nello screening
 * @param variantIndex - Quale variante usare (0, 1, 2...)
 * @param equipment - 'bodyweight' o 'gym'
 * @returns Nome della variante
 */
export function getVariantForPattern(
  patternId: string,
  baselineVariantId: string,
  variantIndex: number,
  equipment: 'bodyweight' | 'gym'
): string {
  const variantMap: Record<string, ExerciseVariant[]> = {
    lower_push: LOWER_PUSH_VARIANTS,
    lower_pull: LOWER_PULL_VARIANTS,
    horizontal_push: HORIZONTAL_PUSH_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  const variants = variantMap[patternId];
  if (!variants) return baselineVariantId; // Fallback

  // Filtra per equipment
  const validVariants = variants.filter(
    v => v.equipment === equipment || v.equipment === 'both'
  );

  if (validVariants.length === 0) return baselineVariantId;

  // Prendi la variante all'indice richiesto (ciclico)
  const selectedVariant = validVariants[variantIndex % validVariants.length];
  return selectedVariant.name;
}

/**
 * Trova variante più facile per pain management
 */
export function getEasierVariant(
  patternId: string,
  currentVariantName: string,
  equipment: 'bodyweight' | 'gym'
): string {
  const variantMap: Record<string, ExerciseVariant[]> = {
    lower_push: LOWER_PUSH_VARIANTS,
    lower_pull: LOWER_PULL_VARIANTS,
    horizontal_push: HORIZONTAL_PUSH_VARIANTS,
    vertical_push: VERTICAL_PUSH_VARIANTS,
    vertical_pull: VERTICAL_PULL_VARIANTS,
    core: CORE_VARIANTS
  };

  const variants = variantMap[patternId];
  if (!variants) return currentVariantName;

  // Trova variante corrente
  const currentVariant = variants.find(v => v.name === currentVariantName);
  if (!currentVariant) return currentVariantName;

  // Trova variante più facile
  const validVariants = variants.filter(
    v => (v.equipment === equipment || v.equipment === 'both') &&
         v.difficulty < currentVariant.difficulty
  );

  if (validVariants.length === 0) return currentVariantName;

  // Ritorna la più facile disponibile
  validVariants.sort((a, b) => a.difficulty - b.difficulty);
  return validVariants[0].name;
}

/**
 * EXERCISE ALTERNATIVES DATABASE
 * Per switch rapido quando una postazione è affollata
 * Ogni esercizio ha 2-3 varianti biomeccanicamente equivalenti
 * Priorità: stesso pattern muscolare, stesso livello di difficoltà
 */
export interface ExerciseAlternative {
  name: string;
  equipment: 'bodyweight' | 'gym' | 'both';
  difficulty: number;
  notes?: string;
}

export const EXERCISE_ALTERNATIVES: Record<string, ExerciseAlternative[]> = {
  // ═══════════════════════════════════════════════════════════════
  // LOWER PUSH (Squat pattern)
  // ═══════════════════════════════════════════════════════════════
  'Back Squat': [
    { name: 'Dumbbell Squat', equipment: 'gym', difficulty: 4, notes: 'Manubri sulle spalle' },
    { name: 'Goblet Squat', equipment: 'gym', difficulty: 4, notes: 'Con kettlebell/manubrio' },
    { name: 'Leg Press', equipment: 'gym', difficulty: 4, notes: 'Meno stress lombare' },
  ],
  'Front Squat': [
    { name: 'Goblet Squat', equipment: 'gym', difficulty: 4, notes: 'Stessa enfasi su quadricipiti' },
    { name: 'Dumbbell Front Squat', equipment: 'gym', difficulty: 4, notes: 'Manubri davanti' },
    { name: 'Leg Press (piedi alti)', equipment: 'gym', difficulty: 4, notes: 'Focus quadricipiti' },
  ],
  'Squat': [
    { name: 'Goblet Squat', equipment: 'gym', difficulty: 4, notes: 'Con manubrio/kettlebell' },
    { name: 'Dumbbell Squat', equipment: 'gym', difficulty: 4, notes: 'Manubri ai lati' },
    { name: 'Leg Press', equipment: 'gym', difficulty: 4, notes: 'Macchina, meno tecnica' },
  ],
  'Squat con Bilanciere': [
    { name: 'Dumbbell Squat', equipment: 'gym', difficulty: 4, notes: 'Manubri sulle spalle' },
    { name: 'Goblet Squat', equipment: 'gym', difficulty: 4, notes: 'Con kettlebell/manubrio' },
    { name: 'Hack Squat', equipment: 'gym', difficulty: 4, notes: 'Macchina guidata' },
  ],
  'Leg Press': [
    { name: 'Hack Squat', equipment: 'gym', difficulty: 4, notes: 'Stessa meccanica' },
    { name: 'Goblet Squat', equipment: 'gym', difficulty: 4, notes: 'Con manubrio pesante' },
    { name: 'Smith Machine Squat', equipment: 'gym', difficulty: 4, notes: 'Percorso guidato' },
  ],
  'Bulgarian Split Squat': [
    { name: 'Lunges', equipment: 'both', difficulty: 4, notes: 'Walking o stazionari' },
    { name: 'Step-up', equipment: 'both', difficulty: 4, notes: 'Con manubri' },
    { name: 'Single Leg Press', equipment: 'gym', difficulty: 4, notes: 'Una gamba alla volta' },
  ],
  'Bodyweight Squat': [
    { name: 'Box Squat', equipment: 'bodyweight', difficulty: 3, notes: 'Squat su panca' },
    { name: 'Goblet Squat (leggero)', equipment: 'gym', difficulty: 3, notes: 'Con peso leggero' },
    { name: 'Wall Sit', equipment: 'bodyweight', difficulty: 3, notes: 'Isometrico' },
  ],
  'Pistol Squat': [
    { name: 'Shrimp Squat', equipment: 'bodyweight', difficulty: 7, notes: 'Stessa difficoltà' },
    { name: 'Assisted Pistol', equipment: 'bodyweight', difficulty: 6, notes: 'Con TRX/anelli' },
    { name: 'Bulgarian Split Squat profondo', equipment: 'both', difficulty: 6, notes: 'Range completo' },
  ],

  // ═══════════════════════════════════════════════════════════════
  // LOWER PULL (Hip Hinge)
  // ═══════════════════════════════════════════════════════════════
  'Conventional Deadlift': [
    { name: 'Dumbbell Deadlift', equipment: 'gym', difficulty: 4, notes: 'Con manubri ai lati' },
    { name: 'Trap Bar Deadlift', equipment: 'gym', difficulty: 4, notes: 'Meno stress lombare' },
    { name: 'Romanian Deadlift', equipment: 'gym', difficulty: 5, notes: 'Focus hamstrings' },
  ],
  'Romanian Deadlift': [
    { name: 'Dumbbell RDL', equipment: 'gym', difficulty: 4, notes: 'Con manubri, più ROM' },
    { name: 'Single Leg RDL', equipment: 'both', difficulty: 5, notes: 'Unilaterale, equilibrio' },
    { name: 'Cable Pull Through', equipment: 'gym', difficulty: 4, notes: 'Al cavo basso' },
  ],
  'Romanian Deadlift (RDL)': [
    { name: 'Dumbbell RDL', equipment: 'gym', difficulty: 4, notes: 'Con manubri, più ROM' },
    { name: 'Single Leg RDL', equipment: 'both', difficulty: 5, notes: 'Unilaterale, equilibrio' },
    { name: 'Cable Pull Through', equipment: 'gym', difficulty: 4, notes: 'Al cavo basso' },
  ],
  'Sumo Deadlift': [
    { name: 'Dumbbell Sumo Deadlift', equipment: 'gym', difficulty: 4, notes: 'Manubrio tra le gambe' },
    { name: 'Wide Stance Leg Press', equipment: 'gym', difficulty: 4, notes: 'Piedi larghi' },
    { name: 'Sumo Squat', equipment: 'both', difficulty: 4, notes: 'Con manubrio/kettlebell' },
  ],
  'Trap Bar Deadlift': [
    { name: 'Dumbbell Deadlift', equipment: 'gym', difficulty: 4, notes: 'Manubri ai lati, simile' },
    { name: 'Conventional Deadlift', equipment: 'gym', difficulty: 5, notes: 'Con bilanciere' },
    { name: 'Hack Squat', equipment: 'gym', difficulty: 4, notes: 'Focus gambe' },
  ],
  'Stacco': [
    { name: 'Stacco con Manubri', equipment: 'gym', difficulty: 4, notes: 'Manubri ai lati del corpo' },
    { name: 'Trap Bar Deadlift', equipment: 'gym', difficulty: 4, notes: 'Meno stress lombare' },
    { name: 'Stacco Rumeno', equipment: 'gym', difficulty: 5, notes: 'Focus posterior chain' },
  ],
  'Stacco da Terra': [
    { name: 'Stacco con Manubri', equipment: 'gym', difficulty: 4, notes: 'Manubri ai lati del corpo' },
    { name: 'Trap Bar Deadlift', equipment: 'gym', difficulty: 4, notes: 'Meno stress lombare' },
    { name: 'Stacco Rumeno', equipment: 'gym', difficulty: 5, notes: 'Focus hamstrings' },
  ],
  'Stacco Rumeno': [
    { name: 'Stacco Rumeno con Manubri', equipment: 'gym', difficulty: 4, notes: 'Con manubri, più ROM' },
    { name: 'Single Leg RDL', equipment: 'both', difficulty: 5, notes: 'Unilaterale' },
    { name: 'Good Morning', equipment: 'gym', difficulty: 5, notes: 'Bilanciere su spalle' },
  ],
  'Nordic Hamstring Curl': [
    { name: 'Leg Curl (Machine)', equipment: 'gym', difficulty: 3, notes: 'Più facile ma efficace' },
    { name: 'Slider Leg Curl', equipment: 'bodyweight', difficulty: 6, notes: 'Con slider/asciugamano' },
    { name: 'GHD Raise', equipment: 'gym', difficulty: 6, notes: 'Se disponibile' },
  ],
  'Leg Curl (Machine)': [
    { name: 'Nordic Curl (eccentrico)', equipment: 'bodyweight', difficulty: 5, notes: 'Solo fase negativa' },
    { name: 'Slider Leg Curl', equipment: 'bodyweight', difficulty: 5, notes: 'A terra con slider' },
    { name: 'Swiss Ball Leg Curl', equipment: 'gym', difficulty: 4, notes: 'Con palla fitness' },
  ],

  // ═══════════════════════════════════════════════════════════════
  // HORIZONTAL PUSH (Bench Press pattern)
  // ═══════════════════════════════════════════════════════════════
  'Flat Barbell Bench Press': [
    { name: 'Dumbbell Bench Press', equipment: 'gym', difficulty: 5, notes: 'Maggior ROM' },
    { name: 'Machine Chest Press', equipment: 'gym', difficulty: 4, notes: 'Percorso guidato' },
    { name: 'Floor Press', equipment: 'gym', difficulty: 5, notes: 'A terra con manubri' },
  ],
  'Panca Piana': [
    { name: 'Panca con Manubri', equipment: 'gym', difficulty: 5, notes: 'Maggior ROM e stabilità' },
    { name: 'Chest Press (Macchina)', equipment: 'gym', difficulty: 4, notes: 'Percorso guidato' },
    { name: 'Push-up', equipment: 'bodyweight', difficulty: 4, notes: 'A corpo libero' },
  ],
  'Panca Piana con Bilanciere': [
    { name: 'Panca con Manubri', equipment: 'gym', difficulty: 5, notes: 'Più ROM, meno carico' },
    { name: 'Chest Press (Macchina)', equipment: 'gym', difficulty: 4, notes: 'Più sicuro' },
    { name: 'Floor Press con Manubri', equipment: 'gym', difficulty: 5, notes: 'A terra' },
  ],
  'Panca Inclinata': [
    { name: 'Panca Inclinata con Manubri', equipment: 'gym', difficulty: 5, notes: 'Maggior ROM' },
    { name: 'Landmine Press', equipment: 'gym', difficulty: 5, notes: 'Angolo simile' },
    { name: 'Incline Chest Press (Macchina)', equipment: 'gym', difficulty: 4, notes: 'Guidata' },
  ],
  'Incline Bench Press': [
    { name: 'Incline Dumbbell Press', equipment: 'gym', difficulty: 5, notes: 'Con manubri' },
    { name: 'Landmine Press', equipment: 'gym', difficulty: 5, notes: 'Angolo simile' },
    { name: 'Low Cable Fly', equipment: 'gym', difficulty: 4, notes: 'Cavi dal basso' },
  ],
  'Decline Bench Press': [
    { name: 'Dips', equipment: 'both', difficulty: 5, notes: 'Stesso target' },
    { name: 'High Cable Fly', equipment: 'gym', difficulty: 4, notes: 'Cavi dall\'alto' },
    { name: 'Decline Dumbbell Press', equipment: 'gym', difficulty: 4, notes: 'Con manubri' },
  ],
  'Dumbbell Bench Press': [
    { name: 'Flat Barbell Bench Press', equipment: 'gym', difficulty: 5, notes: 'Con bilanciere' },
    { name: 'Machine Chest Press', equipment: 'gym', difficulty: 4, notes: 'Guidato' },
    { name: 'Push-up (weighted)', equipment: 'both', difficulty: 4, notes: 'Con peso su schiena' },
  ],
  'Standard Push-up': [
    { name: 'Bench Press (leggero)', equipment: 'gym', difficulty: 4, notes: 'Se preferisci pesi' },
    { name: 'Machine Chest Press', equipment: 'gym', difficulty: 3, notes: 'Più controllato' },
    { name: 'Incline Push-up', equipment: 'bodyweight', difficulty: 3, notes: 'Mani rialzate' },
  ],
  'Diamond Push-up': [
    { name: 'Close Grip Bench Press', equipment: 'gym', difficulty: 5, notes: 'Stesso focus tricipiti' },
    { name: 'Tricep Dips', equipment: 'both', difficulty: 5, notes: 'Focus tricipiti' },
    { name: 'Narrow Push-up', equipment: 'bodyweight', difficulty: 5, notes: 'Mani vicine' },
  ],
  'Archer Push-up': [
    { name: 'Single Arm Dumbbell Press', equipment: 'gym', difficulty: 6, notes: 'Unilaterale' },
    { name: 'Ring Push-up', equipment: 'bodyweight', difficulty: 6, notes: 'Agli anelli' },
    { name: 'Typewriter Push-up', equipment: 'bodyweight', difficulty: 6, notes: 'Laterale' },
  ],
  'Chest Dips': [
    { name: 'Decline Bench Press', equipment: 'gym', difficulty: 5, notes: 'Stesso target' },
    { name: 'Dumbbell Fly', equipment: 'gym', difficulty: 4, notes: 'Focus petto basso' },
    { name: 'Push-up (piedi rialzati)', equipment: 'bodyweight', difficulty: 5, notes: 'Declinati' },
  ],

  // ═══════════════════════════════════════════════════════════════
  // VERTICAL PUSH (Shoulder Press pattern)
  // ═══════════════════════════════════════════════════════════════
  'Military Press (Barbell)': [
    { name: 'Dumbbell Shoulder Press', equipment: 'gym', difficulty: 5, notes: 'Con manubri' },
    { name: 'Machine Shoulder Press', equipment: 'gym', difficulty: 4, notes: 'Guidata' },
    { name: 'Landmine Press', equipment: 'gym', difficulty: 5, notes: 'Con bilanciere a terra' },
  ],
  'Military Press': [
    { name: 'Shoulder Press con Manubri', equipment: 'gym', difficulty: 5, notes: 'Con manubri' },
    { name: 'Shoulder Press (Macchina)', equipment: 'gym', difficulty: 4, notes: 'Percorso guidato' },
    { name: 'Arnold Press', equipment: 'gym', difficulty: 5, notes: 'Con rotazione' },
  ],
  'Lento Avanti': [
    { name: 'Shoulder Press con Manubri', equipment: 'gym', difficulty: 5, notes: 'Manubri, più ROM' },
    { name: 'Shoulder Press (Macchina)', equipment: 'gym', difficulty: 4, notes: 'Guidata' },
    { name: 'Landmine Press', equipment: 'gym', difficulty: 5, notes: 'Bilanciere a terra' },
  ],
  'Dumbbell Shoulder Press': [
    { name: 'Military Press', equipment: 'gym', difficulty: 6, notes: 'Con bilanciere' },
    { name: 'Arnold Press', equipment: 'gym', difficulty: 5, notes: 'Con rotazione' },
    { name: 'Machine Shoulder Press', equipment: 'gym', difficulty: 4, notes: 'Percorso guidato' },
  ],
  'Arnold Press': [
    { name: 'Dumbbell Shoulder Press', equipment: 'gym', difficulty: 5, notes: 'Senza rotazione' },
    { name: 'Lateral Raise + Press', equipment: 'gym', difficulty: 5, notes: 'Combo movement' },
    { name: 'Cable Lateral Raise', equipment: 'gym', difficulty: 4, notes: 'Al cavo' },
  ],
  'Push Press': [
    { name: 'Military Press', equipment: 'gym', difficulty: 6, notes: 'Senza spinta gambe' },
    { name: 'Dumbbell Push Press', equipment: 'gym', difficulty: 5, notes: 'Con manubri' },
    { name: 'Thruster', equipment: 'gym', difficulty: 6, notes: 'Squat + Press' },
  ],
  'Pike Push-up': [
    { name: 'Dumbbell Shoulder Press', equipment: 'gym', difficulty: 5, notes: 'Se preferisci pesi' },
    { name: 'Machine Shoulder Press', equipment: 'gym', difficulty: 4, notes: 'Guidata' },
    { name: 'Elevated Pike Push-up', equipment: 'bodyweight', difficulty: 6, notes: 'Piedi più alti' },
  ],
  'Wall Handstand Push-up': [
    { name: 'Pike Push-up (elevato)', equipment: 'bodyweight', difficulty: 6, notes: 'Piedi su box' },
    { name: 'Dumbbell Shoulder Press (pesante)', equipment: 'gym', difficulty: 6, notes: 'Carico alto' },
    { name: 'Handstand Hold', equipment: 'bodyweight', difficulty: 7, notes: 'Solo tenuta' },
  ],

  // ═══════════════════════════════════════════════════════════════
  // VERTICAL PULL (Pull-up pattern)
  // ═══════════════════════════════════════════════════════════════
  'Standard Pull-up': [
    { name: 'Lat Pulldown', equipment: 'gym', difficulty: 4, notes: 'Stessa meccanica' },
    { name: 'Assisted Pull-up', equipment: 'gym', difficulty: 5, notes: 'Con elastico o macchina' },
    { name: 'Chin-up', equipment: 'both', difficulty: 6, notes: 'Presa supina' },
  ],
  'Wide Grip Pull-up': [
    { name: 'Wide Grip Lat Pulldown', equipment: 'gym', difficulty: 5, notes: 'Al cavo alto' },
    { name: 'Standard Pull-up', equipment: 'both', difficulty: 7, notes: 'Presa normale' },
    { name: 'Straight Arm Pulldown', equipment: 'gym', difficulty: 4, notes: 'Braccia tese' },
  ],
  'Chin-up (Supinated)': [
    { name: 'Supinated Lat Pulldown', equipment: 'gym', difficulty: 4, notes: 'Presa supina al cavo' },
    { name: 'Standard Pull-up', equipment: 'both', difficulty: 7, notes: 'Presa prona' },
    { name: 'Cable Curl + Pulldown', equipment: 'gym', difficulty: 4, notes: 'Superset' },
  ],
  'Neutral Grip Pull-up': [
    { name: 'Neutral Grip Lat Pulldown', equipment: 'gym', difficulty: 4, notes: 'Con handle V' },
    { name: 'Chin-up', equipment: 'both', difficulty: 6, notes: 'Presa supina' },
    { name: 'Seated Cable Row (presa alta)', equipment: 'gym', difficulty: 4, notes: 'Tiro verso mento' },
  ],
  'Lat Pulldown (Machine)': [
    { name: 'Assisted Pull-up', equipment: 'gym', difficulty: 5, notes: 'Con elastico' },
    { name: 'Straight Arm Pulldown', equipment: 'gym', difficulty: 4, notes: 'Braccia tese' },
    { name: 'Cable Pullover', equipment: 'gym', difficulty: 4, notes: 'Al cavo alto' },
  ],
  'Assisted Pull-up': [
    { name: 'Lat Pulldown', equipment: 'gym', difficulty: 4, notes: 'Al cavo' },
    { name: 'Band Pull-up', equipment: 'both', difficulty: 5, notes: 'Con elastico' },
    { name: 'Negative Pull-up', equipment: 'both', difficulty: 5, notes: 'Solo fase eccentrica' },
  ],

  // ═══════════════════════════════════════════════════════════════
  // HORIZONTAL PULL (Row pattern)
  // ═══════════════════════════════════════════════════════════════
  'Barbell Row': [
    { name: 'Dumbbell Row', equipment: 'gym', difficulty: 5, notes: 'Unilaterale' },
    { name: 'T-Bar Row', equipment: 'gym', difficulty: 5, notes: 'Con landmine' },
    { name: 'Seated Cable Row', equipment: 'gym', difficulty: 4, notes: 'Al cavo' },
  ],
  'Rematore con Bilanciere': [
    { name: 'Rematore con Manubrio', equipment: 'gym', difficulty: 5, notes: 'Unilaterale, più ROM' },
    { name: 'Pulley Basso', equipment: 'gym', difficulty: 4, notes: 'Al cavo' },
    { name: 'T-Bar Row', equipment: 'gym', difficulty: 5, notes: 'Con landmine' },
  ],
  'Rematore': [
    { name: 'Rematore con Manubrio', equipment: 'gym', difficulty: 5, notes: 'Unilaterale' },
    { name: 'Pulley Basso', equipment: 'gym', difficulty: 4, notes: 'Al cavo, seduto' },
    { name: 'Chest Supported Row', equipment: 'gym', difficulty: 4, notes: 'Su panca inclinata' },
  ],
  'Dumbbell Row': [
    { name: 'Seated Cable Row', equipment: 'gym', difficulty: 4, notes: 'Bilaterale' },
    { name: 'Machine Row', equipment: 'gym', difficulty: 4, notes: 'Chest supported' },
    { name: 'Inverted Row', equipment: 'both', difficulty: 5, notes: 'A corpo libero' },
  ],
  'Seated Cable Row': [
    { name: 'Machine Row', equipment: 'gym', difficulty: 4, notes: 'Chest supported' },
    { name: 'Dumbbell Row', equipment: 'gym', difficulty: 5, notes: 'Unilaterale' },
    { name: 'Band Row', equipment: 'bodyweight', difficulty: 3, notes: 'Con elastico' },
  ],
  'T-Bar Row': [
    { name: 'Barbell Row', equipment: 'gym', difficulty: 5, notes: 'Standard' },
    { name: 'Landmine Row', equipment: 'gym', difficulty: 5, notes: 'Stesso setup' },
    { name: 'Chest Supported Row', equipment: 'gym', difficulty: 4, notes: 'Su panca inclinata' },
  ],
  'Inverted Row': [
    { name: 'Dumbbell Row', equipment: 'gym', difficulty: 5, notes: 'Con manubrio' },
    { name: 'Seated Cable Row', equipment: 'gym', difficulty: 4, notes: 'Al cavo' },
    { name: 'TRX Row', equipment: 'bodyweight', difficulty: 5, notes: 'Alle cinghie' },
  ],

  // ═══════════════════════════════════════════════════════════════
  // CORE
  // ═══════════════════════════════════════════════════════════════
  'Plank': [
    { name: 'Dead Bug', equipment: 'bodyweight', difficulty: 3, notes: 'Supino, anti-estensione' },
    { name: 'Ab Wheel (in ginocchio)', equipment: 'gym', difficulty: 4, notes: 'Rollout' },
    { name: 'Hollow Body Hold', equipment: 'bodyweight', difficulty: 4, notes: 'Supino' },
  ],
  'Side Plank': [
    { name: 'Pallof Press', equipment: 'gym', difficulty: 4, notes: 'Anti-rotazione' },
    { name: 'Suitcase Carry', equipment: 'gym', difficulty: 4, notes: 'Camminata con peso' },
    { name: 'Copenhagen Plank', equipment: 'bodyweight', difficulty: 5, notes: 'Con adduttori' },
  ],
  'Hanging Leg Raise': [
    { name: 'Captain Chair Leg Raise', equipment: 'gym', difficulty: 5, notes: 'Alla macchina' },
    { name: 'Lying Leg Raise', equipment: 'bodyweight', difficulty: 4, notes: 'A terra' },
    { name: 'Cable Crunch', equipment: 'gym', difficulty: 4, notes: 'Al cavo alto' },
  ],
  'Ab Wheel Rollout': [
    { name: 'Barbell Rollout', equipment: 'gym', difficulty: 6, notes: 'Con bilanciere' },
    { name: 'TRX Fallout', equipment: 'bodyweight', difficulty: 6, notes: 'Alle cinghie' },
    { name: 'Stability Ball Rollout', equipment: 'gym', difficulty: 5, notes: 'Con palla' },
  ],
  'Cable Crunch': [
    { name: 'Machine Crunch', equipment: 'gym', difficulty: 3, notes: 'Alla macchina' },
    { name: 'Weighted Crunch', equipment: 'gym', difficulty: 4, notes: 'Con disco' },
    { name: 'Hanging Knee Raise', equipment: 'both', difficulty: 5, notes: 'Alla sbarra' },
  ],
  'Pallof Press': [
    { name: 'Cable Rotation', equipment: 'gym', difficulty: 4, notes: 'Rotazione controllata' },
    { name: 'Side Plank', equipment: 'bodyweight', difficulty: 4, notes: 'Statico' },
    { name: 'Bird Dog', equipment: 'bodyweight', difficulty: 3, notes: 'Anti-rotazione' },
  ],
};

/**
 * Ottiene le varianti alternative per un esercizio
 * Per switch rapido quando la postazione è affollata
 *
 * @param exerciseName - Nome dell'esercizio corrente
 * @param preferGym - Se true, preferisce varianti gym (default in palestra)
 * @returns Array di max 3 alternative biomeccanicamente equivalenti
 */
export function getExerciseAlternatives(
  exerciseName: string,
  preferGym: boolean = true
): ExerciseAlternative[] {
  // Cerca corrispondenza esatta
  let alternatives = EXERCISE_ALTERNATIVES[exerciseName];

  // Se non trovato, cerca match parziale (es. "Back Squat" in "Barbell Back Squat")
  if (!alternatives) {
    const keys = Object.keys(EXERCISE_ALTERNATIVES);
    const matchingKey = keys.find(key =>
      exerciseName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(exerciseName.toLowerCase())
    );
    if (matchingKey) {
      alternatives = EXERCISE_ALTERNATIVES[matchingKey];
    }
  }

  if (!alternatives || alternatives.length === 0) {
    return [];
  }

  // Ordina: prima preferenza equipment, poi per difficoltà simile
  const sorted = [...alternatives].sort((a, b) => {
    // Preferenza equipment
    if (preferGym) {
      if (a.equipment === 'gym' && b.equipment !== 'gym') return -1;
      if (b.equipment === 'gym' && a.equipment !== 'gym') return 1;
    } else {
      if (a.equipment === 'bodyweight' && b.equipment !== 'bodyweight') return -1;
      if (b.equipment === 'bodyweight' && a.equipment !== 'bodyweight') return 1;
    }
    return 0;
  });

  // Ritorna max 3 alternative
  return sorted.slice(0, 3);
}

/**
 * Verifica se un esercizio ha alternative disponibili
 */
export function hasAlternatives(exerciseName: string): boolean {
  return getExerciseAlternatives(exerciseName).length > 0;
}

/**
 * Ottiene una singola alternativa rapida (la migliore)
 */
export function getQuickAlternative(
  exerciseName: string,
  preferGym: boolean = true
): ExerciseAlternative | null {
  const alternatives = getExerciseAlternatives(exerciseName, preferGym);
  return alternatives.length > 0 ? alternatives[0] : null;
}
