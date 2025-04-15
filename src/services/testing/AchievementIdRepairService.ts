
import { supabase } from '@/integrations/supabase/client';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';
import { AchievementStandardizationService } from '@/services/common/AchievementStandardizationService';
import { toast } from 'sonner';

export class AchievementIdRepairService {
  static async repairAchievementIdMappings(): Promise<{
    fixed: number;
    failed: number;
    errors: string[];
  }> {
    console.log('[AchievementIdRepairService] Starting achievement ID repair...');
    
    try {
      // Clear existing mappings
      const { error: clearError } = await supabase
        .from('achievement_id_mappings')
        .delete()
        .neq('string_id', ''); // Delete all records
        
      if (clearError) throw clearError;
      
      // Reinitialize mappings
      await AchievementIdMappingService.initialize();
      
      // Get validation results
      const validationResult = AchievementIdMappingService.validateMappings();
      
      return {
        fixed: validationResult.unmapped.length,
        failed: 0,
        errors: []
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
  
  static async ensureAchievementDatabaseEntries(): Promise<{
    created: number;
    errors: string[];
  }> {
    console.log('[AchievementIdRepairService] Checking achievement database entries...');
    
    try {
      // Get all achievements
      const achievements = await AchievementUtils.getAllAchievements();
      const result = await AchievementIdMappingService.repairMappings();
      
      return {
        created: achievements.length - result.unmapped.length,
        errors: result.unmapped.map(id => `No mapping created for: ${id}`)
      };
    } catch (error) {
      console.error('[AchievementIdRepairService] Database entries check failed:', error);
      return {
        created: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
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
