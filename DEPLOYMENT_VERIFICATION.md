# FitnessFlow - Deployment Verification Script

## Quick Verification Guide

Use this guide to verify the Supabase integration is working correctly after deployment.

---

## Step 1: Database Verification (5 minutes)

### 1.1 Check Table Exists
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'training_programs';
```
**Expected:** 1 row with table_name = 'training_programs'

### 1.2 Check Column Count
```sql
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'training_programs';
```
**Expected:** column_count >= 30

### 1.3 Verify RLS Enabled
```sql
SELECT relrowsecurity
FROM pg_class
WHERE relname = 'training_programs';
```
**Expected:** relrowsecurity = true

### 1.4 Count RLS Policies
```sql
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'training_programs';
```
**Expected:** policy_count = 4

### 1.5 Check Indexes
```sql
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE tablename = 'training_programs';
```
**Expected:** index_count >= 5

### 1.6 Verify Triggers
```sql
SELECT COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE event_object_table = 'training_programs';
```
**Expected:** trigger_count >= 1

---

## Step 2: Service Layer Verification (3 minutes)

### 2.1 Check File Exists
```bash
# Check if programService.ts exists
ls -la client/src/lib/programService.ts
```
**Expected:** File exists, ~600 lines

### 2.2 Verify Exports
```bash
# Check exports in programService.ts
grep "export async function" client/src/lib/programService.ts | wc -l
```
**Expected:** At least 10 exported functions

### 2.3 Check TypeScript Compilation
```bash
cd client
npm run type-check
```
**Expected:** No errors

---

## Step 3: Frontend Verification (3 minutes)

### 3.1 Check Dashboard Updated
```bash
# Verify Dashboard imports programService
grep "programService" client/src/components/Dashboard.tsx
```
**Expected:** Import statement present

### 3.2 Check State Variables
```bash
# Verify new state variables exist
grep "syncStatus" client/src/components/Dashboard.tsx
grep "programHistory" client/src/components/Dashboard.tsx
```
**Expected:** Both variables present

### 3.3 Build Client
```bash
cd client
npm run build
```
**Expected:** Build completes successfully

---

## Step 4: Live Testing (10 minutes)

### 4.1 Create Test User
1. Open app in browser
2. Create new account: `test-user-$(date +%s)@example.com`
3. Complete onboarding
4. Complete quiz
5. Complete screening

**Expected:** Reach Dashboard

### 4.2 Generate Program
1. Click "Genera Programma Personalizzato"
2. Wait for completion
3. Check sync indicator

**Expected:**
- Success message appears
- Sync indicator shows "Sincronizzato" (green)
- Program displays on screen

### 4.3 Verify in Database
```sql
SELECT id, name, level, is_active, user_id
FROM training_programs
ORDER BY created_at DESC
LIMIT 1;
```
**Expected:** Program exists with is_active = true

### 4.4 Test Refresh
1. Refresh browser (F5)
2. Wait for page load

**Expected:**
- Program loads automatically
- Sync indicator green
- No errors in console

### 4.5 Test Multi-Device
1. Open app in different browser (or incognito)
2. Login with same test user
3. Navigate to Dashboard

**Expected:**
- Same program appears
- Sync indicator green

### 4.6 Test History
1. Generate 2nd program
2. Check if "Storico" button appears
3. Click "Storico"

**Expected:**
- Button shows "Storico (2)"
- Modal opens with 2 programs
- 1 marked as "ATTIVO"

### 4.7 Test Offline Mode
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline"
4. Refresh page

**Expected:**
- Program still loads (from cache)
- Sync indicator shows "Offline"

---

## Step 5: Performance Check (5 minutes)

### 5.1 Measure Load Time
1. Open DevTools → Performance
2. Start recording
3. Refresh page
4. Stop recording

**Expected:**
- Total load time < 3s
- Program load < 2s

### 5.2 Check Database Query Speed
```sql
EXPLAIN ANALYZE
SELECT * FROM training_programs
WHERE user_id = 'test-user-uuid'
  AND is_active = true;
```
**Expected:** Execution time < 50ms

### 5.3 Check Cache Hit
1. Load program
2. Check console for: "Returning cached active program"
3. Refresh within 5 minutes

**Expected:** Cache hit on 2nd load

---

## Step 6: Security Verification (5 minutes)

### 6.1 Test User Isolation
1. Login as User A
2. Note user_id from database
3. Login as User B (different account)
4. Try to access User A's program

**Expected:** Cannot see User A's program

### 6.2 Verify RLS Protection
```javascript
// Run in browser console (while logged in as User B)
const { data, error } = await supabase
  .from('training_programs')
  .select('*')
  .eq('user_id', 'USER_A_UUID');

