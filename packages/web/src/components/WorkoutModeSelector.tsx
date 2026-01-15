/**
 * WorkoutModeSelector Component
 * 
 * Permette all'utente di scegliere tra:
 * - Modalità GUIDATA: esercizi in ordine sequenziale (comportamento attuale)
 * - Modalità LIBERA: griglia di esercizi selezionabili in qualsiasi ordine
 * 
 * Principio: "Scelta, non imposizione" - coerente con la filosofia Pain Detect
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ListOrdered, 
  Grid3X3, 
  Play, 
  Check, 
  Clock, 
  Dumbbell,
  ChevronRight,
  Shuffle,
  Target,
  Info,
  Zap
} from 'lucide-react';

// Types
interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string | number;
  rest: number;
  weight?: string | null;
  notes?: string;
  pattern?: string;
  category?: string;
}

interface WorkoutDay {
  dayName: string;
  exercises: Exercise[];
  location?: string;
}

interface WorkoutModeSelectorProps {
  workout: WorkoutDay;
  onStartGuided: () => void;
  onStartExercise: (exercise: Exercise, index: number) => void;
  completedExercises?: Set<string>;
  currentExerciseIndex?: number;
}

type WorkoutMode = 'selection' | 'guided' | 'free';

// Pattern color mapping for visual categorization
const PATTERN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  lower_push: { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/40', text: 'text-rose-400' },
  horizontal_push: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/40', text: 'text-blue-400' },
  vertical_push: { bg: 'from-sky-500/20 to-sky-600/10', border: 'border-sky-500/40', text: 'text-sky-400' },
  vertical_pull: { bg: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/40', text: 'text-violet-400' },
  lower_pull: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/40', text: 'text-amber-400' },
  core: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  compound: { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/40', text: 'text-orange-400' },
  isolation: { bg: 'from-teal-500/20 to-teal-600/10', border: 'border-teal-500/40', text: 'text-teal-400' },
  accessory: { bg: 'from-slate-500/20 to-slate-600/10', border: 'border-slate-500/40', text: 'text-slate-400' },
};

const DEFAULT_COLORS = { bg: 'from-slate-500/20 to-slate-600/10', border: 'border-slate-500/40', text: 'text-slate-400' };

export default function WorkoutModeSelector({
  workout,
  onStartGuided,
  onStartExercise,
  completedExercises = new Set(),
  currentExerciseIndex = 0
}: WorkoutModeSelectorProps) {
  const [mode, setMode] = useState<WorkoutMode>('selection');
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);

  // Calculate progress stats
  const stats = useMemo(() => {
    const total = workout.exercises.length;
    const completed = completedExercises.size;
    const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const completedSets = workout.exercises
      .filter(ex => completedExercises.has(ex.name))
      .reduce((acc, ex) => acc + ex.sets, 0);
    
    return { total, completed, totalSets, completedSets, percent: Math.round((completed / total) * 100) };
  }, [workout.exercises, completedExercises]);

  // Get colors for exercise based on pattern/category
  const getExerciseColors = (exercise: Exercise) => {
    const key = exercise.pattern || exercise.category || 'accessory';
    return PATTERN_COLORS[key] || DEFAULT_COLORS;
  };

  // Mode Selection Screen
  if (mode === 'selection') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{workout.dayName}</h2>
            <p className="text-slate-400">
              {workout.exercises.length} esercizi • ~{Math.round(workout.exercises.length * 8)} min
            </p>
          </div>

          {/* Mode Cards */}
          <div className="space-y-4">
            {/* Guided Mode */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setMode('guided');
                onStartGuided();
              }}
              className="w-full bg-gradient-to-br from-emerald-600/90 to-emerald-700/80 
                         hover:from-emerald-500 hover:to-emerald-600 
                         rounded-2xl p-6 text-left transition-all duration-200
                         border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-emerald-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ListOrdered className="w-7 h-7 text-emerald-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">Modalità Guidata</h3>
                    <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 text-xs rounded-full font-medium">
                      Consigliata
                    </span>
                  </div>
                  <p className="text-emerald-200/80 text-sm mb-3">
                    Segui gli esercizi in ordine ottimizzato per la tua performance
                  </p>
                  <div className="flex items-center gap-4 text-xs text-emerald-300/60">
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      Progressione automatica
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Timer integrato
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-emerald-300/50 flex-shrink-0 mt-2" />
              </div>
            </motion.button>

            {/* Free Mode */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('free')}
              className="w-full bg-gradient-to-br from-slate-700/90 to-slate-800/80 
                         hover:from-slate-600 hover:to-slate-700 
                         rounded-2xl p-6 text-left transition-all duration-200
                         border border-slate-600/30 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-slate-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Grid3X3 className="w-7 h-7 text-slate-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Modalità Libera</h3>
                  <p className="text-slate-400 text-sm mb-3">
                    Scegli gli esercizi nell'ordine che preferisci
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400/60">
                    <span className="flex items-center gap-1">
                      <Shuffle className="w-3.5 h-3.5" />
                      Ordine flessibile
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Per esperti
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-500 flex-shrink-0 mt-2" />
              </div>
            </motion.button>
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-400">
                <span className="text-slate-300 font-medium">Modalità Guidata</span> ottimizza 
                l'ordine per massimizzare la performance (es. compound prima di isolation). 
                <span className="text-slate-300 font-medium"> Modalità Libera</span> è utile 
                quando un attrezzo è occupato o preferisci variare.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Free Mode - Grid View
  if (mode === 'free') {
    return (
      <div className="p-4 md:p-6">
        {/* Header with Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{workout.dayName}</h2>
              <p className="text-slate-400 text-sm">Seleziona un esercizio per iniziare</p>
            </div>
            <button
              onClick={() => setMode('selection')}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              Cambia modalità
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-800/50 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{stats.completed}/{stats.total} esercizi</span>
            <span>{stats.percent}% completato</span>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <AnimatePresence>
            {workout.exercises.map((exercise, index) => {
              const isCompleted = completedExercises.has(exercise.name);
              const isSelected = selectedExercise === index;
              const colors = getExerciseColors(exercise);

              return (
                <motion.div
                  key={exercise.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <button
                    onClick={() => {
                      if (!isCompleted) {
                        setSelectedExercise(index);
                      }
                    }}
                    disabled={isCompleted}
                    className={`
                      w-full aspect-square rounded-2xl p-4 text-left transition-all duration-200
                      flex flex-col justify-between relative overflow-hidden
                      ${isCompleted 
                        ? 'bg-emerald-900/30 border-2 border-emerald-500/40 opacity-60' 
                        : isSelected
                          ? `bg-gradient-to-br ${colors.bg} border-2 ${colors.border} ring-2 ring-white/20`
                          : `bg-gradient-to-br ${colors.bg} border border-slate-700/50 hover:border-slate-600`
                      }
                    `}
                  >
                    {/* Completed Badge */}
                    {isCompleted && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Exercise Number */}
                    <div className={`text-xs font-medium ${isCompleted ? 'text-emerald-400' : colors.text} uppercase tracking-wider`}>
                      #{index + 1}
                    </div>

                    {/* Exercise Name */}
                    <div>
                      <h3 className={`font-bold text-base md:text-lg leading-tight mb-2 ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>
                        {exercise.name}
                      </h3>
                      
                      {/* Stats Row */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`flex items-center gap-1 ${isCompleted ? 'text-emerald-400/60' : 'text-slate-400'}`}>
                          <Dumbbell className="w-3 h-3" />
                          {exercise.sets}x{exercise.reps}
                        </span>
                        {exercise.weight && (
                          <span className={`${isCompleted ? 'text-emerald-400/60' : 'text-slate-400'}`}>
                            • {exercise.weight}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pattern Tag */}
                    {exercise.pattern && (
                      <div className={`absolute bottom-3 right-3 text-[10px] font-medium ${colors.text} uppercase opacity-50`}>
                        {exercise.pattern.replace('_', ' ')}
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Selected Exercise Action Bar */}
        <AnimatePresence>
          {selectedExercise !== null && !completedExercises.has(workout.exercises[selectedExercise].name) && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent"
            >
              <div className="max-w-lg mx-auto">
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">
                        {workout.exercises[selectedExercise].name}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {workout.exercises[selectedExercise].sets} serie × {workout.exercises[selectedExercise].reps} reps
                        {workout.exercises[selectedExercise].weight && ` • ${workout.exercises[selectedExercise].weight}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedExercise(null)}
                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition-colors"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={() => {
                          onStartExercise(workout.exercises[selectedExercise], selectedExercise);
                          setSelectedExercise(null);
                        }}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Play className="w-5 h-5" />
                        Inizia
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Completed State */}
        {stats.completed === stats.total && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 rounded-2xl border border-emerald-500/30 text-center"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-emerald-300 mb-2">Workout Completato!</h3>
            <p className="text-emerald-300/60">Hai completato tutti gli esercizi della sessione</p>
          </motion.div>
        )}
      </div>
    );
  }

  // Guided mode redirects to existing flow
  return null;
}
