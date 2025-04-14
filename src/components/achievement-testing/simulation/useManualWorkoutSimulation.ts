
import { useState } from 'react';
import { ManualWorkoutSubmissionService } from './services/ManualWorkoutSubmissionService';
import { useManualWorkoutState } from './hooks/useManualWorkoutState';
import { useManualWorkoutXPCalculation } from './hooks/useManualWorkoutXPCalculation';

export const POWER_DAY_BONUS_XP = 50;

interface UseManualWorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

export const useManualWorkoutSimulation = ({ userId, addLogEntry }: UseManualWorkoutSimulationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Use our state and XP calculation hooks
  const { state, updateState } = useManualWorkoutState();
  const { getClassBonusDescription } = useManualWorkoutXPCalculation({ 
    state, 
    updateState 
  });
  
  // Create service instance
  const manualWorkoutService = new ManualWorkoutSubmissionService(userId, addLogEntry);
  
  const submitManualWorkout = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      await manualWorkoutService.submitManualWorkout({
        activityType: state.activityType,
        description: state.description,
        photoUrl: 'https://frzgnszosqvcgycjtntz.supabase.co/storage/v1/object/public/workout-photos/demo-workout-photo.jpg',
        xpAwarded: state.totalXP,
        isPowerDay: state.isPowerDay,
        useClassPassives: state.useClassPassives,
        selectedClass: state.selectedClass
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    state: { ...state, isLoading },
    setActivityType: (value: string) => updateState({ activityType: value }),
    setDescription: (value: string) => updateState({ description: value }),
    setDuration: (value: number) => updateState({ duration: value }),
    setIsPowerDay: (value: boolean) => updateState({ isPowerDay: value }),
    setUseClassPassives: (value: boolean) => updateState({ useClassPassives: value }),
    setSelectedClass: (value: string | null) => updateState({ selectedClass: value }),
    getClassBonusDescription,
    submitManualWorkout
  };
};
