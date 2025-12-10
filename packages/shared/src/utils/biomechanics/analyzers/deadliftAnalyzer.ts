/**
 * Deadlift Analyzer
 * Analisi biomeccanica per Stacco Convenzionale e Sumo
 * Basato sui principi DCSS di Paolo Evangelista
 */

import type {
  PoseLandmarks,
  FrameAnalysis,
  Issue,
  Morphotype,
  StickingPointAnalysis,
  SafetyCheck,
  EfficiencyCheck
} from '../../../types/biomechanics.types';

import {
  calculateAngle,
  getKneeAngle,
  getHipAngle,
  getTorsoAngle,
  midpoint,
  distance2D,
  angleFromVertical,
  isSpineNeutral
} from '../core';

// ============================================
// RANGE DI SICUREZZA STACCO
// ============================================

export const DEADLIFT_SAFE_RANGES = {
  // Setup
  hipStart: { conventional: { min: 70, max: 110 }, sumo: { min: 60, max: 100 } },
  kneeStart: { conventional: { min: 100, max: 140 }, sumo: { min: 90, max: 130 } },

  // Durante il movimento
  lumbarFlexion: { max: 15 },  // Mai arrotondare
  shoulderPosition: 'above_or_forward', // Mai dietro la barra
  barDistance: { max: 5 } // cm dalla tibia
};

// ============================================
// SAFETY CHECKS
// ============================================

export const DEADLIFT_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'LOWER_BACK_ROUND',
    severity: 'HIGH',
    description: 'Schiena che si arrotonda (perdita lordosi lombare)',
    correction: 'Setup con petto alto, "mostra il logo della maglietta". Se persiste, riduci il carico.',
    check: (frame) => {
      const lumbar = frame.angles.lumbar || 0;
      return lumbar > 15 || frame.spineNeutral === false;
    }
  },
  {
    code: 'BAR_DRIFT_FORWARD',
    severity: 'MEDIUM',
    description: 'Bilanciere si allontana dal corpo',
    correction: 'Trascina il bilanciere sulle tibie e cosce. Deve restare attaccato al corpo.',
    check: (frame) => {
      const barPath = frame.barPath;
      if (!barPath) return false;
      return barPath.deviationFromVertical > 5; // cm
    }
  },
  {
    code: 'SHOULDERS_BEHIND_BAR',
    severity: 'HIGH',
    description: 'Spalle dietro la barra nel setup - inefficiente e pericoloso',
    correction: 'Nel setup, le spalle devono essere sopra o leggermente davanti alla barra.',
    check: (frame) => {
      // Le spalle sono troppo indietro se il torso è troppo verticale con ginocchia flesse
      if (frame.phase !== 'SETUP') return false;
      const torso = frame.angles.torso || 0;
      const knee = frame.angles.knee || 180;
      return torso < 30 && knee < 130; // Troppo verticale con ginocchia flesse
    }
  },
  {
    code: 'HYPEREXTENSION_LOCKOUT',
    severity: 'MEDIUM',
    description: 'Iperestensione lombare in chiusura',
    correction: 'Chiudi stringendo i glutei, non spingendo le anche avanti. "Tall posture".',
    check: (frame) => {
      if (frame.phase !== 'LOCKOUT') return false;
      const hip = frame.angles.hip || 180;
      // Se l'anca va oltre 180° (iperestensione)
      return hip > 185;
    }
  },
  {
    code: 'NECK_HYPEREXTENSION',
    severity: 'LOW',
    description: 'Collo iperesteso (guardare troppo in alto)',
    correction: 'Sguardo a 3-4 metri davanti a te, collo neutro in linea con la spine.',
    check: (frame) => {
      const neck = frame.angles.neck || 0;
      return neck > 30;
    }
  }
];

// ============================================
// EFFICIENCY CHECKS
// ============================================

