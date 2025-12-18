import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { token } = useParams(); // For invite links
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(!!token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Account creato! Controlla la tua email per confermare.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Errore di autenticazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-team-dark flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-display">
            TrainSmart
          </h1>
          <p className="text-primary-400 font-semibold">TEAM EDITION</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-team-dark border border-team-border rounded-lg text-white focus:outline-none focus:border-primary-500"
              placeholder="coach@team.com"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-team-dark border border-team-border rounded-lg text-white focus:outline-none focus:border-primary-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Caricamento...' : isSignUp ? 'Registrati' : 'Accedi'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          {isSignUp ? 'Hai già un account?' : 'Non hai un account?'}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary-400 hover:text-primary-300"
          >
            {isSignUp ? 'Accedi' : 'Registrati'}
          </button>
        </p>
      </div>
    </div>
  );
}
