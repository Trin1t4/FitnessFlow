import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/programGenerator.js';

// ✅ IMPORT le alternative HOME
import { HOMEALTERNATIVES } from '../../server/exerciseSubstitutions.js';

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
      location: onboardingData.trainingLocation || 'gym',  // ← LOCATION QUI!
      equipment: onboardingData.equipment || {},
      goal: onboardingData.goal || 'muscle_gain',
      level: intelligentLevel.finalLevel,
      frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
      painAreas: onboardingData.painAreas || [],
      disabilityType: onboardingData.disabilityType || null,
      sportRole: onboardingData.sportRole || null,
      specificBodyParts: onboardingData.specificBodyParts || [],
      assessments: assessments,
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

    // ✅ GENERA PROGRAMMA
    let program = await generateProgram(programInput);

    console.log('[API] ✅ Program generated, location:', programInput.location);

    // ✅ APPLICA LOCATION ALTERNATIVES SE HOME/MIXED
    if (programInput.location === 'home' || programInput.location === 'mixed') {
      console.log(`[API] 🏠 Applying HOME alternatives for location: ${programInput.location}...`);
      
      program.weeklySchedule = program.weeklySchedule.map(day => ({
        ...day,
        exercises: day.exercises.map(exercise => {
          // Cerca alternativa HOME
          const homeAlternative = HOMEALTERNATIVES[exercise.name];
          
          if (homeAlternative) {
            console.log(`[API] 🔄 Substituting: ${exercise.name} → ${homeAlternative}`);
            return { 
              ...exercise, 
              name: homeAlternative,
              location: 'home'  // ← Marca come exercise HOME
            };
          }
          
          // Se non c'è alternativa e location === 'home', lascia come è
          if (programInput.location === 'home') {
            console.log(`[API] ⚠️ No alternative found for ${exercise.name}, keeping bodyweight version`);
          }
          
          return exercise;
        })
      }));

      console.log('[API] ✅ HOME alternatives applied successfully');
    } else {
      console.log('[API] 🏋️ Location is GYM - keeping all standard exercises');
    }

    // ✅ SALVA PROGRAMMA IN DB
    const { data: savedProgram, error: saveError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        name: program.name,
        description: program.description,
        split: program.split,
        days_per_week: program.daysPerWeek,
        weekly_schedule: program.weeklySchedule,  // ← QUI sono le esercizi con location!
        progression: program.progression,
        includes_deload: program.includesDeload,
        deload_frequency: program.deloadFrequency,
        total_weeks: program.totalWeeks,
        requires_end_cycle_test: program.requiresEndCycleTest,
        frequency: programInput.frequency,
        location: programInput.location,  // ← SALVA location nel DB
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

    console.log('[API] ✅ Program saved with ID:', savedProgram.id, 'Location:', programInput.location);

    return res.status(200).json({ 
      success: true, 
      programId: savedProgram.id,
      program: savedProgram,
      levelAnalysis: intelligentLevel,
      appliedLocation: programInput.location
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ... resto delle funzioni rimane uguale ...
