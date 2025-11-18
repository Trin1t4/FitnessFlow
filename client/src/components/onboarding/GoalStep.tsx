import { useState } from 'react';
import { OnboardingData } from '../../types/onboarding.types';

interface GoalStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

const GOAL_OPTIONS = [
  { value: 'forza', label: '💪 Forza', desc: 'Aumentare forza massimale' },
  { value: 'ipertrofia', label: '🏋️ Ipertrofia', desc: 'Crescita muscolare' },
  { value: 'tonificazione', label: '✨ Tonificazione', desc: 'Definizione muscolare' },
  { value: 'dimagrimento', label: '🔥 Dimagrimento', desc: 'Perdita peso/grasso' },
  { value: 'prestazioni_sportive', label: '⚽ Prestazioni Sportive', desc: 'Migliorare in uno sport' },
  { value: 'benessere', label: '🧘 Benessere', desc: 'Salute generale' },
  { value: 'resistenza', label: '🏃 Resistenza', desc: 'Capacità aerobica' },
  { value: 'motor_recovery', label: '🔄 Recupero Motorio', desc: 'Post-riabilitazione', disclaimer: true }, // ✅ NUOVO
  { value: 'gravidanza', label: '🤰 Gravidanza', desc: 'Pre/post parto' },
  { value: 'disabilita', label: '♿ Disabilità', desc: 'Adattamenti specifici' }
];