export const DEADLIFT_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'HIPS_TOO_LOW',
    description: 'Setup con anche troppo basse - stai "squattando" lo stacco',
    correction: 'Le anche devono essere più alte delle ginocchia nel setup. Pensa "hip hinge", non squat.',
    check: (frames, morphotype) => {
      const setupFrame = frames.find(f => f.phase === 'SETUP');
      if (!setupFrame) return false;

      const hipAngle = setupFrame.angles.hip || 180;

      // Con braccia lunghe, le anche possono essere più alte
      const threshold = morphotype?.armToTorso && morphotype.armToTorso > 1.1 ? 70 : 60;
      return hipAngle < threshold;
    }
  },
  {
    code: 'HIPS_TOO_HIGH',
    description: 'Setup con anche troppo alte - stiff leg deadlift involontario',
    correction: 'Abbassa le anche fino a sentire tensione nei femorali. Le ginocchia devono essere flesse.',
    check: (frames) => {
      const setupFrame = frames.find(f => f.phase === 'SETUP');
      if (!setupFrame) return false;

      const kneeAngle = setupFrame.angles.knee || 180;
      return kneeAngle > 160; // Gambe quasi dritte
    }
  },
  {
    code: 'HIPS_RISE_FIRST',
    description: 'Le anche salgono prima delle spalle - perdita di leverage',
    correction: 'Mantieni l\'angolo del torso costante all\'inizio. Spalle e anche salgono insieme.',
    check: (frames) => {
      const startFrames = frames.filter(f =>
        f.phase === 'CONCENTRIC' && (f.angles.knee || 180) > 130
      );

      if (startFrames.length < 2) return false;

      // Se il torso si inclina di più mentre si sale dal pavimento
      const firstTorso = startFrames[0].angles.torso || 0;
      const secondTorso = startFrames[Math.min(1, startFrames.length - 1)].angles.torso || 0;

      return secondTorso > firstTorso + 10;
    }
  },
  {
    code: 'ARMS_BENT',
    severity: 'MEDIUM',
    description: 'Braccia flesse durante il pull - bicipiti a rischio',
    correction: 'Braccia sempre dritte come ganci. Pensa "braccia di corda".',
    check: (frames) => {
      return frames.some(f => {
        const elbow = f.angles.elbow || 180;
        return elbow < 160;
      });
    }
  },
  {
    code: 'INCOMPLETE_LOCKOUT',
    description: 'Lockout incompleto - anche e ginocchia non estese',
    correction: 'Estendi completamente anche e ginocchia. Stringi i glutei in cima.',
    check: (frames) => {
      const lockoutFrame = frames.find(f => f.phase === 'LOCKOUT');
      if (!lockoutFrame) return false;

      const knee = lockoutFrame.angles.knee || 180;
      const hip = lockoutFrame.angles.hip || 180;

      return knee < 170 || hip < 175;
    }
  },
  {
    code: 'BAR_AROUND_KNEES',
    description: 'Bilanciere che gira intorno alle ginocchia invece di salire dritto',
    correction: 'Le ginocchia devono togliersi di mezzo. "Spingi il pavimento" invece di "tirare la barra".',
    check: (frames) => {
      // Cerca pattern di deviazione orizzontale nel bar path
      const barPaths = frames.filter(f => f.barPath).map(f => f.barPath!);
      if (barPaths.length < 5) return false;

      // Verifica se c'è una curva significativa
      const xPositions = barPaths.map(bp => bp.x);
      const maxDeviation = Math.max(...xPositions) - Math.min(...xPositions);

      return maxDeviation > 0.08; // 8% della larghezza frame
    }
  }
];

// ============================================
// ANALISI FRAME STACCO
// ============================================

