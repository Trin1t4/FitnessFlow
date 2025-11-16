import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

const PRACTICAL_TESTS = [
  {
    id: 'squat_quality',
    name: 'Squat Assessment',
    instruction: 'Esegui 5 squat a corpo libero. Valuta la qualità del movimento.',
    options: [
      { value: 3, label: 'Ottimo controllo, profondità completa, ginocchia allineate' },
      { value: 2, label: 'Buono ma con qualche compenso (ginocchia in varo/valgo)' },
      { value: 1, label: 'Difficoltà a scendere, movimenti instabili' }
    ]
  },
  {
    id: 'plank_hold',
    name: 'Plank Hold',
    instruction: 'Mantieni il plank con buona forma. Quanto resisti?',
    options: [
      { value: 3, label: 'Oltre 60 secondi con forma perfetta' },
      { value: 2, label: '30-60 secondi con forma accettabile' },
      { value: 1, label: 'Meno di 30 secondi o forma scadente' }
    ]
  },
  {
    id: 'push_pull_balance',
    name: 'Push-Pull Balance',
    instruction: 'Esegui 5 push-up e 5 row (o simulazione). Come vanno?',
    options: [
      { value: 3, label: 'Entrambi facili, buon controllo e ROM completo' },
      { value: 2, label: 'Uno dei due è più difficile o ROM limitato' },
      { value: 1, label: 'Difficoltà in entrambi o compensi evidenti' }
    ]
  },
  {
    id: 'single_leg_stability',
    name: 'Single Leg Balance',
    instruction: 'Stai su una gamba sola per 30 secondi.',
    options: [
      { value: 3, label: 'Stabile su entrambe le gambe, occhi chiusi possibile' },
      { value: 2, label: 'Stabile ma con qualche oscillazione' },
      { value: 1, label: 'Instabile, devo appoggiarmi' }
    ]
  },
  {
    id: 'mobility_assessment',
    name: 'Mobility Check',
    instruction: 'Tocca le dita dei piedi senza piegare le ginocchia. Quanto arrivi?',
    options: [
      { value: 3, label: 'Tocco facilmente con mani piatte a terra' },
      { value: 2, label: 'Tocco le punte dei piedi o arrivo alle caviglie' },
      { value: 1, label: 'Non arrivo oltre le ginocchia' }
    ]
  }
];

export default function ScreeningFlow({ onComplete, userData, userId }) {
  const [currentTest, setCurrentTest] = useState(0);
  const [results, setResults] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const test = PRACTICAL_TESTS[currentTest];
  const progress = ((currentTest + 1) / PRACTICAL_TESTS.length) * 100;

  const handleNext = () => {
    if (selectedOption === null) return;

    const newResults = {
      ...results,
      [test.id]: selectedOption
    };
    setResults(newResults);

    if (currentTest < PRACTICAL_TESTS.length - 1) {
      setCurrentTest(currentTest + 1);
      setSelectedOption(null);
    } else {
      // Completa screening
      calculateAndSave(newResults);
    }
  };

  const calculateAndSave = (practicalResults) => {
    // 1. Recupera quiz score
    const quizData = localStorage.getItem('quiz_data');
    const quizScore = quizData ? JSON.parse(quizData).score : 50;

    // 2. Calcola practical score (media dei test pratici su scala 0-100)
    const practicalValues = Object.values(practicalResults);
    const practicalAvg = practicalValues.reduce((sum, val) => sum + val, 0) / practicalValues.length;
    const practicalScore = ((practicalAvg / 3) * 100).toFixed(1); // scala 0-100

    // 3. Parametri fisici (placeholder - in futuro da body composition)
    const physicalScore = 65; // Media per ora

    // 4. Score finale ponderato
    const finalScore = (
      quizScore * 0.5 +        // 50% peso al quiz teorico
      parseFloat(practicalScore) * 0.3 +  // 30% peso ai test pratici
      physicalScore * 0.2      // 20% peso ai parametri fisici
    ).toFixed(1);

    // 5. Determina livello
    let level = 'beginner';
    if (finalScore >= 75) level = 'advanced';
    else if (finalScore >= 55) level = 'intermediate';

    // 6. Salva dati completi
    const screeningData = {
      level: level,
      finalScore: finalScore,
      quizScore: quizScore,
      practicalScore: practicalScore,
      physicalScore: physicalScore,
      practicalResults: practicalResults,
      completed: true,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('screening_data', JSON.stringify(screeningData));

    console.log('=== SCREENING COMPLETED ===');
    console.log('Quiz Score:', quizScore + '%');
    console.log('Practical Score:', practicalScore + '%');
    console.log('Physical Score:', physicalScore + '%');
    console.log('FINAL SCORE:', finalScore + '%');
    console.log('LEVEL:', level.toUpperCase());
    console.log('==========================');

    // 7. Mostra summary
    setShowSummary(true);
  };

  if (showSummary) {
    const screeningData = JSON.parse(localStorage.getItem('screening_data'));

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
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
            <h1 className="text-xl font-bold text-white">Assessment Pratico</h1>
            <span className="text-slate-300">{currentTest + 1} / {PRACTICAL_TESTS.length}</span>
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
            <CardTitle className="text-2xl text-white">{test.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
              <p className="text-emerald-300 font-medium">{test.instruction}</p>
            </div>

            <div className="space-y-3">
              {test.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(option.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedOption === option.value
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedOption === option.value
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-slate-500'
                    }`}>
                      {selectedOption === option.value && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-slate-200">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {currentTest < PRACTICAL_TESTS.length - 1 ? 'Prossimo Test' : 'Completa Assessment'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
