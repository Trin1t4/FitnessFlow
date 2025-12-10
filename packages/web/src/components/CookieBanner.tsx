import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Settings } from 'lucide-react';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const COOKIE_CONSENT_KEY = 'cookie_consent';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<Partial<CookieConsent>>({
    necessary: true, // Sempre attivo
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Controlla se esiste già un consenso
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Mostra il banner dopo un breve delay per non bloccare il caricamento
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (consentData: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setShow(false);

    // Qui puoi attivare/disattivare gli script in base al consenso
    if (consentData.analytics) {
      // Attiva analytics (se implementato)
      console.log('[COOKIE] Analytics enabled');
    }
    if (consentData.marketing) {
      // Attiva marketing (se implementato)
      console.log('[COOKIE] Marketing enabled');
    }
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  const savePreferences = () => {
    saveConsent({
      necessary: true,
      analytics: consent.analytics || false,
      marketing: consent.marketing || false,
      timestamp: new Date().toISOString(),
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      {/* Overlay scuro */}
      <div
        className="absolute inset-0 bg-black/40 pointer-events-auto"
        onClick={() => {}} // Previene click-through
      />

      {/* Banner */}
      <div className="relative w-full max-w-4xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl pointer-events-auto animate-slide-up">
        {/* Header con icona */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Cookie className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Utilizziamo i cookie
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Utilizziamo cookie tecnici necessari per il funzionamento dell'app.
              Puoi scegliere se accettare anche cookie opzionali per migliorare la tua esperienza.
              {' '}
              <Link to="/cookie-policy" className="text-emerald-400 hover:text-emerald-300 underline">
                Leggi la Cookie Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Impostazioni dettagliate (collassabile) */}
        {showSettings && (
          <div className="px-6 pb-4 space-y-3 animate-in fade-in duration-200">
            {/* Cookie necessari */}
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white text-sm">Cookie Necessari</p>
                <p className="text-xs text-slate-400">
                  Essenziali per il funzionamento dell'app (autenticazione, sicurezza)
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-emerald-400 mr-2">Sempre attivi</span>
                <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>

            {/* Cookie analitici */}
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white text-sm">Cookie Analitici</p>
                <p className="text-xs text-slate-400">
                  Ci aiutano a capire come usi l'app per migliorarla
                </p>
              </div>
              <button
                onClick={() => setConsent({ ...consent, analytics: !consent.analytics })}
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  consent.analytics ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    consent.analytics ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Cookie marketing */}
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white text-sm">Cookie di Marketing</p>
                <p className="text-xs text-slate-400">
                  Utilizzati per mostrarti contenuti pertinenti (attualmente non attivi)
                </p>
              </div>
              <button
                onClick={() => setConsent({ ...consent, marketing: !consent.marketing })}
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  consent.marketing ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    consent.marketing ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Bottoni azione */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-slate-700">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition"
          >
            <Settings className="w-4 h-4" />
            {showSettings ? 'Nascondi impostazioni' : 'Personalizza'}
          </button>

          <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={showSettings ? savePreferences : acceptNecessary}
              className="px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition"
            >
              {showSettings ? 'Salva preferenze' : 'Solo necessari'}
            </button>
            <button
              onClick={acceptAll}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-lg shadow-emerald-500/20"
            >
              Accetta tutti
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook per verificare il consenso cookie
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (saved) {
      setConsent(JSON.parse(saved));
    }
  }, []);

  return {
    consent,
    hasConsent: !!consent,
    hasAnalyticsConsent: consent?.analytics || false,
    hasMarketingConsent: consent?.marketing || false,
  };
}
