# TrainSmart v2.0 - Documentazione Completa

## Panoramica del Progetto

**TrainSmart** è un'applicazione fitness intelligente che fornisce programmi di allenamento personalizzati basati su principi scientifici. L'app offre piani personalizzati per vari obiettivi (perdita peso, ipertrofia, forza, endurance, toning, performance sportiva, disabilità motoria, gravidanza), livelli di esperienza, attrezzatura disponibile e condizioni specifiche.

### Caratteristiche Principali

- **Personalizzazione Intelligente**: Programmi generati dinamicamente in base a screening, assessment 1RM e feedback real-time
- **ADAPTFLOW™ 2.0**: Sistema di selezione esercizi adattivo con varianti gym/home/bodyweight e fallback intelligenti
- **Sistema di Sicurezza**: Filtri automatici per gravidanza, disabilità e aree di dolore con sostituzioni sicure
- **Progressione Scientifica**: Wave loading, ondulazione settimanale/giornaliera basata su livello utente
- **Calcolo 1RM**: Formula di Brzycki per assessment muscolare accurato
- **Tracking Avanzato**: RPE, volume, statistiche settimanali, record personali, ADAPTFLOW™ per compensare carichi insufficienti
- **Sistema di Abbonamento**: 3 tier (Base €19.90, Premium €29.90, Elite €39.90) con aumento automatico dopo 6 mesi

---

## Stack Tecnologico

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Wouter** per routing
- **TanStack Query v5** per gestione stato server
- **Tailwind CSS** + **shadcn/ui** per UI/UX
- **Dark mode** supportato
- **Recharts** per grafici statistiche

### Backend
- **Express.js** + **TypeScript**
- **Replit Auth** (Google, GitHub, Email/Password)
- **PostgreSQL** (Neon) + **Drizzle ORM**
- **express-session** con PostgreSQL store
- **Zod** per validazione dati
- **Rate limiting** e CORS configurati

### Database (PostgreSQL)
- **Drizzle ORM** per type-safety
- Schema completo con relazioni cascade
- Migrations gestite con `npm run db:push`

---

## Architettura Database

### Tabelle Principali

#### `users`
```typescript
- id (varchar, UUID)
- email (varchar, unique)
- subscriptionTier (varchar): "base" | "premium" | "elite"
- subscriptionStatus (varchar): "active" | "inactive" | "cancelled"
- subscriptionStartDate (timestamp)
- subscriptionId (varchar) // Stripe subscription ID
- aiCorrectionsUsed (integer, default 0)
- lastAiCorrectionDate (timestamp)
- createdAt, updatedAt
```

#### `screenings` (Onboarding utente)
```typescript
- id (varchar, UUID)
- userId (FK → users.id)
- goal (varchar): "weight_loss" | "muscle_gain" | "strength" | "endurance" | "toning" | "general" | "performance" | "disability" | "pregnancy"
- objectiveType (varchar): "fitness" | "rehab" | "performance"
- sportType, sportRole (varchar): per performance
- specificBodyParts (jsonb): array per toning/muscle_gain
- disabilityType (varchar): tipo disabilità motoria
- pregnancyWeek (integer 1-40): settimana gestazione
- pregnancyTrimester (integer 1-3): trimestre calcolato
- hasDoctorClearance (boolean): autorizzazione medica
- pregnancyComplications (jsonb): array complicazioni
- bodyWeight (decimal)
- level (varchar): "beginner" | "intermediate" | "advanced"
- location (varchar): "gym" | "home" | "mixed"
- hasGym (boolean)
- equipment (jsonb): { barbell, dumbbellMaxKg, kettlebellKg[], bands, pullupBar, bench }
- frequency (integer): giorni/settimana (2-6)
- painAreas (jsonb): array aree dolore
- preferredSplit (varchar): "full_body" | "upper_lower" | "ppl"
- createdAt
```

#### `programs` (Programmi generati)
```typescript
- id (varchar, UUID)
- userId (FK → users.id)
- name, description (varchar/text)
- split (varchar): "full_body" | "upper_lower" | "ppl"
- daysPerWeek (integer)
- weeklySchedule (jsonb): array giorni allenamento
- progression (varchar): "wave_loading" | "ondulata_settimanale" | "ondulata_giornaliera"
- includesDeload (boolean): se include deload
- deloadFrequency (integer): ogni quante settimane (es. 4)
- totalWeeks (integer): durata programma
- requiresEndCycleTest (boolean): se richiede test finale
- isActive (boolean)
- createdAt, updatedAt
```

