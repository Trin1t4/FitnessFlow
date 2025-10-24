# TrainSmart - Codice Completo Applicazione

## 📁 Struttura Progetto

```
TrainSmart/
├── client/                    # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/       # Componenti React
│   │   ├── pages/           # Pagine dell'app
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
├── server/                   # Backend Express + TypeScript
│   ├── routes.ts            # API Routes
│   ├── storage.ts           # Database layer
│   ├── programGenerator.ts  # Logica allenamenti
│   └── replitAuth.ts        # Autenticazione
├── shared/                   # Codice condiviso
│   └── schema.ts            # Schema database + types
└── package.json
```

---

## 🗄️ DATABASE SCHEMA

**File: `shared/schema.ts`**

```typescript
import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp, jsonb, index, boolean, integer, decimal, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ===== AUTENTICAZIONE =====
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== FITNESS DATA =====

// Screening iniziale (obiettivi e disponibilità)
export const screenings = pgTable("screenings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  goal: varchar("goal").notNull(), // weight_loss, muscle_gain, strength, endurance
  objectiveType: varchar("objective_type"), // toning, performance
  sportType: varchar("sport_type"), // calcio, basket, tennis, etc.
  bodyWeight: decimal("body_weight", { precision: 5, scale: 1 }), // peso corporeo in kg
  level: varchar("level").notNull(), // beginner, intermediate, advanced
  hasGym: boolean("has_gym").notNull(),
  frequency: integer("frequency").notNull(), // 2-6 giorni/settimana
  painAreas: jsonb("pain_areas").$type<string[]>().default([]),
  preferredSplit: varchar("preferred_split"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz tecnico (conoscenza esercizi)
export const quizResults = pgTable("quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: jsonb("answers").$type<{questionId: number, answer: number, correct: boolean}[]>(),
  difficulty: varchar("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assessment forza (10RM test)
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseName: varchar("exercise_name").notNull(),
  weight: decimal("weight", { precision: 6, scale: 2 }).notNull(),
  reps: integer("reps").notNull(),
  oneRepMax: decimal("one_rep_max", { precision: 6, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Programmi di allenamento
export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  split: varchar("split").notNull(),
  daysPerWeek: integer("days_per_week").notNull(),
  weeklySchedule: jsonb("weekly_schedule").$type<{
    day: string,
    name: string,
    exercises: {
      name: string,
      sets: number,
      reps: string,
      rest: number,
      weight?: number,
      alternatives?: string[]
    }[]
  }[]>(),
  progression: varchar("progression").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout session
export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  programId: varchar("program_id").references(() => programs.id, { onDelete: "set null" }),
  dayName: varchar("day_name").notNull(),
  status: varchar("status").notNull().default("in_progress"),
  
  // Pre-workout check data
  sleepHours: decimal("sleep_hours", { precision: 3, scale: 1 }),
  energyLevel: integer("energy_level"),
  painLevel: integer("pain_level"),
  painLocation: varchar("pain_location"),
  preWorkoutNotes: text("pre_workout_notes"),
  
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  notes: text("notes"),
  totalVolume: decimal("total_volume", { precision: 10, scale: 2 }),
});

// Singoli set
export const workoutSets = pgTable("workout_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
  exerciseName: varchar("exercise_name").notNull(),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weight: decimal("weight", { precision: 6, scale: 2 }).notNull(),
  rpe: integer("rpe"),
  isWarmup: boolean("is_warmup").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personal Records
export const personalRecords = pgTable("personal_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseName: varchar("exercise_name").notNull(),
  recordType: varchar("record_type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  workoutId: varchar("workout_id").references(() => workouts.id, { onDelete: "set null" }),
  achievedAt: timestamp("achieved_at").defaultNow(),
});

// Progressioni settimanali
export const weeklyProgress = pgTable("weekly_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekStart: timestamp("week_start").notNull(),
  totalWorkouts: integer("total_workouts").default(0),
  totalVolume: decimal("total_volume", { precision: 10, scale: 2 }).default("0"),
  totalSets: integer("total_sets").default(0),
  totalReps: integer("total_reps").default(0),
  averageIntensity: decimal("average_intensity", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pagamenti
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  currency: varchar("currency").default("EUR").notNull(),
  provider: varchar("provider").notNull(),
  status: varchar("status").notNull(),
  transactionId: varchar("transaction_id").unique(),
  subscriptionId: varchar("subscription_id"),
  metadata: jsonb("metadata").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== TYPES =====
export type User = typeof users.$inferSelect;
export type Screening = typeof screenings.$inferSelect;
export type InsertScreening = typeof screenings.$inferInsert;
export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = typeof workouts.$inferInsert;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type InsertWorkoutSet = typeof workoutSets.$inferInsert;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type WeeklyProgress = typeof weeklyProgress.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
```

