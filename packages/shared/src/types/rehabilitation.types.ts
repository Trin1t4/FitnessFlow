/**
 * Types per Pain Tracking & Rehabilitation System
 * Sistema di rieducazione motoria parallela
 */

// Zone del corpo tracciate per dolore
export type TrackedBodyArea =
  | 'lower_back'
  | 'knee'
  | 'shoulder'
  | 'neck'
  | 'hip'
  | 'ankle'
  | 'wrist'
  | 'elbow';

export const TRACKED_BODY_AREAS: TrackedBodyArea[] = [
  'lower_back',
  'knee',
  'shoulder',
  'neck',
  'hip',
  'ankle',
  'wrist',
  'elbow',
];

// Mapping zone dolore → programmi rieducazione
export const PAIN_TO_REHAB_MAPPING: Record<TrackedBodyArea, string> = {
  neck: 'neck_mobility',
  shoulder: 'shoulder_mobility',
  lower_back: 'lower_back',
  hip: 'hip_mobility',
  knee: 'knee',
  ankle: 'ankle_mobility',
  wrist: 'wrist_mobility',
  elbow: 'elbow_mobility',
};

// Status rieducazione
export type RehabilitationStatus = 'active' | 'paused' | 'completed' | 'abandoned';

// Fasi rieducazione (1 = mobility, 2 = stability, 3 = strength)
export type RehabilitationPhase = 1 | 2 | 3;

export const REHABILITATION_PHASES: Record<RehabilitationPhase, { name: string; description: string }> = {
  1: {
    name: 'Mobility',
    description: 'Focus su mobilità articolare e riduzione dolore',
  },
  2: {
    name: 'Stability',
    description: 'Rinforzo stabilizzatori e controllo motorio',
  },
  3: {
    name: 'Strength',
    description: 'Progressione verso forza funzionale',
  },
};

// =============================================
// Pain Tracking Types
// =============================================

export interface PainTracking {
  id?: number;
  user_id: string;
  body_area: TrackedBodyArea;
  consecutive_sessions: number;
  first_reported: string;
  last_reported: string;
  last_session_without_pain?: string;
  rehabilitation_offered: boolean;
  rehabilitation_accepted: boolean;
  rehabilitation_started_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PainTrackingSummary {
  body_area: TrackedBodyArea;
  consecutive_sessions: number;
  first_reported: string;
  last_reported: string;
  rehabilitation_offered: boolean;
  rehabilitation_accepted: boolean;
}

// =============================================
// Active Rehabilitation Types
// =============================================

export interface ActiveRehabilitation {
  id: number;
  user_id: string;
  body_area: TrackedBodyArea;
  current_phase: RehabilitationPhase;
  sessions_completed: number;
  pain_free_sessions: number;
  started_at: string;
  last_session_at?: string;
  completed_at?: string;
  status: RehabilitationStatus;
  notes?: string;
}

export interface RehabilitationSession {
  id?: number;
  user_id: string;
  rehabilitation_id: number;
  body_area: TrackedBodyArea;
  phase: RehabilitationPhase;
  exercises_completed: RehabilitationExerciseLog[];
  pain_level: number; // 0-10
  duration_minutes?: number;
  completed_at?: string;
  notes?: string;
}

export interface RehabilitationExerciseLog {
  name: string;
  sets_completed: number;
  reps_completed: number | string;
  pain_during?: number; // 0-10, dolore durante esercizio
  notes?: string;
}

// =============================================
// Rehabilitation Program Types
// =============================================

export interface RehabilitationExercise {
  name: string;
  sets: number;
  reps: number | string;
  rest: number; // secondi
  phase: RehabilitationPhase;
  video_url?: string;
  description?: string;
  cues?: string[];
}

export interface RehabilitationProgram {
  body_area: TrackedBodyArea;
  name: string;
  phases: {
    [key in RehabilitationPhase]: RehabilitationExercise[];
  };
  notes?: string;
}

// =============================================
// API Response Types
// =============================================

export interface ReportPainResponse {
  success: boolean;
  trigger_rehabilitation: boolean;
  body_area?: TrackedBodyArea;
  message?: string;
}

export interface RespondToRehabilitationResponse {
  success: boolean;
  rehabilitation_id?: number;
  message: string;
}

export interface CompleteRehabSessionResponse {
  success: boolean;
  sessions_completed: number;
  pain_free_sessions: number;
  current_phase: RehabilitationPhase;
  phase_advanced: boolean;
  suggest_completion: boolean;
  error?: string;
}

export interface CompleteRehabilitationResponse {
  success: boolean;
  message: string;
}

// =============================================
// Service Input Types
// =============================================

export interface ReportPainInput {
  userId: string;
  painAreas: TrackedBodyArea[];
}

export interface RespondToRehabilitationInput {
  userId: string;
  bodyArea: TrackedBodyArea;
  accepted: boolean;
}

export interface CompleteRehabSessionInput {
  userId: string;
  bodyArea: TrackedBodyArea;
  exercisesCompleted: RehabilitationExerciseLog[];
  painLevel: number;
  durationMinutes?: number;
  notes?: string;
}

// =============================================
// UI/Dashboard Types
// =============================================

export interface RehabilitationDashboardCard {
  id: number;
  bodyArea: TrackedBodyArea;
  bodyAreaLabel: string;
  currentPhase: RehabilitationPhase;
  phaseLabel: string;
  sessionsCompleted: number;
  painFreeSessions: number;
  startedAt: string;
  lastSessionAt?: string;
  progressPercentage: number; // 0-100
  suggestCompletion: boolean;
}

// Labels localizzati per le zone del corpo
export const BODY_AREA_LABELS: Record<TrackedBodyArea, { it: string; en: string }> = {
  lower_back: { it: 'Schiena Lombare', en: 'Lower Back' },
  knee: { it: 'Ginocchio', en: 'Knee' },
  shoulder: { it: 'Spalla', en: 'Shoulder' },
  neck: { it: 'Collo', en: 'Neck' },
  hip: { it: 'Anca', en: 'Hip' },
  ankle: { it: 'Caviglia', en: 'Ankle' },
  wrist: { it: 'Polso', en: 'Wrist' },
  elbow: { it: 'Gomito', en: 'Elbow' },
};
