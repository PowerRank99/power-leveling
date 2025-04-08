
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerProps {
  minutes?: number;
  seconds?: number;
  onComplete?: () => void;
  onTimerChange?: (minutes: number, seconds: number) => void;
}

const RestTimer: React.FC<RestTimerProps> = ({
  minutes: initialMinutes = 1,
  seconds: initialSeconds = 30,
  onComplete,
  onTimerChange
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(minutes * 60 + seconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            setIsRunning(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onComplete]);
  
  // Update minutes and seconds when totalSeconds changes
  useEffect(() => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    setMinutes(mins);
    setSeconds(secs);
    
    if (onTimerChange) {
      onTimerChange(mins, secs);
    }
  }, [totalSeconds, onTimerChange]);
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setTotalSeconds(initialMinutes * 60 + initialSeconds);
    setIsRunning(true);
  };
  
  // Calculate progress percentage
  const progressPercentage = 100 - ((totalSeconds / (initialMinutes * 60 + initialSeconds)) * 100);
  
  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="flex flex-col items-center">
        <div className="text-blue-500 font-medium mb-2">Rest Timer</div>
        
        <div className="text-center mb-4">
          <div className="text-3xl font-bold">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div 
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-200" 
            style={{ width: `${progressPercentage}%` }} 
          />
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline"
            size="icon"
            onClick={toggleTimer}
            className="h-10 w-10 rounded-full border border-gray-300"
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="h-10 w-10 rounded-full border border-gray-300"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;
