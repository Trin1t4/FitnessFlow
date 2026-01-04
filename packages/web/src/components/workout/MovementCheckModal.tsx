/**
 * Movement Check Modal
 * TrainSmart - Verifica semplice dei movimenti fondamentali
 *
 * Questo componente NON è uno screening clinico.
 * È una verifica per ottimizzare il programma di allenamento.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Info
} from 'lucide-react';
import {
  MOVEMENT_CHECKS,
  evaluateMovementChecks,
  MovementCheckResult,
  MovementProfile,
  FundamentalMovement,
  BodyArea
} from '@shared/utils/movementCheck';

// =============================================================================
// TYPES
// =============================================================================

interface MovementCheckModalProps {
  /** Callback quando la verifica è completata */
  onComplete: (profile: MovementProfile) => void;
  /** Callback per chiudere il modal */
  onClose: () => void;
  /** Area specifica da verificare (opzionale - se non specificata, verifica tutti) */
  specificArea?: BodyArea;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function MovementCheckModal({
  onComplete,
  onClose,
  specificArea
}: MovementCheckModalProps) {
  // Filtra i check se specificata un'area
  const checksToPerform = specificArea
    ? MOVEMENT_CHECKS.filter((check) => check.relatedAreas.includes(specificArea))
    : MOVEMENT_CHECKS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<MovementCheckResult[]>([]);
  const [showAreaSelection, setShowAreaSelection] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<BodyArea[]>([]);

  const currentCheck = checksToPerform[currentIndex];
  const progress = ((currentIndex + 1) / checksToPerform.length) * 100;
  const isLastCheck = currentIndex === checksToPerform.length - 1;

  // Gestisce la risposta "nessun fastidio"
  const handleComfortable = useCallback(() => {
    const result: MovementCheckResult = {
      movement: currentCheck.movement,
      comfortable: true
    };

    const updatedResults = [...results, result];
    setResults(updatedResults);

    if (isLastCheck) {
      const profile = evaluateMovementChecks(updatedResults);
      onComplete(profile);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentCheck, results, isLastCheck, onComplete]);

  // Mostra selezione aree
  const handleDiscomfort = useCallback(() => {
    setShowAreaSelection(true);
    setSelectedAreas([]);
  }, []);

  // Toggle area selezionata
  const toggleArea = useCallback((area: BodyArea) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }, []);

  // Conferma selezione aree e procedi
  const confirmDiscomfort = useCallback(() => {
    const result: MovementCheckResult = {
      movement: currentCheck.movement,
      comfortable: false,
      discomfortAreas: selectedAreas.length > 0 ? selectedAreas : currentCheck.relatedAreas
    };

    const updatedResults = [...results, result];
    setResults(updatedResults);
    setShowAreaSelection(false);
    setSelectedAreas([]);

    if (isLastCheck) {
      const profile = evaluateMovementChecks(updatedResults);
      onComplete(profile);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentCheck, results, selectedAreas, isLastCheck, onComplete]);

  // Torna indietro
  const handleBack = useCallback(() => {
    if (showAreaSelection) {
      setShowAreaSelection(false);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setResults((prev) => prev.slice(0, -1));
    }
  }, [showAreaSelection, currentIndex]);

  // Labels per le aree
  const areaLabels: Record<BodyArea, string> = {
    lower_back: 'Zona lombare',
    hip: 'Anca',
    knee: 'Ginocchio',
    shoulder: 'Spalla',
    ankle: 'Caviglia',
    neck: 'Collo',
    wrist: 'Polso',
    elbow: 'Gomito'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-800 rounded-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <button
                onClick={handleBack}
                className="p-1 text-slate-400 hover:text-white rounded-lg
                           hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">
              Verifica Movimenti
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg
                       hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>
              {currentIndex + 1} di {checksToPerform.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <motion.div
              className="bg-emerald-500 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!showAreaSelection ? (
              // Main check view
              <motion.div
                key={`check-${currentIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  {currentCheck.name}
                </h3>

                <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                  <p className="text-slate-200 leading-relaxed">
                    {currentCheck.instruction}
                  </p>
                </div>

                <div className="flex items-start gap-2 mb-6 text-sm">
                  <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-400">{currentCheck.whatToNotice}</p>
                </div>

                {/* Response buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleComfortable}
                    className="flex items-center justify-center gap-2 w-full
                               bg-emerald-600 hover:bg-emerald-700 text-white
                               py-3.5 rounded-xl font-medium transition-colors"
                  >
                    <CheckCircle size={20} />
                    Nessun fastidio
                  </button>

                  <button
                    onClick={handleDiscomfort}
                    className="flex items-center justify-center gap-2 w-full
                               bg-amber-600 hover:bg-amber-700 text-white
                               py-3.5 rounded-xl font-medium transition-colors"
                  >
                    <AlertCircle size={20} />
                    Sento fastidio
                  </button>
                </div>
              </motion.div>
            ) : (
              // Area selection view
              <motion.div
                key="area-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  Dove senti fastidio?
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Seleziona le zone interessate (opzionale)
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {currentCheck.relatedAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all
                        ${
                          selectedAreas.includes(area)
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                      {areaLabels[area]}
                    </button>
                  ))}
                </div>

                <button
                  onClick={confirmDiscomfort}
                  className="flex items-center justify-center gap-2 w-full
                             bg-slate-600 hover:bg-slate-500 text-white
                             py-3.5 rounded-xl font-medium transition-colors"
                >
                  Continua
                  <ChevronRight size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer disclaimer */}
        <div className="px-6 pb-4">
          <p className="text-slate-500 text-xs text-center">
            Questa verifica non sostituisce una valutazione medica.
            <br />
            Se il fastidio persiste, consulta un professionista.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// RESULT DISPLAY COMPONENT
// =============================================================================

interface MovementCheckResultsProps {
  profile: MovementProfile;
  onContinue: () => void;
  onConsultProfessional?: () => void;
}

export function MovementCheckResults({
  profile,
  onContinue,
  onConsultProfessional
}: MovementCheckResultsProps) {
  const statusConfig = {
    good: {
      icon: <CheckCircle className="text-emerald-400" size={48} />,
      title: 'Ottimo!',
      color: 'emerald'
    },
    some_limitations: {
      icon: <AlertCircle className="text-amber-400" size={48} />,
      title: 'Qualche Limitazione',
      color: 'amber'
    },
    needs_attention: {
      icon: <AlertCircle className="text-red-400" size={48} />,
      title: 'Attenzione',
      color: 'red'
    }
  };

  const config = statusConfig[profile.overallStatus];

  return (
    <div className="bg-slate-800 rounded-2xl p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">{config.icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{config.title}</h2>
        <p className="text-slate-300">{profile.recommendation}</p>
      </div>

      {profile.uncomfortableMovements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Movimenti da adattare:
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.uncomfortableMovements.map((movement) => (
              <span
                key={movement}
                className="px-3 py-1 bg-amber-600/20 text-amber-400
                           rounded-full text-sm"
              >
                {movement.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onContinue}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white
                     py-3 rounded-xl font-medium transition-colors"
        >
          Continua con programma adattato
        </button>

        {profile.overallStatus === 'needs_attention' && onConsultProfessional && (
          <button
            onClick={onConsultProfessional}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white
                       py-3 rounded-xl font-medium transition-colors"
          >
            Trova un professionista
          </button>
        )}
      </div>
    </div>
  );
}
