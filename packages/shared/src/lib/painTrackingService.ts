/**
 * Pain Tracking Service
 * TrainSmart/TeamFlow - Sistema di tracking dolore post-workout
 *
 * Gestisce la segnalazione del dolore e il trigger per la rieducazione motoria.
 * Dopo 2 sessioni consecutive con dolore nella stessa zona, propone la rieducazione.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TrackedBodyArea,
  PainTracking,
  PainTrackingSummary,
  ReportPainResponse,
} from '../types/rehabilitation.types';
import { TRACKED_BODY_AREAS } from '../types/rehabilitation.types';

// ============================================================
// DEPENDENCY INJECTION
// ============================================================

let supabase: SupabaseClient | null = null;

export function initPainTrackingService(client: SupabaseClient): void {
  supabase = client;
  console.log('[PainTrackingService] Initialized');
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[PainTrackingService] Supabase client not initialized. Call initPainTrackingService first.');
  }
  return supabase;
}

// ============================================================
// TYPES
// ============================================================

export interface PainTrackingServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// DYNAMIC REHABILITATION THRESHOLD
// ============================================================

/**
 * Calcola soglia trigger per riabilitazione in base alla severità
 * - Severe (7+): 1 sessione → trigger immediato
 * - Moderate (5-6): 2 sessioni → trigger standard
 * - Mild (<5): 3 sessioni → trigger conservativo
 *
 * @param severity - Severità del dolore (1-10)
 * @returns Numero di sessioni consecutive necessarie per trigger
 */
export function getRehabTriggerThreshold(severity: number): number {
  if (severity >= 7) return 1;      // Severe: trigger immediato
  if (severity >= 5) return 2;      // Moderate: 2 sessioni
  return 3;                         // Mild: 3 sessioni
}

/**
 * Verifica se attivare piano riabilitazione
 *
 * @param consecutiveIssues - Numero di sessioni consecutive con dolore
 * @param maxSeverity - Severità massima registrata nelle sessioni
 * @returns true se deve essere attivata la riabilitazione
 */
export function shouldTriggerRehabilitation(
  consecutiveIssues: number,
  maxSeverity: number
): boolean {
  const threshold = getRehabTriggerThreshold(maxSeverity);
  const shouldTrigger = consecutiveIssues >= threshold;
  console.log(`[PainTrackingService] shouldTriggerRehabilitation: consecutive=${consecutiveIssues}, maxSeverity=${maxSeverity}, threshold=${threshold}, trigger=${shouldTrigger}`);
  return shouldTrigger;
}

// ============================================================
// REPORT PAIN (Post-Workout)
// ============================================================

/**
 * Segnala dolore dopo un workout.
 * Usa la funzione RPC per logica completa (trigger rieducazione incluso).
 *
 * @param userId - ID utente
 * @param painAreas - Array di zone doloranti (può essere vuoto)
 * @returns Response con eventuale trigger per rieducazione
 */
