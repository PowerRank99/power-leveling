import { supabase } from '@/integrations/supabase/client';
import { AchievementIdentifierService } from '../AchievementIdentifierService';

/**
 * Service for migrating and validating achievement data
 */
export class AchievementMigrationService {
  /**
   * Run a full migration of achievement string IDs
   */
  static async migrateStringIds(): Promise<{
    success: boolean;
    added: number;
    total: number;
    missingAfter: number;
    message: string;
  }> {
    try {
      // Backup current state for safety
      const backupResult = await this.backupAchievements();
      if (!backupResult.success) {
        return {
          success: false,
          added: 0,
          total: 0,
          missingAfter: 0,
          message: `Failed to create backup: ${backupResult.message}`
        };
      }
      
      // Fill missing string IDs
      const { added, total } = await AchievementIdentifierService.fillMissingMappings();
      
      // Check how many still missing
      const { data: missing, error: missingError } = await supabase
        .from('achievements')
        .select('id')
        .is('string_id', null);
        
      if (missingError) {
        return {
          success: false,
          added,
          total,
          missingAfter: 0,
          message: `Failed to check missing IDs: ${missingError.message}`
        };
      }
      
      return {
        success: true,
        added,
        total,
        missingAfter: missing.length,
        message: `Migration completed successfully. Added ${added} string IDs, ${missing.length} remain missing.`
      };
    } catch (error) {
      return {
        success: false,
        added: 0,
        total: 0,
        missingAfter: 0,
        message: `Migration failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Validate the consistency of achievement data
   */
  static async validateAchievementConsistency(): Promise<{
    success: boolean;
    total: number;
    valid: number;
    invalid: number;
    missingStringId: number;
    duplicateStringId: number;
    message: string;
    invalidItems?: any[];
  }> {
    try {
      // Get all achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*');
        
      if (error) {
        throw new Error(`Failed to fetch achievements: ${error.message}`);
      }
      
      const total = achievements.length;
      let valid = 0;
      let invalid = 0;
      let missingStringId = 0;
      let duplicateStringId = 0;
      const invalidItems: any[] = [];
      const stringIdCounts = new Map<string, number>();
      
      // Check each achievement
      for (const achievement of achievements) {
        let isValid = true;
        const issues: string[] = [];
        
        // Check required fields
        if (!achievement.name || achievement.name.trim() === '') {
          isValid = false;
          issues.push('Missing name');
        }
        
        if (!achievement.category || achievement.category.trim() === '') {
          isValid = false;
          issues.push('Missing category');
        }
        
        if (!achievement.rank || achievement.rank.trim() === '') {
          isValid = false;
          issues.push('Missing rank');
        }
        
        if (!achievement.string_id || achievement.string_id.trim() === '') {
          isValid = false;
          missingStringId++;
          issues.push('Missing string_id');
        } else {
          // Count string_id occurrences
          const count = stringIdCounts.get(achievement.string_id) || 0;
          stringIdCounts.set(achievement.string_id, count + 1);
        }
        
        if (isValid) {
          valid++;
        } else {
          invalid++;
          invalidItems.push({
            id: achievement.id,
            name: achievement.name,
            issues
          });
        }
      }
      
      // Check for duplicate string_ids
      for (const [stringId, count] of stringIdCounts.entries()) {
        if (count > 1) {
          duplicateStringId++;
          const duplicates = achievements
            .filter(a => a.string_id === stringId)
            .map(a => ({ id: a.id, name: a.name }));
            
          invalidItems.push({
            stringId,
            count,
            duplicates,
            issues: ['Duplicate string_id']
          });
        }
      }
      
      return {
        success: true,
        total,
        valid,
        invalid,
        missingStringId,
        duplicateStringId,
        message: `Validation completed. ${valid}/${total} valid, ${invalid} invalid, ${missingStringId} missing string_id, ${duplicateStringId} duplicate string_id.`,
        invalidItems: invalidItems.length > 0 ? invalidItems : undefined
      };
    } catch (error) {
      return {
        success: false,
        total: 0,
        valid: 0,
        invalid: 0,
        missingStringId: 0,
        duplicateStringId: 0,
        message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Backup achievements table
   */
  private static async backupAchievements(): Promise<{ success: boolean; message: string }> {
    try {
      // Create a timestamped backup table
      const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
      const backupTable = `achievements_backup_${timestamp}`;
      
      const { error } = await supabase.rpc('create_achievements_backup', {
        backup_table_name: backupTable
      });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: `Backup created successfully: ${backupTable}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Backup failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Restore from a backup table
   */
  static async restoreFromBackup(backupTable: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.rpc('restore_achievements_from_backup', {
        backup_table_name: backupTable
      });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: `Restored successfully from ${backupTable}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Restore failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
