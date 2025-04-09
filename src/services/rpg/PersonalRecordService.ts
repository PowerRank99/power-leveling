
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';

export interface PersonalRecord {
  exerciseId: string;
  weight: number;
  previousWeight: number;
}

/**
 * Service for handling personal records
 */
export class PersonalRecordService {
  /**
   * Records a personal record for an exercise
   */
  static async recordPersonalRecord(
    userId: string, 
    exerciseId: string, 
    weight: number,
    previousWeight: number
  ): Promise<void> {
    try {
      // Using a stored procedure for personal_records
      const { error } = await supabase.rpc('insert_personal_record', {
        p_user_id: userId,
        p_exercise_id: exerciseId,
        p_weight: weight,
        p_previous_weight: previousWeight
      });
        
      if (error) {
        console.error('Error recording personal record:', error);
        return;
      }
      
      // Update the records count in profile
      await supabase
        .from('profiles')
        .update({
          records_count: (profile) => {
            return profile.records_count + 1;  
          }
        })
        .eq('id', userId);
        
    } catch (error) {
      console.error('Error recording personal record:', error);
    }
  }
  
  /**
   * Check if an exercise is on cooldown for PR bonuses
   * (1 PR bonus per exercise per week)
   */
  static async checkPersonalRecordCooldown(
    userId: string, 
    exerciseId: string
  ): Promise<boolean> {
    try {
      // Get the most recent PR for this exercise using RPC
      const { data, error } = await supabase.rpc('check_personal_record_cooldown', {
        p_user_id: userId,
        p_exercise_id: exerciseId,
        p_days: 7
      });
      
      if (error) {
        console.error('Error checking PR cooldown:', error);
        return false;
      }
      
      // Return true if not on cooldown
      return data === true;
    } catch (error) {
      console.error('Error checking personal record cooldown:', error);
      return false; // Default to not allowing PR bonus on error
    }
  }
  
  /**
   * Check if the user has earned a personal record for any exercise
   * in this workout by checking their exercise history
   */
  static async checkForPersonalRecords(
    userId: string, 
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      difficulty?: 'iniciante' | 'intermediario' | 'avancado'
    }
  ): Promise<PersonalRecord[]> {
    try {
      const personalRecords: PersonalRecord[] = [];
      
      // Get the user's exercise history
      const { data: exerciseHistory } = await supabase
        .from('exercise_history')
        .select('exercise_id, weight')
        .eq('user_id', userId);
        
      if (!exerciseHistory || exerciseHistory.length === 0) {
        return personalRecords;
      }
      
      // Create a lookup map for easier access
      const historyMap = exerciseHistory.reduce((map, record) => {
        map[record.exercise_id] = record.weight;
        return map;
      }, {} as Record<string, number>);
      
      // Check each exercise in the workout for a PR
      for (const exercise of workout.exercises) {
        const exerciseId = exercise.id;
        const previousBest = historyMap[exerciseId] || 0;
        
        // Find the highest weight used for this exercise in the workout
        const highestWeight = exercise.sets.reduce((max, set) => {
          if (set.completed && parseFloat(set.weight) > max) {
            return parseFloat(set.weight);
          }
          return max;
        }, 0);
        
        // If a new PR was set, add it to the list
        if (highestWeight > previousBest && highestWeight > 0) {
          // Check for cooldown period (1 PR per exercise per week)
          const canEarnPR = await this.checkPersonalRecordCooldown(userId, exerciseId);
          
          if (canEarnPR) {
            personalRecords.push({
              exerciseId,
              weight: highestWeight,
              previousWeight: previousBest
            });
          }
        }
      }
      
      return personalRecords;
    } catch (error) {
      console.error('Error checking for personal records:', error);
      return [];
    }
  }
}
