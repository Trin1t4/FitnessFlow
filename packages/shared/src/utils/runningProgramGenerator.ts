/**
 * Running Program Generator
 * Genera programmi di corsa progressivi basati su Zone 2 Training
 */

import type {
  RunningLevel,
  RunningProgram,
  RunningWeek,
  RunningSession,
  RunningInterval,
  AerobicAssessment,
} from '../types/running.types';
import type { DayWorkout, WeeklySplit } from '../types/program.types';
import type { RunningPreferences } from '../types/onboarding.types';
import { estimateHRMax, getZone2Range, determineRunningLevel } from '../types/running.types';

/**
 * Template sessioni per ogni tipo
 */
const SESSION_TEMPLATES = {
  // Sessione walk/run per sedentari
  walkRun: (walkMin: number, runMin: number, cycles: number): RunningInterval[] => {
    const intervals: RunningInterval[] = [];
    for (let i = 0; i < cycles; i++) {
      intervals.push({ type: 'easy', duration: runMin, hrZone: 'zone2', notes: 'Corsa leggera' });
      if (i < cycles - 1) {
        intervals.push({ type: 'walk', duration: walkMin, hrZone: 'zone1', notes: 'Cammina recupero' });
      }
    }
    return intervals;
  },

  // Sessione continua Zone 2
  continuousZ2: (duration: number): RunningInterval[] => [
    { type: 'zone2', duration, hrZone: 'zone2', pace: 'conversational', notes: 'Mantieni ritmo parlabile' }
  ],

  // Sessione tempo run
  tempo: (warmup: number, tempo: number, cooldown: number): RunningInterval[] => [
    { type: 'easy', duration: warmup, hrZone: 'zone2', notes: 'Riscaldamento' },
    { type: 'tempo', duration: tempo, hrZone: 'zone3', notes: 'Ritmo sostenuto ma controllato' },
    { type: 'easy', duration: cooldown, hrZone: 'zone1', notes: 'Defaticamento' }
  ],

  // Intervalli
  intervals: (warmup: number, intervalDuration: number, restDuration: number, reps: number, cooldown: number): RunningInterval[] => {
    const intervals: RunningInterval[] = [
      { type: 'easy', duration: warmup, hrZone: 'zone2', notes: 'Riscaldamento' }
    ];
    for (let i = 0; i < reps; i++) {
      intervals.push({ type: 'interval', duration: intervalDuration, hrZone: 'zone4', notes: `Intervallo ${i + 1}/${reps}` });
      if (i < reps - 1) {
        intervals.push({ type: 'walk', duration: restDuration, hrZone: 'zone1', notes: 'Recupero' });
      }
    }
    intervals.push({ type: 'easy', duration: cooldown, hrZone: 'zone1', notes: 'Defaticamento' });
    return intervals;
  }
};

/**
 * Genera ID unico
 */
function generateId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Crea una sessione di running
 */
function createSession(
  name: string,
  type: RunningSession['type'],
  mainSet: RunningInterval[],
  targetHRZone: string,
  rpe: number,
  notes: string
): RunningSession {
  const totalDuration = mainSet.reduce((sum, interval) => sum + interval.duration, 0);

  return {
    id: generateId(),
    name,
    type,
    totalDuration,
    mainSet,
    targetHRZone,
    rpe,
    notes
  };
}

/**
 * PROGRAMMA SEDENTARIO (8 settimane)
 * Da camminata a 20-25 minuti di corsa continua
 */
