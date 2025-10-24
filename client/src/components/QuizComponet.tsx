import { useState } from "react";
import { Check, X, Brain, ChevronRight } from "lucide-react";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Quale esercizio è più efficace per lo sviluppo del petto?",
    options: [
      "Push-ups",
      "Panca piana con bilanciere",
      "Croci con manubri",
      "Pectoral machine",
    ],
    correct: 1,
    explanation: "La panca piana permette il massimo carico progressivo",
  },
  {
    id: 2,
    question: "Quante ripetizioni sono ideali per l'ipertrofia?",
    options: ["1-5", "6-12", "15-20", "30+"],
    correct: 1,
    explanation: "Il range 6-12 reps ottimizza tensione meccanica e volume",
  },
  {
    id: 3,
    question: "Cosa significa RPE 8?",
    options: [
      "8 ripetizioni",
      "2 ripetizioni di riserva",
      "80% del massimale",
      "8 minuti di riposo",
    ],
    correct: 1,
    explanation: "RPE 8 = Rate of Perceived Exertion con 2 reps in riserva",
  },
  {
    id: 4,
    question: "Il miglior esercizio per i quadricipiti è:",
    options: ["Leg curl", "Stacco rumeno", "Squat", "Calf raises"],
    correct: 2,
    explanation: "Lo squat è il re degli esercizi per le gambe",
  },
  {
    id: 5,
    question: "Quale muscolo NON lavora nello stacco da terra?",
    options: ["Erettori spinali", "Trapezio", "Pettorali", "Glutei"],
    correct: 2,
    explanation: "Lo stacco è principalmente per catena posteriore",
  },
  {
    id: 6,
    question: "La progressione lineare funziona meglio per:",
    options: ["Principianti", "Intermedi", "Avanzati", "Tutti"],
    correct: 0,
    explanation: "I principianti possono aumentare peso ogni sessione",
  },
  {
    id: 7,
    question: "Quanti grammi di proteine per kg di peso corporeo?",
    options: ["0.5-1g", "1.6-2.2g", "3-4g", "5g+"],
    correct: 1,
    explanation: "1.6-2.2g/kg è il range scientifico ottimale",
  },
  {
    id: 8,
    question: "Il miglior split per 3 giorni a settimana:",
    options: ["PPL", "Full Body", "Upper/Lower", "Bro Split"],
    correct: 1,
    explanation: "Full Body 3x permette frequenza ottimale per gruppo",
  },
  {
    id: 9,
    question: "Quale esercizio sviluppa meglio i dorsali?",
    options: ["Trazioni", "Curl", "Panca piana", "Leg press"],
    correct: 0,
    explanation: "Le trazioni sono fondamentali per lo sviluppo dorsale",
  },
  {
    id: 10,
    question: "Il tempo di recupero ideale tra serie pesanti:",
    options: ["30 secondi", "1 minuto", "2-3 minuti", "10 minuti"],
    correct: 2,
    explanation: "2-3 minuti permettono il recupero del sistema ATP-CP",
  },
];

export default function QuizComponent({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    // Salva risposta
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Calcola score
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === QUIZ_QUESTIONS[index].correct) {
        correct++;
      }
    });

    const score = Math.round((correct / QUIZ_QUESTIONS.length) * 100);

    // Determina difficoltà
    let difficulty = "beginner";
    if (score >= 70) difficulty = "advanced";
    else if (score >= 50) difficulty = "intermediate";

    // Salva risultato
    try {
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          totalQuestions: QUIZ_QUESTIONS.length,
          answers: answers.map((answer, i) => ({
            questionId: i,
            answer,
            correct: answer === QUIZ_QUESTIONS[i].correct,
          })),
          difficulty,
        }),
      });

      setShowResult(true);

      // Callback dopo 2 secondi
      setTimeout(() => {
        if (onComplete) onComplete({ score, difficulty });
      }, 2000);
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Errore nel salvare il quiz. Riprova.");
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === QUIZ_QUESTIONS[index].correct) {
        correct++;
      }
    });
    return Math.round((correct / QUIZ_QUESTIONS.length) * 100);
  };

  if (showResult) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Quiz Completato!</h2>
          <p className="text-5xl font-bold text-emerald-500 my-6">{score}%</p>
          <p className="text-slate-400 mb-6">
            Hai risposto correttamente a{" "}
            {answers.filter((a, i) => a === QUIZ_QUESTIONS[i].correct).length}{" "}
            domande su {QUIZ_QUESTIONS.length}
          </p>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400">Il tuo livello suggerito:</p>
            <p className="text-xl font-bold mt-1">
              {score >= 70
                ? "Avanzato 💪"
                : score >= 50
                  ? "Intermedio 🎯"
                  : "Principiante 🌱"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Quiz Tecnico</h1>
              <p className="text-slate-400 text-sm">
                Valutiamo le tue conoscenze
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>
              Domanda {currentQuestion + 1} di {QUIZ_QUESTIONS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct;
              const showCorrect = showExplanation && isCorrect;
              const showWrong = showExplanation && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => !showExplanation && handleAnswer(index)}
                  disabled={showExplanation}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    showCorrect
                      ? "border-emerald-600 bg-emerald-600/10"
                      : showWrong
                        ? "border-red-600 bg-red-600/10"
                        : isSelected
                          ? "border-blue-600 bg-blue-600/10"
                          : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showCorrect && (
                      <Check className="w-5 h-5 text-emerald-500" />
                    )}
                    {showWrong && <X className="w-5 h-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl">
              <p className="text-sm text-blue-400 font-semibold mb-2">
                💡 Spiegazione
              </p>
              <p className="text-sm text-slate-300">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Next Button */}
        {showExplanation && (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {currentQuestion === QUIZ_QUESTIONS.length - 1
              ? "Completa Quiz"
              : "Prossima Domanda"}
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Score Preview */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Risposta corretta:{" "}
          {answers.filter((a, i) => a === QUIZ_QUESTIONS[i].correct).length}/
          {currentQuestion + 1}
        </div>
      </div>
    </div>
  );
}
