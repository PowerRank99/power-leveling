
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
  const initialValuesRef = useRef({minutes: initialMinutes, seconds: initialSeconds});
  
  // Update when external props change
  useEffect(() => {
    // Only update if the values have actually changed
    if (initialMinutes !== initialValuesRef.current.minutes || 
        initialSeconds !== initialValuesRef.current.seconds) {
      console.log(`[RestTimer] Props updated: ${initialMinutes}m ${initialSeconds}s`);
      
      initialValuesRef.current = {minutes: initialMinutes, seconds: initialSeconds};
      setMinutes(initialMinutes);
      setSeconds(initialSeconds);
      setTotalSeconds(initialMinutes * 60 + initialSeconds);
    }
  }, [initialMinutes, initialSeconds]);
  
  // Timer tick effect
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
  
  // Debounced timer change with better error handling
  const debouncedTimerChange = useCallback((mins: number, secs: number) => {
    if (timerChangeTimeoutRef.current) {
      clearTimeout(timerChangeTimeoutRef.current);
    }
    
    timerChangeTimeoutRef.current = setTimeout(() => {
      if (onTimerChange) {
        console.log(`[RestTimer] Notifying parent of timer change: ${mins}m ${secs}s`);
        try {
          onTimerChange(mins, secs);
        } catch (err) {
          console.error("[RestTimer] Error in onTimerChange callback:", err);
        }
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
      
      // Only notify of changes that aren't caused by the initial setup
      if (isRunning || (mins !== initialMinutes || secs !== initialSeconds)) {
        debouncedTimerChange(mins, secs);
      }
    }
  }, [totalSeconds, minutes, seconds, debouncedTimerChange, initialMinutes, initialSeconds, isRunning]);
  
  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  const resetTimer = useCallback(() => {
    const resetMins = initialValuesRef.current.minutes;
    const resetSecs = initialValuesRef.current.seconds;
    console.log(`[RestTimer] Resetting timer to ${resetMins}m ${resetSecs}s`);
    
    setTotalSeconds(resetMins * 60 + resetSecs);
    setIsRunning(true);
  }, []);

  const handleTimerPresetChange = useCallback((value: string) => {
    const preset = TIMER_PRESETS.find(p => p.label === value);
    if (preset) {
      console.log(`[RestTimer] Preset selected: ${preset.label} (${preset.minutes}m ${preset.seconds}s)`);
      
      setTotalSeconds(preset.minutes * 60 + preset.seconds);
      setIsRunning(true);
      
      // Update our ref to prevent unnecessary updates
      initialValuesRef.current = {minutes: preset.minutes, seconds: preset.seconds};
      
      if (onTimerChange) {
        try {
          onTimerChange(preset.minutes, preset.seconds);
        } catch (err) {
          console.error("[RestTimer] Error in onTimerChange callback during preset selection:", err);
        }
      }
    }
  }, [onTimerChange]);
  
  // Calculate progress percentage
  const initialTotalSeconds = initialValuesRef.current.minutes * 60 + initialValuesRef.current.seconds;
  const progressPercentage = initialTotalSeconds > 0 
    ? 100 - ((totalSeconds / initialTotalSeconds) * 100) 
    : 0;
    
  // Format default value for preset selector
  const defaultPresetValue = `${initialValuesRef.current.minutes}m${initialValuesRef.current.seconds > 0 ? ` ${initialValuesRef.current.seconds}s` : ''}`;
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log("[RestTimer] Component unmounting, clearing timers");
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerChangeTimeoutRef.current) clearTimeout(timerChangeTimeoutRef.current);
    };
  }, []);
  
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
