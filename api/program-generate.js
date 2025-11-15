import { createClient } from '@supabase/supabase-js';
import { generateProgram } from './lib/programGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] 📥 RECEIVED REQUEST:', req.body);
    
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey || 'dummy-key');
    
    // 🧠 ESTRAI TUTTI I DATI DAL CLIENT
    const { 
      userId, 
      assessmentId, 
      level,
      goal,
      location,
      frequency,
      equipment,
      painAreas,
      disabilityType,
      sportRole,
      specificBodyParts,
      hasGym
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // 🧠 USA I DATI REALI RICEVUTI DAL CLIENT!
    const programInput = {
      userId,
      assessmentId,
      // USA I DATI RICEVUTI, NON DEFAULT STUPIDI!
      level: level || 'beginner',  // USA IL LEVEL PASSATO
      goal: goal || 'muscle_gain',  // USA IL GOAL PASSATO
      location: location || 'home', // USA LA LOCATION PASSATA
      frequency: frequency || 3,    // USA LA FREQUENZA PASSATA
      equipment: equipment || {},   // USA L'EQUIPMENT PASSATO
      hasGym: hasGym || false,
      painAreas: painAreas || [],
      disabilityType: disabilityType || null,
      sportRole: sportRole || null,
      specificBodyParts: specificBodyParts || [],
      assessments: []
    };

    // 📊 LOG DETTAGLIATO PER DEBUG
    console.group('[API] 🧠 INTELLIGENT PROGRAM GENERATION');
    console.log('User Level:', programInput.level);
    console.log('User Goal:', programInput.goal);
    console.log('Location:', programInput.location);
    console.log('Frequency:', programInput.frequency);
    console.log('Equipment:', programInput.equipment);
    console.log('Has Gym:', programInput.hasGym);
    console.log('Full Input:', programInput);
    console.groupEnd();

    // 🎯 VALIDAZIONE INTELLIGENTE
    if (programInput.level === 'advanced' && programInput.goal === 'strength') {
      console.log('[API] 💪 ADVANCED STRENGTH PROGRAM REQUESTED');
    }

    // Genera il programma con i DATI REALI
    const program = await generateProgram(programInput);

    if (!program) {
      console.error('[API] ❌ Program generation failed');
      return res.status(500).json({ 
        error: 'Failed to generate program',
        input: programInput 
      });
    }

    console.log('[API] ✅ Program generated successfully for:', {
      level: programInput.level,
      goal: programInput.goal,
      name: program.name
    });

    // Ritorna il programma con metadata per debug
    return res.status(200).json({
      success: true,
      program: program,
      metadata: {
        generatedFor: {
          level: programInput.level,
          goal: programInput.goal,
          location: programInput.location,
          frequency: programInput.frequency
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('[API] ❌ Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}