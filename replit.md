# TrainSmart - Intelligent Fitness Training App

## Overview

TrainSmart is a comprehensive fitness application designed to provide personalized workout programs based on scientific principles. It caters to a wide range of users by offering customized training plans tailored to their goals, experience level, available equipment, and even specific conditions like disability or pregnancy. The app aims to make intelligent fitness accessible, tracking progress, managing potential injury areas, and adapting dynamically to user input and progress. Key capabilities include 1RM calculations, adaptive exercise selection, sport-specific training, endurance program integration, and robust progress tracking. The project's ambition is to be a leading platform for science-backed, personalized fitness.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React 18** and **TypeScript**, using **Vite** for tooling, **Wouter** for routing, and **TanStack Query** for server state management. It employs a **dark mode-first design** with **Tailwind CSS** and **shadcn/ui** components, drawing inspiration from leading fitness apps. State management primarily relies on React Query for API data and React hooks for local component state.

### Backend Architecture
The backend is an **Express.js** server with **TypeScript**. It uses **Replit Auth** for authentication, integrated with `express-session` and a PostgreSQL store. The API follows a RESTful design, with protected routes managed by middleware. A core component is the `programGenerator.ts`, which leverages the **Brzycki Formula** for 1RM calculation, dynamically adjusts loads based on pre-workout checks, and implements various progression schemes (Wave, Weekly Undulation, Daily Undulation). It supports complex exercise selection with ADAPTFLOW™ 2.0, allowing for `gym`, `homeWithEquipment`, and `homeBodyweight` variants with intelligent fallback logic, and incorporates specialized safety rules for disability and pregnancy. Endurance and sport-specific training models are also integrated, based on scientific research. Data access is abstracted via an `IStorage` interface, handling CRUD operations for all fitness data.

### Data Storage
The application uses a **PostgreSQL** database, provisioned via Replit, with **Drizzle ORM** for type-safe schema definitions and migration management. Key tables include `users`, `screenings`, `quizResults`, `assessments`, `programs`, `workouts`, `workoutSets`, `personalRecords`, `weeklyProgress`, and `payments`, all designed with appropriate relationships and cascade deletion.

### System Design Choices
- **Personalization**: Dynamic program generation based on user screenings, assessments, and real-time workout feedback (e.g., pain levels, available equipment).
- **Adaptability**: ADAPTFLOW™ 2.0 intelligently selects exercise variants and suggests compensations based on user's location, available equipment, and even insufficient weight. It also includes specific safety adaptations for conditions like pregnancy and disability.
- **Scientific Basis**: Utilizes the Brzycki formula for 1RM, concurrent training models for endurance, and progression schemes tailored to user experience levels.
- **Robustness**: Features like data reset functionality and quiz answer randomization enhance system integrity and user experience.
- **Scalability**: Designed with a clear separation of concerns between frontend, backend, and data layers, using modern frameworks and ORM.

## External Dependencies

- **Authentication**: Replit Auth (Google, GitHub, Email/Password)
- **Database**: Neon Database (via `@neondatabase/serverless` for PostgreSQL)
- **Payment Processing (Planned)**: Stripe (`@stripe/stripe-js`, `@stripe/react-stripe-js`) and PayPal (`@paypal/paypal-server-sdk`)
- **UI Components**: Radix UI Primitives, shadcn/ui, cmdk
- **Charting**: Recharts
- **Fonts**: Google Fonts (Inter, Archivo Black, JetBrains Mono)
- **Icons**: lucide-react
- **Date Utility**: date-fns

## Recent Changes

- **Transparency & Legal Compliance Update (October 2025)**:
  - Created IMPLEMENTATION_STATUS.md with honest code audit (44% live, 12% beta, 44% not implemented)
  - Fixed payment endpoint documentation (frontend/backend mismatch identified)
  - Reclassified pregnancy/disability as BETA (needs medical/physio validation) not "Live"
  - Moved deload cycles to "Coming Soon" (schema exists but no reduced-volume generation)
  - Updated roadmap: pregnancy/disability to Beta, deload/payments/AI to Coming Soon
  - Removed unjustified "ADAPTFLOW 2.0" branding (now just "ADAPTFLOW")
  - Legal disclaimers fully implemented: hasReadPregnancyDisclaimer, hasReadDisabilityDisclaimer with validation enforcement
  - Added "Opzionale" badges to optional screening steps (specific_goals, equipment, injuries)
  - Progressive disclosure partial: badges help but full 5-step core flow not implemented

