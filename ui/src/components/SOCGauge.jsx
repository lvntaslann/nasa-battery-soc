import React, { useEffect, useState } from 'react';

const SOCGauge = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value]);

  const radius = 120;
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayValue / 100) * circumference;
  
  const getColor = (percentage) => {
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getStrokeColor = (percentage) => {
    if (percentage >= 70) return '#10B981';
    if (percentage >= 30) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="relative inline-block">
      <svg
        className="transform -rotate-90"
        width="280"
        height="280"
        viewBox="0 0 280 280"
      >
        {/* Background circle */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          stroke={getStrokeColor(displayValue)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out drop-shadow-sm"
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-5xl font-bold ${getColor(displayValue)} mb-2`}>
            {displayValue.toFixed(1)}%
          </div>
          <div className="text-gray-600 text-lg font-medium">
            SOC
          </div>
          <div className="text-gray-400 text-sm">
            State of Charge
          </div>
        </div>
      </div>
      
      {/* Glow effect for high values */}
      {displayValue >= 70 && (
        <div className="absolute inset-0 rounded-full bg-green-400 opacity-10 animate-pulse"></div>
      )}
    </div>
  );
};

export default SOCGauge;