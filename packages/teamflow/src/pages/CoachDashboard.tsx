import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, ClipboardList, BarChart3, Settings,
  ChevronRight, Mail, Hash, MapPin, Loader2, AlertCircle,
  CheckCircle, Clock, AlertTriangle, Search, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getTeam, getTeamAthletes, isTeamCoach, getSportPositions, addPlayerToTeam } from '../lib/teamService';
import type { Team, TeamMember } from '@/types';

interface PlayerFormData {
  email: string;
  first_name: string;
  last_name: string;
  jersey_number: string;
  position: string;
  send_invite: boolean;
}

export default function CoachDashboard() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [athletes, setAthletes] = useState<TeamMember[]>([]);
  const [positions, setPositions] = useState<{ key: string; name: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add player modal
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playerForm, setPlayerForm] = useState<PlayerFormData>({
    email: '',
    first_name: '',
    last_name: '',
    jersey_number: '',
    position: '',
    send_invite: true,
  });
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [addPlayerSuccess, setAddPlayerSuccess] = useState('');

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'roster' | 'tests' | 'programs' | 'analytics'>('roster');

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    if (!teamId) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Verifica che sia un coach
      const isCoach = await isTeamCoach(teamId, user.id);
      if (!isCoach) {
        navigate('/dashboard');
        return;
      }

      const [teamData, athletesData] = await Promise.all([
        getTeam(teamId),
        getTeamAthletes(teamId),
      ]);

      if (!teamData) {
        setError('Squadra non trovata');
        return;
      }

      setTeam(teamData);
      setAthletes(athletesData);

      // Carica posizioni per lo sport
      const sportPositions = await getSportPositions(teamData.sport);
      setPositions(sportPositions);

    } catch (err) {
      console.error('Error loading team:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!teamId || !playerForm.first_name || !playerForm.last_name) {
      return;
    }

    setAddingPlayer(true);
    setAddPlayerSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await addPlayerToTeam(teamId, {
        email: playerForm.email,
        first_name: playerForm.first_name,
        last_name: playerForm.last_name,
        jersey_number: playerForm.jersey_number ? parseInt(playerForm.jersey_number) : undefined,
        position: playerForm.position || undefined,
        send_invite: playerForm.send_invite && !!playerForm.email,
      }, user.id);

      setAddPlayerSuccess(
        playerForm.send_invite && playerForm.email
          ? `Invito inviato a ${playerForm.email}`
          : `${playerForm.first_name} ${playerForm.last_name} aggiunto alla squadra`
      );

      // Reset form
      setPlayerForm({
        email: '',
        first_name: '',
        last_name: '',
        jersey_number: '',
        position: '',
        send_invite: true,
      });

      // Ricarica atleti
      const athletesData = await getTeamAthletes(teamId);
      setAthletes(athletesData);

      setTimeout(() => {
        setShowAddPlayer(false);
        setAddPlayerSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Error adding player:', err);
    } finally {
      setAddingPlayer(false);
    }
  };

  const filteredAthletes = athletes.filter((a) => {
    const matchesSearch = !searchQuery ||
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.jersey_number?.toString().includes(searchQuery);

    const matchesPosition = !filterPosition || a.position === filterPosition;

    return matchesSearch && matchesPosition;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Attivo
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3" /> In attesa
          </span>
        );
      case 'injured':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
            <AlertTriangle className="w-3 h-3" /> Infortunato
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Caricamento squadra...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Errore</h2>
          <p className="text-slate-300">{error || 'Squadra non trovata'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{team.name}</h1>
              <p className="text-sm text-slate-400">
                {athletes.length} atleti • {team.category || team.sport}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/coach/team/${teamId}/settings`)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {[
              { key: 'roster', label: 'Rosa', icon: Users },
              { key: 'tests', label: 'Test & Screening', icon: ClipboardList },
              { key: 'programs', label: 'Programmi', icon: BarChart3 },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cerca giocatore..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {positions.length > 0 && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-8 py-2.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Tutte le posizioni</option>
                    {positions.map((p) => (
                      <option key={p.key} value={p.key}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={() => setShowAddPlayer(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2.5 rounded-lg transition flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Aggiungi Giocatore
              </button>
            </div>

            {/* Athletes Grid */}
            {filteredAthletes.length === 0 ? (
              <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {athletes.length === 0 ? 'Nessun atleta nella squadra' : 'Nessun risultato'}
                </h3>
                <p className="text-slate-400 mb-6">
                  {athletes.length === 0
                    ? 'Aggiungi il primo giocatore per iniziare'
                    : 'Prova a modificare i filtri di ricerca'
                  }
                </p>
                {athletes.length === 0 && (
                  <button
                    onClick={() => setShowAddPlayer(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Aggiungi Giocatore
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAthletes.map((athlete) => (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition cursor-pointer group"
                    onClick={() => navigate(`/coach/team/${teamId}/player/${athlete.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl font-bold text-white">
                          {athlete.jersey_number || '?'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {athlete.first_name} {athlete.last_name}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {positions.find(p => p.key === athlete.position)?.name || 'Posizione N/D'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition" />
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(athlete.status)}
                      <span className="text-xs text-slate-500">
                        Screening: Non completato
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center"
          >
            <ClipboardList className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Test & Screening</h3>
            <p className="text-slate-400">
              Gestisci test fisici, screening e valutazioni per ogni atleta
            </p>
          </motion.div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center"
          >
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Programmi di Allenamento</h3>
            <p className="text-slate-400">
              Crea e assegna programmi personalizzati ai tuoi atleti
            </p>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center"
          >
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Analytics</h3>
            <p className="text-slate-400">
              Visualizza statistiche e progressi della squadra
            </p>
          </motion.div>
        )}
      </main>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-400" />
              Aggiungi Giocatore
            </h2>

            {addPlayerSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-emerald-400 font-medium">{addPlayerSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Nome *</label>
                    <input
                      type="text"
                      value={playerForm.first_name}
                      onChange={(e) => setPlayerForm({ ...playerForm, first_name: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Mario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Cognome *</label>
                    <input
                      type="text"
                      value={playerForm.last_name}
                      onChange={(e) => setPlayerForm({ ...playerForm, last_name: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Rossi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input
                    type="email"
                    value={playerForm.email}
                    onChange={(e) => setPlayerForm({ ...playerForm, email: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="giocatore@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" /> Numero
                    </label>
                    <input
                      type="number"
                      value={playerForm.jersey_number}
                      onChange={(e) => setPlayerForm({ ...playerForm, jersey_number: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Posizione
                    </label>
                    <select
                      value={playerForm.position}
                      onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Seleziona...</option>
                      {positions.map((p) => (
                        <option key={p.key} value={p.key}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {playerForm.email && (
                  <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={playerForm.send_invite}
                      onChange={(e) => setPlayerForm({ ...playerForm, send_invite: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-slate-300">
                      Invia email di invito al giocatore
                    </span>
                  </label>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddPlayer(false)}
                    className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleAddPlayer}
                    disabled={addingPlayer || !playerForm.first_name || !playerForm.last_name}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {addingPlayer ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Aggiungi'
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
