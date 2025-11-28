/**
 * Types - Export Centrale
 * Import centralizzato: import { OnboardingData, Program, etc } from '@/types'
 */

// Onboarding
export type {
  TrainingLocation,
  TrainingType,
  Goal,
  Level,
  PersonalInfo,
  Equipment,
  ActivityLevel,
  PainArea,
  PainSeverity,
  PainEntry,
  OnboardingData,
  CompleteOnboardingData,
} from './onboarding.types';

// Program & Screening
export type {
  PatternId,
  PatternBaseline,
  PatternBaselines,
  ScreeningData,
  Exercise,
  Program,
  WeeklySchedule,
  WorkoutExercise,
  VolumeCalculation,
} from './program.types';

// Team Management
export type {
  UserMode,
  TeamRole,
  Team,
  TeamMember,
  PlayerData,
  TeamProgram,
  TeamInvite,
  CreateTeamForm,
  AddPlayerForm,
  ModeSelectionState,
} from './team.types';
