import React from 'react';

export function ProgressBar({ currentStep, totalSteps, steps }) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center ${
              index < steps.length - 1 ? 'flex-1' : ''
            }`}
          >
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index + 1 <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400'
                }
              `}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-sm ${
                index + 1 <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}