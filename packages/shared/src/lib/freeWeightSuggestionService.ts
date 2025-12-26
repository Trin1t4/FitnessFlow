/**
 * Free Weight Suggestion Service
 *
 * Propone esercizi a corpo libero/pesi liberi a chi usa solo macchine,
 * ma SOLO quando l'utente e in condizioni ottimali (lucidita completa).
 */

export interface RecoveryConditions {
  sleepHours: number;
  stressLevel: number;
  hasInjury: boolean;
  menstrualCycle?: 'follicular' | 'ovulation' | 'luteal' | 'menstruation' | 'menopause' | 'prefer_not_say' | null;
}

export interface FreeWeightSuggestion {
  shouldSuggest: boolean;
  machineExercise: string;
  freeWeightAlternative: string;
  freeWeightDescription: string;
  videoUrl?: string;
  reason?: string; // Motivo per cui NON suggerire
}

// Mapping macchina -> esercizio a corpo libero
const MACHINE_TO_FREEWEIGHT_MAP: Record<string, {
  name: string;
  description: string;
  videoUrl: string;
  benefits: string;
}> = {
  'leg_press': {
    name: 'Squat con Bilanciere',
    description: 'Lo squat attiva piu muscoli: core, stabilizzatori, glutei. E il re degli esercizi per le gambe.',
    videoUrl: '/videos/exercises/back-squat.mp4',
    benefits: 'Maggiore attivazione muscolare globale, forza funzionale'
  },
  'Leg Press': {
    name: 'Squat con Bilanciere',
    description: 'Lo squat attiva piu muscoli: core, stabilizzatori, glutei. E il re degli esercizi per le gambe.',
    videoUrl: '/videos/exercises/back-squat.mp4',
    benefits: 'Maggiore attivazione muscolare globale, forza funzionale'
  },
  'chest_press': {
    name: 'Panca Piana',
    description: 'La panca piana attiva stabilizzatori e core. Movimento piu naturale e completo.',
    videoUrl: '/videos/exercises/flat-barbell-bench-press.mp4',
    benefits: 'Stabilizzazione attiva, maggiore ROM'
  },
  'Chest Press': {
    name: 'Panca Piana',
    description: 'La panca piana attiva stabilizzatori e core. Movimento piu naturale e completo.',
    videoUrl: '/videos/exercises/flat-barbell-bench-press.mp4',
    benefits: 'Stabilizzazione attiva, maggiore ROM'
  },
  'shoulder_press_machine': {
    name: 'Military Press',
    description: 'Il military press in piedi attiva tutto il core e insegna la stabilita verticale.',
    videoUrl: '/videos/exercises/military-press.mp4',
    benefits: 'Core engagement, equilibrio, forza funzionale'
  },
  'Shoulder Press Machine': {
    name: 'Military Press',
    description: 'Il military press in piedi attiva tutto il core e insegna la stabilita verticale.',
    videoUrl: '/videos/exercises/military-press.mp4',
    benefits: 'Core engagement, equilibrio, forza funzionale'
  },
  'row_machine': {
    name: 'Pulley Basso',
    description: 'Il pulley basso richiede controllo del tronco e attiva la catena posteriore.',
    videoUrl: '/videos/exercises/seated-cable-row.mp4',
    benefits: 'Controllo posturale, attivazione core'
  },
  'Row Machine': {
    name: 'Pulley Basso o Rematore con Bilanciere',
    description: 'Esercizi a cavi o bilanciere richiedono piu controllo e attivano la catena posteriore.',
    videoUrl: '/videos/exercises/barbell-row.mp4',
    benefits: 'Controllo posturale, attivazione core'
  },
  'leg_curl': {
    name: 'Romanian Deadlift',
    description: 'Lo stacco rumeno allena i femorali in modo funzionale, migliorando anche la postura.',
    videoUrl: '/videos/exercises/romanian-deadlift.mp4',
    benefits: 'Pattern di movimento funzionale, catena posteriore'
  },
  'Leg Curl': {
    name: 'Romanian Deadlift',
    description: 'Lo stacco rumeno allena i femorali in modo funzionale, migliorando anche la postura.',
    videoUrl: '/videos/exercises/romanian-deadlift.mp4',
    benefits: 'Pattern di movimento funzionale, catena posteriore'
  },
  'leg_extension': {
    name: 'Bulgarian Split Squat',
    description: 'Allena i quadricipiti unilateralmente, migliorando equilibrio e stabilita.',
    videoUrl: '/videos/exercises/bulgarian-split-squat.mp4',
    benefits: 'Equilibrio, correzione asimmetrie, stabilita'
  },
  'Leg Extension': {
    name: 'Bulgarian Split Squat',
    description: 'Allena i quadricipiti unilateralmente, migliorando equilibrio e stabilita.',
    videoUrl: '/videos/exercises/bulgarian-split-squat.mp4',
    benefits: 'Equilibrio, correzione asimmetrie, stabilita'
  }
};

/**
 * Verifica se l'utente e in condizioni ottimali per provare un nuovo esercizio
 */
export function isInOptimalCondition(conditions: RecoveryConditions): { optimal: boolean; reason?: string } {
  // Controllo sonno: almeno 6.5 ore
  if (conditions.sleepHours < 6.5) {
    return {
      optimal: false,
      reason: 'Sonno insufficiente - meglio restare sulla routine abituale'
    };
  }

  // Controllo stress: massimo 5/10
  if (conditions.stressLevel > 5) {
    return {
      optimal: false,
      reason: 'Livello di stress elevato - non e il momento per nuove sfide'
    };
  }

  // Controllo infortuni
  if (conditions.hasInjury) {
    return {
      optimal: false,
      reason: 'Presenza di dolore/infortunio - priorita al recupero'
    };
  }

  // Controllo fase mestruale (solo se specificata e in fase difficile)
  if (conditions.menstrualCycle === 'menstruation') {
    return {
      optimal: false,
      reason: 'Fase mestruale - meglio non introdurre nuovi movimenti'
    };
  }

  return { optimal: true };
}

