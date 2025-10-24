import {
  users,
  screenings,
  quizResults,
  assessments,
  programs,
  workouts,
  workoutSets,
  weeklyProgress,
  personalRecords,
  payments,
  workoutAdaptations,
  type User,
  type UpsertUser,
  type Screening,
  type InsertScreening,
  type QuizResult,
  type InsertQuizResult,
  type Assessment,
  type InsertAssessment,
  type Program,
  type InsertProgram,
  type Workout,
  type InsertWorkout,
  type WorkoutSet,
  type InsertWorkoutSet,
  type Payment,
  type InsertPayment,
  type WorkoutAdaptation,
  type InsertWorkoutAdaptation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export class DatabaseStorage {
  // ===== USERS =====
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

  async updateUserPremium(userId: string, isPremium: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isPremium, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // ===== SCREENING =====
  async saveScreening(data: InsertScreening): Promise<Screening> {
    const [screening] = await db.insert(screenings).values(data).returning();
    return screening;
  }

  async getLatestScreening(userId: string): Promise<Screening | undefined> {
    const [screening] = await db
      .select()
      .from(screenings)
      .where(eq(screenings.userId, userId))
      .orderBy(desc(screenings.createdAt))
      .limit(1);
    return screening;
  }

  async updateScreeningLevel(
    screeningId: string,
    level: string,
  ): Promise<void> {
    await db
      .update(screenings)
      .set({ level })
      .where(eq(screenings.id, screeningId));
  }

  // ===== QUIZ =====
  async saveQuizResult(data: InsertQuizResult): Promise<QuizResult> {
    const [result] = await db.insert(quizResults).values(data).returning();
    return result;
  }

  async getLatestQuiz(userId: string): Promise<QuizResult | undefined> {
    const [quiz] = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.createdAt))
      .limit(1);
    return quiz;
  }

  // ===== ASSESSMENTS =====
  async saveAssessment(data: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db.insert(assessments).values(data).returning();
    return assessment;
  }

  async getLatestAssessments(userId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt))
      .limit(10);
  }

  // ===== PROGRAMS =====
  async createProgram(data: InsertProgram): Promise<Program> {
    // Disattiva programmi precedenti
    await db
      .update(programs)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(eq(programs.userId, data.userId), eq(programs.isActive, true)),
      );

    const [program] = await db.insert(programs).values(data).returning();
    return program;
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id));
    return program;
  }

  async getActiveProgram(userId: string): Promise<Program | undefined> {
    const [program] = await db
      .select()
      .from(programs)
      .where(and(eq(programs.userId, userId), eq(programs.isActive, true)))
      .orderBy(desc(programs.createdAt))
      .limit(1);
    return program;
  }

  async getUserPrograms(userId: string): Promise<Program[]> {
    return await db
      .select()
      .from(programs)
      .where(eq(programs.userId, userId))
      .orderBy(desc(programs.createdAt))
      .limit(20);
  }

  async updateProgramStatus(
    programId: string,
    isActive: boolean,
  ): Promise<void> {
    await db
      .update(programs)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(programs.id, programId));
  }

  // ===== WORKOUTS =====
  async createWorkout(data: InsertWorkout): Promise<Workout> {
    const [workout] = await db.insert(workouts).values(data).returning();
    return workout;
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    const [workout] = await db
      .select()
      .from(workouts)
      .where(eq(workouts.id, id));
    return workout;
  }

  async completeWorkout(
    workoutId: string,
    duration: number,
    totalVolume: number,
  ): Promise<Workout> {
    const [workout] = await db
      .update(workouts)
      .set({
        status: "completed",
        completedAt: new Date(),
        duration,
        totalVolume: totalVolume.toString(),
      })
      .where(eq(workouts.id, workoutId))
      .returning();
    return workout;
  }

  async getUserWorkouts(
    userId: string,
    limit: number = 50,
  ): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.startedAt))
      .limit(limit);
  }

  async getRecentWorkoutsWithPain(
    userId: string,
    limit: number = 6,
  ): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.userId, userId), eq(workouts.status, "completed")))
      .orderBy(desc(workouts.completedAt))
      .limit(limit);
  }

  // ===== WORKOUT SETS =====
  async saveWorkoutSet(data: InsertWorkoutSet): Promise<WorkoutSet> {
    const [set] = await db.insert(workoutSets).values(data).returning();
    return set;
  }

  async getWorkoutSets(workoutId: string): Promise<WorkoutSet[]> {
    return await db
      .select()
      .from(workoutSets)
      .where(eq(workoutSets.workoutId, workoutId))
      .orderBy(workoutSets.setNumber);
  }

  // ===== WEEKLY PROGRESS =====
  async updateWeeklyProgress(userId: string, weekStart: Date): Promise<void> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const workoutsThisWeek = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          eq(workouts.status, "completed"),
          gte(workouts.completedAt, weekStart),
        ),
      );

    const totalVolume = workoutsThisWeek.reduce(
      (sum, w) => sum + parseFloat(w.totalVolume || "0"),
      0,
    );

    const avgPainLevel =
      workoutsThisWeek.length > 0
        ? workoutsThisWeek.reduce((sum, w) => sum + (w.painLevel || 0), 0) /
          workoutsThisWeek.length
        : 0;

    await db
      .insert(weeklyProgress)
      .values({
        userId,
        weekStart,
        workoutsCompleted: workoutsThisWeek.length,
        totalVolume: totalVolume.toString(),
        avgPainLevel: avgPainLevel.toFixed(2),
      })
      .onConflictDoUpdate({
        target: [weeklyProgress.userId, weeklyProgress.weekStart],
        set: {
          workoutsCompleted: workoutsThisWeek.length,
          totalVolume: totalVolume.toString(),
          avgPainLevel: avgPainLevel.toFixed(2),
          updatedAt: new Date(),
        },
      });
  }

  async getWeeklyProgress(userId: string, weeks: number = 12): Promise<any[]> {
    return await db
      .select()
      .from(weeklyProgress)
      .where(eq(weeklyProgress.userId, userId))
      .orderBy(desc(weeklyProgress.weekStart))
      .limit(weeks);
  }

  // ===== PERSONAL RECORDS =====
  async getUserPRs(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, userId))
      .orderBy(desc(personalRecords.achievedAt))
      .limit(50);
  }

  // ===== PAYMENTS =====
  async createPayment(data: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    return payment;
  }

  async updatePaymentStatus(
    paymentId: string,
    status: string,
    transactionId?: string,
  ): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({
        status,
        transactionId,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();
    return payment;
  }

  // ===== WORKOUT ADAPTATIONS =====
  async createWorkoutAdaptation(data: InsertWorkoutAdaptation): Promise<WorkoutAdaptation> {
    // Cancella eventuali adaptation precedenti per lo stesso workout
    await db
      .delete(workoutAdaptations)
      .where(
        and(
          eq(workoutAdaptations.userId, data.userId),
          eq(workoutAdaptations.programId, data.programId),
          eq(workoutAdaptations.dayName, data.dayName)
        )
      );

    const [adaptation] = await db
      .insert(workoutAdaptations)
      .values(data)
      .returning();
    return adaptation;
  }

  async getWorkoutAdaptation(
    userId: string,
    programId: string,
    dayName: string
  ): Promise<WorkoutAdaptation | undefined> {
    const [adaptation] = await db
      .select()
      .from(workoutAdaptations)
      .where(
        and(
          eq(workoutAdaptations.userId, userId),
          eq(workoutAdaptations.programId, programId),
          eq(workoutAdaptations.dayName, dayName),
          eq(workoutAdaptations.used, false)
        )
      )
      .orderBy(desc(workoutAdaptations.createdAt))
      .limit(1);
    return adaptation;
  }

  async markAdaptationAsUsed(adaptationId: string): Promise<void> {
    await db
      .update(workoutAdaptations)
      .set({ used: true })
      .where(eq(workoutAdaptations.id, adaptationId));
  }

  async deleteOldAdaptations(): Promise<void> {
    // Elimina adaptations più vecchie di 24h o già usate
    await db
      .delete(workoutAdaptations)
      .where(
        sql`${workoutAdaptations.createdAt} < NOW() - INTERVAL '24 hours' OR ${workoutAdaptations.used} = true`
      );
  }

  // ===== UTILITIES =====
  async resetUserData(userId: string): Promise<void> {
    // Elimina tutti i dati utente (tranne l'account)
    await db
      .delete(workoutSets)
      .where(
        sql`${workoutSets.workoutId} IN (SELECT id FROM ${workouts} WHERE ${workouts.userId} = ${userId})`,
      );
    await db.delete(workouts).where(eq(workouts.userId, userId));
    await db.delete(programs).where(eq(programs.userId, userId));
    await db.delete(assessments).where(eq(assessments.userId, userId));
    await db.delete(quizResults).where(eq(quizResults.userId, userId));
    await db.delete(screenings).where(eq(screenings.userId, userId));
    await db.delete(weeklyProgress).where(eq(weeklyProgress.userId, userId));
    await db.delete(personalRecords).where(eq(personalRecords.userId, userId));
    await db.delete(workoutAdaptations).where(eq(workoutAdaptations.userId, userId));
  }
}

export const storage = new DatabaseStorage();
