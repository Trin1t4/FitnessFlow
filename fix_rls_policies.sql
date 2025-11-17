-- ========================================
-- FIX RLS POLICIES - Remove Duplicates
-- ========================================

-- STEP 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can create own programs" ON training_programs;
DROP POLICY IF EXISTS "Users can insert own programs" ON training_programs;
DROP POLICY IF EXISTS "Users can select own programs" ON training_programs;
DROP POLICY IF EXISTS "Users can view own programs" ON training_programs;
DROP POLICY IF EXISTS "Users can update own programs" ON training_programs;
DROP POLICY IF EXISTS "Users can delete own programs" ON training_programs;

-- STEP 2: Recreate ONLY 4 correct policies

-- 1. SELECT Policy
CREATE POLICY "Users can view own programs"
ON training_programs
FOR SELECT
USING (auth.uid() = user_id);

-- 2. INSERT Policy with user_id check
CREATE POLICY "Users can insert own programs"
ON training_programs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE Policy
CREATE POLICY "Users can update own programs"
ON training_programs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. DELETE Policy
CREATE POLICY "Users can delete own programs"
ON training_programs
FOR DELETE
USING (auth.uid() = user_id);

-- STEP 3: Verify policies
SELECT policyname, cmd, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'training_programs'
ORDER BY cmd, policyname;
