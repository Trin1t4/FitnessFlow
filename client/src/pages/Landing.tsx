import { Link } from 'react-router-dom';
import { Dumbbell, Target, TrendingUp, ChevronRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl mb-6 shadow-lg shadow-emerald-500/50">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
            TrainSmart
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Il tuo programma di allenamento personalizzato
          </p>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Assessment intelligente basato su quiz teorico e test pratici per creare il programma perfetto per il tuo livello
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/onboarding"
              className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Inizia Ora
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-4 px-8 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300"
            >
              Ho già un account
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Assessment Completo</h3>
              <p className="text-slate-400 text-sm">
                Quiz teorico + test pratici di movimento per determinare il tuo livello reale
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Dumbbell className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Programma Personalizzato</h3>
              <p className="text-slate-400 text-sm">
                Allenamenti adattati al tuo livello, obiettivo e attrezzatura disponibile
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Progressione Intelligente</h3>
              <p className="text-slate-400 text-sm">
                Il tuo programma si adatta ai tuoi progressi nel tempo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