/**
 * Controlla se l'utente ha usato solo macchine durante lo screening iniziale
 */
export function getUserMachinePreference(): { usedOnlyMachines: boolean; age?: number } {
  try {
    const screeningData = localStorage.getItem('screening_data');
    const onboardingData = localStorage.getItem('onboarding_data');

    if (!screeningData) {
      return { usedOnlyMachines: false };
    }

    const screening = JSON.parse(screeningData);
    let age: number | undefined;

    if (onboardingData) {
      const onboarding = JSON.parse(onboardingData);
      age = onboarding.personalInfo?.age;
    }

    return {
      usedOnlyMachines: screening.usedOnlyMachines === true,
      age
    };
  } catch (error) {
    console.error('[FreeWeightSuggestion] Error reading user preference:', error);
    return { usedOnlyMachines: false };
  }
}

/**
 * Trova l'esercizio macchina nel workout e propone l'alternativa a corpo libero
 */
export function findFreeWeightAlternative(workoutExercises: any[]): { machineExercise: string; alternative: typeof MACHINE_TO_FREEWEIGHT_MAP[string] } | null {
  if (!workoutExercises || workoutExercises.length === 0) {
    return null;
  }

  for (const exercise of workoutExercises) {
    const exerciseId = exercise.id || exercise.name?.toLowerCase().replace(/\s+/g, '_');
    const exerciseName = exercise.name;

    // Cerca prima per ID poi per nome
    const alternative = MACHINE_TO_FREEWEIGHT_MAP[exerciseId] || MACHINE_TO_FREEWEIGHT_MAP[exerciseName];

    if (alternative) {
      return {
        machineExercise: exerciseName || exerciseId,
        alternative
      };
    }
  }

  return null;
}

/**
 * Funzione principale: determina se mostrare la proposta
 */
export function shouldSuggestFreeWeight(
  conditions: RecoveryConditions,
  workoutExercises: any[]
): FreeWeightSuggestion {
  // 1. Controlla se l'utente ha usato solo macchine
  const { usedOnlyMachines, age } = getUserMachinePreference();

  if (!usedOnlyMachines) {
    return {
      shouldSuggest: false,
      machineExercise: '',
      freeWeightAlternative: '',
      freeWeightDescription: '',
      reason: 'Utente usa gia pesi liberi'
    };
  }

  // 2. Controlla eta (max 50 anni per questa proposta)
  if (age && age > 50) {
    return {
      shouldSuggest: false,
      machineExercise: '',
      freeWeightAlternative: '',
      freeWeightDescription: '',
      reason: 'Proposta riservata a utenti sotto i 50 anni'
    };
  }

  // 3. Controlla condizioni di recupero
  const optimalCheck = isInOptimalCondition(conditions);
  if (!optimalCheck.optimal) {
    return {
      shouldSuggest: false,
      machineExercise: '',
      freeWeightAlternative: '',
      freeWeightDescription: '',
      reason: optimalCheck.reason
    };
  }

  // 4. Trova esercizio macchina nel workout con alternativa disponibile
  const alternative = findFreeWeightAlternative(workoutExercises);
  if (!alternative) {
    return {
      shouldSuggest: false,
      machineExercise: '',
      freeWeightAlternative: '',
      freeWeightDescription: '',
      reason: 'Nessun esercizio macchina con alternativa nel workout di oggi'
    };
  }

  // 5. Controlla frequenza (non proporre ogni volta - max 1 volta a settimana)
  const lastSuggestionKey = 'last_freeweight_suggestion';
  const lastSuggestion = localStorage.getItem(lastSuggestionKey);
  if (lastSuggestion) {
    const daysSinceLastSuggestion = (Date.now() - parseInt(lastSuggestion)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastSuggestion < 7) {
      return {
        shouldSuggest: false,
        machineExercise: '',
        freeWeightAlternative: '',
        freeWeightDescription: '',
        reason: `Proposta gia mostrata ${Math.floor(daysSinceLastSuggestion)} giorni fa - aspetta 7 giorni`
      };
    }
  }

  // Tutto ok! Proponi l'esercizio
  return {
    shouldSuggest: true,
    machineExercise: alternative.machineExercise,
    freeWeightAlternative: alternative.alternative.name,
    freeWeightDescription: alternative.alternative.description,
    videoUrl: alternative.alternative.videoUrl
  };
}

/**
 * Registra che la proposta e stata mostrata (per non riproporre troppo spesso)
 */
export function markSuggestionShown(): void {
  localStorage.setItem('last_freeweight_suggestion', Date.now().toString());
}

/**
 * Registra se l'utente ha accettato di provare l'esercizio
 */
export function recordSuggestionResponse(accepted: boolean, exerciseName: string): void {
  const historyKey = 'freeweight_suggestion_history';
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

  history.push({
    timestamp: new Date().toISOString(),
    exercise: exerciseName,
    accepted
  });

  // Mantieni solo gli ultimi 20 record
  if (history.length > 20) {
    history.shift();
  }

  localStorage.setItem(historyKey, JSON.stringify(history));

  // Se ha accettato 3+ volte, considera di aggiornare le preferenze
  if (accepted) {
    const acceptedCount = history.filter((h: any) => h.accepted).length;
    if (acceptedCount >= 3) {
      console.log('[FreeWeightSuggestion] User has accepted 3+ times - consider updating their preference');
      // In futuro: aggiornare automaticamente usedOnlyMachines = false
    }
  }
}
