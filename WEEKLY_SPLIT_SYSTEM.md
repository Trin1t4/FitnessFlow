# Sistema di Split Intelligente - Documentazione Tecnica

## Panoramica

Il nuovo sistema di split intelligente genera programmi personalizzati con **varianti diverse ogni giorno** invece di ripetere gli stessi esercizi. Questo sistema è basato sulla scienza dell'allenamento e periodizzazione moderna.

## Architettura

### 1. Database Varianti (`exerciseVariants.ts`)

Contiene **7 categorie di pattern** con 4-8 varianti ciascuna:

- **Lower Push** (7 varianti): Squat, Front Squat, Leg Press, Bulgarian Split Squat, Pistol Squat, etc.
- **Lower Pull** (7 varianti): Deadlift, RDL, Sumo DL, Trap Bar DL, Nordic Curl, etc.
- **Horizontal Push** (8 varianti): Push-up, Diamond Push-up, Archer Push-up, Bench Press, Incline Bench, Dips
- **Vertical Push** (6 varianti): Pike Push-up, HSPU, Military Press, Arnold Press, etc.
- **Vertical Pull** (6 varianti): Pull-up, Wide Pull-up, Chin-up, Lat Pulldown, etc.
- **Horizontal Pull** (5 varianti): Row pattern - Inverted Row, Barbell Row, Cable Row, etc.
- **Core** (6 varianti): Plank, Side Plank, Leg Raise, Ab Wheel, etc.

Ogni variante ha:
```typescript
{
  id: string;
  name: string;
  difficulty: number; // 1-10 scala
  equipment: 'bodyweight' | 'gym' | 'both';
  primary: string[]; // Muscoli primari
  secondary: string[]; // Muscoli secondari
}
```

### 2. Generatore Split (`weeklySplitGenerator.ts`)

Genera 3 tipi di split scientificamente validati:

#### 3x SETTIMANA - FULL BODY A/B/C

**Principio**: Tutto il corpo ogni sessione, focus diverso

**Giorno A - Lower Push Dominant**
- Lower Push (Squat variante base)
- Horizontal Push (Bench/Push-up base)
- Vertical Pull (Pull-up/Lat base)
- Core (Plank base)

**Giorno B - Lower Pull Dominant**
- Lower Pull (Deadlift variante base)
- Vertical Push (Military/Pike base)
- Horizontal Push (Variante 2 - Incline/Diamond)
- Core (Variante 2 - Side Plank)

**Giorno C - Balanced**
- Lower Push (Variante 2 - Front Squat/Bulgarian)
- Vertical Pull (Variante 2 - Chin-up/Wide Grip)
- Horizontal Push (Bench base)
- Core (Variante 3 - Leg Raise)

**Vantaggi**:
- Frequenza 2x/settimana per gruppo muscolare
- Ideale per beginners e general fitness
- Recupero ottimale (48h tra sessioni)
- Varianti diverse per stimoli diversi

#### 4x SETTIMANA - UPPER/LOWER

**Principio**: Massimo volume per gruppo muscolare

**Upper A**
- Horizontal Push (Bench/Push-up base)
- Vertical Pull (Pull-up base)
- Vertical Push (Military/Pike base)
- Core

**Lower A**
- Lower Push (Squat base)
- Lower Pull (Deadlift base)
- Core

**Upper B**
- Vertical Push (Variante 2)
- Horizontal Push (Variante 2)
- Vertical Pull (Variante 2)
- Core

**Lower B**
- Lower Pull (Variante 2 - RDL)
- Lower Push (Variante 2 - Front Squat)
- Core

**Vantaggi**:
- Volume maggiore per gruppo
- Ideale per ipertrofia e forza
- Recupero 2-3 giorni per gruppo
- Frequenza 2x/settimana per gruppo

#### 5-6x SETTIMANA - PUSH/PULL/LEGS (PPL)

**Principio**: Massima specializzazione e frequenza

**Push A**
- Horizontal Push
- Vertical Push
- Triceps accessory
- Core

