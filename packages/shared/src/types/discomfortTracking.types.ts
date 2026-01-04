/**
 * Discomfort Tracking Types
 * TrainSmart - Tipi per il sistema di tracking fastidio
 *
 * Sistema SEMPLICE che:
 * - Registra dove l'utente sente fastidio
 * - Riduce automaticamente il carico
 * - Suggerisce professionista se persiste
 *
 * NON include:
 * - Fasi/livelli di progressione
 * - Routine di esercizi strutturate
 * - Protocolli per condizioni specifiche
 */

// ============================================================
// BODY AREAS
// ============================================================

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

/** Labels leggibili per le zone */
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

// ============================================================
// DISCOMFORT TRACKING
// ============================================================

/** Record di fastidio nel database */
export interface DiscomfortRecord {
  id?: number;
  user_id: string;
  body_area: TrackedBodyArea;
  /** Quante sessioni consecutive con fastidio */
  consecutive_sessions: number;
  /** Prima volta segnalato */
  first_reported: string;
  /** Ultima volta segnalato */
  last_reported: string;
  /** Se la riduzione carico è attiva */
  load_reduction_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Riepilogo per UI */
export interface DiscomfortSummary {
  body_area: TrackedBodyArea;
  body_area_label: string;
  consecutive_sessions: number;
  load_multiplier: number;
  should_consult_professional: boolean;
}

// ============================================================
// STATUS (per il generatore di programmi)
// ============================================================

/** Stato completo fastidio per un utente */
export interface DiscomfortStatus {
  /** Zone con fastidio attivo */
  areas_affected: TrackedBodyArea[];
  /** Moltiplicatore carico per zona (es: 0.6 = 60% del normale) */
  load_multipliers: Record<TrackedBodyArea, number>;
  /** Almeno una zona ha fastidio ricorrente */
  should_consult_professional: boolean;
  /** Zone specifiche per cui consultare */
  professional_recommendation_areas: TrackedBodyArea[];
}

// ============================================================
// SERVICE RESPONSES
// ============================================================

/** Risposta quando si segnala fastidio */
export interface ReportDiscomfortResponse {
  success: boolean;
  /** Zone per cui è stata attivata riduzione carico */
  areas_with_reduction: TrackedBodyArea[];
  /** True se fastidio ricorrente (3+ sessioni) */
  consult_professional: boolean;
  /** Messaggio per l'utente */
  message: string;
}

// ============================================================
// INPUT TYPES
// ============================================================

/** Input per segnalare fastidio post-workout */
export interface ReportDiscomfortInput {
  user_id: string;
  /** Zone con fastidio (array vuoto = nessun fastidio) */
  body_areas: TrackedBodyArea[];
}

// ============================================================
// CONSTANTS
// ============================================================

/** Sessioni consecutive per suggerire professionista */
export const SESSIONS_FOR_PROFESSIONAL_ADVICE = 3;

/** Riduzione carico standard (fastidio presente) */
export const STANDARD_LOAD_REDUCTION = 0.6; // 60%

/** Riduzione carico per fastidio ricorrente */
export const RECURRING_LOAD_REDUCTION = 0.4; // 40%

// ============================================================
// LEGACY COMPATIBILITY (per migrazione graduale)
// ============================================================

// Questi alias permettono di migrare gradualmente senza rompere tutto

/** @deprecated Use TrackedBodyArea */
export type PainArea = TrackedBodyArea;

/** @deprecated Use DiscomfortRecord */
export interface PainTracking {
  id?: number;
  user_id: string;
  body_area: TrackedBodyArea;
  consecutive_sessions: number;
  first_reported: string;
  last_reported: string;
  rehabilitation_offered?: boolean;
  rehabilitation_accepted?: boolean;
}

/** @deprecated Use DiscomfortSummary */
export type PainTrackingSummary = DiscomfortSummary;

/** @deprecated Use ReportDiscomfortResponse */
export interface ReportPainResponse {
  tracked: boolean;
  areas_updated: TrackedBodyArea[];
  rehabilitation_triggered: boolean;
  triggered_areas: TrackedBodyArea[];
  message: string;
}

/** @deprecated Not needed anymore */
export type RehabilitationPhase = 1 | 2 | 3;

/** @deprecated Not needed anymore */
export type RehabilitationStatus = 'active' | 'paused' | 'completed';

/** @deprecated Not needed anymore */
export type AdaptationLevel = 1 | 2 | 3;

/** @deprecated Not needed anymore - use BODY_AREA_LABELS */
export const PAIN_TO_REHAB_MAPPING = BODY_AREA_LABELS;

/** @deprecated Not needed anymore */
export const REHABILITATION_PHASES = {
  1: { name: 'Mobility', description: 'N/A' },
  2: { name: 'Stability', description: 'N/A' },
  3: { name: 'Strength', description: 'N/A' }
};

/** @deprecated Not needed anymore */
export const ADAPTATION_LEVELS = REHABILITATION_PHASES;
