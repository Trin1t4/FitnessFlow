import { useState, useEffect } from 'react';
import { OnboardingData } from '../../types/onboarding.types';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export default function PersonalInfoStep({ data, onNext }: Props) {
  const [gender, setGender] = useState(data.personalInfo?.gender || 'M');
  const [age, setAge] = useState(data.personalInfo?.age || '');
  const [height, setHeight] = useState(data.personalInfo?.height || '');
  const [weight, setWeight] = useState(data.personalInfo?.weight || '');

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const bmi = weight && height ? calculateBMI(Number(weight), Number(height)) : null;

  useEffect(() => {
    if (gender && age && height && weight) {
      const weightNum = Number(weight);
      const heightNum = Number(height);
      const ageNum = Number(age);
      const bmi = calculateBMI(weightNum, heightNum);
      onNext({
        personalInfo: { gender: gender as 'M' | 'F', age: ageNum, height: heightNum, weight: weightNum, bmi }
      });
    }
  }, [gender, age, height, weight]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Informazioni Personali</h2>
        <p className="text-slate-300">Iniziamo con alcuni dati di base</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Genere</label>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => setGender('M')} className={`p-4 rounded-lg border-2 transition ${gender === 'M' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}>
            <div className="text-3xl mb-2">👨</div>
            <div className="font-semibold">Uomo</div>
          </button>
          <button type="button" onClick={() => setGender('F')} className={`p-4 rounded-lg border-2 transition ${gender === 'F' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}>
            <div className="text-3xl mb-2">👩</div>
            <div className="font-semibold">Donna</div>
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Età</label>
        <input 
          type="number" 
          value={age} 
          onChange={(e) => setAge(e.target.value)} 
          min="13" 
          max="100" 
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" 
          placeholder="es. 25" 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Altezza (cm)</label>
          <input 
            type="number" 
            value={height} 
            onChange={(e) => setHeight(e.target.value)} 
            min="100" 
            max="250" 
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" 
            placeholder="175" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Peso (kg)</label>
          <input 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            min="30" 
            max="300" 
            step="0.1" 
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" 
            placeholder="70" 
          />
        </div>
      </div>
      {bmi && (
        <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-slate-300 mb-1">BMI</p>
            <p className="text-3xl font-bold text-white">{bmi}</p>
          </div>
        </div>
      )}
    </div>
  );
}
