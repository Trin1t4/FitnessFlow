# Sistema Circuiti Metabolici RPE-Based

## Panoramica

Sistema di circuiti a tempo con cambio esercizio a **RPE 8**, utilizzabile in due modalità:

| Modalità | Quando si usa | Durata | Posizione nel workout |
|----------|---------------|--------|----------------------|
| **FINISHER** | Tonificazione, Ipertrofia + componente dimagrimento | 5-10 min | Fine sessione |
| **STANDALONE** | Goal dimagrimento puro | 15-30 min | Fase centrale (workout completo) |

---

## Logica di Attivazione

```javascript
function shouldUseMetabolicCircuit(goal, userPreferences) {
  // STANDALONE: Circuito come workout principale
  if (goal === 'fat_loss') {
    return { mode: 'standalone', position: 'main' };
  }
  
  // FINISHER: Aggiunto a fine workout
  if (goal === 'toning') {
    return { mode: 'finisher', position: 'end' };
  }
  
  // FINISHER OPZIONALE: Se utente chiede componente dimagrimento
  if (userPreferences.includesFatLossComponent) {
    return { mode: 'finisher', position: 'end' };
  }
  
  // Nessun circuito metabolico
  return { mode: 'none' };
}
```

---

## Parametri per Modalità e Livello

### FINISHER (Fine Sessione)

Obiettivo: Spike metabolico post-allenamento, EPOC boost.

| Livello | Durata Wk1 | Progressione | Max Durata | Deload |
|---------|------------|--------------|------------|--------|
| Beginner | 5 min | +1 min/sett | 8 min | 4 min |
| Intermediate | 6 min | +1 min/sett | 10 min | 5 min |
| Advanced | 8 min | +1 min/sett | 12 min | 6 min |

**Esercizi per finisher:** 4 (ciclo rapido)
**Rest tra giri:** 0 (continuo fino a fine tempo)

### STANDALONE (Workout Principale)

Obiettivo: Volume calorico elevato, conditioning generale.

| Livello | Durata Wk1 | Progressione | Max Durata | Deload |
|---------|------------|--------------|------------|--------|
| Beginner | 12 min | +2 min/sett | 20 min | 8 min |
| Intermediate | 18 min | +2 min/sett | 26 min | 12 min |
| Advanced | 24 min | +3 min/sett | 36 min | 16 min |

**Esercizi per standalone:** 6 (circuito completo)
**Rest tra giri:** Secondo livello (vedi sotto)

---

## Configurazione Circuito

### Rest tra Giri (Solo Standalone)

| Livello | Rest |
|---------|------|
| Beginner | 90 sec |
| Intermediate | 60 sec |
| Advanced | 45 sec |

### Timeout per Esercizio (Cambio forzato se non raggiunge RPE 8)

| Livello | Timeout |
|---------|---------|
| Beginner | 45 sec |
| Intermediate | 60 sec |
| Advanced | 75 sec |

### Early Stop Threshold

Se RPE 8 raggiunto in **< 15 sec** → esercizio troppo difficile, flaggare per regressione.

---

## Rotazione Esercizi: Freschezza ogni 3-4 Sessioni

Dato che il lavoro metabolico non richiede progressione tecnica, gli esercizi ruotano per evitare monotonia.

### Sistema di Rotazione

```javascript
const ROTATION_CONFIG = {
  sessionsBeforeRotation: 3,  // Cambia pool ogni 3 sessioni
  rotationStrategy: 'pool_shift'  // Sposta al pool successivo
};

// 3 pool per pattern, ruotano ogni 3 sessioni
const EXERCISE_POOLS = {
  lower_push: {
    poolA: ['Squat Bodyweight', 'Lunge Alternato', 'Step-up'],
    poolB: ['Goblet Squat', 'Squat Jump', 'Lunge Walking'],
    poolC: ['Sumo Squat', 'Curtsy Lunge', 'Box Step-up']
  },
  // ... altri pattern
};

function getCurrentPool(pattern, sessionNumber) {
  const poolIndex = Math.floor(sessionNumber / ROTATION_CONFIG.sessionsBeforeRotation) % 3;
  const pools = ['poolA', 'poolB', 'poolC'];
  return EXERCISE_POOLS[pattern][pools[poolIndex]];
}
```

### Pool Esercizi per Livello

#### BEGINNER

