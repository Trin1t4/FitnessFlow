/**
 * Unified Wellness Service
 *
 * Gestisce:
 * - Assessment wellness pre-workout (sonno, stress, fatica)
 * - Calcolo workout readiness score
 * - Pain tracking e adattamenti in-workout
 * - Suggerimenti automatici basati su stato wellness
 *
 * @module unifiedWellnessService
 */

// ============================================
// TYPES
// ============================================

export interface WellnessAssessment {
  sleepHours: number;          // 0-12+
  sleepQuality: number;        // 1-5
  stressLevel: number;         // 1-5 (1=low, 5=high)
  fatigueLevel: number;        // 1-5 (1=fresh, 5=exhausted)
  motivationLevel?: number;    // 1-5
  musclesSoreness?: number;    // 1-5
  nutritionQuality?: number;   // 1-5
  hydrationLevel?: number;     // 1-5
  painAreas?: PainArea[];
  assessedAt: string;
}

export interface PainArea {
  area: string;
  severity: number;  // 1-10
  type?: 'acute' | 'chronic' | 'doms';
}

export interface WorkoutReadiness {
  score: number;                // 0-100
  category: 'optimal' | 'good' | 'moderate' | 'low' | 'rest_recommended';
  volumeMultiplier: number;     // 0.5 - 1.2
  intensityMultiplier: number;  // 0.7 - 1.1
  recommendations: string[];
  warnings: string[];
  painRestrictions: PainRestriction[];
}

export interface PainRestriction {
  area: string;
  severity: number;
  avoidPatterns: string[];
  modifyPatterns: string[];
  suggestion: string;
}

export interface PainEvent {
  exerciseName: string;
  exercisePattern: string;
  setNumber: number;
  painArea: string;
  painLevel: number;  // 1-10
  weight?: number;
  occurredAt: string;
}

export interface WorkoutAdaptation {
  type: 'stop_exercise' | 'reduce_weight' | 'reduce_reps' | 'substitute' | 'skip_remaining';
  reason: string;
  suggestion: string;
  substitute?: string;
  newWeight?: number;
  newReps?: number;
}

export interface SessionWellnessData {
  userId: string;
  sessionId: string;
  preWorkoutAssessment: WellnessAssessment;
  readinessScore: number;
  painEvents: PainEvent[];
  adaptationsApplied: WorkoutAdaptation[];
  completedAt?: string;
}

// ============================================
// CONSTANTS
// ============================================

let supabaseClient: any = null;

const SLEEP_OPTIMAL = 7.5;
const SLEEP_MINIMUM = 5;

const PAIN_THRESHOLD_WARNING = 4;
const PAIN_THRESHOLD_STOP = 7;

// Pattern affected by pain areas
const PAIN_PATTERN_MAP: Record<string, { avoid: string[]; modify: string[] }> = {
  'shoulder': {
    avoid: ['vertical_push', 'horizontal_push'],
    modify: ['vertical_pull', 'horizontal_pull']
  },
  'lower_back': {
    avoid: ['lower_pull'],
    modify: ['lower_push', 'core']
  },
  'knee': {
    avoid: ['lower_push'],
    modify: ['lower_pull']
  },
  'wrist': {
    avoid: ['horizontal_push'],
    modify: ['vertical_push', 'horizontal_pull']
  },
  'elbow': {
    avoid: ['horizontal_push', 'vertical_pull'],
    modify: ['horizontal_pull']
  },
  'hip': {
    avoid: ['lower_push', 'lower_pull'],
    modify: ['core']
  },
  'neck': {
    avoid: ['vertical_push'],
    modify: ['horizontal_push', 'core']
  },
  'ankle': {
    avoid: ['lower_push'],
    modify: ['lower_pull']
  }
};

// ============================================
// INITIALIZATION
// ============================================

export function initWellnessService(client: any): void {
  supabaseClient = client;
}

// ============================================
// WELLNESS SCORE CALCULATION
// ============================================

/**
 * Calcola score wellness (0-100)
 */
