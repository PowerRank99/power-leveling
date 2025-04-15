
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Base abstract class for all specialized achievement checkers
 * Provides common functionality and enforces consistent interface
 */
export abstract class BaseAchievementChecker {
  /**
   * Abstract method that must be implemented by all checker classes
   */
  abstract checkAchievements(userId: string, data?: any): Promise<ServiceResponse<string[]>>;
  
  /**
   * Helper method to fetch achievements by category
   */
  protected async fetchAchievementsByCategory(
    category: string,
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
    operationName: string,
    options?: { showToast: boolean }
  ): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      operation,
      `CHECK_${operationName.toUpperCase()}`,
      options
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
