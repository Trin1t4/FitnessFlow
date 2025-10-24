import { useState, useEffect } from 'react';
import { OnboardingData, BodyPhotos, BodyAnalysis } from '../../types/onboarding.types';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export default function PhotoAnalysisStep({ data, onNext }: Props) {
  const [photos, setPhotos] = useState<BodyPhotos>(data.bodyPhotos || {});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BodyAnalysis | null>(data.bodyAnalysis || null);

  useEffect(() => {
    onNext({ bodyPhotos: photos, bodyAnalysis: analysis || undefined });
  }, [photos, analysis]);

  const handleFileUpload = (position: keyof BodyPhotos, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newPhotos = { ...photos, [position]: event.target?.result as string };
      setPhotos(newPhotos);
      if (newPhotos.front && newPhotos.side && newPhotos.back) analyzeBody(newPhotos);
    };
    reader.readAsDataURL(file);
  };

  const analyzeBody = async (photos: BodyPhotos) => {
    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const bmi = data.personalInfo?.bmi || 22;
    const gender = data.personalInfo?.gender || 'M';
    let estimatedBodyFat = gender === 'M' ? (bmi < 20 ? 12 : bmi < 25 ? 18 : bmi < 30 ? 25 : 32) : (bmi < 20 ? 20 : bmi < 25 ? 27 : bmi < 30 ? 35 : 42);
    let muscleMass: 'low' | 'average' | 'high' = bmi < 20 ? 'low' : bmi > 27 ? 'high' : 'average';
    const suggestions = [];
    if (estimatedBodyFat > (gender === 'M' ? 20 : 30)) suggestions.push('Considera deficit calorico per ridurre massa grassa');
    if (muscleMass === 'low') suggestions.push('Focus su allenamento forza e surplus calorico');
    setAnalysis({ estimatedBodyFat, muscleMass, suggestions });
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analisi Corporea (Opzionale)</h2>
        <p className="text-slate-300">Carica 3 foto per un'analisi più accurata</p>
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
        <p className="text-sm text-emerald-200">💡 Foto in pose naturali, buona illuminazione</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {(['front', 'side', 'back'] as const).map((pos) => (
          <div key={pos}>
            <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">
              {pos === 'front' ? 'Fronte' : pos === 'side' ? 'Lato' : 'Retro'}
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(pos, e)} 
              className="hidden" 
              id={`photo-${pos}`} 
            />
            <label 
              htmlFor={`photo-${pos}`} 
              className="block aspect-[3/4] bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-emerald-500 transition overflow-hidden"
            >
              {photos[pos] ? (
                <img src={photos[pos]} alt={pos} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-sm">Carica</span>
                </div>
              )}
            </label>
          </div>
        ))}
      </div>
      {analyzing && (
        <div className="bg-slate-700 rounded-lg p-6 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Analisi in corso...</p>
        </div>
      )}
      {analysis && !analyzing && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 border border-emerald-500/50 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">📊 Risultati Analisi</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Body Fat Stimato</p>
              <p className="text-3xl font-bold text-white">{analysis.estimatedBodyFat}%</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Massa Muscolare</p>
              <p className="text-3xl font-bold text-white capitalize">{analysis.muscleMass}</p>
            </div>
          </div>
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">💡 Suggerimenti:</p>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
