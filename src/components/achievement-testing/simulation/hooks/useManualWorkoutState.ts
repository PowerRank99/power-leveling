
import { useState } from 'react';
import { XPService } from '@/services/rpg/XPService';

export interface ManualWorkoutState {
  activityType: string;
  description: string;
  duration: number;
  isPowerDay: boolean;
  photoUrl: string;
  isLoading: boolean;
  useClassPassives: boolean;
  selectedClass: string | null;
  totalXP: number;
}

export const useManualWorkoutState = () => {
  const [state, setState] = useState<ManualWorkoutState>({
    activityType: 'strength',
    description: '',
    duration: 45,
    isPowerDay: false,
    photoUrl: 'https://frzgnszosqvcgycjtntz.supabase.co/storage/v1/object/public/workout-photos/default.jpg',
    isLoading: false,
    useClassPassives: false,
    selectedClass: null,
    totalXP: XPService.MANUAL_WORKOUT_BASE_XP
  });

  // Setter functions for each state property
  const setActivityType = (activityType: string) => setState(prev => ({ ...prev, activityType }));
  const setDescription = (description: string) => setState(prev => ({ ...prev, description }));
  const setDuration = (duration: number) => setState(prev => ({ ...prev, duration }));
  const setIsPowerDay = (isPowerDay: boolean) => setState(prev => ({ ...prev, isPowerDay }));
  const setUseClassPassives = (useClassPassives: boolean) => setState(prev => ({ ...prev, useClassPassives }));
  const setSelectedClass = (selectedClass: string | null) => setState(prev => ({ ...prev, selectedClass }));
  const setIsLoading = (isLoading: boolean) => setState(prev => ({ ...prev, isLoading }));
  const setTotalXP = (totalXP: number) => setState(prev => ({ ...prev, totalXP }));
  const updateState = (updates: Partial<ManualWorkoutState>) => 
    setState(prev => ({ ...prev, ...updates }));

  return {
    state,
    setActivityType,
    setDescription,
    setDuration,
    setIsPowerDay,
    setUseClassPassives,
    setSelectedClass,
    setIsLoading,
    setTotalXP,
    updateState
  };
};
