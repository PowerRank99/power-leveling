
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from './timer/TimerDisplay';
import TimerProgressBar from './timer/TimerProgressBar';
import TimerControls from './timer/TimerControls';
import TimerPresetSelector from './timer/TimerPresetSelector';
import TimerHeader from './timer/TimerHeader';
import { TIMER_PRESETS } from './timer/TimerPresets';

interface RestTimerProps {
  minutes?: number;
  seconds?: number;
  onComplete?: () => void;
  onTimerChange?: (minutes: number, seconds: number) => void;
  autoStart?: boolean;
}

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
  const [showTimerOptions, setShowTimerOptions] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Update initial values when props change
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
  
  // Debounced timer change
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
    
  // Format default value for preset selector
  const defaultPresetValue = `${initialMinutes}m${initialSeconds > 0 ? ` ${initialSeconds}s` : ''}`;
  
  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="flex flex-col items-center">
        <TimerHeader 
          showOptions={showTimerOptions}
          onToggleOptions={() => setShowTimerOptions(!showTimerOptions)}
        />
        
        <TimerDisplay minutes={minutes} seconds={seconds} />
        
        <TimerProgressBar progressPercentage={progressPercentage} />
        
        <TimerControls 
          isRunning={isRunning}
          onToggleTimer={toggleTimer}
          onResetTimer={resetTimer}
        />

        {showTimerOptions && (
          <TimerPresetSelector
            presets={TIMER_PRESETS}
            defaultValue={defaultPresetValue}
            onPresetChange={handleTimerPresetChange}
          />
        )}
      </div>
    </div>
  );
};

export default RestTimer;
