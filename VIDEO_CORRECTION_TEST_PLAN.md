# 🧪 VIDEO CORRECTION SYSTEM - TEST PLAN

**Server running at**: http://127.0.0.1:5177/

---

## ✅ PRE-REQUISITI

Prima di iniziare, verifica:
- [ ] Server Vite running su porta 5177
- [ ] Utente registrato e logged in
- [ ] Programma generato (Dashboard mostra programma attivo)
- [ ] Gemini API key configurata su Supabase secrets
- [ ] Database migration eseguita correttamente

---

## TEST 1: Verifica Database Setup (5 min)

### 1.1 Verifica Tabelle e Functions

```sql
-- Vai su Supabase Dashboard → SQL Editor
-- Esegui questo query:

-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('video_corrections', 'correction_quota_history');

-- Expected: 2 rows (video_corrections, correction_quota_history)

-- Check RPC functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%video%';

-- Expected: 2 functions (check_video_correction_quota, increment_video_correction_usage)

-- Check storage bucket
SELECT name, public
FROM storage.buckets
WHERE name = 'user-exercise-videos';

-- Expected: 1 row (user-exercise-videos, false)
```

✅ **PASS CRITERIA**: Tutte le queries ritornano i risultati attesi

---

## TEST 2: Test Quota System (10 min)

### 2.1 Get Your User ID

```sql
-- Vai su Supabase Dashboard → Authentication → Users
-- Copia il tuo User ID (es. 123e4567-e89b-12d3-a456-426614174000)

-- OPPURE esegui:
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### 2.2 Verify User Subscription Tier

```sql
-- Replace YOUR_USER_ID with your actual user ID
SELECT
  id,
  email,
  subscription_tier,
  video_corrections_used,
  video_corrections_reset_date,
  created_at
FROM users
WHERE id = 'YOUR_USER_ID';

-- Expected: subscription_tier = 'free', video_corrections_used = 0
```

### 2.3 Test Quota Check Function

```sql
-- Test RPC function (replace YOUR_USER_ID)
SELECT check_video_correction_quota('YOUR_USER_ID');

-- Expected output (JSON):
{
  "can_upload": true,
  "tier": "free",
  "used": 0,
  "max_allowed": 1,
  "remaining": 1,
  "reset_date": "2025-XX-XX...",
  "days_until_reset": XX
}
```

✅ **PASS CRITERIA**: `can_upload = true`, `remaining = 1` per free tier

---

## TEST 3: Upload Video Flow (15 min)

### 3.1 Navigate to Workout

1. Vai a: http://127.0.0.1:5177/login
2. Login con le tue credenziali
3. Vai a Dashboard: http://127.0.0.1:5177/dashboard
4. Click "Start Workout LIVE" button

### 3.2 Record Exercise Video

1. Durante il workout, cerca un esercizio (es. "Push-up")
2. Cerca il button "📹 Record Form Check" sotto l'esercizio
3. Click sul button
4. **Verifica modal apertura**:
   - Titolo: "Video Correction - [Exercise Name]"
   - Quota display: "1/1 disponibili (FREE)"
   - Buttons: "Registra Video" e "Carica File"

### 3.3 Upload Test Video

**Opzione A: Registra con webcam**
1. Click "Registra Video"
2. Allow camera permission
3. Registra 10-15 secondi di movimento
4. Click "Stop"
5. Review preview
6. Click "Analizza con AI"

**Opzione B: Carica file esistente** (più veloce per test)
1. Click "Carica File"
2. Seleziona un video MP4 esistente (max 100MB)
3. Click "Analizza con AI"

### 3.4 Verify Upload Progress

**In Browser**:
- Toast notification: "Caricamento in corso..."
- Progress bar 0% → 100%
- Toast: "Video caricato! Analisi in corso..."
- Modal si chiude

**In Supabase Storage**:
1. Vai su Supabase Dashboard → Storage → `user-exercise-videos`
2. **Verifica file caricato**: `{user_id}/{timestamp}_{exercise}_xxx.mp4`
3. Size > 0 bytes

**In Database**:
```sql
-- Check video_corrections table
SELECT
  id,
  user_id,
  video_filename,
  exercise_name,
  processing_status,
  created_at
