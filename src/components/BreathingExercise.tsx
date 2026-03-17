import React, { useState, useEffect, useCallback } from 'react';

interface BreathingExerciseProps {
  onPointsEarned: (amount: number) => void;
  onStateChange: (isActive: boolean) => void;
}

type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  phases: BreathingPhase[];
  durations: number[]; // milliseconds for each phase
  emoji: string;
}

const PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal 4-4-4-4 pattern for focus and calm',
    phases: ['inhale', 'hold-in', 'exhale', 'hold-out'],
    durations: [4000, 4000, 4000, 4000],
    emoji: '📦',
  },
  {
    id: 'four-seven-eight',
    name: '4-7-8 Relaxing',
    description: 'Inhale 4s, hold 7s, exhale 8s for deep relaxation',
    phases: ['inhale', 'hold-in', 'exhale', 'hold-out'],
    durations: [4000, 7000, 8000, 0],
    emoji: '😌',
  },
  {
    id: 'six-three-six',
    name: '6-3-6-3 Balanced',
    description: 'Longer cycles with moderate holds',
    phases: ['inhale', 'hold-in', 'exhale', 'hold-out'],
    durations: [6000, 3000, 6000, 3000],
    emoji: '⚖️',
  },
  {
    id: 'five-five',
    name: '5-5 Coherent',
    description: 'Equal breathing for heart-brain coherence',
    phases: ['inhale', 'exhale'],
    durations: [5000, 5000],
    emoji: '💫',
  },
  {
    id: 'two-four-six',
    name: '2-4-6 Calming',
    description: 'Quick inhale, long exhale for stress relief',
    phases: ['inhale', 'hold-in', 'exhale', 'hold-out'],
    durations: [2000, 4000, 6000, 0],
    emoji: '🌊',
  },
];

export function BreathingExercise({ onPointsEarned, onStateChange }: BreathingExerciseProps) {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(PATTERNS[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('idle');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [showPatternSelector, setShowPatternSelector] = useState(false);

  const getCurrentPhaseDuration = useCallback(() => {
    if (currentPhase === 'idle') return 0;
    const phaseIndex = selectedPattern.phases.indexOf(currentPhase);
    return selectedPattern.durations[phaseIndex] || 4000;
  }, [currentPhase, selectedPattern]);

  const startExercise = useCallback(() => {
    setIsActive(true);
    setCurrentPhase(selectedPattern.phases[0]);
    setPhaseProgress(0);
    onStateChange(true);
  }, [onStateChange, selectedPattern]);

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
      const phaseDuration = getCurrentPhaseDuration();
      const elapsed = Date.now() - startTime;
      const progress = phaseDuration > 0 ? Math.min(elapsed / phaseDuration, 1) : 1;
      setPhaseProgress(progress);

      if (progress >= 1) {
        // Move to next phase
        const currentIndex = selectedPattern.phases.indexOf(currentPhase);
        const nextIndex = (currentIndex + 1) % selectedPattern.phases.length;
        const nextPhase = selectedPattern.phases[nextIndex];
        
        setCurrentPhase(nextPhase);
        startTime = Date.now();
        
        // If we completed a full cycle (back to first phase)
        if (nextIndex === 0) {
          setCycleCount(prev => prev + 1);
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isActive, currentPhase, selectedPattern, getCurrentPhaseDuration]);

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

  const getPhaseSecondsRemaining = () => {
    const phaseDuration = getCurrentPhaseDuration();
    return Math.ceil((1 - phaseProgress) * (phaseDuration / 1000));
  };

  const handlePatternSelect = (pattern: BreathingPattern) => {
    if (isActive) {
      // Stop current exercise if pattern changes
      stopExercise();
    }
    setSelectedPattern(pattern);
    setShowPatternSelector(false);
  };

  const formatDuration = (ms: number) => {
    if (ms === 0) return '0s';
    return `${ms / 1000}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-lg shadow-md">
      {/* Pattern selector header */}
      <div className="w-full flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-800">{selectedPattern.name}</h2>
        <button
          onClick={() => setShowPatternSelector(!showPatternSelector)}
          disabled={isActive}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-200 hover:bg-blue-300 text-blue-800'
          }`}
        >
          Change Pattern
        </button>
      </div>
      
      {/* Pattern description */}
      <p className="text-blue-600 text-center mb-4 max-w-md">
        {selectedPattern.description}
      </p>

      {/* Pattern selector panel */}
      {showPatternSelector && (
        <div className="w-full max-w-md mb-6 p-4 bg-white rounded-lg shadow-md border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3">Select Breathing Pattern:</h3>
          <div className="space-y-2">
            {PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => handlePatternSelect(pattern)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedPattern.id === pattern.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pattern.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-blue-900">{pattern.name}</div>
                    <div className="text-xs text-blue-600">
                      {pattern.phases.map((phase, i) => 
                        `${phase === 'inhale' ? 'In' : phase === 'exhale' ? 'Ex' : 'H'}-${formatDuration(pattern.durations[i])}`
                      ).join(' • ')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
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
          {selectedPattern.phases.map((phase, index) => (
            <div
              key={`${phase}-${index}`}
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
          {getPhaseSecondsRemaining()} seconds remaining
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
        <p>
          {selectedPattern.phases.map((phase, i) => {
            const icons: Record<string, string> = {
              'inhale': '🌊 Inhale',
              'hold-in': '✋ Hold',
              'exhale': '💨 Exhale',
              'hold-out': '✋ Hold',
            };
            const duration = formatDuration(selectedPattern.durations[i]);
            return `${icons[phase]} ${duration}`;
          }).join(' → ')}
        </p>
        <p className="mt-2 font-semibold">💰 Earn 1 coin per second!</p>
        <p className="mt-1 text-xs text-blue-400">Pause anytime, stop when you're done</p>
      </div>
    </div>
  );
}
