import { pgTable, serial, text, integer, real, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// ===== EXISTING TABLES (aggiornate) =====

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profilePictureUrl: text("profile_picture_url"),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("none"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionId: varchar("subscription_id", { length: 255 }),
  
  // AI Usage Tracking
  aiCorrectionsUsed: integer("ai_corrections_used").default(0),
  aiVideoCorrectionsUsed: integer("ai_video_corrections_used").default(0),
  aiPhotoAnalysisUsed: integer("ai_photo_analysis_used").default(0),
  lastAiCorrectionDate: timestamp("last_ai_correction_date"),
  lastAiVideoDate: timestamp("last_ai_video_date"),
  lastAiPhotoDate: timestamp("last_ai_photo_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
