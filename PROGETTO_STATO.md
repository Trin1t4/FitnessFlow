# TrainSmart - Stato Progetto

## ✅ Cosa è stato completato

### 1. Design & UI (100%)
- ✅ Design system completo in dark mode
- ✅ Landing page con Hero, Features, Pricing
- ✅ Componenti UI: Screening, Quiz, Workout Tracker, Dashboard
- ✅ Header responsive con navigazione
- ✅ Palette colori: Primary (emerald), Accent (coral), Background dark
- ✅ Typography: Inter, Archivo Black, JetBrains Mono

### 2. Autenticazione (100%)
- ✅ Replit Auth integrato (Google, GitHub, Email/Password)
- ✅ Tabelle database: `users`, `sessions`
- ✅ Route protette con middleware `isAuthenticated`
- ✅ Hook `useAuth()` per frontend
- ✅ Login/Logout funzionanti
- ✅ Redirect automatico dopo login

### 3. Database (100%)
- ✅ PostgreSQL configurato
- ✅ Drizzle ORM setup
- ✅ Schema users con campi: id, email, firstName, lastName, profileImageUrl, isPremium

---

## ❌ Cosa manca da implementare

### 1. Schema Database Fitness
Aggiungi queste tabelle al file `shared/schema.ts`:

```typescript
// Screening iniziale dell'utente
export const screenings = pgTable("screenings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  goal: varchar("goal").notNull(), // weight_loss, muscle_gain, strength, etc.
  level: varchar("level").notNull(), // beginner, intermediate, advanced
  hasGym: boolean("has_gym").notNull(),
  frequency: integer("frequency").notNull(), // 2-6 giorni
  painAreas: jsonb("pain_areas").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Risultati quiz tecnico
export const quizResults = pgTable("quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: jsonb("answers").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assessment forza (10RM test)
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  exerciseName: varchar("exercise_name").notNull(),
  weight: integer("weight").notNull(),
  reps: integer("reps").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Programmi generati
export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  split: jsonb("split").$type<string[]>(), // ["Full Body A", "Full Body B", ...]
  exercises: jsonb("exercises").$type<any[]>(),
  progression: varchar("progression").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout completati
export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  programId: varchar("program_id").references(() => programs.id),
  dayName: varchar("day_name").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Set eseguiti
export const workoutSets = pgTable("workout_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").notNull().references(() => workouts.id),
  exerciseName: varchar("exercise_name").notNull(),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weight: integer("weight").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments (PayPal/Stripe)
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  currency: varchar("currency").default("EUR"),
  provider: varchar("provider").notNull(), // "paypal" | "stripe"
  status: varchar("status").notNull(), // "pending" | "completed" | "failed"
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 2. API Routes da implementare

In `server/routes.ts`, aggiungi:

```typescript
// Screening
app.post("/api/screening", isAuthenticated, async (req, res) => {
  const userId = req.user.claims.sub;
  // Salva screening in DB
});

// Quiz
app.post("/api/quiz/submit", isAuthenticated, async (req, res) => {
  const userId = req.user.claims.sub;
  // Salva risultato quiz
});

// Assessment
app.post("/api/assessment", isAuthenticated, async (req, res) => {
  const userId = req.user.claims.sub;
  // Salva assessment 10RM
});

// Generazione programma
app.post("/api/program/generate", isAuthenticated, async (req, res) => {
  const userId = req.user.claims.sub;
  // Usa la logica dal file allegato per generare programma
  // Salva in DB
});

// Tracciamento workout
app.post("/api/workout/start", isAuthenticated, async (req, res) => {
  const userId = req.user.claims.sub;
  // Crea nuovo workout
});

app.post("/api/workout/:id/set", isAuthenticated, async (req, res) => {
  // Salva set completato
});

app.post("/api/workout/:id/complete", isAuthenticated, async (req, res) => {
  // Segna workout come completato
});

// Statistiche
app.get("/api/stats", isAuthenticated, async (req, res) => {
  const userId = req.user.claims.sub;
  // Calcola: workout completati, volume totale, PRs, streak
});
```

### 3. Logica Generazione Programma

Il file allegato `Pasted-import-useState-useEffect...txt` contiene tutta la logica:
- Formule Brzycki per calcolo 1RM
- Calcolo pesi target per livello
- Generazione esercizi con sostituzione infortuni
- Split training (Full Body, Upper/Lower, PPL)

**Porta questa logica nel backend** in `server/programGenerator.ts`:
```typescript
export function generateProgram(screening, assessment, quiz) {
  // Usa le funzioni dal file allegato
  // Ritorna: { split, exercises, progression }
}
```

### 4. Pagamenti PayPal + Stripe

**Setup:**
1. Ottieni chiavi API:
   - PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
   - Stripe: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`

