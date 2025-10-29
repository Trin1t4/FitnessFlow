import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function BodyCompositionScan() {
  const navigate = useNavigate();
  
  const [measurements, setMeasurements] = useState({
    waistCm: '',
    neckCm: '',
    hipCm: ''
  });
  
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyzeMeasurements = async () => {
    setAnalyzing(true);
    
    try {
      const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
      
      const response = await fetch('/api/body-composition-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: onboardingData.personalInfo.height,
          weight: onboardingData.personalInfo.weight,
          age: onboardingData.personalInfo.age,
          gender: onboardingData.personalInfo.gender,
          waistCm: parseFloat(measurements.waistCm),
          neckCm: parseFloat(measurements.neckCm),
          hipCm: parseFloat(measurements.hipCm || measurements.waistCm)
        })
      });
      
      const data = await response.json();
      setResults(data);
      
      // Salva
      const updatedOnboarding = {
        ...onboardingData,
        bodyComposition: {
          bodyFatPercentage: data.bodyFatPercentage,
          fatMassKg: data.fatMassKg,
          leanMassKg: data.leanMassKg,
          bodyShape: data.bodyShape,
          method: 'us_navy_formula',
          scanDate: new Date().toISOString()
        }
      };
      localStorage.setItem('onboarding_data', JSON.stringify(updatedOnboarding));
      
    } catch (error) {
      console.error('Error:', error);
      alert('Errore nel calcolo');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">📏 Misure Corporee</h1>
        <p className="text-slate-300 mb-6">
          Inserisci le tue misure per calcolare la composizione corporea (Formula US Navy)
        </p>
        
        {/* ISTRUZIONI */}
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-5 mb-6">
          <p className="text-sm font-semibold text-blue-300 mb-2">📐 Come misurare:</p>
          <ul className="text-sm text-blue-200 space-y-2">
            <li>• <strong>Vita</strong>: punto più stretto, all'altezza ombelico, rilassato</li>
            <li>• <strong>Collo</strong>: sotto il pomo d'Adamo, rilassato</li>
            <li>• <strong>Fianchi</strong> (solo donne): punto più largo dei glutei</li>
          </ul>
        </div>
        
        {/* INPUT MISURE */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Circonferenza Vita (cm)
              </label>
              <input
                type="number"
                value={measurements.waistCm}
                onChange={(e) => setMeasurements({ ...measurements, waistCm: e.target.value })}
                placeholder="es. 85"
                className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg px-4 py-3 text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Circonferenza Collo (cm)
              </label>
              <input
                type="number"
                value={measurements.neckCm}
                onChange={(e) => setMeasurements({ ...measurements, neckCm: e.target.value })}
                placeholder="es. 38"
                className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg px-4 py-3 text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Circonferenza Fianchi (cm) - <span className="text-slate-500">Solo donne</span>
              </label>
              <input
                type="number"
                value={measurements.hipCm}
                onChange={(e) => setMeasurements({ ...measurements, hipCm: e.target.value })}
                placeholder="es. 95"
                className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg px-4 py-3 text-lg"
              />
            </div>
          </div>
        </div>
        
        {/* RISULTATI */}
        {results && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Risultati</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/20 rounded-lg p-4 border border-emerald-500/50">
                <p className="text-xs text-emerald-300 mb-1">Body Fat %</p>
                <p className="text-3xl font-bold text-white">{results.bodyFatPercentage}%</p>
              </div>
              <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/50">
                <p className="text-xs text-blue-300 mb-1">Massa Magra</p>
                <p className="text-3xl font-bold text-white">{results.leanMassKg}kg</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/quiz')}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold"
            >
              Continua →
            </button>
          </div>
        )}
        
        {!results && (
          <>
            <button
              onClick={analyzeMeasurements}
              disabled={!measurements.waistCm || !measurements.neckCm || analyzing}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 mb-3"
            >
              {analyzing ? 'Calcolo...' : 'Calcola Body Fat %'}
            </button>
            
            <button
              onClick={() => navigate('/quiz')}
              className="w-full bg-slate-700 text-slate-300 py-3 rounded-lg font-semibold"
            >
              Salta (usa solo BMI)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
