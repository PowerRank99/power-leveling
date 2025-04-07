
import React, { useState, useEffect } from 'react';
import { Clock, PlayCircle, PauseCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerProps {
  defaultSeconds?: number;
  onComplete?: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({
  defaultSeconds = 90,
  onComplete
}) => {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && secondsLeft > 0 && !isCompleted) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            setIsCompleted(true);
            setIsRunning(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, isCompleted, onComplete]);
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setSecondsLeft(defaultSeconds);
    setIsCompleted(false);
    setIsRunning(true);
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = ((defaultSeconds - secondsLeft) / defaultSeconds) * 100;
  
  return (
    <div className="bg-fitblue-100 rounded-lg p-4 flex flex-col items-center">
      <div className="flex items-center mb-2">
        <Clock className="text-fitblue mr-2" />
        <span className="text-fitblue font-medium">Descanso</span>
      </div>
      
      <div className="text-center mb-3">
        <div className="text-3xl font-bold">{formatTime(secondsLeft)}</div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-white rounded-full h-2 mb-4">
        <div 
          className="bg-fitblue h-2 rounded-full" 
          style={{ width: `${progressPercentage}%` }} 
        />
      </div>
      
      <div className="flex gap-3">
        <Button 
          variant="outline"
          size="icon"
          onClick={toggleTimer}
          className="border-fitblue text-fitblue"
        >
          {isRunning ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="border-fitblue text-fitblue"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default RestTimer;
