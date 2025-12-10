import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, ClipboardList, BarChart3, Settings,
  ChevronRight, Mail, Hash, MapPin, Loader2, AlertCircle,
  CheckCircle, Clock, AlertTriangle, Search, Filter, Timer, Play, Dumbbell
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getTeam, getTeamAthletes, isTeamCoach, getSportPositions, addPlayerToTeam } from '../lib/teamService';
import type { Team, TeamMember } from '@/types';

// Configurazione durate sessione
const SESSION_DURATIONS = [
  { value: 15, label: '15 min', description: 'Attivazione rapida' },
  { value: 20, label: '20 min', description: 'Pre-partita' },
  { value: 30, label: '30 min', description: 'Sessione breve' },
  { value: 45, label: '45 min', description: 'Sessione standard' },
  { value: 60, label: '60 min', description: 'Sessione completa' },
  { value: 90, label: '90 min', description: 'Sessione estesa' },
];

// Database esercizi per categoria
const EXERCISE_DATABASE = {
  warmup: [
    { name: 'Corsa leggera', duration: 3, equipment: 'none' },
    { name: 'Skip alto', duration: 2, equipment: 'none' },
    { name: 'Skip basso', duration: 2, equipment: 'none' },
    { name: 'Calciata dietro', duration: 2, equipment: 'none' },
    { name: 'Apertura anche dinamica', duration: 2, equipment: 'none' },
    { name: 'Affondi camminati', duration: 3, equipment: 'none' },
    { name: 'Inchworm', duration: 2, equipment: 'none' },
    { name: 'World Greatest Stretch', duration: 3, equipment: 'none' },
    { name: 'Jumping Jack', duration: 2, equipment: 'none' },
    { name: 'Arm Circles', duration: 1, equipment: 'none' },
  ],
  strength_lower: [
    { name: 'Squat', sets: 4, reps: '8-10', rest: 90, equipment: 'barbell' },
    { name: 'Goblet Squat', sets: 3, reps: '12', rest: 75, equipment: 'dumbbell' },
    { name: 'Bulgarian Split Squat', sets: 3, reps: '10/gamba', rest: 75, equipment: 'dumbbell' },
    { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: 90, equipment: 'barbell' },
    { name: 'Hip Thrust', sets: 3, reps: '12', rest: 75, equipment: 'barbell' },
    { name: 'Leg Press', sets: 3, reps: '12', rest: 75, equipment: 'machine' },
    { name: 'Affondi con manubri', sets: 3, reps: '10/gamba', rest: 60, equipment: 'dumbbell' },
    { name: 'Step Up', sets: 3, reps: '10/gamba', rest: 60, equipment: 'box' },
  ],
  strength_upper: [
    { name: 'Panca Piana', sets: 4, reps: '8-10', rest: 90, equipment: 'barbell' },
    { name: 'Trazioni', sets: 4, reps: '6-8', rest: 90, equipment: 'pullup_bar' },
    { name: 'Military Press', sets: 3, reps: '8-10', rest: 75, equipment: 'barbell' },
    { name: 'Rematore Bilanciere', sets: 4, reps: '8-10', rest: 75, equipment: 'barbell' },
    { name: 'Push Up', sets: 3, reps: '15', rest: 60, equipment: 'none' },
    { name: 'Dips', sets: 3, reps: '10', rest: 75, equipment: 'parallels' },
    { name: 'Face Pull', sets: 3, reps: '15', rest: 60, equipment: 'cable' },
  ],
  power: [
    { name: 'Box Jump', sets: 4, reps: '5', rest: 90, equipment: 'box' },
    { name: 'Broad Jump', sets: 4, reps: '5', rest: 90, equipment: 'none' },
    { name: 'Jump Squat', sets: 3, reps: '8', rest: 75, equipment: 'none' },
    { name: 'Medicine Ball Slam', sets: 3, reps: '10', rest: 60, equipment: 'medball' },
    { name: 'Kettlebell Swing', sets: 4, reps: '12', rest: 60, equipment: 'kettlebell' },
    { name: 'Clap Push Up', sets: 3, reps: '8', rest: 75, equipment: 'none' },
    { name: 'Lateral Bound', sets: 3, reps: '8/lato', rest: 60, equipment: 'none' },
    { name: 'Depth Jump', sets: 3, reps: '5', rest: 90, equipment: 'box' },
    { name: 'Hurdle Hop', sets: 4, reps: '6', rest: 75, equipment: 'hurdles' },
  ],
  conditioning: [
    { name: 'Burpees', duration: 30, rest: 30, equipment: 'none' },
    { name: 'Mountain Climber', duration: 30, rest: 30, equipment: 'none' },
    { name: 'Battle Rope', duration: 30, rest: 30, equipment: 'battle_rope' },
    { name: 'Rowing Sprint', duration: 60, rest: 45, equipment: 'rower' },
    { name: 'Bike Sprint', duration: 30, rest: 30, equipment: 'bike' },
    { name: 'Sled Push', duration: 20, rest: 60, equipment: 'sled' },
    { name: 'High Knees', duration: 30, rest: 30, equipment: 'none' },
    { name: 'Shuttle Run', duration: 30, rest: 45, equipment: 'cones' },
    { name: 'Bear Crawl', duration: 30, rest: 30, equipment: 'none' },
    { name: 'Jumping Lunges', duration: 30, rest: 30, equipment: 'none' },
  ],
  core: [
    { name: 'Plank', duration: 45, rest: 30, equipment: 'none' },
    { name: 'Side Plank', duration: 30, rest: 30, equipment: 'none' },
    { name: 'Dead Bug', sets: 3, reps: '10/lato', rest: 45, equipment: 'none' },
    { name: 'Bird Dog', sets: 3, reps: '10/lato', rest: 45, equipment: 'none' },
    { name: 'Pallof Press', sets: 3, reps: '12/lato', rest: 45, equipment: 'cable' },
    { name: 'Russian Twist', sets: 3, reps: '20', rest: 45, equipment: 'none' },
    { name: 'Hanging Knee Raise', sets: 3, reps: '12', rest: 60, equipment: 'pullup_bar' },
    { name: 'Ab Wheel Rollout', sets: 3, reps: '10', rest: 60, equipment: 'ab_wheel' },
  ],
  cooldown: [
    { name: 'Stretching quadricipiti', duration: 1, equipment: 'none' },
    { name: 'Stretching femorali', duration: 1, equipment: 'none' },
    { name: 'Stretching adduttori', duration: 1, equipment: 'none' },
    { name: 'Stretching glutei', duration: 1, equipment: 'none' },
    { name: 'Stretching dorsali', duration: 1, equipment: 'none' },
    { name: 'Stretching pettorali', duration: 1, equipment: 'none' },
    { name: 'Cat-Cow', duration: 1, equipment: 'none' },
    { name: 'Child Pose', duration: 1, equipment: 'none' },
    { name: 'Foam Rolling gambe', duration: 2, equipment: 'foam_roller' },
    { name: 'Respirazione diaframmatica', duration: 2, equipment: 'none' },
  ],
};