function generateSedentaryProgram(): RunningWeek[] {
  return [
    // Settimana 1: Introduzione
    {
      weekNumber: 1,
      theme: 'Introduzione al Movimento',
      totalVolume: 45,
      isDeloadWeek: false,
      progressIndicators: ['Completare tutte le sessioni', 'Nessun dolore articolare'],
      sessions: [
        createSession('Walk/Run A', 'intervals', SESSION_TEMPLATES.walkRun(2, 1, 5), 'zone2', 3, 'Cammina 2min, corri 1min x5'),
        createSession('Walk/Run B', 'intervals', SESSION_TEMPLATES.walkRun(2, 1, 5), 'zone2', 3, 'Cammina 2min, corri 1min x5'),
        createSession('Walk/Run C', 'intervals', SESSION_TEMPLATES.walkRun(2, 1, 6), 'zone2', 4, 'Cammina 2min, corri 1min x6'),
      ]
    },
    // Settimana 2: Costruzione
    {
      weekNumber: 2,
      theme: 'Aumenta la Corsa',
      totalVolume: 50,
      isDeloadWeek: false,
      progressIndicators: ['Recupero più veloce tra intervalli', 'Respirazione più facile'],
      sessions: [
        createSession('Walk/Run A', 'intervals', SESSION_TEMPLATES.walkRun(2, 1.5, 5), 'zone2', 4, 'Cammina 2min, corri 1.5min x5'),
        createSession('Walk/Run B', 'intervals', SESSION_TEMPLATES.walkRun(2, 1.5, 6), 'zone2', 4, 'Cammina 2min, corri 1.5min x6'),
        createSession('Walk/Run C', 'intervals', SESSION_TEMPLATES.walkRun(1.5, 2, 5), 'zone2', 4, 'Cammina 1.5min, corri 2min x5'),
      ]
    },
    // Settimana 3: Progressione
    {
      weekNumber: 3,
      theme: 'Intervalli Più Lunghi',
      totalVolume: 55,
      isDeloadWeek: false,
      progressIndicators: ['FC più bassa a parità di sforzo', 'Meno affanno'],
      sessions: [
        createSession('Walk/Run A', 'intervals', SESSION_TEMPLATES.walkRun(1.5, 2, 6), 'zone2', 4, 'Cammina 1.5min, corri 2min x6'),
        createSession('Walk/Run B', 'intervals', SESSION_TEMPLATES.walkRun(1, 2.5, 5), 'zone2', 5, 'Cammina 1min, corri 2.5min x5'),
        createSession('Walk/Run C', 'intervals', SESSION_TEMPLATES.walkRun(1, 3, 5), 'zone2', 5, 'Cammina 1min, corri 3min x5'),
      ]
    },
    // Settimana 4: Consolidamento
    {
      weekNumber: 4,
      theme: 'Settimana di Scarico',
      totalVolume: 45,
      isDeloadWeek: true,
      progressIndicators: ['Recupero completo', 'Energie ritrovate'],
      sessions: [
        createSession('Recovery Run', 'intervals', SESSION_TEMPLATES.walkRun(1.5, 2, 5), 'zone2', 3, 'Sessione leggera'),
        createSession('Easy Walk/Run', 'intervals', SESSION_TEMPLATES.walkRun(1, 2, 5), 'zone2', 3, 'Mantieni intensità bassa'),
      ]
    },
    // Settimana 5: Salto di Qualità
    {
      weekNumber: 5,
      theme: 'Corsa Continua',
      totalVolume: 50,
      isDeloadWeek: false,
      progressIndicators: ['Prima corsa continua di 5min', 'Test della conversazione superato'],
      sessions: [
        createSession('Walk/Run A', 'intervals', SESSION_TEMPLATES.walkRun(1, 3, 5), 'zone2', 5, 'Cammina 1min, corri 3min x5'),
        createSession('Continuous 5min', 'continuous', SESSION_TEMPLATES.continuousZ2(5), 'zone2', 5, 'Prima corsa continua!'),
        createSession('Walk/Run B', 'intervals', SESSION_TEMPLATES.walkRun(1, 4, 4), 'zone2', 5, 'Cammina 1min, corri 4min x4'),
      ]
    },
    // Settimana 6: Progressione Continua
    {
      weekNumber: 6,
      theme: 'Aumenta la Durata',
      totalVolume: 55,
      isDeloadWeek: false,
      progressIndicators: ['Corsa continua di 8-10min', 'Ritmo più stabile'],
      sessions: [
        createSession('Continuous 8min', 'continuous', SESSION_TEMPLATES.continuousZ2(8), 'zone2', 5, 'Corsa continua 8min'),
        createSession('Walk/Run', 'intervals', SESSION_TEMPLATES.walkRun(1, 5, 4), 'zone2', 5, 'Cammina 1min, corri 5min x4'),
        createSession('Continuous 10min', 'continuous', SESSION_TEMPLATES.continuousZ2(10), 'zone2', 6, 'Corsa continua 10min'),
      ]
    },
    // Settimana 7: Verso l'Obiettivo
    {
      weekNumber: 7,
      theme: 'Costruisci Resistenza',
      totalVolume: 60,
      isDeloadWeek: false,
      progressIndicators: ['Corsa continua di 15min', 'FC stabile durante la corsa'],
      sessions: [
        createSession('Continuous 12min', 'continuous', SESSION_TEMPLATES.continuousZ2(12), 'zone2', 5, 'Corsa continua 12min'),
        createSession('Continuous 10min', 'continuous', SESSION_TEMPLATES.continuousZ2(10), 'zone2', 5, 'Sessione di recupero attivo'),
        createSession('Continuous 15min', 'continuous', SESSION_TEMPLATES.continuousZ2(15), 'zone2', 6, 'Nuovo record!'),
      ]
    },
    // Settimana 8: Obiettivo Raggiunto
    {
      weekNumber: 8,
      theme: 'Traguardo: 20 Minuti!',
      totalVolume: 65,
      isDeloadWeek: false,
      progressIndicators: ['20min corsa continua', 'Base aerobica costruita'],
      sessions: [
        createSession('Continuous 15min', 'continuous', SESSION_TEMPLATES.continuousZ2(15), 'zone2', 5, 'Preparazione finale'),
        createSession('Easy Run 12min', 'continuous', SESSION_TEMPLATES.continuousZ2(12), 'zone2', 4, 'Recupero prima del test'),
        createSession('TEST: 20min', 'continuous', SESSION_TEMPLATES.continuousZ2(20), 'zone2', 6, 'Obiettivo raggiunto! 🎉'),
      ]
    }
  ];
}