console.log('Data:', data);
console.log('Error:', error);
```
**Expected:** data = [] (empty array)

### 6.3 Test Unauthenticated Access
1. Logout
2. Try to create program

**Expected:**
- Fallback to localStorage
- Sync indicator shows "Offline"
- No database insert

---

## Step 7: Migration Verification (5 minutes)

### 7.1 Setup Migration Test
```javascript
// In browser console (logged out)
localStorage.setItem('currentProgram', JSON.stringify({
  name: "Migration Test Program",
  level: "beginner",
  goal: "strength",
  frequency: 3,
  split: "FULL_BODY",
  exercises: []
}));
```

### 7.2 Trigger Migration
1. Delete any existing programs in Supabase for test user
2. Login as test user
3. Navigate to Dashboard
4. Check console

**Expected:**
- Console shows: "Starting localStorage migration"
- Program appears in Supabase

### 7.3 Verify No Duplication
1. Logout and login again
2. Check console

**Expected:**
- Console shows: "already has programs in Supabase, skipping migration"
- No duplicate program created

---

## Step 8: Error Handling (5 minutes)

### 8.1 Test Network Timeout
1. Throttle network (DevTools → Slow 3G)
2. Generate program
3. Wait for completion

**Expected:**
- May take longer but completes
- Or falls back to localStorage with warning

### 8.2 Test Invalid Data
```javascript
// In browser console
import { createProgram } from './lib/programService';

const result = await createProgram({
  name: "",  // Invalid: empty
  level: "beginner",
  frequency: 3
});

console.log('Result:', result);
```
**Expected:**
- result.success = false
- result.error = "Program name is required"

---

## Verification Checklist

### Database Setup
- [ ] Table exists
- [ ] 30+ columns present
- [ ] RLS enabled
- [ ] 4 policies active
- [ ] 5+ indexes created
- [ ] Triggers installed

### Code Deployment
- [ ] programService.ts deployed
- [ ] Dashboard.tsx updated
- [ ] TypeScript compiles
- [ ] Build succeeds
- [ ] No ESLint errors

### Functionality
- [ ] Program creation works
- [ ] Program saves to Supabase
- [ ] Sync indicator shows correctly
- [ ] Program loads from cloud
- [ ] Cache works (5 min TTL)
- [ ] Multi-device sync works
- [ ] History modal works
- [ ] Switch active program works
- [ ] Offline mode works
- [ ] Migration works

### Performance
- [ ] Load time < 3s
- [ ] Cached load < 500ms
- [ ] Database query < 50ms
- [ ] No memory leaks

### Security
- [ ] User isolation verified
- [ ] RLS policies enforced
- [ ] No cross-user access
- [ ] Auth required for Supabase

### Error Handling
- [ ] Network errors handled
- [ ] Invalid data rejected
- [ ] Offline fallback works
- [ ] User-friendly error messages

---

## Quick Health Check (1 minute)

Run this single query to check overall health:

```sql
-- Quick Health Check
WITH health_metrics AS (
  SELECT
    (SELECT COUNT(*) FROM training_programs) as total_programs,
    (SELECT COUNT(*) FROM training_programs WHERE is_active = true) as active_programs,
    (SELECT COUNT(DISTINCT user_id) FROM training_programs) as users_with_programs,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'training_programs') as rls_policies,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'training_programs') as indexes,
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'training_programs') as rls_enabled
)
SELECT
  *,
  CASE
    WHEN rls_enabled = true
     AND rls_policies = 4
     AND indexes >= 5
     AND total_programs >= 0
    THEN '✅ HEALTHY'
    ELSE '⚠️ CHECK REQUIRED'
  END as health_status
FROM health_metrics;
```

**Expected:**
- rls_enabled = true
- rls_policies = 4
- indexes >= 5
- health_status = '✅ HEALTHY'

---

## Automated Test Script

Create this file: `scripts/verify-deployment.sh`

```bash
#!/bin/bash

echo "🚀 FitnessFlow Deployment Verification"
echo "======================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Test 1: Check programService.ts exists
if [ -f "client/src/lib/programService.ts" ]; then
  echo -e "${GREEN}✅ programService.ts exists${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ programService.ts missing${NC}"
  ((FAILED++))
fi

# Test 2: Check Dashboard updated
if grep -q "programService" client/src/components/Dashboard.tsx; then
  echo -e "${GREEN}✅ Dashboard imports programService${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Dashboard not updated${NC}"
  ((FAILED++))
fi

# Test 3: Check TypeScript compilation
cd client
if npm run type-check > /dev/null 2>&1; then
  echo -e "${GREEN}✅ TypeScript compiles${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ TypeScript errors${NC}"
  ((FAILED++))
fi

# Test 4: Check build
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Build succeeds${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Build failed${NC}"
  ((FAILED++))
fi
cd ..

echo "======================================"
echo "Results: $PASSED passed, $FAILED failed"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some checks failed${NC}"
  exit 1
fi
```

Run with: `bash scripts/verify-deployment.sh`

---

## Rollback Procedure

If verification fails:

### Quick Rollback
```bash
# Revert Dashboard changes
git checkout HEAD -- client/src/components/Dashboard.tsx

# Remove programService
rm client/src/lib/programService.ts

# Rebuild
cd client && npm run build
```

### Database Rollback
```sql
-- Drop table (WARNING: Deletes all data)
DROP TABLE IF EXISTS training_programs CASCADE;

-- Or just disable RLS temporarily
ALTER TABLE training_programs DISABLE ROW LEVEL SECURITY;
```

---

## Sign-Off

**Deployment Verified:** [ ] Yes [ ] No
**Verified By:** ___________________
**Date:** ___________________
**Time:** ___________________

**Issues Found:** ___________________
**Resolution:** ___________________

**Ready for Production:** [ ] Yes [ ] No

---

## Support Contacts

- **Technical Issues:** Database admin
- **Code Issues:** Senior developer
- **User Issues:** Support team
- **Emergency:** On-call engineer

---

**Last Updated:** 2025-11-17
**Version:** 1.0.0
