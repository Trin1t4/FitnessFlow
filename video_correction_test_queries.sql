-- ================================================
-- VIDEO CORRECTION SYSTEM - TEST SQL QUERIES
-- ================================================
-- Copy-paste questi script su Supabase SQL Editor
-- Sostituisci 'YOUR_USER_ID' con il tuo user ID reale

-- ================================================
-- 1. GET YOUR USER ID
-- ================================================
-- Trova il tuo user ID (usa l'email per identificarti)
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- OPPURE cerca per email specifica:
SELECT id, email, created_at
FROM auth.users
WHERE email = 'your-email@example.com';

-- Copia l'ID e sostituiscilo in tutti i query seguenti

-- ================================================
-- 2. VERIFY DATABASE SETUP
-- ================================================

-- 2.1 Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('video_corrections', 'correction_quota_history');
-- Expected: 2 rows

-- 2.2 Check RPC functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%video%';
-- Expected: 2 functions

-- 2.3 Check storage bucket
SELECT name, public
FROM storage.buckets
WHERE name = 'user-exercise-videos';
-- Expected: 1 row (name = user-exercise-videos, public = false)

-- 2.4 Check RLS policies on video_corrections
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'video_corrections';
-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- ================================================
-- 3. CHECK USER SUBSCRIPTION STATUS
-- ================================================

-- Replace YOUR_USER_ID with your actual user ID
SELECT
  id,
  email,
  subscription_tier,
  video_corrections_used,
  video_corrections_reset_date,
  subscription_start_date,
  subscription_end_date,
  created_at
FROM users
WHERE id = 'YOUR_USER_ID';

-- Expected for new user:
-- subscription_tier = 'free'
-- video_corrections_used = 0
-- created_at = recent date

-- ================================================
-- 4. TEST QUOTA CHECK FUNCTION
-- ================================================

-- Test RPC function (replace YOUR_USER_ID)
SELECT check_video_correction_quota('YOUR_USER_ID');

-- Expected output (JSON):
-- {
--   "can_upload": true,
--   "tier": "free",
--   "used": 0,
--   "max_allowed": 1,
--   "remaining": 1,
--   "reset_date": "...",
--   "days_until_reset": ...
-- }

-- ================================================
-- 5. VIEW RECENT VIDEO CORRECTIONS
-- ================================================

-- See all video corrections for your user
SELECT
  id,
  exercise_name,
  exercise_pattern,
  processing_status,
  feedback_score,
  feedback_issues,
  feedback_corrections,
  feedback_warnings,
  load_recommendation,
  viewed_at,
  created_at
FROM video_corrections
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 10;

-- ================================================
-- 6. CHECK LATEST VIDEO CORRECTION STATUS
-- ================================================

-- Get latest correction details
SELECT
  id,
  video_filename,
  exercise_name,
  processing_status,
  feedback_score,
  error_message,
  created_at,
  -- Time elapsed since creation
  EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_elapsed
FROM video_corrections
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

-- If processing_status = 'pending' and seconds_elapsed > 120:
-- → Check Edge Function logs for errors

-- ================================================
-- 7. VIEW PROCESSING HISTORY
-- ================================================

-- Count corrections by status
SELECT
  processing_status,
  COUNT(*) as count
FROM video_corrections
WHERE user_id = 'YOUR_USER_ID'
GROUP BY processing_status;

-- ================================================
-- 8. SIMULATE DIFFERENT SUBSCRIPTION TIERS
-- ================================================

-- 8.1 Simulate FREE tier (1 video available)
UPDATE users
SET
  subscription_tier = 'free',
  video_corrections_used = 0
WHERE id = 'YOUR_USER_ID';

-- Test quota again:
SELECT check_video_correction_quota('YOUR_USER_ID');
-- Expected: can_upload = true, max_allowed = 1, remaining = 1

-- 8.2 Simulate FREE tier quota exhausted
UPDATE users
SET
  subscription_tier = 'free',
  video_corrections_used = 1
WHERE id = 'YOUR_USER_ID';

-- Test quota:
SELECT check_video_correction_quota('YOUR_USER_ID');
-- Expected: can_upload = false, remaining = 0

-- 8.3 Simulate PRO tier (12 videos available)
UPDATE users
SET
  subscription_tier = 'pro',
  video_corrections_used = 0,
  subscription_start_date = NOW(),
  subscription_end_date = NOW() + INTERVAL '42 days'
WHERE id = 'YOUR_USER_ID';

-- Test quota:
SELECT check_video_correction_quota('YOUR_USER_ID');
-- Expected: can_upload = true, max_allowed = 12, remaining = 12

-- 8.4 Simulate PREMIUM tier (unlimited videos)
UPDATE users
SET
  subscription_tier = 'premium',
  video_corrections_used = 50, -- Even after 50, still unlimited
  subscription_start_date = NOW(),
  subscription_end_date = NOW() + INTERVAL '42 days'
WHERE id = 'YOUR_USER_ID';

-- Test quota:
SELECT check_video_correction_quota('YOUR_USER_ID');
-- Expected: can_upload = true, max_allowed = 999, remaining = 949

-- 8.5 RESET to FREE tier (default)
UPDATE users
SET
  subscription_tier = 'free',
  video_corrections_used = 0,
  subscription_start_date = NULL,
  subscription_end_date = NULL
WHERE id = 'YOUR_USER_ID';

-- ================================================
-- 9. SIMULATE PAYWALL TRIGGER (7+ days)
-- ================================================

-- 9.1 Simulate user created 8 days ago (paywall should show)
UPDATE users
SET
  created_at = NOW() - INTERVAL '8 days',
  subscription_tier = 'free'
WHERE id = 'YOUR_USER_ID';

-- Now reload Dashboard → PaywallModal should appear automatically

-- 9.2 Check how many days since signup
SELECT
  id,
  email,
  created_at,
  subscription_tier,
  EXTRACT(DAY FROM (NOW() - created_at)) as days_since_signup
FROM users
WHERE id = 'YOUR_USER_ID';

-- If days_since_signup >= 7 AND subscription_tier = 'free':
-- → Paywall should show

-- 9.3 RESET created_at to current time (disable paywall)
UPDATE users
SET created_at = NOW()
WHERE id = 'YOUR_USER_ID';

-- ================================================
-- 10. DEBUGGING: CHECK FAILED PROCESSINGS
-- ================================================

-- See all failed video corrections
SELECT
  id,
  exercise_name,
  video_filename,
  error_message,
  created_at
FROM video_corrections
WHERE processing_status = 'failed'
AND user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;

-- ================================================
-- 11. CLEANUP: DELETE TEST DATA
-- ================================================

-- WARNING: This deletes ALL your video corrections!
-- Use with caution, only for testing

-- Delete all video corrections
DELETE FROM video_corrections
WHERE user_id = 'YOUR_USER_ID';

-- Reset user quota
UPDATE users
SET
  video_corrections_used = 0,
  subscription_tier = 'free',
  created_at = NOW()
WHERE id = 'YOUR_USER_ID';

-- ================================================
-- 12. ANALYTICS: USAGE STATS
-- ================================================

-- See video correction usage per day
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_uploads,
  COUNT(*) FILTER (WHERE processing_status = 'completed') as successful,
  COUNT(*) FILTER (WHERE processing_status = 'failed') as failed,
  AVG(feedback_score) FILTER (WHERE processing_status = 'completed') as avg_score
FROM video_corrections
WHERE user_id = 'YOUR_USER_ID'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- See most common exercises analyzed
SELECT
  exercise_name,
  COUNT(*) as count,
  AVG(feedback_score) as avg_score,
  MIN(feedback_score) as min_score,
  MAX(feedback_score) as max_score
FROM video_corrections
WHERE user_id = 'YOUR_USER_ID'
AND processing_status = 'completed'
GROUP BY exercise_name
ORDER BY count DESC;

-- ================================================
-- 13. MANUALLY INSERT TEST CORRECTION (for UI testing)
-- ================================================

-- Insert a fake completed correction to test feedback view
INSERT INTO video_corrections (
  user_id,
  video_url,
  video_filename,
  exercise_name,
  exercise_pattern,
  processing_status,
  feedback_score,
  feedback_issues,
  feedback_corrections,
  feedback_warnings,
  load_recommendation
) VALUES (
  'YOUR_USER_ID',
  'test/fake_video.mp4',
  'fake_test_video.mp4',
  'Push-up',
  'horizontal_push',
  'completed',
  7,
  '[
    {
      "name": "elbow_flare",
      "severity": "medium",
      "description": "Elbows flaring out wider than 45 degrees, increasing shoulder stress",
      "timestamp_seconds": [3, 5, 8]
    },
    {
      "name": "incomplete_range",
      "severity": "low",
      "description": "Not descending to full chest-to-floor depth",
      "timestamp_seconds": [4, 9]
    }
  ]'::jsonb,
  '[
    "Mantieni i gomiti più vicini al corpo (30-45 gradi)",
    "Scendi fino a quasi toccare il pavimento col petto",
    "Attiva i core per mantenere la hollow body position"
  ]'::jsonb,
  '["Attento alla posizione dei gomiti per evitare stress alla spalla"]'::jsonb,
  'maintain'
);

