-- ================================================================
-- FIX DATABASE ERRORS - MIGRATION 017
-- Date: 2025-12-26
-- Fixes:
-- 1. users table 406 errors (RLS policies)
-- 2. pain_thresholds 406 errors (RLS policies)
-- 3. exercise_logs missing columns
-- ================================================================

-- ================================================================
-- 1. FIX users TABLE
-- ================================================================

-- First, check if users is a view or table and handle accordingly
DO $$
BEGIN
  -- Drop view if exists (we'll recreate as table)
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'users') THEN
    DROP VIEW IF EXISTS public.users CASCADE;
    RAISE NOTICE 'Dropped users view';
  END IF;
END $$;

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create user row on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 2. FIX pain_thresholds TABLE (406 errors)
-- ================================================================

-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.pain_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name VARCHAR(255) NOT NULL,
  pain_area VARCHAR(100),
  threshold_weight DECIMAL(10,2),
  threshold_reps INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_name)
);

-- Enable RLS
ALTER TABLE public.pain_thresholds ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view own pain thresholds" ON public.pain_thresholds;
CREATE POLICY "Users can view own pain thresholds"
  ON public.pain_thresholds FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own pain thresholds" ON public.pain_thresholds;
CREATE POLICY "Users can create own pain thresholds"
  ON public.pain_thresholds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pain thresholds" ON public.pain_thresholds;
CREATE POLICY "Users can update own pain thresholds"
  ON public.pain_thresholds FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own pain thresholds" ON public.pain_thresholds;
CREATE POLICY "Users can delete own pain thresholds"
  ON public.pain_thresholds FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- 3. Ensure exercise_logs has all needed columns
-- ================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exercise_logs') THEN
    -- Add missing columns
    ALTER TABLE public.exercise_logs ADD COLUMN IF NOT EXISTS weight_used DECIMAL(10,2);
    ALTER TABLE public.exercise_logs ADD COLUMN IF NOT EXISTS reps_completed INTEGER;
    ALTER TABLE public.exercise_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

    RAISE NOTICE 'exercise_logs columns verified';
  END IF;
END $$;

-- ================================================================
-- 4. Create index for better performance
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_pain_thresholds_user ON public.pain_thresholds(user_id);
CREATE INDEX IF NOT EXISTS idx_pain_thresholds_exercise ON public.pain_thresholds(user_id, exercise_name);

-- ================================================================
-- 5. Insert missing users from auth.users
-- ================================================================

-- Use email prefix as name, or 'User' as fallback
INSERT INTO public.users (id, email, full_name, created_at)
SELECT
  id,
  email,
  COALESCE(SPLIT_PART(email, '@', 1), 'User'),
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Also update name column if it exists and is NULL
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name') THEN
    UPDATE public.users
    SET name = COALESCE(SPLIT_PART(email, '@', 1), 'User')
    WHERE name IS NULL OR name = '';
  END IF;
END $$;

-- Migration completed