/**
 * PROGRAMMA PRINCIPIANTE (8 settimane)
 * Da 20min a 45min continui
 */
function generateBeginnerProgram(): RunningWeek[] {
  return [
    {
      weekNumber: 1,
      theme: 'Costruzione Volume',
      totalVolume: 60,
      isDeloadWeek: false,
      progressIndicators: ['Completare 3 sessioni', 'FC in zona 2'],
      sessions: [
        createSession('Easy Run 20min', 'continuous', SESSION_TEMPLATES.continuousZ2(20), 'zone2', 5, 'Corsa facile'),
        createSession('Easy Run 20min', 'continuous', SESSION_TEMPLATES.continuousZ2(20), 'zone2', 5, 'Mantieni il ritmo'),
        createSession('Easy Run 22min', 'continuous', SESSION_TEMPLATES.continuousZ2(22), 'zone2', 5, 'Piccolo incremento'),
      ]
    },
    {
      weekNumber: 2,
      theme: 'Aumenta Gradualmente',
      totalVolume: 70,
      isDeloadWeek: false,
      progressIndicators: ['Drift FC < 10%', 'Respirazione controllata'],
      sessions: [
        createSession('Easy Run 22min', 'continuous', SESSION_TEMPLATES.continuousZ2(22), 'zone2', 5, 'Corsa facile'),
        createSession('Easy Run 25min', 'continuous', SESSION_TEMPLATES.continuousZ2(25), 'zone2', 5, 'Nuovo traguardo'),
        createSession('Easy Run 23min', 'continuous', SESSION_TEMPLATES.continuousZ2(23), 'zone2', 5, 'Sessione di consolidamento'),
      ]
    },
    {
      weekNumber: 3,
      theme: 'Raggiungi i 30 Minuti',
      totalVolume: 80,
      isDeloadWeek: false,
      progressIndicators: ['30min continui', 'RPE stabile a 5-6'],
      sessions: [
        createSession('Easy Run 25min', 'continuous', SESSION_TEMPLATES.continuousZ2(25), 'zone2', 5, 'Corsa base'),
        createSession('Easy Run 25min', 'continuous', SESSION_TEMPLATES.continuousZ2(25), 'zone2', 5, 'Corsa facile'),
        createSession('Long Run 30min', 'long_run', SESSION_TEMPLATES.continuousZ2(30), 'zone2', 6, 'Primo lungo!'),
      ]
    },
    {
      weekNumber: 4,
      theme: 'Settimana di Recupero',
      totalVolume: 55,
      isDeloadWeek: true,
      progressIndicators: ['Recupero completo', 'FC a riposo stabile'],
      sessions: [
        createSession('Recovery Run 20min', 'continuous', SESSION_TEMPLATES.continuousZ2(20), 'zone2', 4, 'Molto facile'),
        createSession('Easy Run 18min', 'continuous', SESSION_TEMPLATES.continuousZ2(18), 'zone2', 3, 'Mantieni bassa intensità'),
      ]
    },
    {
      weekNumber: 5,
      theme: 'Oltre i 30 Minuti',
      totalVolume: 90,
      isDeloadWeek: false,
      progressIndicators: ['35min completati', 'Miglioramento ritmo'],
      sessions: [
        createSession('Easy Run 28min', 'continuous', SESSION_TEMPLATES.continuousZ2(28), 'zone2', 5, 'Corsa base'),
        createSession('Easy Run 25min', 'continuous', SESSION_TEMPLATES.continuousZ2(25), 'zone2', 5, 'Recupero attivo'),
        createSession('Long Run 35min', 'long_run', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 6, 'Nuovo lungo'),
      ]
    },
    {
      weekNumber: 6,
      theme: 'Costruisci Resistenza',
      totalVolume: 100,
      isDeloadWeek: false,
      progressIndicators: ['40min completati', 'Drift FC migliorato'],
      sessions: [
        createSession('Easy Run 30min', 'continuous', SESSION_TEMPLATES.continuousZ2(30), 'zone2', 5, 'Corsa standard'),
        createSession('Easy Run 28min', 'continuous', SESSION_TEMPLATES.continuousZ2(28), 'zone2', 5, 'Mantieni zona 2'),
        createSession('Long Run 40min', 'long_run', SESSION_TEMPLATES.continuousZ2(40), 'zone2', 6, 'Verso i 40min'),
      ]
    },
    {
      weekNumber: 7,
      theme: 'Preparazione Finale',
      totalVolume: 105,
      isDeloadWeek: false,
      progressIndicators: ['Adattamento quasi completo', 'Pronto per 45min'],
      sessions: [
        createSession('Easy Run 30min', 'continuous', SESSION_TEMPLATES.continuousZ2(30), 'zone2', 5, 'Corsa base'),
        createSession('Easy Run 32min', 'continuous', SESSION_TEMPLATES.continuousZ2(32), 'zone2', 5, 'Leggero incremento'),
        createSession('Long Run 43min', 'long_run', SESSION_TEMPLATES.continuousZ2(43), 'zone2', 6, 'Quasi al traguardo'),
      ]
    },
    {
      weekNumber: 8,
      theme: 'Obiettivo: 45 Minuti!',
      totalVolume: 100,
      isDeloadWeek: false,
      progressIndicators: ['45min corsa continua', 'Base aerobica solida'],
      sessions: [
        createSession('Easy Run 28min', 'continuous', SESSION_TEMPLATES.continuousZ2(28), 'zone2', 5, 'Preparazione'),
        createSession('Recovery Run 20min', 'continuous', SESSION_TEMPLATES.continuousZ2(20), 'zone2', 4, 'Pre-test facile'),
        createSession('TEST: 45min', 'long_run', SESSION_TEMPLATES.continuousZ2(45), 'zone2', 6, 'Obiettivo raggiunto! 🎉'),
      ]
    }
  ];
}

