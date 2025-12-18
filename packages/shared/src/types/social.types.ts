/**
 * Social Features Types
 * TrainSmart/TeamFlow v4.1.0
 */

// ============================================================
// USER PROFILE (Social Extension)
// ============================================================

export interface UserProfileSocial {
  user_id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  privacy_setting: 'public' | 'followers_only' | 'private';
  followers_count: number;
  following_count: number;
  total_workouts: number;
  total_volume: number;
}

// ============================================================
// FOLLOWERS
// ============================================================

export type FollowStatus = 'pending' | 'active' | 'blocked';

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  status: FollowStatus;
  created_at: string;
}

export interface FollowerWithProfile extends Follower {
  follower?: UserProfileSocial;
  following?: UserProfileSocial;
}

export interface FollowStats {
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_followed_by: boolean;
}

// ============================================================
// PERSONAL RECORDS
// ============================================================

export type RecordType = '1rm' | 'max_reps' | 'max_weight' | 'best_volume';

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  exercise_pattern?: string;
  record_type: RecordType;
  value: number;
  weight_used?: number;
  reps_at_weight?: number;
  previous_value?: number;
  improvement_percent?: number;
  workout_log_id?: string;
  achieved_at: string;
  notes?: string;
  verified: boolean;
  created_at: string;
}

export interface PersonalRecordHistory {
  id: string;
  personal_record_id: string;
  user_id: string;
  value: number;
  weight_used?: number;
  achieved_at: string;
  created_at: string;
}

export interface PRSummary {
  exercise_name: string;
  exercise_pattern?: string;
  current_value: number;
  previous_value?: number;
  improvement_percent?: number;
  achieved_at: string;
  is_new: boolean;
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

export type AchievementCategory = 'consistency' | 'strength' | 'volume' | 'milestone' | 'special';
export type AchievementRequirementType = 'count' | 'streak' | 'value' | 'time';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  code: string;
  name_it: string;
  name_en: string;
  description_it?: string;
  description_en?: string;
  icon: string;
  badge_color: string;
  category: AchievementCategory;
  requirement_type: AchievementRequirementType;
  requirement_value: number;
  requirement_unit?: string;
  rarity: AchievementRarity;
  points: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement?: Achievement;
  unlocked_at: string;
  trigger_workout_id?: string;
  trigger_value?: number;
  shared: boolean;
  shared_at?: string;
}

export interface AchievementProgress {
  achievement: Achievement;
  current_value: number;
  target_value: number;
  progress_percent: number;
  is_unlocked: boolean;
  unlocked_at?: string;
}

export interface AchievementUnlockEvent {
  achievement: Achievement;
  user_achievement: UserAchievement;
  trigger_context?: {
    workout_id?: string;
    exercise_name?: string;
    value?: number;
  };
}

// ============================================================
// SOCIAL POSTS
// ============================================================

export type PostType =
  | 'workout_completed'
  | 'pr_achieved'
  | 'streak_milestone'
  | 'achievement_unlocked'
  | 'custom'
  | 'workout_summary';

export type PostVisibility = 'public' | 'followers_only' | 'private';

export interface SocialPost {
  id: string;
  user_id: string;
  user?: UserProfileSocial;
  post_type: PostType;
  title?: string;
  content?: string;
  metadata: PostMetadata;
  image_url?: string;
  workout_log_id?: string;
  personal_record_id?: string;
  achievement_id?: string;
  visibility: PostVisibility;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_pinned: boolean;
  is_deleted: boolean;
  is_liked?: boolean; // Computed field for current user
  created_at: string;
  updated_at: string;
}

// Metadata types per post type
export interface WorkoutCompletedMetadata {
  duration_minutes: number;
  exercises_count: number;
  session_rpe?: number;
  day_name?: string;
  split_type?: string;
  total_volume?: number;
  top_exercises?: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }>;
}

export interface PRAchievedMetadata {
  exercise_name: string;
  exercise_pattern?: string;
  old_value?: number;
  new_value: number;
  improvement_percent?: number;
  unit: string;
  record_type: RecordType;
}

