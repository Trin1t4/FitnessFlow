/**
 * WEEKLY VOLUME TRACKER - TrainSmart
 * 
 * Traccia le serie settimanali per gruppo muscolare.
 * Basato su raccomandazioni scientifiche per ipertrofia.
 * 
 * VOLUME LANDMARKS (Schoenfeld et al., 2017):
 * - Minimum Effective Volume (MEV): ~10 serie/settimana
 * - Maximum Adaptive Volume (MAV): ~15-20 serie/settimana
 * - Maximum Recoverable Volume (MRV): ~20-25 serie/settimana
 * 
 * REFERENCE:
 * - Schoenfeld BJ et al. (2017) - Dose-response relationship
 * - Israetel M (2019) - Scientific Principles of Hypertrophy Training
 */

// ============================================================================
// TYPES
// ============================================================================

export type VolumeStatus = 'insufficient' | 'minimum' | 'optimal' | 'high' | 'excessive';

export interface VolumeThresholds {
  min: number;      // MEV - Minimum Effective Volume
  optimal: number;  // Sweet spot for most people
  high: number;     // Upper limit for most
  max: number;      // MRV - Maximum Recoverable Volume
}

export interface MuscleGroupVolume {
  muscleGroup: string;
  muscleGroupIt: string;
  weeklySets: number;
  directSets: number;
  indirectSets: number;
  status: VolumeStatus;
  recommendation: string;
  recommendationIt: string;
  percentOfOptimal: number;
}

export interface VolumeAnalysis {
  totalWeeklySets: number;
  muscleGroups: MuscleGroupVolume[];
  overallStatus: VolumeStatus;
  summary: string;
  summaryIt: string;
  priorityActions: string[];
  priorityActionsIt: string[];
}

export interface ExerciseVolumeContribution {
  exerciseName: string;
  pattern: string;
  sets: number;
  contributions: Record<string, number>; // muscle -> sets credited
}

// ============================================================================
// VOLUME THRESHOLDS BY MUSCLE GROUP
// ============================================================================

/**
 * Soglie di volume settimanale per gruppo muscolare
 * Valori calibrati su soggetti natural con allenamento per ipertrofia
 */
export const VOLUME_THRESHOLDS: Record<string, VolumeThresholds & { nameIt: string }> = {
  chest: { 
    min: 10, optimal: 14, high: 18, max: 22,
    nameIt: 'Petto'
  },
  back: { 
    min: 10, optimal: 16, high: 22, max: 26,
    nameIt: 'Schiena'
  },
  shoulders: { 
    min: 8, optimal: 12, high: 16, max: 20,
    nameIt: 'Spalle'
  },
  biceps: { 
    min: 6, optimal: 10, high: 14, max: 18,
    nameIt: 'Bicipiti'
  },
  triceps: { 
    min: 6, optimal: 10, high: 14, max: 18,
    nameIt: 'Tricipiti'
  },
  quads: { 
    min: 10, optimal: 14, high: 18, max: 22,
    nameIt: 'Quadricipiti'
  },
  hamstrings: { 
    min: 8, optimal: 12, high: 16, max: 20,
    nameIt: 'Femorali'
  },
  glutes: { 
    min: 8, optimal: 12, high: 16, max: 22,
    nameIt: 'Glutei'
  },
  calves: { 
    min: 8, optimal: 12, high: 16, max: 20,
    nameIt: 'Polpacci'
  },
  core: { 
    min: 4, optimal: 8, high: 12, max: 16,
    nameIt: 'Core'
  },
  forearms: {
    min: 4, optimal: 8, high: 12, max: 16,
    nameIt: 'Avambracci'
  }
};

// ============================================================================
// PATTERN TO MUSCLE MAPPING
// ============================================================================

/**
 * Mappa i pattern di movimento ai gruppi muscolari
 * - primary: credito pieno (1.0x)
 * - secondary: credito parziale (0.5x)
 */