FROM video_corrections
ORDER BY created_at DESC
LIMIT 1;

-- Expected: processing_status = 'pending' o 'processing'
```

✅ **PASS CRITERIA**: File visibile in Storage, record in DB con status 'pending'

---

## TEST 4: Gemini Processing (60 sec wait)

### 4.1 Monitor Edge Function Logs

**Opzione A: Supabase Dashboard**
1. Vai su Supabase Dashboard → Edge Functions
2. Click su "analyze-exercise-video"
3. Tab "Logs"
4. Refresh ogni 10 secondi

**Opzione B: Supabase CLI** (se installato)
```bash
supabase functions logs analyze-exercise-video --follow
```

### 4.2 Expected Log Sequence

```
[Gemini] 📥 Received video correction request
[Gemini] User ID: xxx, Exercise: Push-up
[Gemini] 📹 Downloading video from Storage...
[Gemini] ✅ Video downloaded (XXX bytes)
[Gemini] 🔄 Converting to base64...
[Gemini] 📡 Calling Gemini API...
[Gemini] ✅ Gemini API response received
[Gemini] 📊 Parsing feedback...
[Gemini] ✅ Processing completed successfully
[Gemini] 💾 Updated database record
```

### 4.3 Verify Processing Completion

```sql
-- Wait 30-60 seconds, then check:
SELECT
  id,
  exercise_name,
  processing_status,
  feedback_score,
  feedback_issues,
  feedback_corrections,
  load_recommendation,
  created_at
FROM video_corrections
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

-- Expected:
-- processing_status = 'completed'
-- feedback_score = 1-10 (numero)
-- feedback_issues = JSON array con issues
-- feedback_corrections = JSON array con cues
```

✅ **PASS CRITERIA**: `processing_status = 'completed'`, feedback popolato

---

## TEST 5: Video Feedback Display (5 min)

### 5.1 Get Correction ID

```sql
-- Copy the 'id' from previous query
SELECT id
FROM video_corrections
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

-- Example output: 123e4567-e89b-12d3-a456-426614174000
```

### 5.2 Navigate to Feedback Page

1. Vai a: http://127.0.0.1:5177/video-feedback/[CORRECTION_ID]
   - Sostituisci `[CORRECTION_ID]` con l'ID copiato
   - Example: http://127.0.0.1:5177/video-feedback/123e4567-e89b-12d3-a456-426614174000

### 5.3 Verify Feedback Display

**Left Column**:
- [ ] Video player mostra il video caricato
- [ ] Play/pause controls funzionano
- [ ] Score 1-10 visualizzato con colore appropriato:
  - Verde (8-10): Ottima esecuzione
  - Giallo (6-7): Buona forma
  - Rosso (<6): Forma compromessa
- [ ] Star rating (10 stelle, colorate fino a score)
- [ ] Load recommendation badge:
  - 🔼 Aumenta carico (increase_5_percent)
  - ➖ Mantieni (maintain)
  - 🔽 Riduci (decrease_10/20_percent)

**Right Column**:
- [ ] Safety warnings (se presenti) con badge rosso
- [ ] Issues detected cards con severity badges:
  - 🔵 Low severity (blue)
  - 🟡 Medium severity (yellow)
  - 🔴 High severity (red)
- [ ] Timestamp "Visibile a: Xs, Ys"
- [ ] Corrective cues con checkmarks verdi

**Bottom**:
- [ ] Button "Analizza Altro Video"
- [ ] Button "Torna al Workout"

✅ **PASS CRITERIA**: Tutti gli elementi visualizzati correttamente, video riproducibile

---

## TEST 6: Quota Exhaustion (5 min)

### 6.1 Simulate Quota Exhausted

```sql
-- Free tier has max 1 video
-- Simulate user has already used 1 video:
UPDATE users
SET video_corrections_used = 1
WHERE id = 'YOUR_USER_ID';
```

### 6.2 Try Second Upload

1. Torna al Workout Logger
2. Click "📹 Record Form Check" su un altro esercizio
3. **Verifica modal "Quota Esaurita"**:
   - Titolo: "⚠️ Video Corrections Esaurite"
   - Message: "Hai usato 1/1 video disponibili per il tier FREE"
   - Upgrade options: BASE (0 video) / PRO (12 video) / PREMIUM (∞)
   - Button "Chiudi" o "Upgrade"

✅ **PASS CRITERIA**: Modal quota esaurita mostrata, upload bloccato

### 6.3 Reset Quota (cleanup)

```sql
-- Reset per ulteriori test:
UPDATE users
SET video_corrections_used = 0
WHERE id = 'YOUR_USER_ID';
```

---

## TEST 7: Paywall Display (10 min)

### 7.1 Simulate 7+ Days Since Signup

```sql
-- Modifica created_at per simulare utente di 8 giorni fa
UPDATE users
SET created_at = NOW() - INTERVAL '8 days',
    subscription_tier = 'free'
