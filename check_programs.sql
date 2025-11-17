-- ========================================
-- CHECK PROGRAMS IN DATABASE
-- ========================================

-- 1. Lista tutti i programmi dell'utente
SELECT
  id,
  name,
  level,
  goal,
  split,
  frequency,
  is_active,
  created_at::text,
  updated_at::text
FROM training_programs
ORDER BY created_at DESC;

-- 2. Conta programmi per livello
SELECT
  level,
  COUNT(*) as count,
  MAX(created_at)::text as most_recent
FROM training_programs
GROUP BY level;

-- 3. Verifica programma attivo
SELECT
  id,
  name,
  level,
  goal,
  is_active,
  jsonb_array_length(COALESCE(weekly_split->'days', '[]'::jsonb)) as num_days,
  created_at::text
FROM training_programs
WHERE is_active = true;

-- 4. Dettagli ultimo programma creato
SELECT
  id,
  name,
  level,
  goal,
  split,
  frequency,
  is_active,
  created_at::text,
  jsonb_pretty(weekly_split) as weekly_split_data
FROM training_programs
ORDER BY created_at DESC
LIMIT 1;
