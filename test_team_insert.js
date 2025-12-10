/**
 * Test team insert to debug 500 error
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mhcdxqhhlrujbjxtgnmz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oY2R4cWhobHJ1amJqeHRnbm16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1NDIwNywiZXhwIjoyMDc1MzMwMjA3fQ.1sJgRpkRlc-ZI1ZJ8IBtweVjgy_ONIDVpnmmsyrdfl4';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testInsert() {
  console.log('Testing team insert...\n');

  // Test 1: Simple select to verify table exists
  console.log('1. Testing SELECT on teams...');
  const { data: selectData, error: selectError } = await supabase
    .from('teams')
    .select('*')
    .limit(1);

  if (selectError) {
    console.log('   ❌ SELECT error:', selectError.message);
    console.log('   Full error:', JSON.stringify(selectError, null, 2));
  } else {
    console.log('   ✅ SELECT works, rows:', selectData?.length || 0);
  }

  // Test 2: Check table structure
  console.log('\n2. Checking table structure...');
  const { data: columns, error: colError } = await supabase
    .rpc('get_table_columns', { table_name: 'teams' });

  if (colError) {
    console.log('   ⚠️ Cannot get columns via RPC (expected)');
  }

  // Test 3: Try minimal insert with service role (bypasses RLS)
  console.log('\n3. Testing INSERT with service role...');
  const testSlug = `test-team-${Date.now()}`;

  const { data: insertData, error: insertError } = await supabase
    .from('teams')
    .insert({
      name: 'Test Team Debug',
      slug: testSlug,
      sport: 'football',
      created_by: 'e30cae0b-896e-48c3-87a5-df6484bde13c' // Your user ID from logs
    })
    .select();

  if (insertError) {
    console.log('   ❌ INSERT error:', insertError.message);
    console.log('   Error code:', insertError.code);
    console.log('   Error details:', insertError.details);
    console.log('   Error hint:', insertError.hint);
    console.log('   Full error:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('   ✅ INSERT works!');
    console.log('   Created team:', insertData);

    // Clean up
    if (insertData?.[0]?.id) {
      await supabase.from('teams').delete().eq('id', insertData[0].id);
      console.log('   🧹 Cleaned up test team');
    }
  }

  // Test 4: Check if there are any constraints or triggers
  console.log('\n4. Testing with all optional fields...');
  const { data: fullInsert, error: fullError } = await supabase
    .from('teams')
    .insert({
      name: 'Full Test Team',
      slug: `full-test-${Date.now()}`,
      sport: 'football',
      category: 'amateur',
      created_by: 'e30cae0b-896e-48c3-87a5-df6484bde13c',
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select();

  if (fullError) {
    console.log('   ❌ Full INSERT error:', fullError.message);
    console.log('   Full error:', JSON.stringify(fullError, null, 2));
  } else {
    console.log('   ✅ Full INSERT works!');

    // Clean up
    if (fullInsert?.[0]?.id) {
      await supabase.from('teams').delete().eq('id', fullInsert[0].id);
      console.log('   🧹 Cleaned up test team');
    }
  }
}

testInsert().catch(console.error);
