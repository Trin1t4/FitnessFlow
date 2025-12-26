-- ================================================================
-- EXERCISE SKIP TRACKING SYSTEM
-- ================================================================
-- Traccia quando l'utente salta esercizi per identificare pattern
-- e suggerire riduzioni di carico preventive per evitare infortuni
--
-- LOGICA:
-- Se un utente salta esercizi dello stesso pattern/gruppo muscolare
-- per 3 sedute consecutive → feedback + riduzione carico automatica
-- ================================================================

-- ================================================================
-- 1. EXERCISE SKIPS (Log degli esercizi saltati)
-- ================================================================
CREATE TABLE IF NOT EXISTS exercise_skips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE SET NULL,
  program_id UUID REFERENCES training_programs(id) ON DELETE SET NULL,

  -- Exercise Info
  exercise_name VARCHAR(200) NOT NULL,
  pattern VARCHAR(50) NOT NULL, -- "shoulder", "lower_push", "horizontal_push", etc.
  muscle_group VARCHAR(50) NOT NULL, -- "shoulders", "chest", "back", "legs", "arms", "core"

  -- Skip Reason
  skip_reason VARCHAR(50), -- "pain", "fatigue", "equipment", "time", "dislike", "other"
  pain_area VARCHAR(100), -- Se skip_reason = 'pain', quale zona
  pain_level INTEGER, -- 1-10 se c'è dolore

  -- Context
  day_name VARCHAR(50),
  session_number INTEGER, -- Numero sessione nel programma

  -- Metadata
  skipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 2. SKIP PATTERN ALERTS (Alert generati quando pattern rilevato)
-- ================================================================
CREATE TABLE IF NOT EXISTS skip_pattern_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES training_programs(id) ON DELETE SET NULL,

  -- Pattern Info
  muscle_group VARCHAR(50) NOT NULL,
  pattern VARCHAR(50),
  consecutive_sessions INTEGER NOT NULL DEFAULT 3,

  -- Alert Details
  alert_type VARCHAR(50) NOT NULL, -- "load_reduction_suggested", "rest_suggested", "technique_check"
  suggested_action VARCHAR(200),
  load_reduction_percent INTEGER, -- Es: 15 = -15%

  -- Status
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  action_taken VARCHAR(50), -- "accepted", "declined", "modified"

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- ================================================================
-- 3. INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_exercise_skips_user
  ON exercise_skips(user_id, skipped_at DESC);

CREATE INDEX IF NOT EXISTS idx_exercise_skips_pattern
  ON exercise_skips(user_id, pattern, skipped_at DESC);

CREATE INDEX IF NOT EXISTS idx_exercise_skips_muscle_group
  ON exercise_skips(user_id, muscle_group, skipped_at DESC);

CREATE INDEX IF NOT EXISTS idx_skip_alerts_user
  ON skip_pattern_alerts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skip_alerts_active
  ON skip_pattern_alerts(user_id, acknowledged, expires_at);

-- ================================================================
-- 4. RLS POLICIES
-- ================================================================
ALTER TABLE exercise_skips ENABLE ROW LEVEL SECURITY;
ALTER TABLE skip_pattern_alerts ENABLE ROW LEVEL SECURITY;

-- Exercise Skips Policies
DROP POLICY IF EXISTS "Users can view own exercise skips" ON exercise_skips;
CREATE POLICY "Users can view own exercise skips"
  ON exercise_skips FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own exercise skips" ON exercise_skips;
CREATE POLICY "Users can create own exercise skips"
  ON exercise_skips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own exercise skips" ON exercise_skips;
CREATE POLICY "Users can delete own exercise skips"
  ON exercise_skips FOR DELETE
  USING (auth.uid() = user_id);

-- Skip Pattern Alerts Policies
DROP POLICY IF EXISTS "Users can view own skip alerts" ON skip_pattern_alerts;
CREATE POLICY "Users can view own skip alerts"
  ON skip_pattern_alerts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own skip alerts" ON skip_pattern_alerts;
CREATE POLICY "Users can update own skip alerts"
  ON skip_pattern_alerts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create skip alerts" ON skip_pattern_alerts;
CREATE POLICY "System can create skip alerts"
  ON skip_pattern_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 5. HELPER FUNCTIONS
-- ================================================================

-- Function: Check for consecutive skip patterns
CREATE OR REPLACE FUNCTION check_consecutive_skips(
  p_user_id UUID,
  p_muscle_group VARCHAR(50),
  p_sessions_threshold INTEGER DEFAULT 3
)
RETURNS TABLE (
  has_pattern BOOLEAN,
  consecutive_count INTEGER,
  last_skip_date TIMESTAMPTZ,
  exercises_skipped TEXT[]
) AS $$
DECLARE
  v_consecutive INTEGER := 0;
  v_last_date TIMESTAMPTZ;
  v_exercises TEXT[];
