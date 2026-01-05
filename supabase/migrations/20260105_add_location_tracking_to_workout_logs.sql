-- =============================================
-- ADD LOCATION TRACKING TO WORKOUT_LOGS
-- =============================================
-- Traccia quando una sessione è stata adattata per una location diversa
-- e permette di escluderla dall'auto-regulation

-- Add new columns
ALTER TABLE workout_logs
ADD COLUMN IF NOT EXISTS is_location_adapted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_location TEXT,
ADD COLUMN IF NOT EXISTS actual_location TEXT,
ADD COLUMN IF NOT EXISTS exclude_from_progression BOOLEAN DEFAULT FALSE;

-- Add check constraint for location values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_original_location'
  ) THEN
    ALTER TABLE workout_logs
    ADD CONSTRAINT valid_original_location
    CHECK (original_location IS NULL OR original_location IN ('gym', 'home', 'home_gym'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_actual_location'
  ) THEN
    ALTER TABLE workout_logs
    ADD CONSTRAINT valid_actual_location
    CHECK (actual_location IS NULL OR actual_location IN ('gym', 'home', 'home_gym'));
  END IF;
END $$;

-- Index for filtering in auto-regulation queries
CREATE INDEX IF NOT EXISTS idx_workout_logs_exclude_progression
ON workout_logs(user_id, program_id, exclude_from_progression)
WHERE exclude_from_progression = FALSE;

-- Comment for documentation
COMMENT ON COLUMN workout_logs.is_location_adapted IS 'True se la sessione è stata adattata per una location diversa dal programma';
COMMENT ON COLUMN workout_logs.original_location IS 'Location originale del programma (gym/home/home_gym)';
COMMENT ON COLUMN workout_logs.actual_location IS 'Location effettiva dove si è svolto l allenamento';
COMMENT ON COLUMN workout_logs.exclude_from_progression IS 'Se true, questa sessione non viene considerata per auto-regulation';

-- =============================================
-- UPDATE RPC FUNCTIONS TO FILTER EXCLUDED SESSIONS
-- =============================================

-- Function: Calculate average RPE for last N sessions (UPDATED - excludes adapted sessions)
CREATE OR REPLACE FUNCTION get_avg_rpe_last_sessions(
  p_user_id UUID,
  p_program_id UUID,
  p_sessions_count INTEGER DEFAULT 2
)
RETURNS TABLE (
  avg_session_rpe DECIMAL(3,1),
  avg_exercise_rpe DECIMAL(3,1),
  sessions_analyzed INTEGER,
  trend VARCHAR(20)
) AS $$
DECLARE
  v_avg_session_rpe DECIMAL(3,1);
  v_avg_exercise_rpe DECIMAL(3,1);
  v_sessions_count INTEGER;
  v_trend VARCHAR(20);
  v_first_rpe DECIMAL(3,1);
  v_last_rpe DECIMAL(3,1);
BEGIN
  -- Get average session RPE (EXCLUDES adapted sessions)
  SELECT
    AVG(wl.session_rpe),
    COUNT(*)
  INTO
    v_avg_session_rpe,
    v_sessions_count
  FROM (
    SELECT session_rpe
    FROM workout_logs
    WHERE user_id = p_user_id
      AND program_id = p_program_id
      AND completed = true
      AND session_rpe IS NOT NULL
      AND (exclude_from_progression = FALSE OR exclude_from_progression IS NULL)
    ORDER BY workout_date DESC
    LIMIT p_sessions_count
  ) wl;

  -- Get average exercise RPE across same sessions (EXCLUDES adapted sessions)
  SELECT AVG(el.exercise_rpe)
  INTO v_avg_exercise_rpe
  FROM exercise_logs el
  JOIN workout_logs wl ON el.workout_log_id = wl.id
  WHERE wl.user_id = p_user_id
    AND wl.program_id = p_program_id
    AND wl.completed = true
    AND (wl.exclude_from_progression = FALSE OR wl.exclude_from_progression IS NULL)
  ORDER BY wl.workout_date DESC
  LIMIT p_sessions_count * 7;

  -- Determine trend (compare first vs last session - EXCLUDES adapted sessions)
  SELECT wl.session_rpe
  INTO v_first_rpe
  FROM workout_logs wl
  WHERE wl.user_id = p_user_id
    AND wl.program_id = p_program_id
    AND wl.completed = true
    AND wl.session_rpe IS NOT NULL
    AND (wl.exclude_from_progression = FALSE OR wl.exclude_from_progression IS NULL)
  ORDER BY wl.workout_date ASC
  LIMIT 1 OFFSET (p_sessions_count - 1);

  SELECT wl.session_rpe
  INTO v_last_rpe
  FROM workout_logs wl
  WHERE wl.user_id = p_user_id
    AND wl.program_id = p_program_id
    AND wl.completed = true
    AND wl.session_rpe IS NOT NULL
    AND (wl.exclude_from_progression = FALSE OR wl.exclude_from_progression IS NULL)
  ORDER BY wl.workout_date DESC
  LIMIT 1;

  -- Calculate trend
  IF v_last_rpe IS NULL OR v_first_rpe IS NULL THEN
    v_trend := 'insufficient_data';
  ELSIF v_last_rpe > v_first_rpe + 0.5 THEN
    v_trend := 'increasing';
  ELSIF v_last_rpe < v_first_rpe - 0.5 THEN
    v_trend := 'decreasing';
  ELSE
    v_trend := 'stable';
  END IF;

  RETURN QUERY SELECT
    v_avg_session_rpe,
    v_avg_exercise_rpe,
    v_sessions_count,
    v_trend;
END;
$$ LANGUAGE plpgsql;

-- Function: Get exercises that need adjustment (UPDATED - excludes adapted sessions)
CREATE OR REPLACE FUNCTION get_exercises_needing_adjustment(
  p_user_id UUID,
  p_program_id UUID,
  p_sessions_count INTEGER DEFAULT 2
)
RETURNS TABLE (
  exercise_name VARCHAR(200),
  pattern VARCHAR(50),
  avg_rpe DECIMAL(3,1),
  occurrences INTEGER,
  adjustment_needed VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    el.exercise_name,
    el.pattern,
    AVG(el.exercise_rpe)::DECIMAL(3,1) as avg_rpe,
    COUNT(*)::INTEGER as occurrences,
    CASE
      WHEN AVG(el.exercise_rpe) > 8.5 THEN 'decrease_volume'::VARCHAR(20)
      WHEN AVG(el.exercise_rpe) < 6.0 THEN 'increase_volume'::VARCHAR(20)
      ELSE 'none'::VARCHAR(20)
    END as adjustment_needed
  FROM exercise_logs el
  JOIN workout_logs wl ON el.workout_log_id = wl.id
  WHERE wl.user_id = p_user_id
    AND wl.program_id = p_program_id
    AND wl.completed = true
    AND (wl.exclude_from_progression = FALSE OR wl.exclude_from_progression IS NULL)
  GROUP BY el.exercise_name, el.pattern
  HAVING COUNT(*) >= p_sessions_count
    AND (AVG(el.exercise_rpe) > 8.5 OR AVG(el.exercise_rpe) < 6.0)
  ORDER BY AVG(el.exercise_rpe) DESC;
END;
$$ LANGUAGE plpgsql;
