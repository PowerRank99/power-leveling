
// This file now imports from the refactored implementation to maintain backward compatibility
import { useManualWorkoutSimulation as useRefactoredManualWorkoutSimulation, POWER_DAY_BONUS_XP } from './hooks/useManualWorkoutSimulation';

// Re-export with the same interface to avoid breaking existing code
export const useManualWorkoutSimulation = useRefactoredManualWorkoutSimulation;

// Re-export the POWER_DAY_BONUS_XP constant
export { POWER_DAY_BONUS_XP };
