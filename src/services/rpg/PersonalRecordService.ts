
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';
import { AchievementService } from '@/services/rpg/AchievementService';

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
      // Insert the personal record using the RPC function with a type assertion
      // to work around the TypeScript type limitation
      const { error } = await supabase.rpc(
        'insert_personal_record' as any, 
        {
          p_user_id: userId,
          p_exercise_id: exerciseId,
          p_weight: weight,
          p_previous_weight: previousWeight
        }
      );
        
      if (error) {
        console.error('Error recording personal record:', error);
        return;
      }
      
      // Update the records count in profile using the RPC function
      const { error: rpcError } = await supabase.rpc('increment_profile_counter', {
        user_id_param: userId,
        counter_name: 'records_count',
        increment_amount: 1
      });
      
      if (rpcError) {
        console.error('Error incrementing profile counter:', rpcError);
      }
      
      // Award PR achievement for the first personal record
      await AchievementService.awardAchievement(userId, 'pr-first');
      
      // Get total number of PRs for this user
      const { count, error: countError } = await supabase
        .from('personal_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (!countError && count) {
        // Award PR milestone achievements
        if (count >= 5) {
          await AchievementService.awardAchievement(userId, 'pr-5');
        }
        if (count >= 10) {
          await AchievementService.awardAchievement(userId, 'pr-10');
        }
        if (count >= 25) {
          await AchievementService.awardAchievement(userId, 'pr-25');
        }
        if (count >= 50) {
          await AchievementService.awardAchievement(userId, 'pr-50');
        }
      }
      
      // Check for impressive PR achievements based on weight increase percentage
      if (previousWeight > 0) {
        const increasePercentage = ((weight - previousWeight) / previousWeight) * 100;
        
        if (increasePercentage >= 10) {
          await AchievementService.awardAchievement(userId, 'pr-increase-10');
        }
        if (increasePercentage >= 20) {
          await AchievementService.awardAchievement(userId, 'pr-increase-20');
        }
      }
        
    } catch (error) {
      console.error('Error recording personal record:', error);
    }
  }
  
  /**
   * Check if an exercise is on cooldown for PR bonuses
   * (1 PR bonus per exercise per calendar week)
   */
  static async checkPersonalRecordCooldown(
    userId: string, 
    exerciseId: string
  ): Promise<boolean> {
    try {
      // Get current calendar week start (Monday of current week)
      const now = new Date();
      const dayOfWeek = now.getDay() || 7; // Convert Sunday (0) to 7
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (dayOfWeek - 1)); // Set to Monday
      weekStart.setHours(0, 0, 0, 0);
      
      // Check if a PR was recorded for this exercise in the current calendar week
      const { data, error } = await supabase
        .from('personal_records')
        .select('id')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .gte('recorded_at', weekStart.toISOString())
        .limit(1);
        
      if (error) {
        console.error('Error checking PR cooldown:', error);
        return false;
      }
      
      // If no records found for this exercise this week, then it's not on cooldown
      // (true means the user CAN earn a PR bonus)
      return data.length === 0;
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
          // Check for cooldown period (1 PR per exercise per calendar week)
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
