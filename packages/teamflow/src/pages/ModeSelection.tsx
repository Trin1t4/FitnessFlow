import { useNavigate } from 'react-router-dom';
import { User, Users, ChevronRight, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ModeSelection() {
  const navigate = useNavigate();

  const handleSelectMode = (mode: 'individual' | 'team') => {
    // Salva la modalità e naviga al registro appropriato
    sessionStorage.setItem('selectedMode', mode);
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Come vuoi usare TeamFlow?
          </h1>
          <p className="text-slate-400 text-lg">
            Scegli la modalità più adatta a te
          </p>
        </motion.div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Individual Mode */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => handleSelectMode('individual')}
            className="group bg-slate-800/60 hover:bg-slate-800 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Individuale</h2>
            <p className="text-slate-400 mb-6">
              Allena te stesso con programmi personalizzati. Versione semplificata per atleti singoli.
            </p>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                Programma personale
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                Screening rapido
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                Tracciamento progressi
              </li>
            </ul>
            <div className="flex items-center text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
              Inizia ora
              <ChevronRight className="w-5 h-5 ml-1" />
            </div>
          </motion.button>

          {/* Team Mode */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => handleSelectMode('team')}
            className="group bg-slate-800/60 hover:bg-slate-800 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-orange-500/50 transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
              <Users className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Squadra</h2>
            <p className="text-slate-400 mb-6">
              Gestisci la preparazione atletica di tutta la squadra. Per allenatori e preparatori.
            </p>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                Database giocatori completo
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                Test e screening individuali
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                Assegnazione programmi
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                Dashboard allenatore
              </li>
            </ul>
            <div className="flex items-center text-orange-400 font-medium group-hover:translate-x-1 transition-transform">
              Gestisci squadra
              <ChevronRight className="w-5 h-5 ml-1" />
            </div>
          </motion.button>
        </div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            Torna alla home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
