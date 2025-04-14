
// This file now imports from the refactored implementation to maintain backward compatibility
import { useWorkoutSimulation as useRefactoredWorkoutSimulation } from './hooks/useWorkoutSimulation';

// Re-export with the same interface to avoid breaking existing code
export const useWorkoutSimulation = useRefactoredWorkoutSimulation;
