/**
 * COACH DASHBOARD - Team Edition
 *
 * Panoramica completa della squadra per lo staff:
 * - Team readiness overview
 * - Atleti a rischio / infortunati
 * - Check-in status
 * - Sessioni programmate
 * - Quick stats
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Heart,
  Zap,
  Moon,
  Settings,
  ChevronRight,
  UserPlus,
  ClipboardList,
} from 'lucide-react';
import { supabase, Team, TeamMember, AthleteCheckin, TeamAnalytics } from '../lib/supabase';

interface CoachDashboardProps {
  teamMember: TeamMember;
}

export default function CoachDashboard({ teamMember }: CoachDashboardProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [athletes, setAthletes] = useState<TeamMember[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<AthleteCheckin[]>([]);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [teamMember.team_id]);

  const loadDashboardData = async () => {
    try {
      // Load team info
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamMember.team_id)
        .single();
      setTeam(teamData);

      // Load athletes
      const { data: athletesData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .eq('role', 'athlete')
        .order('jersey_number');
      setAthletes(athletesData || []);

      // Load today's checkins
      const today = new Date().toISOString().split('T')[0];
      const { data: checkinsData } = await supabase
        .from('athlete_checkins')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .eq('checkin_date', today);
      setTodayCheckins(checkinsData || []);

      // Load latest analytics
      const { data: analyticsData } = await supabase
        .from('team_analytics_daily')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalAthletes = athletes.length;
  const checkinsCompleted = todayCheckins.length;
  const checkinRate = totalAthletes > 0 ? Math.round((checkinsCompleted / totalAthletes) * 100) : 0;

  const athletesAtRisk = todayCheckins.filter(c =>
    (c.readiness_score && c.readiness_score < 5) ||
    (c.muscle_soreness && c.muscle_soreness > 7)
  ).length;

  const athletesInjured = athletes.filter(a => a.status === 'injured').length;

  const avgReadiness = todayCheckins.length > 0
    ? Math.round(todayCheckins.reduce((sum, c) => sum + (c.readiness_score || 5), 0) / todayCheckins.length * 10) / 10
    : 0;

  const avgSleep = todayCheckins.length > 0
    ? Math.round(todayCheckins.reduce((sum, c) => sum + (c.sleep_quality || 5), 0) / todayCheckins.length * 10) / 10
    : 0;

  const avgEnergy = todayCheckins.length > 0
    ? Math.round(todayCheckins.reduce((sum, c) => sum + (c.energy_level || 5), 0) / todayCheckins.length * 10) / 10
    : 0;

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white font-display">
              {team?.name || 'Team'}
            </h1>
            <p className="text-slate-400 text-sm">
              {team?.sport} • {team?.current_phase?.replace('_', ' ')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/roster"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Rosa</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Readiness Media"
            value={avgReadiness.toFixed(1)}
            subvalue="/10"
            trend={avgReadiness >= 7 ? 'up' : avgReadiness < 5 ? 'down' : 'neutral'}
            color="primary"
          />
          <StatCard
            icon={<ClipboardList className="w-6 h-6" />}
            label="Check-in Oggi"
            value={`${checkinsCompleted}/${totalAthletes}`}
            subvalue={`${checkinRate}%`}
            trend={checkinRate >= 80 ? 'up' : checkinRate < 50 ? 'down' : 'neutral'}
            color="blue"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="A Rischio"
            value={athletesAtRisk.toString()}
            subvalue="atleti"
            trend={athletesAtRisk === 0 ? 'up' : 'down'}
            color="yellow"
          />
          <StatCard
            icon={<Heart className="w-6 h-6" />}
            label="Infortunati"
            value={athletesInjured.toString()}
            subvalue="atleti"
            trend={athletesInjured === 0 ? 'up' : 'down'}
            color="red"
          />
        </div>

        {/* Wellness Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <WellnessCard
            icon={<Moon className="w-5 h-5" />}
            label="Sonno Medio"
            value={avgSleep}
            color="purple"
          />
          <WellnessCard
            icon={<Zap className="w-5 h-5" />}
            label="Energia Media"
            value={avgEnergy}
            color="yellow"
          />
          <WellnessCard
            icon={<Activity className="w-5 h-5" />}
            label="DOMS Medio"
            value={todayCheckins.length > 0
              ? Math.round(todayCheckins.reduce((sum, c) => sum + (c.muscle_soreness || 5), 0) / todayCheckins.length * 10) / 10
              : 0}
            color="orange"
            inverted // Lower is better
          />
        </div>

        {/* Alerts & Athletes */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Athletes needing attention */}
          <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Attenzione Richiesta</h2>
              <span className="status-badge status-risk">{athletesAtRisk + athletesInjured}</span>
            </div>

            {athletesAtRisk === 0 && athletesInjured === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Tutti gli atleti sono in buone condizioni!
              </p>
            ) : (
              <div className="space-y-3">
                {/* Injured athletes */}
                {athletes.filter(a => a.status === 'injured').map(athlete => (
                  <AthleteAlertRow
                    key={athlete.id}
                    athlete={athlete}
                    type="injured"
                    detail={athlete.injury_notes || 'Infortunato'}
                  />
                ))}

                {/* At risk athletes (low readiness or high soreness) */}
                {todayCheckins
                  .filter(c => (c.readiness_score && c.readiness_score < 5) || (c.muscle_soreness && c.muscle_soreness > 7))
                  .map(checkin => {
                    const athlete = athletes.find(a => a.user_id === checkin.user_id);
                    if (!athlete) return null;

                    const reason = checkin.readiness_score && checkin.readiness_score < 5
                      ? `Readiness bassa: ${checkin.readiness_score}/10`
                      : `DOMS alto: ${checkin.muscle_soreness}/10`;

                    return (
                      <AthleteAlertRow
                        key={checkin.id}
                        athlete={athlete}
                        type="risk"
                        detail={reason}
                      />
                    );
                  })}
              </div>
            )}
          </section>

          {/* Missing check-ins */}
          <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Check-in Mancanti</h2>
              <span className="status-badge status-caution">
                {totalAthletes - checkinsCompleted}
              </span>
            </div>

            {checkinsCompleted === totalAthletes ? (
              <p className="text-slate-400 text-center py-8">
                Tutti gli atleti hanno fatto il check-in!
              </p>
            ) : (
              <div className="space-y-2">
                {athletes
                  .filter(a => !todayCheckins.find(c => c.user_id === a.user_id))
                  .slice(0, 6)
                  .map(athlete => (
                    <div
                      key={athlete.id}
                      className="flex items-center justify-between p-3 bg-team-dark/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                          {athlete.jersey_number || '?'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            #{athlete.jersey_number}
                          </p>
                          <p className="text-slate-400 text-xs">{athlete.position}</p>
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs">In attesa</span>
                    </div>
                  ))}

                {totalAthletes - checkinsCompleted > 6 && (
                  <p className="text-slate-400 text-sm text-center pt-2">
                    +{totalAthletes - checkinsCompleted - 6} altri
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Quick Actions */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            to="/roster"
            icon={<Users className="w-6 h-6" />}
            title="Gestisci Rosa"
            description="Vedi tutti gli atleti"
          />
          <QuickActionCard
            to="/roster?action=invite"
            icon={<UserPlus className="w-6 h-6" />}
            title="Invita Atleta"
            description="Aggiungi nuovo membro"
          />
          <QuickActionCard
            to="/schedule"
            icon={<Calendar className="w-6 h-6" />}
            title="Programma"
            description="Sessioni settimanali"
          />
          <QuickActionCard
            to="/analytics"
            icon={<TrendingUp className="w-6 h-6" />}
            title="Analytics"
            description="Report e statistiche"
          />
        </section>

        {/* Roster Preview */}
        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Rosa Atleti</h2>
            <Link
              to="/roster"
              className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
            >
              Vedi tutti <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {athletes.slice(0, 8).map(athlete => {
              const checkin = todayCheckins.find(c => c.user_id === athlete.user_id);

              return (
                <Link
                  key={athlete.id}
                  to={`/athlete/${athlete.user_id}`}
                  className="flex items-center gap-3 p-3 bg-team-dark/50 rounded-lg hover:bg-team-dark transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                      {athlete.jersey_number || '?'}
                    </div>
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-team-card ${
                      athlete.status === 'injured' ? 'bg-status-injured' :
                      checkin?.readiness_score && checkin.readiness_score >= 7 ? 'bg-status-ready' :
                      checkin?.readiness_score && checkin.readiness_score < 5 ? 'bg-status-risk' :
                      checkin ? 'bg-status-caution' : 'bg-slate-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      #{athlete.jersey_number} {athlete.position}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {checkin ? `Readiness: ${checkin.readiness_score}/10` : 'No check-in'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

function StatCard({
  icon,
  label,
  value,
  subvalue,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'primary' | 'blue' | 'yellow' | 'red';
}) {
  const colorClasses = {
    primary: 'text-primary-400 bg-primary-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20',
    red: 'text-red-400 bg-red-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend === 'up' && <TrendingUp className="w-4 h-4 text-status-ready ml-auto" />}
        {trend === 'down' && <TrendingDown className="w-4 h-4 text-status-risk ml-auto" />}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{value}</span>
          {subvalue && <span className="text-slate-400 text-sm">{subvalue}</span>}
        </div>
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
    </motion.div>
  );
}

function WellnessCard({
  icon,
  label,
  value,
  color,
  inverted = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'purple' | 'yellow' | 'orange';
  inverted?: boolean;
}) {
  const percentage = inverted ? ((10 - value) / 10) * 100 : (value / 10) * 100;
  const isGood = inverted ? value < 5 : value >= 7;

  const colorClasses = {
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-slate-400">{icon}</span>
        <span className="text-slate-300 text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{value.toFixed(1)}</span>
        <div className="flex-1">
          <div className="h-2 bg-team-dark rounded-full overflow-hidden">
            <div
              className={`h-full ${colorClasses[color]} transition-all`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <span className={`text-sm ${isGood ? 'text-status-ready' : 'text-status-caution'}`}>
          {isGood ? 'OK' : '!'}
        </span>
      </div>
    </div>
  );
}

function AthleteAlertRow({
  athlete,
  type,
  detail,
}: {
  athlete: TeamMember;
  type: 'injured' | 'risk';
  detail: string;
}) {
  return (
    <Link
      to={`/athlete/${athlete.user_id}`}
      className="flex items-center justify-between p-3 bg-team-dark/50 rounded-lg hover:bg-team-dark transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          type === 'injured' ? 'bg-status-injured/20 text-status-injured' : 'bg-status-caution/20 text-status-caution'
        }`}>
          {athlete.jersey_number || '?'}
        </div>
        <div>
          <p className="text-white font-medium">#{athlete.jersey_number} {athlete.position}</p>
          <p className={`text-sm ${type === 'injured' ? 'text-status-injured' : 'text-status-caution'}`}>
            {detail}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-500" />
    </Link>
  );
}

function QuickActionCard({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="glass-card p-4 hover:bg-team-card transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400 group-hover:bg-primary-500/30 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-white font-medium">{title}</p>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
}
