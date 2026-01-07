/**
 * ASSESSMENT SCORING WITH BODY COMPOSITION - TrainSmart
 * 
 * Migliora il physicalScore integrando body composition (Navy formula)
 * invece di affidarsi solo al BMI che è notoriamente inaccurato per atleti.
 * 
 * REFERENCE:
 * - Hodgdon JA, Beckett MB (1984) - Prediction of percent body fat for U.S. Navy men and women
 * - US Navy Body Fat Calculator - Standard military formula
 */

// ============================================================================
// TYPES
// ============================================================================

export interface BodyMeasurements {
  height: number;        // cm
  weight: number;        // kg
  age: number;
  gender: 'male' | 'female';
  waistCircumference?: number;    // cm - a livello dell'ombelico
  neckCircumference?: number;     // cm - sotto il pomo d'Adamo
  hipCircumference?: number;      // cm - punto più largo (solo donne)
}

export interface BodyCompositionResult {
  bodyFatPercentage: number;
  leanMass: number;
  fatMass: number;
  category: 'essential' | 'athlete' | 'fitness' | 'average' | 'above_average' | 'obese';
  categoryIt: string;
  method: 'navy' | 'bmi_estimate';
}

export interface PhysicalScoreResult {
  score: number;         // 0-100
  breakdown: {
    bodyComposition: number;
    age: number;
    combined: number;
  };
  category: string;
  categoryIt: string;
  recommendations: string[];
  recommendationsIt: string[];
}

// ============================================================================
// BODY FAT CATEGORIES
// ============================================================================

const BODY_FAT_CATEGORIES_MALE = {
  essential: { max: 5, label: 'Essential Fat', labelIt: 'Grasso Essenziale' },
  athlete: { max: 13, label: 'Athlete', labelIt: 'Atleta' },
  fitness: { max: 17, label: 'Fitness', labelIt: 'Fitness' },
  average: { max: 24, label: 'Average', labelIt: 'Nella Media' },
  above_average: { max: 30, label: 'Above Average', labelIt: 'Sopra la Media' },
  obese: { max: 100, label: 'Obese', labelIt: 'Obesità' }
};

const BODY_FAT_CATEGORIES_FEMALE = {
  essential: { max: 13, label: 'Essential Fat', labelIt: 'Grasso Essenziale' },
  athlete: { max: 20, label: 'Athlete', labelIt: 'Atleta' },
  fitness: { max: 24, label: 'Fitness', labelIt: 'Fitness' },
  average: { max: 31, label: 'Average', labelIt: 'Nella Media' },
  above_average: { max: 39, label: 'Above Average', labelIt: 'Sopra la Media' },
  obese: { max: 100, label: 'Obese', labelIt: 'Obesità' }
};

// ============================================================================
// NAVY FORMULA BODY FAT CALCULATION
// ============================================================================

/**
 * Calcola body fat % usando la formula Navy
 * Più accurata del BMI per atleti e persone muscolose
 */
export function calculateNavyBodyFat(measurements: BodyMeasurements): number | null {
  const { height, waistCircumference, neckCircumference, hipCircumference, gender } = measurements;
  
  // Verifica che abbiamo tutte le misure necessarie
  if (!waistCircumference || !neckCircumference) {
    return null;
  }
  
  if (gender === 'female' && !hipCircumference) {
    return null;
  }
  
  const heightCm = height;
  
  if (gender === 'male') {
    // Navy formula for men: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    const bodyFat = 495 / (
      1.0324 
      - 0.19077 * Math.log10(waistCircumference - neckCircumference) 
      + 0.15456 * Math.log10(heightCm)
    ) - 450;
    
    return Math.max(0, Math.min(60, bodyFat)); // Clamp 0-60%
  } else {
    // Navy formula for women: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    const bodyFat = 495 / (
      1.29579 
      - 0.35004 * Math.log10(waistCircumference + hipCircumference! - neckCircumference) 
      + 0.22100 * Math.log10(heightCm)
    ) - 450;
    
    return Math.max(0, Math.min(60, bodyFat));
  }
}

/**
 * Stima body fat dal BMI (fallback meno accurato)
 */
