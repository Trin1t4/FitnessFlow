import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Termini di Servizio</h1>
          <p className="text-slate-400 mb-8">Ultimo aggiornamento: 9 Dicembre 2025</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            {/* Intro */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">1. Accettazione dei Termini</h2>
              <p className="text-slate-300 leading-relaxed">
                Utilizzando TrainSmart (di seguito "Servizio", "App" o "Piattaforma"), accetti di essere vincolato
                da questi Termini di Servizio. Se non accetti questi termini, non puoi utilizzare il Servizio.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                TrainSmart si riserva il diritto di modificare questi termini in qualsiasi momento.
                Le modifiche saranno comunicate via email o tramite avviso nell'app.
              </p>
            </section>

            {/* Descrizione servizio */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">2. Descrizione del Servizio</h2>
              <p className="text-slate-300 leading-relaxed">
                TrainSmart è un'applicazione che fornisce:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
                <li>Programmi di allenamento personalizzati basati sui tuoi dati e obiettivi</li>
                <li>Monitoraggio del dolore e adattamento automatico degli esercizi</li>
                <li>Tracking dei progressi e delle sessioni di allenamento</li>
                <li>Suggerimenti per il recupero e la progressione</li>
              </ul>
            </section>

            {/* Disclaimer medico */}
            <section className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-4">3. Disclaimer Medico - IMPORTANTE</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                <strong className="text-white">TrainSmart NON è un dispositivo medico</strong> e non sostituisce in alcun modo
                il parere di un medico, fisioterapista o altro professionista sanitario qualificato.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>I programmi di allenamento sono suggerimenti generali, non prescrizioni mediche</li>
                <li>Consulta sempre un medico prima di iniziare qualsiasi programma di esercizio fisico</li>
                <li>Se avverti dolore durante l'allenamento, interrompi immediatamente e consulta un professionista</li>
                <li>Il sistema di rilevamento del dolore è uno strumento di supporto, non una diagnosi medica</li>
                <li>Non utilizzare l'app per trattare condizioni mediche specifiche senza supervisione professionale</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                <strong className="text-white">Utilizzando l'app, riconosci e accetti</strong> che TrainSmart non è
                responsabile per eventuali infortuni o danni derivanti dall'uso dei programmi di allenamento.
              </p>
            </section>

            {/* Requisiti utente */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">4. Requisiti per l'Utilizzo</h2>
              <p className="text-slate-300 leading-relaxed">
                Per utilizzare TrainSmart devi:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
                <li>Avere almeno 16 anni di età</li>
                <li>Fornire informazioni accurate e veritiere durante la registrazione</li>
                <li>Mantenere la sicurezza del tuo account e password</li>
                <li>Non condividere il tuo account con terzi</li>
                <li>Essere in buona salute o avere l'approvazione medica per l'attività fisica</li>
              </ul>
            </section>

            {/* Responsabilità utente */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">5. Responsabilità dell'Utente</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                L'utente si impegna a:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Fornire dati accurati sulle proprie condizioni fisiche</li>
                <li>Segnalare correttamente eventuali zone di dolore o limitazioni</li>
                <li>Non utilizzare l'app per scopi illegali o non autorizzati</li>
                <li>Non tentare di accedere a dati di altri utenti</li>
                <li>Non interferire con il funzionamento della piattaforma</li>
                <li>Ascoltare il proprio corpo e fermarsi in caso di dolore o disagio</li>
              </ul>
            </section>

            {/* Account */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">6. Account e Registrazione</h2>
              <p className="text-slate-300 leading-relaxed">
                Per accedere alle funzionalità complete di TrainSmart è necessario creare un account.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
                <li>Sei responsabile di mantenere la riservatezza delle tue credenziali</li>
                <li>Devi notificarci immediatamente in caso di accesso non autorizzato</li>
                <li>Possiamo sospendere o terminare account che violano questi termini</li>
                <li>Puoi eliminare il tuo account in qualsiasi momento dalle impostazioni</li>
              </ul>
            </section>

            {/* Abbonamenti */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">7. Abbonamenti e Pagamenti</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                TrainSmart offre piani gratuiti e a pagamento:
              </p>
              <h3 className="text-lg font-medium text-white mb-2">7.1 Piano Gratuito</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Accesso limitato alle funzionalità base dell'app.
              </p>
              <h3 className="text-lg font-medium text-white mb-2">7.2 Piano Premium</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>Gli abbonamenti si rinnovano automaticamente alla scadenza</li>
                <li>Puoi annullare in qualsiasi momento prima del rinnovo</li>
                <li>Non sono previsti rimborsi per periodi parziali</li>
                <li>I prezzi possono essere modificati con preavviso di 30 giorni</li>
              </ul>
              <h3 className="text-lg font-medium text-white mb-2">7.3 Pagamenti</h3>
              <p className="text-slate-300 leading-relaxed">
                I pagamenti sono elaborati tramite Stripe. Non memorizziamo i dati della tua carta di credito.
              </p>
            </section>

            {/* Proprietà intellettuale */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">8. Proprietà Intellettuale</h2>
              <p className="text-slate-300 leading-relaxed">
                Tutti i contenuti di TrainSmart (codice, design, testi, immagini, algoritmi) sono di proprietà
                esclusiva di TrainSmart o dei suoi licenzianti.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
                <li>Non puoi copiare, modificare o distribuire i contenuti dell'app</li>
                <li>Non puoi decompilare o fare reverse engineering del software</li>
                <li>I programmi di allenamento generati sono per uso personale e non commerciale</li>
              </ul>
            </section>

            {/* Limitazione responsabilità */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">9. Limitazione di Responsabilità</h2>
              <p className="text-slate-300 leading-relaxed">
                Nei limiti consentiti dalla legge:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
                <li>TrainSmart è fornito "così com'è" senza garanzie di alcun tipo</li>
                <li>Non garantiamo risultati specifici dall'utilizzo dell'app</li>
                <li>Non siamo responsabili per infortuni derivanti dall'esecuzione degli esercizi</li>
                <li>Non siamo responsabili per interruzioni del servizio o perdita di dati</li>
                <li>La nostra responsabilità massima è limitata all'importo pagato per l'abbonamento</li>
              </ul>
            </section>

            {/* Indennizzo */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">10. Indennizzo</h2>
              <p className="text-slate-300 leading-relaxed">
                Accetti di indennizzare e manlevare TrainSmart da qualsiasi reclamo, danno, costo o spesa
                derivante dalla tua violazione di questi termini o dall'uso improprio del servizio.
              </p>
            </section>

            {/* Risoluzione */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">11. Risoluzione</h2>
              <p className="text-slate-300 leading-relaxed">
                Puoi terminare il tuo account in qualsiasi momento. TrainSmart può sospendere o terminare
                il tuo accesso in caso di violazione dei termini, senza preavviso.
              </p>
            </section>

            {/* Legge applicabile */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">12. Legge Applicabile</h2>
              <p className="text-slate-300 leading-relaxed">
                Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia sarà competente
                il Foro di [Città], salvo diversa disposizione di legge inderogabile a tutela del consumatore.
              </p>
            </section>

            {/* Contatti */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">13. Contatti</h2>
              <p className="text-slate-300 leading-relaxed">
                Per domande sui Termini di Servizio:
              </p>
              <ul className="list-none text-slate-300 space-y-2 mt-4">
                <li>
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:legal@trainsmart.me" className="text-emerald-400 hover:text-emerald-300">
                    legal@trainsmart.me
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
