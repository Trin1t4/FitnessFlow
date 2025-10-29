import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/programGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, assessmentId } = req.body;

    if (!userId || !assessmentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('onboarding_data')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('[API] User fetch error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessmentData) {
      console.error('[API] Assessment fetch error:', assessmentError);
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const onboardingData = userData.onboarding_data || {};

    console.log('[API] 🎯 Starting intelligent level calculation...');

    // ✅ CALCOLO LIVELLO INTELLIGENTE
    const intelligentLevel = calculateIntelligentLevel(
      assessmentData, 
      onboardingData
    );

    console.log('[API] 📊 Intelligent Level Result:', intelligentLevel);

    // ✅ CONVERTI ASSESSMENT IN FORMATO STANDARD CON VARIANTI
    let assessments = [];
    
    if (assessmentData.assessment_type === 'home' && assessmentData.exercises) {
      assessments = convertHomeAssessmentToStandard(
        assessmentData.exercises,
        intelligentLevel.bodyweight
      );
      console.log('[API] 🏠 Home assessment converted:', assessments);
      
    } else if (assessmentData.assessment_type === 'gym') {
      assessments = convertGymAssessmentToStandard(
        assessmentData,
        intelligentLevel.bodyweight
      );
      console.log('[API] 🏋️ Gym assessment converted:', assessments);
    }

    // ✅ PREPARA INPUT PROGRAMMA
    const programInput = {
      userId,
      assessmentId,
      location: onboardingData.trainingLocation || 'gym',
      equipment: onboardingData.equipment || {},
      goal: onboardingData.goal || 'muscle_gain',
      level: intelligentLevel.finalLevel,
      frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
      painAreas: onboardingData.painAreas || [],
      disabilityType: onboardingData.disabilityType || null,
      sportRole: onboardingData.sportRole || null,
      specificBodyParts: onboardingData.specificBodyParts || [],
      assessments: assessments, // ✅ Include variant, level, maxReps
      exerciseVariants: assessmentData.exercises || []
    };

    console.log('[API] 📤 Final Program Input:', {
      level: programInput.level,
      location: programInput.location,
      assessments: programInput.assessments.map(a => ({
        name: a.exerciseName,
        variant: a.variant,
        level: a.level,
        maxReps: a.maxReps,
        oneRepMax: a.oneRepMax
      }))
    });

    // Generate program
    const program = await generateProgram(programInput);

    // Save program
    const { data: savedProgram, error: saveError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        name: program.name,
        description: program.description,
        split: program.split,
        days_per_week: program.daysPerWeek,
        weekly_schedule: program.weeklySchedule,
        progression: program.progression,
        includes_deload: program.includesDeload,
        deload_frequency: program.deloadFrequency,
        total_weeks: program.totalWeeks,
        requires_end_cycle_test: program.requiresEndCycleTest,
        frequency: programInput.frequency,
        status: 'active',
        current_week: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[API] Error saving program:', saveError);
      return res.status(500).json({ error: 'Failed to save program' });
    }

    console.log('[API] ✅ Program saved with ID:', savedProgram.id);

    return res.status(200).json({ 
      success: true, 
      programId: savedProgram.id,
      program: savedProgram,
      levelAnalysis: intelligentLevel
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ===== CALCOLO LIVELLO INTELLIGENTE (70% PRATICO + 30% FISICO) =====

function calculateIntelligentLevel(assessmentData, onboardingData) {
  console.log('[LEVEL] 🧮 Starting level calculation...');
  
  const bodyweight = onboardingData.biometrics?.weight || onboardingData.personalInfo?.weight || 70;
  const height = onboardingData.biometrics?.height || onboardingData.personalInfo?.height || 175;
  const age = onboardingData.biometrics?.age || onboardingData.personalInfo?.age || 30;
  const gender = onboardingData.biometrics?.gender || onboardingData.personalInfo?.gender || 'male';

  let quizScore = 0;
  let quizMaxScore = 0;

  if (assessmentData.assessment_type === 'home' && assessmentData.exercises) {
    assessmentData.exercises.forEach(ex => {
      const level = ex.variant?.level || 1;
      const maxReps = ex.variant?.maxReps || 1;
      const coefficient = ex.variant?.coefficient || 1.0;
      
      const virtualWeight = bodyweight * coefficient;
      const estimated1RM = virtualWeight * (1 + (maxReps / 30));
      const relativeStrength = estimated1RM / bodyweight;
      
      let percentScore = 0;
      if (relativeStrength >= 1.5) percentScore = 100;
      else if (relativeStrength >= 1.0) percentScore = 50 + ((relativeStrength - 1.0) / 0.5) * 50;
      else percentScore = (relativeStrength / 1.0) * 50;
      
      quizScore += percentScore;
      quizMaxScore += 100;
      
      console.log(`[LEVEL] 🏠 ${ex.name}: level=${level}, reps=${maxReps}, coeff=${coefficient} → ${virtualWeight.toFixed(0)}kg → score=${percentScore.toFixed(0)}%`);
    });
  } else if (assessmentData.assessment_type === 'gym') {
    const exercises = [
      { name: 'Squat', rm: assessmentData.squat_1rm, standard: gender === 'male' ? 1.5 : 1.0 },
      { name: 'Bench', rm: assessmentData.bench_1rm, standard: gender === 'male' ? 1.0 : 0.6 },
      { name: 'Deadlift', rm: assessmentData.deadlift_1rm, standard: gender === 'male' ? 2.0 : 1.3 },
      { name: 'Press', rm: assessmentData.press_1rm, standard: gender === 'male' ? 0.75 : 0.5 },
      { name: 'Pullup', rm: assessmentData.pullup_1rm, standard: gender === 'male' ? 1.0 : 0.8 }
    ];

    exercises.forEach(ex => {
      if (ex.rm && ex.rm > 0) {
        const relativeStrength = ex.rm / bodyweight;
        const percentOfStandard = (relativeStrength / ex.standard) * 100;
        const exerciseScore = Math.min(percentOfStandard, 150) * 0.8;
        quizScore += exerciseScore;
        quizMaxScore += 120;
        
        console.log(`[LEVEL] 🏋️ ${ex.name}: ${ex.rm}kg / ${bodyweight}kg BW = ${relativeStrength.toFixed(2)}x (${percentOfStandard.toFixed(0)}% standard) → score=${exerciseScore.toFixed(0)}`);
      }
    });
  }

  const quizPercentage = quizMaxScore > 0 ? (quizScore / quizMaxScore) * 100 : 50;
  console.log(`[LEVEL] 📝 Quiz Score: ${quizScore.toFixed(0)}/${quizMaxScore} = ${quizPercentage.toFixed(1)}%`);

  const bmi = bodyweight / ((height / 100) ** 2);
  const bmiScore = bmi >= 18.5 && bmi <= 25 ? 100 : 
                   bmi < 18.5 ? Math.max(0, 50 + (bmi - 18.5) * 10) :
                   Math.max(0, 100 - (bmi - 25) * 5);

  const ageScore = age <= 30 ? 100 :
                   age <= 40 ? 90 :
                   age <= 50 ? 80 :
                   age <= 60 ? 70 : 60;

  const physicalScore = (bmiScore * 0.6 + ageScore * 0.4);
  console.log(`[LEVEL] 💪 Physical Score: BMI=${bmi.toFixed(1)} (${bmiScore.toFixed(0)}/100), Age=${age} (${ageScore}/100) → ${physicalScore.toFixed(1)}%`);

  const weightedScore = (quizPercentage * 0.7) + (physicalScore * 0.3);
  console.log(`[LEVEL] ⚖️ Weighted Score: ${quizPercentage.toFixed(1)}% × 0.7 + ${physicalScore.toFixed(1)}% × 0.3 = ${weightedScore.toFixed(1)}%`);

  let finalLevel;
  if (weightedScore >= 75) {
    finalLevel = 'advanced';
  } else if (weightedScore >= 50) {
    finalLevel = 'intermediate';
  } else {
    finalLevel = 'beginner';
  }

  console.log(`[LEVEL] 🎯 FINAL LEVEL: ${finalLevel.toUpperCase()} (score: ${weightedScore.toFixed(1)}%)`);

  return {
    finalLevel,
    weightedScore: weightedScore.toFixed(1),
    quizScore: quizPercentage.toFixed(1),
    physicalScore: physicalScore.toFixed(1),
    bodyweight,
    bmi: bmi.toFixed(1),
    age,
    breakdown: {
      quiz: `${quizPercentage.toFixed(1)}% (70% weight)`,
      physical: `${physicalScore.toFixed(1)}% (30% weight)`,
      final: `${weightedScore.toFixed(1)}%`
    }
  };
}

// ===== CONVERSIONE HOME ASSESSMENT CON VARIANTI =====

function convertHomeAssessmentToStandard(exercises, bodyweight) {
  if (!exercises || !Array.isArray(exercises)) return [];

  const assessments = [];

  exercises.forEach(ex => {
    const maxReps = ex.variant?.maxReps || 8;
    const level = ex.variant?.level || 1;
    const variantName = ex.variant?.name || '';
    const coefficient = ex.variant?.coefficient || 1.0;
    
    // ✅ Calcola peso virtuale usando coefficient
    const virtualWeight = bodyweight * coefficient;
    const estimated1RM = virtualWeight * (1 + (maxReps / 30));
    
    // ✅ Mappa nomi esercizi
    let mappedName = ex.name;
    if (ex.name === 'Squat') mappedName = 'Squat';
    else if (ex.name === 'Push-up') mappedName = 'Panca';
    else if (ex.name === 'Trazioni') mappedName = 'Trazioni';
    else if (ex.name.includes('Spalle')) mappedName = 'Press';
    else if (ex.name.includes('Gambe')) mappedName = 'Stacco';
    
    // ✅ PASSA TUTTE LE INFO NECESSARIE
    assessments.push({
      exerciseName: mappedName,
      oneRepMax: Math.round(estimated1RM),
      maxReps: maxReps,
      level: level,
      variant: variantName,
      coefficient: coefficient
    });
    
    console.log(`[CONVERT] ${ex.name} → ${mappedName}: level ${level}, variant "${variantName}", ${maxReps} reps, coeff ${coefficient} → 1RM ${Math.round(estimated1RM)}kg`);
  });

  // Aggiungi esercizi mancanti con valori default
  const required = ['Squat', 'Panca', 'Stacco', 'Trazioni', 'Press'];
  required.forEach(req => {
    if (!assessments.find(a => a.exerciseName === req)) {
      assessments.push({
        exerciseName: req,
        oneRepMax: Math.round(bodyweight * 0.6),
        maxReps: 8,
        level: 1,
        variant: 'Base',
        coefficient: 0.6
      });
    }
  });

  return assessments;
}

// ===== CONVERSIONE GYM ASSESSMENT =====

function convertGymAssessmentToStandard(assessmentData, bodyweight) {
  const assessments = [
    { 
      exerciseName: 'Squat', 
      oneRepMax: assessmentData.squat_1rm || bodyweight * 1.2,
      relativeStrength: (assessmentData.squat_1rm || 0) / bodyweight
    },
    { 
      exerciseName: 'Panca', 
      oneRepMax: assessmentData.bench_1rm || bodyweight * 0.8,
      relativeStrength: (assessmentData.bench_1rm || 0) / bodyweight
    },
    { 
      exerciseName: 'Stacco', 
      oneRepMax: assessmentData.deadlift_1rm || bodyweight * 1.5,
      relativeStrength: (assessmentData.deadlift_1rm || 0) / bodyweight
    },
    { 
      exerciseName: 'Trazioni', 
      oneRepMax: assessmentData.pullup_1rm || bodyweight * 0.8,
      relativeStrength: (assessmentData.pullup_1rm || 0) / bodyweight
    },
    { 
      exerciseName: 'Press', 
      oneRepMax: assessmentData.press_1rm || bodyweight * 0.6,
      relativeStrength: (assessmentData.press_1rm || 0) / bodyweight
    }
  ];

  return assessments;
}

// ===== FORMULE E CALCOLI =====

export function calculateOneRepMax(weight, reps) {
  if (reps === 1) return weight;
  return weight * (36 / (37 - reps));
}

export function calculateTargetWeight(oneRepMax, percentage) {
  return Math.round((oneRepMax * percentage) / 2.5) * 2.5;
}

export function calculateTrainingWeight(oneRM, targetReps, RIR = 2) {
  if (!oneRM || oneRM === 0) return null;
  
  const maxReps = targetReps + RIR;
  const weight = oneRM * (37 - maxReps) / 36;
  
  return Math.round(weight / 2.5) * 2.5;
}
