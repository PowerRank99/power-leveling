
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/rpg/XPService';
import { PowerDayService } from '@/services/rpg/bonus/PowerDayService';
import { ActivityBonusService } from './ActivityBonusService';
import { ManualWorkoutData, ManualWorkout } from '@/types/manualWorkoutTypes';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';

/**
 * Service for handling manual workout submission
 */
export class ManualWorkoutService {
  /**
   * Submit a manual workout
   */
  static async submitManualWorkout(
    userId: string,
    workoutData: ManualWorkoutData
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Check if user has already submitted a manual workout today
      const { data: recentWorkouts, error: countError } = await supabase
        .rpc('check_recent_manual_workouts', { 
          p_user_id: userId, 
          p_hours: 24 
        });
      
      if (countError) {
        console.error('Error checking recent manual workouts:', countError);
        return { 
          success: false, 
          error: { 
            message: 'Failed to check recent manual workouts',
            technical: countError.message
          }
        };
      }
      
      const recentCount = recentWorkouts?.[0]?.count || 0;
      
      if (recentCount >= 1) {
        return { 
          success: false, 
          error: {
            message: 'Você já enviou um treino manual hoje. Aguarde 24 horas para enviar outro.',
            technical: 'Daily manual workout limit reached'
          }
        };
      }
      
      // Get user's class to apply bonuses
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error getting user profile:', profileError);
        // Continue without class bonuses
      }
      
      const userClass = userProfile?.class || null;
      
      // Check if workout should use Power Day
      let isUserPowerDay = false;
      let xpAwarded = XPService.MANUAL_WORKOUT_BASE_XP;
      
      if (workoutData.usePowerDay) {
        // Check Power Day availability
        const powerDayStatus = await PowerDayService.checkPowerDayAvailability(userId);
        
        if (powerDayStatus.available) {
          isUserPowerDay = true;
          await PowerDayService.recordPowerDayUsage(
            userId,
            powerDayStatus.week,
            powerDayStatus.year
          );
        }
      }
      
      // Apply class-specific bonus if applicable
      let bonusXP = 0;
      if (userClass && workoutData.activityType) {
        const bonusMultiplier = ActivityBonusService.getClassBonus(userClass, workoutData.activityType);
        if (bonusMultiplier > 0) {
          bonusXP = Math.round(xpAwarded * bonusMultiplier);
          xpAwarded += bonusXP;
        }
      }
      
      // Create the manual workout record
      const { data, error } = await supabase
        .rpc('create_manual_workout', {
          p_user_id: userId,
          p_description: workoutData.description || '',
          p_activity_type: workoutData.activityType || 'Outro',
          p_exercise_id: workoutData.exerciseId || null,
          p_photo_url: workoutData.photoUrl || '',
          p_xp_awarded: xpAwarded,
          p_workout_date: new Date(workoutData.workoutDate || new Date()).toISOString(),
          p_is_power_day: isUserPowerDay
        });
      
      if (error) {
        console.error('Error creating manual workout:', error);
        return { 
          success: false, 
          error: {
            message: 'Não foi possível salvar o treino manual',
            technical: error.message
          }
        };
      }
      
      // Award XP with metadata for class bonus tracking
      const result = await XPService.awardXP(
        userId, 
        xpAwarded, 
        'manual_workout',
        {
          activityType: workoutData.activityType,
          isPowerDay: isUserPowerDay,
          classBonus: bonusXP > 0 ? {
            class: userClass,
            amount: bonusXP,
            description: ActivityBonusService.getBonusDescription(userClass, workoutData.activityType)
          } : null
        }
      );
      
      if (!result) {
        console.error('Error awarding XP for manual workout');
      }
      
      // Update user's streak
      await this.updateUserStreak(userId);
      
      return { success: true, data: true };
    } catch (error: any) {
      console.error('Error submitting manual workout:', error);
      return { 
        success: false, 
        error: {
          message: 'Ocorreu um erro ao enviar o treino manual',
          technical: error.message
        }
      };
    }
  }
  
  /**
   * Get user's manual workouts
   */
  static async getUserManualWorkouts(userId: string): Promise<ManualWorkout[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_manual_workouts', {
          p_user_id: userId
        });
      
      if (error) throw error;
      
      // Map the database response to our ManualWorkout interface
      return (data || []).map(item => ({
        id: item.id,
        description: item.description,
        activityType: item.activity_type,
        exerciseId: item.exercise_id,
        photoUrl: item.photo_url,
        xpAwarded: item.xp_awarded,
        createdAt: item.created_at,
        workoutDate: item.workout_date,
        isPowerDay: item.is_power_day
      }));
    } catch (error) {
      console.error('Error getting user manual workouts:', error);
      return [];
    }
  }
  
  /**
   * Delete a manual workout
   */
  static async deleteManualWorkout(
    userId: string, 
    workoutId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('manual_workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', userId);
      
      if (error) {
        return {
          success: false,
          error: {
            message: 'Não foi possível excluir o treino',
            technical: error.message
          }
        };
      }
      
      return { success: true, data: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: 'Erro ao excluir o treino',
          technical: error.message
        }
      };
    }
  }
  
  /**
   * Update user's streak after manual workout
   */
  private static async updateUserStreak(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user streak:', error);
        return;
      }
      
      const currentStreak = data?.streak || 0;
      
      await supabase
        .from('profiles')
        .update({ 
          streak: currentStreak + 1,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating user streak:', error);
    }
  }
}
