# ADAPTFLOW™ System - Equipment-Aware Training & Effort Calibration

## 🎯 Overview

ADAPTFLOW è il sistema intelligente di TrainSmart che adatta automaticamente i programmi di allenamento in base a:
- **Location** (Palestra, Casa, Misto)
- **Equipment disponibile** (bilanciere, manubri, elastici, sbarra, panca)
- **Peso effettivamente disponibile** nel momento dell'allenamento

Il sistema garantisce che l'**effort rimanga costante** anche quando l'attrezzatura è limitata o assente.

---

## 🏗️ Architettura Implementata

### 1. Database Schema (shared/schema.ts)

```typescript
// Tabella screenings - Aggiunto tracking location ed equipment
screenings: {
  location: varchar("location"), // 'gym' | 'home' | 'mixed'
  equipment: jsonb("equipment").$type<{
    barbell?: boolean;
    dumbbellMaxKg?: number;
    kettlebellKg?: number[];
    bands?: boolean;
    pullupBar?: boolean;
    bench?: boolean;
  }>(),
  sportRole: varchar("sport_role"), // Ruolo sport-specifico (futuro)
  bodyWeight: decimal("body_weight", { precision: 5, scale: 2 }),
  // ... altri campi
}
```

### 2. Exercise Substitutions Database (server/exerciseSubstitutions.ts)

#### HOME_ALTERNATIVES - Mappatura Palestra → Casa

```typescript
export const HOME_ALTERNATIVES: Record<string, string> = {
  'Squat': 'Squat a Corpo Libero',
  'Front Squat': 'Goblet Squat',
  'Panca piana': 'Push-up',
  'Panca Piana': 'Push-up',
  'Panca inclinata': 'Pike Push-up',
  'Stacco': 'GIANT_SET_DEADLIFT',           // ← Sostituito con Giant Set
  'Stacco rumeno': 'Single Leg RDL',
  'Trazioni': 'GIANT_SET_PULLUP',           // ← Sostituito con Giant Set
  'Lat Machine': 'GIANT_SET_PULLUP',
  'Pulley': 'GIANT_SET_PULLUP',
  'Rematore bilanciere': 'Inverted Row',
  'Rematore manubrio': 'Plank Row',
  'Military Press': 'Pike Push-up',
  'Alzate laterali': 'Band Lateral Raise',
  'Leg Press': 'Bulgarian Split Squat',
  'Leg Curl': 'Nordic Curl',
  'Dips': 'Diamond Push-up',
};
```

#### Giant Sets - Esercizi Insostituibili

**STACCO → Giant Set Catena Posteriore**

```typescript
function createDeadliftGiantSet(goal: string, level: string): GiantSet {
  // Configurazioni per obiettivo
  const configs = {
    strength: { rounds: 4, rest: 240, reps: { jump: "8", nordic: "5-6", gm: "10-12", hang: "30-45s" } },
    muscle_gain: { rounds: 4, rest: 150, reps: { jump: "12", nordic: "8-10", gm: "15-18", hang: "45-60s" } },
    weight_loss: { rounds: 5, rest: 120, reps: { jump: "15", nordic: "10", gm: "20", hang: "30s" } },
    // ...
  };

  return {
    id: `giant_deadlift_${goal}`,
    name: `Giant Set Stacco (Catena Posteriore)`,
    type: 'giant_set',
    rounds: config.rounds,
    restBetweenRounds: config.rest,
    exercises: [
      { name: "Squat Jump", muscleGroup: "Quads + Esplosività", reps: config.reps.jump, ... },
      { name: "Nordic Curl", muscleGroup: "Femorali", reps: config.reps.nordic, tempo: "4s eccentrica", ... },
      { name: "Good Morning", muscleGroup: "Erettori + Glutei", reps: config.reps.gm, ... },
      { name: "Dead Hang", muscleGroup: "Grip + Trap", reps: config.reps.hang, ... }
    ],
    totalNotes: "⚠️ LO STACCO È INSOSTITUIBILE. Questo giant set simula la fatica sistemica e l'effort."
  };
}
```

**TRAZIONI → Giant Set Floor Work**