```javascript
METABOLIC_EXERCISES_BEGINNER = {
  lower_push: {
    poolA: ['Squat Bodyweight', 'Wall Sit', 'Squat Parziale'],
    poolB: ['Step-up Basso', 'Lunge Statico', 'Squat Box'],
    poolC: ['Squat Isometrico', 'Glute Bridge March', 'Calf Raise']
  },
  upper_push: {
    poolA: ['Push-up Ginocchia', 'Incline Push-up', 'Wall Push-up'],
    poolB: ['Push-up Negativo', 'Plank to Push-up', 'Diamond Push-up Ginocchia'],
    poolC: ['Shoulder Tap', 'Pike Push-up Facile', 'Push-up Hold']
  },
  lower_pull: {
    poolA: ['Glute Bridge', 'Good Morning BW', 'Single Leg Glute Bridge'],
    poolB: ['Hip Hinge', 'Romanian DL BW', 'Prone Leg Curl'],
    poolC: ['Fire Hydrant', 'Donkey Kick', 'Clamshell']
  },
  upper_pull: {
    poolA: ['Inverted Row Alta', 'Band Pull-apart', 'Prone Y-raise'],
    poolB: ['Superman', 'Reverse Snow Angel', 'Scapular Squeeze'],
    poolC: ['Doorway Row', 'Towel Row Isometrico', 'Band Face Pull']
  },
  core_dynamic: {
    poolA: ['Dead Bug', 'Bird Dog', 'Plank Hold'],
    poolB: ['Toe Touch', 'Bicycle Lento', 'Side Plank'],
    poolC: ['Cat-Cow Dinamico', 'Pallof Press BW', 'Hollow Hold Facile']
  },
  cardio_burst: {
    poolA: ['Marching in Place', 'Step Touch', 'Low Jumping Jack'],
    poolB: ['High Knees Lento', 'Butt Kicks', 'Side Step'],
    poolC: ['Skater Lento', 'Squat to Stand', 'Arm Circles Veloce']
  }
}
```

#### INTERMEDIATE

```javascript
METABOLIC_EXERCISES_INTERMEDIATE = {
  lower_push: {
    poolA: ['Goblet Squat', 'Lunge Alternato', 'Squat Jump Controllato'],
    poolB: ['Sumo Squat', 'Reverse Lunge', 'Box Jump Basso'],
    poolC: ['Bulgarian Split Squat', 'Curtsy Lunge', 'Squat Pulse']
  },
  upper_push: {
    poolA: ['Push-up Standard', 'Pike Push-up', 'Diamond Push-up'],
    poolB: ['Archer Push-up', 'Decline Push-up', 'Spiderman Push-up'],
    poolC: ['Staggered Push-up', 'T Push-up', 'Hindu Push-up']
  },
  lower_pull: {
    poolA: ['Romanian Deadlift BW', 'Single Leg RDL', 'Hip Thrust'],
    poolB: ['Good Morning', 'Kickstand RDL', 'Glute Bridge March'],
    poolC: ['Nordic Curl Negativo', 'Slider Leg Curl', 'Frog Pump']
  },
  upper_pull: {
    poolA: ['Inverted Row', 'Band Row', 'Face Pull'],
    poolB: ['Towel Row', 'Prone I-Y-T', 'Doorway Stretch Row'],
    poolC: ['Renegade Row BW', 'Reverse Plank', 'Scap Pull-up']
  },
  core_dynamic: {
    poolA: ['Mountain Climber', 'Plank to Push-up', 'Russian Twist'],
    poolB: ['V-up Parziale', 'Bicycle Crunch', 'Plank Jack'],
    poolC: ['Dead Bug Avanzato', 'Bear Crawl', 'Side Plank Dip']
  },
  cardio_burst: {
    poolA: ['Burpee Senza Salto', 'High Knees', 'Jumping Jack'],
    poolB: ['Skater', 'Tuck Jump', 'Speed Skater'],
    poolC: ['Star Jump', 'Squat Thrust', 'Seal Jack']
  }
}
```

#### ADVANCED

