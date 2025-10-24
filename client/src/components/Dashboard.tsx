import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Calendar, TrendingUp, Dumbbell, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  workoutsCompleted: number;
  currentStreak: number;
  weeklyProgress: number;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
}

interface NextWorkout {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface RecentWorkout {
  id: string;
  date: string;
  workoutName: string;
  duration: number;
  exercisesCompleted: number;
  totalSets: number;
  notes?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [nextWorkout, setNextWorkout] = useState<NextWorkout | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
    fetchDashboardData();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      // Controlla prima in Supabase
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('id, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking assessment:', error);
      }

      // Se trova assessment in Supabase
      if (assessment && assessment.length > 0) {
        setHasCompletedOnboarding(true);
        generateMockWorkout(); // Genera scheda mock
        return;
      }

      // Fallback: controlla localStorage
      const localAssessment = localStorage.getItem('assessment_data');
      if (localAssessment) {
        const parsed = JSON.parse(localAssessment);
        if (parsed.completed === true) {
          setHasCompletedOnboarding(true);
          generateMockWorkout(); // Genera scheda mock
        }
      } else {
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
    }
  };

  const generateMockWorkout = () => {
    // Leggi dati onboarding per personalizzare
    const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
    const assessmentData = JSON.parse(localStorage.getItem('assessment_data') || '{}');
    const quizData = JSON.parse(localStorage.getItem('quiz_result') || '{}');
    
    const isGym = onboardingData.trainingLocation === 'gym';
    const goal = onboardingData.goal || 'muscle_gain';
    const level = quizData.level || 'intermediate';

    // Genera scheda personalizzata basata su dati
    let workoutName = 'Push Day - Petto e Spalle';
    let exercises: Exercise[] = [];

    if (isGym) {
      // Scheda palestra
      if (goal === 'muscle_gain' || goal === 'toning') {
        exercises = [
          { name: 'Panca piana', sets: 4, reps: '8-10', weight: '60kg' },
          { name: 'Panca inclinata manubri', sets: 3, reps: '10-12', weight: '20kg' },
          { name: 'Croci ai cavi', sets: 3, reps: '12-15', weight: '15kg' },
          { name: 'Military press', sets: 4, reps: '8-10', weight: '40kg' },
          { name: 'Alzate laterali', sets: 3, reps: '12-15', weight: '8kg' }
        ];
      } else if (goal === 'strength') {
        exercises = [
          { name: 'Panca piana', sets: 5, reps: '5', weight: '80kg' },
          { name: 'Military press', sets: 5, reps: '5', weight: '50kg' },
          { name: 'Dips', sets: 3, reps: '6-8', weight: 'Bodyweight +10kg' },
          { name: 'Panca stretta', sets: 3, reps: '6-8', weight: '60kg' }
        ];
      } else {
        // weight_loss/endurance
        exercises = [
          { name: 'Push-up', sets: 4, reps: '15-20', weight: 'Bodyweight' },
          { name: 'Panca piana', sets: 3, reps: '12-15', weight: '40kg' },
          { name: 'Pike push-up', sets: 3, reps: '15', weight: 'Bodyweight' },
          { name: 'Alzate laterali', sets: 3, reps: '15-20', weight: '5kg' },
          { name: 'Plank', sets: 3, reps: '45s', weight: '-' }
        ];
      }
    } else {
      // Scheda casa
      workoutName = 'Push Day - Petto e Spalle (Casa)';
      exercises = [
        { name: 'Push-up', sets: 4, reps: '12-15', weight: 'Bodyweight' },
        { name: 'Pike push-up', sets: 3, reps: '10-12', weight: 'Bodyweight' },
        { name: 'Diamond push-up', sets: 3, reps: '8-10', weight: 'Bodyweight' },
        { name: 'Plank to pike', sets: 3, reps: '12', weight: 'Bodyweight' },
        { name: 'Plank', sets: 3, reps: '60s', weight: '-' }
      ];
    }

    setNextWorkout({
      day: 'Lunedì',
      focus: workoutName,
      exercises
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const workoutsRes = await fetch('/api/workouts');
      const workoutsData = await workoutsRes.json();
      setRecentWorkouts(workoutsData.workouts || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Oggi';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Il tuo progresso fitness</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Allenamenti Completati</p>
                <p className="text-3xl font-bold text-emerald-400">{stats?.workoutsCompleted || 0}</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Serie di Giorni</p>
                <p className="text-3xl font-bold text-blue-400">{stats?.currentStreak || 0}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Progresso Settimanale</p>
                <p className="text-3xl font-bold text-purple-400">{stats?.weeklyProgress || 0}%</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            {!hasCompletedOnboarding ? (
              <div className="text-center py-8">
                <div className="bg-emerald-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Completa lo Screening</h2>
                <p className="text-gray-400 mb-6">
                  Rispondi ad alcune domande per ricevere il tuo programma di allenamento personalizzato
                </p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Dumbbell className="w-5 h-5" />
                  Inizia lo Screening
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-emerald-400" />
                    Prossimo Allenamento
                  </h2>
                </div>

                {nextWorkout ? (
                  <div className="space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Giorno</p>
                      <p className="font-semibold text-lg">{nextWorkout.day}</p>
                      <p className="text-emerald-400 text-sm mt-1">{nextWorkout.focus}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-400 font-medium">Esercizi Previsti:</p>
                      {nextWorkout.exercises.map((ex, idx) => (
                        <div key={idx} className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{ex.name}</span>
                            <span className="text-sm text-gray-400">
                              {ex.sets}x{ex.reps}
                              {ex.weight && ` @ ${ex.weight}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors">
                      Inizia Allenamento
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Nessun allenamento programmato</p>
                )}
              </>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Ultimi Allenamenti
              </h2>
              {recentWorkouts.length > 0 && (
                <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  Vedi tutti
                </button>
              )}
            </div>

            {recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {recentWorkouts.slice(0, 5).map((workout) => (
                  <div
                    key={workout.id}
                    className="bg-gray-700/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {workout.workoutName}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatDate(workout.date)}
                        </p>
                      </div>
                      <div className="bg-emerald-500/20 px-3 py-1 rounded-full">
                        <span className="text-emerald-400 text-sm font-medium">
                          Completato
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{workout.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4" />
                        <span>{workout.exercisesCompleted} esercizi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        <span>{workout.totalSets} serie</span>
                      </div>
                    </div>

                    {workout.notes && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-sm text-gray-400 italic">
                          "{workout.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-700/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Dumbbell className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-2">Nessun allenamento completato</p>
                <p className="text-sm text-gray-500">
                  Inizia il tuo primo workout per vedere i progressi!
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
