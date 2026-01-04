/**
 * Types per Exercise Adaptation System
 * TrainSmart - Sistema di adattamento esercizi
 *
 * Gestisce l'adattamento del programma quando l'utente segnala fastidio.
 * NON è un sistema di riabilitazione - è ottimizzazione del training.
 */

// =============================================================================
// BODY AREAS
// =============================================================================

/** Zone del corpo tracciate per fastidio */
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
  'elbow'
];

/** Labels leggibili per le zone del corpo */
export const BODY_AREA_LABELS: Record<TrackedBodyArea, string> = {
  lower_back: 'Zona lombare',
  knee: 'Ginocchio',
  shoulder: 'Spalla',
  neck: 'Collo',
  hip: 'Anca',
  ankle: 'Caviglia',
  wrist: 'Polso',
  elbow: 'Gomito'
};

// =============================================================================
// ADAPTATION SYSTEM
// =============================================================================

/** Status dell'adattamento */
export type AdaptationStatus = 'active' | 'paused' | 'resolved' | 'abandoned';

/**
 * Livelli di adattamento (NON fasi cliniche)
 *
 * Livello 1: Esercizi molto leggeri, focus su movimento senza carico
 * Livello 2: Carico leggero, progressione controllata
 * Livello 3: Ritorno al programma normale
 */
export type AdaptationLevel = 1 | 2 | 3;

export const ADAPTATION_LEVELS: Record<
  AdaptationLevel,
  { name: string; description: string; loadMultiplier: number }
> = {
  1: {
    name: 'Leggero',
    description: 'Esercizi a basso impatto, focus sul movimento corretto',
    loadMultiplier: 0.5
  },
  2: {
    name: 'Moderato',
    description: 'Carico progressivo con attenzione alla zona sensibile',
    loadMultiplier: 0.75
  },
  3: {
    name: 'Normale',
    description: 'Programma standard senza restrizioni',
    loadMultiplier: 1.0
  }
};

// =============================================================================
// DISCOMFORT TRACKING
// =============================================================================

/** Tracking del fastidio per zona */
export interface DiscomfortTracking {
  id?: number;
  user_id: string;
  body_area: TrackedBodyArea;
  consecutive_sessions: number;
  first_reported: string;
  last_reported: string;
  last_session_without_discomfort?: string;
  adaptation_offered: boolean;
  adaptation_accepted: boolean;
  adaptation_started_at?: string;
  created_at?: string;
  updated_at?: string;
}

/** Riepilogo fastidio per dashboard */
export interface DiscomfortSummary {
  body_area: TrackedBodyArea;
  consecutive_sessions: number;
  first_reported: string;
  last_reported: string;
  adaptation_offered: boolean;
  adaptation_accepted: boolean;
}

// =============================================================================
// ACTIVE ADAPTATION
// =============================================================================

/** Adattamento attivo per una zona */
export interface ActiveAdaptation {
  id: number;
  user_id: string;
  body_area: TrackedBodyArea;
  current_level: AdaptationLevel;
  sessions_completed: number;
  comfortable_sessions: number; // Sessioni senza fastidio
  started_at: string;
  last_session_at?: string;
  resolved_at?: string;
  status: AdaptationStatus;
  notes?: string;
}

/** Sessione di adattamento completata */
export interface AdaptationSession {
  id?: number;
  user_id: string;
  adaptation_id: number;
  body_area: TrackedBodyArea;
  level: AdaptationLevel;
  exercises_completed: AdaptationExerciseLog[];
  discomfort_level: number; // 0-10, dove 0 = nessun fastidio
  duration_minutes?: number;
  completed_at?: string;
  notes?: string;
}

/** Log singolo esercizio in sessione adattamento */
export interface AdaptationExerciseLog {
  exercise_name: string;
  sets_completed: number;
  reps_completed: number | string;
  discomfort_during: number; // 0-10
  notes?: string;
}

// =============================================================================
// ADAPTATION ROUTINES
// =============================================================================

/** Singolo esercizio in una routine di adattamento */
export interface AdaptationExercise {
  name: string;
  sets: number;
  reps: number | string;
  rest: number; // secondi
  level: AdaptationLevel;
  description: string;
  videoRef?: string;
}

/** Routine di adattamento per una zona */
export interface AdaptationRoutine {
  body_area: TrackedBodyArea;
  name: string;
  levels: Record<AdaptationLevel, AdaptationExercise[]>;
  notes: string;
  estimatedDuration: number; // minuti
}

// =============================================================================
// SERVICE RESPONSES
// =============================================================================

/** Response quando si segnala fastidio post-workout */
export interface ReportDiscomfortResponse {
  tracked: boolean;
  areas_updated: TrackedBodyArea[];
  adaptation_triggered: boolean;
  triggered_areas: TrackedBodyArea[];
  message: string;
}

