/**
 * ATHLETE PROGRAM GENERATOR - Team Edition
 *
 * Genera programmi di allenamento personalizzati basati su:
 * - Risultati dei test
 * - Profilo atleta (punti forti/deboli)
 * - Ruolo/posizione
 * - Fase della stagione
 * - Disponibilità settimanale
 */

import {
  AthleteProfile,
  AthleteScores,
  TrainingFrequency,
  AthleteType,
} from './athleteAssessment';

// ============================================
// TYPES
// ============================================

export interface GeneratedProgram {
  id: string;
  athlete_id: string;
  team_id: string;

  // Program info
  name: string;
  description: string;
  phase: SeasonPhase;
  duration_weeks: number;

  // Structure
  weekly_schedule: WeeklySchedule;
  mesocycle_structure: MesocycleStructure;

  // Targets
  goals: ProgramGoal[];
  kpis: KeyPerformanceIndicator[];

  // Metadata
  generated_at: string;
  based_on_assessment_id: string;
}

export type SeasonPhase =
  | 'off_season_early' // Ricostruzione base
  | 'off_season_late' // Sviluppo capacità
  | 'pre_season' // Preparazione specifica
  | 'in_season' // Mantenimento + performance
  | 'transition'; // Recupero attivo

export interface WeeklySchedule {
  days: DaySchedule[];
  total_sessions: number;
  total_volume_minutes: number;
}

export interface DaySchedule {
  day_number: number; // 1-7
  day_name: string;
  is_rest_day: boolean;
  sessions: TrainingSession[];
}

export interface TrainingSession {
  id: string;
  type: SessionType;
  title: string;
  duration_minutes: number;
  intensity: 'low' | 'moderate' | 'high' | 'max';
  rpe_target: number;

  // Content
  warmup?: WarmupBlock;
  main_block: MainBlock;
  cooldown?: CooldownBlock;

  // Notes
  notes?: string;
  equipment_needed?: string[];
}

export type SessionType =
  | 'strength'
  | 'power'
  | 'aerobic_low' // Zona 2
  | 'aerobic_threshold' // Soglia
  | 'aerobic_vo2max' // Interval VO2max
  | 'anaerobic_alactic' // Sprint brevi
  | 'anaerobic_lactic' // RSA, navette
  | 'speed'
  | 'agility'
  | 'mobility'
  | 'recovery'
  | 'mixed'; // Combinato

export interface WarmupBlock {
  duration_minutes: number;
  exercises: WarmupExercise[];
}

export interface WarmupExercise {
  name: string;
  duration?: string; // "2 min" or reps
  notes?: string;
}

export interface MainBlock {
  type: 'strength' | 'conditioning' | 'mixed';
  exercises?: StrengthExercise[];
  conditioning?: ConditioningBlock;
}

export interface StrengthExercise {
  name: string;
  pattern: string; // 'squat', 'hinge', 'push', etc.
  sets: number;
  reps: string;
  rest: string;
  intensity?: string; // "75% 1RM" or "RPE 7"
  rir_target?: number;
  tempo?: string;
  notes?: string;
  video_url?: string;
}

export interface ConditioningBlock {
  type: ConditioningType;
  description: string;
  intervals?: IntervalProtocol;
  continuous?: ContinuousProtocol;
}

export type ConditioningType =
  | 'continuous' // Corsa continua
  | 'interval' // Lavoro intervallato
  | 'fartlek' // Variazioni libere
  | 'circuit' // Circuito metabolico
  | 'game_based'; // Small sided games

export interface IntervalProtocol {
  work_duration: string; // "30s" or "200m"
  rest_duration: string;
  repetitions: number;
  sets?: number;
  rest_between_sets?: string;
  intensity: string; // "90% max HR" or "max effort"
}

export interface ContinuousProtocol {
  duration_minutes: number;
  intensity: string; // "Zone 2" or "65-75% max HR"
  distance_target?: number; // meters
}

export interface CooldownBlock {
  duration_minutes: number;
  exercises: CooldownExercise[];
}

export interface CooldownExercise {
  name: string;
  duration: string;
  notes?: string;
}

export interface MesocycleStructure {
  weeks: MesocycleWeek[];
  deload_week: number; // Which week is deload
  progression_type: 'linear' | 'undulating' | 'block';
}

