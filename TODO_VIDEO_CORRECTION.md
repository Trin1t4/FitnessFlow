# 📋 TODO - Video Correction System Implementation

## ✅ COMPLETATO (Oggi)

- [x] Gemini API key configurata su Supabase secrets
- [x] Database migration eseguita (video_corrections, correction_quota_history, users update)
- [x] Edge Function `analyze-exercise-video` deployata su Supabase
- [x] VideoUploadModal integrato in WorkoutLogger con button "Record Form Check"
- [x] Service layer `videoCorrectionService.ts` creato
- [x] Componenti frontend creati: VideoUploadModal, VideoFeedbackView, PaywallModal

---

## 🚧 DA FARE (Domani)

### **1. Integra PaywallModal in Dashboard** (15 min)
- [ ] Apri `packages/web/src/components/Dashboard.tsx`
- [ ] Aggiungi import `PaywallModal`
- [ ] Aggiungi state `showPaywall`
- [ ] Aggiungi useEffect per check se mostrare paywall (dopo 7 giorni)
- [ ] Aggiungi PaywallModal component nel return
- [ ] Test: Modifica `created_at` utente per simulare 7+ giorni

**Codice da aggiungere**:
```typescript
import PaywallModal from './PaywallModal';
const [showPaywall, setShowPaywall] = useState(false);

useEffect(() => {
  // Check if user should see paywall after 7 days
  async function checkPaywall() {
    const { data: user } = await supabase
      .from('users')
      .select('created_at, subscription_tier')
      .eq('id', userId)
      .single();

    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceSignup >= 7 && user.subscription_tier === 'free') {
      setShowPaywall(true);
    }
  }
  checkPaywall();
}, [userId]);

// Nel return, prima della chiusura:
<PaywallModal
  open={showPaywall}
  onClose={() => setShowPaywall(false)}
  onSelectPlan={(tier) => {
    console.log('Selected:', tier);
    // TODO: Stripe integration
  }}
/>
```

---

### **2. Crea Route Video Feedback** (20 min)

#### 2.1 Crea pagina VideoFeedback
- [ ] Crea file `packages/web/src/pages/VideoFeedback.tsx`

**Codice**:
```typescript
import { useParams } from 'react-router-dom';
import VideoFeedbackView from '../components/VideoFeedbackView';

export default function VideoFeedbackPage() {
  const { correctionId } = useParams<{ correctionId: string }>();

  if (!correctionId) {
    return <div>Correction ID mancante</div>;
  }

  return <VideoFeedbackView correctionId={correctionId} />;
}
```

#### 2.2 Aggiungi route in App.tsx
- [ ] Apri `packages/web/src/App.tsx`
- [ ] Aggiungi import `VideoFeedbackPage`
- [ ] Aggiungi route:
```typescript
<Route path="/video-feedback/:correctionId" element={<VideoFeedbackPage />} />
```

---

### **3. Test Completo Sistema** (30 min)

#### 3.1 Test Upload Video
- [ ] Login all'app
- [ ] Vai a Workout Logger
- [ ] Click "📹 Record Form Check" su un esercizio
- [ ] Verifica modal si apre
- [ ] Verifica quota mostrata (1/1 per free tier)
- [ ] Registra video 10 secondi (o carica file)
- [ ] Verifica upload progress bar
- [ ] Verifica toast "Video caricato! Analisi in corso..."

#### 3.2 Test Processing Gemini
- [ ] Vai su Supabase → Edge Functions → Logs
- [ ] Verifica log `[Gemini] Processing video for user...`
- [ ] Attendi 30-60 secondi
- [ ] Verifica log `[Gemini] ✅ Processing completed successfully`
- [ ] Vai su Supabase → Table Editor → `video_corrections`
- [ ] Verifica record con `processing_status = 'completed'`
- [ ] Verifica `feedback_score` popolato (es. 7/10)
- [ ] Verifica `feedback_issues` JSON con issue rilevati

#### 3.3 Test Feedback View
- [ ] Copia `correction_id` dalla tabella
- [ ] Naviga a `http://localhost:5173/video-feedback/{correction_id}`
- [ ] Verifica video player mostra il video
- [ ] Verifica score 1-10 visualizzato
- [ ] Verifica issues cards con severity badges
- [ ] Verifica corrections suggerite
- [ ] Verifica load recommendation

#### 3.4 Test Quota System
- [ ] Prova a caricare secondo video
- [ ] Dovrebbe mostrare modal "Quota Esaurita"
- [ ] Verifica messaggio upgrade a PRO/PREMIUM
- [ ] Test con SQL:
```sql
-- Simula utente PRO con 12 video disponibili
UPDATE users
SET subscription_tier = 'pro',
    video_corrections_used = 0
WHERE id = 'YOUR_USER_ID';
```
- [ ] Riprova upload, dovrebbe funzionare (2/12)