**Pull A**
- Vertical Pull
- Horizontal Pull (Row)
- Biceps accessory
- Core

**Legs A**
- Lower Push
- Lower Pull
- Calves accessory
- Core

**Push B, Pull B, Legs B** (varianti diverse)

**Vantaggi**:
- Massimo volume settimanale
- Ogni gruppo 2x/settimana
- Ideale per advanced athletes
- Specializzazione muscolare

## Logica di Varianti

### Sistema di Rotazione

```typescript
variantIndex = 0 → Variante dello screening (baseline)
variantIndex = 1 → Prima variante alternativa
variantIndex = 2 → Seconda variante alternativa
```

**Esempio pratico**:
```
Giorno 1 (Lower Push, index=0): Air Squat (baseline)
Giorno 2 (Lower Push, index=1): Front Squat (variante)
Giorno 3 (Lower Push, index=0): Air Squat (torna alla baseline)
```

### Filtro Equipment

Il sistema filtra automaticamente varianti in base a:
- **Home**: Solo `bodyweight` o `both`
- **Gym**: Solo `gym` o `both`

### Pain Management

Ogni variante passa attraverso il sistema di pain management:

1. **Conflitto Check**: `isExerciseConflicting(exerciseName, painArea)`
2. **Deload**: Riduce sets/reps basato su severity
3. **Sostituzione**: Trova variante più sicura se necessario
4. **Variante più facile**: `getEasierVariant()` se dolore moderato/severo

## Volume Calculator

Sistema adattivo basato su:

### BEGINNER
```
Sets: 3
Reps: 65% del massimale baseline
Rest: 90s
Intensity: 65%
Focus: Adattamento Anatomico + Tecnica
```

### INTERMEDIATE/ADVANCED + GOAL

**FORZA (Calisthenics focus)**
```
Sets: 5-6 (volume alto)
Reps: 5-8 (sweet spot calisthenics)
Rest: 2-3min
Intensity: 75%
```

**IPERTROFIA**
```
Sets: 4-5
Reps: 6-12 (TUT focus)
Rest: 60-90s
Intensity: 70-80%
```

**ENDURANCE**
```
Sets: 4
Reps: 12-20
Rest: 30-45s
Intensity: 60-70%
```

## Integrazione con Backend

### Formato Output

```typescript
{
  name: "Programma INTERMEDIATE - strength",
  split: "FULL BODY A/B/C (3x/week)",
  exercises: Exercise[], // Flat array (compatibilità)
  level: "intermediate",
  goal: "strength",
  frequency: 3,
  notes: "...",
  weeklySplit: {
    splitName: "FULL BODY A/B/C (3x/week)",
    description: "...",
    days: [
      {
        dayNumber: 1,
        dayName: "Monday - Full Body A",
        focus: "Lower Push Dominant...",
        exercises: Exercise[]
      },
      // ... altri giorni
    ]
  }
}
```

### Compatibilità

- `exercises`: Array flat per compatibilità con vecchio sistema
- `weeklySplit`: Nuovo campo opzionale con struttura dettagliata
- Dashboard usa `weeklySplit` se disponibile, altrimenti fallback a `exercises`

## UI Components

### WeeklySplitView

Componente principale per visualizzazione split:

**Props**:
```typescript
{
  weeklySplit: WeeklySplit;
  showDetails?: boolean; // default true
}
```

**Features**:
- Accordion per ogni giorno
- Badge colorati per pattern
- Indicatori baseline
- Indicatori sostituzione dolori
- Separazione esercizi principali/correttivi

### WeeklySplitCompact

Versione compatta per dashboard overview:
- Mostra solo nomi giorni + numero esercizi
- Grid layout responsive

## Testing

### Test Case 1: 3x Settimana Beginner
```typescript
const program = generateProgramWithSplit({
  level: 'beginner',
  goal: 'general',
  location: 'home',
  trainingType: 'bodyweight',
  frequency: 3,
  baselines: { ... },
  painAreas: []
});

// Aspettato:
// - 3 giorni (Mon/Wed/Fri)
// - Ogni giorno ha esercizi diversi
// - Volume 3x10 @ 65%
```