export interface MesocycleWeek {
  week_number: number;
  focus: string;
  volume_modifier: number; // 1.0 = normal, 0.7 = deload
  intensity_modifier: number;
}

export interface ProgramGoal {
  category: string;
  description: string;
  target_value?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface KeyPerformanceIndicator {
  name: string;
  baseline_value: number;
  target_value: number;
  unit: string;
}

// ============================================
// PROGRAM GENERATOR
// ============================================

export interface ProgramGeneratorInput {
  athlete_id: string;
  team_id: string;
  assessment_id: string;

  // From assessment
  scores: AthleteScores;
  profile: AthleteProfile;

  // Context
  sport: string;
  position?: string;
  phase: SeasonPhase;

  // Constraints
  available_days: number[]; // [1,2,3,4,5] = Mon-Fri
  max_session_duration: number; // minutes
  equipment_available: string[];

  // Optional overrides
  priority_override?: string[]; // Force specific focus areas
}

/**
 * Main function to generate personalized program
 */
export function generateAthleteProgram(input: ProgramGeneratorInput): GeneratedProgram {
  const {
    athlete_id,
    team_id,
    assessment_id,
    scores,
    profile,
    sport,
    position,
    phase,
    available_days,
    max_session_duration,
  } = input;

  // 1. Determine training priorities
  const priorities = input.priority_override || profile.areas_to_improve;
  const frequency = adjustFrequencyForPhase(profile.recommended_frequency, phase);

  // 2. Generate weekly schedule
  const weeklySchedule = generateWeeklySchedule({
    available_days,
    frequency,
    priorities,
    profile,
    phase,
    sport,
    position,
    max_session_duration,
  });

  // 3. Generate mesocycle structure
  const mesocycle = generateMesocycleStructure(phase, profile.athlete_type);

  // 4. Set goals and KPIs
  const goals = generateGoals(priorities, phase);
  const kpis = generateKPIs(scores, priorities);

  // 5. Generate program name
  const programName = generateProgramName(phase, profile.athlete_type, position);

  return {
    id: crypto.randomUUID(),
    athlete_id,
    team_id,
    name: programName,
    description: `Programma personalizzato per fase ${phase}. Focus: ${priorities.slice(0, 2).join(', ')}`,
    phase,
    duration_weeks: getMesocycleDuration(phase),
    weekly_schedule: weeklySchedule,
    mesocycle_structure: mesocycle,
    goals,
    kpis,
    generated_at: new Date().toISOString(),
    based_on_assessment_id: assessment_id,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function adjustFrequencyForPhase(
  base: TrainingFrequency,
  phase: SeasonPhase
): TrainingFrequency {
  const adjusted = { ...base };

  switch (phase) {
    case 'off_season_early':
      // High volume, moderate intensity
      adjusted.strength_sessions = Math.min(4, base.strength_sessions + 1);
      adjusted.aerobic_sessions = Math.min(4, base.aerobic_sessions + 1);
      adjusted.sport_practice = 2;
      break;

    case 'off_season_late':
      // Build specific capacities
      adjusted.power_sessions = Math.min(3, base.power_sessions + 1);
      adjusted.anaerobic_sessions = Math.min(3, base.anaerobic_sessions + 1);
      adjusted.sport_practice = 3;
      break;

    case 'pre_season':
      // Sport-specific, high intensity
      adjusted.strength_sessions = 2;
      adjusted.power_sessions = 2;
      adjusted.anaerobic_sessions = 2;
      adjusted.sport_practice = 5;
      break;

    case 'in_season':
      // Maintenance, recovery focus
      adjusted.strength_sessions = Math.max(1, base.strength_sessions - 1);
      adjusted.aerobic_sessions = 1;
      adjusted.mobility_sessions = Math.min(3, base.mobility_sessions + 1);
      adjusted.sport_practice = 5;
      break;

    case 'transition':
      // Active recovery
      adjusted.strength_sessions = 1;
      adjusted.aerobic_sessions = 2; // Low intensity
      adjusted.mobility_sessions = 3;
      adjusted.sport_practice = 0;
      break;
  }

  adjusted.total_sessions =
    adjusted.strength_sessions +
    adjusted.power_sessions +
    adjusted.aerobic_sessions +
    adjusted.anaerobic_sessions;

  return adjusted;
}

function generateWeeklySchedule(config: {
  available_days: number[];
  frequency: TrainingFrequency;
  priorities: string[];
  profile: AthleteProfile;
  phase: SeasonPhase;
  sport: string;
  position?: string;
  max_session_duration: number;
}): WeeklySchedule {
  const {
    available_days,
    frequency,
    priorities,
    profile,
    phase,
    sport,
    max_session_duration,
  } = config;

  const days: DaySchedule[] = [];

  // Create all 7 days
  for (let d = 1; d <= 7; d++) {
    const isTrainingDay = available_days.includes(d);
    const dayName = getDayName(d);

    if (!isTrainingDay) {
      days.push({
        day_number: d,
        day_name: dayName,
        is_rest_day: true,
        sessions: [],
      });
      continue;
    }

    // Determine sessions for this day based on frequency and priorities
    const sessions = planSessionsForDay(d, available_days, frequency, priorities, profile, phase, max_session_duration);

    days.push({
      day_number: d,
      day_name: dayName,
      is_rest_day: sessions.length === 0,
      sessions,
    });
  }

  // Calculate totals
  const allSessions = days.flatMap(d => d.sessions);
  const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration_minutes, 0);

  return {
    days,
    total_sessions: allSessions.length,
    total_volume_minutes: totalMinutes,
  };
}

function planSessionsForDay(
  dayNumber: number,
  availableDays: number[],
  frequency: TrainingFrequency,
  priorities: string[],
  profile: AthleteProfile,
  phase: SeasonPhase,
  maxDuration: number
): TrainingSession[] {
  const sessions: TrainingSession[] = [];

  // Simple distribution logic
  const dayIndex = availableDays.indexOf(dayNumber);
  if (dayIndex === -1) return sessions;

  const totalTrainingDays = availableDays.length;

  // Strength days (typically early in week)
  if (frequency.strength_sessions > 0 && dayIndex < frequency.strength_sessions) {
    const strengthFocus = priorities.includes('strength') ? 'priority' : 'maintenance';
    sessions.push(generateStrengthSession(strengthFocus, profile, phase, maxDuration));
  }

  // Power/Speed days (mid-week, when fresh)
  if (frequency.power_sessions > 0 && dayIndex === Math.floor(totalTrainingDays / 2)) {
    sessions.push(generatePowerSession(profile, phase, maxDuration));
  }

  // Conditioning days
  if (dayIndex >= totalTrainingDays - 2 && frequency.aerobic_sessions > 0) {
    const conditioningType = priorities.includes('aerobic_capacity')
      ? 'development'
      : 'maintenance';
    sessions.push(generateConditioningSession(conditioningType, profile, phase, maxDuration));
  }

  // Add mobility if needed
  if (sessions.length === 0 && frequency.mobility_sessions > 0) {
    sessions.push(generateMobilitySession(profile, maxDuration));
  }

  return sessions;
}

function generateStrengthSession(
  focus: 'priority' | 'maintenance',
  profile: AthleteProfile,
  phase: SeasonPhase,
  maxDuration: number
): TrainingSession {
  const isPriority = focus === 'priority';
  const duration = Math.min(maxDuration, isPriority ? 75 : 60);

  // Adjust parameters based on phase
  const phaseParams = getStrengthPhaseParams(phase);

  const exercises: StrengthExercise[] = [
    // Lower body primary
    {
      name: 'Back Squat',
      pattern: 'squat',
      sets: phaseParams.sets,
      reps: phaseParams.reps,
      rest: phaseParams.rest,
      rir_target: phaseParams.rir,
      intensity: `${phaseParams.intensity}% 1RM`,
    },
    // Hinge
    {
      name: 'Romanian Deadlift',
      pattern: 'hinge',
      sets: phaseParams.sets - 1,
      reps: String(parseInt(phaseParams.reps) + 2),
      rest: '90s',
      rir_target: phaseParams.rir + 1,
    },
    // Upper push
    {
      name: 'Bench Press',
      pattern: 'horizontal_push',
      sets: phaseParams.sets,
      reps: phaseParams.reps,
      rest: phaseParams.rest,
      rir_target: phaseParams.rir,
    },
    // Upper pull
    {
      name: 'Weighted Pull-up',
      pattern: 'vertical_pull',
      sets: phaseParams.sets - 1,
      reps: String(parseInt(phaseParams.reps) - 2),
      rest: '90s',
      rir_target: phaseParams.rir,
    },
  ];

  // Add injury prevention if high risk
  if (profile.injury_risk_score > 5) {
    exercises.push({
      name: 'Nordic Hamstring Curl',
      pattern: 'knee_flexion',
      sets: 3,
      reps: '4-6',
      rest: '60s',
      rir_target: 2,
      notes: 'Injury prevention - focus on eccentric control',
    });
  }

  return {
    id: crypto.randomUUID(),
    type: 'strength',
    title: `Forza ${isPriority ? 'Sviluppo' : 'Mantenimento'}`,
    duration_minutes: duration,
    intensity: phase === 'in_season' ? 'moderate' : 'high',
    rpe_target: isPriority ? 8 : 7,
    warmup: {
      duration_minutes: 10,
      exercises: [
        { name: 'Bike/Row', duration: '5 min', notes: 'Graduale' },
        { name: 'Dynamic stretching', duration: '3 min' },
        { name: 'Movement prep', duration: '2 min' },
      ],
    },
    main_block: {
      type: 'strength',
      exercises,
    },
    cooldown: {
      duration_minutes: 5,
      exercises: [
        { name: 'Static stretching', duration: '5 min' },
      ],
    },
  };
}

function generatePowerSession(
  profile: AthleteProfile,
  phase: SeasonPhase,
  maxDuration: number
): TrainingSession {
  const duration = Math.min(maxDuration, 60);

  const exercises: StrengthExercise[] = [
    // Plyometrics
    {
      name: 'Box Jump',
      pattern: 'jump',
      sets: 4,
      reps: '5',
      rest: '90s',
      notes: 'Focus on explosive takeoff, soft landing',
    },
    {
      name: 'Broad Jump',
      pattern: 'jump',
      sets: 3,
      reps: '5',
      rest: '60s',
    },
    // Olympic lifts (simplified)
    {
      name: 'Hang Power Clean',
      pattern: 'olympic',
      sets: 4,
      reps: '3',
      rest: '2min',
      intensity: '70-80% 1RM',
      notes: 'Speed over load',
    },
    // Loaded jumps
    {
      name: 'Trap Bar Jump',
      pattern: 'loaded_jump',
      sets: 3,
      reps: '5',
      rest: '90s',
      intensity: '30% BW',
    },
  ];

  return {
    id: crypto.randomUUID(),
    type: 'power',
    title: 'Potenza Esplosiva',
    duration_minutes: duration,
    intensity: 'high',
    rpe_target: 7, // Not to failure for power
    warmup: {
      duration_minutes: 15,
      exercises: [
        { name: 'Jog', duration: '5 min' },
        { name: 'Dynamic mobility', duration: '5 min' },
        { name: 'CNS activation (sprints, jumps)', duration: '5 min' },
      ],
    },
    main_block: {
      type: 'strength',
      exercises,
    },
    cooldown: {
      duration_minutes: 5,
      exercises: [
        { name: 'Light stretching', duration: '5 min' },
      ],
    },
  };
}

function generateConditioningSession(
  focus: 'development' | 'maintenance',
  profile: AthleteProfile,
  phase: SeasonPhase,
  maxDuration: number
): TrainingSession {
  const duration = Math.min(maxDuration, 45);
  const isDevelopment = focus === 'development';

  // Choose protocol based on athlete type and focus
  let conditioning: ConditioningBlock;

  if (profile.athlete_type === 'power_dominant' || phase === 'pre_season') {
    // High intensity intervals for power athletes or pre-season
    conditioning = {
      type: 'interval',
      description: 'Interval ad alta intensità per sviluppo capacità anaerobica',
      intervals: {
        work_duration: '30s',
        rest_duration: '30s',
        repetitions: 8,
        sets: 3,
        rest_between_sets: '3min',
        intensity: '85-90% max HR',
      },
    };
  } else if (phase === 'off_season_early') {
    // Aerobic base building
    conditioning = {
      type: 'continuous',
      description: 'Corsa continua Zona 2 per costruzione base aerobica',
      continuous: {
        duration_minutes: isDevelopment ? 35 : 25,
        intensity: 'Zone 2 (65-75% max HR)',
      },
    };
  } else {
    // Mixed - game simulation
    conditioning = {
      type: 'interval',
      description: 'RSA - Repeated Sprint Ability',
      intervals: {
        work_duration: '6s sprint',
        rest_duration: '24s',
        repetitions: 6,
        sets: 4,
        rest_between_sets: '4min',
        intensity: 'Max effort',
      },
    };
  }

  return {
    id: crypto.randomUUID(),
    type: isDevelopment ? 'aerobic_threshold' : 'aerobic_low',
    title: `Conditioning ${isDevelopment ? 'Sviluppo' : 'Mantenimento'}`,
    duration_minutes: duration,
    intensity: isDevelopment ? 'high' : 'moderate',
    rpe_target: isDevelopment ? 8 : 6,
    warmup: {
      duration_minutes: 10,
      exercises: [
        { name: 'Jog progressivo', duration: '5 min' },
        { name: 'Dynamic drills', duration: '5 min' },
      ],
    },
    main_block: {
      type: 'conditioning',
      conditioning,
    },
    cooldown: {
      duration_minutes: 5,
      exercises: [
        { name: 'Walk', duration: '3 min' },
        { name: 'Stretching', duration: '2 min' },
      ],
    },
  };
}

function generateMobilitySession(
  profile: AthleteProfile,
  maxDuration: number
): TrainingSession {
  const duration = Math.min(maxDuration, 30);

  const exercises: StrengthExercise[] = [
    {
      name: 'Cat-Cow',
      pattern: 'spine_mobility',
      sets: 2,
      reps: '10',
      rest: '0s',
    },
    {
      name: 'World\'s Greatest Stretch',
      pattern: 'full_body',
      sets: 2,
      reps: '5 each side',
      rest: '0s',
    },
    {
      name: '90/90 Hip Stretch',
      pattern: 'hip_mobility',
      sets: 2,
      reps: '30s each side',
      rest: '0s',
    },
    {
      name: 'Wall Ankle Stretch',
      pattern: 'ankle_mobility',
      sets: 2,
      reps: '30s each side',
      rest: '0s',
    },
    {
      name: 'Thoracic Rotation',
      pattern: 'spine_mobility',
      sets: 2,
      reps: '10 each side',
      rest: '0s',
    },
  ];

  // Add specific exercises for problem areas
  if (profile.injury_risk_areas.includes('ankle')) {
    exercises.push({
      name: 'Banded Ankle Mobilization',
      pattern: 'ankle_mobility',
      sets: 3,
      reps: '15 each',
      rest: '0s',
    });
  }

  if (profile.injury_risk_areas.includes('hip')) {
    exercises.push({
      name: 'Hip CARS',
      pattern: 'hip_mobility',
      sets: 2,
      reps: '5 each direction',
      rest: '0s',
    });
  }

  return {
    id: crypto.randomUUID(),
    type: 'mobility',
    title: 'Mobilità & Recovery',
    duration_minutes: duration,
    intensity: 'low',
    rpe_target: 3,
    main_block: {
      type: 'strength', // Using strength structure for simplicity
      exercises,
    },
    notes: 'Focus on breath and controlled movements',
  };
}

function getStrengthPhaseParams(phase: SeasonPhase): {
  sets: number;
  reps: string;
  rest: string;
  rir: number;
  intensity: number;
} {
  switch (phase) {
    case 'off_season_early':
      return { sets: 4, reps: '8-10', rest: '90s', rir: 3, intensity: 70 };
    case 'off_season_late':
      return { sets: 4, reps: '5-6', rest: '2min', rir: 2, intensity: 80 };
    case 'pre_season':
      return { sets: 3, reps: '4-5', rest: '2-3min', rir: 2, intensity: 85 };
    case 'in_season':
      return { sets: 3, reps: '3-5', rest: '2-3min', rir: 2, intensity: 85 };
    case 'transition':
      return { sets: 2, reps: '10-12', rest: '60s', rir: 4, intensity: 60 };
    default:
      return { sets: 3, reps: '6-8', rest: '90s', rir: 2, intensity: 75 };
  }
}

function generateMesocycleStructure(
  phase: SeasonPhase,
  athleteType: AthleteType
): MesocycleStructure {
  const duration = getMesocycleDuration(phase);
  const weeks: MesocycleWeek[] = [];

  for (let i = 1; i <= duration; i++) {
    const isDeload = i === duration;

    weeks.push({
      week_number: i,
      focus: isDeload ? 'Deload/Recovery' : `Week ${i} - Progressive overload`,
      volume_modifier: isDeload ? 0.6 : 1.0 + (i - 1) * 0.05, // Slight increase each week
      intensity_modifier: isDeload ? 0.7 : 1.0,
    });
  }

  return {
    weeks,
    deload_week: duration,
    progression_type: phase === 'in_season' ? 'undulating' : 'linear',
  };
}

function getMesocycleDuration(phase: SeasonPhase): number {
  switch (phase) {
    case 'off_season_early':
      return 4;
    case 'off_season_late':
      return 4;
    case 'pre_season':
      return 3;
    case 'in_season':
      return 2; // Shorter cycles during competition
    case 'transition':
      return 2;
    default:
      return 4;
  }
}

function generateGoals(priorities: string[], phase: SeasonPhase): ProgramGoal[] {
  const goals: ProgramGoal[] = [];

  priorities.forEach((priority, index) => {
    goals.push({
      category: priority,
      description: getGoalDescription(priority, phase),
      priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
    });
  });

  return goals;
}

function getGoalDescription(priority: string, phase: SeasonPhase): string {
  const descriptions: Record<string, Record<SeasonPhase, string>> = {
    strength: {
      off_season_early: 'Costruire base di forza con volume moderato',
      off_season_late: 'Aumentare forza massimale e relativa',
      pre_season: 'Convertire forza in potenza sport-specifica',
      in_season: 'Mantenere livelli di forza con volume ridotto',
      transition: 'Recovery attivo, mantenimento base',
    },
    aerobic_capacity: {
      off_season_early: 'Costruire solida base aerobica (VO2max)',
      off_season_late: 'Sviluppare soglia anaerobica',
      pre_season: 'Affinare capacità aerobica sport-specifica',
      in_season: 'Mantenere fitness aerobico',
      transition: 'Recovery aerobico leggero',
    },
    power: {
      off_season_early: 'Introdurre lavoro pliometrico di base',
      off_season_late: 'Sviluppare potenza esplosiva',
      pre_season: 'Massimizzare transfer sport-specifico',
      in_season: 'Mantenere reattività e esplosività',
      transition: 'Recovery completo',
    },
    mobility: {
      off_season_early: 'Migliorare ROM articolare globale',
      off_season_late: 'Focus su limitazioni specifiche',
      pre_season: 'Ottimizzare mobilità per performance',
      in_season: 'Mantenere mobilità, prevenire infortuni',
      transition: 'Lavoro approfondito su restrizioni',
    },
  };

  return descriptions[priority]?.[phase] || `Migliorare ${priority}`;
}

function generateKPIs(scores: AthleteScores, priorities: string[]): KeyPerformanceIndicator[] {
  const kpis: KeyPerformanceIndicator[] = [];

  if (priorities.includes('strength') || priorities.includes('power')) {
    kpis.push({
      name: 'CMJ Height',
      baseline_value: 35, // Would come from assessment
      target_value: 38,
      unit: 'cm',
    });
  }

  if (priorities.includes('aerobic_capacity')) {
    kpis.push({
      name: 'Yo-Yo IR1',
      baseline_value: 1800, // Would come from assessment
      target_value: 2000,
      unit: 'm',
    });
  }

  if (priorities.includes('speed') || priorities.includes('anaerobic_alactic')) {
    kpis.push({
      name: 'Sprint 30m',
      baseline_value: 4.3, // Would come from assessment
      target_value: 4.15,
      unit: 's',
    });
  }

  return kpis;
}

function generateProgramName(
  phase: SeasonPhase,
  athleteType: AthleteType,
  position?: string
): string {
  const phaseNames: Record<SeasonPhase, string> = {
    off_season_early: 'Base Building',
    off_season_late: 'Development',
    pre_season: 'Pre-Season Prep',
    in_season: 'In-Season Performance',
    transition: 'Active Recovery',
  };

  const positionStr = position ? ` - ${position}` : '';
  return `${phaseNames[phase]}${positionStr}`;
}

function getDayName(dayNumber: number): string {
  const names = ['', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  return names[dayNumber] || '';
}

// ============================================
// EXPORTS
// ============================================

export default {
  generateAthleteProgram,
};
