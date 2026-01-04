/**
 * Discomfort Tracking Service
 * TrainSmart - Sistema di tracking fastidio
 *
 * Questo servizio NON fornisce programmi di esercizi.
 * Fa solo 3 cose:
 * 1. Registra quando l'utente segnala fastidio
 * 2. Riduce automaticamente il carico negli esercizi correlati
 * 3. Suggerisce di consultare un professionista se il fastidio persiste
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TrackedBodyArea,
  DiscomfortStatus,
  ReportDiscomfortResponse
} from '../types/discomfortTracking.types';
import { BODY_AREA_LABELS } from '../types/discomfortTracking.types';

// ============================================================
// CONSTANTS
// ============================================================

/** Sessioni consecutive per suggerire professionista */
const SESSIONS_FOR_PROFESSIONAL_ADVICE = 3;

/** Moltiplicatore carico per zona con fastidio */
const LOAD_REDUCTION_MULTIPLIER = 0.6; // 60% del carico normale

/** Moltiplicatore carico per fastidio ricorrente */
const RECURRING_LOAD_MULTIPLIER = 0.4; // 40% del carico normale

// ============================================================
// DEPENDENCY INJECTION
// ============================================================

let supabase: SupabaseClient | null = null;

export function initDiscomfortService(client: SupabaseClient): void {
  supabase = client;
  console.log('[DiscomfortService] Initialized');
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[DiscomfortService] Not initialized');
  }
  return supabase;
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Segnala fastidio dopo un workout.
 *
 * Cosa fa:
 * - Registra le zone con fastidio
 * - Incrementa il contatore di sessioni consecutive
 * - Attiva la riduzione carico automatica
 * - Se 3+ sessioni consecutive → suggerisce professionista
 */
