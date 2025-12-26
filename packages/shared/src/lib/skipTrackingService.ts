/**
 * SKIP TRACKING SERVICE
 *
 * Traccia quando l'utente salta esercizi e identifica pattern
 * per suggerire riduzioni di carico preventive.
 *
 * LOGICA:
 * - Se un utente salta esercizi dello stesso gruppo muscolare
 *   per 3 sedute consecutive → alert + suggerimento riduzione carico
 * - Riduzione suggerita: 15% per il gruppo muscolare interessato
 *
 * NOTE: Uses dependency injection for Supabase client.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ================================================================
// TYPES
// ================================================================

export type SkipReason = 'pain' | 'fatigue' | 'equipment' | 'time' | 'dislike' | 'other';

export type MuscleGroup =
  | 'shoulders'
  | 'chest'
  | 'back'
  | 'legs'
  | 'arms'
  | 'core'
  | 'glutes'
  | 'full_body';

export interface ExerciseSkip {
  id?: string;
  user_id: string;
  workout_log_id?: string;
  program_id?: string;
  exercise_name: string;
  pattern: string;
  muscle_group: MuscleGroup;
  skip_reason?: SkipReason;
  pain_area?: string;
  pain_level?: number;
  day_name?: string;
  session_number?: number;
  skipped_at?: string;
}

export interface SkipPatternAlert {
  id: string;
  user_id: string;
  program_id?: string;
  muscle_group: MuscleGroup;
  pattern?: string;
  consecutive_sessions: number;
  alert_type: 'load_reduction_suggested' | 'rest_suggested' | 'technique_check';
  suggested_action: string;
  load_reduction_percent: number;
  acknowledged: boolean;
  acknowledged_at?: string;
  action_taken?: 'accepted' | 'declined' | 'modified';
  created_at: string;
  expires_at: string;
}

export interface SkipStats {
  muscle_group: MuscleGroup;
  total_skips: number;
  unique_exercises: number;
  last_skip: string;
  skip_reasons: Record<SkipReason, number>;
}

// ================================================================
// PATTERN TO MUSCLE GROUP MAPPING
// ================================================================

const PATTERN_TO_MUSCLE_GROUP: Record<string, MuscleGroup> = {
  // Shoulders
  'vertical_push': 'shoulders',
  'shoulder_isolation': 'shoulders',
  'lateral_raise': 'shoulders',
  'front_raise': 'shoulders',
  'rear_delt': 'shoulders',

  // Chest
  'horizontal_push': 'chest',
  'chest_isolation': 'chest',
  'incline_push': 'chest',
  'decline_push': 'chest',

  // Back
  'horizontal_pull': 'back',
  'vertical_pull': 'back',
  'row': 'back',
  'pulldown': 'back',
  'back_isolation': 'back',

  // Legs
  'lower_push': 'legs',
  'lower_pull': 'legs',
  'squat': 'legs',
  'lunge': 'legs',
  'leg_curl': 'legs',
  'leg_extension': 'legs',
  'calf': 'legs',

  // Glutes
  'hip_hinge': 'glutes',
  'glute_isolation': 'glutes',
  'hip_thrust': 'glutes',
  'hip_abduction': 'glutes',

  // Arms
  'bicep': 'arms',
  'tricep': 'arms',
  'arm_isolation': 'arms',
  'curl': 'arms',
  'pushdown': 'arms',

  // Core
  'core': 'core',
  'abs': 'core',
  'anti_rotation': 'core',
  'anti_extension': 'core',
  'rotation': 'core',
  'carry': 'core',

  // Full body
  'compound': 'full_body',
  'olympic': 'full_body',
  'full_body': 'full_body',
};

// ================================================================
// MUSCLE GROUP DISPLAY NAMES (Italian)
// ================================================================

export const MUSCLE_GROUP_NAMES: Record<MuscleGroup, string> = {
  shoulders: 'Spalle',
  chest: 'Petto',
  back: 'Schiena',
  legs: 'Gambe',
  arms: 'Braccia',
  core: 'Core',
  glutes: 'Glutei',
  full_body: 'Full Body',
};

// ================================================================
// SERVICE
// ================================================================

let supabaseClient: SupabaseClient | null = null;

export function initSkipTrackingService(client: SupabaseClient) {
  supabaseClient = client;
}

function getClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('SkipTrackingService not initialized. Call initSkipTrackingService first.');
  }
  return supabaseClient;
}

/**
 * Map exercise pattern to muscle group
 */
export function patternToMuscleGroup(pattern: string): MuscleGroup {
  // Normalize pattern
  const normalized = pattern.toLowerCase().replace(/[-\s]/g, '_');

  // Direct match
  if (PATTERN_TO_MUSCLE_GROUP[normalized]) {
    return PATTERN_TO_MUSCLE_GROUP[normalized];
  }

  // Partial match
  for (const [key, group] of Object.entries(PATTERN_TO_MUSCLE_GROUP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return group;
    }
  }

  // Default
  return 'full_body';
}

/**
 * Log an exercise skip
 */
