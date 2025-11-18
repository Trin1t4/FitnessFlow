/**
 * LIVE WORKOUT SESSION - Real-Time RPE Feedback & Auto-Regulation
 *
 * Esperienza workout interattiva:
 * 1. Mostra esercizio corrente + set target
 * 2. User completa il set
 * 3. Chiede RPE immediatamente (1-10)
 * 4. Sistema riadatta volume/intensità in real-time
 * 5. Continua con prossimo set/esercizio
 *
 * Auto-regulation logic:
 * - RPE 9-10 (troppo alto) → Riduci volume (-1 set, -2 reps, +rest)
 * - RPE 1-4 (troppo basso) → Aumenta volume (+1 set, +2 reps)
 * - RPE 6-8 (ottimale) → Mantieni programmazione
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Play, Pause, SkipForward, X } from 'lucide-react';
import { toast } from 'sonner';
import autoRegulationService from '../lib/autoRegulationService';

interface Exercise {
  name: string;
  pattern: string;
  sets: number;
  reps: number | string;
  rest: string;
  intensity: string;
  notes?: string;
}

interface SetLog {
  set_number: number;
  reps_completed: number;
  weight_used?: number;
  rpe: number;
  adjusted: boolean;
  adjustment_reason?: string;
}

interface LiveWorkoutSessionProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  programId: string;
  dayName: string;
  exercises: Exercise[];
  onWorkoutComplete?: (logs: any[]) => void;
}

export default function LiveWorkoutSession({
  open,
  onClose,
  userId,
  programId,
  dayName,
  exercises: initialExercises,
  onWorkoutComplete
}: LiveWorkoutSessionProps) {
  // Pre-workout state
  const [showPreWorkout, setShowPreWorkout] = useState(true);
  const [mood, setMood] = useState<'great' | 'good' | 'ok' | 'tired'>('good');
  const [sleepQuality, setSleepQuality] = useState(7);
  const [showLocationSwitch, setShowLocationSwitch] = useState(false);
  const [switchingLocation, setSwitchingLocation] = useState(false);
  const [homeEquipment, setHomeEquipment] = useState({
    dumbbell: false,
    barbell: false,
    pullUpBar: false,
    rings: false,
    bands: false,
    kettlebell: false,
    bench: false
  });

  // Workout state
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [setLogs, setSetLogs] = useState<Record<string, SetLog[]>>({});
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [locationSwitched, setLocationSwitched] = useState(false);

  // Current set state
  const [showRPEInput, setShowRPEInput] = useState(false);
  const [currentRPE, setCurrentRPE] = useState(7);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);

  // Adjustment state
  const [suggestion, setSuggestion] = useState<{
    type: 'reduce' | 'increase' | 'maintain';
    message: string;
    newSets?: number;
    newReps?: number;
    newRest?: string;
  } | null>(null);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const targetReps = typeof currentExercise?.reps === 'number'
    ? currentExercise.reps
    : parseInt(currentExercise?.reps?.split('-')[0] || '10');

  // Calculate adjusted sets (may be modified by auto-regulation)
  const [adjustedSets, setAdjustedSets] = useState<Record<string, number>>({});
  const currentTargetSets = adjustedSets[currentExercise?.name] || currentExercise?.sets || 3;

  // Handle location switch for THIS SESSION ONLY
  const handleSessionLocationSwitch = async () => {
    try {
      setSwitchingLocation(true);

      console.log('🏋️ Switching location for this session only...');
      console.log('Equipment selected:', homeEquipment);

      // Map gym exercises to home equivalents
      const homeExercises = exercises.map(ex => {
        // Keep core exercises as-is (bodyweight)
        if (ex.pattern === 'core') return ex;

        // Map gym → home equivalents based on pattern
        const homeEquivalents: Record<string, { name: string; notes?: string }> = {
          // Lower Push
          'Squat (Bilanciere)': { name: 'Pistol Squat Assistito', notes: 'Usa una sedia per supporto' },
          'Bulgarian Split Squat': { name: 'Split Squat Corpo Libero', notes: 'Aggiungi peso se hai manubri' },
          'Leg Press': { name: 'Air Squat + Jump', notes: 'Volume alto per compensare' },

          // Horizontal Push
          'Panca Piana': { name: 'Push-up', notes: homeEquipment.dumbbell ? 'Usa manubri per push-up weighted' : 'Standard push-ups' },
          'Chest Press Manubri': { name: 'Push-up Diamonds', notes: 'Focus su pettorali' },
          'Piegamenti Sbarra': { name: 'Push-up Wide', notes: 'Ampia stance per petto' },

          // Vertical Push
          'Military Press': { name: 'Pike Push-up', notes: homeEquipment.dumbbell ? 'Usa manubri overhead' : 'Pike push-ups progressivi' },
          'Shoulder Press Manubri': { name: 'Handstand Push-up Progressione', notes: 'Wall-assisted HSPU' },

          // Vertical Pull
          'Trazioni': { name: homeEquipment.pullUpBar ? ex.name : 'Australian Pull-up (Tavolo)', notes: homeEquipment.pullUpBar ? 'Usa sbarra' : 'Usa tavolo robusto' },
          'Lat Machine': { name: 'Inverted Row (Tavolo)', notes: 'Usa tavolo o sbarra bassa' },
          'Pull-down': { name: homeEquipment.bands ? 'Band Pull-down' : 'Scap Pull-ups', notes: 'Focus su dorsali' },

          // Horizontal Pull
          'Rematore Bilanciere': { name: homeEquipment.dumbbell ? 'Rematore Manubri' : 'Inverted Row', notes: 'Focus su middle back' },
          'Rematore Manubri': { name: homeEquipment.dumbbell ? ex.name : 'Bodyweight Row (Tavolo)', notes: 'Mantieni intensità' },
          'Cable Row': { name: homeEquipment.bands ? 'Band Row' : 'Inverted Row', notes: 'Controlla movimento' },

          // Lower Pull
          'Stacchi Rumeni': { name: homeEquipment.dumbbell ? 'RDL Manubri' : 'Nordic Curl Assistito', notes: 'Focus hamstrings' },
          'Leg Curl': { name: 'Nordic Curl Progressione', notes: 'Usa letto/divano per bloccare piedi' },
          'Good Morning': { name: 'Single Leg RDL', notes: 'Equilibrio + posterior chain' }
        };

        // Find home equivalent
        const homeEquiv = homeEquivalents[ex.name];

        if (homeEquiv) {
          return {
            ...ex,
            name: homeEquiv.name,
            notes: homeEquiv.notes || ex.notes,
            intensity: ex.intensity // Keep same intensity intent
          };
        }

        // If no specific mapping, keep original (might be bodyweight already)
        return ex;
      });

      setExercises(homeExercises);
      setLocationSwitched(true);
      setShowLocationSwitch(false);
      setSwitchingLocation(false);

      toast.success('🏠 Location cambiata per questa sessione!', {
        description: 'Esercizi adattati per allenamento casa'
      });

      console.log('✅ Session exercises adapted for home:', homeExercises);

    } catch (error) {
      console.error('❌ Error switching location:', error);
      toast.error('Errore durante cambio location');
      setSwitchingLocation(false);
    }
  };

  // Start workout after pre-check
  const handleStartWorkout = () => {
    setShowPreWorkout(false);
    setWorkoutStartTime(new Date());
    toast.success('💪 Workout iniziato!', {
      description: `Mood: ${mood} • Sleep: ${sleepQuality}/10${locationSwitched ? ' • Casa' : ''}`
    });
  };

  // Rest timer countdown
  useEffect(() => {
    if (restTimerActive && restTimeRemaining > 0) {
      const timer = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setRestTimerActive(false);
            toast.success('⏰ Rest completato!', { description: 'Pronto per il prossimo set' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [restTimerActive, restTimeRemaining]);

  // Handle set completion
  const handleSetComplete = () => {
    if (currentReps === 0) {
      toast.error('Inserisci il numero di reps completate');
      return;
    }

    // Initialize if not exists
    if (!currentExercise) return;

    if (!setLogs[currentExercise.name]) {
      setSetLogs(prev => ({ ...prev, [currentExercise.name]: [] }));
    }

    setShowRPEInput(true);
  };

  // Analyze RPE and provide suggestions
  const analyzeRPEAndSuggest = (rpe: number) => {
    const exerciseName = currentExercise.name;
    const currentSetNumber = currentSet;
    const totalSetsPlanned = currentTargetSets;

    // HIGH RPE (9-10) - Reduce volume/intensity
    if (rpe >= 9) {
      if (currentSetNumber < totalSetsPlanned) {
        // Still have sets remaining - suggest reducing
        const remainingSets = totalSetsPlanned - currentSetNumber;
        setSuggestion({
          type: 'reduce',
          message: `RPE troppo alto! Hai ancora ${remainingSets} set. Vuoi ridurre?`,
          newSets: totalSetsPlanned - 1, // Remove 1 set
          newReps: Math.max(targetReps - 2, targetReps * 0.8), // Reduce reps
          newRest: increaseRest(currentExercise.rest) // More rest
        });
      } else {
        // Last set - just note high fatigue
        setSuggestion({
          type: 'reduce',
          message: 'RPE molto alto. Considera più recupero per il prossimo workout.',
          newRest: increaseRest(currentExercise.rest)
        });
      }
    }
    // LOW RPE (1-4) - Increase volume
    else if (rpe <= 4 && currentSetNumber === totalSetsPlanned) {
      // Last set but too easy - suggest adding a set
      setSuggestion({
        type: 'increase',
        message: 'RPE troppo basso! Hai riserve. Vuoi aggiungere 1 set?',
        newSets: totalSetsPlanned + 1,
        newReps: targetReps + 2
      });
    }
    // OPTIMAL RPE (5-8)
    else {
      setSuggestion({
        type: 'maintain',
        message: '✅ RPE ottimale! Continua così.',
      });
    }
  };

  // Helper: Increase rest time
  const increaseRest = (currentRest: string): string => {
    const seconds = parseInt(currentRest.replace(/\D/g, ''));
    return `${seconds + 30}s`;
  };

  // Helper: Decrease rest time
  const decreaseRest = (currentRest: string): string => {
    const seconds = parseInt(currentRest.replace(/\D/g, ''));
    return `${Math.max(30, seconds - 15)}s`;
  };

  // Handle RPE submission
  const handleRPESubmit = () => {
    if (!currentExercise) return;

    // Log the set
    const newSetLog: SetLog = {
      set_number: currentSet,
      reps_completed: currentReps,
      weight_used: currentWeight || undefined,
      rpe: currentRPE,
      adjusted: false
    };

    setSetLogs(prev => ({
      ...prev,
      [currentExercise.name]: [...(prev[currentExercise.name] || []), newSetLog]
    }));

    // Analyze RPE and provide suggestions
    analyzeRPEAndSuggest(currentRPE);

    // Reset for next set
    setShowRPEInput(false);
    setCurrentReps(0);
    setCurrentWeight(0);
    setCurrentRPE(7);
  };

  // Apply suggestion (adjust program)
  const applySuggestion = () => {
    if (!suggestion || !currentExercise) return;

    if (suggestion.type === 'reduce' && suggestion.newSets) {
      setAdjustedSets(prev => ({ ...prev, [currentExercise.name]: suggestion.newSets! }));
      toast.success('Volume ridotto', {
        description: `${currentExercise.name}: ${suggestion.newSets} sets`
      });
    } else if (suggestion.type === 'increase' && suggestion.newSets) {
      setAdjustedSets(prev => ({ ...prev, [currentExercise.name]: suggestion.newSets! }));
      toast.success('Volume aumentato', {
        description: `${currentExercise.name}: ${suggestion.newSets} sets`
      });
    }

    // Mark last set as adjusted
    setSetLogs(prev => {
      const exerciseLogs = prev[currentExercise.name] || [];
      const lastSet = exerciseLogs[exerciseLogs.length - 1];
      if (lastSet) {
        lastSet.adjusted = true;
        lastSet.adjustment_reason = suggestion.message;
      }
      return { ...prev };
    });

    setSuggestion(null);
    proceedToNextSet();
  };

  // Dismiss suggestion and continue
  const dismissSuggestion = () => {
    setSuggestion(null);
    proceedToNextSet();
  };

  // Proceed to next set or exercise
  const proceedToNextSet = () => {
    if (!currentExercise) return;

    // Check if more sets remaining
    if (currentSet < currentTargetSets) {
      setCurrentSet(prev => prev + 1);

      // Start rest timer
      const restSeconds = parseInt(currentExercise.rest.replace(/\D/g, ''));
      setRestTimeRemaining(restSeconds);
      setRestTimerActive(true);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        toast.success(`✅ ${currentExercise.name} completato!`, {
          description: 'Prossimo esercizio'
        });
      } else {
        // Workout complete!
        handleWorkoutComplete();
      }
    }
  };

  // Complete entire workout
  const handleWorkoutComplete = async () => {
    if (!workoutStartTime) return;

    const duration = Math.round((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60);
    const avgRPE = calculateAverageRPE();

    toast.success('🎉 Workout completato!', {
      description: `${duration} minuti • RPE medio: ${avgRPE}`
    });

    // Save to database via autoRegulationService
    try {
      const exerciseLogs = Object.entries(setLogs).map(([exerciseName, sets]) => {
        const exercise = exercises.find(ex => ex.name === exerciseName)!;
        const avgRPE = sets.reduce((sum, s) => sum + s.rpe, 0) / sets.length;

        return {
          exercise_name: exerciseName,
          pattern: exercise.pattern,
          sets_completed: sets.length,
          reps_completed: Math.round(sets.reduce((sum, s) => sum + s.reps_completed, 0) / sets.length),
          weight_used: sets[0].weight_used,
          exercise_rpe: avgRPE,
          difficulty_vs_baseline: avgRPE > 8 ? 'harder' as const : avgRPE < 5 ? 'easier' as const : 'as_expected' as const,
          notes: sets.some(s => s.adjusted) ? 'Volume auto-adjusted during workout' : ''
        };
      });

      await autoRegulationService.logWorkout(userId, programId, {
        day_name: dayName,
        split_type: currentExercise?.pattern || 'Full Body',
        session_duration_minutes: duration,
        session_rpe: avgRPE,
        exercises: exerciseLogs,
        mood: 'normal',
        sleep_quality: 7,
        notes: 'Live workout with real-time RPE feedback'
      });

      if (onWorkoutComplete) {
        onWorkoutComplete(exerciseLogs);
      }

      onClose();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Errore salvataggio workout');
    }
  };

  // Calculate average RPE across all sets
  const calculateAverageRPE = (): number => {
    const allRPEs = Object.values(setLogs).flatMap(sets => sets.map(s => s.rpe));
    if (allRPEs.length === 0) return 7;
    return Math.round((allRPEs.reduce((a, b) => a + b, 0) / allRPEs.length) * 10) / 10;
  };

  // Skip exercise
  const skipExercise = () => {
    if (confirm(`Vuoi saltare "${currentExercise?.name}"?`)) {
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
      } else {
        handleWorkoutComplete();
      }
    }
  };

  if (!open) return null;

  // PRE-WORKOUT CHECK-IN
  if (showPreWorkout) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-700 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">👋 Pre-Workout Check-In</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mood Selection */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm mb-3">Come ti senti oggi?</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'great', emoji: '🔥', label: 'Ottimo' },
                { value: 'good', emoji: '😊', label: 'Bene' },
                { value: 'ok', emoji: '😐', label: 'OK' },
                { value: 'tired', emoji: '😴', label: 'Stanco' }
              ].map(({ value, emoji, label }) => (
                <button
                  key={value}
                  onClick={() => setMood(value as any)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    mood === value
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-xs font-semibold">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Quality */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Qualità del sonno</span>
              <span className="text-white font-bold">{sleepQuality}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="grid grid-cols-10 gap-1 mt-1">
              {[1,2,3,4,5,6,7,8,9,10].map(val => (
                <div
                  key={val}
                  className={`text-center text-xs ${sleepQuality === val ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>

          {/* Location Switch Button (VIOLA) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLocationSwitch(true)}
            className="w-full mb-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
          >
            🏠 Cambia Location per Oggi
          </motion.button>

          {locationSwitched && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
              <p className="text-purple-300 text-sm font-semibold">
                ✅ Sessione adattata per casa!
              </p>
            </div>
          )}

          {/* Start Workout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartWorkout}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
          >
            <Play className="w-5 h-5" />
            Inizia Allenamento
          </motion.button>

          {/* Location Switch Modal */}
          {showLocationSwitch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowLocationSwitch(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">🏠 Attrezzatura Casa Disponibile</h3>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { key: 'dumbbell', label: 'Manubri', icon: '🏋️' },
                    { key: 'barbell', label: 'Bilanciere', icon: '⚡' },
                    { key: 'pullUpBar', label: 'Sbarra', icon: '🔥' },
                    { key: 'rings', label: 'Anelli', icon: '⭕' },
                    { key: 'bands', label: 'Elastici', icon: '🎗️' },
                    { key: 'kettlebell', label: 'Kettlebell', icon: '🎯' }
                  ].map(({ key, label, icon }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        homeEquipment[key as keyof typeof homeEquipment]
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={homeEquipment[key as keyof typeof homeEquipment]}
                        onChange={(e) => setHomeEquipment(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="w-4 h-4 rounded accent-emerald-500"
                      />
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm font-semibold">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <p className="text-blue-300 text-sm">
                    💡 Gli esercizi verranno adattati automaticamente in base all'attrezzatura disponibile
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLocationSwitch(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleSessionLocationSwitch}
                    disabled={switchingLocation}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
                  >
                    {switchingLocation ? 'Adattamento...' : 'Conferma'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // MAIN WORKOUT UI (after pre-check)
  if (!currentExercise) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-slate-700 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">💪 Live Workout</h2>
            <p className="text-slate-400 text-sm">{dayName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Esercizio {currentExerciseIndex + 1}/{totalExercises}</span>
            <span>Set {currentSet}/{currentTargetSets}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentExerciseIndex * 100) + (currentSet / currentTargetSets * 100)) / totalExercises}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Exercise */}
        <motion.div
          key={currentExercise.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700"
        >
          <h3 className="text-2xl font-bold text-white mb-2">{currentExercise.name}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-400 text-sm">Target</p>
              <p className="text-emerald-400 font-bold text-xl">{targetReps} reps</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Sets</p>
              <p className="text-blue-400 font-bold text-xl">{currentSet}/{currentTargetSets}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Rest</p>
              <p className="text-purple-400 font-bold text-xl">{currentExercise.rest}</p>
            </div>
          </div>
        </motion.div>

        {/* Rest Timer */}
        {restTimerActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-blue-300 font-bold text-lg mb-2">⏱️ Rest Timer</p>
            <p className="text-5xl font-bold text-blue-400">{restTimeRemaining}s</p>
            <button
              onClick={() => setRestTimerActive(false)}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Skip Rest →
            </button>
          </motion.div>
        )}

        {/* Set Input (if not showing RPE) */}
        {!showRPEInput && !restTimerActive && !suggestion && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Reps Completate</label>
              <input
                type="number"
                value={currentReps || ''}
                onChange={(e) => setCurrentReps(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-2xl font-bold text-center"
                placeholder={`${targetReps}`}
                autoFocus
              />
            </div>

            {currentExercise.pattern !== 'core' && (
              <div>
                <label className="block text-slate-300 text-sm mb-2">Peso (kg) - Opzionale</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentWeight || ''}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="0"
                />
              </div>
            )}

            <button
              onClick={handleSetComplete}
              disabled={currentReps === 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Set Completato
            </button>
          </div>
        )}

        {/* RPE Input */}
        {showRPEInput && !suggestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 mb-6"
          >
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 font-bold mb-2">Come ti sei sentito?</p>
              <p className="text-slate-400 text-sm">RPE: Rate of Perceived Exertion (1-10)</p>
            </div>

            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Molto Facile</span>
                <span className="text-2xl font-bold text-white">{currentRPE}</span>
                <span>Massimo Sforzo</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={currentRPE}
                onChange={(e) => setCurrentRPE(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="grid grid-cols-10 gap-1 mt-2">
                {[1,2,3,4,5,6,7,8,9,10].map(val => (
                  <div
                    key={val}
                    className={`text-center text-xs ${currentRPE === val ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleRPESubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-300"
            >
              Conferma RPE
            </button>
          </motion.div>
        )}

        {/* Auto-Regulation Suggestion */}
        <AnimatePresence>
          {suggestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-xl p-4 mb-6 border ${
                suggestion.type === 'reduce'
                  ? 'bg-red-500/10 border-red-500/30'
                  : suggestion.type === 'increase'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {suggestion.type === 'reduce' && <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                {suggestion.type === 'increase' && <TrendingUp className="w-6 h-6 text-emerald-400 flex-shrink-0" />}
                {suggestion.type === 'maintain' && <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0" />}

                <div className="flex-1">
                  <p className={`font-bold mb-1 ${
                    suggestion.type === 'reduce' ? 'text-red-300' :
                    suggestion.type === 'increase' ? 'text-emerald-300' :
                    'text-blue-300'
                  }`}>
                    {suggestion.type === 'reduce' && '⚠️ Auto-Regulation Suggerita'}
                    {suggestion.type === 'increase' && '📈 Potenziale da Esprimere'}
                    {suggestion.type === 'maintain' && '✅ RPE Ottimale'}
                  </p>
                  <p className="text-slate-300 text-sm">{suggestion.message}</p>

                  {(suggestion.newSets || suggestion.newReps) && (
                    <div className="mt-2 text-xs text-slate-400">
                      {suggestion.newSets && <span>Sets: {currentTargetSets} → {suggestion.newSets}</span>}
                      {suggestion.newReps && <span className="ml-3">Reps: {targetReps} → {suggestion.newReps}</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {suggestion.type !== 'maintain' && (
                  <button
                    onClick={applySuggestion}
                    className={`flex-1 font-bold py-3 rounded-lg transition-all duration-300 ${
                      suggestion.type === 'reduce'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    Applica Modifica
                  </button>
                )}

                <button
                  onClick={dismissSuggestion}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all duration-300"
                >
                  {suggestion.type === 'maintain' ? 'Continua' : 'Ignora'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Set History for Current Exercise */}
        {setLogs[currentExercise.name]?.length > 0 && (
          <div className="bg-slate-800/30 rounded-xl p-4 mb-4">
            <h4 className="text-slate-400 text-sm mb-2">Set Completati:</h4>
            <div className="space-y-1">
              {setLogs[currentExercise.name].map((set, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-300">Set {set.set_number}</span>
                  <span className="text-emerald-400">{set.reps_completed} reps</span>
                  <span className={`${
                    set.rpe >= 9 ? 'text-red-400' :
                    set.rpe <= 4 ? 'text-blue-400' :
                    'text-slate-400'
                  }`}>
                    RPE {set.rpe}
                  </span>
                  {set.adjusted && <span className="text-amber-400 text-xs">⚡ Adjusted</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex gap-2">
          <button
            onClick={skipExercise}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
          >
            Salta Esercizio
          </button>

          <button
            onClick={() => {
              if (confirm('Vuoi terminare il workout?')) {
                handleWorkoutComplete();
              }
            }}
            className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            Termina Workout
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
