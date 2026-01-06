-- =====================================================
-- COHERENCE FIXES MIGRATION
-- =====================================================
-- Questo script crea le tabelle necessarie per:
-- 1. Persistenza assessment/screening unificata
-- 2. Tracking wellness pre-workout
-- 3. Pain history centralizzato
-- =====================================================
-- NOTA: exercise_modifications esiste gia da 20260105_exercise_modifications.sql

-- 1. USER ASSESSMENTS (screening data persistence)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL DEFAULT 'screening',
    data JSONB NOT NULL,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint unico separato (per evitare errori se esiste gia)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_assessment'
    ) THEN
        ALTER TABLE user_assessments
        ADD CONSTRAINT unique_user_assessment UNIQUE (user_id, assessment_type);
    END IF;
END $$;

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_assessments_user ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_type ON user_assessments(assessment_type);

-- RLS
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own assessments" ON user_assessments;
CREATE POLICY "Users can read own assessments" ON user_assessments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessments" ON user_assessments;
CREATE POLICY "Users can insert own assessments" ON user_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON user_assessments;
CREATE POLICY "Users can update own assessments" ON user_assessments
    FOR UPDATE USING (auth.uid() = user_id);


-- 2. SESSION WELLNESS (pre-workout wellness data)
-- =====================================================
CREATE TABLE IF NOT EXISTS session_wellness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    pre_workout_assessment JSONB NOT NULL,
    readiness_score INTEGER NOT NULL CHECK (readiness_score >= 0 AND readiness_score <= 100),
    pain_events JSONB DEFAULT '[]'::jsonb,
    adaptations_applied JSONB DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_session_wellness_user ON session_wellness(user_id);
CREATE INDEX IF NOT EXISTS idx_session_wellness_completed ON session_wellness(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_wellness_score ON session_wellness(readiness_score);

-- RLS
ALTER TABLE session_wellness ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own wellness" ON session_wellness;
CREATE POLICY "Users can read own wellness" ON session_wellness
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wellness" ON session_wellness;
CREATE POLICY "Users can insert own wellness" ON session_wellness
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 3. PAIN HISTORY (storico centralizzato dolori)
-- =====================================================
CREATE TABLE IF NOT EXISTS pain_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pain_area TEXT NOT NULL,
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
    pain_type TEXT,
    exercise_name TEXT,
    exercise_pattern TEXT,
    context TEXT,
    notes TEXT,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_pain_history_user ON pain_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pain_history_area ON pain_history(pain_area);
CREATE INDEX IF NOT EXISTS idx_pain_history_date ON pain_history(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_pain_history_severity ON pain_history(severity);

-- RLS
ALTER TABLE pain_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own pain history" ON pain_history;
CREATE POLICY "Users can read own pain history" ON pain_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pain history" ON pain_history;
CREATE POLICY "Users can insert own pain history" ON pain_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 4. FUNZIONI HELPER
-- =====================================================

-- Funzione per ottenere readiness medio ultimi N giorni
CREATE OR REPLACE FUNCTION get_average_readiness(
    p_user_id UUID,
    p_days INTEGER DEFAULT 7
)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(readiness_score), 0)
        FROM session_wellness
        WHERE user_id = p_user_id
        AND completed_at >= NOW() - (p_days || ' days')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Funzione per ottenere aree dolore frequenti
CREATE OR REPLACE FUNCTION get_frequent_pain_areas(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    area TEXT,
    occurrence_count BIGINT,
    avg_severity NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ph.pain_area as area,
        COUNT(*) as occurrence_count,
        ROUND(AVG(ph.severity)::numeric, 1) as avg_severity
    FROM pain_history ph
    WHERE ph.user_id = p_user_id
    AND ph.reported_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY ph.pain_area
    ORDER BY occurrence_count DESC, avg_severity DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Grant execute
GRANT EXECUTE ON FUNCTION get_average_readiness(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_frequent_pain_areas(UUID, INTEGER, INTEGER) TO authenticated;


-- =====================================================
-- COMPLETATO
-- =====================================================
-- Per verificare:
-- SELECT * FROM user_assessments LIMIT 1;
-- SELECT * FROM session_wellness LIMIT 1;
-- SELECT * FROM pain_history LIMIT 1;
