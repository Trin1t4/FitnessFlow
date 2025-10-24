import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateProgram, calculateOneRepMax } from "./programGenerator";

// ===== VALIDATION SCHEMAS =====
const screeningSchema = z.object({
  goal: z.enum(["weight_loss", "muscle_gain", "strength", "endurance", "toning", "general", "performance", "disability", "pregnancy"]),
  objectiveType: z.string().optional(),
  sportType: z.string().optional(),
  sportRole: z.string().optional(), // ruolo specifico per sport (es. portiere, difensore per calcio)
  specificBodyParts: z.array(z.string()).optional(),
  disabilityType: z.string().optional(),
  pregnancyWeek: z.number().int().min(1).max(40).optional(),
  pregnancyTrimester: z.number().int().min(1).max(3).optional(),
  hasDoctorClearance: z.boolean().optional(),
  pregnancyComplications: z.array(z.string()).optional(),
  bodyWeight: z.number().positive().max(300, "Peso corporeo non valido"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  location: z.enum(["gym", "home", "mixed"]).optional(),
  hasGym: z.boolean(),
  equipment: z.object({
    barbell: z.boolean().optional(),
    dumbbellMaxKg: z.number().optional(),
    kettlebellKg: z.array(z.number()).optional(),
    bands: z.boolean().optional(),
    pullupBar: z.boolean().optional(),
    bench: z.boolean().optional(),
  }).optional(),
  frequency: z
    .number()
    .int()
    .min(2, "Minimo 2 giorni/settimana")
    .max(6, "Massimo 6 giorni/settimana"),
  painAreas: z.array(z.string()).default([]),
  preferredSplit: z.string().optional(),
});

const quizSchema = z.object({
  score: z.number().int().min(0),
  totalQuestions: z.number().int().positive(),
  answers: z.record(z.any()),
  difficulty: z.string(),
});

const assessmentSchema = z.object({
  exerciseName: z.string().min(1, "Nome esercizio richiesto"),
  weight: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
  reps: z.number().int().positive().max(50, "Ripetizioni non valide"),
  notes: z.string().optional(),
});

const workoutStartSchema = z.object({
  programId: z.string().min(1),
  dayName: z.string().min(1),
  sleepHours: z.number().min(0).max(24).optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  painLevel: z.number().int().min(0).max(10).optional(),
  painLocation: z.string().optional(),
  preWorkoutNotes: z.string().optional(),
});

const workoutSetSchema = z.object({
  exerciseName: z.string().min(1),
  setNumber: z.number().int().positive(),
  reps: z.number().int().positive().max(100),
  weight: z.number().positive().max(1000),
  rpe: z.number().min(1).max(10).optional(),
  isWarmup: z.boolean().optional(),
});

const paymentSchema = z.object({
  amount: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
  provider: z.enum(["stripe", "paypal"]),
});

// ===== CUSTOM ERRORS =====
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class AuthorizationError extends Error {
  constructor(message: string = "Non autorizzato") {
    super(message);
    this.name = "AuthorizationError";
  }
}

class NotFoundError extends Error {
  constructor(message: string = "Risorsa non trovata") {
    super(message);
    this.name = "NotFoundError";
  }
}

// ===== MIDDLEWARE =====
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // max 100 richieste
  message: { error: "Troppe richieste, riprova tra 15 minuti" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Disable trust proxy validation for Replit
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // max 10 richieste per operazioni critiche
  message: { error: "Troppe richieste, riprova tra 15 minuti" },
  validate: { trustProxy: false }, // Disable trust proxy validation for Replit
});

// Middleware per verificare ownership delle risorse
const verifyWorkoutOwnership = async (req: any, res: Response, next: any) => {
  try {
    const userId = req.user.claims.sub;
    const workoutId = req.params.id;

    const workout = await storage.getWorkout(workoutId);

    if (!workout) {
      throw new NotFoundError("Workout non trovato");
    }

    if (workout.userId !== userId) {
      throw new AuthorizationError(
        "Non sei autorizzato ad accedere a questo workout",
      );
    }

    req.workout = workout;
    next();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error verifying ownership:", error);
    res.status(500).json({ error: "Errore verifica autorizzazione" });
  }
};

