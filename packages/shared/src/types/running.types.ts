/**
 * Running / Aerobic Training Types
 * Sistema di progressione per base aerobica (Zone 2 Training)
 */

export type RunningLevel = 'sedentary' | 'beginner' | 'intermediate' | 'advanced';

export type RunningIntensity = 'walk' | 'easy' | 'zone2' | 'tempo' | 'interval';

export interface HeartRateZone {
  name: string;
  minPercent: number; // % of HRmax
  maxPercent: number;
  description: string;
}

export const HR_ZONES: Record<string, HeartRateZone> = {
  zone1: { name: 'Recupero', minPercent: 50, maxPercent: 60, description: 'Camminata veloce, recupero attivo' },
  zone2: { name: 'Base Aerobica', minPercent: 60, maxPercent: 70, description: 'Corsa facile, puoi parlare' },
  zone3: { name: 'Aerobico', minPercent: 70, maxPercent: 80, description: 'Corsa moderata, frasi brevi' },
  zone4: { name: 'Soglia', minPercent: 80, maxPercent: 90, description: 'Corsa impegnativa, poche parole' },
  zone5: { name: 'VO2max', minPercent: 90, maxPercent: 100, description: 'Sprint massimale' },
};

/**
 * Singolo intervallo di una sessione running
 */
export interface RunningInterval {
  type: RunningIntensity;
  duration: number; // minuti
  hrZone?: string; // 'zone1' | 'zone2' | etc.
  pace?: string; // es. "6:00/km" o "conversational"
  notes?: string;
}

/**
 * Sessione di running singola
 */
export interface RunningSession {
  id: string;
  name: string;
  type: 'continuous' | 'intervals' | 'fartlek' | 'tempo' | 'long_run';
  totalDuration: number; // minuti totali
  warmup?: RunningInterval;
  mainSet: RunningInterval[];
  cooldown?: RunningInterval;
  targetHRZone: string;
  rpe: number; // 1-10
  notes: string;
  // Per tracciamento
  completed?: boolean;
  actualDuration?: number;
  actualDistance?: number;
  avgHeartRate?: number;
  hrDrift?: number;
  sleepQuality?: number; // 1-5
  sessionNotes?: string;
}

/**
 * Settimana di allenamento running
 */
export interface RunningWeek {
  weekNumber: number;
  theme: string; // es. "Costruzione Base", "Settimana di Scarico"
  totalVolume: number; // minuti totali target
  sessions: RunningSession[];
  progressIndicators: string[]; // cosa osservare per progresso
  isDeloadWeek: boolean;
}

/**
 * Programma completo di running (8 settimane tipico)
 */
export interface RunningProgram {
  id: string;
  name: string;
  level: RunningLevel;
  durationWeeks: number;
  sessionsPerWeek: number;
  goal: string; // es. "Costruire base aerobica per correre 30min continui"
  description: string;
  prerequisites: string[];
  weeks: RunningWeek[];
  // Metriche da tracciare
  metricsToTrack: string[];
  successCriteria: string[];
}

/**
 * Log sessione running (dati inseriti dall'utente)
 */
export interface RunningSessionLog {
  id: string;
  sessionId: string;
  date: string; // ISO date
  weekNumber: number;
  duration: number; // minuti effettivi
  distance?: number; // km
  avgPace?: string; // min/km
  avgHeartRate?: number;
  maxHeartRate?: number;
  restingHeartRate?: number; // misurata al mattino
  hrDrift?: number; // differenza FC fine vs inizio
  rpe: number; // 1-10
  sleepQuality?: number; // 1-5 notte dopo
  notes?: string;
  weather?: string;
  surface?: string; // asfalto, sterrato, tapis roulant
}

/**
 * Riepilogo settimanale running
 */
export interface RunningWeeklySummary {
  weekNumber: number;
  startDate: string;
  endDate: string;
  sessionsCompleted: number;
  sessionsPlanned: number;
  totalVolume: number; // minuti
  totalDistance: number; // km
  avgHeartRate: number;
  avgRestingHR: number;
  avgHRDrift: number;
  avgRPE: number;
  avgSleepQuality: number;
  trend: 'improving' | 'stable' | 'declining';
  notes?: string;
}

/**
 * Dati per i grafici di progresso running
 */
export interface RunningProgressData {
  // Serie temporali (per grafici a linea)
  dates: string[];
  restingHR: number[]; // FC a riposo nel tempo
  avgSessionHR: number[]; // FC media sessioni
  hrDrift: number[]; // Drift cardiaco
  paceAtZone2: number[]; // Ritmo a parità di FC (sec/km)
  volume: number[]; // Volume settimanale (min)
  distance: number[]; // Distanza settimanale (km)
  rpe: number[]; // RPE medio

  // Metriche aggregate
  totalSessions: number;
  totalVolume: number; // minuti totali
  totalDistance: number; // km totali
  avgRestingHR: number;
  restingHRChange: number; // variazione da inizio programma
  paceImprovement: number; // % miglioramento ritmo a parità di FC
}

/**
 * Test iniziale capacità aerobica
 */
export interface AerobicAssessment {
  // Dati utente
  age: number;
  restingHeartRate: number;
  estimatedHRMax: number; // 220 - età o misurato

  // Test camminata/corsa
  canRun5Min: boolean;
  canRun10Min: boolean;
  canRun20Min: boolean;
  canRun30Min: boolean;

  // Se può correre, a che ritmo?
  easyRunPace?: string; // min/km
  easyRunHR?: number;

  // Risultato
  recommendedLevel: RunningLevel;
  zone2HRRange: { min: number; max: number };
  notes: string;
}

/**
 * Calcola FCmax stimata
 */
export function estimateHRMax(age: number): number {
  // Formula Tanaka (più accurata della 220-età)
  return Math.round(208 - (0.7 * age));
}

/**
 * Calcola range FC per Zone 2
 */
export function getZone2Range(hrMax: number): { min: number; max: number } {
  return {
    min: Math.round(hrMax * 0.60),
    max: Math.round(hrMax * 0.70),
  };
}

/**
 * Determina il livello running basato sul test
 */
export function determineRunningLevel(assessment: Partial<AerobicAssessment>): RunningLevel {
  if (!assessment.canRun5Min) return 'sedentary';
  if (!assessment.canRun20Min) return 'beginner';
  if (!assessment.canRun30Min) return 'intermediate';
  return 'advanced';
}
