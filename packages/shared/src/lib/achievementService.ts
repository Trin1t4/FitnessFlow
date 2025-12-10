/**
 * Achievement Service
 * FitnessFlow/TrainFlow v4.1.0
 *
 * Manages achievements/badges unlocking and tracking
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Achievement,
  UserAchievement,
  AchievementProgress,
  AchievementUnlockEvent,
  SocialServiceResponse,
} from '../types/social.types';

// ============================================================
// DEPENDENCY INJECTION
// ============================================================

let supabase: SupabaseClient | null = null;

export function initAchievementService(client: SupabaseClient): void {
  supabase = client;
  console.log('[AchievementService] Initialized');
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[AchievementService] Supabase client not initialized. Call initAchievementService first.');
  }
  return supabase;
}

// ============================================================
// GET ALL ACHIEVEMENTS
// ============================================================

/**
 * Get all available achievements
 */
export async function getAllAchievements(): Promise<SocialServiceResponse<Achievement[]>> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[AchievementService] getAllAchievements error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET USER ACHIEVEMENTS
// ============================================================

/**
 * Get achievements unlocked by a user
 */
export async function getUserAchievements(
  userId?: string
): Promise<SocialServiceResponse<UserAchievement[]>> {
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
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', targetUserId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[AchievementService] getUserAchievements error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET ACHIEVEMENT PROGRESS
// ============================================================

/**
 * Get progress for all achievements for a user
 */
export async function getAchievementProgress(
  userId?: string
): Promise<SocialServiceResponse<AchievementProgress[]>> {
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

    // Get all achievements
    const achievementsResult = await getAllAchievements();
    if (!achievementsResult.success) {
      return { success: false, error: achievementsResult.error };
    }

    // Get user's unlocked achievements
    const userAchievementsResult = await getUserAchievements(targetUserId);
    const unlockedCodes = new Set(
      (userAchievementsResult.data || []).map(ua => ua.achievement?.code)
    );

    // Get user stats for progress calculation
    const stats = await getUserStats(targetUserId);

    // Calculate progress for each achievement
    const progress: AchievementProgress[] = (achievementsResult.data || []).map(achievement => {
      const isUnlocked = unlockedCodes.has(achievement.code);
      const currentValue = calculateCurrentValue(achievement, stats);
      const progressPercent = Math.min(
        100,
        (currentValue / achievement.requirement_value) * 100
      );

      const userAchievement = (userAchievementsResult.data || []).find(
        ua => ua.achievement?.code === achievement.code
      );

      return {
        achievement,
        current_value: currentValue,
        target_value: achievement.requirement_value,
        progress_percent: progressPercent,
        is_unlocked: isUnlocked,
        unlocked_at: userAchievement?.unlocked_at,
      };
    });

    return { success: true, data: progress };
  } catch (error: any) {
    console.error('[AchievementService] getAchievementProgress error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// UNLOCK ACHIEVEMENT
// ============================================================

/**
 * Unlock an achievement for a user
 */
export async function unlockAchievement(
  achievementCode: string,
  triggerWorkoutId?: string,
  triggerValue?: number,
  userId?: string
): Promise<SocialServiceResponse<AchievementUnlockEvent>> {
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

    // Get achievement by code
    const { data: achievement, error: achError } = await client
      .from('achievements')
      .select('*')
      .eq('code', achievementCode)
      .single();

    if (achError || !achievement) {
      return { success: false, error: 'Achievement not found' };
    }

    // Check if already unlocked
    const { data: existing } = await client
      .from('user_achievements')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('achievement_id', achievement.id)
      .single();

    if (existing) {
      return { success: false, error: 'Achievement already unlocked' };
    }

    // Unlock achievement
    const { data: userAchievement, error: unlockError } = await client
      .from('user_achievements')
      .insert({
        user_id: targetUserId,
        achievement_id: achievement.id,
        trigger_workout_id: triggerWorkoutId,
        trigger_value: triggerValue,
      })
      .select()
      .single();

    if (unlockError) {
      return { success: false, error: unlockError.message };
    }

    return {
      success: true,
      data: {
        achievement,
        user_achievement: userAchievement,
        trigger_context: {
          workout_id: triggerWorkoutId,
          value: triggerValue,
        },
      },
    };
  } catch (error: any) {
    console.error('[AchievementService] unlockAchievement error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// CHECK AND UNLOCK ACHIEVEMENTS
// ============================================================

/**
 * Check and unlock all eligible achievements for a user
 * Call this after workout completion
 */
export async function checkAndUnlockAchievements(
  userId?: string,
  workoutId?: string
): Promise<SocialServiceResponse<AchievementUnlockEvent[]>> {
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

    // Get all achievements
    const achievementsResult = await getAllAchievements();
    if (!achievementsResult.success) {
      return { success: false, error: achievementsResult.error };
    }

    // Get user's unlocked achievements
    const { data: userAchievements } = await client
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', targetUserId);

    const unlockedIds = new Set((userAchievements || []).map(ua => ua.achievement_id));

    // Get user stats
    const stats = await getUserStats(targetUserId);

    // Check each achievement
    const unlocked: AchievementUnlockEvent[] = [];

    for (const achievement of achievementsResult.data || []) {
      // Skip already unlocked
      if (unlockedIds.has(achievement.id)) continue;

      // Check if requirement is met
      const currentValue = calculateCurrentValue(achievement, stats);
      if (currentValue >= achievement.requirement_value) {
        const result = await unlockAchievement(
          achievement.code,
          workoutId,
          currentValue,
          targetUserId
        );

        if (result.success && result.data) {
          unlocked.push(result.data);
        }
      }
    }

    return { success: true, data: unlocked };
  } catch (error: any) {
    console.error('[AchievementService] checkAndUnlockAchievements error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// MARK ACHIEVEMENT AS SHARED
// ============================================================

/**
 * Mark an achievement as shared
 */
export async function markAchievementShared(
  userAchievementId: string
): Promise<SocialServiceResponse<void>> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('user_achievements')
      .update({
        shared: true,
        shared_at: new Date().toISOString(),
      })
      .eq('id', userAchievementId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[AchievementService] markAchievementShared error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET ACHIEVEMENT LEADERBOARD
// ============================================================

/**
 * Get users with most achievement points
 */
export async function getAchievementLeaderboard(
  limit: number = 10
): Promise<SocialServiceResponse<Array<{ user_id: string; total_points: number; achievement_count: number; user?: any }>>> {
  try {
    const client = getSupabase();

    // This would ideally be a server-side function for better performance
    const { data, error } = await client
      .from('user_achievements')
      .select(`
        user_id,
        achievement:achievements(points)
      `);

    if (error) {
      return { success: false, error: error.message };
    }

    // Aggregate by user
    const userPoints: Record<string, { points: number; count: number }> = {};
    for (const ua of data || []) {
      if (!userPoints[ua.user_id]) {
        userPoints[ua.user_id] = { points: 0, count: 0 };
      }
      userPoints[ua.user_id].points += (ua.achievement as any)?.points || 0;
      userPoints[ua.user_id].count += 1;
    }

    // Sort and limit
    const leaderboard = Object.entries(userPoints)
      .map(([user_id, { points, count }]) => ({
        user_id,
        total_points: points,
        achievement_count: count,
      }))
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit);

    return { success: true, data: leaderboard };
  } catch (error: any) {
    console.error('[AchievementService] getAchievementLeaderboard error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

interface UserStats {
  total_workouts: number;
  current_streak: number;
  longest_streak: number;
  total_prs: number;
  total_volume: number;
  workouts_this_week: number;
  workouts_this_month: number;
}

/**
 * Get user stats for achievement calculation
 */
async function getUserStats(userId: string): Promise<UserStats> {
  const client = getSupabase();

  // Get workout count
  const { count: workoutCount } = await client
    .from('workout_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true);

  // Get streak data
  const { data: streak } = await client
    .from('workout_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get PR count
  const { count: prCount } = await client
    .from('personal_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get total volume (simplified - from user_profiles if available)
  const { data: profile } = await client
    .from('user_profiles')
    .select('total_volume')
    .eq('user_id', userId)
    .single();

  return {
    total_workouts: workoutCount || 0,
    current_streak: streak?.current_streak || 0,
    longest_streak: streak?.longest_streak || 0,
    total_prs: prCount || 0,
    total_volume: profile?.total_volume || 0,
    workouts_this_week: streak?.workouts_this_week || 0,
    workouts_this_month: streak?.workouts_this_month || 0,
  };
}

/**
 * Calculate current value for an achievement based on user stats
 */
function calculateCurrentValue(achievement: Achievement, stats: UserStats): number {
  switch (achievement.category) {
    case 'consistency':
      if (achievement.requirement_type === 'count') {
        return stats.total_workouts;
      } else if (achievement.requirement_type === 'streak') {
        // Use longest streak for achievement calculation
        return stats.longest_streak;
      }
      break;

    case 'strength':
      if (achievement.requirement_type === 'count') {
        return stats.total_prs;
      }
      break;

    case 'volume':
      if (achievement.requirement_type === 'value') {
        return stats.total_volume;
      }
      break;

    case 'milestone':
      // Special handling for time-based achievements
      // These are typically checked separately
      return 0;
  }

  return 0;
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  initAchievementService,
  getAllAchievements,
  getUserAchievements,
  getAchievementProgress,
  unlockAchievement,
  checkAndUnlockAchievements,
  markAchievementShared,
  getAchievementLeaderboard,
};
