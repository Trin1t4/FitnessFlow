export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Received:', req.body);
    
    const { level, goal, location, frequency } = req.body;
    
    // GENERA UN PROGRAMMA DI TEST
    const program = {
      name: `Programma ${level.toUpperCase()} - ${goal}`,
      level: level,
      goal: goal,
      location: location,
      frequency: frequency,
      split: level === 'advanced' ? 'UPPER_LOWER' : 'FULL_BODY',
      daysPerWeek: frequency || 3,
      totalWeeks: 8,
      exercises: level === 'advanced' ? [
        'Squat Bulgaro',
        'Stacco Rumeno', 
        'Military Press',
        'Trazioni Zavorrate',
        'Dips',
        'Face Pulls'
      ] : [
        'Squat',
        'Push-up',
        'Rematore',
        'Plank'
      ],
      generatedAt: new Date().toISOString()
    };
    
    console.log('[API] Generated:', program);
    
    return res.status(200).json({
      success: true,
      program: program
    });
    
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal error'
    });
  }
}
