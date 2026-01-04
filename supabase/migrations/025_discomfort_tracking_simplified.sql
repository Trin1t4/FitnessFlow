-- ============================================================
-- TrainSmart Database - Discomfort Tracking (SIMPLIFIED)
-- Migration: 025_discomfort_tracking_simplified.sql
-- ============================================================
--
-- Questo schema semplificato supporta SOLO:
-- - Tracking del fastidio per zona
-- - Riduzione automatica del carico
-- - Suggerimento di consultare professionista
--
-- NON supporta (e non deve supportare):
-- - Fasi/livelli di progressione
-- - Routine di esercizi strutturate
-- - Sessioni di "riabilitazione"
--
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CREA/AGGIORNA TABELLA PRINCIPALE
-- ============================================================

-- Crea tabella se non esiste (mantiene compatibilità)
CREATE TABLE IF NOT EXISTS discomfort_tracking (
  id SERIAL PRIMARY KEY,

  -- Riferimento utente
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Zona del corpo
  body_area TEXT NOT NULL CHECK (body_area IN (
    'lower_back', 'knee', 'shoulder', 'neck',
    'hip', 'ankle', 'wrist', 'elbow'
  )),

  -- Contatore sessioni consecutive con fastidio
  consecutive_sessions INTEGER DEFAULT 0 CHECK (consecutive_sessions >= 0),

  -- Timestamp
  first_reported TIMESTAMPTZ DEFAULT NOW(),
  last_reported TIMESTAMPTZ DEFAULT NOW(),

  -- Flag per sapere se applicare riduzione carico
  load_reduction_active BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un solo record per utente/zona
  UNIQUE(user_id, body_area)
);

-- ============================================================
-- 2. AGGIUNGI COLONNA load_reduction_active SE NON ESISTE
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discomfort_tracking' AND column_name = 'load_reduction_active'
  ) THEN
    ALTER TABLE discomfort_tracking ADD COLUMN load_reduction_active BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Colonna load_reduction_active aggiunta';
  END IF;
END $$;

-- ============================================================
-- 3. INDICI
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_discomfort_user ON discomfort_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_discomfort_active ON discomfort_tracking(user_id, load_reduction_active)
  WHERE load_reduction_active = TRUE;

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE discomfort_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo i propri dati
DROP POLICY IF EXISTS discomfort_user_policy ON discomfort_tracking;
CREATE POLICY discomfort_user_policy ON discomfort_tracking
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. TRIGGER PER updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_discomfort_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS discomfort_updated_at ON discomfort_tracking;
CREATE TRIGGER discomfort_updated_at
  BEFORE UPDATE ON discomfort_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_discomfort_timestamp();

-- ============================================================
-- 6. FUNZIONE RPC: Report Discomfort
-- ============================================================