const SPORTS_OPTIONS = [
  { value: 'calcio', label: '⚽ Calcio', roles: ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'] },
  { value: 'basket', label: '🏀 Basket', roles: ['Playmaker', 'Guardia', 'Ala', 'Centro'] },
  { value: 'pallavolo', label: '🏐 Pallavolo', roles: ['Alzatore', 'Opposto', 'Centrale', 'Libero', 'Schiacciatore'] },
  { value: 'rugby', label: '🏉 Rugby', roles: ['Trequarti', 'Mediano', 'Pilone', 'Tallonatore', 'Seconda Linea'] },
  { value: 'tennis', label: '🎾 Tennis', roles: ['Singolo', 'Doppio'] },
  { value: 'corsa', label: '🏃 Corsa', roles: ['Velocità (100-400m)', 'Mezzofondo (800-3000m)', 'Fondo (5km+)'] },
  { value: 'nuoto', label: '🏊 Nuoto', roles: ['Stile Libero', 'Rana', 'Dorso', 'Farfalla', 'Misti'] },
  { value: 'ciclismo', label: '🚴 Ciclismo', roles: ['Strada', 'MTB', 'Pista'] },
  { value: 'crossfit', label: '💪 CrossFit', roles: [] },
  { value: 'powerlifting', label: '🏋️ Powerlifting', roles: [] },
  { value: 'altro', label: '🎯 Altro', roles: [] }
];

const MUSCULAR_FOCUS_OPTIONS = [
  { value: '', label: 'Nessun Focus', desc: 'Sviluppo completo' },
  { value: 'glutei', label: 'Glutei', desc: 'Volume aumentato' },
  { value: 'addome', label: 'Addome', desc: 'Volume aumentato' },
  { value: 'petto', label: 'Petto', desc: 'Volume aumentato' },
  { value: 'dorso', label: 'Dorso', desc: 'Volume aumentato' },
  { value: 'spalle', label: 'Spalle', desc: 'Volume aumentato' },
  { value: 'gambe', label: 'Gambe', desc: 'Volume aumentato' },
  { value: 'braccia', label: 'Braccia', desc: 'Volume aumentato' },
  { value: 'polpacci', label: 'Polpacci', desc: 'Volume aumentato' }
];

export default function GoalStep({ data, onNext }: GoalStepProps) {
  // Multi-goal support: array di goals (max 2)
  const [goals, setGoals] = useState<string[]>(
    data.goals || (data.goal ? [data.goal] : [])
  );
  const [sport, setSport] = useState(data.sport || '');
  const [sportRole, setSportRole] = useState(data.sportRole || '');
  const [muscularFocus, setMuscularFocus] = useState(data.muscularFocus || '');

  const selectedSport = SPORTS_OPTIONS.find(s => s.value === sport);
  const sportRoles = selectedSport?.roles || [];

  // Toggle selection di un goal
  const toggleGoal = (goalValue: string) => {
    setGoals(prev => {
      if (prev.includes(goalValue)) {
        // Deseleziona
        const newGoals = prev.filter(g => g !== goalValue);
        if (goalValue === 'prestazioni_sportive') {
          setSport('');
          setSportRole('');
        }
        return newGoals;
      } else {
        // Seleziona (max 2)
        if (prev.length >= 2) {
          // Rimuovi il primo e aggiungi il nuovo
          const removed = prev[0];
          if (removed === 'prestazioni_sportive') {
            setSport('');
            setSportRole('');
          }
          return [...prev.slice(1), goalValue];
        }
        return [...prev, goalValue];
      }
    });
  };

  const handleSubmit = () => {
    if (goals.length === 0) return;
    if (goals.includes('prestazioni_sportive') && !sport) return;

    onNext({
      goal: goals[0], // backward compatibility
      goals, // multi-goal array
      sport: goals.includes('prestazioni_sportive') ? sport : '',
      sportRole: goals.includes('prestazioni_sportive') ? sportRole : '',
      muscularFocus: (goals.includes('ipertrofia') || goals.includes('tonificazione')) ? muscularFocus : ''
    });
  };

  const isValid = goals.length > 0 && (!goals.includes('prestazioni_sportive') || sport);

  // Controlla se ha selezionato goal che richiedono UI aggiuntive
  const showSportSelection = goals.includes('prestazioni_sportive');
  const showMuscularFocus = goals.includes('ipertrofia') || goals.includes('tonificazione');
  const showMotorRecoveryDisclaimer = goals.includes('motor_recovery');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">🎯 Obiettivi</h2>
        <p className="text-slate-400">
          Seleziona fino a <strong className="text-emerald-400">2 obiettivi</strong> per un programma personalizzato
        </p>
        {goals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {goals.map((g, i) => {
              const goalOpt = GOAL_OPTIONS.find(o => o.value === g);
              return (
                <span key={g} className="bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                  {i + 1}. {goalOpt?.label || g}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GOAL_OPTIONS.map((opt) => {
          const isSelected = goals.includes(opt.value);
          const selectionIndex = goals.indexOf(opt.value) + 1;

          return (
            <button
              key={opt.value}
              onClick={() => toggleGoal(opt.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {selectionIndex}
                </div>
              )}
              <div className="font-bold text-lg mb-1">{opt.label}</div>
              <div className="text-sm text-slate-400">{opt.desc}</div>
            </button>
          );
        })}
      </div>

      {/* ✅ DISCLAIMER RECUPERO MOTORIO */}
      {showMotorRecoveryDisclaimer && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚕️</div>
            <div>
              <p className="text-sm font-semibold text-blue-300 mb-2">Importante da sapere</p>
              <ul className="text-xs text-blue-200 space-y-1.5">
                <li>✓ Questo programma è per il <strong>post-riabilitazione</strong></li>
                <li>✓ Ideale dopo aver completato la fisioterapia</li>
                <li>✓ <strong>Non sostituisce</strong> il trattamento medico o fisioterapico</li>
                <li>⚠️ Se hai dolore acuto o non hai fatto riabilitazione, consulta prima un professionista</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MUSCULAR FOCUS - Condizionale per ipertrofia/tonificazione */}
      {showMuscularFocus && (
        <div className="space-y-4 bg-slate-700/30 rounded-lg p-5 border border-slate-600 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              💪 Focus Muscolare (opzionale)
            </label>
            <p className="text-xs text-slate-400 mb-4">
              Vuoi dare priorità a un distretto muscolare specifico? Il programma aumenterà il volume di lavoro per quella zona.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MUSCULAR_FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMuscularFocus(opt.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  muscularFocus === opt.value
                    ? 'border-emerald-500 bg-emerald-500/20 text-white'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="font-bold text-sm mb-0.5">{opt.label}</div>
                <div className="text-xs text-slate-400">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sport Selection - CONDIZIONALE */}
      {showSportSelection && (
        <div className="space-y-4 bg-slate-700/30 rounded-lg p-5 border border-slate-600 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quale sport pratichi?</label>
            <select
              value={sport}
              onChange={(e) => {
                setSport(e.target.value);
                setSportRole('');
              }}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            >
              <option value="">Seleziona sport...</option>
              {SPORTS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {sport && sportRoles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ruolo/Posizione (opzionale)</label>
              <select
                value={sportRole}
                onChange={(e) => setSportRole(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                <option value="">Seleziona ruolo...</option>
                {sportRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sport && (
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
              <p className="text-sm text-blue-200">
                ℹ️ Il programma sarà ottimizzato per le esigenze specifiche del tuo sport
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continua →
      </button>
    </div>
  );
}
