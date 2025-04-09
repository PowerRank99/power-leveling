
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
      // Insert the personal record
      const { error } = await supabase
        .from('personal_records')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          weight: weight,
          previous_weight: previousWeight
        });
        
      if (error) {
        console.error('Error recording personal record:', error);
        return;
      }
      
      // Update the records count in profile
      await supabase
        .rpc('increment_profile_counter', {
          user_id_param: userId,
          counter_name: 'records_count',
          increment_amount: 1
        });
        
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
      // Query for the most recent PR for this exercise in the last 7 days
      const { data, error } = await supabase
        .from('personal_records')
        .select('recorded_at')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .order('recorded_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error checking PR cooldown:', error);
        return false;
      }
      
      // If no records found, not on cooldown
      if (!data || data.length === 0) {
        return true;
      }
      
      // Check if the most recent record is older than 7 days
      const lastRecord = data[0];
      const lastRecordDate = new Date(lastRecord.recorded_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Return true if the record is older than 7 days (not on cooldown)
      return lastRecordDate < sevenDaysAgo;
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