export function analyzeDeadliftFrame(
  landmarks: PoseLandmarks,
  frameNumber: number,
  timestamp: number,
  phase: string,
  style: 'conventional' | 'sumo',
  morphotype?: Morphotype
): FrameAnalysis {
  // Calcola angoli
  const kneeAngleLeft = getKneeAngle(landmarks, 'left');
  const kneeAngleRight = getKneeAngle(landmarks, 'right');
  const kneeAngle = (kneeAngleLeft + kneeAngleRight) / 2;

  const hipAngleLeft = getHipAngle(landmarks, 'left');
  const hipAngleRight = getHipAngle(landmarks, 'right');
  const hipAngle = (hipAngleLeft + hipAngleRight) / 2;

  const torsoAngle = getTorsoAngle(landmarks);

  // Angolo gomito (per verificare braccia dritte)
  const elbowAngle = calculateAngle(
    landmarks.left_shoulder,
    landmarks.left_elbow,
    landmarks.left_wrist
  );

  // Stati
  const spineNeutral = isSpineNeutral(landmarks);

  // Bar path (stima dalla posizione dei polsi)
  const wristMid = midpoint(landmarks.left_wrist, landmarks.right_wrist);
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);

  const issues: Issue[] = [];

  const frameAnalysis: FrameAnalysis = {
    frameNumber,
    timestamp,
    phase: phase as any,
    angles: {
      knee: kneeAngle,
      hip: hipAngle,
      torso: torsoAngle,
      elbow: elbowAngle
    },
    barPath: {
      x: wristMid.x,
      y: wristMid.y,
      deviationFromVertical: Math.abs(wristMid.x - shoulderMid.x) * 100
    },
    spineNeutral,
    issues
  };

  // Esegui safety checks
  for (const check of DEADLIFT_SAFETY_CHECKS) {
    if (check.check(frameAnalysis, morphotype)) {
      issues.push({
        type: 'SAFETY',
        code: check.code,
        severity: check.severity,
        timestamp,
        frameNumber,
        description: check.description,
        correction: check.correction
      });
    }
  }

  return frameAnalysis;
}

// ============================================
// STICKING POINT ANALYSIS
// ============================================

export function analyzeDeadliftStickingPoint(
  frames: FrameAnalysis[],
  style: 'conventional' | 'sumo'
): StickingPointAnalysis {
  const concentricFrames = frames.filter(f =>
    f.phase === 'CONCENTRIC' || f.phase === 'MID_RANGE'
  );

  if (concentricFrames.length < 3) {
    return { detected: false };
  }

  // Trova il frame più lento
  let minVelocityFrame: FrameAnalysis | null = null;
  let minVelocity = Infinity;

  for (const frame of concentricFrames) {
    if (frame.velocity !== undefined && frame.velocity < minVelocity && frame.velocity > 0) {
      minVelocity = frame.velocity;
      minVelocityFrame = frame;
    }
  }

  if (!minVelocityFrame) {
    return { detected: false };
  }

  const kneeAngle = minVelocityFrame.angles.knee || 180;
  const hipAngle = minVelocityFrame.angles.hip || 180;

  // Sticking off the floor (ginocchio ancora flesso)
  if (kneeAngle < 140) {
    return {
      detected: true,
      position: 'BOTTOM',
      angleAtSticking: kneeAngle,
      diagnosis: {
        muscular: ['Quadricipiti deboli', 'Deficit nel drive iniziale'],
        technical: ['Setup non ottimale', 'Anche troppo basse', 'Barra troppo lontana']
      },
      recommendations: {
        accessories: ['Deficit deadlift (2-4")', 'Pause deadlift al ginocchio', 'Front squat'],
        cues: ['Spingi il pavimento via', 'Petto alto dal primo centimetro', 'Braccia dritte']
      }
    };
  }

  // Sticking at/around knees
  if (kneeAngle >= 140 && hipAngle < 150) {
    return {
      detected: true,
      position: 'MID_RANGE',
      angleAtSticking: hipAngle,
      diagnosis: {
        muscular: ['Glutei deboli', 'Estensori anca carenti', 'Femorali deboli'],
        technical: ['Barra che si allontana', 'Ginocchia nel percorso', 'Torso che cede']
      },
      recommendations: {
        accessories: ['Block pull (sotto ginocchio)', 'Romanian deadlift', 'Hip thrust', 'Good morning'],
        cues: ['Stringi i glutei passando le ginocchia', 'Tieni la barra attaccata', 'Spingi le anche avanti']
      }
    };
  }

  // Sticking in lockout
  return {
    detected: true,
    position: 'LOCKOUT',
    angleAtSticking: hipAngle,
    diagnosis: {
      muscular: ['Glutei deboli in accorciamento', 'Erettori spinali affaticati'],
      technical: ['Perdita di posizione', 'Iperestensione per compensare']
    },
    recommendations: {
      accessories: ['Block pull (sopra ginocchio)', 'Barbell hip thrust', 'Rack pull'],
      cues: ['Stringi i glutei come a schiacciare una noce', 'Non iperestendere, solo "tall posture"']
    }
  };
}

