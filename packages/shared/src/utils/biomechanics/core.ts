/**
 * Biomechanics Engine - Core Utilities
 * Funzioni base per calcoli geometrici e analisi pose
 */

import type {
  PoseLandmark,
  PoseLandmarks,
  UserProportions,
  Morphotype,
  MorphotypeType,
  FrameAnalysis,
  ExercisePhase,
  CameraValidationResult
} from '../../types/biomechanics.types';

// ============================================
// COSTANTI
// ============================================

export const LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
} as const;

// ============================================
// FUNZIONI GEOMETRICHE
// ============================================

/**
 * Converte gradi in radianti
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converte radianti in gradi
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calcola la distanza euclidea tra due punti
 */
export function distance(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = (p2.z || 0) - (p1.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calcola la distanza 2D (ignora z)
 */
export function distance2D(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcola il punto medio tra due landmark
 */
export function midpoint(p1: PoseLandmark, p2: PoseLandmark): PoseLandmark {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: ((p1.z || 0) + (p2.z || 0)) / 2,
    visibility: Math.min(p1.visibility, p2.visibility)
  };
}

/**
 * Calcola l'angolo tra tre punti (in gradi)
 * Il punto centrale (p2) è il vertice dell'angolo
 */
export function calculateAngle(p1: PoseLandmark, p2: PoseLandmark, p3: PoseLandmark): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const cross = v1.x * v2.y - v1.y * v2.x;

  const angle = Math.atan2(Math.abs(cross), dot);
  return toDegrees(angle);
}

/**
 * Calcola l'angolo rispetto alla verticale
 */
export function angleFromVertical(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = Math.atan2(Math.abs(dx), Math.abs(dy));
  return toDegrees(angle);
}

/**
 * Calcola l'angolo rispetto all'orizzontale
 */
export function angleFromHorizontal(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angle = Math.atan2(dy, dx);
  return toDegrees(angle);
}

// ============================================
// PROPORZIONI E MORFOTIPO
// ============================================

/**
 * Calcola le proporzioni corporee dai landmark
 */
export function calculateProportions(landmarks: PoseLandmarks): UserProportions {
  // Lunghezze segmenti (media tra lato destro e sinistro)
  const leftFemur = distance(landmarks.left_hip, landmarks.left_knee);
  const rightFemur = distance(landmarks.right_hip, landmarks.right_knee);
  const femurLength = (leftFemur + rightFemur) / 2;

  const leftTibia = distance(landmarks.left_knee, landmarks.left_ankle);
  const rightTibia = distance(landmarks.right_knee, landmarks.right_ankle);
  const tibiaLength = (leftTibia + rightTibia) / 2;

  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  const torsoLength = distance(hipMid, shoulderMid);

  const leftArm = distance(landmarks.left_shoulder, landmarks.left_elbow) +
    distance(landmarks.left_elbow, landmarks.left_wrist);
  const rightArm = distance(landmarks.right_shoulder, landmarks.right_elbow) +
    distance(landmarks.right_elbow, landmarks.right_wrist);
  const armLength = (leftArm + rightArm) / 2;

  // Rapporti
  const femurToTorso = femurLength / torsoLength;
  const armToTorso = armLength / torsoLength;
  const tibiaToFemur = tibiaLength / femurLength;

  return {
    femurLength,
    tibiaLength,
    torsoLength,
    armLength,
    femurToTorso,
    armToTorso,
    tibiaToFemur
  };
}

/**
 * Classifica il morfotipo basandosi sulle proporzioni
 */
export function classifyMorphotype(proportions: UserProportions): Morphotype {
  const { femurToTorso, armToTorso } = proportions;

  // Femori lunghi
  if (femurToTorso > 1.1) {
    return {
      type: 'LONG_FEMUR',
      squatImplications: {
        expectedTorsoLean: 'high',      // 45-60°
        preferredStance: 'wide',
        preferredStyle: 'low_bar',
        depthChallenge: true
      },
      deadliftImplications: {
        preferredStyle: 'sumo',
        hipStartPosition: 'high'
      },
      note: 'Le tue proporzioni richiedono più inclinazione del torso nello squat - è normale!'
    };
  }

  // Torso lungo
  if (femurToTorso < 0.9) {
    return {
      type: 'LONG_TORSO',
      squatImplications: {
        expectedTorsoLean: 'low',       // 20-35°
        preferredStance: 'medium',
        preferredStyle: 'high_bar',
        depthChallenge: false
      },
      deadliftImplications: {
        preferredStyle: 'conventional',
        hipStartPosition: 'low'
      },
      note: 'Con un torso lungo puoi mantenere una posizione più verticale nello squat.'
    };
  }

  // Braccia lunghe
  if (armToTorso > 1.1) {
    return {
      type: 'LONG_ARMS',
      benchImplications: {
        romAdvantage: false,  // ROM maggiore = più lavoro
        gripWidth: 'wide'
      },
      deadliftImplications: {
        preferredStyle: 'conventional',
        hipStartPosition: 'high',
        advantage: true
      },
      note: 'Le braccia lunghe ti danno un vantaggio nello stacco ma ROM maggiore in panca.'
    };
  }

  // Braccia corte
  if (armToTorso < 0.9) {
    return {
      type: 'SHORT_ARMS',
      benchImplications: {
        romAdvantage: true,   // ROM minore
        gripWidth: 'medium'
      },
      deadliftImplications: {
        preferredStyle: 'sumo',
        hipStartPosition: 'low'
      },
      note: 'Le braccia corte ti avvantaggiano in panca ma richiedono setup attento nello stacco.'
    };
  }

  // Proporzioni bilanciate
  return {
    type: 'BALANCED',
    squatImplications: {
      expectedTorsoLean: 'medium',
      preferredStance: 'medium',
      preferredStyle: 'high_bar',
      depthChallenge: false
    },
    deadliftImplications: {
      preferredStyle: 'conventional',
      hipStartPosition: 'medium'
    },
    benchImplications: {
      romAdvantage: false,
      gripWidth: 'medium'
    },
    note: 'Proporzioni bilanciate - puoi adattarti bene a diversi stili.'
  };
}

// ============================================
// VALIDAZIONE CAMERA
// ============================================

/**
 * Valida l'angolazione della camera (dovrebbe essere ~45° posteriore-laterale)
 */
export function validateCameraAngle(landmarks: PoseLandmarks): CameraValidationResult {
  // Verifica che i landmark principali siano visibili
  const requiredLandmarks = [
    landmarks.left_shoulder,
    landmarks.right_shoulder,
    landmarks.left_hip,
    landmarks.right_hip,
    landmarks.left_knee,
    landmarks.right_knee,
    landmarks.left_ankle,
    landmarks.right_ankle
  ];

  const allVisible = requiredLandmarks.every(l => l.visibility > 0.5);
  if (!allVisible) {
    return {
      valid: false,
      error: 'BODY_NOT_VISIBLE',
      message: 'Non riesco a vedere tutto il corpo. Assicurati di essere completamente inquadrato.'
    };
  }

  // Calcola l'overlap delle spalle per stimare l'angolo
  const shoulderWidth = distance2D(landmarks.left_shoulder, landmarks.right_shoulder);
  const hipWidth = distance2D(landmarks.left_hip, landmarks.right_hip);

  // Se vediamo entrambe le spalle/anche con overlap parziale = ~45°
  // Stima basata sulla differenza di x tra spalla sx e dx
  const shoulderDeltaX = Math.abs(landmarks.right_shoulder.x - landmarks.left_shoulder.x);

  // Normalizza rispetto alla larghezza attesa (circa 0.3-0.4 della frame width per vista 45°)
  // Vista laterale pura: shoulderDeltaX ~ 0 (spalle sovrapposte)
  // Vista frontale pura: shoulderDeltaX ~ 0.3-0.4 (spalle ben separate)
  // Vista 45°: shoulderDeltaX ~ 0.15-0.25

  if (shoulderDeltaX < 0.08) {
    return {
      valid: false,
      error: 'CAMERA_TOO_LATERAL',
      message: 'La camera è troppo di lato. Spostati più dietro per vedere anche la schiena.'
    };
  }

  if (shoulderDeltaX > 0.35) {
    return {
      valid: false,
      error: 'CAMERA_TOO_POSTERIOR',
      message: 'La camera è troppo dietro. Spostati più di lato per vedere anche il fianco.'
    };
  }

  // Stima l'angolo approssimativo
  const estimatedAngle = Math.round(45 * (shoulderDeltaX / 0.2));

  return {
    valid: true,
    estimatedAngle: Math.min(60, Math.max(30, estimatedAngle))
  };
}

// ============================================
// CORREZIONE PROSPETTIVA
// ============================================

/**
 * Corregge l'angolo misurato per la prospettiva della camera
 */
export function correctAngleForPerspective(
  measuredAngle: number,
  cameraAngle: number = 45,
  jointPlane: 'SAGITTAL' | 'FRONTAL'
): number {
  if (jointPlane === 'SAGITTAL') {
    // Angoli nel piano sagittale (es. flessione ginocchio)
    return measuredAngle / Math.cos(toRadians(cameraAngle));
  }

  if (jointPlane === 'FRONTAL') {
    // Angoli nel piano frontale (es. valgismo)
    return measuredAngle / Math.sin(toRadians(cameraAngle));
  }

  return measuredAngle;
}

// ============================================
// ANALISI VELOCITÀ E FASE
// ============================================

/**
 * Calcola la velocità tra due frame
 */
export function calculateVelocity(
  landmarks1: PoseLandmarks,
  landmarks2: PoseLandmarks,
  deltaTime: number
): number {
  // Usa il baricentro (media delle anche) come riferimento
  const hip1 = midpoint(landmarks1.left_hip, landmarks1.right_hip);
  const hip2 = midpoint(landmarks2.left_hip, landmarks2.right_hip);

  const displacement = distance2D(hip1, hip2);
  return displacement / deltaTime;
}

/**
 * Trova il frame con velocità minima (sticking point)
 */
export function findMinVelocityFrame(frames: FrameAnalysis[]): FrameAnalysis | null {
  if (frames.length < 3) return null;

  // Escludi il primo e ultimo frame, e i frame di inversione
  const concentricFrames = frames.filter(f =>
    f.phase === 'CONCENTRIC' || f.phase === 'MID_RANGE'
  );

  if (concentricFrames.length === 0) return null;

  let minVelocity = Infinity;
  let minFrame: FrameAnalysis | null = null;

  for (const frame of concentricFrames) {
    if (frame.velocity !== undefined && frame.velocity < minVelocity && frame.velocity > 0) {
      minVelocity = frame.velocity;
      minFrame = frame;
    }
  }

  return minFrame;
}

/**
 * Determina la fase del movimento basandosi sulla posizione e direzione
 */
export function determinePhase(
  currentFrame: PoseLandmarks,
  previousFrame: PoseLandmarks | null,
  exercise: string
): ExercisePhase {
  if (!previousFrame) return 'SETUP';

  const currentHip = midpoint(currentFrame.left_hip, currentFrame.right_hip);
  const prevHip = midpoint(previousFrame.left_hip, previousFrame.right_hip);

  // Direzione del movimento (y aumenta verso il basso nell'immagine)
  const movingDown = currentHip.y > prevHip.y;
  const movingUp = currentHip.y < prevHip.y;

  // Calcola l'angolo del ginocchio per determinare la profondità
  const kneeAngle = calculateAngle(
    currentFrame.left_hip,
    currentFrame.left_knee,
    currentFrame.left_ankle
  );

  // Per squat/stacco
  if (['BACK_SQUAT', 'FRONT_SQUAT', 'DEADLIFT_CONVENTIONAL', 'DEADLIFT_SUMO'].includes(exercise)) {
    if (movingDown) {
      return kneeAngle < 100 ? 'BOTTOM' : 'ECCENTRIC';
    }
    if (movingUp) {
      return kneeAngle > 160 ? 'LOCKOUT' : 'CONCENTRIC';
    }
    return kneeAngle < 100 ? 'BOTTOM' : 'MID_RANGE';
  }

  // Per panca/OHP (movimento braccia)
  if (['BENCH_PRESS', 'OVERHEAD_PRESS', 'PUSH_UP'].includes(exercise)) {
    const elbowAngle = calculateAngle(
      currentFrame.left_shoulder,
      currentFrame.left_elbow,
      currentFrame.left_wrist
    );

    if (elbowAngle < 100) return 'BOTTOM';
    if (elbowAngle > 160) return 'LOCKOUT';
    return movingUp ? 'CONCENTRIC' : 'ECCENTRIC';
  }

  // Default
  return 'MID_RANGE';
}

// ============================================
// UTILITY ANGOLI SPECIFICI
// ============================================

/**
 * Calcola l'angolo del ginocchio
 */
export function getKneeAngle(landmarks: PoseLandmarks, side: 'left' | 'right' = 'left'): number {
  if (side === 'left') {
    return calculateAngle(landmarks.left_hip, landmarks.left_knee, landmarks.left_ankle);
  }
  return calculateAngle(landmarks.right_hip, landmarks.right_knee, landmarks.right_ankle);
}

/**
 * Calcola l'angolo dell'anca
 */
export function getHipAngle(landmarks: PoseLandmarks, side: 'left' | 'right' = 'left'): number {
  if (side === 'left') {
    return calculateAngle(landmarks.left_shoulder, landmarks.left_hip, landmarks.left_knee);
  }
  return calculateAngle(landmarks.right_shoulder, landmarks.right_hip, landmarks.right_knee);
}

/**
 * Calcola l'angolo del gomito
 */
export function getElbowAngle(landmarks: PoseLandmarks, side: 'left' | 'right' = 'left'): number {
  if (side === 'left') {
    return calculateAngle(landmarks.left_shoulder, landmarks.left_elbow, landmarks.left_wrist);
  }
  return calculateAngle(landmarks.right_shoulder, landmarks.right_elbow, landmarks.right_wrist);
}

/**
 * Calcola l'inclinazione del torso rispetto alla verticale
 */
export function getTorsoAngle(landmarks: PoseLandmarks): number {
  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  return angleFromVertical(hipMid, shoulderMid);
}

/**
 * Calcola il valgismo del ginocchio (positivo = valgo, negativo = varo)
 */
export function getKneeValgus(landmarks: PoseLandmarks, side: 'left' | 'right' = 'left'): number {
  // Confronta la posizione x del ginocchio rispetto alla linea anca-caviglia
  const hip = side === 'left' ? landmarks.left_hip : landmarks.right_hip;
  const knee = side === 'left' ? landmarks.left_knee : landmarks.right_knee;
  const ankle = side === 'left' ? landmarks.left_ankle : landmarks.right_ankle;

  // Posizione x attesa del ginocchio (interpolazione lineare)
  const expectedKneeX = hip.x + (ankle.x - hip.x) * ((knee.y - hip.y) / (ankle.y - hip.y));

  // Deviazione (positivo = ginocchio verso l'interno = valgo)
  const deviation = knee.x - expectedKneeX;

  // Converti in gradi approssimativi
  const kneeToAnkleDistance = distance2D(knee, ankle);
  return toDegrees(Math.atan(deviation / kneeToAnkleDistance));
}

/**
 * Verifica se la spine è in posizione neutrale
 */
export function isSpineNeutral(landmarks: PoseLandmarks): boolean {
  // Semplificazione: verifica l'allineamento spalla-anca
  // Una spine neutrale mantiene una curva lombare naturale

  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);

  // Calcola la curvatura approssimativa usando il punto medio
  // In una vista laterale, con spine neutrale, la linea è relativamente dritta

  // Per ora, ritorniamo true se l'angolo del torso è ragionevole
  const torsoAngle = getTorsoAngle(landmarks);

  // Torso inclinato oltre 70° probabilmente indica perdita di neutralità
  return torsoAngle < 70;
}

/**
 * Verifica se i talloni sono a terra
 */
export function areHeelsDown(landmarks: PoseLandmarks): boolean {
  // Confronta la y del tallone con la y della punta del piede
  // Se il tallone è significativamente più alto, i talloni si sono alzati

  const leftHeelHigher = landmarks.left_heel.y < landmarks.left_foot_index.y - 0.02;
  const rightHeelHigher = landmarks.right_heel.y < landmarks.right_foot_index.y - 0.02;

  return !leftHeelHigher && !rightHeelHigher;
}
