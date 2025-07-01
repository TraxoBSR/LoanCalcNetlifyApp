import React, { useState } from 'react';
import { Info } from 'lucide-react';

export function Tooltip({ content, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <Info
        size={16}
        className="text-gray-400 hover:text-gray-600 cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg -left-32 top-full">
          {content}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -top-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
}