---

## 🔧 BACKEND - API ROUTES

**File: `server/routes.ts`**

```typescript
import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateProgram, calculateOneRepMax } from "./programGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // ===== AUTH =====
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    res.json(user);
  });

  // ===== SCREENING =====
  app.post("/api/screening", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const { goal, objectiveType, sportType, bodyWeight, level, hasGym, frequency, painAreas, preferredSplit } = req.body;

    const screening = await storage.saveScreening({
      userId, goal, objectiveType, sportType, bodyWeight,
      level, hasGym, frequency, painAreas: painAreas || [], preferredSplit,
    });
    res.json(screening);
  });

  app.get("/api/screening", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const screening = await storage.getLatestScreening(userId);
    res.json(screening || null);
  });

  // ===== QUIZ =====
  app.post("/api/quiz/submit", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const { score, totalQuestions, answers, difficulty } = req.body;
    const result = await storage.saveQuizResult({ userId, score, totalQuestions, answers, difficulty });
    res.json(result);
  });

  // ===== ASSESSMENT =====
  app.post("/api/assessment", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const { exerciseName, weight, reps, notes } = req.body;
    const oneRepMax = calculateOneRepMax(parseFloat(weight), parseInt(reps));
    
    const assessment = await storage.saveAssessment({
      userId, exerciseName,
      weight: weight.toString(),
      reps: parseInt(reps),
      oneRepMax: oneRepMax.toFixed(2),
      notes,
    });
    res.json(assessment);
  });

  // ===== PROGRAM GENERATION =====
  app.post("/api/program/generate", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const screening = await storage.getLatestScreening(userId);
    const assessments = await storage.getLatestAssessments(userId);

    if (!screening) {
      return res.status(400).json({ error: "Complete screening first" });
    }

    const programData = generateProgram({
      level: screening.level,
      frequency: screening.frequency,
      hasGym: screening.hasGym,
      painAreas: screening.painAreas as string[],
      assessments: assessments.map(a => ({
        exerciseName: a.exerciseName,
        oneRepMax: parseFloat(a.oneRepMax)
      })),
      goal: screening.goal
    });

    const program = await storage.createProgram({
      userId,
      name: programData.name,
      description: programData.description,
      split: programData.split,
      daysPerWeek: programData.daysPerWeek,
      weeklySchedule: programData.weeklySchedule,
      progression: programData.progression,
      isActive: true
    });
    res.json(program);
  });

  // ===== WORKOUTS =====
  app.post("/api/workout/start", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    const { programId, dayName, sleepHours, energyLevel, painLevel, painLocation, preWorkoutNotes } = req.body;

    const workout = await storage.createWorkout({
      userId, programId, dayName, status: "in_progress",
      sleepHours: sleepHours?.toString(), energyLevel, painLevel, painLocation, preWorkoutNotes
    });
    res.json(workout);
  });

  app.post("/api/workout/:id/complete", isAuthenticated, async (req: any, res: Response) => {
    const workoutId = req.params.id;
    const { duration } = req.body;

    const sets = await storage.getWorkoutSets(workoutId);
    const totalVolume = sets
      .filter(s => !s.isWarmup)
      .reduce((sum, s) => sum + (s.reps * parseFloat(s.weight)), 0);

    const workout = await storage.completeWorkout(workoutId, duration, totalVolume);
    
    const weekStart = new Date(workout.startedAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    await storage.updateWeeklyProgress(workout.userId, weekStart);

    res.json(workout);
  });

  // ===== RESET USER DATA =====
  app.delete("/api/user/reset", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.claims.sub;
    await storage.resetUserData(userId);
    res.json({ success: true, message: "Tutti i dati sono stati cancellati!" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

---

## 💾 STORAGE LAYER

**File: `server/storage.ts`** (estratto principale)

```typescript
import { db } from "./db";
import {
  users, screenings, quizResults, assessments, programs,
  workouts, workoutSets, personalRecords, weeklyProgress, payments,
  type User, type Screening, type InsertScreening, // ... altri types
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage {
  // ===== SCREENING =====
  async saveScreening(data: InsertScreening): Promise<Screening> {
    const [screening] = await db.insert(screenings).values(data).returning();
    return screening;
  }

  async getLatestScreening(userId: string): Promise<Screening | undefined> {
    const [screening] = await db.select()
      .from(screenings)
      .where(eq(screenings.userId, userId))
      .orderBy(desc(screenings.createdAt))
      .limit(1);
    return screening;
  }

  // ===== ASSESSMENT =====
  async saveAssessment(data: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db.insert(assessments).values(data).returning();
    return assessment;
  }

  async getLatestAssessments(userId: string): Promise<Assessment[]> {
    const latestAssessments = await db.select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt));
    
    // Group by exercise, take most recent
    const grouped = new Map<string, Assessment>();
    for (const assessment of latestAssessments) {
      if (!grouped.has(assessment.exerciseName)) {
        grouped.set(assessment.exerciseName, assessment);
      }
    }
    return Array.from(grouped.values());
  }

  // ===== PROGRAMS =====
  async createProgram(data: InsertProgram): Promise<Program> {
    // Deactivate all other programs
    await db.update(programs)
      .set({ isActive: false })
      .where(eq(programs.userId, data.userId));
    
    const [program] = await db.insert(programs).values(data).returning();
    return program;
  }

  // ===== RESET USER DATA =====
  async resetUserData(userId: string): Promise<void> {
    // Delete in correct order for foreign key constraints
    const userWorkouts = await db.select().from(workouts).where(eq(workouts.userId, userId));
    for (const workout of userWorkouts) {
      await db.delete(workoutSets).where(eq(workoutSets.workoutId, workout.id));
    }
    
    await db.delete(workouts).where(eq(workouts.userId, userId));
    await db.delete(personalRecords).where(eq(personalRecords.userId, userId));
    await db.delete(weeklyProgress).where(eq(weeklyProgress.userId, userId));
    await db.delete(programs).where(eq(programs.userId, userId));
    await db.delete(assessments).where(eq(assessments.userId, userId));
    await db.delete(quizResults).where(eq(quizResults.userId, userId));
    await db.delete(screenings).where(eq(screenings.userId, userId));
  }
}

