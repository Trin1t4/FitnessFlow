# 🚀 QUICK START - Video Correction Testing

**Server**: http://127.0.0.1:5177/

---

## ⏱️ 5-MINUTE QUICK TEST

### Step 1: Get Your User ID (1 min)

1. Vai su **Supabase Dashboard** → **Authentication** → **Users**
2. Trova il tuo utente (cerca per email)
3. **Copia il User ID** (es. `123e4567-e89b-12d3-a456-426614174000`)
4. Tieni il User ID a portata di mano

---

### Step 2: Verify Database Setup (30 sec)

Vai su **Supabase Dashboard** → **SQL Editor** → Esegui:

```sql
-- Quick verification
SELECT 'Tables OK' as status FROM video_corrections LIMIT 1
UNION ALL
SELECT 'Functions OK' FROM check_video_correction_quota('YOUR_USER_ID') LIMIT 1
UNION ALL
SELECT 'Storage OK' FROM storage.buckets WHERE name = 'user-exercise-videos' LIMIT 1;
```

✅ **Aspettati 3 righe**: Tables OK, Functions OK, Storage OK

---

### Step 3: Upload Test Video (2 min)

1. **Login**: http://127.0.0.1:5177/login
2. **Dashboard**: http://127.0.0.1:5177/dashboard
3. Click **"Start Workout LIVE"**
4. Su un esercizio qualsiasi, click **"📹 Record Form Check"**
5. **Carica un video** (o registra 10 sec con webcam)
6. Click **"Analizza con AI"**

✅ **Aspettati**: Toast "Video caricato! Analisi in corso..."

---

### Step 4: Check Processing (1 min)

Vai su **Supabase** → **Edge Functions** → **analyze-exercise-video** → **Logs**

✅ **Aspettati logs**:
```
[Gemini] 📥 Received video correction request
[Gemini] 📹 Downloading video...
[Gemini] 📡 Calling Gemini API...
[Gemini] ✅ Processing completed successfully
```

**O esegui SQL**:
```sql
SELECT id, processing_status, feedback_score
FROM video_corrections
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

Aspetta 30-60 secondi se `processing_status = 'pending'`

---

### Step 5: View Feedback (30 sec)

1. **Copia l'ID** dalla query precedente
2. **Vai a**: http://127.0.0.1:5177/video-feedback/[ID]

✅ **Aspettati**:
- Video player funzionante
- Score 1-10
- Issues rilevati
- Corrections suggerite

---

### Step 6: Test Paywall (30 sec)

```sql
-- Simula utente di 8 giorni fa
UPDATE users
SET created_at = NOW() - INTERVAL '8 days'
WHERE id = 'YOUR_USER_ID';
```

1. Reload Dashboard: http://127.0.0.1:5177/dashboard
2. **Aspettati**: PaywallModal si apre automaticamente

✅ **Verifica**: 3 tiers (BASE €19.90 / PRO €29.90 / PREMIUM €44.90)

---

## ✅ QUICK PASS/FAIL CHECKLIST

- [ ] Database setup OK
- [ ] Video uploaded
- [ ] Gemini processing completed
- [ ] Feedback page shows data
- [ ] Paywall triggered after 7 days

**ALL PASS?** → Sistema funzionante! 🎉

**ANY FAIL?** → Controlla `VIDEO_CORRECTION_TEST_PLAN.md` per debugging

---

## 🐛 QUICK TROUBLESHOOTING

### Video upload fails
```sql
-- Check quota
SELECT check_video_correction_quota('YOUR_USER_ID');
-- Should show: can_upload = true
```

### Gemini doesn't process
```bash
# Check Edge Function logs
# Supabase Dashboard → Edge Functions → analyze-exercise-video → Logs
```

### Paywall doesn't show
```sql
-- Check user created_at
SELECT created_at, subscription_tier
FROM users
WHERE id = 'YOUR_USER_ID';
-- created_at should be > 7 days ago
```

---

## 📋 FULL TEST SUITE

Per test completo e dettagliato:
- Vedi: `VIDEO_CORRECTION_TEST_PLAN.md`
- SQL queries: `video_correction_test_queries.sql`

---

## 🔄 RESET EVERYTHING (for re-testing)

```sql
-- Delete all your video corrections
DELETE FROM video_corrections WHERE user_id = 'YOUR_USER_ID';

-- Reset user state
UPDATE users
SET
  video_corrections_used = 0,
  subscription_tier = 'free',
  created_at = NOW()
WHERE id = 'YOUR_USER_ID';

-- Delete videos from Storage (manual via Supabase Dashboard)
-- Go to Storage → user-exercise-videos → Delete your folder
```

---

## 📞 HELP

**Documenti di riferimento**:
1. `VIDEO_CORRECTION_TEST_PLAN.md` - Test completo
2. `video_correction_test_queries.sql` - SQL queries pronti
3. `VIDEO_CORRECTION_SYSTEM_README.md` - Deployment guide
4. `TODO_VIDEO_CORRECTION.md` - Task list originale

**Supabase Dashboard**:
- Tables: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
- Storage: https://supabase.com/dashboard/project/YOUR_PROJECT/storage/buckets
- Edge Functions: https://supabase.com/dashboard/project/YOUR_PROJECT/functions
- Logs: https://supabase.com/dashboard/project/YOUR_PROJECT/logs

**Dev Server**: http://127.0.0.1:5177/