```javascript
METABOLIC_EXERCISES_ADVANCED = {
  lower_push: {
    poolA: ['Jump Squat', 'Lunge Jump', 'Pistol Assistito'],
    poolB: ['Box Jump', 'Broad Jump', 'Shrimp Squat'],
    poolC: ['180 Jump Squat', 'Scissor Lunge', 'Skater Squat']
  },
  upper_push: {
    poolA: ['Clap Push-up', 'Pike Push-up Elevato', 'Pseudo Planche Push-up'],
    poolB: ['Superman Push-up', 'Aztec Push-up', 'Dive Bomber'],
    poolC: ['One-Arm Push-up Assist', 'Typewriter Push-up', 'Explosive Push-up']
  },
  lower_pull: {
    poolA: ['Nordic Curl', 'Single Leg Hip Thrust', 'Sprinter Lunge'],
    poolB: ['Sliding Leg Curl', 'Pistol RDL', 'Deficit RDL'],
    poolC: ['Nordic Curl Iso', 'B-Stance Hip Thrust', 'Reverse Hyper BW']
  },
  upper_pull: {
    poolA: ['Pull-up', 'Muscle-up Negativo', 'Renegade Row'],
    poolB: ['Archer Pull-up', 'L-Sit Pull-up', 'Commando Pull-up'],
    poolC: ['Typewriter Pull-up', 'Clapping Pull-up', 'Front Lever Tuck']
  },
  core_dynamic: {
    poolA: ['V-up', 'Hanging Knee Raise', 'Ab Wheel'],
    poolB: ['Toes to Bar', 'Dragon Flag Negativo', 'Windshield Wiper'],
    poolC: ['L-Sit', 'Hanging Leg Raise', 'Planche Lean']
  },
  cardio_burst: {
    poolA: ['Burpee Completo', 'Box Jump Alto', 'Sprint in Place'],
    poolB: ['Devil Press BW', 'Broad Jump Continuo', 'Plyo Lunge'],
    poolC: ['Burpee Box Jump', 'Double Under (immaginario)', 'Sprawl']
  }
}
```

---

## Integrazione con PainDetect e Ambiente

### Filtro Pain Areas

```javascript
function filterByPainAreas(exercises, painAreas) {
  const PAIN_EXCLUSIONS = {
    knee: ['Jump Squat', 'Lunge Jump', 'Box Jump', 'Burpee', 'Skater', 
           'Pistol', 'Tuck Jump', 'Broad Jump', 'Scissor Lunge'],
    lower_back: ['Good Morning', 'Romanian DL', 'Superman', 'Burpee',
                 'V-up', 'Dragon Flag', 'Hanging Leg Raise'],
    shoulder: ['Pike Push-up', 'Handstand', 'Planche', 'Muscle-up',
               'Archer Push-up', 'Superman Push-up', 'Dive Bomber'],
    wrist: ['Push-up', 'Plank', 'Bear Crawl', 'Burpee', 'Mountain Climber'],
    ankle: ['Jump Squat', 'Box Jump', 'Skater', 'Calf Raise', 'Lunge Jump'],
    hip: ['Lunge', 'Bulgarian', 'Pistol', 'Squat Profondo', 'Hip Thrust'],
    elbow: ['Push-up', 'Diamond Push-up', 'Tricep Dip', 'Skull Crusher BW'],
    neck: ['Burpee', 'Mountain Climber', 'Plank to Push-up'],
    upper_back: ['Pull-up', 'Row', 'Renegade', 'Superman']
  };
  
  let filtered = { ...exercises };
  
  painAreas.forEach(area => {
    const exclusions = PAIN_EXCLUSIONS[area] || [];
    
    Object.keys(filtered).forEach(pattern => {
      Object.keys(filtered[pattern]).forEach(pool => {
        filtered[pattern][pool] = filtered[pattern][pool].filter(
          ex => !exclusions.some(excl => ex.includes(excl))
        );
      });
    });
  });
  
  return filtered;
}
```

### Adattamento Location

```javascript
function adaptForLocation(exercises, location, equipment) {
  if (location === 'gym') {
    // In palestra: aggiungi varianti con attrezzi
    return addGymVariants(exercises, equipment);
  }
  
  if (location === 'home') {
    if (hasEquipment(equipment)) {
      // Casa con attrezzi: mix bodyweight + equipment
      return addHomeEquipmentVariants(exercises, equipment);
    }
    // Casa senza attrezzi: solo bodyweight
    return exercises;
  }
  
  return exercises;
}

function addGymVariants(exercises, equipment) {
  // Sostituzioni per palestra
  const GYM_UPGRADES = {
    'Squat Bodyweight': 'Goblet Squat',
    'Romanian DL BW': 'Romanian Deadlift Manubri',
    'Inverted Row': 'Cable Row Veloce',
    'Glute Bridge': 'Hip Thrust Bilanciere'
    // ... etc
  };
  
  // Applica sostituzioni dove disponibili
  return applySubstitutions(exercises, GYM_UPGRADES);
}
```

---

## Struttura Dati Circuito

### Oggetto Circuito Generato

