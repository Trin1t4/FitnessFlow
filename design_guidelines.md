# Design Guidelines: TrainSmart Fitness App

## Design Approach

**Hybrid Strategy**: Reference-based design inspired by leading fitness apps (Strava, Nike Training Club, Strong) for emotional engagement and motivation, combined with Material Design System principles for data-dense workout tracking interfaces.

### Design Philosophy
- **Motivational Energy**: Bold, energetic visual language that inspires action
- **Data Clarity**: Clean, scannable layouts for workout data and progress metrics
- **Performance First**: Fast, responsive UI optimized for in-workout usage
- **Premium Feel**: Polished aesthetic that justifies subscription value

---

## Core Design Elements

### A. Color Palette

**Primary Brand Colors**
- **Primary Energy**: 160 85% 45% (Energetic emerald/teal - represents growth, vitality)
- **Primary Dark**: 160 85% 35% (Darker variant for depth)
- **Background Dark**: 220 15% 10% (Deep charcoal for main backgrounds)
- **Surface Dark**: 220 12% 16% (Elevated surfaces, cards)

**Accent & Supporting**
- **Accent Flame**: 15 90% 55% (Coral/orange for CTAs, premium badges - use sparingly)
- **Success**: 145 65% 50% (Progress indicators, completed workouts)
- **Warning**: 35 90% 60% (Rest timers, caution states)
- **Info**: 210 80% 55% (Informational elements)

**Semantic Colors**
- **Text Primary**: 0 0% 95% (Main text on dark)
- **Text Secondary**: 0 0% 65% (Supporting text)
- **Text Muted**: 0 0% 45% (Labels, metadata)
- **Borders**: 220 12% 25% (Subtle dividers)

### B. Typography

**Font Stack**
- **Primary**: Inter (via Google Fonts) - Clean, highly legible for data
- **Display**: Archivo Black (via Google Fonts) - Bold headlines, hero sections
- **Monospace**: JetBrains Mono - Workout timers, rep counts

**Type Scale**
- **Hero Display**: 4xl-6xl, weight-900, tight tracking (landing page heroes)
- **Section Headers**: 2xl-3xl, weight-700 (dashboard sections)
- **Card Titles**: xl, weight-600 (exercise names, workout cards)
- **Body Text**: base, weight-400 (descriptions, instructions)
- **Metadata**: sm, weight-500 (reps, sets, weight values)
- **Micro Copy**: xs, weight-400 (labels, helper text)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Micro spacing: `gap-2`, `p-2` (tight elements)
- Standard spacing: `gap-4`, `p-4`, `m-4` (cards, buttons)
- Section spacing: `gap-6`, `py-6` (card sections)
- Major spacing: `gap-8`, `py-8` (between major sections)
- Page spacing: `py-12`, `py-16` (desktop page sections)

**Grid Patterns**
- Landing page: 12-column responsive grid
- Dashboard: 4-column on desktop → 2-column tablet → 1-column mobile
- Workout tracker: Full-width single column for focus

**Container Strategy**
- Landing sections: `max-w-7xl mx-auto px-4`
- App content: `max-w-6xl mx-auto px-4`
- Workout tracker: `max-w-2xl mx-auto px-4` (narrower for focus)

### D. Component Library

**Navigation**
- Top bar: Fixed with blur backdrop, logo left, auth/profile right
- Dashboard tabs: Pill-style navigation with active state indicator
- Mobile: Bottom navigation bar for core actions (Dashboard, Workout, Progress, Profile)

**Cards & Containers**
- Workout cards: Rounded-xl, subtle border, hover elevation on desktop
- Exercise rows: Clean horizontal layout with exercise name, sets×reps, weight, rest timer
- Stats cards: Compact with large numbers, icons, and micro trends

**Forms & Inputs**
- Input fields: Dark background with subtle border, focus state with primary color ring
- Buttons Primary: Gradient from primary to primary-dark, white text, rounded-lg
- Buttons Secondary: Outlined with primary color, transparent background
- Toggle switches: For premium features, tracking preferences

