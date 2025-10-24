import { useState, useEffect } from 'react';
import { OnboardingData, TrainingLocation, Equipment } from '../../types/onboarding.types';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export default function LocationStep({ data, onNext }: Props) {
  const [location, setLocation] = useState<TrainingLocation>(data.trainingLocation || 'gym');
  const [equipment, setEquipment] = useState<Equipment>(data.equipment || {});

  const toggleEquipment = (key: keyof Equipment) => {
    setEquipment({ ...equipment, [key]: !equipment[key] });
  };

  useEffect(() => {
    const isValid = location === 'gym' || Object.values(equipment).some(v => v === true);
    if (isValid) {
      onNext({ trainingLocation: location, equipment: location === 'gym' ? { none: false } : equipment });
    }
  }, [location, equipment]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dove ti alleni?</h2>
        <p className="text-slate-300">Seleziona il luogo principale</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button 
          type="button" 
          onClick={() => setLocation('gym')} 
          className={`p-6 rounded-lg border-2 transition ${location === 'gym' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
        >
          <div className="text-5xl mb-3">🏋️</div>
          <div className="font-semibold text-lg">Palestra</div>
          <div className="text-sm text-slate-400 mt-1">Attrezzatura completa</div>
        </button>
        <button 
          type="button" 
          onClick={() => setLocation('home')} 
          className={`p-6 rounded-lg border-2 transition ${location === 'home' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
        >
          <div className="text-5xl mb-3">🏠</div>
          <div className="font-semibold text-lg">Casa</div>
          <div className="text-sm text-slate-400 mt-1">Setup personalizzato</div>
        </button>
      </div>
      {location === 'home' && (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
            <p className="text-sm text-emerald-200">💡 Seleziona l'attrezzatura disponibile</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'none', emoji: '💪', label: 'Corpo libero', desc: 'Solo peso corporeo' },
              { key: 'pullUpBar', emoji: '🎯', label: 'Sbarra', desc: 'Trazioni' },
              { key: 'dips', emoji: '⚡', label: 'Parallele', desc: 'Dip' },
              { key: 'dumbbells', emoji: '🏋️‍♂️', label: 'Manubri', desc: 'Regolabili' },
              { key: 'kettlebell', emoji: '⚫', label: 'Kettlebell', desc: 'Swing' },
              { key: 'resistanceBands', emoji: '🎗️', label: 'Elastici', desc: 'Bande' },
              { key: 'trx', emoji: '🔗', label: 'TRX', desc: 'Suspension' },
              { key: 'bench', emoji: '🛋️', label: 'Panca', desc: 'Piana' },
              { key: 'barbell', emoji: '⚖️', label: 'Bilanciere', desc: 'Con dischi' }
            ].map((item) => (
              <button 
                key={item.key} 
                type="button" 
                onClick={() => toggleEquipment(item.key as keyof Equipment)} 
                className={`p-4 rounded-lg border-2 transition text-left ${equipment[item.key as keyof Equipment] ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </button>
            ))}
          </div>
          {equipment.dumbbells && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Peso max manubri (kg)</label>
              <input 
                type="number" 
                value={equipment.dumbbellsMaxKg || ''} 
                onChange={(e) => setEquipment({ ...equipment, dumbbellsMaxKg: Number(e.target.value) })} 
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" 
                placeholder="30" 
                min="1" 
                max="100" 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
