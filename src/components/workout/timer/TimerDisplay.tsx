
import React from 'react';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ minutes, seconds }) => {
  return (
    <div className="text-center mb-4">
      <div className="text-3xl font-bold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};

export default TimerDisplay;
