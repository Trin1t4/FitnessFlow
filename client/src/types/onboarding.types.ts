/**
 * Onboarding Types - Centralizzato
 * Definizioni complete per il flow di onboarding
 */

export type TrainingLocation = 'gym' | 'home';

export type TrainingType = 'bodyweight' | 'equipment' | 'machines';

export type Goal =
  | 'forza'
  | 'massa'
  | 'massa muscolare'
  | 'endurance'
  | 'general_fitness'
  | 'motor_recovery'
  | 'sport_performance';

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface PersonalInfo {
  gender: 'M' | 'F' | 'Other';
  age: number;
  height: number; // cm
  weight: number; // kg
  bmi: number;
}

export interface BodyPhotos {
  front?: string;
  side?: string;
  back?: string;
}

export interface Equipment {
  pullupBar?: boolean;
  loopBands?: boolean;
  dumbbells?: boolean;
  dumbbellMaxKg?: number;
  barbell?: boolean;
  kettlebell?: boolean;
  kettlebellKg?: number;
  bench?: boolean;
  rings?: boolean;
  parallelBars?: boolean;
}

export interface ActivityLevel {
  weeklyFrequency: number; // days per week
  sessionDuration: number; // minutes
}

export type PainArea = 'knee' | 'shoulder' | 'lower_back' | 'wrist' | 'ankle' | 'elbow' | 'hip';

export type PainSeverity = 'mild' | 'moderate' | 'severe';

export interface PainEntry {
  area: PainArea;
  severity: PainSeverity;
}

export interface OnboardingData {
  // Step 1: Personal Info
  personalInfo?: PersonalInfo;

  // Step 2: Photo Analysis
  bodyPhotos?: BodyPhotos;

  // Step 3: Location & Equipment
  trainingLocation?: TrainingLocation;
  trainingType?: TrainingType;
  equipment?: Equipment;

  // Step 4: Activity Level
  activityLevel?: ActivityLevel;

  // Step 5: Goal
  goal?: Goal;
  sport?: string; // if goal is sport_performance
  sportRole?: string;

  // Step 6: Pain/Injury
  painAreas?: PainEntry[];
}

/**
 * Tipo per validare completezza onboarding
 */
export type CompleteOnboardingData = Required<Omit<OnboardingData, 'sport' | 'sportRole' | 'painAreas'>> & {
  painAreas: PainEntry[];
};
