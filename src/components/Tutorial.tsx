import React, { useState, useEffect } from 'react';

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Calm Garden! 🌿",
      content: "Take a moment to breathe and grow your own peaceful garden. This app helps you practice box breathing while earning rewards.",
      icon: "🌱"
    },
    {
      title: "How to Breathe 🫁",
      content: "Follow the circle: Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. The water will fill up as you inhale and empty as you exhale.",
      icon: "🌊"
    },
    {
      title: "Earn Coins ⭐",
      content: "You earn 1 coin for every second you practice. The longer you breathe mindfully, the more coins you collect!",
      icon: "💰"
    },
    {
      title: "Build Your Garden 🌸",
      content: "Use your coins to buy plants and upgrade them. Create your own beautiful garden space. You can even share it with friends!",
      icon: "🏡"
    },
    {
      title: "Stay Focused 🎯",
      content: "We'll check in with you every minute to make sure you're really practicing. If you don't respond, you'll lose your session coins.",
      icon: "✋"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('calm-garden-tutorial-completed', 'true');
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('calm-garden-tutorial-completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep ? 'bg-green-500 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="text-6xl mb-4">{steps[currentStep].icon}</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {steps[currentStep].title}
        </h2>

        {/* Content */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {steps[currentStep].content}
        </p>

        {/* Step counter */}
        <p className="text-sm text-gray-400 mb-6">
          Step {currentStep + 1} of {steps.length}
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Skip Tutorial
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            {currentStep === steps.length - 1 ? "Start Growing! 🌿" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
