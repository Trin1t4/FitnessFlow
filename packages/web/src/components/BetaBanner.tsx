import { useState, useEffect } from 'react';
import { X, MessageSquare, Bug } from 'lucide-react';

export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isBeta, setIsBeta] = useState(false);

  useEffect(() => {
    // Mostra il banner solo su beta.trainsmart.me o localhost
    const hostname = window.location.hostname;
    const isBetaDomain = hostname.startsWith('beta.') ||
                         hostname === 'localhost' ||
                         hostname.includes('vercel.app'); // Preview deployments
    setIsBeta(isBetaDomain);
  }, []);

  // Non mostrare su produzione (trainsmart.me senza beta.)
  if (!isBeta || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 text-center relative z-50">
      <div className="container mx-auto flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded">BETA</span>
          <span className="text-sm">
            Stai usando la versione beta di TrainSmart. Alcune funzionalità potrebbero non funzionare correttamente.
          </span>
        </div>
        <a
          href="mailto:feedback@trainsmart.me?subject=Feedback%20Beta%20TrainSmart"
          className="inline-flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
        >
          <MessageSquare className="w-3 h-3" />
          Invia Feedback
        </a>
        <a
          href="mailto:bug@trainsmart.me?subject=Bug%20Report%20Beta%20TrainSmart"
          className="inline-flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
        >
          <Bug className="w-3 h-3" />
          Segnala Bug
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition"
          aria-label="Chiudi banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
