import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Users, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { createTeam } from '../lib/teamService';

const SPORTS = [
  { key: 'football', name: 'Calcio', icon: '⚽' },
  { key: 'basketball', name: 'Basket', icon: '🏀' },
  { key: 'volleyball', name: 'Pallavolo', icon: '🏐' },
  { key: 'rugby', name: 'Rugby', icon: '🏉' },
  { key: 'hockey', name: 'Hockey', icon: '🏒' },
  { key: 'handball', name: 'Pallamano', icon: '🤾' },
];

const CATEGORIES = [
  { key: 'professional', name: 'Professionisti' },
  { key: 'semi_pro', name: 'Semi-professionisti' },
  { key: 'amateur', name: 'Amatori' },
  { key: 'youth', name: 'Giovanili' },
];

export default function CoachSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('');
  const [category, setCategory] = useState('');

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !sport) {
      setError('Inserisci il nome della squadra e seleziona lo sport');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const team = await createTeam({
        name: teamName.trim(),
        sport,
        category: category || undefined,
      }, user.id);

      // Naviga alla dashboard coach con il team appena creato
      navigate(`/coach/team/${team.id}`);
    } catch (err: unknown) {
      console.error('Error creating team:', err);
      const errorMessage = err instanceof Error ? err.message : 'Errore nella creazione della squadra';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Configura la tua Squadra</h1>
          <p className="text-slate-400">
            {step === 1 && 'Iniziamo con le informazioni base'}
            {step === 2 && 'Seleziona lo sport'}
            {step === 3 && 'Ultima cosa: categoria'}
          </p>
        </motion.div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-orange-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-8 border border-slate-700"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Step 1: Team Name */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Nome della Squadra
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Es. FC Juventus U19"
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-lg"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">
                Puoi modificarlo in seguito nelle impostazioni
              </p>
            </div>
          )}

          {/* Step 2: Sport */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Seleziona lo Sport
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SPORTS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSport(s.key)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      sport === s.key
                        ? 'bg-orange-500/20 border-orange-500 text-white'
                        : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{s.icon}</span>
                    <span className="font-medium">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Category */}
          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Categoria (opzionale)
              </label>
              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      category === c.key
                        ? 'bg-orange-500/20 border-orange-500 text-white'
                        : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCategory('')}
                className="text-sm text-slate-500 hover:text-slate-300 mt-3"
              >
                Salta questo passaggio
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 px-4 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition"
              >
                Indietro
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && !teamName.trim()) {
                    setError('Inserisci il nome della squadra');
                    return;
                  }
                  if (step === 2 && !sport) {
                    setError('Seleziona uno sport');
                    return;
                  }
                  setError('');
                  setStep(step + 1);
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                Continua
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleCreateTeam}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-orange-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creazione...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Crea Squadra
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Dopo aver creato la squadra potrai aggiungere i giocatori
        </p>
      </div>
    </div>
  );
}
