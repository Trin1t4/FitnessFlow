import { createContext, useContext, useState, useEffect } from "react";

type Language = "it" | "en";

interface Translations {
  [key: string]: {
    it: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation & Common
  "nav.home": { it: "Home", en: "Home" },
  "nav.program": { it: "Programma", en: "Program" },
  "nav.progress": { it: "Progressi", en: "Progress" },
  "nav.pricing": { it: "Prezzi", en: "Pricing" },
  "common.loading": { it: "Caricamento...", en: "Loading..." },
  "common.save": { it: "Salva", en: "Save" },
  "common.cancel": { it: "Annulla", en: "Cancel" },
  "common.continue": { it: "Continua", en: "Continue" },
  "common.back": { it: "Indietro", en: "Back" },
  "common.next": { it: "Avanti", en: "Next" },
  "common.close": { it: "Chiudi", en: "Close" },
  
  // Workout Tracker
  "workout.complete": { it: "Completa", en: "Complete" },
  "workout.adapt": { it: "Adatta", en: "Adapt" },
  "workout.exercise": { it: "Esercizio", en: "Exercise" },
  "workout.rest": { it: "Recupero", en: "Rest" },
  "workout.skip_rest": { it: "Salta Recupero", en: "Skip Rest" },
  "workout.previous": { it: "Precedente", en: "Previous" },
  "workout.next": { it: "Successivo", en: "Next" },
  "workout.notes": { it: "Note Workout", en: "Workout Notes" },
  "workout.notes_placeholder": { 
    it: "Come ti sei sentito? Difficoltà? Note tecniche...", 
    en: "How did you feel? Difficulties? Technical notes..." 
  },
  
  // Adapt Location Dialog
  "adapt.title": { it: "Adatta Workout", en: "Adapt Workout" },
  "adapt.subtitle": { it: "Modifica dove farai l'allenamento oggi", en: "Change where you'll train today" },
  "adapt.location_question": { it: "Dove ti alleni oggi?", en: "Where are you training today?" },
  "adapt.gym": { it: "Palestra", en: "Gym" },
  "adapt.gym_description": { it: "Attrezzatura completa", en: "Full equipment" },
  "adapt.home": { it: "Casa", en: "Home" },
  "adapt.home_description": { it: "Con o senza attrezzatura", en: "With or without equipment" },
  "adapt.equipment_question": { it: "Che attrezzatura hai a disposizione?", en: "What equipment do you have?" },
  "adapt.bodyweight": { it: "Solo Corpo Libero", en: "Bodyweight Only" },
  "adapt.bodyweight_description": { it: "Nessuna attrezzatura", en: "No equipment" },
  "adapt.with_equipment": { it: "Ho Attrezzatura", en: "I Have Equipment" },
  "adapt.with_equipment_description": { it: "Manubri, bande, ecc.", en: "Dumbbells, bands, etc." },
  "adapt.select_equipment": { it: "Seleziona cosa hai:", en: "Select what you have:" },
  "adapt.barbell": { it: "Bilanciere", en: "Barbell" },
  "adapt.bands": { it: "Bande Elastiche", en: "Resistance Bands" },
  "adapt.pullup_bar": { it: "Sbarra Trazioni", en: "Pull-up Bar" },
  "adapt.bench": { it: "Panca", en: "Bench" },
  "adapt.dumbbell_max": { it: "Manubri (kg massimi per mano):", en: "Dumbbells (max kg per hand):" },
  "adapt.dumbbell_placeholder": { it: "Es. 20", en: "E.g. 20" },
  "adapt.help_text": { 
    it: "AdaptFlow sostituirà automaticamente gli esercizi con varianti adatte all'attrezzatura che hai indicato.", 
    en: "AdaptFlow will automatically substitute exercises with variants suitable for your indicated equipment." 
  },
  "adapt.confirm": { it: "✓ Adatta Workout", en: "✓ Adapt Workout" },
  "adapt.adapting": { it: "Adattamento...", en: "Adapting..." },
  
  // Payment Modal
  "payment.title": { it: "Abbonamento", en: "Subscription" },
  "payment.features": { it: "Cosa ottieni", en: "What you get" },
  "payment.per_month": { it: "/mese", en: "/month" },
  "payment.first_6_months": { it: "Primi 6 mesi", en: "First 6 months" },
  "payment.then": { it: "poi", en: "then" },
  "payment.credit_card": { it: "Carta di Credito/Debito", en: "Credit/Debit Card" },
  "payment.stripe_secure": { it: "Pagamento sicuro con Stripe", en: "Secure payment with Stripe" },
  "payment.paypal": { it: "PayPal", en: "PayPal" },
  "payment.paypal_fast": { it: "Pagamento rapido e sicuro", en: "Fast and secure payment" },
  "payment.proceed": { it: "Procedi al Pagamento", en: "Proceed to Payment" },
  "payment.redirecting": { it: "Reindirizzamento...", en: "Redirecting..." },
  "payment.security_note": { 
    it: "🔒 Pagamenti sicuri • Nessun dato salvato sui nostri server", 
    en: "🔒 Secure payments • No data saved on our servers" 
  },
  
  // Pricing Plans
  "pricing.base": { it: "Base", en: "Base" },
  "pricing.premium": { it: "Premium", en: "Premium" },
  "pricing.elite": { it: "Elite", en: "Elite" },
  "pricing.most_popular": { it: "Più Popolare", en: "Most Popular" },
  "pricing.current_plan": { it: "Piano Attuale", en: "Current Plan" },
  "pricing.subscribe": { it: "Abbonati", en: "Subscribe" },
  
  // Body Parts / Pain Areas
  "body.knee": { it: "Ginocchia", en: "Knees" },
  "body.shoulder": { it: "Spalle", en: "Shoulders" },
  "body.back": { it: "Schiena", en: "Back" },
  "body.elbow": { it: "Gomiti", en: "Elbows" },
  "body.wrist": { it: "Polsi", en: "Wrists" },
  "body.ankles": { it: "Caviglie", en: "Ankles" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or default to Italian
    const saved = localStorage.getItem("trainsmart_language");
    return (saved === "en" ? "en" : "it") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("trainsmart_language", lang);
    // TODO: Save to database via API when authenticated
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language] || translation.it || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
}