export const storage = new DatabaseStorage();
```

---

## 🏋️ PROGRAM GENERATOR

**File: `server/programGenerator.ts`** (funzioni chiave)

```typescript
// Formula Brzycki per 1RM
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight / (1.0278 - 0.0278 * reps);
}

// Analisi dolore persistente
export function analyzePainPersistence(recentWorkouts: WorkoutPainData[]) {
  const workoutsWithPain = recentWorkouts.filter(w => w.painLevel && w.painLevel > 0);
  
  if (workoutsWithPain.length === 0) {
    return {
      isPersistent: false,
      recommendation: "none",
      message: "Nessun dolore rilevato"
    };
  }

  const avgPain = workoutsWithPain.reduce((sum, w) => sum + (w.painLevel || 0), 0) / workoutsWithPain.length;
  
  if (workoutsWithPain.length >= 2 && avgPain >= 7) {
    return {
      isPersistent: true,
      recommendation: "reduce_intensity_40_volume_30",
      message: `Dolore persistente (${avgPain.toFixed(1)}). Riduzione necessaria.`
    };
  }
  
  return { isPersistent: true, recommendation: "monitor" };
}

// Generazione programma principale
export function generateProgram(input: ProgramInput) {
  const { level, frequency, goal, assessments, hasGym, painAreas } = input;

  // Logica di selezione programma
  if (goal === "endurance") {
    return generateEnduranceProgram(input);
  }
  
  if (goal === "general") {
    return generateGeneralFitnessProgram(input);
  }

  // Programmi di forza standard
  const split = determineSplit(frequency, level);
  const progression = getProgressionScheme(level);
  
  // Genera schedule settimanale...
  const weeklySchedule = buildWeeklySchedule(split, frequency, assessments, hasGym, painAreas);

  return {
    name: `${goal} - ${frequency}x/settimana`,
    split,
    daysPerWeek: frequency,
    weeklySchedule,
    progression: progression.type,
    description: progression.description
  };
}

