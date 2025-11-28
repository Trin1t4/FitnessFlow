import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, ClipboardList, BarChart3, FileText,
  Loader2, AlertCircle, Save, CheckCircle, Calendar,
  Ruler, Weight, Activity, Target
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getTeam, isTeamCoach, getSportPositions } from '../lib/teamService';
import type { Team, TeamMember } from '@/types';

interface ScreeningData {
  // Dati anagrafici
  height?: number;
  weight?: number;
  birth_date?: string;
  // Pattern baselines (1-5 scale)
  lower_push?: number;
  horizontal_push?: number;
  vertical_push?: number;
  vertical_pull?: number;
  lower_pull?: number;
  core?: number;
  // Note
  notes?: string;
}

export default function PlayerDetail() {
  const { teamId, playerId } = useParams<{ teamId: string; playerId: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [player, setPlayer] = useState<TeamMember | null>(null);
  const [positions, setPositions] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'info' | 'screening' | 'program' | 'history'>('info');

  // Form data
  const [screeningData, setScreeningData] = useState<ScreeningData>({});
  const [playerInfo, setPlayerInfo] = useState({
    jersey_number: '',
    position: '',
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, [teamId, playerId]);

  const loadData = async () => {
    if (!teamId || !playerId) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const isCoach = await isTeamCoach(teamId, user.id);
      if (!isCoach) {
        navigate('/dashboard');
        return;
      }

      // Carica team
      const teamData = await getTeam(teamId);
      if (!teamData) {
        setError('Squadra non trovata');
        return;
      }
      setTeam(teamData);

      // Carica posizioni sport
      const sportPositions = await getSportPositions(teamData.sport);
      setPositions(sportPositions);

      // Carica giocatore
      const { data: playerData, error: playerError } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', playerId)
        .single();

      if (playerError || !playerData) {
        setError('Giocatore non trovato');
        return;
      }

      setPlayer(playerData);
      setPlayerInfo({
        jersey_number: playerData.jersey_number?.toString() || '',
        position: playerData.position || '',
        status: playerData.status || 'active',
      });

      // Carica dati screening se esistono
      const { data: screeningResult } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', playerData.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (screeningResult?.pattern_baselines) {
        setScreeningData({
          ...screeningResult.pattern_baselines,
          notes: screeningResult.notes,
        });
      }

    } catch (err) {
      console.error('Error loading player:', err);
      setError('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async () => {
    if (!playerId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          jersey_number: playerInfo.jersey_number ? parseInt(playerInfo.jersey_number) : null,
          position: playerInfo.position || null,
          status: playerInfo.status,
        })
        .eq('id', playerId);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveScreening = async () => {
    if (!player?.user_id) return;

    setSaving(true);
    try {
      // Salva lo screening nel database assessments
      const { error } = await supabase
        .from('assessments')
        .upsert({
          user_id: player.user_id,
          pattern_baselines: {
            lower_push: screeningData.lower_push || 0,
            horizontal_push: screeningData.horizontal_push || 0,
            vertical_push: screeningData.vertical_push || 0,
            vertical_pull: screeningData.vertical_pull || 0,
            lower_pull: screeningData.lower_pull || 0,
            core: screeningData.core || 0,
          },
          notes: screeningData.notes,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving screening:', err);
    } finally {
      setSaving(false);
    }
  };

  const PatternInput = ({
    label,
    value,
    onChange
  }: {
    label: string;
    value: number | undefined;
    onChange: (val: number) => void
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-medium text-orange-400">{value || 0}/5</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              (value || 0) >= level
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !player || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-300">{error}</p>
          <button
            onClick={() => navigate(`/coach/team/${teamId}`)}
            className="mt-6 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Torna alla Squadra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(`/coach/team/${teamId}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla squadra
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
              {player.jersey_number || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {player.first_name} {player.last_name}
              </h1>
              <p className="text-slate-400">
                {positions.find(p => p.key === player.position)?.name || 'Posizione N/D'} • {team.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex gap-1">
            {[
              { key: 'info', label: 'Info', icon: User },
              { key: 'screening', label: 'Screening', icon: ClipboardList },
              { key: 'program', label: 'Programma', icon: Target },
              { key: 'history', label: 'Storico', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-3 flex items-center gap-2 border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Informazioni Giocatore</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Numero Maglia</label>
                <input
                  type="number"
                  value={playerInfo.jersey_number}
                  onChange={(e) => setPlayerInfo({ ...playerInfo, jersey_number: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Posizione</label>
                <select
                  value={playerInfo.position}
                  onChange={(e) => setPlayerInfo({ ...playerInfo, position: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleziona posizione</option>
                  {positions.map((p) => (
                    <option key={p.key} value={p.key}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Stato</label>
                <select
                  value={playerInfo.status}
                  onChange={(e) => setPlayerInfo({ ...playerInfo, status: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="active">Attivo</option>
                  <option value="injured">Infortunato</option>
                  <option value="recovering">In recupero</option>
                  <option value="inactive">Inattivo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveInfo}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? 'Salvato!' : 'Salva'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Screening Tab */}
        {activeTab === 'screening' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Dati fisici */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-400" />
                Dati Fisici
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5" /> Altezza (cm)
                  </label>
                  <input
                    type="number"
                    value={screeningData.height || ''}
                    onChange={(e) => setScreeningData({ ...screeningData, height: parseInt(e.target.value) || undefined })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5" /> Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={screeningData.weight || ''}
                    onChange={(e) => setScreeningData({ ...screeningData, weight: parseInt(e.target.value) || undefined })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Data di Nascita
                  </label>
                  <input
                    type="date"
                    value={screeningData.birth_date || ''}
                    onChange={(e) => setScreeningData({ ...screeningData, birth_date: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Pattern Baselines */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-orange-400" />
                Pattern Baselines
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Valuta ogni pattern motorio da 1 (principiante) a 5 (avanzato)
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <PatternInput
                  label="Lower Push (Squat)"
                  value={screeningData.lower_push}
                  onChange={(val) => setScreeningData({ ...screeningData, lower_push: val })}
                />
                <PatternInput
                  label="Horizontal Push (Panca)"
                  value={screeningData.horizontal_push}
                  onChange={(val) => setScreeningData({ ...screeningData, horizontal_push: val })}
                />
                <PatternInput
                  label="Vertical Push (Military)"
                  value={screeningData.vertical_push}
                  onChange={(val) => setScreeningData({ ...screeningData, vertical_push: val })}
                />
                <PatternInput
                  label="Vertical Pull (Trazioni)"
                  value={screeningData.vertical_pull}
                  onChange={(val) => setScreeningData({ ...screeningData, vertical_pull: val })}
                />
                <PatternInput
                  label="Lower Pull (Stacco)"
                  value={screeningData.lower_pull}
                  onChange={(val) => setScreeningData({ ...screeningData, lower_pull: val })}
                />
                <PatternInput
                  label="Core (Stabilità)"
                  value={screeningData.core}
                  onChange={(val) => setScreeningData({ ...screeningData, core: val })}
                />
              </div>
            </div>

            {/* Note */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Note</h2>
              <textarea
                value={screeningData.notes || ''}
                onChange={(e) => setScreeningData({ ...screeningData, notes: e.target.value })}
                rows={4}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Eventuali note su infortuni, limitazioni, obiettivi specifici..."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveScreening}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saved ? 'Salvato!' : 'Salva Screening'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Program Tab */}
        {activeTab === 'program' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center"
          >
            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Programma di Allenamento</h3>
            <p className="text-slate-400 mb-6">
              Assegna un programma personalizzato a questo atleta
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition">
              Genera Programma
            </button>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center"
          >
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Storico</h3>
            <p className="text-slate-400">
              Visualizza lo storico di test, programmi e progressi
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
