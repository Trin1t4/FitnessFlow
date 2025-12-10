import { useState, useEffect, useMemo } from 'react';

// Lista di tutti i video disponibili
const EXERCISE_VIDEOS = [
  'cable-crunch.mp4',
  'assisted-pull-up.mp4',
  'hanging-leg-raise.mp4',
  'half-kneeling-chop.mp4',
  'bulgarian-split-squat.mp4',
  'step-up.mp4',
  'seated-cable-row.mp4',
  'conventional-deadlift.mp4',
  'bird-dog-modified.mp4',
  'chin-up.mp4',
  'incline-push-up.mp4',
  'military-press.mp4',
  'wall-push-up.mp4',
  'nordic-hamstring-curl.mp4',
  'front-raise.mp4',
  'bodyweight-squat.mp4',
  'modified-squat.mp4',
  'plank.mp4',
  'front-squat.mp4',
  'supine-marching.mp4',
  't-bar-row.mp4',
  'flat-barbell-bench-press.mp4',
  'tricep-pushdown.mp4',
  'shoulder-blade-squeeze.mp4',
  'decline-push-up.mp4',
  'bodyweight-hip-hinge.mp4',
  'pallof-press.mp4',
  'glute-bridge.mp4',
  'diamond-push-up.mp4',
  'romanian-deadlift.mp4',
  'pike-push-up.mp4',
  'standard-pull-up.mp4',
  'barbell-row.mp4',
  'sumo-deadlift.mp4',
  'dead-bug-progression.mp4',
  'lunges.mp4',
  'side-plank-modified.mp4',
  'standing-calf-raise.mp4',
  'standard-push-up.mp4',
  'deep-squat-hold.mp4',
  'barbell-curl.mp4',
  'good-morning.mp4',
  'clamshells.mp4',
  'lat-pulldown.mp4',
  'face-pull.mp4',
  'cat-cow.mp4',
  'arnold-press.mp4',
  'dumbbell-row.mp4',
  'tricep-dips.mp4',
  'squat-to-stand.mp4',
  'leg-extension.mp4',
  'pistol-squat.mp4',
  'dumbbell-bench-press.mp4',
  'hip-thrust.mp4',
  'leg-press.mp4',
  'bird-dog.mp4',
  'skull-crushers.mp4',
  'inverted-row.mp4',
  'chest-dips.mp4',
  'lateral-raise.mp4',
  'hammer-curl.mp4',
  'goblet-squat.mp4',
  'dead-bug.mp4',
  'bear-hold.mp4',
  'dumbbell-shoulder-press.mp4',
  'ab-wheel-rollout.mp4',
  'back-squat.mp4',
  'leg-curl.mp4',
];

interface VideoMosaicBackgroundProps {
  videoCount?: number;
  opacity?: number;
  blur?: number;
  className?: string;
}

export default function VideoMosaicBackground({
  videoCount = 12,
  opacity = 0.08,
  blur = 1,
  className = '',
}: VideoMosaicBackgroundProps) {
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set());

  // Seleziona video casuali al mount
  const selectedVideos = useMemo(() => {
    const shuffled = [...EXERCISE_VIDEOS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, videoCount);
  }, [videoCount]);

  // Calcola griglia ottimale
  const gridConfig = useMemo(() => {
    if (videoCount <= 4) return { cols: 2, rows: 2 };
    if (videoCount <= 6) return { cols: 3, rows: 2 };
    if (videoCount <= 9) return { cols: 3, rows: 3 };
    if (videoCount <= 12) return { cols: 4, rows: 3 };
    return { cols: 4, rows: 4 };
  }, [videoCount]);

  const handleVideoLoaded = (index: number) => {
    setLoadedVideos(prev => new Set([...prev, index]));
  };

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      style={{
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      <div
        className="absolute inset-0 grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
          transform: 'scale(1.1)', // Evita bordi visibili
        }}
      >
        {selectedVideos.map((video, index) => (
          <div
            key={video}
            className="relative overflow-hidden"
            style={{
              opacity: loadedVideos.has(index) ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
            }}
          >
            <video
              src={`/videos/exercises/${video}`}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => handleVideoLoaded(index)}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                // Offset casuale per evitare sincronizzazione
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Overlay gradient per sfumare i bordi */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 30%, rgba(15, 23, 42, 0.8) 100%)
          `,
        }}
      />
    </div>
  );
}
