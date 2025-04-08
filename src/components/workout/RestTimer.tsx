
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RestTimerProps {
  minutes?: number;
  seconds?: number;
  onComplete?: () => void;
  onTimerChange?: (minutes: number, seconds: number) => void;
  autoStart?: boolean;
}

// Updated timer presets with 10-second intervals
const TIMER_PRESETS = [
  { label: '30s', minutes: 0, seconds: 30 },
  { label: '40s', minutes: 0, seconds: 40 },
  { label: '50s', minutes: 0, seconds: 50 },
  { label: '1m', minutes: 1, seconds: 0 },
  { label: '1m 10s', minutes: 1, seconds: 10 },
  { label: '1m 20s', minutes: 1, seconds: 20 },
  { label: '1m 30s', minutes: 1, seconds: 30 },
  { label: '1m 40s', minutes: 1, seconds: 40 },
  { label: '1m 50s', minutes: 1, seconds: 50 },
  { label: '2m', minutes: 2, seconds: 0 },
  { label: '2m 10s', minutes: 2, seconds: 10 },
  { label: '2m 20s', minutes: 2, seconds: 20 },
  { label: '2m 30s', minutes: 2, seconds: 30 },
];

const RestTimer: React.FC<RestTimerProps> = ({
  minutes: initialMinutes = 1,
  seconds: initialSeconds = 30,
  onComplete,
  onTimerChange,
  autoStart = false
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [totalSeconds, setTotalSeconds] = useState(minutes * 60 + seconds);
  const [showTimerOptions, setShowTimerOptions] = useState(true); // Default to showing options
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Update initial values when props change
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
    setTotalSeconds(initialMinutes * 60 + initialSeconds);
  }, [initialMinutes, initialSeconds]);
  
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

  const handleTimerPresetChange = (value: string) => {
    const preset = TIMER_PRESETS.find(p => p.label === value);
    if (preset) {
      setTotalSeconds(preset.minutes * 60 + preset.seconds);
      setIsRunning(true);
      if (onTimerChange) {
        onTimerChange(preset.minutes, preset.seconds);
      }
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = 100 - ((totalSeconds / (initialMinutes * 60 + initialSeconds)) * 100);
  
  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="flex flex-col items-center">
        <div className="flex justify-between w-full items-center mb-2">
          <div className="text-blue-500 font-medium">Rest Timer</div>
          <button 
            onClick={() => setShowTimerOptions(!showTimerOptions)}
            className="text-blue-500 p-2 bg-blue-50 rounded-full"
            aria-label={showTimerOptions ? "Hide timer options" : "Show timer options"}
          >
            {showTimerOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        
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
        
        <div className="flex gap-4 mb-2">
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

        {showTimerOptions && (
          <div className="w-full mt-2 animate-scale-in">
            <Select 
              onValueChange={handleTimerPresetChange} 
              defaultValue={`${initialMinutes}m${initialSeconds > 0 ? ` ${initialSeconds}s` : ''}`}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tempo" />
              </SelectTrigger>
              <SelectContent>
                {TIMER_PRESETS.map((preset) => (
                  <SelectItem key={preset.label} value={preset.label}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestTimer;
