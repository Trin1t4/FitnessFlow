/**
 * RunningInterestStep
 * Step semplificato per onboarding - chiede solo interesse + livello base
 * I test dettagliati (HR zones, walk/run) vanno nello screening
 */

import { useState } from 'react';
import { Timer, Check, X, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

interface RunningInterestStepProps {
  data: {
    goal?: string;
    goals?: string[];
    sport?: string;
  };
  onNext: (stepData: {
    runningInterest: {
      enabled: boolean;
      level?: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';
    };
  }) => void;
  onBack?: () => void;
  sportRequiresRunning?: boolean;
}

const RUNNING_LEVELS = [
  {
    key: 'sedentary' as const,
    label: 'Sedentario',
    sublabel: 'Non corro mai o meno di 5 minuti',
    emoji: '🚶',
  },
  {
    key: 'beginner' as const,
    label: 'Principiante',
    sublabel: 'Riesco a correre 10-15 minuti',
    emoji: '🏃',
  },
  {
    key: 'intermediate' as const,
    label: 'Intermedio',
    sublabel: 'Corro regolarmente 20-30 minuti',
    emoji: '🏃‍♂️',
  },
  {
    key: 'advanced' as const,
    label: 'Avanzato',
    sublabel: 'Corro 30+ minuti senza problemi',
    emoji: '🏃‍♀️',
  },
];

export default function RunningInterestStep({
  data,
  onNext,
  onBack,
  sportRequiresRunning = false
}: RunningInterestStepProps) {
  const { t } = useTranslation();
  const [wantsRunning, setWantsRunning] = useState<boolean | null>(
    sportRequiresRunning ? true : null
  );
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleNext = () => {
    if (wantsRunning === false) {
      // Non vuole corsa
      onNext({
        runningInterest: {
          enabled: false,
        },
      });
    } else if (wantsRunning && selectedLevel) {
      // Vuole corsa con livello selezionato
      onNext({
        runningInterest: {
          enabled: true,
          level: selectedLevel as 'sedentary' | 'beginner' | 'intermediate' | 'advanced',
        },
      });
    }
  };

  const canProceed = wantsRunning === false || (wantsRunning && selectedLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Timer className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {sportRequiresRunning ? 'Capacità di corsa' : 'Vuoi includere la corsa?'}
        </h2>
        <p className="text-slate-400">
          {sportRequiresRunning
            ? 'Il tuo sport richiede preparazione aerobica'
            : 'La corsa migliora resistenza e recupero'}
        </p>
      </div>

      {/* Sport requires running notice */}
      {sportRequiresRunning && (
        <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-200">
              Per {data.sport}, la preparazione aerobica è fondamentale.
              Inseriremo sessioni di corsa nel tuo programma.
            </p>
          </div>
        </div>
      )}

      {/* Scelta Sì/No (solo se sport non richiede running) */}
      {!sportRequiresRunning && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setWantsRunning(true);
              setSelectedLevel(null);
            }}
            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
              wantsRunning === true
                ? 'border-green-500 bg-green-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <Check className={`w-10 h-10 ${wantsRunning === true ? 'text-green-400' : 'text-slate-400'}`} />
            <span className="font-semibold text-white">Sì, voglio correre</span>
          </button>

          <button
            onClick={() => {
              setWantsRunning(false);
              setSelectedLevel(null);
            }}
            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
              wantsRunning === false
                ? 'border-slate-500 bg-slate-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <X className={`w-10 h-10 ${wantsRunning === false ? 'text-slate-300' : 'text-slate-400'}`} />
            <span className="font-semibold text-white">No, solo pesi</span>
          </button>
        </div>
      )}

      {/* Selezione livello (se vuole running o sport lo richiede) */}
      {(wantsRunning || sportRequiresRunning) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white">
            Qual è il tuo livello attuale?
          </h3>
          <div className="space-y-3">
            {RUNNING_LEVELS.map((level) => (
              <button
                key={level.key}
                onClick={() => setSelectedLevel(level.key)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                  selectedLevel === level.key
                    ? 'border-green-500 bg-green-900/30'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{level.emoji}</span>
                  <div>
                    <div className="font-semibold text-white">{level.label}</div>
                    <div className="text-sm text-slate-400">{level.sublabel}</div>
                  </div>
                </div>
                {selectedLevel === level.key && (
                  <Check className="w-6 h-6 text-green-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      {wantsRunning && selectedLevel && (
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800">
          <p className="text-sm text-blue-300">
            {selectedLevel === 'sedentary' || selectedLevel === 'beginner'
              ? 'Inizieremo con sessioni brevi di camminata/corsa per costruire la base aerobica.'
              : 'Aggiungeremo sessioni di corsa in Zona 2 per migliorare resistenza e recupero.'}
          </p>
        </div>
      )}

      {wantsRunning === false && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-400">
            Nessun problema! Potrai sempre aggiungere la corsa in seguito dalle impostazioni.
          </p>
        </div>
      )}

      {/* Bottoni navigazione */}
      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-bold hover:bg-slate-600 transition"
          >
            ← {t('common.back')}
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`${onBack ? 'flex-1' : 'w-full'} bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 rounded-lg font-bold text-white hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
}
