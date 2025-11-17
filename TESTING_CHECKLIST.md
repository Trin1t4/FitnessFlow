# FitnessFlow - Testing Checklist for Supabase Integration

## Pre-Deployment Checklist

### Database Setup
- [ ] SQL migration executed in Supabase
- [ ] Table `training_programs` exists
- [ ] All columns present (run `\d training_programs`)
- [ ] RLS policies active (4 policies visible)
- [ ] Triggers installed (`enforce_single_active_program`)
- [ ] Indexes created (5 indexes)
- [ ] Views created (`active_programs`, `program_history`)

### Environment Variables
- [ ] `VITE_SUPABASE_URL` set in `.env`
- [ ] `VITE_SUPABASE_ANON_KEY` set in `.env`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in server env
- [ ] No keys committed to git
- [ ] Production keys different from dev

### Code Deployment
- [ ] `programService.ts` deployed
- [ ] `Dashboard.tsx` updated
- [ ] TypeScript compilation successful
- [ ] No ESLint errors
- [ ] Build completes without warnings

---

## Feature Testing

### 1. Program Creation (CRITICAL)

**Test Case 1.1: Basic Program Creation**
- [ ] Navigate to Dashboard
- [ ] Complete onboarding + quiz + screening
- [ ] Click "Genera Programma Personalizzato"
- [ ] Verify loading state shows
- [ ] Verify success message: "generato e salvato su cloud!"
- [ ] Verify sync indicator shows "Sincronizzato" (green)

**Test Case 1.2: Database Verification**
```sql
-- Run in Supabase SQL Editor
SELECT id, name, level, goal, is_active, user_id, created_at
FROM training_programs
ORDER BY created_at DESC
LIMIT 1;
```
- [ ] Program exists in database
- [ ] `is_active = true`
- [ ] `user_id` matches authenticated user
- [ ] `weekly_split` is populated (JSONB)
- [ ] `exercises` is populated (JSONB)

**Test Case 1.3: Cache Verification**
```javascript
// Run in browser console
console.log(JSON.parse(localStorage.getItem('currentProgram')));
```
- [ ] Program cached in localStorage
- [ ] Timestamp present
- [ ] Data matches Supabase

---

### 2. Program Loading (CRITICAL)

**Test Case 2.1: Load from Cache**
- [ ] Create program (as above)
- [ ] Refresh page (F5)
- [ ] Verify program loads instantly (<500ms)
- [ ] Check console: "Returning cached active program"
- [ ] Verify sync indicator shows "Sincronizzato"

**Test Case 2.2: Load from Supabase**
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Refresh page
- [ ] Verify program loads from cloud
- [ ] Check console: "Loaded active program from Supabase"
- [ ] Verify data matches original

**Test Case 2.3: No Program State**
- [ ] New user (no programs)
- [ ] Open dashboard
- [ ] Verify "Genera il Tuo Programma" shown
- [ ] Verify NO "Programma Attivo" card
- [ ] Verify sync indicator shows "Offline" or "Sincronizzato"

---

### 3. Multi-Device Sync (CRITICAL)

**Test Case 3.1: Cross-Device Creation**
- [ ] Device A: Login as user X
- [ ] Device A: Generate program "Program A"
- [ ] Device B: Login as same user X
- [ ] Device B: Open dashboard
- [ ] Verify Device B shows "Program A"
- [ ] Verify sync indicator green on both devices

**Test Case 3.2: Active Program Switching**
- [ ] Device A: Create "Program 1"
- [ ] Device B: Refresh → See "Program 1" (active)
- [ ] Device A: Create "Program 2"
- [ ] Device B: Refresh → See "Program 2" (active)
- [ ] Verify "Program 1" now inactive

**Database Check:**
```sql
SELECT name, is_active FROM training_programs
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```
- [ ] Only ONE program has `is_active = true`

---

### 4. Program History (IMPORTANT)

