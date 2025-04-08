
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Maximum number of retries for database operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds

export const useRestTimer = (workoutId: string | null) => {
  const [restTimerSettings, setRestTimerSettings] = useState({ minutes: 1, seconds: 30 });
  const [isSaving, setIsSaving] = useState(false);
  
  // Retry mechanism for database operations
  const saveTimerSettingsWithRetry = useCallback(async (minutes: number, seconds: number, retryCount = 0) => {
    if (!workoutId) return false;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('workouts')
        .update({
          rest_timer_minutes: minutes,
          rest_timer_seconds: seconds
        } as any)
        .eq('id', workoutId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Error saving timer settings (attempt ${retryCount + 1}):`, error);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return saveTimerSettingsWithRetry(minutes, seconds, retryCount + 1);
      }
      
      // Only show error toast on final failure
      if (retryCount === MAX_RETRIES) {
        toast.error("Erro ao salvar configurações do timer", {
          description: "As configurações serão aplicadas localmente apenas"
        });
      }
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [workoutId]);
  
  const handleRestTimerChange = useCallback((minutes: number, seconds: number) => {
    // Immediately update local state for responsive UI
    setRestTimerSettings({ minutes, seconds });
    
    // Attempt to save to database without blocking the UI
    if (workoutId) {
      // We don't await this - it runs in the background
      saveTimerSettingsWithRetry(minutes, seconds).then(success => {
        if (success) {
          console.log("Timer settings saved successfully");
        }
      });
    }
  }, [workoutId, saveTimerSettingsWithRetry]);
  
  return {
    restTimerSettings,
    setRestTimerSettings,
    handleRestTimerChange,
    isSaving
  };
};
