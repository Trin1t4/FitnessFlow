/**
 * Data Validators
 * Validazione e normalizzazione dati con backward compatibility
 */

import { PainArea, PainSeverity } from '../types';

export interface NormalizedPainArea {
  area: PainArea;
  severity: PainSeverity;
}

/**
 * Converte severità numerica (1-10) in categoria stringa
 *
 * LOGICA CONSERVATIVA (sicurezza prima di tutto):
 * 1-3 = mild → Deload leggero, continua con cautela
 * 4+  = severe → EVITA esercizio, sostituisci o escludi
 *
 * Razionale: un dolore 4+ pre-sessione o che emerge durante
 * l'esercizio è un campanello d'allarme. Meglio essere conservativi.
 */
export function numericSeverityToString(severity: number): PainSeverity {
  if (severity <= 3) return 'mild';
  // 4+ = severe (evita esercizio)
  // Non esiste più "moderate" - o è gestibile (1-3) o va evitato (4+)
  return 'severe';
}

/**
 * Valida e normalizza formato painAreas
 * Supporta backward compatibility con formato stringa legacy
 *
 * @param painAreas - Array potenzialmente misto di oggetti {area, severity} o stringhe
 * @returns - Array normalizzato di {area, severity} validi
 *
 * @example
 * // Formato nuovo (oggetti)
 * validateAndNormalizePainAreas([
 *   { area: 'knee', severity: 'moderate' },
 *   { area: 'shoulder', severity: 'mild' }
 * ])
 *
 * @example
 * // Formato legacy (stringhe)
 * validateAndNormalizePainAreas(['knee', 'shoulder'])
 * // → [{ area: 'knee', severity: 'mild' }, { area: 'shoulder', severity: 'mild' }]
 */
export function validateAndNormalizePainAreas(painAreas: any[]): NormalizedPainArea[] {
  if (!Array.isArray(painAreas)) {
    console.warn('[VALIDATOR] painAreas non è array, ritorno array vuoto');
    return [];
  }

  const validAreas: PainArea[] = ['knee', 'shoulder', 'lower_back', 'wrist', 'ankle', 'elbow', 'hip'];
  const validSeverities: PainSeverity[] = ['mild', 'moderate', 'severe'];

  const normalized = painAreas
    .map((entry, index) => {
      // Caso 1: Formato oggetto { area, severity }
      if (typeof entry === 'object' && entry.area) {
        const area = entry.area.toLowerCase();
        let severity: PainSeverity;

        // Supporta severità numerica (1-10) o stringa
        if (typeof entry.severity === 'number') {
          severity = numericSeverityToString(entry.severity);
          console.log(`[VALIDATOR] Convertito severity ${entry.severity} -> ${severity} per ${area}`);
        } else {
          severity = entry.severity || 'mild';
        }

        if (!validAreas.includes(area as PainArea)) {
          console.warn(`[VALIDATOR] Area non valida ignorata: ${area}`);
          return null;
        }

        if (!validSeverities.includes(severity as PainSeverity)) {
          console.warn(`[VALIDATOR] Severity non valida per ${area}: ${severity}, default a 'mild'`);
          return { area: area as PainArea, severity: 'mild' as const };
        }

        return { area: area as PainArea, severity: severity as PainSeverity };
      }

      // Caso 2: Formato stringa legacy "knee", "shoulder", etc.
      if (typeof entry === 'string') {
        const area = entry.toLowerCase();

        if (!validAreas.includes(area as PainArea)) {
          console.warn(`[VALIDATOR] Area stringa non valida ignorata: ${area}`);
          return null;
        }

        console.log(`[VALIDATOR] Convertito formato legacy string -> object: ${area}`);
        return { area: area as PainArea, severity: 'mild' as const };
      }

      // Caso 3: Formato sconosciuto
      console.warn(`[VALIDATOR] Formato pain entry sconosciuto ignorato (index ${index}):`, entry);
      return null;
    })
    .filter((entry): entry is NormalizedPainArea => entry !== null);

  console.log(`[VALIDATOR] Normalized ${painAreas.length} pain entries -> ${normalized.length} valid`);
  return normalized;
}
