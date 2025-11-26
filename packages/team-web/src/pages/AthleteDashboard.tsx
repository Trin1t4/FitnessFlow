/**
 * ATHLETE DASHBOARD - Team Edition
 *
 * Vista semplificata per l'atleta:
 * - Check-in giornaliero
 * - Programma del giorno
 * - Storico prestazioni
 * - Profilo personale
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Activity,
  TrendingUp,
  Moon,
  Zap,
  Heart,
  ChevronRight,
  CheckCircle,
  Play,
} from 'lucide-react';
import { supabase, TeamMember, AthleteCheckin } from '../lib/supabase';
import { toast } from 'sonner';

interface AthleteDashboardProps {
  teamMember: TeamMember;
}

export default function AthleteDashboard({ teamMember }: AthleteDashboardProps) {
  const [todayCheckin, setTodayCheckin] = useState<AthleteCheckin | null>(null);
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Checkin form state
  const [sleepQuality, setSleepQuality] = useState(7);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [mood, setMood] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [muscleSoreness, setMuscleSoreness] = useState(3);
  const [availableForTraining, setAvailableForTraining] = useState(true);

  useEffect(() => {
    loadTodayCheckin();
  }, [teamMember]);

  const loadTodayCheckin = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('athlete_checkins')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .eq('user_id', teamMember.user_id)
        .eq('checkin_date', today)
        .single();

      setTodayCheckin(data);
      if (!data) setShowCheckinForm(true);
    } catch (error) {
      // No checkin found - show form
      setShowCheckinForm(true);
    } finally {
      setLoading(false);
    }
  };

  const submitCheckin = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('athlete_checkins')
        .upsert({
          team_id: teamMember.team_id,
          user_id: teamMember.user_id,
          checkin_date: today,
          sleep_quality: sleepQuality,
          sleep_hours: sleepHours,
          energy_level: energyLevel,
          mood,
          stress_level: stressLevel,
          muscle_soreness: muscleSoreness,
          available_for_training: availableForTraining,
        })
        .select()
        .single();

      if (error) throw error;

      setTodayCheckin(data);
      setShowCheckinForm(false);
      toast.success('Check-in completato!');
    } catch (error: any) {
      toast.error(error.message || 'Errore nel salvataggio');
    }
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
      <header className="bg-team-card border-b border-team-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Buongiorno</p>
              <h1 className="text-xl font-bold text-white">
                #{teamMember.jersey_number} {teamMember.position}
              </h1>
            </div>
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold"
            >
              {teamMember.jersey_number}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Check-in Status */}
        {todayCheckin ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-status-ready/20">
                <CheckCircle className="w-6 h-6 text-status-ready" />
              </div>
              <div>
                <p className="text-white font-semibold">Check-in Completato</p>
                <p className="text-slate-400 text-sm">
                  Readiness: {todayCheckin.readiness_score}/10
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Moon className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-bold">{todayCheckin.sleep_quality}</p>
                <p className="text-slate-400 text-xs">Sonno</p>
              </div>
              <div>
                <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-white font-bold">{todayCheckin.energy_level}</p>
                <p className="text-slate-400 text-xs">Energia</p>
              </div>
              <div>
                <Activity className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-white font-bold">{todayCheckin.muscle_soreness}</p>
                <p className="text-slate-400 text-xs">DOMS</p>
              </div>
            </div>

            <button
              onClick={() => setShowCheckinForm(true)}
              className="w-full mt-4 py-2 text-sm text-primary-400 hover:text-primary-300"
            >
              Modifica check-in
            </button>
          </motion.div>
        ) : showCheckinForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Check-in Giornaliero
            </h2>

            <div className="space-y-5">
              {/* Sleep Quality */}
              <div>
                <label className="flex items-center justify-between text-slate-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-purple-400" />
                    Qualità Sonno
                  </span>
                  <span className="text-white font-bold">{sleepQuality}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Sleep Hours */}
              <div>
                <label className="flex items-center justify-between text-slate-300 mb-2">
                  <span>Ore di Sonno</span>
                  <span className="text-white font-bold">{sleepHours}h</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Energy Level */}
              <div>
                <label className="flex items-center justify-between text-slate-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Livello Energia
                  </span>
                  <span className="text-white font-bold">{energyLevel}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Muscle Soreness */}
              <div>
                <label className="flex items-center justify-between text-slate-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    DOMS / Dolore Muscolare
                  </span>
                  <span className="text-white font-bold">{muscleSoreness}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={muscleSoreness}
                  onChange={(e) => setMuscleSoreness(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Stress Level */}
              <div>
                <label className="flex items-center justify-between text-slate-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    Livello Stress
                  </span>
                  <span className="text-white font-bold">{stressLevel}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Disponibile per allenamento?</span>
                <button
                  onClick={() => setAvailableForTraining(!availableForTraining)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    availableForTraining
                      ? 'bg-status-ready/20 text-status-ready'
                      : 'bg-status-risk/20 text-status-risk'
                  }`}
                >
                  {availableForTraining ? 'Sì' : 'No'}
                </button>
              </div>

              <button
                onClick={submitCheckin}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
              >
                Completa Check-in
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* Today's Workout */}
        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Allenamento Oggi</h2>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>

          <div className="bg-team-dark/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-semibold">Forza - Lower Body</p>
                <p className="text-slate-400 text-sm">60 min • RPE Target: 7-8</p>
              </div>
              <Link
                to="/workout"
                className="p-3 bg-primary-500 rounded-full text-white hover:bg-primary-600 transition-colors"
              >
                <Play className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-team-card rounded text-xs text-slate-300">
                Squat
              </span>
              <span className="px-2 py-1 bg-team-card rounded text-xs text-slate-300">
                RDL
              </span>
              <span className="px-2 py-1 bg-team-card rounded text-xs text-slate-300">
                Lunges
              </span>
              <span className="px-2 py-1 bg-team-card rounded text-xs text-slate-300">
                +3 esercizi
              </span>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Le Tue Stats</h2>
            <Link to="/profile" className="text-primary-400 text-sm flex items-center gap-1">
              Vedi tutto <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-team-dark/50 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-status-ready mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">78</p>
              <p className="text-slate-400 text-sm">Score Totale</p>
            </div>
            <div className="bg-team-dark/50 rounded-lg p-4 text-center">
              <Activity className="w-6 h-6 text-primary-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-slate-400 text-sm">Sessioni Mese</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
