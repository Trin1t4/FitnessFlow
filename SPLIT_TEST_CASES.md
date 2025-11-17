# Test Cases - Sistema Split Intelligente

## Come Testare

1. Vai su Dashboard
2. Clicca "Reset Tutto (Sviluppo)"
3. Scegli un profilo di test (Beginner/Intermediate/Advanced)
4. Clicca "Genera Programma Personalizzato"
5. Verifica che il programma generato sia corretto

---

## TEST CASE 1: 3x Settimana - Full Body A/B/C

### Setup
- Profile: **Beginner**
- Frequency: **3x/settimana**
- Location: **Home**
- Training Type: **Bodyweight**

### Risultati Attesi

**Split Name**: `FULL BODY A/B/C (3x/week)`

**Giorno 1 - Monday - Full Body A**
Focus: Lower Push Dominant + Horizontal Push + Vertical Pull

Esercizi:
1. Air Squat (Lower Push) - 3x10 @ 65%
2. Incline Push-up (Horizontal Push) - 3x8 @ 65%
3. Inverted Row (Vertical Pull) - 3x6 @ 65%
4. Plank (Core) - 3x30s @ 65%

**Giorno 2 - Wednesday - Full Body B**
Focus: Lower Pull Dominant + Vertical Push + Horizontal Push Variant

Esercizi:
1. Glute Bridge (Lower Pull) - 3x15 @ 65%
2. Wall Push-up (Vertical Push) - 3x12 @ 65%
3. VARIANTE DIVERSA (Horizontal Push) - Es. Standard Push-up o Diamond
4. VARIANTE DIVERSA (Core) - Es. Side Plank

**Giorno 3 - Friday - Full Body C**
Focus: Lower Push Variant + Vertical Pull Variant

Esercizi:
1. VARIANTE DIVERSA (Lower Push) - Es. Bulgarian Split Squat
2. VARIANTE DIVERSA (Vertical Pull) - Es. Chin-up o Assisted Pull-up
3. Incline Push-up (Horizontal Push) - torna alla baseline
4. VARIANTE DIVERSA (Core) - Es. Leg Raise

### Validazione

✅ Ogni giorno ha esercizi DIVERSI
✅ Volume: 3 sets per esercizio (beginner)
✅ Reps: ~65% del massimale baseline
✅ Rest: 90s (adattamento anatomico)
✅ Nessuna ripetizione esatta tra giorni

---

## TEST CASE 2: 4x Settimana - Upper/Lower Split

### Setup
- Profile: **Intermediate**
- Frequency: **4x/settimana**
- Location: **Gym**
- Training Type: **Equipment**

### Risultati Attesi

**Split Name**: `UPPER/LOWER (4x/week)`

**Giorno 1 - Monday - Upper A**
Focus: Horizontal Push + Vertical Pull + Vertical Push

Esercizi:
1. Push-up Standard (Horizontal Push) - 4x12 @ 70-80%
2. Pull-up (Vertical Pull) - 4x8 @ 70-80%
3. Pike Push-up (Vertical Push) - 4x10 @ 70-80%
4. Plank (Core)

**Giorno 2 - Tuesday - Lower A**
Focus: Lower Push + Lower Pull

Esercizi:
1. Pistol Assistito (Lower Push) - 4x8 @ 70-80%
2. Nordic Curl Assistito (Lower Pull) - 4x6 @ 70-80%
3. Core

**Giorno 3 - Thursday - Upper B**
Focus: VARIANTI DIVERSE

Esercizi:
1. VARIANTE (Vertical Push) - Es. Handstand Push-up o Military Press
2. VARIANTE (Horizontal Push) - Es. Archer Push-up o Decline Push-up
3. VARIANTE (Vertical Pull) - Es. Wide Grip Pull-up o Chin-up
4. Core variante

**Giorno 4 - Friday - Lower B**
Focus: VARIANTI DIVERSE

Esercizi:
1. VARIANTE (Lower Pull) - Es. Romanian DL o Sumo DL
2. VARIANTE (Lower Push) - Es. Front Squat o Bulgarian Split
3. Core variante

### Validazione

✅ Split Upper/Lower ben definito
✅ Volume: 4 sets per esercizio (intermediate)
✅ Reps: 6-12 range (ipertrofia)
✅ Rest: 60-90s
✅ Upper A ≠ Upper B (varianti diverse)
✅ Lower A ≠ Lower B (varianti diverse)

---

## TEST CASE 3: 6x Settimana - Push/Pull/Legs (PPL)

### Setup
- Profile: **Advanced**
- Frequency: **6x/settimana**
- Location: **Gym**
- Training Type: **Equipment**

### Risultati Attesi

**Split Name**: `PUSH/PULL/LEGS (6x/week)`

**Giorno 1 - Monday - Push A**
Esercizi:
1. Archer Push-up (Horizontal Push) - 6x10 @ 75%
2. Handstand Push-up (Vertical Push) - 6x8 @ 75%
3. Tricep Dips (Accessory)
4. Core

**Giorno 2 - Tuesday - Pull A**
Esercizi:
1. Pull-up Zavorrato (Vertical Pull) - 6x10 @ 75%
2. Barbell Row (Horizontal Pull) - 6x10 @ 75%
3. Barbell Curl (Biceps Accessory)
4. Core

**Giorno 3 - Wednesday - Legs A**
Esercizi:
1. Pistol Squat (Lower Push) - 6x12 @ 75%
2. Nordic Curl (Lower Pull) - 6x8 @ 75%
3. Calf Raise (Accessory)
4. Core

**Giorno 4 - Thursday - Push B**
Esercizi:
1. VARIANTE (Vertical Push) - Es. Military Press
2. VARIANTE (Horizontal Push) - Es. Incline Bench
3. VARIANTE (Triceps) - Es. Skull Crushers
(No core su accessory days)

