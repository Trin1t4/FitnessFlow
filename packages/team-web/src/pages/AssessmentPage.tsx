/**
 * ASSESSMENT PAGE - Team Edition
 *
 * Form completo per inserire i risultati dei test atletici:
 * - Test di Forza
 * - Test di Potenza
 * - Test Aerobici
 * - Test Anaerobici
 * - Test Velocità/Agilità
 * - Test Mobilità
 *
 * Calcola automaticamente scores e genera profilo atleta
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  ChevronRight,
  ChevronLeft,
  Target,
  Zap,
  Wind,
  Timer,
  Activity,
  Move,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { supabase, TeamMember, Team } from '../lib/supabase';
import {
  StrengthTests,
  PowerTests,
  AerobicTests,
  AnaerobicTests,
  SpeedAgilityTests,
  MobilityTests,
  calculateAthleteScores,
  generateAthleteProfile,
} from '../lib/athleteAssessment';
import { toast } from 'sonner';

interface AssessmentPageProps {
  teamMember: TeamMember;
}

type TestCategory = 'strength' | 'power' | 'aerobic' | 'anaerobic' | 'speed_agility' | 'mobility';

const CATEGORIES: { key: TestCategory; label: string; icon: any }[] = [
  { key: 'strength', label: 'Forza', icon: Target },
  { key: 'power', label: 'Potenza', icon: Zap },
  { key: 'aerobic', label: 'Aerobico', icon: Wind },
  { key: 'anaerobic', label: 'Anaerobico', icon: Timer },
  { key: 'speed_agility', label: 'Velocità & Agilità', icon: Activity },
  { key: 'mobility', label: 'Mobilità', icon: Move },
];

export default function AssessmentPage({ teamMember }: AssessmentPageProps) {
  const { athleteId } = useParams();
  const navigate = useNavigate();

  const [athlete, setAthlete] = useState<TeamMember | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<TestCategory>('strength');

  // Test data state
  const [strengthTests, setStrengthTests] = useState<StrengthTests>({});
  const [powerTests, setPowerTests] = useState<PowerTests>({});
  const [aerobicTests, setAerobicTests] = useState<AerobicTests>({});
  const [anaerobicTests, setAnaerobicTests] = useState<AnaerobicTests>({});
  const [speedAgilityTests, setSpeedAgilityTests] = useState<SpeedAgilityTests>({});
  const [mobilityTests, setMobilityTests] = useState<MobilityTests>({});
  const [notes, setNotes] = useState('');

  const isStaff = ['owner', 'coach', 'assistant_coach', 'physio'].includes(teamMember.role);

  useEffect(() => {
    if (athleteId) {
      loadAthleteData();
    }
  }, [athleteId]);

  const loadAthleteData = async () => {
    try {
      // Load athlete info
      const { data: athleteData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamMember.team_id)
        .eq('user_id', athleteId)
        .single();

      setAthlete(athleteData);

      // Load team info
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamMember.team_id)
        .single();

      setTeam(teamData);
    } catch (error: any) {
      toast.error('Errore nel caricamento dati atleta');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssessment = async () => {
    if (!athlete || !team) return;

    setSaving(true);
    try {
      // Calculate scores
      const scores = calculateAthleteScores(
        {
          strength: strengthTests,
          power: powerTests,
          aerobic: aerobicTests,
          anaerobic: anaerobicTests,
          speed_agility: speedAgilityTests,
          mobility: mobilityTests,
        },
        team.sport,
        team.level || 'semi_pro',
        'male' // TODO: get from athlete profile
      );

      // Generate profile
      const profile = generateAthleteProfile(scores, {
        mobility: mobilityTests,
        strength: strengthTests,
      });

      // Save to database
      const { error } = await supabase.from('athlete_assessments').insert({
        team_id: teamMember.team_id,
        user_id: athleteId,
        assessed_by: teamMember.user_id,
        assessment_date: new Date().toISOString().split('T')[0],
        strength_tests: strengthTests,
        power_tests: powerTests,
        aerobic_tests: aerobicTests,
        anaerobic_tests: anaerobicTests,
        speed_agility_tests: speedAgilityTests,
        mobility_tests: mobilityTests,
        scores,
        profile,
        notes,
      });

      if (error) throw error;

      toast.success('Valutazione salvata con successo!');
      navigate(`/athlete/${athleteId}`);
    } catch (error: any) {
      toast.error(error.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const goToNextCategory = () => {
    const currentIndex = CATEGORIES.findIndex((c) => c.key === currentCategory);
    if (currentIndex < CATEGORIES.length - 1) {
      setCurrentCategory(CATEGORIES[currentIndex + 1].key);
    }
  };

  const goToPrevCategory = () => {
    const currentIndex = CATEGORIES.findIndex((c) => c.key === currentCategory);
    if (currentIndex > 0) {
      setCurrentCategory(CATEGORIES[currentIndex - 1].key);
    }
  };

  const currentIndex = CATEGORIES.findIndex((c) => c.key === currentCategory);
  const isFirstCategory = currentIndex === 0;
  const isLastCategory = currentIndex === CATEGORIES.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-team-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-team-dark flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-status-risk mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Accesso Negato</h3>
          <p className="text-slate-400">Solo lo staff può eseguire valutazioni</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-team-dark">
      {/* Header */}
      <header className="bg-team-card border-b border-team-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to={`/athlete/${athleteId}`}
              className="p-2 hover:bg-team-border rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Nuova Valutazione</h1>
              <p className="text-slate-400 text-sm">
                #{athlete?.jersey_number} {athlete?.position}
              </p>
            </div>
            <button
              onClick={handleSaveAssessment}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Salva'}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentCategory(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  currentCategory === key
                    ? 'bg-primary-500 text-white'
                    : 'bg-team-dark text-slate-400 hover:bg-team-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-6"
          >
            {/* Strength Tests */}
            {currentCategory === 'strength' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-400" />
                  Test di Forza
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Back Squat 1RM"
                    unit="kg"
                    value={strengthTests.back_squat_1rm}
                    onChange={(v) => setStrengthTests({ ...strengthTests, back_squat_1rm: v })}
                  />
                  <TestInput
                    label="Front Squat 1RM"
                    unit="kg"
                    value={strengthTests.front_squat_1rm}
                    onChange={(v) => setStrengthTests({ ...strengthTests, front_squat_1rm: v })}
                  />
                  <TestInput
                    label="Deadlift 1RM"
                    unit="kg"
                    value={strengthTests.deadlift_1rm}
                    onChange={(v) => setStrengthTests({ ...strengthTests, deadlift_1rm: v })}
                  />
                  <TestInput
                    label="Bench Press 1RM"
                    unit="kg"
                    value={strengthTests.bench_press_1rm}
                    onChange={(v) => setStrengthTests({ ...strengthTests, bench_press_1rm: v })}
                  />
                  <TestInput
                    label="Pull-ups Max"
                    unit="reps"
                    value={strengthTests.pull_ups_max}
                    onChange={(v) => setStrengthTests({ ...strengthTests, pull_ups_max: v })}
                  />
                  <TestInput
                    label="Nordic Curl"
                    unit="reps"
                    value={strengthTests.nordic_curl_reps}
                    onChange={(v) => setStrengthTests({ ...strengthTests, nordic_curl_reps: v })}
                  />
                </div>
              </div>
            )}

            {/* Power Tests */}
            {currentCategory === 'power' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Test di Potenza
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="CMJ (Counter Movement Jump)"
                    unit="cm"
                    value={powerTests.cmj_height}
                    onChange={(v) => setPowerTests({ ...powerTests, cmj_height: v })}
                  />
                  <TestInput
                    label="Squat Jump"
                    unit="cm"
                    value={powerTests.squat_jump_height}
                    onChange={(v) => setPowerTests({ ...powerTests, squat_jump_height: v })}
                  />
                  <TestInput
                    label="Drop Jump"
                    unit="cm"
                    value={powerTests.drop_jump_height}
                    onChange={(v) => setPowerTests({ ...powerTests, drop_jump_height: v })}
                  />
                  <TestInput
                    label="Drop Jump RSI"
                    unit=""
                    step={0.01}
                    value={powerTests.drop_jump_rsi}
                    onChange={(v) => setPowerTests({ ...powerTests, drop_jump_rsi: v })}
                  />
                  <TestInput
                    label="Broad Jump"
                    unit="cm"
                    value={powerTests.broad_jump}
                    onChange={(v) => setPowerTests({ ...powerTests, broad_jump: v })}
                  />
                  <TestInput
                    label="Med Ball Throw (Chest)"
                    unit="m"
                    step={0.1}
                    value={powerTests.med_ball_throw_chest}
                    onChange={(v) => setPowerTests({ ...powerTests, med_ball_throw_chest: v })}
                  />
                </div>
              </div>
            )}

            {/* Aerobic Tests */}
            {currentCategory === 'aerobic' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-400" />
                  Test Aerobici
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Yo-Yo IR1 Distance"
                    unit="m"
                    value={aerobicTests.yo_yo_ir1_distance}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, yo_yo_ir1_distance: v })}
                  />
                  <TestInput
                    label="Cooper Test (12 min)"
                    unit="m"
                    value={aerobicTests.cooper_test_distance}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, cooper_test_distance: v })}
                  />
                  <TestInput
                    label="VO2max Stimato"
                    unit="ml/kg/min"
                    step={0.1}
                    value={aerobicTests.vo2max_estimated}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, vo2max_estimated: v })}
                  />
                  <TestInput
                    label="FC a Riposo"
                    unit="bpm"
                    value={aerobicTests.resting_hr}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, resting_hr: v })}
                  />
                  <TestInput
                    label="FC Max Osservata"
                    unit="bpm"
                    value={aerobicTests.max_hr_observed}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, max_hr_observed: v })}
                  />
                  <TestInput
                    label="HR Recovery (1 min)"
                    unit="bpm"
                    value={aerobicTests.hr_recovery_1min}
                    onChange={(v) => setAerobicTests({ ...aerobicTests, hr_recovery_1min: v })}
                  />
                </div>
              </div>
            )}

            {/* Anaerobic Tests */}
            {currentCategory === 'anaerobic' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-400" />
                  Test Anaerobici
                </h2>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Alattacido (0-10s)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Sprint 10m"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.sprint_10m}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, sprint_10m: v })}
                  />
                  <TestInput
                    label="Sprint 20m"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.sprint_20m}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, sprint_20m: v })}
                  />
                  <TestInput
                    label="Sprint 30m"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.sprint_30m}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, sprint_30m: v })}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Lattacido (10s-2min)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Sprint 300m"
                    unit="sec"
                    step={0.1}
                    value={anaerobicTests.sprint_300m}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, sprint_300m: v })}
                  />
                  <TestInput
                    label="RSA 6x30m (Best)"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.rsa_6x30m_best}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, rsa_6x30m_best: v })}
                  />
                  <TestInput
                    label="RSA 6x30m (Avg)"
                    unit="sec"
                    step={0.01}
                    value={anaerobicTests.rsa_6x30m_avg}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, rsa_6x30m_avg: v })}
                  />
                  <TestInput
                    label="RSA Fatigue Index"
                    unit="%"
                    step={0.1}
                    value={anaerobicTests.rsa_6x30m_fatigue_index}
                    onChange={(v) => setAnaerobicTests({ ...anaerobicTests, rsa_6x30m_fatigue_index: v })}
                  />
                </div>
              </div>
            )}

            {/* Speed & Agility Tests */}
            {currentCategory === 'speed_agility' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Test Velocità & Agilità
                </h2>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Velocità Lineare</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Sprint 5m"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.sprint_5m}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, sprint_5m: v })}
                  />
                  <TestInput
                    label="Sprint 10m"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.sprint_10m}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, sprint_10m: v })}
                  />
                  <TestInput
                    label="Sprint 20m"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.sprint_20m}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, sprint_20m: v })}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Agilità / COD</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="T-Test"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.t_test}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, t_test: v })}
                  />
                  <TestInput
                    label="Illinois Test"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.illinois_test}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, illinois_test: v })}
                  />
                  <TestInput
                    label="Pro Agility 5-10-5"
                    unit="sec"
                    step={0.01}
                    value={speedAgilityTests.pro_agility_5_10_5}
                    onChange={(v) => setSpeedAgilityTests({ ...speedAgilityTests, pro_agility_5_10_5: v })}
                  />
                </div>
              </div>
            )}

            {/* Mobility Tests */}
            {currentCategory === 'mobility' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Move className="w-5 h-5 text-purple-400" />
                  Test Mobilità
                </h2>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Caviglia</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Dorsiflessione SX"
                    unit="cm"
                    value={mobilityTests.ankle_dorsiflexion_left}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, ankle_dorsiflexion_left: v })}
                  />
                  <TestInput
                    label="Dorsiflessione DX"
                    unit="cm"
                    value={mobilityTests.ankle_dorsiflexion_right}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, ankle_dorsiflexion_right: v })}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">Anca</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="Rotazione Interna SX"
                    unit="°"
                    value={mobilityTests.hip_internal_rotation_left}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, hip_internal_rotation_left: v })}
                  />
                  <TestInput
                    label="Rotazione Interna DX"
                    unit="°"
                    value={mobilityTests.hip_internal_rotation_right}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, hip_internal_rotation_right: v })}
                  />
                </div>

                <h3 className="text-sm font-medium text-slate-400 mt-4">FMS</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <TestInput
                    label="FMS Totale"
                    unit="/21"
                    value={mobilityTests.fms_total}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, fms_total: v })}
                  />
                  <TestInput
                    label="Sit & Reach"
                    unit="cm"
                    value={mobilityTests.sit_and_reach}
                    onChange={(v) => setMobilityTests({ ...mobilityTests, sit_and_reach: v })}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Notes */}
        <div className="glass-card p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Note Aggiuntive</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-team-dark border border-team-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 resize-none"
            placeholder="Osservazioni, limitazioni, note particolari..."
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={goToPrevCategory}
            disabled={isFirstCategory}
            className="flex items-center gap-2 px-4 py-2 bg-team-card hover:bg-team-border disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Precedente
          </button>

          {isLastCategory ? (
            <button
              onClick={handleSaveAssessment}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Completa Valutazione'}
            </button>
          ) : (
            <button
              onClick={goToNextCategory}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Successivo
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

// Reusable Test Input Component
interface TestInputProps {
  label: string;
  unit: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  step?: number;
}

function TestInput({ label, unit, value, onChange, step = 1 }: TestInputProps) {
  return (
    <div>
      <label className="block text-slate-300 text-sm mb-1">
        {label} {unit && <span className="text-slate-500">({unit})</span>}
      </label>
      <input
        type="number"
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        className="w-full px-4 py-2 bg-team-dark border border-team-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
        placeholder="-"
      />
    </div>
  );
}