/**
 * PROGRAMMA INTERMEDIO (8 settimane)
 * Da 45min a 60min + varietà (tempo runs, fartlek)
 */
function generateIntermediateProgram(): RunningWeek[] {
  return [
    {
      weekNumber: 1,
      theme: 'Introduzione Varietà',
      totalVolume: 100,
      isDeloadWeek: false,
      progressIndicators: ['Prima sessione tempo', 'Adattamento alle variazioni'],
      sessions: [
        createSession('Easy Run 35min', 'continuous', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 5, 'Base aerobica'),
        createSession('Tempo Intro', 'tempo', SESSION_TEMPLATES.tempo(10, 10, 10), 'zone3', 6, 'Primo tempo run'),
        createSession('Long Run 45min', 'long_run', SESSION_TEMPLATES.continuousZ2(45), 'zone2', 5, 'Lungo settimanale'),
      ]
    },
    {
      weekNumber: 2,
      theme: 'Sviluppo Tempo',
      totalVolume: 110,
      isDeloadWeek: false,
      progressIndicators: ['Tempo run più lungo', 'Ritmo soglia migliorato'],
      sessions: [
        createSession('Easy Run 35min', 'continuous', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 5, 'Recupero attivo'),
        createSession('Tempo Run', 'tempo', SESSION_TEMPLATES.tempo(10, 15, 10), 'zone3', 7, '15min a ritmo soglia'),
        createSession('Long Run 50min', 'long_run', SESSION_TEMPLATES.continuousZ2(50), 'zone2', 6, 'Incremento lungo'),
      ]
    },
    {
      weekNumber: 3,
      theme: 'Aggiungi Intervalli',
      totalVolume: 115,
      isDeloadWeek: false,
      progressIndicators: ['Prima sessione intervalli', 'Recupero tra ripetute'],
      sessions: [
        createSession('Easy Run 30min', 'continuous', SESSION_TEMPLATES.continuousZ2(30), 'zone2', 5, 'Corsa facile'),
        createSession('Intervals 6x2min', 'intervals', SESSION_TEMPLATES.intervals(10, 2, 2, 6, 8), 'zone4', 7, '6 ripetute da 2min'),
        createSession('Long Run 50min', 'long_run', SESSION_TEMPLATES.continuousZ2(50), 'zone2', 6, 'Lungo stabile'),
      ]
    },
    {
      weekNumber: 4,
      theme: 'Settimana di Scarico',
      totalVolume: 70,
      isDeloadWeek: true,
      progressIndicators: ['Recupero completo', 'Adattamento consolidato'],
      sessions: [
        createSession('Recovery Run 25min', 'continuous', SESSION_TEMPLATES.continuousZ2(25), 'zone2', 4, 'Molto facile'),
        createSession('Easy Run 25min', 'continuous', SESSION_TEMPLATES.continuousZ2(25), 'zone2', 4, 'Bassa intensità'),
      ]
    },
    {
      weekNumber: 5,
      theme: 'Costruzione Intensità',
      totalVolume: 120,
      isDeloadWeek: false,
      progressIndicators: ['Tempo run 20min', 'Lungo 55min'],
      sessions: [
        createSession('Easy Run 35min', 'continuous', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 5, 'Base'),
        createSession('Tempo Run 20min', 'tempo', SESSION_TEMPLATES.tempo(10, 20, 10), 'zone3', 7, 'Progressione tempo'),
        createSession('Long Run 55min', 'long_run', SESSION_TEMPLATES.continuousZ2(55), 'zone2', 6, 'Nuovo lungo'),
      ]
    },
    {
      weekNumber: 6,
      theme: 'Mix Ottimale',
      totalVolume: 125,
      isDeloadWeek: false,
      progressIndicators: ['Gestione 3 tipi di sessione', 'Capacità aerobica migliorata'],
      sessions: [
        createSession('Intervals 8x2min', 'intervals', SESSION_TEMPLATES.intervals(10, 2, 1.5, 8, 8), 'zone4', 7, '8 ripetute'),
        createSession('Easy Run 35min', 'continuous', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 5, 'Recupero attivo'),
        createSession('Long Run 55min', 'long_run', SESSION_TEMPLATES.continuousZ2(55), 'zone2', 6, 'Lungo consolidamento'),
      ]
    },
    {
      weekNumber: 7,
      theme: 'Picco Volume',
      totalVolume: 130,
      isDeloadWeek: false,
      progressIndicators: ['Lungo 60min', 'Pronto per obiettivo'],
      sessions: [
        createSession('Tempo Run 25min', 'tempo', SESSION_TEMPLATES.tempo(10, 25, 10), 'zone3', 7, 'Tempo lungo'),
        createSession('Easy Run 30min', 'continuous', SESSION_TEMPLATES.continuousZ2(30), 'zone2', 5, 'Facile'),
        createSession('Long Run 60min', 'long_run', SESSION_TEMPLATES.continuousZ2(60), 'zone2', 6, 'Obiettivo raggiunto!'),
      ]
    },
    {
      weekNumber: 8,
      theme: 'Consolidamento',
      totalVolume: 110,
      isDeloadWeek: false,
      progressIndicators: ['60min mantenuto', 'Base aerobica eccellente'],
      sessions: [
        createSession('Intervals 6x3min', 'intervals', SESSION_TEMPLATES.intervals(10, 3, 2, 6, 8), 'zone4', 7, 'Intervalli lunghi'),
        createSession('Easy Run 30min', 'continuous', SESSION_TEMPLATES.continuousZ2(30), 'zone2', 5, 'Recupero'),
        createSession('Long Run 60min', 'long_run', SESSION_TEMPLATES.continuousZ2(60), 'zone2', 6, 'Lungo consolidato 🎉'),
      ]
    }
  ];
}

