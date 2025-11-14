import { selectExerciseByGoal } from './exerciseSelectionLogic_CJS.js';
import { selectExerciseVariant, getExerciseForLocation } from './exerciseSubstitutions.js';
import { GOAL_CONFIGS as GOAL_CONFIGS_NEW } from './GOAL_CONFIGS_COMPLETE_CJS.js';
import { generateStandardProgram } from './standardProgram.js';
import { generateMotorRecoveryProgram } from './motorRecovery.js';
import { generatePerformanceProgramWithSportRole } from './performanceProgramGenerator.js';

export function generateProgram(input) {
  try {
    switch (input.goal) {
      case 'motor_recovery':
        return generateMotorRecoveryProgram(input);

      case 'performance':
        return generatePerformanceProgramWithSportRole({
          sport: input.sport,
          role: input.sportRole,
          location: input.location,
          level: input.level,
          equipment: input.equipment,
          frequency: input.frequency,
        });

      default:
        return generateStandardProgram(input);
    }
  } catch (error) {
    console.error('Errore nella generazione del programma:', error);
    throw error;
  }
}

// Gestione globale di errori non catturati e promesse non gestite

process.on('uncaughtException', (error) => {
  console.error('Errore non catturato:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise non gestita:', promise, 'causa:', reason);
});

// Esempio gestione taskkill robusta

const { exec } = require('child_process');

function killProcess(pid) {
  exec(`taskkill /pid ${pid} /T /F`, (error, stdout, stderr) => {
    if (error) {
      if (error.message.includes('processo non trovato')) {
        console.warn(`Processo ${pid} già terminato o non trovato.`);
      } else {
        console.error('Errore durante taskkill:', error);
      }
    } else {
      console.log(`Processo ${pid} terminato con successo.`);
    }
  });
}

export { killProcess };
