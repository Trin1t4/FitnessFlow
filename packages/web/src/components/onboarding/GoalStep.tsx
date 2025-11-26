import { useState } from 'react';
import { OnboardingData } from '../../types/onboarding.types';
import { useTranslation } from '../../lib/i18n';

interface GoalStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

// Goal organizzati per categoria
const getGoalOptions = (t: (key: string) => string) => [
  // FITNESS GOALS
  { value: 'forza', label: t('onboarding.goal.strength'), desc: t('onboarding.goal.strengthDesc'), category: 'fitness' },
  { value: 'ipertrofia', label: t('onboarding.goal.hypertrophy'), desc: t('onboarding.goal.hypertrophyDesc'), category: 'fitness' },
  { value: 'tonificazione', label: t('onboarding.goal.toning'), desc: t('onboarding.goal.toningDesc'), category: 'fitness' },
  { value: 'dimagrimento', label: t('onboarding.goal.weight_loss'), desc: t('onboarding.goal.weightLossDesc'), category: 'fitness' },
  { value: 'resistenza', label: t('onboarding.goal.endurance'), desc: t('onboarding.goal.enduranceDesc'), category: 'fitness' },
  // SPORT & WELLNESS
  { value: 'prestazioni_sportive', label: t('onboarding.goal.sport'), desc: t('onboarding.goal.sportsDesc'), category: 'sport' },
  { value: 'benessere', label: t('onboarding.goal.wellness'), desc: t('onboarding.goal.wellnessDesc'), category: 'wellness' },
  // SPECIAL NEEDS
  { value: 'motor_recovery', label: t('onboarding.goal.motorRecovery'), desc: t('onboarding.goal.motorRecoveryDesc'), category: 'health', disclaimer: 'recovery' },
  { value: 'pre_partum', label: t('onboarding.goal.prePartum'), desc: t('onboarding.goal.prePartumDesc'), category: 'health', disclaimer: 'pregnancy' },
  { value: 'post_partum', label: t('onboarding.goal.postPartum'), desc: t('onboarding.goal.postPartumDesc'), category: 'health', disclaimer: 'pregnancy' },
  { value: 'disabilita', label: t('onboarding.goal.disability'), desc: t('onboarding.goal.disabilityDesc'), category: 'health', disclaimer: 'disability' }
];

const getSportsOptions = (t: (key: string) => string) => [
  { value: 'calcio', label: t('sport.soccer'), roles: [t('role.goalkeeper'), t('role.defender'), t('role.midfielder'), t('role.striker')] },
  { value: 'basket', label: t('sport.basketball'), roles: [t('role.pointGuard'), t('role.guard'), t('role.forward'), t('role.center')] },
  { value: 'pallavolo', label: t('sport.volleyball'), roles: [t('role.setter'), t('role.opposite'), t('role.middle'), t('role.libero'), t('role.hitter')] },
  { value: 'rugby', label: t('sport.rugby'), roles: [t('role.back'), t('role.scrumHalf'), t('role.prop'), t('role.hooker'), t('role.lock')] },
  { value: 'tennis', label: t('sport.tennis'), roles: [t('role.singles'), t('role.doubles')] },
  { value: 'corsa', label: t('sport.running'), roles: [t('role.sprint'), t('role.long')] },
  { value: 'nuoto', label: t('sport.swimming'), roles: [t('role.freestyle'), t('role.breaststroke'), t('role.backstroke'), t('role.butterfly'), t('role.medley')] },
  { value: 'ciclismo', label: t('sport.cycling'), roles: [t('role.road'), t('role.mtb'), t('role.track')] },
  { value: 'crossfit', label: t('sport.crossfit'), roles: [] },
  { value: 'powerlifting', label: t('sport.powerlifting'), roles: [] },
  { value: 'altro', label: t('sport.other'), roles: [] }
];

