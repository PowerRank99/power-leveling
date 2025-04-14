
import { useManualWorkoutState } from './useManualWorkoutState';
import { useManualWorkoutXPCalculation, POWER_DAY_BONUS_XP } from './useManualWorkoutXPCalculation';
import { ManualWorkoutSubmissionService } from '../services/ManualWorkoutSubmissionService';

interface UseManualWorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

export const useManualWorkoutSimulation = ({ userId, addLogEntry }: UseManualWorkoutSimulationProps) => {
  const {
    state,
    setActivityType,
    setDescription,
    setDuration,
    setIsPowerDay,
    setUseClassPassives,
    setSelectedClass,
    setIsLoading,
    updateState
  } = useManualWorkoutState();
  
  const { getClassBonusDescription } = useManualWorkoutXPCalculation({ 
    state, 
    updateState 
  });
  
  const submitManualWorkout = async () => {
    setIsLoading(true);
    
    try {
      const submissionService = new ManualWorkoutSubmissionService(userId, addLogEntry);
      
      const success = await submissionService.submitManualWorkout({
        activityType: state.activityType,
        description: state.description,
        photoUrl: state.photoUrl,
        xpAwarded: state.totalXP,
        isPowerDay: state.isPowerDay,
        useClassPassives: state.useClassPassives,
        selectedClass: state.selectedClass
      });
      
      if (success) {
        updateState({ description: '' });
      }
    } catch (error) {
      console.error('Error in submitManualWorkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state,
    setActivityType,
    setDescription,
    setDuration,
    setIsPowerDay,
    setUseClassPassives,
    setSelectedClass,
    getClassBonusDescription,
    submitManualWorkout
  };
};

// Export the POWER_DAY_BONUS_XP constant so it can be used in other components
export { POWER_DAY_BONUS_XP };