BEGIN
  -- Get distinct workout sessions where this muscle group was skipped
  WITH session_skips AS (
    SELECT DISTINCT
      DATE(es.skipped_at) as skip_date,
      es.workout_log_id,
      array_agg(DISTINCT es.exercise_name) as exercises
    FROM exercise_skips es
    WHERE es.user_id = p_user_id
      AND es.muscle_group = p_muscle_group
      AND es.skipped_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(es.skipped_at), es.workout_log_id
    ORDER BY skip_date DESC
  ),
  -- Check if these are consecutive sessions
  ranked_sessions AS (
    SELECT
      skip_date,
      exercises,
      ROW_NUMBER() OVER (ORDER BY skip_date DESC) as rn
    FROM session_skips
  )
  SELECT
    COUNT(*),
    MAX(skip_date),
    array_agg(DISTINCT unnest)
  INTO v_consecutive, v_last_date, v_exercises
  FROM ranked_sessions, unnest(exercises)
  WHERE rn <= p_sessions_threshold;

  RETURN QUERY SELECT
    v_consecutive >= p_sessions_threshold,
    v_consecutive,
    v_last_date,
    v_exercises;
END;
$$ LANGUAGE plpgsql;

-- Function: Get active skip alerts for user
CREATE OR REPLACE FUNCTION get_active_skip_alerts(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  muscle_group VARCHAR(50),
  pattern VARCHAR(50),
  consecutive_sessions INTEGER,
  alert_type VARCHAR(50),
  suggested_action VARCHAR(200),
  load_reduction_percent INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    spa.id,
    spa.muscle_group,
    spa.pattern,
    spa.consecutive_sessions,
    spa.alert_type,
    spa.suggested_action,
    spa.load_reduction_percent,
    spa.created_at
  FROM skip_pattern_alerts spa
  WHERE spa.user_id = p_user_id
    AND spa.acknowledged = false
    AND spa.expires_at > NOW()
  ORDER BY spa.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get skip statistics by muscle group
CREATE OR REPLACE FUNCTION get_skip_stats_by_muscle_group(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  muscle_group VARCHAR(50),
  total_skips BIGINT,
  unique_exercises BIGINT,
  last_skip TIMESTAMPTZ,
  skip_reasons JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    es.muscle_group,
    COUNT(*) as total_skips,
    COUNT(DISTINCT es.exercise_name) as unique_exercises,
    MAX(es.skipped_at) as last_skip,
    jsonb_object_agg(
      COALESCE(es.skip_reason, 'unknown'),
      COUNT(*)
    ) as skip_reasons
  FROM exercise_skips es
  WHERE es.user_id = p_user_id
    AND es.skipped_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY es.muscle_group
  ORDER BY total_skips DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 6. TRIGGER: Auto-create alert when pattern detected
-- ================================================================
CREATE OR REPLACE FUNCTION check_and_create_skip_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_has_pattern BOOLEAN;
  v_consecutive INTEGER;
  v_existing_alert UUID;
BEGIN
  -- Check if there's already an active alert for this muscle group
  SELECT id INTO v_existing_alert
  FROM skip_pattern_alerts
  WHERE user_id = NEW.user_id
    AND muscle_group = NEW.muscle_group
    AND acknowledged = false
    AND expires_at > NOW()
  LIMIT 1;

  -- If no existing alert, check for pattern
  IF v_existing_alert IS NULL THEN
    SELECT has_pattern, consecutive_count
    INTO v_has_pattern, v_consecutive
    FROM check_consecutive_skips(NEW.user_id, NEW.muscle_group, 3);

    -- Create alert if pattern found
    IF v_has_pattern THEN
      INSERT INTO skip_pattern_alerts (
        user_id,
        program_id,
        muscle_group,
        pattern,
        consecutive_sessions,
        alert_type,
        suggested_action,
        load_reduction_percent
      ) VALUES (
        NEW.user_id,
        NEW.program_id,
        NEW.muscle_group,
        NEW.pattern,
        v_consecutive,
        'load_reduction_suggested',
        'Abbiamo notato che hai saltato esercizi per ' || NEW.muscle_group || ' nelle ultime ' || v_consecutive || ' sedute. Ti consigliamo di ridurre il carico del 15% per prevenire infortuni.',
        15
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_skip_pattern ON exercise_skips;
CREATE TRIGGER trigger_check_skip_pattern
AFTER INSERT ON exercise_skips
FOR EACH ROW
EXECUTE FUNCTION check_and_create_skip_alert();

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