#### `assessments` (Test 1RM)
```typescript
- id (varchar, UUID)
- userId (FK → users.id)
- exerciseName (varchar)
- weight (varchar): peso decimale
- reps (integer)
- oneRepMax (varchar): calcolato con Brzycki
- notes (text)
- createdAt
```

#### `workouts` (Sessioni allenamento)
```typescript
- id (varchar, UUID)
- userId (FK → users.id)
- programId (FK → programs.id)
- dayName (varchar)
- status (varchar): "in_progress" | "completed" | "skipped"
- startedAt, completedAt (timestamp)
- duration (integer): minuti
- totalVolume (decimal): kg totali
- sleepHours (varchar)
- energyLevel (integer 1-10)
- painLevel (integer 0-10)
- painLocation (varchar)
- preWorkoutNotes, postWorkoutNotes (text)
```

#### `workoutSets` (Serie eseguite)
```typescript
- id (varchar, UUID)
- workoutId (FK → workouts.id)
- exerciseName (varchar)
- setNumber (integer)
- reps (integer)
- weight (varchar)
- rpe (integer 1-10): Rate of Perceived Exertion
- isWarmup (boolean)
- notes (text)
- createdAt
```

#### `workoutAdaptations` (Adattamenti temporanei)
```typescript
- id (varchar, UUID)
- userId (FK → users.id)
- programId (FK → programs.id)
- dayName (varchar)
- adaptedLocation (varchar): "home" | "homeBodyweight"
- adaptedEquipment (jsonb)
- adaptedExercises (jsonb): esercizi sostituiti
- expiresAt (timestamp): 24h dalla creazione
- usedAt (timestamp)
- createdAt
```

---

## Logica di Generazione Programmi

### File Chiave: `server/programGenerator.ts`

#### 1. **Calcolo 1RM (Formula Brzycki)**
```typescript
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps)); // Brzycki formula
}
```

#### 2. **Determinazione Split**
```typescript
if (frequency <= 3) → "full_body"
if (frequency === 4) → "upper_lower"
if (frequency >= 5) → "ppl" (Push/Pull/Legs)
```

#### 3. **Progressione per Livello**
```typescript
"beginner" → "wave_loading" (2-3-4 serie)
"intermediate" → "ondulata_settimanale"
"advanced" → "ondulata_giornaliera"
```

#### 4. **Deload e Durata Programmi**
```typescript
// Deload ogni 4 settimane per intermediate/advanced
includesDeload = level === "intermediate" || level === "advanced"
deloadFrequency = 4

// Durata per goal
totalWeeks:
  - strength: 8 settimane (con test finale)
  - muscle_gain: 12 settimane (con test finale)
  - performance: 8 settimane (con test finale)
  - pregnancy: 4 settimane (cicli brevi per monitoraggio)
  - disability: 6 settimane
  - altri: 4 settimane

requiresEndCycleTest = goal in ["strength", "muscle_gain", "performance"]
```

#### 5. **Sistema ADAPTFLOW™ 2.0**

**Selezione Esercizi con Fallback**:
```typescript
// Priorità: gym → home con attrezzi → bodyweight
function createExercise(name, location, hasGym, equipment, baseLoad, level, goal, type) {
  1. Controlla safety (pregnancy/disability/pain)
  2. Se gym: esercizio standard
  3. Se home: cerca variante home con attrezzi disponibili
  4. Se mancano attrezzi: variante bodyweight
  5. Calcola sets/reps per livello
  6. Applica load con ADAPTFLOW™ se insufficiente
}
```

**ADAPTFLOW™ Compensation**:
```typescript
// Se peso disponibile < peso richiesto
if (availableWeight < targetWeight) {
  compensation = {
    type: "tempo" | "pause" | "dropset" | "cluster"
    value: calculatedIntensity
  }
}
```

#### 6. **Esercizi Sicuri per Gravidanza (Per Trimestre)**

