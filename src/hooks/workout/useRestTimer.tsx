
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Maximum number of retries for database operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds
const DEBOUNCE_DELAY = 1000; // 1 second debounce for timer settings updates

export const useRestTimer = (workoutId: string | null) => {
  const [restTimerSettings, setRestTimerSettings] = useState({ minutes: 1, seconds: 30 });
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<{ minutes: number; seconds: number } | null>(null);
  
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
      
      // Check if there was a pending update while this one was processing
      if (pendingUpdateRef.current) {
        const { minutes: pendingMinutes, seconds: pendingSeconds } = pendingUpdateRef.current;
        pendingUpdateRef.current = null;
        
        // Process the pending update after a small delay
        setTimeout(() => {
          saveTimerSettingsWithRetry(pendingMinutes, pendingSeconds);
        }, 100);
      }
      
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
    
    // Debounce the save operation to reduce database calls
    if (saveTimerTimeoutRef.current) {
      clearTimeout(saveTimerTimeoutRef.current);
      // Store this as a pending update if we're currently saving
      if (isSaving) {
        pendingUpdateRef.current = { minutes, seconds };
        return;
      }
    }
    
    // Set up a new debounced save
    saveTimerTimeoutRef.current = setTimeout(() => {
      if (workoutId) {
        // We don't await this - it runs in the background
        saveTimerSettingsWithRetry(minutes, seconds).then(success => {
          if (success) {
            console.log("Timer settings saved successfully");
          }
        });
      }
      saveTimerTimeoutRef.current = null;
    }, DEBOUNCE_DELAY);
  }, [workoutId, saveTimerSettingsWithRetry, isSaving]);
  
  return {
    restTimerSettings,
    setRestTimerSettings,
    handleRestTimerChange,
    isSaving
  };
};
