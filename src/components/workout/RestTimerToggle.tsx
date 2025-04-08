
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
      className="w-full flex items-center justify-between bg-blue-50 text-blue-500 py-3 px-4 mb-4 rounded-lg hover:bg-blue-100 transition-colors"
      onClick={onShowTimer}
      aria-label="Mostrar timer de descanso"
    >
      <div className="flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        <span className="font-medium">Descanso:</span> <span className="ml-1">{minutes}min {seconds}s</span>
      </div>
      <div className="bg-blue-100 rounded-full p-1">
        <Clock className="h-4 w-4" />
      </div>
    </button>
  );
};

export default RestTimerToggle;
