import { createClient } from '@supabase/supabase-js';
import { generateProgram } from '../../server/programGenerator.js';

// Inizializza Supabase con service role key (server-side)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, assessmentId } = req.body;

    if (!userId || !assessmentId) {
      return res.status(400).json({ error: 'Missing userId or assessmentId' });
    }

    console.log(`[API] Generating program for user ${userId}, assessment ${assessmentId}`);

    // 1. Fetch assessment data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessmentData) {
      console.error('[API] Assessment fetch error:', assessmentError);
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // 2. Fetch user onboarding data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('onboarding_data')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('[API] User fetch error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    const onboarding = userData.onboarding_data || {};

    // 3. Parse assessment results from exercises jsonb
    const exercisesData = assessmentData.exercises || [];
    
    // ✅ CONVERSIONE ASSESSMENT → 1RM
    // 
    // IMPORTANTE - Sistema RIR:
    // 1. ASSESSMENT (qui): RIR = 0 (massimo sforzo)
    //    - Palestra: 10RM = peso max per 10 reps
    //    - Casa: Max reps con variante specifica
    //    → Calcoliamo 1RM TEORICO
    //
    // 2. PROGRAMMA (dopo): RIR = 2-3 (buffer di sicurezza)
    //    - programGenerator.ts applicherà automaticamente:
    //      * Beginner: RIR 3 (es: 5 reps → allena come 8RM)
    //      * Intermediate/Advanced: RIR 2 (es: 5 reps → allena come 7RM)
    //    → Peso di lavoro = 1RM × formula con RIR
    //
    const assessments = exercisesData.map(ex => {
      let oneRepMax;
      
      // CASO 1: Test Palestra (10RM) - 6 esercizi con bilanciere/macchine
      // Esercizi: Squat, Panca piana, Trazioni, Military press, Stacco, Pulley
      if (ex.rm10 && ex.rm10 > 0) {
        // Formula Brzycki: 1RM = peso × (36 / (37 - reps))
        // Esempio: 10RM 100kg → 1RM = 100 × (36/27) = 133kg
        oneRepMax = ex.rm10 * (36 / (37 - 10)); // 10RM → 1RM
        console.log(`[API] ${ex.name}: 10RM ${ex.rm10}kg → 1RM ${oneRepMax.toFixed(1)}kg`);
      }
      // CASO 2: Test Casa (varianti bodyweight) - 5 esercizi con progressioni
      // Esercizi: Squat, Push-up, Trazioni, Spalle, Gambe Unilaterali (ciascuno con 4 livelli)
      else if (ex.variant && ex.variant.level && ex.variant.maxReps) {
        // Durante assessment: utente fa MAX reps (RIR = 0) con la variante più difficile che riesce
        // Esempio: "Push-up normale" (Lv2) × 15 reps max
        //
        // Stimiamo 1RM combinando:
        // - Peso base della variante (più difficile = più peso equivalente)
        // - Ripetizioni massime effettuate
        //
        const baseWeights = {
          'Squat': [40, 60, 80, 100],              // Lv1: Assistito, Lv2: Completo, Lv3: Jump, Lv4: Pistol
          'Push up': [30, 45, 60, 75],             // Lv1: Ginocchia, Lv2: Normale, Lv3: Strette, Lv4: Archer
          'Trazioni': [40, 60, 80, 100],           // Lv1: Australian, Lv2: Negative, Lv3: Assistite, Lv4: Complete
          'Spalle': [20, 35, 50, 65],              // Lv1: Pike, Lv2: Pike push-up, Lv3: Handstand assist, Lv4: Handstand
          'Gambe (Unilaterale)': [30, 45, 60, 75] // Lv1: Affondi, Lv2: Bulgaro, Lv3: Single leg DL, Lv4: Pistol
        };
        
        const weights = baseWeights[ex.name] || [50, 60, 70, 80];
        const levelIndex = Math.min(ex.variant.level - 1, weights.length - 1);
        const baseWeight = weights[levelIndex];
        
        // Applica formula Brzycki con le reps effettive
        const maxReps = Math.min(ex.variant.maxReps, 30); // Cap a 30 per evitare outlier
        oneRepMax = baseWeight * (36 / (37 - maxReps));
        
        console.log(`[API] ${ex.name}: Lv${ex.variant.level} × ${ex.variant.maxReps} reps → 1RM stimato ${oneRepMax.toFixed(1)}kg`);
      }
      // CASO 3: Fallback se l'assessment ha già oneRepMax calcolato
      else if (ex.oneRepMax) {
        oneRepMax = ex.oneRepMax;
        console.log(`[API] ${ex.name}: oneRepMax già presente = ${oneRepMax}kg`);
      }
      // CASO 4: Default sicuro se mancano tutti i dati
      else {
        oneRepMax = 50; // Default sicuro
        console.warn(`[API] ${ex.name}: Nessun dato valido, usando default 50kg`);
      }
      
      return {
        exerciseName: ex.name,
        oneRepMax: Math.round(oneRepMax * 10) / 10 // Arrotonda a 0.1kg
      };
    });

    console.log('[API] Assessments parsed:', assessments);

    // ⚙️ NOTA: I pesi di ALLENAMENTO saranno calcolati dal programGenerator usando:
    // - Questi 1RM come base
    // - RIR 2-3 per sicurezza (beginner = RIR 3, altri = RIR 2)
    // - Formula: peso = 1RM × (37 - (targetReps + RIR)) / 36
    // 
    // Esempio beginner (RIR 3):
    // - 1RM = 133kg
    // - Programma: 5 reps → allena come 8RM (5+3)
    // - Peso lavoro: 133 × (37-8)/36 = 107kg
    //

    // 4. Prepare input for program generator
    const programInput = {
      level: onboarding.fitnessLevel || 'beginner',
      frequency: parseInt(onboarding.frequency) || 3,
      location: onboarding.location || 'gym',
      hasGym: onboarding.location === 'gym' || onboarding.location === 'mixed',
      equipment: onboarding.equipment || {},
      painAreas: onboarding.painAreas || [],
      assessments,
      goal: onboarding.goal || 'general',
      sportRole: onboarding.sportRole,
      specificBodyParts: onboarding.specificBodyParts || [],
      disabilityType: onboarding.disabilityType,
      pregnancyWeek: onboarding.pregnancyWeek,
      pregnancyTrimester: onboarding.pregnancyTrimester,
      hasDoctorClearance: onboarding.hasDoctorClearance,
      pregnancyComplications: onboarding.pregnancyComplications || [],
    };

    console.log('[API] Program input prepared:', JSON.stringify(programInput, null, 2));

    // 5. Generate program
    const generatedProgram = generateProgram(programInput);

    console.log('[API] Program generated successfully');

    // 6. Save to database
    const { data: savedProgram, error: saveError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        name: generatedProgram.name,
        description: generatedProgram.description,
        split: generatedProgram.split,
        days_per_week: generatedProgram.daysPerWeek,
        weekly_schedule: generatedProgram.weeklySchedule,
        progression: generatedProgram.progression,
        includes_deload: generatedProgram.includesDeload,
        deload_frequency: generatedProgram.deloadFrequency,
        total_weeks: generatedProgram.totalWeeks,
        requires_end_cycle_test: generatedProgram.requiresEndCycleTest,
        status: 'active',
        current_week: 1,
      })
      .select()
      .single();

    if (saveError) {
      console.error('[API] Save error:', saveError);
      return res.status(500).json({ error: 'Failed to save program', details: saveError.message });
    }

    console.log('[API] Program saved to database with ID:', savedProgram.id);

    // 7. Return generated program
    return res.status(200).json({
      success: true,
      program: savedProgram,
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
