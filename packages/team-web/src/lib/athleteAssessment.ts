/**
 * ATHLETE ASSESSMENT SYSTEM - Team Edition
 *
 * Batteria completa di test per valutare ogni capacità atletica:
 * - Forza & Potenza
 * - Capacità Aerobica
 * - Capacità Anaerobica (Alattacida + Lattacida)
 * - Velocità & Agilità
 * - Flessibilità & Mobilità
 *
 * Ogni test genera un punteggio normalizzato (1-100) per confronti
 */

// ============================================
// TYPES
// ============================================

export interface AthleteAssessment {
  id: string;
  team_id: string;
  user_id: string;
  assessment_date: string;
  assessed_by: string; // coach user_id

  // Test Results by Category
  strength_tests: StrengthTests;
  power_tests: PowerTests;
  aerobic_tests: AerobicTests;
  anaerobic_tests: AnaerobicTests;
  speed_agility_tests: SpeedAgilityTests;
  mobility_tests: MobilityTests;

  // Calculated Scores (1-100)
  scores: AthleteScores;

  // Generated Profile
  profile: AthleteProfile;

  // Notes
  notes?: string;
  injuries_noted?: string[];
}

export interface StrengthTests {
  // Lower Body
  back_squat_1rm?: number; // kg
  front_squat_1rm?: number;
  deadlift_1rm?: number;
  single_leg_squat_max?: number; // reps each leg
  nordic_curl_reps?: number;

  // Upper Body
  bench_press_1rm?: number;
  pull_ups_max?: number; // reps
  push_ups_max?: number;
  inverted_rows_max?: number;

  // Relative Strength (auto-calculated)
  squat_to_bw_ratio?: number; // squat 1RM / bodyweight
  deadlift_to_bw_ratio?: number;
  bench_to_bw_ratio?: number;
}

export interface PowerTests {
  // Vertical Power
  cmj_height?: number; // Counter Movement Jump - cm
  squat_jump_height?: number; // cm
  drop_jump_height?: number; // cm
  drop_jump_rsi?: number; // Reactive Strength Index

  // Horizontal Power
  broad_jump?: number; // cm
  triple_hop_test?: number; // cm (single leg)

  // Upper Body Power
  med_ball_throw_chest?: number; // m
  med_ball_throw_overhead?: number; // m

  // Rate of Force Development
  isometric_mid_thigh_pull?: number; // N (peak force)
}

export interface AerobicTests {
  // Field Tests
  yo_yo_ir1_level?: string; // e.g., "18.3"
  yo_yo_ir1_distance?: number; // meters
  yo_yo_ir2_level?: string;
  yo_yo_ir2_distance?: number;

  beep_test_level?: string; // e.g., "12.5"
  beep_test_vo2max?: number; // estimated ml/kg/min

  cooper_test_distance?: number; // meters in 12 min

  // Time Trials
  time_2km?: number; // seconds
  time_3km?: number;
  time_5km?: number;

  // Heart Rate Based
  resting_hr?: number; // bpm
  max_hr_observed?: number;
  hr_recovery_1min?: number; // drop in HR after 1 min rest

  // Estimated VO2max
  vo2max_estimated?: number; // ml/kg/min
}

export interface AnaerobicTests {
  // Alactic (ATP-CP) - 0-10 seconds
  sprint_10m?: number; // seconds
  sprint_20m?: number;
  sprint_30m?: number;
  sprint_40m?: number;
  flying_10m?: number; // with running start

  // Lactic (Glycolytic) - 10s-2min
  sprint_60m?: number;
  sprint_100m?: number;
  sprint_200m?: number;
  sprint_300m?: number; // brutal lactic test

  // Repeated Sprint Ability (RSA)
  rsa_6x30m_best?: number; // best time
  rsa_6x30m_avg?: number; // average time
  rsa_6x30m_fatigue_index?: number; // % decline

  // Wingate Test (if available)
  wingate_peak_power?: number; // watts
  wingate_mean_power?: number;
  wingate_fatigue_index?: number;

