/**
 * Quick Start Types
 *
 * Tipi per il nuovo flusso di onboarding rapido (3 minuti)
 * che sposta la raccolta dati alle prime 4 sessioni di allenamento.
 */

// ============================================================
// FASE 1: QUICK START DATA (3 minuti)
// ============================================================

export type QuickStartGoal =
  | 'forza'
  | 'massa'
  | 'dimagrimento'
  | 'resistenza'
  | 'generale';

export type QuickStartLocation = 'home' | 'gym';

export type ExperienceLevel = 'never' | 'sometimes' | 'regularly';

export interface QuickStartExperience {
  squat: ExperienceLevel;
  push: ExperienceLevel;
  hinge: ExperienceLevel;
}

export interface QuickStartData {
  goal: QuickStartGoal;
  location: QuickStartLocation;
  frequency: 2 | 3 | 4 | 5 | 6;
  painAreas: string[]; // vuoto se nessun dolore
  experience: QuickStartExperience;
  // Optional: peso corporeo (solo se gym + pesi)
  bodyWeight?: number;
}

// ============================================================
// LIVELLO INIZIALE E PARAMETRI CONSERVATIVI
// ============================================================

export type InitialLevel = 'beginner' | 'intermediate';

export interface ConservativeProgramParams {
  level: InitialLevel;
  minRIR: number;           // RIR minimo (4 per beginner, 3 per intermediate)
  heavyDaysAllowed: boolean; // false fino a calibrazione
  weeklyVolume: {
    min: number;            // set/gruppo
    max: number;
  };
  maxIntensity: number;     // % 1RM (70% beginner, 75% intermediate)
  autoProgressionEnabled: boolean; // false fino a calibrazione
}

// ============================================================
// STRATEGIA PESI INIZIALI
// ============================================================

export type InitialWeightStrategyType = 'bodyweight' | 'weighted';

export interface BodyweightStrategy {
  type: 'bodyweight';
  strategy: 'easiest_variant';
  progressionUnlocked: boolean;
}

export interface WeightedStrategy {
  type: 'weighted';
  strategy: 'feeler_sets';
  // Percentuali del peso corporeo (conservative)
  initialEstimates: {
    squat: number;     // 30-50% BW
    bench: number;     // 20-35% BW
    deadlift: number;  // 40-60% BW
    row: number;       // 15-25% BW
    press: number;     // 10-20% BW
  };
}

export type InitialWeightStrategy = BodyweightStrategy | WeightedStrategy;

// ============================================================
// FASE 2: CALIBRAZIONE PROGRESSIVA (Sessioni 1-4)
// ============================================================

// Sessione 1: Feeler Sets
export interface FeelerSetFeedback {
  label: string;
  adjustment: number; // % di aggiustamento peso
}

export const FEELER_SET_OPTIONS: FeelerSetFeedback[] = [
  { label: 'Troppo facile (potevo farne 10+)', adjustment: 0.15 },
  { label: 'Abbastanza facile (potevo farne 7-8)', adjustment: 0.075 },
  { label: 'Giusto (potevo farne 5-6)', adjustment: 0 },
  { label: 'Pesante (faticavo a finire)', adjustment: -0.10 },
  { label: 'Troppo pesante (non riuscivo)', adjustment: -0.20 },
];

