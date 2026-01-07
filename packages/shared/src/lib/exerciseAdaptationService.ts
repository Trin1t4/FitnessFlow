/**
 * Exercise Adaptation Service
 * TrainSmart - Sistema di adattamento esercizi
 *
 * Gestisce l'adattamento del programma quando l'utente segnala fastidio.
 * NON è un sistema di riabilitazione - è ottimizzazione del training.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TrackedBodyArea,
  AdaptationLevel,
  AdaptationStatus,
  ActiveAdaptation,
  AdaptationSession,
  AdaptationExerciseLog,
  AdaptationRoutine,
  AdaptationExercise,
  RespondToAdaptationResponse,
  CompleteAdaptationSessionResponse,
  CompleteAdaptationResponse,
  AdaptationDashboardCard
} from '../types/exerciseAdaptation.types';
import {
  ADAPTATION_LEVELS,
  BODY_AREA_LABELS,
  SESSIONS_TO_LEVEL_UP,
  SESSIONS_TO_RESOLVE
} from '../types/exerciseAdaptation.types';

// ============================================================
// DEPENDENCY INJECTION
// ============================================================

let supabase: SupabaseClient | null = null;

export function initAdaptationService(client: SupabaseClient): void {
  supabase = client;
  console.log('[AdaptationService] Initialized');
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      '[AdaptationService] Supabase client not initialized. Call initAdaptationService first.'
    );
  }
  return supabase;
}

// ============================================================
// TYPES
// ============================================================

export interface AdaptationServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// ADAPTATION ROUTINES (Esercizi per zona - NON protocolli clinici)
// ============================================================

/**
 * Routine di adattamento per ogni zona del corpo.
 * Ogni routine ha 3 livelli: Leggero → Moderato → Normale
 *
 * NOTA: Questi sono esercizi generici di mobilità e rinforzo,
 * NON protocolli per condizioni specifiche.
 */
