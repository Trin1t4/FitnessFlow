/**
 * Rehabilitation Service
 * FitnessFlow/TeamFlow - Sistema di rieducazione motoria parallela
 *
 * Gestisce i programmi di rieducazione che affiancano il programma principale.
 * La rieducazione è attivabile dopo 2 sessioni consecutive con dolore.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TrackedBodyArea,
  RehabilitationPhase,
  RehabilitationStatus,
  ActiveRehabilitation,
  RehabilitationSession,
  RehabilitationExerciseLog,
  RehabilitationProgram,
  RehabilitationExercise,
  RespondToRehabilitationResponse,
  CompleteRehabSessionResponse,
  CompleteRehabilitationResponse,
  RehabilitationDashboardCard,
} from '../types/rehabilitation.types';
import {
  REHABILITATION_PHASES,
  BODY_AREA_LABELS,
} from '../types/rehabilitation.types';

// ============================================================
// DEPENDENCY INJECTION
// ============================================================

let supabase: SupabaseClient | null = null;

export function initRehabilitationService(client: SupabaseClient): void {
  supabase = client;
  console.log('[RehabilitationService] Initialized');
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[RehabilitationService] Supabase client not initialized. Call initRehabilitationService first.');
  }
  return supabase;
}

// ============================================================
// TYPES
// ============================================================

export interface RehabilitationServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// REHABILITATION PROGRAMS (Configurazioni esercizi per zona)
// ============================================================

/**
 * Programmi di rieducazione per ogni zona del corpo.
 * Ogni programma ha 3 fasi: Mobility → Stability → Strength
 */