// ===== ERROR HANDLER =====
const handleError = (error: any, res: Response, defaultMessage: string) => {
  console.error("Error:", error);

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: "Dati non validi",
      details: error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }

  if (error instanceof AuthorizationError) {
    return res.status(403).json({ error: error.message });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }

  // Generic error
  res.status(500).json({
    error: defaultMessage,
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup CORS
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Setup Replit Auth
  await setupAuth(app);

  // Apply rate limiting to all API routes
  app.use("/api/", apiLimiter);

  // ===== AUTH ROUTES =====
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        throw new NotFoundError("Utente non trovato");
      }

      res.json(user);
    } catch (error) {
      handleError(error, res, "Errore recupero utente");
    }
  });

  // ===== SCREENING =====
  app.post(
    "/api/screening",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;

        // Validate input
        const data = screeningSchema.parse(req.body);

        const screening = await storage.saveScreening({
          userId,
          ...data,
        });

        res.json(screening);
      } catch (error) {
        handleError(error, res, "Errore salvataggio screening");
      }
    },
  );

  app.get(
    "/api/screening",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const screening = await storage.getLatestScreening(userId);
        res.json(screening || null);
      } catch (error) {
        handleError(error, res, "Errore recupero screening");
      }
    },
  );

  app.post(
    "/api/screening/update-level",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const { level } = z
          .object({
            level: z.enum(["beginner", "intermediate", "advanced"]),
          })
          .parse(req.body);

        const screening = await storage.getLatestScreening(userId);
        if (!screening) {
          throw new NotFoundError("Screening non trovato");
        }

        await storage.updateScreeningLevel(screening.id, level);
        res.json({ success: true, level });
      } catch (error) {
        handleError(error, res, "Errore aggiornamento livello");
      }
    },
  );

  // ===== QUIZ =====
  app.post(
    "/api/quiz/submit",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const data = quizSchema.parse(req.body);

        const result = await storage.saveQuizResult({
          userId,
          ...data,
        });

        res.json(result);
      } catch (error) {
        handleError(error, res, "Errore salvataggio quiz");
      }
    },
  );

  app.get(
    "/api/quiz/latest",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const quiz = await storage.getLatestQuiz(userId);
        res.json(quiz || null);
      } catch (error) {
        handleError(error, res, "Errore recupero quiz");
      }
    },
  );

  // ===== ASSESSMENT =====
  app.post(
    "/api/assessment",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const data = assessmentSchema.parse(req.body);

        // Calculate 1RM using Brzycki formula
        const oneRepMax = calculateOneRepMax(data.weight, data.reps);

        const assessment = await storage.saveAssessment({
          userId,
          exerciseName: data.exerciseName,
          weight: data.weight.toString(),
          reps: data.reps,
          oneRepMax: oneRepMax.toFixed(2),
          notes: data.notes,
        });

        res.json(assessment);
      } catch (error) {
        handleError(error, res, "Errore salvataggio assessment");
      }
    },
  );

  app.get(
    "/api/assessment",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const assessments = await storage.getLatestAssessments(userId);
        res.json(assessments);
      } catch (error) {
        handleError(error, res, "Errore recupero assessments");
      }
    },
  );

  // ===== PROGRAM GENERATION =====
  app.post(
    "/api/program/generate",
    isAuthenticated,
    strictLimiter,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;

        // Get user data
        const screening = await storage.getLatestScreening(userId);
        const assessments = await storage.getLatestAssessments(userId);

        if (!screening) {
          throw new ValidationError("Completa prima lo screening");
        }

        // Generate program
        const programData = generateProgram({
          level: screening.level,
          frequency: screening.frequency,
          location: screening.location || 'gym',
          hasGym: screening.hasGym,
          equipment: screening.equipment as any,
          painAreas: screening.painAreas as string[],
          assessments: assessments.map((a) => ({
            exerciseName: a.exerciseName,
            oneRepMax: parseFloat(a.oneRepMax),
          })),
          goal: screening.goal,
          specificBodyParts: screening.specificBodyParts as string[] | undefined,
          disabilityType: screening.disabilityType || undefined,
          pregnancyWeek: screening.pregnancyWeek || undefined,
          pregnancyTrimester: screening.pregnancyTrimester || undefined,
          hasDoctorClearance: screening.hasDoctorClearance || undefined,
          pregnancyComplications: screening.pregnancyComplications as string[] | undefined,
        });

        // Save to database
        const program = await storage.createProgram({
          userId,
          name: programData.name,
          description: programData.description,
          split: programData.split,
          daysPerWeek: programData.daysPerWeek,
          weeklySchedule: programData.weeklySchedule,
          progression: programData.progression,
          includesDeload: programData.includesDeload,
          deloadFrequency: programData.deloadFrequency,
          totalWeeks: programData.totalWeeks,
          requiresEndCycleTest: programData.requiresEndCycleTest,
          isActive: true,
        });

        res.json(program);
      } catch (error) {
        handleError(error, res, "Errore generazione programma");
      }
    },
  );

  app.get(
    "/api/program/active",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const program = await storage.getActiveProgram(userId);
        res.json(program || null);
      } catch (error) {
        handleError(error, res, "Errore recupero programma");
      }
    },
  );

  app.get("/api/programs", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const programs = await storage.getUserPrograms(userId);
      res.json(programs);
    } catch (error) {
      handleError(error, res, "Errore recupero programmi");
    }
  });

  // Adapt workout location (Home vs Gym)
  app.post(
    "/api/program/:programId/day/:dayName/adapt",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const { programId, dayName } = req.params;
        const { location, equipment } = z
          .object({
            location: z.enum(["gym", "home"]),
            equipment: z
              .object({
                barbell: z.boolean().optional(),
                dumbbellMaxKg: z.number().optional(),
                kettlebellKg: z.array(z.number()).optional(),
                bands: z.boolean().optional(),
                pullupBar: z.boolean().optional(),
                bench: z.boolean().optional(),
              })
              .optional(),
          })
          .parse(req.body);

        // Verifica ownership programma
        const program = await storage.getProgram(programId);
        if (!program || program.userId !== userId) {
          throw new AuthorizationError("Programma non valido");
        }

        // Recupera screening e assessments originali
        const screening = await storage.getLatestScreening(userId);
        if (!screening) {
          throw new NotFoundError("Screening non trovato");
        }

        const assessments = await storage.getLatestAssessments(userId);

        // Trova il giorno specifico nel weeklySchedule
        const daySchedule = program.weeklySchedule?.find(
          (day: any) => day.dayName === dayName,
        );
        if (!daySchedule) {
          throw new NotFoundError("Giorno non trovato nel programma");
        }

        // Rigenerata esercizi per il giorno con nuova location
        const { generateExercisesForDay } = await import("./programGenerator");

        const adaptedExercises = await generateExercisesForDay({
          dayName,
          originalExercises: daySchedule.exercises,
          location,
          equipment: equipment || screening.equipment || {},
          painAreas: screening.painAreas || [],
          assessments: assessments.map((a) => ({
            exerciseName: a.exerciseName,
            oneRepMax: parseFloat(a.oneRepMax),
          })),
          level: screening.level,
          goal: screening.goal,
          specificBodyParts: screening.specificBodyParts || [],
        });

        // Salva l'adaptation
        const adaptation = await storage.createWorkoutAdaptation({
          userId,
          programId,
          dayName,
          location,
          equipment,
          adaptedExercises,
        });

        // Cleanup vecchie adaptations
        await storage.deleteOldAdaptations();

        res.json({
          adaptationId: adaptation.id,
          exercises: adaptedExercises,
          location,
        });
      } catch (error) {
        handleError(error, res, "Errore adattamento workout");
      }
    },
  );

  // ===== WORKOUTS =====
  app.post(
    "/api/workout/start",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const data = workoutStartSchema.parse(req.body);

        // Verify program ownership
        const program = await storage.getProgram(data.programId);
        if (!program || program.userId !== userId) {
          throw new AuthorizationError(
            "Programma non valido o non autorizzato",
          );
        }

        const workout = await storage.createWorkout({
          userId,
          programId: data.programId,
          dayName: data.dayName,
          status: "in_progress",
          sleepHours: data.sleepHours?.toString(),
          energyLevel: data.energyLevel,
          painLevel: data.painLevel,
          painLocation: data.painLocation,
          preWorkoutNotes: data.preWorkoutNotes,
        });

        res.json(workout);
      } catch (error) {
        handleError(error, res, "Errore avvio workout");
      }
    },
  );

  app.get(
    "/api/workout/:id",
    isAuthenticated,
    verifyWorkoutOwnership,
    async (req: any, res: Response) => {
      try {
        const workout = req.workout;
        const sets = await storage.getWorkoutSets(workout.id);
        res.json({ ...workout, sets });
      } catch (error) {
        handleError(error, res, "Errore recupero workout");
      }
    },
  );

  app.post(
    "/api/workout/:id/set",
    isAuthenticated,
    verifyWorkoutOwnership,
    async (req: any, res: Response) => {
      try {
        const workoutId = req.params.id;
        const data = workoutSetSchema.parse(req.body);

        const set = await storage.saveWorkoutSet({
          workoutId,
          exerciseName: data.exerciseName,
          setNumber: data.setNumber,
          reps: data.reps,
          weight: data.weight.toString(),
          rpe: data.rpe,
          isWarmup: data.isWarmup || false,
        });

        res.json(set);
      } catch (error) {
        handleError(error, res, "Errore salvataggio serie");
      }
    },
  );

  app.post(
    "/api/workout/:id/complete",
    isAuthenticated,
    verifyWorkoutOwnership,
    async (req: any, res: Response) => {
      try {
        const workoutId = req.params.id;
        const { duration } = z
          .object({
            duration: z
              .number()
              .positive()
              .max(300, "Durata workout non valida"), // max 5 ore
          })
          .parse(req.body);

        // Calculate total volume
        const sets = await storage.getWorkoutSets(workoutId);
        const totalVolume = sets
          .filter((s) => !s.isWarmup)
          .reduce((sum, s) => sum + s.reps * parseFloat(s.weight), 0);

        const workout = await storage.completeWorkout(
          workoutId,
          duration,
          totalVolume,
        );

        // Update weekly progress
        const weekStart = new Date(workout.startedAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        await storage.updateWeeklyProgress(workout.userId, weekStart);

        res.json(workout);
      } catch (error) {
        handleError(error, res, "Errore completamento workout");
      }
    },
  );

  app.get("/api/workouts", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200); // max 200
      const workouts = await storage.getUserWorkouts(userId, limit);
      res.json(workouts);
    } catch (error) {
      handleError(error, res, "Errore recupero workouts");
    }
  });

  app.get(
    "/api/workout/pain-analysis",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const recentWorkouts = await storage.getRecentWorkoutsWithPain(
          userId,
          6,
        );

        const { analyzePainPersistence, checkRecoveryFromPain } = await import(
          "./programGenerator"
        );

        const painAnalysis = analyzePainPersistence(recentWorkouts.slice(0, 3));
        const recoveryCheck = checkRecoveryFromPain(recentWorkouts);

        res.json({
          painAnalysis,
          recoveryCheck,
          recentWorkouts: recentWorkouts.map((w) => ({
            completedAt: w.completedAt,
            painLevel: w.painLevel,
            painLocation: w.painLocation,
          })),
        });
      } catch (error) {
        handleError(error, res, "Errore analisi dolore");
      }
    },
  );

  app.post(
    "/api/program/recalibrate",
    isAuthenticated,
    strictLimiter,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;

        const recentWorkouts = await storage.getRecentWorkoutsWithPain(
          userId,
          6,
        );
        const {
          checkRecoveryFromPain,
          calculateDetrainingFactor,
          recalibrateProgram,
          generateProgram,
        } = await import("./programGenerator");

        const recoveryCheck = checkRecoveryFromPain(recentWorkouts);

        if (!recoveryCheck.canReturnToNormal) {
          throw new ValidationError(
            "Non hai ancora completato 3 sedute consecutive senza dolore",
          );
        }

        const detrainingFactor = calculateDetrainingFactor(recentWorkouts);
        const assessments = await storage.getLatestAssessments(userId);

        const recalibratedAssessments = recalibrateProgram(
          assessments.map((a) => ({
            exerciseName: a.exerciseName,
            oneRepMax: parseFloat(a.oneRepMax),
          })),
          detrainingFactor,
        );

        const screening = await storage.getLatestScreening(userId);
        if (!screening) {
          throw new NotFoundError("Screening non trovato");
        }

        const activeProgram = await storage.getActiveProgram(userId);
        if (activeProgram) {
          await storage.updateProgramStatus(activeProgram.id, false);
        }

        const programData = generateProgram({
          level: screening.level,
          frequency: screening.frequency,
          location: screening.location || 'gym',
          hasGym: screening.hasGym,
          equipment: screening.equipment as any,
          painAreas: screening.painAreas || [],
          assessments: recalibratedAssessments,
          goal: screening.goal,
          specificBodyParts: screening.specificBodyParts as string[] | undefined,
          disabilityType: screening.disabilityType || undefined,
          pregnancyWeek: screening.pregnancyWeek || undefined,
          pregnancyTrimester: screening.pregnancyTrimester || undefined,
          hasDoctorClearance: screening.hasDoctorClearance || undefined,
          pregnancyComplications: screening.pregnancyComplications as string[] | undefined,
        });

        const newProgram = await storage.createProgram({
          userId,
          name: programData.name + " (Ricalibrato)",
          description: programData.description,
          split: programData.split,
          daysPerWeek: programData.daysPerWeek,
          weeklySchedule: programData.weeklySchedule,
          progression: programData.progression,
          includesDeload: programData.includesDeload,
          deloadFrequency: programData.deloadFrequency,
          totalWeeks: programData.totalWeeks,
          requiresEndCycleTest: programData.requiresEndCycleTest,
          isActive: true,
        });

        res.json({
          program: newProgram,
          detrainingFactor,
          recalibratedAssessments,
          message: `Programma ricalibrato con successo. Riduzione applicata: ${Math.round((1 - detrainingFactor) * 100)}%`,
        });
      } catch (error) {
        handleError(error, res, "Errore ricalibrazione programma");
      }
    },
  );

  // ===== STATS & PROGRESS =====
  app.get(
    "/api/stats/weekly",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const weeks = Math.min(parseInt(req.query.weeks as string) || 12, 52); // max 1 anno
        const progress = await storage.getWeeklyProgress(userId, weeks);
        res.json(progress);
      } catch (error) {
        handleError(error, res, "Errore recupero statistiche");
      }
    },
  );

  app.get(
    "/api/stats/prs",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const prs = await storage.getUserPRs(userId);
        res.json(prs);
      } catch (error) {
        handleError(error, res, "Errore recupero PR");
      }
    },
  );

  // ===== PAYMENTS =====
  app.post(
    "/api/payment/create",
    isAuthenticated,
    strictLimiter,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const data = paymentSchema.parse(req.body);

        const payment = await storage.createPayment({
          userId,
          amount: data.amount.toString(),
          currency: "EUR",
          provider: data.provider,
          status: "pending",
        });

        res.json(payment);
      } catch (error) {
        handleError(error, res, "Errore creazione pagamento");
      }
    },
  );

  app.post(
    "/api/payment/:id/confirm",
    isAuthenticated,
    strictLimiter,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const paymentId = req.params.id;
        const { transactionId } = z
          .object({
            transactionId: z.string().min(1),
          })
          .parse(req.body);

        // Verify payment ownership
        const payment = await storage.getPayment(paymentId);
        if (!payment || payment.userId !== userId) {
          throw new AuthorizationError("Pagamento non valido");
        }

        const updatedPayment = await storage.updatePaymentStatus(
          paymentId,
          "completed",
          transactionId,
        );
        await storage.updateUserPremium(userId, true);

        res.json(updatedPayment);
      } catch (error) {
        handleError(error, res, "Errore conferma pagamento");
      }
    },
  );

  // ===== RESET USER DATA =====
  app.delete(
    "/api/user/reset",
    isAuthenticated,
    strictLimiter,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        await storage.resetUserData(userId);
        res.json({
          success: true,
          message: "Tutti i dati sono stati cancellati. Ricomincia da capo!",
        });
      } catch (error) {
        handleError(error, res, "Errore reset dati");
      }
    },
  );

  // ===== VIEW CODE DOCUMENTATION =====
  app.get("/view-code", async (req: Request, res: Response) => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "CODICE_COMPLETO.md");
      const content = await fs.readFile(filePath, "utf-8");

      const html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TrainSmart - Codice Completo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 100%;
      margin: 0;
      padding: 16px;
      background: #0f172a;
      color: #e2e8f0;
      line-height: 1.6;
    }
    pre {
      background: #1e293b;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 13px;
    }
    code {
      background: #1e293b;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 14px;
    }
    h1 { color: #10b981; margin-top: 24px; }
    h2 { color: #34d399; margin-top: 20px; }
    h3 { color: #6ee7b7; margin-top: 16px; }
    a { color: #60a5fa; }
    hr { border: 1px solid #334155; margin: 24px 0; }
    .download-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      font-weight: 600;
    }
  </style>
</head>
<body>
  <a href="/download-code" class="download-btn">📥 Download</a>
  <pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>
      `;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error) {
      console.error("Error serving code:", error);
      res.status(500).send("File non trovato");
    }
  });

  app.get("/download-code", async (req: Request, res: Response) => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "CODICE_COMPLETO.md");
      const content = await fs.readFile(filePath, "utf-8");

      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="CODICE_COMPLETO.md"',
      );
      res.send(content);
    } catch (error) {
      console.error("Error downloading code:", error);
      res.status(500).send("Errore download");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
