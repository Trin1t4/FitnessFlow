-- ================================================================
-- PROGRESSIVE WORKOUT SAVE SYSTEM
-- ================================================================
-- Permette di salvare il workout progressivamente durante la sessione
-- così se l'utente chiude l'app può riprendere da dove era
-- ================================================================

-- ================================================================
-- 1. ADD STATUS COLUMN TO WORKOUT_LOGS
-- ================================================================
ALTER TABLE workout_logs
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Update existing records
UPDATE workout_logs
SET status = CASE
  WHEN completed = true THEN 'completed'
  ELSE 'abandoned'
END
WHERE status IS NULL;

-- Add constraint
ALTER TABLE workout_logs
  DROP CONSTRAINT IF EXISTS workout_logs_status_check;

ALTER TABLE workout_logs
  ADD CONSTRAINT workout_logs_status_check
  CHECK (status IN ('in_progress', 'completed', 'abandoned'));

-- ================================================================
-- 2. ADD PROGRESS TRACKING COLUMNS
-- ================================================================
ALTER TABLE workout_logs
  ADD COLUMN IF NOT EXISTS current_exercise_index INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_set INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMPTZ DEFAULT NOW();

-- ================================================================
-- 3. ADD SET-LEVEL LOGS TABLE (for real-time saving)
-- ================================================================
CREATE TABLE IF NOT EXISTS set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,

  -- Exercise Info
  exercise_name VARCHAR(200) NOT NULL,
  exercise_index INTEGER NOT NULL,
  set_number INTEGER NOT NULL,

  -- Performance Data
  reps_completed INTEGER NOT NULL,
  weight_used DECIMAL(6,2),
  rpe DECIMAL(3,1),
  rir INTEGER, -- Reps In Reserve

  -- Adjustments
  was_adjusted BOOLEAN DEFAULT false,
  adjustment_reason VARCHAR(100),

  -- Metadata
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint per exercise/set
  CONSTRAINT set_logs_unique UNIQUE (workout_log_id, exercise_name, set_number)
);

-- ================================================================
-- 4. INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_workout_logs_status
  ON workout_logs(user_id, status);

CREATE INDEX IF NOT EXISTS idx_workout_logs_in_progress
  ON workout_logs(user_id, status)
  WHERE status = 'in_progress';

CREATE INDEX IF NOT EXISTS idx_set_logs_workout
  ON set_logs(workout_log_id);

-- ================================================================
-- 5. RLS POLICIES FOR SET_LOGS
-- ================================================================
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
CREATE POLICY "Users can view own set logs"
  ON set_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own set logs" ON set_logs;
CREATE POLICY "Users can create own set logs"
  ON set_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
CREATE POLICY "Users can update own set logs"
  ON set_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;
CREATE POLICY "Users can delete own set logs"
  ON set_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- ================================================================
-- 6. HELPER FUNCTIONS
-- ================================================================

-- Function: Get in-progress workout for user
CREATE OR REPLACE FUNCTION get_in_progress_workout(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  program_id UUID,
  day_name VARCHAR(50),
  workout_date TIMESTAMPTZ,
  current_exercise_index INTEGER,
  current_set INTEGER,
  exercises_completed INTEGER,
  total_exercises INTEGER,
  last_saved_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wl.id,
    wl.program_id,
    wl.day_name,
    wl.workout_date,
    wl.current_exercise_index,
    wl.current_set,
    wl.exercises_completed,
    wl.total_exercises,
    wl.last_saved_at
  FROM workout_logs wl
  WHERE wl.user_id = p_user_id
    AND wl.status = 'in_progress'
  ORDER BY wl.workout_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function: Get sets for a workout
CREATE OR REPLACE FUNCTION get_workout_sets(p_workout_log_id UUID)
RETURNS TABLE (
  exercise_name VARCHAR(200),
  exercise_index INTEGER,
  set_number INTEGER,
  reps_completed INTEGER,
  weight_used DECIMAL(6,2),
  rpe DECIMAL(3,1),
  rir INTEGER,
  was_adjusted BOOLEAN,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sl.exercise_name,
    sl.exercise_index,
    sl.set_number,
    sl.reps_completed,
    sl.weight_used,
    sl.rpe,
    sl.rir,
    sl.was_adjusted,
    sl.completed_at
  FROM set_logs sl
  WHERE sl.workout_log_id = p_workout_log_id
  ORDER BY sl.exercise_index, sl.set_number;
END;
$$ LANGUAGE plpgsql;

-- Function: Abandon old in-progress workouts (older than 24h)
CREATE OR REPLACE FUNCTION cleanup_abandoned_workouts()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE workout_logs
  SET status = 'abandoned',
      completed = false
  WHERE status = 'in_progress'
    AND last_saved_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