// ============================================
// PUNTI DI FORZA
// ============================================

export function identifyDeadliftStrengths(frames: FrameAnalysis[]): string[] {
  const strengths: string[] = [];

  // Verifica spine neutrale
  const spineIssues = frames.filter(f => f.spineNeutral === false);
  if (spineIssues.length === 0) {
    strengths.push('Spine neutrale mantenuta durante tutto il movimento');
  }

  // Verifica bar path
  const barPathIssues = frames.filter(f =>
    f.barPath && f.barPath.deviationFromVertical > 5
  );
  if (barPathIssues.length === 0) {
    strengths.push('Ottimo percorso barra - verticale e vicino al corpo');
  }

  // Verifica lockout
  const lockoutFrame = frames.find(f => f.phase === 'LOCKOUT');
  if (lockoutFrame) {
    const hip = lockoutFrame.angles.hip || 0;
    const knee = lockoutFrame.angles.knee || 0;
    if (hip >= 175 && knee >= 170) {
      strengths.push('Lockout completo e controllato');
    }
  }

  // Verifica braccia dritte
  const bentArmFrames = frames.filter(f => (f.angles.elbow || 180) < 165);
  if (bentArmFrames.length === 0) {
    strengths.push('Braccia dritte durante tutto il pull');
  }

  // Verifica setup
  const setupFrame = frames.find(f => f.phase === 'SETUP');
  if (setupFrame) {
    const setupTorso = setupFrame.angles.torso || 0;
    if (setupTorso >= 40 && setupTorso <= 60) {
      strengths.push('Setup con buon angolo del torso');
    }
  }

  return strengths;
}

// ============================================
// RACCOMANDAZIONI
// ============================================

export function generateDeadliftRecommendations(
  issues: Issue[],
  style: 'conventional' | 'sumo',
  morphotype?: Morphotype
): { immediate: string[]; accessories: string[]; mobility: string[] } {
  const immediate: string[] = [];
  const accessories: string[] = [];
  const mobility: string[] = [];

  for (const issue of issues) {
    switch (issue.code) {
      case 'LOWER_BACK_ROUND':
        immediate.push('Riduci il carico e focalizzati sul setup');
        immediate.push('"Petto fuori, mostra il logo della maglietta"');
        accessories.push('Good morning leggero 3x12', 'Back extension 3x15');
        mobility.push('Cat-cow stretch', 'Jefferson curl leggero');
        break;

      case 'BAR_DRIFT_FORWARD':
        immediate.push('Inizia con la barra a contatto con le tibie');
        immediate.push('Tira "verso di te" mentre sollevi');
        accessories.push('Paused deadlift (pausa al ginocchio)');
        break;

      case 'HIPS_TOO_LOW':
        immediate.push('Solleva le anche fino a sentire tensione nei femorali');
        immediate.push('Non è uno squat, è un hip hinge');
        break;

      case 'HIPS_RISE_FIRST':
        immediate.push('Mantieni il petto alto dal primo centimetro');
        immediate.push('Spalle e anche salgono insieme');
        accessories.push('Paused deadlift (pausa a 2" dal pavimento)');
        break;

      case 'ARMS_BENT':
        immediate.push('Pensa alle braccia come corde - solo ganci');
        immediate.push('Rilassa le braccia prima di tirare');
        break;

      case 'HYPEREXTENSION_LOCKOUT':
        immediate.push('In cima: glutei stretti, non spingere le anche avanti');
        immediate.push('Pensa "tall posture", non "lean back"');
        break;
    }
  }

  // Raccomandazioni per morfotipo
  if (morphotype?.type === 'LONG_ARMS') {
    immediate.push('Con braccia lunghe puoi tenere le anche più alte - sfruttalo');
  }

  if (morphotype?.type === 'LONG_FEMUR' && style === 'conventional') {
    immediate.push('Con femori lunghi considera lo stile sumo');
  }

  return {
    immediate: [...new Set(immediate)].slice(0, 4),
    accessories: [...new Set(accessories)].slice(0, 4),
    mobility: [...new Set(mobility)].slice(0, 2)
  };
}