// Genera sessione automatica basata sul tempo
function generateAutoSession(duration: number, sport: string) {
  const warmupTime = Math.min(10, Math.round(duration * 0.15));
  const cooldownTime = Math.min(8, Math.round(duration * 0.1));
  const mainTime = duration - warmupTime - cooldownTime;

  // Seleziona esercizi warmup
  const warmupExercises = selectExercises(EXERCISE_DATABASE.warmup, warmupTime, 'duration');

  // Seleziona esercizi main work (mix basato sul tempo disponibile)
  let mainExercises: any[] = [];

  if (mainTime <= 15) {
    // Sessione breve: solo conditioning/circuito
    mainExercises = [
      { block: 'Circuito Metabolico', exercises: selectExercises(EXERCISE_DATABASE.conditioning, mainTime, 'circuit', 4) }
    ];
  } else if (mainTime <= 30) {
    // Sessione media: power + conditioning
    const powerTime = Math.round(mainTime * 0.5);
    const condTime = mainTime - powerTime;
    mainExercises = [
      { block: 'Esplosività', exercises: selectExercises(EXERCISE_DATABASE.power, powerTime, 'sets', 3) },
      { block: 'Conditioning', exercises: selectExercises(EXERCISE_DATABASE.conditioning, condTime, 'circuit', 3) }
    ];
  } else if (mainTime <= 50) {
    // Sessione standard: forza + power + core
    const strengthTime = Math.round(mainTime * 0.5);
    const powerTime = Math.round(mainTime * 0.3);
    const coreTime = mainTime - strengthTime - powerTime;
    mainExercises = [
      { block: 'Forza', exercises: [...selectExercises(EXERCISE_DATABASE.strength_lower, strengthTime * 0.6, 'sets', 2), ...selectExercises(EXERCISE_DATABASE.strength_upper, strengthTime * 0.4, 'sets', 2)] },
      { block: 'Potenza', exercises: selectExercises(EXERCISE_DATABASE.power, powerTime, 'sets', 2) },
      { block: 'Core', exercises: selectExercises(EXERCISE_DATABASE.core, coreTime, 'sets', 2) }
    ];
  } else {
    // Sessione lunga: completa
    const strengthTime = Math.round(mainTime * 0.45);
    const powerTime = Math.round(mainTime * 0.25);
    const condTime = Math.round(mainTime * 0.2);
    const coreTime = mainTime - strengthTime - powerTime - condTime;
    mainExercises = [
      { block: 'Forza Lower', exercises: selectExercises(EXERCISE_DATABASE.strength_lower, strengthTime * 0.5, 'sets', 3) },
      { block: 'Forza Upper', exercises: selectExercises(EXERCISE_DATABASE.strength_upper, strengthTime * 0.5, 'sets', 3) },
      { block: 'Potenza', exercises: selectExercises(EXERCISE_DATABASE.power, powerTime, 'sets', 3) },
      { block: 'Conditioning', exercises: selectExercises(EXERCISE_DATABASE.conditioning, condTime, 'circuit', 4) },
      { block: 'Core', exercises: selectExercises(EXERCISE_DATABASE.core, coreTime, 'sets', 2) }
    ];
  }

  // Seleziona esercizi cooldown
  const cooldownExercises = selectExercises(EXERCISE_DATABASE.cooldown, cooldownTime, 'duration');

  return {
    warmup: { duration: warmupTime, exercises: warmupExercises },
    main: mainExercises,
    cooldown: { duration: cooldownTime, exercises: cooldownExercises },
    totalDuration: duration
  };
}

