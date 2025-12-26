import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Check, X, Timer, AlertCircle } from 'lucide-react';
import { PostSetScreening, SetFeedback } from '../components/PostSetScreening';
import TUTTimer from '../components/TUTTimer';
import {
  startProgressiveWorkout,
  saveProgressiveSet,
  updateProgressiveProgress,
  completeProgressiveWorkout,
  type ProgressiveSetLog,
} from '@trainsmart/shared';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  weight?: number;
  pattern?: string;
  tempo?: {
    eccentric: number;
    pause: number;
    concentric: number;
  };
  notes?: string;
  type?: string;
  exercises?: any[];
  rounds?: number;
  restBetweenRounds?: number;
}

interface WorkoutSessionState {
  program: any;
  dayIndex: number;
  adjustment?: {
    volumeMultiplier: number;
    intensityMultiplier: number;
    restMultiplier?: number;
    exerciseMode?: 'express' | 'reduced' | 'standard' | 'full' | 'extended';
    skipExercises: string[];
    recommendation: string;
  };
  recoveryData?: any;
  // Resume workout props
  resumeWorkoutId?: string;
  resumeExerciseIndex?: number;
  resumeSetNumber?: number;
  completedSets?: ProgressiveSetLog[];
  // Merge exercises props
  mergeExercises?: string[];
}

export default function WorkoutSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as WorkoutSessionState;

  // Initialize from resume state if available
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(
    state?.resumeExerciseIndex ?? 0
  );
  const [currentSet, setCurrentSet] = useState(
    state?.resumeSetNumber ?? 1
  );
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [completedSetsInExercise, setCompletedSetsInExercise] = useState<number[]>([]);
  const [sessionStartTime] = useState(new Date());
  const [currentRep, setCurrentRep] = useState(1);
  const [showPostSetScreening, setShowPostSetScreening] = useState(false);
  const [setFeedbackHistory, setSetFeedbackHistory] = useState<SetFeedback[]>([]);

  // Progressive save state
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(
    state?.resumeWorkoutId ?? null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [exercisesCompletedCount, setExercisesCompletedCount] = useState(0);
  const [isResuming, setIsResuming] = useState(!!state?.resumeWorkoutId);

  // Track already completed sets from resume
  const [previouslyCompletedSets, setPreviouslyCompletedSets] = useState<ProgressiveSetLog[]>(
    state?.completedSets ?? []
  );

  // Get user ID on mount
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    if (!state || !state.program) {
      navigate('/workout');
    }
  }, [state, navigate]);

  // Initialize progressive workout save
  useEffect(() => {
    if (!userId || !state?.program || workoutLogId) return;

    // If resuming, we already have workoutLogId
    if (isResuming) {
      console.log('[WorkoutSession] Resuming workout:', state.resumeWorkoutId);
      return;
    }

    // Start new progressive workout
    async function initWorkout() {
      const workout = state.program.weekly_schedule[state.dayIndex];
      const result = await startProgressiveWorkout({
        userId: userId!,
        programId: state.program.id,
        dayName: workout.dayName,
        totalExercises: workout.exercises?.length || 0,
      });

      if (result.workoutId) {
        setWorkoutLogId(result.workoutId);
        console.log('[WorkoutSession] Started new workout:', result.workoutId);
      }
    }

    initWorkout();
  }, [userId, state?.program, workoutLogId, isResuming]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (restTimeLeft === 0 && isResting) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  if (!state || !state.program) {
    return null;
  }

  const workout = state.program.weekly_schedule[state.dayIndex];
  const adjustment = state.adjustment || {
    volumeMultiplier: 1,
    intensityMultiplier: 1,
    skipExercises: [],
    recommendation: '',
  };

  // Filtra esercizi in base a skipExercises e exerciseMode
  let filteredExercises = (workout.exercises || []).filter(
    (ex: Exercise) => !adjustment.skipExercises.some((skip: string) => ex.name.includes(skip))
  );

  // Limita numero esercizi in base a exerciseMode (tempo disponibile)
  const exerciseMode = adjustment.exerciseMode || 'standard';
  if (exerciseMode === 'express') {
    // 20 min: solo primi 2-3 esercizi principali
    filteredExercises = filteredExercises.slice(0, 3);
    console.log('⚡ EXPRESS MODE: limitato a 3 esercizi');
  } else if (exerciseMode === 'reduced') {
    // 30 min: primi 4 esercizi
    filteredExercises = filteredExercises.slice(0, 4);
    console.log('🏃 REDUCED MODE: limitato a 4 esercizi');
  }
  // standard (45), full (60), extended (90+) = tutti gli esercizi

  // Add merged exercises from previous incomplete workout
  if (state.mergeExercises && state.mergeExercises.length > 0) {
    console.log('[WorkoutSession] Merging exercises:', state.mergeExercises);
    // Find the exercises from the program that match the names
    const allProgramExercises = state.program.weekly_schedule.flatMap(
      (day: any) => day.exercises || []
    );
    const mergedExs = state.mergeExercises
      .map((name: string) => allProgramExercises.find((ex: Exercise) => ex.name === name))
      .filter(Boolean);
    filteredExercises = [...filteredExercises, ...mergedExs];
  }

  const exercises = filteredExercises;
  const currentExercise = exercises[currentExerciseIndex];

  // Safety check for empty exercises
  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <p className="text-xl text-gray-300">Nessun esercizio disponibile</p>
          <button
            onClick={() => navigate('/workout')}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg"
          >
            Torna al workout
          </button>
        </div>
      </div>
    );
  }

