
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
      className="w-full flex items-center justify-between bg-blue-100 text-blue-700 py-4 px-4 mb-4 rounded-lg hover:bg-blue-200 transition-colors"
      onClick={onShowTimer}
      aria-label="Mostrar timer de descanso"
    >
      <div className="flex items-center">
        <Clock className="mr-3 h-5 w-5" />
        <span className="font-medium text-base">Descanso:</span> <span className="ml-1 text-base">{minutes}min {seconds}s</span>
      </div>
      <div className="bg-blue-200 text-blue-700 rounded-full p-1.5">
        <Clock className="h-4 w-4" />
      </div>
    </button>
  );
};

export default RestTimerToggle;