export const PATTERN_MUSCLE_MAP: Record<string, { 
  primary: string[]; 
  secondary: string[];
}> = {
  horizontal_push: {
    primary: ['chest', 'shoulders', 'triceps'],
    secondary: []
  },
  vertical_push: {
    primary: ['shoulders', 'triceps'],
    secondary: ['chest'] // parte alta del petto
  },
  horizontal_pull: {
    primary: ['back', 'biceps'],
    secondary: ['forearms']
  },
  vertical_pull: {
    primary: ['back', 'biceps'],
    secondary: ['forearms']
  },
  lower_push: {
    primary: ['quads', 'glutes'],
    secondary: ['calves', 'core']
  },
  lower_pull: {
    primary: ['hamstrings', 'glutes'],
    secondary: ['back'] // erector spinae
  },
  core: {
    primary: ['core'],
    secondary: []
  },
  isolation_biceps: {
    primary: ['biceps'],
    secondary: ['forearms']
  },
  isolation_triceps: {
    primary: ['triceps'],
    secondary: []
  },
  isolation_shoulders: {
    primary: ['shoulders'],
    secondary: []
  },
  isolation_calves: {
    primary: ['calves'],
    secondary: []
  }
};

// ============================================================================
// EXERCISE NAME TO PATTERN INFERENCE
// ============================================================================

/**
 * Inferisce il pattern di movimento dal nome dell'esercizio
 */
function inferPatternFromExercise(name: string): string {
  const nameLower = name.toLowerCase();
  
  // Core
  if (nameLower.includes('plank') || nameLower.includes('crunch') || 
      nameLower.includes('ab') || nameLower.includes('dead bug') ||
      nameLower.includes('bird dog') || nameLower.includes('hollow')) {
    return 'core';
  }
  
  // Lower Push
  if (nameLower.includes('squat') || nameLower.includes('leg press') || 
      nameLower.includes('lunge') || nameLower.includes('affondo') ||
      nameLower.includes('leg extension') || nameLower.includes('step')) {
    return 'lower_push';
  }
  
  // Lower Pull
  if (nameLower.includes('deadlift') || nameLower.includes('stacco') ||
      nameLower.includes('leg curl') || nameLower.includes('hip thrust') ||
      nameLower.includes('glute bridge') || nameLower.includes('good morning') ||
      nameLower.includes('romanian') || nameLower.includes('rdl')) {
    return 'lower_pull';
  }
  
  // Horizontal Push
  if (nameLower.includes('bench') || nameLower.includes('panca') ||
      nameLower.includes('push-up') || nameLower.includes('pushup') ||
      nameLower.includes('chest press') || nameLower.includes('fly') ||
      nameLower.includes('croci') || nameLower.includes('dip')) {
    return 'horizontal_push';
  }
  
  // Vertical Push
  if (nameLower.includes('press') && (nameLower.includes('overhead') || 
      nameLower.includes('military') || nameLower.includes('shoulder'))) {
    return 'vertical_push';
  }
  if (nameLower.includes('pike') || nameLower.includes('handstand')) {
    return 'vertical_push';
  }
  
  // Horizontal Pull
  if (nameLower.includes('row') || nameLower.includes('rematore') ||
      nameLower.includes('inverted')) {
    return 'horizontal_pull';
  }
  
  // Vertical Pull
  if (nameLower.includes('pull-up') || nameLower.includes('pullup') ||
      nameLower.includes('chin-up') || nameLower.includes('chinup') ||
      nameLower.includes('lat') || nameLower.includes('pulldown') ||
      nameLower.includes('trazione')) {
    return 'vertical_pull';
  }
  
  // Isolation
  if (nameLower.includes('curl') && !nameLower.includes('leg')) {
    return 'isolation_biceps';
  }
  if (nameLower.includes('tricep') || nameLower.includes('french') || 
      nameLower.includes('skull') || nameLower.includes('pushdown')) {
    return 'isolation_triceps';
  }
  if (nameLower.includes('raise') || nameLower.includes('alzate') ||
      nameLower.includes('face pull')) {
    return 'isolation_shoulders';
  }
  if (nameLower.includes('calf') || nameLower.includes('polpacci')) {
    return 'isolation_calves';
  }
  
  return 'core'; // fallback
}

// ============================================================================
// VOLUME CALCULATION
// ============================================================================

/**
 * Calcola il volume settimanale per gruppo muscolare da un programma
 */