```javascript
{
  type: 'metabolic_circuit',
  mode: 'finisher' | 'standalone',
  
  // Timing
  totalDuration: 8,              // minuti (settimana corrente)
  baseDuration: 6,               // minuti (settimana 1)
  weekNumber: 2,
  restBetweenRounds: 0,          // 0 per finisher, 60+ per standalone
  
  // Esercizi
  exerciseCount: 4,              // 4 per finisher, 6 per standalone
  exercises: [
    {
      pattern: 'lower_push',
      name: 'Squat Jump Controllato',
      pool: 'poolB',
      timeoutMax: 60,
      rpeTarget: 8,
      alternatives: ['Goblet Squat', 'Lunge Alternato']
    },
    // ... altri esercizi
  ],
  
  // Rotazione
  sessionNumber: 5,              // Sessione attuale
  currentPoolSet: 'poolB',       // Pool attivo (cambia ogni 3 sessioni)
  nextRotationIn: 1,             // Sessioni prima di rotazione
  
  // Filtri applicati
  painAreasFiltered: ['knee'],
  locationAdapted: 'home',
  equipmentUsed: []
}
```

---

## Pattern Sequenza

### FINISHER (4 esercizi)

Sequenza ottimizzata per massimo impatto in poco tempo:

```
1. Lower (squat/lunge)     → Grandi gruppi muscolari
2. Upper Push (push-up)    → Recupero gambe, lavoro busto
3. Core Dynamic            → Transizione
4. Cardio Burst            → Picco finale HR
```

### STANDALONE (6 esercizi)

Sequenza completa per volume:

```
1. Lower Push (squat/lunge)
2. Upper Push (push-up/press)
3. Lower Pull (deadlift/hip hinge)
4. Upper Pull (row/pull)
5. Core Dynamic
6. Cardio Burst
```

---

## Integrazione in GOAL_CONFIGS

```javascript
// Aggiunta a GOAL_CONFIGS esistente

toning: {
  name: 'Tonificazione',
  repsRange: '15-25',
  rest: { compound: 90, accessory: 75, isolation: 60, core: 60 },
  intensity: 'medium',
  focus: 'controlled_volume',
  setsMultiplier: 1.0,
  notes: 'Range simile ipertrofia ma controllato',
  homeStrategy: 'controlled_tempo',
  targetRIR: 3,
  
  // NUOVO: Finisher metabolico
  metabolicFinisher: {
    enabled: true,
    mode: 'finisher'
  }
},

fat_loss: {
  name: 'Dimagrimento',
  // RIMOSSO: repsRange (gestito dal circuito)
  intensity: 'medium-high',
  focus: 'rpe_timed_circuits',
  
  // NUOVO: Configurazione circuiti metabolici
  metabolicCircuit: {
    enabled: true,
    mode: 'standalone',
    
    rpeTarget: 8,
    rpeEmergencyStop: 10,
    earlyStopThreshold: 15,
    
    timeoutMax: {
      beginner: 45,
      intermediate: 60,
      advanced: 75
    },
    
    duration: {
      finisher: {
        beginner: { base: 5, progression: 1, max: 8 },
        intermediate: { base: 6, progression: 1, max: 10 },
        advanced: { base: 8, progression: 1, max: 12 }
      },
      standalone: {
        beginner: { base: 12, progression: 2, max: 20 },
        intermediate: { base: 18, progression: 2, max: 26 },
        advanced: { base: 24, progression: 3, max: 36 }
      }
    },
    
    restBetweenRounds: {
      finisher: 0,
      standalone: {
        beginner: 90,
        intermediate: 60,
        advanced: 45
      }
    },
    
    exercisesCount: {
      finisher: 4,
      standalone: 6
    },
    
    rotation: {
      sessionsBeforeRotation: 3,
      strategy: 'pool_shift'
    },
    
    deloadMultiplier: 0.6
  },
  
  patternSequence: {
    finisher: ['lower_push', 'upper_push', 'core_dynamic', 'cardio_burst'],
    standalone: ['lower_push', 'upper_push', 'lower_pull', 'upper_pull', 'core_dynamic', 'cardio_burst']
  },
  
  includesCardio: true,
  cardioFrequency: 0,  // Integrato nel circuito
  
  notes: 'Circuiti RPE-based, cambio esercizio a RPE 8, rotazione ogni 3 sessioni',
  homeStrategy: 'rpe_timed_circuits',
  circuitFormat: true
}
```

---

## Funzione Generatore Principale