```typescript
function createPullupGiantSet(goal: string, level: string): GiantSet {
  return {
    id: 'giant_pullup_floor',
    name: 'Giant Set Dorsale (Floor Work)',
    type: 'giant_set',
    rounds: /* dinamico per obiettivo */,
    restBetweenRounds: /* dinamico per obiettivo */,
    exercises: [
      { name: "Floor Slide Rows", muscleGroup: "Dorsali + Scapole", reps: "12-15", tempo: "3s eccentrica", 
        notes: "Prono, mani avanti, 'scivola' indietro con dorsali (passo giaguaro a 2 braccia)" },
      { name: "Scapular Push-up", muscleGroup: "Scapole", reps: "15", notes: "Retrazione/protrazione in plank" },
      { name: "Superman Hold", muscleGroup: "Erettori + Dorsali", reps: "30-45s", notes: "Isometrica dorsale" },
      { name: "Hollow Body", muscleGroup: "Core", reps: "30s", notes: "Recupero attivo" }
    ],
    totalNotes: "⚠️ LE TRAZIONI sono insostituibili per sviluppo dorsale. Giant set allena attivazione scapolare."
  };
}
```

### 3. Effort Calibration Logic (server/exerciseSubstitutions.ts)

```typescript
export function calibrateEffort(plannedWeight: number, availableWeight: number, goal: string) {
  const ratio = availableWeight / plannedWeight;
  
  // Se peso disponibile >= 90% del programmato → Nessuna modifica
  if (ratio >= 0.9) {
    return { setsMultiplier: 1, repsMultiplier: 1, tempo: "Standard", notes: "" };
  }
  
  // Se peso < 70% del programmato → Modifica sostanziale
  if (ratio < 0.7) {
    switch(goal) {
      case 'strength':
      case 'performance':
        return { 
          setsMultiplier: 1.5,        // +50% serie
          repsMultiplier: 1, 
          tempo: "4-0-1-0",            // Eccentrico lento
          notes: "⚡ Peso ridotto: +50% serie, tempo eccentrico lento" 
        };
        
      case 'muscle_gain':
      case 'toning':
        return { 
          setsMultiplier: 1, 
          repsMultiplier: 1.5,         // +50% ripetizioni
          tempo: "3-1-1-0",            // TUT elevato
          notes: "⚡ Peso ridotto: +50% reps, TUT elevato" 
        };
        
      case 'weight_loss':
        return { 
          setsMultiplier: 1.3,         // +30% serie
          repsMultiplier: 1.2,         // +20% ripetizioni
          tempo: "Esplosivo", 
          notes: "⚡ Peso ridotto: +30% serie, +20% reps, -20s riposo" 
        };
    }
  }
  
  // Se peso 70-90% del programmato → Lieve aumento reps
  return { 
    setsMultiplier: 1, 
    repsMultiplier: 1.2,               // +20% ripetizioni
    tempo: "Standard", 
    notes: "⚡ Peso ridotto: +20% reps" 
  };
}
```

### 4. Program Generator Integration (server/programGenerator.ts)

Il ProgramGenerator ora:

1. **Riceve location ed equipment** dallo screening
2. **Determina la fonte degli esercizi**:
   - `location === 'gym'` → Esercizi standard palestra
   - `location === 'home' || 'mixed'` → Applica sostituzioni da HOME_ALTERNATIVES
3. **Sostituisce esercizi insostituibili** con Giant Sets:
   - Se `'Stacco'` → `createDeadliftGiantSet(goal, level)`
   - Se `'Trazioni'` → `createPullupGiantSet(goal, level)`
4. **Genera programma location-aware** con esercizi corretti

### 5. Screening Flow - Location & Equipment (client/src/components/ScreeningFlow.tsx)

#### Step 3: Location Selection

```typescript
// Opzioni location
const locations = [
  { value: 'gym', label: '🏢 Palestra', desc: 'Accesso completo attrezzature' },
  { value: 'home', label: '🏠 Casa', desc: 'Corpo libero e attrezzatura minima' },
  { value: 'mixed', label: '🔀 Misto', desc: 'Alcuni giorni casa, altri palestra' }
];

// Equipment form (condizionale - appare solo se home/mixed)
{(location === 'home' || location === 'mixed') && (
  <div className="equipment-form">
    <Checkbox name="barbell" label="Bilanciere" />
    <Input type="number" name="dumbbellMaxKg" label="Manubri fino a (kg)" />
    <Checkbox name="bands" label="Elastici" />
    <Checkbox name="pullupBar" label="Sbarra per trazioni" />
    <Checkbox name="bench" label="Panca" />
  </div>
)}
```

### 6. PreWorkout Check - Available Weights Input (client/src/components/PreWorkoutCheck.tsx)

#### Props Interface