  // Shuttle Tests
  shuttle_300m_time?: number; // seconds
  shuttle_300m_x2_recovery?: number; // recovery between (seconds)
}

export interface SpeedAgilityTests {
  // Linear Speed
  sprint_5m?: number;
  sprint_10m?: number;
  sprint_20m?: number;
  sprint_30m?: number;

  // Acceleration Profile
  acceleration_0_10m?: number;
  max_velocity_phase?: number; // time in 10-20m split

  // Change of Direction
  t_test?: number; // seconds
  illinois_test?: number;
  pro_agility_5_10_5?: number;
  arrowhead_test?: number;

  // Sport Specific
  l_drill?: number;
  three_cone_drill?: number;

  // Reactive Agility
  reactive_agility_test?: number; // with decision making
}

export interface MobilityTests {
  // Lower Body
  ankle_dorsiflexion_left?: number; // degrees or cm from wall
  ankle_dorsiflexion_right?: number;
  hip_flexion_left?: number;
  hip_flexion_right?: number;
  hip_internal_rotation_left?: number;
  hip_internal_rotation_right?: number;
  hip_external_rotation_left?: number;
  hip_external_rotation_right?: number;

  // Upper Body
  shoulder_flexion_left?: number;
  shoulder_flexion_right?: number;
  shoulder_internal_rotation_left?: number;
  shoulder_internal_rotation_right?: number;
  thoracic_rotation_left?: number;
  thoracic_rotation_right?: number;

  // Flexibility Tests
  sit_and_reach?: number; // cm
  thomas_test_left?: string; // 'pass' | 'tight_hip_flexor' | 'tight_rectus'
  thomas_test_right?: string;

  // Functional Movement Screen (FMS)
  fms_deep_squat?: number; // 0-3
  fms_hurdle_step?: number;
  fms_inline_lunge?: number;
  fms_shoulder_mobility?: number;
  fms_active_straight_leg?: number;
  fms_trunk_stability?: number;
  fms_rotary_stability?: number;
  fms_total?: number; // 0-21
}

export interface AthleteScores {
  // Main Categories (1-100)
  strength_score: number;
  power_score: number;
  aerobic_score: number;
  anaerobic_alactic_score: number;
  anaerobic_lactic_score: number;
  speed_score: number;
  agility_score: number;
  mobility_score: number;

  // Overall
  overall_score: number;

  // Relative to team average
  percentile_in_team: number;

  // Relative to position
  percentile_in_position: number;
}

export interface AthleteProfile {
  // Strengths & Weaknesses
  top_qualities: string[]; // e.g., ['power', 'speed']
  areas_to_improve: string[]; // e.g., ['aerobic_capacity', 'mobility']

  // Risk Assessment
  injury_risk_score: number; // 1-10
  injury_risk_areas: string[]; // e.g., ['hamstring', 'ankle']
  asymmetries: Asymmetry[];

  // Training Recommendations
  priority_focus: string[]; // ordered list
  recommended_frequency: TrainingFrequency;

  // Athlete Type
  athlete_type: AthleteType;
}

export interface Asymmetry {
  test_name: string;
  left_value: number;
  right_value: number;
  difference_percent: number;
  is_significant: boolean; // >10% difference
}

export interface TrainingFrequency {
  strength_sessions: number; // per week
  power_sessions: number;
  aerobic_sessions: number;
  anaerobic_sessions: number;
  mobility_sessions: number;
  sport_practice: number;
  total_sessions: number;
}

export type AthleteType =
  | 'power_dominant' // Fast twitch dominant - esplosivo
  | 'endurance_dominant' // Slow twitch dominant - resistente
  | 'hybrid' // Balanced
  | 'speed_power' // Velocità + potenza
  | 'endurance_strength'; // Resistenza + forza

// ============================================
// NORMATIVE DATA (Sport-Specific)
// ============================================