**Test Case 4.1: History Button Visibility**
- [ ] Create 1 program
- [ ] Verify NO "Storico" button (only 1 program)
- [ ] Create 2nd program
- [ ] Verify "Storico (2)" button appears

**Test Case 4.2: History Modal**
- [ ] Click "Storico" button
- [ ] Verify modal opens with list of programs
- [ ] Verify active program has "ATTIVO" badge
- [ ] Verify inactive programs have "Attiva Programma" button
- [ ] Verify dates displayed correctly (format: DD/MM/YYYY)

**Test Case 4.3: Program Activation**
- [ ] Create 3 programs (Program 1, 2, 3)
- [ ] Program 3 is active
- [ ] Open history → Click "Attiva Programma" on Program 1
- [ ] Verify confirmation dialog
- [ ] Confirm activation
- [ ] Verify success message
- [ ] Verify Program 1 now shows "ATTIVO" badge
- [ ] Verify Program 3 badge removed
- [ ] Close history → Verify main view shows Program 1

**Database Check:**
```sql
SELECT name, is_active, updated_at FROM training_programs
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```
- [ ] Only Program 1 has `is_active = true`
- [ ] Other programs have `is_active = false`
- [ ] `updated_at` changed for activated program

---

### 5. Offline Mode (IMPORTANT)

**Test Case 5.1: Load Offline**
- [ ] Create program while online
- [ ] Disconnect network (DevTools → Network → Offline)
- [ ] Refresh page
- [ ] Verify program loads from cache
- [ ] Verify sync indicator shows "Offline" (amber)

**Test Case 5.2: Create Offline**
- [ ] Disconnect network
- [ ] Generate new program
- [ ] Verify warning: "salvato localmente"
- [ ] Verify sync indicator shows "Offline"
- [ ] Check console: "No user, saving to localStorage only"

**Test Case 5.3: Reconnect**
- [ ] Reconnect network
- [ ] Refresh page
- [ ] Verify sync indicator shows "Sincronizzato"
- [ ] Verify program loads from cloud

---

### 6. Migration (IMPORTANT)

**Test Case 6.1: Automatic Migration**
- [ ] Manually add program to localStorage:
```javascript
localStorage.setItem('currentProgram', JSON.stringify({
  name: "Test Migration Program",
  level: "beginner",
  goal: "strength",
  frequency: 3,
  split: "FULL_BODY",
  exercises: []
}));
```
- [ ] Ensure user has NO programs in Supabase
- [ ] Login to app
- [ ] Open dashboard
- [ ] Check console: "Starting localStorage migration"
- [ ] Verify program in Supabase
- [ ] Logout and login again
- [ ] Verify no duplicate migration

**Database Check:**
```sql
SELECT COUNT(*) as program_count FROM training_programs
WHERE user_id = 'user-uuid' AND name = 'Test Migration Program';
```
- [ ] Count should be 1 (not 2 or more)

**Test Case 6.2: Skip Migration (User Has Programs)**
- [ ] User already has program in Supabase
- [ ] Add different program to localStorage
- [ ] Login
- [ ] Check console: "already has programs in Supabase, skipping migration"
- [ ] Verify localStorage program NOT migrated

---

### 7. UI/UX (IMPORTANT)

**Test Case 7.1: Sync Indicator States**
- [ ] Green "Sincronizzato" when online and synced
- [ ] Blue "Sincronizzazione..." during program creation
- [ ] Amber "Offline" when network disconnected

**Test Case 7.2: Program Display**
- [ ] Program name displayed
- [ ] Level badge visible (BEGINNER/INTERMEDIATE/ADVANCED)
- [ ] Goal displayed
- [ ] Frequency shown (Nx/settimana)
- [ ] Split type shown
- [ ] Weekly split view (if `weeklySplit` exists)

**Test Case 7.3: Buttons**
- [ ] "Genera Programma" disabled if no screening
- [ ] "Inizia Allenamento" navigates to /workout
- [ ] "Rigenera" clears current program
- [ ] "Storico" opens history modal
- [ ] "Reset" opens reset modal

---