WHERE id = 'YOUR_USER_ID';
```

### 7.2 Reload Dashboard

1. Vai a: http://127.0.0.1:5177/dashboard
2. Ricarica la pagina (F5)
3. **Verifica PaywallModal appare automaticamente**

### 7.3 Verify Paywall Content

**Header**:
- [ ] Titolo: "🎉 Complimenti! Hai finito la settimana 1"
- [ ] Subtitle: "Sblocca le prossime 5 settimane..."
- [ ] User progress cards:
  - Workout Completati (numero)
  - Miglioramenti Baseline (numero)
  - Esercizi Sostituiti (numero)

**Pricing Plans** (3 cards):
- [ ] **BASE**: €19.90 per 6 settimane
  - ✅ Programma completo
  - ✅ Progressive overload
  - ✅ Pain management
  - ❌ Video correzioni AI (0 inclusi)

- [ ] **PRO** (badge "⭐ PIÙ SCELTO"):
  - €29.90 per 6 settimane
  - ✅ Tutto del BASE
  - ✅ 12 video correzioni AI (2/settimana) [HIGHLIGHTED]
  - ✅ Technique score tracking

- [ ] **PREMIUM** (badge "👑 MASSIMO"):
  - €44.90 per 6 settimane
  - ✅ Tutto del PRO
  - ✅ Video correzioni ILLIMITATE [HIGHLIGHTED]
  - ✅ Coach check-in ogni 2 settimane

**Benefits Section**:
- [ ] "Perché FitnessFlow è diverso?"
- [ ] 4 benefit cards con icons

**Comparison Table**:
- [ ] "FitnessFlow vs Alternative"
- [ ] 3 columns: Schede PDF / App Generiche / FitnessFlow PRO
- [ ] 5 rows di confronto

**Footer**:
- [ ] "🔒 Garanzia 14 giorni soddisfatto o rimborsato"
- [ ] "Nessun rinnovo automatico"

### 7.4 Test Plan Selection

1. Click su card "PRO"
2. Verifica card highlight (border blu)
3. Click button "Seleziona" (o "✓ Selezionato")
4. **Verifica alert**:
   - Message: "Piano PRO selezionato!"
   - "Integrazione Stripe in arrivo..."

✅ **PASS CRITERIA**: Modal completo, tutte le sezioni visibili, selezione funziona

### 7.5 Reset User Date (cleanup)

```sql
-- Reset per testing normale:
UPDATE users
SET created_at = NOW()
WHERE id = 'YOUR_USER_ID';
```

---

## TEST 8: Error Handling (10 min)

### 8.1 Test Invalid Correction ID

1. Vai a: http://127.0.0.1:5177/video-feedback/invalid-id-123
2. **Verifica**:
   - Message "Feedback non disponibile" o "Correction ID mancante"
   - No crash, gestione errore graceful

### 8.2 Test Video Still Processing

```sql
-- Crea record fake con processing status
INSERT INTO video_corrections (
  user_id,
  video_url,
  video_filename,
  exercise_name,
  exercise_pattern,
  processing_status
) VALUES (
  'YOUR_USER_ID',
  'fake/path.mp4',
  'fake_video.mp4',
  'Test Exercise',
  'horizontal_push',
  'processing'
);
```

1. Copy l'ID del record appena creato
2. Vai a `/video-feedback/{id}`
3. **Verifica**:
   - Message: "Analisi ancora in corso..."
   - No error, attesa graceful

### 8.3 Test Failed Processing

```sql
-- Update fake record to failed
UPDATE video_corrections
SET processing_status = 'failed',
    error_message = 'Test error message'
