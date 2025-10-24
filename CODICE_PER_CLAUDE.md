# TrainSmart - Codice Completo per Claude

## 📋 Stato Attuale

### ✅ Implementato
1. **Autenticazione Replit** - Login/Logout funzionanti
2. **Database PostgreSQL** - Configurato con Drizzle ORM
3. **UI Dark Mode** - Design completo con componenti Landing, Dashboard, Header
4. **Schema Database Base** - Tabelle `users` e `sessions`

### ❌ Da Implementare
1. Schema fitness (screening, quiz, assessment, workouts, payments)
2. API routes per fitness logic
3. Logica generazione programmi (formule Brzycki)
4. Sistema pagamenti PayPal/Stripe

---

## 📁 File Principali

### 1. shared/schema.ts (Attuale - Solo Auth)
```typescript
import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";

// Session storage - Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
```

### 2. server/storage.ts (Attuale - Solo Auth)
```typescript
import { users, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
```

### 3. server/routes.ts (Attuale - Solo Auth)
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

### 4. client/src/App.tsx
```typescript
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Home} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### 5. client/src/hooks/useAuth.ts
```typescript
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
```

---

## 🚀 Schema Fitness da Aggiungere

Aggiungi questo a `shared/schema.ts`:

```typescript
import { integer } from "drizzle-orm/pg-core";

// Screening
export const screenings = pgTable("screenings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  goal: varchar("goal").notNull(),
  level: varchar("level").notNull(),
  hasGym: boolean("has_gym").notNull(),
  frequency: integer("frequency").notNull(),
  painAreas: jsonb("pain_areas").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz Results
export const quizResults = pgTable("quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: jsonb("answers").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assessments (10RM test)
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  exerciseName: varchar("exercise_name").notNull(),
  weight: integer("weight").notNull(),
  reps: integer("reps").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Programs
export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  split: jsonb("split").$type<string[]>(),
  exercises: jsonb("exercises").$type<any[]>(),
  progression: varchar("progression").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workouts
export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  programId: varchar("program_id").references(() => programs.id),
  dayName: varchar("day_name").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Workout Sets
export const workoutSets = pgTable("workout_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").notNull().references(() => workouts.id),
  exerciseName: varchar("exercise_name").notNull(),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weight: integer("weight").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  currency: varchar("currency").default("EUR"),
  provider: varchar("provider").notNull(),
  status: varchar("status").notNull(),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export types
export type Screening = typeof screenings.$inferSelect;
export type InsertScreening = typeof screenings.$inferInsert;
export type QuizResult = typeof quizResults.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type Payment = typeof payments.$inferSelect;
```

---

## 🔧 API Routes da Aggiungere

Aggiungi a `server/routes.ts`:

```typescript
// Screening
app.post("/api/screening", isAuthenticated, async (req: any, res) => {
  const userId = req.user.claims.sub;
  const screening = await storage.saveScreening({ userId, ...req.body });
  res.json(screening);
});

app.get("/api/screening", isAuthenticated, async (req: any, res) => {
  const userId = req.user.claims.sub;
  const screening = await storage.getLatestScreening(userId);
  res.json(screening);
});

// Quiz
app.post("/api/quiz/submit", isAuthenticated, async (req: any, res) => {
  const userId = req.user.claims.sub;
  const result = await storage.saveQuizResult({ userId, ...req.body });
  res.json(result);
});

// Assessment
app.post("/api/assessment", isAuthenticated, async (req: any, res) => {
  const userId = req.user.claims.sub;
  const assessment = await storage.saveAssessment({ userId, ...req.body });
  res.json(assessment);
});

// Program Generation
app.post("/api/program/generate", isAuthenticated, async (req: any, res) => {
  const userId = req.user.claims.sub;
  // Qui usa la logica dal file allegato
  const program = await generateProgramLogic(userId);
  res.json(program);
});

// Workout Tracking
app.post("/api/workout/start", isAuthenticated, async (req: any, res) => {
  const userId = req.user.claims.sub;
  const workout = await storage.createWorkout({ userId, ...req.body });
  res.json(workout);
});

app.post("/api/workout/:id/set", isAuthenticated, async (req: any, res) => {
  const set = await storage.saveWorkoutSet(req.params.id, req.body);
  res.json(set);
});

// Stats
app.get("/api/stats", isAuthenticated, async (req: any, res) => {
  const userId = req.user.claims.sub;
  const stats = await storage.getUserStats(userId);
  res.json(stats);
});

// Payments - Stripe
app.post("/api/payment/stripe/checkout", isAuthenticated, async (req: any, res) => {
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
    cancel_url: `${req.protocol}://${req.hostname}/pricing`,
  });
  res.json({ url: session.url });
});

