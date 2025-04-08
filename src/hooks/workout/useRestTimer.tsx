
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRestTimer = (workoutId: string | null) => {
  const [restTimerSettings, setRestTimerSettings] = useState({ minutes: 1, seconds: 30 });
  
  const handleRestTimerChange = (minutes: number, seconds: number) => {
    setRestTimerSettings({ minutes, seconds });
    
    if (workoutId) {
      supabase
        .from('workouts')
        .update({
          rest_timer_minutes: minutes,
          rest_timer_seconds: seconds
        } as any) // Use type assertion to bypass TypeScript error
        .eq('id', workoutId)
        .then(({ error }) => {
          if (error) {
            console.error("Error saving timer settings:", error);
          }
        });
    }
  };
  
  return {
    restTimerSettings,
    setRestTimerSettings,
    handleRestTimerChange
  };
};
