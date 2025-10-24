import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = "/dashboard";
      }
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data?.session) {
      // successful login with session
      window.location.href = "/dashboard";
    } else {
      // fallback: redirect
      window.location.href = "/";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/70 rounded-lg p-8 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">Login</h1>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-emerald-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-emerald-500"
        />
        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 rounded-lg text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50"
        >
          {loading ? "Caricamento..." : "Login"}
        </button>
      </div>
    </div>
  );
}