CREATE OR REPLACE FUNCTION report_discomfort(
  p_user_id UUID,
  p_body_areas TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_area TEXT;
  v_areas_with_reduction TEXT[] := '{}';
  v_consult_areas TEXT[] := '{}';
  v_existing RECORD;
  v_new_count INTEGER;
BEGIN
  -- Costante: sessioni per suggerire professionista
  -- (3 sessioni consecutive)

  -- Se array vuoto → reset tutto per questo utente
  IF p_body_areas IS NULL OR array_length(p_body_areas, 1) IS NULL THEN
    UPDATE discomfort_tracking
    SET
      consecutive_sessions = 0,
      load_reduction_active = FALSE
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
      'success', true,
      'areas_with_reduction', '[]'::jsonb,
      'consult_professional', false,
      'message', 'Ottimo! Nessun fastidio segnalato.'
    );
  END IF;

  -- Processa ogni area segnalata
  FOREACH v_area IN ARRAY p_body_areas
  LOOP
    -- Cerca record esistente
    SELECT * INTO v_existing
    FROM discomfort_tracking
    WHERE user_id = p_user_id AND body_area = v_area;

    IF v_existing IS NULL THEN
      -- Inserisci nuovo record
      INSERT INTO discomfort_tracking (
        user_id, body_area, consecutive_sessions,
        first_reported, last_reported, load_reduction_active
      )
      VALUES (
        p_user_id, v_area, 1,
        NOW(), NOW(), TRUE
      );
      v_new_count := 1;
    ELSE
      -- Aggiorna esistente
      v_new_count := v_existing.consecutive_sessions + 1;

      UPDATE discomfort_tracking
      SET
        consecutive_sessions = v_new_count,
        last_reported = NOW(),
        load_reduction_active = TRUE
      WHERE id = v_existing.id;
    END IF;

    v_areas_with_reduction := array_append(v_areas_with_reduction, v_area);

    -- Check se suggerire professionista (3+ sessioni)
    IF v_new_count >= 3 THEN
      v_consult_areas := array_append(v_consult_areas, v_area);
    END IF;
  END LOOP;

  -- Reset aree NON segnalate
  UPDATE discomfort_tracking
  SET
    consecutive_sessions = 0,
    load_reduction_active = FALSE
  WHERE user_id = p_user_id
    AND NOT (body_area = ANY(p_body_areas));

  -- Ritorna risultato
  RETURN jsonb_build_object(
    'success', true,
    'areas_with_reduction', to_jsonb(v_areas_with_reduction),
    'consult_professional', array_length(v_consult_areas, 1) > 0,
    'consult_areas', to_jsonb(v_consult_areas),
    'message', CASE
      WHEN array_length(v_consult_areas, 1) > 0 THEN
        'Fastidio ricorrente rilevato. Ti consigliamo di consultare un professionista.'
      ELSE
        'Fastidio registrato. Il carico sarà ridotto automaticamente.'
    END
  );
END;
$$;

-- ============================================================
-- 7. FUNZIONE RPC: Get Discomfort Status
-- ============================================================

CREATE OR REPLACE FUNCTION get_discomfort_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_areas TEXT[] := '{}';
  v_multipliers JSONB := '{}'::jsonb;
  v_consult_areas TEXT[] := '{}';
  v_record RECORD;
BEGIN
  FOR v_record IN
    SELECT body_area, consecutive_sessions
    FROM discomfort_tracking
    WHERE user_id = p_user_id AND load_reduction_active = TRUE
  LOOP
    v_areas := array_append(v_areas, v_record.body_area);

    -- Calcola moltiplicatore: 0.6 normale, 0.4 se ricorrente
    IF v_record.consecutive_sessions >= 3 THEN
      v_multipliers := v_multipliers || jsonb_build_object(v_record.body_area, 0.4);
      v_consult_areas := array_append(v_consult_areas, v_record.body_area);
    ELSE
      v_multipliers := v_multipliers || jsonb_build_object(v_record.body_area, 0.6);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'areas_affected', to_jsonb(v_areas),
    'load_multipliers', v_multipliers,
    'should_consult_professional', array_length(v_consult_areas, 1) > 0,
    'professional_recommendation_areas', to_jsonb(v_consult_areas)
  );
END;
$$;

-- ============================================================
-- 8. FUNZIONE RPC: Clear Discomfort
-- ============================================================

CREATE OR REPLACE FUNCTION clear_discomfort(
  p_user_id UUID,
  p_body_area TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_body_area IS NULL THEN
    -- Clear tutto
    UPDATE discomfort_tracking
    SET consecutive_sessions = 0, load_reduction_active = FALSE
    WHERE user_id = p_user_id;
  ELSE
    -- Clear zona specifica
    UPDATE discomfort_tracking
    SET consecutive_sessions = 0, load_reduction_active = FALSE
    WHERE user_id = p_user_id AND body_area = p_body_area;
  END IF;

  RETURN TRUE;
END;
$$;

COMMIT;
