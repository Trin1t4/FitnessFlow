/**
 * Pre-Workout Pain Check
 * SCENARIO 2: Se cliente arriva GIÀ con dolore all'inizio della seduta
 * → SALTA deload progressivo
 * → ATTIVA SUBITO recovery motorio
 * → NON stressare la parte
 *
 * v2.0 - Aggiunto step per natura del dolore (DOMS vs acuto vs nervoso)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, CheckCircle, X, HelpCircle } from 'lucide-react';
import {
  PainNature,
  PAIN_NATURE_LABELS,
  PAIN_NATURE_DESCRIPTIONS,
  evaluatePainNature,
  PainNatureEvaluation,
  ExtendedPainArea
} from '@trainsmart/shared';

interface PainArea {
  area: 'neck' | 'shoulder' | 'elbow' | 'wrist' | 'scapula' | 'thoracic_spine' | 'lower_back' | 'hip' | 'knee' | 'ankle';
  label: string;
  icon?: string;
}

const BODY_AREAS: PainArea[] = [
  { area: 'neck', label: 'Collo', icon: '🦴' },
  { area: 'shoulder', label: 'Spalla', icon: '💪' },
  { area: 'elbow', label: 'Gomito', icon: '🦾' },
  { area: 'wrist', label: 'Polso', icon: '✋' },
  { area: 'scapula', label: 'Scapola', icon: '🏋️' },
  { area: 'thoracic_spine', label: 'Dorso', icon: '🧍' },
  { area: 'lower_back', label: 'Schiena Bassa', icon: '🔙' },
  { area: 'hip', label: 'Anca', icon: '🦵' },
  { area: 'knee', label: 'Ginocchio', icon: '🦿' },
  { area: 'ankle', label: 'Caviglia', icon: '👟' }
];

/** Opzioni per natura del dolore con icone e colori */
const PAIN_NATURE_OPTIONS: {
  nature: PainNature;
  icon: string;
  color: string;
  bgColor: string;
}[] = [
  { nature: 'muscular_soreness', icon: '💪', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/50 hover:border-green-400' },
  { nature: 'joint_stiffness', icon: '🔄', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/50 hover:border-blue-400' },
  { nature: 'sharp_acute', icon: '⚡', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/50 hover:border-red-400' },
  { nature: 'deep_ache', icon: '😣', color: 'text-amber-400', bgColor: 'bg-amber-500/20 border-amber-500/50 hover:border-amber-400' },
  { nature: 'burning_nerve', icon: '🔥', color: 'text-rose-400', bgColor: 'bg-rose-500/20 border-rose-500/50 hover:border-rose-400' },
  { nature: 'unknown', icon: '❓', color: 'text-slate-400', bgColor: 'bg-slate-500/20 border-slate-500/50 hover:border-slate-400' }
];

interface PreWorkoutPainCheckProps {
  onComplete: (result: {
    hasPain: boolean;
    painAreas?: PainArea['area'][];
    painNature?: PainNature;
    painSeverity?: number;
    evaluation?: PainNatureEvaluation;
    shouldActivateRecovery: boolean;
    canProceedWithWorkout: boolean;
    requiresMedicalAttention: boolean;
  }) => void;
  onSkip: () => void;
}

export default function PreWorkoutPainCheck({
  onComplete,
  onSkip
}: PreWorkoutPainCheckProps) {
  const [step, setStep] = useState<'initial' | 'area_selection' | 'nature_selection' | 'severity_selection' | 'result'>('initial');
  const [selectedAreas, setSelectedAreas] = useState<PainArea['area'][]>([]);
  const [selectedNature, setSelectedNature] = useState<PainNature | null>(null);
  const [severity, setSeverity] = useState<number>(5);
  const [evaluation, setEvaluation] = useState<PainNatureEvaluation | null>(null);

  const handleNoPain = () => {
    onComplete({
      hasPain: false,
      shouldActivateRecovery: false,
      canProceedWithWorkout: true,
      requiresMedicalAttention: false
    });
  };

  const handleHasPain = () => {
    setStep('area_selection');
  };

  const toggleArea = (area: PainArea['area']) => {
    setSelectedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleConfirmPainAreas = () => {
    if (selectedAreas.length === 0) {
      return; // Deve selezionare almeno un'area
    }
    // Passa alla selezione della natura del dolore
    setStep('nature_selection');
  };

  const handleSelectNature = (nature: PainNature) => {
    setSelectedNature(nature);
    // Passa alla selezione dell'intensità
    setStep('severity_selection');
  };

  const handleConfirmSeverity = () => {
    if (!selectedNature || selectedAreas.length === 0) return;

    // Mappa area locale → ExtendedPainArea per la valutazione
    const areaMapping: Record<PainArea['area'], ExtendedPainArea> = {
      neck: 'neck',
      shoulder: 'shoulder',
      elbow: 'elbow',
      wrist: 'wrist',
      scapula: 'upper_back',
      thoracic_spine: 'upper_back',
      lower_back: 'lower_back',
      hip: 'hip',
      knee: 'knee',
      ankle: 'ankle'
    };

    // Valuta la prima area (o potremmo valutare la più severa)
    const primaryArea = areaMapping[selectedAreas[0]];
    const painEvaluation = evaluatePainNature(selectedNature, severity, primaryArea);
    setEvaluation(painEvaluation);
    setStep('result');
  };

  const handleCompleteWithEvaluation = () => {
    if (!evaluation) return;

    onComplete({
      hasPain: true,
      painAreas: selectedAreas,
      painNature: selectedNature || undefined,
      painSeverity: severity,
      evaluation: evaluation,
      shouldActivateRecovery: !evaluation.canProceed || evaluation.action !== 'continue',
      canProceedWithWorkout: evaluation.canProceed,
      requiresMedicalAttention: evaluation.requiresMedicalAttention
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Pre-Workout Check</h2>
              <p className="text-slate-400 text-sm mt-1">
                Come ti senti oggi prima di iniziare?
              </p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-white transition"
            aria-label="Skip check"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Initial Question */}
            {step === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Info Alert */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-semibold text-blue-300 mb-1">Importante!</p>
                    <p>
                      Se hai già dolore PRIMA di iniziare l'allenamento, attiveremo un
                      protocollo di recupero motorio specifico invece dello stress ulteriore.
                    </p>
                  </div>
                </div>

                {/* Main Question */}
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Hai dolore in qualche parte del corpo ADESSO?
                  </h3>
                  <p className="text-slate-400 text-sm mb-8">
                    (Prima ancora di iniziare l'allenamento)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    {/* NO PAIN */}
                    <button
                      onClick={handleNoPain}
                      className="group relative overflow-hidden bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border-2 border-green-500/50 hover:border-green-400 rounded-xl p-6 transition-all duration-300"
                    >
                      <div className="relative z-10">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-semibold text-white">
                          NO, Sto Bene
                        </span>
                        <p className="text-xs text-green-300 mt-2">
                          Procedi con allenamento normale
                        </p>
                      </div>
                    </button>

                    {/* HAS PAIN */}
                    <button
                      onClick={handleHasPain}
                      className="group relative overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-600/20 hover:from-amber-500/30 hover:to-orange-600/30 border-2 border-amber-500/50 hover:border-amber-400 rounded-xl p-6 transition-all duration-300"
                    >
                      <div className="relative z-10">
                        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-semibold text-white">
                          Sì, Ho Dolore
                        </span>
                        <p className="text-xs text-amber-300 mt-2">
                          Attiva protocollo recovery
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Area Selection */}
            {step === 'area_selection' && (
              <motion.div
                key="area_selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Dove senti dolore?
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Seleziona tutte le aree che ti fanno male (puoi selezionarne più di una)
                  </p>
                </div>

                {/* Body Areas Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BODY_AREAS.map((bodyArea) => {
                    const isSelected = selectedAreas.includes(bodyArea.area);
                    return (
                      <button
                        key={bodyArea.area}
                        onClick={() => toggleArea(bodyArea.area)}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all duration-200
                          ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                              : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-700'
                          }
                        `}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{bodyArea.icon}</div>
                          <div
                            className={`text-sm font-medium ${
                              isSelected ? 'text-amber-300' : 'text-slate-300'
                            }`}
                          >
                            {bodyArea.label}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-amber-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setStep('initial')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handleConfirmPainAreas}
                    disabled={selectedAreas.length === 0}
                    className={`
                      flex-1 py-3 rounded-lg font-semibold transition shadow-lg
                      ${
                        selectedAreas.length > 0
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/20'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {selectedAreas.length > 0
                      ? `Conferma (${selectedAreas.length} ${selectedAreas.length === 1 ? 'area' : 'aree'})`
                      : 'Seleziona almeno un\'area'}
                  </button>
                </div>

                {/* Info */}
                {selectedAreas.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-sm text-amber-200">
                      <strong>Prossimo step:</strong> Ti chiederemo che tipo di dolore senti.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Nature Selection */}
            {step === 'nature_selection' && (
              <motion.div
                key="nature_selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Che tipo di dolore senti?
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Questo ci aiuta a capire se è sicuro allenarsi o se serve cautela
                  </p>
                </div>

                {/* Pain Nature Options */}
                <div className="grid grid-cols-1 gap-3">
                  {PAIN_NATURE_OPTIONS.map((option) => (
                    <button
                      key={option.nature}
                      onClick={() => handleSelectNature(option.nature)}
                      className={`
                        p-4 rounded-lg border-2 text-left transition-all duration-200
                        ${option.bgColor}
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className={`font-semibold ${option.color}`}>
                            {PAIN_NATURE_LABELS[option.nature]}
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            {PAIN_NATURE_DESCRIPTIONS[option.nature]}
                          </div>
                        </div>
                        <HelpCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Back Button */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setStep('area_selection')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition"
                  >
                    ← Indietro
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Severity Selection */}
            {step === 'severity_selection' && (
              <motion.div
                key="severity_selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Quanto è intenso il dolore?
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Da 1 (appena percettibile) a 10 (insopportabile)
                  </p>
                </div>

                {/* Severity Slider */}
                <div className="py-8">
                  <div className="text-center mb-6">
                    <span className={`text-6xl font-bold ${
                      severity <= 3 ? 'text-green-400' :
                      severity <= 5 ? 'text-amber-400' :
                      severity <= 7 ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {severity}
                    </span>
                    <span className="text-slate-400 text-xl">/10</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right,
                        #22c55e 0%,
                        #22c55e 30%,
                        #f59e0b 50%,
                        #ef4444 100%)`
                    }}
                  />

                  <div className="flex justify-between text-sm text-slate-400 mt-2">
                    <span>Lieve</span>
                    <span>Moderato</span>
                    <span>Intenso</span>
                  </div>

                  {/* Severity description */}
                  <div className={`mt-6 p-4 rounded-lg border ${
                    severity <= 3 ? 'bg-green-500/10 border-green-500/30' :
                    severity <= 5 ? 'bg-amber-500/10 border-amber-500/30' :
                    severity <= 7 ? 'bg-orange-500/10 border-orange-500/30' :
                    'bg-red-500/10 border-red-500/30'
                  }`}>
                    <p className={`text-sm ${
                      severity <= 3 ? 'text-green-300' :
                      severity <= 5 ? 'text-amber-300' :
                      severity <= 7 ? 'text-orange-300' :
                      'text-red-300'
                    }`}>
                      {severity <= 3 && '✅ Dolore lieve - generalmente sicuro allenarsi con cautela'}
                      {severity > 3 && severity <= 5 && '⚠️ Dolore moderato - potrebbe richiedere adattamenti'}
                      {severity > 5 && severity <= 7 && '🔶 Dolore significativo - considera di evitare la zona'}
                      {severity > 7 && '🛑 Dolore intenso - consigliato riposo per questa area'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setStep('nature_selection')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition"
                  >
                    ← Indietro
                  </button>
                  <button
                    onClick={handleConfirmSeverity}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-blue-500/20"
                  >
                    Valuta →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Result */}
            {step === 'result' && evaluation && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Result Header */}
                <div className={`p-6 rounded-xl border-2 ${
                  evaluation.canProceed
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}>
                  <div className="text-center">
                    <div className="text-5xl mb-3">{evaluation.emoji}</div>
                    <h3 className={`text-xl font-bold mb-2 ${
                      evaluation.canProceed ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {evaluation.canProceed ? 'Puoi Allenarti' : 'Allenamento Sconsigliato'}
                    </h3>
                    <p className="text-slate-300">{evaluation.message}</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Raccomandazioni:
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Medical Attention Warning */}
                {evaluation.requiresMedicalAttention && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-300 font-semibold mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      Attenzione Medica Consigliata
                    </div>
                    <p className="text-sm text-red-200">
                      Il tipo di dolore che descrivi potrebbe richiedere una valutazione professionale.
                      Consulta un medico o fisioterapista prima di riprendere l'attività fisica.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setStep('severity_selection')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition"
                  >
                    ← Rivaluta
                  </button>
                  <button
                    onClick={handleCompleteWithEvaluation}
                    className={`flex-1 py-3 rounded-lg font-semibold transition shadow-lg ${
                      evaluation.canProceed
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/20'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/20'
                    }`}
                  >
                    {evaluation.canProceed ? 'Inizia Allenamento' : 'Ho Capito, Procedi'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