export async function reportDiscomfort(
  userId: string,
  bodyAreas: TrackedBodyArea[]
): Promise<ReportDiscomfortResponse> {
  try {
    const client = getSupabase();
    const now = new Date().toISOString();

    const areasWithReduction: TrackedBodyArea[] = [];
    let shouldConsultProfessional = false;
    const professionalAreas: TrackedBodyArea[] = [];

    // Se nessuna area segnalata → reset tutto
    if (bodyAreas.length === 0) {
      await client
        .from('discomfort_tracking')
        .update({
          consecutive_sessions: 0,
          load_reduction_active: false,
          updated_at: now
        })
        .eq('user_id', userId);

      return {
        success: true,
        areas_with_reduction: [],
        consult_professional: false,
        message: 'Ottimo! Nessun fastidio segnalato.'
      };
    }

    // Processa ogni area segnalata
    for (const area of bodyAreas) {
      // Cerca record esistente
      const { data: existing } = await client
        .from('discomfort_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('body_area', area)
        .single();

      if (!existing) {
        // Nuovo record
        await client.from('discomfort_tracking').insert({
          user_id: userId,
          body_area: area,
          consecutive_sessions: 1,
          first_reported: now,
          last_reported: now,
          load_reduction_active: true
        });
        areasWithReduction.push(area);
      } else {
        // Aggiorna record esistente
        const newCount = existing.consecutive_sessions + 1;

        await client
          .from('discomfort_tracking')
          .update({
            consecutive_sessions: newCount,
            last_reported: now,
            load_reduction_active: true,
            updated_at: now
          })
          .eq('id', existing.id);

        areasWithReduction.push(area);

        // Check se suggerire professionista
        if (newCount >= SESSIONS_FOR_PROFESSIONAL_ADVICE) {
          shouldConsultProfessional = true;
          professionalAreas.push(area);
        }
      }
    }

    // Reset aree NON segnalate
    await client
      .from('discomfort_tracking')
      .update({
        consecutive_sessions: 0,
        load_reduction_active: false,
        updated_at: now
      })
      .eq('user_id', userId)
      .not('body_area', 'in', `(${bodyAreas.join(',')})`);

    // Genera messaggio
    let message = `Fastidio registrato. Il carico per ${
      areasWithReduction.length === 1
        ? BODY_AREA_LABELS[areasWithReduction[0]]
        : 'le zone interessate'
    } sarà ridotto automaticamente.`;

    if (shouldConsultProfessional) {
      message +=
        `\n\nIl fastidio a ${professionalAreas.map((a) => BODY_AREA_LABELS[a]).join(', ')} ` +
        `persiste da ${SESSIONS_FOR_PROFESSIONAL_ADVICE}+ sessioni. ` +
        `Ti consigliamo di consultare un fisioterapista o medico sportivo.`;
    }

    return {
      success: true,
      areas_with_reduction: areasWithReduction,
      consult_professional: shouldConsultProfessional,
      message
    };
  } catch (error: unknown) {
    console.error('[DiscomfortService] reportDiscomfort error:', error);
    return {
      success: false,
      areas_with_reduction: [],
      consult_professional: false,
      message: 'Errore nel salvare il report.'
    };
  }
}

/**
 * Ottiene lo stato attuale del fastidio per un utente.
 * Usato dal generatore di programmi per applicare riduzioni.
 */
export async function getDiscomfortStatus(
  userId: string
): Promise<DiscomfortStatus> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('discomfort_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('load_reduction_active', true);

    if (error || !data) {
      return {
        areas_affected: [],
        load_multipliers: {} as Record<TrackedBodyArea, number>,
        should_consult_professional: false,
        professional_recommendation_areas: []
      };
    }

    const areasAffected: TrackedBodyArea[] = [];
    const loadMultipliers: Record<string, number> = {};
    const professionalAreas: TrackedBodyArea[] = [];

    for (const record of data) {
      const area = record.body_area as TrackedBodyArea;
      areasAffected.push(area);

      // Calcola moltiplicatore basato su ricorrenza
      if (record.consecutive_sessions >= SESSIONS_FOR_PROFESSIONAL_ADVICE) {
        loadMultipliers[area] = RECURRING_LOAD_MULTIPLIER;
        professionalAreas.push(area);
      } else {
        loadMultipliers[area] = LOAD_REDUCTION_MULTIPLIER;
      }
    }

    return {
      areas_affected: areasAffected,
      load_multipliers: loadMultipliers as Record<TrackedBodyArea, number>,
      should_consult_professional: professionalAreas.length > 0,
      professional_recommendation_areas: professionalAreas
    };
  } catch (error) {
    console.error('[DiscomfortService] getStatus error:', error);
    return {
      areas_affected: [],
      load_multipliers: {} as Record<TrackedBodyArea, number>,
      should_consult_professional: false,
      professional_recommendation_areas: []
    };
  }
}

/**
 * Ottiene il moltiplicatore di carico per una specifica zona.
 * Ritorna 1.0 se nessun fastidio attivo.
 */
export async function getLoadMultiplierForArea(
  userId: string,
  area: TrackedBodyArea
): Promise<number> {
  const status = await getDiscomfortStatus(userId);
  return status.load_multipliers[area] ?? 1.0;
}

/**
 * Verifica se una zona ha fastidio attivo.
 */
export async function hasActiveDiscomfort(
  userId: string,
  area: TrackedBodyArea
): Promise<boolean> {
  const status = await getDiscomfortStatus(userId);
  return status.areas_affected.includes(area);
}

/**
 * Resetta il tracking per una zona specifica.
 * Da usare quando l'utente conferma che il fastidio è passato.
 */
