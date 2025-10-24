# TrainSmart - Implementation Status (Audit Reale Codice)

**Ultimo aggiornamento**: 15 Ottobre 2025  
**Filosofia**: Trasparenza totale su cosa funziona, cosa è in test, cosa manca.

---

## ✅ LIVE - Funzionante e Testato

### Core Features
- ✅ **Screening Completo**: Goal, location, equipment, pain areas, bodyweight, availability
- ✅ **Quiz Tecnico Esercizi**: Determinazione livello (beginner/intermediate/advanced)
- ✅ **Programma Base**: Generazione schede personalizzate per goal standard (weight_loss, muscle_gain, strength, general, endurance)
- ✅ **1RM Calculation**: Formula Brzycki implementata e funzionante
- ✅ **Workout Tracking**: Registrazione set, reps, peso con pre-workout pain check
- ✅ **Body Part Targeting**: Isolamento muscoli specifici per toning/ipertrofia (upper_chest, arms, shoulders, back, legs, glutes, abs, calves)
- ✅ **Pain Area Management**: Filtro esercizi basato su zone doloranti (knee, shoulder, back, elbow, wrist, hip, ankle)
- ✅ **Exercise Substitution**: Sostituzione esercizi per location (gym/home) e equipment disponibile
- ✅ **Workout Adaptation**: Adattamento on-the-fly workout da gym a home (con/senza equipment)
- ✅ **Weekly Progress**: Tracking progressi settimanali con volume totale
- ✅ **Optional Steps UI**: Badge "Opzionale" per step skippabili nello screening (specific_goals, equipment, injuries)

### Subscription System
- ✅ **3-Tier Pricing**: Base (€19.90), Premium (€29.90), Elite (€39.90)
- ✅ **Dynamic Price Escalation**: +€10 automatico dopo 6 mesi (con addMonths day-clamping corretto)
- ✅ **Subscription Tiers**: Schema database completo (subscriptionTier, subscriptionStartDate, subscriptionId)

### Authentication
- ✅ **Replit Auth**: Google, GitHub, Email/Password login funzionante
- ✅ **Session Management**: PostgreSQL session store con express-session

---

## ⚠️ BETA - Implementato ma Richiede Testing Estensivo

### Pregnancy Support (BETA)
**Status**: Schema completo + safety rules implementate + legal disclaimers aggiunti, MA necessita validazione medica professionale

**Cosa funziona**:
- ✅ Schema DB: pregnancyWeek, pregnancyTrimester, hasDoctorClearance, pregnancyComplications
- ✅ **Legal Disclaimers IMPLEMENTATI**: Alert rossi obbligatori con checkbox liability acceptance (hasReadPregnancyDisclaimer, hasDoctorClearance)
- ✅ **Validation Enforcement**: Submit bloccato se disclaimers non checked (verificato in isStepValid() riga 278)
- ✅ PREGNANCY_SAFE_EXERCISES_BY_TRIMESTER: Mapping esercizi per trimestre con load reduction
- ✅ Trimester-specific safety: NO supine post-1st trimester, loads 30-60% 1RM by trimester

**Cosa manca**:
- ❌ Validazione medica professionale (disclaimer legale presente ma non sostituisce consulenza)
- ❌ Testing estensivo con utenti reali in gravidanza
- ❌ Integrazione con professionisti sanitari

### Disability Support (BETA)
**Status**: Schema + disability types implementati + legal disclaimers aggiunti, MA necessita validazione fisioterapica

**Cosa funziona**:
- ✅ Schema DB: disabilityType field
- ✅ **Legal Disclaimers IMPLEMENTATI**: Alert rossi obbligatori con checkbox acceptance (hasReadDisabilityDisclaimer)
- ✅ **Validation Enforcement**: Submit bloccato se disclaimer non checked (verificato in isStepValid() riga 276)
- ✅ Disability Types: Paraplegic, hemiplegic, amputation, cerebral_palsy, muscular_dystrophy, spinal_injury
- ✅ Basic Exercise Adaptations: Filtro esercizi per tipo disabilità