export function estimateBodyFatFromBMI(measurements: BodyMeasurements): number {
  const { height, weight, age, gender } = measurements;
  
  const bmi = weight / ((height / 100) ** 2);
  
  // Formula Deurenberg (1991) - meno accurata ma funziona senza misurazioni
  if (gender === 'male') {
    return (1.20 * bmi) + (0.23 * age) - 16.2;
  } else {
    return (1.20 * bmi) + (0.23 * age) - 5.4;
  }
}

/**
 * Calcola composizione corporea completa
 */
export function calculateBodyComposition(measurements: BodyMeasurements): BodyCompositionResult {
  // Prima prova Navy formula (più accurata)
  let bodyFatPercentage = calculateNavyBodyFat(measurements);
  let method: 'navy' | 'bmi_estimate' = 'navy';
  
  // Fallback a stima BMI se non abbiamo le misure
  if (bodyFatPercentage === null) {
    bodyFatPercentage = estimateBodyFatFromBMI(measurements);
    method = 'bmi_estimate';
  }
  
  // Calcola masse
  const fatMass = measurements.weight * (bodyFatPercentage / 100);
  const leanMass = measurements.weight - fatMass;
  
  // Determina categoria
  const categories = measurements.gender === 'male' 
    ? BODY_FAT_CATEGORIES_MALE 
    : BODY_FAT_CATEGORIES_FEMALE;
  
  let category: keyof typeof categories = 'average';
  let categoryLabel = categories.average.label;
  let categoryLabelIt = categories.average.labelIt;
  
  for (const [key, value] of Object.entries(categories)) {
    if (bodyFatPercentage <= value.max) {
      category = key as keyof typeof categories;
      categoryLabel = value.label;
      categoryLabelIt = value.labelIt;
      break;
    }
  }
  
  return {
    bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
    leanMass: Math.round(leanMass * 10) / 10,
    fatMass: Math.round(fatMass * 10) / 10,
    category,
    categoryIt: categoryLabelIt,
    method
  };
}

// ============================================================================
// PHYSICAL SCORE CALCULATION
// ============================================================================

/**
 * Converte body fat category in score (0-100)
 */
function bodyCompositionToScore(
  bodyFatPercentage: number, 
  gender: 'male' | 'female'
): number {
  const categories = gender === 'male' 
    ? BODY_FAT_CATEGORIES_MALE 
    : BODY_FAT_CATEGORIES_FEMALE;
  
  // Score mapping:
  // Athlete: 90-100
  // Fitness: 80-89
  // Average: 65-79
  // Above Average: 45-64
  // Obese: 30-44
  // Essential (troppo basso): 40-60 (non ideale)
  
  if (bodyFatPercentage <= categories.essential.max) {
    // Grasso essenziale - troppo basso può essere problematico
    return 50;
  } else if (bodyFatPercentage <= categories.athlete.max) {
    // Atleta
    const range = categories.athlete.max - categories.essential.max;
    const position = bodyFatPercentage - categories.essential.max;
    return 90 + (10 * (1 - position / range)); // 90-100
  } else if (bodyFatPercentage <= categories.fitness.max) {
    // Fitness
    const range = categories.fitness.max - categories.athlete.max;
    const position = bodyFatPercentage - categories.athlete.max;
    return 80 + (10 * (1 - position / range)); // 80-90
  } else if (bodyFatPercentage <= categories.average.max) {
    // Average
    const range = categories.average.max - categories.fitness.max;
    const position = bodyFatPercentage - categories.fitness.max;
    return 65 + (15 * (1 - position / range)); // 65-80
  } else if (bodyFatPercentage <= categories.above_average.max) {
    // Above average
    const range = categories.above_average.max - categories.average.max;
    const position = bodyFatPercentage - categories.average.max;
    return 45 + (20 * (1 - position / range)); // 45-65
  } else {
    // Obese
    return Math.max(30, 45 - (bodyFatPercentage - categories.above_average.max));
  }
}

/**
 * Converte età in score (considera fitness per diverse fasce d'età)
 */
function ageToScore(age: number): number {
  // L'età non è un indicatore di fitness, ma può influenzare
  // il potenziale di recupero e progressione
  
  if (age < 25) return 90;
  if (age < 30) return 85;
  if (age < 35) return 82;
  if (age < 40) return 78;
  if (age < 45) return 74;
  if (age < 50) return 70;
  if (age < 55) return 65;
  if (age < 60) return 60;
  if (age < 65) return 55;
  return 50;
}