```javascript
function generateMetabolicCircuit(input) {
  const { 
    goal, 
    level, 
    location, 
    equipment, 
    painAreas, 
    sessionNumber,
    weekNumber,
    userPreferences 
  } = input;
  
  // 1. Determina modalità
  const circuitMode = determineCircuitMode(goal, userPreferences);
  if (circuitMode.mode === 'none') return null;
  
  // 2. Seleziona config
  const config = GOAL_CONFIGS.fat_loss.metabolicCircuit;
  const mode = circuitMode.mode;
  
  // 3. Calcola durata corrente
  const durationConfig = config.duration[mode][level];
  const currentDuration = Math.min(
    durationConfig.base + (durationConfig.progression * (weekNumber - 1)),
    durationConfig.max
  );
  
  // 4. Seleziona pool esercizi
  const exercisePool = getExercisePool(level);
  
  // 5. Filtra per pain areas
  const filteredPool = filterByPainAreas(exercisePool, painAreas);
  
  // 6. Adatta per location
  const adaptedPool = adaptForLocation(filteredPool, location, equipment);
  
  // 7. Determina pool attivo (rotazione)
  const currentPoolSet = getCurrentPoolSet(sessionNumber, config.rotation);
  
  // 8. Seleziona esercizi
  const patternSequence = GOAL_CONFIGS.fat_loss.patternSequence[mode];
  const exercises = patternSequence.map(pattern => ({
    pattern,
    name: selectFromPool(adaptedPool[pattern], currentPoolSet),
    pool: currentPoolSet,
    timeoutMax: config.timeoutMax[level],
    rpeTarget: config.rpeTarget,
    alternatives: getAlternatives(adaptedPool[pattern], currentPoolSet)
  }));
  
  // 9. Costruisci output
  return {
    type: 'metabolic_circuit',
    mode,
    totalDuration: currentDuration,
    baseDuration: durationConfig.base,
    weekNumber,
    restBetweenRounds: config.restBetweenRounds[mode]?.[level] || 0,
    exerciseCount: config.exercisesCount[mode],
    exercises,
    sessionNumber,
    currentPoolSet,
    nextRotationIn: config.rotation.sessionsBeforeRotation - (sessionNumber % config.rotation.sessionsBeforeRotation),
    painAreasFiltered: painAreas,
    locationAdapted: location,
    equipmentUsed: Object.keys(equipment || {}).filter(k => equipment[k])
  };
}

function determineCircuitMode(goal, userPreferences) {
  if (goal === 'fat_loss') {
    return { mode: 'standalone', position: 'main' };
  }
  
  if (goal === 'toning') {
    return { mode: 'finisher', position: 'end' };
  }
  
  if (userPreferences?.includesFatLossComponent) {
    return { mode: 'finisher', position: 'end' };
  }
  
  return { mode: 'none' };
}

function getCurrentPoolSet(sessionNumber, rotationConfig) {
  const pools = ['poolA', 'poolB', 'poolC'];
  const index = Math.floor(sessionNumber / rotationConfig.sessionsBeforeRotation) % 3;
  return pools[index];
}

function selectFromPool(patternPools, currentPoolSet) {
  const pool = patternPools[currentPoolSet] || patternPools.poolA;
  // Seleziona random dal pool per varietà
  return pool[Math.floor(Math.random() * pool.length)];
}

function getAlternatives(patternPools, currentPoolSet) {
  const pool = patternPools[currentPoolSet] || patternPools.poolA;
  return pool.slice(0, 3);  // Prime 3 alternative
}
```

---

## Integrazione in programGenerator.js

### Modifica generateStandardProgram

```javascript
function generateStandardProgram(input) {
  // ... codice esistente ...
  
  const weeklySchedule = generateWeeklySchedule(/* params */);
  
  // NUOVO: Aggiungi finisher metabolico se necessario
  const metabolicCircuit = generateMetabolicCircuit({
    goal: input.goal,
    level: input.level,
    location: input.location,
    equipment: input.equipment,
    painAreas: input.painAreas,
    sessionNumber: 1,  // Prima sessione
    weekNumber: 1,
    userPreferences: input.userPreferences
  });
  
  if (metabolicCircuit) {
    if (metabolicCircuit.mode === 'finisher') {
      // Aggiungi finisher a ogni giornata
      weeklySchedule.forEach(day => {
        day.finisher = metabolicCircuit;
      });
    } else if (metabolicCircuit.mode === 'standalone') {
      // Fat loss: circuito È il workout
      return {
        ...programBase,
        weeklySchedule: weeklySchedule.map(day => ({
          ...day,
          mainCircuit: metabolicCircuit,
          exercises: []  // Niente esercizi tradizionali
        }))
      };
    }
  }
  
  return {
    ...programBase,
    weeklySchedule
  };
}
```

