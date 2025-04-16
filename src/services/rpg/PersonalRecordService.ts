
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Represents a personal record
 */
export interface PersonalRecord {
  userId: string;
  exerciseId: string;
  weight: number;
  previousWeight: number;
}

/**
 * Service for handling personal records
 */
export class PersonalRecordService {
  /**
   * Check for personal records in a workout
   */
  static async checkForPersonalRecords(
    userId: string, 
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
    }
  ): Promise<PersonalRecord[]> {
    if (!userId || !workout.exercises.length) return [];
    
    try {
      const personalRecords: PersonalRecord[] = [];
      
      // Get all exercises that might have PR potential (strength exercises)
      const potentialPRExercises = workout.exercises.filter(ex => {
        // Only count PRs for strength training exercises
        return ex.type === 'Musculação' || ex.type === 'Calistenia';
      });
      
      // For each potential PR exercise
      for (const exercise of potentialPRExercises) {
        // Find max weight used for this exercise in the current workout
        const maxWeightSet = exercise.sets
          .filter(set => set.completed)
          .reduce((max, set) => {
            const weight = parseFloat(set.weight);
            return !isNaN(weight) && weight > max ? weight : max;
          }, 0);
        
        // Skip if no weight was used
        if (maxWeightSet <= 0) continue;
        
        // Check for cooldown - only one PR per exercise per time period
        const { data: cooldownData } = await supabase.rpc(
          'check_personal_record_cooldown',
          { p_user_id: userId, p_exercise_id: exercise.id }
        );
        
        const isOffCooldown = cooldownData === true;
        if (!isOffCooldown) {
          console.log(`Exercise ${exercise.id} is on PR cooldown, skipping PR check`);
          continue;
        }
        
        // Get previous max weight for this exercise
        const { data: exerciseHistoryData, error: exerciseHistoryError } = await supabase
          .from('exercise_history')
          .select('weight')
          .eq('user_id', userId)
          .eq('exercise_id', exercise.id)
          .single();
          
        // Only consider it a PR if we found a previous record
        if (exerciseHistoryError && exerciseHistoryError.code !== 'PGRST116') {
          console.error("Error fetching exercise history:", exerciseHistoryError);
          continue;
        }
        
        let previousMaxWeight = 0;
        
        if (exerciseHistoryData) {
          previousMaxWeight = exerciseHistoryData.weight || 0;
        }
        
        // Check if this is a new personal record
        if (maxWeightSet > previousMaxWeight && previousMaxWeight > 0) {
          console.log(`New PR for exercise ${exercise.id}: ${maxWeightSet} > ${previousMaxWeight}`);
          
          // Record the PR
          await supabase.rpc(
            'insert_personal_record',
            {
              p_user_id: userId,
              p_exercise_id: exercise.id,
              p_weight: maxWeightSet,
              p_previous_weight: previousMaxWeight
            }
          );
          
          // Update exercise history with new max
          await supabase
            .from('exercise_history')
            .upsert({
              user_id: userId,
              exercise_id: exercise.id,
              weight: maxWeightSet,
              last_used_at: new Date().toISOString()
            });
            
          // Add to result list
          personalRecords.push({
            userId,
            exerciseId: exercise.id,
            weight: maxWeightSet,
            previousWeight: previousMaxWeight
          });
          
          // Update profile records count
          await supabase.rpc(
            'increment_profile_counter',
            {
              user_id_param: userId,
              counter_name: 'records_count',
              increment_amount: 1
            }
          );
        } else if (previousMaxWeight === 0 && maxWeightSet > 0) {
          // First record for this exercise, not a PR but record it
          await supabase
            .from('exercise_history')
            .upsert({
              user_id: userId,
              exercise_id: exercise.id,
              weight: maxWeightSet,
              last_used_at: new Date().toISOString()
            });
        }
      }
      
      return personalRecords;
    } catch (error) {
      console.error("Error checking for personal records:", error);
      return [];
    }
  }
}
