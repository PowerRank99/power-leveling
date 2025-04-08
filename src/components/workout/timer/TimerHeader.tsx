
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TimerHeaderProps {
  showOptions: boolean;
  onToggleOptions: () => void;
}

const TimerHeader: React.FC<TimerHeaderProps> = ({ 
  showOptions, 
  onToggleOptions 
}) => {
  return (
    <div className="flex justify-between w-full items-center mb-2">
      <div className="text-blue-500 font-medium">Rest Timer</div>
      <button 
        onClick={onToggleOptions}
        className="text-blue-500 p-2 bg-blue-50 rounded-full"
        aria-label={showOptions ? "Hide timer options" : "Show timer options"}
      >
        {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </div>
  );
};

export default TimerHeader;
