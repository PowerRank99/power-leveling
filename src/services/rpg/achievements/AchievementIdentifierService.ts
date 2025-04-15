
import { AchievementIdMigration } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';

/**
 * Service for working with achievement string IDs and their UUIDs
 * This service replaces the old AchievementIdMappingService with improved caching
 */
export class AchievementIdentifierService {
  // Cache for mapping between string IDs and UUIDs
  private static mappingCache: Map<string, string> = new Map();
  private static reverseMappingCache: Map<string, string> = new Map();
  private static cacheInitialized: boolean = false;
  
  /**
   * Initialize cache from database
   */
  private static async initializeCache(): Promise<void> {
    try {
      if (this.cacheInitialized) return;
      
      const { data: mappings, error } = await supabase
        .from('achievements')
        .select('id, string_id');
        
      if (error) throw error;
      
      if (mappings && mappings.length > 0) {
        this.mappingCache.clear();
        this.reverseMappingCache.clear();
        
        mappings.forEach(mapping => {
          if (mapping.string_id && mapping.id) {
            this.mappingCache.set(mapping.string_id, mapping.id);
            this.reverseMappingCache.set(mapping.id, mapping.string_id);
          }
        });
      }
      
      this.cacheInitialized = true;
    } catch (error) {
      console.error('Failed to initialize achievement ID mapping cache:', error);
      // Don't set cacheInitialized to true on error so we'll retry next time
    }
  }
  
  /**
   * Convert a string ID to a UUID
   */
  static async getUuidFromStringId(stringId: string): Promise<ServiceResponse<string>> {
    try {
      await this.initializeCache();
      
      // Check cache first
      const cachedUuid = this.mappingCache.get(stringId);
      if (cachedUuid) {
        return createSuccessResponse(cachedUuid);
      }
      
      // If not in cache, try to get from database
      const { data, error } = await supabase
        .from('achievements')
        .select('id')
        .eq('string_id', stringId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data && data.id) {
        // Update cache
        this.mappingCache.set(stringId, data.id);
        this.reverseMappingCache.set(data.id, stringId);
        return createSuccessResponse(data.id);
      }
      
      return createErrorResponse(
        `Achievement string ID not found: ${stringId}`,
        `No UUID found for string ID: ${stringId}`,
        ErrorCategory.NOT_FOUND
      );
    } catch (error) {
      return createErrorResponse(
        'Failed to convert string ID to UUID',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Convert multiple string IDs to UUIDs in a batch operation
   */
  static async getUuidsFromStringIds(stringIds: string[]): Promise<ServiceResponse<Record<string, string>>> {
    try {
      await this.initializeCache();
      
      const result: Record<string, string> = {};
      const missingIds: string[] = [];
      
      // First check cache for all IDs
      for (const stringId of stringIds) {
        const cachedUuid = this.mappingCache.get(stringId);
        if (cachedUuid) {
          result[stringId] = cachedUuid;
        } else {
          missingIds.push(stringId);
        }
      }
      
      // If any IDs weren't in cache, fetch them from database
      if (missingIds.length > 0) {
        const { data, error } = await supabase
          .from('achievements')
          .select('id, string_id')
          .in('string_id', missingIds);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          for (const mapping of data) {
            if (mapping.string_id && mapping.id) {
              result[mapping.string_id] = mapping.id;
              // Update cache
              this.mappingCache.set(mapping.string_id, mapping.id);
              this.reverseMappingCache.set(mapping.id, mapping.string_id);
            }
          }
        }
      }
      
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(
        'Failed to convert string IDs to UUIDs',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Convert a UUID to a string ID
   */
  static async getStringIdFromUuid(uuid: string): Promise<ServiceResponse<string>> {
    try {
      await this.initializeCache();
      
      // Check cache first
      const cachedStringId = this.reverseMappingCache.get(uuid);
      if (cachedStringId) {
        return createSuccessResponse(cachedStringId);
      }
      
      // If not in cache, try to get from database
      const { data, error } = await supabase
        .from('achievements')
        .select('string_id')
        .eq('id', uuid)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data && data.string_id) {
        // Update cache
        this.mappingCache.set(data.string_id, uuid);
        this.reverseMappingCache.set(uuid, data.string_id);
        return createSuccessResponse(data.string_id);
      }
      
      return createErrorResponse(
        `Achievement UUID not found: ${uuid}`,
        `No string ID found for UUID: ${uuid}`,
        ErrorCategory.NOT_FOUND
      );
    } catch (error) {
      return createErrorResponse(
        'Failed to convert UUID to string ID',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Fill any missing mappings from achievement names
   */
  static async fillMissingMappings(): Promise<ServiceResponse<AchievementIdMigration[]>> {
    try {
      const { data: result, error } = await supabase
        .rpc('match_achievement_by_name');
        
      if (error) throw error;
      
      const migrations: AchievementIdMigration[] = result || [];
      
      // Update our cache with the new mappings
      migrations.forEach(mapping => {
        if (mapping.string_id && mapping.uuid) {
          this.mappingCache.set(mapping.string_id, mapping.uuid);
          this.reverseMappingCache.set(mapping.uuid, mapping.string_id);
        }
      });
      
      return createSuccessResponse(migrations);
    } catch (error) {
      return createErrorResponse(
        'Failed to fill missing achievement ID mappings',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Validate that a string ID exists in the database
   */
  static async validateStringId(stringId: string): Promise<ServiceResponse<boolean>> {
    const uuidResult = await this.getUuidFromStringId(stringId);
    return {
      success: uuidResult.success,
      data: uuidResult.success,
      message: uuidResult.message,
      error: uuidResult.error
    };
  }
  
  /**
   * Invalidate cache to force reload from database
   */
  static invalidateCache(): void {
    this.mappingCache.clear();
    this.reverseMappingCache.clear();
    this.cacheInitialized = false;
  }
}