**Giorno 5 - Friday - Pull B**
Esercizi:
1. VARIANTE (Horizontal Pull) - Es. Cable Row
2. VARIANTE (Vertical Pull) - Es. Chin-up
3. VARIANTE (Biceps) - Es. Hammer Curl

**Giorno 6 - Saturday - Legs B**
Esercizi:
1. VARIANTE (Lower Pull) - Es. Romanian DL
2. VARIANTE (Lower Push) - Es. Front Squat
3. Calf Raise

### Validazione

✅ Split PPL con 6 giorni
✅ Ogni gruppo muscolare 2x/settimana
✅ Volume: 5-6 sets (advanced strength)
✅ Reps: 5-8 (forza calisthenics)
✅ Rest: 2-3min (recupero completo)
✅ Push A ≠ Push B (varianti)
✅ Pull A ≠ Pull B (varianti)
✅ Legs A ≠ Legs B (varianti)
✅ Include esercizi accessori (triceps, biceps, calves)

---

## TEST CASE 4: Pain Management con Split

### Setup
- Profile: **Intermediate**
- Frequency: **3x/settimana**
- Location: **Home**
- Training Type: **Bodyweight**
- Pain Areas: **Lower Back (Moderate)**

### Risultati Attesi

**Modifiche per Lower Back Pain**:

1. Lower Pull (Deadlift pattern) → **SOSTITUITO**
   - Da: Nordic Curl Assistito
   - A: Glute Bridge o Leg Curl (variante più sicura)
   - Volume: RIDOTTO (2-3 sets invece di 4)
   - Note: "Deload per lower_back moderato"

2. Esercizi Correttivi AGGIUNTI:
   - Cat-Cow Stretch
   - Dead Bug
   - Bird Dog
   - Volume: 2x10-15 @ Low intensity

3. Altri esercizi: NON modificati
   - Lower Push (Squat) → OK
   - Horizontal Push → OK
   - Vertical Pull → OK

### Validazione

✅ Esercizi conflittuali sostituiti
✅ Volume ridotto su esercizi a rischio
✅ Esercizi correttivi presenti in TUTTI i giorni
✅ Altri esercizi non affetti
✅ Note chiare su sostituzioni

---

## TEST CASE 5: Gym Machines Mode

### Setup
- Profile: **Intermediate**
- Frequency: **4x/settimana**
- Location: **Gym**
- Training Type: **Machines** ⚠️

### Risultati Attesi

**Conversioni a Macchine**:

1. Squat → **Leg Press**
2. Deadlift → **Leg Curl Machine**
3. Pull-up → **Lat Pulldown Machine**
4. Bench Press → **Chest Press Machine**
5. Military Press → **Shoulder Press Machine**
6. Row → **Seated Cable Row**

### Validazione

✅ TUTTI gli esercizi free-weight convertiti
✅ Mantiene stesso pattern (lower_push → leg press)
✅ Note indica conversione: "Macchina: Squat → Leg Press"
✅ Volume non modificato
✅ Rest non modificato

---

## Checklist Generale per OGNI Test

Dopo aver generato il programma, verifica:

### Struttura
- [ ] Campo `weeklySplit` presente
- [ ] Split name corretto (es. "FULL BODY A/B/C (3x/week)")
- [ ] Numero giorni corretto (3, 4, o 6)
- [ ] Ogni giorno ha `dayNumber`, `dayName`, `focus`, `exercises`

### Varianti
- [ ] Giorno 1 usa baseline (index=0)
- [ ] Giorno 2+ usa varianti diverse (index=1, 2, etc.)
- [ ] Stesso pattern ripetuto = variante diversa
- [ ] Equipment corretto (bodyweight vs gym)

### Volume
- [ ] Sets corretto per level (beginner=3, intermediate=4-5, advanced=5-6)
- [ ] Reps corretto per goal (forza=5-8, massa=6-12, endurance=12-20)
- [ ] Rest corretto per goal (forza=2-3min, massa=60-90s)
- [ ] Intensity % basato su baseline

### Pain Management
- [ ] Esercizi conflittuali sostituiti
- [ ] Volume ridotto se severity alta
- [ ] Esercizi correttivi presenti
- [ ] Note spiega sostituzioni

### UI
- [ ] WeeklySplitView renderizza correttamente
- [ ] Badge pattern colorati
- [ ] Accordion espandibile per giorno
- [ ] Separazione esercizi principali/correttivi
- [ ] Indicatore baseline presente
- [ ] Indicatore "Sostituito" se wasReplaced=true

---

## Debugging

Se qualcosa non funziona:

1. **Console Browser** (F12):
   ```
   🗓️ Generazione split settimanale per 3x/settimana
   ✅ Split generato: FULL BODY A/B/C (3x/week)
   📅 Giorni di allenamento: 3
   ```

2. **LocalStorage**:
   ```javascript
   JSON.parse(localStorage.getItem('currentProgram'))
   ```
   Controlla che `weeklySplit` sia presente

3. **Network Tab**:
   Se backend integrato, verifica payload inviato a `/api/program-generate`

4. **Errori Comuni**:
   - WeeklySplitView non renderizza → `weeklySplit` undefined
   - Varianti ripetute → Equipment filter non funziona
   - Volume sbagliato → Baseline reps non passati
   - Pain management non funziona → painAreas vuoto o malformato

---

## Performance Baseline

Tempo generazione split:
- 3x settimana: ~50-100ms
- 4x settimana: ~80-150ms
- 6x settimana: ~120-200ms

Se più lento:
- Troppi pain checks
- Database varianti troppo grande
- Algoritmo di filtering inefficiente
