import { useState } from 'react';
import { OnboardingData, PainArea, PainSeverity, PainEntry } from '../../types/onboarding.types';

interface PainStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

/**
 * Mapping zone dolore italiano → PainArea types
 * Alcune zone sono mappate come best-match (es. cervicale/dorsale → shoulder)
 */
const PAIN_AREAS: Array<{ value: PainArea; label: string; icon: string }> = [
  { value: 'shoulder', label: 'Cervicale/Collo', icon: '🦴' },
  { value: 'shoulder', label: 'Spalle', icon: '💪' },
  { value: 'lower_back', label: 'Zona Lombare', icon: '⬇️' },
  { value: 'hip', label: 'Anche/Bacino', icon: '🦴' },
  { value: 'knee', label: 'Ginocchia', icon: '🦵' },
  { value: 'ankle', label: 'Caviglie/Piedi', icon: '👣' },
  { value: 'wrist', label: 'Polsi/Mani', icon: '🤚' },
  { value: 'elbow', label: 'Gomiti', icon: '💪' }
];

/**
 * Converti intensità dolore (1-10) → severity type
 */
function intensityToSeverity(intensity: number): PainSeverity {
  if (intensity >= 8) return 'severe';
  if (intensity >= 4) return 'moderate';
  return 'mild';
}

export default function PainStep({ data, onNext }: PainStepProps) {
  const [hasPain, setHasPain] = useState<boolean | null>(
    data.painAreas ? data.painAreas.length > 0 : null
  );

  // Inizializza da painAreas esistenti (se presenti)
  const initialPainMap: Map<PainArea, number> = new Map();
  if (data.painAreas) {
    data.painAreas.forEach((entry) => {
      const intensity = entry.severity === 'severe' ? 9 : entry.severity === 'moderate' ? 5 : 2;
      initialPainMap.set(entry.area, intensity);
    });
  }

  const [painIntensity, setPainIntensity] = useState<Map<PainArea, number>>(initialPainMap);

  const togglePainArea = (area: PainArea) => {
    const newMap = new Map(painIntensity);
    if (newMap.has(area)) {
      newMap.delete(area);
    } else {
      newMap.set(area, 5); // Default: moderate
    }
    setPainIntensity(newMap);
  };

  const handleSubmit = () => {
    if (hasPain === false) {
      // Nessun dolore → painAreas vuoto
      onNext({ painAreas: [] });
      return;
    }

    // Converti Map<PainArea, intensity> → PainEntry[]
    const painAreas: PainEntry[] = Array.from(painIntensity.entries()).map(([area, intensity]) => ({
      area,
      severity: intensityToSeverity(intensity)
    }));

    onNext({ painAreas });
  };

  const selectedAreas = Array.from(painIntensity.keys());
  const isValid = hasPain !== null && (hasPain === false || selectedAreas.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">🩺 Screening Dolori</h2>
        <p className="text-slate-400 text-base">Hai dolori o fastidi attuali durante l'allenamento?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setHasPain(false);
            setPainIntensity(new Map());
          }}
          className={`p-6 rounded-lg border-2 transition-all ${
            hasPain === false
              ? 'border-emerald-500 bg-emerald-500/20 text-white'
              : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="text-4xl mb-2">✅</div>
          <div className="font-display font-bold text-lg">Nessun dolore</div>
          <div className="text-sm text-slate-400 mt-1">Mi sento bene</div>
        </button>

        <button
          onClick={() => setHasPain(true)}
          className={`p-6 rounded-lg border-2 transition-all ${
            hasPain === true
              ? 'border-amber-500 bg-amber-500/20 text-white'
              : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="text-4xl mb-2">⚠️</div>
          <div className="font-display font-bold text-lg">Ho dolori</div>
          <div className="text-sm text-slate-400 mt-1">Specificare zone</div>
        </button>
      </div>

      {hasPain === true && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h3 className="font-display font-semibold text-lg text-white mb-3">Seleziona le zone con dolore/fastidio:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PAIN_AREAS.map((area, index) => (
                <button
                  key={`${area.value}-${index}`}
                  onClick={() => togglePainArea(area.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    painIntensity.has(area.value)
                      ? 'border-amber-500 bg-amber-500/20 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{area.icon}</span>
                    <span className="text-sm font-medium">{area.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedAreas.length > 0 && (
            <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-5 border border-slate-600/50">
              <h3 className="font-display font-semibold text-lg text-white mb-4">Intensità del dolore (1-10):</h3>
              <div className="space-y-3">
                {selectedAreas.map((area) => {
                  const areaInfo = PAIN_AREAS.find((a) => a.value === area);
                  const intensity = painIntensity.get(area) || 5;
                  const severity = intensityToSeverity(intensity);

                  return (
                    <div key={area}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300 text-sm">
                          {areaInfo?.icon} {areaInfo?.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono font-bold text-xl">{intensity}</span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            severity === 'severe' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            severity === 'moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {severity === 'severe' ? 'Severo' : severity === 'moderate' ? 'Moderato' : 'Lieve'}
                          </span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={intensity}
                        onChange={(e) => {
                          const newMap = new Map(painIntensity);
                          newMap.set(area, Number(e.target.value));
                          setPainIntensity(newMap);
                        }}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>1-3: Lieve</span>
                        <span>4-7: Moderato</span>
                        <span>8-10: Severo</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-amber-200 font-medium">
              ⚠️ Se i dolori sono severi (8+) o persistenti, consulta un medico prima di iniziare
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continua →
      </button>
    </div>
  );
}