interface NormativeData {
  sport: string;
  position?: string;
  level: 'youth' | 'amateur' | 'semi_pro' | 'professional';
  gender: 'male' | 'female';
  test_name: string;
  excellent: number; // 90th percentile
  good: number; // 75th
  average: number; // 50th
  below_average: number; // 25th
  poor: number; // 10th
}

// Football (Soccer) normative data
export const FOOTBALL_NORMS: NormativeData[] = [
  // Yo-Yo IR1 - Professional Male
  { sport: 'football', level: 'professional', gender: 'male', test_name: 'yo_yo_ir1_distance',
    excellent: 2400, good: 2160, average: 1920, below_average: 1680, poor: 1440 },

  // Yo-Yo IR1 - Semi-pro Male
  { sport: 'football', level: 'semi_pro', gender: 'male', test_name: 'yo_yo_ir1_distance',
    excellent: 2160, good: 1920, average: 1680, below_average: 1440, poor: 1200 },

  // CMJ - Professional Male
  { sport: 'football', level: 'professional', gender: 'male', test_name: 'cmj_height',
    excellent: 45, good: 40, average: 35, below_average: 30, poor: 25 },

  // Sprint 10m - Professional Male
  { sport: 'football', level: 'professional', gender: 'male', test_name: 'sprint_10m',
    excellent: 1.65, good: 1.72, average: 1.80, below_average: 1.88, poor: 1.95 }, // lower is better

  // Sprint 30m - Professional Male
  { sport: 'football', level: 'professional', gender: 'male', test_name: 'sprint_30m',
    excellent: 3.95, good: 4.10, average: 4.25, below_average: 4.40, poor: 4.55 },

  // T-Test - Professional Male
  { sport: 'football', level: 'professional', gender: 'male', test_name: 't_test',
    excellent: 9.0, good: 9.5, average: 10.0, below_average: 10.5, poor: 11.0 },

  // RSA Fatigue Index - Professional Male
  { sport: 'football', level: 'professional', gender: 'male', test_name: 'rsa_6x30m_fatigue_index',
    excellent: 3, good: 5, average: 7, below_average: 9, poor: 12 },
];

// Basketball normative data
export const BASKETBALL_NORMS: NormativeData[] = [
  // CMJ - Professional Male
  { sport: 'basketball', level: 'professional', gender: 'male', test_name: 'cmj_height',
    excellent: 55, good: 48, average: 42, below_average: 36, poor: 30 },

  // Lane Agility
  { sport: 'basketball', level: 'professional', gender: 'male', test_name: 'pro_agility_5_10_5',
    excellent: 4.0, good: 4.3, average: 4.6, below_average: 4.9, poor: 5.2 },
];

// ============================================
// SCORE CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate normalized score (1-100) based on normative data
 */
export function calculateNormalizedScore(
  value: number,
  norm: NormativeData,
  lowerIsBetter: boolean = false
): number {
  if (!value) return 0;

  const { excellent, good, average, below_average, poor } = norm;

  if (lowerIsBetter) {
    // For time-based tests (sprint, agility)
    if (value <= excellent) return 95;
    if (value <= good) return 75 + (good - value) / (good - excellent) * 20;
    if (value <= average) return 50 + (average - value) / (average - good) * 25;
    if (value <= below_average) return 25 + (below_average - value) / (below_average - average) * 25;
    if (value <= poor) return 10 + (poor - value) / (poor - below_average) * 15;
    return 5;
  } else {
    // For distance/height tests
    if (value >= excellent) return 95;
    if (value >= good) return 75 + (value - good) / (excellent - good) * 20;
    if (value >= average) return 50 + (value - average) / (good - average) * 25;
    if (value >= below_average) return 25 + (value - below_average) / (average - below_average) * 25;
    if (value >= poor) return 10 + (value - poor) / (below_average - poor) * 15;
    return 5;
  }
}

/**
 * Calculate all scores from test results
 */
