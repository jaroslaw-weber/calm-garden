import React, { useState, useEffect, useCallback } from 'react';

interface BreathingExerciseProps {
  onPointsEarned: (amount: number) => void;
  onStateChange: (isActive: boolean) => void;
}

type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

const PHASE_DURATION = 4000; // 4 seconds per phase
const PHASES: BreathingPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];

export function BreathingExercise({ onPointsEarned, onStateChange }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('idle');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const startExercise = useCallback(() => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setPhaseProgress(0);
    onStateChange(true);
  }, [onStateChange]);

  const stopExercise = useCallback(() => {
    setIsActive(false);
    setCurrentPhase('idle');
    setPhaseProgress(0);
    setTotalSeconds(0);
    onStateChange(false);
  }, [onStateChange]);

  // Points earning - 1 coin per second
  useEffect(() => {
    if (!isActive) return;

    const pointsInterval = setInterval(() => {
      setTotalSeconds(prev => {
        const newTotal = prev + 1;
        onPointsEarned(1);
        return newTotal;
      });
    }, 1000);

    return () => clearInterval(pointsInterval);
  }, [isActive, onPointsEarned]);

  // Animation loop
  useEffect(() => {
    if (!isActive) return;

    let startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / PHASE_DURATION, 1);
      setPhaseProgress(progress);

      if (progress >= 1) {
        // Move to next phase
        const currentIndex = PHASES.indexOf(currentPhase);
        const nextIndex = (currentIndex + 1) % PHASES.length;
        const nextPhase = PHASES[nextIndex];
        
        setCurrentPhase(nextPhase);
        startTime = Date.now();
        
        // If we completed a full cycle (back to inhale)
        if (nextPhase === 'inhale' && currentPhase === 'hold-out') {
          setCycleCount(prev => prev + 1);
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isActive, currentPhase]);

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case 'inhale': return 'Inhale';
      case 'hold-in': return 'Hold';
      case 'exhale': return 'Exhale';
      case 'hold-out': return 'Hold';
      case 'idle': return 'Ready?';
      default: return '';
    }
  };

  // Calculate fill percentage based on phase
  const getFillPercentage = () => {
    if (!isActive) return 0;
    
    switch (currentPhase) {
      case 'inhale':
        return phaseProgress * 100; // 0% to 100%
      case 'hold-in':
        return 100; // Stay at 100%
      case 'exhale':
        return (1 - phaseProgress) * 100; // 100% to 0%
      case 'hold-out':
        return 0; // Stay at 0%
      default:
        return 0;
    }
  };

  const fillPercentage = getFillPercentage();

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Box Breathing</h2>
      
      {/* Breathing Circle with Wave Fill */}
      <div className="relative w-64 h-64 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-blue-300 rounded-full overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-blue-100" />
          
          {/* Wave fill animation */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-100"
            style={{
              height: `${fillPercentage}%`,
            }}
          >
            {/* Wave effect at top of fill */}
            {(currentPhase === 'inhale' || currentPhase === 'exhale') && (
              <svg
                className="absolute -top-3 left-0 w-full h-4"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z"
                  fill="#60a5fa"
                  className="animate-pulse"
                >
                  <animate
                    attributeName="d"
                    dur="1s"
                    repeatCount="indefinite"
                    values="
                      M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z;
                      M0,10 Q25,20 50,10 T100,10 L100,20 L0,20 Z;
                      M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z
                    "
                  />
                </path>
              </svg>
            )}
          </div>
          
          {/* Phase text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-900 drop-shadow-lg bg-white bg-opacity-70 px-4 py-2 rounded-full">
              {getPhaseLabel()}
            </span>
          </div>
        </div>
        
        {/* Phase indicators */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
          {PHASES.map((phase, index) => (
            <div
              key={phase}
              className={`w-3 h-3 rounded-full transition-all ${
                phase === currentPhase
                  ? 'bg-blue-600 scale-125'
                  : 'bg-blue-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-4 mt-8">
        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${phaseProgress * 100}%` }}
          />
        </div>
        <p className="text-center text-blue-600 mt-2 text-sm">
          {Math.ceil((1 - phaseProgress) * 4)} seconds remaining
        </p>
      </div>

      {/* Stats */}
      <div className="text-center mb-6 space-y-1">
        <p className="text-lg text-blue-700">
          Completed cycles: <span className="font-bold">{cycleCount}</span>
        </p>
        
        <p className="text-sm text-blue-600">
          Session time: <span className="font-bold">{Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        {!isActive ? (
          <button
            onClick={startExercise}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold text-lg transition-all"
          >
            Start Breathing
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsActive(false)}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold transition-all"
            >
              ⏸ Pause
            </button>
            <button
              onClick={stopExercise}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-all"
            >
              ⏹ Stop & Save
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-blue-600 text-sm max-w-md">
        <p className="mb-2">Watch the water fill up:</p>
        <p>🌊 Inhale → Fill to 100% → Hold → Exhale → Empty → Hold</p>
        <p className="mt-2 font-semibold">💰 Earn 1 coin per second!</p>
        <p className="mt-1 text-xs text-blue-400">Pause anytime, stop when you're done</p>
      </div>
    </div>
  );
}