/**
 * PROGRAMMA AVANZATO (8 settimane)
 * Volume alto + varietà intensità
 */
function generateAdvancedProgram(): RunningWeek[] {
  return [
    {
      weekNumber: 1,
      theme: 'Base Solida',
      totalVolume: 150,
      isDeloadWeek: false,
      progressIndicators: ['4 sessioni completate', 'Volume settimanale alto'],
      sessions: [
        createSession('Easy Run 40min', 'continuous', SESSION_TEMPLATES.continuousZ2(40), 'zone2', 5, 'Corsa base'),
        createSession('Tempo Run 30min', 'tempo', SESSION_TEMPLATES.tempo(10, 30, 10), 'zone3', 7, 'Tempo classico'),
        createSession('Easy Run 35min', 'continuous', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 5, 'Recupero attivo'),
        createSession('Long Run 70min', 'long_run', SESSION_TEMPLATES.continuousZ2(70), 'zone2', 6, 'Lungo settimanale'),
      ]
    },
    {
      weekNumber: 2,
      theme: 'Sviluppo VO2max',
      totalVolume: 155,
      isDeloadWeek: false,
      progressIndicators: ['Intervalli al 90% FCmax', 'Recupero efficiente'],
      sessions: [
        createSession('Intervals 10x2min', 'intervals', SESSION_TEMPLATES.intervals(15, 2, 1.5, 10, 10), 'zone4', 8, '10 ripetute intense'),
        createSession('Easy Run 40min', 'continuous', SESSION_TEMPLATES.continuousZ2(40), 'zone2', 5, 'Recupero'),
        createSession('Tempo Run 25min', 'tempo', SESSION_TEMPLATES.tempo(10, 25, 10), 'zone3', 7, 'Soglia'),
        createSession('Long Run 75min', 'long_run', SESSION_TEMPLATES.continuousZ2(75), 'zone2', 6, 'Lungo incremento'),
      ]
    },
    {
      weekNumber: 3,
      theme: 'Picco Intensità',
      totalVolume: 160,
      isDeloadWeek: false,
      progressIndicators: ['Gestione carichi alti', 'Adattamento neuromuscolare'],
      sessions: [
        createSession('Easy Run 35min', 'continuous', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 5, 'Corsa leggera'),
        createSession('Intervals 8x3min', 'intervals', SESSION_TEMPLATES.intervals(10, 3, 2, 8, 10), 'zone4', 8, 'Intervalli lunghi'),
        createSession('Tempo Run 30min', 'tempo', SESSION_TEMPLATES.tempo(10, 30, 10), 'zone3', 7, 'Tempo sostenuto'),
        createSession('Long Run 80min', 'long_run', SESSION_TEMPLATES.continuousZ2(80), 'zone2', 6, 'Nuovo lungo record'),
      ]
    },
    {
      weekNumber: 4,
      theme: 'Recupero Attivo',
      totalVolume: 100,
      isDeloadWeek: true,
      progressIndicators: ['Supercompensazione', 'Preparazione blocco 2'],
      sessions: [
        createSession('Easy Run 30min', 'continuous', SESSION_TEMPLATES.continuousZ2(30), 'zone2', 4, 'Molto facile'),
        createSession('Easy Run 35min', 'continuous', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 4, 'Recupero'),
        createSession('Easy Run 30min', 'continuous', SESSION_TEMPLATES.continuousZ2(30), 'zone2', 4, 'Attivazione'),
      ]
    },
    {
      weekNumber: 5,
      theme: 'Costruzione 2',
      totalVolume: 165,
      isDeloadWeek: false,
      progressIndicators: ['Volume record', 'Efficienza migliorata'],
      sessions: [
        createSession('Tempo Run 35min', 'tempo', SESSION_TEMPLATES.tempo(10, 35, 10), 'zone3', 7, 'Tempo lungo'),
        createSession('Easy Run 40min', 'continuous', SESSION_TEMPLATES.continuousZ2(40), 'zone2', 5, 'Base'),
        createSession('Intervals 6x4min', 'intervals', SESSION_TEMPLATES.intervals(10, 4, 2, 6, 10), 'zone4', 8, 'Ripetute lunghe'),
        createSession('Long Run 85min', 'long_run', SESSION_TEMPLATES.continuousZ2(85), 'zone2', 6, 'Lungo progressivo'),
      ]
    },
    {
      weekNumber: 6,
      theme: 'Qualità Massima',
      totalVolume: 170,
      isDeloadWeek: false,
      progressIndicators: ['Sessioni qualitative', 'Soglia migliorata'],
      sessions: [
        createSession('Intervals 12x2min', 'intervals', SESSION_TEMPLATES.intervals(15, 2, 1, 12, 10), 'zone4', 8, 'Alta frequenza'),
        createSession('Easy Run 35min', 'continuous', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 5, 'Recupero attivo'),
        createSession('Tempo Run 40min', 'tempo', SESSION_TEMPLATES.tempo(10, 40, 10), 'zone3', 7, 'Tempo record'),
        createSession('Long Run 85min', 'long_run', SESSION_TEMPLATES.continuousZ2(85), 'zone2', 6, 'Lungo stabile'),
      ]
    },
    {
      weekNumber: 7,
      theme: 'Picco Finale',
      totalVolume: 175,
      isDeloadWeek: false,
      progressIndicators: ['Volume massimo', 'Lungo 90min'],
      sessions: [
        createSession('Tempo Run 35min', 'tempo', SESSION_TEMPLATES.tempo(10, 35, 10), 'zone3', 7, 'Soglia'),
        createSession('Intervals 8x3min', 'intervals', SESSION_TEMPLATES.intervals(10, 3, 1.5, 8, 10), 'zone4', 8, 'VO2max'),
        createSession('Easy Run 40min', 'continuous', SESSION_TEMPLATES.continuousZ2(40), 'zone2', 5, 'Recupero'),
        createSession('Long Run 90min', 'long_run', SESSION_TEMPLATES.continuousZ2(90), 'zone2', 6, 'Lungo record! 🎉'),
      ]
    },
    {
      weekNumber: 8,
      theme: 'Consolidamento Elite',
      totalVolume: 160,
      isDeloadWeek: false,
      progressIndicators: ['Mantenimento livello', 'Base aerobica eccellente'],
      sessions: [
        createSession('Easy Run 35min', 'continuous', SESSION_TEMPLATES.continuousZ2(35), 'zone2', 5, 'Base'),
        createSession('Tempo + Intervals', 'fartlek', [
          ...SESSION_TEMPLATES.tempo(10, 20, 5),
          { type: 'interval', duration: 3, hrZone: 'zone4', notes: 'Surge' },
          { type: 'easy', duration: 2, hrZone: 'zone2', notes: 'Recupero' },
          { type: 'interval', duration: 3, hrZone: 'zone4', notes: 'Surge' },
          { type: 'easy', duration: 10, hrZone: 'zone1', notes: 'Defaticamento' },
        ], 'zone3', 7, 'Sessione mista'),
        createSession('Easy Run 40min', 'continuous', SESSION_TEMPLATES.continuousZ2(40), 'zone2', 5, 'Recupero'),
        createSession('Long Run 85min', 'long_run', SESSION_TEMPLATES.continuousZ2(85), 'zone2', 6, 'Lungo mantenimento'),
      ]
    }
  ];
}

