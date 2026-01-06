/**
 * RUNNING SESSION VIEW
 * Interfaccia per sessioni di corsa - mostra dettagli e permette log completamento
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Footprints, Clock, Heart, Timer, Play, Pause, Check,
  ChevronDown, ChevronUp, AlertCircle, Zap, X, SkipForward
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface RunningInterval {
  type: 'walk' | 'easy' | 'zone2' | 'tempo' | 'interval';
  duration: number;
  pace?: string;
  hrZone?: string;
}

interface RunningSession {
  name: string;
  type: 'continuous' | 'intervals' | 'fartlek' | 'tempo' | 'long_run';
  totalDuration: number;
  targetHRZone: string;
  intervals: RunningInterval[];
  rpe: number;
  notes?: string;
}

interface RunningSessionViewProps {
  session: RunningSession;
  dayName: string;
  onComplete: (data: RunningCompletionData) => void;
  onCancel: () => void;
}

export interface RunningCompletionData {
  completed: boolean;
  actualDuration: number;
  rpe: number;
  distance?: number;
  avgHeartRate?: number;
  notes?: string;
  feltEasy: boolean;
}

// ============================================================================
// CONSTANTS & LABELS
// ============================================================================

const sessionTypeLabels: Record<string, string> = {
  continuous: 'Corsa Continua',
  intervals: 'Intervalli',
  fartlek: 'Fartlek',
  tempo: 'Tempo Run',
  long_run: 'Lungo',
};

const intensityLabels: Record<string, string> = {
  walk: 'Camminata',
  easy: 'Facile',
  zone2: 'Zona 2',
  tempo: 'Tempo',
  interval: 'Intervallo',
};

const intensityColors: Record<string, string> = {
  walk: 'bg-gray-600',
  easy: 'bg-green-600/60',
  zone2: 'bg-green-600',
  tempo: 'bg-yellow-600',
  interval: 'bg-red-600',
};

const intensityBorders: Record<string, string> = {
  walk: 'border-gray-500',
  easy: 'border-green-500/60',
  zone2: 'border-green-500',
  tempo: 'border-yellow-500',
  interval: 'border-red-500',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function RunningSessionView({
  session,
  dayName,
  onComplete,
  onCancel
}: RunningSessionViewProps) {
  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [intervalElapsed, setIntervalElapsed] = useState(0);

  // UI states
  const [showDetails, setShowDetails] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);

  // Completion form data
  const [actualDuration, setActualDuration] = useState(session.totalDuration);
  const [rpe, setRpe] = useState(session.rpe);
  const [distance, setDistance] = useState<string>('');
  const [avgHR, setAvgHR] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [feltEasy, setFeltEasy] = useState(false);

  // ========================================================================
  // TIMER LOGIC
  // ========================================================================

  // Main timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        setIntervalElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Interval progression (for interval sessions)
  useEffect(() => {
    if (session.type === 'intervals' && session.intervals.length > 0) {
      const currentInterval = session.intervals[currentIntervalIndex];
      if (currentInterval && intervalElapsed >= currentInterval.duration * 60) {
        // Move to next interval
        if (currentIntervalIndex < session.intervals.length - 1) {
          setCurrentIntervalIndex(prev => prev + 1);
          setIntervalElapsed(0);

          // Vibration/notification
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

          const nextInterval = session.intervals[currentIntervalIndex + 1];
          toast.info(`Prossimo: ${intensityLabels[nextInterval?.type] || 'Fine'}`, {
            duration: 3000,
          });
        } else {
          // Session complete
          toast.success('Sessione completata!', { duration: 5000 });
          if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
        }
      }
    }
  }, [intervalElapsed, currentIntervalIndex, session]);

  // ========================================================================
  // HELPERS
  // ========================================================================

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (elapsedSeconds / (session.totalDuration * 60)) * 100);

  const getCurrentIntervalProgress = () => {
    const currentInterval = session.intervals[currentIntervalIndex];
    if (!currentInterval) return 0;
    return Math.min(100, (intervalElapsed / (currentInterval.duration * 60)) * 100);
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleComplete = () => {
    onComplete({
      completed: true,
      actualDuration: Math.round(elapsedSeconds / 60) || actualDuration,
      rpe,
      distance: distance ? parseFloat(distance) : undefined,
      avgHeartRate: avgHR ? parseInt(avgHR) : undefined,
      notes,
      feltEasy
    });
  };

  const handleSkipToCompletion = () => {
    setIsRunning(false);
    setShowCompletion(true);
  };

  const handleToggleTimer = () => {
    if (!isRunning && elapsedSeconds === 0) {
      toast.info('Timer avviato!', { duration: 2000 });
    }
    setIsRunning(!isRunning);
  };

  // ========================================================================
  // RENDER: COMPLETION FORM
  // ========================================================================

  if (showCompletion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 overflow-auto"
      >
        <div className="min-h-screen p-4 flex items-center justify-center">
          <div className="max-w-lg w-full">
            <div className="bg-gray-800/90 backdrop-blur rounded-2xl p-6 border border-green-700/50 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                Completa Sessione
              </h2>

              {/* Durata effettiva */}
              <div className="mb-5">
                <label className="text-sm text-gray-400 mb-2 block">
                  Durata effettiva (minuti)
                </label>
                <input
                  type="number"
                  value={actualDuration}
                  onChange={(e) => setActualDuration(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:border-green-500 focus:outline-none transition-colors"
                />
                {elapsedSeconds > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Timer: {formatTime(elapsedSeconds)} ({Math.round(elapsedSeconds / 60)} min)
                  </p>
                )}
              </div>

              {/* RPE */}
              <div className="mb-5">
                <label className="text-sm text-gray-400 mb-2 block">
                  Sforzo Percepito (RPE): <span className="text-green-400 font-bold">{rpe}/10</span>
                </label>
                <Slider
                  value={[rpe]}
                  onValueChange={([v]) => setRpe(v)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Facile</span>
                  <span>Moderato</span>
                  <span>Massimo</span>
                </div>
              </div>

              {/* Distanza (opzionale) */}
              <div className="mb-5">
                <label className="text-sm text-gray-400 mb-2 block">
                  Distanza percorsa (km) <span className="text-gray-600">- opzionale</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="es. 3.5"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              {/* FC Media (opzionale) */}
              <div className="mb-5">
                <label className="text-sm text-gray-400 mb-2 block">
                  FC Media (bpm) <span className="text-gray-600">- opzionale</span>
                </label>
                <input
                  type="number"
                  value={avgHR}
                  onChange={(e) => setAvgHR(e.target.value)}
                  placeholder="es. 145"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Era facile? (per progressione) */}
              <div className="mb-5">
                <button
                  onClick={() => setFeltEasy(!feltEasy)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    feltEasy
                      ? 'border-green-500 bg-green-900/30'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className={`w-5 h-5 ${feltEasy ? 'text-green-400' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="font-medium text-white">Ti è sembrato facile?</p>
                      <p className="text-xs text-gray-400">
                        Usato per calibrare la progressione futura
                      </p>
                    </div>
                    {feltEasy && <Check className="w-5 h-5 text-green-400 ml-auto" />}
                  </div>
                </button>
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Note</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Come ti sei sentito? Problemi? Osservazioni..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white min-h-[100px] focus:border-green-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Azioni */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCompletion(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Indietro
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Salva Sessione
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ========================================================================
  // RENDER: MAIN SESSION VIEW
  // ========================================================================

  const currentInterval = session.intervals[currentIntervalIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 overflow-auto"
    >
      <div className="min-h-screen p-4">
        <div className="max-w-lg mx-auto">

          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-green-600/20 text-green-400 text-sm px-3 py-1 rounded-full mb-2">
              <Footprints className="w-4 h-4" />
              {dayName}
            </div>
            <h1 className="text-3xl font-bold text-white mt-2">{session.name}</h1>
            <p className="text-gray-400 mt-2">
              {sessionTypeLabels[session.type]} - {session.totalDuration} min - RPE {session.rpe}/10
            </p>
          </div>

          {/* Timer principale */}
          <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-8 border border-green-700/50 mb-6">
            <div className="text-center">
              <p className="text-6xl font-mono font-bold text-white mb-4">
                {formatTime(elapsedSeconds)}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Target: {session.totalDuration} min
              </p>

              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Controlli */}
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  onClick={handleToggleTimer}
                  className={`w-20 h-20 rounded-full transition-all ${
                    isRunning
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isRunning ? (
                    <Pause className="w-10 h-10" />
                  ) : (
                    <Play className="w-10 h-10 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Intervallo corrente (solo per sessioni a intervalli) */}
          <AnimatePresence mode="wait">
            {session.type === 'intervals' && session.intervals.length > 0 && currentInterval && (
              <motion.div
                key={currentIntervalIndex}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`${intensityColors[currentInterval.type]}
                  rounded-2xl p-6 mb-6 border-2 ${intensityBorders[currentInterval.type]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Fase corrente</p>
                    <p className="text-2xl font-bold text-white">
                      {intensityLabels[currentInterval.type]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm">Tempo fase</p>
                    <p className="text-2xl font-mono font-bold text-white">
                      {formatTime(intervalElapsed)}
                    </p>
                    <p className="text-white/60 text-xs">
                      / {currentInterval.duration} min
                    </p>
                  </div>
                </div>

                {/* Progress intervallo */}
                <div className="w-full bg-black/30 rounded-full h-2 mt-4 overflow-hidden">
                  <motion.div
                    className="bg-white h-2 rounded-full"
                    animate={{ width: `${getCurrentIntervalProgress()}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <p className="text-white/60 text-xs mt-2 text-center">
                  Intervallo {currentIntervalIndex + 1} di {session.intervals.length}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dettagli sessione (collapsible) */}
          <div className="bg-gray-800/60 rounded-xl border border-gray-700 mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 flex items-center justify-between"
            >
              <span className="text-white font-medium">Dettagli Sessione</span>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {/* Target HR */}
                    <div className="flex items-center gap-3 text-gray-300">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span>Zona target: {session.targetHRZone.replace('zone', 'Zona ')}</span>
                    </div>

                    {/* Note sessione */}
                    {session.notes && (
                      <div className="flex items-start gap-3 text-gray-300">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{session.notes}</span>
                      </div>
                    )}

                    {/* Lista intervalli */}
                    {session.intervals.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Struttura</p>
                        {session.intervals.map((interval, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                              idx === currentIntervalIndex && isRunning
                                ? 'bg-green-900/50 border border-green-600'
                                : idx < currentIntervalIndex
                                ? 'bg-gray-700/30 text-gray-500'
                                : 'bg-gray-700/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {idx < currentIntervalIndex && (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                              {idx === currentIntervalIndex && isRunning && (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              )}
                              <span className={`text-sm ${idx < currentIntervalIndex ? 'text-gray-500' : 'text-gray-300'}`}>
                                {intensityLabels[interval.type]}
                              </span>
                            </div>
                            <span className={`text-sm ${idx < currentIntervalIndex ? 'text-gray-600' : 'text-gray-400'}`}>
                              {interval.duration} min
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Azioni */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Annulla
            </Button>
            <Button
              onClick={handleSkipToCompletion}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Completa
            </Button>
          </div>

          {/* Hint */}
          <p className="text-center text-gray-500 text-xs mt-4">
            Puoi completare la sessione in qualsiasi momento
          </p>
        </div>
      </div>
    </motion.div>
  );
}
