import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // ← AGGIUNGI IMPORT
import { OnboardingData } from '../types/onboarding.types';
import PersonalInfoStep from '../components/onboarding/PersonalInfoStep';
import PhotoAnalysisStep from '../components/onboarding/PhotoAnalysisStep';
import LocationStep from '../components/onboarding/LocationStep';
import ActivityStep from '../components/onboarding/ActivityStep';
import GoalStep from '../components/onboarding/GoalStep';
import PainStep from '../components/onboarding/PainStep';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [isSaving, setIsSaving] = useState(false); // ← AGGIUNGI STATO

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const updateData = (stepData: Partial<OnboardingData>) => {
    setData({ ...data, ...stepData });
  };

  // ✅ FIX: Funzione per salvare in Supabase
  const saveOnboardingToDatabase = async (onboardingData: Partial<OnboardingData>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_data: onboardingData,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving onboarding to database:', error);
        throw error;
      }

      console.log('✅ Onboarding saved to database successfully');
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      throw error;
    }
  };

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // ✅ FIX: Salva in entrambi i posti
      setIsSaving(true);
      try {
        // 1. Salva in localStorage (per compatibilità)
        localStorage.setItem('onboarding_data', JSON.stringify(data));
        
        // 2. Salva in Supabase (NUOVO)
        await saveOnboardingToDatabase(data);
        
        // 3. Naviga al quiz
        navigate('/quiz');
      } catch (error) {
        console.error('Error saving onboarding:', error);
        alert('Errore nel salvare i dati. Riprova.');
        setIsSaving(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepData: Partial<OnboardingData>) => {
    updateData(stepData);
    nextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep data={data} onNext={handleStepComplete} />;
      case 2:
        return <PhotoAnalysisStep data={data} onNext={handleStepComplete} />;
      case 3:
        return <LocationStep data={data} onNext={handleStepComplete} />;
      case 4:
        return <ActivityStep data={data} onNext={handleStepComplete} />;
      case 5:
        return <GoalStep data={data} onNext={handleStepComplete} />;
      case 6:
        return <PainStep data={data} onNext={handleStepComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Setup Iniziale</h1>
            <span className="text-slate-300">Step {currentStep} di {totalSteps}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
          {renderStep()}
        </div>
        <div className="flex gap-4 mt-6">
          {currentStep > 1 && (
            <button 
              onClick={prevStep} 
              disabled={isSaving}
              className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Indietro
            </button>
          )}
          {/* ✅ Mostra stato di caricamento */}
          {isSaving && (
            <div className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Salvataggio...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
