import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla home
        </Link>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-slate-700">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Cookie Policy</h1>
          <p className="text-slate-400 mb-8">Ultimo aggiornamento: 9 Dicembre 2025</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            {/* Intro */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">1. Cosa sono i Cookie</h2>
              <p className="text-slate-300 leading-relaxed">
                I cookie sono piccoli file di testo che vengono salvati sul tuo dispositivo quando visiti un sito web.
                Servono a memorizzare informazioni utili per migliorare la tua esperienza di navigazione.
              </p>
            </section>

            {/* Tipi di cookie */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">2. Tipi di Cookie Utilizzati</h2>

              {/* Cookie necessari */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-emerald-400 mb-3">2.1 Cookie Tecnici (Necessari)</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Questi cookie sono essenziali per il funzionamento dell'app e non possono essere disattivati.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-2 text-slate-300">Nome</th>
                      <th className="text-left py-2 text-slate-300">Scopo</th>
                      <th className="text-left py-2 text-slate-300">Durata</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <tr className="border-b border-slate-700">
                      <td className="py-2 font-mono text-xs">sb-*-auth-token</td>
                      <td className="py-2">Autenticazione utente (Supabase)</td>
                      <td className="py-2">Sessione</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 font-mono text-xs">sb-*-auth-token-code-verifier</td>
                      <td className="py-2">Sicurezza autenticazione</td>
                      <td className="py-2">Sessione</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="py-2 font-mono text-xs">cookie_consent</td>
                      <td className="py-2">Memorizza le tue preferenze cookie</td>
                      <td className="py-2">1 anno</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono text-xs">sidebar_state</td>
                      <td className="py-2">Stato interfaccia utente</td>
                      <td className="py-2">7 giorni</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cookie analitici */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-blue-400 mb-3">2.2 Cookie Analitici (Opzionali)</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Ci aiutano a capire come usi l'app per migliorarla. Attualmente <strong className="text-white">non utilizziamo</strong>
                  cookie analitici di terze parti come Google Analytics.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Se in futuro implementeremo analytics, ti chiederemo il consenso esplicito prima di attivare questi cookie.
                </p>
              </div>

              {/* Cookie marketing */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-medium text-purple-400 mb-3">2.3 Cookie di Marketing (Opzionali)</h3>
                <p className="text-slate-300 leading-relaxed">
                  Attualmente <strong className="text-white">non utilizziamo</strong> cookie di marketing o profilazione.
                  Non tracciamo la tua attività per mostrarti pubblicità personalizzate.
                </p>
              </div>
            </section>

            {/* Local Storage */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">3. Local Storage</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Oltre ai cookie, utilizziamo il Local Storage del browser per memorizzare:
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-2 text-slate-300">Chiave</th>
                    <th className="text-left py-2 text-slate-300">Scopo</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr className="border-b border-slate-700">
                    <td className="py-2 font-mono text-xs">app_language</td>
                    <td className="py-2">Lingua preferita dell'interfaccia</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 font-mono text-xs">onboarding_data</td>
                    <td className="py-2">Dati onboarding (backup locale)</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2 font-mono text-xs">menstrual_preference</td>
                    <td className="py-2">Preferenza ciclo mestruale (se fornita)</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">cookie_consent</td>
                    <td className="py-2">Preferenze cookie</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Gestione cookie */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">4. Come Gestire i Cookie</h2>

              <h3 className="text-lg font-medium text-white mb-3">4.1 Tramite il nostro Banner</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Quando visiti l'app per la prima volta, ti verrà mostrato un banner per gestire le tue preferenze.
                Puoi modificare le tue scelte in qualsiasi momento dalle impostazioni del profilo.
              </p>

              <h3 className="text-lg font-medium text-white mb-3">4.2 Tramite il Browser</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Puoi gestire i cookie anche dalle impostazioni del tuo browser:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                    Safari
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                    Microsoft Edge
                  </a>
                </li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                <strong className="text-amber-400">Nota:</strong> Disabilitare i cookie tecnici potrebbe compromettere il funzionamento dell'app.
              </p>
            </section>

            {/* Cookie di terze parti */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">5. Cookie di Terze Parti</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                I seguenti servizi di terze parti potrebbero impostare cookie:
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-2 text-slate-300">Servizio</th>
                    <th className="text-left py-2 text-slate-300">Scopo</th>
                    <th className="text-left py-2 text-slate-300">Privacy Policy</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr className="border-b border-slate-700">
                    <td className="py-2">Supabase</td>
                    <td className="py-2">Autenticazione e database</td>
                    <td className="py-2">
                      <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                        Link
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-2">Stripe</td>
                    <td className="py-2">Elaborazione pagamenti</td>
                    <td className="py-2">
                      <a href="https://stripe.com/it/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                        Link
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Vercel</td>
                    <td className="py-2">Hosting</td>
                    <td className="py-2">
                      <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                        Link
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Aggiornamenti */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">6. Aggiornamenti</h2>
              <p className="text-slate-300 leading-relaxed">
                Questa Cookie Policy può essere aggiornata periodicamente. Ti informeremo di eventuali modifiche
                significative tramite un nuovo banner di consenso o una notifica nell'app.
              </p>
            </section>

            {/* Contatti */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">7. Contatti</h2>
              <p className="text-slate-300 leading-relaxed">
                Per domande sui cookie:
              </p>
              <ul className="list-none text-slate-300 space-y-2 mt-4">
                <li>
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:privacy@trainsmart.me" className="text-emerald-400 hover:text-emerald-300">
                    privacy@trainsmart.me
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
