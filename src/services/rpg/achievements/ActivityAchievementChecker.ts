
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementChecker } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '../AchievementService';
import { TransactionService } from '../../common/TransactionService';

export class ActivityAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return ActivityAchievementChecker.checkAchievements(userId);
  }
  
  static async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        const awardedAchievements: string[] = [];
        
        await TransactionService.executeWithRetry(
          async () => {
            const [manualResults, varietyResults, exerciseResults] = await Promise.all([
              this.checkManualWorkoutAchievements(userId),
              this.checkActivityVarietyAchievements(userId),
              this.checkExerciseTypeVarietyAchievements(userId)
            ]);
            
            awardedAchievements.push(
              ...(manualResults?.data || []),
              ...(varietyResults?.data || []),
              ...(exerciseResults?.data || [])
            );
            
            if (awardedAchievements.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, awardedAchievements);
            }
          }, 
          'activity_achievements', 
          3,
          'Failed to check activity achievements'
        );
        
        return awardedAchievements;
      },
      'CHECK_ACTIVITY_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  private static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const { count, error: countError } = await supabase
      .from('manual_workouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (countError) throw countError;
    
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('id, requirements')
      .eq('category', 'manual')
      .order('requirements->count', { ascending: true });
      
    if (achievementsError) throw achievementsError;
    
    const achievementsToCheck: string[] = [];
    
    achievements?.forEach(achievement => {
      const requiredCount = achievement.requirements?.count || 0;
      if (count && count >= requiredCount) {
        achievementsToCheck.push(achievement.id);
      }
    });
    
    return { success: true, data: achievementsToCheck };
  }
  
  private static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const { data, error } = await supabase
      .from('manual_workouts')
      .select('activity_type')
      .eq('user_id', userId)
      .not('activity_type', 'is', null);
      
    if (error) throw error;
    
    const distinctTypes = new Set(data?.map(item => item.activity_type));
    const distinctCount = distinctTypes.size;
    
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('id, requirements')
      .eq('category', 'variety')
      .order('requirements->count', { ascending: true });
      
    if (achievementsError) throw achievementsError;
    
    const achievementsToCheck: string[] = [];
    
    achievements?.forEach(achievement => {
      const requiredCount = achievement.requirements?.count || 0;
      if (distinctCount >= requiredCount) {
        achievementsToCheck.push(achievement.id);
      }
    });
    
    return { success: true, data: achievementsToCheck };
  }
  
  private static async checkExerciseTypeVarietyAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const { data, error } = await supabase
      .from('workout_sets')
      .select('exercise_id, workouts!inner(user_id)')
      .eq('workouts.user_id', userId)
      .eq('completed', true);
      
    if (error) throw error;
    
    const uniqueExerciseIds = new Set(data?.map(item => item.exercise_id).filter(Boolean));
    const distinctCount = uniqueExerciseIds.size;
    
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('id, requirements')
      .eq('category', 'exercise_variety')
      .order('requirements->count', { ascending: true });
      
    if (achievementsError) throw achievementsError;
    
    const achievementsToCheck: string[] = [];
    
    achievements?.forEach(achievement => {
      const requiredCount = achievement.requirements?.count || 0;
      if (distinctCount >= requiredCount) {
        achievementsToCheck.push(achievement.id);
      }
    });
    
    return { success: true, data: achievementsToCheck };
  }
}