#### 3.5 Test Paywall
- [ ] Modifica data creazione utente:
```sql
UPDATE users
SET created_at = NOW() - INTERVAL '8 days'
WHERE id = 'YOUR_USER_ID';
```
- [ ] Ricarica Dashboard
- [ ] Verifica PaywallModal appare automaticamente
- [ ] Verifica 3 tiers mostrati (BASE €19.90, PRO €29.90, PREMIUM €44.90)
- [ ] Verifica comparison table
- [ ] Click "Seleziona PRO" → verifica alert con tier selezionato

---

### **4. Stripe Integration** (2-3 ore) - OPZIONALE

#### 4.1 Setup Stripe Account
- [ ] Vai su [stripe.com](https://stripe.com)
- [ ] Crea account (o usa esistente)
- [ ] Ottieni API keys (test mode):
  - Publishable key (pk_test_...)
  - Secret key (sk_test_...)

#### 4.2 Crea Products su Stripe
- [ ] Vai su Stripe Dashboard → Products
- [ ] Crea 3 products:
  1. **FitnessFlow BASE** - €19.90 one-time payment
  2. **FitnessFlow PRO** - €29.90 one-time payment
  3. **FitnessFlow PREMIUM** - €44.90 one-time payment
- [ ] Copia Price ID per ogni product

#### 4.3 Aggiungi Stripe al Frontend
- [ ] Installa Stripe SDK:
```bash
cd packages/web
npm install @stripe/stripe-js
```

- [ ] Crea `packages/web/src/lib/stripeService.ts`:
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

export async function createCheckoutSession(tier: 'base' | 'pro' | 'premium', userId: string) {
  const priceIds = {
    base: 'price_BASE_ID',
    pro: 'price_PRO_ID',
    premium: 'price_PREMIUM_ID'
  };

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId: priceIds[tier],
      userId
    })
  });

  const session = await response.json();
  const stripe = await stripePromise;
  await stripe?.redirectToCheckout({ sessionId: session.id });
}
```

#### 4.4 Crea Supabase Edge Function per Checkout
- [ ] Crea `supabase/functions/create-checkout-session/index.ts`
- [ ] Deploy function
- [ ] Integra in PaywallModal:
```typescript
import { createCheckoutSession } from '../lib/stripeService';

onSelectPlan={(tier) => {
  createCheckoutSession(tier, userId);
}}
```

#### 4.5 Webhook Success Handler
- [ ] Crea Edge Function `stripe-webhook`
- [ ] Quando payment success:
```typescript
UPDATE users
SET subscription_tier = 'pro',
    subscription_start_date = NOW(),
    subscription_end_date = NOW() + INTERVAL '42 days'
WHERE id = customer_metadata.user_id;
```

---

## 📊 TESTING CHECKLIST

- [ ] Upload video funziona
- [ ] Gemini processing completa in <60s
- [ ] Feedback visualizzato correttamente
- [ ] Quota system blocca dopo limite
- [ ] Paywall appare dopo 7 giorni
- [ ] Upgrade modal funziona
- [ ] Stripe payment (se implementato)

---

## 🐛 TROUBLESHOOTING COMUNE

### Error: "Video upload failed"
- Check Storage RLS policies
- Check userId nel path corrisponde a auth.uid()
- Check file size < 100MB

### Error: "Gemini processing failed"
- Check Edge Function logs su Supabase
- Verifica GEMINI_API_KEY settata correttamente
- Check quota Gemini API (free tier ha limiti)

### Error: "No feedback shown"
- Check tabella video_corrections → processing_status
- Se "failed", check Edge Function logs
- Riprova con video più corto (<20 secondi)

### Error: "Paywall not showing"
- Check subscription_tier in users table
- Verifica created_at date
- Check useEffect dependency array

---

## 📝 NOTE IMPLEMENTAZIONE

**Costi stimati** (100 utenti/mese):
- Gemini API: €2.64/mese (330 video × €0.008)
- Supabase Storage: <€1/mese
- **Totale: ~€3.50/mese**

**Revenue potenziale**:
- 60 × €19.90 = €1,194 (BASE)
- 30 × €29.90 = €897 (PRO)
- 10 × €44.90 = €449 (PREMIUM)
- **Totale: €2,540 per ciclo (6 settimane)**
- **Mensile equivalente: ~€1,693/mese**

**Margine**: 99.8% (costi AI trascurabili)

---

## 🎯 PRIORITÀ

1. **ALTA**: Integra Paywall + Route Feedback (necessario per MVP)
2. **MEDIA**: Test completo sistema
3. **BASSA**: Stripe integration (può essere manual payment inizialmente)

**Target**: Completare priorità ALTA + MEDIA domani (2-3 ore totali)