const getMuscularFocusOptions = (t: (key: string) => string) => [
  { value: '', label: t('onboarding.goal.noFocus'), desc: t('onboarding.goal.noFocusDesc') },
  { value: 'glutei', label: t('muscles.glutes'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'addome', label: t('muscles.abs'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'petto', label: t('muscles.chest'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'dorso', label: t('muscles.back'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'spalle', label: t('muscles.shoulders'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'gambe', label: t('muscles.legs'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'braccia', label: t('muscles.arms'), desc: t('onboarding.goal.increasedVolume') },
  { value: 'polpacci', label: t('muscles.calves'), desc: t('onboarding.goal.increasedVolume') }
];

export default function GoalStep({ data, onNext }: GoalStepProps) {
  const { t } = useTranslation();
  // Multi-goal support: array di goals (max 3)
  const [goals, setGoals] = useState<string[]>(
    data.goals || (data.goal ? [data.goal] : [])
  );
  const [sport, setSport] = useState(data.sport || '');
  const [sportRole, setSportRole] = useState(data.sportRole || '');
  // Multi-select muscular focus (array instead of string)
  const [muscularFocus, setMuscularFocus] = useState<string[]>(
    Array.isArray(data.muscularFocus)
      ? data.muscularFocus
      : data.muscularFocus
        ? [data.muscularFocus]
        : []
  );

  const GOAL_OPTIONS = getGoalOptions(t);
  const SPORTS_OPTIONS = getSportsOptions(t);
  const MUSCULAR_FOCUS_OPTIONS = getMuscularFocusOptions(t);

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
        // Seleziona (max 3) - blocca il 4°
        if (prev.length >= 3) {
          return prev; // Non permette più di 3
        }
        return [...prev, goalValue];
      }
    });
  };

  // Toggle muscular focus selection (multi-select)
  const toggleMuscularFocus = (focusValue: string) => {
    // Empty string = "Nessun focus specifico" → deselect all
    if (focusValue === '') {
      setMuscularFocus([]);
      return;
    }

    setMuscularFocus(prev => {
      if (prev.includes(focusValue)) {
        // Deselect
        return prev.filter(f => f !== focusValue);
      } else {
        // Select (max 3 muscle groups)
        if (prev.length >= 3) {
          return prev; // Don't allow more than 3
        }
        return [...prev, focusValue];
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
      // Multi-select muscular focus (array)
      muscularFocus: (goals.includes('ipertrofia') || goals.includes('tonificazione')) ? muscularFocus : []
    });
  };

  const isValid = goals.length > 0 && (!goals.includes('prestazioni_sportive') || sport);

  // Controlla se ha selezionato goal che richiedono UI aggiuntive
  const showSportSelection = goals.includes('prestazioni_sportive');
  const showMuscularFocus = goals.includes('ipertrofia') || goals.includes('tonificazione');

  // Disclaimer per goal speciali
  const showMotorRecoveryDisclaimer = goals.includes('motor_recovery');
  const showPregnancyDisclaimer = goals.includes('pre_partum') || goals.includes('post_partum');
  const showDisabilityDisclaimer = goals.includes('disabilita');

  // Separa goal per categoria
  const fitnessGoals = GOAL_OPTIONS.filter(g => g.category === 'fitness');
  const sportWellnessGoals = GOAL_OPTIONS.filter(g => g.category === 'sport' || g.category === 'wellness');
  const healthGoals = GOAL_OPTIONS.filter(g => g.category === 'health');

  // Componente card riutilizzabile
  const GoalCard = ({ opt, colorScheme = 'emerald' }: { opt: typeof GOAL_OPTIONS[0], colorScheme?: 'emerald' | 'cyan' }) => {
    const isSelected = goals.includes(opt.value);
    const isDisabled = !isSelected && goals.length >= 3;
    const colors = colorScheme === 'cyan'
      ? { border: 'border-cyan-500', bg: 'from-cyan-500/20 to-cyan-600/10', shadow: 'shadow-cyan-500/10', check: 'bg-cyan-500' }
      : { border: 'border-emerald-500', bg: 'from-emerald-500/20 to-emerald-600/10', shadow: 'shadow-emerald-500/10', check: 'bg-emerald-500' };

    return (
      <button
        onClick={() => toggleGoal(opt.value)}
        disabled={isDisabled}
        className={`group p-4 rounded-xl border-2 text-left transition-all relative ${
          isSelected
            ? `${colors.border} bg-gradient-to-br ${colors.bg} text-white shadow-lg ${colors.shadow}`
            : isDisabled
            ? 'border-slate-700 bg-slate-800/30 text-slate-500 cursor-not-allowed opacity-40'
            : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
        }`}
      >
        {isSelected && (
          <div className={`absolute top-2 right-2 w-6 h-6 ${colors.check} rounded-full flex items-center justify-center shadow-lg`}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <div className="font-bold mb-1">{opt.label}</div>
        <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con contatore */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{t('onboarding.goal.title')}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            goals.length === 3
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {goals.length}/3
          </span>
        </div>
        <p className="text-slate-400">
          {t('onboarding.goal.subtitle')}
        </p>

        {/* Selected goals pills */}
        {goals.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {goals.map((g) => {
              const goalOpt = GOAL_OPTIONS.find(o => o.value === g);
              return (
                <span
                  key={g}
                  className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-500/30"
                >
                  {goalOpt?.label || g}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* FITNESS GOALS Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Fitness</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fitnessGoals.map((opt) => (
            <GoalCard key={opt.value} opt={opt} />
          ))}
        </div>
      </div>

      {/* SPORT & WELLNESS Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wide">Sport & Benessere</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sportWellnessGoals.map((opt) => (
            <GoalCard key={opt.value} opt={opt} />
          ))}
        </div>
      </div>

      {/* HEALTH & SPECIAL NEEDS Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wide">Salute & Esigenze Speciali</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {healthGoals.map((opt) => (
            <GoalCard key={opt.value} opt={opt} colorScheme="cyan" />
          ))}
        </div>
      </div>

      {/* DISCLAIMER RECUPERO MOTORIO */}
      {showMotorRecoveryDisclaimer && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚕️</div>
            <div>
              <p className="text-sm font-semibold text-blue-300 mb-2">{t('onboarding.goal.importantNote')}</p>
              <ul className="text-xs text-blue-200 space-y-1.5">
                <li>{t('onboarding.goal.recoveryNote1')}</li>
                <li>{t('onboarding.goal.recoveryNote2')}</li>
                <li>{t('onboarding.goal.recoveryNote3')}</li>
                <li>{t('onboarding.goal.recoveryNote4')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DISCLAIMER GRAVIDANZA */}
      {showPregnancyDisclaimer && (
        <div className="bg-pink-500/10 border border-pink-500/50 rounded-lg p-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤰</div>
            <div>
              <p className="text-sm font-semibold text-pink-300 mb-2">{t('onboarding.goal.pregnancyImportant')}</p>
              <ul className="text-xs text-pink-200 space-y-1.5">
                <li>{t('onboarding.goal.pregnancyNote1')}</li>
                <li>{t('onboarding.goal.pregnancyNote2')}</li>
                <li>{t('onboarding.goal.pregnancyNote3')}</li>
                <li>{t('onboarding.goal.pregnancyNote4')}</li>
              </ul>
              {goals.includes('post_partum') && (
                <div className="mt-3 pt-3 border-t border-pink-500/30">
                  <p className="text-xs text-pink-300 font-medium mb-1">{t('onboarding.goal.postPartumIncludes')}</p>
                  <p className="text-xs text-pink-200">{t('onboarding.goal.postPartumFeatures')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DISCLAIMER DISABILITÀ */}
      {showDisabilityDisclaimer && (
        <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">♿</div>
            <div>
              <p className="text-sm font-semibold text-purple-300 mb-2">{t('onboarding.goal.disabilityImportant')}</p>
              <ul className="text-xs text-purple-200 space-y-1.5">
                <li>{t('onboarding.goal.disabilityNote1')}</li>
                <li>{t('onboarding.goal.disabilityNote2')}</li>
                <li>{t('onboarding.goal.disabilityNote3')}</li>
                <li>{t('onboarding.goal.disabilityNote4')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MUSCULAR FOCUS - Condizionale per ipertrofia/tonificazione (MULTI-SELECT) */}
      {showMuscularFocus && (
        <div className="space-y-4 bg-slate-700/30 rounded-lg p-5 border border-slate-600 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              {t('onboarding.goal.muscularFocus')}
            </label>
            <p className="text-xs text-slate-400 mb-2">
              {t('onboarding.goal.muscularFocusDesc')}
            </p>
            <p className="text-xs text-emerald-400 font-medium">
              💪 Seleziona fino a 3 distretti - riceveranno serie extra o superset
            </p>
            {muscularFocus.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {muscularFocus.map((f) => {
                  const focusOpt = MUSCULAR_FOCUS_OPTIONS.find(o => o.value === f);
                  return (
                    <span key={f} className="bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium">
                      {focusOpt?.label || f}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MUSCULAR_FOCUS_OPTIONS.map((opt) => {
              const isSelected = muscularFocus.includes(opt.value);
              const isDisabled = !isSelected && muscularFocus.length >= 3 && opt.value !== '';

              return (
                <button
                  key={opt.value}
                  onClick={() => toggleMuscularFocus(opt.value)}
                  disabled={isDisabled}
                  className={`p-3 rounded-lg border text-left transition-all relative ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/20 text-white'
                      : isDisabled
                      ? 'border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed opacity-50'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {isSelected && opt.value !== '' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="font-bold text-sm mb-0.5">{opt.label}</div>
                  <div className="text-xs text-slate-400">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sport Selection - CONDIZIONALE */}
      {showSportSelection && (
        <div className="space-y-4 bg-slate-700/30 rounded-lg p-5 border border-slate-600 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.goal.whichSport')}</label>
            <select
              value={sport}
              onChange={(e) => {
                setSport(e.target.value);
                setSportRole('');
              }}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            >
              <option value="">{t('onboarding.goal.selectSport')}</option>
              {SPORTS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {sport && sportRoles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.goal.rolePosition')}</label>
              <select
                value={sportRole}
                onChange={(e) => setSportRole(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                <option value="">{t('onboarding.goal.selectRole')}</option>
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
                {t('onboarding.goal.sportOptimized')}
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
        {t('common.continue')}
      </button>
    </div>
  );
}
