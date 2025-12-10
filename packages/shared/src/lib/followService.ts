/**
 * Follow Service
 * FitnessFlow/TrainFlow v4.1.0
 *
 * Manages followers/following relationships
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Follower,
  FollowerWithProfile,
  FollowStats,
  FollowResponse,
  SocialServiceResponse,
} from '../types/social.types';

// ============================================================
// DEPENDENCY INJECTION
// ============================================================

let supabase: SupabaseClient | null = null;

export function initFollowService(client: SupabaseClient): void {
  supabase = client;
  console.log('[FollowService] Initialized');
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[FollowService] Supabase client not initialized. Call initFollowService first.');
  }
  return supabase;
}

// ============================================================
// FOLLOW USER
// ============================================================

/**
 * Follow a user
 */
export async function followUser(
  targetUserId: string,
  followerId?: string
): Promise<FollowResponse> {
  try {
    const client = getSupabase();
    let currentUserId = followerId;

    if (!currentUserId) {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }
      currentUserId = user.id;
    }

    // Can't follow yourself
    if (currentUserId === targetUserId) {
      return { success: false, error: 'Cannot follow yourself' };
    }

    // Check if already following
    const { data: existing } = await client
      .from('followers')
      .select('id, status')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return { success: false, error: 'Already following this user' };
      }
      // Reactivate if was blocked/pending
      const { data, error } = await client
        .from('followers')
        .update({ status: 'active' })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data, is_new_follow: false };
    }

    // Create new follow
    const { data, error } = await client
      .from('followers')
      .insert({
        follower_id: currentUserId,
        following_id: targetUserId,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data, is_new_follow: true };
  } catch (error: any) {
    console.error('[FollowService] followUser error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// UNFOLLOW USER
// ============================================================

/**
 * Unfollow a user
 */
export async function unfollowUser(
  targetUserId: string,
  followerId?: string
): Promise<SocialServiceResponse<void>> {
  try {
    const client = getSupabase();
    let currentUserId = followerId;

    if (!currentUserId) {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }
      currentUserId = user.id;
    }

    const { error } = await client
      .from('followers')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[FollowService] unfollowUser error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET FOLLOWERS
// ============================================================

/**
 * Get followers of a user
 */
export async function getFollowers(
  userId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<SocialServiceResponse<FollowerWithProfile[]>> {
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
      .from('followers')
      .select(`
        *,
        follower:user_profiles!follower_id(
          user_id,
          username,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq('following_id', targetUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[FollowService] getFollowers error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET FOLLOWING
// ============================================================

/**
 * Get users that a user is following
 */
export async function getFollowing(
  userId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<SocialServiceResponse<FollowerWithProfile[]>> {
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
      .from('followers')
      .select(`
        *,
        following:user_profiles!following_id(
          user_id,
          username,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq('follower_id', targetUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[FollowService] getFollowing error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET FOLLOW STATS
// ============================================================

/**
 * Get follow statistics for a user
 */
export async function getFollowStats(
  userId?: string
): Promise<SocialServiceResponse<FollowStats>> {
  try {
    const client = getSupabase();
    let targetUserId = userId;
    let currentUserId: string | null = null;

    const { data: { user } } = await client.auth.getUser();
    if (user) {
      currentUserId = user.id;
    }

    if (!targetUserId) {
      if (!currentUserId) {
        return { success: false, error: 'No authenticated user' };
      }
      targetUserId = currentUserId;
    }

    // Get counts from user_profiles (maintained by trigger)
    const { data: profile, error } = await client
      .from('user_profiles')
      .select('followers_count, following_count')
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    // Check if current user is following target
    let isFollowing = false;
    let isFollowedBy = false;

    if (currentUserId && currentUserId !== targetUserId) {
      const { data: followCheck } = await client
        .from('followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .eq('status', 'active')
        .single();

      isFollowing = !!followCheck;

      const { data: followedByCheck } = await client
        .from('followers')
        .select('id')
        .eq('follower_id', targetUserId)
        .eq('following_id', currentUserId)
        .eq('status', 'active')
        .single();

      isFollowedBy = !!followedByCheck;
    }

    return {
      success: true,
      data: {
        followers_count: profile?.followers_count || 0,
        following_count: profile?.following_count || 0,
        is_following: isFollowing,
        is_followed_by: isFollowedBy,
      },
    };
  } catch (error: any) {
    console.error('[FollowService] getFollowStats error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// CHECK IF FOLLOWING
// ============================================================

/**
 * Check if current user is following a target user
 */
export async function isFollowing(
  targetUserId: string,
  followerId?: string
): Promise<SocialServiceResponse<boolean>> {
  try {
    const client = getSupabase();
    let currentUserId = followerId;

    if (!currentUserId) {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }
      currentUserId = user.id;
    }

    const { data, error } = await client
      .from('followers')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { success: true, data: !!data };
  } catch (error: any) {
    console.error('[FollowService] isFollowing error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// SEARCH USERS
// ============================================================

/**
 * Search for users by username or display name
 */
export async function searchUsers(
  query: string,
  limit: number = 20
): Promise<SocialServiceResponse<any[]>> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('user_profiles')
      .select('user_id, username, display_name, avatar_url, bio, followers_count')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .eq('privacy_setting', 'public')
      .order('followers_count', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[FollowService] searchUsers error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  initFollowService,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStats,
  isFollowing,
  searchUsers,
};
