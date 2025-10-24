import { useState, useEffect } from 'react';
import { OnboardingData } from '../../types/onboarding.types';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export function ActivityStep({ data, onNext }: Props) {
  const [frequency, setFrequency] = useState(data.activityLevel?.weeklyFrequency || 3);
  const [duration, setDuration] = useState<30 | 45 | 60 | 90>(data.activityLevel?.sessionDuration || 60);
  
  useEffect(() => {
    onNext({ activityLevel: { weeklyFrequency: frequency, sessionDuration: duration } });
  }, [frequency, duration]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Frequenza Allenamento</h2>
        <p className="text-slate-300">Quante volte a settimana vuoi allenarti?</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-4">
          Giorni a settimana: <span className="text-2xl text-emerald-400 font-bold">{frequency}</span>
        </label>
        <input 
          type="range" 
          min="2" 
          max="7" 
          value={frequency} 
          onChange={(e) => setFrequency(Number(e.target.value))} 
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>2 giorni</span>
          <span>7 giorni</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Durata sessione</label>
        <div className="grid grid-cols-4 gap-3">
          {[30, 45, 60, 90].map(m => (
            <button 
              key={m} 
              type="button" 
              onClick={() => setDuration(m as any)} 
              className={`p-4 rounded-lg border-2 transition ${duration === m ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
            >
              <div className="text-2xl font-bold">{m}'</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GoalStep({ data, onNext }: Props) {
  const [goal, setGoal] = useState(data.goal || '');
  
  const goals = [
    { value: 'muscle_gain', emoji: '💪', label: 'Massa Muscolare', desc: 'Ipertrofia' },
    { value: 'strength', emoji: '⚡', label: 'Forza', desc: 'Massimali' },
    { value: 'weight_loss', emoji: '🔥', label: 'Dimagrimento', desc: 'Perdere grasso' },
    { value: 'toning', emoji: '✨', label: 'Tonificazione', desc: 'Definizione' },
    { value: 'endurance', emoji: '🏃', label: 'Resistenza', desc: 'Cardio' },
    { value: 'performance', emoji: '⚽', label: 'Performance', desc: 'Sport specifico' }
  ];

  useEffect(() => {
    if (goal) {
      onNext({ goal: goal as any });
    }
  }, [goal]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Obiettivo Principale</h2>
        <p className="text-slate-300">Cosa vuoi raggiungere?</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {goals.map(g => (
          <button 
            key={g.value} 
            type="button" 
            onClick={() => setGoal(g.value)} 
            className={`p-5 rounded-lg border-2 text-left transition ${goal === g.value ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
          >
            <div className="text-3xl mb-2">{g.emoji}</div>
            <div className="font-semibold text-lg">{g.label}</div>
            <div className="text-xs text-slate-400 mt-1">{g.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PainStep({ data, onNext }: Props) {
  const [painPoints, setPainPoints] = useState(data.painPoints || []);
  const [showAdd, setShowAdd] = useState(false);
  const [newPain, setNewPain] = useState({ location: '', intensity: 0, type: 'chronic' as any });
  
  const parts = [
    'Collo',
    'Spalla dx', 
    'Spalla sx', 
    'Gomito dx', 
    'Gomito sx', 
    'Dorso',
    'Schiena bassa', 
    'Ginocchio dx', 
    'Ginocchio sx',
    'Caviglia dx',
    'Caviglia sx',
    'Altro'
  ];
  
  useEffect(() => {
    onNext({ painPoints: painPoints.length > 0 ? painPoints : undefined });
  }, [painPoints]);

  const add = () => {
    if (!newPain.location || !newPain.intensity) return;
    setPainPoints([...painPoints, newPain]);
    setNewPain({ location: '', intensity: 0, type: 'chronic' });
    setShowAdd(false);
  };
  
  const remove = (i: number) => setPainPoints(painPoints.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dolori o Limitazioni (Opzionale)</h2>
        <p className="text-slate-300">Segnala eventuali problematiche fisiche</p>
      </div>
      <div className="bg-amber-500/10 border border-amber-500 rounded-lg p-4">
        <p className="text-sm text-amber-200">⚠️ Questa informazione non sostituisce il parere medico</p>
      </div>
      {painPoints.length > 0 && (
        <div className="space-y-3">
          {painPoints.map((p, i) => (
            <div key={i} className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-white">{p.location}</p>
                <p className="text-sm text-slate-400">Intensità: {p.intensity}/10</p>
              </div>
              <button 
                type="button" 
                onClick={() => remove(i)} 
                className="text-red-400 hover:text-red-300 text-xl"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      {!showAdd ? (
        <button 
          type="button" 
          onClick={() => setShowAdd(true)} 
          className="w-full border-2 border-dashed border-slate-600 rounded-lg py-4 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition"
        >
          + Aggiungi dolore o limitazione
        </button>
      ) : (
        <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Zona del corpo</label>
            <select 
              value={newPain.location} 
              onChange={e => setNewPain({...newPain, location: e.target.value})} 
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            >
              <option value="">Seleziona una zona</option>
              {parts.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Intensità dolore: <span className="text-emerald-400 font-bold">{newPain.intensity}/10</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={newPain.intensity} 
              onChange={e => setNewPain({...newPain, intensity: +e.target.value})} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setShowAdd(false)} 
              className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition"
            >
              Annulla
            </button>
            <button 
              type="button" 
              onClick={add} 
              disabled={!newPain.location || !newPain.intensity} 
              className="flex-1 bg-emerald-500 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-emerald-600 transition"
            >
              Aggiungi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
