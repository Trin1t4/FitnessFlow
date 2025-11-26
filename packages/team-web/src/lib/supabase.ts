import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Team Edition
export interface Team {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  sport: string;
  category?: string;
  level?: string;
  season_start?: string;
  season_end?: string;
  current_phase: 'pre_season' | 'in_season' | 'off_season' | 'transition';
  subscription_tier: string;
  subscription_status: string;
  max_athletes: number;
  settings: TeamSettings;
  created_at: string;
}

export interface TeamSettings {
  require_daily_checkin: boolean;
  checkin_reminder_time: string;
  share_analytics_with_athletes: boolean;
  allow_athlete_program_view: boolean;
  injury_alert_threshold: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'coach' | 'assistant_coach' | 'physio' | 'nutritionist' | 'athlete';
  jersey_number?: number;
  position?: string;
  dominant_foot?: string;
  dominant_hand?: string;
  status: 'active' | 'injured' | 'recovering' | 'resting' | 'inactive';
  injury_notes?: string;
  return_date?: string;
  permissions: MemberPermissions;
  joined_at: string;
  last_active_at?: string;
  // Joined from auth.users
  user?: {
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export interface MemberPermissions {
  can_view_team_analytics: boolean;
  can_edit_own_program: boolean;
  can_view_other_athletes: boolean;
}

export interface AthleteCheckin {
  id: string;
  team_id: string;
  user_id: string;
  checkin_date: string;
  sleep_quality?: number;
  sleep_hours?: number;
  energy_level?: number;
  mood?: number;
  stress_level?: number;
  muscle_soreness?: number;
  soreness_areas?: string[];
  injury_pain?: number;
  injury_notes?: string;
  readiness_score?: number;
  available_for_training: boolean;
  unavailable_reason?: string;
  notes?: string;
  created_at: string;
}

export interface TeamSession {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  session_type: 'strength' | 'conditioning' | 'recovery' | 'mixed' | 'testing';
  scheduled_date: string;
  scheduled_time?: string;
  duration_minutes: number;
  location?: string;
  phase?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendance_count?: number;
  avg_rpe?: number;
}

export interface TeamAnalytics {
  id: string;
  team_id: string;
  date: string;
  total_athletes: number;
  checkins_completed: number;
  checkin_rate: number;
  avg_sleep_quality?: number;
  avg_energy_level?: number;
  avg_muscle_soreness?: number;
  avg_readiness_score?: number;
  workouts_completed: number;
  athletes_at_risk: number;
  athletes_injured: number;
}
