-- Delete il programma vecchio con esercizi undefined
DELETE FROM training_programs
WHERE id = '6e5e2c77-af3f-4c3e-b7fa-4877b6a8e91f';

-- Verifica che sia stato cancellato
SELECT COUNT(*) as remaining_programs FROM training_programs;
