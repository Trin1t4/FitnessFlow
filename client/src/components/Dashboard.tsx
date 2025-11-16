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

  // ===== SISTEMA GESTIONE DOLORI/INFORTUNI =====

  /**
   * Mappa zone doloranti → gerarchie di sostituzione progressive
   * Le alternative sono ordinate dalla PIÙ SIMILE alla PIÙ CONSERVATIVA
   */
  const PAIN_EXERCISE_MAP = {
    knee: {
      avoid: ['pistol', 'jump', 'bulgarian'],
      // GERARCHIA: mantieni pattern unilaterale → bilaterale → catena posteriore
      substitutions: {
        // Pistol Squat patterns
        'pistol': ['Affondi', 'Squat Completo', 'Glute Bridge'],
        'pistol assistito': ['Affondi', 'Squat Completo', 'Glute Bridge'],
        'pistol squat': ['Affondi', 'Squat Completo', 'Glute Bridge'],

        // Jump patterns
        'jump': ['Step Up', 'Squat Completo', 'Glute Bridge'],
        'jump squat': ['Step Up', 'Squat Completo', 'Glute Bridge'],

        // Squat patterns (solo se dolore moderato/severo)
        'squat': ['Goblet Squat', 'Box Squat', 'Glute Bridge'],
        'bulgarian': ['Affondi', 'Step Up', 'Glute Bridge'],
        'lunge': ['Step Up', 'Squat Completo', 'Glute Bridge']
      },
      correctives: ['Knee Mobility Circles', 'VMO Activation', 'Wall Sit Isometric', 'Quad Stretch']
    },

    lower_back: {
      avoid: ['deadlift', 'good_morning'],
      substitutions: {
        'stacco': ['RDL Leggero', 'Hip Hinge Corpo Libero', 'Glute Bridge'],
        'deadlift': ['RDL Leggero', 'Hip Hinge Corpo Libero', 'Glute Bridge'],
        'good morning': ['Hip Hinge Corpo Libero', 'Bird Dog', 'Glute Bridge'],
        'rdl': ['Single Leg RDL Leggero', 'Glute Bridge', 'Bird Dog'],

        // Squat (solo se schiena in compromesso)
        'squat': ['Goblet Squat', 'Box Squat', 'Leg Press se gym']
      },
      correctives: ['Cat-Cow', 'Bird Dog', 'Dead Bug', 'Pelvic Tilt', 'McGill Big 3']
    },

    shoulder: {
      avoid: ['hspu', 'handstand', 'overhead'],
      substitutions: {
        // Vertical push progressions
        'hspu': ['Pike Push-up', 'Incline Push-up', 'Push-up Standard'],
        'handstand': ['Pike Push-up', 'Incline Push-up', 'Push-up Standard'],
        'pike push': ['Incline Pike Push-up', 'Incline Push-up', 'Push-up Standard'],

        // Overhead patterns
        'overhead': ['Landmine Press', 'Floor Press', 'Push-up Standard'],
        'military press': ['Landmine Press', 'Floor Press', 'Push-up'],
        'press': ['Landmine Press', 'Floor Press', 'Push-up'],

        // Horizontal push (se dolore moderato)
        'push-up': ['Incline Push-up', 'Wall Push-up', 'Isometric Hold']
      },
      correctives: ['Shoulder Dislocations', 'Band Pull-Aparts', 'Face Pulls', 'YTW', 'Wall Slides']
    },

    wrist: {
      avoid: ['hspu', 'planche', 'push_up_standard'],
      substitutions: {
        'hspu': ['Pike su Pugni', 'Parallettes Pike', 'Dips'],
        'handstand': ['Handstand su Pugni', 'Parallettes', 'Dips'],
        'planche': ['Parallettes Lean', 'Dips', 'Ring Push-up'],
        'push-up': ['Knuckle Push-up', 'Parallettes Push-up', 'Dips'],
        'push up': ['Knuckle Push-up', 'Parallettes Push-up', 'Dips']
      },
      correctives: ['Wrist Circles', 'Wrist Flexion/Extension', 'Finger Flexion', 'Forearm Stretch']
    },

    ankle: {
      avoid: ['jump', 'sprint', 'pistol'],
      substitutions: {
        'jump': ['Step Up', 'Box Step', 'Squat'],
        'sprint': ['Walking Lunges', 'Step Up', 'Squat'],
        'calf raise': ['Seated Calf Raise', 'Isometric Calf Hold'],
        'pistol': ['Squat Completo', 'Goblet Squat', 'Leg Press']
      },
      correctives: ['Ankle Circles', 'Dorsiflexion Stretch', 'Calf Stretch', 'Ankle Mobility Drills']
    }
  };

  /**
   * Applica deload basato su intensità dolore
   * @param severity - 'mild' | 'moderate' | 'severe'
   * @param sets - sets originali
   * @param reps - reps originali
   * @param location - 'gym' | 'home'
   * @returns - sets/reps/load modificati
   */
  function applyPainDeload(severity: string, sets: number, reps: number, location: string) {
    if (severity === 'mild') {
      // LIEVE: riduzione 10-15%
      return {
        sets: sets,
        reps: Math.max(3, Math.floor(reps * 0.9)), // -10% reps
        loadReduction: location === 'gym' ? 0.90 : 1.0, // -10% kg se gym
        note: 'Deload leggero (dolore lieve)'
      };
    } else if (severity === 'moderate') {
      // MODERATO: riduzione 25-30%
      return {
        sets: Math.max(2, sets - 1), // -1 set
        reps: Math.max(3, Math.floor(reps * 0.7)), // -30% reps
        loadReduction: location === 'gym' ? 0.75 : 1.0, // -25% kg se gym
        needsEasierVariant: location === 'home', // Se home, serve variante più facile
        note: 'Deload moderato (dolore moderato) - Monitorare'
      };
    } else if (severity === 'severe') {
      // SEVERO: riduzione drastica + sostituzione
      return {
        sets: Math.max(2, Math.floor(sets * 0.5)), // -50% sets
        reps: Math.max(3, Math.floor(reps * 0.5)), // -50% reps
        loadReduction: location === 'gym' ? 0.5 : 1.0, // -50% kg se gym
        needsReplacement: true, // Sostituisci esercizio!
        needsEasierVariant: location === 'home',
        note: 'ATTENZIONE: Dolore severo - Esercizio sostituito + correttivi'
      };
    }

    return { sets, reps, loadReduction: 1.0, note: '' };
  }

  /**
   * Controlla se esercizio carica zona dolorante
   */
  function isExerciseConflicting(exerciseName: string, painArea: string): boolean {
    const avoidKeywords = PAIN_EXERCISE_MAP[painArea]?.avoid || [];
    const nameLower = exerciseName.toLowerCase();
    return avoidKeywords.some(keyword => nameLower.includes(keyword));
  }

  /**
   * Trova alternativa sicura per esercizio usando GERARCHIA PROGRESSIVA
   * @param originalExercise - Nome esercizio originale
   * @param painArea - Zona dolente
   * @param severity - Severità dolore (mild/moderate/severe)
   * @returns - Nome alternativa appropriata
   */
  function findSafeAlternative(originalExercise: string, painArea: string, severity: string): string {
    const substitutions = PAIN_EXERCISE_MAP[painArea]?.substitutions || {};
    const exerciseLower = originalExercise.toLowerCase();

    // Trova la chiave che matcha l'esercizio
    let matchedKey = null;
    for (const key of Object.keys(substitutions)) {
      if (exerciseLower.includes(key.toLowerCase())) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) {
      console.warn(`⚠️ Nessuna sostituzione trovata per: ${originalExercise}`);
      return originalExercise;
    }

    const alternatives = substitutions[matchedKey];

    // GERARCHIA BASATA SU SEVERITÀ:
    // - mild: prova PRIMA alternativa (più simile)
    // - moderate: prova SECONDA alternativa (intermedia)
    // - severe: vai ULTIMA alternativa (più conservativa)

    let index = 0;
    if (severity === 'moderate') {
      index = Math.min(1, alternatives.length - 1);
    } else if (severity === 'severe') {
      index = alternatives.length - 1; // Ultima (più conservativa)
    }

    const alternative = alternatives[index];
    console.log(`🔄 Sostituzione (${severity}): ${originalExercise} → ${alternative}`);

    return alternative;
  }

  /**
   * Ottieni esercizi correttivi per zona dolente
   */
  function getCorrectiveExercises(painArea: string): string[] {
    return PAIN_EXERCISE_MAP[painArea]?.correctives || [];
  }

  function generateLocalProgram(level: string, goal: string, onboarding: any) {
    const location = onboarding?.trainingLocation || 'home';
    const frequency = onboarding?.activityLevel?.weeklyFrequency || 3;

    // ✅ LEGGI BASELINE DALLO SCREENING
    const baselines = dataStatus.screening?.patternBaselines || {};

    // ✅ LEGGI DOLORI DALL'ONBOARDING
    const painAreas = onboarding?.painAreas || [];

    console.log('🎯 GENERAZIONE PROGRAMMA BASELINE-AWARE + PAIN-AWARE');
    console.log('📊 Baselines dallo screening:', baselines);
    console.log('🩹 Dolori rilevati:', painAreas);

    // ✅ COSTRUISCI ESERCIZI BASATI SU BASELINE
    const exercises = [];

    // Pattern mapping: pattern_id → exercise name
    const patternMap = {
      lower_push: baselines.lower_push,
      horizontal_push: baselines.horizontal_push,
      vertical_push: baselines.vertical_push,
      vertical_pull: baselines.vertical_pull,
      lower_pull: baselines.lower_pull,
      core: baselines.core
    };

    // Per ogni pattern, crea esercizio basato su baseline + gestione dolori
    Object.entries(patternMap).forEach(([patternId, baseline]: [string, any]) => {
      if (!baseline) return;

      // Calcola sets/reps basati su baseline E goal
      const baselineReps = baseline.reps;
      const volumeCalc = calculateVolume(baselineReps, goal, level);

      // Usa la STESSA variante dello screening (non più difficile!)
      let exerciseName = baseline.variantName;
      let finalSets = volumeCalc.sets;
      let finalReps = volumeCalc.reps;
      let painNotes = '';
      let wasReplaced = false;

      // ✅ GESTIONE DOLORI: Controlla conflitti con zone doloranti
      for (const painEntry of painAreas) {
        const painArea = painEntry.area || painEntry; // Supporta sia oggetto che stringa
        const severity = painEntry.severity || 'mild'; // Default mild se non specificato

        if (isExerciseConflicting(exerciseName, painArea)) {
          console.log(`⚠️ Conflitto: ${exerciseName} carica zona dolente: ${painArea} (${severity})`);

          // Applica deload basato su severità
          const deload = applyPainDeload(severity, finalSets, finalReps, location);

          finalSets = deload.sets;
          finalReps = deload.reps;
          painNotes = deload.note;

          // Se dolore severo o moderato casa → sostituisci esercizio
          if (deload.needsReplacement || (deload.needsEasierVariant && location === 'home')) {
            const alternative = findSafeAlternative(exerciseName, painArea, severity);
            exerciseName = alternative;
            wasReplaced = true;
            painNotes = `${painNotes} | Sostituito da ${baseline.variantName}`;
          }

          break; // Un solo dolore per volta (il primo trovato)
        }
      }

      exercises.push({
        pattern: patternId,
        name: exerciseName,
        sets: finalSets,
        reps: finalReps,
        rest: volumeCalc.rest,
        intensity: volumeCalc.intensity,
        baseline: {
          variantId: baseline.variantId,
          difficulty: baseline.difficulty,
          maxReps: baselineReps
        },
        wasReplaced: wasReplaced,
        notes: [
          volumeCalc.notes,
          `Baseline: ${baselineReps} reps @ diff. ${baseline.difficulty}/10`,
          painNotes
        ].filter(Boolean).join(' | ')
      });

      console.log(`✅ ${exerciseName}: ${finalSets}x${finalReps} @ ${volumeCalc.intensity} ${painNotes ? '(⚠️ ' + painNotes + ')' : ''}`);
    });

    // ✅ AGGIUNGI ESERCIZI CORRETTIVI per zone doloranti
    const correctiveExercises = [];
    for (const painEntry of painAreas) {
      const painArea = painEntry.area || painEntry;
      const correctives = getCorrectiveExercises(painArea);

      for (const corrective of correctives) {
        correctiveExercises.push({
          pattern: 'corrective',
          name: corrective,
          sets: 2,
          reps: '10-15',
          rest: '30s',
          intensity: 'Low',
          notes: `Correttivo per ${painArea} - Eseguire con focus sulla qualità`
        });
      }
    }

    // Aggiungi correttivi alla fine del programma
    exercises.push(...correctiveExercises);

    // Determina split basato su frequenza
    let split = 'FULL BODY';
    if (frequency >= 5) split = 'PUSH/PULL/LEGS';
    else if (frequency >= 4) split = 'UPPER/LOWER';
    else if (frequency >= 3) split = 'FULL BODY A/B';

    return {
      name: `Programma ${level.toUpperCase()} - ${goal}`,
      split: split,
      exercises: exercises,
      level,
      goal,
      location,
      frequency,
      totalWeeks: 8,
      createdAt: new Date().toISOString(),
      notes: `Programma personalizzato basato sulle TUE baseline. Parti da dove sei realmente, non da template generici.`
    };
  }

  /**
   * Calcola volume (sets/reps/rest) basato su baseline e goal
   */
  function calculateVolume(baselineMaxReps: number, goal: string, level: string) {
    // ✅ BEGINNER: Scheda di ADATTAMENTO ANATOMICO fissa
    // 3x10 @ 65% del massimale, rest 90s
    // Focus: imparare tecnica, costruire base, prevenire infortuni
    if (level === 'beginner') {
      const workingReps = Math.max(8, Math.min(Math.floor(baselineMaxReps * 0.65), 10));

      return {
        sets: 3,
        reps: workingReps, // Target 10 reps, ma max 65% della baseline
        rest: '90s',
        intensity: '65%', // Percentuale del massimale
        notes: 'Adattamento Anatomico - Focus sulla tecnica'
      };
    }

    // ✅ INTERMEDIATE/ADVANCED: Sistema adattivo basato su goal
    // REGOLA CALISTHENICS: VOLUME è il re, non intensità!
    // Forza = alto volume con progressioni di difficoltà
    // Ipertrofia = volume moderato con TUT (tempo sotto tensione)
    // Endurance = volume alto con reps alte

    const workingReps = Math.max(4, Math.floor(baselineMaxReps * 0.75));

    // ✅ FORZA (Calisthenics): ALTO VOLUME, reps moderate (5-8)
    // La progressione viene da varianti più difficili, non da reps bassissime
    let sets = 4; // Default
    let reps = workingReps;
    let rest = '90s';
    let intensity = '75%';

    if (goal === 'strength') {
      // CALISTHENICS STRENGTH: Volume alto per skill acquisition + forza
      sets = level === 'advanced' ? 6 : 5; // Più sets per pratica
      reps = Math.max(5, Math.min(workingReps, 8)); // 5-8 reps (sweet spot calisthenics)
      rest = '2-3min'; // Recupero completo ma non eccessivo
      intensity = '75%'; // Volume > Intensità nel bodyweight
    } else if (goal === 'muscle_gain') {
      // IPERTROFIA: Volume moderato-alto, TUT
      sets = level === 'advanced' ? 5 : 4;
      reps = Math.max(6, Math.min(workingReps, 12)); // 6-12 reps
      rest = '60-90s';
      intensity = '70-80%'; // TUT importante
    } else if (goal === 'endurance') {
      // ENDURANCE: Volume alto, reps alte, rest brevi
      sets = 4;
      reps = Math.max(12, Math.min(workingReps, 20)); // 12-20 reps
      rest = '30-45s';
      intensity = '60-70%';
    } else {
      // GENERAL FITNESS: bilanciato
      sets = 4;
      reps = Math.max(8, Math.min(workingReps, 12)); // 8-12 reps
      rest = '60-90s';
      intensity = '70%';
    }

    return { sets, reps, rest, intensity };
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
                    <h4 className="font-semibold mb-3">Esercizi (basati sulle tue baseline):</h4>
                    <ul className="space-y-3">
                      {program.exercises?.map((ex: any, i: number) => {
                        const isCorrective = ex.pattern === 'corrective';
                        const wasReplaced = ex.wasReplaced;

                        return (
                          <li
                            key={i}
                            className={`rounded-lg p-3 border ${
                              isCorrective
                                ? 'bg-blue-900/20 border-blue-600'
                                : wasReplaced
                                ? 'bg-orange-900/20 border-orange-600'
                                : 'bg-gray-800/50 border-gray-600'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`font-bold ${
                                isCorrective ? 'text-blue-400' : wasReplaced ? 'text-orange-400' : 'text-green-400'
                              }`}>
                                {isCorrective ? '🔧' : wasReplaced ? '⚠️' : `${i + 1}.`}
                              </span>
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  isCorrective ? 'text-blue-300' : wasReplaced ? 'text-orange-300' : 'text-white'
                                }`}>
                                  {ex.name || ex}
                                  {isCorrective && <span className="text-xs ml-2 text-blue-400">(Correttivo)</span>}
                                  {wasReplaced && <span className="text-xs ml-2 text-orange-400">(Sostituito)</span>}
                                </p>
                                {ex.sets && ex.reps && (
                                  <p className="text-sm text-gray-400 mt-1">
                                    {ex.sets} sets × {ex.reps} reps
                                    {ex.intensity && <span className="text-blue-400"> @ {ex.intensity}</span>}
                                    {' • '}Rest: {ex.rest}
                                  </p>
                                )}
                                {ex.notes && (
                                  <p className="text-xs text-gray-500 mt-1">{ex.notes}</p>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
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