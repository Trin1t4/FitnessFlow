import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity, CheckCircle, AlertCircle, Zap, Target, RotateCcw, Trash2 } from 'lucide-react';
import { validateAndNormalizePainAreas } from '../utils/validators';
import { generateProgram } from '../utils/programGenerator';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasProgram, setHasProgram] = useState(false);
  const [program, setProgram] = useState<any>(null);
  const [generatingProgram, setGeneratingProgram] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [dataStatus, setDataStatus] = useState({
    onboarding: null as any,
    quiz: null as any,
    screening: null as any
  });

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    // Carica TUTTI i dati salvati
    const onboarding = localStorage.getItem('onboarding_data');
    const quiz = localStorage.getItem('quiz_data');
    const screening = localStorage.getItem('screening_data');
    const savedProgram = localStorage.getItem('currentProgram');

    if (onboarding) setDataStatus(prev => ({ ...prev, onboarding: JSON.parse(onboarding) }));
    if (quiz) setDataStatus(prev => ({ ...prev, quiz: JSON.parse(quiz) }));
    if (screening) setDataStatus(prev => ({ ...prev, screening: JSON.parse(screening) }));
    if (savedProgram) {
      setProgram(JSON.parse(savedProgram));
      setHasProgram(true);
    }

    console.log('📊 DATA STATUS:', {
      hasOnboarding: !!onboarding,
      hasQuiz: !!quiz,
      hasScreening: !!screening,
      screeningLevel: screening ? JSON.parse(screening).level : null
    });
  }

  async function handleDeepReset() {
    setResetting(true);
    
    try {
      console.log('🔄 STARTING DEEP RESET...');
      
      // 1. PULISCI LOCALSTORAGE
      console.log('1️⃣ Clearing localStorage...');
      const keysToRemove = [
        'onboarding_data',
        'quiz_data',
        'screening_data',
        'body_composition_data',
        'assessment_results',
        'currentProgram',
        'programGenerated',
        'generatedProgram',
        'recovery_screening_data',
        'recovery_program_data',
        'tempUserId',
        'userId',
        'loopBreaker'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`  ✅ Removed: ${key}`);
      });

      // 2. PULISCI SUPABASE
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('2️⃣ Cleaning Supabase for user:', user.id);
        
        // Cancella training programs
        const { error: programError } = await supabase
          .from('training_programs')
          .delete()
          .eq('user_id', user.id);
        
        if (programError) {
          console.error('Error deleting programs:', programError);
        } else {
          console.log('  ✅ Training programs deleted');
        }

        // Cancella assessments
        const { error: assessmentError } = await supabase
          .from('assessments')
          .delete()
          .eq('user_id', user.id);
        
        if (assessmentError) {
          console.error('Error deleting assessments:', assessmentError);
        } else {
          console.log('  ✅ Assessments deleted');
        }

        // Cancella body scans se esistono
        const { error: scanError } = await supabase
          .from('body_scans')
          .delete()
          .eq('user_id', user.id);
        
        if (!scanError) {
          console.log('  ✅ Body scans deleted');
        }

        // Cancella onboarding data
        const { error: onboardingError } = await supabase
          .from('onboarding_data')
          .delete()
          .eq('user_id', user.id);
        
        if (!onboardingError) {
          console.log('  ✅ Onboarding data deleted');
        }
      } else {
        console.log('ℹ️ No authenticated user, skipping Supabase cleanup');
      }

      // 3. RESET UI STATE
      console.log('3️⃣ Resetting UI state...');
      setHasProgram(false);
      setProgram(null);
      setDataStatus({
        onboarding: null,
        quiz: null,
        screening: null
      });

      console.log('✅ DEEP RESET COMPLETE!');
      alert('✅ Reset completo! Tutti i dati sono stati eliminati.\n\nVerrai reindirizzato all\'onboarding.');
      
      // 4. REDIRECT
      setTimeout(() => {
        navigate('/onboarding');
      }, 1500);

    } catch (error) {
      console.error('❌ Reset error:', error);
      alert('Errore durante il reset. Alcuni dati potrebbero non essere stati eliminati.');
    } finally {
      setResetting(false);
      setShowResetModal(false);
    }
  }

  async function handleQuickTest(level: 'beginner' | 'intermediate' | 'advanced') {
    console.log(`🧪 QUICK TEST MODE: Setting up ${level} profile...`);
    
    // Crea dati di test per il livello scelto
    const testData = {
      beginner: {
        quizScore: 30,
        practicalScore: 25,
        physicalScore: 60
      },
      intermediate: {
        quizScore: 60,
        practicalScore: 55,
        physicalScore: 70
      },
      advanced: {
        quizScore: 90,
        practicalScore: 85,
        physicalScore: 80
      }
    };

    const scores = testData[level];
    const finalScore = (scores.quizScore * 0.5) + (scores.practicalScore * 0.3) + (scores.physicalScore * 0.2);

    // Salva dati di test
    const onboardingData = {
      personalInfo: {
        gender: 'M',
        age: 30,
        height: 175,
        weight: 75,
        bmi: 24.5
      },
      trainingLocation: 'home',
      goal: 'muscle_gain',
      activityLevel: {
        weeklyFrequency: 3,
        sessionDuration: 60
      },
      equipment: {}
    };

    const quizData = {
      score: scores.quizScore,
      level: level,
      completedAt: new Date().toISOString()
    };

    // Crea baseline mock appropriate per il livello
    const baselinesByLevel = {
      beginner: {
        lower_push: { variantId: 'air_squat', variantName: 'Air Squat', difficulty: 2, reps: 10 },
        horizontal_push: { variantId: 'incline_pushup', variantName: 'Incline Push-up', difficulty: 3, reps: 8 },
        vertical_push: { variantId: 'wall_pushup', variantName: 'Wall Push-up', difficulty: 2, reps: 12 },
        vertical_pull: { variantId: 'inverted_row', variantName: 'Inverted Row', difficulty: 4, reps: 6 },
        lower_pull: { variantId: 'glute_bridge', variantName: 'Glute Bridge', difficulty: 2, reps: 15 },
        core: { variantId: 'plank', variantName: 'Plank', difficulty: 3, reps: 30 }
      },
      intermediate: {
        lower_push: { variantId: 'pistol_assisted', variantName: 'Pistol Assistito', difficulty: 5, reps: 8 },
        horizontal_push: { variantId: 'standard_pushup', variantName: 'Push-up Standard', difficulty: 5, reps: 12 },
        vertical_push: { variantId: 'pike_pushup', variantName: 'Pike Push-up', difficulty: 6, reps: 10 },
        vertical_pull: { variantId: 'pullup', variantName: 'Pull-up', difficulty: 7, reps: 8 },
        lower_pull: { variantId: 'nordic_curl_assisted', variantName: 'Nordic Curl Assistito', difficulty: 6, reps: 6 },
        core: { variantId: 'hanging_knee_raise', variantName: 'Hanging Knee Raise', difficulty: 6, reps: 12 }
      },
      advanced: {
        lower_push: { variantId: 'pistol_squat', variantName: 'Pistol Squat', difficulty: 8, reps: 12 },
        horizontal_push: { variantId: 'archer_pushup', variantName: 'Archer Push-up', difficulty: 8, reps: 10 },
        vertical_push: { variantId: 'hspu', variantName: 'Handstand Push-up', difficulty: 9, reps: 8 },
        vertical_pull: { variantId: 'pullup_weighted', variantName: 'Pull-up Zavorrato', difficulty: 9, reps: 10 },
        lower_pull: { variantId: 'nordic_curl', variantName: 'Nordic Curl', difficulty: 9, reps: 8 },
        core: { variantId: 'dragon_flag', variantName: 'Dragon Flag', difficulty: 10, reps: 6 }
      }
    };

    const screeningData = {
      level: level,
      finalScore: finalScore.toFixed(1),
      practicalScore: scores.practicalScore.toFixed(1),
      physicalScore: scores.physicalScore.toFixed(1),
      patternBaselines: baselinesByLevel[level],
      completed: true,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
    localStorage.setItem('quiz_data', JSON.stringify(quizData));
    localStorage.setItem('screening_data', JSON.stringify(screeningData));

    console.log(`✅ Test data created for ${level.toUpperCase()}`);
    alert(`✅ Profilo di test ${level.toUpperCase()} creato!\n\nOra puoi generare un programma.`);
    
    // Ricarica i dati
    loadData();
    setShowResetModal(false);
  }

  async function handleGenerateProgram() {
    try {
      setGeneratingProgram(true);

      // USA I DATI SALVATI DA SCREENING
      const { onboarding, quiz, screening } = dataStatus;

      if (!screening || !screening.level) {
        alert('⚠️ Completa prima lo screening per determinare il tuo livello!');
        navigate('/screening');
        return;
      }

      const userLevel = screening.level;
      
      // Mapping goal
      const goalMap: Record<string, string> = {
        'forza': 'strength',
        'massa': 'muscle_gain',
        'massa muscolare': 'muscle_gain',
        'definizione': 'fat_loss',
        'dimagrimento': 'fat_loss',
        'resistenza': 'endurance'
      };

      const originalGoal = onboarding?.goal || 'muscle_gain';
      const mappedGoal = goalMap[originalGoal.toLowerCase()] || originalGoal;

      console.group('🎯 PROGRAM GENERATION');
      console.log('Level from Screening:', userLevel);
      console.log('Screening Scores:', {
        final: screening.finalScore,
        quiz: quiz?.score,
        practical: screening.practicalScore,
        physical: screening.physicalScore
      });
      console.log('Goal:', originalGoal, '→', mappedGoal);
      console.groupEnd();

      // Genera localmente
      const generatedProgram = generateLocalProgram(userLevel, mappedGoal, onboarding);

      // Salva il programma
      localStorage.setItem('currentProgram', JSON.stringify(generatedProgram));
      setProgram(generatedProgram);
      setHasProgram(true);

      alert(`✅ Programma ${userLevel.toUpperCase()} per ${mappedGoal.toUpperCase()} generato con successo!`);

    } catch (error) {
      console.error('❌ Error:', error);
      alert('Errore nella generazione del programma');
    } finally {
      setGeneratingProgram(false);
    }
  }

  // ===== PROGRAM GENERATION (uses extracted utils) =====

  /**
   * Wrapper per generazione programma - usa utils estratti
   * Mantiene compatibilità con il codice esistente del Dashboard
   */
  function generateLocalProgram(level: string, goal: string, onboarding: any) {
    const location = onboarding?.trainingLocation || 'home';
    const frequency = onboarding?.activityLevel?.weeklyFrequency || 3;
    const trainingType = onboarding?.trainingType || 'bodyweight';
    const equipment = onboarding?.equipment || {};
    const baselines = dataStatus.screening?.patternBaselines || {};

    // Valida pain areas usando il validator estratto
    const rawPainAreas = onboarding?.painAreas || [];
    const painAreas = validateAndNormalizePainAreas(rawPainAreas);

    // Usa la funzione estratta da programGenerator.ts
    const program = generateProgram({
      level: level as any,
      goal: goal as any,
      location,
      trainingType: trainingType as any,
      frequency,
      baselines,
      painAreas,
      equipment
    });

    // Aggiungi campi richiesti dal formato esistente
    return {
      ...program,
      location,
      totalWeeks: 8,
      createdAt: new Date().toISOString()
    };
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header con bottone Reset */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-display font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
          >
            Dashboard Intelligente
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowResetModal(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  {dataStatus.onboarding ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                  Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 font-medium">
                  {dataStatus.onboarding ? (
                    <>Goal: <span className="text-emerald-400">{dataStatus.onboarding.goal}</span></>
                  ) : 'Non completato'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  {dataStatus.quiz ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                  Quiz Teorico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 font-medium">
                  {dataStatus.quiz ? (
                    <>Score: <span className="text-emerald-400 font-mono">{dataStatus.quiz.score}%</span></>
                  ) : 'Non completato'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  {dataStatus.screening ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
                  Screening
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 font-medium">
                  {dataStatus.screening ? (
                    <>Level: <span className="text-emerald-400 font-bold">{dataStatus.screening.level?.toUpperCase()}</span></>
                  ) : 'Non completato'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Program Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-3xl font-display font-bold">
                {hasProgram ? '✅ Il Tuo Programma' : '📋 Genera il Tuo Programma'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasProgram ? (
                <>
                  {dataStatus.screening && (
                    <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50">
                      <h3 className="font-display font-semibold text-lg mb-3">Il tuo profilo:</h3>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li className="flex items-center gap-2">
                          <span>• Livello:</span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {dataStatus.screening.level?.toUpperCase()}
                          </span>
                        </li>
                        <li>• Goal: <span className="text-emerald-400 font-semibold">{dataStatus.onboarding?.goal}</span></li>
                        <li>• Location: <span className="text-slate-200 font-semibold">{dataStatus.onboarding?.trainingLocation}</span></li>
                        <li>• Score finale: <span className="text-emerald-400 font-mono font-bold">{dataStatus.screening.finalScore}%</span></li>
                      </ul>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateProgram}
                    disabled={generatingProgram || !dataStatus.screening}
                    className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:shadow-none"
                  >
                    {generatingProgram ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                        Generazione...
                      </span>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Genera Programma Personalizzato
                      </>
                    )}
                  </motion.button>

                  {!dataStatus.screening && (
                    <p className="text-center text-slate-400 text-sm">
                      Completa prima lo screening per generare il programma
                    </p>
                  )}
                </>
            ) : (
              <>
                <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50">
                  <div className="mb-4">
                    <h3 className="text-2xl font-display font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      {program.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                        📊 Level: {program.level?.toUpperCase()}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                        🎯 Goal: {program.goal}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-slate-600/50 text-slate-300 border border-slate-500/30 font-medium">
                        📍 {program.location}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-1">
                    <p className="text-slate-300">Split: <span className="font-display font-semibold text-white">{program.split}</span></p>
                    <p className="text-slate-300">Frequenza: <span className="font-display font-semibold text-white">{program.frequency}x/settimana</span></p>
                  </div>

                  <div>
                    <h4 className="font-display font-semibold text-lg mb-4">Esercizi (basati sulle tue baseline):</h4>
                    <ul className="space-y-3">
                      {program.exercises?.map((ex: any, i: number) => {
                        const isCorrective = ex.pattern === 'corrective';
                        const wasReplaced = ex.wasReplaced;

                        return (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className={`rounded-xl p-4 border backdrop-blur-sm transition-all duration-200 ${
                              isCorrective
                                ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
                                : wasReplaced
                                ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                                : 'bg-slate-800/50 border-slate-600/50 hover:border-emerald-500/30'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`font-mono font-bold text-lg ${
                                isCorrective ? 'text-blue-400' : wasReplaced ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {isCorrective ? '🔧' : wasReplaced ? '⚠️' : `${i + 1}.`}
                              </span>
                              <div className="flex-1">
                                <p className={`font-semibold text-base ${
                                  isCorrective ? 'text-blue-300' : wasReplaced ? 'text-amber-300' : 'text-white'
                                }`}>
                                  {ex.name || ex}
                                  {isCorrective && <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">(Correttivo)</span>}
                                  {wasReplaced && <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">(Sostituito)</span>}
                                </p>
                                {ex.sets && ex.reps && (
                                  <p className="text-sm text-slate-400 mt-2 font-medium">
                                    <span className="font-mono text-emerald-400">{ex.sets} sets</span> × <span className="font-mono text-emerald-400">{ex.reps} reps</span>
                                    {ex.intensity && <span className="text-blue-400 font-mono"> @ {ex.intensity}</span>}
                                    {' • '}Rest: <span className="font-mono">{ex.rest}</span>
                                  </p>
                                )}
                                {ex.notes && (
                                  <p className="text-xs text-slate-500 mt-2 italic">{ex.notes}</p>
                                )}
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>

                  {program.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-600/50">
                      <p className="text-sm text-slate-400 italic">{program.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/workout')}
                    className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
                  >
                    <Activity className="w-5 h-5" />
                    Inizia Allenamento
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (confirm('Vuoi rigenerare il programma?')) {
                        localStorage.removeItem('currentProgram');
                        setHasProgram(false);
                        setProgram(null);
                      }
                    }}
                    className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl border border-slate-600/50 transition-all duration-300"
                  >
                    Rigenera
                  </motion.button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Modal Reset */}
      {showResetModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-slate-700/50 shadow-2xl"
          >
            <h2 className="text-3xl font-display font-bold mb-6 text-white">🔄 Opzioni Reset</h2>
            
            <div className="space-y-4">
              {/* Reset Profondo */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="font-display font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Reset Profondo
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  Elimina TUTTO: localStorage, Supabase, programmi, assessments. Ricomincia da zero.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeepReset}
                  disabled={resetting}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/20 transition-all duration-300"
                >
                  {resetting ? 'Reset in corso...' : 'Esegui Reset Profondo'}
                </motion.button>
              </div>

              {/* Test Veloce */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="font-display font-semibold text-emerald-400 mb-2">🧪 Test Veloce</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Crea un profilo di test per provare i diversi livelli:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickTest('beginner')}
                    className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2 rounded-lg text-sm font-semibold shadow-md"
                  >
                    Principiante
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickTest('intermediate')}
                    className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2 rounded-lg text-sm font-semibold shadow-md"
                  >
                    Intermedio
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickTest('advanced')}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-semibold shadow-md"
                  >
                    Avanzato
                  </motion.button>
                </div>
              </div>

              {/* Annulla */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResetModal(false)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl border border-slate-600/50 transition-all duration-300"
              >
                Annulla
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}