- **Workout Location Adaptation System (October 2025)**:
  - Added workoutAdaptations table for temporary workout modifications
  - Users can adapt any workout on-the-fly from gym to home (bodyweight or with equipment)
  - POST /api/program/:programId/day/:dayName/adapt endpoint to regenerate exercises
  - AdaptLocationDialog component with equipment selection UI
  - WorkoutTracker integrated with "Adatta" button for mid-session location changes
  - Adaptations expire after 24h or first use to keep data clean
  - Exercise regeneration maintains sets/reps while substituting for available equipment

- **Payment Modal UX Improvement (October 2025)**:
  - Fixed scroll behavior in PaymentModal to ensure checkout button always visible
  - Added max-h-[90vh] and overflow-y-auto for proper scrolling on small screens
  - Improved mobile checkout experience with proper padding

- **Three-Tier Subscription System with Dynamic Pricing (October 2025)**:
  - Implemented 3-tier subscription model: Base (€19.90), Premium (€29.90), Elite (€39.90)
  - Automatic price escalation: +€10 increase after exactly 6 months for all tiers
  - Premium tier: Includes 1 AI form correction per week
  - Elite tier: Unlimited AI form corrections
  - Technical: `addMonths()` with day-clamping prevents overflow (31 Aug → 28 Feb, not 3 Mar)
  - Database: Added subscriptionTier, subscriptionStartDate, subscriptionId, aiCorrectionsUsed, lastAiCorrectionDate to users table
  - UI: Dynamic pricing cards show current price with clear "Primi 6 mesi" messaging
  - Integration: Stripe and PayPal payment methods ready (requires API keys)
  - File: shared/pricingUtils.ts centralizes all pricing logic and feature access control

- **Body Part Targeting for Toning/Ipertrofia (October 2025)**: 
  - Added "Obiettivi Specifici" step in screening for toning and muscle_gain goals
  - Users can select multiple body parts to focus on (chest, arms, shoulders, back_width, back_thickness, legs, glutes, abs, calves)
  - Changed "Petto Alto" (upper_chest) to just "Petto" (chest) with 🛡️ shield emoji
  - Backward compatibility: legacy upper_chest values automatically normalized to chest at runtime
  - Program generator automatically adds targeted isolation exercises based on selections
  - All extra exercises pass through safety filters (pregnancy, disability, pain areas)
  - Deduplication system prevents duplicate exercises in generated programs
  - Technical implementation: BODY_PART_EXERCISES mapping in programGenerator.ts with Set-based deduplication

- **Pregnancy Program Enhancement (October 2025)**:
  - Added pregnancy-specific fields to screenings table: pregnancyWeek (1-40), pregnancyTrimester (1-3), hasDoctorClearance (required), pregnancyComplications (optional array)
  - ScreeningFlow now includes dedicated "Info Gravidanza" step with:
    - Slider for gestational week (auto-calculates trimester)
    - Required medical clearance checkbox
    - Optional pregnancy complications selection (pre-eclampsia, gestational diabetes, placenta previa, etc.)
  - PREGNANCY_SAFE_EXERCISES_BY_TRIMESTER mapping in programGenerator.ts with trimester-specific exercises and modifications
  - Trimester 1: Moderate loads (50-60% 1RM), includes light squats and incline presses
  - Trimester 2: Reduced loads (40-50% 1RM), NO supine exercises, focus on stability
  - Trimester 3: Minimal loads (30-40% 1RM), mobility/breathing priority, preparation for delivery
  - Enhanced safety rules: supine exercises contraindicated post-1st trimester, all exercises filtered by trimester appropriateness
  - CRITICAL FIX: Added pregnancy fields to screeningSchema in routes.ts to prevent Zod from stripping them from requests
  
- **Deload Cycles & End-Cycle Testing (October 2025)**:
  - Added deload management to programs table: includesDeload, deloadFrequency, totalWeeks, requiresEndCycleTest
  - Automatic deload scheduling: intermediate and advanced programs include deload every 4 weeks
  - Program duration varies by goal:
    - Strength: 8 weeks with end-cycle testing
    - Muscle gain (ipertrofia): 12 weeks with end-cycle testing
    - Performance: 8 weeks with end-cycle testing
    - Pregnancy: 4 weeks (short cycles for close monitoring)
    - Disability: 6 weeks (progressive adaptation)
    - General fitness/toning: 4 weeks
  - End-cycle testing flag: requiresEndCycleTest set for strength, muscle_gain, and performance goals
  - Program descriptions now show deload info: "4x/settimana, progressione ondulata (con deload ogni 4 settimane)"
  - Technical: generateProgram() determines deload based on user level, goal-specific durations ensure optimal programming
  
- **Safety System**: Comprehensive safety checks for pregnancy and disability goals with automatic exercise substitution
- **Giant Sets Bug Fix**: System bypasses Giant Sets for pregnancy/disability, using single safe alternatives instead