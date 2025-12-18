/**
 * Social Service
 * TrainSmart/TeamFlow v4.1.0
 *
 * Manages social posts, likes, comments, and feed
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  SocialPost,
  PostComment,
  PostType,
  PostVisibility,
  PostMetadata,
  FeedFilters,
  FeedPagination,
  FeedResponse,
  LikeResponse,
  CommentResponse,
  SocialServiceResponse,
} from '../types/social.types';

// ============================================================
// DEPENDENCY INJECTION
// ============================================================

let supabase: SupabaseClient | null = null;

export function initSocialService(client: SupabaseClient): void {
  supabase = client;
  console.log('[SocialService] Initialized');
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('[SocialService] Supabase client not initialized. Call initSocialService first.');
  }
  return supabase;
}

// ============================================================
// CREATE POST
// ============================================================

/**
 * Create a new social post
 */
export async function createPost(
  postType: PostType,
  metadata: PostMetadata,
  options?: {
    title?: string;
    content?: string;
    visibility?: PostVisibility;
    imageUrl?: string;
    workoutLogId?: string;
    personalRecordId?: string;
    achievementId?: string;
  }
): Promise<SocialServiceResponse<SocialPost>> {
  try {
    const client = getSupabase();

    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    const { data, error } = await client
      .from('social_posts')
      .insert({
        user_id: user.id,
        post_type: postType,
        title: options?.title,
        content: options?.content,
        metadata,
        visibility: options?.visibility || 'public',
        image_url: options?.imageUrl,
        workout_log_id: options?.workoutLogId,
        personal_record_id: options?.personalRecordId,
        achievement_id: options?.achievementId,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[SocialService] createPost error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET POST
// ============================================================

/**
 * Get a single post by ID
 */
export async function getPost(
  postId: string
): Promise<SocialServiceResponse<SocialPost>> {
  try {
    const client = getSupabase();

    const { data: { user } } = await client.auth.getUser();
    const currentUserId = user?.id;

    const { data, error } = await client
      .from('social_posts')
      .select(`
        *,
        user:user_profiles(user_id, username, display_name, avatar_url)
      `)
      .eq('id', postId)
      .eq('is_deleted', false)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Check if current user liked this post
    if (currentUserId && data) {
      const { data: like } = await client
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .single();

      data.is_liked = !!like;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[SocialService] getPost error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET FEED
// ============================================================

/**
 * Get social feed with pagination
 */
export async function getFeed(
  filters?: FeedFilters,
  page: number = 1,
  limit: number = 20
): Promise<SocialServiceResponse<FeedResponse>> {
  try {
    const client = getSupabase();

    const { data: { user } } = await client.auth.getUser();
    const currentUserId = user?.id;

    let query = client
      .from('social_posts')
      .select(`
        *,
        user:user_profiles(user_id, username, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('is_deleted', false);

    // Apply filters
    if (filters?.post_types && filters.post_types.length > 0) {
      query = query.in('post_type', filters.post_types);
    }

    if (filters?.user_ids && filters.user_ids.length > 0) {
      query = query.in('user_id', filters.user_ids);
    }

    if (filters?.from_date) {
      query = query.gte('created_at', filters.from_date);
    }

    if (filters?.to_date) {
      query = query.lte('created_at', filters.to_date);
    }

    // Filter by visibility (handled by RLS, but we can be explicit)
    if (!filters?.following_only) {
      query = query.eq('visibility', 'public');
    }

    // Order and paginate
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    // Check liked status for each post
    if (currentUserId && data) {
      const postIds = data.map(p => p.id);
      const { data: likes } = await client
        .from('post_likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', postIds);

      const likedPostIds = new Set((likes || []).map(l => l.post_id));
      data.forEach(post => {
        post.is_liked = likedPostIds.has(post.id);
      });
    }

    return {
      success: true,
      data: {
        posts: data || [],
        pagination: {
          page,
          limit,
          total_count: count || 0,
          has_more: (count || 0) > page * limit,
        },
      },
    };
  } catch (error: any) {
    console.error('[SocialService] getFeed error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// GET USER POSTS
// ============================================================

/**
 * Get posts by a specific user
 */
export async function getUserPosts(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<SocialServiceResponse<FeedResponse>> {
  return getFeed({ user_ids: [userId] }, page, limit);
}

// ============================================================
// GET FOLLOWING FEED
// ============================================================

/**
 * Get feed from users the current user follows
 */
export async function getFollowingFeed(
  page: number = 1,
  limit: number = 20
): Promise<SocialServiceResponse<FeedResponse>> {
  try {
    const client = getSupabase();

    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    // Get following IDs
    const { data: following } = await client
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id)
      .eq('status', 'active');

    if (!following || following.length === 0) {
      return {
        success: true,
        data: {
          posts: [],
          pagination: { page, limit, total_count: 0, has_more: false },
        },
      };
    }

    const followingIds = following.map(f => f.following_id);

    // Include own posts too
    followingIds.push(user.id);

    return getFeed({ user_ids: followingIds }, page, limit);
  } catch (error: any) {
    console.error('[SocialService] getFollowingFeed error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DELETE POST
// ============================================================

/**
 * Delete a post (soft delete)
 */
export async function deletePost(
  postId: string
): Promise<SocialServiceResponse<void>> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('social_posts')
      .update({ is_deleted: true })
      .eq('id', postId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[SocialService] deletePost error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// LIKE POST
// ============================================================

/**
 * Like a post
 */
export async function likePost(
  postId: string
): Promise<LikeResponse> {
  try {
    const client = getSupabase();

    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { success: false, error: 'No authenticated user', new_likes_count: 0 };
    }

    // Check if already liked
    const { data: existing } = await client
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Get current count
      const { data: post } = await client
        .from('social_posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      return {
        success: false,
        error: 'Already liked',
        new_likes_count: post?.likes_count || 0,
      };
    }

    const { data, error } = await client
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, new_likes_count: 0 };
    }

    // Get updated count
    const { data: post } = await client
      .from('social_posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    return {
      success: true,
      data,
      new_likes_count: post?.likes_count || 0,
    };
  } catch (error: any) {
    console.error('[SocialService] likePost error:', error);
    return { success: false, error: error.message, new_likes_count: 0 };
  }
}

// ============================================================
// UNLIKE POST
// ============================================================

/**
 * Unlike a post
 */
export async function unlikePost(
  postId: string
): Promise<LikeResponse> {
  try {
    const client = getSupabase();

    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { success: false, error: 'No authenticated user', new_likes_count: 0 };
    }

    const { error } = await client
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message, new_likes_count: 0 };
    }

    // Get updated count
    const { data: post } = await client
      .from('social_posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    return {
      success: true,
      new_likes_count: post?.likes_count || 0,
    };
  } catch (error: any) {
    console.error('[SocialService] unlikePost error:', error);
    return { success: false, error: error.message, new_likes_count: 0 };
  }
}

// ============================================================
// ADD COMMENT
// ============================================================

/**
 * Add a comment to a post
 */
export async function addComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<CommentResponse> {
  try {
    const client = getSupabase();

    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { success: false, error: 'No authenticated user', new_comments_count: 0 };
    }

    const { data, error } = await client
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        parent_id: parentId,
      })
      .select(`
        *,
        user:user_profiles(user_id, username, display_name, avatar_url)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message, new_comments_count: 0 };
    }

    // Get updated count
    const { data: post } = await client
      .from('social_posts')
      .select('comments_count')
      .eq('id', postId)
      .single();

    return {
      success: true,
      data,
      new_comments_count: post?.comments_count || 0,
    };
  } catch (error: any) {
    console.error('[SocialService] addComment error:', error);
    return { success: false, error: error.message, new_comments_count: 0 };
  }
}

// ============================================================
// GET COMMENTS
// ============================================================

/**
 * Get comments for a post
 */
export async function getComments(
  postId: string,
  limit: number = 50
): Promise<SocialServiceResponse<PostComment[]>> {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('post_comments')
      .select(`
        *,
        user:user_profiles(user_id, username, display_name, avatar_url)
      `)
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .is('parent_id', null) // Top-level comments only
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    // Get replies for each comment
    if (data && data.length > 0) {
      const commentIds = data.map(c => c.id);
      const { data: replies } = await client
        .from('post_comments')
        .select(`
          *,
          user:user_profiles(user_id, username, display_name, avatar_url)
        `)
        .in('parent_id', commentIds)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      // Attach replies to their parents
      if (replies) {
        const repliesByParent: Record<string, PostComment[]> = {};
        for (const reply of replies) {
          if (!repliesByParent[reply.parent_id]) {
            repliesByParent[reply.parent_id] = [];
          }
          repliesByParent[reply.parent_id].push(reply);
        }

        for (const comment of data) {
          comment.replies = repliesByParent[comment.id] || [];
        }
      }
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('[SocialService] getComments error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DELETE COMMENT
// ============================================================

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(
  commentId: string
): Promise<SocialServiceResponse<void>> {
  try {
    const client = getSupabase();

    const { error } = await client
      .from('post_comments')
      .update({ is_deleted: true })
      .eq('id', commentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[SocialService] deleteComment error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  initSocialService,
  createPost,
  getPost,
  getFeed,
  getUserPosts,
  getFollowingFeed,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
};