export function calculateAthleteScores(
  tests: {
    strength: StrengthTests;
    power: PowerTests;
    aerobic: AerobicTests;
    anaerobic: AnaerobicTests;
    speed_agility: SpeedAgilityTests;
    mobility: MobilityTests;
  },
  sport: string,
  level: string,
  gender: 'male' | 'female'
): AthleteScores {
  // Get relevant norms
  const norms = sport === 'basketball' ? BASKETBALL_NORMS : FOOTBALL_NORMS;

  // Calculate category scores
  const strengthScore = calculateStrengthScore(tests.strength);
  const powerScore = calculatePowerScore(tests.power, norms);
  const aerobicScore = calculateAerobicScore(tests.aerobic, norms);
  const { alactic, lactic } = calculateAnaerobicScores(tests.anaerobic, norms);
  const { speed, agility } = calculateSpeedAgilityScores(tests.speed_agility, norms);
  const mobilityScore = calculateMobilityScore(tests.mobility);

  // Calculate overall (weighted by sport)
  const weights = getScoreWeights(sport);
  const overall = Math.round(
    strengthScore * weights.strength +
    powerScore * weights.power +
    aerobicScore * weights.aerobic +
    alactic * weights.anaerobic_alactic +
    lactic * weights.anaerobic_lactic +
    speed * weights.speed +
    agility * weights.agility +
    mobilityScore * weights.mobility
  );

  return {
    strength_score: strengthScore,
    power_score: powerScore,
    aerobic_score: aerobicScore,
    anaerobic_alactic_score: alactic,
    anaerobic_lactic_score: lactic,
    speed_score: speed,
    agility_score: agility,
    mobility_score: mobilityScore,
    overall_score: overall,
    percentile_in_team: 0, // Calculated separately with team data
    percentile_in_position: 0,
  };
}

function calculateStrengthScore(tests: StrengthTests): number {
  const scores: number[] = [];

  // Relative strength ratios (most important)
  if (tests.squat_to_bw_ratio) {
    // Elite = 2.0x BW, Good = 1.5x, Average = 1.2x
    scores.push(Math.min(100, tests.squat_to_bw_ratio / 2.0 * 100));
  }
  if (tests.deadlift_to_bw_ratio) {
    scores.push(Math.min(100, tests.deadlift_to_bw_ratio / 2.5 * 100));
  }

  // Bodyweight exercises
  if (tests.pull_ups_max) {
    scores.push(Math.min(100, tests.pull_ups_max / 20 * 100));
  }
  if (tests.nordic_curl_reps) {
    scores.push(Math.min(100, tests.nordic_curl_reps / 10 * 100));
  }

  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
}

function calculatePowerScore(tests: PowerTests, norms: NormativeData[]): number {
  const scores: number[] = [];

  if (tests.cmj_height) {
    const norm = norms.find(n => n.test_name === 'cmj_height');
    if (norm) {
      scores.push(calculateNormalizedScore(tests.cmj_height, norm));
    }
  }

  if (tests.broad_jump) {
    // Elite = 300cm, Good = 270cm, Average = 240cm
    scores.push(Math.min(100, tests.broad_jump / 300 * 100));
  }

  if (tests.drop_jump_rsi) {
    // Elite RSI = 2.5+, Good = 2.0, Average = 1.5
    scores.push(Math.min(100, tests.drop_jump_rsi / 2.5 * 100));
  }

  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
}

function calculateAerobicScore(tests: AerobicTests, norms: NormativeData[]): number {
  const scores: number[] = [];

  if (tests.yo_yo_ir1_distance) {
    const norm = norms.find(n => n.test_name === 'yo_yo_ir1_distance');
    if (norm) {
      scores.push(calculateNormalizedScore(tests.yo_yo_ir1_distance, norm));
    }
  }

  if (tests.vo2max_estimated) {
    // Elite = 60+, Good = 55, Average = 50, Below = 45
    scores.push(Math.min(100, (tests.vo2max_estimated - 35) / 30 * 100));
  }

  if (tests.hr_recovery_1min) {
    // Elite recovery = 40+ bpm drop, Good = 30, Average = 20
    scores.push(Math.min(100, tests.hr_recovery_1min / 45 * 100));
  }

  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
}

