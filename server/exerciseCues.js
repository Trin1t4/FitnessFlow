// ===== EXERCISE CUES DATABASE =====
// Tassonomia tecnica per TUTTI gli esercizi non guidati
// (Bilanciere, Manubri, Corpo Libero, Kettlebell, Elastici)
// NO macchine (auto-guidate)

export const EXERCISE_CUES = {
  
  // ===== SQUAT VARIANTS =====
  
  'Squat Bilanciere': {
    type: 'barbell',
    difficulty: 'intermediate',
    cues: [
      'Posiziona bilanciere su trapezi superiori (non sul collo)',
      'Piedi larghezza spalle, punte extraruotate 15-30°',
      'Inspira profondamente e blocca core (manovra di Valsalva)',
      'Scendi spingendo ginocchia in fuori, peso su TUTTO IL PIEDE (tripode: tallone + base alluce + base mignolo)',
      'Scendi fino a femore parallelo o oltre (se mobilità lo permette)',
      'Sali mantenendo peso distribuito su tutto il piede, ginocchia allineate con punte',
      'RESPIRAZIONE: Se peso alto, mantieni inspirazione bloccata per TUTTA la rep (giù e su), espira solo in alto completamente esteso'
    ],
    commonMistakes: [
      '❌ Ginocchia che collassano verso interno',
      '❌ Peso solo sui talloni (schiena si alza) o solo sulle punte (ginocchia avanti)',
      '❌ Schiena che si curva (perdita posizione neutra)',
      '❌ Bilanciere sul collo invece che su trapezi',
      '❌ Espirare durante lo sforzo (perdita stabilità core)'
    ],
    safetyNotes: '⚠️ Usa sempre rack con sicure. Test mobilità caviglia prima. Mantieni blocco respiratorio sotto carico.',
    muscleGroups: ['Quadricipiti', 'Glutei', 'Erettori spinali', 'Core']
  },

  'Front Squat': {
    type: 'barbell',
    difficulty: 'advanced',
    cues: [
      'Bilanciere su deltoidi anteriori, gomiti ALTI (paralleli a terra)',
      'Grip "clean" (dita sotto bilanciere) o incrociato (braccia X)',
      'Busto più verticale rispetto a back squat',
      'Inspira e blocca core, mantieni gomiti alti',
      'Scendi mantenendo bilanciere sopra centro piede, peso su TUTTO IL PIEDE',
      'Non lasciar cadere gomiti o bilanciere rotola avanti',
      'Sali mantenendo posizione verticale torso, peso sempre distribuito',
      'RESPIRAZIONE: Mantieni blocco inspiratorio per tutta la rep se carico alto'
    ],
    commonMistakes: [
      '❌ Gomiti che cadono in basso',
      '❌ Bilanciere che rotola sul collo',
      '❌ Busto che si inclina troppo avanti',
      '❌ Peso solo sui talloni (schiena si alza)'
    ],
    safetyNotes: '⚠️ Richiede ottima mobilità polsi e spalle. Progressione da goblet squat.',
    muscleGroups: ['Quadricipiti (enfasi)', 'Core', 'Deltoidi anteriori']
  },

  'Goblet Squat': {
    type: 'dumbbell',
    difficulty: 'beginner',
    cues: [
      'Tieni manubrio/kettlebell verticale davanti al petto, gomiti sotto',
      'Piedi larghezza spalle o poco oltre',
      'Inspira e scendi spingendo ginocchia in fuori',
      'Gomiti passano DENTRO le ginocchia in basso (mobilità)',
      'Mantieni peso vicino al corpo, busto verticale',
      'Peso su TUTTO IL PIEDE (tripode), non solo talloni',
      'Sali spingendo ginocchia fuori, peso distribuito',
      'RESPIRAZIONE: Blocco inspiratorio se carico significativo'
    ],
    commonMistakes: [
      '❌ Peso troppo lontano dal corpo',
      '❌ Schiena curva',
      '❌ Ginocchia che collassano',
      '❌ Peso solo sui talloni'
    ],
    safetyNotes: '✅ Ottimo per imparare pattern squat. Sicuro per principianti.',
    muscleGroups: ['Quadricipiti', 'Glutei', 'Core']
  },

  'Pistol Squat': {
    type: 'bodyweight',
    difficulty: 'advanced',
    cues: [
      'Inizia su una gamba, altra gamba tesa avanti',
      'Braccia avanti per controbilanciamento',
      'Scendi controllato mantenendo gamba libera tesa',
      'Peso su TUTTO IL PIEDE (tripode), ginocchio allineato con punta',
      'Scendi fino a gluteo che tocca polpaccio',
      'Sali mantenendo peso distribuito, core attivo',
      'RESPIRAZIONE: Inspira prima, mantieni blocco durante movimento'
    ],
    commonMistakes: [
      '❌ Ginocchio che cade interno',
      '❌ Peso solo sul tallone (schiena si alza)',
      '❌ Perdita equilibrio (serve mobilità caviglia)',
      '❌ Tallone che si alza da terra'
    ],
    safetyNotes: '⚠️ Progressione: Box pistol → Assisted → Full. Richiede mobilità eccellente.',
    muscleGroups: ['Quadricipiti', 'Glutei', 'Stabilizzatori', 'Core']
  },

  'Squat Tempo 3-1-3': {
    type: 'bodyweight',
    difficulty: 'intermediate',
    cues: [
      'Posizione squat standard (piedi larghezza spalle)',
      'SCENDI in 3 secondi (conta mentalmente: 1-2-3)',
      'PAUSA 1 secondo in basso',
      'SALI in 3 secondi (controllo totale)',
      'NO rimbalzo in basso, movimento fluido continuo',
      'Mantieni tensione muscolare per tutto il TUT'
    ],
    commonMistakes: [
      '❌ Andare troppo veloce (vanifica TUT)',
      '❌ Rimbalzare in basso',
      '❌ Perdere conteggio tempo'
    ],
    safetyNotes: '✅ Focus su Time Under Tension per ipertrofia.',
    muscleGroups: ['Quadricipiti', 'Glutei', 'Endurance muscolare']
  },

  // ===== PANCA / PETTO =====

  'Panca Piana Bilanciere': {
    type: 'barbell',
    difficulty: 'intermediate',
    cues: [
      'Sdraiato su panca, piedi FISSI a terra (leg drive)',
      'Scapole retratte (spalle indietro e giù), petto in fuori',
      'Grip poco oltre larghezza spalle, polsi dritti',
      'Bilanciere parte sopra sterno, non gola',
      'RESPIRAZIONE: Inspira in alto, MANTIENI blocco inspiratorio per tutta la rep (giù e su)',
      'Scendi controllato fino a sfiorare petto (al capezzolo)',
      'Spingi mantenendo blocco, gomiti 45° dal corpo (non 90° aperti)',
      'Espira solo in alto a braccia tese',
      'Mantieni sempre scapole retratte e glutei su panca'
    ],
    commonMistakes: [
      '❌ Gomiti troppo aperti (90°) = stress spalle',
      '❌ Rimbalzare bilanciere sul petto',
      '❌ Glutei che si alzano da panca',
      '❌ Scapole non retratte (spalle che vanno avanti)',
      '❌ Espirare durante la salita (perdita tensione)'
    ],
    safetyNotes: '⚠️ Usa sempre spotter o rack con sicure. Collare obbligatorio. Blocco respiratorio critico.',
    muscleGroups: ['Pettorali', 'Deltoidi anteriori', 'Tricipiti']
  },

  'Panca Inclinata': {
    type: 'barbell',
    difficulty: 'intermediate',
    cues: [
      'Panca inclinata 30-45° (NON oltre, diventa spalle)',
      'Scapole retratte, piedi fissi a terra',
      'Bilanciere scende verso clavicole/parte alta petto',
      'Stesso angolo gomiti (45°) come panca piana',
      'Spingi verso alto E indietro (traiettoria curva)',
      'Maggior enfasi su deltoidi e petto alto'
    ],
    commonMistakes: [
      '❌ Inclinazione oltre 45° (diventa shoulder press)',
      '❌ Bilanciere che scende troppo basso',
      '❌ Perdita retrazione scapolare'
    ],
    safetyNotes: '⚠️ Peso tipicamente 10-15% inferiore a panca piana.',
    muscleGroups: ['Pettorali alto', 'Deltoidi anteriori', 'Tricipiti']
  },

  'Push-up Standard': {
    type: 'bodyweight',
    difficulty: 'beginner',
    cues: [
      'Mani larghezza spalle, dita avanti o leggermente intra-ruotate',
      'Corpo rigido dalla testa ai talloni (plank perfetto)',
      'Gomiti 45° dal corpo durante discesa (NON 90° aperti)',
      'Scendi fino a petto 5cm da terra',
      'Spingi espirando, scapole sempre stabili',
      'NON alzare prima il bacino, tutto il corpo insieme'
    ],
    commonMistakes: [
      '❌ Gomiti troppo aperti (stress spalle)',
      '❌ Bacino che cede (core debole)',
      '❌ Range motion incompleto',
      '❌ Testa che va avanti (mantieni neutrale)'
    ],
    safetyNotes: '✅ Progressione: Wall → Incline → Standard → Decline.',
    muscleGroups: ['Pettorali', 'Deltoidi anteriori', 'Tricipiti', 'Core']
  },

  'Archer Push-up': {
    type: 'bodyweight',
    difficulty: 'advanced',
    cues: [
      'Mani molto larghe (1.5x larghezza spalle)',
      'Scendi spostando peso verso UN lato',
      'Braccio di lavoro: gomito flesso, braccio opposto: quasi teso',
      'Scendi fino a spalla vicina a mano di lavoro',
      'Spingi tornando al centro',
      'Alterna lato o fai serie complete per lato'
    ],
    commonMistakes: [
      '❌ Non spostare abbastanza peso (deve essere UNILATERALE)',
      '❌ Bacino che ruota',
      '❌ Braccio opposto non teso'
    ],
    safetyNotes: '⚠️ Progressione verso one-arm push-up. Richiede forza asimmetrica.',
    muscleGroups: ['Pettorali (unilaterale)', 'Core', 'Stabilizzatori']
  },

  'Pike Push-up': {
    type: 'bodyweight',
    difficulty: 'intermediate',
    cues: [
      'Posizione V invertita (bacino in alto)',
      'Mani e piedi larghezza spalle',
      'Sguardo verso piedi (testa neutra)',
      'Scendi piegando gomiti, testa va verso mani',
      'Gomiti verso avanti (NON ai lati)',
      'Spingi tornando in V, enfasi su spalle'
    ],
    commonMistakes: [
      '❌ Gomiti troppo ai lati',
      '❌ Bacino che scende (diventa push-up normale)',
      '❌ Range motion incompleto'
    ],
    safetyNotes: '⚠️ Progressione verso handstand push-up.',
    muscleGroups: ['Deltoidi', 'Trapezi', 'Tricipiti']
  },

  // ===== STACCO / POSTERIOR CHAIN =====

  'Stacco da Terra': {
    type: 'barbell',
    difficulty: 'advanced',
    cues: [
      'Bilanciere sopra centro piede (a contatto con tibie)',
      'Piedi larghezza anca, grip appena fuori gambe',
      'Inspira, blocca core, schiena NEUTRA (no curva)',
      'Peso su TUTTO IL PIEDE (tripode: tallone + base alluce + base mignolo)',
      'Spingi attraverso tutto il piede, bilanciere scorre su tibie',
      'Estendi anche e ginocchia INSIEME (no segmented pull)',
      'Blocca in alto: spalle indietro, anche completamente estese',
      'Scendi CONTROLLATO mantenendo bilanciere vicino al corpo',
      'RESPIRAZIONE: Mantieni inspirazione bloccata (Valsalva) per TUTTA la rep, espira solo in alto'
    ],
    commonMistakes: [
      '❌ Schiena curva (cifosi lombare) = INFORTUNIO',
      '❌ Bilanciere lontano dal corpo',
      '❌ Tirare con schiena invece che spingere con gambe',
      '❌ Iperestendere schiena in alto (non necessario)',
      '❌ Peso solo sui talloni (schiena si alza prematuramente)'
    ],
    safetyNotes: '⚠️ ESERCIZIO TECNICO. Inizia con peso leggero. Video fondamentale. Blocco respiratorio essenziale.',
    muscleGroups: ['Erettori spinali', 'Glutei', 'Femorali', 'Trapezi', 'Grip']
  },

  'Stacco Rumeno': {
    type: 'barbell',
    difficulty: 'intermediate',
    cues: [
      'Inizia in piedi con bilanciere, ginocchia LEGGERMENTE flesse',
      'Cerniera ANCA (hip hinge): bacino indietro, busto avanti',
      'Schiena SEMPRE neutra, non curvarla',
      'Peso SUI TALLONI (eccezione rispetto a stacco regolare)',
      'Bilanciere scorre su cosce, ginocchia quasi immobili',
      'Scendi fino a sentire stretch femorali (metà tibia)',
      'Torna su estendendo anche, stringi glutei in alto',
      'Focus: femorali e glutei, NON schiena',
      'RESPIRAZIONE: Mantieni blocco inspiratorio per tutta la rep'
    ],
    commonMistakes: [
      '❌ Piegare troppo ginocchia (diventa squat)',
      '❌ Curvare schiena',
      '❌ Andare troppo in basso perdendo posizione neutra',
      '❌ Non sentire stretch femorali',
      '❌ Peso distribuito invece che su talloni'
    ],
    safetyNotes: '✅ Ottimo per imparare hip hinge. Peso inferiore a stacco regolare. Peso SUI TALLONI.',
    muscleGroups: ['Femorali', 'Glutei', 'Erettori spinali']
  },

  'Single Leg RDL': {
    type: 'bodyweight',
    difficulty: 'intermediate',
    cues: [
      'In piedi su una gamba, altra gamba libera',
      'Cerniera anca: busto avanti, gamba libera indietro (linea retta)',
      'Mantieni anche livellate (no rotazione bacino)',
      'Gamba a terra: ginocchio leggermente flesso',
      'Scendi fino a busto parallelo a terra',
      'Torna su contraendo gluteo, equilibrio costante',
      'Focus su controllo, non velocità'
    ],
    commonMistakes: [
      '❌ Bacino che ruota (anche non livellate)',
      '❌ Gamba libera piegata',
      '❌ Perdita equilibrio (normale, progressione graduale)',
      '❌ Busto non parallelo (range incompleto)'
    ],
    safetyNotes: '✅ Ottimo per stabilità e femorali unilaterali. Usa muro se necessario.',
    muscleGroups: ['Femorali (unilaterale)', 'Glutei', 'Core', 'Stabilizzatori']
  },

  'Hip Thrust': {
    type: 'barbell',
    difficulty: 'intermediate',
    cues: [
      'Schiena appoggiata a panca (scapole sul bordo)',
      'Bilanciere su piega anca (usa pad per comfort)',
      'Piedi larghezza anca, piatti a terra',
      'Peso COMPLETAMENTE SUI TALLONI (non tutto piede)',
      'Inspira, spingi talloni e solleva anche',
      'Estendi anche completamente, squeeze glutei in alto',
      'Mento verso petto (evita iperestensione lombare)',
      'Scendi controllato, bilanciere NON tocca terra tra rep',
      'RESPIRAZIONE: Blocco inspiratorio durante spinta se peso alto'
    ],
    commonMistakes: [
      '❌ Peso distribuito su tutto piede (deve essere SUI TALLONI)',
      '❌ Iperestendere schiena invece di anche',
      '❌ Range incompleto (anche non estese)',
      '❌ Bilanciere che rotola (non centrato)',
      '❌ Mento in su (stress lombare)'
    ],
    safetyNotes: '⚠️ PESO SUI TALLONI. Usa pad per bilanciere. Non iperestendere lombare. Focus glutei, non schiena.',
    muscleGroups: ['Glutei (massimo isolamento)', 'Femorali', 'Core']
  },

  'Good Morning': {
    type: 'bodyweight',
    difficulty: 'beginner',
    cues: [
      'In piedi, mani dietro testa (o bilanciere su trapezi per avanzati)',
      'Ginocchia leggermente flesse, fisse',
      'Cerniera anca: bacino indietro, busto avanti',
      'Mantieni schiena neutra, NON curvarla',
      'Scendi fino a busto 45° o parallelo',
      'Torna su spingendo bacino avanti, glutei contratti',
      'Movimento lento e controllato'
    ],
    commonMistakes: [
      '❌ Curvare schiena (pericoloso)',
      '❌ Piegare troppo ginocchia',
      '❌ Andare troppo veloce',
      '❌ Non sentire femorali e glutei lavorare'
    ],
    safetyNotes: '⚠️ Inizia sempre senza peso. Progressione verso barbell good morning.',
    muscleGroups: ['Femorali', 'Glutei', 'Erettori spinali']
  },

  'Nordic Curl': {
    type: 'bodyweight',
    difficulty: 'advanced',
    cues: [
      'Inginocchiato, caviglie bloccate (partner o sotto mobile)',
      'Corpo rigido da ginocchia a testa',
      'Scendi CONTROLLATO in avanti mantenendo corpo dritto',
      'Focus su ECCENTRICA (fase discesa) = 4-5 secondi',
      'Usa mani per attutire quando non controlli più',
      'Spingi con mani per tornare su (o concentrica assistita)',
      'Obiettivo: controllo eccentrico completo'
    ],
    commonMistakes: [
      '❌ Piegare anche (corpo non rigido)',
      '❌ Cadere veloce (no controllo)',
      '❌ Non usare mani (rischio infortunio)',
      '❌ Range troppo corto'
    ],
    safetyNotes: '⚠️ MOLTO INTENSO. Inizia da eccentrico assistito. Crampi femorali comuni.',
    muscleGroups: ['Femorali (eccentrico)', 'Glutei', 'Polpacci']
  },

  // ===== DORSO - VERTICALE =====

  'Trazioni': {
    type: 'bodyweight',
    difficulty: 'advanced',
    cues: [
      'Grip poco oltre larghezza spalle, pollici sopra (overhand)',
      'Partenza: braccia tese, scapole DEPRESSE (non spalle alle orecchie)',
      'RESPIRAZIONE: Inspira prima di iniziare, mantieni blocco per tutta la rep',
      'Inizia movimento SCAPOLE (retrazione), poi piega gomiti',
      'Gomiti vanno verso BASSO e DIETRO (non ai lati)',
      'Sali fino a mento sopra sbarra',
      'Scendi controllato mantenendo blocco, estendi completamente',
      'Espira solo quando braccia sono tese in basso',
      'NO kipping (oscillazione), movimento pulito'
    ],
    commonMistakes: [
      '❌ Spalle che salgono verso orecchie (no scapole attive)',
      '❌ Range incompleto (mento non sopra sbarra)',
      '❌ Kipping (dondolare)',
      '❌ Discesa non controllata',
      '❌ Espirare durante trazione (perdita stabilità)'
    ],
    safetyNotes: '⚠️ Progressione: Negative → Band assisted → Full. Grip strength fondamentale. Blocco respiratorio per controllo.',
    muscleGroups: ['Dorsali', 'Bicipiti', 'Trapezi medi/bassi', 'Core']
  },

  'Inverted Row': {
    type: 'bodyweight',
    difficulty: 'intermediate',
    cues: [
      'Sotto sbarra orizzontale, corpo rigido (plank inverso)',
      'Grip larghezza spalle, talloni a terra (più difficile) o su box',
      'Scapole retratte, tira petto verso sbarra',
      'Gomiti lungo i fianchi, corpo dritto',
      'Petto tocca sbarra, squeeze scapole in alto',
      'Scendi controllato, braccia tese ma scapole sempre attive'
    ],
    commonMistakes: [
      '❌ Bacino che cede',
      '❌ Range incompleto (petto non tocca)',
      '❌ Spalle che vanno avanti (no retrazione)',
      '❌ Muovere solo braccia senza scapole'
    ],
    safetyNotes: '✅ Progressione verso trazioni. Variare altezza sbarra per difficoltà.',
    muscleGroups: ['Dorsali', 'Trapezi', 'Bicipiti', 'Core']
  },

  // ===== DORSO - ORIZZONTALE =====

  'Rematore Bilanciere': {
    type: 'barbell',
    difficulty: 'intermediate',
    cues: [
      'Hip hinge (come stacco), busto 45° parallelo a terra',
      'Grip poco oltre larghezza spalle, overhand o underhand',
      'Ginocchia flesse, schiena neutra, core attivo',
      'RESPIRAZIONE: Inspira, mantieni blocco durante trazione E ritorno',
      'Tira bilanciere verso ombelico/parte bassa sterno',
      'Gomiti lungo i fianchi, squeeze scapole in alto',
      'Bilanciere tocca corpo, pausa, scendi controllato',
      'Espira dopo aver riportato bilanciere giù',
      'Busto FERMO, no oscillazione (cheating)'
    ],
    commonMistakes: [
      '❌ Busto che oscilla (momentum)',
      '❌ Schiena curva',
      '❌ Gomiti troppo aperti',
      '❌ Non toccare corpo con bilanciere',
      '❌ Espirare durante trazione (perdita stabilità)'
    ],
    safetyNotes: '⚠️ Se schiena non tiene posizione, riduci peso. Cintura può aiutare. Blocco respiratorio mantiene schiena stabile.',
    muscleGroups: ['Dorsali', 'Trapezi', 'Erettori', 'Bicipiti']
  },

  'Rematore Manubrio': {
    type: 'dumbbell',
    difficulty: 'beginner',
    cues: [
      'Una mano e ginocchio su panca (supporto)',
      'Altra mano tiene manubrio, braccio teso',
      'Schiena parallela a terra, neutra',
      'Tira manubrio verso anca (non spalla)',
      'Gomito lungo il fianco, rotazione minima torso',
      'Squeeze in alto, scendi controllato',
      'Mantieni spalle livellate (no rotazione bacino)'
    ],
    commonMistakes: [
      '❌ Ruotare troppo il torso',
      '❌ Tirare verso spalla invece che anca',
      '❌ Spalle non livellate',
      '❌ Range incompleto'
    ],
    safetyNotes: '✅ Ottimo per correggere asimmetrie. Alternativa a rematore bilanciere.',
    muscleGroups: ['Dorsali (unilaterale)', 'Trapezi', 'Bicipiti']
  },

  'Plank Row': {
    type: 'bodyweight',
    difficulty: 'intermediate',
    cues: [
      'Posizione plank standard (alta, su mani)',
      'Piedi larghi per stabilità',
      'Solleva una mano da terra portando gomito indietro',
      'Ruota MINIMA del torso, mantieni anche livellate',
      'Mano sale verso costola, squeeze scapola',
      'Ritorna mano a terra controllato',
      'Alterna o fai serie per lato'
    ],
    commonMistakes: [
      '❌ Anche che ruotano (instabilità core)',
      '❌ Piedi troppo stretti (perdita equilibrio)',
      '❌ Range troppo corto',
      '❌ Velocità eccessiva (momentum)'
    ],
    safetyNotes: '✅ Ottimo per core + dorsali. Anti-rotazione importante.',
    muscleGroups: ['Dorsali', 'Core (anti-rotazione)', 'Obliqui']
  },

  // ===== SPALLE =====

  'Military Press Bilanciere': {
    type: 'barbell',
    difficulty: 'intermediate',
    cues: [
      'In piedi, bilanciere su clavicole/parte alta petto',
      'Grip poco oltre larghezza spalle',
      'Gomiti leggermente avanti (non ai lati)',
      'Core contratto, glutei stretti, NO iperestensione schiena',
      'RESPIRAZIONE: Inspira, mantieni blocco per tutta la rep (su e giù)',
      'Spingi verticale, testa indietro per far passare bilanciere',
      'Blocca sopra testa, spalle alle orecchie',
      'Scendi controllato, bilanciere torna a clavicole',
      'Espira solo quando bilanciere è tornato giù'
    ],
    commonMistakes: [
      '❌ Iperestendere schiena (pericoloso)',
      '❌ Gomiti troppo ai lati',
      '❌ Non portare bilanciere abbastanza in alto',
      '❌ Spingere avanti invece che su (traiettoria scorretta)',
      '❌ Espirare durante spinta (perdita stabilità core)'
    ],
    safetyNotes: '⚠️ Mobilità spalle fondamentale. Cintura può aiutare stabilità. Blocco respiratorio protegge colonna.',
    muscleGroups: ['Deltoidi', 'Tricipiti', 'Trapezi superiori', 'Core']
  },

  'Military Press Manubri': {
    type: 'dumbbell',
    difficulty: 'beginner',
    cues: [
      'Seduto o in piedi, manubri all\'altezza spalle',
      'Gomiti sotto manubri, palmi avanti o neutri',
      'Core attivo, spingi manubri verso alto',
      'Convergi leggermente in alto (no collisione)',
      'Blocca con bicipiti vicini a orecchie',
      'Scendi controllato, manubri ritornano a spalle',
      'Range completo, no rimbalzo in basso'
    ],
    commonMistakes: [
      '❌ Schiena che si iperestende',
      '❌ Asimmetria (un manubrio più alto)',
      '❌ Range incompleto',
      '❌ Momentum (buttare peso su)'
    ],
    safetyNotes: '✅ Più sicuro di bilanciere, permette range naturale.',
    muscleGroups: ['Deltoidi', 'Tricipiti', 'Stabilizzatori']
  },

  'Handstand Push-up': {
    type: 'bodyweight',
    difficulty: 'expert',
    cues: [
      'Verticale contro muro (calcagni a muro)',
      'Mani larghezza spalle, dita leggermente intra-ruotate',
      'Corpo completamente dritto, core attivo',
      'Scendi controllato fino a testa quasi a terra',
      'Spingi espirando, blocca in alto',
      'Mantieni equilibrio, no oscillazione',
      'Inizia con negative o pike push-up'
    ],
    commonMistakes: [
      '❌ Gomiti troppo aperti',
      '❌ Corpo banana (core debole)',
      '❌ Range incompleto (testa non vicina a terra)',
      '❌ Perdita equilibrio (progressione necessaria)'
    ],
    safetyNotes: '⚠️ MOLTO AVANZATO. Progressione: Pike → Box HSPU → Negative → Full.',
    muscleGroups: ['Deltoidi', 'Tricipiti', 'Core', 'Equilibrio']
  },

  'Alzate Laterali Manubri': {
    type: 'dumbbell',
    difficulty: 'beginner',
    cues: [
      'In piedi, manubri ai fianchi, palmi verso interno',
      'Gomiti leggermente flessi (10-15°), FISSI',
      'Solleva manubri ai lati fino a spalle parallele a terra',
      'Versare acqua: ruota polsi leggermente (mignolo su)',
      'Pausa in alto, contrai deltoidi',
      'Scendi controllato (2-3 sec), no drop',
      'NO momentum, movimento puro deltoidi'
    ],
    commonMistakes: [
      '❌ Usare momentum (dondolare)',
      '❌ Alzare troppo (oltre parallelo = trapezi)',
      '❌ Gomiti che flettono/estendono (isolamento perso)',
      '❌ Peso eccessivo (compromette forma)'
    ],
    safetyNotes: '✅ Peso LEGGERO. Focus su contrazione, non peso mosso.',
    muscleGroups: ['Deltoidi laterali', 'Trapezi superiori']
  },

  // ===== TRICIPITI =====

  'Dips': {
    type: 'bodyweight',
    difficulty: 'intermediate',
    cues: [
      'Su parallele o rings, corpo sospeso',
      'Braccia tese, scapole depresse',
      'Inclinati leggermente avanti (enfasi petto) o verticale (enfasi tricipiti)',
      'Scendi piegando gomiti fino a 90° o oltre',
      'Gomiti vicini al corpo (no aperti ai lati)',
      'Spingi estendendo braccia, squeeze tricipiti in alto',
      'Mantieni core attivo, no oscillazione'
    ],
    commonMistakes: [
      '❌ Gomiti troppo aperti (stress spalle)',
      '❌ Scendere troppo (stress spalle)',
      '❌ Spalle che salgono (non depresse)',
      '❌ Oscillare (kipping)'
    ],
    safetyNotes: '⚠️ Mobilità spalle importante. Band assisted se necessario.',
    muscleGroups: ['Tricipiti', 'Pettorali bassi', 'Deltoidi anteriori']
  },

  'Diamond Push-up': {
    type: 'bodyweight',
    difficulty: 'intermediate',
    cues: [
      'Posizione push-up, mani sotto petto a formare diamante',
      'Pollici e indici si toccano',
      'Corpo rigido, gomiti lungo i fianchi',
      'Scendi fino a petto tocca mani',
      'Spingi estendendo braccia, focus tricipiti',
      'Mantieni posizione mani sotto petto (non avanti)'
    ],
    commonMistakes: [
      '❌ Gomiti che vanno ai lati',
      '❌ Mani troppo avanti',
      '❌ Range incompleto',
      '❌ Bacino che cede'
    ],
    safetyNotes: '✅ Progressione: Standard push-up → Close grip → Diamond.',
    muscleGroups: ['Tricipiti', 'Pettorali interni', 'Deltoidi']
  },

  // ===== BICIPITI =====

  'Curl Bilanciere': {
    type: 'barbell',
    difficulty: 'beginner',
    cues: [
      'In piedi, bilanciere grip underhand, mani larghezza spalle',
      'Gomiti FISSI ai fianchi (no movimento)',
      'Curl bilanciere verso spalle, solo avambracci si muovono',
      'Squeeze bicipiti in alto, pausa',
      'Scendi controllato (3 sec), estendi completamente',
      'NO oscillazione corpo (strict form)'
    ],
    commonMistakes: [
      '❌ Dondolare corpo (momentum)',
      '❌ Gomiti che vanno avanti/dietro',
      '❌ Range incompleto (no estensione completa)',
      '❌ Polsi che si piegano (tenere dritti)'
    ],
    safetyNotes: '✅ Inizia leggero. EZ bar per ridurre stress polsi.',
    muscleGroups: ['Bicipiti', 'Brachiali', 'Avambracci']
  },

  'Curl Manubri': {
    type: 'dumbbell',
    difficulty: 'beginner',
    cues: [
      'In piedi o seduto, manubri ai fianchi, palmi neutri',
      'Gomiti fissi, curl un manubrio per volta o insieme',
      'Supina polso durante salita (palmo finisce su)',
      'Squeeze bicipiti in alto, pausa',
      'Scendi controllato pronando polso (torna neutro)',
      'Alterna o simultaneo'
    ],
    commonMistakes: [
      '❌ Momentum',
      '❌ Gomiti che si muovono',
      '❌ No supinazione (perdi contrazione)',
      '❌ Drop veloce (perdi eccentrica)'
    ],
    safetyNotes: '✅ Permette maggior range e supinazione vs bilanciere.',
    muscleGroups: ['Bicipiti', 'Brachiali']
  },

  // ===== CORE =====

  'Plank': {
    type: 'bodyweight',
    difficulty: 'beginner',
    cues: [
      'Avambracci a terra, gomiti sotto spalle',
      'Corpo RIGIDO dalla testa ai talloni',
      'Core contratto (ombelico verso colonna)',
      'Glutei contratti, NO bacino che cede',
      'Sguardo a terra (collo neutrale)',
      'Respira normalmente, mantieni tensione',
      'Obiettivo: tempo sotto tensione, non durata con forma scadente'
    ],
    commonMistakes: [
      '❌ Bacino che cede (lordosi)',
      '❌ Bacino troppo alto (perdita tensione core)',
      '❌ Spalle che vanno avanti (gomiti non sotto spalle)',
      '❌ Trattenere respiro'
    ],
    safetyNotes: '✅ Base per tutti esercizi core. Qualità > durata.',
    muscleGroups: ['Retto addominale', 'Trasverso', 'Erettori', 'Glutei']
  },

  'Dead Bug': {
    type: 'bodyweight',
    difficulty: 'beginner',
    cues: [
      'Sdraiato supino, lombare PIATTA a terra',
      'Braccia tese verso soffitto, ginocchia 90°',
      'Estendi braccio e gamba opposti (destra + sinistra)',
      'Mantieni lombare a terra (NO spazio sotto)',
      'Ritorna e alterna',
      'Movimento lento e controllato',
      'Espira durante estensione'
    ],
    commonMistakes: [
      '❌ Lombare che si alza (perdi anti-estensione)',
      '❌ Movimento troppo veloce',
      '❌ Braccia/gambe non estese completamente',
      '❌ Trattenere respiro'
    ],
    safetyNotes: '✅ Ottimo per imparare anti-estensione core. Regressione di molti esercizi.',
    muscleGroups: ['Core (anti-estensione)', 'Stabilizzatori spalla']
  },

  'Hollow Body Hold': {
    type: 'bodyweight',
    difficulty: 'intermediate',
    cues: [
      'Sdraiato supino, lombare INCOLLATA a terra',
      'Solleva spalle e gambe da terra (pochi cm)',
      'Braccia tese sopra testa o lungo i fianchi',
      'Corpo a forma "C", ombelico schiacciato a terra',
      'Mantieni lombare a terra, respira',
      'Tempo sotto tensione, no oscillazione'
    ],
    commonMistakes: [
      '❌ Lombare che si alza (compenso pericoloso)',
      '❌ Gambe troppo alte (più facile, meno efficace)',
      '❌ Trattenere respiro',
      '❌ Spalle troppo alte (usa core, non collo)'
    ],
    safetyNotes: '⚠️ Se lombare si alza, piega ginocchia. Progressione verso ginnastica.',
    muscleGroups: ['Retto addominale', 'Hip flexors', 'Serratus']
  },

  // ===== ELASTICI =====

  'Band Pull-Apart': {
    type: 'band',
    difficulty: 'beginner',
    cues: [
      'In piedi, elastico davanti al petto, braccia tese',
      'Grip larghezza spalle',
      'Tira elastico aprendo braccia ai lati',
      'Squeeze scapole in fuori (retrazione massima)',
      'Mantieni braccia all\'altezza spalle',
      'Ritorna controllato, mantieni tensione elastico',
      'NO compensation con corpo'
    ],
    commonMistakes: [
      '❌ Braccia che salgono/scendono',
      '❌ Corpo che si inclina',
      '❌ Range incompleto (no squeeze scapole)',
      '❌ Perdita tensione elastico al ritorno'
    ],
    safetyNotes: '✅ Ottimo per attivazione scapole, postura, riscaldamento.',
    muscleGroups: ['Trapezi medi', 'Deltoidi posteriori', 'Romboidi']
  },

  'Band Lateral Raise': {
    type: 'band',
    difficulty: 'beginner',
    cues: [
      'In piedi su elastico, estremità in mani',
      'Stessa meccanica alzate laterali manubri',
      'Tira elastico ai lati fino a parallelo',
      'Controllo eccentrica importante (tensione costante)',
      'No momentum, movimento puro deltoidi',
      'Respira, mantieni core attivo'
    ],
    commonMistakes: [
      '❌ Elastico troppo corto (troppo difficile)',
      '❌ Perdita forma (compensi)',
      '❌ Andare oltre parallelo',
      '❌ Velocità eccessiva'
    ],
    safetyNotes: '✅ Ottimo per alto volume senza stress articolare.',
    muscleGroups: ['Deltoidi laterali', 'Trapezi']
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Recupera cue tecnici per un esercizio
 */
export function getExerciseCues(exerciseName) {
  // Exact match
  if (EXERCISE_CUES[exerciseName]) {
    return EXERCISE_CUES[exerciseName];
  }

  // Partial match (es. "Squat Bilanciere 5x5" → "Squat Bilanciere")
  for (const [key, value] of Object.entries(EXERCISE_CUES)) {
    if (exerciseName.includes(key)) {
      return value;
    }
  }

  // Fallback per esercizi senza cue (macchine)
  return {
    type: 'machine',
    difficulty: 'beginner',
    cues: ['Segui le indicazioni della macchina'],
    commonMistakes: [],
    safetyNotes: '✅ Esercizio guidato, segui il percorso della macchina.',
    muscleGroups: ['Vari']
  };
}

/**
 * Check se esercizio richiede tassonomia (NO macchine)
 */
export function requiresCues(exerciseName) {
  const machineKeywords = [
    'machine', 'press', 'leg press', 'chest press', 
    'lat machine', 'cable', 'smith', 'hack squat'
  ];

  const lower = exerciseName.toLowerCase();
  
  // Se contiene keyword macchine → NO cue
  for (const keyword of machineKeywords) {
    if (lower.includes(keyword) && 
        !lower.includes('military press') && 
        !lower.includes('push')) {
      return false;
    }
  }

  return true;
}

/**
 * Formatta cue per UI
 */
export function formatCuesForUI(cues) {
  if (!cues || !cues.cues) return null;

  return {
    title: `Come eseguire correttamente`,
    steps: cues.cues.map((cue, i) => `${i + 1}. ${cue}`),
    mistakes: cues.commonMistakes?.length > 0 ? {
      title: 'Errori comuni da evitare',
      items: cues.commonMistakes
    } : null,
    safety: cues.safetyNotes ? {
      title: 'Note di sicurezza',
      text: cues.safetyNotes
    } : null,
    muscles: cues.muscleGroups ? {
      title: 'Muscoli coinvolti',
      list: cues.muscleGroups
    } : null,
    difficulty: cues.difficulty
  };
}