console.log("🎯 STATE RICEVUTO:", adjustment);
console.log("⚙️ ESERCIZIO CORRENTE:", {
  name: currentExercise.name,
  sets: currentExercise.sets,
  reps: currentExercise.reps,
  weight: currentExercise.weight
});

const adjustedSets = Math.max(1, Math.round(currentExercise.sets * adjustment.volumeMultiplier));

console.log("🔢 VOLUME ADJUSTMENT:", {
  exerciseName: currentExercise.name,
  originalSets: currentExercise.sets,
  volumeMultiplier: adjustment.volumeMultiplier,
  calculated: currentExercise.sets * adjustment.volumeMultiplier,
  adjustedSets: adjustedSets,
  wasReduced: adjustedSets < currentExercise.sets
});
console.log("✅ SETS CALCOLATI:", { originalSets: currentExercise.sets, adjustedSets });
const adjustedWeight = currentExercise.weight
  ? Math.round(currentExercise.weight * adjustment.intensityMultiplier)
  : null;

console.log("🏋️ PESO DEBUG:", {
  exerciseName: currentExercise.name,
  originalWeight: currentExercise.weight,
  hasWeight: !!currentExercise.weight,
  intensityMultiplier: adjustment.intensityMultiplier,
  adjustedWeight: adjustedWeight
});
  const getGoalType = (): 'hypertrophy' | 'strength' | 'endurance' | 'power' => {
    const reps = parseInt(currentExercise.reps);
    if (reps <= 5) return 'strength';
    if (reps <= 8) return 'power';
    if (reps <= 12) return 'hypertrophy';
    return 'endurance';
  };

  const handleCompleteSet = () => {
    setShowPostSetScreening(true);
  };

  const handlePostSetFeedback = async (feedback: SetFeedback) => {
    setSetFeedbackHistory([...setFeedbackHistory, feedback]);
    setShowPostSetScreening(false);
    setCompletedSetsInExercise([...completedSetsInExercise, currentSet]);

    // Save set progressively to database
    if (workoutLogId) {
      await saveProgressiveSet({
        workout_log_id: workoutLogId,
        exercise_name: currentExercise.name,
        exercise_index: currentExerciseIndex,
        set_number: currentSet,
        reps_completed: feedback.actualReps,
        weight_used: adjustedWeight || undefined,
        rpe: feedback.perceivedEffort,
      });

      // Update progress position
      await updateProgressiveProgress(
        workoutLogId,
        currentExerciseIndex,
        currentSet + 1,
        exercisesCompletedCount
      );
    }

    if (currentSet < adjustedSets) {
      setCurrentSet(currentSet + 1);
      // Applica restMultiplier per ridurre pause in modalità express/veloce
      const adjustedRest = Math.round(currentExercise.rest * (adjustment.restMultiplier || 1));
      setRestTimeLeft(Math.max(30, adjustedRest)); // Minimo 30 secondi
      setIsResting(true);
    } else {
      // Exercise completed
      const newExercisesCompleted = exercisesCompletedCount + 1;
      setExercisesCompletedCount(newExercisesCompleted);

      if (workoutLogId) {
        await updateProgressiveProgress(
          workoutLogId,
          currentExerciseIndex + 1,
          1,
          newExercisesCompleted
        );
      }

      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
        setCompletedSetsInExercise([]);
      } else {
        handleCompleteWorkout();
      }
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
  };

  const handleCompleteWorkout = async () => {
    const endTime = new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - sessionStartTime.getTime()) / 60000
    );

    console.log('Allenamento completato!', {
      startTime: sessionStartTime,
      endTime,
      durationMinutes,
      feedbackHistory: setFeedbackHistory,
    });

    // Finalize progressive workout in database
    if (workoutLogId) {
      // Calculate average RPE from feedback
      const avgRpe = setFeedbackHistory.length > 0
        ? Math.round(
            setFeedbackHistory.reduce((sum, f) => sum + f.perceivedEffort, 0) /
            setFeedbackHistory.length
          )
        : undefined;

      await completeProgressiveWorkout(workoutLogId, {
        sessionRpe: avgRpe,
        durationMinutes,
        exercisesCompleted: exercises.length,
      });
      console.log('[WorkoutSession] Workout finalized:', workoutLogId);
    }

    navigate('/workout');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">{workout.dayName}</h1>
            <button
              onClick={() => {
                if (confirm('Sei sicuro di voler uscire? Il progresso non sarà salvato.')) {
                  navigate('/workout');
                }
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Esercizio {currentExerciseIndex + 1} di {exercises.length}</span>
              <span>{Math.round((currentExerciseIndex / exercises.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentExerciseIndex / exercises.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Resume indicator */}
          {isResuming && currentExerciseIndex === (state?.resumeExerciseIndex ?? 0) && (
            <div className="mt-4 bg-blue-900/30 border border-blue-500/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-blue-300">
                <span className="text-lg">🔄</span>
                <span className="font-semibold">Workout ripreso</span>
                <span className="text-blue-400 text-sm ml-auto">
                  {previouslyCompletedSets.length} set già completati
                </span>
              </div>
            </div>
          )}

          {/* Merged exercises indicator */}
          {state?.mergeExercises && state.mergeExercises.length > 0 && (
            <div className="mt-4 bg-purple-900/30 border border-purple-500/60 rounded-xl p-3">
              <div className="flex items-center gap-2 text-purple-300">
                <span className="text-lg">➕</span>
                <span className="font-semibold">+{state.mergeExercises.length} esercizi accorpati</span>
              </div>
            </div>
          )}

          {(adjustment.volumeMultiplier < 1 || adjustment.intensityMultiplier < 1) && (
            <div className="mt-4 bg-yellow-900/30 border border-yellow-500/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span className="text-yellow-300 font-bold text-lg">AdaptFlow Attivo</span>
              </div>
              <p className="text-yellow-200/90 text-sm leading-relaxed">
                {adjustment.recommendation}
              </p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-yellow-500/30">
                {adjustment.volumeMultiplier < 1 && (
                  <div className="bg-yellow-500/20 px-3 py-1.5 rounded-lg">
                    <span className="text-yellow-300 font-semibold">
                      📊 Volume: -{Math.round((1 - adjustment.volumeMultiplier) * 100)}%
                    </span>
                  </div>
                )}
                {adjustment.intensityMultiplier < 1 && (
                  <div className="bg-yellow-500/20 px-3 py-1.5 rounded-lg">
                    <span className="text-yellow-300 font-semibold">
                      💪 Intensità: -{Math.round((1 - adjustment.intensityMultiplier) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isResting && (
          <div className="mb-6 bg-emerald-900/30 border-2 border-emerald-500 rounded-xl p-8 text-center animate-pulse">
            <Timer className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg mb-2">Recupero</p>
            <p className="text-6xl font-bold text-emerald-400 mb-6">
              {formatTime(restTimeLeft)}
            </p>
            <button
              onClick={handleSkipRest}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Salta Recupero →
            </button>
          </div>
        )}

        {!isResting && (
          <div className="bg-gray-800/50 border-2 border-emerald-500/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-white">
                {currentExercise.name}
              </h2>
              {adjustedWeight && (
                <div className="bg-emerald-500/20 px-4 py-2 rounded-lg">
                  <span className="text-emerald-400 font-bold text-2xl">
                    {adjustedWeight}kg
                  </span>
                </div>
              )}
            </div>

            {currentExercise.notes && (
              <p className="text-gray-400 mb-4">{currentExercise.notes}</p>
            )}

            {currentExercise.type === 'giant_set' && currentExercise.exercises && (
              <div className="space-y-2 mb-6 bg-gray-900/50 rounded-lg p-4">
                <p className="text-emerald-400 font-semibold mb-3">
                  🔥 {currentExercise.rounds} giri - Zero pause tra esercizi
                </p>
                {currentExercise.exercises.map((subEx: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-white">
                    <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold">{subEx.name}</span>
                    <span className="text-emerald-400">• {subEx.reps}</span>
                  </div>
                ))}
              </div>
            )}

                        <>
{/* Timer TUT o Rep Counter normale */}
            {currentExercise.tempo ? (
              <TUTTimer 
                tempo={currentExercise.tempo}
                currentRep={currentRep}
                totalReps={(() => {
                  const repsStr = currentExercise.reps;
                  if (typeof repsStr === 'string' && repsStr.includes('-')) {
                    return parseInt(repsStr.split('-')[1]) || 10;
                  }
                  return parseInt(repsStr) || 10;
                })()}
                onRepComplete={() => {
                  setCurrentRep(prev => prev + 1);
                }}
              />
            ) : (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Serie</p>
                  <p className="text-white font-bold text-2xl">
                    {currentSet}/{adjustedSets}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Ripetizioni</p>
                  <p className="text-white font-bold text-2xl">{currentExercise.reps}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Recupero</p>
                  <p className="text-white font-bold text-2xl">{currentExercise.rest}s</p>
                </div>
              </div>
            )}
           

            <button
              onClick={handleCompleteSet}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2"
            >
              <Check className="w-6 h-6" />
              {currentSet === adjustedSets ? 'Completa Esercizio' : 'Serie Completata'}
            </button>
                        </>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {Array.from({ length: adjustedSets }).map((_, idx) => (
            <div
              key={idx}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                completedSetsInExercise.includes(idx + 1)
                  ? 'bg-emerald-500 text-white'
                  : idx + 1 === currentSet
                  ? 'bg-emerald-500/50 text-white border-2 border-emerald-400'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {showPostSetScreening && (
        <PostSetScreening
          workoutId={state.program.id || 'current'}
          exerciseId={currentExercise.name}
          setNumber={currentSet}
          targetReps={
            typeof currentExercise.reps === 'string'
              ? parseInt(currentExercise.reps.split('-')[0]) || 10
              : (typeof currentExercise.reps === 'number' ? currentExercise.reps : 10)
          }
          goalType={getGoalType()}
          onComplete={handlePostSetFeedback}
        />
      )}
    </div>
  );
}