function calculateAnaerobicScores(
  tests: AnaerobicTests,
  norms: NormativeData[]
): { alactic: number; lactic: number } {
  const alacticScores: number[] = [];
  const lacticScores: number[] = [];

  // Alactic (short sprints)
  if (tests.sprint_10m) {
    const norm = norms.find(n => n.test_name === 'sprint_10m');
    if (norm) {
      alacticScores.push(calculateNormalizedScore(tests.sprint_10m, norm, true));
    }
  }
  if (tests.sprint_30m) {
    const norm = norms.find(n => n.test_name === 'sprint_30m');
    if (norm) {
      alacticScores.push(calculateNormalizedScore(tests.sprint_30m, norm, true));
    }
  }

  // Lactic (RSA, longer sprints)
  if (tests.rsa_6x30m_fatigue_index) {
    const norm = norms.find(n => n.test_name === 'rsa_6x30m_fatigue_index');
    if (norm) {
      lacticScores.push(calculateNormalizedScore(tests.rsa_6x30m_fatigue_index, norm, true));
    }
  }
  if (tests.sprint_300m) {
    // Elite = 38s, Good = 42s, Average = 46s
    lacticScores.push(Math.max(0, 100 - (tests.sprint_300m - 38) / 0.2));
  }

  return {
    alactic: alacticScores.length > 0
      ? Math.round(alacticScores.reduce((a, b) => a + b, 0) / alacticScores.length)
      : 50,
    lactic: lacticScores.length > 0
      ? Math.round(lacticScores.reduce((a, b) => a + b, 0) / lacticScores.length)
      : 50,
  };
}

function calculateSpeedAgilityScores(
  tests: SpeedAgilityTests,
  norms: NormativeData[]
): { speed: number; agility: number } {
  const speedScores: number[] = [];
  const agilityScores: number[] = [];

  // Speed
  if (tests.sprint_20m) {
    speedScores.push(Math.max(0, 100 - (tests.sprint_20m - 2.8) / 0.02));
  }
  if (tests.max_velocity_phase) {
    speedScores.push(Math.max(0, 100 - (tests.max_velocity_phase - 0.95) / 0.01));
  }

  // Agility
  if (tests.t_test) {
    const norm = norms.find(n => n.test_name === 't_test');
    if (norm) {
      agilityScores.push(calculateNormalizedScore(tests.t_test, norm, true));
    }
  }
  if (tests.illinois_test) {
    agilityScores.push(Math.max(0, 100 - (tests.illinois_test - 14.5) / 0.1));
  }

  return {
    speed: speedScores.length > 0
      ? Math.round(speedScores.reduce((a, b) => a + b, 0) / speedScores.length)
      : 50,
    agility: agilityScores.length > 0
      ? Math.round(agilityScores.reduce((a, b) => a + b, 0) / agilityScores.length)
      : 50,
  };
}

function calculateMobilityScore(tests: MobilityTests): number {
  const scores: number[] = [];

  // FMS Total (most comprehensive)
  if (tests.fms_total) {
    scores.push(tests.fms_total / 21 * 100);
  }

  // Ankle mobility (crucial for athletes)
  if (tests.ankle_dorsiflexion_left && tests.ankle_dorsiflexion_right) {
    const avgAnkle = (tests.ankle_dorsiflexion_left + tests.ankle_dorsiflexion_right) / 2;
    // 10cm from wall = good, 15cm = excellent
    scores.push(Math.min(100, avgAnkle / 15 * 100));
  }

  // Hip mobility
  if (tests.hip_internal_rotation_left && tests.hip_internal_rotation_right) {
    const avgHip = (tests.hip_internal_rotation_left + tests.hip_internal_rotation_right) / 2;
    // 35° = average, 45° = good
    scores.push(Math.min(100, avgHip / 45 * 100));
  }

  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
}

