/**
 * Machine Analyzer
 * Analisi biomeccanica per esercizi alle macchine
 * Leg Press, Cable Row, Lat Machine, Chest Press, ecc.
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
  getElbowAngle,
  getTorsoAngle,
  midpoint,
  isSpineNeutral
} from '../core';

// ============================================
// LEG PRESS
// ============================================

export const LEG_PRESS_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'LUMBAR_FLEXION',
    severity: 'HIGH',
    description: 'Bacino che si solleva dalla seduta (butt wink)',
    correction: 'Non scendere troppo. Fermati prima che il bacino si stacchi dal pad.',
    check: (frame) => frame.spineNeutral === false
  },
  {
    code: 'KNEE_VALGUS',
    severity: 'HIGH',
    description: 'Ginocchia che collassano verso l\'interno',
    correction: 'Spingi le ginocchia in fuori, in linea con le punte dei piedi.',
    check: (frame) => Math.abs(frame.angles.kneeValgus || 0) > 10
  },
  {
    code: 'KNEES_LOCK_HARD',
    severity: 'MEDIUM',
    description: 'Ginocchia completamente bloccate in estensione',
    correction: 'Mantieni un leggero soft lock. Non iperestendere mai le ginocchia.',
    check: (frame) => (frame.angles.knee || 0) > 178
  },
  {
    code: 'HEELS_LIFT',
    severity: 'MEDIUM',
    description: 'Talloni che si sollevano dalla pedana',
    correction: 'Spingi attraverso tutto il piede, talloni sempre a contatto.',
    check: (frame) => frame.heelContact === false
  }
];

export const LEG_PRESS_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'INSUFFICIENT_ROM',
    description: 'ROM insufficiente - ginocchia non flettono abbastanza',
    correction: 'Scendi fino a 90° di flessione del ginocchio (o più se la mobilità lo permette).',
    check: (frames) => {
      const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
      return bottomFrame ? (bottomFrame.angles.knee || 180) > 110 : false;
    }
  },
  {
    code: 'ASYMMETRIC_PUSH',
    description: 'Spinta asimmetrica - un lato lavora più dell\'altro',
    correction: 'Concentrati su una spinta uniforme. Considera leg press unilaterale.',
    check: (frames) => false // Richiede confronto bilaterale
  }
];

// ============================================
// CABLE ROW / SEATED ROW MACHINE
// ============================================

export const CABLE_ROW_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'LUMBAR_FLEXION',
    severity: 'HIGH',
    description: 'Schiena che si arrotonda durante la tirata',
    correction: 'Petto alto, core attivo. Se non riesci, riduci il peso.',
    check: (frame) => frame.spineNeutral === false
  },
  {
    code: 'SHOULDER_PROTRACTION',
    severity: 'MEDIUM',
    description: 'Spalle che vanno troppo avanti nella fase eccentrica',
    correction: 'Controlla la fase negativa. Non lasciare che il peso ti tiri in avanti.',
    check: (frame) => {
      // Torso che si inclina troppo avanti
      return (frame.angles.torso || 0) > 30;
    }
  },
  {
    code: 'CERVICAL_EXTENSION',
    severity: 'LOW',
    description: 'Collo iperesteso',
    correction: 'Sguardo dritto davanti, collo neutro.',
    check: (frame) => (frame.angles.neck || 0) > 25
  }
];

export const CABLE_ROW_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'INCOMPLETE_ROM',
    description: 'ROM incompleto - maniglia non arriva all\'addome',
    correction: 'Tira fino a toccare l\'addome basso. Squeeze delle scapole in cima.',
    check: (frames) => {
      const peakFrame = frames.find(f => f.phase === 'PEAK_CONTRACTION');
      return peakFrame ? !peakFrame.elbowBehindTorso : false;
    }
  },
  {
    code: 'NO_SCAPULAR_RETRACTION',
    description: 'Manca la retrazione scapolare',
    correction: 'Stringi le scapole insieme alla fine del movimento.',
    check: (frames) => false // Difficile da rilevare
  },
  {
    code: 'EXCESSIVE_BODY_ENGLISH',
    description: 'Troppo movimento del torso (cheating)',
    correction: 'Il torso resta fermo. Solo le braccia si muovono.',
    check: (frames) => {
      const torsoAngles = frames.map(f => f.angles.torso || 0);
      const swing = Math.max(...torsoAngles) - Math.min(...torsoAngles);
      return swing > 20;
    }
  }
];

// ============================================
// LAT PULLDOWN MACHINE
// ============================================

export const LAT_PULLDOWN_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'BEHIND_NECK',
    severity: 'HIGH',
    description: 'Tirata dietro il collo',
    correction: 'Tira SEMPRE davanti, al petto. Dietro il collo = rischio spalla.',
    check: (frame) => {
      // Rileva se la barra è dietro la testa
      return false; // Richiede tracking specifico
    }
  },
  {
    code: 'EXCESSIVE_LEAN_BACK',
    severity: 'MEDIUM',
    description: 'Inclinazione eccessiva del torso all\'indietro',
    correction: 'Leggera inclinazione ok (15-20°), ma non trasformarlo in un row.',
    check: (frame) => (frame.angles.torso || 0) > 35
  },
  {
    code: 'SHOULDER_ELEVATION',
    severity: 'MEDIUM',
    description: 'Spalle che salgono verso le orecchie',
    correction: 'Deprimi le scapole. "Spalle in tasca" prima di tirare.',
    check: (frame) => false // Richiede tracking spalle
  }
];

export const LAT_PULLDOWN_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'INCOMPLETE_ROM_TOP',
    description: 'Braccia non completamente estese in alto',
    correction: 'Estendi completamente per massimo stretch dei dorsali.',
    check: (frames) => {
      const topFrame = frames.find(f => f.phase === 'TOP' || f.phase === 'SETUP');
      return topFrame ? (topFrame.angles.elbow || 0) < 170 : false;
    }
  },
  {
    code: 'INCOMPLETE_ROM_BOTTOM',
    description: 'Barra non arriva al petto',
    correction: 'Tira fino al petto alto/clavicola. Squeeze in basso.',
    check: (frames) => {
      const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
      return bottomFrame ? (bottomFrame.angles.elbow || 180) > 100 : false;
    }
  },
  {
    code: 'ARM_DOMINANT',
    description: 'Tiri con le braccia invece che con i dorsali',
    correction: 'Inizia deprimendo le scapole, poi tira con i gomiti.',
    check: (frames) => false
  }
];

// ============================================
// CHEST PRESS MACHINE
// ============================================

export const CHEST_PRESS_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'SHOULDER_PROTRACTION_EXCESSIVE',
    severity: 'MEDIUM',
    description: 'Spalle che vanno troppo avanti (perdita retrazione)',
    correction: 'Mantieni le scapole retratte per tutto il movimento.',
    check: (frame) => false // Richiede tracking scapole
  },
  {
    code: 'ELBOW_FLARE',
    severity: 'MEDIUM',
    description: 'Gomiti troppo larghi (>75° dal torso)',
    correction: 'Gomiti a 45-60° dal corpo per proteggere le spalle.',
    check: (frame) => (frame.angles.shoulderAbduction || 0) > 75
  },
  {
    code: 'WRIST_FLEXION',
    severity: 'LOW',
    description: 'Polsi flessi',
    correction: 'Polsi neutri, in linea con gli avambracci.',
    check: (frame) => (frame.angles.wrist || 0) < -15
  }
];

export const CHEST_PRESS_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'INCOMPLETE_ROM',
    description: 'ROM incompleto',
    correction: 'Full ROM: stretch completo in basso, estensione completa in alto.',
    check: (frames) => {
      const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
      return bottomFrame ? (bottomFrame.angles.elbow || 180) > 100 : false;
    }
  },
  {
    code: 'UNEVEN_PUSH',
    description: 'Spinta asimmetrica',
    correction: 'Spingi in modo uniforme con entrambe le braccia.',
    check: (frames) => false
  }
];

// ============================================
// SHOULDER PRESS MACHINE
// ============================================

export const SHOULDER_PRESS_MACHINE_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'LUMBAR_HYPEREXTENSION',
    severity: 'HIGH',
    description: 'Eccessiva estensione lombare',
    correction: 'Core attivo, schiena contro il pad. Se inarchi, il peso è troppo.',
    check: (frame) => (frame.angles.lumbar || 0) > 25
  },
  {
    code: 'NECK_FORWARD',
    severity: 'MEDIUM',
    description: 'Testa che va in avanti',
    correction: 'Testa contro il poggiatesta, mento neutro.',
    check: (frame) => false
  }
];

export const SHOULDER_PRESS_MACHINE_EFFICIENCY_CHECKS: EfficiencyCheck[] = [
  {
    code: 'INCOMPLETE_LOCKOUT',
    description: 'Braccia non completamente estese in alto',
    correction: 'Estendi completamente senza bloccare i gomiti di scatto.',
    check: (frames) => {
      const topFrame = frames.find(f => f.phase === 'LOCKOUT');
      return topFrame ? (topFrame.angles.elbow || 0) < 170 : false;
    }
  }
];

// ============================================
// LEG CURL / LEG EXTENSION
// ============================================

export const LEG_CURL_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'HIP_FLEXION',
    severity: 'MEDIUM',
    description: 'Anche che si sollevano dalla panca',
    correction: 'Tieni le anche premute contro il pad per tutto il movimento.',
    check: (frame) => false // Richiede tracking specifico
  },
  {
    code: 'LUMBAR_HYPEREXTENSION',
    severity: 'MEDIUM',
    description: 'Schiena che si inarca eccessivamente',
    correction: 'Core attivo, non inarcare per compensare.',
    check: (frame) => (frame.angles.lumbar || 0) > 20
  }
];

export const LEG_EXTENSION_SAFETY_CHECKS: SafetyCheck[] = [
  {
    code: 'KNEE_HYPEREXTENSION',
    severity: 'HIGH',
    description: 'Ginocchia iperestese in cima',
    correction: 'Fermati appena prima del lockout completo.',
    check: (frame) => (frame.angles.knee || 0) > 178
  },
  {
    code: 'MOMENTUM_EXCESSIVE',
    severity: 'MEDIUM',
    description: 'Troppo slancio - movimento non controllato',
    correction: 'Movimento lento e controllato, 2-3 secondi per fase.',
    check: (frame) => false
  }
];

// ============================================
// ANALYZE FUNCTIONS
// ============================================

export function analyzeMachineFrame(
  landmarks: PoseLandmarks,
  frameNumber: number,
  timestamp: number,
  phase: string,
  machineType: 'leg_press' | 'cable_row' | 'lat_pulldown' | 'chest_press' | 'shoulder_press' | 'leg_curl' | 'leg_extension',
  morphotype?: Morphotype
): FrameAnalysis {
  const kneeAngle = getKneeAngle(landmarks, 'left');
  const hipAngle = getHipAngle(landmarks, 'left');
  const elbowAngle = getElbowAngle(landmarks, 'left');
  const torsoAngle = getTorsoAngle(landmarks);
  const spineNeutral = isSpineNeutral(landmarks);

  const issues: Issue[] = [];

  const frameAnalysis: FrameAnalysis = {
    frameNumber,
    timestamp,
    phase: phase as any,
    angles: {
      knee: kneeAngle,
      hip: hipAngle,
      elbow: elbowAngle,
      torso: torsoAngle
    },
    spineNeutral,
    issues
  };

  // Seleziona i check appropriati
  let safetyChecks: SafetyCheck[] = [];

  switch (machineType) {
    case 'leg_press':
      safetyChecks = LEG_PRESS_SAFETY_CHECKS;
      break;
    case 'cable_row':
      safetyChecks = CABLE_ROW_SAFETY_CHECKS;
      break;
    case 'lat_pulldown':
      safetyChecks = LAT_PULLDOWN_SAFETY_CHECKS;
      break;
    case 'chest_press':
      safetyChecks = CHEST_PRESS_SAFETY_CHECKS;
      break;
    case 'shoulder_press':
      safetyChecks = SHOULDER_PRESS_MACHINE_SAFETY_CHECKS;
      break;
    case 'leg_curl':
      safetyChecks = LEG_CURL_SAFETY_CHECKS;
      break;
    case 'leg_extension':
      safetyChecks = LEG_EXTENSION_SAFETY_CHECKS;
      break;
  }

  for (const check of safetyChecks) {
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

export function analyzeFullMachine(
  allFrames: FrameAnalysis[],
  machineType: 'leg_press' | 'cable_row' | 'lat_pulldown' | 'chest_press' | 'shoulder_press' | 'leg_curl' | 'leg_extension',
  morphotype?: Morphotype
): {
  issues: Issue[];
  strengths: string[];
  stickingPoint: StickingPointAnalysis;
  recommendations: { immediate: string[]; accessories: string[]; mobility: string[] };
  overallScore: number;
} {
  const allIssues: Issue[] = [];

  for (const frame of allFrames) {
    allIssues.push(...frame.issues);
  }

  // Efficiency checks
  let efficiencyChecks: EfficiencyCheck[] = [];

  switch (machineType) {
    case 'leg_press':
      efficiencyChecks = LEG_PRESS_EFFICIENCY_CHECKS;
      break;
    case 'cable_row':
      efficiencyChecks = CABLE_ROW_EFFICIENCY_CHECKS;
      break;
    case 'lat_pulldown':
      efficiencyChecks = LAT_PULLDOWN_EFFICIENCY_CHECKS;
      break;
    case 'chest_press':
      efficiencyChecks = CHEST_PRESS_EFFICIENCY_CHECKS;
      break;
    case 'shoulder_press':
      efficiencyChecks = SHOULDER_PRESS_MACHINE_EFFICIENCY_CHECKS;
      break;
  }

  for (const check of efficiencyChecks) {
    if (check.check(allFrames, morphotype)) {
      allIssues.push({
        type: 'EFFICIENCY',
        code: check.code,
        severity: 'MEDIUM',
        description: check.description,
        correction: check.correction
      });
    }
  }

  const uniqueIssues = removeDuplicateIssues(allIssues);
  const sortedIssues = sortIssuesByPriority(uniqueIssues);

  // Max 2 correzioni alla volta
  const topIssues = sortedIssues.slice(0, 2);

  const strengths = identifyMachineStrengths(allFrames, machineType);
  const recommendations = generateMachineRecommendations(topIssues, machineType);
  const overallScore = calculateMachineScore(topIssues, strengths);

  return {
    issues: topIssues,
    strengths,
    stickingPoint: { detected: false },
    recommendations,
    overallScore
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function identifyMachineStrengths(frames: FrameAnalysis[], machineType: string): string[] {
  const strengths: string[] = [];

  // ROM completo
  const bottomFrame = frames.find(f => f.phase === 'BOTTOM');
  const topFrame = frames.find(f => f.phase === 'TOP' || f.phase === 'LOCKOUT');

  if (machineType === 'leg_press' && bottomFrame) {
    if ((bottomFrame.angles.knee || 180) < 100) {
      strengths.push('Buona profondità nel leg press');
    }
  }

  // Spine neutrale
  const spineIssues = frames.filter(f => f.spineNeutral === false);
  if (spineIssues.length === 0) {
    strengths.push('Postura della schiena corretta');
  }

  // Controllo del movimento
  const velocities = frames.map(f => f.velocity || 0).filter(v => v > 0);
  if (velocities.length > 0) {
    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    if (avgVelocity < 0.3) {
      strengths.push('Buon controllo del movimento');
    }
  }

  return strengths;
}

function generateMachineRecommendations(
  issues: Issue[],
  machineType: string
): { immediate: string[]; accessories: string[]; mobility: string[] } {
  const immediate: string[] = [];
  const accessories: string[] = [];
  const mobility: string[] = [];

  for (const issue of issues) {
    switch (issue.code) {
      case 'LUMBAR_FLEXION':
        immediate.push('Riduci il ROM o il carico');
        mobility.push('Hip flexor stretch', 'Glute bridge');
        break;

      case 'KNEE_VALGUS':
        immediate.push('Piedi leggermente più larghi');
        accessories.push('Clamshell', 'Lateral band walk');
        break;

      case 'INCOMPLETE_ROM':
        immediate.push('Full ROM con peso controllabile');
        break;

      case 'EXCESSIVE_BODY_ENGLISH':
      case 'MOMENTUM_EXCESSIVE':
        immediate.push('Riduci il peso, controlla ogni rep');
        break;

      case 'ELBOW_FLARE':
        immediate.push('Gomiti più vicini al corpo');
        break;
    }
  }

  return {
    immediate: [...new Set(immediate)].slice(0, 2),
    accessories: [...new Set(accessories)].slice(0, 2),
    mobility: [...new Set(mobility)].slice(0, 2)
  };
}

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

function calculateMachineScore(issues: Issue[], strengths: string[]): number {
  let score = 10;

  for (const issue of issues) {
    if (issue.type === 'SAFETY') {
      score -= issue.severity === 'HIGH' ? 2 : issue.severity === 'MEDIUM' ? 1.5 : 1;
    } else {
      score -= issue.severity === 'HIGH' ? 1.5 : issue.severity === 'MEDIUM' ? 1 : 0.5;
    }
  }

  score += Math.min(strengths.length * 0.3, 1);

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}
