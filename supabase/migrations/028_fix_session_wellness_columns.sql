-- =====================================================
-- FIX: Add missing columns to session_wellness
-- =====================================================
-- La tabella session_wellness esiste già da 027_coherence_fixes.sql
-- ma trainsmart-fixes/001_coherence_fixes.sql richiede colonne aggiuntive

-- Aggiungi colonne mancanti a session_wellness
ALTER TABLE session_wellness
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES training_programs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS readiness_category TEXT CHECK (readiness_category IN ('optimal', 'good', 'moderate', 'reduced', 'rest_recommended')),
ADD COLUMN IF NOT EXISTS post_workout_pain JSONB,
ADD COLUMN IF NOT EXISTS session_rpe INTEGER CHECK (session_rpe >= 1 AND session_rpe <= 10),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- Aggiungi colonne mancanti a user_assessments (se non esistono)
ALTER TABLE user_assessments
ADD COLUMN IF NOT EXISTS assessment_data JSONB,
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS score NUMERIC,
ADD COLUMN IF NOT EXISTS pattern_baselines JSONB;

-- Aggiungi colonne mancanti a pain_history (se non esistono)
ALTER TABLE pain_history
ADD COLUMN IF NOT EXISTS pain_type TEXT,
ADD COLUMN IF NOT EXISTS set_number INTEGER,
ADD COLUMN IF NOT EXISTS weight_used NUMERIC,
ADD COLUMN IF NOT EXISTS reported_during TEXT;

-- Aggiungi _normalized a training_programs (se non esiste)
ALTER TABLE training_programs
ADD COLUMN IF NOT EXISTS _normalized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS _normalized_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS _original_structure TEXT;

-- Aggiungi screening columns a user_profiles (se la tabella esiste)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        ALTER TABLE user_profiles
        ADD COLUMN IF NOT EXISTS screening_completed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS screening_level TEXT,
        ADD COLUMN IF NOT EXISTS screening_score NUMERIC,
        ADD COLUMN IF NOT EXISTS pattern_baselines JSONB;
    END IF;
END $$;

-- =====================================================
-- UNIQUE CONSTRAINT per session_wellness
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'session_wellness_user_session_unique'
    ) THEN
        ALTER TABLE session_wellness
        ADD CONSTRAINT session_wellness_user_session_unique UNIQUE (user_id, session_id);
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Constraint already exists or cannot be added';
END $$;

-- =====================================================
-- HELPER FUNCTIONS (if not exist)
-- =====================================================

-- Function to get user's active modifications for a program
CREATE OR REPLACE FUNCTION get_active_modifications(
  p_user_id UUID,
  p_program_id UUID
)
RETURNS TABLE (
  exercise_name TEXT,
  current_variant TEXT,
  current_weight NUMERIC,
  current_tempo TEXT,
  reason TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    exercise_name,
    current_variant,
    current_weight,
    current_tempo,
    reason
  FROM exercise_modifications
  WHERE user_id = p_user_id
    AND program_id = p_program_id
    AND is_active = TRUE
  ORDER BY updated_at DESC;
$$;

-- Function to get pain trend for an area
CREATE OR REPLACE FUNCTION get_pain_trend(
  p_user_id UUID,
  p_area TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  avg_severity NUMERIC,
  count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    DATE(reported_at) as date,
    AVG(severity)::NUMERIC(3,1) as avg_severity,
    COUNT(*) as count
  FROM pain_history
  WHERE user_id = p_user_id
    AND pain_area = p_area
    AND reported_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(reported_at)
  ORDER BY date DESC;
$$;

-- =====================================================
-- VERIFY
-- =====================================================
SELECT
  'session_wellness' as table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'session_wellness') as column_count
UNION ALL
SELECT
  'user_assessments',
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'user_assessments')
UNION ALL
SELECT
  'pain_history',
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'pain_history')
UNION ALL
SELECT
  'training_programs',
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'training_programs');
