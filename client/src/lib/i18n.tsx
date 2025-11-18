import { createContext, useContext, useState } from "react";

type Language = "it" | "en" | "fr" | "es";

interface Translations {
  [key: string]: {
    it: string;
    en: string;
    fr: string;
    es: string;
  };
}

const translations: Translations = {
  // Navigation & Common
  "nav.home": { it: "Home", en: "Home", fr: "Accueil", es: "Inicio" },
  "nav.program": { it: "Programma", en: "Program", fr: "Programme", es: "Programa" },
  "nav.progress": { it: "Progressi", en: "Progress", fr: "Progrès", es: "Progreso" },
  "nav.pricing": { it: "Prezzi", en: "Pricing", fr: "Tarifs", es: "Precios" },
  "common.loading": { it: "Caricamento...", en: "Loading...", fr: "Chargement...", es: "Cargando..." },
  "common.save": { it: "Salva", en: "Save", fr: "Enregistrer", es: "Guardar" },
  "common.cancel": { it: "Annulla", en: "Cancel", fr: "Annuler", es: "Cancelar" },
  "common.continue": { it: "Continua", en: "Continue", fr: "Continuer", es: "Continuar" },
  "common.back": { it: "Indietro", en: "Back", fr: "Retour", es: "Atrás" },
  "common.next": { it: "Avanti", en: "Next", fr: "Suivant", es: "Siguiente" },
  "common.close": { it: "Chiudi", en: "Close", fr: "Fermer", es: "Cerrar" },

  // Workout Tracker
  "workout.complete": { it: "Completa", en: "Complete", fr: "Terminer", es: "Completar" },
  "workout.adapt": { it: "Adatta", en: "Adapt", fr: "Adapter", es: "Adaptar" },
  "workout.exercise": { it: "Esercizio", en: "Exercise", fr: "Exercice", es: "Ejercicio" },
  "workout.rest": { it: "Recupero", en: "Rest", fr: "Repos", es: "Descanso" },
  "workout.skip_rest": { it: "Salta Recupero", en: "Skip Rest", fr: "Passer Repos", es: "Saltar Descanso" },
  "workout.previous": { it: "Precedente", en: "Previous", fr: "Précédent", es: "Anterior" },
  "workout.next": { it: "Successivo", en: "Next", fr: "Suivant", es: "Siguiente" },
  "workout.notes": { it: "Note Workout", en: "Workout Notes", fr: "Notes Entraînement", es: "Notas Entrenamiento" },
  "workout.notes_placeholder": {
    it: "Come ti sei sentito? Difficoltà? Note tecniche...",
    en: "How did you feel? Difficulties? Technical notes...",
    fr: "Comment vous êtes-vous senti? Difficultés? Notes techniques...",
    es: "¿Cómo te sentiste? ¿Dificultades? Notas técnicas..."
  },
  
  // Adapt Location Dialog
  "adapt.title": { it: "Adatta Workout", en: "Adapt Workout", fr: "Adapter Entraînement", es: "Adaptar Entrenamiento" },
  "adapt.subtitle": { it: "Modifica dove farai l'allenamento oggi", en: "Change where you'll train today", fr: "Modifier où vous vous entraînerez aujourd'hui", es: "Cambiar dónde entrenarás hoy" },
  "adapt.location_question": { it: "Dove ti alleni oggi?", en: "Where are you training today?", fr: "Où vous entraînez-vous aujourd'hui?", es: "¿Dónde entrenas hoy?" },
  "adapt.gym": { it: "Palestra", en: "Gym", fr: "Salle de sport", es: "Gimnasio" },
  "adapt.gym_description": { it: "Attrezzatura completa", en: "Full equipment", fr: "Équipement complet", es: "Equipamiento completo" },
  "adapt.home": { it: "Casa", en: "Home", fr: "Maison", es: "Casa" },
  "adapt.home_description": { it: "Con o senza attrezzatura", en: "With or without equipment", fr: "Avec ou sans équipement", es: "Con o sin equipamiento" },
  "adapt.equipment_question": { it: "Che attrezzatura hai a disposizione?", en: "What equipment do you have?", fr: "Quel équipement avez-vous?", es: "¿Qué equipamiento tienes?" },
  "adapt.bodyweight": { it: "Solo Corpo Libero", en: "Bodyweight Only", fr: "Poids du Corps", es: "Solo Peso Corporal" },
  "adapt.bodyweight_description": { it: "Nessuna attrezzatura", en: "No equipment", fr: "Pas d'équipement", es: "Sin equipamiento" },
  "adapt.with_equipment": { it: "Ho Attrezzatura", en: "I Have Equipment", fr: "J'ai de l'Équipement", es: "Tengo Equipamiento" },
  "adapt.with_equipment_description": { it: "Manubri, bande, ecc.", en: "Dumbbells, bands, etc.", fr: "Haltères, bandes, etc.", es: "Mancuernas, bandas, etc." },
  "adapt.select_equipment": { it: "Seleziona cosa hai:", en: "Select what you have:", fr: "Sélectionnez ce que vous avez:", es: "Selecciona lo que tienes:" },
  "adapt.barbell": { it: "Bilanciere", en: "Barbell", fr: "Barre", es: "Barra" },
  "adapt.bands": { it: "Bande Elastiche", en: "Resistance Bands", fr: "Bandes Élastiques", es: "Bandas Elásticas" },
  "adapt.pullup_bar": { it: "Sbarra Trazioni", en: "Pull-up Bar", fr: "Barre de Traction", es: "Barra de Dominadas" },
  "adapt.bench": { it: "Panca", en: "Bench", fr: "Banc", es: "Banco" },
  "adapt.dumbbell_max": { it: "Manubri (kg massimi per mano):", en: "Dumbbells (max kg per hand):", fr: "Haltères (kg max par main):", es: "Mancuernas (kg máx por mano):" },
  "adapt.dumbbell_placeholder": { it: "Es. 20", en: "E.g. 20", fr: "Ex. 20", es: "Ej. 20" },
  "adapt.help_text": {
    it: "AdaptFlow sostituirà automaticamente gli esercizi con varianti adatte all'attrezzatura che hai indicato.",
    en: "AdaptFlow will automatically substitute exercises with variants suitable for your indicated equipment.",
    fr: "AdaptFlow remplacera automatiquement les exercices par des variantes adaptées à votre équipement.",
    es: "AdaptFlow sustituirá automáticamente los ejercicios con variantes adecuadas a tu equipamiento."
  },
  "adapt.confirm": { it: "✓ Adatta Workout", en: "✓ Adapt Workout", fr: "✓ Adapter Entraînement", es: "✓ Adaptar Entrenamiento" },
  "adapt.adapting": { it: "Adattamento...", en: "Adapting...", fr: "Adaptation...", es: "Adaptando..." },

  // Payment Modal
  "payment.title": { it: "Abbonamento", en: "Subscription", fr: "Abonnement", es: "Suscripción" },
  "payment.features": { it: "Cosa ottieni", en: "What you get", fr: "Ce que vous obtenez", es: "Lo que obtienes" },
  "payment.per_month": { it: "/mese", en: "/month", fr: "/mois", es: "/mes" },
  "payment.first_6_months": { it: "Primi 6 mesi", en: "First 6 months", fr: "6 premiers mois", es: "Primeros 6 meses" },
  "payment.then": { it: "poi", en: "then", fr: "puis", es: "luego" },
  "payment.credit_card": { it: "Carta di Credito/Debito", en: "Credit/Debit Card", fr: "Carte Crédit/Débit", es: "Tarjeta Crédito/Débito" },
  "payment.stripe_secure": { it: "Pagamento sicuro con Stripe", en: "Secure payment with Stripe", fr: "Paiement sécurisé avec Stripe", es: "Pago seguro con Stripe" },
  "payment.paypal": { it: "PayPal", en: "PayPal", fr: "PayPal", es: "PayPal" },
  "payment.paypal_fast": { it: "Pagamento rapido e sicuro", en: "Fast and secure payment", fr: "Paiement rapide et sécurisé", es: "Pago rápido y seguro" },
  "payment.proceed": { it: "Procedi al Pagamento", en: "Proceed to Payment", fr: "Procéder au Paiement", es: "Proceder al Pago" },
  "payment.redirecting": { it: "Reindirizzamento...", en: "Redirecting...", fr: "Redirection...", es: "Redirigiendo..." },
  "payment.security_note": {
    it: "🔒 Pagamenti sicuri • Nessun dato salvato sui nostri server",
    en: "🔒 Secure payments • No data saved on our servers",
    fr: "🔒 Paiements sécurisés • Aucune donnée enregistrée",
    es: "🔒 Pagos seguros • Ningún dato guardado"
  },

  // Pricing Plans
  "pricing.base": { it: "Base", en: "Base", fr: "Base", es: "Básico" },
  "pricing.premium": { it: "Premium", en: "Premium", fr: "Premium", es: "Premium" },
  "pricing.elite": { it: "Elite", en: "Elite", fr: "Élite", es: "Élite" },
  "pricing.most_popular": { it: "Più Popolare", en: "Most Popular", fr: "Plus Populaire", es: "Más Popular" },
  "pricing.current_plan": { it: "Piano Attuale", en: "Current Plan", fr: "Plan Actuel", es: "Plan Actual" },
  "pricing.subscribe": { it: "Abbonati", en: "Subscribe", fr: "S'abonner", es: "Suscribirse" },

  // Body Parts / Pain Areas
  "body.knee": { it: "Ginocchia", en: "Knees", fr: "Genoux", es: "Rodillas" },
  "body.shoulder": { it: "Spalle", en: "Shoulders", fr: "Épaules", es: "Hombros" },
  "body.back": { it: "Schiena", en: "Back", fr: "Dos", es: "Espalda" },
  "body.elbow": { it: "Gomiti", en: "Elbows", fr: "Coudes", es: "Codos" },
  "body.wrist": { it: "Polsi", en: "Wrists", fr: "Poignets", es: "Muñecas" },
  "body.ankles": { it: "Caviglie", en: "Ankles", fr: "Chevilles", es: "Tobillos" },

  // Language Selector
  "lang.select": { it: "Lingua", en: "Language", fr: "Langue", es: "Idioma" },
  "lang.it": { it: "Italiano", en: "Italian", fr: "Italien", es: "Italiano" },
  "lang.en": { it: "Inglese", en: "English", fr: "Anglais", es: "Inglés" },
  "lang.fr": { it: "Francese", en: "French", fr: "Français", es: "Francés" },
  "lang.es": { it: "Spagnolo", en: "Spanish", fr: "Espagnol", es: "Español" },
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
    if (saved === "en" || saved === "fr" || saved === "es" || saved === "it") {
      return saved as Language;
    }
    return "it";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("trainsmart_language", lang);
    console.log(`🌍 Language changed to: ${lang}`);
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
