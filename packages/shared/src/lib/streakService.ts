/**
 * Streak Service
 * FitnessFlow/TrainFlow v4.1.0
 *
 * Manages workout streaks tracking and statistics
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  WorkoutStreak,
  StreakMilestone,
  SocialServiceResponse,
} from '../types/social.types';

// ============================================================
// DEPENDENCY INJECTION
// ============================================================

let supabase: SupabaseClient | null = null;

export function initStreakService(client: SupabaseClient): void {
  supabase = client;
  console.log('[StreakService] Initialized');
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[StreakService] Supabase client not initialized. Call initStreakService first.');
  }
  return supabase;
}

// ============================================================
// STREAK MILESTONES
// ============================================================

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, name_it: 'Tre di Fila', name_en: 'Three in a Row', achieved: false },
  { days: 7, name_it: 'Una Settimana', name_en: 'One Week', achieved: false },
  { days: 14, name_it: 'Due Settimane', name_en: 'Two Weeks', achieved: false },
  { days: 30, name_it: 'Un Mese', name_en: 'One Month', achieved: false },
  { days: 60, name_it: 'Due Mesi', name_en: 'Two Months', achieved: false },
  { days: 100, name_it: 'Cento Giorni', name_en: 'Hundred Days', achieved: false },
  { days: 365, name_it: 'Un Anno', name_en: 'One Year', achieved: false },
];

// ============================================================
// GET STREAK
// ============================================================

/**
 * Get workout streak for a user
 */
export async function getStreak(
  userId?: string
): Promise<SocialServiceResponse<WorkoutStreak>> {
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
      .from('workout_streaks')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      return { success: false, error: error.message };
    }

    // Return default streak if not exists
    if (!data) {
      return {
        success: true,
        data: {
          id: '',
          user_id: targetUserId,
          current_streak: 0,
          longest_streak: 0,
          last_workout_date: undefined,
          workouts_this_month: 0,
          volume_this_month: 0,
          workouts_this_week: 0,
          updated_at: new Date().toISOString(),
        },
      };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[StreakService] getStreak error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// UPDATE STREAK (Manual - usually handled by trigger)
// ============================================================

/**
 * Manually update streak (backup if trigger fails)
 */
export async function updateStreak(
  userId: string,
  updates: Partial<WorkoutStreak>
): Promise<SocialServiceResponse<WorkoutStreak>> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('workout_streaks')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[StreakService] updateStreak error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET MILESTONES STATUS
// ============================================================

/**
 * Get milestone achievements for a user's streak
 */
export async function getStreakMilestones(
  userId?: string
): Promise<SocialServiceResponse<StreakMilestone[]>> {
  try {
    const streakResult = await getStreak(userId);
    if (!streakResult.success || !streakResult.data) {
      return { success: false, error: streakResult.error || 'Failed to get streak' };
    }

    const { longest_streak } = streakResult.data;

    const milestones = STREAK_MILESTONES.map(milestone => ({
      ...milestone,
      achieved: longest_streak >= milestone.days,
    }));

    return { success: true, data: milestones };
  } catch (error: any) {
    console.error('[StreakService] getStreakMilestones error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// CHECK FOR NEW MILESTONE
// ============================================================

/**
 * Check if a new milestone was just achieved
 */
export function checkNewMilestone(
  previousStreak: number,
  currentStreak: number
): StreakMilestone | null {
  for (const milestone of STREAK_MILESTONES) {
    if (previousStreak < milestone.days && currentStreak >= milestone.days) {
      return { ...milestone, achieved: true };
    }
  }
  return null;
}

// ============================================================
// RESET STREAK (Admin only)
// ============================================================

/**
 * Reset streak for testing or admin purposes
 */
export async function resetStreak(
  userId: string
): Promise<SocialServiceResponse<void>> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('workout_streaks')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[StreakService] resetStreak error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET LEADERBOARD
// ============================================================

/**
 * Get top streaks leaderboard
 */
export async function getStreakLeaderboard(
  limit: number = 10,
  type: 'current' | 'longest' = 'current'
): Promise<SocialServiceResponse<Array<WorkoutStreak & { user?: any }>>> {
  try {
    const client = getSupabase();

    const orderColumn = type === 'current' ? 'current_streak' : 'longest_streak';

    const { data, error } = await client
      .from('workout_streaks')
      .select(`
        *,
        user:user_profiles(username, display_name, avatar_url)
      `)
      .gt(orderColumn, 0)
      .order(orderColumn, { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[StreakService] getStreakLeaderboard error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// CALCULATE STREAK FROM WORKOUTS (Recalculation utility)
// ============================================================

/**
 * Recalculate streak from workout history (for data repair)
 */
export async function recalculateStreak(
  userId: string
): Promise<SocialServiceResponse<WorkoutStreak>> {
  try {
    const client = getSupabase();

    // Get all completed workouts ordered by date
    const { data: workouts, error } = await client
      .from('workout_logs')
      .select('workout_date')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('workout_date', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!workouts || workouts.length === 0) {
      return updateStreak(userId, {
        current_streak: 0,
        longest_streak: 0,
        last_workout_date: undefined,
        workouts_this_month: 0,
        workouts_this_week: 0,
      });
    }

    // Calculate streaks
    const dates = workouts.map(w => new Date(w.workout_date).toDateString());
    const uniqueDates = [...new Set(dates)];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Check if streak is still active
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

        if (diffDays === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Count this month and week
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const workoutsThisMonth = workouts.filter(
      w => new Date(w.workout_date) >= monthStart
    ).length;

    const workoutsThisWeek = workouts.filter(
      w => new Date(w.workout_date) >= weekStart
    ).length;

    return updateStreak(userId, {
      current_streak: Math.max(currentStreak, longestStreak === currentStreak ? currentStreak : 0),
      longest_streak: Math.max(longestStreak, currentStreak),
      last_workout_date: uniqueDates[0],
      workouts_this_month: workoutsThisMonth,
      workouts_this_week: workoutsThisWeek,
    });
  } catch (error: any) {
    console.error('[StreakService] recalculateStreak error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  initStreakService,
  getStreak,
  updateStreak,
  getStreakMilestones,
  checkNewMilestone,
  resetStreak,
  getStreakLeaderboard,
  recalculateStreak,
  STREAK_MILESTONES,
};