export function calculateWellnessScore(assessment: WellnessAssessment): number {
  const {
    sleepHours,
    sleepQuality,
    stressLevel,
    fatigueLevel,
    motivationLevel = 3,
    musclesSoreness = 2,
    nutritionQuality = 3,
    hydrationLevel = 3
  } = assessment;

  // Sleep score (0-25 points)
  let sleepScore = 0;
  if (sleepHours >= SLEEP_OPTIMAL) {
    sleepScore = 20;
  } else if (sleepHours >= SLEEP_MINIMUM) {
    sleepScore = 10 + ((sleepHours - SLEEP_MINIMUM) / (SLEEP_OPTIMAL - SLEEP_MINIMUM)) * 10;
  } else {
    sleepScore = (sleepHours / SLEEP_MINIMUM) * 10;
  }
  sleepScore += (sleepQuality / 5) * 5; // +0-5 for quality

  // Stress score (0-20 points) - inverted
  const stressScore = ((6 - stressLevel) / 5) * 20;

  // Fatigue score (0-20 points) - inverted
  const fatigueScore = ((6 - fatigueLevel) / 5) * 20;

  // Motivation score (0-15 points)
  const motivationScore = (motivationLevel / 5) * 15;

  // Soreness score (0-10 points) - inverted
  const sorenessScore = ((6 - musclesSoreness) / 5) * 10;

  // Nutrition & hydration (0-10 points)
  const nutritionHydrationScore = ((nutritionQuality + hydrationLevel) / 10) * 10;

  const totalScore = Math.round(
    sleepScore + stressScore + fatigueScore + motivationScore + sorenessScore + nutritionHydrationScore
  );

  return Math.min(100, Math.max(0, totalScore));
}

/**
 * Calcola workout readiness completo
 */
export function calculateWorkoutReadiness(assessment: WellnessAssessment): WorkoutReadiness {
  const score = calculateWellnessScore(assessment);

  // Determina categoria
  let category: WorkoutReadiness['category'];
  let volumeMultiplier: number;
  let intensityMultiplier: number;

  if (score >= 80) {
    category = 'optimal';
    volumeMultiplier = 1.1;
    intensityMultiplier = 1.05;
  } else if (score >= 65) {
    category = 'good';
    volumeMultiplier = 1.0;
    intensityMultiplier = 1.0;
  } else if (score >= 50) {
    category = 'moderate';
    volumeMultiplier = 0.85;
    intensityMultiplier = 0.95;
  } else if (score >= 35) {
    category = 'low';
    volumeMultiplier = 0.7;
    intensityMultiplier = 0.85;
  } else {
    category = 'rest_recommended';
    volumeMultiplier = 0.5;
    intensityMultiplier = 0.7;
  }

  // Genera raccomandazioni
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (assessment.sleepHours < SLEEP_MINIMUM) {
    warnings.push('Sonno insufficiente - considera riposo attivo');
  } else if (assessment.sleepHours < SLEEP_OPTIMAL) {
    recommendations.push('Prossime notti cerca di dormire di piu');
  }

  if (assessment.stressLevel >= 4) {
    warnings.push('Stress elevato - evita carichi massimali');
    volumeMultiplier *= 0.9;
  }

  if (assessment.fatigueLevel >= 4) {
    warnings.push('Fatica accumulata - riduci volume');
    volumeMultiplier *= 0.85;
  }

  if (category === 'optimal') {
    recommendations.push('Ottimo stato! Puoi spingere oggi');
  } else if (category === 'moderate') {
    recommendations.push('Allenamento moderato consigliato');
  } else if (category === 'rest_recommended') {
    recommendations.push('Valuta riposo o attivita leggera (camminata, stretching)');
  }

  // Processa pain areas
  const painRestrictions: PainRestriction[] = [];

  if (assessment.painAreas) {
    for (const pain of assessment.painAreas) {
      const restriction = processPainArea(pain);
      if (restriction) {
        painRestrictions.push(restriction);

        if (pain.severity >= PAIN_THRESHOLD_STOP) {
          warnings.push(`Dolore ${pain.area} elevato (${pain.severity}/10) - evita esercizi che lo sollecitano`);
        } else if (pain.severity >= PAIN_THRESHOLD_WARNING) {
          recommendations.push(`Attenzione a ${pain.area} - modifica se necessario`);
        }
      }
    }
  }

  return {
    score,
    category,
    volumeMultiplier: Math.round(volumeMultiplier * 100) / 100,
    intensityMultiplier: Math.round(intensityMultiplier * 100) / 100,
    recommendations,
    warnings,
    painRestrictions
  };
}