**Data Display**
- Progress charts: Minimal line/bar charts with primary color gradient fills
- Rep counters: Large, tappable buttons with clear visual feedback
- Timer displays: Monospace font, countdown with color transitions (info → warning → success)

**Modals & Overlays**
- Payment modal: Centered card with subtle backdrop blur
- Workout complete: Full-screen celebration with stats summary
- Exercise detail: Slide-up panel with technique tips and form cues

**Premium Indicators**
- Lock icons on premium features with accent flame color
- "Premium" badge with gradient background on locked content
- Upgrade CTA: Prominent placement with flame accent color

### E. Animations

**Core Principles**: Minimal and purposeful - avoid distracting from workout focus

**Essential Only**
- Button press: Subtle scale-down (0.98) on active state
- Card hover: Gentle elevation lift (shadow transition)
- Tab switching: Fast fade transition (150ms)
- Timer countdown: Color pulse at final 3 seconds
- Workout complete: Confetti burst or success checkmark animation (one-time celebration)

**Avoid**: Continuous animations, carousel auto-play, loading spinners (use skeleton screens instead)

---

## Page-Specific Guidelines

### Landing/Marketing Page

**Hero Section** (80vh min-height)
- **Layout**: Split screen - left 60% content, right 40% hero image
- **Content**: Bold display headline "Allenati con Intelligenza" (or similar), value proposition, dual CTAs (Start Free Trial + Learn More)
- **Hero Image**: Athletic figure in action shot (deadlift, squat, or training scene) with subtle gradient overlay
- **Background**: Gradient from background-dark to surface-dark with subtle noise texture

**Features Section** (3-column grid on desktop)
- Icons: Use Heroicons for feature icons (lightning, chart-bar, shield-check, etc.)
- Cards: Hover elevation, icon at top, concise benefit copy
- Features to highlight: AI-powered programs, Progress tracking, Form check quiz, Premium coaching

**Pricing/CTA Section**
- Two-tier comparison: Free vs Premium (side-by-side cards)
- Premium card: Flame accent border, feature checklist with checkmarks
- Prominent PayPal and credit card badges for trust

**Social Proof** (if applicable)
- User testimonials with before/after stats (not photos - just numbers)
- "Join 500+ athletes training smarter" with subtle counter animation

### Dashboard/App Interface

**Layout**: Sidebar navigation (desktop) with main content area
- Sidebar: Fixed left, dark surface, icon + label navigation items
- Main content: Scrollable with generous padding, card-based layout

**Workout Tracking View**
- Fixed header: Exercise name, current set/rep, progress bar
- Exercise list: Scrollable, each row showing weight, reps completed, rest timer
- Bottom bar: Next exercise preview, complete workout button

**Progress Dashboard**
- Top metrics: 4-stat cards (workouts completed, total volume, PRs, streak)
- Chart section: Weekly volume or strength progression (simple line chart)
- Recent workouts: Chronological list with completion badges

---

## Images Section

**Hero Image** (Landing page)
- Placement: Right side of hero section (40% width on desktop)
- Style: High-energy training photo, natural lighting, authentic athlete (not stock-looking)
- Treatment: Subtle gradient overlay (primary color at 10% opacity) blending into background

**Optional Feature Images**
- Small spot illustrations for empty states (no workouts yet, no data)
- Icon-based graphics for quiz/assessment screens (avoid photo overload)

**Do Not Use**: Generic stock fitness photos with fake smiles or overly edited bodies

---

## Accessibility & Dark Mode

**Primary Theme**: Dark mode throughout (not a toggle)
- All text meets WCAG AA contrast (4.5:1 for body, 3:1 for large text)
- Form inputs: High contrast borders and labels
- Interactive elements: Clear focus indicators with primary color ring

**Touch Targets**: Minimum 44×44px for all tappable elements (critical for workout tracking)

---

## Technical Implementation Notes

**Icons**: Heroicons via CDN (outline style for navigation, solid for status indicators)

**Fonts**: Google Fonts CDN
```
Inter (weights: 400, 500, 600, 700)
Archivo Black (weight: 900)
JetBrains Mono (weight: 500)
```

**Performance**: 
- Lazy load images below fold
- Skeleton screens for loading states
- Optimistic UI updates for workout logging