export interface StreakMilestoneMetadata {
  streak_days: number;
  streak_type: 'current' | 'longest';
  milestone: number; // 7, 30, 100, etc.
}

export interface AchievementUnlockedMetadata {
  achievement_code: string;
  achievement_name: string;
  achievement_icon: string;
  achievement_rarity: AchievementRarity;
  points: number;
}

export type PostMetadata =
  | WorkoutCompletedMetadata
  | PRAchievedMetadata
  | StreakMilestoneMetadata
  | AchievementUnlockedMetadata
  | Record<string, any>;

// ============================================================
// LIKES & COMMENTS
// ============================================================

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  user?: UserProfileSocial;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  user?: UserProfileSocial;
  parent_id?: string;
  content: string;
  likes_count: number;
  is_deleted: boolean;
  is_liked?: boolean;
  replies?: PostComment[];
  created_at: string;
  updated_at: string;
}

// ============================================================
// WORKOUT STREAKS
// ============================================================

export interface WorkoutStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date?: string;
  workouts_this_month: number;
  volume_this_month: number;
  workouts_this_week: number;
  updated_at: string;
}

export interface StreakMilestone {
  days: number;
  name_it: string;
  name_en: string;
  achieved: boolean;
  achieved_at?: string;
}

// ============================================================
// SHARE CARD
// ============================================================

export type ShareCardType = 'workout' | 'pr' | 'streak' | 'achievement';

export interface ShareCardData {
  type: ShareCardType;
  title: string;
  subtitle?: string;
  stats: Array<{
    label: string;
    value: string | number;
    icon?: string;
  }>;
  date: string;
  userName: string;
  userAvatar?: string;
  accentColor?: string;
  backgroundGradient?: [string, string];
}

export interface WorkoutShareCardData extends ShareCardData {
  type: 'workout';
  duration: number;
  exercisesCount: number;
  sessionRpe?: number;
  topExercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }>;
  totalVolume?: number;
}

export interface PRShareCardData extends ShareCardData {
  type: 'pr';
  exerciseName: string;
  newValue: number;
  previousValue?: number;
  improvementPercent?: number;
  unit: string;
}

export interface StreakShareCardData extends ShareCardData {
  type: 'streak';
  currentStreak: number;
  longestStreak: number;
  workoutsThisMonth: number;
}

export interface AchievementShareCardData extends ShareCardData {
  type: 'achievement';
  achievementCode: string;
  achievementName: string;
  achievementIcon: string;
  achievementRarity: AchievementRarity;
  points: number;
}

// ============================================================
// SOCIAL SHARING
// ============================================================

export type SharePlatform = 'instagram' | 'whatsapp' | 'twitter' | 'facebook' | 'native' | 'download' | 'copy';

export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
  imageBlob?: Blob;
  imageUrl?: string;
  platform: SharePlatform;
}

export interface ShareResult {
  success: boolean;
  platform: SharePlatform;
  error?: string;
}

// ============================================================
// FEED
// ============================================================

export interface FeedFilters {
  post_types?: PostType[];
  user_ids?: string[];
  following_only?: boolean;
  from_date?: string;
  to_date?: string;
}

export interface FeedPagination {
  page: number;
  limit: number;
  total_count?: number;
  has_more: boolean;
}

export interface FeedResponse {
  posts: SocialPost[];
  pagination: FeedPagination;
}

// ============================================================
// SERVICE RESPONSES
// ============================================================

export interface SocialServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FollowResponse extends SocialServiceResponse<Follower> {
  is_new_follow?: boolean;
}

export interface LikeResponse extends SocialServiceResponse<PostLike> {
  new_likes_count: number;
}

export interface CommentResponse extends SocialServiceResponse<PostComment> {
  new_comments_count: number;
}

export interface PRDetectionResult {
  is_new_pr: boolean;
  personal_record?: PersonalRecord;
  improvement?: {
    old_value: number;
    new_value: number;
    percent: number;
  };
}

// ============================================================
// NOTIFICATIONS (Future)
// ============================================================

export type NotificationType =
  | 'new_follower'
  | 'post_liked'
  | 'post_commented'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'new_pr';

export interface SocialNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}
