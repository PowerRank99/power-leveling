
import { useEffect } from 'react';
import { TimerState, TimerSettings } from './timerTypes';
import { TimerNotificationService } from '@/services/timer/TimerNotificationService';
import { useAuth } from '@/hooks/useAuth';
import { TimerService } from '@/services/timer/TimerService';

export const useTimerEffects = (
  timerState: TimerState,
  setTimerState: React.Dispatch<React.SetStateAction<TimerState>>,
  timerSettings: TimerSettings,
  setTimerSettings: React.Dispatch<React.SetStateAction<TimerSettings>>,
  timerInterval: React.MutableRefObject<number | null>,
  lastSavedDurations: Record<string, number>,
  isSubmitting: boolean,
  props?: { onFinish?: () => void }
) => {
  const { user } = useAuth();

  // Load timer settings on mount
  useEffect(() => {
    const loadTimerSettings = async () => {
      if (!user) return;
      
      try {
        const result = await TimerService.getUserTimerSettings(user.id);
        if (result.success && result.data) {
          setTimerSettings({
            soundEnabled: result.data.timer_sound_enabled,
            vibrationEnabled: result.data.timer_vibration_enabled,
            notificationEnabled: result.data.timer_notification_enabled
          });
          
          // Update default timer duration
          setTimerState(prev => ({
            ...prev,
            totalSeconds: result.data.default_rest_timer_seconds || 90
          }));
          
          console.log("[useTimerEffects] Loaded timer settings:", result.data);
        }
      } catch (error) {
        console.error("[useTimerEffects] Error loading timer settings:", error);
      }
    };
    
    loadTimerSettings();
  }, [user, setTimerSettings, setTimerState]);

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
          
          if (props?.onFinish) {
            props.onFinish();
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
    props,
    setTimerState,
    timerInterval
  ]);

  // Save timer duration to backend when workout is being submitted
  useEffect(() => {
    const saveAllExerciseTimers = async () => {
      if (!user || !isSubmitting || Object.keys(lastSavedDurations).length === 0) return;
      
      try {
        console.log("[useTimerEffects] Saving exercise timer durations", lastSavedDurations);
        
        // Save each exercise timer duration
        const savePromises = Object.entries(lastSavedDurations).map(([exerciseId, duration]) => 
          TimerService.saveExerciseTimerDuration(user.id, exerciseId, duration)
        );
        
        await Promise.all(savePromises);
        
        console.log("[useTimerEffects] Saved all timer durations successfully");
      } catch (error) {
        console.error("[useTimerEffects] Error saving timer durations:", error);
      }
    };
    
    saveAllExerciseTimers();
  }, [isSubmitting, lastSavedDurations, user]);
};
