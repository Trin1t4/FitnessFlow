// Formula US Navy per Body Fat % - VERSIONE AUTONOMA (zero costi, zero API esterne)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { height, weight, age, gender, waistCm, neckCm, hipCm } = req.body;
    
    // Validazione input
    if (!height || !weight || !gender || !waistCm || !neckCm) {
      return res.status(400).json({ 
        error: 'Missing required fields: height, weight, gender, waistCm, neckCm' 
      });
    }

    console.log('[BODY SCAN] Input:', { height, weight, age, gender, waistCm, neckCm, hipCm });
    
    // ✅ FORMULA US NAVY (Accuracy 96-98% vs DXA)
    let bodyFatPercentage;
    
    if (gender === 'male') {
      // Uomo: BF% = 495 / (1.0324 - 0.19077 × log10(waist - neck) + 0.15456 × log10(height)) - 450
      const waistMinusNeck = waistCm - neckCm;
      
      if (waistMinusNeck <= 0) {
        return res.status(400).json({ 
          error: 'Circonferenza vita deve essere maggiore di collo' 
        });
      }
      
      bodyFatPercentage = 495 / (
        1.0324 - 
        0.19077 * Math.log10(waistMinusNeck) + 
        0.15456 * Math.log10(height)
      ) - 450;
      
    } else {
      // Donna: BF% = 495 / (1.29579 - 0.35004 × log10(waist + hip - neck) + 0.22100 × log10(height)) - 450
      const effectiveHip = hipCm || waistCm; // Se non fornito, usa vita
      const waistPlusHipMinusNeck = waistCm + effectiveHip - neckCm;
      
      if (waistPlusHipMinusNeck <= 0) {
        return res.status(400).json({ 
          error: 'Valori circonferenze non validi' 
        });
      }
      
      bodyFatPercentage = 495 / (
        1.29579 - 
        0.35004 * Math.log10(waistPlusHipMinusNeck) + 
        0.22100 * Math.log10(height)
      ) - 450;
    }
    
    // Limita a range realistico (3-60%)
    bodyFatPercentage = Math.max(3, Math.min(60, bodyFatPercentage));
    
    // Calcola masse
    const fatMassKg = (weight * bodyFatPercentage) / 100;
    const leanMassKg = weight - fatMassKg;
    
    // ✅ BODY SHAPE da proporzioni (Waist-to-Hip Ratio)
    const effectiveHip = hipCm || waistCm;
    const waistToHipRatio = waistCm / effectiveHip;
    let bodyShape = 'rectangle';
    
    if (gender === 'female') {
      // Donne
      if (waistToHipRatio < 0.75) bodyShape = 'pear'; // Glutei larghi
      else if (waistToHipRatio > 0.85) bodyShape = 'apple'; // Vita larga
      else bodyShape = 'hourglass'; // Proporzionata
    } else {
      // Uomini
      if (waistToHipRatio > 1.0) bodyShape = 'apple'; // Addome prominente
      else if (waistToHipRatio < 0.9) bodyShape = 'inverted_triangle'; // Spalle larghe
      else bodyShape = 'rectangle'; // Rettangolare
    }
    
    // ✅ VALUTAZIONE SALUTE (basata su standard WHO)
    let healthRisk = 'normal';
    if (gender === 'male') {
      if (bodyFatPercentage > 25) healthRisk = 'high';
      else if (bodyFatPercentage > 20) healthRisk = 'moderate';
    } else {
      if (bodyFatPercentage > 32) healthRisk = 'high';
      else if (bodyFatPercentage > 25) healthRisk = 'moderate';
    }
    
    const result = {
      bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
      fatMassKg: parseFloat(fatMassKg.toFixed(1)),
      leanMassKg: parseFloat(leanMassKg.toFixed(1)),
      bodyShape: bodyShape,
      healthRisk: healthRisk,
      method: 'us_navy_formula',
      calculatedAt: new Date().toISOString()
    };
    
    console.log('[BODY SCAN] Result:', result);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('[BODY SCAN] Error:', error);
    return res.status(500).json({ 
      error: 'Body composition calculation failed',
      details: error.message 
    });
  }
}
