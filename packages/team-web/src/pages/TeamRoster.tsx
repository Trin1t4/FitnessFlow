/**
 * TEAM ROSTER - Team Edition
 *
 * Lista completa degli atleti della squadra con:
 * - Filtri per ruolo/stato
 * - Statistiche rapide
 * - Accesso ai profili individuali
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Users,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Activity,
  ChevronRight,
  X,
  Copy,
  Bandage,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { supabase, TeamMember, Team, AthleteCheckin } from '../lib/supabase';
import { toast } from 'sonner';

interface TeamRosterProps {
  teamMember: TeamMember;
}

interface AthleteWithStats extends TeamMember {
  latest_checkin?: AthleteCheckin;
  avg_readiness?: number;
  sessions_this_month?: number;
}

type FilterStatus = 'all' | 'active' | 'injured' | 'recovering' | 'at_risk';

export default function TeamRoster({ teamMember }: TeamRosterProps) {
  const [athletes, setAthletes] = useState<AthleteWithStats[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const isStaff = ['owner', 'coach', 'assistant_coach', 'physio'].includes(teamMember.role);

  useEffect(() => {
    loadTeamAndAthletes();
  }, [teamMember.team_id]);

  const loadTeamAndAthletes = async () => {
    try {
      // Load team info
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamMember.team_id)
        .single();

      setTeam(teamData);

      // Load all team members who are athletes
      const { data: membersData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .eq('role', 'athlete')
        .order('jersey_number', { ascending: true });

      if (membersData) {
        // Load latest checkins for all athletes
        const today = new Date().toISOString().split('T')[0];
        const { data: checkinsData } = await supabase
          .from('athlete_checkins')
          .select('*')
          .eq('team_id', teamMember.team_id)
          .eq('checkin_date', today);

        // Map checkins to athletes
        const athletesWithStats: AthleteWithStats[] = membersData.map((athlete) => {
          const checkin = checkinsData?.find((c) => c.user_id === athlete.user_id);
          return {
            ...athlete,
            latest_checkin: checkin,
            avg_readiness: checkin?.readiness_score || undefined,
          };
        });

        setAthletes(athletesWithStats);
      }
    } catch (error: any) {
      toast.error('Errore nel caricamento della rosa');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = async () => {
    try {
      // Generate unique token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

      const { error } = await supabase.from('team_invites').insert({
        team_id: teamMember.team_id,
        token,
        role: 'athlete',
        invited_by: teamMember.user_id,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      const link = `${window.location.origin}/join/${token}`;
      setInviteLink(link);
      setShowInviteModal(true);
    } catch (error: any) {
      toast.error('Errore nella creazione del link');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Link copiato!');
  };

  // Filter athletes
  const filteredAthletes = athletes.filter((athlete) => {
    // Search filter
    const searchMatch =
      searchQuery === '' ||
      athlete.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.jersey_number?.toString().includes(searchQuery);

    // Status filter
    let statusMatch = true;
    if (filterStatus === 'active') statusMatch = athlete.status === 'active';
    if (filterStatus === 'injured') statusMatch = athlete.status === 'injured';
    if (filterStatus === 'recovering') statusMatch = athlete.status === 'recovering';
    if (filterStatus === 'at_risk')
      statusMatch =
        (athlete.latest_checkin?.readiness_score || 10) < 6 || athlete.status === 'injured';

    return searchMatch && statusMatch;
  });

  // Stats
  const totalAthletes = athletes.length;
  const activeAthletes = athletes.filter((a) => a.status === 'active').length;
  const injuredAthletes = athletes.filter((a) => a.status === 'injured').length;
  const atRiskAthletes = athletes.filter(
    (a) => (a.latest_checkin?.readiness_score || 10) < 6
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-status-ready/20 text-status-ready';
      case 'injured':
        return 'bg-status-risk/20 text-status-risk';
      case 'recovering':
        return 'bg-status-warning/20 text-status-warning';
      case 'resting':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Attivo';
      case 'injured':
        return 'Infortunato';
      case 'recovering':
        return 'In recupero';
      case 'resting':
        return 'Riposo';
      default:
        return 'Inattivo';
    }
  };

  const getReadinessColor = (score?: number) => {
    if (!score) return 'text-slate-500';
    if (score >= 7) return 'text-status-ready';
    if (score >= 5) return 'text-status-warning';
    return 'text-status-risk';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-team-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-team-dark">
      {/* Header */}
      <header className="bg-team-card border-b border-team-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Rosa Squadra</h1>
              <p className="text-slate-400">{team?.name}</p>
            </div>
            {isStaff && (
              <button
                onClick={generateInviteLink}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span className="hidden sm:inline">Invita Atleta</span>
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-team-dark/50 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-primary-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{totalAthletes}</p>
              <p className="text-xs text-slate-400">Totale</p>
            </div>
            <div className="bg-team-dark/50 rounded-lg p-3 text-center">
              <CheckCircle className="w-5 h-5 text-status-ready mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{activeAthletes}</p>
              <p className="text-xs text-slate-400">Attivi</p>
            </div>
            <div className="bg-team-dark/50 rounded-lg p-3 text-center">
              <Bandage className="w-5 h-5 text-status-risk mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{injuredAthletes}</p>
              <p className="text-xs text-slate-400">Infortunati</p>
            </div>
            <div className="bg-team-dark/50 rounded-lg p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-status-warning mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{atRiskAthletes}</p>
              <p className="text-xs text-slate-400">A Rischio</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per numero o ruolo..."
                className="w-full pl-10 pr-4 py-2 bg-team-dark border border-team-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'injured', 'at_risk'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-team-dark text-slate-400 hover:bg-team-border'
                  }`}
                >
                  {status === 'all' && 'Tutti'}
                  {status === 'active' && 'Attivi'}
                  {status === 'injured' && 'Infortunati'}
                  {status === 'at_risk' && 'A Rischio'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Athletes List */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {filteredAthletes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nessun atleta trovato</h3>
            <p className="text-slate-400">
              {searchQuery || filterStatus !== 'all'
                ? 'Prova a modificare i filtri'
                : 'Inizia invitando atleti alla squadra'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredAthletes.map((athlete, index) => (
                <motion.div
                  key={athlete.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/athlete/${athlete.user_id}`}
                    className="glass-card p-4 flex items-center gap-4 hover:border-primary-500/50 transition-colors group"
                  >
                    {/* Jersey Number */}
                    <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-primary-400">
                        {athlete.jersey_number || '?'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white truncate">
                          {athlete.position || 'N/D'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                            athlete.status
                          )}`}
                        >
                          {getStatusLabel(athlete.status)}
                        </span>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Activity
                            className={`w-4 h-4 ${getReadinessColor(
                              athlete.latest_checkin?.readiness_score
                            )}`}
                          />
                          <span
                            className={getReadinessColor(athlete.latest_checkin?.readiness_score)}
                          >
                            {athlete.latest_checkin?.readiness_score
                              ? `${athlete.latest_checkin.readiness_score}/10`
                              : 'N/D'}
                          </span>
                        </div>
                        {athlete.latest_checkin ? (
                          <span className="text-slate-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-status-ready" />
                            Check-in
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            No check-in
                          </span>
                        )}
                      </div>

                      {/* Injury note if present */}
                      {athlete.status === 'injured' && athlete.injury_notes && (
                        <p className="text-xs text-status-risk mt-1 truncate">
                          {athlete.injury_notes}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary-400 transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Invita Atleta</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-400 mb-4">
                Condividi questo link con l'atleta. Il link è valido per 7 giorni.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-team-dark border border-team-border rounded-lg text-white text-sm"
                />
                <button
                  onClick={copyInviteLink}
                  className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
