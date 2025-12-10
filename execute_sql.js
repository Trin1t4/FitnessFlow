/**
 * Execute SQL via Supabase Management API
 * This uses the database direct connection
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oY2R4cWhobHJ1amJqeHRnbm16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1NDIwNywiZXhwIjoyMDc1MzMwMjA3fQ.1sJgRpkRlc-ZI1ZJ8IBtweVjgy_ONIDVpnmmsyrdfl4';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function executeMigration() {
  console.log('🚀 Executing TeamFlow migration via RPC...\n');

  // Create an RPC function that can execute arbitrary SQL
  // First, let's try to create the teams table via a workaround

  // The only way to execute DDL is through the Supabase CLI or Dashboard
  // However, we can check if tables exist and report what's missing

  const tablesToCheck = ['teams', 'team_members', 'team_invites', 'athlete_checkins', 'sport_positions'];

  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${table}: NOT EXISTS`);
        } else {
          console.log(`⚠️ ${table}: Error - ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: EXISTS (${count} rows)`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }

  console.log('\n---------------------------------------------------');
  console.log('To create missing tables, run this SQL in Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/mhcdxqhhlrujbjxtgnmz/sql');
  console.log('\nFile: teamflow_complete_migration.sql');
  console.log('---------------------------------------------------\n');

  // Try alternative: use pg_query if available
  console.log('Attempting to execute migration via supabase.rpc...\n');

  // Read migration
  const sql = fs.readFileSync(path.join(__dirname, 'teamflow_complete_migration.sql'), 'utf8');

  // Try the exec_sql function if it exists
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    if (error.code === '42883') {
      console.log('⚠️ exec_sql function not found. Creating it...');

      // We can't create functions via REST either
      console.log('\n📋 MANUAL STEPS REQUIRED:');
      console.log('1. Go to: https://supabase.com/dashboard/project/mhcdxqhhlrujbjxtgnmz/sql');
      console.log('2. Copy the content of: teamflow_complete_migration.sql');
      console.log('3. Paste and click "Run"');
    } else {
      console.log('Error:', error.message);
    }
  } else {
    console.log('✅ Migration executed successfully!');
  }
}

executeMigration().catch(console.error);
