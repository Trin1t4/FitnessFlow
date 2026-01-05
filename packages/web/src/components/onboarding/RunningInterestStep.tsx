/**
 * RunningInterestStep
 * Step per onboarding - chiede interesse, passo/FC per calcolare livello, obiettivo e integrazione
 */

import { useState, useMemo } from 'react';
import { Timer, Check, X, AlertCircle, Heart, Gauge, Info, Zap } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

interface RunningInterestStepProps {
  data: {
    goal?: string;
    goals?: string[];
    sport?: string;
    personalInfo?: {
      age?: number;
    };
    activityLevel?: {
      weeklyFrequency?: number;
    };
  };
  onNext: (stepData: {
    runningInterest: {
      enabled: boolean;
      level?: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';
      goal?: string;
      integration?: 'post_workout' | 'separate_days';
      sessionsPerWeek?: number;
      restingHR?: number;
      currentPace?: string;
      maxHR?: number;
    };
  }) => void;
  onBack?: () => void;
  sportRequiresRunning?: boolean;
}

const INTEGRATION_OPTIONS = [
  {
    key: 'post_workout' as const,
    label: 'Stessa sessione',
    sublabel: 'Corsa dopo i pesi (15-20 min)',
    emoji: '🏋️‍♂️🏃',
    description: 'Corri subito dopo l\'allenamento con i pesi. Ideale per risparmiare tempo.',
  },
  {
    key: 'separate_days' as const,
    label: 'Giorni separati',
    sublabel: 'Corsa nei giorni di riposo',
    emoji: '📅',
    description: 'Sessioni di corsa dedicate nei giorni senza pesi. Migliore per la qualità.',
  },
];

// Obiettivi running per livello con spiegazioni chiare per principianti
const RUNNING_GOALS_BY_LEVEL: Record<string, Array<{
  key: string;
  label: string;
  sublabel: string;
  emoji: string;
  howTo?: string; // Spiegazione di come raggiungerlo
}>> = {
  sedentary: [
    {
      key: 'build_base',
      label: 'Costruire base aerobica',
      sublabel: 'Riuscire a correre 20-30 min continuativi',
      emoji: '🌱',
      howTo: 'Alterna camminata e corsa leggera. Punta a respirare facilmente, dovresti riuscire a parlare mentre corri.'
    },
    {
      key: 'weight_loss',
      label: 'Perdere peso',
      sublabel: 'Cardio per dimagrimento',
      emoji: '⚖️',
      howTo: 'Corsa lenta e costante per bruciare grassi. La chiave è la costanza, non la velocità.'
    },
    {
      key: 'health',
      label: 'Migliorare la salute',
      sublabel: 'Benefici cardiovascolari generali',
      emoji: '❤️',
      howTo: 'Movimento regolare a bassa intensità. Anche 20 minuti portano benefici al cuore e all\'umore.'
    },
  ],
  beginner: [
    {
      key: 'build_base',
      label: 'Costruire base aerobica',
      sublabel: 'Correre 30+ min senza fermarsi',
      emoji: '🌱',
      howTo: 'Corri a un ritmo "conversazionale" - dovresti riuscire a parlare. Non importa la velocità, conta la durata.'
    },
    {
      key: 'run_5k',
      label: 'Completare una 5K',
      sublabel: 'Correre 5 km senza fermarsi',
      emoji: '🏅',
      howTo: 'Prima costruisci la resistenza (30 min di corsa), poi aumenta gradualmente la distanza. In 8 settimane ce la fai!'
    },
    {
      key: 'weight_loss',
      label: 'Perdere peso',
      sublabel: 'Cardio per dimagrimento',
      emoji: '⚖️',
      howTo: 'Corsa lenta (ritmo facile) + esercizi di forza = combinazione perfetta per bruciare grassi.'
    },
    {
      key: 'improve_endurance',
      label: 'Migliorare resistenza',
      sublabel: 'Aumentare capacità aerobica',
      emoji: '💪',
      howTo: 'Aumenta gradualmente il tempo di corsa settimanale (max +10% a settimana). La pazienza paga!'
    },
  ],
  intermediate: [
    {
      key: 'run_5k_time',
      label: 'Migliorare tempo 5K',
      sublabel: 'Correre 5 km più velocemente',
      emoji: '⏱️',
      howTo: 'Mix di corse lente (80%) e ripetute veloci (20%). Es: 4x400m veloci con recupero tra una e l\'altra.'
    },
    {
      key: 'run_10k',
      label: 'Completare una 10K',
      sublabel: 'Correre 10 km senza fermarsi',
      emoji: '🏅',
      howTo: 'Un lungo settimanale che cresce ogni settimana + corse facili. La forza nelle gambe aiuta!'
    },
    {
      key: 'improve_endurance',
      label: 'Migliorare resistenza',
      sublabel: 'Aumentare capacità aerobica',
      emoji: '💪',
      howTo: 'Corse lunghe a ritmo facile costruiscono il "motore aerobico". Usa il test della conversazione!'
    },
    {
      key: 'weight_loss',
      label: 'Perdere peso',
      sublabel: 'Cardio per dimagrimento',
      emoji: '⚖️',
      howTo: 'Corse più lunghe a ritmo moderato + allenamento di forza = metabolismo più attivo.'
    },
  ],
  advanced: [
    {
      key: 'run_10k_time',
      label: 'Migliorare tempo 10K',
      sublabel: 'Correre 10 km più velocemente',
      emoji: '⏱️',
      howTo: 'Periodizzazione: base aerobica → soglia → velocità. Ripetute, tempo run e lunghi progressivi.'
    },
    {
      key: 'half_marathon',
      label: 'Preparare mezza maratona',
      sublabel: 'Correre 21 km',
      emoji: '🏆',
      howTo: 'Lungo settimanale fino a 18-20km, corse di qualità infrasettimanali, e tanta pazienza!'
    },
    {
      key: 'speed_work',
      label: 'Aumentare velocità',
      sublabel: 'Interval training e ripetute',
      emoji: '⚡',
      howTo: 'Ripetute in pista, fartlek, hill sprints. Max 2 sessioni intense a settimana con recupero adeguato.'
    },
    {
      key: 'improve_endurance',
      label: 'Migliorare resistenza',
      sublabel: 'Aumentare volume settimanale',
      emoji: '💪',
      howTo: 'Aumenta il chilometraggio settimanale del 10% ogni settimana, poi fai una settimana di scarico.'
    },
  ],
};