/**
 * Genera un programma running completo in base al livello
 */
export function generateRunningProgram(
  level: RunningLevel,
  userAge?: number
): RunningProgram {
  const hrMax = userAge ? estimateHRMax(userAge) : 180;
  const zone2Range = getZone2Range(hrMax);

  const programConfigs: Record<RunningLevel, { name: string; goal: string; description: string; prerequisites: string[] }> = {
    sedentary: {
      name: 'Da Zero a Corridore',
      goal: 'Costruire base aerobica - Correre 20 minuti continui',
      description: 'Programma graduale per chi parte da zero. In 8 settimane passerai dalla camminata a 20 minuti di corsa continua.',
      prerequisites: ['Essere in salute generale', 'Scarpe da corsa adatte', 'Nessun dolore articolare acuto']
    },
    beginner: {
      name: 'Costruisci la Base',
      goal: 'Rafforzare base aerobica - Correre 45 minuti continui',
      description: 'Per chi già corre 15-20 minuti. Raggiungerai i 45 minuti continui con focus sulla zona 2.',
      prerequisites: ['Saper correre 15-20min senza fermarsi', 'FC a riposo conosciuta', 'Nessun infortunio in corso']
    },
    intermediate: {
      name: 'Varietà e Volume',
      goal: 'Sviluppare resistenza e velocità - 60min + lavori di qualità',
      description: 'Programma con tempo runs e intervalli. Porterai il lungo a 60min aggiungendo varietà.',
      prerequisites: ['Saper correre 45min continui', 'Conoscere la propria FCmax', 'Esperienza con ritmi variati']
    },
    advanced: {
      name: 'Performance Running',
      goal: 'Massimizzare capacità aerobica - Volume alto + intensità mirata',
      description: 'Programma avanzato con 4 sessioni settimanali. Focus su VO2max, soglia e lunghi fino a 90min.',
      prerequisites: ['Correre regolarmente 4+ volte a settimana', 'Lungo già oltre 60min', 'Esperienza con intervalli']
    }
  };

  const config = programConfigs[level];

  let weeks: RunningWeek[];
  let sessionsPerWeek: number;

  switch (level) {
    case 'sedentary':
      weeks = generateSedentaryProgram();
      sessionsPerWeek = 3;
      break;
    case 'beginner':
      weeks = generateBeginnerProgram();
      sessionsPerWeek = 3;
      break;
    case 'intermediate':
      weeks = generateIntermediateProgram();
      sessionsPerWeek = 3;
      break;
    case 'advanced':
      weeks = generateAdvancedProgram();
      sessionsPerWeek = 4;
      break;
  }

  return {
    id: generateId(),
    name: config.name,
    level,
    durationWeeks: 8,
    sessionsPerWeek,
    goal: config.goal,
    description: config.description,
    prerequisites: config.prerequisites,
    weeks,
    metricsToTrack: [
      'FC Media sessione',
      'FC a riposo (mattino)',
      'Drift cardiaco',
      'RPE percepito',
      'Qualità sonno',
      'Ritmo a parità di FC'
    ],
    successCriteria: [
      `FC a riposo diminuita di 3-5 bpm`,
      `Drift cardiaco < 5% nel lungo`,
      `Ritmo migliorato del 10% a parità di FC`,
      `RPE stabile o diminuito`,
      `Zona 2 HR range: ${zone2Range.min}-${zone2Range.max} bpm`
    ]
  };
}

