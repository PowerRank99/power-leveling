
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AchievementMigrationService {
  /**
   * Migrate from achievement_id_mappings to using database directly
   */
  static async migrateFromMappingsToDatabase(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('[AchievementMigrationService] Starting migration from ID mappings to database...');
      
      // Ensure all achievements have string_id values before dropping the mapping table
      const { data: missingStringIds, error: checkError } = await supabase
        .from('achievements')
        .select('id, name')
        .is('string_id', null);
        
      if (checkError) throw checkError;
      
      if (missingStringIds && missingStringIds.length > 0) {
        // Generate string IDs for achievements that don't have them
        const updates = missingStringIds.map(achievement => ({
          id: achievement.id,
          string_id: this.generateStringIdFromName(achievement.name)
        }));
        
        console.log(`[AchievementMigrationService] Generating string IDs for ${updates.length} achievements...`);
        
        // Update achievements with generated string IDs
        const { error: updateError } = await supabase
          .from('achievements')
          .upsert(updates, { onConflict: 'id' });
          
        if (updateError) throw updateError;
      }
      
      console.log('[AchievementMigrationService] Migration completed successfully.');
      
      return {
        success: true,
        message: `Successfully migrated from ID mappings to using database directly. All ${missingStringIds ? missingStringIds.length : 0} missing string IDs have been generated.`
      };
    } catch (error) {
      console.error('[AchievementMigrationService] Migration failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during migration'
      };
    }
  }
  
  /**
   * Generate a string ID from an achievement name
   */
  private static generateStringIdFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Remove duplicate hyphens
      .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
  }
  
  /**
   * Perform the migration with UI feedback
   */
  static async performMigration(): Promise<boolean> {
    try {
      toast.info('Starting achievement migration...', {
        duration: 3000
      });
      
      const migrationResult = await this.migrateFromMappingsToDatabase();
      
      if (migrationResult.success) {
        toast.success('Achievement migration completed', {
          description: migrationResult.message
        });
        return true;
      } else {
        toast.error('Achievement migration failed', {
          description: migrationResult.message
        });
        return false;
      }
    } catch (error) {
      toast.error('Achievement migration failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}
