import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ===== CONFIGURAZIONE ZONE =====
const BODY_AREAS = [
  { id: 'shoulder', label: 'Spalla', icon: '🦾', color: 'emerald' },
  { id: 'knee', label: 'Ginocchio', icon: '🦵', color: 'blue' },
  { id: 'lower_back', label: 'Lombare', icon: '🔙', color: 'purple' },
  { id: 'cervical', label: 'Cervicale', icon: '🦒', color: 'amber' },
  { id: 'ankle', label: 'Caviglia', icon: '🦶', color: 'pink' },
  { id: 'hip', label: 'Anca', icon: '🫀', color: 'red' },
  { id: 'elbow', label: 'Gomito', icon: '💪', color: 'indigo' },
  { id: 'wrist', label: 'Polso', icon: '🖐️', color: 'cyan' }
];

// ===== TEST PER ZONA =====
const TESTS_BY_AREA = {
  shoulder: [
    {
      id: 'rom_flexion',
      name: 'Flessione Spalla (ROM)',
      type: 'mobility',
      instruction: 'Solleva il braccio davanti a te. Quanto in alto riesci ad arrivare?',
      options: [
        { value: 0, label: 'Meno di 90° (orizzontale)', score: 0 },
        { value: 1, label: '90-135° (45° sopra orizzontale)', score: 50 },
        { value: 2, label: '135-160° (quasi verticale)', score: 80 },
        { value: 3, label: '160-180° (completamente sopra testa)', score: 100 }
      ]
    },
    {
      id: 'rom_abduction',
      name: 'Abduzione Spalla (ROM)',
      type: 'mobility',
      instruction: 'Solleva il braccio lateralmente. Quanto in alto riesci?',
      options: [
        { value: 0, label: 'Meno di 90°', score: 0 },
        { value: 1, label: '90-135°', score: 50 },
        { value: 2, label: '135-160°', score: 80 },
        { value: 3, label: 'Oltre 160°', score: 100 }
      ]
    },
    {
      id: 'strength_pushup',
      name: 'Forza Push (Push-up)',
      type: 'strength',
      instruction: 'Quanti push-up standard riesci a fare con tecnica corretta?',
      inputType: 'number',
      scoreFormula: (reps) => Math.min(100, reps * 10) // 10 reps = 100 score
    },
    {
      id: 'stability_scapular',
      name: 'Stabilità Scapolare (Plank)',
      type: 'strength',
      instruction: 'Mantieni plank per 30s. Le scapole restano stabili o "alano"?',
      options: [
        { value: 0, label: 'Alano molto / crollo immediato', score: 0 },
        { value: 1, label: 'Alano leggermente', score: 50 },
        { value: 2, label: 'Stabili ma con sforzo', score: 80 },
        { value: 3, label: 'Perfettamente stabili', score: 100 }
      ]
    }
  ],
  
  knee: [
    {
      id: 'rom_flexion',
      name: 'Flessione Ginocchio (ROM)',
      type: 'mobility',
      instruction: 'Piega il ginocchio portando tallone verso gluteo. Quanto arrivi vicino?',
      options: [
        { value: 0, label: 'Meno di 90°', score: 0 },
        { value: 1, label: '90-120°', score: 50 },
        { value: 2, label: '120-140°', score: 80 },
        { value: 3, label: 'Tallone tocca gluteo (>140°)', score: 100 }
      ]
    },
    {
      id: 'squat_depth',
      name: 'Squat Depth',
      type: 'functional',
      instruction: 'Scendi in squat. Dove arrivano i fianchi?',
      options: [
        { value: 0, label: 'Non riesco a scendere', score: 0 },
        { value: 1, label: 'Sopra ginocchia (1/4 squat)', score: 30 },
        { value: 2, label: 'Parallelo (fianchi a livello ginocchia)', score: 70 },
        { value: 3, label: 'Sotto parallelo (ass-to-grass)', score: 100 }
      ]
    },
    {
      id: 'single_leg_balance',
      name: 'Equilibrio Monopodalico',
      type: 'functional',
      instruction: 'Stai in piedi su una gamba sola (occhi aperti). Quanto resisti?',
      inputType: 'number',
      unit: 'secondi',
      scoreFormula: (seconds) => Math.min(100, seconds * 2) // 50s = 100
    },
    {
      id: 'strength_squat',
      name: 'Forza Squat',
      type: 'strength',
      instruction: 'Quanti squat a corpo libero riesci a fare di fila?',
      inputType: 'number',
      scoreFormula: (reps) => Math.min(100, reps * 5) // 20 reps = 100
    }
  ],
  
  lower_back: [
    {
      id: 'rom_flexion',
      name: 'Flessione Lombare (Toe Touch)',
      type: 'mobility',
      instruction: 'Piegati in avanti con gambe tese. Dove arrivano le mani?',
      options: [
        { value: 0, label: 'Sopra ginocchia', score: 0 },
        { value: 1, label: 'Al ginocchio', score: 40 },
        { value: 2, label: 'A metà tibia', score: 70 },
        { value: 3, label: 'Toccano piedi o terra', score: 100 }
      ]
    },
    {
      id: 'bird_dog',
      name: 'Bird Dog (Stabilità Core)',
      type: 'strength',
      instruction: 'Quante ripetizioni bird dog riesci a fare mantenendo la schiena ferma?',
      inputType: 'number',
      scoreFormula: (reps) => Math.min(100, reps * 5) // 20 reps = 100
    },
    {
      id: 'plank_hold',
      name: 'Plank Isometrico',
      type: 'strength',
      instruction: 'Quanto resisti in plank con schiena neutra?',
      inputType: 'number',
      unit: 'secondi',
      scoreFormula: (seconds) => Math.min(100, seconds * 1.5) // 60s = 90
    },
    {
      id: 'cat_cow',
      name: 'Cat-Cow Mobilità',
      type: 'mobility',
      instruction: 'Esegui cat-cow. La schiena si muove fluida in entrambe le direzioni?',
      options: [
        { value: 0, label: 'Molto rigida / dolorosa', score: 0 },
        { value: 1, label: 'Limitata ma indolore', score: 50 },
        { value: 2, label: 'Fluida con lieve rigidità', score: 80 },
        { value: 3, label: 'Completamente fluida', score: 100 }
      ]
    }
  ],
  
  cervical: [
    {
      id: 'rom_rotation',
      name: 'Rotazione Cervicale',
      type: 'mobility',
      instruction: 'Ruota la testa per guardare dietro la spalla. Quanto vedi?',
      options: [
        { value: 0, label: 'Meno di 45° (non vedo spalla)', score: 0 },
        { value: 1, label: '45-60° (vedo spalla)', score: 50 },
        { value: 2, label: '60-75° (vedo quasi dietro)', score: 80 },
        { value: 3, label: 'Oltre 75° (vedo completamente dietro)', score: 100 }
      ]
    },
    {
      id: 'rom_flexion',
      name: 'Flessione Cervicale',
      type: 'mobility',
      instruction: 'Porta il mento al petto. Quanto vicino arrivi?',
      options: [
        { value: 0, label: 'Non tocca / molto distante', score: 0 },
        { value: 1, label: '5-10cm di distanza', score: 50 },
        { value: 2, label: '1-5cm di distanza', score: 80 },
        { value: 3, label: 'Mento tocca petto', score: 100 }
      ]
    },
    {
      id: 'chin_tuck',
      name: 'Chin Tuck Isometrico',
      type: 'strength',
      instruction: 'Fai chin tuck (doppio mento). Quanto resisti?',
      inputType: 'number',
      unit: 'secondi',
      scoreFormula: (seconds) => Math.min(100, seconds * 3) // 30s = 90
    },
    {
      id: 'wall_angels',
      name: 'Wall Angels',
      type: 'functional',
      instruction: 'Esegui wall angels mantenendo schiena al muro. Quanti puliti?',
      inputType: 'number',
      scoreFormula: (reps) => Math.min(100, reps * 8) // 12 reps = 96
    }
  ],
  
  ankle: [
    {
      id: 'rom_dorsiflexion',
      name: 'Dorsi-flessione',
      type: 'mobility',
      instruction: 'Da in piedi, porta il ginocchio oltre le dita senza staccare tallone. Distanza?',
      options: [
        { value: 0, label: 'Meno di 5cm', score: 0 },
        { value: 1, label: '5-8cm', score: 50 },
        { value: 2, label: '8-12cm', score: 80 },
        { value: 3, label: 'Oltre 12cm', score: 100 }
      ]
    },
    {
      id: 'single_leg_balance',
      name: 'Equilibrio Monopodalico',
      type: 'functional',
      instruction: 'Quanti secondi resisti su una gamba (occhi aperti)?',
      inputType: 'number',
      unit: 'secondi',
      scoreFormula: (seconds) => Math.min(100, seconds * 2)
    },
    {
      id: 'calf_raises',
      name: 'Calf Raises Singola Gamba',
      type: 'strength',
      instruction: 'Quanti calf raises su una gamba riesci a fare?',
      inputType: 'number',
      scoreFormula: (reps) => Math.min(100, reps * 5) // 20 reps = 100
    }
  ],
  
  hip: [
    {
      id: 'rom_flexion',
      name: 'Flessione Anca',
      type: 'mobility',
      instruction: 'Sdraiato, porta ginocchio al petto. Angolo anca?',
      options: [
        { value: 0, label: 'Meno di 90°', score: 0 },
        { value: 1, label: '90-110°', score: 50 },
        { value: 2, label: '110-130°', score: 80 },
        { value: 3, label: 'Oltre 130° (ginocchio tocca petto)', score: 100 }
      ]
    },
    {
      id: 'squat_depth',
      name: 'Squat Profondità',
      type: 'functional',
      instruction: 'Scendi in squat. Dove arrivano i fianchi?',
      options: [
        { value: 0, label: 'Sopra parallelo', score: 30 },
        { value: 1, label: 'Parallelo', score: 70 },
        { value: 2, label: 'Sotto parallelo', score: 100 }
      ]
    },
    {
      id: 'glute_bridge',
      name: 'Glute Bridge',
      type: 'strength',
      instruction: 'Quanti glute bridge riesci a fare?',
      inputType: 'number',
      scoreFormula: (reps) => Math.min(100, reps * 4) // 25 reps = 100
    }
  ],
  
  elbow: [
    {
      id: 'rom_flexion_extension',
      name: 'Flessione/Estensione Completa',
      type: 'mobility',
      instruction: 'Piega e stendi completamente il gomito. Movimento completo?',
      options: [
        { value: 0, label: 'Molto limitato', score: 0 },
        { value: 1, label: 'Limitato (manca 20-30°)', score: 50 },
        { value: 2, label: 'Quasi completo (manca <10°)', score: 80 },
        { value: 3, label: 'Completamente fluido', score: 100 }
      ]
    },
    {
      id: 'grip_strength',
      name: 'Forza Presa',
      type: 'strength',
      instruction: 'Dead hang alla sbarra. Quanti secondi?',
      inputType: 'number',
      unit: 'secondi',
      scoreFormula: (seconds) => Math.min(100, seconds * 2)
    }
  ],
  
  wrist: [
    {
      id: 'rom_flexion_extension',
      name: 'Flessione/Estensione Polso',
      type: 'mobility',
      instruction: 'Piega il polso avanti e dietro. Range completo?',
      options: [
        { value: 0, label: 'Molto limitato / rigido', score: 0 },
        { value: 1, label: 'Limitato (50-70°)', score: 50 },
        { value: 2, label: 'Quasi completo (70-85°)', score: 80 },
        { value: 3, label: 'Completo (85-90°)', score: 100 }
      ]
    },
    {
      id: 'plank_wrist',
      name: 'Plank su Polsi',
      type: 'strength',
      instruction: 'Mantieni plank sui palmi (non avambracci). Quanto resisti?',
      inputType: 'number',
      unit: 'secondi',
      scoreFormula: (seconds) => Math.min(100, seconds * 2)
    }
  ]
};