2. Installa SDK (già fatto ma verifica):
```bash
npm list @paypal/paypal-server-sdk stripe
```

3. Crea route pagamenti:
```typescript
// Stripe Checkout
app.post("/api/payment/stripe/checkout", isAuthenticated, async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: 'TrainSmart Premium' },
        unit_amount: 999, // €9.99
      },
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${req.protocol}://${req.hostname}/success`,
    cancel_url: `${req.protocol}://${req.hostname}/cancel`,
  });
  res.json({ url: session.url });
});

// PayPal
app.post("/api/payment/paypal/create", isAuthenticated, async (req, res) => {
  // Usa @paypal/paypal-server-sdk
});
```

### 5. Flow Applicazione

**1. Utente nuovo (non loggato):**
- Landing page → Clicca "Inizia Gratis" → Login Replit Auth

**2. Dopo login (primo accesso):**
- Screening (5 step) → Quiz tecnico → Assessment 10RM → Genera programma

**3. Utente esistente:**
- Dashboard → Visualizza prossimo workout → Traccia allenamento

**4. Upgrade Premium:**
- Dashboard → Badge "Premium" → Modal pagamento PayPal/Stripe

---

## 📁 Struttura File Corrente

```
client/src/
├── components/
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   ├── Header.tsx
│   ├── Dashboard.tsx
│   ├── ScreeningFlow.tsx
│   ├── QuizComponent.tsx
│   └── WorkoutTracker.tsx
├── pages/
│   ├── Landing.tsx
│   ├── Home.tsx
│   └── not-found.tsx
├── hooks/
│   └── useAuth.ts
├── lib/
│   ├── authUtils.ts
│   └── queryClient.ts
└── App.tsx

server/
├── replitAuth.ts (✅ Replit Auth setup)
├── routes.ts (⚠️ Aggiungi API routes fitness)
├── storage.ts (⚠️ Aggiungi metodi CRUD)
└── db.ts

shared/
└── schema.ts (⚠️ Aggiungi tabelle fitness)
```

---

## 🚀 Prossimi Step

1. **Aggiungi schema DB fitness** in `shared/schema.ts`
2. **Run** `npm run db:push --force`
3. **Aggiungi metodi storage** in `server/storage.ts`
4. **Implementa API routes** in `server/routes.ts`
5. **Porta logica generazione programma** dal file allegato
6. **Configura PayPal/Stripe** con chiavi API
7. **Testa il flow completo**: Screening → Quiz → Assessment → Programma → Workout

---

## 🔑 Variabili Ambiente

**Già configurate:**
- ✅ DATABASE_URL
- ✅ SESSION_SECRET
- ✅ REPL_ID, REPLIT_DOMAINS, ISSUER_URL (Replit Auth)

**Da configurare quando implementi pagamenti:**
- ❌ PAYPAL_CLIENT_ID
- ❌ PAYPAL_CLIENT_SECRET
- ❌ STRIPE_SECRET_KEY
- ❌ VITE_STRIPE_PUBLIC_KEY

---

## 💡 Note Tecniche

- **Dark mode**: Applicato globalmente in `App.tsx` con `document.documentElement.classList.add('dark')`
- **Auth**: Middleware `isAuthenticated` protegge le route
- **Database**: Usa Drizzle ORM con PostgreSQL
- **Frontend**: React + Wouter + TanStack Query + Shadcn UI
- **Backend**: Express + TypeScript

---

## 📝 File da Portare su Claude

**Copia questo intero documento** + il contenuto di questi file chiave:

1. `shared/schema.ts` (schema DB attuale)
2. `server/routes.ts` (routes attuali)
3. `server/storage.ts` (storage interface)
4. File allegato con logica fitness (formule Brzycki, generazione programma)

Poi su Claude puoi chiedere:
- "Implementa le tabelle fitness nel schema"
- "Crea le API routes per screening/quiz/assessment"
- "Porta la logica di generazione programma nel backend"
- "Implementa il sistema di pagamento PayPal e Stripe"
