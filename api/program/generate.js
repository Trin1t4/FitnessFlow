import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/src/programGenerator/index.js';

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

    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('onboarding_data')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('[API] ❌ User fetch error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessmentData) {
      console.error('[API] ❌ Assessment fetch error:', assessmentError);
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const onboardingData = userData.onboarding_data || {};
    const intelligentLevel = calculateIntelligentLevel(assessmentData, onboardingData);

    if (!intelligentLevel || !intelligentLevel.bodyweight) {
      console.error('[API] ❌ Failed to calculate intelligent level');
      return res.status(500).json({ error: 'Failed to calculate level' });
    }

    let assessments = [];
    if (assessmentData.assessment_type === 'home' && assessmentData.exercises) {
      assessments = convertHomeAssessmentToStandard(
        assessmentData.exercises,
        intelligentLevel.bodyweight
      );
    } else if (assessmentData.assessment_type === 'gym') {
      assessments = convertGymAssessmentToStandard(
        assessmentData,
        intelligentLevel.bodyweight
      );
    }

    const programInput = {
      userId,
      assessmentId,
      location: onboardingData.trainingLocation || 'gym',
      equipment: onboardingData.equipment || {},
      goal: mapGoalNameToConfig(onboardingData.goal) || 'muscle_gain',
      level: intelligentLevel.finalLevel,
      frequency: onboardingData.activityLevel?.weeklyFrequency || 3,
      painAreas: onboardingData.painAreas || [],
      disabilityType: onboardingData.disabilityType || null,
      sportRole: onboardingData.sportRole || null,
      specificBodyParts: onboardingData.specificBodyParts || [],
      assessments,
      exerciseVariants: assessmentData.exercises || []
    };

    const program = await generateProgram(programInput);

    if (!program || !program.weeklySchedule) {
      console.error('[API] ❌ Program generation failed');
      return res.status(500).json({ error: 'Failed to generate program' });
    }

    if (programInput.location === 'gym') {
      const GYM_ALTERNATIVES = {
        'Pistol Assistito': 'Back Squat',
        'Pistol Completo': 'Back Squat',
        'Squat Assistito': 'Back Squat',
        'Squat Completo': 'Back Squat',
        'Jump Squat': 'Back Squat',
        'Archer Push-up': 'Bench Press',
        'One-Arm Push-up': 'Bench Press',
        'Push-up su Ginocchia': 'Incline Bench Press',
        'Push-up Standard': 'Bench Press',
        'Push-up Mani Strette': 'Close Grip Bench',
        'Dips Completi': 'Dips',
        'Australian Pull-up': 'Barbell Row',
        'Pull-up Completa': 'Lat Pulldown',
        'Inverted Row Orizzontale': 'Barbell Row',
        'Floor Pull asciugamano': 'Assisted Pull-up',
        'Scapular Pull-up': 'Assisted Pull-up',
        'Handstand Push-up': 'Military Press',
        'Handstand Assistito': 'Shoulder Press',
        'Pike Push-up': 'Military Press',
        'Pike Push-up Elevato': 'Incline Bench Press',
      };

      let convertedCount = 0;
      program.weeklySchedule = program.weeklySchedule.map(day => ({
        ...day,
        exercises: day.exercises.map(exercise => {
          const gymAlt = GYM_ALTERNATIVES[exercise.name];
          if (gymAlt) {
            convertedCount++;
            return { ...exercise, name: gymAlt, location: 'gym' };
          }
          return exercise;
        })
      }));

      console.log(`[API] ✅ Converted ${convertedCount} exercises to gym versions`);
    }

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
        location: programInput.location,
        status: 'active',
        current_week: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('[API] ❌ Error saving program:', saveError);
      return res.status(500).json({ error: 'Failed to save program' });
    }

    return res.status(200).json({
      success: true,
      programId: savedProgram.id,
      program: savedProgram,
      levelAnalysis: intelligentLevel,
      appliedLocation: programInput.location
    });

  } catch (error) {
    console.error('[API] ❌ Unexpected error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Funzioni helper da implementare come già descritto
function calculateIntelligentLevel(assessmentData, onboardingData) {
  // ...
  return { finalLevel: 'advanced', bodyweight: {} };
}

function convertHomeAssessmentToStandard(exercises, bodyweightData) {
  // ...
  return [];
}

function convertGymAssessmentToStandard(assessmentData, bodyweightData) {
  // ...
  return [];
}

function mapGoalNameToConfig(goalName) {
  const mapping = {
    'forza': 'strength',
    'strength': 'strength',
    'ipertrofia': 'muscle_gain',
    'muscle_gain': 'muscle_gain',
    'tonificazione': 'toning',
    'toning': 'toning',
    'dimagrimento': 'fat_loss',
    'fat_loss': 'fat_loss',
    'performance': 'performance',
    'recupero_motorio': 'motor_recovery',
    'motor_recovery': 'motor_recovery'
  };
  return mapping[goalName] || 'muscle_gain';
}
