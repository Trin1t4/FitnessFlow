import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Pages
import Login from './pages/Login';
import CoachDashboard from './pages/CoachDashboard';
import AthleteDashboard from './pages/AthleteDashboard';
import TeamRoster from './pages/TeamRoster';
import AthleteProfile from './pages/AthleteProfile';
import AssessmentPage from './pages/AssessmentPage';
import TeamSettings from './pages/TeamSettings';

// Types
import type { TeamMember } from './lib/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadTeamMember(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadTeamMember(session.user.id);
      } else {
        setTeamMember(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadTeamMember = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setTeamMember(data);
    } catch (error) {
      console.error('Error loading team member:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-team-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/invite/:token" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }

  // Logged in but no team membership
  if (!teamMember) {
    return (
      <div className="min-h-screen bg-team-dark flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Nessuna Squadra</h1>
          <p className="text-slate-400 mb-6">
            Non sei ancora membro di nessuna squadra.
            Contatta il tuo coach per ricevere un invito.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-primary-400 hover:text-primary-300"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Determine role-based routing
  const isStaff = ['owner', 'coach', 'assistant_coach', 'physio', 'nutritionist'].includes(teamMember.role);

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {isStaff ? (
          // Staff routes
          <>
            <Route path="/" element={<CoachDashboard teamMember={teamMember} />} />
            <Route path="/roster" element={<TeamRoster teamMember={teamMember} />} />
            <Route path="/athlete/:athleteId" element={<AthleteProfile teamMember={teamMember} />} />
            <Route path="/assessment/:athleteId" element={<AssessmentPage teamMember={teamMember} />} />
            <Route path="/settings" element={<TeamSettings teamMember={teamMember} />} />
          </>
        ) : (
          // Athlete routes
          <>
            <Route path="/" element={<AthleteDashboard teamMember={teamMember} />} />
            <Route path="/profile" element={<AthleteProfile teamMember={teamMember} isOwnProfile />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
