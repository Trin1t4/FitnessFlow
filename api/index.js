export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Usa pathname per il routing
  const path = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (path.endsWith('/auth/user') && req.method === 'GET') {
    return res.status(200).json({
      success: true,
      user: { id: '1', name: 'Marco Rossi', email: 'marco@example.com', profilePicture: null, memberSince: '2025-09-01' }
    });
  }

  if (path.endsWith('/stats') && req.method === 'GET') {
    return res.status(200).json({ workoutsCompleted: 24, currentStreak: 5, weeklyProgress: 75 });
  }

  if (path.endsWith('/program/active') && req.method === 'GET') {
    return res.status(200).json({
      success: true,
      nextWorkout: {
        day: "Mercoledì",
        focus: "Pull Day - Schiena e Bicipiti",
        exercises: [
          { name: "Trazioni alla sbarra", sets: 4, reps: "8-10", weight: "Bodyweight" },
          { name: "Rematore bilanciere", sets: 4, reps: "8-10", weight: "60kg" },
          { name: "Lat machine", sets: 3, reps: "10-12", weight: "50kg" },
          { name: "Curl bilanciere", sets: 3, reps: "10-12", weight: "20kg" },
          { name: "Hammer curl", sets: 3, reps: "12-15", weight: "10kg" }
        ]
      }
    });
  }

  if (path.endsWith('/workouts') && req.method === 'GET') {
    return res.status(200).json({
      success: true,
      workouts: [
        { id: '1', date: '2025-10-17T10:30:00Z', workoutName: 'Push Day - Petto e Tricipiti', duration: 65, exercisesCompleted: 5, totalSets: 18, notes: 'Ottima sessione, aumentato peso su panca' },
        { id: '2', date: '2025-10-15T09:00:00Z', workoutName: 'Leg Day - Gambe e Glutei', duration: 70, exercisesCompleted: 6, totalSets: 20, notes: null },
        { id: '3', date: '2025-10-13T18:30:00Z', workoutName: 'Pull Day - Schiena e Bicipiti', duration: 60, exercisesCompleted: 5, totalSets: 16, notes: 'Focus su trazioni, 3 serie complete!' },
        { id: '4', date: '2025-10-11T10:00:00Z', workoutName: 'Push Day - Petto e Tricipiti', duration: 68, exercisesCompleted: 5, totalSets: 18, notes: null },
        { id: '5', date: '2025-10-09T09:30:00Z', workoutName: 'Leg Day - Gambe e Glutei', duration: 75, exercisesCompleted: 6, totalSets: 21, notes: 'Nuovo PR sullo squat! 100kg x 8' }
      ]
    });
  }

  return res.status(404).json({ success: false, error: 'Route not found' });
}