**Cosa manca**:
- ❌ Validazione fisioterapica professionale (disclaimer presente ma non sostituisce team medico)
- ❌ DISABILITY_SAFE_EXERCISES mapping completo (solo basic filtering implementato)
- ❌ Testing con utenti con disabilità motorie

### Deload Cycles (SCHEMA ONLY)
**Status**: Flags database settati MA nessuna generazione effettiva settimane ridotte

**Cosa funziona**:
- ✅ Schema DB: includesDeload, deloadFrequency, totalWeeks flags
- ✅ Logic: intermediate/advanced programs flagged con deload ogni 4 settimane
- ✅ UI Display: Descrizione programma mostra "(con deload ogni 4 settimane)"

**Cosa NON funziona**:
- ❌ **CRITICAL**: Nessun codice che genera workout con volume/intensity ridotti nelle settimane deload
- ❌ Nessun `isDeloadWeek` o `deloadWeek` check nel programGenerator
- ❌ User riceve stesse settimane per tutto il ciclo (nessuna riduzione effettiva)

**Action Required**: Implementare logica riduzione 40-50% volume nelle settimane 4, 8, 12

---

## ❌ NON IMPLEMENTATO - Solo Schema o Mancante

### Payments (BROKEN)
**Status**: Schema presente MA endpoint mismatch blocca tutto

**Problema**:
- ❌ Frontend chiama: `/api/payment/stripe/checkout`, `/api/payment/paypal/create`
- ❌ Backend implementa: `/api/payment/create`, `/api/payment/:id/confirm`
- ❌ Route mismatch = pagamenti NON funzionano
- ✅ Schema DB: payments table con provider, amount, status esiste

**Action Required**: 
1. Implementare endpoint Stripe/PayPal corretti con API keys
2. O aggiornare frontend per usare endpoint esistenti (payment generic)

### AI Form Corrections (PLANNED)
**Status**: Funzione canUseAiCorrection() esiste MA nessuna AI integrata

**Cosa esiste**:
- ✅ `canUseAiCorrection()` in pricingUtils.ts (Premium 1/week, Elite unlimited)
- ✅ Schema DB: aiCorrectionsUsed, lastAiCorrectionDate
- ❌ Nessun endpoint `/api/ai/form-correction`
- ❌ Nessuna integrazione OpenAI/video analysis
- ❌ UI non espone la feature (corretto - non funziona)

**Roadmap**: Q2 2026 (richiede video upload, AI model integration, feedback system)

### End-Cycle Testing (FLAG ONLY)
**Status**: Flag requiresEndCycleTest settato MA nessun test generato

**Cosa esiste**:
- ✅ requiresEndCycleTest flag per strength/muscle_gain/performance goals
- ❌ Nessun workout di test 1RM generato al termine ciclo
- ❌ Nessuna UI per condurre test finale

**Action Required**: Generare workout test 1RM alla fine del ciclo con retest formula

### Features Mai Implementate
- ❌ **Video Library**: Nessun tutorial video (solo nomi esercizi)
- ❌ **Community Hub**: Nessuna feature social/competizioni
- ❌ **Advanced Analytics**: Solo basic progress tracking (no predictive insights)
- ❌ **Sport-Specific Training**: Schema sport/role esiste ma nessuna logica training specifica
- ❌ **Endurance Integration**: Menzionato in docs ma nessun workout endurance generato

---

## 🔍 ADAPTFLOW Status

**Status attuale**: Exercise substitution funzionante, "2.0" branding rimosso da roadmap

**Cosa funziona**:
- ✅ exerciseDatabase.ts: Database esercizi con variants (gym/homeWithEquipment/homeBodyweight)
- ✅ exerciseSubstitutions.ts: Mapping sostituzioni esercizi
- ✅ Location adaptation: Regenera esercizi per gym/home switch
- ✅ Equipment fallback: Suggerisce compensazioni se peso insufficiente

