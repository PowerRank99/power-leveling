
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TimerService } from '@/services/timer/TimerService';
import { TimerNotificationService, TimerSettings } from '@/services/timer/TimerNotificationService';
import { toast } from 'sonner';
import { useWorkoutCompletion } from '@/hooks/workout/useWorkoutCompletion';

export interface TimerState {
  exerciseId: string | null;
  exerciseName: string | null;
  isActive: boolean;
  isPaused: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  progress: number;
}

interface UseExerciseRestTimerProps {
  onFinish?: () => void;
}

export const useExerciseRestTimer = (props?: UseExerciseRestTimerProps) => {
  const { user } = useAuth();
  const [timerState, setTimerState] = useState<TimerState>({
    exerciseId: null,
    exerciseName: null,
    isActive: false,
    isPaused: false,
    totalSeconds: 90,
    remainingSeconds: 0,
    progress: 0
  });
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
    notificationEnabled: true
  });
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState<Record<string, boolean>>({});
  const [lastSavedDurations, setLastSavedDurations] = useState<Record<string, number>>({});
  
  const timerInterval = useRef<number | null>(null);
  // Fix: Get only the finishWorkout function from useWorkoutCompletion
  const { finishWorkout } = useWorkoutCompletion(null, 0);
  // Use local state to track form submission instead
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          
          setTimerState(prev => ({
            ...prev,
            totalSeconds: result.data.default_rest_timer_seconds || 90
          }));
          
          console.log("[useExerciseRestTimer] Loaded timer settings:", result.data);
        }
      } catch (error) {
        console.error("[useExerciseRestTimer] Error loading timer settings:", error);
      }
    };
    
    loadTimerSettings();
  }, [user]);

  useEffect(() => {
    const handleTimerTick = () => {
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused || prev.remainingSeconds <= 0) {
          return prev;
        }
        
        const newRemaining = prev.remainingSeconds - 1;
        const newProgress = 1 - (newRemaining / prev.totalSeconds);
        
        if (newRemaining <= 0) {
          if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
          }
          
          TimerNotificationService.notifyTimerComplete(prev.exerciseName || 'exercício', timerSettings);
          
          if (props?.onFinish) {
            props.onFinish();
          }
          
          return {
            ...prev,
            isActive: false,
            remainingSeconds: 0,
            progress: 1
          };
        }
        
        return {
          ...prev,
          remainingSeconds: newRemaining,
          progress: newProgress
        };
      });
    };
    
    if (timerState.isActive && !timerState.isPaused && timerState.remainingSeconds > 0) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      timerInterval.current = window.setInterval(handleTimerTick, 1000);
    }
    
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
    props
  ]);

  useEffect(() => {
    const saveAllExerciseTimers = async () => {
      if (!user || !isSubmitting || Object.keys(lastSavedDurations).length === 0) return;
      
      try {
        console.log("[useExerciseRestTimer] Saving exercise timer durations", lastSavedDurations);
        
        const savePromises = Object.entries(lastSavedDurations).map(([exerciseId, duration]) => 
          TimerService.saveExerciseTimerDuration(user.id, exerciseId, duration)
        );
        
        await Promise.all(savePromises);
        
        console.log("[useExerciseRestTimer] Saved all timer durations successfully");
      } catch (error) {
        console.error("[useExerciseRestTimer] Error saving timer durations:", error);
      }
    };
    
    saveAllExerciseTimers();
  }, [isSubmitting, lastSavedDurations, user]);

  const loadExerciseTimerDuration = useCallback(async (exerciseId: string) => {
    if (!user || !exerciseId || loadingExercises[exerciseId]) return;
    
    setLoadingExercises(prev => ({ ...prev, [exerciseId]: true }));
    
    try {
      const result = await TimerService.getExerciseTimerDuration(user.id, exerciseId);
      
      if (result.success && typeof result.data === 'number') {
        setLastSavedDurations(prev => ({ ...prev, [exerciseId]: result.data as number }));
        
        console.log(`[useExerciseRestTimer] Loaded timer for exercise ${exerciseId}: ${result.data}s`);
        
        return result.data;
      }
    } catch (error) {
      console.error(`[useExerciseRestTimer] Error loading timer for ${exerciseId}:`, error);
    } finally {
      setLoadingExercises(prev => ({ ...prev, [exerciseId]: false }));
    }

    return null;
  }, [user, loadingExercises]);

  const saveExerciseTimerDuration = useCallback(async (exerciseId: string, duration: number) => {
    if (!user || !exerciseId) {
      console.error("[useExerciseRestTimer] Cannot save timer: missing user or exerciseId");
      return false;
    }
    
    try {
      console.log(`[useExerciseRestTimer] Saving timer for ${exerciseId}: ${duration}s`);
      
      const result = await TimerService.saveExerciseTimerDuration(user.id, exerciseId, duration);
      
      if (result.success) {
        setLastSavedDurations(prev => ({ ...prev, [exerciseId]: duration }));
        console.log(`[useExerciseRestTimer] Timer duration saved successfully: ${duration}s`);
        return true;
      } else {
        console.error("[useExerciseRestTimer] Error saving timer duration:", result.error);
        return false;
      }
    } catch (error) {
      console.error("[useExerciseRestTimer] Exception saving timer duration:", error);
      return false;
    }
  }, [user]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startTimer = useCallback((exerciseId: string, exerciseName: string) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    const duration = lastSavedDurations[exerciseId] || timerState.totalSeconds;
    
    console.log(`[useExerciseRestTimer] Starting timer for ${exerciseName} (${exerciseId}): ${duration}s`);
    
    setTimerState({
      exerciseId,
      exerciseName,
      isActive: true,
      isPaused: false,
      totalSeconds: duration,
      remainingSeconds: duration,
      progress: 0
    });
  }, [user, lastSavedDurations, timerState.totalSeconds]);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev.isActive) return prev;
      console.log(`[useExerciseRestTimer] Pausing timer`);
      return { ...prev, isPaused: true };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev.isActive) return prev;
      console.log(`[useExerciseRestTimer] Resuming timer`);
      return { ...prev, isPaused: false };
    });
  }, []);

  const stopTimer = useCallback(() => {
    console.log(`[useExerciseRestTimer] Stopping timer`);
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
  }, []);

  const addTime = useCallback((seconds: number) => {
    setTimerState(prev => {
      if (!prev.isActive) return prev;
      
      const newRemaining = prev.remainingSeconds + seconds;
      const newProgress = 1 - (newRemaining / prev.totalSeconds);
      
      console.log(`[useExerciseRestTimer] Adding ${seconds}s to timer (new total: ${newRemaining}s)`);
      
      return {
        ...prev,
        remainingSeconds: newRemaining,
        progress: newProgress
      };
    });
  }, []);

  const updateTimerDuration = useCallback((exerciseId: string, duration: number) => {
    if (!exerciseId || duration <= 0) return;
    
    console.log(`[useExerciseRestTimer] Updating timer for ${exerciseId} to ${duration}s`);
    
    setLastSavedDurations(prev => ({ ...prev, [exerciseId]: duration }));
    
    setTimerState(prev => {
      if (prev.exerciseId !== exerciseId) return prev;
      
      return {
        ...prev,
        totalSeconds: duration,
        remainingSeconds: duration,
        progress: 0
      };
    });
  }, []);

  const saveTimerSettings = useCallback(async (settings: Partial<TimerSettings>) => {
    if (!user) return;
    
    try {
      setTimerSettings(prev => ({ ...prev, ...settings }));
      
      const dbSettings: Record<string, any> = {};
      if (settings.soundEnabled !== undefined) dbSettings.timer_sound_enabled = settings.soundEnabled;
      if (settings.vibrationEnabled !== undefined) dbSettings.timer_vibration_enabled = settings.vibrationEnabled;
      if (settings.notificationEnabled !== undefined) dbSettings.timer_notification_enabled = settings.notificationEnabled;
      
      await TimerService.saveUserTimerSettings(user.id, dbSettings);
      
      console.log("[useExerciseRestTimer] Saved timer settings:", settings);
    } catch (error) {
      console.error("[useExerciseRestTimer] Error saving timer settings:", error);
      toast.error("Erro ao salvar configurações do timer");
    }
  }, [user]);

  const saveDefaultTimerDuration = useCallback(async (duration: number) => {
    if (!user) return;
    
    try {
      setTimerState(prev => ({ ...prev, totalSeconds: duration }));
      
      await TimerService.saveUserTimerSettings(user.id, {
        default_rest_timer_seconds: duration
      });
      
      toast.success("Tempo padrão de descanso salvo", {
        description: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
      });
      
      console.log(`[useExerciseRestTimer] Saved default timer duration: ${duration}s`);
    } catch (error) {
      console.error("[useExerciseRestTimer] Error saving default timer duration:", error);
      toast.error("Erro ao salvar tempo padrão de descanso");
    }
  }, [user]);

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
    saveDefaultTimerDuration,
    saveExerciseTimerDuration,
    isSubmitting,
    setIsSubmitting
  };
};
