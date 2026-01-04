/**
 * Post-Workout Discomfort Check
 * TrainSmart - Componente per segnalare fastidio dopo l'allenamento
 *
 * UI semplice: seleziona zone con fastidio → conferma → fine
 * Niente fasi, livelli, o progressioni.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, ThumbsUp } from 'lucide-react';
import type {
  TrackedBodyArea,
  ReportDiscomfortResponse
} from '@shared/types/discomfortTracking.types';
import {
  TRACKED_BODY_AREAS,
  BODY_AREA_LABELS
} from '@shared/types/discomfortTracking.types';

// =============================================================================
// TYPES
// =============================================================================

interface PostWorkoutDiscomfortProps {
  /** Callback per segnalare fastidio */
  onReport: (areas: TrackedBodyArea[]) => Promise<ReportDiscomfortResponse>;
  /** Callback quando l'utente chiude */
  onClose: () => void;
  /** Mostra come modal? */
  asModal?: boolean;
}

type Step = 'select' | 'result';

// =============================================================================
// BODY AREA BUTTON COMPONENT
// =============================================================================

interface BodyAreaButtonProps {
  area: TrackedBodyArea;
  selected: boolean;
  onToggle: () => void;
}

function BodyAreaButton({ area, selected, onToggle }: BodyAreaButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        p-3 rounded-xl text-sm font-medium transition-all
        ${
          selected
            ? 'bg-amber-500 text-white ring-2 ring-amber-300'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }
      `}
    >
      {BODY_AREA_LABELS[area]}
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PostWorkoutDiscomfort({
  onReport,
  onClose,
  asModal = true
}: PostWorkoutDiscomfortProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedAreas, setSelectedAreas] = useState<TrackedBodyArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReportDiscomfortResponse | null>(null);

  // Toggle area selection
  const toggleArea = (area: TrackedBodyArea) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  // Report no discomfort
  const handleNoDiscomfort = async () => {
    setIsLoading(true);
    try {
      const response = await onReport([]);
      setResult(response);
      setStep('result');
    } catch (error) {
      console.error('Error reporting no discomfort:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Report selected areas
  const handleReportDiscomfort = async () => {
    if (selectedAreas.length === 0) {
      handleNoDiscomfort();
      return;
    }

    setIsLoading(true);
    try {
      const response = await onReport(selectedAreas);
      setResult(response);
      setStep('result');
    } catch (error) {
      console.error('Error reporting discomfort:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Content based on step
  const renderContent = () => {
    switch (step) {
      case 'select':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h2 className="text-xl font-bold text-white mb-2">
              Come ti senti?
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Hai sentito fastidio durante l'allenamento?
            </p>

            {/* Area selection grid */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {TRACKED_BODY_AREAS.map((area) => (
                <BodyAreaButton
                  key={area}
                  area={area}
                  selected={selectedAreas.includes(area)}
                  onToggle={() => toggleArea(area)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {selectedAreas.length > 0 ? (
                <button
                  onClick={handleReportDiscomfort}
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600
                           text-white py-3 rounded-xl font-medium transition-colors
                           flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={18} />
                  Segnala fastidio ({selectedAreas.length}{' '}
                  {selectedAreas.length === 1 ? 'zona' : 'zone'})
                </button>
              ) : null}

              <button
                onClick={handleNoDiscomfort}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600
                         text-white py-3 rounded-xl font-medium transition-colors
                         flex items-center justify-center gap-2"
              >
                <ThumbsUp size={18} />
                Nessun fastidio
              </button>
            </div>
          </motion.div>
        );

      case 'result':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Icon based on result */}
            <div className="mb-4">
              {result?.consult_professional ? (
                <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-amber-400" size={32} />
                </div>
              ) : result?.areas_with_reduction.length ? (
                <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Check className="text-blue-400" size={32} />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <ThumbsUp className="text-emerald-400" size={32} />
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-2">
              {result?.consult_professional
                ? 'Attenzione'
                : result?.areas_with_reduction.length
                  ? 'Registrato'
                  : 'Ottimo!'}
            </h2>

            {/* Message */}
            <p className="text-slate-300 mb-6 whitespace-pre-line">
              {result?.message}
            </p>

            {/* Professional warning */}
            {result?.consult_professional && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 text-left">
                <p className="text-amber-200 text-sm">
                  <strong>Consiglio:</strong> Un fisioterapista o medico
                  sportivo può aiutarti a identificare la causa del fastidio e
                  suggerirti come gestirlo al meglio.
                </p>
              </div>
            )}

            {/* Load reduction info */}
            {result?.areas_with_reduction.length > 0 &&
              !result?.consult_professional && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 text-left">
                  <p className="text-blue-200 text-sm">
                    <strong>Cosa succede ora:</strong> Il carico per gli
                    esercizi che coinvolgono{' '}
                    {result.areas_with_reduction.length === 1
                      ? `la ${BODY_AREA_LABELS[result.areas_with_reduction[0]]}`
                      : 'queste zone'}{' '}
                    sarà ridotto automaticamente.
                  </p>
                </div>
              )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white
                       py-3 rounded-xl font-medium transition-colors"
            >
              Chiudi
            </button>
          </motion.div>
        );
    }
  };

  // Wrap in modal if needed
  if (asModal) {
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
          className="bg-slate-800 rounded-2xl max-w-sm w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-700">
            <span className="text-slate-400 text-sm">Post-Workout</span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg
                       hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Inline version
  return (
    <div className="bg-slate-800 rounded-2xl p-6">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  );
}

// =============================================================================
// DISCOMFORT BADGE COMPONENT
// =============================================================================

interface DiscomfortBadgeProps {
  area: TrackedBodyArea;
  isRecurring?: boolean;
}

/**
 * Badge da mostrare accanto agli esercizi con carico ridotto
 */
export function DiscomfortBadge({ area, isRecurring }: DiscomfortBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${
          isRecurring
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-blue-500/20 text-blue-400'
        }
      `}
      title={
        isRecurring
          ? `Fastidio ricorrente a ${BODY_AREA_LABELS[area]} - carico ridotto al 40%`
          : `Fastidio a ${BODY_AREA_LABELS[area]} - carico ridotto al 60%`
      }
    >
      {isRecurring && <AlertTriangle size={12} />}
      Carico ridotto
    </span>
  );
}

// =============================================================================
// PROFESSIONAL RECOMMENDATION BANNER
// =============================================================================

interface ProfessionalBannerProps {
  areas: TrackedBodyArea[];
  onDismiss?: () => void;
}

/**
 * Banner da mostrare quando si consiglia di consultare un professionista
 */
export function ProfessionalRecommendationBanner({
  areas,
  onDismiss
}: ProfessionalBannerProps) {
  if (areas.length === 0) return null;

  const areaLabels = areas.map((a) => BODY_AREA_LABELS[a]).join(', ');

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="text-amber-400 flex-shrink-0 mt-0.5"
          size={20}
        />
        <div className="flex-1">
          <h4 className="font-medium text-amber-200 mb-1">
            Fastidio ricorrente
          </h4>
          <p className="text-amber-200/80 text-sm">
            Il fastidio a {areaLabels} persiste da diverse sessioni. Ti
            consigliamo di consultare un professionista (fisioterapista, medico
            sportivo).
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-amber-400/60 hover:text-amber-400 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
