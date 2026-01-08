/**
 * Exercise Static Images Mapping
 * Mappa ogni esercizio statico/isometrico alla sua immagine
 *
 * Per esercizi statici usiamo immagini invece di video perché:
 * - Mostrare la posizione corretta è sufficiente
 * - Immagini più leggere dei video
 * - Caricamento più veloce
 *
 * FONTI UTILIZZATE:
 * - Spotebi.com (illustrazioni gratuite, uso commerciale consentito)
 * - IconScout.com (illustrazioni gratuite con attribuzione)
 * - WorkoutLabs.com (SVG gratuiti)
 * - Vecteezy.com (vettori gratuiti con attribuzione)
 */

// URL base di Supabase Storage per immagini esercizi
// Costruito dinamicamente dall'URL Supabase configurato
const getSupabaseStorageUrl = () => {
  // Try Vite env first, then fallback to hardcoded URL
  const importMeta = typeof import.meta !== 'undefined' ? (import.meta as any) : {};
  const supabaseUrl = importMeta.env?.VITE_SUPABASE_URL
    || (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL)
    || 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
  return `${supabaseUrl}/storage/v1/object/public/exercise-images`;
};
const SUPABASE_STORAGE_URL = getSupabaseStorageUrl();

/**
 * Mapping diretto esercizio -> immagine
 * Immagini scaricate da fonti gratuite e caricate su Supabase
 */
