/**
 * ATHLETE PROFILE - Team Edition
 *
 * Profilo completo dell'atleta con:
 * - Informazioni personali
 * - Storico check-in e wellness
 * - Risultati test atletici con radar chart
 * - Profilo generato (punti di forza, debolezze)
 * - Programma attuale
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Clock,
  Zap,
  Heart,
  Wind,
  Timer,
  Move,
  ChevronRight,
  Edit3,
  FileText,
  BarChart2,
} from 'lucide-react';
import { supabase, TeamMember, Team, AthleteCheckin } from '../lib/supabase';
import {
  AthleteAssessment,
  AthleteScores,
  AthleteProfile as AthleteProfileType,
} from '../lib/athleteAssessment';
import { toast } from 'sonner';

interface AthleteProfileProps {
  teamMember: TeamMember;
  isOwnProfile?: boolean;
}

export default function AthleteProfile({ teamMember, isOwnProfile }: AthleteProfileProps) {
  const { athleteId } = useParams();
  const [athlete, setAthlete] = useState<TeamMember | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<AthleteAssessment | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<AthleteCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  const isStaff = ['owner', 'coach', 'assistant_coach', 'physio'].includes(teamMember.role);
  const targetUserId = isOwnProfile ? teamMember.user_id : athleteId;

  useEffect(() => {
    if (targetUserId) {
      loadAthleteData();
    }
  }, [targetUserId]);

  const loadAthleteData = async () => {
    try {
      // Load athlete info
      const { data: athleteData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .eq('user_id', targetUserId)
        .single();

      setAthlete(athleteData);

      // Load team info
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamMember.team_id)
        .single();

      setTeam(teamData);

      // Load latest assessment
      const { data: assessmentData } = await supabase
        .from('athlete_assessments')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .eq('user_id', targetUserId)
        .order('assessment_date', { ascending: false })
        .limit(1)
        .single();

      setLatestAssessment(assessmentData);

      // Load recent checkins (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: checkinsData } = await supabase
        .from('athlete_checkins')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .eq('user_id', targetUserId)
        .gte('checkin_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('checkin_date', { ascending: false });

      setRecentCheckins(checkinsData || []);
    } catch (error: any) {
      console.error('Error loading athlete data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-status-ready/20 text-status-ready';
      case 'injured':
        return 'bg-status-risk/20 text-status-risk';
      case 'recovering':
        return 'bg-status-warning/20 text-status-warning';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-status-ready';
    if (score >= 60) return 'text-primary-400';
    if (score >= 40) return 'text-status-warning';
    return 'text-status-risk';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-status-ready';
    if (score >= 60) return 'bg-primary-500';
    if (score >= 40) return 'bg-status-warning';
    return 'bg-status-risk';
  };

  const getQualityLabel = (quality: string) => {
    const labels: Record<string, string> = {
      strength: 'Forza',
      power: 'Potenza',
      aerobic_capacity: 'Capacità Aerobica',
      anaerobic_alactic: 'Anaerobico Alattacido',
      anaerobic_lactic: 'Anaerobico Lattacido',
      speed: 'Velocità',
      agility: 'Agilità',
      mobility: 'Mobilità',
    };
    return labels[quality] || quality;
  };

  const getAthleteTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      power_dominant: 'Dominante Potenza',
      endurance_dominant: 'Dominante Resistenza',
      hybrid: 'Ibrido',
      speed_power: 'Velocità-Potenza',
      endurance_strength: 'Resistenza-Forza',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-team-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen bg-team-dark flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Atleta non trovato</h3>
          <Link to="/roster" className="text-primary-400 hover:text-primary-300">
            Torna alla rosa
          </Link>
        </div>
      </div>
    );
  }

  // Mock scores if no assessment exists
  const scores: AthleteScores = latestAssessment?.scores || {
    strength_score: 0,
    power_score: 0,
    aerobic_score: 0,
    anaerobic_alactic_score: 0,
    anaerobic_lactic_score: 0,
    speed_score: 0,
    agility_score: 0,
    mobility_score: 0,
    overall_score: 0,
    percentile_in_team: 0,
    percentile_in_position: 0,
  };

  const profile: AthleteProfileType = latestAssessment?.profile || {
    top_qualities: [],
    areas_to_improve: [],
    injury_risk_score: 0,
    injury_risk_areas: [],
    asymmetries: [],
    priority_focus: [],
    recommended_frequency: {
      strength_sessions: 0,
      power_sessions: 0,
      aerobic_sessions: 0,
      anaerobic_sessions: 0,
      mobility_sessions: 0,
      sport_practice: 0,
      total_sessions: 0,
    },
    athlete_type: 'hybrid',
  };

  // Calculate wellness averages from recent checkins
  const avgReadiness =
    recentCheckins.length > 0
      ? Math.round(
          recentCheckins.reduce((sum, c) => sum + (c.readiness_score || 0), 0) /
            recentCheckins.length
        )
      : null;

  const avgSleep =
    recentCheckins.length > 0
      ? (
          recentCheckins.reduce((sum, c) => sum + (c.sleep_quality || 0), 0) / recentCheckins.length
        ).toFixed(1)
      : null;

  const avgEnergy =
    recentCheckins.length > 0
      ? (
          recentCheckins.reduce((sum, c) => sum + (c.energy_level || 0), 0) / recentCheckins.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-team-dark">
      {/* Header */}
      <header className="bg-team-card border-b border-team-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to={isOwnProfile ? '/' : '/roster'}
              className="p-2 hover:bg-team-border rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">
                {isOwnProfile ? 'Il Mio Profilo' : 'Profilo Atleta'}
              </h1>
              <p className="text-slate-400 text-sm">{team?.name}</p>
            </div>
            {isStaff && !isOwnProfile && (
              <Link
                to={`/assessment/${athlete.user_id}`}
                className="flex items-center gap-2 px-3 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Nuova Valutazione</span>
              </Link>
            )}
          </div>

          {/* Athlete Header Card */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-400">
                {athlete.jersey_number || '?'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl font-bold text-white">
                  {athlete.position || 'N/D'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(athlete.status)}`}>
                  {athlete.status === 'active' && 'Attivo'}
                  {athlete.status === 'injured' && 'Infortunato'}
                  {athlete.status === 'recovering' && 'In recupero'}
                </span>
              </div>
              {athlete.dominant_foot && (
                <p className="text-slate-400 text-sm">
                  Piede: {athlete.dominant_foot === 'right' ? 'Destro' : 'Sinistro'}
                </p>
              )}
              {latestAssessment && (
                <p className="text-slate-500 text-xs mt-1">
                  Ultimo test: {new Date(latestAssessment.assessment_date).toLocaleDateString('it-IT')}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Wellness Overview (from checkins) */}
        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Wellness (7 giorni)
            </h2>
            <span className="text-slate-400 text-sm">{recentCheckins.length} check-in</span>
          </div>

          {recentCheckins.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-team-dark/50 rounded-lg p-4 text-center">
                <Activity className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(avgReadiness || 0)}`} />
                <p className={`text-2xl font-bold ${getScoreColor(avgReadiness || 0)}`}>
                  {avgReadiness}/10
                </p>
                <p className="text-slate-400 text-sm">Readiness Media</p>
              </div>
              <div className="bg-team-dark/50 rounded-lg p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <p className="text-2xl font-bold text-white">{avgSleep}</p>
                <p className="text-slate-400 text-sm">Qualità Sonno</p>
              </div>
              <div className="bg-team-dark/50 rounded-lg p-4 text-center">
                <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <p className="text-2xl font-bold text-white">{avgEnergy}</p>
                <p className="text-slate-400 text-sm">Energia Media</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-4">
              Nessun check-in negli ultimi 7 giorni
            </p>
          )}
        </section>

        {/* Athletic Profile */}
        {latestAssessment ? (
          <>
            {/* Overall Score & Type */}
            <section className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-400" />
                  Profilo Atletico
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-primary-500/20 text-primary-400`}>
                  {getAthleteTypeLabel(profile.athlete_type)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-team-border"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(scores.overall_score / 100) * 352} 352`}
                        className={getScoreColor(scores.overall_score)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(scores.overall_score)}`}>
                        {scores.overall_score}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 mt-2">Score Generale</p>
                </div>

                {/* Percentiles */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Percentile Team</span>
                      <span className="text-white font-medium">{scores.percentile_in_team}%</span>
                    </div>
                    <div className="h-2 bg-team-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${scores.percentile_in_team}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Percentile Ruolo</span>
                      <span className="text-white font-medium">{scores.percentile_in_position}%</span>
                    </div>
                    <div className="h-2 bg-team-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${scores.percentile_in_position}%` }}
                      />
                    </div>
                  </div>
                  {profile.injury_risk_score > 0 && (
                    <div className="flex items-center gap-2 mt-4 p-2 bg-status-warning/10 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-status-warning" />
                      <span className="text-sm text-status-warning">
                        Rischio Infortuni: {profile.injury_risk_score}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Detailed Scores */}
            <section className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary-400" />
                Capacità Atletiche
              </h2>

              <div className="space-y-4">
                {[
                  { key: 'strength_score', label: 'Forza', icon: Target },
                  { key: 'power_score', label: 'Potenza', icon: Zap },
                  { key: 'aerobic_score', label: 'Aerobico', icon: Wind },
                  { key: 'anaerobic_alactic_score', label: 'Anaerobico Alattacido', icon: Timer },
                  { key: 'anaerobic_lactic_score', label: 'Anaerobico Lattacido', icon: Activity },
                  { key: 'speed_score', label: 'Velocità', icon: Zap },
                  { key: 'agility_score', label: 'Agilità', icon: Move },
                  { key: 'mobility_score', label: 'Mobilità', icon: Move },
                ].map(({ key, label, icon: Icon }) => {
                  const score = scores[key as keyof AthleteScores] as number;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {label}
                        </span>
                        <span className={`font-bold ${getScoreColor(score)}`}>{score}</span>
                      </div>
                      <div className="h-3 bg-team-dark rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className={`h-full rounded-full ${getScoreBarColor(score)}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <section className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-status-ready" />
                  Punti di Forza
                </h2>
                {profile.top_qualities.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.top_qualities.map((quality) => (
                      <li
                        key={quality}
                        className="flex items-center gap-2 text-status-ready"
                      >
                        <div className="w-2 h-2 rounded-full bg-status-ready" />
                        {getQualityLabel(quality)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">Completa una valutazione</p>
                )}
              </section>

              {/* Areas to Improve */}
              <section className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-status-warning" />
                  Aree da Migliorare
                </h2>
                {profile.areas_to_improve.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.areas_to_improve.map((area) => (
                      <li
                        key={area}
                        className="flex items-center gap-2 text-status-warning"
                      >
                        <div className="w-2 h-2 rounded-full bg-status-warning" />
                        {getQualityLabel(area)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">Nessuna area critica</p>
                )}
              </section>
            </div>

            {/* Training Recommendations */}
            <section className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                Raccomandazioni Allenamento
              </h2>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'Forza', value: profile.recommended_frequency.strength_sessions },
                  { label: 'Potenza', value: profile.recommended_frequency.power_sessions },
                  { label: 'Aerobico', value: profile.recommended_frequency.aerobic_sessions },
                  { label: 'Anaerobico', value: profile.recommended_frequency.anaerobic_sessions },
                  { label: 'Mobilità', value: profile.recommended_frequency.mobility_sessions },
                  { label: 'Sport', value: profile.recommended_frequency.sport_practice },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-team-dark/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-slate-400">{label}/sett</p>
                  </div>
                ))}
              </div>

              {profile.priority_focus.length > 0 && (
                <div className="mt-4 p-3 bg-primary-500/10 rounded-lg">
                  <p className="text-sm text-primary-400">
                    <strong>Priorità:</strong> {profile.priority_focus.map(getQualityLabel).join(', ')}
                  </p>
                </div>
              )}
            </section>
          </>
        ) : (
          /* No Assessment Yet */
          <section className="glass-card p-8 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nessuna Valutazione Atletica
            </h3>
            <p className="text-slate-400 mb-4">
              Esegui una batteria di test per generare il profilo atletico completo
            </p>
            {isStaff && (
              <Link
                to={`/assessment/${athlete.user_id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5" />
                Nuova Valutazione
              </Link>
            )}
          </section>
        )}

        {/* Injury Notes if present */}
        {athlete.status === 'injured' && athlete.injury_notes && (
          <section className="glass-card p-6 border-status-risk/30">
            <h2 className="text-lg font-semibold text-status-risk mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Note Infortunio
            </h2>
            <p className="text-slate-300">{athlete.injury_notes}</p>
            {athlete.return_date && (
              <p className="text-sm text-slate-400 mt-2">
                Data ritorno prevista: {new Date(athlete.return_date).toLocaleDateString('it-IT')}
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