WHERE exercise_name = 'Test Exercise'
AND user_id = 'YOUR_USER_ID';
```

1. Reload la pagina
2. **Verifica**:
   - Message: "Feedback non disponibile"
   - Error mostrato in modo user-friendly

✅ **PASS CRITERIA**: Tutti gli errori gestiti gracefully, no crash

---

## 🎯 TEST SUMMARY CHECKLIST

Al completamento, verifica che tutti i test siano passati:

### Database Setup
- [ ] Tabelle create correttamente
- [ ] RPC functions funzionanti
- [ ] Storage bucket configurato

### Upload Flow
- [ ] VideoUploadModal si apre
- [ ] Quota display corretta
- [ ] Upload video funziona
- [ ] Progress bar visualizzata
- [ ] File caricato su Storage

### Processing
- [ ] Edge Function triggerata
- [ ] Gemini API chiamata
- [ ] Feedback salvato in DB
- [ ] Processing completa in <60s

### Feedback Display
- [ ] Route accessibile
- [ ] Video player funziona
- [ ] Score visualizzato
- [ ] Issues mostrati
- [ ] Corrections mostrate
- [ ] Load recommendation mostrata

### Quota System
- [ ] Quota check funziona
- [ ] Modal "Quota Esaurita" mostrata
- [ ] Upgrade options visibili

### Paywall
- [ ] Trigger automatico dopo 7 giorni
- [ ] 3 tiers visualizzati
- [ ] User progress mostrato
- [ ] Plan selection funziona

### Error Handling
- [ ] Invalid ID gestito
- [ ] Processing in corso gestito
- [ ] Failed processing gestito

---

## 📊 TEST RESULTS

**Date**: ___________
**Tester**: ___________

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Database Setup | ⬜ PASS / ⬜ FAIL | |
| 2 | Quota System | ⬜ PASS / ⬜ FAIL | |
| 3 | Upload Flow | ⬜ PASS / ⬜ FAIL | |
| 4 | Gemini Processing | ⬜ PASS / ⬜ FAIL | |
| 5 | Feedback Display | ⬜ PASS / ⬜ FAIL | |
| 6 | Quota Exhaustion | ⬜ PASS / ⬜ FAIL | |
| 7 | Paywall Display | ⬜ PASS / ⬜ FAIL | |
| 8 | Error Handling | ⬜ PASS / ⬜ FAIL | |

**Overall Status**: ⬜ ALL PASS / ⬜ SOME FAILURES

---

## 🐛 TROUBLESHOOTING

### Problem: Video upload stuck at 0%
**Solution**:
- Check browser console for errors
- Verify Storage RLS policies allow INSERT for authenticated users
- Check file size < 100MB

### Problem: Gemini processing never completes
**Solution**:
- Check Edge Function logs for errors
- Verify GEMINI_API_KEY is set correctly in Supabase secrets
- Check Gemini API quota (free tier limits)

### Problem: Video player shows "Video non disponibile"
**Solution**:
- Check signed URL generation in videoCorrectionService.ts
- Verify Storage RLS allows SELECT for video owner
- Check video file exists in Storage bucket

### Problem: Paywall never shows
**Solution**:
- Check browser console for errors in checkPaywallTrigger()
- Verify users table has subscription_tier column
- Check user created_at date in database

---

## 📞 SUPPORT

Se tutti i test falliscono:
1. Check dev server logs
2. Check browser console (F12)
3. Check Supabase logs (Database, Edge Functions, Storage)
4. Verify Gemini API key is valid

Per problemi specifici, controlla la sezione TROUBLESHOOTING in:
- `VIDEO_CORRECTION_SYSTEM_README.md`
- `TODO_VIDEO_CORRECTION.md`