### Test Case 2: 4x Settimana Intermediate
```typescript
const program = generateProgramWithSplit({
  level: 'intermediate',
  goal: 'muscle_gain',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 4,
  baselines: { ... },
  painAreas: []
});

// Aspettato:
// - 4 giorni (Upper/Lower split)
// - Volume 4-5 sets x 6-12 reps
// - Varianti gym-based
```

### Test Case 3: 6x Settimana Advanced con Dolori
```typescript
const program = generateProgramWithSplit({
  level: 'advanced',
  goal: 'strength',
  location: 'gym',
  trainingType: 'equipment',
  frequency: 6,
  baselines: { ... },
  painAreas: [
    { area: 'lower_back', severity: 'moderate' }
  ]
});

// Aspettato:
// - 6 giorni (PPL split 2x)
// - Deadlift sostituito con Trap Bar DL
// - Esercizi correttivi per lower back
// - Volume 5-6 sets x 5-8 reps
```

## Funzioni Utility

### getVariantForPattern()
```typescript
getVariantForPattern(
  patternId: string,
  baselineVariantId: string,
  variantIndex: number,
  equipment: 'bodyweight' | 'gym'
): string
```

Trova variante N per un pattern, filtrato per equipment.

### getEasierVariant()
```typescript
getEasierVariant(
  patternId: string,
  currentVariantName: string,
  equipment: 'bodyweight' | 'gym'
): string
```

Trova variante più facile per pain management.

## Principi Scientifici

### Frequenza 2x/settimana
Studi mostrano che allenare ogni gruppo muscolare 2x/settimana è ottimale per:
- Sintesi proteica muscolare (MPS)
- Ipertrofia
- Forza
- Recupero

### Varianti Diverse
Stimoli diversi = adattamenti migliori:
- Angoli di lavoro diversi
- Attivazione muscolare diversa
- Prevenzione adattamento
- Riduzione sovraccarico specifico

### Volume Landmarks
Basato su research di Brad Schoenfeld, Mike Israetel:
- **Forza**: 5-8 reps @ 75-85% 1RM
- **Ipertrofia**: 6-12 reps @ 70-80% 1RM
- **Endurance**: 12-20 reps @ 60-70% 1RM

### Calisthenics Specificity
Per bodyweight:
- Volume > Intensità
- Sets più alti (5-6 vs 3-4)
- Progressione via varianti difficoltà
- TUT (Time Under Tension) importante

## File Structure

```
client/src/utils/
├── exerciseVariants.ts         # Database varianti
├── weeklySplitGenerator.ts     # Logica split
├── programGenerator.ts         # Wrapper compatibilità
├── painManagement.ts           # Pain logic
└── exerciseMapping.ts          # Machine conversions

client/src/components/
├── WeeklySplitView.tsx         # UI component
└── Dashboard.tsx               # Integrazione

client/src/types/
└── program.types.ts            # TypeScript types
```

## Migrazioni Future

### Backend Integration
- Salvare `weeklySplit` su Supabase
- API endpoint `/api/program-generate` aggiornato
- Workout session tracking per giorno specifico

### Progressione Automatica
- Tracking performance per variante
- Auto-adjust difficulty basato su performance
- Suggerimenti progressione ("Pronto per Pistol Squat")

### Periodizzazione
- Mesocicli con varianti progressive
- Deload weeks automatici
- Peaking phases per forza

## Conclusioni

Il nuovo sistema:
- ✅ Genera programmi con **varianti diverse ogni giorno**
- ✅ Mantiene **compatibilità** con sistema esistente
- ✅ Applica **pain management** a ogni variante
- ✅ Basato su **scienza dell'allenamento**
- ✅ **Scalabile** per future features (progressione, periodizzazione)
- ✅ **Type-safe** con TypeScript
- ✅ **Testabile** con unit tests

Il problema del "programma sempre uguale" è risolto in modo scientifico e scalabile.