// ============================================
// FULL DEADLIFT ANALYSIS
// ============================================

export function analyzeFullDeadlift(
  allFrames: FrameAnalysis[],
  style: 'conventional' | 'sumo',
  morphotype?: Morphotype
): {
  issues: Issue[];
  strengths: string[];
  stickingPoint: StickingPointAnalysis;
  recommendations: { immediate: string[]; accessories: string[]; mobility: string[] };
  overallScore: number;
} {
  // Raccogli tutti gli issues
  const allIssues: Issue[] = [];

  for (const frame of allFrames) {
    allIssues.push(...frame.issues);
  }

  // Esegui efficiency checks
  for (const check of DEADLIFT_EFFICIENCY_CHECKS) {
    if (check.check(allFrames, morphotype)) {
      allIssues.push({
        type: 'EFFICIENCY',
        code: check.code,
        severity: check.severity || 'MEDIUM',
        description: check.description,
        correction: check.correction
      });
    }
  }

  // Ordina e deduplicati
  const uniqueIssues = removeDuplicateIssues(allIssues);
  const sortedIssues = sortIssuesByPriority(uniqueIssues);
  // Max 2 correzioni alla volta per non sovraccaricare l'utente
  const topIssues = sortedIssues.slice(0, 2);

  // Punti di forza
  const strengths = identifyDeadliftStrengths(allFrames);

  // Sticking point
  const stickingPoint = analyzeDeadliftStickingPoint(allFrames, style);

  // Raccomandazioni
  const recommendations = generateDeadliftRecommendations(topIssues, style, morphotype);

  if (stickingPoint.detected && stickingPoint.recommendations) {
    recommendations.accessories.push(...stickingPoint.recommendations.accessories);
    recommendations.immediate.push(...stickingPoint.recommendations.cues);
  }

  // Score
  const overallScore = calculateDeadliftScore(topIssues, strengths);

  return {
    issues: topIssues,
    strengths,
    stickingPoint,
    recommendations: {
      immediate: [...new Set(recommendations.immediate)].slice(0, 3),
      accessories: [...new Set(recommendations.accessories)].slice(0, 4),
      mobility: [...new Set(recommendations.mobility)].slice(0, 2)
    },
    overallScore
  };
}

// ============================================
// UTILITY
// ============================================

function removeDuplicateIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  return issues.filter(issue => {
    if (seen.has(issue.code)) return false;
    seen.add(issue.code);
    return true;
  });
}

function sortIssuesByPriority(issues: Issue[]): Issue[] {
  const priorityOrder = { SAFETY: 0, EFFICIENCY: 1, OPTIMIZATION: 2 };
  const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

  return issues.sort((a, b) => {
    const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type];
    if (priorityDiff !== 0) return priorityDiff;
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function calculateDeadliftScore(issues: Issue[], strengths: string[]): number {
  let score = 10;

  for (const issue of issues) {
    if (issue.type === 'SAFETY') {
      score -= issue.severity === 'HIGH' ? 2.5 : issue.severity === 'MEDIUM' ? 1.5 : 1;
    } else if (issue.type === 'EFFICIENCY') {
      score -= issue.severity === 'HIGH' ? 1.5 : issue.severity === 'MEDIUM' ? 1 : 0.5;
    } else {
      score -= 0.5;
    }
  }

  score += Math.min(strengths.length * 0.3, 1);

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}
