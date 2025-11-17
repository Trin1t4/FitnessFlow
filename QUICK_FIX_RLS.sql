-- QUICK FIX - Sblocca assessment e programmi
-- Esegui QUESTO per far funzionare l'app ORA

-- 1. ASSESSMENTS (per salvare risultati screening)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can delete own assessments" ON assessments;

CREATE POLICY "Users can view own assessments"
ON assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
ON assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
ON assessments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
ON assessments FOR DELETE
USING (auth.uid() = user_id);

-- 2. USER_PROFILES (per salvare onboarding)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
ON user_profiles FOR DELETE
USING (auth.uid() = user_id);

-- VERIFICA
SELECT tablename, COUNT(*) as policies
FROM pg_policies
WHERE tablename IN ('assessments', 'user_profiles')
GROUP BY tablename;

-- Aspettato: 4 policies per ciascuna tabella
