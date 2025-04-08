
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60 + initialSeconds);
  const [showTimerOptions, setShowTimerOptions] = useState(true); // Default to showing options
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Update initial values when props change, but only if they're different
    // to prevent unnecessary re-renders and database calls
    if (initialMinutes !== minutes || initialSeconds !== seconds) {
      setMinutes(initialMinutes);
      setSeconds(initialSeconds);
      setTotalSeconds(initialMinutes * 60 + initialSeconds);
    }
  }, [initialMinutes, initialSeconds, minutes, seconds]);
  
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
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
  
  // Debounced timer change to prevent excessive database updates
  const debouncedTimerChange = useCallback((mins: number, secs: number) => {
    if (timerChangeTimeoutRef.current) {
      clearTimeout(timerChangeTimeoutRef.current);
    }
    
    timerChangeTimeoutRef.current = setTimeout(() => {
      if (onTimerChange) {
        onTimerChange(mins, secs);
      }
      timerChangeTimeoutRef.current = null;
    }, 500);
  }, [onTimerChange]);
  
  // Update minutes and seconds when totalSeconds changes
  useEffect(() => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    if (mins !== minutes || secs !== seconds) {
      setMinutes(mins);
      setSeconds(secs);
      
      // Only trigger timer change if actual values changed
      debouncedTimerChange(mins, secs);
    }
  }, [totalSeconds, minutes, seconds, debouncedTimerChange]);
  
  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  const resetTimer = useCallback(() => {
    setTotalSeconds(initialMinutes * 60 + initialSeconds);
    setIsRunning(true);
  }, [initialMinutes, initialSeconds]);

  const handleTimerPresetChange = useCallback((value: string) => {
    const preset = TIMER_PRESETS.find(p => p.label === value);
    if (preset) {
      setTotalSeconds(preset.minutes * 60 + preset.seconds);
      setIsRunning(true);
      
      if (onTimerChange) {
        onTimerChange(preset.minutes, preset.seconds);
      }
    }
  }, [onTimerChange]);
  
  // Calculate progress percentage
  const initialTotalSeconds = initialMinutes * 60 + initialSeconds;
  const progressPercentage = initialTotalSeconds > 0 
    ? 100 - ((totalSeconds / initialTotalSeconds) * 100) 
    : 0;
  
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
            style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }} 
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
