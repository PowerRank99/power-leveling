
import { useCallback, useRef } from 'react';
import { TimerState } from './timerTypes';

export const useTimerControls = (
  timerState: TimerState,
  setTimerState: React.Dispatch<React.SetStateAction<TimerState>>,
  timerInterval: React.MutableRefObject<number | null>
) => {
  // Format timer display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start a rest timer for an exercise
  const startTimer = useCallback((exerciseId: string, exerciseName: string, duration: number) => {
    console.log(`[useTimerControls] Starting timer for ${exerciseName} (${exerciseId}): ${duration}s`);
    
    setTimerState({
      exerciseId,
      exerciseName,
      isActive: true,
      isPaused: false,
      totalSeconds: duration,
      remainingSeconds: duration,
      progress: 0
    });
  }, [setTimerState]);

  // Pause the current timer
  const pauseTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev.isActive) return prev;
      console.log(`[useTimerControls] Pausing timer`);
      return { ...prev, isPaused: true };
    });
  }, [setTimerState]);

  // Resume the current timer
  const resumeTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev.isActive) return prev;
      console.log(`[useTimerControls] Resuming timer`);
      return { ...prev, isPaused: false };
    });
  }, [setTimerState]);

  // Stop the current timer
  const stopTimer = useCallback(() => {
    console.log(`[useTimerControls] Stopping timer`);
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      remainingSeconds: 0,
      progress: 0
    }));
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, [setTimerState, timerInterval]);

  // Add time to the current timer
  const addTime = useCallback((seconds: number) => {
    setTimerState(prev => {
      if (!prev.isActive) return prev;
      
      const newRemaining = prev.remainingSeconds + seconds;
      const newProgress = 1 - (newRemaining / prev.totalSeconds);
      
      console.log(`[useTimerControls] Adding ${seconds}s to timer (new total: ${newRemaining}s)`);
      
      return {
        ...prev,
        remainingSeconds: newRemaining,
        progress: newProgress
      };
    });
  }, [setTimerState]);

  return {
    formatTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTime
  };
};
