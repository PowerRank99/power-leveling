
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementCategory } from '@/types/achievementTypes';

export class AchievementMigrationService {
  static async migrateAchievementCategories(): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Update achievements table with new category types and requirements structure
        const { error } = await supabase.rpc('migrate_achievement_categories');
        if (error) throw error;
      },
      'MIGRATE_ACHIEVEMENT_CATEGORIES'
    );
  }
  
  static async validateAchievementStructure(): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Validate that all achievements have proper category and requirements structure
        const { data: achievements, error } = await supabase
          .from('achievements')
          .select('*');
          
        if (error) throw error;
        
        const invalidAchievements = achievements?.filter(achievement => {
          return !Object.values(AchievementCategory).includes(achievement.category as AchievementCategory);
        });
        
        return invalidAchievements?.length === 0;
      },
      'VALIDATE_ACHIEVEMENT_STRUCTURE'
    );
  }
}