// Payments - PayPal (usa @paypal/paypal-server-sdk)
```

---

## 📦 Storage Methods da Aggiungere

Aggiungi a `server/storage.ts`:

```typescript
// Nella interface IStorage:
saveScreening(data: any): Promise<Screening>;
getLatestScreening(userId: string): Promise<Screening | undefined>;
saveQuizResult(data: any): Promise<QuizResult>;
saveAssessment(data: any): Promise<Assessment>;
createWorkout(data: any): Promise<Workout>;
saveWorkoutSet(workoutId: string, data: any): Promise<WorkoutSet>;
getUserStats(userId: string): Promise<any>;

// Implementazioni in DatabaseStorage
async saveScreening(data: any) {
  const [screening] = await db.insert(screenings).values(data).returning();
  return screening;
}

async getLatestScreening(userId: string) {
  const [screening] = await db
    .select()
    .from(screenings)
    .where(eq(screenings.userId, userId))
    .orderBy(desc(screenings.createdAt))
    .limit(1);
  return screening;
}

// ... altri metodi simili
```

---

## 🧮 Logica Fitness (File Allegato)

Il file `Pasted-import-useState-useEffect...txt` contiene:

1. **Formule Brzycki** per calcolo 1RM:
```typescript
function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
}
```

2. **Calcolo pesi target** in base a livello

3. **Generazione esercizi** con sostituzione in caso di infortuni

4. **Split training**: Full Body, Upper/Lower, PPL

**Porta questa logica in `server/programGenerator.ts`**

---

## 💳 Setup Pagamenti

### Stripe
1. Ottieni chiavi: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`
2. Già installato: `stripe` package
3. Usa Checkout Sessions per subscriptions

### PayPal
1. Ottieni chiavi: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
2. Già installato: `@paypal/paypal-server-sdk`
3. Crea Orders API per one-time/recurring

---

## 🎯 Prompt per Claude

```
Devo implementare le funzionalità fitness per la mia app TrainSmart.

FATTO:
- Autenticazione Replit Auth funzionante
- Database PostgreSQL con tabelle users/sessions
- UI completa in dark mode

DA FARE:
1. Aggiungi le tabelle fitness allo schema (screening, quiz, assessments, programs, workouts, sets, payments)
2. Implementa i metodi storage per CRUD operations
3. Crea le API routes per screening → quiz → assessment → program generation → workout tracking
4. Porta la logica di generazione programmi (formule Brzycki, calcolo pesi, split training) dal file allegato
5. Implementa checkout Stripe e PayPal per upgrade Premium

CODICE ATTUALE:
[incolla questo file]

FILE CON LOGICA FITNESS:
[incolla il file Pasted-import...]

Procedi step-by-step implementando tutto il necessario.
```

---

## ✅ Checklist Implementazione

- [ ] Aggiungi tabelle fitness a `shared/schema.ts`
- [ ] Run `npm run db:push --force`
- [ ] Aggiungi metodi storage
- [ ] Implementa API routes
- [ ] Crea `server/programGenerator.ts` con logica dal file allegato
- [ ] Testa flow: Screening → Quiz → Assessment → Program
- [ ] Setup chiavi Stripe/PayPal
- [ ] Implementa payment checkout
- [ ] Testa upgrade Premium

---

## 📂 Struttura Componenti Frontend

```
client/src/components/
├── Hero.tsx         (Landing hero section)
├── Features.tsx     (Features showcase)
├── Pricing.tsx      (Pricing cards)
├── Header.tsx       (Navigation)
├── Dashboard.tsx    (User home)
├── ScreeningFlow.tsx (5-step onboarding)
├── QuizComponent.tsx (Technical quiz)
└── WorkoutTracker.tsx (Track sets/reps)
```

**Tutti i componenti UI sono già pronti!** Serve solo collegare le API.