function getScoreWeights(sport: string): Record<string, number> {
  // Different sports prioritize different qualities
  switch (sport) {
    case 'football':
      return {
        strength: 0.10,
        power: 0.15,
        aerobic: 0.20,
        anaerobic_alactic: 0.15,
        anaerobic_lactic: 0.15,
        speed: 0.10,
        agility: 0.10,
        mobility: 0.05,
      };
    case 'basketball':
      return {
        strength: 0.10,
        power: 0.20,
        aerobic: 0.15,
        anaerobic_alactic: 0.15,
        anaerobic_lactic: 0.10,
        speed: 0.10,
        agility: 0.15,
        mobility: 0.05,
      };
    case 'volleyball':
      return {
        strength: 0.10,
        power: 0.25,
        aerobic: 0.10,
        anaerobic_alactic: 0.15,
        anaerobic_lactic: 0.10,
        speed: 0.10,
        agility: 0.15,
        mobility: 0.05,
      };
    default:
      return {
        strength: 0.125,
        power: 0.125,
        aerobic: 0.125,
        anaerobic_alactic: 0.125,
        anaerobic_lactic: 0.125,
        speed: 0.125,
        agility: 0.125,
        mobility: 0.125,
      };
  }
}

// ============================================
// PROFILE GENERATION
// ============================================

/**
 * Generate athlete profile from scores
 */
export function generateAthleteProfile(
  scores: AthleteScores,
  tests: {
    mobility: MobilityTests;
    strength: StrengthTests;
  }
): AthleteProfile {
  // Find top qualities (score > 70)
  const qualities: { name: string; score: number }[] = [
    { name: 'strength', score: scores.strength_score },
    { name: 'power', score: scores.power_score },
    { name: 'aerobic_capacity', score: scores.aerobic_score },
    { name: 'anaerobic_alactic', score: scores.anaerobic_alactic_score },
    { name: 'anaerobic_lactic', score: scores.anaerobic_lactic_score },
    { name: 'speed', score: scores.speed_score },
    { name: 'agility', score: scores.agility_score },
    { name: 'mobility', score: scores.mobility_score },
  ];

  qualities.sort((a, b) => b.score - a.score);

  const topQualities = qualities.filter(q => q.score >= 70).map(q => q.name);
  const areasToImprove = qualities.filter(q => q.score < 50).map(q => q.name);

  // Detect asymmetries
  const asymmetries = detectAsymmetries(tests.mobility, tests.strength);

  // Calculate injury risk
  const injuryRisk = calculateInjuryRisk(scores, asymmetries, tests.mobility);

  // Determine athlete type
  const athleteType = determineAthleteType(scores);

  // Generate training recommendations
  const priorityFocus = areasToImprove.length > 0
    ? areasToImprove.slice(0, 3)
    : ['maintenance'];

  const frequency = generateRecommendedFrequency(scores, athleteType);

  return {
    top_qualities: topQualities.slice(0, 3),
    areas_to_improve: areasToImprove.slice(0, 3),
    injury_risk_score: injuryRisk.score,
    injury_risk_areas: injuryRisk.areas,
    asymmetries: asymmetries.filter(a => a.is_significant),
    priority_focus: priorityFocus,
    recommended_frequency: frequency,
    athlete_type: athleteType,
  };
}

function detectAsymmetries(
  mobility: MobilityTests,
  strength: StrengthTests
): Asymmetry[] {
  const asymmetries: Asymmetry[] = [];

  // Ankle
  if (mobility.ankle_dorsiflexion_left && mobility.ankle_dorsiflexion_right) {
    const diff = Math.abs(mobility.ankle_dorsiflexion_left - mobility.ankle_dorsiflexion_right);
    const avg = (mobility.ankle_dorsiflexion_left + mobility.ankle_dorsiflexion_right) / 2;
    asymmetries.push({
      test_name: 'Ankle Dorsiflexion',
      left_value: mobility.ankle_dorsiflexion_left,
      right_value: mobility.ankle_dorsiflexion_right,
      difference_percent: Math.round(diff / avg * 100),
      is_significant: diff / avg > 0.10,
    });
  }

  // Hip IR
  if (mobility.hip_internal_rotation_left && mobility.hip_internal_rotation_right) {
    const diff = Math.abs(mobility.hip_internal_rotation_left - mobility.hip_internal_rotation_right);
    const avg = (mobility.hip_internal_rotation_left + mobility.hip_internal_rotation_right) / 2;
    asymmetries.push({
      test_name: 'Hip Internal Rotation',
      left_value: mobility.hip_internal_rotation_left,
      right_value: mobility.hip_internal_rotation_right,
      difference_percent: Math.round(diff / avg * 100),
      is_significant: diff / avg > 0.15,
    });
  }

  return asymmetries;
}