/**
 * MAIN FUNCTION: Calcola il physical score per l'assessment
 */
export function calculatePhysicalScore(measurements: BodyMeasurements): PhysicalScoreResult {
  const bodyComp = calculateBodyComposition(measurements);
  
  // Score componenti
  const bodyCompScore = bodyCompositionToScore(bodyComp.bodyFatPercentage, measurements.gender);
  const ageScore = ageToScore(measurements.age);
  
  // Peso: body composition 70%, età 30%
  const combinedScore = Math.round(bodyCompScore * 0.7 + ageScore * 0.3);
  
  // Genera raccomandazioni
  const recommendations: string[] = [];
  const recommendationsIt: string[] = [];
  
  if (bodyComp.category === 'obese' || bodyComp.category === 'above_average') {
    recommendations.push('Consider including more cardio and monitoring caloric intake');
    recommendationsIt.push('Considera aggiungere più cardio e monitorare l\'apporto calorico');
  }
  
  if (bodyComp.category === 'essential') {
    recommendations.push('Body fat may be too low - ensure adequate nutrition for recovery');
    recommendationsIt.push('Il grasso corporeo potrebbe essere troppo basso - assicura nutrizione adeguata per il recupero');
  }
  
  if (measurements.age > 50) {
    recommendations.push('Recovery may take longer - ensure adequate rest between sessions');
    recommendationsIt.push('Il recupero potrebbe richiedere più tempo - assicura riposo adeguato tra le sessioni');
  }
  
  if (bodyComp.method === 'bmi_estimate') {
    recommendations.push('For more accurate body composition, add waist and neck measurements');
    recommendationsIt.push('Per una composizione corporea più accurata, aggiungi misure di vita e collo');
  }
  
  // Categoria overall
  let category = 'Average';
  let categoryIt = 'Nella Media';
  
  if (combinedScore >= 85) {
    category = 'Excellent';
    categoryIt = 'Eccellente';
  } else if (combinedScore >= 75) {
    category = 'Good';
    categoryIt = 'Buono';
  } else if (combinedScore >= 60) {
    category = 'Average';
    categoryIt = 'Nella Media';
  } else {
    category = 'Needs Improvement';
    categoryIt = 'Da Migliorare';
  }
  
  return {
    score: combinedScore,
    breakdown: {
      bodyComposition: Math.round(bodyCompScore),
      age: Math.round(ageScore),
      combined: combinedScore
    },
    category,
    categoryIt,
    recommendations,
    recommendationsIt
  };
}

// ============================================================================
// INTEGRATION HELPER
// ============================================================================

/**
 * Helper per integrare nel ScreeningFlow esistente
 * Sostituisce il calcolo physicalScore basato solo su BMI
 */
export function calculatePhysicalScoreFromOnboarding(onboardingData: any): number {
  if (!onboardingData?.personalInfo) {
    return 65; // default
  }
  
  const { 
    height, 
    weight, 
    age, 
    gender,
    waistCircumference,
    neckCircumference,
    hipCircumference
  } = onboardingData.personalInfo;
  
  // Validazione base
  if (!height || !weight || !age) {
    return 65;
  }
  
  const measurements: BodyMeasurements = {
    height: parseFloat(height) || 170,
    weight: parseFloat(weight) || 70,
    age: parseInt(age) || 30,
    gender: gender === 'female' ? 'female' : 'male',
    waistCircumference: waistCircumference ? parseFloat(waistCircumference) : undefined,
    neckCircumference: neckCircumference ? parseFloat(neckCircumference) : undefined,
    hipCircumference: hipCircumference ? parseFloat(hipCircumference) : undefined
  };
  
  const result = calculatePhysicalScore(measurements);
  return result.score;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const BodyCompositionScoring = {
  calculateNavyBodyFat,
  estimateBodyFatFromBMI,
  calculateBodyComposition,
  calculatePhysicalScore,
  calculatePhysicalScoreFromOnboarding,
  BODY_FAT_CATEGORIES_MALE,
  BODY_FAT_CATEGORIES_FEMALE
};

export default BodyCompositionScoring;
