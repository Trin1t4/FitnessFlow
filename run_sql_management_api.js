/**
 * Execute SQL via Supabase Database API
 * Using the database REST endpoint with service role
 */

const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'mhcdxqhhlrujbjxtgnmz';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oY2R4cWhobHJ1amJqeHRnbm16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1NDIwNywiZXhwIjoyMDc1MzMwMjA3fQ.1sJgRpkRlc-ZI1ZJ8IBtweVjgy_ONIDVpnmmsyrdfl4';

async function runSQL() {
  console.log('🚀 Running SQL via Supabase...\n');

  // Split migration into executable chunks
  const statements = [
    // 1. Create teams table
    `CREATE TABLE IF NOT EXISTS teams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      sport TEXT NOT NULL,
      category TEXT,
      level TEXT,
      season_start DATE,
      season_end DATE,
      current_phase TEXT DEFAULT 'pre_season',
      subscription_tier TEXT DEFAULT 'basic',
      subscription_status TEXT DEFAULT 'trial',
      max_athletes INT DEFAULT 25,
      trial_ends_at TIMESTAMPTZ,
      settings JSONB DEFAULT '{"require_daily_checkin": true}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID REFERENCES auth.users(id)
    )`,

    // 2. Create team_members table
    `CREATE TABLE IF NOT EXISTS team_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'athlete',
      jersey_number INT,
      position TEXT,
      dominant_foot TEXT,
      dominant_hand TEXT,
      status TEXT DEFAULT 'active',
      injury_notes TEXT,
      return_date DATE,
      permissions JSONB DEFAULT '{}'::jsonb,
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      last_active_at TIMESTAMPTZ,
      invited_by UUID REFERENCES auth.users(id),
      invite_accepted_at TIMESTAMPTZ,
      UNIQUE(team_id, user_id)
    )`,

    // 3. Create team_invites table
    `CREATE TABLE IF NOT EXISTS team_invites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'athlete',
      position TEXT,
      jersey_number INT,
      invite_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
      status TEXT DEFAULT 'pending',
      expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      invited_by UUID REFERENCES auth.users(id),
      accepted_at TIMESTAMPTZ,
      accepted_by UUID REFERENCES auth.users(id)
    )`,

    // 4. Create athlete_checkins table
    `CREATE TABLE IF NOT EXISTS athlete_checkins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
      sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
      sleep_hours DECIMAL(3,1),
      energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
      mood INT CHECK (mood BETWEEN 1 AND 10),
      stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
      muscle_soreness INT CHECK (muscle_soreness BETWEEN 1 AND 10),
      soreness_areas TEXT[],
      injury_pain INT CHECK (injury_pain BETWEEN 0 AND 10),
      injury_notes TEXT,
      available_for_training BOOLEAN DEFAULT true,
      unavailable_reason TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(team_id, user_id, checkin_date)
    )`,

    // 5. Create sport_positions table
    `CREATE TABLE IF NOT EXISTS sport_positions (
      sport TEXT NOT NULL,
      position_key TEXT NOT NULL,
      position_name_it TEXT NOT NULL,
      position_name_en TEXT NOT NULL,
      category TEXT,
      PRIMARY KEY (sport, position_key)
    )`
  ];

  // Use the SQL endpoint (if available)
  // Note: This endpoint may not be publicly documented
  const baseUrl = `https://${PROJECT_REF}.supabase.co`;

  // Try to create tables one by one
  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || `statement_${i}`;

    console.log(`[${i + 1}/${statements.length}] Creating ${tableName}...`);

    try {
      // The only way to run DDL is through the pg REST connector
      // which requires direct database access
      // This won't work via REST API

      // Let's try using a stored procedure approach
      // First check if the table exists
      const checkResponse = await fetch(`${baseUrl}/rest/v1/${tableName}?select=*&limit=0`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      });

      if (checkResponse.status === 200) {
        console.log(`  ✅ ${tableName} already exists`);
      } else if (checkResponse.status === 404) {
        console.log(`  ❌ ${tableName} needs to be created`);
      } else {
        console.log(`  ⚠️ ${tableName} status: ${checkResponse.status}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('\nThe Supabase REST API does not support DDL statements.');
  console.log('You need to run the migration manually:\n');
  console.log('1. Open: https://supabase.com/dashboard/project/mhcdxqhhlrujbjxtgnmz/sql');
  console.log('2. Copy content from: teamflow_complete_migration.sql');
  console.log('3. Click "Run"\n');

  // Output the SQL file location
  const sqlPath = path.join(__dirname, 'teamflow_complete_migration.sql');
  console.log(`SQL file: ${sqlPath}`);
  console.log('='.repeat(60));
}

runSQL().catch(console.error);