// Helper per selezionare esercizi
function selectExercises(pool: any[], targetTime: number, mode: 'duration' | 'sets' | 'circuit', maxExercises?: number) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected: any[] = [];
  let accumulatedTime = 0;

  for (const ex of shuffled) {
    if (maxExercises && selected.length >= maxExercises) break;

    let exerciseTime = 0;
    if (mode === 'duration') {
      exerciseTime = ex.duration || 2;
    } else if (mode === 'sets') {
      // Stima: sets * (tempo esecuzione + rest)
      exerciseTime = (ex.sets || 3) * (0.75 + (ex.rest || 60) / 60);
    } else if (mode === 'circuit') {
      exerciseTime = ((ex.duration || 30) + (ex.rest || 30)) / 60;
    }

    if (accumulatedTime + exerciseTime <= targetTime + 2) {
      selected.push({ ...ex });
      accumulatedTime += exerciseTime;
    }
  }

  return selected;
}

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

  // Session duration selector
  const [showSessionPlanner, setShowSessionPlanner] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(45);
  const [generatedSession, setGeneratedSession] = useState<any>(null);

  // Genera sessione quando cambia la durata
  useEffect(() => {
    if (showSessionPlanner && team) {
      const session = generateAutoSession(sessionDuration, team.sport);
      setGeneratedSession(session);
    }
  }, [sessionDuration, showSessionPlanner, team]);

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

  const handleStartSession = () => {
    // Naviga alla sessione con il programma generato
    navigate(`/coach/team/${teamId}/session`, {
      state: {
        duration: sessionDuration,
        session: generatedSession
      }
    });
  };

  const handleRegenerateSession = () => {
    if (team) {
      const session = generateAutoSession(sessionDuration, team.sport);
      setGeneratedSession(session);
    }
  };

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
          <div className="flex items-center gap-2">
            {/* Session Planner Button */}
            <button
              onClick={() => setShowSessionPlanner(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
            >
              <Timer className="w-5 h-5" />
              Pianifica Sessione
            </button>
            <button
              onClick={() => navigate(`/coach/team/${teamId}/settings`)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
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

      {/* Session Planner Modal */}
      {showSessionPlanner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-orange-400" />
                Sessione Atletica - {sessionDuration} minuti
              </h2>
              <button
                onClick={() => setShowSessionPlanner(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Durata Sessione */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Tempo Disponibile
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SESSION_DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setSessionDuration(d.value)}
                    className={`p-3 rounded-xl border-2 transition text-center ${
                      sessionDuration === d.value
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-lg font-bold">{d.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Programma Generato */}
            {generatedSession && (
              <div className="space-y-4">
                {/* Warmup */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-amber-400 flex items-center gap-2">
                      🔥 Riscaldamento
                    </h3>
                    <span className="text-sm text-amber-400/70">{generatedSession.warmup.duration} min</span>
                  </div>
                  <div className="space-y-2">
                    {generatedSession.warmup.exercises.map((ex: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-slate-800/50 rounded-lg px-3 py-2">
                        <span className="text-slate-200">{ex.name}</span>
                        <span className="text-slate-400">{ex.duration} min</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Blocks */}
                {generatedSession.main.map((block: any, blockIndex: number) => {
                  const blockColors: Record<string, { bg: string; border: string; text: string }> = {
                    'Forza': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
                    'Forza Lower': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
                    'Forza Upper': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
                    'Potenza': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
                    'Esplosività': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
                    'Conditioning': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
                    'Circuito Metabolico': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
                    'Core': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
                  };
                  const colors = blockColors[block.block] || { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
                  const icons: Record<string, string> = {
                    'Forza': '💪', 'Forza Lower': '🦵', 'Forza Upper': '💪',
                    'Potenza': '⚡', 'Esplosività': '⚡',
                    'Conditioning': '🏃', 'Circuito Metabolico': '🔄',
                    'Core': '🎯'
                  };

                  return (
                    <div key={blockIndex} className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-bold ${colors.text} flex items-center gap-2`}>
                          {icons[block.block] || '🏋️'} {block.block}
                        </h3>
                        <span className={`text-sm ${colors.text} opacity-70`}>{block.exercises.length} esercizi</span>
                      </div>
                      <div className="space-y-2">
                        {block.exercises.map((ex: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-slate-800/50 rounded-lg px-3 py-2">
                            <span className="text-slate-200 font-medium">{ex.name}</span>
                            <span className="text-slate-400 font-mono">
                              {ex.sets ? `${ex.sets}x${ex.reps}` : `${ex.duration}s`}
                              {ex.rest && <span className="text-slate-500 ml-2">({ex.rest}s rest)</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Cooldown */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-blue-400 flex items-center gap-2">
                      🧘 Defaticamento
                    </h3>
                    <span className="text-sm text-blue-400/70">{generatedSession.cooldown.duration} min</span>
                  </div>
                  <div className="space-y-2">
                    {generatedSession.cooldown.exercises.map((ex: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-slate-800/50 rounded-lg px-3 py-2">
                        <span className="text-slate-200">{ex.name}</span>
                        <span className="text-slate-400">{ex.duration} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRegenerateSession}
                className="px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition font-medium flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Rigenera
              </button>
              <button
                onClick={() => setShowSessionPlanner(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition font-medium"
              >
                Annulla
              </button>
              <button
                onClick={handleStartSession}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Avvia Sessione
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
