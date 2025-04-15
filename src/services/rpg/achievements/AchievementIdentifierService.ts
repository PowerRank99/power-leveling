
import { supabase } from '@/integrations/supabase/client';
import { CachingService } from '@/services/common/CachingService';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';

/**
 * Service for mapping between achievement string IDs and database UUIDs
 * Uses caching for performance optimization
 */
export class AchievementIdentifierService {
  private static readonly CACHE_KEY = 'achievement_identifiers';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  private static identifiersCache: Map<string, string> | null = null;
  
  /**
   * Get achievement database UUID by string ID
   */
  static async getIdByStringId(stringId: string): Promise<ServiceResponse<string>> {
    try {
      await this.ensureCache();
      const id = this.identifiersCache?.get(stringId);
      
      if (!id) {
        return createErrorResponse(
          'Achievement ID not found',
          `No achievement found with string ID: ${stringId}`,
          ErrorCategory.NOT_FOUND
        );
      }
      
      return createSuccessResponse(id);
    } catch (error) {
      return createErrorResponse(
        'Failed to get achievement ID',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get achievement string ID by database UUID
   */
  static async getStringIdById(id: string): Promise<ServiceResponse<string>> {
    try {
      await this.ensureCache();
      
      for (const [stringId, uuid] of this.identifiersCache?.entries() || []) {
        if (uuid === id) {
          return createSuccessResponse(stringId);
        }
      }
      
      return createErrorResponse(
        'Achievement string ID not found',
        `No achievement found with ID: ${id}`,
        ErrorCategory.NOT_FOUND
      );
    } catch (error) {
      return createErrorResponse(
        'Failed to get achievement string ID',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Batch convert string IDs to UUIDs
   */
  static async convertToIds(stringIds: string[]): Promise<ServiceResponse<string[]>> {
    try {
      await this.ensureCache();
      const ids: string[] = [];
      const notFound: string[] = [];
      
      for (const stringId of stringIds) {
        const id = this.identifiersCache?.get(stringId);
        if (id) {
          ids.push(id);
        } else {
          notFound.push(stringId);
        }
      }
      
      if (notFound.length > 0) {
        console.warn(`Some achievement IDs were not found: ${notFound.join(', ')}`);
      }
      
      return createSuccessResponse(ids);
    } catch (error) {
      return createErrorResponse(
        'Failed to convert achievement IDs',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Fill in missing string IDs in the achievements table
   */
  static async fillMissingMappings(): Promise<{ added: number, total: number }> {
    try {
      // Find achievements without string_ids
      const { data: missingIds, error: findError } = await supabase
        .from('achievements')
        .select('id, name')
        .is('string_id', null);
        
      if (findError) throw findError;
      
      const total = missingIds?.length || 0;
      let added = 0;
      
      // Generate and set string IDs
      for (const achievement of (missingIds || [])) {
        // Generate a string ID from the name
        const stringId = achievement.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')  // Remove special characters
          .replace(/\s+/g, '-')      // Replace spaces with hyphens
          .replace(/-+/g, '-')       // Remove duplicate hyphens
          .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
          
        // Update the achievement with the generated string ID
        const { error: updateError } = await supabase
          .from('achievements')
          .update({ string_id: stringId })
          .eq('id', achievement.id);
          
        if (!updateError) {
          added++;
        }
      }
      
      // Clear the cache to ensure fresh data
      this.clearCache();
      
      return { added, total };
    } catch (error) {
      console.error('Failed to fill missing mappings:', error);
      return { added: 0, total: 0 };
    }
  }
  
  /**
   * Ensure the cache is loaded with fresh data
   */
  private static async ensureCache(): Promise<void> {
    if (this.identifiersCache) return;
    
    const cached = CachingService.get<Map<string, string>>(this.CACHE_KEY);
    if (cached) {
      this.identifiersCache = cached;
      return;
    }
    
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('id, string_id');
      
    if (error) {
      throw new Error(`Failed to load achievement identifiers: ${error.message}`);
    }
    
    this.identifiersCache = new Map(
      achievements
        .filter(a => a.string_id)
        .map(a => [a.string_id, a.id])
    );
    
    CachingService.set(this.CACHE_KEY, this.identifiersCache, this.CACHE_DURATION);
  }
  
  /**
   * Clear the cache to force a refresh
   */
  static clearCache(): void {
    this.identifiersCache = null;
    CachingService.clear(this.CACHE_KEY);
  }
  
  /**
   * Validate that all required achievement IDs exist
   */
  static async validateRequiredAchievements(requiredIds: string[]): Promise<ServiceResponse<{
    valid: string[];
    missing: string[];
  }>> {
    try {
      await this.ensureCache();
      
      const valid: string[] = [];
      const missing: string[] = [];
      
      for (const id of requiredIds) {
        if (this.identifiersCache?.has(id)) {
          valid.push(id);
        } else {
          missing.push(id);
        }
      }
      
      return createSuccessResponse({ valid, missing });
    } catch (error) {
      return createErrorResponse(
        'Failed to validate achievements',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
}
