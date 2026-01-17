import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../lib/i18n';
import type {
  QuickStartData,
  QuickStartGoal,
  QuickStartLocation,
  ExperienceLevel,
} from '@trainsmart/shared';
import {
  determineInitialLevel,
  getConservativeParams,
  createCalibrationData,
  generateProgramOptionsFromQuickStart,
} from '@trainsmart/shared';

// ============================================================
// TYPES
// ============================================================

type QuickStartStep = 'goal' | 'location' | 'frequency' | 'pain' | 'experience' | 'generating';

interface QuickStartFlowProps {
  userId: string;
  onComplete: (data: QuickStartData) => Promise<void>;
}

// ============================================================
// GOAL OPTIONS
// ============================================================

const GOAL_OPTIONS: { value: QuickStartGoal; emoji: string; labelKey: string }[] = [
  { value: 'forza', emoji: '💪', labelKey: 'quickStart.goal.strength' },
  { value: 'massa', emoji: '🏋️', labelKey: 'quickStart.goal.muscle' },
  { value: 'dimagrimento', emoji: '🔥', labelKey: 'quickStart.goal.fatLoss' },
  { value: 'resistenza', emoji: '🏃', labelKey: 'quickStart.goal.endurance' },
  { value: 'generale', emoji: '🎯', labelKey: 'quickStart.goal.general' },
];

// ============================================================
// PAIN AREAS
// ============================================================

const PAIN_AREAS = [
  { id: 'shoulders', labelKey: 'pain.shoulders' },
  { id: 'elbows', labelKey: 'pain.elbows' },
  { id: 'wrists', labelKey: 'pain.wrists' },
  { id: 'upper_back', labelKey: 'pain.upperBack' },
  { id: 'lower_back', labelKey: 'pain.lowerBack' },
  { id: 'hips', labelKey: 'pain.hips' },
  { id: 'knees', labelKey: 'pain.knees' },
  { id: 'ankles', labelKey: 'pain.ankles' },
];

