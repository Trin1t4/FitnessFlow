/**
 * Run TeamFlow Migration via Supabase Management API
 * Execute: node run_migration.js
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oY2R4cWhobHJ1amJqeHRnbm16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1NDIwNywiZXhwIjoyMDc1MzMwMjA3fQ.1sJgRpkRlc-ZI1ZJ8IBtweVjgy_ONIDVpnmmsyrdfl4';

async function runMigration() {
  console.log('🚀 Running TeamFlow migration...\n');

  // Read migration file
  const migrationPath = path.join(__dirname, 'teamflow_complete_migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split into individual statements (basic split on semicolons outside strings)
  const statements = sql
    .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // Skip comments-only statements
    if (!stmt || stmt.replace(/--.*$/gm, '').trim().length === 0) {
      continue;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({})
      });

      // For DDL statements, we need to use the postgres connection or pg_query
      // The REST API doesn't support DDL directly

      // Instead, let's just verify if tables exist
    } catch (err) {
      // Expected - REST API doesn't support DDL
    }
  }

  // Instead, let's check what tables exist
  console.log('\n📊 Checking existing tables...\n');

  try {
    // Check teams table
    const teamsCheck = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=count&limit=0`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });

    if (teamsCheck.status === 200) {
      console.log('✅ teams table exists');
    } else if (teamsCheck.status === 404) {
      console.log('❌ teams table NOT FOUND - Migration needed');
    } else {
      console.log(`⚠️ teams table status: ${teamsCheck.status}`);
    }

    // Check team_members table
    const membersCheck = await fetch(`${SUPABASE_URL}/rest/v1/team_members?select=count&limit=0`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });

    if (membersCheck.status === 200) {
      console.log('✅ team_members table exists');
    } else if (membersCheck.status === 404) {
      console.log('❌ team_members table NOT FOUND - Migration needed');
    } else {
      console.log(`⚠️ team_members table status: ${membersCheck.status}`);
    }

    // Check training_programs table
    const programsCheck = await fetch(`${SUPABASE_URL}/rest/v1/training_programs?select=count&limit=0`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });

    if (programsCheck.status === 200) {
      console.log('✅ training_programs table exists');
    } else if (programsCheck.status === 404) {
      console.log('❌ training_programs table NOT FOUND');
    } else {
      console.log(`⚠️ training_programs table status: ${programsCheck.status}`);
    }

    // Check athlete_checkins table
    const checkinsCheck = await fetch(`${SUPABASE_URL}/rest/v1/athlete_checkins?select=count&limit=0`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });

    if (checkinsCheck.status === 200) {
      console.log('✅ athlete_checkins table exists');
    } else if (checkinsCheck.status === 404) {
      console.log('❌ athlete_checkins table NOT FOUND - Migration needed');
    } else {
      console.log(`⚠️ athlete_checkins table status: ${checkinsCheck.status}`);
    }

  } catch (err) {
    console.error('Error checking tables:', err);
  }

  console.log('\n' + '='.repeat(60));
  console.log('⚠️  DDL statements (CREATE TABLE, etc.) cannot be executed via REST API');
  console.log('⚠️  You must run the SQL in Supabase Dashboard → SQL Editor');
  console.log('='.repeat(60));
  console.log('\n📋 Migration file: teamflow_complete_migration.sql');
  console.log('🔗 Dashboard: https://supabase.com/dashboard/project/mhcdxqhhlrujbjxtgnmz/sql');
}

runMigration().catch(console.error);