// Programma Endurance con Concurrent Training
function generateEnduranceProgram(input: ProgramInput) {
  const weeklySchedule: any[] = [];
  
  // Mix forza + cardio basato su frequenza
  if (input.frequency === 4) {
    weeklySchedule.push(
      { day: "Giorno 1", name: "Forza Upper", exercises: generateEnduranceStrengthDay(input, "upper") },
      { day: "Giorno 2", name: "Cardio Steady-State", exercises: [{ name: "Corsa 45-60 min Zona 2" }] },
      { day: "Giorno 3", name: "Forza Lower", exercises: generateEnduranceStrengthDay(input, "lower") },
      { day: "Giorno 4", name: "HIIT Intervals", exercises: [{ name: "10x 1min max / 1min rec" }] }
    );
  }

  return {
    name: `Endurance Training - ${input.frequency}x/settimana`,
    split: "concurrent_training",
    daysPerWeek: input.frequency,
    weeklySchedule,
    progression: "volume_based"
  };
}
```

---

## ⚛️ FRONTEND - COMPONENTI PRINCIPALI

### ScreeningFlow Component

**File: `client/src/components/ScreeningFlow.tsx`** (estratto)

```typescript
const GOALS = [
  { id: "weight_loss", label: "Perdita Peso", emoji: "🔥" },
  { id: "muscle_gain", label: "Massa Muscolare", emoji: "💪" },
  { id: "strength", label: "Forza", emoji: "⚡" },
  { id: "toning", label: "Tonificazione", emoji: "✨" },
  { id: "performance", label: "Prestazioni Sportive", emoji: "🏆" },
  { id: "endurance", label: "Resistenza", emoji: "🏃" },
  { id: "general", label: "Fitness Generale", emoji: "🎯" },
];

const SPORTS = [
  { id: "calcio", label: "Calcio", emoji: "⚽" },
  { id: "basket", label: "Basket", emoji: "🏀" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  // ... altri sport
];

export default function ScreeningFlow({ onComplete }: ScreeningFlowProps) {
  const [data, setData] = useState({
    goal: "",
    sportType: "",
    bodyWeight: 70,
    level: "beginner",
    frequency: 3,
    hasGym: null,
    painAreas: [],
  });

  const handleSubmit = async () => {
    const objectiveType = data.goal === "toning" ? "toning" : 
                         data.goal === "performance" ? "performance" : null;

    await fetch("/api/screening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, objectiveType }),
    });

    window.location.href = "/quiz";
  };

  // Render step by step UI...
}
```

### Quiz Component

**File: `client/src/components/QuizComponent.tsx`** (estratto)

```typescript
const TECHNICAL_QUESTIONS = [
  {
    question: "Durante lo squat, dove deve passare la linea del bilanciere?",
    options: [
      "Dietro i talloni",
      "Davanti alle punte dei piedi",
      "Sul centro del piede, in linea con le caviglie", // ✓
      "Non importa, basta scendere parallelo"
    ],
    correctAnswer: 2,
    type: "technical"
  },
  // ... altre 6 domande tecniche con risposte randomizzate
];

export default function QuizComponent() {
  const [technicalScore, setTechnicalScore] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);

  // Logica determinazione livello
  if (technicalPercentage < 50) {
    level = "beginner"; // Tecnica insufficiente
  } else if (performancePercentage < 40) {
    level = "intermediate"; // Tecnica OK, carichi bassi
  } else {
    level = "advanced"; // Tecnica OK, carichi buoni
  }

  // Submit e aggiorna screening con livello determinato
  await fetch("/api/screening/update-level", {
    method: "POST",
    body: JSON.stringify({ level })
  });
}
```

### Assessment Flow Component

**File: `client/src/components/AssessmentFlow.tsx`** (estratto)

```typescript
const MAIN_EXERCISES = [
  { name: "Squat", description: "Squat con bilanciere" },
  { name: "Panca Piana", description: "Panca piana con bilanciere" },
  { name: "Stacco", description: "Stacco da terra" },
  { name: "Military Press", description: "Shoulder press in piedi" },
  { name: "Pulley", description: "Lat pulldown" }
];

