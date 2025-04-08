
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TimerService } from '@/services/timer/TimerService';
import { TimerSettings } from './timerTypes';
import { toast } from 'sonner';

export const useTimerPersistence = () => {
  const { user } = useAuth();
  const [loadingExercises, setLoadingExercises] = useState<Record<string, boolean>>({});
  const [lastSavedDurations, setLastSavedDurations] = useState<Record<string, number>>({});

  // Load timer duration for specific exercise
  const loadExerciseTimerDuration = useCallback(async (exerciseId: string) => {
    if (!user || !exerciseId || loadingExercises[exerciseId]) return null;
    
    setLoadingExercises(prev => ({ ...prev, [exerciseId]: true }));
    
    try {
      const result = await TimerService.getExerciseTimerDuration(user.id, exerciseId);
      
      if (result.success && typeof result.data === 'number') {
        // Store the duration for this exercise
        setLastSavedDurations(prev => ({ ...prev, [exerciseId]: result.data as number }));
        
        console.log(`[useTimerPersistence] Loaded timer for exercise ${exerciseId}: ${result.data}s`);
        
        // Return the data for immediate use if needed
        return result.data;
      }
    } catch (error) {
      console.error(`[useTimerPersistence] Error loading timer for ${exerciseId}:`, error);
    } finally {
      setLoadingExercises(prev => ({ ...prev, [exerciseId]: false }));
    }

    return null;
  }, [user, loadingExercises]);

  // Update timer duration for an exercise
  const updateTimerDuration = useCallback((exerciseId: string, duration: number) => {
    if (!exerciseId || duration <= 0) return;
    
    console.log(`[useTimerPersistence] Updating timer for ${exerciseId} to ${duration}s`);
    
    // Store the updated duration
    setLastSavedDurations(prev => ({ ...prev, [exerciseId]: duration }));
  }, []);

  // Save timer settings
  const saveTimerSettings = useCallback(async (settings: Partial<TimerSettings>) => {
    if (!user) return;
    
    try {
      // Save to backend
      const dbSettings: Record<string, any> = {};
      if (settings.soundEnabled !== undefined) dbSettings.timer_sound_enabled = settings.soundEnabled;
      if (settings.vibrationEnabled !== undefined) dbSettings.timer_vibration_enabled = settings.vibrationEnabled;
      if (settings.notificationEnabled !== undefined) dbSettings.timer_notification_enabled = settings.notificationEnabled;
      
      await TimerService.saveUserTimerSettings(user.id, dbSettings);
      
      console.log("[useTimerPersistence] Saved timer settings:", settings);
    } catch (error) {
      console.error("[useTimerPersistence] Error saving timer settings:", error);
      toast.error("Erro ao salvar configurações do timer");
    }
  }, [user]);

  // Save default timer duration
  const saveDefaultTimerDuration = useCallback(async (duration: number) => {
    if (!user) return;
    
    try {
      // Save to backend
      await TimerService.saveUserTimerSettings(user.id, {
        default_rest_timer_seconds: duration
      });
      
      toast.success("Tempo padrão de descanso salvo", {
        description: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
      });
      
      console.log(`[useTimerPersistence] Saved default timer duration: ${duration}s`);
    } catch (error) {
      console.error("[useTimerPersistence] Error saving default timer duration:", error);
      toast.error("Erro ao salvar tempo padrão de descanso");
    }
  }, [user]);

  return {
    loadingExercises,
    lastSavedDurations,
    loadExerciseTimerDuration,
    updateTimerDuration,
    saveTimerSettings,
    saveDefaultTimerDuration
  };
};
