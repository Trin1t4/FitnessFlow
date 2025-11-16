import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Circle, ArrowRight, Info } from 'lucide-react';

// ===== PROGRESSIONI CALISTHENICS SCIENTIFICHE =====
const MOVEMENT_PATTERNS = [
  {
    id: 'lower_push',
    name: 'Lower Body Push (Squat)',
    description: 'Progressioni squat - dalla più facile alla più difficile',
    progressions: [
      { id: 'squat_assisted', name: 'Squat Assistito (con supporto)', difficulty: 1 },
      { id: 'air_squat', name: 'Air Squat', difficulty: 2 },
      { id: 'jump_squat', name: 'Jump Squat', difficulty: 4 },
      { id: 'bulgarian_split', name: 'Bulgarian Split Squat', difficulty: 5 },
      { id: 'pistol_assisted', name: 'Pistol Squat Assistito', difficulty: 7 },
      { id: 'pistol', name: 'Pistol Squat', difficulty: 9 },
      { id: 'shrimp_squat', name: 'Shrimp Squat', difficulty: 10 }
    ]
  },
  {
    id: 'horizontal_push',
    name: 'Horizontal Push (Push-up)',
    description: 'Progressioni push-up orizzontali',
    progressions: [
      { id: 'wall_pushup', name: 'Wall Push-up', difficulty: 1 },
      { id: 'incline_pushup', name: 'Incline Push-up (rialzato)', difficulty: 2 },
      { id: 'knee_pushup', name: 'Push-up su Ginocchia', difficulty: 3 },
      { id: 'standard_pushup', name: 'Push-up Standard', difficulty: 5 },
      { id: 'diamond_pushup', name: 'Diamond Push-up', difficulty: 6 },
      { id: 'archer_pushup', name: 'Archer Push-up', difficulty: 8 },
      { id: 'pseudo_planche', name: 'Pseudo Planche Push-up', difficulty: 9 },
      { id: 'one_arm_pushup', name: 'One Arm Push-up', difficulty: 10 }
    ]
  },
  {
    id: 'vertical_push',
    name: 'Vertical Push (Pike → HSPU)',
    description: 'Progressioni spinta verticale verso handstand',
    progressions: [
      { id: 'pike_pushup', name: 'Pike Push-up', difficulty: 4 },
      { id: 'elevated_pike', name: 'Elevated Pike Push-up', difficulty: 5 },
      { id: 'wall_walk', name: 'Wall Walk', difficulty: 6 },
      { id: 'wall_hspu_partial', name: 'Wall HSPU (ROM parziale)', difficulty: 7 },
      { id: 'wall_hspu', name: 'Wall HSPU (ROM completo)', difficulty: 8 },
      { id: 'freestanding_hspu', name: 'Freestanding HSPU', difficulty: 10 }
    ]
  },
  {
    id: 'vertical_pull',
    name: 'Vertical Pull (Row → Pull-up)',
    description: 'Progressioni trazione verticale - BASE: inverted row',
    progressions: [
      { id: 'inverted_row_high', name: 'Inverted Row (barra alta)', difficulty: 2 },
      { id: 'inverted_row_mid', name: 'Inverted Row (barra media)', difficulty: 3 },
      { id: 'inverted_row_low', name: 'Inverted Row (barra bassa)', difficulty: 4 },
      { id: 'negative_pullup', name: 'Negative Pull-up (solo eccentrica)', difficulty: 5 },
      { id: 'band_pullup', name: 'Band-Assisted Pull-up', difficulty: 6 },
      { id: 'pullup', name: 'Pull-up Standard', difficulty: 7 },
      { id: 'chinup', name: 'Chin-up', difficulty: 7 },
      { id: 'archer_pullup', name: 'Archer Pull-up', difficulty: 9 },
      { id: 'one_arm_pullup_prog', name: 'One Arm Pull-up Progression', difficulty: 10 }
    ]
  },
  {
    id: 'lower_pull',
    name: 'Lower Body Pull (Hinge/Hamstring)',
    description: 'Progressioni cerniera anca e femorali',
    progressions: [
      { id: 'glute_bridge', name: 'Glute Bridge', difficulty: 2 },
      { id: 'single_leg_glute', name: 'Single Leg Glute Bridge', difficulty: 3 },
      { id: 'rdl_bodyweight', name: 'Single Leg RDL (corpo libero)', difficulty: 4 },
      { id: 'nordic_eccentric', name: 'Nordic Curl (solo eccentrica)', difficulty: 6 },
      { id: 'nordic_full', name: 'Nordic Curl (completo)', difficulty: 9 },
      { id: 'sliding_leg_curl', name: 'Sliding Leg Curl', difficulty: 5 }
    ]
  },
  {
    id: 'core',
    name: 'Core Stability',
    description: 'Progressioni core e stabilità',
    progressions: [
      { id: 'plank', name: 'Plank', difficulty: 2 },
      { id: 'side_plank', name: 'Side Plank', difficulty: 3 },
      { id: 'hollow_body', name: 'Hollow Body Hold', difficulty: 5 },
      { id: 'lsit_tuck', name: 'Tuck L-sit', difficulty: 6 },
      { id: 'lsit_one_leg', name: 'One Leg L-sit', difficulty: 7 },
      { id: 'lsit_full', name: 'Full L-sit', difficulty: 9 },
      { id: 'dragon_flag', name: 'Dragon Flag', difficulty: 10 }
    ]
  }
];

