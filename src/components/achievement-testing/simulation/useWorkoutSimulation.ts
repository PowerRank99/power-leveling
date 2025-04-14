
import { useWorkoutState } from './hooks/useWorkoutState';
import { useXPCalculation } from './hooks/useXPCalculation';
import { WorkoutSubmissionService } from './services/WorkoutSubmissionService';

interface UseWorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

export const useWorkoutSimulation = ({ userId, addLogEntry }: UseWorkoutSimulationProps) => {
  const { 
    state, 
    setWorkoutType,
    setDuration,
    setExerciseCount,
    setIncludePersonalRecord,
    setStreak,
    setUseClassPassives,
    setSelectedClass,
    setIsLoading,
    updateState
  } = useWorkoutState();
  
  const { calculatePotentialXP } = useXPCalculation(state, updateState);
  
  const simulateWorkout = async () => {
    const workoutSubmissionService = new WorkoutSubmissionService(userId, addLogEntry);
    
    setIsLoading(true);
    try {
      await workoutSubmissionService.submitWorkout({
        awardedXP: state.totalXP,
        workout: {
          workoutType: state.workoutType,
          duration: state.duration,
          exerciseCount: state.exerciseCount,
          includePersonalRecord: state.includePersonalRecord,
          streak: state.streak,
          useClassPassives: state.useClassPassives,
          selectedClass: state.selectedClass
        }
      });
    } catch (error) {
      console.error('Error simulating workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state,
    setWorkoutType,
    setDuration,
    setExerciseCount,
    setIncludePersonalRecord,
    setStreak,
    setUseClassPassives,
    setSelectedClass,
    simulateWorkout
  };
};
