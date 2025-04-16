import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementCategory } from '@/types/achievementTypes';

export abstract class BaseAchievementChecker {
  /**
   * Abstract method that must be implemented by all checker classes
   */
  abstract checkAchievements(userId: string, data?: any): Promise<ServiceResponse<string[]>>;
  
  /**
   * Helper method to fetch achievements by category with optional sorting and filters
   */
  protected async fetchAchievementsByCategory(
    category: AchievementCategory,
    orderBy?: string,
    additionalFilters?: Record<string, any>
  ): Promise<{ data: any[] | null; error: any }> {
    let query = supabase
      .from('achievements')
      .select('*')
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
  
  /**
   * Execute checker with standard error handling
   */
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
  
  /**
   * Utility method to award achievements in batch
   */
  protected async awardAchievementsBatch(
    userId: string,
    achievementIds: string[]
  ): Promise<string[]> {
    if (!achievementIds.length) return [];
    
    const result = await AchievementService.checkAndAwardAchievements(userId, achievementIds);
    return result.success && Array.isArray(result.data) ? result.data : [];
  }
}
