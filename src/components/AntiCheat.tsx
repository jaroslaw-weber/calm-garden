import React, { useState, useEffect, useCallback, useRef } from 'react';

interface AntiCheatModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onTimeout: () => void;
  timeRemaining: number;
}

function AntiCheatModal({ isOpen, onConfirm, onTimeout, timeRemaining }: AntiCheatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="text-6xl mb-4">👋</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Still there?</h2>
        
        <p className="text-gray-600 mb-6">
          Please confirm you're still breathing mindfully. <br/>
          <span className="font-semibold text-red-500">
            If you don't respond, all session coins will be lost!
          </span>
        </p>
        
        <div className="mb-6">
          <div className="text-4xl font-bold text-red-600">
            {Math.ceil(timeRemaining / 1000)}s
          </div>
          <p className="text-sm text-gray-500">time remaining</p>
        </div>
        
        <button
          onClick={onConfirm}
          className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors text-lg"
        >
          ✅ Yes, I'm here!
        </button>
      </div>
    </div>
  );
}

interface AntiCheatManagerProps {
  isActive: boolean;
  onPointsReset: () => void;
  sessionPoints: number;
}

export function AntiCheatManager({ isActive, onPointsReset, sessionPoints }: AntiCheatManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60000); // 1 minute to respond
  const lastCheckTime = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const responseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCheckInterval = useCallback(() => {
    // Check every 1 minute
    checkIntervalRef.current = setInterval(() => {
      setShowModal(true);
      setTimeRemaining(60000);
      
      // Start countdown for response
      responseIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 100;
          if (newTime <= 0) {
            // Timeout! Reset points
            onPointsReset();
            setShowModal(false);
            if (responseIntervalRef.current) {
              clearInterval(responseIntervalRef.current);
            }
            return 0;
          }
          return newTime;
        });
      }, 100);
    }, 60000); // 1 minute
  }, [onPointsReset]);

  const stopCheckInterval = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (responseIntervalRef.current) {
      clearInterval(responseIntervalRef.current);
      responseIntervalRef.current = null;
    }
    setShowModal(false);
    setTimeRemaining(60000);
  }, []);

  const handleConfirm = () => {
    setShowModal(false);
    setTimeRemaining(60000);
    if (responseIntervalRef.current) {
      clearInterval(responseIntervalRef.current);
      responseIntervalRef.current = null;
    }
  };

  const handleTimeout = () => {
    onPointsReset();
    setShowModal(false);
  };

  useEffect(() => {
    if (isActive) {
      startCheckInterval();
    } else {
      stopCheckInterval();
    }

    return () => {
      stopCheckInterval();
    };
  }, [isActive, startCheckInterval, stopCheckInterval]);

  return (
    <AntiCheatModal
      isOpen={showModal}
      onConfirm={handleConfirm}
      onTimeout={handleTimeout}
      timeRemaining={timeRemaining}
    />
  );
}
