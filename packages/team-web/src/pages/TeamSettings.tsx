/**
 * TEAM SETTINGS - Team Edition
 *
 * Impostazioni della squadra (solo owner/coach):
 * - Info generali squadra
 * - Gestione stagione
 * - Impostazioni check-in
 * - Gestione staff
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  Users,
  Calendar,
  Bell,
  Shield,
  Save,
  Trash2,
} from 'lucide-react';
import { supabase, TeamMember, Team, TeamSettings as TeamSettingsType } from '../lib/supabase';
import { toast } from 'sonner';

interface TeamSettingsProps {
  teamMember: TeamMember;
}

export default function TeamSettings({ teamMember }: TeamSettingsProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('');
  const [category, setCategory] = useState('');
  const [currentPhase, setCurrentPhase] = useState<'pre_season' | 'in_season' | 'off_season' | 'transition'>('pre_season');
  const [requireDailyCheckin, setRequireDailyCheckin] = useState(true);
  const [checkinReminderTime, setCheckinReminderTime] = useState('08:00');
  const [shareAnalytics, setShareAnalytics] = useState(true);

  const isOwner = teamMember.role === 'owner';
  const canEdit = ['owner', 'coach'].includes(teamMember.role);

  useEffect(() => {
    loadTeamSettings();
  }, [teamMember.team_id]);

  const loadTeamSettings = async () => {
    try {
      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamMember.team_id)
        .single();

      if (data) {
        setTeam(data);
        setTeamName(data.name);
        setSport(data.sport);
        setCategory(data.category || '');
        setCurrentPhase(data.current_phase);
        setRequireDailyCheckin(data.settings?.require_daily_checkin ?? true);
        setCheckinReminderTime(data.settings?.checkin_reminder_time || '08:00');
        setShareAnalytics(data.settings?.share_analytics_with_athletes ?? true);
      }
    } catch (error: any) {
      toast.error('Errore nel caricamento impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: teamName,
          sport,
          category,
          current_phase: currentPhase,
          settings: {
            require_daily_checkin: requireDailyCheckin,
            checkin_reminder_time: checkinReminderTime,
            share_analytics_with_athletes: shareAnalytics,
          },
        })
        .eq('id', teamMember.team_id);

      if (error) throw error;
      toast.success('Impostazioni salvate!');
    } catch (error: any) {
      toast.error(error.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 hover:bg-team-border rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Impostazioni Squadra</h1>
              <p className="text-slate-400 text-sm">{team?.name}</p>
            </div>
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Salvando...' : 'Salva'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* General Info */}
        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-400" />
            Informazioni Generali
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1">Nome Squadra</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={!canEdit}
                className="w-full px-4 py-2 bg-team-dark border border-team-border rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Sport</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                disabled={!canEdit}
                className="w-full px-4 py-2 bg-team-dark border border-team-border rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-primary-500"
              >
                <option value="football">Calcio</option>
                <option value="basketball">Basket</option>
                <option value="volleyball">Pallavolo</option>
                <option value="rugby">Rugby</option>
                <option value="handball">Pallamano</option>
                <option value="other">Altro</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!canEdit}
                placeholder="Es. Promozione, Serie D..."
                className="w-full px-4 py-2 bg-team-dark border border-team-border rounded-lg text-white disabled:opacity-50 placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </section>

        {/* Season Phase */}
        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-400" />
            Fase Stagionale
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'off_season', label: 'Off-Season' },
              { value: 'pre_season', label: 'Pre-Season' },
              { value: 'in_season', label: 'In-Season' },
              { value: 'transition', label: 'Transizione' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => canEdit && setCurrentPhase(value as any)}
                disabled={!canEdit}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  currentPhase === value
                    ? 'bg-primary-500 text-white'
                    : 'bg-team-dark text-slate-400 hover:bg-team-border'
                } disabled:opacity-50`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Check-in Settings */}
        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-400" />
            Impostazioni Check-in
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Check-in giornaliero obbligatorio</p>
                <p className="text-slate-400 text-sm">Gli atleti devono compilare il check-in ogni giorno</p>
              </div>
              <button
                onClick={() => canEdit && setRequireDailyCheckin(!requireDailyCheckin)}
                disabled={!canEdit}
                className={`w-12 h-6 rounded-full transition-colors ${
                  requireDailyCheckin ? 'bg-primary-500' : 'bg-slate-600'
                } disabled:opacity-50`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                    requireDailyCheckin ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Orario promemoria</p>
                <p className="text-slate-400 text-sm">Quando inviare la notifica di check-in</p>
              </div>
              <input
                type="time"
                value={checkinReminderTime}
                onChange={(e) => setCheckinReminderTime(e.target.value)}
                disabled={!canEdit}
                className="px-3 py-1 bg-team-dark border border-team-border rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Condividi analytics con atleti</p>
                <p className="text-slate-400 text-sm">Gli atleti possono vedere le statistiche di team</p>
              </div>
              <button
                onClick={() => canEdit && setShareAnalytics(!shareAnalytics)}
                disabled={!canEdit}
                className={`w-12 h-6 rounded-full transition-colors ${
                  shareAnalytics ? 'bg-primary-500' : 'bg-slate-600'
                } disabled:opacity-50`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                    shareAnalytics ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone - Only for owner */}
        {isOwner && (
          <section className="glass-card p-6 border border-status-risk/30">
            <h2 className="text-lg font-semibold text-status-risk mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Zona Pericolosa
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Elimina Squadra</p>
                <p className="text-slate-400 text-sm">Questa azione è irreversibile</p>
              </div>
              <button
                onClick={() => toast.error('Funzionalità non ancora implementata')}
                className="flex items-center gap-2 px-4 py-2 bg-status-risk/20 text-status-risk hover:bg-status-risk/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Elimina
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