export function calculateWeeklyVolume(
  program: any
): Record<string, { direct: number; indirect: number; total: number }> {
  const volumeByMuscle: Record<string, { direct: number; indirect: number; total: number }> = {};
  
  // Inizializza tutti i gruppi muscolari
  Object.keys(VOLUME_THRESHOLDS).forEach(muscle => {
    volumeByMuscle[muscle] = { direct: 0, indirect: 0, total: 0 };
  });
  
  // Estrai i giorni del programma (supporta entrambe le strutture)
  const days = program.weekly_split?.days || program.weekly_schedule || [];
  
  for (const day of days) {
    const exercises = day.exercises || [];
    
    for (const exercise of exercises) {
      // Determina il pattern
      const pattern = exercise.pattern || inferPatternFromExercise(exercise.name || '');
      const muscleMapping = PATTERN_MUSCLE_MAP[pattern];
      
      if (!muscleMapping) continue;
      
      // Determina il numero di serie
      const sets = typeof exercise.sets === 'number' 
        ? exercise.sets 
        : parseInt(String(exercise.sets)) || 3;
      
      // Credito pieno per muscoli primari
      for (const muscle of muscleMapping.primary) {
        if (volumeByMuscle[muscle]) {
          volumeByMuscle[muscle].direct += sets;
          volumeByMuscle[muscle].total += sets;
        }
      }
      
      // Credito parziale per muscoli secondari (50%)
      for (const muscle of muscleMapping.secondary) {
        if (volumeByMuscle[muscle]) {
          volumeByMuscle[muscle].indirect += sets * 0.5;
          volumeByMuscle[muscle].total += sets * 0.5;
        }
      }
    }
  }
  
  return volumeByMuscle;
}

/**
 * Determina lo status del volume per un gruppo muscolare
 */
function getVolumeStatus(sets: number, thresholds: VolumeThresholds): VolumeStatus {
  if (sets < thresholds.min * 0.7) return 'insufficient';
  if (sets < thresholds.min) return 'minimum';
  if (sets <= thresholds.optimal * 1.1) return 'optimal';
  if (sets <= thresholds.max) return 'high';
  return 'excessive';
}

/**
 * Genera raccomandazione basata sullo status
 */
