/**
 * Service layer exports for TrainSmart
 *
 * All services use dependency injection for the Supabase client.
 * Each platform (web/mobile) should initialize the services with their
 * respective Supabase client instance.
 *
 * Usage:
 * ```typescript
 * import { initProgramService, createProgram } from '@fitnessflow/shared';
 * import { supabase } from './supabaseClient';
 *
 * // Initialize once at app startup
 * initProgramService(supabase);
 *
 * // Then use the service functions
 * const result = await createProgram(programData);
 * ```
 */

// Program Service
export {
  initProgramService,
  createProgram,
  getActiveProgram,
  getAllPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
  setActiveProgram,
  completeProgram,
  clearProgramCache,
  migrateLocalStorageToSupabase,
  syncProgramsFromCloud,
  type TrainingProgram,
  type ProgramServiceResponse,
} from './programService';

// Auto-Regulation Service
export {
  initAutoRegulationService,
  logWorkout,
  createWorkoutLog,
  addExerciseLog,
  completeWorkout,
  analyzeRPE,
  getExercisesNeedingAdjustment,
  applyAutoRegulation,
  applyAdjustmentToProgram,
  getPendingAdjustments,
  rejectAdjustment,
  postponeAdjustment,
  acceptAndApplyAdjustment,
  getRecentWorkouts,
  getWorkoutExercises,
  getAdjustmentHistory,
  type WorkoutLog,
  type WorkoutLogInput,
  type ExerciseLog,
  type RPEAnalysis,
  type ExerciseAdjustment,
  type ProgramAdjustment,
} from './autoRegulationService';

// Admin Service
export {
  initAdminService,
  isAdmin,
  getUserRole,
  getBusinessMetrics,
  getAggregatedMetrics,
  getUsersAnalytics,
  getRPETrends,
  getProgramPopularity,
  getAdminDashboardData,
  grantAdminRole,
  getAllUserRoles,
  type UserRole,
  type BusinessMetrics,
  type UserAnalytics,
  type RPETrend,
  type ProgramPopularity,
  type AdminDashboardData,
} from './adminService';

// Streak Service
export {
  initStreakService,
  getStreak,
  updateStreak,
  getStreakMilestones,
  checkNewMilestone,
  resetStreak,
  getStreakLeaderboard,
  recalculateStreak,
  STREAK_MILESTONES,
} from './streakService';

// Personal Records Service
export {
  initPersonalRecordsService,
  getAllPRs,
  getPRByExercise,
  getPRHistory,
  checkForNewPR,
  createOrUpdatePR,
  getRecentPRs,
  getPRSummary,
  getPRCount,
  deletePR,
  getPRLeaderboard,
} from './personalRecordsService';

// Achievement Service
export {
  initAchievementService,
  getAllAchievements,
  getUserAchievements,
  getAchievementProgress,
  unlockAchievement,
  checkAndUnlockAchievements,
  markAchievementShared,
  getAchievementLeaderboard,
} from './achievementService';

// Follow Service
export {
  initFollowService,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStats,
  isFollowing,
  searchUsers,
} from './followService';

// Social Service
export {
  initSocialService,
  createPost,
  getPost,
  getFeed,
  getUserPosts,
  getFollowingFeed,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
} from './socialService';

// Pain Tracking Service
export {
  initPainTrackingService,
  reportWorkoutPain,
  reportWorkoutPainClientSide,
  getPainTracking,
  getPainTrackingByArea,
  getPendingRehabilitationOffers,
  resetPainTracking,
  resetAllPainTracking,
} from './painTrackingService';

// Rehabilitation Service
export {
  initRehabilitationService,
  respondToRehabilitation,
  getActiveRehabilitations,
  getRehabilitationByArea,
  getRehabilitationProgram,
  getRehabilitationSessionExercises,
  completeRehabilitationSession,
  completeRehabilitation,
  pauseRehabilitation,
  resumeRehabilitation,
  getRehabilitationHistory,
  getRehabilitationDashboardCards,
  REHABILITATION_PROGRAMS,
} from './rehabilitationService';

// Default exports for convenience
export { default as autoRegulationService } from './autoRegulationService';
export { default as streakService } from './streakService';
export { default as personalRecordsService } from './personalRecordsService';
export { default as achievementService } from './achievementService';
export { default as painTrackingService } from './painTrackingService';
export { default as rehabilitationService } from './rehabilitationService';
export { default as followService } from './followService';
export { default as socialService } from './socialService';

// Free Weight Suggestion Service
export {
  shouldSuggestFreeWeight,
  isInOptimalCondition,
  getUserMachinePreference,
  findFreeWeightAlternative,
  markSuggestionShown,
  recordSuggestionResponse,
  type RecoveryConditions,
  type FreeWeightSuggestion,
} from './freeWeightSuggestionService';
