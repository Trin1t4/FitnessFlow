// Type definitions for client-side use
// Separated from schema.ts to avoid importing server-side dependencies

export type User = {
  id: number;
  username: string;
  email: string;
  profilePictureUrl: string | null;
  subscriptionTier: string | null;
  subscriptionStartDate: Date | null;
  subscriptionId: string | null;
  aiCorrectionsUsed: number | null;
  aiVideoCorrectionsUsed: number | null;
  aiPhotoAnalysisUsed: number | null;
  lastAiCorrectionDate: Date | null;
  lastAiVideoDate: Date | null;
  lastAiPhotoDate: Date | null;
  createdAt: Date | null;
};