export interface FeelerSetResult {
  exerciseName: string;
  initialWeight: number;
  feelerRPE: number;
  adjustedWeight: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface Session1Calibration {
  weightsDiscovered: Record<string, FeelerSetResult>;
  sessionRPE: number;
  painReported: PainReport[];
  timestamp: string;
}

// Sessione 2: Validazione Pesi + RIR
export interface RIRPerception {
  exerciseName: string;
  reportedRIR: number[];  // Per ogni set
  avgRIR: number;
  consistencyScore: number; // 0-1, quanto varia tra i set
}

export interface Session2Calibration {
  rirPerception: Record<string, RIRPerception>;
  weightAdjustments: Record<string, number>; // % aggiustamento suggerito
  timestamp: string;
}

// Sessione 3: Pain Pattern Check
export type RecoveryTrend = 'improving' | 'stable' | 'worsening';

export interface PainEvolution {
  area: string;
  trend: 'better' | 'same' | 'worse';
}

export interface Session3Calibration {
  recoveryTrend: RecoveryTrend;
  painEvolution: PainEvolution[];
  substitutionsNeeded: string[]; // Esercizi da sostituire
  timestamp: string;
}

// Sessione 4: Unlock Assessment
export interface UnlockAssessment {
  unlock: boolean;
  reason: string;
  sessionsCompleted: number;
  rirConsistency: number;     // 0-1
  painTrend: RecoveryTrend;
  avgSessionRPE: number;
}

// ============================================================
// CALIBRATION DATA COMPLETO
// ============================================================

export interface CalibrationData {
  userId: string;
  quickStartData: QuickStartData;
  sessionsCompleted: number;
  session1?: Session1Calibration;
  session2?: Session2Calibration;
  session3?: Session3Calibration;
  unlockAssessment?: UnlockAssessment;
  intermediateModeUnlocked: boolean;
  quizCompleted: boolean;
  quizScore?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PAIN REPORT (durante sessione)
// ============================================================

export interface PainReport {
  area: string;
  intensity: number; // 1-10
  setNumber?: number;
  exerciseName?: string;
  action: 'continued' | 'reduced' | 'substituted' | 'stopped';
}

// ============================================================
// SESSION DATA (raccolta automatica ogni sessione)
// ============================================================

export interface SessionExerciseData {
  name: string;
  pattern: string;
  setsCompleted: number;
  setsPlanned: number;
  rirReported: number[];    // Per ogni set
  painDuring: PainReport[];
  userChoice: 'continued' | 'reduced' | 'substituted' | 'stopped';
}

export interface SessionData {
  timestamp: string;
  weekNumber: number;
  dayNumber: number;

  // Pre-workout
  preWorkoutPain: {
    areas: string[];
    trend: RecoveryTrend;
  };

  // Durante
  exercises: SessionExerciseData[];

  // Post
  sessionRPE: number;
  sessionDuration: number; // minuti
  postWorkoutPain: string[]; // Zone che fanno male dopo
}

// ============================================================
// WEEKLY CHECK (domenica)
// ============================================================

export type WeeklySkipReason = 'pain' | 'time' | 'motivation' | 'other';

export interface WeeklyCheck {
  weekNumber: number;
  painTrend: RecoveryTrend;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  skippedDays: number;
  skipReason?: WeeklySkipReason;
  timestamp: string;
}

// ============================================================
// FEELER SET CONFIG (per esercizi)
// ============================================================

export interface FeelerSetConfig {
  enabled: boolean;
  reps: number;           // es: 5
  targetRPE: number;      // es: 4 (deve sembrare facile)
  percentageOfWorking: number; // es: 0.5 (50% del peso di lavoro)
}

// ============================================================
// QUIZ TECNICO RIDOTTO
// ============================================================

export interface TechQuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface TechQuizResult {
  score: number;         // 0-100
  passed: boolean;       // score >= 60
  unlockedFeatures: {
    heavyDays: boolean;
    autoProgression: boolean;
    volumeBoost: boolean;  // +20%
    advancedVariants: boolean;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

export const CALIBRATION_SESSIONS_REQUIRED = 4;

export const EXPERIENCE_SCORE_MAP: Record<ExperienceLevel, number> = {
  never: 0,
  sometimes: 1,
  regularly: 2,
};

export const CONSERVATIVE_PARAMS: Record<InitialLevel, ConservativeProgramParams> = {
  beginner: {
    level: 'beginner',
    minRIR: 4,
    heavyDaysAllowed: false,
    weeklyVolume: { min: 10, max: 12 },
    maxIntensity: 70,
    autoProgressionEnabled: false,
  },
  intermediate: {
    level: 'intermediate',
    minRIR: 3,
    heavyDaysAllowed: false, // Sbloccato dopo calibrazione
    weeklyVolume: { min: 12, max: 14 },
    maxIntensity: 75,
    autoProgressionEnabled: false, // Sbloccato dopo calibrazione
  },
};

export const INITIAL_WEIGHT_ESTIMATES = {
  beginner: {
    squat: 0.3,     // 30% BW
    bench: 0.2,     // 20% BW
    deadlift: 0.4,  // 40% BW
    row: 0.15,      // 15% BW
    press: 0.1,     // 10% BW
  },
  intermediate: {
    squat: 0.5,     // 50% BW
    bench: 0.35,    // 35% BW
    deadlift: 0.6,  // 60% BW
    row: 0.25,      // 25% BW
    press: 0.2,     // 20% BW
  },
};

export const RIR_CONSISTENCY_THRESHOLD = 0.6;
export const MAX_SESSION_RPE_FOR_UNLOCK = 8;