/**
 * Processa un'area di dolore
 */
function processPainArea(pain: PainArea): PainRestriction | null {
  const mapping = PAIN_PATTERN_MAP[pain.area.toLowerCase()];
  if (!mapping) return null;

  let avoidPatterns: string[] = [];
  let modifyPatterns: string[] = [];
  let suggestion: string;

  if (pain.severity >= PAIN_THRESHOLD_STOP) {
    avoidPatterns = mapping.avoid;
    modifyPatterns = mapping.modify;
    suggestion = `Evita completamente ${mapping.avoid.join(', ')}. Modifica con cautela ${mapping.modify.join(', ')}.`;
  } else if (pain.severity >= PAIN_THRESHOLD_WARNING) {
    modifyPatterns = [...mapping.avoid, ...mapping.modify];
    suggestion = `Procedi con cautela su ${modifyPatterns.join(', ')}. Ferma se il dolore aumenta.`;
  } else {
    return null;
  }

  return {
    area: pain.area,
    severity: pain.severity,
    avoidPatterns,
    modifyPatterns,
    suggestion
  };
}

// ============================================
// PAIN EVENT HANDLING
// ============================================

/**
 * Processa un evento di dolore durante il workout
 */
export function processPainEvent(
  event: PainEvent,
  currentReadiness: WorkoutReadiness,
  previousEvents: PainEvent[] = []
): WorkoutAdaptation | null {
  const { painLevel, exerciseName, exercisePattern, weight } = event;

  // Conta eventi precedenti per questo esercizio
  const sameExerciseEvents = previousEvents.filter(
    e => e.exerciseName === exerciseName
  );

  // Dolore severo (>= 7): stop immediato
  if (painLevel >= PAIN_THRESHOLD_STOP) {
    return {
      type: 'stop_exercise',
      reason: `Dolore ${painLevel}/10 - troppo alto per continuare`,
      suggestion: `Ferma ${exerciseName}. Se il dolore persiste, salta gli esercizi simili.`
    };
  }

  // Dolore ricorrente (3+ eventi stesso esercizio): sostituisci
  if (sameExerciseEvents.length >= 2) {
    const substitute = getSafeSubstitute(exercisePattern, event.painArea);
    return {
      type: 'substitute',
      reason: 'Dolore ricorrente su questo esercizio',
      suggestion: substitute
        ? `Sostituisci con ${substitute}`
        : 'Salta questo esercizio per oggi',
      substitute
    };
  }

  // Dolore moderato (4-6): riduci carico
  if (painLevel >= PAIN_THRESHOLD_WARNING) {
    if (weight && weight > 0) {
      const newWeight = Math.round(weight * 0.8);
      return {
        type: 'reduce_weight',
        reason: `Dolore ${painLevel}/10 - riduci carico`,
        suggestion: `Riduci a ${newWeight}kg (-20%)`,
        newWeight
      };
    } else {
      return {
        type: 'reduce_reps',
        reason: `Dolore ${painLevel}/10 - riduci volume`,
        suggestion: 'Riduci le ripetizioni del 20-30%',
        newReps: -3
      };
    }
  }

  // Dolore leggero (1-3): monitora
  return null;
}

/**
 * Verifica se un esercizio deve essere modificato in base al readiness
 */
export function shouldModifyExercise(
  exerciseName: string,
  pattern: string,
  readiness: WorkoutReadiness
): { modify: boolean; suggestion?: string } {
  // Check pain restrictions
  for (const restriction of readiness.painRestrictions) {
    if (restriction.avoidPatterns.includes(pattern)) {
      return {
        modify: true,
        suggestion: `Salta ${exerciseName} - ${restriction.suggestion}`
      };
    }
    if (restriction.modifyPatterns.includes(pattern)) {
      return {
        modify: true,
        suggestion: `Modifica ${exerciseName} - procedi con cautela`
      };
    }
  }

  // Check general readiness
  if (readiness.category === 'rest_recommended') {
    return {
      modify: true,
      suggestion: 'Considera di saltare o fare versione leggera'
    };
  }

  return { modify: false };
}

