
import { ExerciseHistory } from '@/types/workoutTypes';
import { DatabaseResult } from '@/types/workout';
import { ExerciseHistoryFetchService } from './ExerciseHistoryFetchService';
import { ExerciseHistoryUpdateService } from './ExerciseHistoryUpdateService';

/**
 * Facade service for managing exercise history data
 * Coordinates between fetch and update services
 */
export class ExerciseHistoryService {
  /**
   * Get exercise history for a specific user and exercise
   */
  static async getExerciseHistory(exerciseId: string): Promise<DatabaseResult<ExerciseHistory | null>> {
    return ExerciseHistoryFetchService.getExerciseHistory(exerciseId);
  }
  
  /**
   * Get exercise history for multiple exercises
   */
  static async getMultipleExerciseHistory(exerciseIds: string[]): Promise<DatabaseResult<Record<string, ExerciseHistory>>> {
    return ExerciseHistoryFetchService.getMultipleExerciseHistory(exerciseIds);
  }
  
  /**
   * Update exercise history based on workout data
   */
  static async updateExerciseHistory(
    exerciseId: string,
    weight: number,
    reps: number,
    sets: number
  ): Promise<DatabaseResult<boolean>> {
    return ExerciseHistoryUpdateService.updateExerciseHistory(exerciseId, weight, reps, sets);
  }
}
