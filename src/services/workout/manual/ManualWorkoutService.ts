
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { XPService } from '@/services/rpg/XPService';
import { StreakService } from '@/services/rpg/StreakService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { XPBonusService } from '@/services/rpg/XPBonusService';
import { ManualWorkoutValidationService } from './ManualWorkoutValidationService';
import { ActivityBonusService } from './ActivityBonusService';
import { ManualWorkout, ManualWorkoutSubmissionResult } from '@/types/manualWorkoutTypes';

/**
 * Service for handling manual workouts
 */
export class ManualWorkoutService {
  static readonly BASE_XP = 100;
  static readonly POWER_DAY_CAP = 500;
  
  /**
   * Submit a manual workout
   */
  static async submitManualWorkout(
    userId: string,
    photoUrl: string,
    description?: string,
    activityType?: string,
    workoutDate?: Date
  ): Promise<ManualWorkoutSubmissionResult> {
    try {
      const submissionDate = workoutDate || new Date();
      
      // Validate submission
      const isValid = await ManualWorkoutValidationService.validateWorkoutSubmission(
        userId,
        photoUrl,
        submissionDate
      );
      
      if (!isValid) {
        return { success: false, error: 'Validation failed' };
      }
      
      // Get user profile to determine class and streak
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('class, streak, last_workout_at')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Erro ao buscar perfil do usuário');
      }
      
      // Check if this is a power day (user completed both regular and manual workout today)
      const isPowerDay = await ManualWorkoutValidationService.checkPowerDay(userId);
      
      // Check power day availability if this is a power day
      let powerDayAvailable = false;
      let powerDayWeek = 0;
      let powerDayYear = 0;
      
      if (isPowerDay) {
        // Check power day usage for current week
        const powerDayData = await XPBonusService.checkPowerDayAvailability(userId);
        
        powerDayAvailable = powerDayData.available;
        powerDayWeek = powerDayData.week;
        powerDayYear = powerDayData.year;
        
        if (!powerDayAvailable) {
          // This is still a power day, but user won't get the higher XP cap
          console.log('Power day detected but weekly limit reached');
          toast.info('Você atingiu o limite semanal de Power Days');
        } else if (powerDayAvailable) {
          // Record power day usage
          await XPBonusService.recordPowerDayUsage(
            userId, 
            powerDayWeek, 
            powerDayYear
          );
        }
      }
      
      // Calculate XP with class bonuses
      let totalXP = this.BASE_XP;
      
      // Apply streak bonus
      if (userProfile?.streak && userProfile.streak > 1) {
        const streakMultiplier = XPService.getStreakMultiplier(userProfile.streak);
        totalXP = Math.floor(totalXP * streakMultiplier);
      }
      
      // Apply class bonus based on activity type (if applicable)
      if (userProfile?.class && activityType) {
        const classBonus = ActivityBonusService.getClassBonus(userProfile.class, activityType);
        if (classBonus > 0) {
          const bonusXP = Math.floor(totalXP * classBonus);
          totalXP += bonusXP;
        }
      }
      
      // Apply daily XP cap
      let cappedXP = Math.min(totalXP, XPService.DAILY_XP_CAP);
      
      // Apply power day cap if applicable
      if (isPowerDay && powerDayAvailable) {
        cappedXP = Math.min(totalXP, this.POWER_DAY_CAP);
      }
      
      // Insert manual workout record
      const { data: insertData, error: insertError } = await supabase
        .from('manual_workouts')
        .insert({
          user_id: userId,
          description: description || null,
          activity_type: activityType || null,
          photo_url: photoUrl,
          xp_awarded: cappedXP,
          workout_date: submissionDate.toISOString(),
          is_power_day: isPowerDay && powerDayAvailable
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting manual workout:', insertError);
        throw new Error('Erro ao salvar treino manual');
      }
      
      // Update user streak
      await StreakService.updateStreak(userId);
      
      // Award XP
      await XPService.awardXP(userId, cappedXP);
      
      // Check for achievements
      await AchievementService.checkAchievements(userId);
      
      // Show success message
      const powerDayMessage = (isPowerDay && powerDayAvailable) 
        ? ' Power Day! Limite de XP aumentado para 500.'
        : '';
        
      toast.success(`Treino registrado! +${cappedXP} XP`, {
        description: `Treino manual adicionado com sucesso.${powerDayMessage}`
      });
      
      return { 
        success: true, 
        isPowerDay: isPowerDay && powerDayAvailable 
      };
    } catch (error: any) {
      console.error('Error submitting manual workout:', error);
      toast.error('Erro ao registrar treino', {
        description: error.message || 'Ocorreu um erro ao registrar seu treino'
      });
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get manual workouts for a user
   */
  static async getUserManualWorkouts(userId: string): Promise<ManualWorkout[]> {
    try {
      const { data, error } = await supabase
        .from('manual_workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching manual workouts:', error);
        return [];
      }
      
      // Safely handle the response data
      if (!data || !Array.isArray(data)) {
        return [];
      }
      
      // Map the data to our ManualWorkout interface
      return data.map((workout: any) => ({
        id: workout.id,
        description: workout.description,
        activityType: workout.activity_type,
        photoUrl: workout.photo_url,
        xpAwarded: workout.xp_awarded,
        createdAt: workout.created_at,
        workoutDate: workout.workout_date,
        isPowerDay: workout.is_power_day
      }));
    } catch (error) {
      console.error('Error getting manual workouts:', error);
      return [];
    }
  }
}