-- Get the ID of the inserted record
SELECT id
FROM video_corrections
WHERE exercise_name = 'Push-up'
AND user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

-- Navigate to: http://localhost:5177/video-feedback/{ID}

-- ================================================
-- 14. TEST QUOTA INCREMENT FUNCTION
-- ================================================

-- Manually test increment function
SELECT increment_video_correction_usage('YOUR_USER_ID');

-- Check usage increased
SELECT
  subscription_tier,
  video_corrections_used
FROM users
WHERE id = 'YOUR_USER_ID';

-- ================================================
-- 15. STORAGE: CHECK UPLOADED VIDEOS
-- ================================================

-- List all videos in storage for your user
SELECT
  name,
  metadata,
  created_at,
  updated_at
FROM storage.objects
WHERE bucket_id = 'user-exercise-videos'
AND name LIKE 'YOUR_USER_ID/%'
ORDER BY created_at DESC;

-- Get file sizes
SELECT
  name,
  metadata->>'size' as size_bytes,
  (metadata->>'size')::bigint / 1024 as size_kb,
  (metadata->>'size')::bigint / 1024 / 1024 as size_mb
FROM storage.objects
WHERE bucket_id = 'user-exercise-videos'
AND name LIKE 'YOUR_USER_ID/%'
ORDER BY created_at DESC;

-- ================================================
-- 16. ADMIN: SYSTEM-WIDE STATS (optional)
-- ================================================

-- Total corrections by tier
SELECT
  u.subscription_tier,
  COUNT(vc.id) as total_corrections,
  AVG(vc.feedback_score) as avg_score
FROM video_corrections vc
JOIN users u ON u.id = vc.user_id
WHERE vc.processing_status = 'completed'
GROUP BY u.subscription_tier;

-- Processing success rate
SELECT
  processing_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM video_corrections
GROUP BY processing_status;

-- ================================================
-- END OF TEST QUERIES
-- ================================================