export const REHABILITATION_PROGRAMS: Record<TrackedBodyArea, RehabilitationProgram> = {
  lower_back: {
    body_area: 'lower_back',
    name: 'Rieducazione Lombare',
    phases: {
      1: [
        { name: 'Cat-Cow', sets: 2, reps: '10 per direzione', rest: 30, phase: 1, description: 'Mobilità colonna in quadrupedia' },
        { name: 'Pelvic Tilt', sets: 2, reps: 15, rest: 30, phase: 1, description: 'Retroversione/antiversione del bacino' },
        { name: 'Knee to Chest', sets: 2, reps: '30s per gamba', rest: 30, phase: 1, description: 'Stretching lombare' },
        { name: 'Child\'s Pose', sets: 2, reps: '45s hold', rest: 30, phase: 1, description: 'Allungamento schiena' },
      ],
      2: [
        { name: 'Dead Bug', sets: 3, reps: '8 per lato', rest: 45, phase: 2, description: 'Stabilizzazione core' },
        { name: 'Bird Dog', sets: 3, reps: '8 per lato', rest: 45, phase: 2, description: 'Controllo lombo-pelvico' },
        { name: 'Glute Bridge', sets: 3, reps: 12, rest: 45, phase: 2, description: 'Attivazione glutei' },
        { name: 'Side Plank (ginocchio)', sets: 2, reps: '20s per lato', rest: 45, phase: 2, description: 'Stabilità laterale' },
      ],
      3: [
        { name: 'McGill Curl-Up', sets: 3, reps: 10, rest: 60, phase: 3, description: 'Rinforzo addominali senza flessione lombare' },
        { name: 'Hip Hinge', sets: 3, reps: 12, rest: 60, phase: 3, description: 'Pattern movimento corretto' },
        { name: 'Glute Bridge Unilaterale', sets: 3, reps: '10 per gamba', rest: 60, phase: 3, description: 'Forza glutei asimmetrica' },
        { name: 'Pallof Press', sets: 3, reps: '8 per lato', rest: 60, phase: 3, description: 'Anti-rotazione' },
      ],
    },
    notes: 'Evitare flessione lombare sotto carico. Focus su stabilità prima di forza.',
  },

  knee: {
    body_area: 'knee',
    name: 'Rieducazione Ginocchio',
    phases: {
      1: [
        { name: 'Knee Circles', sets: 2, reps: '10 per direzione', rest: 30, phase: 1, description: 'Mobilità articolare' },
        { name: 'Quad Stretch', sets: 2, reps: '30s per gamba', rest: 30, phase: 1, description: 'Allungamento quadricipite' },
        { name: 'Hamstring Stretch', sets: 2, reps: '30s per gamba', rest: 30, phase: 1, description: 'Allungamento ischiocrurali' },
        { name: 'Calf Stretch', sets: 2, reps: '30s per gamba', rest: 30, phase: 1, description: 'Allungamento polpacci' },
      ],
      2: [
        { name: 'VMO Activation', sets: 3, reps: '10s hold x 10', rest: 45, phase: 2, description: 'Attivazione vasto mediale' },
        { name: 'Terminal Knee Extension', sets: 3, reps: 15, rest: 45, phase: 2, description: 'Rinforzo estensione finale' },
        { name: 'Wall Sit', sets: 3, reps: '20-30s', rest: 45, phase: 2, description: 'Isometrico quadricipite' },
        { name: 'Single Leg Balance', sets: 2, reps: '30s per gamba', rest: 45, phase: 2, description: 'Propriocezione' },
      ],
      3: [
        { name: 'Step Up (basso)', sets: 3, reps: '10 per gamba', rest: 60, phase: 3, description: 'Forza funzionale' },
        { name: 'Mini Squat', sets: 3, reps: 12, rest: 60, phase: 3, description: 'Pattern squat controllato' },
        { name: 'Single Leg RDL', sets: 3, reps: '8 per gamba', rest: 60, phase: 3, description: 'Stabilità e catena posteriore' },
        { name: 'Lateral Band Walk', sets: 3, reps: '10 per lato', rest: 60, phase: 3, description: 'Rinforzo abduttori' },
      ],
    },
    notes: 'Non forzare mai in ROM doloroso. Progressione graduale del carico.',
  },

  shoulder: {
    body_area: 'shoulder',
    name: 'Rieducazione Spalla',
    phases: {
      1: [
        { name: 'Shoulder Circles', sets: 2, reps: '10 per direzione', rest: 30, phase: 1, description: 'Mobilità articolare' },
        { name: 'Wall Slides', sets: 2, reps: 12, rest: 30, phase: 1, description: 'Mobilità scapolare' },
        { name: 'Cross Body Stretch', sets: 2, reps: '30s per braccio', rest: 30, phase: 1, description: 'Stretching capsula posteriore' },
        { name: 'Doorway Stretch', sets: 2, reps: '30s', rest: 30, phase: 1, description: 'Stretching pettorale' },
      ],
      2: [
        { name: 'Band Pull-Aparts', sets: 3, reps: 15, rest: 45, phase: 2, description: 'Attivazione romboidi' },
        { name: 'Face Pulls', sets: 3, reps: 15, rest: 45, phase: 2, description: 'Rotatori esterni' },
        { name: 'Prone Y-T-W', sets: 2, reps: '8 per posizione', rest: 45, phase: 2, description: 'Stabilizzatori scapolari' },
        { name: 'Scapular Push-Ups', sets: 3, reps: 12, rest: 45, phase: 2, description: 'Protruzione/retrazione scapolare' },
      ],
      3: [
        { name: 'External Rotation', sets: 3, reps: '12 per braccio', rest: 60, phase: 3, description: 'Rinforzo cuffia' },
        { name: 'Incline Push-Up', sets: 3, reps: 10, rest: 60, phase: 3, description: 'Push pattern controllato' },
        { name: 'Single Arm Row', sets: 3, reps: '10 per braccio', rest: 60, phase: 3, description: 'Pull pattern controllato' },
        { name: 'Overhead Press (leggero)', sets: 3, reps: 10, rest: 60, phase: 3, description: 'Progressione verso overhead' },
      ],
    },
    notes: 'Evitare movimenti overhead fino a fase 3. Focus su stabilità scapolare.',
  },

  neck: {
    body_area: 'neck',
    name: 'Rieducazione Cervicale',
    phases: {
      1: [
        { name: 'Neck Flexion/Extension', sets: 2, reps: '10 lento', rest: 30, phase: 1, description: 'Mobilità sagittale' },
        { name: 'Lateral Neck Tilt', sets: 2, reps: '10 per lato', rest: 30, phase: 1, description: 'Mobilità laterale' },
        { name: 'Neck Rotation', sets: 2, reps: '10 per lato', rest: 30, phase: 1, description: 'Mobilità rotatoria' },
        { name: 'Chin Tucks', sets: 2, reps: 15, rest: 30, phase: 1, description: 'Correzione posturale' },
      ],
      2: [
        { name: 'Isometric Neck Press (tutte direzioni)', sets: 3, reps: '5s x 5', rest: 45, phase: 2, description: 'Rinforzo isometrico' },
        { name: 'Deep Neck Flexor Activation', sets: 3, reps: '10s x 10', rest: 45, phase: 2, description: 'Stabilizzatori profondi' },
        { name: 'Upper Trap Stretch', sets: 2, reps: '30s per lato', rest: 45, phase: 2, description: 'Rilascio tensione' },
        { name: 'Levator Scapulae Stretch', sets: 2, reps: '30s per lato', rest: 45, phase: 2, description: 'Rilascio elevatore' },
      ],
      3: [
        { name: 'Neck Bridge (supportato)', sets: 2, reps: '15s hold', rest: 60, phase: 3, description: 'Rinforzo globale' },
        { name: 'Band Neck Extension', sets: 3, reps: 12, rest: 60, phase: 3, description: 'Rinforzo estensori' },
        { name: 'Prone Cervical Retraction', sets: 3, reps: 10, rest: 60, phase: 3, description: 'Rinforzo flessori profondi' },
        { name: 'Thoracic Extension', sets: 2, reps: 10, rest: 60, phase: 3, description: 'Mobilità toracica correlata' },
      ],
    },
    notes: 'Movimenti sempre lenti e controllati. Stop immediato se vertigini o irradiazione.',
  },

  hip: {
    body_area: 'hip',
    name: 'Rieducazione Anca',
    phases: {
      1: [
        { name: 'Hip Circles', sets: 2, reps: '10 per direzione', rest: 30, phase: 1, description: 'Mobilità articolare' },
        { name: 'Hip Flexor Stretch', sets: 2, reps: '30s per gamba', rest: 30, phase: 1, description: 'Allungamento ileo-psoas' },
        { name: '90/90 Stretch', sets: 2, reps: '30s per posizione', rest: 30, phase: 1, description: 'Mobilità rotazione' },
        { name: 'Pigeon Stretch', sets: 2, reps: '45s per gamba', rest: 30, phase: 1, description: 'Stretching piriforme/glutei' },
      ],
      2: [
        { name: 'Clamshell', sets: 3, reps: '15 per lato', rest: 45, phase: 2, description: 'Attivazione gluteo medio' },
        { name: 'Glute Bridge', sets: 3, reps: 15, rest: 45, phase: 2, description: 'Attivazione gluteo max' },
        { name: 'Fire Hydrant', sets: 3, reps: '12 per lato', rest: 45, phase: 2, description: 'Abduzione in quadrupedia' },
        { name: 'Side-Lying Hip Abduction', sets: 3, reps: '12 per lato', rest: 45, phase: 2, description: 'Rinforzo abduttori' },
      ],
      3: [
        { name: 'Hip Thrust', sets: 3, reps: 12, rest: 60, phase: 3, description: 'Forza glutei' },
        { name: 'Lateral Lunge', sets: 3, reps: '8 per lato', rest: 60, phase: 3, description: 'Mobilità + forza frontale' },
        { name: 'Single Leg Glute Bridge', sets: 3, reps: '10 per gamba', rest: 60, phase: 3, description: 'Forza unilaterale' },
        { name: 'Monster Walk', sets: 3, reps: '10 passi per direzione', rest: 60, phase: 3, description: 'Rinforzo dinamico' },
      ],
    },
    notes: 'Focus su equilibrio flessori/estensori. Evitare rotazioni forzate.',
  },

  ankle: {
    body_area: 'ankle',
    name: 'Rieducazione Caviglia',
    phases: {
      1: [
        { name: 'Ankle Circles', sets: 2, reps: '10 per direzione', rest: 30, phase: 1, description: 'Mobilità articolare' },
        { name: 'Dorsiflexion Stretch', sets: 2, reps: '30s per caviglia', rest: 30, phase: 1, description: 'Mobilità dorsiflessione' },
        { name: 'Calf Stretch (gastrocnemio)', sets: 2, reps: '30s per gamba', rest: 30, phase: 1, description: 'Allungamento gastrocnemio' },
        { name: 'Calf Stretch (soleo)', sets: 2, reps: '30s per gamba', rest: 30, phase: 1, description: 'Allungamento soleo' },
      ],
      2: [
        { name: 'Alphabet Ankle', sets: 2, reps: 'A-Z', rest: 45, phase: 2, description: 'Controllo motorio' },
        { name: 'Towel Scrunches', sets: 3, reps: '30s', rest: 45, phase: 2, description: 'Rinforzo intrinseci piede' },
        { name: 'Single Leg Balance', sets: 3, reps: '30s per gamba', rest: 45, phase: 2, description: 'Propriocezione' },
        { name: 'Resistance Band Eversion/Inversion', sets: 3, reps: '12 per direzione', rest: 45, phase: 2, description: 'Rinforzo peronei/tibiale' },
      ],
      3: [
        { name: 'Calf Raise', sets: 3, reps: 15, rest: 60, phase: 3, description: 'Forza flessori plantari' },
        { name: 'Single Leg Calf Raise', sets: 3, reps: '10 per gamba', rest: 60, phase: 3, description: 'Forza unilaterale' },
        { name: 'Heel Walk', sets: 2, reps: '20 passi', rest: 60, phase: 3, description: 'Rinforzo dorsiflessori' },
        { name: 'Balance Board', sets: 3, reps: '30s', rest: 60, phase: 3, description: 'Propriocezione avanzata' },
      ],
    },
    notes: 'Progressione graduale verso esercizi in carico. Evitare salti fino a completo recupero.',
  },

  wrist: {
    body_area: 'wrist',
    name: 'Rieducazione Polso',
    phases: {
      1: [
        { name: 'Wrist Circles', sets: 2, reps: '10 per direzione', rest: 30, phase: 1, description: 'Mobilità articolare' },
        { name: 'Wrist Flexion Stretch', sets: 2, reps: '30s per polso', rest: 30, phase: 1, description: 'Allungamento flessori' },
        { name: 'Wrist Extension Stretch', sets: 2, reps: '30s per polso', rest: 30, phase: 1, description: 'Allungamento estensori' },
        { name: 'Prayer Stretch', sets: 2, reps: '30s', rest: 30, phase: 1, description: 'Mobilità combinata' },
      ],
      2: [
        { name: 'Wrist Curls (leggero)', sets: 3, reps: 15, rest: 45, phase: 2, description: 'Rinforzo flessori' },
        { name: 'Reverse Wrist Curls', sets: 3, reps: 15, rest: 45, phase: 2, description: 'Rinforzo estensori' },
        { name: 'Finger Extensions', sets: 3, reps: 15, rest: 45, phase: 2, description: 'Rinforzo estensori dita' },
        { name: 'Grip Squeeze', sets: 3, reps: '10s x 10', rest: 45, phase: 2, description: 'Forza presa' },
      ],
      3: [
        { name: 'Wrist Rotation con peso', sets: 3, reps: '10 per direzione', rest: 60, phase: 3, description: 'Forza rotatori' },
        { name: 'Farmer Walk', sets: 3, reps: '30s', rest: 60, phase: 3, description: 'Forza presa funzionale' },
        { name: 'Push-up su pugni', sets: 3, reps: 8, rest: 60, phase: 3, description: 'Carico progressivo neutro' },
        { name: 'Plate Pinch', sets: 3, reps: '15s hold', rest: 60, phase: 3, description: 'Forza presa a pinza' },
      ],
    },
    notes: 'Evitare posizioni di polso esteso sotto carico fino a fase 3.',
  },

  elbow: {
    body_area: 'elbow',
    name: 'Rieducazione Gomito',
    phases: {
      1: [
        { name: 'Elbow Flexion/Extension', sets: 2, reps: 15, rest: 30, phase: 1, description: 'Mobilità articolare' },
        { name: 'Forearm Pronation/Supination', sets: 2, reps: '10 per direzione', rest: 30, phase: 1, description: 'Mobilità rotazione' },
        { name: 'Bicep Stretch', sets: 2, reps: '30s per braccio', rest: 30, phase: 1, description: 'Allungamento bicipite' },
        { name: 'Tricep Stretch', sets: 2, reps: '30s per braccio', rest: 30, phase: 1, description: 'Allungamento tricipite' },
      ],
      2: [
        { name: 'Eccentric Wrist Extension', sets: 3, reps: 15, rest: 45, phase: 2, description: 'Rehab epicondilite laterale' },
        { name: 'Eccentric Wrist Flexion', sets: 3, reps: 15, rest: 45, phase: 2, description: 'Rehab epicondilite mediale' },
        { name: 'Isometric Bicep Hold', sets: 3, reps: '10s x 5', rest: 45, phase: 2, description: 'Rinforzo isometrico flessori' },
        { name: 'Isometric Tricep Hold', sets: 3, reps: '10s x 5', rest: 45, phase: 2, description: 'Rinforzo isometrico estensori' },
      ],
      3: [
        { name: 'Bicep Curl (leggero)', sets: 3, reps: 12, rest: 60, phase: 3, description: 'Rinforzo concentrico flessori' },
        { name: 'Tricep Extension', sets: 3, reps: 12, rest: 60, phase: 3, description: 'Rinforzo concentrico estensori' },
        { name: 'Hammer Curl', sets: 3, reps: 12, rest: 60, phase: 3, description: 'Rinforzo brachioradiale' },
        { name: 'Close Grip Push-Up', sets: 3, reps: 8, rest: 60, phase: 3, description: 'Forza funzionale' },
      ],
    },
    notes: 'Focus su esercizi eccentrici per tendinopatie. Evitare curl pesanti fino a recupero completo.',
  },
};