```typescript
const PREGNANCY_SAFE_EXERCISES_BY_TRIMESTER = {
  1: { // Trimestre 1 (settimane 1-13)
    safe: ["Goblet Squat", "Incline Press", "Row", "Hip Thrust", "Lat Pulldown"],
    loadMultiplier: 0.55, // 50-60% 1RM
    avoid: ["Salti", "Esercizi ad alto impatto"]
  },
  2: { // Trimestre 2 (settimane 14-27)
    safe: ["Squat", "Standing Press", "Row", "Hip Thrust", "Leg Press"],
    loadMultiplier: 0.45, // 40-50% 1RM
    avoid: ["Esercizi supini", "Core compression", "Torsioni"]
  },
  3: { // Trimestre 3 (settimane 28-40)
    safe: ["Box Squat", "Standing Cable Press", "Supported Row", "Pelvic Floor", "Mobilità"],
    loadMultiplier: 0.35, // 30-40% 1RM
    avoid: ["Esercizi supini", "Carichi pesanti", "Posizioni prone"]
  }
}

function isExerciseSafeForPregnancy(exerciseName, trimester) {
  // Controlla supine (vietato da T2)
  if (trimester >= 2 && isSupinePosition(exerciseName)) return false;
  // Verifica se esercizio in lista safe per trimestre
  return PREGNANCY_SAFE_EXERCISES_BY_TRIMESTER[trimester].safe.includes(exerciseName);
}
```

#### 7. **Esercizi Sicuri per Disabilità**

```typescript
const DISABILITY_SAFE_EXERCISES = {
  "paraplegia": ["Bench Press", "Row Seduto", "Shoulder Press Seduto", "Cable Exercises"],
  "emiplegia": ["Single-Arm", "Esercizi assistiti", "Cable unilaterali"],
  "amputazione_arto_inferiore": ["Upper body", "Core", "Leg Press unilaterale"],
  // ... altri
}

function isExerciseSafeForDisability(exerciseName, disabilityType) {
  return DISABILITY_SAFE_EXERCISES[disabilityType]?.includes(exerciseName);
}
```

---

## API Endpoints Principali

### Autenticazione
- `GET /api/auth/login` - Redirect a Replit Auth
- `GET /api/auth/callback` - Callback OAuth
- `GET /api/auth/user` - Ottieni user corrente
- `POST /api/auth/logout` - Logout

### Screening & Onboarding
- `POST /api/screening` - Salva screening (validazione Zod con campi pregnancy)
- `GET /api/screening/latest` - Ultimo screening utente
- `POST /api/quiz` - Salva quiz biomeccanico
- `POST /api/assessment` - Salva assessment 1RM
- `GET /api/assessments/latest` - Ultimi assessments

### Programmi
- `POST /api/program/generate` - Genera programma da screening/assessments
- `GET /api/program/active` - Programma attivo
- `GET /api/programs` - Tutti i programmi utente
- `POST /api/program/:programId/day/:dayName/adapt` - Adatta workout per location
- `POST /api/program/recalibrate` - Ricalibra dopo pausa (detraining factor)

### Workout
- `POST /api/workout/start` - Inizia workout
- `GET /api/workout/active` - Workout in corso
- `POST /api/workout/:id/set` - Salva serie
- `POST /api/workout/:id/complete` - Completa workout
- `POST /api/workout/:id/skip` - Salta workout

### Stats & Progress
- `GET /api/stats/weekly?weeks=12` - Progresso settimanale
- `GET /api/stats/records` - Record personali

### Payments
- `POST /api/payment/create` - Crea payment intent (Stripe/PayPal)
- `POST /api/payment/confirm` - Conferma pagamento
- `GET /api/subscription/status` - Stato abbonamento

---

## Flusso Utente Completo

### 1. Landing & Pricing
- Utente vede landing page con features
- 3 card prezzi: Base, Premium (con badge), Elite
- Click "Inizia Ora" → Login con Replit Auth

### 2. Onboarding (ScreeningFlow)

**Step 1: Goal**
- Selezione obiettivo: weight_loss, muscle_gain, strength, endurance, toning, performance, disability, pregnancy

**Step 2: Obiettivi Specifici** (se toning/muscle_gain)
- Multi-select parti corpo: upper_chest, arms, shoulders, back_width, back_thickness, legs, glutes, abs, calves

**Step 3: Info Sport** (se performance)
- Tipo sport, ruolo specifico

**Step 4: Info Disabilità** (se disability)
- Tipo disabilità motoria

