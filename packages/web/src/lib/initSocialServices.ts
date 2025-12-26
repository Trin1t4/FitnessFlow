/**
 * Social Services Initialization
 * Initialize all social-related services with Supabase client
 */

import { supabase } from './supabaseClient';
import {
  initStreakService,
  initPersonalRecordsService,
  initAchievementService,
  initFollowService,
  initSocialService,
  initSkipTrackingService,
  initProgressiveWorkoutService,
} from '@trainsmart/shared';

let initialized = false;

/**
 * Initialize all social services with Supabase client
 * Call this once at app startup
 */
export function initializeSocialServices(): void {
  if (initialized) {
    console.log('[SocialServices] Already initialized');
    return;
  }

  initStreakService(supabase);
  initPersonalRecordsService(supabase);
  initAchievementService(supabase);
  initFollowService(supabase);
  initSocialService(supabase);
  initSkipTrackingService(supabase);
  initProgressiveWorkoutService(supabase);

  initialized = true;
  console.log('[SocialServices] All services initialized (skip tracking + progressive workout)');
}

/**
 * Check if services are initialized
 */
export function areSocialServicesInitialized(): boolean {
  return initialized;
}

export default initializeSocialServices;