/**
 * Ottieni sostituto sicuro per un pattern
 */
function getSafeSubstitute(pattern: string, painArea: string): string | null {
  const substitutes: Record<string, Record<string, string>> = {
    'horizontal_push': {
      'shoulder': 'Floor Press (range ridotto)',
      'wrist': 'Push-up su maniglie',
      'elbow': 'Pec Deck Machine'
    },
    'vertical_push': {
      'shoulder': 'Lateral Raise leggero',
      'neck': 'Shoulder Press seduto con supporto'
    },
    'vertical_pull': {
      'elbow': 'Lat Pulldown presa neutra',
      'shoulder': 'Pulldown braccia tese'
    },
    'lower_push': {
      'knee': 'Leg Press (range limitato)',
      'hip': 'Leg Extension isolato',
      'ankle': 'Leg Press'
    },
    'lower_pull': {
      'lower_back': 'Leg Curl sdraiato',
      'hip': 'Glute Bridge isometrico'
    }
  };

  return substitutes[pattern]?.[painArea.toLowerCase()] || null;
}

// ============================================
// PERSISTENCE
// ============================================

/**
 * Salva dati wellness sessione
 */
export async function saveSessionWellness(data: SessionWellnessData): Promise<boolean> {
  if (!supabaseClient) {
    console.warn('[wellnessService] Client non inizializzato');
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('session_wellness')
      .insert({
        user_id: data.userId,
        session_id: data.sessionId,
        pre_workout_assessment: data.preWorkoutAssessment,
        readiness_score: data.readinessScore,
        pain_events: data.painEvents,
        adaptations_applied: data.adaptationsApplied,
        completed_at: data.completedAt || new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[wellnessService] Save failed:', error);
    return false;
  }
}

/**
 * Ottieni storico dolori per un utente
 */
export async function getPainHistory(
  userId: string,
  days: number = 30
): Promise<PainEvent[]> {
  if (!supabaseClient) return [];

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabaseClient
      .from('session_wellness')
      .select('pain_events')
      .eq('user_id', userId)
      .gte('completed_at', since.toISOString())
      .order('completed_at', { ascending: false });

    if (error) throw error;

    // Flatten all pain events
    return (data || []).flatMap(row => row.pain_events || []);
  } catch (error) {
    console.error('[wellnessService] Get pain history failed:', error);
    return [];
  }
}

/**
 * Analizza trend dolori
 */
export function analyzePainTrends(events: PainEvent[]): {
  frequentAreas: { area: string; count: number }[];
  problematicExercises: { name: string; avgPain: number; count: number }[];
  recommendations: string[];
} {
  // Count by area
  const areaCounts = new Map<string, number>();
  for (const event of events) {
    areaCounts.set(event.painArea, (areaCounts.get(event.painArea) || 0) + 1);
  }

  // Count by exercise
  const exerciseData = new Map<string, { total: number; count: number }>();
  for (const event of events) {
    const existing = exerciseData.get(event.exerciseName) || { total: 0, count: 0 };
    existing.total += event.painLevel;
    existing.count += 1;
    exerciseData.set(event.exerciseName, existing);
  }

  const frequentAreas = Array.from(areaCounts.entries())
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const problematicExercises = Array.from(exerciseData.entries())
    .map(([name, data]) => ({
      name,
      avgPain: Math.round(data.total / data.count * 10) / 10,
      count: data.count
    }))
    .filter(e => e.count >= 2 || e.avgPain >= 5)
    .sort((a, b) => b.avgPain - a.avgPain)
    .slice(0, 5);

  // Generate recommendations
  const recommendations: string[] = [];

  if (frequentAreas.length > 0) {
    const topArea = frequentAreas[0];
    if (topArea.count >= 3) {
      recommendations.push(
        `Dolore frequente a ${topArea.area} (${topArea.count} volte). Considera una valutazione.`
      );
    }
  }

  if (problematicExercises.length > 0) {
    for (const ex of problematicExercises) {
      if (ex.avgPain >= 6) {
        recommendations.push(
          `${ex.name} causa dolore medio ${ex.avgPain}/10. Valuta sostituzione o tecnica.`
        );
      }
    }
  }

  return { frequentAreas, problematicExercises, recommendations };
}