**Step 5: Info Gravidanza** (se pregnancy)
- Slider settimana gestazione (1-40) → auto-calcola trimestre
- Checkbox autorizzazione medica (required)
- Multi-select complicazioni (optional)

**Step 6: Dati Fisici**
- Peso corporeo, livello esperienza

**Step 7: Location & Equipment**
- Palestra/casa, attrezzatura disponibile

**Step 8: Frequenza**
- Giorni/settimana (2-6)

**Step 9: Pain Areas**
- Aree dolore/infortuni (optional)

### 3. Quiz Biomeccanico
- Domande su biomeccanica/tecnica
- Difficoltà basata su livello screening

### 4. Assessment (10RM Test)
- 4 esercizi base: Squat, Panca, Stacco, Trazioni
- Input peso e reps eseguite
- Calcolo 1RM con Brzycki

### 5. Generazione Programma
- Backend chiama `generateProgram()` con tutti i parametri
- Determina split, progressione, deload, durata
- Filtra esercizi per safety (pregnancy/disability/pain)
- Aggiunge esercizi specifici per body parts
- Salva programma con metadata completo

### 6. Dashboard & Workout
- Visualizza programma settimanale
- Click giorno → Pre-workout check (sonno, energia, dolore)
- Esegui workout con tracking serie/RPE
- ADAPTFLOW™ se carico insufficiente
- "Adatta" button per cambiare location al volo
- Post-workout notes e completamento

### 7. Statistiche & Progress
- Grafici volume settimanale (Recharts)
- Record personali per esercizio
- Trend progressione

---

## Caratteristiche Avanzate

### Sistema Prezzi Dinamici
```typescript
// shared/pricingUtils.ts
export function getPriceForDate(tier: string, startDate: Date): number {
  const monthsActive = calculateMonthsActive(startDate);
  const basePrice = BASE_PRICES[tier];
  return monthsActive >= 6 ? basePrice + 10 : basePrice;
}
```

### Detraining & Recalibrazione
```typescript
export function calculateDetrainingFactor(workouts: any[]) {
  const daysSinceLastWorkout = calculateDays(lastWorkout);
  if (daysSinceLastWorkout < 7) return 1.0;
  if (daysSinceLastWorkout < 14) return 0.95; // -5%
  if (daysSinceLastWorkout < 21) return 0.9;  // -10%
  if (daysSinceLastWorkout < 30) return 0.85; // -15%
  return 0.7; // -30%
}
```

### Adaptation System
```typescript
// POST /api/program/:programId/day/:dayName/adapt
{
  adaptedLocation: "home" | "homeBodyweight",
  adaptedEquipment: { ... }
}
// Rigenera esercizi per location/equipment specificati
// Salva in workoutAdaptations con expiry 24h
```

---

## Validazione Dati (Zod Schemas)

### screeningSchema (server/routes.ts)
```typescript
const screeningSchema = z.object({
  goal: z.enum(["weight_loss", "muscle_gain", ...]),
  pregnancyWeek: z.number().int().min(1).max(40).optional(),
  pregnancyTrimester: z.number().int().min(1).max(3).optional(),
  hasDoctorClearance: z.boolean().optional(),
  pregnancyComplications: z.array(z.string()).optional(),
  bodyWeight: z.number().positive().max(300),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  frequency: z.number().int().min(2).max(6),
  // ... altri campi
});
```

### assessmentSchema
```typescript
const assessmentSchema = z.object({
  exerciseName: z.string().min(1),
  weight: z.string().or(z.number()).transform(parseFloat),
  reps: z.number().int().positive().max(50),
  notes: z.string().optional(),
});
```

---

## Componenti Frontend Chiave

### `client/src/components/ScreeningFlow.tsx`
- Multi-step form con validazione
- Rendering condizionale per goal-specific steps
- Calcolo automatico trimestre da settimana gravidanza
- Integrazione con shadcn/ui Form

### `client/src/components/WorkoutTracker.tsx`
- Tracking real-time serie/reps/RPE
- Pre-workout check (sonno, energia, dolore)
- Post-workout notes
- Bottone "Adatta" per workout adaptation
- ADAPTFLOW™ visualization

### `client/src/components/Dashboard.tsx`
- Overview programma attivo
- Calendario settimanale
- Quick stats
- CTA per workout