// ============================================================
// EXPERIENCE OPTIONS
// ============================================================

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; labelKey: string }[] = [
  { value: 'never', labelKey: 'quickStart.experience.never' },
  { value: 'sometimes', labelKey: 'quickStart.experience.sometimes' },
  { value: 'regularly', labelKey: 'quickStart.experience.regularly' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function QuickStartFlow({ userId, onComplete }: QuickStartFlowProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Current step
  const [step, setStep] = useState<QuickStartStep>('goal');

  // Form data
  const [goal, setGoal] = useState<QuickStartGoal | null>(null);
  const [location, setLocation] = useState<QuickStartLocation | null>(null);
  const [frequency, setFrequency] = useState<2 | 3 | 4 | 5 | 6 | null>(null);
  const [painAreas, setPainAreas] = useState<string[]>([]);
  const [hasPain, setHasPain] = useState<boolean | null>(null);
  const [experience, setExperience] = useState<{
    squat: ExperienceLevel | null;
    push: ExperienceLevel | null;
    hinge: ExperienceLevel | null;
  }>({ squat: null, push: null, hinge: null });

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleGoalSelect = (selectedGoal: QuickStartGoal) => {
    setGoal(selectedGoal);
    setStep('location');
  };

  const handleLocationSelect = (selectedLocation: QuickStartLocation) => {
    setLocation(selectedLocation);
    setStep('frequency');
  };

  const handleFrequencySelect = (selectedFrequency: 2 | 3 | 4 | 5 | 6) => {
    setFrequency(selectedFrequency);
    setStep('pain');
  };

  const handlePainToggle = (area: string) => {
    setPainAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handlePainComplete = () => {
    setStep('experience');
  };

  const handleExperienceSelect = (
    pattern: 'squat' | 'push' | 'hinge',
    level: ExperienceLevel
  ) => {
    setExperience(prev => ({ ...prev, [pattern]: level }));
  };

  const handleComplete = async () => {
    if (!goal || !location || !frequency) return;

    // Validate experience
    if (!experience.squat || !experience.push || !experience.hinge) return;

    setStep('generating');
    setIsGenerating(true);
    setError(null);

    try {
      const quickStartData: QuickStartData = {
        goal,
        location,
        frequency,
        painAreas: hasPain === false ? [] : painAreas,
        experience: {
          squat: experience.squat,
          push: experience.push,
          hinge: experience.hinge,
        },
      };

      await onComplete(quickStartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si e verificato un errore');
      setStep('experience');
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceedExperience =
    experience.squat && experience.push && experience.hinge;

  // ============================================================
  // RENDER STEPS
  // ============================================================

  const renderGoalStep = () => (
    <div className="quick-start-step">
      <h2 className="step-title">{t('quickStart.goal.title')}</h2>
      <p className="step-subtitle">{t('quickStart.goal.subtitle')}</p>

      <div className="goal-grid">
        {GOAL_OPTIONS.map(option => (
          <button
            key={option.value}
            className={`goal-option ${goal === option.value ? 'selected' : ''}`}
            onClick={() => handleGoalSelect(option.value)}
          >
            <span className="goal-emoji">{option.emoji}</span>
            <span className="goal-label">{t(option.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <div className="quick-start-step">
      <h2 className="step-title">{t('quickStart.location.title')}</h2>

      <div className="location-options">
        <button
          className={`location-option ${location === 'home' ? 'selected' : ''}`}
          onClick={() => handleLocationSelect('home')}
        >
          <span className="location-emoji">🏠</span>
          <span className="location-label">{t('quickStart.location.home')}</span>
        </button>
        <button
          className={`location-option ${location === 'gym' ? 'selected' : ''}`}
          onClick={() => handleLocationSelect('gym')}
        >
          <span className="location-emoji">🏢</span>
          <span className="location-label">{t('quickStart.location.gym')}</span>
        </button>
      </div>

      <button className="back-button" onClick={() => setStep('goal')}>
        {t('common.back')}
      </button>
    </div>
  );

  const renderFrequencyStep = () => (
    <div className="quick-start-step">
      <h2 className="step-title">{t('quickStart.frequency.title')}</h2>
      <p className="step-subtitle">{t('quickStart.frequency.subtitle')}</p>

      <div className="frequency-options">
        {([2, 3, 4, 5, 6] as const).map(num => (
          <button
            key={num}
            className={`frequency-option ${frequency === num ? 'selected' : ''}`}
            onClick={() => handleFrequencySelect(num)}
          >
            {num}
          </button>
        ))}
      </div>

      <button className="back-button" onClick={() => setStep('location')}>
        {t('common.back')}
      </button>
    </div>
  );

  const renderPainStep = () => (
    <div className="quick-start-step">
      <h2 className="step-title">{t('quickStart.pain.title')}</h2>

      {hasPain === null ? (
        <div className="pain-initial">
          <button
            className="pain-choice no-pain"
            onClick={() => {
              setHasPain(false);
              setPainAreas([]);
              handlePainComplete();
            }}
          >
            {t('quickStart.pain.noPain')}
          </button>
          <button
            className="pain-choice has-pain"
            onClick={() => setHasPain(true)}
          >
            {t('quickStart.pain.hasPain')}
          </button>
        </div>
      ) : (
        <>
          <p className="step-subtitle">{t('quickStart.pain.selectAreas')}</p>
          <div className="pain-areas-grid">
            {PAIN_AREAS.map(area => (
              <button
                key={area.id}
                className={`pain-area ${painAreas.includes(area.id) ? 'selected' : ''}`}
                onClick={() => handlePainToggle(area.id)}
              >
                {t(area.labelKey)}
              </button>
            ))}
          </div>
          <button
            className="continue-button"
            onClick={handlePainComplete}
          >
            {t('common.continue')}
          </button>
        </>
      )}

      <button className="back-button" onClick={() => {
        setHasPain(null);
        setStep('frequency');
      }}>
        {t('common.back')}
      </button>
    </div>
  );

  const renderExperienceStep = () => (
    <div className="quick-start-step">
      <h2 className="step-title">{t('quickStart.experience.title')}</h2>

      <div className="experience-section">
        <p className="experience-label">{t('quickStart.experience.squat')}</p>
        <div className="experience-options">
          {EXPERIENCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`experience-option ${experience.squat === opt.value ? 'selected' : ''}`}
              onClick={() => handleExperienceSelect('squat', opt.value)}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="experience-section">
        <p className="experience-label">{t('quickStart.experience.push')}</p>
        <div className="experience-options">
          {EXPERIENCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`experience-option ${experience.push === opt.value ? 'selected' : ''}`}
              onClick={() => handleExperienceSelect('push', opt.value)}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="experience-section">
        <p className="experience-label">{t('quickStart.experience.hinge')}</p>
        <div className="experience-options">
          {EXPERIENCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`experience-option ${experience.hinge === opt.value ? 'selected' : ''}`}
              onClick={() => handleExperienceSelect('hinge', opt.value)}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <button
        className="continue-button primary"
        onClick={handleComplete}
        disabled={!canProceedExperience || isGenerating}
      >
        {isGenerating ? t('quickStart.generating') : t('quickStart.getProgram')}
      </button>

      <button className="back-button" onClick={() => setStep('pain')}>
        {t('common.back')}
      </button>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="quick-start-step generating">
      <div className="spinner" />
      <h2>{t('quickStart.generating')}</h2>
      <p>{t('quickStart.generatingDesc')}</p>
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="quick-start-flow">
      {/* Progress indicator */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${
              step === 'goal' ? 20 :
              step === 'location' ? 40 :
              step === 'frequency' ? 60 :
              step === 'pain' ? 80 :
              100
            }%`
          }}
        />
      </div>

      {/* Step content */}
      {step === 'goal' && renderGoalStep()}
      {step === 'location' && renderLocationStep()}
      {step === 'frequency' && renderFrequencyStep()}
      {step === 'pain' && renderPainStep()}
      {step === 'experience' && renderExperienceStep()}
      {step === 'generating' && renderGeneratingStep()}

      {/* Styles */}
      <style>{`
        .quick-start-flow {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .progress-bar {
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          margin-bottom: 32px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .quick-start-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .step-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          text-align: center;
        }

        .step-subtitle {
          color: #666;
          text-align: center;
          margin: 0;
        }

        .goal-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 20px;
        }

        .goal-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .goal-option:hover {
          border-color: #3b82f6;
        }

        .goal-option.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .goal-emoji {
          font-size: 32px;
        }

        .goal-label {
          font-size: 14px;
          font-weight: 500;
        }

        .location-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 20px;
        }

        .location-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .location-option:hover {
          border-color: #3b82f6;
        }

        .location-option.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .location-emoji {
          font-size: 48px;
        }

        .location-label {
          font-size: 16px;
          font-weight: 500;
        }

        .frequency-options {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 20px;
        }

        .frequency-option {
          width: 56px;
          height: 56px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          font-size: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .frequency-option:hover {
          border-color: #3b82f6;
        }

        .frequency-option.selected {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }

        .pain-initial {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 20px;
        }

        .pain-choice {
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pain-choice:hover {
          border-color: #3b82f6;
        }

        .pain-choice.no-pain {
          border-color: #22c55e;
          color: #166534;
        }

        .pain-choice.has-pain {
          border-color: #f59e0b;
          color: #92400e;
        }

        .pain-areas-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 16px;
        }

        .pain-area {
          padding: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pain-area:hover {
          border-color: #f59e0b;
        }

        .pain-area.selected {
          border-color: #f59e0b;
          background: #fef3c7;
          color: #92400e;
        }

        .experience-section {
          margin-bottom: 20px;
        }

        .experience-label {
          font-weight: 500;
          margin-bottom: 10px;
        }

        .experience-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .experience-option {
          padding: 12px 8px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .experience-option:hover {
          border-color: #3b82f6;
        }

        .experience-option.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .continue-button {
          padding: 16px;
          border: none;
          border-radius: 12px;
          background: #3b82f6;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: auto;
        }

        .continue-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .continue-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .back-button {
          padding: 12px;
          border: none;
          background: transparent;
          color: #666;
          font-size: 14px;
          cursor: pointer;
          margin-top: 12px;
        }

        .back-button:hover {
          color: #333;
        }

        .error-message {
          color: #dc2626;
          text-align: center;
          padding: 10px;
          background: #fef2f2;
          border-radius: 8px;
        }

        .generating {
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e0e0e0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
