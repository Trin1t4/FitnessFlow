-- ================================================================
-- FIX: Remove goal CHECK constraint from training_programs
-- ================================================================
-- PROBLEMA: training_programs ha un constraint CHECK sul campo goal
--           che rifiuta molti valori validi (ipertrofia, muscle_gain, etc.)
--
-- SOLUZIONE: Rimuovere il constraint per permettere qualsiasi goal
-- ================================================================

-- Drop the constraint
ALTER TABLE training_programs
DROP CONSTRAINT IF EXISTS training_programs_goal_check;

-- Verify it's removed
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'training_programs'::regclass
AND conname LIKE '%goal%';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Goal constraint removed successfully!';
  RAISE NOTICE 'Now goal field accepts any value';
  RAISE NOTICE '';
  RAISE NOTICE 'Valid goals:';
  RAISE NOTICE '  - Italian: ipertrofia, forza, definizione, resistenza, etc.';
  RAISE NOTICE '  - English: muscle_gain, strength, fat_loss, endurance, etc.';
  RAISE NOTICE '  - Any custom goal';
END $$;
