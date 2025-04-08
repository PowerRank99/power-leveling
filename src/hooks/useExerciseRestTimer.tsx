
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { TimerState, TimerSettings, UseExerciseRestTimerProps, UseExerciseRestTimerReturn } from './timer/timerTypes';
import { useTimerControls } from './timer/useTimerControls';
import { useTimerPersistence } from './timer/useTimerPersistence';
import { useTimerEffects } from './timer/useTimerEffects';

export const useExerciseRestTimer = (props?: UseExerciseRestTimerProps): UseExerciseRestTimerReturn => {
  const { user } = useAuth();
  const { onFinish } = props || {};
  
  // Timer state
  const [timerState, setTimerState] = useState<TimerState>({
    exerciseId: null,
    exerciseName: null,
    isActive: false,
    isPaused: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    progress: 0
  });
  
  // Timer settings
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
    notificationEnabled: true
  });
  
  // Timer UI state
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  
  // Timer interval reference
  const timerInterval = useRef<number | null>(null);
  
  // Initialize timer controls with current state
  const {
    formatTime,
    startTimer: startTimerControl,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTime
  } = useTimerControls(timerState, setTimerState, timerInterval);
  
  // Initialize timer persistence
  const {
    loadExerciseTimerDuration,
    updateTimerDuration,
    saveTimerSettings,
    saveDefaultTimerDuration
  } = useTimerPersistence();
  
  // Manage timer effects (ticking, completion, etc.)
  useTimerEffects({
    timerState,
    setTimerState,
    timerSettings,
    timerInterval,
    onFinish
  });
  
  // Wrapper for startTimer that loads the duration from persistence
  const startTimer = async (exerciseId: string, exerciseName: string) => {
    if (!user) return;
    
    try {
      // Load the duration for this exercise
      const duration = await loadExerciseTimerDuration(exerciseId);
      
      // Use the returned duration or fallback to 90 seconds
      const timerDuration = typeof duration === 'number' ? duration : 90;
      
      // Start the timer with the loaded duration
      startTimerControl(exerciseId, exerciseName, timerDuration);
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.error('Failed to start timer');
    }
  };

  return {
    timerState,
    timerSettings,
    showDurationSelector,
    setShowDurationSelector,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTime,
    formatTime,
    loadExerciseTimerDuration,
    updateTimerDuration,
    saveTimerSettings,
    saveDefaultTimerDuration
  };
};

// Re-export the timer types for convenience
export type { TimerState, TimerSettings, UseExerciseRestTimerProps, UseExerciseRestTimerReturn };