/** Response quando si risponde all'offerta di adattamento */
export interface RespondToAdaptationResponse {
  success: boolean;
  adaptation_started: boolean;
  adaptation_id?: number;
  message: string;
}

/** Response completamento sessione adattamento */
export interface CompleteAdaptationSessionResponse {
  success: boolean;
  level_up: boolean; // true se passa al livello successivo
  new_level?: AdaptationLevel;
  resolved: boolean; // true se adattamento completato
  message: string;
}

/** Response completamento adattamento */
export interface CompleteAdaptationResponse {
  success: boolean;
  total_sessions: number;
  days_to_resolution: number;
  message: string;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/** Input per segnalare fastidio */
export interface ReportDiscomfortInput {
  user_id: string;
  body_areas: TrackedBodyArea[];
  session_id?: string;
}

/** Input per rispondere a offerta adattamento */
export interface RespondToAdaptationInput {
  user_id: string;
  body_area: TrackedBodyArea;
  accepted: boolean;
}

/** Input per completare sessione adattamento */
export interface CompleteAdaptationSessionInput {
  user_id: string;
  adaptation_id: number;
  exercises_completed: AdaptationExerciseLog[];
  discomfort_level: number;
  notes?: string;
}

// =============================================================================
// DASHBOARD
// =============================================================================

/** Card per dashboard adattamento */
export interface AdaptationDashboardCard {
  body_area: TrackedBodyArea;
  body_area_label: string;
  status: AdaptationStatus;
  current_level: AdaptationLevel;
  level_name: string;
  sessions_completed: number;
  comfortable_sessions: number;
  progress_percentage: number;
  next_session_available: boolean;
  started_at: string;
  last_session_at?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Sessioni consecutive con fastidio per triggerare offerta adattamento */
export const DISCOMFORT_THRESHOLD = 2;

/** Sessioni senza fastidio per passare al livello successivo */
export const SESSIONS_TO_LEVEL_UP = 3;

/** Sessioni senza fastidio a livello 3 per risolvere */
export const SESSIONS_TO_RESOLVE = 2;

// =============================================================================
// LEGACY COMPATIBILITY (per migrazione graduale)
// =============================================================================

// Alias per retrocompatibilità durante la migrazione
/** @deprecated Use TrackedBodyArea instead */
export type PainArea = TrackedBodyArea;

/** @deprecated Use DiscomfortTracking instead */
export type PainTracking = DiscomfortTracking;

/** @deprecated Use AdaptationLevel instead */
export type RehabilitationPhase = AdaptationLevel;

/** @deprecated Use ADAPTATION_LEVELS instead */
export const REHABILITATION_PHASES = ADAPTATION_LEVELS;

/** @deprecated Use ActiveAdaptation instead */
export type ActiveRehabilitation = ActiveAdaptation;

/** @deprecated Use AdaptationSession instead */
export type RehabilitationSession = AdaptationSession;

/** @deprecated Use AdaptationExerciseLog instead */
export type RehabilitationExerciseLog = AdaptationExerciseLog;

/** @deprecated Use AdaptationExercise instead */
export type RehabilitationExercise = AdaptationExercise;

/** @deprecated Use AdaptationRoutine instead */
export type RehabilitationProgram = AdaptationRoutine;

/** @deprecated Use ReportDiscomfortResponse instead */
export type ReportPainResponse = ReportDiscomfortResponse;

/** @deprecated Use RespondToAdaptationResponse instead */
export type RespondToRehabilitationResponse = RespondToAdaptationResponse;

/** @deprecated Use CompleteAdaptationSessionResponse instead */
export type CompleteRehabSessionResponse = CompleteAdaptationSessionResponse;

/** @deprecated Use CompleteAdaptationResponse instead */
export type CompleteRehabilitationResponse = CompleteAdaptationResponse;

/** @deprecated Use AdaptationDashboardCard instead */
export type RehabilitationDashboardCard = AdaptationDashboardCard;

/** @deprecated Use BODY_AREA_LABELS instead */
export const PAIN_TO_REHAB_MAPPING = BODY_AREA_LABELS;

/** @deprecated Use PainTrackingSummary instead */
export type PainTrackingSummary = DiscomfortSummary;

/** @deprecated Use ReportDiscomfortInput instead */
export type ReportPainInput = ReportDiscomfortInput;

/** @deprecated Use RespondToAdaptationInput instead */
export type RespondToRehabilitationInput = RespondToAdaptationInput;

/** @deprecated Use CompleteAdaptationSessionInput instead */
export type CompleteRehabSessionInput = CompleteAdaptationSessionInput;
