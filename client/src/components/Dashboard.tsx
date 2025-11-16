      import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Activity, CheckCircle, AlertCircle, Zap, Target, RotateCcw, Trash2 } from 'lucide-react';

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

    const screeningData = {
      level: level,
      finalScore: finalScore.toFixed(1),
      practicalScore: scores.practicalScore.toFixed(1),
      physicalScore: scores.physicalScore.toFixed(1),
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

  function generateLocalProgram(level: string, goal: string, onboarding: any) {
    const location = onboarding?.trainingLocation || 'home';
    const frequency = onboarding?.activityLevel?.weeklyFrequency || 3;

    const programs = {
      beginner: {
        name: `Programma Base ${goal}`,
        split: 'FULL BODY',
        exercises: location === 'gym' ? [
          'Leg Press: 3x12-15',
          'Lat Machine: 3x12-15',
          'Chest Press: 3x12-15',
          'Shoulder Press Machine: 3x12-15',
          'Cable Curl: 3x12-15',
          'Tricep Pushdown: 3x12-15'
        ] : [
          'Squat a corpo libero: 3x10-15',
          'Push-up ginocchia: 3x8-12',
          'Superman: 3x10-15',
          'Plank: 3x20-30s',
          'Glute Bridge: 3x12-15',
          'Mountain Climbers: 3x20'
        ]
      },
      intermediate: {
        name: `Programma Intermedio ${goal}`,
        split: frequency >= 4 ? 'UPPER/LOWER' : 'FULL BODY A/B',
        exercises: location === 'gym' ? [
          'Squat: 4x8-10',
          'Romanian Deadlift: 4x8-10',
          'Panca Piana: 4x8-10',
          'Rematore: 4x8-10',
          'Military Press: 3x8-12',
          'Pull-up assistite: 3x6-10'
        ] : [
          'Pistol Squat assistito: 4x5-8',
          'Nordic Curl eccentrico: 3x5-8',
          'Diamond Push-up: 4x8-12',
          'Pike Push-up: 3x8-10',
          'Archer Row: 4x8-10 per lato',
          'L-Sit progression: 3x10-20s'
        ]
      },
      advanced: {
        name: `Programma Avanzato ${goal}`,
        split: frequency >= 5 ? 'PUSH/PULL/LEGS' : 'UPPER/LOWER',
        exercises: goal === 'strength' ?
          location === 'gym' ? [
            'Squat: 5x3-5 @85%',
            'Stacco: 5x3-5 @85%',
            'Panca Piana: 5x3-5 @85%',
            'Military Press: 4x5 @80%',
            'Weighted Pull-up: 4x5',
            'Barbell Row: 4x5'
          ] : [
            'Pistol Squat: 5x3-5 per gamba',
            'Archer Push-up: 5x5-6 per lato',
            'One Arm Pull-up progression: 5x3-5',
            'Handstand Push-up: 4x3-5',
            'Front Lever progression: 5x5-10s',
            'Planche progression: 5x5-10s'
          ]
        : [
          'Squat: 4x6-8',
          'Romanian Deadlift: 4x8-10',
          'Panca Inclinata: 4x6-8',
          'Pull-up weighted: 4x6-8',
          'Dips: 4x8-10',
          'Face Pulls: 3x12-15'
        ]
      }
    };

    const programTemplate = programs[level as keyof typeof programs] || programs.beginner;

    return {
      ...programTemplate,
      level,
      goal,
      location,
      frequency,
      totalWeeks: 8,
      createdAt: new Date().toISOString(),
      notes: `Programma personalizzato basato su: Quiz ${dataStatus.quiz?.score}%, Test pratici ${dataStatus.screening?.practicalScore}%, Parametri fisici ${dataStatus.screening?.physicalScore}%`
    };
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header con bottone Reset */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard Intelligente</h1>
          <button
            onClick={() => setShowResetModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {dataStatus.onboarding ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-yellow-500" />}
                Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                {dataStatus.onboarding ? `Goal: ${dataStatus.onboarding.goal}` : 'Non completato'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {dataStatus.quiz ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-yellow-500" />}
                Quiz Teorico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                {dataStatus.quiz ? `Score: ${dataStatus.quiz.score}%` : 'Non completato'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {dataStatus.screening ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-yellow-500" />}
                Screening
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                {dataStatus.screening ? `Level: ${dataStatus.screening.level?.toUpperCase()}` : 'Non completato'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Program Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl">
              {hasProgram ? '✅ Il Tuo Programma' : '📋 Genera il Tuo Programma'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasProgram ? (
              <>
                {dataStatus.screening && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Il tuo profilo:</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Livello: <span className="text-green-400 font-bold">{dataStatus.screening.level?.toUpperCase()}</span></li>
                      <li>• Goal: <span className="text-blue-400">{dataStatus.onboarding?.goal}</span></li>
                      <li>• Location: <span className="text-yellow-400">{dataStatus.onboarding?.trainingLocation}</span></li>
                      <li>• Score finale: {dataStatus.screening.finalScore}%</li>
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleGenerateProgram}
                  disabled={generatingProgram || !dataStatus.screening}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  {generatingProgram ? 'Generazione...' : (
                    <>
                      <Zap className="w-5 h-5" />
                      Genera Programma Personalizzato
                    </>
                  )}
                </button>

                {!dataStatus.screening && (
                  <p className="text-center text-gray-400 text-sm">
                    Completa prima lo screening per generare il programma
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-2">{program.name}</h3>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>📊 Level: <span className="text-green-400">{program.level?.toUpperCase()}</span></span>
                      <span>🎯 Goal: <span className="text-blue-400">{program.goal}</span></span>
                      <span>📍 {program.location}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 mb-2">Split: <span className="font-semibold">{program.split}</span></p>
                    <p className="text-gray-300">Frequenza: <span className="font-semibold">{program.frequency}x/settimana</span></p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Esercizi Principali:</h4>
                    <ul className="space-y-2">
                      {program.exercises?.map((ex: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-400">▸</span>
                          <span className="text-gray-300">{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {program.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <p className="text-xs text-gray-400">{program.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/workout')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Activity className="w-5 h-5" />
                    Inizia Allenamento
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Vuoi rigenerare il programma?')) {
                        localStorage.removeItem('currentProgram');
                        setHasProgram(false);
                        setProgram(null);
                      }
                    }}
                    className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg"
                  >
                    Rigenera
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-white">🔄 Opzioni Reset</h2>
            
            <div className="space-y-4">
              {/* Reset Profondo */}
              <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Reset Profondo
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  Elimina TUTTO: localStorage, Supabase, programmi, assessments. Ricomincia da zero.
                </p>
                <button
                  onClick={handleDeepReset}
                  disabled={resetting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 rounded"
                >
                  {resetting ? 'Reset in corso...' : 'Esegui Reset Profondo'}
                </button>
              </div>

              {/* Test Veloce */}
              <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">🧪 Test Veloce</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Crea un profilo di test per provare i diversi livelli:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickTest('beginner')}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm"
                  >
                    Principiante
                  </button>
                  <button
                    onClick={() => handleQuickTest('intermediate')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded text-sm"
                  >
                    Intermedio
                  </button>
                  <button
                    onClick={() => handleQuickTest('advanced')}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm"
                  >
                    Avanzato
                  </button>
                </div>
              </div>

              {/* Annulla */}
              <button
                onClick={() => setShowResetModal(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}