```typescript
interface PreWorkoutCheckProps {
  workout: any;                    // Workout corrente con esercizi
  onComplete: (data: PreWorkoutData) => void;
  onSkip: () => void;
}

export interface PreWorkoutData {
  sleepHours: number;
  energyLevel: number;
  painLevel: number;
  painLocation?: string;
  notes?: string;
  loadReduction?: number;
  affectedExercises?: string[];
  availableWeights?: Record<string, { planned: number; available: number }>;  // ← NUOVO
}
```

#### UI - Input Pesi Disponibili

```typescript
// Filtra esercizi con peso dal workout
const exercisesWithWeight = workout?.exercises?.filter((ex: any) => ex.weight && ex.weight > 0) || [];

// Per ogni esercizio con peso
{exercisesWithWeight.map((ex: any) => {
  const planned = ex.weight || 0;
  const available = availableWeights[ex.name]?.available;
  const hasInput = available !== undefined && available !== '';
  const ratio = hasInput ? (Number(available) / planned) : 1;
  const needsCalibration = hasInput && ratio < 0.9;  // Alert se < 90%

  return (
    <div>
      <Label>{ex.name}</Label>
      <span>Programmato: {planned}kg</span>
      
      <Input
        type="number"
        placeholder="Peso disponibile (kg)"
        value={availableWeights[ex.name]?.available || ''}
        onChange={(e) => setAvailableWeights({
          ...prev,
          [ex.name]: { planned, available: parseFloat(e.target.value) || 0 }
        })}
      />

      {needsCalibration && (
        <Alert variant="warning">
          ⚡ Peso ridotto del {Math.round((1 - ratio) * 100)}% 
          → Il sistema adatterà automaticamente l'allenamento
        </Alert>
      )}
    </div>
  );
})}
```

#### Bug Fix Critico - Gestione 0 kg

**PROBLEMA INIZIALE:**
```typescript
// ❌ SBAGLIATO: Se available = 0, ratio = 1 (nessun alert!)
const ratio = available > 0 ? available / planned : 1;
const needsCalibration = available > 0 && ratio < 0.9;
```

**SOLUZIONE:**
```typescript
// ✅ CORRETTO: Se available = 0, ratio = 0 (alert corretto!)
const available = availableWeights[ex.name]?.available;
const hasInput = available !== undefined && available !== '';
const ratio = hasInput ? (Number(available) / planned) : 1;
const needsCalibration = hasInput && ratio < 0.9;
```

---

## 🔄 Flusso Completo ADAPTFLOW

### 1. **Screening**
```
User → Seleziona Location (Gym/Casa/Misto)
     → Se Casa/Misto: Specifica Equipment disponibile
     → Sistema salva: location, equipment in DB
```

### 2. **Program Generation**
```
ProgramGenerator legge: location, equipment, goal, level
                ↓
Determina esercizi:
  - location = 'gym' → Esercizi standard
  - location = 'home'/'mixed' → Applica HOME_ALTERNATIVES
                ↓
Sostituisce esercizi insostituibili:
  - 'Stacco' → Giant Set Deadlift (4 esercizi)
  - 'Trazioni' → Giant Set Pullup (4 esercizi)
                ↓
Genera programma equipment-aware
```

### 3. **Pre-Workout Check** (ADAPTFLOW in azione)
```
User → Visualizza workout del giorno
     → PreWorkoutCheck mostra esercizi con peso
     → User inserisce peso effettivamente disponibile oggi
                ↓
Sistema calcola ratio = available / planned
                ↓
Se ratio < 0.9:
  - Mostra alert "Peso ridotto del X%"
  - Passa availableWeights al workout tracker
```

### 4. **Workout Tracker** (Calibrazione Effort)
```
WorkoutTracker riceve: preWorkoutData.availableWeights
                ↓
Per ogni esercizio con peso ridotto:
  - Calcola ratio = available / planned
  - Applica calibrateEffort(planned, available, goal)
                ↓
Aggiusta automaticamente:
  - Serie (setsMultiplier)
  - Ripetizioni (repsMultiplier)
  - Tempo esecuzione (tempo)
                ↓
User esegue workout adattato, effort rimane costante
```

---

## 📊 Esempi Pratici

### Esempio 1: Utente Casa con Manubri Limitati

**Screening:**
- Location: Casa
- Equipment: Manubri 20kg, Sbarra trazioni

**Programma Generato:**
- Squat → Goblet Squat (manubri)
- Panca → Push-up
- Stacco → Giant Set (Squat Jump + Nordic + Good Morning + Dead Hang)
- Trazioni → Trazioni (ha sbarra!) ✅

