// performanceProgramGenerator.js

const PERFORMANCE_SPORT_CONFIGS = {
  calcio: {
    name: 'Calcio',
    focus: ['accelerazione', 'cambio_direzione', 'salto_verticale', 'endurance_anaerobica'],
    roles: {
      portiere: {
        priority: ['esplosività_laterale', 'salto_verticale', 'core_stability'],
        exercises: ['Lateral Bound', 'Box Jump Lateral', 'Single Leg Hop', 'Plank Lateral Shift', 'Medicine Ball Slam Lateral'],
      },
      difensore: {
        priority: ['forza_massimale', 'accelerazione', 'duelli_aerei'],
        exercises: ['Squat Jump', 'Broad Jump', 'Box Jump', 'Nordic Curl', 'Push Press'],
      },
      centrocampista: {
        priority: ['endurance_anaerobica', 'cambio_direzione', 'accelerazione'],
        exercises: ['Lateral Shuffle', 'Cone Drill', 'Burpee Broad Jump', 'Jump Squat', 'HIIT Intervals'],
      },
      attaccante: {
        priority: ['accelerazione_esplosiva', 'salto_verticale', 'sprint'],
        exercises: ['Depth Jump', 'Sprint Start', 'Single Leg Bound', 'Box Jump', 'Power Clean (se gym)'],
      },
    },
  },
  basket: {
    name: 'Basket',
    focus: ['salto_verticale', 'forza_esplosiva_gambe', 'core_rotation'],
    roles: {
      playmaker: {
        priority: ['accelerazione', 'cambio_direzione', 'endurance'],
        exercises: ['Lateral Bound', 'Cone Drill', 'Jump Squat', 'Sprint Intervals', 'Box Jump'],
      },
      ala: {
        priority: ['salto_verticale', 'accelerazione', 'forza_esplosiva'],
        exercises: ['Depth Jump', 'Box Jump', 'Broad Jump', 'Single Leg Bound', 'Clap Push-up'],
      },
      centro: {
        priority: ['forza_massimale', 'salto_verticale', 'contatto_fisico'],
        exercises: ['Box Jump', 'Nordic Curl', 'Push Press', 'Squat Jump pesante', 'Plank con peso'],
      },
    },
  },
  // altri sport...
};

function generatePerformanceProgramWithSportRole({
  sport,
  role,
  location,
  level,
  equipment,
  frequency,
}) {
  sport = sport?.toLowerCase();
  role = role?.toLowerCase() || 'singolo';

  const sportConfig = PERFORMANCE_SPORT_CONFIGS[sport];
  if (!sportConfig) {
    console.warn(`Sport "${sport}" non trovato, genero programma generico.`);
    return generateGenericPerformanceProgram({ level, frequency, location });
  }

  const roleConfig = sportConfig.roles[role] || Object.values(sportConfig.roles)[0];
  console.log(`[PERFORMANCE] Sport: ${sportConfig.name}, Ruolo: ${role}, Priorità: ${roleConfig.priority.join(', ')}`);

  const weeklySchedule = [];

  weeklySchedule.push({
    dayName: `${sportConfig.name} - Esplosività Gambe`,
    location,
    exercises: generatePerformanceLowerBody(roleConfig, location, level, equipment),
  });

  weeklySchedule.push({
    dayName: `${sportConfig.name} - Potenza Busto`,
    location,
    exercises: generatePerformanceUpperBody(roleConfig, location, level, equipment),
  });

  if (frequency >= 3) {
    weeklySchedule.push({
      dayName: `${sportConfig.name} - Conditioning Specifico`,
      location,
      exercises: generatePerformanceConditioning(roleConfig, location, level, equipment),
    });
  }

  return {
    name: `Performance ${sportConfig.name} - ${role}`,
    description: `Focus: ${roleConfig.priority.join(', ')}`,
    split: 'performance_sport_specific',
    daysPerWeek: weeklySchedule.length,
    location,
    weeklySchedule,
    progression: 'progressive_explosive',
    totalWeeks: 8,
    includesDeload: true,
    deloadFrequency: 3,
    requiresEndCycleTest: true,
    sportSpecific: true,
  };
}

function generatePerformanceLowerBody(roleConfig, location, level, equipment) {
  const isGym = location === 'gym';
  return roleConfig.exercises
    .filter(name => /jump|squat|bound|nordic/i.test(name))
    .map(name => ({
      name,
      sets: level === 'advanced' ? 5 : 4,
      reps: /jump|bound/i.test(name) ? '5-8' : '4-6',
      rest: 180,
      weight: isGym ? 'variabile' : null,
      notes: 'Massima esplosività',
    }));
}

function generatePerformanceUpperBody(roleConfig, location, level, equipment) {
  return roleConfig.exercises
    .filter(name => /push|medicine ball|slam|press/i.test(name))
    .map(name => ({
      name,
      sets: 4,
      reps: '6-8',
      rest: 120,
      weight: null,
      notes: 'Potenza busto',
    }))
    .concat([{
      name: 'Plank Rotation',
      sets: 3,
      reps: '30-45s',
      rest: 60,
      weight: null,
      notes: 'Core stability',
    }]);
}

function generatePerformanceConditioning(roleConfig, location, level, equipment) {
  let exercises = roleConfig.exercises.filter(name => /interval|shuffle|drill|sprint/i.test(name))
    .map(name => ({
      name,
      sets: /interval/i.test(name) ? 8 : 5,
      reps: /interval/i.test(name) ? '30s on / 30s off' : '10-15',
      rest: 60,
      weight: null,
      notes: 'Conditioning specifico',
    }));
  if (exercises.length === 0) {
    exercises = [
      { name: 'Burpees', sets: 5, reps: '10', rest: 45, weight: null, notes: 'Conditioning' },
      { name: 'Sprint Intervals', sets: 8, reps: '20s on / 40s off', rest: 60, weight: null, notes: 'Anaerobico' },
    ];
  }
  return exercises;
}

function generateGenericPerformanceProgram({ level, frequency, location }) {
  return {
    name: `Performance Generica - ${level}`,
    description: `${frequency}x/settimana, focus esplosività generale`,
    split: 'performance_generic',
    daysPerWeek: frequency,
    location,
    weeklySchedule: [
      {
        dayName: 'Esplosività Gambe',
        location,
        exercises: [
          { name: 'Jump Squat', sets: 4, reps: '6-8', rest: 180, weight: null, notes: 'Esplosività' },
          { name: 'Broad Jump', sets: 3, reps: '5', rest: 120, weight: null },
          { name: 'Single Leg Hop', sets: 3, reps: '8/lato', rest: 90, weight: null },
        ],
      },
      {
        dayName: 'Potenza Busto',
        location,
        exercises: [
          { name: 'Clap Push-up', sets: 4, reps: '6-8', rest: 180, weight: null },
          { name: 'Medicine Ball Slam', sets: 3, reps: '10', rest: 90, weight: null },
          { name: 'Plank Dinamico', sets: 3, reps: '45s', rest: 60, weight: null },
        ],
      },
      {
        dayName: 'Condizionamento Generale',
        location,
        exercises: [
          { name: 'Agility Ladder', sets: 4, reps: '20', rest: 60, weight: null },
          { name: 'Jump Rope', sets: 5, reps: '60s', rest: 45, weight: null },
        ],
      },
    ],
    progression: 'progressive_explosive',
    totalWeeks: 8,
    includesDeload: true,
    deloadFrequency: 3,
    requiresEndCycleTest: true,
    sportSpecific: false,
  };
}

export {
  generatePerformanceProgramWithSportRole,
  generateGenericPerformanceProgram,
};