// ===== SPECIFICITÀ DOLORE =====
const PAIN_LOCATIONS = [
  { id: 'anterior', label: 'Anteriore', icon: '⬆️' },
  { id: 'posterior', label: 'Posteriore', icon: '⬇️' },
  { id: 'lateral', label: 'Laterale', icon: '↔️' },
  { id: 'diffuse', label: 'Diffuso', icon: '🔄' }
];

const PAIN_TRIGGERS_BY_AREA = {
  shoulder: [
    { id: 'overhead', label: 'Movimenti sopra la testa' },
    { id: 'rotation', label: 'Rotazioni (es. allacciare reggiseno)' },
    { id: 'pushing', label: 'Spinte (es. aprire porta)' },
    { id: 'pulling', label: 'Trazioni' },
    { id: 'sleeping', label: 'Dormire sul lato' },
    { id: 'weight_bearing', label: 'Portare pesi' }
  ],
  knee: [
    { id: 'stairs', label: 'Salire/scendere scale' },
    { id: 'squatting', label: 'Accosciarsi' },
    { id: 'running', label: 'Correre/saltare' },
    { id: 'kneeling', label: 'Inginocchiarsi' },
    { id: 'prolonged_sitting', label: 'Stare seduto a lungo' }
  ],
  lower_back: [
    { id: 'bending', label: 'Piegarsi in avanti' },
    { id: 'lifting', label: 'Sollevare pesi' },
    { id: 'twisting', label: 'Torsioni del busto' },
    { id: 'sitting', label: 'Stare seduto' },
    { id: 'standing', label: 'Stare in piedi a lungo' }
  ],
  cervical: [
    { id: 'looking_down', label: 'Guardare in basso (smartphone/computer)' },
    { id: 'turning_head', label: 'Girare la testa' },
    { id: 'looking_up', label: 'Guardare in alto' },
    { id: 'sleeping', label: 'Posizione durante il sonno' }
  ],
  ankle: [
    { id: 'walking', label: 'Camminare' },
    { id: 'stairs', label: 'Scale' },
    { id: 'uneven_ground', label: 'Terreno irregolare' },
    { id: 'jumping', label: 'Saltare/correre' }
  ],
  hip: [
    { id: 'walking', label: 'Camminare' },
    { id: 'stairs', label: 'Scale' },
    { id: 'sitting', label: 'Stare seduto' },
    { id: 'squatting', label: 'Accosciarsi' }
  ],
  elbow: [
    { id: 'gripping', label: 'Afferrare oggetti' },
    { id: 'lifting', label: 'Sollevare' },
    { id: 'pushing', label: 'Spingere' },
    { id: 'twisting', label: 'Movimenti rotatori (es. aprire barattolo)' }
  ],
  wrist: [
    { id: 'typing', label: 'Digitare/scrivere' },
    { id: 'gripping', label: 'Afferrare' },
    { id: 'weight_bearing', label: 'Appoggiare peso (es. plank)' },
    { id: 'twisting', label: 'Movimenti rotatori' }
  ]
};

