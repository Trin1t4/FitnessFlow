# Test del Flusso Completo - TrainSmart

## Flusso Utente Corretto

### 1. Landing Page (/)
- Mostra hero section con TrainSmart branding
- CTA "Inizia Ora" -> `/onboarding`
- CTA "Ho già un account" -> `/login`
- Features: Assessment completo, Programma personalizzato, Progressione intelligente

### 2. Onboarding (/onboarding)
6 step progressivi:
1. Personal Info (età, peso, altezza, genere)
2. Photo Analysis (opzionale body composition)
3. Location (gym/home)
4. Activity Level (frequenza, durata sessioni)
5. Goal (forza, massa, definizione, resistenza, motor_recovery)
6. Pain Areas (eventuali dolori)

**Salvataggio:**
- localStorage: `onboarding_data`
- Supabase: `user_profiles.onboarding_data`

**Navigation:**
- Se goal = motor_recovery -> `/recovery-screening`
- Altrimenti -> `/quiz`

### 3. Quiz Teorico (/quiz)
5 domande su biomeccanica base:
- Squat
- Scapole durante spinte
- Progressione
- Trazioni
- Ripetizioni in riserva

**Scoring:**
- Score: 0-100%
- Level stimato: beginner (<50%), intermediate (50-79%), advanced (80%+)

**Salvataggio:**
- localStorage: `quiz_data` con { score, level, answers, completedAt }

**Navigation:**
- Sempre -> `/screening`

### 4. Screening Pratico (/screening)
5 test pratici di movimento:
1. Squat Assessment (qualità movimento)
2. Plank Hold (core stability)
3. Push-Pull Balance (controllo movimenti)
4. Single Leg Balance (stabilità unilaterale)
5. Mobility Check (flessibilità)

**Scoring:**
- Ogni test: 1-3 punti
- Practical Score: media su scala 0-100%
- Physical Score: 65% (placeholder da body composition)

**Final Score Calculation:**
```
finalScore = (quizScore * 0.5) + (practicalScore * 0.3) + (physicalScore * 0.2)
```

**Level Determination:**
- beginner: < 55%
- intermediate: 55-74%
- advanced: >= 75%

**Salvataggio:**
- localStorage: `screening_data` con {level, finalScore, quizScore, practicalScore, physicalScore, practicalResults, completed, timestamp}

**Navigation:**
- Sempre -> `/dashboard`

### 5. Dashboard (/dashboard)
Mostra:
- Status cards: Onboarding, Quiz, Screening (con check/alert icons)
- Profilo utente: Livello, Goal, Location, Score finale
- Bottone "Genera Programma Personalizzato"

**Generazione Programma:**
- Legge dati da: onboarding_data, quiz_data, screening_data
- Genera programma locale basato su:
  - Level (beginner/intermediate/advanced)
  - Goal (strength/muscle_gain/fat_loss/endurance)
  - Location (gym/home)
  - Frequency (giorni/settimana)

**Programma generato include:**
- Name
- Split (Full Body, Upper/Lower, Push/Pull/Legs)
- Exercises array con serie x reps
- Total weeks (8)
- Notes con score breakdown

**Salvataggio:**
- localStorage: `currentProgram`

**Navigation:**
- "Inizia Allenamento" -> `/workout`

### 6. Workout (/workout)
- Visualizza programma
- Bottone per iniziare sessione -> `/workout-session`

## Problemi Risolti

### PROBLEMA 1: Loop di Navigazione ✅ FIXED
**Causa:** `Screening.tsx` navigava a `/assessment-gym` e `/assessment-home` (route NON esistenti)
**Fix:** Rimosso routing a route inesistenti, ora naviga direttamente a `/dashboard`

### PROBLEMA 2: ScreeningFlow Vuoto ✅ FIXED
**Causa:** Componente era un placeholder senza logica
**Fix:** Implementato sistema completo di 5 test pratici con scoring e calcolo livello

### PROBLEMA 3: Dati Inconsistenti ✅ FIXED
**Causa:** Quiz salvava `level` ma Dashboard cercava `screening.level`
**Fix:** ScreeningFlow ora calcola e salva il livello finale basato su tutti i dati

### PROBLEMA 4: Landing e Login migliorati ✅ FIXED
**Causa:** Landing troppo semplice, Login non controllava onboarding
**Fix:**
- Landing con hero section e features chiare
- Login controlla localStorage per routing intelligente

## Test Manuale da Eseguire

1. **Test completo nuovo utente:**
   - Vai a http://localhost:5173/
   - Click "Inizia Ora"
   - Completa onboarding (6 step)
   - Completa quiz (5 domande)
   - Completa screening (5 test)
   - Verifica arrivo a dashboard con dati corretti
   - Genera programma
   - Verifica programma generato corretto per livello

2. **Test Reset e Rigenerazione:**
   - In dashboard, click "Reset" -> "Reset Profondo"
   - Verifica pulizia localStorage e redirect a onboarding
   - Riprova flusso completo

3. **Test Quick Test:**
   - In dashboard, click "Reset" -> "Test Veloce"
   - Prova Principiante, Intermedio, Avanzato
   - Verifica programmi diversi per ogni livello

## Note Implementazione

- **localStorage keys usate:**
  - `onboarding_data`: dati personali + preferences
  - `quiz_data`: risultati quiz teorico
  - `screening_data`: risultati screening pratico + livello finale
  - `currentProgram`: programma generato
  - `userId`: id utente temporaneo

- **Supabase tables (quando auth attivo):**
  - `user_profiles.onboarding_data`
  - `assessments`
  - `training_programs`

- **API endpoints:**
  - `/api/program-generate`: genera programmi (attualmente non usato, generazione locale)
  - `/api/health`: health check
  - Altri endpoints presenti ma non nel flusso principale

## Prossimi Miglioramenti Consigliati

1. **Body Composition Integration:**
   - Usare i dati da PhotoAnalysisStep
   - Calcolare physicalScore reale invece del placeholder 65%

2. **API Integration:**
   - Sostituire generazione locale con API `/api/program-generate`
   - Salvare dati in Supabase invece che solo localStorage

3. **Workout Tracking:**
   - Implementare `/workout-session` completo
   - Salvare progressi allenamenti
   - Adattare programma basato su performance

4. **Recovery Flow:**
   - Implementare `/recovery-screening` per motor_recovery goal
   - Programmi specifici per riabilitazione

5. **Testing:**
   - Aggiungere unit tests per scoring logic
   - E2E tests per flusso completo
   - Validation dei dati in ogni step