export default function AssessmentFlow() {
  const [bodyWeight, setBodyWeight] = useState<number | null>(null);

  // Carica peso corporeo dallo screening
  useEffect(() => {
    fetch("/api/screening")
      .then(res => res.json())
      .then(data => {
        if (data?.bodyWeight) {
          setBodyWeight(parseFloat(data.bodyWeight));
        }
      });
  }, []);

  // Calcola carico suggerito basato su peso corporeo
  const getSuggestedWeight = (exerciseName: string, bw: number) => {
    const multipliers = {
      "Squat": 0.75,         // ~1.0x BW 1RM
      "Panca Piana": 0.65,   // ~0.85x BW 1RM
      "Stacco": 1.0,         // ~1.3x BW 1RM
      "Military Press": 0.4, // ~0.5x BW 1RM
      "Pulley": 0.65,        // ~0.85x BW 1RM
    };
    
    return Math.round(bw * multipliers[exerciseName] / 2.5) * 2.5;
  };

  const calculateBrzycki = (w: number, r: number) => {
    return w / (1.0278 - 0.0278 * r);
  };

  // UI mostra suggerimento e permette calcolo 1RM
}
```

### Dashboard Component

**File: `client/src/components/Dashboard.tsx`** (estratto)

```typescript
export default function Dashboard() {
  const { user } = useAuth();
  const [activeProgram, setActiveProgram] = useState(null);
  const [activeView, setActiveView] = useState("overview");

  const handleResetData = async () => {
    await apiRequest("DELETE", "/api/user/reset");
    toast({ title: "Dati cancellati!", description: "Ricarica per ricominciare." });
    setTimeout(() => window.location.reload(), 2000);
  };

  // Views: overview, pre-check, workout, progress
  if (activeView === "workout") {
    return <WorkoutTracker programDay={nextWorkout} onComplete={onWorkoutComplete} />;
  }

  if (activeView === "progress") {
    return <ProgressCharts />;
  }

  // Dashboard overview con stats, prossimo workout, reset button
}
```

---

## 🎨 DESIGN SYSTEM

**File: `client/src/index.css`** (estratto colori)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Primary: Emerald/Teal */
    --primary: 160 85% 45%;
    --primary-foreground: 0 0% 100%;
    
    /* Accent: Coral */
    --accent: 15 90% 55%;
    --accent-foreground: 0 0% 100%;
    
    /* Dark mode backgrounds */
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 217 33% 17%;
    --muted: 217 33% 17%;
  }
}
```

---

## 📦 PACKAGE.JSON

```json
{
  "name": "trainsmart",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx server/index.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "drizzle-orm": "^0.30.0",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "passport": "^0.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wouter": "^3.0.0",
    "@tanstack/react-query": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "@types/react": "^18.2.0",
    "vite": "^5.0.0",
    "drizzle-kit": "^0.20.0"
  }
}
```

---

## 🔑 FEATURES IMPLEMENTATE

### ✅ Sistema Completo
- **Autenticazione**: Replit Auth (Google, GitHub, Email)
- **Database**: PostgreSQL con Drizzle ORM
- **Onboarding**: Screening → Quiz → Assessment → Programma
- **Allenamenti**: Tracking real-time, timer, RPE, note
- **Progressione**: PRs, stats settimanali, grafici
- **Dolore**: Pre-workout check, adattamento automatico carichi
- **Reset**: Cancellazione dati con conferma

### 🏋️ Generazione Programmi
- **Forza**: Wave loading, double progression, linear
- **Endurance**: Concurrent training (forza + cardio)
- **General Fitness**: Mix Yoga/Pilates/Forza
- **Sport-specific**: 7 sport disponibili

### 🧮 Calcoli Scientifici
- **Brzycki Formula**: `1RM = weight / (1.0278 - 0.0278 * reps)`
- **Suggerimenti Carico**: Basati su peso corporeo e moltiplicatori 10RM
- **Deallenamento**: Fattore riduzione dopo dolore persistente
- **Ricalibrazione**: Automatica dopo 3 sedute pain-free

### 🎯 Quiz Randomizzato
- 7 domande tecniche + 3 performance
- Risposte in posizioni casuali (0, 2, 3, etc.)
- Determinazione livello automatica

---

## 🚀 COMANDI UTILI

```bash
# Sviluppo
npm run dev

# Database
npm run db:push       # Sync schema
npm run db:push --force  # Force sync
npm run db:studio     # GUI database

# Deploy
# Usa il pulsante "Publish" su Replit
```

---

## 📝 NOTE TECNICHE

### Formula Brzycki
```
1RM = peso / (1.0278 - 0.0278 × reps)

Esempio: 80kg × 10 reps
1RM = 80 / (1.0278 - 0.0278 × 10)
1RM = 80 / 0.75 = 106.67kg
```

### Moltiplicatori Peso Corporeo (10RM)
- **Squat**: 0.75x → 1.0x BW (1RM)
- **Panca**: 0.65x → 0.85x BW (1RM)
- **Stacco**: 1.0x → 1.3x BW (1RM)
- **Military**: 0.4x → 0.5x BW (1RM)
- **Pulley**: 0.65x → 0.85x BW (1RM)

### Concurrent Training (Endurance)
- **Forza**: 3 sets × 10-12 reps @ 65% 1RM, rest 60-90s
- **Cardio Mix**: 80% steady-state, 20% HIIT
- **Frequenza**: 2-6 giorni/settimana con ratio strength:cardio appropriato

---

*File generato: 13 Ottobre 2025*
*TrainSmart v1.0 - Intelligent Fitness Training App*