// ============================================================
// RESPOND TO REHABILITATION OFFER
// ============================================================

/**
 * Accetta o rifiuta un'offerta di rieducazione.
 */
export async function respondToRehabilitation(
  userId: string,
  bodyArea: TrackedBodyArea,
  accepted: boolean
): Promise<RehabilitationServiceResponse<RespondToRehabilitationResponse>> {
  try {
    const client = getSupabase();

    // Usa RPC se disponibile
    const { data, error } = await client.rpc('respond_to_rehabilitation', {
      p_user_id: userId,
      p_body_area: bodyArea,
      p_accepted: accepted,
    });

    if (error) {
      console.error('[RehabilitationService] respondToRehabilitation error:', error);
      // Fallback a logica client-side
      return respondToRehabilitationClientSide(userId, bodyArea, accepted);
    }

    return { success: true, data: data as RespondToRehabilitationResponse };
  } catch (error: any) {
    console.error('[RehabilitationService] respondToRehabilitation exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Versione client-side per accettare/rifiutare rieducazione.
 */
async function respondToRehabilitationClientSide(
  userId: string,
  bodyArea: TrackedBodyArea,
  accepted: boolean
): Promise<RehabilitationServiceResponse<RespondToRehabilitationResponse>> {
  try {
    const client = getSupabase();

    // Aggiorna pain_tracking
    await client
      .from('pain_tracking')
      .update({ rehabilitation_accepted: accepted })
      .eq('user_id', userId)
      .eq('body_area', bodyArea);

    if (accepted) {
      // Crea rieducazione attiva
      const { data, error } = await client
        .from('active_rehabilitations')
        .upsert({
          user_id: userId,
          body_area: bodyArea,
          status: 'active',
          current_phase: 1,
          sessions_completed: 0,
          pain_free_sessions: 0,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          success: true,
          rehabilitation_id: data.id,
          message: 'Programma di rieducazione attivato',
        },
      };
    }

    return {
      success: true,
      data: {
        success: true,
        message: 'Continueremo con gli adattamenti. Puoi attivare la rieducazione quando vuoi.',
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET ACTIVE REHABILITATIONS
// ============================================================

/**
 * Ottieni tutte le rieducazioni attive di un utente.
 */
export async function getActiveRehabilitations(
  userId?: string
): Promise<RehabilitationServiceResponse<ActiveRehabilitation[]>> {
  try {
    const client = getSupabase();
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }
      targetUserId = user.id;
    }

    const { data, error } = await client
      .from('active_rehabilitations')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('status', 'active');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data || []) as ActiveRehabilitation[] };
  } catch (error: any) {
    console.error('[RehabilitationService] getActiveRehabilitations error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ottieni rieducazione attiva per una zona specifica.
 */
export async function getRehabilitationByArea(
  userId: string,
  bodyArea: TrackedBodyArea
): Promise<RehabilitationServiceResponse<ActiveRehabilitation | null>> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('active_rehabilitations')
      .select('*')
      .eq('user_id', userId)
      .eq('body_area', bodyArea)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ActiveRehabilitation | null };
  } catch (error: any) {
    console.error('[RehabilitationService] getRehabilitationByArea error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET REHABILITATION PROGRAM/EXERCISES
// ============================================================

/**
 * Ottieni il programma di rieducazione per una zona.
 */
export function getRehabilitationProgram(bodyArea: TrackedBodyArea): RehabilitationProgram {
  return REHABILITATION_PROGRAMS[bodyArea];
}

/**
 * Ottieni gli esercizi per la sessione corrente di rieducazione.
 */
export async function getRehabilitationSessionExercises(
  userId: string,
  bodyArea: TrackedBodyArea
): Promise<RehabilitationServiceResponse<{ exercises: RehabilitationExercise[]; phase: RehabilitationPhase }>> {
  try {
    // Ottieni rieducazione attiva
    const rehabResult = await getRehabilitationByArea(userId, bodyArea);
    if (!rehabResult.success || !rehabResult.data) {
      return { success: false, error: 'Nessuna rieducazione attiva per questa zona' };
    }

    const phase = rehabResult.data.current_phase as RehabilitationPhase;
    const program = REHABILITATION_PROGRAMS[bodyArea];
    const exercises = program.phases[phase];

    return {
      success: true,
      data: { exercises, phase },
    };
  } catch (error: any) {
    console.error('[RehabilitationService] getRehabilitationSessionExercises error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// COMPLETE REHABILITATION SESSION
// ============================================================

/**
 * Completa una sessione di rieducazione.
 */
export async function completeRehabilitationSession(
  userId: string,
  bodyArea: TrackedBodyArea,
  exercisesCompleted: RehabilitationExerciseLog[],
  painLevel: number,
  durationMinutes?: number,
  notes?: string
): Promise<RehabilitationServiceResponse<CompleteRehabSessionResponse>> {
  try {
    const client = getSupabase();

    // Usa RPC se disponibile
    const { data, error } = await client.rpc('complete_rehabilitation_session', {
      p_user_id: userId,
      p_body_area: bodyArea,
      p_exercises_completed: exercisesCompleted,
      p_pain_level: painLevel,
      p_duration_minutes: durationMinutes,
      p_notes: notes,
    });

    if (error) {
      console.error('[RehabilitationService] completeRehabilitationSession error:', error);
      // Fallback client-side
      return completeRehabilitationSessionClientSide(
        userId, bodyArea, exercisesCompleted, painLevel, durationMinutes, notes
      );
    }

    return { success: true, data: data as CompleteRehabSessionResponse };
  } catch (error: any) {
    console.error('[RehabilitationService] completeRehabilitationSession exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Versione client-side per completare sessione.
 */
async function completeRehabilitationSessionClientSide(
  userId: string,
  bodyArea: TrackedBodyArea,
  exercisesCompleted: RehabilitationExerciseLog[],
  painLevel: number,
  durationMinutes?: number,
  notes?: string
): Promise<RehabilitationServiceResponse<CompleteRehabSessionResponse>> {
  try {
    const client = getSupabase();

    // Ottieni rieducazione attiva
    const { data: rehab, error: fetchError } = await client
      .from('active_rehabilitations')
      .select('*')
      .eq('user_id', userId)
      .eq('body_area', bodyArea)
      .eq('status', 'active')
      .single();

    if (fetchError || !rehab) {
      return {
        success: false,
        error: 'Nessuna rieducazione attiva per questa zona',
      };
    }

    // Registra sessione
    await client.from('rehabilitation_sessions').insert({
      user_id: userId,
      rehabilitation_id: rehab.id,
      body_area: bodyArea,
      phase: rehab.current_phase,
      exercises_completed: exercisesCompleted,
      pain_level: painLevel,
      duration_minutes: durationMinutes,
      notes,
    });

    let newPhase = rehab.current_phase;
    let phaseAdvanced = false;
    let suggestCompletion = false;
    let newPainFreeSessions = painLevel <= 3 ? rehab.pain_free_sessions + 1 : 0;

    // Aggiorna contatori
    if (painLevel <= 3) {
      // Check avanzamento fase
      if (newPainFreeSessions >= 4 && rehab.current_phase < 3) {
        newPhase = rehab.current_phase + 1;
        newPainFreeSessions = 0;
        phaseAdvanced = true;
      }

      // Check completamento
      if (rehab.current_phase === 3 && newPainFreeSessions >= 4) {
        suggestCompletion = true;
      }
    }

    await client
      .from('active_rehabilitations')
      .update({
        sessions_completed: rehab.sessions_completed + 1,
        pain_free_sessions: newPainFreeSessions,
        current_phase: newPhase,
        last_session_at: new Date().toISOString(),
      })
      .eq('id', rehab.id);

    return {
      success: true,
      data: {
        success: true,
        sessions_completed: rehab.sessions_completed + 1,
        pain_free_sessions: newPainFreeSessions,
        current_phase: newPhase as RehabilitationPhase,
        phase_advanced: phaseAdvanced,
        suggest_completion: suggestCompletion,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// COMPLETE/CLOSE REHABILITATION
// ============================================================

/**
 * Completa o abbandona una rieducazione.
 */
export async function completeRehabilitation(
  userId: string,
  bodyArea: TrackedBodyArea,
  status: 'completed' | 'abandoned' = 'completed'
): Promise<RehabilitationServiceResponse<CompleteRehabilitationResponse>> {
  try {
    const client = getSupabase();

    // Aggiorna rieducazione
    const { error: rehabError } = await client
      .from('active_rehabilitations')
      .update({
        status,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('body_area', bodyArea)
      .eq('status', 'active');

    if (rehabError) {
      return { success: false, error: rehabError.message };
    }

    // Reset pain_tracking
    await client
      .from('pain_tracking')
      .update({
        consecutive_sessions: 0,
        rehabilitation_offered: false,
        rehabilitation_accepted: false,
      })
      .eq('user_id', userId)
      .eq('body_area', bodyArea);

    return {
      success: true,
      data: {
        success: true,
        message: status === 'completed'
          ? 'Rieducazione completata con successo!'
          : 'Rieducazione interrotta',
      },
    };
  } catch (error: any) {
    console.error('[RehabilitationService] completeRehabilitation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Metti in pausa una rieducazione.
 */
export async function pauseRehabilitation(
  userId: string,
  bodyArea: TrackedBodyArea
): Promise<RehabilitationServiceResponse<void>> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('active_rehabilitations')
      .update({ status: 'paused' })
      .eq('user_id', userId)
      .eq('body_area', bodyArea)
      .eq('status', 'active');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[RehabilitationService] pauseRehabilitation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Riprendi una rieducazione in pausa.
 */
export async function resumeRehabilitation(
  userId: string,
  bodyArea: TrackedBodyArea
): Promise<RehabilitationServiceResponse<void>> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('active_rehabilitations')
      .update({ status: 'active' })
      .eq('user_id', userId)
      .eq('body_area', bodyArea)
      .eq('status', 'paused');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[RehabilitationService] resumeRehabilitation error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET REHABILITATION HISTORY
// ============================================================

/**
 * Ottieni storico sessioni di rieducazione.
 */
export async function getRehabilitationHistory(
  userId: string,
  bodyArea?: TrackedBodyArea,
  limit: number = 20
): Promise<RehabilitationServiceResponse<RehabilitationSession[]>> {
  try {
    const client = getSupabase();

    let query = client
      .from('rehabilitation_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (bodyArea) {
      query = query.eq('body_area', bodyArea);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data || []) as RehabilitationSession[] };
  } catch (error: any) {
    console.error('[RehabilitationService] getRehabilitationHistory error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DASHBOARD HELPERS
// ============================================================

/**
 * Ottieni card per dashboard con info formattate.
 */
export async function getRehabilitationDashboardCards(
  userId?: string,
  locale: 'it' | 'en' = 'it'
): Promise<RehabilitationServiceResponse<RehabilitationDashboardCard[]>> {
  try {
    const rehabsResult = await getActiveRehabilitations(userId);
    if (!rehabsResult.success || !rehabsResult.data) {
      return { success: false, error: rehabsResult.error };
    }

    const cards: RehabilitationDashboardCard[] = rehabsResult.data.map(rehab => {
      const phaseInfo = REHABILITATION_PHASES[rehab.current_phase as RehabilitationPhase];
      const areaLabel = BODY_AREA_LABELS[rehab.body_area];

      // Calcola progresso (12 sessioni totali: 4 per fase x 3 fasi)
      const totalSessions = 12;
      const completedInPreviousPhases = (rehab.current_phase - 1) * 4;
      const progress = Math.min(
        100,
        Math.round(((completedInPreviousPhases + rehab.pain_free_sessions) / totalSessions) * 100)
      );

      return {
        id: rehab.id,
        bodyArea: rehab.body_area,
        bodyAreaLabel: locale === 'it' ? areaLabel.it : areaLabel.en,
        currentPhase: rehab.current_phase as RehabilitationPhase,
        phaseLabel: phaseInfo.name,
        sessionsCompleted: rehab.sessions_completed,
        painFreeSessions: rehab.pain_free_sessions,
        startedAt: rehab.started_at,
        lastSessionAt: rehab.last_session_at,
        progressPercentage: progress,
        suggestCompletion: rehab.current_phase === 3 && rehab.pain_free_sessions >= 4,
      };
    });

    return { success: true, data: cards };
  } catch (error: any) {
    console.error('[RehabilitationService] getRehabilitationDashboardCards error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  initRehabilitationService,
  respondToRehabilitation,
  getActiveRehabilitations,
  getRehabilitationByArea,
  getRehabilitationProgram,
  getRehabilitationSessionExercises,
  completeRehabilitationSession,
  completeRehabilitation,
  pauseRehabilitation,
  resumeRehabilitation,
  getRehabilitationHistory,
  getRehabilitationDashboardCards,
  REHABILITATION_PROGRAMS,
};
