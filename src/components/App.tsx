import React, { useState, useEffect } from 'react';
import { BreathingExercise } from './BreathingExercise';
import { GardenEditor } from './GardenEditor';
import { Attributions } from './Attributions';
import { AntiCheatManager } from './AntiCheat';
import { Tutorial } from './Tutorial';

type ViewMode = 'welcome' | 'breathing' | 'garden';

export function App() {
  const [points, setPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Load points from localStorage and check if tutorial was completed
  useEffect(() => {
    const saved = localStorage.getItem('calm-garden-points');
    if (saved) {
      setPoints(parseInt(saved, 10));
    }
    
    // Show tutorial if not completed
    const tutorialCompleted = localStorage.getItem('calm-garden-tutorial-completed');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  // Save points to localStorage
  useEffect(() => {
    localStorage.setItem('calm-garden-points', points.toString());
  }, [points]);

  const handlePointsEarned = (amount: number) => {
    setPoints(prev => prev + amount);
    setSessionPoints(prev => prev + amount);
  };

  const handleSpendPoints = (amount: number): boolean => {
    if (points >= amount) {
      setPoints(prev => prev - amount);
      return true;
    }
    return false;
  };

  const handleResetSessionPoints = () => {
    // Remove session points from total
    setPoints(prev => Math.max(0, prev - sessionPoints));
    setSessionPoints(0);
    alert('You were away too long. Session coins have been reset to prevent cheating. Please practice mindfully! 🌸');
  };

  const handleBreathingStateChange = (isActive: boolean) => {
    setIsBreathingActive(isActive);
    if (!isActive) {
      // Reset session points when stopping
      setSessionPoints(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      {/* Tutorial */}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      
      {/* Anti-cheat system - only active during breathing */}
      <AntiCheatManager
        isActive={isBreathingActive}
        onPointsReset={handleResetSessionPoints}
        sessionPoints={sessionPoints}
      />

      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-800">🌿 Calm Garden</h1>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-yellow-100 rounded-full">
              <span className="font-bold text-yellow-800">
                ⭐ {points} coins
              </span>
            </div>
            
            {/* Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('welcome')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'welcome'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setViewMode('breathing')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'breathing'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Breathe
              </button>
              <button
                onClick={() => setViewMode('garden')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'garden'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Garden
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {viewMode === 'welcome' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-8">
              <span className="text-8xl">🌳</span>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Calm Garden
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Practice box breathing to collect coins and grow your own peaceful garden. 
              Earn 1 coin per second while breathing mindfully!
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setViewMode('breathing')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white text-xl font-bold rounded-full shadow-lg transition-all transform hover:scale-105"
              >
                Start Breathing Exercise to Collect Coins 🌟
              </button>
              
              {points > 0 && (
                <button
                  onClick={() => setViewMode('garden')}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold rounded-full shadow-md transition-colors"
                >
                  Go to Garden ({points} coins) 🌱
                </button>
              )}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div className="p-4">
                <div className="text-4xl mb-2">🫁</div>
                <p className="font-semibold text-gray-700">Breathe</p>
                <p className="text-sm text-gray-500">Follow the 4-4-4-4 pattern</p>
              </div>
              <div className="p-4">
                <div className="text-4xl mb-2">⭐</div>
                <p className="font-semibold text-gray-700">Earn</p>
                <p className="text-sm text-gray-500">Collect 1 coin per second</p>
              </div>
              <div className="p-4">
                <div className="text-4xl mb-2">🌸</div>
                <p className="font-semibold text-gray-700">Grow</p>
                <p className="text-sm text-gray-500">Build your dream garden</p>
              </div>
            </div>          
          </div>
        )}

        {viewMode === 'breathing' && (
          <div className="max-w-2xl mx-auto">
            <BreathingExercise 
              onPointsEarned={handlePointsEarned}
              onStateChange={handleBreathingStateChange}
            />
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setViewMode('garden')}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors"
              >
                Spend Your {points} Coins in the Garden 🌱
              </button>
            </div>
          </div>
        )}

        {viewMode === 'garden' && (
          <div className="max-w-4xl mx-auto">
            <GardenEditor points={points} onSpendPoints={handleSpendPoints} onEarnPoints={handlePointsEarned} />
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setViewMode('breathing')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-colors"
              >
                Earn More Coins 🌟
              </button>
            </div>
          </div>
        )}
      </main>

      <Attributions />
    </div>
  );
}