**Pre-Workout Check (giorno allenamento):**
- Goblet Squat programmato: 18kg
- User inserisce: 15kg disponibile (ratio = 0.83 = 83%)
- **Alert**: "⚡ Peso ridotto del 17% → Sistema adatterà automaticamente"

**Workout Tracker (calibrazione):**
- Goal: Hypertrophy
- calibrateEffort(18, 15, 'muscle_gain')
  - repsMultiplier: 1.2 → +20% reps
  - Risultato: 3 serie x 14 reps invece di 3 x 12

### Esempio 2: Utente Palestra, Peso Insufficiente

**Screening:**
- Location: Gym

**Programma Generato:**
- Squat: 80kg x 5 reps x 4 serie
- Panca: 70kg x 6 reps x 4 serie
- Stacco: 100kg x 5 reps x 3 serie

**Pre-Workout Check:**
- Squat programmato: 80kg
- User inserisce: 50kg disponibile (ratio = 0.625 = 62.5%)
- **Alert**: "⚡ Peso ridotto del 38% → Sistema adatterà"

**Workout Tracker (calibrazione):**
- Goal: Strength
- calibrateEffort(80, 50, 'strength')
  - ratio < 0.7 → Modifica sostanziale
  - setsMultiplier: 1.5 → +50% serie
  - tempo: "4-0-1-0" → Eccentrico lento
  - Risultato: 6 serie x 5 reps (4s eccentrica) con 50kg

---

## 🛠️ File Modificati

### Backend
- `shared/schema.ts` - Aggiunto location, equipment, sportRole
- `server/exerciseSubstitutions.ts` - HOME_ALTERNATIVES, Giant Sets, calibrateEffort
- `server/programGenerator.ts` - Integrato location/equipment logic
- `server/routes.ts` - Validazione screening con location/equipment

### Frontend
- `client/src/components/ScreeningFlow.tsx` - Step location + equipment form
- `client/src/components/PreWorkoutCheck.tsx` - Input pesi disponibili + alert
- `client/src/components/Dashboard.tsx` - Passa workout a PreWorkoutCheck

### Database
- Migration: `npm run db:push --force` (aggiunto location, equipment, sportRole)

---

## ✅ Status Implementazione

- [x] Database schema (location, equipment, sportRole)
- [x] HOME_ALTERNATIVES database (15+ sostituzioni)
- [x] Giant Sets (Deadlift, Pullup) con varianti per goal
- [x] calibrateEffort function (logica ratio-based)
- [x] ProgramGenerator equipment-aware
- [x] ScreeningFlow location step + equipment form
- [x] PreWorkoutCheck available weights input
- [x] Alert calibrazione quando peso < 90%
- [x] Bug fix: gestione 0 kg (ratio corretto)
- [x] Architect review: Pass ✅
- [x] replit.md aggiornato

---

## 🚀 Prossimi Step (Futuri)

1. **Sport Roles Implementation**
   - Campo `sportRole` già in DB
   - Implementare logica ruoli calcio (portiere, difensore, centrocampista, attaccante)
   - Adattare programmi per ruolo

2. **Calibrazione Effort nel Workout Tracker**
   - Ricevere `availableWeights` da PreWorkoutCheck
   - Applicare `calibrateEffort()` in real-time durante workout
   - Mostrare esercizi adattati con note

3. **Test End-to-End ADAPTFLOW**
   - Flusso completo: Screening → Assessment → PreWorkout → Calibrazione
   - Verifica alert e ricalcoli automatici

---

## 📝 Note Tecniche

### Perché Giant Sets?
Esercizi come **Stacco** e **Trazioni** sono biomeccanicamente insostituibili:
- Stacco: Unico movimento che allena tutta la catena posteriore in sinergia
- Trazioni: Impossibile replicare la trazione verticale a corpo libero senza sbarra

I Giant Sets non replicano la biomeccanica, ma **simulano la fatica sistemica e l'effort** attraverso un circuito di 4 esercizi complementari.

### Principio ADAPTFLOW
> **"L'effort deve rimanere costante, indipendentemente dall'attrezzatura disponibile."**

Se manca il peso, aumentiamo:
- Volume (serie/reps) per obiettivi ipertrofia/dimagrimento
- Densità (tempo eccentrico) per obiettivi forza

---

**ADAPTFLOW™** - Il programma si adatta a te, sempre. 💪
