/**
 * RunningInterestStep
 * Step per onboarding - chiede interesse, livello, FC riposo e passo
 */

import { useState } from 'react';
import { Timer, Check, X, AlertCircle, Heart, Gauge, Info } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

interface RunningInterestStepProps {
  data: {
    goal?: string;
    goals?: string[];
    sport?: string;
    personalInfo?: {
      age?: number;
    };
  };
  onNext: (stepData: {
    runningInterest: {
      enabled: boolean;
      level?: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';
      restingHR?: number;
      currentPace?: string; // formato "MM:SS"
      maxHR?: number; // calcolato da età
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
  const [restingHR, setRestingHR] = useState<string>('');
  const [paceMinutes, setPaceMinutes] = useState<string>('');
  const [paceSeconds, setPaceSeconds] = useState<string>('');
  const [showHRHelp, setShowHRHelp] = useState(false);

  // Calcola FC max dalla formula Tanaka (più accurata per tutti)
  const age = data.personalInfo?.age || 30;
  const maxHR = Math.round(208 - (0.7 * age));

  const handleNext = () => {
    if (wantsRunning === false) {
      // Non vuole corsa
      onNext({
        runningInterest: {
          enabled: false,
        },
      });
    } else if (wantsRunning && selectedLevel) {
      // Vuole corsa con livello e dati opzionali
      const currentPace = paceMinutes && paceSeconds
        ? `${paceMinutes}:${paceSeconds.padStart(2, '0')}`
        : undefined;

      onNext({
        runningInterest: {
          enabled: true,
          level: selectedLevel as 'sedentary' | 'beginner' | 'intermediate' | 'advanced',
          restingHR: restingHR ? parseInt(restingHR) : undefined,
          currentPace,
          maxHR,
        },
      });
    }
  };

  // Per sedentary non chiediamo FC/passo
  const needsMetrics = selectedLevel && selectedLevel !== 'sedentary';
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

      {/* Metriche aggiuntive (solo per livelli non sedentary) */}
      {needsMetrics && (
        <div className="space-y-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-400" />
            Dati per personalizzare le zone
            <span className="text-xs text-slate-400 font-normal">(opzionale)</span>
          </h3>

          {/* FC a riposo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                FC a riposo (bpm)
              </label>
              <button
                type="button"
                onClick={() => setShowHRHelp(!showHRHelp)}
                className="text-slate-400 hover:text-slate-300"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            {showHRHelp && (
              <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                Misura la mattina appena sveglio, prima di alzarti.
                Conta i battiti per 60 secondi o usa uno smartwatch.
              </div>
            )}
            <input
              type="number"
              value={restingHR}
              onChange={(e) => setRestingHR(e.target.value)}
              placeholder="es. 65"
              min="40"
              max="100"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-500">
              FC max stimata: <span className="text-emerald-400 font-medium">{maxHR} bpm</span> (basata sull'età)
            </p>
          </div>

          {/* Passo abituale */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 flex items-center gap-2">
              <Timer className="w-4 h-4 text-blue-400" />
              Passo abituale (min:sec per km)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={paceMinutes}
                onChange={(e) => setPaceMinutes(e.target.value)}
                placeholder="6"
                min="3"
                max="15"
                className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center placeholder-slate-400 focus:border-emerald-500"
              />
              <span className="text-white font-bold">:</span>
              <input
                type="number"
                value={paceSeconds}
                onChange={(e) => {
                  const val = e.target.value;
                  if (parseInt(val) <= 59 || val === '') {
                    setPaceSeconds(val);
                  }
                }}
                placeholder="30"
                min="0"
                max="59"
                className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center placeholder-slate-400 focus:border-emerald-500"
              />
              <span className="text-slate-400">/km</span>
            </div>
            <p className="text-xs text-slate-500">
              Il passo a cui corri normalmente senza affanno
            </p>
          </div>
        </div>
      )}

      {/* Info box */}
      {wantsRunning && selectedLevel && (
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800">
          <p className="text-sm text-blue-300">
            {selectedLevel === 'sedentary'
              ? 'Inizieremo con sessioni brevi di camminata/corsa per costruire la base aerobica.'
              : restingHR
                ? `Con FC riposo ${restingHR} bpm e max ${maxHR} bpm, calcoleremo le tue zone di allenamento personalizzate.`
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