const PAIN_SYMPTOMS = [
  { id: 'sharp', label: '🔪 Acuto/Tagliente' },
  { id: 'dull', label: '🟤 Sordo/Profondo' },
  { id: 'radiating', label: '⚡ Irradiato' },
  { id: 'stiffness', label: '🧊 Rigidità' },
  { id: 'weakness', label: '💪 Debolezza' },
  { id: 'instability', label: '🔄 Instabilità' }
];

// ===== COMPONENTE PRINCIPALE =====
export default function RecoveryScreening() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'area' | 'pain' | 'tests'>('area');
  const [selectedArea, setSelectedArea] = useState('');
  const [painProfile, setPainProfile] = useState({
    location: '',
    triggers: [] as string[],
    symptoms: [] as string[]
  });
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const tests = selectedArea ? TESTS_BY_AREA[selectedArea as keyof typeof TESTS_BY_AREA] || [] : [];
  const currentTest = tests[currentTestIndex];
  const painTriggers = selectedArea ? PAIN_TRIGGERS_BY_AREA[selectedArea as keyof typeof PAIN_TRIGGERS_BY_AREA] || [] : [];

  // ===== HANDLER =====
  const handleAreaSelect = (areaId: string) => {
    setSelectedArea(areaId);
    setStep('pain');
  };

  const handlePainProfileComplete = () => {
    if (!painProfile.location || painProfile.triggers.length === 0 || painProfile.symptoms.length === 0) {
      alert('Completa tutte le sezioni sulla specificità del dolore');
      return;
    }
    setStep('tests');
  };

  const toggleTrigger = (triggerId: string) => {
    setPainProfile(prev => ({
      ...prev,
      triggers: prev.triggers.includes(triggerId)
        ? prev.triggers.filter(t => t !== triggerId)
        : [...prev.triggers, triggerId]
    }));
  };

  const toggleSymptom = (symptomId: string) => {
    setPainProfile(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(s => s !== symptomId)
        : [...prev.symptoms, symptomId]
    }));
  };

  const handleTestAnswer = (answer: any) => {
    const score = currentTest.scoreFormula 
      ? currentTest.scoreFormula(answer)
      : currentTest.options?.find((opt: any) => opt.value === answer)?.score || 0;

    const newResult = {
      testId: currentTest.id,
      testName: currentTest.name,
      type: currentTest.type,
      answer,
      score
    };

    const newResults = [...testResults, newResult];
    setTestResults(newResults);

    if (currentTestIndex < tests.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
    } else {
      completeScreening(newResults);
    }
  };

  const completeScreening = async (finalResults: any[]) => {
    setIsSaving(true);

    try {
      // Calcola scores
      const mobilityTests = finalResults.filter(r => r.type === 'mobility');
      const strengthTests = finalResults.filter(r => r.type === 'strength');
      
      const mobilityScore = mobilityTests.length > 0 
        ? Math.round(mobilityTests.reduce((sum, t) => sum + t.score, 0) / mobilityTests.length)
        : 0;
      
      const strengthScore = strengthTests.length > 0
        ? Math.round(strengthTests.reduce((sum, t) => sum + t.score, 0) / strengthTests.length)
        : 0;
      
      const overallScore = Math.round((mobilityScore + strengthScore) / 2);
      
      // Determina recovery level e fase
      let recoveryLevel = 'low_recovery';
      let assignedPhase = 1;
      
      if (overallScore >= 70) {
        recoveryLevel = 'high_recovery';
        assignedPhase = 3;
      } else if (overallScore >= 40) {
        recoveryLevel = 'medium_recovery';
        assignedPhase = 2;
      }

      const screeningData = {
        body_area: selectedArea,
        pain_location: painProfile.location,
        pain_triggers: painProfile.triggers,
        pain_symptoms: painProfile.symptoms,
        test_results: finalResults,
        mobility_score: mobilityScore,
        strength_score: strengthScore,
        overall_score: overallScore,
        recovery_level: recoveryLevel,
        assigned_phase: assignedPhase,
        completed_at: new Date().toISOString()
      };

      // Salva in localStorage
      localStorage.setItem('recovery_screening_data', JSON.stringify(screeningData));

      // Salva in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('recovery_screenings')
          .insert({
            user_id: user.id,
            ...screeningData
          });

        if (error) {
          console.error('Error saving to Supabase:', error);
        }
      }

      // Naviga a dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error completing screening:', error);
      alert('Errore nel salvare lo screening. Riprova.');
    } finally {
      setIsSaving(false);
    }
  };

  // ===== RENDER STEPS =====
  if (step === 'area') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">🔄 Screening Recupero</h1>
            <p className="text-slate-300">Seleziona la zona da recuperare</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BODY_AREAS.map(area => (
              <button
                key={area.id}
                onClick={() => handleAreaSelect(area.id)}
                className="bg-slate-800/50 border-2 border-slate-700 hover:border-emerald-500 p-6 rounded-xl transition group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition">{area.icon}</div>
                <div className="text-white font-semibold">{area.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'pain') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {BODY_AREAS.find(a => a.id === selectedArea)?.icon} Specificità Dolore
            </h1>
            <p className="text-slate-300">Aiutaci a personalizzare il programma</p>
          </div>

          <div className="space-y-6">
            {/* Localizzazione */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Dove senti principalmente il dolore?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PAIN_LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setPainProfile({...painProfile, location: loc.id})}
                    className={`p-4 rounded-lg border-2 transition ${
                      painProfile.location === loc.id
                        ? 'border-emerald-500 bg-emerald-500/20 text-white'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{loc.icon}</div>
                    <div className="font-semibold">{loc.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Cosa peggiora il dolore? (seleziona tutti quelli rilevanti)
              </label>
              <div className="space-y-2">
                {painTriggers.map(trigger => (
                  <label key={trigger.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={painProfile.triggers.includes(trigger.id)}
                      onChange={() => toggleTrigger(trigger.id)}
                      className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                    />
                    <span className="text-slate-300">{trigger.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sintomi */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Tipo di dolore/sintomi
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PAIN_SYMPTOMS.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-3 rounded-lg border-2 transition text-left ${
                      painProfile.symptoms.includes(symptom.id)
                        ? 'border-emerald-500 bg-emerald-500/20 text-white'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-sm font-semibold">{symptom.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePainProfileComplete}
              disabled={!painProfile.location || painProfile.triggers.length === 0 || painProfile.symptoms.length === 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continua con i Test →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'tests') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-white">Test {currentTestIndex + 1} di {tests.length}</h1>
              <span className="text-slate-300">{Math.round(((currentTestIndex + 1) / tests.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                style={{ width: `${((currentTestIndex + 1) / tests.length) * 100}%` }}
              />
            </div>
          </div>

          {currentTest && (
            <div className="bg-slate-800/50 rounded-xl p-6 md:p-8 border border-slate-700">
              <div className="mb-6">
                <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold mb-3">
                  {currentTest.type === 'mobility' ? '📐 Mobilità' : currentTest.type === 'strength' ? '💪 Forza' : '🎯 Funzionale'}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{currentTest.name}</h2>
                <p className="text-slate-300">{currentTest.instruction}</p>
              </div>

              {currentTest.inputType === 'number' ? (
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder={`Inserisci ${currentTest.unit || 'valore'}...`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = parseFloat((e.target as HTMLInputElement).value);
                        if (value >= 0) handleTestAnswer(value);
                      }
                    }}
                    className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-sm text-slate-400">Premi Enter per confermare</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTest.options?.map((option: any) => (
                    <button
                      key={option.value}
                      onClick={() => handleTestAnswer(option.value)}
                      className="w-full p-4 rounded-lg border-2 border-slate-600 bg-slate-700/50 text-slate-300 hover:border-emerald-500 hover:bg-emerald-500/10 transition text-left"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isSaving && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-slate-800 rounded-xl p-8 flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                <span className="text-white font-semibold">Salvataggio screening...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
