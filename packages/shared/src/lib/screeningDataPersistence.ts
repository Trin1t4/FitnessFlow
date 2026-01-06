/**
 * Screening Data Persistence Service
 *
 * Gestisce:
 * - Salvataggio locale (localStorage) dei dati screening
 * - Sync con Supabase quando online
 * - Validazione e normalizzazione dati
 * - Inferenza baselines mancanti
 *
 * @module screeningDataPersistence
 */

import type { Level, PatternBaselines, PatternBaseline } from '../types';

// ============================================
// TYPES
// ============================================

export interface ScreeningData {
  level: Level;
  finalScore: number;
  quizScore: number;
  practicalScore: number;
  physicalScore: number;
  patternBaselines: PatternBaselines;
  timestamp: string;
  version?: number;
}

export interface ScreeningSyncResult {
  success: boolean;
  source: 'local' | 'remote' | 'merged';
  data?: ScreeningData;
  warnings?: string[];
  error?: string;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'trainsmart_screening_data';
const STORAGE_VERSION = 2;

const REQUIRED_PATTERNS = [
  'lower_push',
  'lower_pull',
  'horizontal_push',
  'horizontal_pull',
  'vertical_push',
  'vertical_pull',
  'core'
] as const;

// ============================================
// LOCAL STORAGE
// ============================================

let supabaseClient: any = null;

/**
 * Inizializza il servizio con il client Supabase
 */
export function initScreeningPersistence(client: any): void {
  supabaseClient = client;
}

/**
 * Salva i dati screening in localStorage
 */
export function saveScreeningToLocal(data: ScreeningData): boolean {
  try {
    const toSave = {
      ...data,
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (error) {
    console.error('[screeningPersistence] Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Carica i dati screening da localStorage
 */
export function loadScreeningFromLocal(): ScreeningData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Migrate old versions if needed
    if (parsed.version !== STORAGE_VERSION) {
      return migrateScreeningData(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('[screeningPersistence] Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Rimuove i dati screening da localStorage
 */
export function clearScreeningLocal(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================
// SUPABASE SYNC
// ============================================

/**
 * Salva i dati con sync automatico a Supabase
 */
export async function saveScreeningWithSync(
  userId: string,
  data: ScreeningData
): Promise<ScreeningSyncResult> {
  // Normalizza prima di salvare
  const normalized = normalizeScreeningData(data);

  // Salva localmente sempre
  saveScreeningToLocal(normalized);

  // Prova sync remoto
  if (!supabaseClient || !userId) {
    return {
      success: true,
      source: 'local',
      data: normalized,
      warnings: ['Sync remoto non disponibile']
    };
  }

  try {
    const { error } = await supabaseClient
      .from('user_assessments')
      .upsert({
        user_id: userId,
        assessment_type: 'screening',
        data: normalized,
        assessed_at: normalized.timestamp,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,assessment_type'
      });

    if (error) throw error;

    return {
      success: true,
      source: 'remote',
      data: normalized
    };
  } catch (error: any) {
    console.error('[screeningPersistence] Sync failed:', error);
    return {
      success: true,
      source: 'local',
      data: normalized,
      warnings: [`Sync remoto fallito: ${error.message}. Dati salvati localmente.`]
    };
  }
}

/**
 * Sincronizza dati locali con remoto al login
 */
export async function syncScreeningData(userId: string): Promise<ScreeningSyncResult> {
  if (!supabaseClient) {
    return {
      success: false,
      source: 'local',
      error: 'Client Supabase non inizializzato'
    };
  }

  const local = loadScreeningFromLocal();

  try {
    // Carica dati remoti
    const { data: remote, error } = await supabaseClient
      .from('user_assessments')
      .select('data, assessed_at')
      .eq('user_id', userId)
      .eq('assessment_type', 'screening')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Nessun dato remoto
    if (!remote?.data) {
      if (local) {
        // Upload locale al remoto
        await saveScreeningWithSync(userId, local);
        return { success: true, source: 'local', data: local };
      }
      return { success: true, source: 'local', data: undefined };
    }

    // Nessun dato locale
    if (!local) {
      saveScreeningToLocal(remote.data);
      return { success: true, source: 'remote', data: remote.data };
    }

    // Entrambi esistono: usa il piu recente
    const localTime = new Date(local.timestamp).getTime();
    const remoteTime = new Date(remote.assessed_at).getTime();

    if (remoteTime > localTime) {
      saveScreeningToLocal(remote.data);
      return {
        success: true,
        source: 'remote',
        data: remote.data,
        warnings: ['Dati locali sovrascrittti con dati remoti piu recenti']
      };
    } else if (localTime > remoteTime) {
      await saveScreeningWithSync(userId, local);
      return {
        success: true,
        source: 'local',
        data: local,
        warnings: ['Dati remoti aggiornati con dati locali piu recenti']
      };
    }

    return { success: true, source: 'merged', data: local };
  } catch (error: any) {
    console.error('[screeningPersistence] Sync error:', error);
    return {
      success: false,
      source: 'local',
      data: local || undefined,
      error: error.message
    };
  }
}

// ============================================
// VALIDATION & NORMALIZATION
// ============================================

/**
 * Valida i dati screening
 */
export function validateScreeningData(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data) {
    return { valid: false, errors: ['Dati mancanti'] };
  }

  if (!data.level || !['beginner', 'intermediate', 'advanced'].includes(data.level)) {
    errors.push('Livello non valido');
  }

  if (typeof data.finalScore !== 'number' || data.finalScore < 0 || data.finalScore > 100) {
    errors.push('Punteggio finale non valido');
  }

  if (!data.patternBaselines || typeof data.patternBaselines !== 'object') {
    errors.push('Pattern baselines mancanti');
  }

  if (!data.timestamp) {
    errors.push('Timestamp mancante');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Normalizza i dati screening (fix chiavi inconsistenti)
 */
export function normalizeScreeningData(data: any): ScreeningData {
  // Gestisci chiavi legacy
  const baselines = data.patternBaselines ||
                    data.pattern_baselines ||
                    data.baselines ||
                    {};

  // Normalizza horizontal_pull se mancante
  const normalizedBaselines: PatternBaselines = { ...baselines };

  // Assicurati che horizontal_pull esista (spesso mancante)
  if (!normalizedBaselines.horizontal_pull && normalizedBaselines.vertical_pull) {
    normalizedBaselines.horizontal_pull = {
      ...normalizedBaselines.vertical_pull,
      variantId: 'inverted-row',
      variantName: 'Inverted Row',
      isEstimated: true,
      estimatedFrom: 'vertical_pull'
    };
  }

  return {
    level: data.level || 'beginner',
    finalScore: data.finalScore ?? data.final_score ?? 50,
    quizScore: data.quizScore ?? data.quiz_score ?? 50,
    practicalScore: data.practicalScore ?? data.practical_score ?? 50,
    physicalScore: data.physicalScore ?? data.physical_score ?? 50,
    patternBaselines: normalizedBaselines,
    timestamp: data.timestamp || new Date().toISOString(),
    version: STORAGE_VERSION
  };
}

/**
 * Inferisce baselines mancanti basandosi su quelli esistenti
 */
export function inferMissingBaselines(
  existing: PatternBaselines,
  bodyweight: number,
  level: Level
): PatternBaselines {
  const result: PatternBaselines = { ...existing };

  // Difficolta base per livello
  const baseDifficulty = level === 'beginner' ? 3 : level === 'intermediate' ? 5 : 7;
  const baseReps = level === 'beginner' ? 8 : level === 'intermediate' ? 12 : 15;

  for (const pattern of REQUIRED_PATTERNS) {
    if (!result[pattern]) {
      // Inferisci da pattern simili
      let inferred: PatternBaseline;

      switch (pattern) {
        case 'horizontal_pull':
          // Inferisci da vertical_pull se disponibile
          if (result.vertical_pull) {
            inferred = {
              ...result.vertical_pull,
              variantId: 'inverted-row',
              variantName: 'Inverted Row',
              difficulty: Math.max(1, result.vertical_pull.difficulty - 1),
              isEstimated: true,
              estimatedFrom: 'vertical_pull'
            };
          } else {
            inferred = createDefaultBaseline('horizontal_pull', baseDifficulty, baseReps);
          }
          break;

        case 'lower_pull':
          // Inferisci da lower_push se disponibile
          if (result.lower_push) {
            inferred = {
              ...result.lower_push,
              variantId: 'glute-bridge',
              variantName: 'Glute Bridge',
              difficulty: Math.min(10, result.lower_push.difficulty),
              isEstimated: true,
              estimatedFrom: 'lower_push'
            };
          } else {
            inferred = createDefaultBaseline('lower_pull', baseDifficulty, baseReps);
          }
          break;

        default:
          inferred = createDefaultBaseline(pattern, baseDifficulty, baseReps);
      }

      result[pattern] = inferred;
    }
  }

  return result;
}

/**
 * Crea baseline di default per un pattern
 */
function createDefaultBaseline(
  pattern: string,
  difficulty: number,
  reps: number
): PatternBaseline {
  const defaults: Record<string, { id: string; name: string }> = {
    lower_push: { id: 'bodyweight-squat', name: 'Bodyweight Squat' },
    lower_pull: { id: 'glute-bridge', name: 'Glute Bridge' },
    horizontal_push: { id: 'standard-push-up', name: 'Standard Push-up' },
    horizontal_pull: { id: 'inverted-row', name: 'Inverted Row' },
    vertical_push: { id: 'pike-push-up', name: 'Pike Push-up' },
    vertical_pull: { id: 'negative-pull-up', name: 'Negative Pull-up' },
    core: { id: 'plank', name: 'Plank' }
  };

  const defaultEx = defaults[pattern] || { id: 'unknown', name: 'Unknown' };

  return {
    variantId: defaultEx.id,
    variantName: defaultEx.name,
    difficulty,
    reps,
    isEstimated: true
  };
}

/**
 * Migra dati da versioni precedenti
 */
function migrateScreeningData(oldData: any): ScreeningData {
  console.log('[screeningPersistence] Migrating data from version', oldData.version || 1);

  // v1 -> v2: rinomina pattern_baselines -> patternBaselines
  if (!oldData.version || oldData.version < 2) {
    if (oldData.pattern_baselines && !oldData.patternBaselines) {
      oldData.patternBaselines = oldData.pattern_baselines;
      delete oldData.pattern_baselines;
    }
  }

  return normalizeScreeningData(oldData);
}
