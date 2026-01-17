import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import type {
  FeelerSetFeedback,
  FeelerSetResult,
} from '@trainsmart/shared';
import {
  FEELER_SET_OPTIONS,
  analyzeFeelerSetFeedback,
  calculateFeelerSetWeight,
} from '@trainsmart/shared';

// ============================================================
// TYPES
// ============================================================

interface FeelerSetUIProps {
  exerciseName: string;
  estimatedWorkingWeight: number; // kg
  targetReps: number;
  onComplete: (result: FeelerSetResult) => void;
  onSkip: () => void;
}

type FeelerStep = 'intro' | 'performing' | 'feedback' | 'result';

// ============================================================
// COMPONENT
// ============================================================

export default function FeelerSetUI({
  exerciseName,
  estimatedWorkingWeight,
  targetReps,
  onComplete,
  onSkip,
}: FeelerSetUIProps) {
  const { t } = useTranslation();

  const [step, setStep] = useState<FeelerStep>('intro');
  const [selectedFeedback, setSelectedFeedback] = useState<FeelerSetFeedback | null>(null);

  // Calcola peso feeler set (50% del peso di lavoro)
  const feelerWeight = calculateFeelerSetWeight(estimatedWorkingWeight);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleStartFeeler = () => {
    setStep('performing');
  };

  const handleCompleteReps = () => {
    setStep('feedback');
  };

  const handleSelectFeedback = (feedback: FeelerSetFeedback) => {
    setSelectedFeedback(feedback);

    // Analizza e calcola risultato
    const result = analyzeFeelerSetFeedback(
      exerciseName,
      estimatedWorkingWeight,
      feedback.adjustment
    );

    setStep('result');

    // Delay per mostrare il risultato, poi completa
    setTimeout(() => {
      onComplete(result);
    }, 2000);
  };

  // ============================================================
  // RENDER STEPS
  // ============================================================

  const renderIntro = () => (
    <div className="feeler-step intro">
      <div className="feeler-icon">🎯</div>
      <h3>{t('feeler.title')}</h3>
      <p className="feeler-description">
        {t('feeler.introDescription')}
      </p>

      <div className="feeler-instruction">
        <div className="instruction-row">
          <span className="instruction-label">{t('feeler.weight')}:</span>
          <span className="instruction-value">{feelerWeight} kg</span>
        </div>
        <div className="instruction-row">
          <span className="instruction-label">{t('feeler.reps')}:</span>
          <span className="instruction-value">{targetReps}</span>
        </div>
        <div className="instruction-row">
          <span className="instruction-label">{t('feeler.targetRPE')}:</span>
          <span className="instruction-value">{t('feeler.shouldFeelEasy')}</span>
        </div>
      </div>

      <button className="feeler-button primary" onClick={handleStartFeeler}>
        {t('feeler.startButton')}
      </button>

      <button className="feeler-button secondary" onClick={onSkip}>
        {t('feeler.skipButton')}
      </button>
    </div>
  );

  const renderPerforming = () => (
    <div className="feeler-step performing">
      <div className="feeler-icon animated">💪</div>
      <h3>{t('feeler.performingTitle')}</h3>

      <div className="current-set-info">
        <div className="weight-display">{feelerWeight} kg</div>
        <div className="reps-display">{targetReps} {t('feeler.repsLabel')}</div>
      </div>

      <p className="feeler-tip">
        {t('feeler.performingTip')}
      </p>

      <button className="feeler-button primary" onClick={handleCompleteReps}>
        {t('feeler.doneButton')}
      </button>
    </div>
  );

  const renderFeedback = () => (
    <div className="feeler-step feedback">
      <h3>{t('feeler.feedbackTitle')}</h3>
      <p className="feeler-description">
        {t('feeler.feedbackDescription')}
      </p>

      <div className="feedback-options">
        {FEELER_SET_OPTIONS.map((option, index) => (
          <button
            key={index}
            className={`feedback-option ${selectedFeedback === option ? 'selected' : ''}`}
            onClick={() => handleSelectFeedback(option)}
          >
            <span className="feedback-emoji">
              {option.adjustment > 0 ? '😊' :
               option.adjustment === 0 ? '👍' :
               option.adjustment > -0.15 ? '😓' : '😰'}
            </span>
            <span className="feedback-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderResult = () => {
    if (!selectedFeedback) return null;

    const result = analyzeFeelerSetFeedback(
      exerciseName,
      estimatedWorkingWeight,
      selectedFeedback.adjustment
    );

    return (
      <div className="feeler-step result">
        <div className="feeler-icon success">✅</div>
        <h3>{t('feeler.resultTitle')}</h3>

        <div className="result-card">
          <div className="result-row">
            <span className="result-label">{t('feeler.workingWeight')}:</span>
            <span className="result-value highlight">{result.adjustedWeight} kg</span>
          </div>
          {selectedFeedback.adjustment !== 0 && (
            <div className="result-adjustment">
              {selectedFeedback.adjustment > 0
                ? `+${Math.round(selectedFeedback.adjustment * 100)}%`
                : `${Math.round(selectedFeedback.adjustment * 100)}%`}
              {' '}{t('feeler.fromEstimate')}
            </div>
          )}
          <div className="result-confidence">
            {t(`feeler.confidence.${result.confidence}`)}
          </div>
        </div>

        <p className="feeler-tip">
          {t('feeler.resultTip')}
        </p>
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="feeler-set-ui">
      <div className="feeler-header">
        <span className="exercise-name">{exerciseName}</span>
        <span className="feeler-badge">{t('feeler.badge')}</span>
      </div>

      <div className="feeler-content">
        {step === 'intro' && renderIntro()}
        {step === 'performing' && renderPerforming()}
        {step === 'feedback' && renderFeedback()}
        {step === 'result' && renderResult()}
      </div>

      <style>{`
        .feeler-set-ui {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 20px;
          color: white;
          margin: 16px 0;
        }

        .feeler-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .exercise-name {
          font-size: 18px;
          font-weight: 600;
        }

        .feeler-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .feeler-content {
          min-height: 300px;
        }

        .feeler-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .feeler-icon {
          font-size: 48px;
          margin-bottom: 8px;
        }

        .feeler-icon.animated {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .feeler-icon.success {
          animation: bounceIn 0.5s ease-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        h3 {
          font-size: 20px;
          margin: 0;
        }

        .feeler-description {
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
          max-width: 300px;
        }

        .feeler-instruction {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 16px 24px;
          width: 100%;
          max-width: 280px;
        }

        .instruction-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .instruction-row:last-child {
          border-bottom: none;
        }

        .instruction-label {
          color: rgba(255, 255, 255, 0.7);
        }

        .instruction-value {
          font-weight: 600;
        }

        .feeler-button {
          padding: 14px 28px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          max-width: 280px;
        }

        .feeler-button.primary {
          background: white;
          color: #667eea;
        }

        .feeler-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .feeler-button.secondary {
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .feeler-button.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .current-set-info {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 24px 40px;
          margin: 16px 0;
        }

        .weight-display {
          font-size: 36px;
          font-weight: 700;
        }

        .reps-display {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 4px;
        }

        .feeler-tip {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-style: italic;
        }

        .feedback-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 320px;
        }

        .feedback-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .feedback-option:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .feedback-option.selected {
          background: white;
          color: #667eea;
          border-color: white;
        }

        .feedback-emoji {
          font-size: 24px;
        }

        .feedback-label {
          font-size: 14px;
          line-height: 1.3;
        }

        .result-card {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 20px 32px;
          margin: 16px 0;
        }

        .result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .result-label {
          color: rgba(255, 255, 255, 0.8);
        }

        .result-value.highlight {
          font-size: 24px;
          font-weight: 700;
        }

        .result-adjustment {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-top: 8px;
        }

        .result-confidence {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
