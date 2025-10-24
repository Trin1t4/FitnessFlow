// Pricing utilities for TrainSmart

export type SubscriptionTier = 'base' | 'premium' | 'elite';

export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  basePrice: number; // Prezzo iniziale
  increasedPrice: number; // Prezzo dopo 6 mesi
  features: string[];
  lockedFeatures?: string[];
  description: string;
  stripePriceId?: string; // Da configurare in Stripe
}

// Prezzi base (primi 6 mesi)
export const BASE_PRICES = {
  base: 19.90,
  premium: 29.90,
  elite: 39.90,
} as const;

// Prezzi aumentati (dopo 6 mesi)
export const INCREASED_PRICES = {
  base: 29.90,
  premium: 39.90,
  elite: 49.90,
} as const;

// Calcola il prezzo attuale in base alla data di inizio abbonamento
export function getCurrentPrice(
  tier: SubscriptionTier, 
  subscriptionStartDate: Date | null
): number {
  if (!subscriptionStartDate) {
    return BASE_PRICES[tier];
  }

  const monthsSinceStart = getMonthsSinceStart(subscriptionStartDate);
  
  // Dopo 6 mesi, prezzo aumentato
  if (monthsSinceStart >= 6) {
    return INCREASED_PRICES[tier];
  }
  
  return BASE_PRICES[tier];
}

// Aggiunge N mesi a una data, gestendo correttamente overflow giorni
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getDate();
  
  // Imposta giorno a 1 per evitare overflow
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  
  // Trova ultimo giorno valido del mese target
  const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  
  // Usa il giorno originale o l'ultimo giorno del mese (il minore)
  result.setDate(Math.min(originalDay, lastDayOfMonth));
  
  return result;
}

// Verifica se sono passati almeno 6 mesi dalla data di inizio
function getMonthsSinceStart(startDate: Date): number {
  const now = new Date();
  const sixMonthsLater = addMonths(new Date(startDate), 6);
  
  // Se ora >= data + 6 mesi, ritorna 6+, altrimenti meno di 6
  return now >= sixMonthsLater ? 6 : 0;
}

// Verifica se l'utente può usare la correzione AI video
export function canUseAiCorrection(
  tier: SubscriptionTier,
  lastAiCorrectionDate: Date | null,
  aiCorrectionsUsed: number
): boolean {
  // Elite: illimitato
  if (tier === 'elite') {
    return true;
  }

  // Premium: 1/settimana
  if (tier === 'premium') {
    // Se non ha mai usato la correzione, può usarla
    if (!lastAiCorrectionDate) {
      return true;
    }

    // Verifica se è passata almeno una settimana dall'ultima correzione
    const daysSinceLastCorrection = getDaysSince(lastAiCorrectionDate);
    return daysSinceLastCorrection >= 7;
  }

  // Base: no access
  return false;
}

// Calcola i giorni trascorsi da una data
function getDaysSince(date: Date): number {
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now.getTime() - past.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Configurazione dei piani
export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'base',
    name: 'Base',
    basePrice: BASE_PRICES.base,
    increasedPrice: INCREASED_PRICES.base,
    description: 'Tutto ciò che serve per iniziare',
    features: [
      'Screening iniziale completo',
      'Quiz tecnico sugli esercizi',
      'Programmi di allenamento personalizzati',
      'Targeting obiettivi specifici (toning/massa)',
      'Tracciamento workout completo',
      'Gestione zone doloranti',
      'Adattamento automatico carichi',
      'Storico progressi',
    ],
    lockedFeatures: [
      'Supporto prioritario (Elite)',
      'Accesso anticipato nuove funzionalità (Elite)',
    ],
  },
  {
    tier: 'premium',
    name: 'Premium',
    basePrice: BASE_PRICES.premium,
    increasedPrice: INCREASED_PRICES.premium,
    description: 'Tutto quello che serve per eccellere',
    features: [
      'Tutto del piano Base',
      'Analisi approfondita progressi',
      'Suggerimenti avanzati allenamento',
      'Report settimanali personalizzati',
    ],
    lockedFeatures: [
      'Supporto prioritario 24/7 (Elite)',
      'Accesso anticipato funzionalità (Elite)',
    ],
  },
  {
    tier: 'elite',
    name: 'Elite',
    basePrice: BASE_PRICES.elite,
    increasedPrice: INCREASED_PRICES.elite,
    description: 'Il massimo livello di personalizzazione',
    features: [
      'Tutto del piano Premium',
      'Supporto prioritario 24/7',
      'Accesso anticipato nuove funzionalità',
      'Consultazioni mensili personalizzate',
      'Report analitici avanzati',
    ],
    lockedFeatures: [],
  },
];

// Helper per ottenere il piano dall'abbonamento tier
export function getPlan(tier: SubscriptionTier): PricingPlan {
  return PRICING_PLANS.find(p => p.tier === tier) || PRICING_PLANS[0];
}

// Verifica se un tier ha accesso a una feature
export function hasFeatureAccess(userTier: SubscriptionTier, featureTier: SubscriptionTier): boolean {
  const tierOrder: SubscriptionTier[] = ['base', 'premium', 'elite'];
  const userIndex = tierOrder.indexOf(userTier);
  const featureIndex = tierOrder.indexOf(featureTier);
  
  return userIndex >= featureIndex;
}