### 8. Error Handling (CRITICAL)

**Test Case 8.1: Network Timeout**
- [ ] Throttle network (DevTools → Slow 3G)
- [ ] Generate program
- [ ] Verify still works (may take longer)
- [ ] Verify fallback to localStorage if timeout

**Test Case 8.2: Invalid Data**
```typescript
// Try creating program with invalid data
await createProgram({
  name: "", // Empty name
  level: "invalid",
  frequency: 10 // Invalid (> 7)
});
```
- [ ] Verify validation error returned
- [ ] Verify no database insert
- [ ] Verify user-friendly error message

**Test Case 8.3: RLS Policy Violation**
- [ ] Try to insert program with different user_id
- [ ] Verify 403 error
- [ ] Verify no program created
- [ ] Check console for security warning

---

### 9. Performance (OPTIMIZATION)

**Test Case 9.1: Load Time**
- [ ] Measure time to load active program
- [ ] First load (no cache): < 2 seconds
- [ ] Cached load: < 500ms
- [ ] Use DevTools Performance tab

**Test Case 9.2: Database Query Speed**
```sql
EXPLAIN ANALYZE
SELECT * FROM training_programs
WHERE user_id = 'uuid' AND is_active = true;
```
- [ ] Execution time < 50ms
- [ ] Uses index scan (not seq scan)

**Test Case 9.3: Large Programs**
- [ ] Create program with 50+ exercises
- [ ] Verify saves successfully
- [ ] Verify loads without lag
- [ ] Check JSONB size: < 100KB

---

### 10. Security (CRITICAL)

**Test Case 10.1: User Isolation**
- [ ] User A creates program
- [ ] User B logs in
- [ ] Verify User B CANNOT see User A's program
- [ ] Check database: Different user_ids

**Test Case 10.2: RLS Bypass Attempt**
```javascript
// Try to bypass RLS
await supabase.from('training_programs')
  .select('*')
  .eq('user_id', 'different-user-id');
```
- [ ] Verify returns empty array
- [ ] Verify no unauthorized access

**Test Case 10.3: Auth Check**
- [ ] Logout user
- [ ] Try to create program
- [ ] Verify fallback to localStorage only
- [ ] Verify no database insert

---

## Post-Deployment Monitoring

### Week 1 Checks

**Daily:**
- [ ] Check Supabase logs for errors
- [ ] Monitor RLS policy violations
- [ ] Track program creation success rate

**Metrics to Track:**
```sql
-- Program creation rate
SELECT DATE(created_at), COUNT(*) as programs_created
FROM training_programs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at);

-- Active users
SELECT COUNT(DISTINCT user_id) as active_users
FROM training_programs
WHERE created_at > NOW() - INTERVAL '7 days';

-- Average programs per user
SELECT AVG(program_count) as avg_programs_per_user
FROM (
  SELECT user_id, COUNT(*) as program_count
  FROM training_programs
  GROUP BY user_id
) subquery;
```

---

## Rollback Plan

If critical issues found:

1. **Disable Supabase Integration:**
```typescript
// In programService.ts, force offline mode
const FORCE_OFFLINE = true;
```

2. **Revert to localStorage Only:**
```typescript
// In Dashboard.tsx
// Comment out Supabase calls
// Use only localStorage
```

3. **Database Rollback:**
```sql
-- If needed, drop table
DROP TABLE training_programs CASCADE;
-- Re-run old migration
```

---

## Sign-Off

- [ ] All critical tests passed
- [ ] All important tests passed
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Rollback plan ready

**Tested By:** ___________________
**Date:** ___________________
**Build Version:** ___________________
**Approved for Production:** [ ] Yes [ ] No

---

## Notes

Use this section for any issues found during testing:

```
Example:
- Issue: Sync indicator stuck on "Sincronizzazione..."
- Severity: Medium
- Status: Fixed
- Fix: Added timeout to prevent infinite loading state
```

---

**Last Updated:** 2025-11-17
**Version:** 1.0.0