export default function ScreeningFlow({ onComplete, userData, userId }) {
  const [currentPattern, setCurrentPattern] = useState(0);
  const [results, setResults] = useState({});
  const [selectedVariant, setSelectedVariant] = useState('');
  const [reps, setReps] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const pattern = MOVEMENT_PATTERNS[currentPattern];
  const progress = ((currentPattern + 1) / MOVEMENT_PATTERNS.length) * 100;

  const handleNext = () => {
    if (!selectedVariant || !reps || parseInt(reps) === 0) {
      alert('Seleziona una variante e inserisci il numero di ripetizioni');
      return;
    }

    const selectedProgression = pattern.progressions.find(p => p.id === selectedVariant);

    const newResults = {
      ...results,
      [pattern.id]: {
        patternName: pattern.name,
        variantId: selectedVariant,
        variantName: selectedProgression.name,
        difficulty: selectedProgression.difficulty,
        reps: parseInt(reps),
        score: selectedProgression.difficulty * parseInt(reps) * 10 // Normalizzato
      }
    };

    setResults(newResults);

    if (currentPattern < MOVEMENT_PATTERNS.length - 1) {
      setCurrentPattern(currentPattern + 1);
      setSelectedVariant('');
      setReps('');
    } else {
      // Completa screening
      calculateAndSave(newResults);
    }
  };

  const calculateAndSave = (practicalResults) => {
    // 1. Recupera quiz score
    const quizData = localStorage.getItem('quiz_data');
    const quizScore = quizData ? JSON.parse(quizData).score : 50;

    // 2. Calcola practical score dai pattern
    const patternScores = Object.values(practicalResults);
    const totalScore = patternScores.reduce((sum, p: any) => sum + p.score, 0);
    const maxPossibleScore = MOVEMENT_PATTERNS.length * 10 * 20; // 6 pattern × difficulty 10 × 20 reps
    const practicalScore = ((totalScore / maxPossibleScore) * 100).toFixed(1);

    // 3. Parametri fisici (da onboarding - BMI, età)
    const onboardingData = localStorage.getItem('onboarding_data');
    let physicalScore = 65; // Default

    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      const bmi = data.personalInfo?.bmi || 25;
      const age = data.personalInfo?.age || 30;

      // Score basato su BMI (18.5-24.9 = ottimale)
      let bmiScore = 70;
      if (bmi >= 18.5 && bmi <= 24.9) bmiScore = 85;
      else if (bmi < 18.5 || bmi > 30) bmiScore = 50;

      // Score basato su età
      let ageScore = 70;
      if (age < 30) ageScore = 85;
      else if (age < 40) ageScore = 75;
      else if (age > 50) ageScore = 60;

      physicalScore = ((bmiScore + ageScore) / 2).toFixed(1);
    }

    // 4. Score finale ponderato
    const finalScore = (
      quizScore * 0.5 +        // 50% peso al quiz teorico
      parseFloat(practicalScore) * 0.3 +  // 30% peso ai test pratici
      parseFloat(physicalScore) * 0.2      // 20% peso ai parametri fisici
    ).toFixed(1);

    // 5. Determina livello
    let level = 'beginner';
    if (finalScore >= 75) level = 'advanced';
    else if (finalScore >= 55) level = 'intermediate';

    // 6. Salva dati completi con BASELINE per ogni pattern
    const screeningData = {
      level: level,
      finalScore: finalScore,
      quizScore: quizScore,
      practicalScore: practicalScore,
      physicalScore: physicalScore,
      patternBaselines: practicalResults, // ← BASELINE per programma
      completed: true,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('screening_data', JSON.stringify(screeningData));

    console.log('=== SCREENING CALISTHENICS COMPLETED ===');
    console.log('Quiz Score:', quizScore + '%');
    console.log('Practical Score:', practicalScore + '%');
    console.log('Physical Score:', physicalScore + '%');
    console.log('FINAL SCORE:', finalScore + '%');
    console.log('LEVEL:', level.toUpperCase());
    console.log('PATTERN BASELINES:', practicalResults);
    console.log('========================================');

    // 7. Mostra summary
    setShowSummary(true);
  };

  if (showSummary) {
    const screeningData = JSON.parse(localStorage.getItem('screening_data'));

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center">
                Assessment Completato!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-block bg-emerald-500/20 border-2 border-emerald-500 rounded-full px-8 py-4">
                  <p className="text-sm text-emerald-300 mb-1">Il tuo livello</p>
                  <p className="text-4xl font-bold text-emerald-400 uppercase">
                    {screeningData.level}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Quiz Teorico</p>
                    <p className="text-2xl font-bold text-blue-400">{screeningData.quizScore}%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Test Pratici</p>
                    <p className="text-2xl font-bold text-purple-400">{screeningData.practicalScore}%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Parametri Fisici</p>
                    <p className="text-2xl font-bold text-orange-400">{screeningData.physicalScore}%</p>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-6 mt-6">
                  <p className="text-sm text-slate-400 mb-2">Score Finale</p>
                  <p className="text-5xl font-bold text-white">{screeningData.finalScore}%</p>
                </div>

                {/* Pattern Baselines */}
                <div className="bg-slate-700/30 rounded-lg p-6 mt-6 text-left">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-emerald-400" />
                    Le tue baseline per ogni pattern
                  </h3>
                  <div className="space-y-3">
                    {Object.values(screeningData.patternBaselines).map((pattern: any, idx: number) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                        <p className="text-sm text-slate-300 font-medium">{pattern.patternName}</p>
                        <p className="text-emerald-400 text-sm mt-1">
                          {pattern.variantName} × {pattern.reps} reps
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Difficoltà: {pattern.difficulty}/10 • Score: {pattern.score}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onComplete(screeningData)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                Continua alla Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-white">Assessment Pratico - Pattern {currentPattern + 1}/{MOVEMENT_PATTERNS.length}</h1>
            <span className="text-slate-300">{currentPattern + 1} / {MOVEMENT_PATTERNS.length}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{pattern.name}</CardTitle>
            <p className="text-slate-400 text-sm mt-2">{pattern.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
              <p className="text-emerald-300 font-medium mb-2">📋 Cosa fare:</p>
              <ol className="text-emerald-200 text-sm space-y-1 list-decimal list-inside">
                <li>Seleziona la variante più difficile che riesci a fare con buona forma</li>
                <li>Inserisci il numero massimo di ripetizioni pulite che riesci a completare</li>
              </ol>
            </div>

            {/* Dropdown Variante */}
            <div className="space-y-2">
              <label className="text-white font-medium">Variante</label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-700 border-2 border-slate-600 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">-- Seleziona la variante più difficile --</option>
                {pattern.progressions.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name} (Difficoltà {prog.difficulty}/10)
                  </option>
                ))}
              </select>
            </div>

            {/* Input Reps */}
            <div className="space-y-2">
              <label className="text-white font-medium">Ripetizioni pulite massime</label>
              <input
                type="number"
                min="0"
                max="100"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="es. 10"
                className="w-full p-3 rounded-lg bg-slate-700 border-2 border-slate-600 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedVariant || !reps}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {currentPattern < MOVEMENT_PATTERNS.length - 1 ? 'Prossimo Pattern' : 'Completa Assessment'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