export const ADAPTATION_ROUTINES: Record<TrackedBodyArea, AdaptationRoutine> = {
  lower_back: {
    body_area: 'lower_back',
    name: 'Routine Schiena',
    estimatedDuration: 10,
    notes: 'Focus su mobilità e stabilità del core. Evita carichi pesanti.',
    levels: {
      1: [
        {
          name: 'Cat-Cow',
          sets: 2,
          reps: '10 per direzione',
          rest: 30,
          level: 1,
          description: 'Mobilità colonna in quadrupedia'
        },
        {
          name: 'Pelvic Tilt',
          sets: 2,
          reps: 15,
          rest: 30,
          level: 1,
          description: 'Controllo del bacino'
        },
        {
          name: 'Knee to Chest',
          sets: 2,
          reps: '30s per gamba',
          rest: 30,
          level: 1,
          description: 'Allungamento lombare'
        },
        {
          name: "Child's Pose",
          sets: 2,
          reps: '45s hold',
          rest: 30,
          level: 1,
          description: 'Rilassamento schiena'
        }
      ],
      2: [
        {
          name: 'Dead Bug',
          sets: 3,
          reps: '8 per lato',
          rest: 45,
          level: 2,
          description: 'Stabilità core'
        },
        {
          name: 'Bird Dog',
          sets: 3,
          reps: '8 per lato',
          rest: 45,
          level: 2,
          description: 'Controllo lombo-pelvico'
        },
        {
          name: 'Glute Bridge',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Attivazione glutei'
        },
        {
          name: 'Side Plank (ginocchio)',
          sets: 2,
          reps: '20s per lato',
          rest: 45,
          level: 2,
          description: 'Stabilità laterale'
        }
      ],
      3: [
        {
          name: 'Modified Curl-Up',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Rinforzo addominali'
        },
        {
          name: 'Hip Hinge',
          sets: 3,
          reps: 12,
          rest: 60,
          level: 3,
          description: 'Pattern movimento corretto'
        },
        {
          name: 'Glute Bridge Unilaterale',
          sets: 3,
          reps: '10 per gamba',
          rest: 60,
          level: 3,
          description: 'Forza glutei'
        },
        {
          name: 'Pallof Press',
          sets: 3,
          reps: '8 per lato',
          rest: 60,
          level: 3,
          description: 'Anti-rotazione'
        }
      ]
    }
  },

  knee: {
    body_area: 'knee',
    name: 'Routine Ginocchio',
    estimatedDuration: 12,
    notes: 'Focus su mobilità e rinforzo controllato. Evita impatti.',
    levels: {
      1: [
        {
          name: 'Quad Set',
          sets: 3,
          reps: '10s hold x 10',
          rest: 30,
          level: 1,
          description: 'Attivazione quadricipite isometrica'
        },
        {
          name: 'Straight Leg Raise',
          sets: 2,
          reps: 12,
          rest: 30,
          level: 1,
          description: 'Rinforzo quad senza carico ginocchio'
        },
        {
          name: 'Heel Slides',
          sets: 2,
          reps: 15,
          rest: 30,
          level: 1,
          description: 'Mobilità ginocchio'
        },
        {
          name: 'Calf Raises (seduto)',
          sets: 2,
          reps: 15,
          rest: 30,
          level: 1,
          description: 'Polpacci senza carico ginocchio'
        }
      ],
      2: [
        {
          name: 'Mini Squat',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Squat parziale controllato'
        },
        {
          name: 'Step Up (basso)',
          sets: 3,
          reps: '10 per gamba',
          rest: 45,
          level: 2,
          description: 'Salita gradino basso'
        },
        {
          name: 'Wall Sit',
          sets: 3,
          reps: '30s hold',
          rest: 45,
          level: 2,
          description: 'Isometria quadricipite'
        },
        {
          name: 'Clamshell',
          sets: 3,
          reps: 15,
          rest: 45,
          level: 2,
          description: 'Rinforzo glutei'
        }
      ],
      3: [
        {
          name: 'Goblet Squat',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Squat con controllo'
        },
        {
          name: 'Romanian Deadlift',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Rinforzo catena posteriore'
        },
        {
          name: 'Reverse Lunge',
          sets: 3,
          reps: '8 per gamba',
          rest: 60,
          level: 3,
          description: 'Affondo controllato'
        },
        {
          name: 'Terminal Knee Extension',
          sets: 3,
          reps: 15,
          rest: 60,
          level: 3,
          description: 'Rinforzo VMO'
        }
      ]
    }
  },

  shoulder: {
    body_area: 'shoulder',
    name: 'Routine Spalla',
    estimatedDuration: 12,
    notes: 'Focus su mobilità e stabilità scapolare.',
    levels: {
      1: [
        {
          name: 'Pendulum',
          sets: 2,
          reps: '30s per direzione',
          rest: 30,
          level: 1,
          description: 'Mobilità passiva spalla'
        },
        {
          name: 'Wall Slides',
          sets: 2,
          reps: 12,
          rest: 30,
          level: 1,
          description: 'Mobilità scapolare'
        },
        {
          name: 'Shoulder Circles',
          sets: 2,
          reps: '10 per direzione',
          rest: 30,
          level: 1,
          description: 'Mobilità generale'
        },
        {
          name: 'Scapular Squeeze',
          sets: 2,
          reps: '10 x 5s hold',
          rest: 30,
          level: 1,
          description: 'Attivazione romboidi'
        }
      ],
      2: [
        {
          name: 'Band Pull-Apart',
          sets: 3,
          reps: 15,
          rest: 45,
          level: 2,
          description: 'Rinforzo posteriore spalla'
        },
        {
          name: 'Face Pull (leggero)',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Extrarotatori e trapezio'
        },
        {
          name: 'External Rotation',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Rinforzo cuffia'
        },
        {
          name: 'YTW',
          sets: 2,
          reps: '8 per lettera',
          rest: 45,
          level: 2,
          description: 'Stabilizzatori scapolari'
        }
      ],
      3: [
        {
          name: 'Push-up',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Spinta orizzontale'
        },
        {
          name: 'Row',
          sets: 3,
          reps: 12,
          rest: 60,
          level: 3,
          description: 'Tirata orizzontale'
        },
        {
          name: 'Overhead Press (leggero)',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Spinta verticale controllata'
        },
        {
          name: 'Lat Pulldown',
          sets: 3,
          reps: 12,
          rest: 60,
          level: 3,
          description: 'Tirata verticale'
        }
      ]
    }
  },

  hip: {
    body_area: 'hip',
    name: 'Routine Anca',
    estimatedDuration: 10,
    notes: 'Focus su mobilità e attivazione glutei.',
    levels: {
      1: [
        {
          name: '90/90 Stretch',
          sets: 2,
          reps: '45s per lato',
          rest: 30,
          level: 1,
          description: 'Mobilità rotazione anca'
        },
        {
          name: 'Hip Circles',
          sets: 2,
          reps: '10 per direzione',
          rest: 30,
          level: 1,
          description: 'Mobilità generale anca'
        },
        {
          name: 'Supine Figure 4',
          sets: 2,
          reps: '45s per lato',
          rest: 30,
          level: 1,
          description: 'Allungamento piriforme'
        },
        {
          name: 'Hip Flexor Stretch',
          sets: 2,
          reps: '30s per lato',
          rest: 30,
          level: 1,
          description: 'Allungamento flessori'
        }
      ],
      2: [
        {
          name: 'Glute Bridge',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Attivazione glutei'
        },
        {
          name: 'Clamshell',
          sets: 3,
          reps: 15,
          rest: 45,
          level: 2,
          description: 'Gluteo medio'
        },
        {
          name: 'Fire Hydrant',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Abduzione anca'
        },
        {
          name: 'Quadruped Hip Circle',
          sets: 2,
          reps: '8 per direzione',
          rest: 45,
          level: 2,
          description: 'Mobilità dinamica'
        }
      ],
      3: [
        {
          name: 'Hip Thrust',
          sets: 3,
          reps: 12,
          rest: 60,
          level: 3,
          description: 'Rinforzo glutei'
        },
        {
          name: 'Lateral Band Walk',
          sets: 3,
          reps: '12 per lato',
          rest: 60,
          level: 3,
          description: 'Gluteo medio sotto carico'
        },
        {
          name: 'Bulgarian Split Squat',
          sets: 3,
          reps: '8 per gamba',
          rest: 60,
          level: 3,
          description: 'Forza unilaterale'
        },
        {
          name: 'Single Leg RDL',
          sets: 3,
          reps: '8 per gamba',
          rest: 60,
          level: 3,
          description: 'Stabilità e forza'
        }
      ]
    }
  },

  neck: {
    body_area: 'neck',
    name: 'Routine Collo',
    estimatedDuration: 8,
    notes: 'Movimenti lenti e controllati. Mai forzare.',
    levels: {
      1: [
        {
          name: 'Chin Tucks',
          sets: 2,
          reps: 10,
          rest: 30,
          level: 1,
          description: 'Retrazione cervicale'
        },
        {
          name: 'Neck Rotations',
          sets: 2,
          reps: '8 per lato',
          rest: 30,
          level: 1,
          description: 'Mobilità rotazione'
        },
        {
          name: 'Neck Lateral Flexion',
          sets: 2,
          reps: '8 per lato',
          rest: 30,
          level: 1,
          description: 'Mobilità laterale'
        },
        {
          name: 'Upper Trap Stretch',
          sets: 2,
          reps: '30s per lato',
          rest: 30,
          level: 1,
          description: 'Allungamento trapezio'
        }
      ],
      2: [
        {
          name: 'Isometric Holds (tutti i piani)',
          sets: 2,
          reps: '6 x 5s',
          rest: 45,
          level: 2,
          description: 'Rinforzo isometrico'
        },
        {
          name: 'Scapular Squeeze',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Postura scapolare'
        },
        {
          name: 'Thoracic Extension',
          sets: 2,
          reps: 10,
          rest: 45,
          level: 2,
          description: 'Mobilità toracica'
        },
        {
          name: 'Levator Scapulae Stretch',
          sets: 2,
          reps: '30s per lato',
          rest: 45,
          level: 2,
          description: 'Allungamento elevatore'
        }
      ],
      3: [
        {
          name: 'Neck Curl',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Rinforzo flessori profondi'
        },
        {
          name: 'Face Pull',
          sets: 3,
          reps: 12,
          rest: 60,
          level: 3,
          description: 'Postura spalle e collo'
        },
        {
          name: 'Band Pull-Apart',
          sets: 3,
          reps: 15,
          rest: 60,
          level: 3,
          description: 'Rinforzo posteriore'
        },
        {
          name: 'Wall Angels',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Mobilità e postura'
        }
      ]
    }
  },

  ankle: {
    body_area: 'ankle',
    name: 'Routine Caviglia',
    estimatedDuration: 8,
    notes: 'Focus su mobilità dorsiflessione e stabilità.',
    levels: {
      1: [
        {
          name: 'Ankle Circles',
          sets: 2,
          reps: '10 per direzione',
          rest: 30,
          level: 1,
          description: 'Mobilità generale'
        },
        {
          name: 'Toe Raises',
          sets: 2,
          reps: 15,
          rest: 30,
          level: 1,
          description: 'Dorsiflessione attiva'
        },
        {
          name: 'Calf Stretch',
          sets: 2,
          reps: '30s per gamba',
          rest: 30,
          level: 1,
          description: 'Allungamento gastrocnemio'
        },
        {
          name: 'Soleus Stretch',
          sets: 2,
          reps: '30s per gamba',
          rest: 30,
          level: 1,
          description: 'Allungamento soleo'
        }
      ],
      2: [
        {
          name: 'Calf Raise (bilaterale)',
          sets: 3,
          reps: 15,
          rest: 45,
          level: 2,
          description: 'Rinforzo polpacci'
        },
        {
          name: 'Banded Dorsiflexion',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Mobilità con resistenza'
        },
        {
          name: 'Single Leg Balance',
          sets: 3,
          reps: '30s per gamba',
          rest: 45,
          level: 2,
          description: 'Propriocezione'
        },
        {
          name: 'Heel Walk',
          sets: 2,
          reps: '30s',
          rest: 45,
          level: 2,
          description: 'Attivazione tibiale'
        }
      ],
      3: [
        {
          name: 'Single Leg Calf Raise',
          sets: 3,
          reps: 12,
          rest: 60,
          level: 3,
          description: 'Forza polpacci unilaterale'
        },
        {
          name: 'Balance Board',
          sets: 3,
          reps: '45s',
          rest: 60,
          level: 3,
          description: 'Stabilità avanzata'
        },
        {
          name: 'Jump Rope (leggero)',
          sets: 3,
          reps: '30s',
          rest: 60,
          level: 3,
          description: 'Elasticità caviglia'
        },
        {
          name: 'Eccentric Heel Drop',
          sets: 3,
          reps: 12,
          rest: 60,
          level: 3,
          description: 'Rinforzo eccentrico'
        }
      ]
    }
  },

  wrist: {
    body_area: 'wrist',
    name: 'Routine Polso',
    estimatedDuration: 6,
    notes: 'Esercizi leggeri. Utile per chi usa molto tastiera.',
    levels: {
      1: [
        {
          name: 'Wrist Circles',
          sets: 2,
          reps: '10 per direzione',
          rest: 30,
          level: 1,
          description: 'Mobilità generale'
        },
        {
          name: 'Prayer Stretch',
          sets: 2,
          reps: '30s',
          rest: 30,
          level: 1,
          description: 'Allungamento flessori'
        },
        {
          name: 'Reverse Prayer',
          sets: 2,
          reps: '30s',
          rest: 30,
          level: 1,
          description: 'Allungamento estensori'
        },
        {
          name: 'Finger Spreads',
          sets: 2,
          reps: 15,
          rest: 30,
          level: 1,
          description: 'Mobilità dita'
        }
      ],
      2: [
        {
          name: 'Wrist Curl (leggero)',
          sets: 3,
          reps: 15,
          rest: 45,
          level: 2,
          description: 'Rinforzo flessori'
        },
        {
          name: 'Reverse Wrist Curl',
          sets: 3,
          reps: 15,
          rest: 45,
          level: 2,
          description: 'Rinforzo estensori'
        },
        {
          name: 'Radial/Ulnar Deviation',
          sets: 2,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Mobilità laterale'
        },
        {
          name: 'Grip Squeeze',
          sets: 3,
          reps: '10 x 3s',
          rest: 45,
          level: 2,
          description: 'Forza presa'
        }
      ],
      3: [
        {
          name: 'Wrist Roller',
          sets: 3,
          reps: '2 up-down',
          rest: 60,
          level: 3,
          description: 'Endurance avambraccio'
        },
        {
          name: 'Plate Pinch',
          sets: 3,
          reps: '20s hold',
          rest: 60,
          level: 3,
          description: 'Forza presa'
        },
        {
          name: 'Wrist Push-up Position Hold',
          sets: 3,
          reps: '20s',
          rest: 60,
          level: 3,
          description: 'Stabilità polso'
        },
        {
          name: 'Farmer Carry',
          sets: 3,
          reps: '30s',
          rest: 60,
          level: 3,
          description: 'Grip e postura'
        }
      ]
    }
  },

  elbow: {
    body_area: 'elbow',
    name: 'Routine Gomito',
    estimatedDuration: 8,
    notes: 'Focus su equilibrio flessori/estensori.',
    levels: {
      1: [
        {
          name: 'Elbow Flexion/Extension',
          sets: 2,
          reps: 15,
          rest: 30,
          level: 1,
          description: 'Mobilità gomito'
        },
        {
          name: 'Forearm Pronation/Supination',
          sets: 2,
          reps: 12,
          rest: 30,
          level: 1,
          description: 'Mobilità avambraccio'
        },
        {
          name: 'Wrist Extensor Stretch',
          sets: 2,
          reps: '30s per braccio',
          rest: 30,
          level: 1,
          description: 'Allungamento estensori'
        },
        {
          name: 'Wrist Flexor Stretch',
          sets: 2,
          reps: '30s per braccio',
          rest: 30,
          level: 1,
          description: 'Allungamento flessori'
        }
      ],
      2: [
        {
          name: 'Eccentric Wrist Extension',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Rinforzo eccentrico estensori'
        },
        {
          name: 'Eccentric Wrist Flexion',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Rinforzo eccentrico flessori'
        },
        {
          name: 'Hammer Curl',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Rinforzo brachioradiale'
        },
        {
          name: 'Tricep Extension',
          sets: 3,
          reps: 12,
          rest: 45,
          level: 2,
          description: 'Rinforzo tricipite'
        }
      ],
      3: [
        {
          name: 'Bicep Curl',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Forza flessori gomito'
        },
        {
          name: 'Tricep Dip',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Forza estensori gomito'
        },
        {
          name: 'Chin-up (assistito se necessario)',
          sets: 3,
          reps: 8,
          rest: 60,
          level: 3,
          description: 'Forza tirata'
        },
        {
          name: 'Push-up',
          sets: 3,
          reps: 10,
          rest: 60,
          level: 3,
          description: 'Forza spinta'
        }
      ]
    }
  }
};

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

