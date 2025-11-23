# 🎥 VIDEO CORRECTION SYSTEM - DEPLOYMENT GUIDE

Sistema completo di video correction con Gemini AI + Paywall (€19.90/€29.90/€44.90)

## 📋 FILES CREATI

### 1. Database & Backend
- ✅ `supabase_video_corrections_migration.sql` - Schema completo database
- ✅ `supabase/functions/analyze-exercise-video/index.ts` - Edge Function Gemini
- ✅ `packages/web/src/lib/videoCorrectionService.ts` - Service layer TypeScript

### 2. Frontend Components
- ✅ `packages/web/src/components/VideoUploadModal.tsx` - Upload/record video
- ✅ `packages/web/src/components/VideoFeedbackView.tsx` - Mostra risultati AI
- ✅ `packages/web/src/components/PaywallModal.tsx` - Pricing tiers

---

## 🚀 DEPLOYMENT STEP-BY-STEP

### **STEP 1: Setup Gemini API (5 minuti)**

1. Vai a [Google AI Studio](https://aistudio.google.com/)
2. Fai login con account Google
3. Click su "Get API Key" → "Create API Key"
4. Copia la API key (inizia con `AIza...`)
5. Vai su Supabase Dashboard → Project Settings → Edge Functions
6. Aggiungi secret:
   ```
   Nome: GEMINI_API_KEY
   Valore: AIzaSy... (la tua API key)
   ```

---

### **STEP 2: Database Migration (10 minuti)**

1. Apri Supabase Dashboard → SQL Editor
2. Crea nuova query
3. Copia tutto il contenuto di `supabase_video_corrections_migration.sql`
4. Incolla nella query editor
5. Click "Run" (esegui)
6. Verifica risultato:
   ```sql
   -- Controlla che le tabelle siano state create
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('video_corrections', 'correction_quota_history');

   -- Controlla che le funzioni RPC esistano
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name LIKE '%video%';
   ```

**Output atteso**:
- Tabelle: `video_corrections`, `correction_quota_history`
- Funzioni: `check_video_correction_quota`, `increment_video_correction_usage`
- Storage bucket: `user-exercise-videos`

---

### **STEP 3: Deploy Edge Function (15 minuti)**

#### Opzione A: Supabase CLI (Raccomandato)

```bash
# 1. Installa Supabase CLI (se non l'hai già)
npm install -g supabase

# 2. Login
supabase login

# 3. Link al tuo progetto
supabase link --project-ref YOUR_PROJECT_REF
# Trova PROJECT_REF in Supabase Dashboard URL: https://supabase.com/dashboard/project/YOUR_PROJECT_REF

# 4. Deploy Edge Function
cd C:\Users\dario\OneDrive\Desktop\FitnessFlow
supabase functions deploy analyze-exercise-video

# 5. Test Edge Function
supabase functions invoke analyze-exercise-video --data '{"test": true}'
```

#### Opzione B: Manual Deploy (Supabase Dashboard)

1. Vai su Supabase Dashboard → Edge Functions
2. Click "Create Function"
3. Nome: `analyze-exercise-video`
4. Copia contenuto di `supabase/functions/analyze-exercise-video/index.ts`
5. Incolla nell'editor
6. Click "Deploy"

**Verifica deployment**:
```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-exercise-video" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

### **STEP 4: Frontend Integration (5 minuti)**

Tutti i componenti sono già creati! Devi solo integrarli in Dashboard/WorkoutLogger:

**File da modificare**: `packages/web/src/components/WorkoutLogger.tsx`

```typescript
import { useState } from 'react';
import VideoUploadModal from './VideoUploadModal';

export default function WorkoutLogger() {
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Aggiungi button "Record Form Check" per ogni esercizio
  return (
    <div>
      {/* ... existing code ... */}

      {/* Dopo RPE slider, aggiungi questo button */}
      <button
        onClick={() => {
          setSelectedExercise(exercise.name);
          setShowVideoUpload(true);
        }}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg mt-2"
      >
        📹 Record Form Check
      </button>

      {/* Video Upload Modal */}
      {showVideoUpload && selectedExercise && (
        <VideoUploadModal
          open={showVideoUpload}
          onClose={() => setShowVideoUpload(false)}
          exerciseName={selectedExercise}
          exercisePattern={exercise.pattern}
          workoutLogId={workoutLog?.id}
          setNumber={currentSetIndex + 1}
          onUploadComplete={(correctionId) => {
            setShowVideoUpload(false);
            // Navigate to feedback view
            window.location.href = `/video-feedback/${correctionId}`;
          }}
        />
      )}
    </div>
  );
}
```

---

### **STEP 5: Add Paywall to Dashboard (10 minuti)**

**File da modificare**: `packages/web/src/components/Dashboard.tsx`

```typescript
import { useState, useEffect } from 'react';
import PaywallModal from './PaywallModal';
import { useAppStore } from '../store/useAppStore';

export default function Dashboard() {
  const [showPaywall, setShowPaywall] = useState(false);
  const userId = useAppStore((state) => state.userId);

  // Check if user should see paywall (after 7 days)
  useEffect(() => {
    async function checkPaywall() {
      const { data: user } = await supabase
        .from('users')
        .select('created_at, subscription_tier')
        .eq('id', userId)
        .single();

      if (!user) return;

      const daysSinceSignup = Math.floor(
        (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Show paywall dopo 7 giorni se ancora su free tier
      if (daysSinceSignup >= 7 && user.subscription_tier === 'free') {
        setShowPaywall(true);
      }
    }

    checkPaywall();
  }, [userId]);

  return (
    <div>
      {/* ... existing dashboard code ... */}

      {/* Paywall Modal */}
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSelectPlan={(tier) => {
          console.log('Selected tier:', tier);
          // TODO: Integrate Stripe payment
          // Per ora, aggiorna manualmente subscription_tier in database
        }}
        userProgress={{
          workoutsCompleted: 3,
          baselineImprovements: ['Squat +5kg', 'Bench +2.5kg'],
          injuriesAvoided: 0
        }}
      />
    </div>
  );
}
```

---

## 🧪 TESTING

### **Test 1: Database Migration**

```sql
-- Test check_video_correction_quota function
SELECT check_video_correction_quota('YOUR_USER_ID');

-- Expected output:
-- {
--   "can_upload": true,
--   "tier": "free",
--   "used": 0,
--   "max_allowed": 1,
--   "remaining": 1,
--   ...
-- }
```

### **Test 2: Video Upload (Frontend)**

1. Login all'app
2. Vai a Workout Logger
3. Click "Record Form Check"
4. Registra video 10 secondi
5. Click "Analizza con AI"
6. Verifica upload:
   - Supabase Dashboard → Storage → `user-exercise-videos`
   - Dovresti vedere il video caricato

### **Test 3: Gemini Processing**

```bash
# Check Edge Function logs
supabase functions logs analyze-exercise-video

# Expected logs:
# [Gemini] Processing video for user...
# [Gemini] Calling Gemini API...
# [Gemini] ✅ Processing completed successfully
```

### **Test 4: Feedback Display**

1. Dopo processing completato (30-60 sec)
2. Naviga a `/video-feedback/{correction_id}`
3. Verifica che mostri:
   - ✅ Video player
   - ✅ Score 1-10
   - ✅ Issues detected
   - ✅ Corrections suggerite

### **Test 5: Quota System**

```sql
-- Simula utente che ha usato tutte le correzioni
UPDATE users
SET video_corrections_used = 1
WHERE id = 'YOUR_USER_ID';

-- Prova a caricare altro video
-- Dovrebbe mostrare "Quota Esaurita" modal
```

### **Test 6: Paywall**

1. Modifica data creazione utente per simul are 7+ giorni:
   ```sql
   UPDATE users
   SET created_at = NOW() - INTERVAL '8 days'
   WHERE id = 'YOUR_USER_ID';
   ```
2. Ricarica Dashboard
3. Dovrebbe mostrare PaywallModal automaticamente

---

## 💰 PRICING TIERS

| Tier | Prezzo | Video Corrections | Features |
|---|---|---|---|
| **FREE** | €0 | 1 gratis (demo) | Settimana 1 programma |
| **BASE** | €19.90/6 settimane | 0 | Programma completo, no video |
| **PRO** | €29.90/6 settimane | 12 (2/settimana) | Programma + video corrections |
| **PREMIUM** | €44.90/6 settimane | Illimitati | Tutto + coach check-in |

---

## 🎯 NEXT STEPS

### Immediate (Questa Settimana)

1. ✅ Esegui migration SQL su Supabase
2. ✅ Setup Gemini API key
3. ✅ Deploy Edge Function
4. ✅ Test upload video + feedback
5. ✅ Integra VideoUploadModal in WorkoutLogger
6. ✅ Integra PaywallModal in Dashboard

### Short-Term (Prossime 2 Settimane)

1. **Stripe Integration**
   - Setup Stripe account
   - Create products per tier (€19.90/€29.90/€44.90)
   - Implement payment flow in PaywallModal
   - Update `subscription_tier` dopo payment success

2. **Email Notifications**
   - Video processing completato
   - Paywall reminder (day 5, 6, 7)
   - Subscription expiring soon

3. **Analytics Tracking**
   - Video upload conversion rate
   - Paywall conversion rate per tier
   - Time to first video upload

### Long-Term (1-2 Mesi)

1. **Video Correction Enhancements**
   - Implement MediaPipe pose estimation (riduce costi AI)
   - Add video comparison side-by-side
   - Technique score progression graphs

2. **Coach Dashboard**
   - Manual review di video corrections
   - Coach can add custom notes
   - Video call scheduling (Premium tier)

3. **Mobile App**
   - Port sistema video corrections a React Native
   - Camera native integration
   - Push notifications per feedback ready

---

## 📊 COSTI STIMATI

### Gemini API (con volume reale)

**Scenario 100 utenti attivi/mese**:
- 60 utenti BASE (0 video) = €0
- 30 utenti PRO (12 video/ciclo × 0.5 cicli/mese) = 180 video/mese
- 10 utenti PREMIUM (30 video/ciclo × 0.5) = 150 video/mese

**Totale**: 330 video/mese × €0.008 = **€2.64/mese**

**Revenue**:
- 60 × €19.90 = €1,194
- 30 × €29.90 = €897
- 10 × €44.90 = €449
**Totale**: €2,540/mese (per 6 settimane = €1,270/mese equivalent)

**Margine AI**: €2.64 / €1,270 = **0.2%** → TRASCURABILE!

---

## 🐛 TROUBLESHOOTING

### Error: "Gemini API key not found"

```bash
# Verifica che la API key sia settata
supabase secrets list

# Se non c'è, aggiungi:
supabase secrets set GEMINI_API_KEY=AIzaSy...
```

### Error: "Could not find table 'video_corrections'"

```sql
-- Verifica che la migration sia stata eseguita
SELECT * FROM information_schema.tables WHERE table_name = 'video_corrections';

-- Se non esiste, riesegui migration SQL
```

### Error: "Storage bucket not found"

```sql
-- Verifica bucket
SELECT * FROM storage.buckets WHERE name = 'user-exercise-videos';

-- Se non esiste, crea manualmente:
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-exercise-videos', 'user-exercise-videos', false);
```

### Video upload infinito (stuck at "Uploading...")

- Check browser console per errori
- Verifica RLS policies su Storage:
  ```sql
  SELECT * FROM storage.policies WHERE bucket_id = 'user-exercise-videos';
  ```
- Verifica che userId nel path corrisponda a auth.uid()

---

## 📞 SUPPORT

Se hai problemi durante deployment:

1. Check Supabase Dashboard → Logs
2. Check Edge Function logs: `supabase functions logs analyze-exercise-video`
3. Check browser console per errori frontend
4. Verifica che tutte le API keys siano settate correttamente

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Gemini API key ottenuta e configurata su Supabase
- [ ] Migration SQL eseguita con successo
- [ ] Edge Function deployata e testata
- [ ] Storage bucket `user-exercise-videos` creato con RLS policies
- [ ] VideoUploadModal integrato in WorkoutLogger
- [ ] VideoFeedbackView accessibile via route
- [ ] PaywallModal integrato in Dashboard
- [ ] Test completo: upload → processing → feedback
- [ ] Test quota system (free vs pro vs premium)
- [ ] Test paywall display dopo 7 giorni

Quando tutti i checkbox sono ✅, il sistema è pronto per production! 🚀