**"2.0" Branding**:
- ⚠️ File commentati con "ADAPTFLOW 2.0" ma nessuna v1.0 documentata
- ⚠️ Nessun changelog 1.0 → 2.0 nel codice
- ⚠️ Marketing claim non supportato da versioning reale

**Recommendation**: Chiamarlo "ADAPTFLOW" o "Exercise Adaptation System" senza versioning

---

## 🚨 Critical Issues da Risolvere

### P0 - Blockers
1. **Payment Broken**: Mismatch endpoint frontend/backend impedisce acquisto subscription
2. **Deload Non Generato**: Users promessi deload ma ricevono sempre stesso volume

### P1 - High Priority
3. **End-Cycle Testing Missing**: Flag set ma nessun test 1RM generato
4. **ADAPTFLOW 2.0 Branding**: Claim non supportato, rimuovere versioning falso

### P2 - Medium Priority
5. **Sport-Specific Logic**: Schema presente ma nessun training specifico per sport/role
6. **AI Corrections Stub**: canUseAiCorrection() esiste ma è dead code (OK se in roadmap)

---

## ✅ Legal Disclaimers - VERIFIED IMPLEMENTATION

### Pregnancy Validation ✅
```typescript
// ScreeningFlow.tsx riga 278
case "pregnancy_info":
  return data.hasReadPregnancyDisclaimer && data.hasDoctorClearance && data.pregnancyWeek >= 1 && data.pregnancyWeek <= 40;
```
**VERIFIED**: 
- ✅ `hasReadPregnancyDisclaimer` richiesto in validation
- ✅ `hasDoctorClearance` richiesto
- ✅ Submit bloccato se checkbox non checked
- ✅ Alert rosso con warning medical clearance requirement
- ✅ Liability acceptance checkbox obbligatorio

### Disability Validation ✅
```typescript
// ScreeningFlow.tsx riga 276
case "disability_type":
  return data.disabilityType !== "" && data.hasReadDisabilityDisclaimer;
```
**VERIFIED**: 
- ✅ `hasReadDisabilityDisclaimer` richiesto in validation
- ✅ Submit bloccato se checkbox non checked
- ✅ Alert rosso con warning medical consultation requirement
- ✅ Liability acceptance checkbox obbligatorio

**Compliance Status**: ✅ Legal disclaimers fully implemented and enforced

---

## 📊 Summary Stats

- **Features Live**: 11/25 (44%)
- **Features Beta**: 3/25 (12%) - Pregnancy, Disability, (Deload schema only)
- **Features Broken**: 1/25 (4%) - Payments
- **Features Planned**: 10/25 (40%)

**Overall Readiness**: ~44% production-ready, 12% needs testing, 44% not implemented

---

## 🗺️ Honest Roadmap Status

### ✅ Live Now
- Screening + Quiz completo
- Program generation (base goals)
- Workout tracking + progress
- Body part targeting
- Exercise adaptation (ADAPTFLOW)
- Legal disclaimers pregnancy/disability

### ⚠️ Beta (Needs Testing)
- Pregnancy programs (safety rules + disclaimers OK, needs medical validation)
- Disability programs (basic adaptations + disclaimers OK, needs physio validation)

### ❌ Coming Q2 2026
- AI form corrections (video analysis + OpenAI integration)
- Deload week generation (schema exists, logic missing)
- End-cycle testing (flag exists, UI missing)
- Video library
- Community features
- Advanced analytics
- Stripe/PayPal payments (fix endpoint mismatch first)

**Transparency Note**: Features marcate "Beta" non dovrebbero essere promesse come "Live" in marketing. Deload dovrebbe essere "Coming Soon" non "Beta" perché non genera effettivamente settimane ridotte.
