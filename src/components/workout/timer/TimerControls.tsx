
import React from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerControlsProps {
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ 
  isRunning, 
  onToggleTimer, 
  onResetTimer 
}) => {
  return (
    <div className="flex gap-4 mb-2">
      <Button 
        variant="outline"
        size="icon"
        onClick={onToggleTimer}
        className="h-10 w-10 rounded-full border border-gray-300"
      >
        {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      
      <Button 
        variant="outline"
        size="icon"
        onClick={onResetTimer}
        className="h-10 w-10 rounded-full border border-gray-300"
      >
        <RefreshCw className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default TimerControls;