/**
 * Valuta le capacità aerobiche e restituisce il livello consigliato
 */
export function assessAerobicCapacity(
  age: number,
  restingHR: number,
  canRun5Min: boolean,
  canRun10Min: boolean,
  canRun20Min: boolean,
  canRun30Min: boolean
): AerobicAssessment {
  const hrMax = estimateHRMax(age);
  const zone2Range = getZone2Range(hrMax);

  const assessment: AerobicAssessment = {
    age,
    restingHeartRate: restingHR,
    estimatedHRMax: hrMax,
    canRun5Min,
    canRun10Min,
    canRun20Min,
    canRun30Min,
    recommendedLevel: determineRunningLevel({ canRun5Min, canRun10Min, canRun20Min, canRun30Min }),
    zone2HRRange: zone2Range,
    notes: ''
  };

  // Genera note basate sulla valutazione
  if (!canRun5Min) {
    assessment.notes = 'Inizia con il programma Sedentario. Focus su camminata/corsa alternata.';
  } else if (!canRun20Min) {
    assessment.notes = 'Buon punto di partenza! Il programma Principiante ti porterà a 45min.';
  } else if (!canRun30Min) {
    assessment.notes = 'Base solida! Il programma Intermedio aggiungerà varietà e volume.';
  } else {
    assessment.notes = 'Eccellente capacità! Pronto per il programma Avanzato con lavori di qualità.';
  }

  return assessment;
}

/**
 * Integra le sessioni running in un WeeklySplit esistente
 * Usato per combinare programma pesi con sessioni running
 */
