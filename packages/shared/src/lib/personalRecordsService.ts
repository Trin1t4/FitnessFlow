/**
 * Personal Records Service
 * FitnessFlow/TrainFlow v4.1.0
 *
 * Manages personal records (PRs) tracking and detection
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  PersonalRecord,
  PersonalRecordHistory,
  PRSummary,
  PRDetectionResult,
  RecordType,
  SocialServiceResponse,
} from '../types/social.types';

// ============================================================
// DEPENDENCY INJECTION
// ============================================================

let supabase: SupabaseClient | null = null;

export function initPersonalRecordsService(client: SupabaseClient): void {
  supabase = client;
  console.log('[PersonalRecordsService] Initialized');
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[PersonalRecordsService] Supabase client not initialized. Call initPersonalRecordsService first.');
  }
  return supabase;
}

// ============================================================
// GET ALL PRs
// ============================================================

/**
 * Get all personal records for a user
 */
export async function getAllPRs(
  userId?: string
): Promise<SocialServiceResponse<PersonalRecord[]>> {
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
      .from('personal_records')
      .select('*')
      .eq('user_id', targetUserId)
      .order('achieved_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[PersonalRecordsService] getAllPRs error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET PR BY EXERCISE
// ============================================================

/**
 * Get personal records for a specific exercise
 */
export async function getPRByExercise(
  exerciseName: string,
  userId?: string
): Promise<SocialServiceResponse<PersonalRecord[]>> {
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
      .from('personal_records')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('exercise_name', exerciseName)
      .order('record_type');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[PersonalRecordsService] getPRByExercise error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET PR HISTORY
// ============================================================

/**
 * Get history of a specific personal record
 */
export async function getPRHistory(
  personalRecordId: string
): Promise<SocialServiceResponse<PersonalRecordHistory[]>> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('personal_records_history')
      .select('*')
      .eq('personal_record_id', personalRecordId)
      .order('achieved_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[PersonalRecordsService] getPRHistory error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// CHECK FOR NEW PR
// ============================================================

/**
 * Check if a new exercise log qualifies as a PR
 * Note: This is usually handled by database trigger, but can be called manually
 */
export async function checkForNewPR(
  exerciseName: string,
  weight: number,
  reps: number,
  userId?: string
): Promise<SocialServiceResponse<PRDetectionResult>> {
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

    // Get current max weight for this exercise
    const { data: currentPR, error } = await client
      .from('personal_records')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('exercise_name', exerciseName)
      .eq('record_type', 'max_weight')
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    const currentMax = currentPR?.value || 0;

    if (weight > currentMax) {
      const improvement = currentMax > 0
        ? {
            old_value: currentMax,
            new_value: weight,
            percent: ((weight - currentMax) / currentMax) * 100,
          }
        : undefined;

      return {
        success: true,
        data: {
          is_new_pr: true,
          personal_record: currentPR || undefined,
          improvement,
        },
      };
    }

    return {
      success: true,
      data: { is_new_pr: false },
    };
  } catch (error: any) {
    console.error('[PersonalRecordsService] checkForNewPR error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// CREATE/UPDATE PR (Manual)
// ============================================================

/**
 * Manually create or update a personal record
 */
export async function createOrUpdatePR(
  exerciseName: string,
  exercisePattern: string | undefined,
  recordType: RecordType,
  value: number,
  weight?: number,
  reps?: number,
  workoutLogId?: string,
  userId?: string
): Promise<SocialServiceResponse<PersonalRecord>> {
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

    // Get current PR if exists
    const { data: currentPR } = await client
      .from('personal_records')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('exercise_name', exerciseName)
      .eq('record_type', recordType)
      .single();

    const previousValue = currentPR?.value;
    const improvementPercent = previousValue && previousValue > 0
      ? ((value - previousValue) / previousValue) * 100
      : null;

    // Upsert the PR
    const { data, error } = await client
      .from('personal_records')
      .upsert({
        user_id: targetUserId,
        exercise_name: exerciseName,
        exercise_pattern: exercisePattern,
        record_type: recordType,
        value,
        weight_used: weight,
        reps_at_weight: reps,
        previous_value: previousValue,
        improvement_percent: improvementPercent,
        workout_log_id: workoutLogId,
        achieved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log to history if it's an improvement
    if (previousValue && previousValue > 0 && data) {
      await client
        .from('personal_records_history')
        .insert({
          personal_record_id: data.id,
          user_id: targetUserId,
          value: previousValue,
          weight_used: currentPR?.weight_used,
          achieved_at: currentPR?.achieved_at || new Date().toISOString(),
        });
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[PersonalRecordsService] createOrUpdatePR error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET RECENT PRs
// ============================================================

/**
 * Get most recent PRs achieved
 */
export async function getRecentPRs(
  limit: number = 10,
  userId?: string
): Promise<SocialServiceResponse<PersonalRecord[]>> {
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
      .from('personal_records')
      .select('*')
      .eq('user_id', targetUserId)
      .order('achieved_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[PersonalRecordsService] getRecentPRs error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET PR SUMMARY
// ============================================================

/**
 * Get summary of PRs with improvement info
 */
export async function getPRSummary(
  userId?: string
): Promise<SocialServiceResponse<PRSummary[]>> {
  try {
    const prsResult = await getAllPRs(userId);
    if (!prsResult.success) {
      return { success: false, error: prsResult.error };
    }

    const summaries: PRSummary[] = (prsResult.data || [])
      .filter(pr => pr.record_type === 'max_weight')
      .map(pr => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isNew = new Date(pr.achieved_at) > thirtyDaysAgo;

        return {
          exercise_name: pr.exercise_name,
          exercise_pattern: pr.exercise_pattern,
          current_value: pr.value,
          previous_value: pr.previous_value,
          improvement_percent: pr.improvement_percent,
          achieved_at: pr.achieved_at,
          is_new: isNew,
        };
      });

    return { success: true, data: summaries };
  } catch (error: any) {
    console.error('[PersonalRecordsService] getPRSummary error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET PR COUNT
// ============================================================

/**
 * Get total number of PRs for a user
 */
export async function getPRCount(
  userId?: string
): Promise<SocialServiceResponse<number>> {
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

    const { count, error } = await client
      .from('personal_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: count || 0 };
  } catch (error: any) {
    console.error('[PersonalRecordsService] getPRCount error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DELETE PR
// ============================================================

/**
 * Delete a personal record
 */
export async function deletePR(
  prId: string
): Promise<SocialServiceResponse<void>> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('personal_records')
      .delete()
      .eq('id', prId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[PersonalRecordsService] deletePR error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET PR LEADERBOARD BY EXERCISE
// ============================================================

/**
 * Get top PRs for a specific exercise across all users
 */
export async function getPRLeaderboard(
  exerciseName: string,
  limit: number = 10
): Promise<SocialServiceResponse<Array<PersonalRecord & { user?: any }>>> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('personal_records')
      .select(`
        *,
        user:user_profiles(username, display_name, avatar_url)
      `)
      .eq('exercise_name', exerciseName)
      .eq('record_type', 'max_weight')
      .order('value', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[PersonalRecordsService] getPRLeaderboard error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  initPersonalRecordsService,
  getAllPRs,
  getPRByExercise,
  getPRHistory,
  checkForNewPR,
  createOrUpdatePR,
  getRecentPRs,
  getPRSummary,
  getPRCount,
  deletePR,
  getPRLeaderboard,
};
