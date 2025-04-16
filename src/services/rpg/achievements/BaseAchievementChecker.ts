import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementCategory } from '@/types/achievementTypes';

export abstract class BaseAchievementChecker {
  abstract checkAchievements(userId: string, data?: any): Promise<ServiceResponse<string[]>>;
  
  protected async fetchAchievementsByCategory(
    category: AchievementCategory,
    orderBy?: string,
    additionalFilters?: Record<string, any>
  ): Promise<{ data: any[] | null; error: any }> {
    let query = supabase
      .from('achievements')
      .select('*, rank_requirements')
      .eq('category', category);
    
    if (orderBy) {
      query = query.order(orderBy, { ascending: true });
    }
    
    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    return query;
  }
  
  protected async executeWithErrorHandling(
    operation: () => Promise<string[]>,
    operationName: string
  ): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      operation,
      `CHECK_${operationName.toUpperCase()}`,
      { showToast: false }
    );
  }
  
  protected async awardAchievementsBatch(
    userId: string,
    achievementIds: string[]
  ): Promise<string[]> {
    if (!achievementIds.length) return [];
    
    const result = await AchievementService.checkAndAwardAchievements(userId, achievementIds);
    return result.success && Array.isArray(result.data) ? result.data : [];
  }
  
  protected async getWorkoutStats(userId: string): Promise<{
    totalCount: number;
    categoryStats: Map<string, number>;
    streakDays: number;
  }> {
    const { data: stats } = await supabase
      .from('profiles')
      .select('workouts_count, streak')
      .eq('id', userId)
      .single();
      
    const { data: categoryData } = await supabase
      .from('workouts')
      .select(`
        workout_sets (
          exercises (
            category,
            type,
            category_type
          )
        )
      `)
      .eq('user_id', userId);
      
    const categoryStats = new Map<string, number>();
    
    if (categoryData) {
      categoryData.forEach(workout => {
        if (workout.workout_sets) {
          workout.workout_sets.forEach((set: any) => {
            if (set.exercises) {
              const { category, type, category_type } = set.exercises;
              
              if (category) {
                const count = categoryStats.get(category) || 0;
                categoryStats.set(category, count + 1);
              }
              
              if (type) {
                const count = categoryStats.get(type) || 0;
                categoryStats.set(type, count + 1);
              }
              
              if (category_type) {
                const count = categoryStats.get(category_type) || 0;
                categoryStats.set(category_type, count + 1);
              }
            }
          });
        }
      });
    }
    
    return {
      totalCount: stats?.workouts_count || 0,
      categoryStats,
      streakDays: stats?.streak || 0
    };
  }
}