function generateRecommendation(
  muscleGroup: string, 
  status: VolumeStatus, 
  currentSets: number,
  thresholds: VolumeThresholds
): { en: string; it: string } {
  const nameIt = VOLUME_THRESHOLDS[muscleGroup]?.nameIt || muscleGroup;
  
  switch (status) {
    case 'insufficient':
      const addSets = Math.ceil(thresholds.min - currentSets);
      return {
        en: `Add ${addSets}+ sets/week for ${muscleGroup} - currently undertrained`,
        it: `Aggiungi ${addSets}+ serie/settimana per ${nameIt} - volume insufficiente`
      };
    case 'minimum':
      return {
        en: `${muscleGroup} is at minimum volume - consider adding 2-4 sets`,
        it: `${nameIt} al volume minimo - considera aggiungere 2-4 serie`
      };
    case 'optimal':
      return {
        en: `${muscleGroup} volume is optimal - maintain current load`,
        it: `Volume ${nameIt} ottimale - mantieni il carico attuale`
      };
    case 'high':
      return {
        en: `${muscleGroup} volume is high - monitor recovery closely`,
        it: `Volume ${nameIt} alto - monitora il recupero`
      };
    case 'excessive':
      const reduceSets = Math.ceil(currentSets - thresholds.max);
      return {
        en: `${muscleGroup} volume is excessive - reduce by ${reduceSets} sets to avoid overtraining`,
        it: `Volume ${nameIt} eccessivo - riduci ${reduceSets} serie per evitare sovrallenamento`
      };
  }
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analizza il volume settimanale completo di un programma
 */
export function analyzeWeeklyVolume(program: any): VolumeAnalysis {
  const volumeByMuscle = calculateWeeklyVolume(program);
  const muscleGroups: MuscleGroupVolume[] = [];
  
  let totalSets = 0;
  let undertrainedCount = 0;
  let overtrainedCount = 0;
  
  for (const [muscle, volume] of Object.entries(volumeByMuscle)) {
    const thresholds = VOLUME_THRESHOLDS[muscle];
    if (!thresholds) continue;
    
    const status = getVolumeStatus(volume.total, thresholds);
    const rec = generateRecommendation(muscle, status, volume.total, thresholds);
    
    muscleGroups.push({
      muscleGroup: muscle,
      muscleGroupIt: thresholds.nameIt,
      weeklySets: Math.round(volume.total * 10) / 10,
      directSets: Math.round(volume.direct * 10) / 10,
      indirectSets: Math.round(volume.indirect * 10) / 10,
      status,
      recommendation: rec.en,
      recommendationIt: rec.it,
      percentOfOptimal: Math.round((volume.total / thresholds.optimal) * 100)
    });
    
    totalSets += volume.total;
    
    if (status === 'insufficient' || status === 'minimum') undertrainedCount++;
    if (status === 'excessive') overtrainedCount++;
  }
  
  // Sort by status priority (problems first)
  const statusPriority: Record<VolumeStatus, number> = {
    insufficient: 0,
    excessive: 1,
    minimum: 2,
    high: 3,
    optimal: 4
  };
  muscleGroups.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
  
  // Determine overall status
  let overallStatus: VolumeStatus;
  if (overtrainedCount > 0) {
    overallStatus = 'excessive';
  } else if (undertrainedCount >= 3) {
    overallStatus = 'insufficient';
  } else if (undertrainedCount > 0) {
    overallStatus = 'minimum';
  } else if (muscleGroups.some(m => m.status === 'high')) {
    overallStatus = 'high';
  } else {
    overallStatus = 'optimal';
  }
  
  // Generate priority actions
  const priorityActions: string[] = [];
  const priorityActionsIt: string[] = [];
  
  muscleGroups
    .filter(m => m.status === 'insufficient' || m.status === 'excessive')
    .slice(0, 3)
    .forEach(m => {
      priorityActions.push(m.recommendation);
      priorityActionsIt.push(m.recommendationIt);
    });
  
  // Generate summary
  const summary = overallStatus === 'optimal'
    ? `Volume distribution is well-balanced with ${Math.round(totalSets)} total sets/week`
    : overallStatus === 'excessive'
    ? `Some muscle groups are overtrained - consider reducing volume for recovery`
    : `Some muscle groups need more volume - ${undertrainedCount} groups below minimum`;
  
  const summaryIt = overallStatus === 'optimal'
    ? `Distribuzione volume bilanciata con ${Math.round(totalSets)} serie totali/settimana`
    : overallStatus === 'excessive'
    ? `Alcuni gruppi muscolari sono sovrallenati - considera ridurre il volume`
    : `Alcuni gruppi muscolari necessitano più volume - ${undertrainedCount} gruppi sotto il minimo`;
  
  return {
    totalWeeklySets: Math.round(totalSets),
    muscleGroups,
    overallStatus,
    summary,
    summaryIt,
    priorityActions,
    priorityActionsIt
  };
}

/**
 * Calcola quanto contribuisce ogni esercizio al volume
 */
export function getExerciseContributions(program: any): ExerciseVolumeContribution[] {
  const contributions: ExerciseVolumeContribution[] = [];
  const days = program.weekly_split?.days || program.weekly_schedule || [];
  
  for (const day of days) {
    for (const exercise of (day.exercises || [])) {
      const pattern = exercise.pattern || inferPatternFromExercise(exercise.name || '');
      const mapping = PATTERN_MUSCLE_MAP[pattern];
      const sets = typeof exercise.sets === 'number' ? exercise.sets : 3;
      
      const muscleContributions: Record<string, number> = {};
      
      if (mapping) {
        mapping.primary.forEach(m => { muscleContributions[m] = sets; });
        mapping.secondary.forEach(m => { muscleContributions[m] = sets * 0.5; });
      }
      
      contributions.push({
        exerciseName: exercise.name,
        pattern,
        sets,
        contributions: muscleContributions
      });
    }
  }
  
  return contributions;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const WeeklyVolumeTracker = {
  calculateWeeklyVolume,
  analyzeWeeklyVolume,
  getExerciseContributions,
  VOLUME_THRESHOLDS,
  PATTERN_MUSCLE_MAP
};

export default WeeklyVolumeTracker;