export async function logExerciseSkip(
  userId: string,
  exerciseName: string,
  pattern: string,
  options?: {
    workoutLogId?: string;
    programId?: string;
    skipReason?: SkipReason;
    painArea?: string;
    painLevel?: number;
    dayName?: string;
    sessionNumber?: number;
  }
): Promise<{ success: boolean; alert?: SkipPatternAlert; error?: string }> {
  const client = getClient();

  const muscleGroup = patternToMuscleGroup(pattern);

  const skipData: Partial<ExerciseSkip> = {
    user_id: userId,
    exercise_name: exerciseName,
    pattern: pattern,
    muscle_group: muscleGroup,
    workout_log_id: options?.workoutLogId,
    program_id: options?.programId,
    skip_reason: options?.skipReason,
    pain_area: options?.painArea,
    pain_level: options?.painLevel,
    day_name: options?.dayName,
    session_number: options?.sessionNumber,
  };

  // Insert skip record
  const { error: insertError } = await client
    .from('exercise_skips')
    .insert(skipData);

  if (insertError) {
    console.error('[SkipTracking] Error logging skip:', insertError);
    return { success: false, error: insertError.message };
  }

  console.log(`[SkipTracking] Logged skip: ${exerciseName} (${muscleGroup})`);

  // Check if this created a new alert (trigger handles this in DB)
  // But we also check here to return the alert immediately
  const { data: newAlert } = await client
    .from('skip_pattern_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('muscle_group', muscleGroup)
    .eq('acknowledged', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (newAlert) {
    console.log(`[SkipTracking] Alert created for ${muscleGroup}: ${newAlert.consecutive_sessions} consecutive sessions`);
  }

  return { success: true, alert: newAlert || undefined };
}

/**
 * Get all active skip alerts for a user
 */
export async function getActiveAlerts(userId: string): Promise<SkipPatternAlert[]> {
  const client = getClient();

  const { data, error } = await client
    .from('skip_pattern_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('acknowledged', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SkipTracking] Error fetching alerts:', error);
    return [];
  }

  return data || [];
}

/**
 * Acknowledge a skip pattern alert (user has seen it)
 */
export async function acknowledgeSkipAlert(
  alertId: string,
  actionTaken: 'accepted' | 'declined' | 'modified'
): Promise<boolean> {
  const client = getClient();

  const { error } = await client
    .from('skip_pattern_alerts')
    .update({
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      action_taken: actionTaken,
    })
    .eq('id', alertId);

  if (error) {
    console.error('[SkipTracking] Error acknowledging alert:', error);
    return false;
  }

  return true;
}

/**
 * Get skip statistics by muscle group
 */
export async function getSkipStats(
  userId: string,
  days: number = 30
): Promise<SkipStats[]> {
  const client = getClient();

  const { data, error } = await client
    .rpc('get_skip_stats_by_muscle_group', {
      p_user_id: userId,
      p_days: days,
    });

  if (error) {
    console.error('[SkipTracking] Error fetching skip stats:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if there's a skip pattern for a specific muscle group
 */
export async function checkSkipPattern(
  userId: string,
  muscleGroup: MuscleGroup,
  threshold: number = 3
): Promise<{
  hasPattern: boolean;
  consecutiveCount: number;
  exercisesSkipped: string[];
}> {
  const client = getClient();

  const { data, error } = await client
    .rpc('check_consecutive_skips', {
      p_user_id: userId,
      p_muscle_group: muscleGroup,
      p_sessions_threshold: threshold,
    });

  if (error || !data || data.length === 0) {
    return { hasPattern: false, consecutiveCount: 0, exercisesSkipped: [] };
  }

  const result = data[0];
  return {
    hasPattern: result.has_pattern,
    consecutiveCount: result.consecutive_count,
    exercisesSkipped: result.exercises_skipped || [],
  };
}

/**
 * Get recent skips for a user (for UI display)
 */
export async function getRecentSkips(
  userId: string,
  limit: number = 10
): Promise<ExerciseSkip[]> {
  const client = getClient();

  const { data, error } = await client
    .from('exercise_skips')
    .select('*')
    .eq('user_id', userId)
    .order('skipped_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[SkipTracking] Error fetching recent skips:', error);
    return [];
  }

  return data || [];
}

/**
 * Calculate suggested load reduction for a muscle group based on skip patterns
 */
export function calculateLoadReduction(consecutiveSessions: number): number {
  // Progressive reduction based on how many sessions skipped
  if (consecutiveSessions >= 5) return 25; // Very concerning pattern
  if (consecutiveSessions >= 4) return 20;
  if (consecutiveSessions >= 3) return 15; // Default threshold
  return 10;
}

/**
 * Generate feedback message for skip pattern
 */
export function generateSkipFeedback(
  muscleGroup: MuscleGroup,
  consecutiveSessions: number,
  loadReductionPercent: number
): string {
  const groupName = MUSCLE_GROUP_NAMES[muscleGroup];

  if (consecutiveSessions >= 5) {
    return `Hai saltato esercizi per ${groupName.toLowerCase()} nelle ultime ${consecutiveSessions} sedute. ` +
           `Per prevenire infortuni, abbiamo ridotto il carico del ${loadReductionPercent}%. ` +
           `Considera di consultare un professionista se il problema persiste.`;
  }

  if (consecutiveSessions >= 3) {
    return `Abbiamo notato che hai saltato esercizi per ${groupName.toLowerCase()} nelle ultime ${consecutiveSessions} sedute. ` +
           `Per aiutarti a riprendere in sicurezza, ti suggeriamo di ridurre il carico del ${loadReductionPercent}%.`;
  }

  return `Esercizi per ${groupName.toLowerCase()} saltati di recente. Monitoriamo la situazione.`;
}

// ================================================================
// EXPORT DEFAULT SERVICE OBJECT
// ================================================================

export const skipTrackingService = {
  init: initSkipTrackingService,
  patternToMuscleGroup,
  logExerciseSkip,
  getActiveAlerts,
  acknowledgeSkipAlert,
  getSkipStats,
  checkSkipPattern,
  getRecentSkips,
  calculateLoadReduction,
  generateSkipFeedback,
  MUSCLE_GROUP_NAMES,
};

export default skipTrackingService;