export async function reportWorkoutPain(
  userId: string,
  painAreas: TrackedBodyArea[]
): Promise<PainTrackingServiceResponse<ReportPainResponse>> {
  try {
    const client = getSupabase();

    // Chiama la funzione RPC che gestisce tutta la logica
    const { data, error } = await client.rpc('report_workout_pain', {
      p_user_id: userId,
      p_body_areas: painAreas,
    });

    if (error) {
      console.error('[PainTrackingService] reportWorkoutPain error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data as ReportPainResponse,
    };
  } catch (error: any) {
    console.error('[PainTrackingService] reportWorkoutPain exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Versione client-side della logica di report pain.
 * Usa queries dirette invece di RPC (fallback se RPC non disponibile).
 */
export async function reportWorkoutPainClientSide(
  userId: string,
  painAreas: TrackedBodyArea[]
): Promise<PainTrackingServiceResponse<ReportPainResponse>> {
  try {
    const client = getSupabase();
    let triggerArea: TrackedBodyArea | null = null;

    // Per ogni zona tracciata
    for (const area of TRACKED_BODY_AREAS) {
      // Ottieni tracking corrente
      const { data: tracking, error: fetchError } = await client
        .from('pain_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('body_area', area)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`[PainTrackingService] Error fetching ${area}:`, fetchError);
        continue;
      }

      if (painAreas.includes(area)) {
        // Utente ha segnalato dolore in questa zona
        if (!tracking) {
          // Prima segnalazione: crea record
          const { error: insertError } = await client
            .from('pain_tracking')
            .insert({
              user_id: userId,
              body_area: area,
              consecutive_sessions: 1,
            });

          if (insertError) {
            console.error(`[PainTrackingService] Error inserting ${area}:`, insertError);
          }
        } else {
          // Incrementa contatore
          const newCount = tracking.consecutive_sessions + 1;

          const { error: updateError } = await client
            .from('pain_tracking')
            .update({
              consecutive_sessions: newCount,
              last_reported: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('body_area', area);

          if (updateError) {
            console.error(`[PainTrackingService] Error updating ${area}:`, updateError);
          }

          // Check trigger usando soglia dinamica basata sulla severità
          // Usa severità dal tracking (default 5 = moderate se non presente)
          const severity = tracking.max_severity || 5;
          if (shouldTriggerRehabilitation(newCount, severity) && !tracking.rehabilitation_offered && !triggerArea) {
            // Marca come offerta
            await client
              .from('pain_tracking')
              .update({ rehabilitation_offered: true })
              .eq('user_id', userId)
              .eq('body_area', area);

            console.log(`[PainTrackingService] 🏥 Rehabilitation triggered for ${area} (consecutive=${newCount}, severity=${severity})`);
            triggerArea = area;
          }
        }
      } else {
        // Utente NON ha segnalato dolore - reset contatore
        if (tracking && tracking.consecutive_sessions > 0) {
          const { error: resetError } = await client
            .from('pain_tracking')
            .update({
              consecutive_sessions: 0,
              last_session_without_pain: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('body_area', area);

          if (resetError) {
            console.error(`[PainTrackingService] Error resetting ${area}:`, resetError);
          }
        }
      }
    }

    // Risultato
    if (triggerArea) {
      return {
        success: true,
        data: {
          success: true,
          trigger_rehabilitation: true,
          body_area: triggerArea,
          message: 'Dolore persistente rilevato. Vuoi attivare il programma di rieducazione?',
        },
      };
    }

    return {
      success: true,
      data: {
        success: true,
        trigger_rehabilitation: false,
      },
    };
  } catch (error: any) {
    console.error('[PainTrackingService] reportWorkoutPainClientSide exception:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET PAIN TRACKING
// ============================================================

/**
 * Ottieni lo stato del pain tracking per un utente.
 * Ritorna solo le zone con dolore attivo (consecutive_sessions > 0).
 */
export async function getPainTracking(
  userId?: string
): Promise<PainTrackingServiceResponse<PainTrackingSummary[]>> {
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

    // Prova prima con RPC
    const { data: rpcData, error: rpcError } = await client.rpc('get_pain_tracking', {
      p_user_id: targetUserId,
    });

    if (!rpcError && rpcData) {
      return { success: true, data: rpcData as PainTrackingSummary[] };
    }

    // Fallback a query diretta
    const { data, error } = await client
      .from('pain_tracking')
      .select('body_area, consecutive_sessions, first_reported, last_reported, rehabilitation_offered, rehabilitation_accepted')
      .eq('user_id', targetUserId)
      .gt('consecutive_sessions', 0);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data || []) as PainTrackingSummary[] };
  } catch (error: any) {
    console.error('[PainTrackingService] getPainTracking error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ottieni pain tracking per una zona specifica.
 */
export async function getPainTrackingByArea(
  userId: string,
  bodyArea: TrackedBodyArea
): Promise<PainTrackingServiceResponse<PainTracking | null>> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('pain_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('body_area', bodyArea)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as PainTracking | null };
  } catch (error: any) {
    console.error('[PainTrackingService] getPainTrackingByArea error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// CHECK PENDING REHABILITATION OFFERS
// ============================================================

/**
 * Verifica se ci sono offerte di rieducazione in sospeso (offerte ma non accettate/rifiutate).
 */
export async function getPendingRehabilitationOffers(
  userId?: string
): Promise<PainTrackingServiceResponse<TrackedBodyArea[]>> {
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
      .from('pain_tracking')
      .select('body_area')
      .eq('user_id', targetUserId)
      .eq('rehabilitation_offered', true)
      .eq('rehabilitation_accepted', false)
      .gte('consecutive_sessions', 2);

    if (error) {
      return { success: false, error: error.message };
    }

    const pendingAreas = (data || []).map(d => d.body_area as TrackedBodyArea);
    return { success: true, data: pendingAreas };
  } catch (error: any) {
    console.error('[PainTrackingService] getPendingRehabilitationOffers error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// RESET PAIN TRACKING (Per zona specifica)
// ============================================================

/**
 * Reset pain tracking per una zona specifica.
 * Utile dopo che l'utente ha completato la rieducazione.
 */
export async function resetPainTracking(
  userId: string,
  bodyArea: TrackedBodyArea
): Promise<PainTrackingServiceResponse<void>> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('pain_tracking')
      .update({
        consecutive_sessions: 0,
        rehabilitation_offered: false,
        rehabilitation_accepted: false,
        rehabilitation_started_at: null,
      })
      .eq('user_id', userId)
      .eq('body_area', bodyArea);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[PainTrackingService] resetPainTracking error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reset completo pain tracking per un utente (tutte le zone).
 * Solo per admin/testing.
 */
export async function resetAllPainTracking(
  userId: string
): Promise<PainTrackingServiceResponse<void>> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('pain_tracking')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[PainTrackingService] resetAllPainTracking error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  initPainTrackingService,
  reportWorkoutPain,
  reportWorkoutPainClientSide,
  getPainTracking,
  getPainTrackingByArea,
  getPendingRehabilitationOffers,
  resetPainTracking,
  resetAllPainTracking,
};
