
import React from 'react';
import { Clock } from 'lucide-react';

interface RestTimerToggleProps {
  minutes: number;
  seconds: number;
  onShowTimer: () => void;
}

const RestTimerToggle: React.FC<RestTimerToggleProps> = ({ 
  minutes, 
  seconds, 
  onShowTimer 
}) => {
  return (
    <button
      className="w-full flex items-center text-blue-500 py-3 mb-4"
      onClick={onShowTimer}
    >
      <Clock className="mr-2 h-5 w-5" />
      Rest Timer: {minutes}min {seconds}s
    </button>
  );
};

export default RestTimerToggle;