export function integrateRunningIntoSplit(
  strengthSplit: WeeklySplit,
  runningPrefs: RunningPreferences,
  weekNumber: number = 1,
  userAge?: number
): WeeklySplit {
  if (!runningPrefs.enabled) {
    return strengthSplit;
  }

  // Genera il programma running per ottenere le sessioni della settimana
  const level = determineRunningLevel(runningPrefs.capacity);
  const runningProgram = generateRunningProgram(level, userAge);

  // Prendi le sessioni della settimana corretta (o la prima se weekNumber > durata)
  const runningWeekIndex = Math.min(weekNumber - 1, runningProgram.weeks.length - 1);
  const runningWeek = runningProgram.weeks[runningWeekIndex];
  const runningSessions = runningWeek.sessions.slice(0, runningPrefs.sessionsPerWeek);

  const strengthDays = [...strengthSplit.days];
  const newDays: DayWorkout[] = [];

  const integration = runningPrefs.integration;

  switch (integration) {
    case 'separate_days': {
      // Inserisci sessioni running in giorni separati
      // Esempio: Pesi Lu/Me/Ve → Running Ma/Gio
      const strengthDayNumbers = strengthDays.map(d => d.dayNumber);
      const allDays = [1, 2, 3, 4, 5, 6, 7]; // Lu-Dom
      const freeDays = allDays.filter(d => !strengthDayNumbers.includes(d));

      // Assegna sessioni running ai primi giorni liberi disponibili
      let runningIndex = 0;
      for (const dayNum of freeDays) {
        if (runningIndex >= runningSessions.length) break;
        const session = runningSessions[runningIndex];
        newDays.push({
          dayNumber: dayNum,
          dayName: getDayName(dayNum),
          focus: `Running: ${session.name}`,
          type: 'running',
          exercises: [], // Nessun esercizio di forza
          runningSession: session,
          estimatedDuration: session.totalDuration
        });
        runningIndex++;
      }
      break;
    }

    case 'post_workout': {
      // Aggiungi running dopo le sessioni pesi (mixed)
      // Limita a 15-20 min post-workout
      let runningIndex = 0;
      for (const day of strengthDays) {
        if (runningIndex >= runningSessions.length) break;
        const session = runningSessions[runningIndex];
        // Crea versione abbreviata per post-workout (max 20 min)
        const shortSession = {
          ...session,
          name: `Post-Workout: ${session.name}`,
          totalDuration: Math.min(session.totalDuration, 20),
          notes: 'Sessione breve post-allenamento'
        };
        newDays.push({
          ...day,
          type: 'mixed',
          runningSession: shortSession,
          estimatedDuration: (day.estimatedDuration || 45) + shortSession.totalDuration
        });
        runningIndex++;
      }
      // Aggiungi i giorni pesi rimanenti senza running
      for (let i = newDays.length; i < strengthDays.length; i++) {
        newDays.push({ ...strengthDays[i], type: 'strength' });
      }
      break;
    }

    case 'hybrid_alternate': {
      // Alterna giorni pesi e running (ideale per sport)
      // Esempio: Pesi → Running → Pesi → Running
      let strengthIndex = 0;
      let runningIndex = 0;
      let dayNumber = 1;

      // Distribuisci pesi e running alternandoli
      const totalDays = strengthDays.length + runningSessions.length;
      for (let i = 0; i < totalDays && dayNumber <= 7; i++) {
        if (i % 2 === 0 && strengthIndex < strengthDays.length) {
          // Giorno pesi
          const day = strengthDays[strengthIndex];
          newDays.push({
            ...day,
            dayNumber,
            dayName: getDayName(dayNumber),
            type: 'strength'
          });
          strengthIndex++;
        } else if (runningIndex < runningSessions.length) {
          // Giorno running
          const session = runningSessions[runningIndex];
          newDays.push({
            dayNumber,
            dayName: getDayName(dayNumber),
            focus: `Running: ${session.name}`,
            type: 'running',
            exercises: [],
            runningSession: session,
            estimatedDuration: session.totalDuration
          });
          runningIndex++;
        } else if (strengthIndex < strengthDays.length) {
          // Giorno pesi rimanente
          const day = strengthDays[strengthIndex];
          newDays.push({
            ...day,
            dayNumber,
            dayName: getDayName(dayNumber),
            type: 'strength'
          });
          strengthIndex++;
        }
        dayNumber++;
      }
      break;
    }

    case 'running_only': {
      // Solo running, niente pesi
      for (let i = 0; i < runningSessions.length && i < 6; i++) {
        const session = runningSessions[i];
        newDays.push({
          dayNumber: i + 1,
          dayName: getDayName(i + 1),
          focus: session.name,
          type: 'running',
          exercises: [],
          runningSession: session,
          estimatedDuration: session.totalDuration
        });
      }
      break;
    }

    default:
      return strengthSplit;
  }

  // Ordina per dayNumber
  newDays.sort((a, b) => a.dayNumber - b.dayNumber);

  // Se integration non è running_only, mantieni anche i giorni pesi originali
  if (integration !== 'running_only' && integration !== 'post_workout') {
    // Aggiungi giorni pesi non ancora inclusi
    for (const strengthDay of strengthDays) {
      if (!newDays.some(d => d.dayNumber === strengthDay.dayNumber)) {
        newDays.push({ ...strengthDay, type: 'strength' });
      }
    }
    newDays.sort((a, b) => a.dayNumber - b.dayNumber);
  }

  return {
    splitName: `${strengthSplit.splitName} + Running`,
    description: `${strengthSplit.description} | ${runningSessions.length} sessioni running/settimana`,
    days: newDays
  };
}

function getDayName(dayNumber: number): string {
  const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  return days[dayNumber - 1] || `Giorno ${dayNumber}`;
}

export default {
  generateRunningProgram,
  assessAerobicCapacity,
  integrateRunningIntoSplit,
};