export async function clearDiscomfort(
  userId: string,
  area: TrackedBodyArea
): Promise<boolean> {
  try {
    const client = getSupabase();

    await client
      .from('discomfort_tracking')
      .update({
        consecutive_sessions: 0,
        load_reduction_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('body_area', area);

    return true;
  } catch (error) {
    console.error('[DiscomfortService] clearDiscomfort error:', error);
    return false;
  }
}

/**
 * Resetta tutto il tracking per un utente.
 */
export async function clearAllDiscomfort(userId: string): Promise<boolean> {
  try {
    const client = getSupabase();

    await client
      .from('discomfort_tracking')
      .update({
        consecutive_sessions: 0,
        load_reduction_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    return true;
  } catch (error) {
    console.error('[DiscomfortService] clearAll error:', error);
    return false;
  }
}

// ============================================================
// HELPER: Mapping zone → esercizi
// ============================================================

/**
 * Mappa zone del corpo → categorie di esercizi da ridurre.
 * Usato internamente dal generatore di programmi.
 */
export const AREA_TO_EXERCISE_CATEGORIES: Record<TrackedBodyArea, string[]> = {
  lower_back: ['deadlift', 'squat', 'row', 'good_morning', 'back_extension'],
  knee: ['squat', 'lunge', 'leg_press', 'leg_extension', 'jump'],
  shoulder: ['press', 'lateral_raise', 'overhead', 'bench_press', 'dip'],
  neck: ['overhead_press', 'shrug', 'upright_row'],
  hip: ['squat', 'deadlift', 'lunge', 'hip_thrust', 'leg_press'],
  ankle: ['calf_raise', 'jump', 'lunge', 'squat'],
  wrist: ['curl', 'press', 'pull_up', 'row'],
  elbow: ['curl', 'tricep', 'press', 'pull']
};

/**
 * Verifica se un esercizio è correlato a una zona con fastidio.
 */
export function isExerciseAffectedByDiscomfort(
  exerciseName: string,
  affectedAreas: TrackedBodyArea[]
): boolean {
  const normalizedName = exerciseName.toLowerCase();

  for (const area of affectedAreas) {
    const categories = AREA_TO_EXERCISE_CATEGORIES[area];
    if (categories.some((cat) => normalizedName.includes(cat))) {
      return true;
    }
  }

  return false;
}

/**
 * Ottiene il moltiplicatore per un esercizio specifico.
 */
export function getExerciseLoadMultiplier(
  exerciseName: string,
  status: DiscomfortStatus
): number {
  if (status.areas_affected.length === 0) {
    return 1.0;
  }

  const normalizedName = exerciseName.toLowerCase();
  let lowestMultiplier = 1.0;

  for (const area of status.areas_affected) {
    const categories = AREA_TO_EXERCISE_CATEGORIES[area];
    if (categories.some((cat) => normalizedName.includes(cat))) {
      const areaMultiplier = status.load_multipliers[area] ?? 1.0;
      lowestMultiplier = Math.min(lowestMultiplier, areaMultiplier);
    }
  }

  return lowestMultiplier;
}

// ============================================================
// DISCLAIMER
// ============================================================

export const DISCOMFORT_DISCLAIMER =
  'TrainSmart riduce automaticamente il carico quando segnali fastidio, ' +
  'ma non può diagnosticare problemi né prescrivere trattamenti. ' +
  'Se il fastidio persiste per più di 2-3 sessioni, consulta un professionista ' +
  '(fisioterapista, medico sportivo, ortopedico).';

// ============================================================
// LEGACY COMPATIBILITY (per migrazione)
// ============================================================

/** @deprecated Use initDiscomfortService */
export const initRehabilitationService = initDiscomfortService;
/** @deprecated Use initDiscomfortService */
export const initPainTrackingService = initDiscomfortService;
/** @deprecated Use initDiscomfortService */
export const initAdaptationService = initDiscomfortService;

/** @deprecated Use reportDiscomfort */
export const reportWorkoutPain = reportDiscomfort;

/** @deprecated Use getDiscomfortStatus */
export const getPainStatus = getDiscomfortStatus;

/** @deprecated Use clearDiscomfort */
export const resetPainTracking = clearDiscomfort;
