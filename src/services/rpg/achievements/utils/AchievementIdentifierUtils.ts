
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementIdentifierService } from '../AchievementIdentifierService';
import { CachingService } from '@/services/common/CachingService';

/**
 * Utility functions for safely retrieving and working with achievement identifiers
 * Centralizes all achievement ID mapping operations to avoid duplication
 */
export class AchievementIdentifierUtils {
  private static CACHE_PREFIX = 'achievement-id-mapping:';
  
  /**
   * Safely get a UUID from a string ID with error handling
   * Returns undefined if not found instead of throwing an error
   */
  static async safeGetId(stringId: string): Promise<string | undefined> {
    try {
      // Check the cache first for performance
      const cachedId = CachingService.get<string>(`${this.CACHE_PREFIX}${stringId}`);
      if (cachedId) return cachedId;
      
      // Use the identifier service
      const result = await AchievementIdentifierService.getIdByStringId(stringId);
      
      if (result.success && result.data) {
        // Cache the result for future use
        CachingService.set(`${this.CACHE_PREFIX}${stringId}`, result.data);
        return result.data;
      }
      
      return undefined;
    } catch (error) {
      console.warn(`Failed to get ID for achievement '${stringId}':`, error);
      return undefined;
    }
  }
  
  /**
   * Get multiple IDs from string IDs in a batch operation
   * Handles errors gracefully and returns as many valid mappings as possible
   */
  static async batchGetIds(stringIds: string[]): Promise<Record<string, string>> {
    if (!stringIds.length) return {};
    
    try {
      const result = await AchievementIdentifierService.convertToIds(stringIds);
      return result.success ? result.data : {};
    } catch (error) {
      console.warn('Failed to batch get IDs for achievements:', error);
      return {};
    }
  }
  
  /**
   * Safely validate if a string ID exists in the database
   * Returns false instead of throwing an error
   */
  static async isValidStringId(stringId: string): Promise<boolean> {
    try {
      const result = await AchievementIdentifierService.validateStringId(stringId);
      return result.success;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get a string ID from a UUID with error handling
   */
  static async getStringId(uuid: string): Promise<string | undefined> {
    try {
      const result = await AchievementIdentifierService.getStringIdFromUuid(uuid);
      return result.success ? result.data : undefined;
    } catch (error) {
      console.warn(`Failed to get string ID for achievement UUID '${uuid}':`, error);
      return undefined;
    }
  }
  
  /**
   * Clear all achievement ID caches
   */
  static clearCaches(): void {
    CachingService.clearCategory(this.CACHE_PREFIX);
    AchievementIdentifierService.clearCache();
  }
}
