/**
 * Training Type Choice Step
 * Primo step dell'onboarding: scegli tra Pesi, Corsa o Entrambi
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Activity, Zap, ChevronRight } from 'lucide-react';

export type TrainingFocus = 'weights' | 'running' | 'both';

interface TrainingTypeChoiceStepProps {
  onNext: (choice: TrainingFocus) => void;
}

const TRAINING_OPTIONS: {
  id: TrainingFocus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}[] = [
  {
    id: 'weights',
    label: 'Allenamento con Pesi',
    description: 'Forza, ipertrofia, tonificazione. Corpo libero o attrezzi.',
    icon: <Dumbbell className="w-8 h-8" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
  },
  {
    id: 'running',
    label: 'Corsa / Aerobico',
    description: 'Costruire base aerobica, preparazione gare, resistenza.',
    icon: <Activity className="w-8 h-8" />,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
  },
  {
    id: 'both',
    label: 'Entrambi',
    description: 'Programma ibrido: pesi + running per fitness completo.',
    icon: <Zap className="w-8 h-8" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
  },
];

export default function TrainingTypeChoiceStep({ onNext }: TrainingTypeChoiceStepProps) {
  const [selected, setSelected] = useState<TrainingFocus | null>(null);

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Cosa vuoi allenare?
        </h2>
        <p className="text-slate-400">
          Scegli il tuo focus principale. Potrai sempre aggiungere l'altro in seguito.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {TRAINING_OPTIONS.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => setSelected(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-5 ${
              selected === option.id
                ? `border-${option.color.split('-')[1]}-500 bg-slate-700/50`
                : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
            }`}
          >
            <div className={`p-4 rounded-xl ${
              selected === option.id
                ? option.bgColor + ' text-white'
                : 'bg-slate-700 ' + option.color
            }`}>
              {option.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {option.label}
              </h3>
              <p className="text-sm text-slate-400">
                {option.description}
              </p>
            </div>
            {selected === option.id && (
              <div className={`w-6 h-6 rounded-full ${option.bgColor} flex items-center justify-center`}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Dumbbell className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-300 text-sm">Pesi</p>
              <p className="text-xs text-slate-400">
                Test pratici per determinare il tuo livello e creare un programma personalizzato
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-green-300 text-sm">Corsa</p>
              <p className="text-xs text-slate-400">
                Test capacità aerobica, zone HR e programma progressivo 8 settimane
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!selected}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
          selected
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        Continua
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
