
import { useEffect } from 'react';
import { TimerState, TimerSettings } from './timerTypes';
import { TimerNotificationService } from '@/services/timer/TimerNotificationService';
import { useAuth } from '@/hooks/useAuth';
import { TimerService } from '@/services/timer/TimerService';

export const useTimerEffects = ({
  timerState,
  setTimerState,
  timerSettings,
  timerInterval,
  onFinish
}: {
  timerState: TimerState;
  setTimerState: React.Dispatch<React.SetStateAction<TimerState>>;
  timerSettings: TimerSettings;
  timerInterval: React.MutableRefObject<number | null>;
  onFinish?: () => void;
}) => {
  const { user } = useAuth();

  // Timer tick handler
  useEffect(() => {
    const handleTimerTick = () => {
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused || prev.remainingSeconds <= 0) {
          return prev;
        }
        
        const newRemaining = prev.remainingSeconds - 1;
        const newProgress = 1 - (newRemaining / prev.totalSeconds);
        
        // Check if timer completed
        if (newRemaining <= 0) {
          // Clear interval
          if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
          }
          
          // Trigger completion actions
          TimerNotificationService.notifyTimerComplete(prev.exerciseName || 'exercício', timerSettings);
          
          if (onFinish) {
            onFinish();
          }
          
          // Return completed state
          return {
            ...prev,
            isActive: false,
            remainingSeconds: 0,
            progress: 1
          };
        }
        
        // Return updated state
        return {
          ...prev,
          remainingSeconds: newRemaining,
          progress: newProgress
        };
      });
    };
    
    // Set up interval if timer is active
    if (timerState.isActive && !timerState.isPaused && timerState.remainingSeconds > 0) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      timerInterval.current = window.setInterval(handleTimerTick, 1000);
    }
    
    // Cleanup on unmount or when timer stops
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    };
  }, [
    timerState.isActive, 
    timerState.isPaused, 
    timerState.remainingSeconds, 
    timerSettings,
    onFinish,
    setTimerState,
    timerInterval
  ]);
};
