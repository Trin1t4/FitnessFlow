import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white">
      <h1 className="text-4xl mb-4">Benvenuto in TrainSmart</h1>
      <p className="mb-8">
        Per iniziare, vai su <Link to="/login" className="underline text-emerald-400 hover:text-emerald-600">Login</Link>
      </p>
    </div>
  );
}