// Descrizioni livelli per il feedback
const LEVEL_INFO: Record<string, { label: string; emoji: string; description: string }> = {
  sedentary: {
    label: 'Principiante assoluto',
    emoji: '🌱',
    description: 'Inizieremo con camminate e brevi tratti di corsa per costruire la base.'
  },
  beginner: {
    label: 'Principiante',
    emoji: '🏃',
    description: 'Hai già una base, lavoreremo per aumentare la durata delle tue corse.'
  },
  intermediate: {
    label: 'Intermedio',
    emoji: '🏃‍♂️',
    description: 'Buona base aerobica! Possiamo lavorare su distanza e velocità.'
  },
  advanced: {
    label: 'Avanzato',
    emoji: '🏃‍♀️',
    description: 'Ottimo livello! Possiamo puntare a obiettivi ambiziosi.'
  },
};

/**
 * Calcola il livello di running basandosi su passo e FC a riposo
 */
function calculateRunningLevel(
  paceMinutes: number | null,
  paceSeconds: number | null,
  restingHR: number | null
): 'sedentary' | 'beginner' | 'intermediate' | 'advanced' {
  // Converti passo in secondi/km
  const paceInSeconds = paceMinutes !== null && paceSeconds !== null
    ? paceMinutes * 60 + paceSeconds
    : null;

  // Punteggio basato sul passo (0-3)
  let paceScore = 0;
  if (paceInSeconds !== null) {
    if (paceInSeconds > 480) paceScore = 0;        // > 8:00/km
    else if (paceInSeconds > 390) paceScore = 1;   // 6:30-8:00/km
    else if (paceInSeconds > 300) paceScore = 2;   // 5:00-6:30/km
    else paceScore = 3;                             // < 5:00/km
  }

  // Punteggio basato su FC riposo (0-3)
  let hrScore = 0;
  if (restingHR !== null) {
    if (restingHR > 75) hrScore = 0;        // > 75 bpm
    else if (restingHR > 65) hrScore = 1;   // 65-75 bpm
    else if (restingHR > 55) hrScore = 2;   // 55-65 bpm
    else hrScore = 3;                        // < 55 bpm
  }

  // Se abbiamo entrambi i dati, fai la media
  // Se ne abbiamo solo uno, usa quello
  // Se non ne abbiamo nessuno, ritorna sedentary
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

  // Converti punteggio in livello
  if (finalScore < 0.75) return 'sedentary';
  if (finalScore < 1.75) return 'beginner';
  if (finalScore < 2.5) return 'intermediate';
  return 'advanced';
}

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
  const [hasRunningExperience, setHasRunningExperience] = useState<boolean | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<'post_workout' | 'separate_days' | null>(null);
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number | null>(null);
  const [restingHR, setRestingHR] = useState<string>('');
  const [paceMinutes, setPaceMinutes] = useState<string>('');
  const [paceSeconds, setPaceSeconds] = useState<string>('');
  const [showHRHelp, setShowHRHelp] = useState(false);
  const [showPaceHelp, setShowPaceHelp] = useState(false);

  // Calcola FC max dalla formula Tanaka
  const age = data.personalInfo?.age || 30;
  const maxHR = Math.round(208 - (0.7 * age));

  // Calcola il livello automaticamente
  const calculatedLevel = useMemo(() => {
    if (hasRunningExperience === false) {
      return 'sedentary';
    }

    const paceMin = paceMinutes ? parseInt(paceMinutes) : null;
    const paceSec = paceSeconds ? parseInt(paceSeconds) : null;
    const hr = restingHR ? parseInt(restingHR) : null;

    return calculateRunningLevel(paceMin, paceSec, hr);
  }, [hasRunningExperience, paceMinutes, paceSeconds, restingHR]);

  // Obiettivi disponibili per il livello calcolato
  const availableGoals = RUNNING_GOALS_BY_LEVEL[calculatedLevel] || [];
  const levelInfo = LEVEL_INFO[calculatedLevel];

  // Mostra il livello calcolato solo se abbiamo almeno un dato
  const hasMetrics = (paceMinutes && paceSeconds) || restingHR;
  const showCalculatedLevel = hasRunningExperience === true && hasMetrics;

  const handleNext = () => {
    console.log('[RUNNING_STEP] handleNext called:', {
      wantsRunning,
      selectedGoal,
      selectedIntegration,
      hasRunningExperience
    });

    if (wantsRunning === false) {
      console.log('[RUNNING_STEP] User declined running');
      onNext({
        runningInterest: {
          enabled: false,
        },
      });
    } else if (wantsRunning === true || sportRequiresRunning) {
      // Validazione: assicurati che goal e integration siano selezionati
      if (!selectedGoal) {
        console.warn('[RUNNING_STEP] ❌ Goal not selected!');
        alert('Seleziona un obiettivo per la corsa');
        return;
      }
      if (!selectedIntegration) {
        console.warn('[RUNNING_STEP] ❌ Integration not selected!');
        alert('Seleziona come vuoi integrare la corsa');
        return;
      }

      const currentPace = paceMinutes && paceSeconds
        ? `${paceMinutes}:${paceSeconds.padStart(2, '0')}`
        : undefined;

      console.log('[RUNNING_STEP] ✅ Saving running interest:', {
        enabled: true,
        level: calculatedLevel,
        goal: selectedGoal,
        integration: selectedIntegration,
        sessionsPerWeek
      });

      onNext({
        runningInterest: {
          enabled: true,
          level: calculatedLevel,
          goal: selectedGoal,
          integration: selectedIntegration,
          sessionsPerWeek: sessionsPerWeek || undefined,
          restingHR: restingHR ? parseInt(restingHR) : undefined,
          currentPace,
          maxHR,
        },
      });
    }
  };

  // Reset goal quando cambia il livello calcolato
  const handleMetricsChange = () => {
    setSelectedGoal(null);
  };

  // Determina se possiamo procedere
  // Se l'utente dice NO → può procedere
  // Se dice SÌ (o sport lo richiede) → deve completare esperienza, goal, integration e frequenza
  const needsRunningDetails = wantsRunning === true || sportRequiresRunning;
  const hasCompletedRunningDetails = hasRunningExperience !== null && selectedGoal && selectedIntegration && sessionsPerWeek;
  const canProceed = wantsRunning === false || (needsRunningDetails && hasCompletedRunningDetails);

  // Messaggio di cosa manca
  const getMissingMessage = () => {
    if (!needsRunningDetails) return null;
    if (hasRunningExperience === null) return 'Indica se hai esperienza con la corsa';
    if (!selectedGoal) return 'Seleziona un obiettivo per la corsa';
    if (!selectedIntegration) return 'Scegli come integrare la corsa';
    if (!sessionsPerWeek) return 'Seleziona quante sessioni di corsa a settimana';
    return null;
  };
  const missingMessage = getMissingMessage();

  // Debug logging
  console.log('[RUNNING_STEP] 🏃 State:', {
    wantsRunning,
    sportRequiresRunning,
    needsRunningDetails,
    hasRunningExperience,
    selectedGoal,
    selectedIntegration,
    sessionsPerWeek,
    hasCompletedRunningDetails,
    canProceed,
    missingMessage
  });

  // Calcola sessioni disponibili in base all'integrazione
  const strengthFrequency = data.activityLevel?.weeklyFrequency || 3;
  const getFrequencyOptions = () => {
    if (selectedIntegration === 'post_workout') {
      // Post workout: 2-3 sessioni (stessi giorni dei pesi)
      return [2, 3];
    } else {
      // Giorni separati: 2-4 sessioni
      return [2, 3, 4];
    }
  };
  const frequencyOptions = getFrequencyOptions();

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
            </p>
          </div>
        </div>
      )}

      {/* Scelta Sì/No */}
      {!sportRequiresRunning && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setWantsRunning(true);
              setHasRunningExperience(null);
              setSelectedGoal(null);
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
              setHasRunningExperience(null);
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

      {/* Domanda esperienza corsa */}
      {(wantsRunning || sportRequiresRunning) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white">
            Hai già esperienza con la corsa?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setHasRunningExperience(true);
                setSelectedGoal(null);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                hasRunningExperience === true
                  ? 'border-green-500 bg-green-900/30'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-2">🏃</div>
              <div className="font-semibold text-white">Sì, corro</div>
              <div className="text-xs text-slate-400">So il mio passo o FC</div>
            </button>
            <button
              onClick={() => {
                setHasRunningExperience(false);
                setSelectedGoal(null);
                setPaceMinutes('');
                setPaceSeconds('');
                setRestingHR('');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                hasRunningExperience === false
                  ? 'border-amber-500 bg-amber-900/30'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-2">🚶</div>
              <div className="font-semibold text-white">No, sono nuovo</div>
              <div className="text-xs text-slate-400">Mai corso regolarmente</div>
            </button>
          </div>
        </div>
      )}

      {/* Input passo e FC (solo se ha esperienza) */}
      {hasRunningExperience === true && (
        <div className="space-y-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-400" />
            I tuoi dati di corsa
          </h3>
          <p className="text-sm text-slate-400">
            Inserisci almeno uno tra passo o FC per calcolare il tuo livello
          </p>

          {/* Passo abituale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Passo abituale (min:sec per km)
              </label>
              <button
                type="button"
                onClick={() => setShowPaceHelp(!showPaceHelp)}
                className="text-slate-400 hover:text-slate-300"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            {showPaceHelp && (
              <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                Il passo a cui corri normalmente senza affanno eccessivo.
                Esempio: 6:30 significa 6 minuti e 30 secondi per km.
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={paceMinutes}
                onChange={(e) => {
                  setPaceMinutes(e.target.value);
                  handleMetricsChange();
                }}
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
                    handleMetricsChange();
                  }
                }}
                placeholder="30"
                min="0"
                max="59"
                className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-center placeholder-slate-400 focus:border-emerald-500"
              />
              <span className="text-slate-400">/km</span>
            </div>
          </div>

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
              onChange={(e) => {
                setRestingHR(e.target.value);
                handleMetricsChange();
              }}
              placeholder="es. 65"
              min="40"
              max="100"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-500">
              FC max stimata: <span className="text-emerald-400 font-medium">{maxHR} bpm</span> (basata sull'età)
            </p>
          </div>
        </div>
      )}

      {/* Livello calcolato */}
      {(showCalculatedLevel || hasRunningExperience === false) && (
        <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 rounded-xl p-4 border border-emerald-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{levelInfo.emoji}</span>
            <div>
              <div className="font-semibold text-emerald-300">
                Livello: {levelInfo.label}
              </div>
              <p className="text-sm text-emerald-200/80">{levelInfo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selezione obiettivo */}
      {hasRunningExperience !== null && (wantsRunning || sportRequiresRunning) && availableGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white">
            Qual è il tuo obiettivo con la corsa?
          </h3>
          <div className="space-y-3">
            {availableGoals.map((goal) => (
              <button
                key={goal.key}
                onClick={() => setSelectedGoal(goal.key)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedGoal === goal.key
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <div className="font-semibold text-white">{goal.label}</div>
                      <div className="text-sm text-slate-400">{goal.sublabel}</div>
                    </div>
                  </div>
                  {selectedGoal === goal.key && (
                    <Check className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                {/* Spiegazione dettagliata quando selezionato */}
                {selectedGoal === goal.key && goal.howTo && (
                  <div className="mt-3 pt-3 border-t border-blue-700/50">
                    <p className="text-sm text-blue-200 flex items-start gap-2">
                      <span className="text-blue-400">💡</span>
                      <span>{goal.howTo}</span>
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Banner preparazione atletica - mostrato quando l'utente ha selezionato un obiettivo */}
      {selectedGoal && (wantsRunning || sportRequiresRunning) && (
        <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 rounded-xl p-4 border border-amber-700/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏋️</span>
            <div>
              <h4 className="font-semibold text-amber-200 mb-1">
                Corsa + Preparazione Atletica = Risultati migliori
              </h4>
              <p className="text-sm text-amber-100/80">
                Anche per chi vuole solo correre, gli esercizi di forza (a corpo libero o in palestra)
                sono fondamentali: <strong>prevengono infortuni</strong>, migliorano la <strong>postura di corsa</strong> e
                ti fanno diventare un <strong>runner più forte e veloce</strong>.
              </p>
              <p className="text-xs text-amber-200/60 mt-2">
                Il tuo programma includerà esercizi mirati per gambe, core e stabilità.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selezione modalità integrazione */}
      {selectedGoal && (wantsRunning || sportRequiresRunning) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white">
            Come vuoi integrare la corsa?
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {INTEGRATION_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setSelectedIntegration(option.key);
                  // Reset frequenza quando cambia integration
                  setSessionsPerWeek(null);
                }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedIntegration === option.key
                    ? 'border-emerald-500 bg-emerald-900/30'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{option.emoji}</span>
                    <div>
                      <div className="font-semibold text-white">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.sublabel}</div>
                    </div>
                  </div>
                  {selectedIntegration === option.key && (
                    <Check className="w-6 h-6 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-12">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selezione frequenza running */}
      {selectedIntegration && (wantsRunning || sportRequiresRunning) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white">
            Quante sessioni di corsa a settimana?
          </h3>
          <div className="flex justify-center gap-4">
            {frequencyOptions.map((num) => (
              <button
                key={num}
                onClick={() => setSessionsPerWeek(num)}
                className={`w-20 h-20 rounded-2xl border-2 font-bold text-2xl transition-all ${
                  sessionsPerWeek === num
                    ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                    : 'border-slate-700 text-slate-400 hover:border-emerald-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-slate-400">
            {selectedIntegration === 'post_workout'
              ? 'Corsa breve (15-20 min) dopo i tuoi allenamenti con i pesi'
              : 'Sessioni dedicate nei giorni senza pesi'}
          </p>
        </div>
      )}

      {/* Riepilogo finale */}
      {wantsRunning && selectedGoal && selectedIntegration && sessionsPerWeek && (
        <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-800">
          <h4 className="font-semibold text-emerald-300 mb-2">Riepilogo</h4>
          <ul className="text-sm text-emerald-200 space-y-1">
            <li>• Livello: <span className="font-medium">{levelInfo.label}</span></li>
            <li>• Obiettivo: <span className="font-medium">{availableGoals.find(g => g.key === selectedGoal)?.label}</span></li>
            <li>• Modalità: <span className="font-medium">{selectedIntegration === 'post_workout' ? 'Dopo i pesi' : 'Giorni separati'}</span></li>
            <li>• Frequenza: <span className="font-medium">{sessionsPerWeek} sessioni/settimana</span></li>
          </ul>
        </div>
      )}

      {wantsRunning === false && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-400">
            Nessun problema! Potrai sempre aggiungere la corsa in seguito dalle impostazioni.
          </p>
        </div>
      )}

      {/* Messaggio di cosa manca */}
      {needsRunningDetails && missingMessage && (
        <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-700">
          <p className="text-sm text-amber-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{missingMessage} (scorri in basso)</span>
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
