import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { SubstitutionScore, SubstitutionCandidate, ConfidenceLevel } from '@anthropic-ai/trainsmart-shared';

interface SubstitutionPromptProps {
  originalExercise: string;
  substitute: SubstitutionCandidate;
  alternativeSubstitutes?: SubstitutionCandidate[];
  onAccept: () => void;
  onReject: () => void;
  onSkip: () => void;
  onSelectAlternative?: (index: number) => void;
}

const getLevelColor = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'HIGH': return 'text-emerald-400 bg-emerald-500/20';
    case 'MEDIUM': return 'text-amber-400 bg-amber-500/20';
    case 'LOW': return 'text-orange-400 bg-orange-500/20';
    case 'VERY_LOW': return 'text-red-400 bg-red-500/20';
    default: return 'text-slate-400 bg-slate-500/20';
  }
};

const getLevelIcon = (level: ConfidenceLevel) => {
  switch (level) {
    case 'HIGH': return <CheckCircle className="w-5 h-5" />;
    case 'MEDIUM': return <HelpCircle className="w-5 h-5" />;
    case 'LOW': return <AlertTriangle className="w-5 h-5" />;
    case 'VERY_LOW': return <XCircle className="w-5 h-5" />;
    default: return null;
  }
};

export default function SubstitutionPrompt({
  originalExercise,
  substitute,
  alternativeSubstitutes = [],
  onAccept,
  onReject,
  onSkip,
  onSelectAlternative
}: SubstitutionPromptProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const { score, level, factors, recommendation, userPrompt } = substitute.score;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-md w-full p-5 border border-slate-700">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-lg ${getLevelColor(level)}`}>
            {getLevelIcon(level)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Sostituzione Esercizio</h3>
            <p className="text-sm text-slate-400">
              {originalExercise}
            </p>
          </div>
        </div>

        {/* Substitution Card */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-white">{substitute.exercise.name}</p>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(level)}`}>
              {score}/100
            </span>
          </div>

          {userPrompt && (
            <p className="text-sm text-slate-300 whitespace-pre-line">
              {userPrompt}
            </p>
          )}
        </div>

        {/* Confidence Details (Expandable) */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-slate-300 mb-3"
        >
          <span>Dettagli confidence</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="bg-slate-700/30 rounded-lg p-3 mb-4 space-y-2">
            {factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{factor.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">{factor.details}</span>
                  <span className={`font-mono ${
                    factor.contribution >= 15 ? 'text-emerald-400' :
                    factor.contribution >= 8 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    +{factor.contribution}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alternative Substitutes (if available) */}
        {alternativeSubstitutes.length > 0 && (
          <>
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-slate-300 mb-3"
            >
              <span>Altre alternative ({alternativeSubstitutes.length})</span>
              {showAlternatives ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAlternatives && (
              <div className="space-y-2 mb-4">
                {alternativeSubstitutes.slice(0, 3).map((alt, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectAlternative?.(index)}
                    className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors text-left"
                  >
                    <span className="text-white">{alt.exercise.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getLevelColor(alt.score.level)}`}>
                      {alt.score.score}/100
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {recommendation !== 'SUGGEST_SKIP' && (
            <button
              onClick={onAccept}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium"
            >
              Accetta Sostituzione
            </button>
          )}

          <div className="flex gap-2">
            {recommendation === 'ASK_USER' && (
              <button
                onClick={onReject}
                className="flex-1 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600"
              >
                Prova Originale
              </button>
            )}

            <button
              onClick={onSkip}
              className={`${recommendation === 'ASK_USER' ? 'flex-1' : 'w-full'} py-3 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600`}
            >
              Salta Esercizio
            </button>
          </div>
        </div>

        {/* Info Note */}
        {recommendation === 'SUGGEST_SKIP' && (
          <p className="text-xs text-slate-500 text-center mt-3">
            Saltare un esercizio quando il dolore è intenso è una scelta saggia
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Simplified SubstitutionPrompt for inline usage (non-modal)
 */
export function SubstitutionPromptInline({
  originalExercise,
  substitute,
  onAccept,
  onSkip
}: {
  originalExercise: string;
  substitute: SubstitutionCandidate;
  onAccept: () => void;
  onSkip: () => void;
}) {
  const { score, level, userPrompt } = substitute.score;

  return (
    <div className="bg-slate-800/80 backdrop-blur rounded-lg p-4 border border-slate-700">
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-1.5 rounded ${getLevelColor(level)}`}>
          {getLevelIcon(level)}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-400">
            Sostituzione per <span className="text-white">{originalExercise}</span>
          </p>
          <p className="font-medium text-white">{substitute.exercise.name}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs ${getLevelColor(level)}`}>
          {score}/100
        </span>
      </div>

      {userPrompt && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
          {userPrompt}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30"
        >
          Accetta
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600"
        >
          Salta
        </button>
      </div>
    </div>
  );
}
