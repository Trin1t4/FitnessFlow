/**
 * AddRunningModal
 * Modal per aggiungere la corsa a un programma esistente
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer, Check, Heart, Gauge, Info, Zap, Play } from 'lucide-react';

interface AddRunningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (runningPrefs: {
    enabled: boolean;
    level: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';
    goal: string;
    integration: 'post_workout' | 'separate_days';
    restingHR?: number;
    currentPace?: string;
    maxHR: number;
  }) => void;
  userAge?: number;
}

const INTEGRATION_OPTIONS = [
  {
    key: 'post_workout' as const,
    label: 'Stessa sessione',
    sublabel: 'Corsa dopo i pesi (15-20 min)',
    emoji: '🏋️‍♂️🏃',
  },
  {
    key: 'separate_days' as const,
    label: 'Giorni separati',
    sublabel: 'Corsa nei giorni di riposo',
    emoji: '📅',
  },
];

const RUNNING_GOALS_BY_LEVEL: Record<string, Array<{
  key: string;
  label: string;
  emoji: string;
}>> = {
  sedentary: [
    { key: 'build_base', label: 'Costruire base aerobica', emoji: '🌱' },
    { key: 'weight_loss', label: 'Perdere peso', emoji: '⚖️' },
    { key: 'health', label: 'Migliorare la salute', emoji: '❤️' },
  ],
  beginner: [
    { key: 'build_base', label: 'Costruire base aerobica', emoji: '🌱' },
    { key: 'run_5k', label: 'Completare una 5K', emoji: '🏅' },
    { key: 'weight_loss', label: 'Perdere peso', emoji: '⚖️' },
    { key: 'improve_endurance', label: 'Migliorare resistenza', emoji: '💪' },
  ],
  intermediate: [
    { key: 'run_5k_time', label: 'Migliorare tempo 5K', emoji: '⏱️' },
    { key: 'run_10k', label: 'Completare una 10K', emoji: '🏅' },
    { key: 'improve_endurance', label: 'Migliorare resistenza', emoji: '💪' },
    { key: 'weight_loss', label: 'Perdere peso', emoji: '⚖️' },
  ],
  advanced: [
    { key: 'run_10k_time', label: 'Migliorare tempo 10K', emoji: '⏱️' },
    { key: 'half_marathon', label: 'Preparare mezza maratona', emoji: '🏆' },
    { key: 'speed_work', label: 'Aumentare velocità', emoji: '⚡' },
    { key: 'improve_endurance', label: 'Migliorare resistenza', emoji: '💪' },
  ],
};

const LEVEL_INFO: Record<string, { label: string; emoji: string }> = {
  sedentary: { label: 'Principiante assoluto', emoji: '🌱' },
  beginner: { label: 'Principiante', emoji: '🏃' },
  intermediate: { label: 'Intermedio', emoji: '🏃‍♂️' },
  advanced: { label: 'Avanzato', emoji: '🏃‍♀️' },
};

function calculateRunningLevel(
  paceMinutes: number | null,
  paceSeconds: number | null,
  restingHR: number | null
): 'sedentary' | 'beginner' | 'intermediate' | 'advanced' {
  const paceInSeconds = paceMinutes !== null && paceSeconds !== null
    ? paceMinutes * 60 + paceSeconds
    : null;

  let paceScore = 0;
  if (paceInSeconds !== null) {
    if (paceInSeconds > 480) paceScore = 0;
    else if (paceInSeconds > 390) paceScore = 1;
    else if (paceInSeconds > 300) paceScore = 2;
    else paceScore = 3;
  }

  let hrScore = 0;
  if (restingHR !== null) {
    if (restingHR > 75) hrScore = 0;
    else if (restingHR > 65) hrScore = 1;
    else if (restingHR > 55) hrScore = 2;
    else hrScore = 3;
  }

  let finalScore: number;
  if (paceInSeconds !== null && restingHR !== null) {
    finalScore = (paceScore + hrScore) / 2;
  } else if (paceInSeconds !== null) {
    finalScore = paceScore;
  } else if (restingHR !== null) {
    finalScore = hrScore;
  } else {
    return 'sedentary';
  }

  if (finalScore < 0.75) return 'sedentary';
  if (finalScore < 1.75) return 'beginner';
  if (finalScore < 2.5) return 'intermediate';
  return 'advanced';
}

export default function AddRunningModal({
  isOpen,
  onClose,
  onConfirm,
  userAge = 30
}: AddRunningModalProps) {
  const [step, setStep] = useState<'experience' | 'metrics' | 'goal' | 'integration'>('experience');
  const [hasExperience, setHasExperience] = useState<boolean | null>(null);
  const [paceMinutes, setPaceMinutes] = useState('');
  const [paceSeconds, setPaceSeconds] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<'post_workout' | 'separate_days' | null>(null);

  const maxHR = Math.round(208 - (0.7 * userAge));

  const calculatedLevel = useMemo(() => {
    if (hasExperience === false) return 'sedentary';
    const paceMin = paceMinutes ? parseInt(paceMinutes) : null;
    const paceSec = paceSeconds ? parseInt(paceSeconds) : null;
    const hr = restingHR ? parseInt(restingHR) : null;
    return calculateRunningLevel(paceMin, paceSec, hr);
  }, [hasExperience, paceMinutes, paceSeconds, restingHR]);

  const availableGoals = RUNNING_GOALS_BY_LEVEL[calculatedLevel] || [];
  const levelInfo = LEVEL_INFO[calculatedLevel];
  const hasMetrics = (paceMinutes && paceSeconds) || restingHR;

  const handleConfirm = () => {
    if (selectedGoal && selectedIntegration) {
      const currentPace = paceMinutes && paceSeconds
        ? `${paceMinutes}:${paceSeconds.padStart(2, '0')}`
        : undefined;

      onConfirm({
        enabled: true,
        level: calculatedLevel,
        goal: selectedGoal,
        integration: selectedIntegration,
        restingHR: restingHR ? parseInt(restingHR) : undefined,
        currentPace,
        maxHR,
      });
    }
  };

  const resetAndClose = () => {
    setStep('experience');
    setHasExperience(null);
    setPaceMinutes('');
    setPaceSeconds('');
    setRestingHR('');
    setSelectedGoal(null);
    setSelectedIntegration(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-900/50 rounded-full flex items-center justify-center">
                <Timer className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Aggiungi Corsa</h2>
            </div>
            <button onClick={resetAndClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Step 1: Esperienza */}
            {step === 'experience' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Hai già esperienza con la corsa?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setHasExperience(true);
                      setStep('metrics');
                    }}
                    className="p-4 rounded-xl border-2 border-slate-700 hover:border-green-500 transition-all"
                  >
                    <div className="text-2xl mb-2">🏃</div>
                    <div className="font-semibold text-white">Sì, corro</div>
                    <div className="text-xs text-slate-400">So il mio passo o FC</div>
                  </button>
                  <button
                    onClick={() => {
                      setHasExperience(false);
                      setStep('goal');
                    }}
                    className="p-4 rounded-xl border-2 border-slate-700 hover:border-amber-500 transition-all"
                  >
                    <div className="text-2xl mb-2">🚶</div>
                    <div className="font-semibold text-white">No, sono nuovo</div>
                    <div className="text-xs text-slate-400">Mai corso regolarmente</div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Metriche */}
            {step === 'metrics' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-emerald-400" />
                  I tuoi dati di corsa
                </h3>
                <p className="text-sm text-slate-400">Inserisci almeno uno tra passo o FC</p>

                {/* Passo */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Passo abituale (min:sec/km)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={paceMinutes}
                      onChange={(e) => setPaceMinutes(e.target.value)}
                      placeholder="6"
                      min="3"
                      max="15"
                      className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center"
                    />
                    <span className="text-white font-bold">:</span>
                    <input
                      type="number"
                      value={paceSeconds}
                      onChange={(e) => {
                        if (parseInt(e.target.value) <= 59 || e.target.value === '') {
                          setPaceSeconds(e.target.value);
                        }
                      }}
                      placeholder="30"
                      min="0"
                      max="59"
                      className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center"
                    />
                    <span className="text-slate-400">/km</span>
                  </div>
                </div>

                {/* FC */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    FC a riposo (bpm)
                  </label>
                  <input
                    type="number"
                    value={restingHR}
                    onChange={(e) => setRestingHR(e.target.value)}
                    placeholder="es. 65"
                    min="40"
                    max="100"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                  <p className="text-xs text-slate-500">FC max stimata: <span className="text-emerald-400">{maxHR} bpm</span></p>
                </div>

                {/* Livello calcolato */}
                {hasMetrics && (
                  <div className="bg-emerald-900/30 rounded-xl p-3 border border-emerald-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{levelInfo.emoji}</span>
                      <div>
                        <div className="font-semibold text-emerald-300">Livello: {levelInfo.label}</div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep('goal')}
                  disabled={!hasMetrics}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
                >
                  Continua
                </button>
              </div>
            )}

            {/* Step 3: Obiettivo */}
            {step === 'goal' && (
              <div className="space-y-4">
                {/* Mostra livello */}
                <div className="bg-emerald-900/30 rounded-xl p-3 border border-emerald-700">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{levelInfo.emoji}</span>
                    <div className="font-semibold text-emerald-300">Livello: {levelInfo.label}</div>
                  </div>
                </div>

                <h3 className="font-semibold text-white">Qual è il tuo obiettivo?</h3>
                <div className="space-y-2">
                  {availableGoals.map((goal) => (
                    <button
                      key={goal.key}
                      onClick={() => setSelectedGoal(goal.key)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        selectedGoal === goal.key
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-xl">{goal.emoji}</span>
                      <span className="font-medium text-white">{goal.label}</span>
                      {selectedGoal === goal.key && <Check className="w-5 h-5 text-blue-500 ml-auto" />}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep('integration')}
                  disabled={!selectedGoal}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
                >
                  Continua
                </button>
              </div>
            )}

            {/* Step 4: Integrazione */}
            {step === 'integration' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Come vuoi integrare la corsa?</h3>
                <div className="space-y-2">
                  {INTEGRATION_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSelectedIntegration(option.key)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedIntegration === option.key
                          ? 'border-emerald-500 bg-emerald-900/30'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <div>
                          <div className="font-semibold text-white">{option.label}</div>
                          <div className="text-sm text-slate-400">{option.sublabel}</div>
                        </div>
                        {selectedIntegration === option.key && <Check className="w-5 h-5 text-emerald-500 ml-auto" />}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!selectedIntegration}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Aggiungi Corsa al Programma
                </button>
              </div>
            )}

            {/* Back button */}
            {step !== 'experience' && (
              <button
                onClick={() => {
                  if (step === 'metrics') setStep('experience');
                  else if (step === 'goal') setStep(hasExperience ? 'metrics' : 'experience');
                  else if (step === 'integration') setStep('goal');
                }}
                className="w-full text-slate-400 hover:text-white py-2"
              >
                ← Indietro
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
