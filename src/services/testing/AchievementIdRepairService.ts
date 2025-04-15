
/**
 * AchievementIdRepairService
 * 
 * This service handles the repair and migration of achievement IDs,
 * ensuring proper mapping between string IDs and UUIDs in the database.
 */
import { supabase } from '@/integrations/supabase/client';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';
import { AchievementStandardizationService } from '@/services/common/AchievementStandardizationService';
import { toast } from 'sonner';

export class AchievementIdRepairService {
  /**
   * Repairs missing achievement ID mappings
   */
  static async repairAchievementIdMappings(): Promise<{
    fixed: number;
    failed: number;
    errors: string[];
  }> {
    console.log('[AchievementIdRepairService] Starting achievement ID repair...');
    
    try {
      // Step 1: Run validation to identify unmapped achievements
      const validationResult = await AchievementStandardizationService.validateAndStandardize();
      console.log('[AchievementIdRepairService] Validation result:', validationResult);
      
      if (validationResult.missing.length === 0 && validationResult.invalid.length === 0) {
        console.log('[AchievementIdRepairService] No issues found with achievement mappings');
        return { fixed: 0, failed: 0, errors: [] };
      }
      
      // Step 2: Migrate unmapped achievements
      const migratedCount = await AchievementStandardizationService.migrateUnmappedAchievements();
      console.log(`[AchievementIdRepairService] Migrated ${migratedCount} achievement mappings`);
      
      // Step 3: Clear cache and reload achievements
      AchievementUtils.clearCache();
      await AchievementUtils.getAllAchievements();
      
      // Step 4: Reinitialize mapping service
      await AchievementIdMappingService.initialize();
      
      // Step 5: Verify the fix
      const verificationResult = AchievementIdMappingService.validateMappings();
      
      return {
        fixed: migratedCount,
        failed: verificationResult.unmapped.length,
        errors: verificationResult.unmapped.map(id => `No mapping for: ${id}`)
      };
    } catch (error) {
      console.error('[AchievementIdRepairService] Repair failed:', error);
      return {
        fixed: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  /**
   * Checks for and repairs any missing achievement database entries
   */
  static async ensureAchievementDatabaseEntries(): Promise<{
    created: number;
    errors: string[];
  }> {
    console.log('[AchievementIdRepairService] Checking for missing achievement database entries...');
    
    try {
      // Step 1: Get all achievements from utils
      const achievements = await AchievementUtils.getAllAchievements();
      const stringIds = achievements.map(a => a.stringId).filter(Boolean);
      
      // Step 2: Check which ones exist in the database
      const { data: existingMappings, error } = await supabase
        .from('achievement_id_mappings')
        .select('string_id')
        .in('string_id', stringIds);
        
      if (error) throw error;
      
      const existingStringIds = new Set(existingMappings?.map(m => m.string_id) || []);
      const missingStringIds = stringIds.filter(id => id && !existingStringIds.has(id));
      
      if (missingStringIds.length === 0) {
        console.log('[AchievementIdRepairService] No missing achievement database entries');
        return { created: 0, errors: [] };
      }
      
      // Step 3: Create mappings for missing entries
      let created = 0;
      const errors: string[] = [];
      
      for (const stringId of missingStringIds) {
        if (!stringId) continue;
        
        const achievement = achievements.find(a => a.stringId === stringId);
        if (!achievement) {
          errors.push(`Achievement with stringId "${stringId}" not found`);
          continue;
        }
        
        // Create mapping
        const { error: insertError } = await supabase
          .from('achievement_id_mappings')
          .insert({ 
            string_id: stringId, 
            uuid: achievement.id 
          });
          
        if (insertError) {
          errors.push(`Failed to create mapping for "${stringId}": ${insertError.message}`);
        } else {
          created++;
        }
      }
      
      // Step 4: Reinitialize mapping service
      await AchievementIdMappingService.initialize();
      
      return { created, errors };
    } catch (error) {
      console.error('[AchievementIdRepairService] Ensuring database entries failed:', error);
      return {
        created: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  /**
   * Comprehensive fix for all achievement ID issues
   */
  static async fixAllAchievementIdIssues(): Promise<{
    success: boolean;
    message: string;
    details: {
      mappingsFixed: number;
      entriesCreated: number;
      mappingErrors: string[];
      entryErrors: string[];
    };
  }> {
    try {
      console.log('[AchievementIdRepairService] Starting comprehensive achievement ID fix...');
      
      // Fix missing mappings
      const mappingResult = await this.repairAchievementIdMappings();
      
      // Ensure database entries
      const entriesResult = await this.ensureAchievementDatabaseEntries();
      
      // Clear cache and reload
      AchievementUtils.clearCache();
      await AchievementUtils.getAllAchievements();
      
      // Reinitialize mapping service
      await AchievementIdMappingService.initialize();
      
      const success = mappingResult.failed === 0 && entriesResult.errors.length === 0;
      
      return {
        success,
        message: success 
          ? `Fixed ${mappingResult.fixed} mappings and created ${entriesResult.created} entries` 
          : `Partially fixed issues: ${mappingResult.failed} mappings still broken, ${entriesResult.errors.length} entry errors`,
        details: {
          mappingsFixed: mappingResult.fixed,
          entriesCreated: entriesResult.created,
          mappingErrors: mappingResult.errors,
          entryErrors: entriesResult.errors
        }
      };
    } catch (error) {
      console.error('[AchievementIdRepairService] Comprehensive fix failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during achievement ID fix',
        details: {
          mappingsFixed: 0,
          entriesCreated: 0,
          mappingErrors: [error instanceof Error ? error.message : 'Unknown error'],
          entryErrors: []
        }
      };
    }
  }
}