---

## UI/UX: Schermata Circuito

### Finisher View (Compatto)

```
┌─────────────────────────────────────┐
│  🔥 FINISHER METABOLICO             │
│  ⏱️ 2:34 / 6:00                     │
├─────────────────────────────────────┤
│                                     │
│      SQUAT JUMP                     │
│      ⏱️ 0:28                         │
│                                     │
│  ┌─────────────────────────────────┐│
│  │     [ RPE 8 → PROSSIMO ]        ││
│  └─────────────────────────────────┘│
│                                     │
│  Next: Push-up Standard             │
└─────────────────────────────────────┘
```

### Standalone View (Completo)

```
┌─────────────────────────────────────┐
│  🔥 CIRCUITO METABOLICO             │
│  ⏱️ 8:45 / 18:00       Giro 2/3     │
├─────────────────────────────────────┤
│                                     │
│      LUNGE ALTERNATO                │
│      ⏱️ 0:42                         │
│                                     │
│  ┌─────────────────────────────────┐│
│  │     [ RPE 8 RAGGIUNTO ]         ││
│  └─────────────────────────────────┘│
│                                     │
│  Sequenza giro:                     │
│  ✅ Squat Jump (38s)                │
│  ▶️ Lunge Alternato                 │
│  ⬚ Romanian DL                      │
│  ⬚ Inverted Row                     │
│  ⬚ Mountain Climber                 │
│  ⬚ Burpee                           │
│                                     │
│  Prossimo giro tra: --:--           │
└─────────────────────────────────────┘
```

---

## Tracking Metriche

### Per Sessione

```javascript
{
  sessionId: string,
  mode: 'finisher' | 'standalone',
  
  // Timing
  targetDuration: number,
  actualDuration: number,
  completedRounds: number,
  
  // Per esercizio
  exerciseStats: [
    {
      name: string,
      pattern: string,
      timesPerformed: number,      // Quante volte in sessione
      avgTimeToRPE8: number,       // Media secondi
      wasTimeout: boolean[],       // Per ogni ripetizione
      wasEarlyStop: boolean[]
    }
  ],
  
  // Aggregati
  avgTimeToRPE8Overall: number,
  exercisesToUpgrade: string[],   // Timeout frequenti
  exercisesToRegress: string[],   // Early stop frequenti
  
  // Pool info
  poolUsed: string,
  sessionInPool: number           // 1, 2, o 3
}
```

### Trigger Aggiustamenti

```javascript
function analyzeCircuitPerformance(sessionStats) {
  const adjustments = { upgrades: [], regressions: [] };
  
  sessionStats.exerciseStats.forEach(ex => {
    // Troppo facile: timeout sempre
    if (ex.wasTimeout.filter(Boolean).length >= 2) {
      adjustments.upgrades.push(ex.name);
    }
    
    // Troppo difficile: early stop sempre
    if (ex.wasEarlyStop.filter(Boolean).length >= 2) {
      adjustments.regressions.push(ex.name);
    }
  });
  
  return adjustments;
}
```

---

## TODO Implementazione

1. [ ] Creare `METABOLIC_EXERCISES_[LEVEL]` pools in file dedicato
2. [ ] Aggiornare `GOAL_CONFIGS` con configurazione `metabolicCircuit`
3. [ ] Implementare `generateMetabolicCircuit()` in programGenerator
4. [ ] Creare `filterByPainAreas()` con mapping completo
5. [ ] Implementare logica rotazione pool
6. [ ] Creare componente `MetabolicCircuitTracker.tsx`
7. [ ] Modificare `WorkoutTracker` per gestire `finisher` object
8. [ ] Aggiungere schermata standalone per goal fat_loss
9. [ ] Implementare tracking metriche circuito
10. [ ] Test rotazione esercizi su 10+ sessioni

---

## Note Finali

- **Finisher**: Non interferisce con workout principale, è un "bonus" metabolico
- **Standalone**: Sostituisce completamente la struttura tradizionale sets/reps
- **Rotazione**: Garantisce varietà senza richiedere progressione tecnica
- **PainDetect**: Sempre attivo, filtra automaticamente esercizi controindicati
- **Location**: Adattamento automatico gym/home/equipment
