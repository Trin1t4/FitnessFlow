# Sessione Prossima - FitnessFlow

## Cosa abbiamo fatto oggi

### 1. UI - Pesi nascosti per esercizi bodyweight
- Quando si switcha a "corpo libero", l'input del peso ora **sparisce** automaticamente
- File modificato: `packages/web/src/components/LiveWorkoutSession.tsx:2458`
- Aggiunta funzione `isBodyweightExercise` agli export di shared

### 2. Logica Effort - Conversione 10RM → 1RM
**Problema risolto**: Il sistema usava il carico 10RM direttamente invece di convertirlo in 1RM.

**Prima (sbagliato)**:
- 70kg 10RM / 80kg BW = 0.875x BW → Bulgarian Split Squat (troppo facile)

**Ora (corretto)**:
- 70kg 10RM → ~93kg 1RM (formula Brzycki: weight × 36/(37-reps))
- 93kg 1RM / 80kg BW = 1.16x BW → Shrimp Squat (appropriato)

File modificato: `packages/shared/src/utils/locationAdapter.ts`
- Aggiunta funzione `convert10RMTo1RM()`
- Aggiornate tutte le scale di difficoltà per tutti i 6 pattern

### 3. Scale di difficoltà aggiornate

| Pattern | Esercizi (dal più difficile al più facile) |
|---------|---------------------------------------------|
| **Lower Push** | Pistol → Pistol Assisted → Shrimp → Skater → Bulgarian → Split → BW Squat |
| **Lower Pull** | Nordic → Nordic Eccentric → Slider SL → Slider → SL RDL → Hip Thrust SL → Hip Thrust → Glute Bridge |
| **Horizontal Push** | One-Arm → One-Arm Assisted → Archer → Pseudo Planche → Diamond → Deficit → Standard → Knee → Incline → Wall |
| **Vertical Push** | HSPU Free → HSPU Wall → HSPU Eccentric → Elevated Pike High → Elevated Pike → Pike → Pike Knee → Wall Tap |
| **Vertical Pull** | Archer Pull-up → L-Sit Pull-up → Pull-up → Chin-up → Australian Elevated → Australian |
| **Horizontal Pull** | Front Lever Row → Archer Row → One-Arm Inverted → Inverted Elevated → Inverted → Inverted Knee → Band Row |

### 4. Dominio trainsmart.me
- Configurato DNS su Cloudflare (A record + CNAME)
- SSL funzionante via Vercel
- Deploy completato

---

## DA FARE NELLA PROSSIMA SESSIONE

### 1. Integrare Form Cues in Gemini AI
**Priorità: ALTA**

Il sistema di video correction con Gemini **NON usa i tuoi parametri biomeccanici**.
Attualmente usa prompt generici hardcoded.

**File da modificare**: `supabase/functions/analyze-exercise-video/index.ts`

**Cosa fare**:
1. Importare/duplicare le form cues dal database esistente
2. Modificare `getExerciseSpecificCues()` per usare i tuoi cues
3. Passare i cues critici nel prompt di Gemini

**Database esistente**: `packages/shared/src/utils/exerciseFormCues.ts`
- Contiene già cues dettagliati per: Squat, Deadlift, RDL, Bench, Push-up, OHP, Row, Pull-up, Plank, Hip Thrust

### 2. Aggiungere Form Cues per esercizi bodyweight
**Priorità: MEDIA**

Mancano cues per gli esercizi del location adapter:
- Pistol Squat
- Shrimp Squat
- Skater Squat
- Bulgarian Split Squat
- Nordic Curl
- Archer Push-up
- Pike Push-up / HSPU
- One-Arm variations
- Inverted Row variations

### 3. Rivedere schemi motori dei 6 pattern
**Priorità: MEDIA**

Da discutere con te quali parametri biomeccanici vuoi enfatizzare per ogni pattern.
Il database attuale (`exerciseFormCues.ts`) è già buono ma potrebbe essere ampliato.

---

## File chiave da ricordare

```
packages/shared/src/utils/
├── locationAdapter.ts          # Logica switch gym/home con forza relativa
├── exerciseFormCues.ts         # Database form cues (da integrare in Gemini)
├── programGenerator.ts         # isBodyweightExercise()
└── index.ts                    # Export centralizzati

packages/web/src/components/
└── LiveWorkoutSession.tsx      # UI workout con pesi nascosti per bodyweight

supabase/functions/
└── analyze-exercise-video/index.ts  # Gemini AI - DA MODIFICARE
```

---

## Comandi utili

```bash
# Build e deploy
cd C:\Users\dario\OneDrive\Desktop\FitnessFlow
npm run build
vercel --prod

# Solo build web
cd packages/web && npm run build
```

---

## Stato deploy
- **Ultimo deploy**: OK
- **URL**: https://trainsmart.me
- **Vercel**: fitness-flow-900qjvfvc-trainsmart.vercel.app
