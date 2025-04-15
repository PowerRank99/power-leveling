
import { supabase } from '@/integrations/supabase/client';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { toast } from 'sonner';

export class AchievementIdRepairService {
  /**
   * Validate achievement string IDs and ensure they're consistent in database
   */
  static async validateAchievementStringIds(): Promise<{
    valid: number;
    invalid: number;
    errors: string[];
  }> {
    console.log('[AchievementIdRepairService] Validating achievement string IDs...');
    
    try {
      // Fetch all achievements from the database
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, name, string_id');
        
      if (error) throw error;
      
      const valid = achievements.filter(a => a.string_id != null).length;
      const invalid = achievements.filter(a => a.string_id == null).length;
      const errors = achievements
        .filter(a => a.string_id == null)
        .map(a => `Missing string ID for achievement: ${a.name} (${a.id})`);
      
      return {
        valid,
        invalid,
        errors
      };
    } catch (error) {
      console.error('[AchievementIdRepairService] Validation failed:', error);
      return {
        valid: 0,
        invalid: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  /**
   * Generate string IDs for achievements that don't have them
   */
  static async generateMissingStringIds(): Promise<{
    generated: number;
    errors: string[];
  }> {
    console.log('[AchievementIdRepairService] Generating missing string IDs...');
    
    try {
      // Find achievements without string IDs
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, name')
        .is('string_id', null);
        
      if (error) throw error;
      
      if (achievements.length === 0) {
        return {
          generated: 0,
          errors: []
        };
      }
      
      // Generate and update string IDs
      const updates = achievements.map(achievement => {
        // Generate a string ID based on the name
        const stringId = this.generateStringIdFromName(achievement.name);
        
        return {
          id: achievement.id,
          string_id: stringId
        };
      });
      
      // Update the achievements in batches
      const batchSize = 50;
      const errors = [];
      let generated = 0;
      
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        // Perform upsert to update existing records
        const { error: updateError } = await supabase
          .from('achievements')
          .upsert(batch, { onConflict: 'id' });
          
        if (updateError) {
          errors.push(`Failed to update batch ${i/batchSize + 1}: ${updateError.message}`);
        } else {
          generated += batch.length;
        }
      }
      
      return {
        generated,
        errors
      };
    } catch (error) {
      console.error('[AchievementIdRepairService] Generation failed:', error);
      return {
        generated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
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
   * Fix all achievement ID issues
   */
  static async fixAllAchievementIdIssues(): Promise<{
    success: boolean;
    message: string;
    details: {
      validated: number;
      generated: number;
      errors: string[];
    };
  }> {
    try {
      console.log('[AchievementIdRepairService] Starting comprehensive achievement ID fix...');
      
      // Validate string IDs
      const validationResult = await this.validateAchievementStringIds();
      
      // Generate missing string IDs if needed
      const generationResult = await this.generateMissingStringIds();
      
      // Clear cache and reload
      AchievementUtils.clearCache();
      await AchievementUtils.getAllAchievements();
      
      const errors = [...validationResult.errors, ...generationResult.errors];
      const success = errors.length === 0;
      
      return {
        success,
        message: success 
          ? `Validated ${validationResult.valid} string IDs and generated ${generationResult.generated} new ones` 
          : `Partially fixed issues: ${errors.length} errors remaining`,
        details: {
          validated: validationResult.valid,
          generated: generationResult.generated,
          errors
        }
      };
    } catch (error) {
      console.error('[AchievementIdRepairService] Comprehensive fix failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during achievement ID fix',
        details: {
          validated: 0,
          generated: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        }
      };
    }
  }
}
