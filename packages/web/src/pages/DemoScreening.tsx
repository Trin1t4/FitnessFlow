/**
 * DemoScreening - Pagina pubblica standalone per test e quiz
 *
 * Accessibile senza login a /demo/screening
 * Include:
 * - BiomechanicsQuiz DCSS (quiz teorico)
 * - ScreeningFlowFull (test pratici)
 *
 * NON salva dati nel database, solo visualizzazione risultati
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Dumbbell, ArrowLeft, Play, Info, CheckCircle, Trophy, Target } from 'lucide-react';
import { DCSS_QUIZ_QUESTIONS, type QuizQuestion, evaluateQuiz } from '@trainsmart/shared';
import ScreeningFlowFull from '../components/ScreeningFlowFull';

// ============================================================================
// TYPES
// ============================================================================

type DemoMode = 'selection' | 'quiz' | 'screening' | 'quiz-results' | 'screening-results';

interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
  isTechniqueGap?: boolean;
  isOverconfident?: boolean;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  askedQuestions: string[];
}

interface ScreeningResults {
  levels: Record<string, number>;
  exercises: Record<string, string>;
}

// ============================================================================
// QUIZ LOGIC (simplified from BiomechanicsQuizFull)
// ============================================================================

const QUESTIONS = DCSS_QUIZ_QUESTIONS;
const MAX_QUESTIONS = 7;

function selectNextQuestion(state: QuizState, pool: QuizQuestion[]): QuizQuestion | null {
  const available = pool.filter(q => !state.askedQuestions.includes(q.id));
  if (available.length === 0 || state.answers.length >= MAX_QUESTIONS) return null;

  const overconfidentCount = state.answers.filter(a => a.isOverconfident).length;
  const techniqueGapCount = state.answers.filter(a => a.isTechniqueGap).length;

  if ((overconfidentCount >= 2 || techniqueGapCount >= 2) && state.answers.length >= 4) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)];
}

function calculateQuizLevel(state: QuizState): { level: string; label: string; description: string } {
  const correctCount = state.answers.filter(a => a.correct).length;
  const overconfidentCount = state.answers.filter(a => a.isOverconfident).length;
  const techniqueGapCount = state.answers.filter(a => a.isTechniqueGap).length;
  const total = state.answers.length;
  const accuracy = total > 0 ? correctCount / total : 0;

  if (overconfidentCount >= 2) {
    return {
      level: 'needs_flexibility',
      label: '🎯 Mentalità da Affinare',
      description: 'Hai delle convinzioni forti. Il DCSS ti aiuterà a vedere le sfumature.'
    };
  }

  if (techniqueGapCount >= 2) {
    return {
      level: 'technique_focus',
      label: '📚 Focus Tecnica',
      description: 'Buona apertura mentale! Lavoriamo sulla comprensione tecnica.'
    };
  }

  if (accuracy >= 0.8) {
    return {
      level: 'advanced',
      label: '🏆 Avanzato',
      description: 'Ottima comprensione della biomeccanica! Pronto per concetti avanzati.'
    };
  }

  if (accuracy >= 0.5) {
    return {
      level: 'intermediate',
      label: '💪 Intermedio',
      description: 'Buone basi! Il programma ti aiuterà a consolidare.'
    };
  }

  return {
    level: 'beginner',
    label: '🌱 Principiante',
    description: 'Perfetto punto di partenza! Imparerai molto con noi.'
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DemoScreening() {
  const [mode, setMode] = useState<DemoMode>('selection');

  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    askedQuestions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Screening state
  const [screeningResults, setScreeningResults] = useState<ScreeningResults | null>(null);

  // ========================================================================
  // QUIZ HANDLERS
  // ========================================================================

  const startQuiz = () => {
    const initialQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setCurrentQuestion(initialQuestion);
    setQuizState({
      currentQuestionIndex: 0,
      answers: [],
      askedQuestions: [initialQuestion.id]
    });
    setMode('quiz');
  };

  const handleQuizAnswer = (optionId: string) => {
    if (!currentQuestion || showFeedback) return;

    setSelectedOption(optionId);
    setShowFeedback(true);

    const option = currentQuestion.options.find(o => o.id === optionId);
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      correct: option?.correct || false,
      isTechniqueGap: option?.isTechniqueGap,
      isOverconfident: option?.isOverconfident
    };

    const newState = {
      ...quizState,
      answers: [...quizState.answers, answer]
    };
    setQuizState(newState);

    // After 2 seconds, move to next question or results
    setTimeout(() => {
      const nextQ = selectNextQuestion(newState, QUESTIONS);
      if (nextQ) {
        setCurrentQuestion(nextQ);
        setQuizState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          askedQuestions: [...prev.askedQuestions, nextQ.id]
        }));
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        setMode('quiz-results');
      }
    }, 2000);
  };

  // ========================================================================
  // SCREENING HANDLERS
  // ========================================================================

  const startScreening = () => {
    setMode('screening');
  };

  const handleScreeningComplete = (results: any) => {
    console.log('[Demo] Screening completed:', results);
    setScreeningResults(results);
    setMode('screening-results');
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      technique: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Tecnica' },
      anatomy: { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'Anatomia' },
      programming: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Programmazione' },
      safety: { bg: 'bg-red-500/20', text: 'text-red-300', label: 'Sicurezza' }
    };
    return badges[category] || badges.technique;
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AnimatePresence mode="wait">

        {/* ================================================================
            SELECTION SCREEN
            ================================================================ */}
        {mode === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-4xl w-full">
              {/* Header */}
              <div className="text-center mb-12">
                <motion.h1
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                  🏋️ TrainSmart Demo
                </motion.h1>
                <p className="text-xl text-slate-400">
                  Prova gratuitamente i nostri test di valutazione
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 text-sm">Demo gratuita - Nessuna registrazione richiesta</span>
                </div>
              </div>

              {/* Options */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Quiz Option */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startQuiz}
                  className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-8 text-left hover:border-purple-400/50 transition-all group"
                >
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors">
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Quiz Biomeccanica</h2>
                  <p className="text-slate-400 mb-4">
                    7 domande per valutare la tua comprensione della biomeccanica e dell'allenamento
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">~3 minuti</span>
                    <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">Teorico</span>
                    <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">DCSS Based</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400 font-semibold">
                    <Play className="w-5 h-5" />
                    Inizia Quiz
                  </div>
                </motion.button>

                {/* Screening Option */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startScreening}
                  className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 rounded-2xl p-8 text-left hover:border-emerald-400/50 transition-all group"
                >
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-colors">
                    <Dumbbell className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Test Fisici</h2>
                  <p className="text-slate-400 mb-4">
                    Valuta il tuo livello in Push, Pull, Squat e Core con progressioni calisthenics
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">~10-15 minuti</span>
                    <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">Pratico</span>
                    <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">Video guide</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Play className="w-5 h-5" />
                    Inizia Test
                  </div>
                </motion.button>
              </div>

              {/* Info */}
              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                  I risultati verranno mostrati al termine ma non saranno salvati.
                  <br />
                  Registrati per salvare i progressi e ottenere un programma personalizzato.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================================================================
            QUIZ SCREEN
            ================================================================ */}
        {mode === 'quiz' && currentQuestion && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full">
              {/* Back button */}
              <button
                onClick={() => setMode('selection')}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Torna alla selezione
              </button>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Domanda {quizState.currentQuestionIndex + 1}/{MAX_QUESTIONS}</span>
                  <span>{quizState.answers.filter(a => a.correct).length} corrette</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((quizState.currentQuestionIndex + 1) / MAX_QUESTIONS) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
              >
                {/* Category Badge */}
                <div className="mb-4">
                  {(() => {
                    const badge = getCategoryBadge(currentQuestion.category);
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Question */}
                <h2 className="text-xl font-bold text-white mb-6">
                  {currentQuestion.questionIt || currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    const showResult = showFeedback && isSelected;

                    return (
                      <motion.button
                        key={option.id}
                        whileHover={!showFeedback ? { scale: 1.01 } : {}}
                        whileTap={!showFeedback ? { scale: 0.99 } : {}}
                        onClick={() => handleQuizAnswer(option.id)}
                        disabled={showFeedback}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          showResult
                            ? option.correct
                              ? 'bg-green-500/20 border-green-500 text-green-300'
                              : 'bg-red-500/20 border-red-500 text-red-300'
                            : isSelected
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                            : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                            showResult
                              ? option.correct
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-slate-600 text-slate-300'
                          }`}>
                            {showResult ? (option.correct ? '✓' : '✗') : option.id.toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{option.textIt || option.text}</p>
                            {showResult && option.feedbackIt && (
                              <p className="mt-2 text-sm opacity-80">{option.feedbackIt}</p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation after answer */}
                {showFeedback && currentQuestion.explanationIt && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <p className="text-slate-300 text-sm">{currentQuestion.explanationIt}</p>
                    {currentQuestion.references && (
                      <p className="mt-2 text-slate-500 text-xs">📚 {currentQuestion.references}</p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ================================================================
            QUIZ RESULTS SCREEN
            ================================================================ */}
        {mode === 'quiz-results' && (
          <motion.div
            key="quiz-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Trophy className="w-12 h-12 text-purple-400" />
                </motion.div>

                {(() => {
                  const result = calculateQuizLevel(quizState);
                  const correctCount = quizState.answers.filter(a => a.correct).length;

                  return (
                    <>
                      <h2 className="text-3xl font-bold text-white mb-2">{result.label}</h2>
                      <p className="text-slate-400 mb-6">{result.description}</p>

                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-700/50 rounded-xl p-4">
                          <p className="text-3xl font-bold text-emerald-400">{correctCount}</p>
                          <p className="text-slate-400 text-sm">Corrette</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-xl p-4">
                          <p className="text-3xl font-bold text-white">{quizState.answers.length}</p>
                          <p className="text-slate-400 text-sm">Totali</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-xl p-4">
                          <p className="text-3xl font-bold text-purple-400">
                            {Math.round((correctCount / quizState.answers.length) * 100)}%
                          </p>
                          <p className="text-slate-400 text-sm">Accuratezza</p>
                        </div>
                      </div>
                    </>
                  );
                })()}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setMode('selection')}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                  >
                    Torna alla selezione
                  </button>
                  <button
                    onClick={startScreening}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Dumbbell className="w-5 h-5" />
                    Continua con i Test Fisici
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================================================================
            SCREENING SCREEN
            ================================================================ */}
        {mode === 'screening' && (
          <motion.div
            key="screening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Back button */}
            <div className="absolute top-4 left-4 z-50">
              <button
                onClick={() => setMode('selection')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Esci
              </button>
            </div>

            <ScreeningFlowFull
              userId="demo-user"
              onComplete={handleScreeningComplete}
              demoMode={true}
            />
          </motion.div>
        )}

        {/* ================================================================
            SCREENING RESULTS SCREEN
            ================================================================ */}
        {mode === 'screening-results' && (
          <motion.div
            key="screening-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-2">Test Completati!</h2>
                <p className="text-slate-400 mb-6">
                  Ecco un riepilogo dei tuoi livelli. Registrati per salvare i risultati e ottenere un programma personalizzato.
                </p>

                {screeningResults && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {Object.entries(screeningResults.levels || {}).map(([pattern, level]) => (
                      <div key={pattern} className="bg-slate-700/50 rounded-xl p-4">
                        <p className="text-slate-400 text-sm capitalize">{pattern}</p>
                        <p className="text-2xl font-bold text-white">Livello {level}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setMode('selection')}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                  >
                    Ricomincia
                  </button>
                  <a
                    href="/register"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    Registrati per il programma completo
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