export const EXERCISE_IMAGES: Record<string, {
  url: string;
  source: string;
  type: 'illustration' | 'photo';
}> = {
  // =====================================================
  // ALIAS ITALIANI (mappati alle stesse immagini inglesi)
  // =====================================================
  'Squat a Corpo Libero': { url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`, source: 'Spotebi', type: 'illustration' },
  'Squat con Bilanciere': { url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`, source: 'Spotebi', type: 'illustration' },
  'Squat Frontale': { url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`, source: 'Spotebi', type: 'illustration' },
  'Squat Bulgaro': { url: `${SUPABASE_STORAGE_URL}/bulgarian-split-squat.jpg`, source: 'Spotebi', type: 'illustration' },
  'Pressa': { url: `${SUPABASE_STORAGE_URL}/leg-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Stacco da Terra': { url: `${SUPABASE_STORAGE_URL}/deadlift.jpg`, source: 'Spotebi', type: 'illustration' },
  'Stacco Rumeno': { url: `${SUPABASE_STORAGE_URL}/romanian-deadlift.jpg`, source: 'Spotebi', type: 'illustration' },
  'Stacco Sumo': { url: `${SUPABASE_STORAGE_URL}/sumo-deadlift.jpg`, source: 'Spotebi', type: 'illustration' },
  'Stacco con Trap Bar': { url: `${SUPABASE_STORAGE_URL}/deadlift.jpg`, source: 'Spotebi', type: 'illustration' },
  'Stacco Rumeno Unilaterale': { url: `${SUPABASE_STORAGE_URL}/single-leg-deadlift.jpg`, source: 'Spotebi', type: 'illustration' },
  'Leg Curl alla Macchina': { url: `${SUPABASE_STORAGE_URL}/leg-curl.jpg`, source: 'Spotebi', type: 'illustration' },
  'Leg Curl Sdraiato': { url: `${SUPABASE_STORAGE_URL}/leg-curl.jpg`, source: 'Spotebi', type: 'illustration' },
  'Leg Curl Seduto': { url: `${SUPABASE_STORAGE_URL}/leg-curl.jpg`, source: 'Spotebi', type: 'illustration' },
  'Piegamenti': { url: `${SUPABASE_STORAGE_URL}/push-up.jpg`, source: 'Spotebi', type: 'illustration' },
  'Piegamenti Diamante': { url: `${SUPABASE_STORAGE_URL}/diamond-push-up.jpg`, source: 'IconScout', type: 'illustration' },
  'Piegamenti Arciere': { url: `${SUPABASE_STORAGE_URL}/archer-push-up.jpg`, source: 'IconScout', type: 'illustration' },
  'Panca Piana': { url: `${SUPABASE_STORAGE_URL}/bench-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Panca Inclinata': { url: `${SUPABASE_STORAGE_URL}/incline-bench-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Panca Declinata': { url: `${SUPABASE_STORAGE_URL}/decline-bench-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Panca con Manubri': { url: `${SUPABASE_STORAGE_URL}/dumbbell-bench-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Panca Inclinata con Bilanciere': { url: `${SUPABASE_STORAGE_URL}/incline-bench-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Panca Inclinata con Manubri': { url: `${SUPABASE_STORAGE_URL}/incline-bench-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Panca Presa Stretta': { url: `${SUPABASE_STORAGE_URL}/bench-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Dip per Petto': { url: `${SUPABASE_STORAGE_URL}/dips.jpg`, source: 'Spotebi', type: 'illustration' },
  'Dip per Tricipiti': { url: `${SUPABASE_STORAGE_URL}/dips.jpg`, source: 'Spotebi', type: 'illustration' },
  'Croci ai Cavi': { url: `${SUPABASE_STORAGE_URL}/cable-fly.jpg`, source: 'Spotebi', type: 'illustration' },
  'Croci con Manubri': { url: `${SUPABASE_STORAGE_URL}/dumbbell-fly.jpg`, source: 'Spotebi', type: 'illustration' },
  'Piegamenti in Verticale al Muro': { url: `${SUPABASE_STORAGE_URL}/pike-push-up.jpg`, source: 'Spotebi', type: 'illustration' },
  'Lento Avanti': { url: `${SUPABASE_STORAGE_URL}/military-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Spinte con Manubri': { url: `${SUPABASE_STORAGE_URL}/dumbbell-shoulder-press.jpg`, source: 'Spotebi', type: 'illustration' },
  'Trazioni alla Sbarra': { url: `${SUPABASE_STORAGE_URL}/pull-up.svg`, source: 'WorkoutLabs', type: 'illustration' },
  'Trazioni Presa Larga': { url: `${SUPABASE_STORAGE_URL}/pull-up.svg`, source: 'WorkoutLabs', type: 'illustration' },
  'Trazioni Supine': { url: `${SUPABASE_STORAGE_URL}/chin-up.png`, source: 'WorkoutLabs', type: 'illustration' },
  'Trazioni Presa Neutra': { url: `${SUPABASE_STORAGE_URL}/pull-up.svg`, source: 'WorkoutLabs', type: 'illustration' },
  'Trazioni Assistite': { url: `${SUPABASE_STORAGE_URL}/pull-up.svg`, source: 'WorkoutLabs', type: 'illustration' },
  'Lat Machine': { url: `${SUPABASE_STORAGE_URL}/lat-pulldown.jpg`, source: 'Spotebi', type: 'illustration' },
  'Rematore Invertito': { url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`, source: 'IconScout', type: 'illustration' },
  'Trazioni Orizzontali': { url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`, source: 'IconScout', type: 'illustration' },
  'Trazioni Orizzontali Veloci': { url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`, source: 'IconScout', type: 'illustration' },
  'Rematore con Bilanciere': { url: `${SUPABASE_STORAGE_URL}/barbell-row.jpg`, source: 'Spotebi', type: 'illustration' },
  'Rematore con Manubrio': { url: `${SUPABASE_STORAGE_URL}/dumbbell-row.jpg`, source: 'Spotebi', type: 'illustration' },
  'Pulley Basso': { url: `${SUPABASE_STORAGE_URL}/seated-cable-row.jpg`, source: 'Spotebi', type: 'illustration' },
  'Rematore T-Bar': { url: `${SUPABASE_STORAGE_URL}/barbell-row.jpg`, source: 'Spotebi', type: 'illustration' },
  'Plank Laterale': { url: `${SUPABASE_STORAGE_URL}/side-plank.jpg`, source: 'Spotebi', type: 'illustration' },
  'Alzate Gambe alla Sbarra': { url: `${SUPABASE_STORAGE_URL}/hanging-leg-raise.jpg`, source: 'Spotebi', type: 'illustration' },
  'Alzate Ginocchia alla Sbarra': { url: `${SUPABASE_STORAGE_URL}/hanging-leg-raise.jpg`, source: 'Spotebi', type: 'illustration' },
  'Rollout con Ruota': { url: `${SUPABASE_STORAGE_URL}/ab-wheel-rollout.jpg`, source: 'Spotebi', type: 'illustration' },
  'Crunch ai Cavi': { url: `${SUPABASE_STORAGE_URL}/cable-crunch.jpg`, source: 'Spotebi', type: 'illustration' },
  'Pushdown ai Cavi': { url: `${SUPABASE_STORAGE_URL}/tricep-pushdown.jpg`, source: 'Spotebi', type: 'illustration' },
  'French Press': { url: `${SUPABASE_STORAGE_URL}/skull-crushers.jpg`, source: 'Spotebi', type: 'illustration' },
  'French Press Sopra la Testa': { url: `${SUPABASE_STORAGE_URL}/skull-crushers.jpg`, source: 'Spotebi', type: 'illustration' },
  'Kickback Tricipiti': { url: `${SUPABASE_STORAGE_URL}/tricep-kickback.jpg`, source: 'Spotebi', type: 'illustration' },
  'Curl con Bilanciere': { url: `${SUPABASE_STORAGE_URL}/barbell-curl.jpg`, source: 'Spotebi', type: 'illustration' },
  'Curl a Martello': { url: `${SUPABASE_STORAGE_URL}/hammer-curl.jpg`, source: 'Spotebi', type: 'illustration' },
  'Curl alla Panca Scott': { url: `${SUPABASE_STORAGE_URL}/preacher-curl.jpg`, source: 'Spotebi', type: 'illustration' },
  'Curl Concentrato': { url: `${SUPABASE_STORAGE_URL}/concentration-curl.jpg`, source: 'Spotebi', type: 'illustration' },
  'Curl su Panca Inclinata': { url: `${SUPABASE_STORAGE_URL}/incline-curl.jpg`, source: 'Spotebi', type: 'illustration' },
  'Calf Raise in Piedi': { url: `${SUPABASE_STORAGE_URL}/calf-raise.jpg`, source: 'Spotebi', type: 'illustration' },
  'Calf Raise da Seduto': { url: `${SUPABASE_STORAGE_URL}/seated-calf-raise.jpg`, source: 'Spotebi', type: 'illustration' },
  'Calf Raise Unilaterale': { url: `${SUPABASE_STORAGE_URL}/calf-raise.jpg`, source: 'Spotebi', type: 'illustration' },
  'Calf Raise Donkey': { url: `${SUPABASE_STORAGE_URL}/calf-raise.jpg`, source: 'Spotebi', type: 'illustration' },
  'Alzate Tibiali': { url: `${SUPABASE_STORAGE_URL}/tibialis-raise.jpg`, source: 'Spotebi', type: 'illustration' },
  'Alzate Posteriori': { url: `${SUPABASE_STORAGE_URL}/rear-delt-fly.jpg`, source: 'Spotebi', type: 'illustration' },
  'Alzate Y-T-W': { url: `${SUPABASE_STORAGE_URL}/y-t-w-raises.jpg`, source: 'Spotebi', type: 'illustration' },
  'Rotazione Esterna ai Cavi': { url: `${SUPABASE_STORAGE_URL}/external-rotation.jpg`, source: 'Spotebi', type: 'illustration' },
  'Iperestensioni 45°': { url: `${SUPABASE_STORAGE_URL}/back-extension.jpg`, source: 'Spotebi', type: 'illustration' },
  'Iperestensioni alla Sedia Romana': { url: `${SUPABASE_STORAGE_URL}/back-extension.jpg`, source: 'Spotebi', type: 'illustration' },
  'Iperestensione Inversa': { url: `${SUPABASE_STORAGE_URL}/reverse-hyperextension.jpg`, source: 'Spotebi', type: 'illustration' },
  'Nordic Curl Inverso': { url: `${SUPABASE_STORAGE_URL}/reverse-nordic.jpg`, source: 'Spotebi', type: 'illustration' },
  'Hip Thrust Unilaterale': { url: `${SUPABASE_STORAGE_URL}/hip-thrust.jpg`, source: 'Spotebi', type: 'illustration' },
  'Pull Through ai Cavi': { url: `${SUPABASE_STORAGE_URL}/cable-pull-through.jpg`, source: 'Spotebi', type: 'illustration' },
  'Kickback ai Cavi': { url: `${SUPABASE_STORAGE_URL}/cable-kickback.jpg`, source: 'Spotebi', type: 'illustration' },
  'Rematore con Supporto Petto': { url: `${SUPABASE_STORAGE_URL}/chest-supported-row.jpg`, source: 'Spotebi', type: 'illustration' },
  'Rematore Pendlay': { url: `${SUPABASE_STORAGE_URL}/barbell-row.jpg`, source: 'Spotebi', type: 'illustration' },
  'Rematore Meadows': { url: `${SUPABASE_STORAGE_URL}/meadows-row.jpg`, source: 'Spotebi', type: 'illustration' },
  'Pulldown Braccia Tese': { url: `${SUPABASE_STORAGE_URL}/straight-arm-pulldown.jpg`, source: 'Spotebi', type: 'illustration' },
  'Pullover con Manubrio': { url: `${SUPABASE_STORAGE_URL}/dumbbell-pullover.jpg`, source: 'Spotebi', type: 'illustration' },
  'Swing con Kettlebell': { url: `${SUPABASE_STORAGE_URL}/kettlebell-swing.jpg`, source: 'Spotebi', type: 'illustration' },
  'Clean con Kettlebell': { url: `${SUPABASE_STORAGE_URL}/kettlebell-clean.jpg`, source: 'Spotebi', type: 'illustration' },
  'Snatch con Kettlebell': { url: `${SUPABASE_STORAGE_URL}/kettlebell-snatch.jpg`, source: 'Spotebi', type: 'illustration' },
  'Alzata Turca': { url: `${SUPABASE_STORAGE_URL}/turkish-getup.jpg`, source: 'Spotebi', type: 'illustration' },
  'Spinta Slitta': { url: `${SUPABASE_STORAGE_URL}/sled-push.jpg`, source: 'Spotebi', type: 'illustration' },
  'Traino Slitta': { url: `${SUPABASE_STORAGE_URL}/sled-pull.jpg`, source: 'Spotebi', type: 'illustration' },

  // === CORE ISOMETRICO ===
  'Plank': {
    url: `${SUPABASE_STORAGE_URL}/plank.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Side Plank': {
    url: `${SUPABASE_STORAGE_URL}/side-plank.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Side Plank (Left)': {
    url: `${SUPABASE_STORAGE_URL}/side-plank.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Side Plank (Right)': {
    url: `${SUPABASE_STORAGE_URL}/side-plank.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Bird Dog': {
    url: `${SUPABASE_STORAGE_URL}/bird-dog.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Bird Dogs': {
    url: `${SUPABASE_STORAGE_URL}/bird-dog.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Dead Bug': {
    url: `${SUPABASE_STORAGE_URL}/dead-bug.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Superman': {
    url: `${SUPABASE_STORAGE_URL}/superman.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Superman Hold': {
    url: `${SUPABASE_STORAGE_URL}/superman.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Hollow Body Hold': {
    url: 'https://workoutlabs.com/train/svg.php?id=84978',
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Hollow Body': {
    url: 'https://workoutlabs.com/train/svg.php?id=84978',
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Wall Sit': {
    url: `${SUPABASE_STORAGE_URL}/wall-sit.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Glute Bridge': {
    url: `${SUPABASE_STORAGE_URL}/glute-bridge.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Glute Bridge Hold': {
    url: `${SUPABASE_STORAGE_URL}/glute-bridge.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Dragon Flag': {
    url: `${SUPABASE_STORAGE_URL}/dragon-flag.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },

  // === YOGA / STRETCHING ===
  'Pigeon Pose': {
    url: `${SUPABASE_STORAGE_URL}/pigeon-pose.jpg`,
    source: 'Shopify Burst',
    type: 'photo'
  },
  'Side Plank Pose': {
    url: `${SUPABASE_STORAGE_URL}/side-plank-pose.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Vasisthasana': {
    url: `${SUPABASE_STORAGE_URL}/side-plank-pose.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },

  // === CALISTHENICS AVANZATO ===
  'L-Sit': {
    url: `${SUPABASE_STORAGE_URL}/l-sit.jpg`,
    source: 'Dreamstime',
    type: 'photo'
  },
  'L-Sit Hold': {
    url: `${SUPABASE_STORAGE_URL}/l-sit.jpg`,
    source: 'Dreamstime',
    type: 'photo'
  },
  'Full L-sit': {
    url: `${SUPABASE_STORAGE_URL}/l-sit.jpg`,
    source: 'Dreamstime',
    type: 'photo'
  },
  'Tuck L-sit': {
    url: `${SUPABASE_STORAGE_URL}/l-sit.jpg`,
    source: 'Dreamstime',
    type: 'photo'
  },
  'One Leg L-sit': {
    url: `${SUPABASE_STORAGE_URL}/l-sit.jpg`,
    source: 'Dreamstime',
    type: 'photo'
  },

  // === HIP STRETCHING ===
  'Hip Stretch': {
    url: `${SUPABASE_STORAGE_URL}/hip-stretch.jpg`,
    source: 'Pexels',
    type: 'photo'
  },

  // =====================================================
  // TEST SCREENING INIZIALE
  // =====================================================

  // === LOWER BODY PUSH (SQUAT) ===
  'Air Squat': {
    url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Squat': {
    url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Bodyweight Squat': {
    url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Squat Assistito': {
    url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Squat Assistito (con supporto)': {
    url: `${SUPABASE_STORAGE_URL}/air-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Jump Squat': {
    url: `${SUPABASE_STORAGE_URL}/jump-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Bulgarian Split Squat': {
    url: `${SUPABASE_STORAGE_URL}/bulgarian-split-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Pistol Squat': {
    url: `${SUPABASE_STORAGE_URL}/pistol-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Shrimp Squat': {
    url: `${SUPABASE_STORAGE_URL}/shrimp-squat.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },

  // === HORIZONTAL PUSH (PUSH-UP) ===
  'Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Push-up Standard': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Standard Push-up': {
    url: `${SUPABASE_STORAGE_URL}/push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Wall Push-up': {
    url: `${SUPABASE_STORAGE_URL}/wall-push-up.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Incline Push-up': {
    url: `${SUPABASE_STORAGE_URL}/incline-push-up.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Incline Push-up (rialzato)': {
    url: `${SUPABASE_STORAGE_URL}/incline-push-up.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Push-up su Ginocchia': {
    url: `${SUPABASE_STORAGE_URL}/knee-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Knee Push-up': {
    url: `${SUPABASE_STORAGE_URL}/knee-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Diamond Push-up': {
    url: `${SUPABASE_STORAGE_URL}/diamond-push-up.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Archer Push-up': {
    url: `${SUPABASE_STORAGE_URL}/archer-push-up.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Pseudo Planche Push-up': {
    url: `${SUPABASE_STORAGE_URL}/pseudo-planche-push-up.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'One Arm Push-up': {
    url: `${SUPABASE_STORAGE_URL}/one-arm-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Decline Push-up': {
    url: `${SUPABASE_STORAGE_URL}/decline-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },

  // === VERTICAL PUSH (PIKE → HSPU) ===
  'Pike Push-up': {
    url: `${SUPABASE_STORAGE_URL}/pike-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Pike Push Up': {
    url: `${SUPABASE_STORAGE_URL}/pike-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Pike Push-up Facile': {
    url: `${SUPABASE_STORAGE_URL}/pike-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Pike Push-up Elevato': {
    url: `${SUPABASE_STORAGE_URL}/pike-push-up.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  // NOTA: Questi esercizi usano VIDEO invece di immagini nei test iniziali
  // I video sono disponibili in /videos/exercises/:
  // - wall-handstand-push-up.mp4 (per Wall HSPU, Freestanding HSPU)
  // - pike-push-up.mp4 (per Pike Push-up)
  // Elevated Pike e Wall Walk: cercare immagini appropriate su Canva

  // === VERTICAL PULL (INVERTED ROW → PULL-UP) ===
  'Inverted Row': {
    url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Inverted Row (barra alta)': {
    url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Inverted Row (barra media)': {
    url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Inverted Row (barra bassa)': {
    url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  // Australian Pull-up = Inverted Row (alias comune)
  'Australian Pull-up': {
    url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Australian Pull-up Veloci': {
    url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Australian Pull Up': {
    url: `${SUPABASE_STORAGE_URL}/inverted-row.jpg`,
    source: 'IconScout',
    type: 'illustration'
  },
  'Pull-up': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Pull-up Standard': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Negative Pull-up': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Negative Pull-up (solo eccentrica)': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Band-Assisted Pull-up': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Archer Pull-up': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'One Arm Pull-up Progression': {
    url: `${SUPABASE_STORAGE_URL}/pull-up.svg`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Chin-up': {
    url: `${SUPABASE_STORAGE_URL}/chin-up.png`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },
  'Chin-up Standard': {
    url: `${SUPABASE_STORAGE_URL}/chin-up.png`,
    source: 'WorkoutLabs',
    type: 'illustration'
  },

  // === LOWER BODY PULL (HINGE/HAMSTRING) ===
  'Single Leg Glute Bridge': {
    url: `${SUPABASE_STORAGE_URL}/single-leg-bridge.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Single Leg RDL (corpo libero)': {
    url: `${SUPABASE_STORAGE_URL}/single-leg-deadlift.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Single Leg Deadlift': {
    url: `${SUPABASE_STORAGE_URL}/single-leg-deadlift.jpg`,
    source: 'Spotebi',
    type: 'illustration'
  },
  'Nordic Curl': {
    url: `${SUPABASE_STORAGE_URL}/nordic-curl.jpg`,
    source: 'Freepik',
    type: 'illustration'
  },
  'Nordic Curl (solo eccentrica)': {
    url: `${SUPABASE_STORAGE_URL}/nordic-curl.jpg`,
    source: 'Freepik',
    type: 'illustration'
  },
  'Nordic Curl (completo)': {
    url: `${SUPABASE_STORAGE_URL}/nordic-curl.jpg`,
    source: 'Freepik',
    type: 'illustration'
  },
  'Sliding Leg Curl': {
    url: `${SUPABASE_STORAGE_URL}/sliding-leg-curl.jpg`,
    source: 'Vecteezy',
    type: 'illustration'
  },
};

/**
 * URL di fallback esterni per immagini non ancora caricate su Supabase
 * Questi sono link diretti alle fonti originali
 *
 * IMPORTANTE: Queste immagini devono essere scaricate e caricate su Supabase Storage
 * per evitare dipendenze da siti esterni
 */
export const EXERCISE_IMAGE_FALLBACKS: Record<string, string> = {
  // =====================================================
  // SPOTEBI - Illustrazioni gratuite (uso commerciale OK)
  // =====================================================

  // Core
  'Plank': 'https://spotebi.com/wp-content/uploads/2014/10/plank-exercise-illustration.jpg',
  'Side Plank': 'https://spotebi.com/wp-content/uploads/2014/10/side-plank-exercise-illustration.jpg',
  'Bird Dog': 'https://spotebi.com/wp-content/uploads/2014/10/bird-dogs-exercise-illustration.jpg',
  'Bird Dogs': 'https://spotebi.com/wp-content/uploads/2014/10/bird-dogs-exercise-illustration.jpg',
  'Dead Bug': 'https://spotebi.com/wp-content/uploads/2015/05/dead-bug-exercise-illustration.jpg',
  'Superman': 'https://spotebi.com/wp-content/uploads/2016/02/superman-exercise-illustration-spotebi.jpg',
  'Superman Hold': 'https://spotebi.com/wp-content/uploads/2016/02/superman-exercise-illustration-spotebi.jpg',
  'Wall Sit': 'https://spotebi.com/wp-content/uploads/2015/05/wall-sit-exercise-illustration.jpg',
  'Glute Bridge': 'https://spotebi.com/wp-content/uploads/2015/01/glute-bridge-exercise-illustration.jpg',
  'Glute Bridge Hold': 'https://spotebi.com/wp-content/uploads/2015/01/glute-bridge-exercise-illustration.jpg',
  'Side Plank Pose': 'https://spotebi.com/wp-content/uploads/2016/07/side-plank-pose-vasisthasana-spotebi.jpg',
  'Vasisthasana': 'https://spotebi.com/wp-content/uploads/2016/07/side-plank-pose-vasisthasana-spotebi.jpg',

  // Push-up (Spotebi)
  'Push-up': 'https://spotebi.com/wp-content/uploads/2014/10/push-up-exercise-illustration.jpg',
  'Push-up Standard': 'https://spotebi.com/wp-content/uploads/2014/10/push-up-exercise-illustration.jpg',
  'Standard Push-up': 'https://spotebi.com/wp-content/uploads/2014/10/push-up-exercise-illustration.jpg',
  'Knee Push-up': 'https://spotebi.com/wp-content/uploads/2014/10/knee-push-up-exercise-illustration.jpg',
  'Push-up su Ginocchia': 'https://spotebi.com/wp-content/uploads/2014/10/knee-push-up-exercise-illustration.jpg',
  'Decline Push-up': 'https://spotebi.com/wp-content/uploads/2016/03/decline-push-up-exercise-illustration-spotebi.jpg',
  'Pike Push-up': 'https://spotebi.com/wp-content/uploads/2016/03/pike-push-up-exercise-illustration-spotebi.jpg',
  'One Arm Push-up': 'https://spotebi.com/wp-content/uploads/2016/03/one-arm-tricep-push-up-exercise-illustration-spotebi.jpg',

  // Lower Body (Spotebi)
  'Single Leg Glute Bridge': 'https://spotebi.com/wp-content/uploads/2015/01/single-leg-bridge-exercise-illustration.jpg',
  'Single Leg Deadlift': 'https://spotebi.com/wp-content/uploads/2015/04/single-leg-deadlift-exercise-illustration.jpg',
  'Single Leg RDL (corpo libero)': 'https://spotebi.com/wp-content/uploads/2015/04/single-leg-deadlift-exercise-illustration.jpg',
  'Lying Hamstring Curls': 'https://spotebi.com/wp-content/uploads/2015/05/lying-hamstring-curls-exercise-illustration.jpg',

  // =====================================================
  // WORKOUTLABS - SVG gratuiti
  // =====================================================
  'Hollow Body Hold': 'https://workoutlabs.com/train/svg.php?id=84978',
  'Hollow Body': 'https://workoutlabs.com/train/svg.php?id=84978',

  // =====================================================
  // FOTO STOCK GRATUITE
  // =====================================================

  // Shopify Burst
  'Pigeon Pose': 'https://burst.shopifycdn.com/photos/pigeon-pose.jpg',

  // Dreamstime (L-Sit)
  'L-Sit': 'https://thumbs.dreamstime.com/z/celibate-s-yoga-pose-beautiful-sporty-girl-doing-arm-balancing-training-utpluti-dandasana-floating-stick-asana-celibates-52838121.jpg',
  'L-Sit Hold': 'https://thumbs.dreamstime.com/z/celibate-s-yoga-pose-beautiful-sporty-girl-doing-arm-balancing-training-utpluti-dandasana-floating-stick-asana-celibates-52838121.jpg',
  'Full L-sit': 'https://thumbs.dreamstime.com/z/celibate-s-yoga-pose-beautiful-sporty-girl-doing-arm-balancing-training-utpluti-dandasana-floating-stick-asana-celibates-52838121.jpg',
  'Tuck L-sit': 'https://thumbs.dreamstime.com/z/celibate-s-yoga-pose-beautiful-sporty-girl-doing-arm-balancing-training-utpluti-dandasana-floating-stick-asana-celibates-52838121.jpg',
  'One Leg L-sit': 'https://thumbs.dreamstime.com/z/celibate-s-yoga-pose-beautiful-sporty-girl-doing-arm-balancing-training-utpluti-dandasana-floating-stick-asana-celibates-52838121.jpg',

  // Pexels photos
  'Hip Stretch': 'https://images.pexels.com/photos/4051518/pexels-photo-4051518.jpeg?auto=compress&cs=tinysrgb&w=600',

  // Unsplash photos
  'Seated Forward Fold': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600',
  'Baddha Konasana': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600',
  'Butterfly Stretch': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600',

  // =====================================================
  // ESERCIZI AGGIUNTIVI - Spotebi
  // =====================================================

  // Squat variations
  'Pause Squat (Bodyweight)': 'https://spotebi.com/wp-content/uploads/2014/10/squat-exercise-illustration.jpg',
  'Split Squat': 'https://spotebi.com/wp-content/uploads/2016/08/split-squat-exercise-illustration.jpg',
  'Reverse Lunge': 'https://spotebi.com/wp-content/uploads/2014/10/rear-lunges-exercise-illustration.jpg',
  'Skater Squat': 'https://spotebi.com/wp-content/uploads/2015/07/skater-squats-exercise-illustration.jpg',
  'Goblet Squat': 'https://spotebi.com/wp-content/uploads/2015/07/goblet-squat-exercise-illustration.jpg',
  'Back Squat': 'https://spotebi.com/wp-content/uploads/2016/02/barbell-squat-exercise-illustration-spotebi.jpg',
  'Front Squat': 'https://spotebi.com/wp-content/uploads/2016/02/front-squat-exercise-illustration-spotebi.jpg',
  'Zercher Squat': 'https://spotebi.com/wp-content/uploads/2016/02/barbell-squat-exercise-illustration-spotebi.jpg',
  'Leg Press': 'https://spotebi.com/wp-content/uploads/2016/08/leg-press-exercise-illustration.jpg',
  'Lunges': 'https://spotebi.com/wp-content/uploads/2014/10/lunges-exercise-illustration.jpg',

  // Hip Hinge / Deadlift
  'Bodyweight Hip Hinge': 'https://spotebi.com/wp-content/uploads/2015/04/single-leg-deadlift-exercise-illustration.jpg',
  'Hip Thrust (Elevated)': 'https://spotebi.com/wp-content/uploads/2015/01/glute-bridge-exercise-illustration.jpg',
  'Hip Thrust': 'https://spotebi.com/wp-content/uploads/2015/07/hip-thrust-exercise-illustration.jpg',
  'Nordic Curl (Eccentric Only)': 'https://spotebi.com/wp-content/uploads/2015/05/lying-hamstring-curls-exercise-illustration.jpg',
  'Slider Leg Curl': 'https://spotebi.com/wp-content/uploads/2015/05/lying-hamstring-curls-exercise-illustration.jpg',
  'Nordic Hamstring Curl': 'https://spotebi.com/wp-content/uploads/2015/05/lying-hamstring-curls-exercise-illustration.jpg',
  'Leg Curl (Machine)': 'https://spotebi.com/wp-content/uploads/2015/05/lying-hamstring-curls-exercise-illustration.jpg',
  'Leg Curl': 'https://spotebi.com/wp-content/uploads/2015/05/lying-hamstring-curls-exercise-illustration.jpg',
  'Trap Bar Deadlift': 'https://spotebi.com/wp-content/uploads/2016/10/trap-bar-deadlift-exercise-illustration.jpg',
  'Romanian Deadlift (RDL)': 'https://spotebi.com/wp-content/uploads/2016/02/romanian-deadlift-exercise-illustration-spotebi.jpg',
  'Romanian Deadlift': 'https://spotebi.com/wp-content/uploads/2016/02/romanian-deadlift-exercise-illustration-spotebi.jpg',
  'Sumo Deadlift': 'https://spotebi.com/wp-content/uploads/2016/02/sumo-deadlift-exercise-illustration-spotebi.jpg',
  'Conventional Deadlift': 'https://spotebi.com/wp-content/uploads/2016/02/deadlift-exercise-illustration-spotebi.jpg',
  'Deficit Deadlift': 'https://spotebi.com/wp-content/uploads/2016/02/deadlift-exercise-illustration-spotebi.jpg',
  'Good Morning': 'https://spotebi.com/wp-content/uploads/2016/08/good-morning-exercise-illustration.jpg',
  'Step Up': 'https://spotebi.com/wp-content/uploads/2015/06/step-ups-exercise-illustration.jpg',

  // Push variations
  'Flat Barbell Bench Press': 'https://spotebi.com/wp-content/uploads/2015/07/bench-press-exercise-illustration.jpg',
  'Incline Bench Press': 'https://spotebi.com/wp-content/uploads/2016/01/incline-dumbbell-bench-press-exercise-illustration.jpg',
  'Decline Bench Press': 'https://spotebi.com/wp-content/uploads/2016/01/decline-bench-press-exercise-illustration.jpg',
  'Dumbbell Bench Press': 'https://spotebi.com/wp-content/uploads/2015/07/dumbbell-bench-press-exercise-illustration.jpg',
  'Chest Dips': 'https://spotebi.com/wp-content/uploads/2015/07/triceps-dips-exercise-illustration.jpg',
  'Dips': 'https://spotebi.com/wp-content/uploads/2015/07/triceps-dips-exercise-illustration.jpg',
  'Tricep Dips': 'https://spotebi.com/wp-content/uploads/2015/07/triceps-dips-exercise-illustration.jpg',

  // Shoulder Press
  // Wall Handstand Push-up: usa video locale invece di immagine sbagliata
  // 'Wall Handstand Push-up': VIDEO DISPONIBILE - /videos/exercises/wall-handstand-push-up.mp4
  'Military Press (Barbell)': 'https://spotebi.com/wp-content/uploads/2016/08/barbell-military-press-exercise-illustration.jpg',
  'Military Press': 'https://spotebi.com/wp-content/uploads/2016/08/barbell-military-press-exercise-illustration.jpg',
  'Dumbbell Shoulder Press': 'https://spotebi.com/wp-content/uploads/2015/10/seated-dumbbell-shoulder-press-exercise-illustration.jpg',
  'Arnold Press': 'https://spotebi.com/wp-content/uploads/2015/10/arnold-dumbbell-press-exercise-illustration.jpg',
  'Push Press': 'https://spotebi.com/wp-content/uploads/2016/08/barbell-military-press-exercise-illustration.jpg',
  'Lateral Raise': 'https://spotebi.com/wp-content/uploads/2014/10/lateral-raises-exercise-illustration.jpg',
  'Front Raise': 'https://spotebi.com/wp-content/uploads/2014/10/front-raises-exercise-illustration.jpg',

  // Pull variations
  'Standard Pull-up': 'https://spotebi.com/wp-content/uploads/2015/04/pull-up-exercise-illustration.jpg',
  'Wide Grip Pull-up': 'https://spotebi.com/wp-content/uploads/2015/04/pull-up-exercise-illustration.jpg',
  'Chin-up (Supinated)': 'https://spotebi.com/wp-content/uploads/2015/04/chin-up-exercise-illustration.jpg',
  'Chin-up': 'https://spotebi.com/wp-content/uploads/2015/04/chin-up-exercise-illustration.jpg',
  'Neutral Grip Pull-up': 'https://spotebi.com/wp-content/uploads/2015/04/pull-up-exercise-illustration.jpg',
  'Lat Pulldown (Machine)': 'https://spotebi.com/wp-content/uploads/2016/01/wide-grip-lat-pulldown-exercise-illustration.jpg',
  'Lat Pulldown': 'https://spotebi.com/wp-content/uploads/2016/01/wide-grip-lat-pulldown-exercise-illustration.jpg',
  'Assisted Pull-up': 'https://spotebi.com/wp-content/uploads/2015/04/pull-up-exercise-illustration.jpg',
  'Face Pull': 'https://spotebi.com/wp-content/uploads/2016/08/face-pull-exercise-illustration.jpg',

  // Row variations
  'Barbell Row': 'https://spotebi.com/wp-content/uploads/2016/02/bent-over-barbell-row-exercise-illustration-spotebi.jpg',
  'Dumbbell Row': 'https://spotebi.com/wp-content/uploads/2014/10/dumbbell-row-exercise-illustration.jpg',
  'Seated Cable Row': 'https://spotebi.com/wp-content/uploads/2016/01/seated-cable-row-exercise-illustration.jpg',
  'T-Bar Row': 'https://spotebi.com/wp-content/uploads/2016/02/bent-over-barbell-row-exercise-illustration-spotebi.jpg',
  'Seated Row (Band)': 'https://spotebi.com/wp-content/uploads/2016/01/seated-cable-row-exercise-illustration.jpg',

  // Core
  'Hanging Leg Raise': 'https://spotebi.com/wp-content/uploads/2016/01/hanging-leg-raise-exercise-illustration.jpg',
  'Ab Wheel Rollout': 'https://spotebi.com/wp-content/uploads/2016/01/ab-wheel-rollout-exercise-illustration.jpg',
  'Cable Crunch': 'https://spotebi.com/wp-content/uploads/2016/01/cable-crunch-exercise-illustration.jpg',
  'Pallof Press': 'https://spotebi.com/wp-content/uploads/2016/08/pallof-press-exercise-illustration.jpg',
  'Half Kneeling Chop': 'https://spotebi.com/wp-content/uploads/2016/08/pallof-press-exercise-illustration.jpg',

  // Arms
  'Barbell Curl': 'https://spotebi.com/wp-content/uploads/2015/04/barbell-curl-exercise-illustration.jpg',
  'Hammer Curl': 'https://spotebi.com/wp-content/uploads/2014/10/hammer-curls-exercise-illustration.jpg',
  'Tricep Pushdown': 'https://spotebi.com/wp-content/uploads/2014/10/tricep-pushdown-exercise-illustration.jpg',
  'Skull Crushers': 'https://spotebi.com/wp-content/uploads/2015/10/skull-crushers-exercise-illustration.jpg',

  // Calves
  'Standing Calf Raise': 'https://spotebi.com/wp-content/uploads/2014/10/standing-calf-raises-exercise-illustration.jpg',
  'Seated Calf Raise': 'https://spotebi.com/wp-content/uploads/2015/06/seated-calf-raise-exercise-illustration.jpg',

  // Leg Extension
  'Leg Extension': 'https://spotebi.com/wp-content/uploads/2016/01/leg-extension-exercise-illustration.jpg',

  // Corrective / Mobility
  'Cat-Cow': 'https://spotebi.com/wp-content/uploads/2016/06/cat-cow-pose-marjaryasana-bitilasana-spotebi.jpg',
  'Clamshells': 'https://spotebi.com/wp-content/uploads/2016/08/clamshell-exercise-illustration.jpg',
  'Connection Breath': 'https://spotebi.com/wp-content/uploads/2016/02/superman-exercise-illustration-spotebi.jpg',
  'Diaphragmatic Breathing': 'https://spotebi.com/wp-content/uploads/2016/02/superman-exercise-illustration-spotebi.jpg',
  'Pelvic Floor Activation': 'https://spotebi.com/wp-content/uploads/2015/01/glute-bridge-exercise-illustration.jpg',
  'Deep Squat Hold': 'https://spotebi.com/wp-content/uploads/2014/10/squat-exercise-illustration.jpg',
  'Happy Baby Stretch': 'https://spotebi.com/wp-content/uploads/2016/06/happy-baby-pose-ananda-balasana-spotebi.jpg',
  'Pelvic Tilts': 'https://spotebi.com/wp-content/uploads/2015/01/glute-bridge-exercise-illustration.jpg',
  'Bridge with Ball Squeeze': 'https://spotebi.com/wp-content/uploads/2015/01/glute-bridge-exercise-illustration.jpg',
  'Bird Dog (Modified)': 'https://spotebi.com/wp-content/uploads/2014/10/bird-dogs-exercise-illustration.jpg',
  'Squat to Stand': 'https://spotebi.com/wp-content/uploads/2014/10/squat-exercise-illustration.jpg',
  'Dead Bug Heel Slides': 'https://spotebi.com/wp-content/uploads/2015/05/dead-bug-exercise-illustration.jpg',
  'Toe Taps': 'https://spotebi.com/wp-content/uploads/2015/05/dead-bug-exercise-illustration.jpg',
  'Supine Marching': 'https://spotebi.com/wp-content/uploads/2015/05/dead-bug-exercise-illustration.jpg',
  'Dead Bug Progression': 'https://spotebi.com/wp-content/uploads/2015/05/dead-bug-exercise-illustration.jpg',
  'Pallof Press (Kneeling)': 'https://spotebi.com/wp-content/uploads/2016/08/pallof-press-exercise-illustration.jpg',
  'Side Plank (Modified)': 'https://spotebi.com/wp-content/uploads/2014/10/side-plank-exercise-illustration.jpg',
  'Bear Hold': 'https://spotebi.com/wp-content/uploads/2014/10/bird-dogs-exercise-illustration.jpg',
  'Wall Sit with Breathing': 'https://spotebi.com/wp-content/uploads/2015/05/wall-sit-exercise-illustration.jpg',
  'Seated Knee Lifts': 'https://spotebi.com/wp-content/uploads/2015/05/dead-bug-exercise-illustration.jpg',
  'Standing Leg Curl': 'https://spotebi.com/wp-content/uploads/2015/05/lying-hamstring-curls-exercise-illustration.jpg',
  'Side Lying Leg Lift': 'https://spotebi.com/wp-content/uploads/2015/08/side-lying-leg-lift-exercise-illustration.jpg',
  'Modified Squat': 'https://spotebi.com/wp-content/uploads/2014/10/squat-exercise-illustration.jpg',
  'Standing Hip Circles': 'https://spotebi.com/wp-content/uploads/2015/05/standing-hip-circles-exercise-illustration.jpg',
  'Shoulder Blade Squeeze': 'https://spotebi.com/wp-content/uploads/2015/10/shoulder-squeeze-exercise-illustration.jpg',
  'Standing March': 'https://spotebi.com/wp-content/uploads/2015/05/marching-in-place-exercise-illustration.jpg',

  // Bodyweight advanced
  'Archer Row': 'https://spotebi.com/wp-content/uploads/2014/10/dumbbell-row-exercise-illustration.jpg',
  'One-Arm Inverted Row': 'https://spotebi.com/wp-content/uploads/2014/10/dumbbell-row-exercise-illustration.jpg',
  'Inverted Row (Feet Elevated)': 'https://spotebi.com/wp-content/uploads/2016/01/inverted-row-exercise-illustration.jpg',
  'Deficit Push-up': 'https://spotebi.com/wp-content/uploads/2014/10/push-up-exercise-illustration.jpg',
  'One-Arm Push-up (Assisted)': 'https://spotebi.com/wp-content/uploads/2016/03/one-arm-tricep-push-up-exercise-illustration-spotebi.jpg',
  // NOTA: Immagini rimosse perché usavano Pike Push-up per esercizi diversi (SBAGLIATO)
  // 'Elevated Pike Push-up': l'utente ha i piedi su un rialzo, non è uguale a Pike standard
  // 'Pike Push-up (Knee)': variante non usata nel sistema
  // 'Wall Shoulder Tap': è un esercizio completamente diverso dal Pike
  'Pistol Squat (Assisted)': 'https://spotebi.com/wp-content/uploads/2015/07/skater-squats-exercise-illustration.jpg',
  'Band Row': 'https://spotebi.com/wp-content/uploads/2016/01/seated-cable-row-exercise-illustration.jpg',
  'Single Leg RDL (Bodyweight)': 'https://spotebi.com/wp-content/uploads/2015/04/single-leg-deadlift-exercise-illustration.jpg',
};

/**
 * Lista esercizi che hanno immagini statiche (non video)
 * Include sia esercizi isometrici che test screening
 */
export const STATIC_EXERCISES = [
  // =====================================================
  // CORE ISOMETRICO
  // =====================================================
  'Plank',
  'Side Plank',
  'Side Plank (Left)',
  'Side Plank (Right)',
  'Bird Dog',
  'Bird Dogs',
  'Dead Bug',
  'Superman',
  'Superman Hold',
  'Hollow Body Hold',
  'Hollow Body',
  'Wall Sit',
  'Glute Bridge',
  'Glute Bridge Hold',
  'Dragon Flag',

  // =====================================================
  // YOGA / STRETCHING
  // =====================================================
  'Pigeon Pose',
  'Side Plank Pose',
  'Vasisthasana',
  'L-Sit',
  'L-Sit Hold',
  'Full L-sit',
  'Tuck L-sit',
  'One Leg L-sit',
  'Hip Stretch',
  'Seated Forward Fold',
  'Baddha Konasana',
  'Butterfly Stretch',

  // =====================================================
  // TEST SCREENING - LOWER BODY PUSH (SQUAT)
  // =====================================================
  'Air Squat',
  'Squat',
  'Bodyweight Squat',
  'Squat Assistito',
  'Squat Assistito (con supporto)',
  'Jump Squat',
  'Bulgarian Split Squat',
  'Pistol Squat',
  'Shrimp Squat',

  // =====================================================
  // TEST SCREENING - HORIZONTAL PUSH (PUSH-UP)
  // =====================================================
  'Push-up',
  'Push-up Standard',
  'Standard Push-up',
  'Wall Push-up',
  'Incline Push-up',
  'Incline Push-up (rialzato)',
  'Push-up su Ginocchia',
  'Knee Push-up',
  'Diamond Push-up',
  'Archer Push-up',
  'Pseudo Planche Push-up',
  'One Arm Push-up',
  'Decline Push-up',

  // =====================================================
  // TEST SCREENING - VERTICAL PUSH (PIKE → HSPU)
  // NOTA: La maggior parte usa VIDEO nei test iniziali
  // =====================================================
  // 'Pike Push-up' → VIDEO: pike-push-up.mp4
  // 'Wall HSPU' → VIDEO: wall-handstand-push-up.mp4
  // 'Freestanding HSPU' → VIDEO: wall-handstand-push-up.mp4
  'Elevated Pike Push-up', // Solo questo usa immagine (da cercare)
  'Wall Walk', // Solo questo usa immagine (da cercare)

  // =====================================================
  // TEST SCREENING - VERTICAL PULL (ROW → PULL-UP)
  // =====================================================
  'Inverted Row',
  'Inverted Row (barra alta)',
  'Inverted Row (barra media)',
  'Inverted Row (barra bassa)',
  'Pull-up',
  'Pull-up Standard',
  'Negative Pull-up',
  'Negative Pull-up (solo eccentrica)',
  'Band-Assisted Pull-up',
  'Archer Pull-up',
  'One Arm Pull-up Progression',
  'Chin-up',
  'Chin-up Standard',

  // =====================================================
  // TEST SCREENING - LOWER BODY PULL (HINGE/HAMSTRING)
  // =====================================================
  'Single Leg Glute Bridge',
  'Single Leg RDL (corpo libero)',
  'Single Leg Deadlift',
  'Nordic Curl',
  'Nordic Curl (solo eccentrica)',
  'Nordic Curl (completo)',
  'Sliding Leg Curl',
];

/**
 * Controlla se un esercizio è statico (usa immagine invece di video)
 */
export function isStaticExercise(exerciseName: string): boolean {
  const normalized = exerciseName.toLowerCase();
  return STATIC_EXERCISES.some(ex => ex.toLowerCase() === normalized);
}

/**
 * Ottieni URL immagine per un esercizio
 * Prima prova Supabase, poi fallback a fonte esterna
 */
export function getExerciseImageUrl(exerciseName: string): string | null {
  // Normalizza il nome per matching
  const normalizedName = exerciseName.trim();

  // Check mapping diretto
  if (EXERCISE_IMAGES[normalizedName]) {
    return EXERCISE_IMAGES[normalizedName].url;
  }

  // Check varianti comuni
  for (const [key, value] of Object.entries(EXERCISE_IMAGES)) {
    if (key.toLowerCase() === normalizedName.toLowerCase()) {
      return value.url;
    }
  }

  return null;
}

/**
 * Ottieni URL fallback (fonte esterna) per un esercizio
 */
export function getExerciseImageFallback(exerciseName: string): string | null {
  const normalizedName = exerciseName.trim();

  if (EXERCISE_IMAGE_FALLBACKS[normalizedName]) {
    return EXERCISE_IMAGE_FALLBACKS[normalizedName];
  }

  // Check case-insensitive
  for (const [key, value] of Object.entries(EXERCISE_IMAGE_FALLBACKS)) {
    if (key.toLowerCase() === normalizedName.toLowerCase()) {
      return value;
    }
  }

  return null;
}

/**
 * Ottieni URL immagine con fallback automatico
 * Utile per UI: prova Supabase, poi esterno
 */
export function getExerciseImageWithFallback(exerciseName: string): string | null {
  return getExerciseImageUrl(exerciseName) || getExerciseImageFallback(exerciseName);
}

/**
 * Genera lista per upload su Supabase
 */
export function generateImageUploadList(): Array<{
  exercise: string;
  sourceUrl: string;
  targetFileName: string;
}> {
  return Object.entries(EXERCISE_IMAGE_FALLBACKS).map(([exercise, sourceUrl]) => {
    const extension = sourceUrl.includes('.svg') ? 'svg' :
                     sourceUrl.includes('.png') ? 'png' : 'jpg';
    const fileName = exercise
      .toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      + '.' + extension;

    return {
      exercise,
      sourceUrl,
      targetFileName: fileName
    };
  });
}
