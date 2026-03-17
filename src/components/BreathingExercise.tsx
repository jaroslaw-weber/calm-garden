import React, { useState, useEffect, useCallback } from 'react';

interface BreathingExerciseProps {
  onCycleComplete: () => void;
}

type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

const PHASE_DURATION = 4000; // 4 seconds per phase
const PHASES: BreathingPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];

export function BreathingExercise({ onCycleComplete }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('idle');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const startExercise = useCallback(() => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setPhaseProgress(0);
  }, []);

  const stopExercise = useCallback(() => {
    setIsActive(false);
    setCurrentPhase('idle');
    setPhaseProgress(0);
  }, []);

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
          onCycleComplete();
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isActive, currentPhase, onCycleComplete]);

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

  const getCircleScale = () => {
    if (!isActive) return 1;
    
    switch (currentPhase) {
      case 'inhale':
        return 1 + phaseProgress * 0.5; // Grow from 1 to 1.5
      case 'hold-in':
        return 1.5;
      case 'exhale':
        return 1.5 - phaseProgress * 0.5; // Shrink from 1.5 to 1
      case 'hold-out':
        return 1;
      default:
        return 1;
    }
  };

  const getCircleOpacity = () => {
    if (!isActive) return 0.3;
    return 0.6 + phaseProgress * 0.4;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Box Breathing</h2>
      
      {/* Breathing Circle */}
      <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
        
        {/* Animated circle */}
        <div
          className="w-32 h-32 bg-blue-400 rounded-full transition-transform duration-100"
          style={{
            transform: `scale(${getCircleScale()})`,
            opacity: getCircleOpacity(),
          }}
        />
        
        {/* Phase text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold text-blue-900">
            {getPhaseLabel()}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-6">
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
      <div className="text-center mb-6">
        <p className="text-lg text-blue-700">
          Completed cycles: <span className="font-bold">{cycleCount}</span>
        </p>
      </div>

      {/* Controls */}
      <button
        onClick={isActive ? stopExercise : startExercise}
        className={`
          px-8 py-3 rounded-full font-semibold text-lg transition-all
          ${isActive 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
        `}
      >
        {isActive ? 'Stop' : 'Start Breathing'}
      </button>

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
        <p className="mb-2">Follow the circle:</p>
        <p>🌬️ Inhale 4s → Hold 4s → Exhale 4s → Hold 4s</p>
        <p className="mt-2 font-semibold">💰 Earn 10 coins per cycle!</p>
        <p className="mt-1 text-xs text-blue-400">Pause anytime, stop when you're done</p>
      </div>
    </div>
  );
}