### `client/src/pages/Pricing.tsx`
- 3-tier cards con prezzi dinamici
- Feature comparison
- FAQ section
- Stripe/PayPal integration ready

---

## Deployment & Environment

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Auth (Replit)
REPLIT_DEPLOYMENT=production
REPLIT_DOMAINS=app.replit.dev

# Payments (Optional)
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Testing (Optional)
TESTING_STRIPE_SECRET_KEY=sk_test_...
TESTING_VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Scripts
```bash
npm run dev          # Dev mode (Express + Vite)
npm run build        # Build frontend
npm run db:push      # Push schema changes
npm run db:push --force  # Force push (data loss warning)
```

### Workflow
- Nome: "Start application"
- Comando: `npm run dev`
- Bind: `0.0.0.0:5000`
- Auto-restart su file changes

---

## Prossimi Sviluppi Suggeriti

1. **End-Cycle Testing UI**
   - Interfaccia per test 1RM a fine programma
   - Confronto con assessment iniziale
   - Trigger automatico per requiresEndCycleTest

2. **Deload Week Implementation**
   - Logica per settimane deload (volume -40-50%)
   - UI per indicare settimana deload
   - Tracking adherence deload

3. **AI Form Corrections**
   - Video upload per Premium/Elite
   - Analisi forma con AI
   - Feedback correttivo
   - Rate limiting per tier

4. **Notifiche Workout**
   - Reminder programmati
   - Push notifications
   - Email summaries settimanali

5. **Social Features**
   - Condivisione record
   - Leaderboard
   - Coach access (Elite tier)

---

## File Struttura Progetto

```
trainsmart/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScreeningFlow.tsx      # Onboarding multi-step
│   │   │   ├── AssessmentFlow.tsx     # 1RM testing
│   │   │   ├── WorkoutTracker.tsx     # Tracking allenamento
│   │   │   ├── Dashboard.tsx          # Overview programma
│   │   │   ├── AdaptLocationDialog.tsx # Adattamento workout
│   │   │   └── ui/                    # shadcn components
│   │   ├── pages/
│   │   │   ├── Landing.tsx            # Homepage
│   │   │   ├── Pricing.tsx            # Prezzi e abbonamenti
│   │   │   ├── Onboarding.tsx         # Flusso onboarding
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── queryClient.ts         # TanStack Query setup
│   │   └── App.tsx                    # Router principale
│   └── index.html
├── server/
│   ├── routes.ts                      # API endpoints
│   ├── programGenerator.ts            # Logica generazione programmi
│   ├── storage.ts                     # Interface database
│   ├── replitAuth.ts                  # Autenticazione setup
│   └── index.ts                       # Express server
├── shared/
│   ├── schema.ts                      # Drizzle schema completo
│   └── pricingUtils.ts                # Logica prezzi
├── package.json
├── drizzle.config.ts
├── vite.config.ts
└── tsconfig.json
```

---

## Note Tecniche Importanti

### Database Migrations
- **Mai modificare tipo ID columns** (serial ↔ varchar causa data loss)
- Usare sempre `npm run db:push` per schema sync
- Se warning data loss: `npm run db:push --force`

### Zod Validation Critical
- **Tutti i campi del form devono essere nello schema Zod**, altrimenti Zod li rimuove!
- Esempio: pregnancy fields aggiunti a `screeningSchema` in routes.ts per evitare data loss

### TanStack Query v5
- Solo object form: `useQuery({ queryKey: [...] })`
- Invalidate cache dopo mutations: `queryClient.invalidateQueries({ queryKey: [...] })`

### ADAPTFLOW™
- Sempre verificare peso disponibile vs richiesto
- Compensation types: tempo, pause, dropset, cluster
- Fallback: gym → home → bodyweight

### Safety First
- Pregnancy: no supine da T2, load ridotti progressivamente
- Disability: esercizi specifici per tipo
- Pain areas: skip esercizi che coinvolgono area

---

## Crediti & Licenza

**TrainSmart v2.0**
Sviluppato con React, Express, PostgreSQL, Drizzle ORM
Powered by Replit

---

*Questo documento è aggiornato a Ottobre 2025 e include tutte le feature implementate fino alla v2.0, inclusi sistema gravidanza, deload cycles, e end-cycle testing.*