/**
 * Ottiene la routine di adattamento per una zona.
 */
export function getAdaptationRoutine(
  bodyArea: TrackedBodyArea
): AdaptationRoutine | undefined {
  return ADAPTATION_ROUTINES[bodyArea];
}

/**
 * Ottiene gli esercizi per un livello specifico.
 */
export function getExercisesForLevel(
  bodyArea: TrackedBodyArea,
  level: AdaptationLevel
): AdaptationExercise[] {
  const routine = ADAPTATION_ROUTINES[bodyArea];
  if (!routine) return [];
  return routine.levels[level] || [];
}

/**
 * Inizia un nuovo adattamento per una zona.
 */
export async function startAdaptation(
  userId: string,
  bodyArea: TrackedBodyArea
): Promise<AdaptationServiceResponse<RespondToAdaptationResponse>> {
  try {
    const client = getSupabase();

    // Verifica se esiste già un adattamento attivo per questa zona
    const { data: existing, error: checkError } = await client
      .from('active_adaptations')
      .select('id')
      .eq('user_id', userId)
      .eq('body_area', bodyArea)
      .eq('status', 'active')
      .single();

    if (existing) {
      return {
        success: true,
        data: {
          success: true,
          adaptation_started: false,
          adaptation_id: existing.id,
          message: 'Hai già un adattamento attivo per questa zona.'
        }
      };
    }

    // Crea nuovo adattamento
    const { data, error } = await client
      .from('active_adaptations')
      .insert({
        user_id: userId,
        body_area: bodyArea,
        current_level: 1,
        sessions_completed: 0,
        comfortable_sessions: 0,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('[AdaptationService] startAdaptation error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        success: true,
        adaptation_started: true,
        adaptation_id: data.id,
        message: `Adattamento iniziato per ${BODY_AREA_LABELS[bodyArea]}. ` +
          'Ti proporremo esercizi leggeri per questa zona.'
      }
    };
  } catch (error: any) {
    console.error('[AdaptationService] startAdaptation exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Completa una sessione di adattamento.
 */
export async function completeAdaptationSession(
  userId: string,
  adaptationId: number,
  exercisesCompleted: AdaptationExerciseLog[],
  discomfortLevel: number,
  notes?: string
): Promise<AdaptationServiceResponse<CompleteAdaptationSessionResponse>> {
  try {
    const client = getSupabase();

    // Ottieni adattamento corrente
    const { data: adaptation, error: fetchError } = await client
      .from('active_adaptations')
      .select('*')
      .eq('id', adaptationId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !adaptation) {
      return { success: false, error: 'Adattamento non trovato.' };
    }

    // Salva sessione
    const { error: sessionError } = await client
      .from('adaptation_sessions')
      .insert({
        user_id: userId,
        adaptation_id: adaptationId,
        body_area: adaptation.body_area,
        level: adaptation.current_level,
        exercises_completed: exercisesCompleted,
        discomfort_level: discomfortLevel,
        completed_at: new Date().toISOString(),
        notes
      });

    if (sessionError) {
      console.error('[AdaptationService] session save error:', sessionError);
      return { success: false, error: sessionError.message };
    }

    // Calcola progressione
    const isComfortable = discomfortLevel <= 2; // 0-2 = fastidio minimo/assente
    const newComfortableSessions = isComfortable
      ? adaptation.comfortable_sessions + 1
      : 0; // Reset se c'è fastidio
    const newSessionsCompleted = adaptation.sessions_completed + 1;

    let newLevel = adaptation.current_level as AdaptationLevel;
    let levelUp = false;
    let resolved = false;

    // Logica di progressione
    if (newComfortableSessions >= SESSIONS_TO_LEVEL_UP) {
      if (adaptation.current_level < 3) {
        newLevel = (adaptation.current_level + 1) as AdaptationLevel;
        levelUp = true;
      } else if (adaptation.current_level === 3 && newComfortableSessions >= SESSIONS_TO_RESOLVE) {
        resolved = true;
      }
    }

    // Aggiorna adattamento
    const updateData: Record<string, unknown> = {
      sessions_completed: newSessionsCompleted,
      comfortable_sessions: levelUp ? 0 : newComfortableSessions,
      current_level: newLevel,
      last_session_at: new Date().toISOString()
    };

    if (resolved) {
      updateData.status = 'resolved';
      updateData.resolved_at = new Date().toISOString();
    }

    const { error: updateError } = await client
      .from('active_adaptations')
      .update(updateData)
      .eq('id', adaptationId);

    if (updateError) {
      console.error('[AdaptationService] update error:', updateError);
      return { success: false, error: updateError.message };
    }

    // Genera messaggio
    let message = '';
    if (resolved) {
      message = 'Ottimo lavoro! L\'adattamento è completato. ' +
        'Puoi tornare al programma normale per questa zona.';
    } else if (levelUp) {
      message = `Passaggio al livello ${newLevel}! ` +
        'Stai progredendo bene. Gli esercizi saranno leggermente più impegnativi.';
    } else if (isComfortable) {
      message = `Sessione completata. Ancora ${SESSIONS_TO_LEVEL_UP - newComfortableSessions} sessioni ` +
        'senza fastidio per passare al livello successivo.';
    } else {
      message = 'Sessione registrata. Continuiamo a lavorare su questa zona. ' +
        'Se il fastidio persiste, considera di consultare un professionista.';
    }

    return {
      success: true,
      data: {
        success: true,
        level_up: levelUp,
        new_level: levelUp ? newLevel : undefined,
        resolved,
        message
      }
    };
  } catch (error: any) {
    console.error('[AdaptationService] completeSession exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ottiene le card per la dashboard degli adattamenti attivi.
 */
export async function getAdaptationDashboard(
  userId: string
): Promise<AdaptationServiceResponse<AdaptationDashboardCard[]>> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('active_adaptations')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'paused'])
      .order('last_session_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const cards: AdaptationDashboardCard[] = (data || []).map((adaptation) => {
      const level = adaptation.current_level as AdaptationLevel;
      const totalSessionsNeeded = level === 3 ? SESSIONS_TO_RESOLVE : SESSIONS_TO_LEVEL_UP;
      const progress =
        ((adaptation.comfortable_sessions / totalSessionsNeeded) * 100) / 3 +
        ((level - 1) / 3) * 100;

      return {
        body_area: adaptation.body_area,
        body_area_label: BODY_AREA_LABELS[adaptation.body_area as TrackedBodyArea],
        status: adaptation.status,
        current_level: level,
        level_name: ADAPTATION_LEVELS[level].name,
        sessions_completed: adaptation.sessions_completed,
        comfortable_sessions: adaptation.comfortable_sessions,
        progress_percentage: Math.min(Math.round(progress), 100),
        next_session_available: true, // Sempre disponibile
        started_at: adaptation.started_at,
        last_session_at: adaptation.last_session_at
      };
    });

    return { success: true, data: cards };
  } catch (error: any) {
    console.error('[AdaptationService] getDashboard exception:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// LEGACY COMPATIBILITY
// ============================================================

/** @deprecated Use initAdaptationService instead */
export const initRehabilitationService = initAdaptationService;

/** @deprecated Use ADAPTATION_ROUTINES instead */
export const REHABILITATION_PROGRAMS = ADAPTATION_ROUTINES;

/** @deprecated Use getAdaptationRoutine instead */
export const getRehabilitationProgram = getAdaptationRoutine;

/** @deprecated Use startAdaptation instead */
export const startRehabilitation = startAdaptation;

/** @deprecated Use completeAdaptationSession instead */
export const completeRehabSession = completeAdaptationSession;

/** @deprecated Use getAdaptationDashboard instead */
export const getRehabilitationDashboard = getAdaptationDashboard;