function calculateInjuryRisk(
  scores: AthleteScores,
  asymmetries: Asymmetry[],
  mobility: MobilityTests
): { score: number; areas: string[] } {
  let riskScore = 0;
  const riskAreas: string[] = [];

  // Low mobility = high risk
  if (scores.mobility_score < 40) {
    riskScore += 2;
    riskAreas.push('general_mobility');
  }

  // Significant asymmetries
  const significantAsymmetries = asymmetries.filter(a => a.is_significant);
  riskScore += significantAsymmetries.length;
  significantAsymmetries.forEach(a => {
    riskAreas.push(a.test_name.toLowerCase().replace(' ', '_'));
  });

  // Low FMS score
  if (mobility.fms_total && mobility.fms_total < 14) {
    riskScore += 2;
    riskAreas.push('movement_quality');
  }

  // Imbalance between power and mobility
  if (scores.power_score > 70 && scores.mobility_score < 50) {
    riskScore += 1;
    riskAreas.push('power_mobility_imbalance');
  }

  return {
    score: Math.min(10, riskScore),
    areas: riskAreas,
  };
}

function determineAthleteType(scores: AthleteScores): AthleteType {
  const powerAvg = (scores.power_score + scores.anaerobic_alactic_score + scores.speed_score) / 3;
  const enduranceAvg = (scores.aerobic_score + scores.anaerobic_lactic_score) / 2;

  if (powerAvg > 70 && enduranceAvg < 50) return 'power_dominant';
  if (enduranceAvg > 70 && powerAvg < 50) return 'endurance_dominant';
  if (powerAvg > 65 && scores.speed_score > 70) return 'speed_power';
  if (enduranceAvg > 60 && scores.strength_score > 65) return 'endurance_strength';
  return 'hybrid';
}

function generateRecommendedFrequency(
  scores: AthleteScores,
  athleteType: AthleteType
): TrainingFrequency {
  // Base frequency
  const base: TrainingFrequency = {
    strength_sessions: 2,
    power_sessions: 1,
    aerobic_sessions: 2,
    anaerobic_sessions: 1,
    mobility_sessions: 2,
    sport_practice: 4,
    total_sessions: 0,
  };

  // Adjust based on weaknesses
  if (scores.strength_score < 50) base.strength_sessions = 3;
  if (scores.aerobic_score < 50) base.aerobic_sessions = 3;
  if (scores.mobility_score < 50) base.mobility_sessions = 3;
  if (scores.anaerobic_lactic_score < 50) base.anaerobic_sessions = 2;

  // Adjust based on athlete type
  if (athleteType === 'endurance_dominant') {
    base.power_sessions = 2; // Need more power work
    base.aerobic_sessions = Math.max(1, base.aerobic_sessions - 1); // Maintain, don't overdo
  }
  if (athleteType === 'power_dominant') {
    base.aerobic_sessions = 3; // Need aerobic base
  }

  base.total_sessions =
    base.strength_sessions +
    base.power_sessions +
    base.aerobic_sessions +
    base.anaerobic_sessions;

  return base;
}

// ============================================
// EXPORTS
// ============================================

export default {
  calculateAthleteScores,
  generateAthleteProfile,
  calculateNormalizedScore,
  FOOTBALL_NORMS,
  BASKETBALL_NORMS,
};
