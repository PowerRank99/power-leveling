
import { supabase } from '@/integrations/supabase/client';

interface AchievementIdMapping {
  codeId: string;
  dbId: string;
  name?: string;
}

export class AchievementIdMappingService {
  private static initialized = false;
  private static mappings: Map<string, string> = new Map();
  private static reverseMappings: Map<string, string> = new Map();
  
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Load mappings from database
      const { data, error } = await supabase
        .from('achievement_id_mappings')
        .select('code_id, db_id');
        
      if (error) {
        throw error;
      }
      
      // Initialize mappings
      this.mappings.clear();
      this.reverseMappings.clear();
      
      // Process each mapping
      data.forEach((mapping) => {
        this.mappings.set(mapping.code_id, mapping.db_id);
        this.reverseMappings.set(mapping.db_id, mapping.code_id);
      });
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing achievement ID mappings:', error);
      throw error;
    }
  }
  
  static getDbId(codeId: string): string | null {
    if (!this.initialized) {
      console.warn('AchievementIdMappingService not initialized. Call initialize() first.');
    }
    
    return this.mappings.get(codeId) || null;
  }
  
  static getCodeId(dbId: string): string | null {
    if (!this.initialized) {
      console.warn('AchievementIdMappingService not initialized. Call initialize() first.');
    }
    
    return this.reverseMappings.get(dbId) || null;
  }
  
  static async addMapping(codeId: string, dbId: string, name?: string): Promise<void> {
    try {
      // Add mapping to database
      const { error } = await supabase
        .from('achievement_id_mappings')
        .insert({
          code_id: codeId,
          db_id: dbId,
          name: name
        });
        
      if (error) {
        throw error;
      }
      
      // Update local mappings
      this.mappings.set(codeId, dbId);
      this.reverseMappings.set(dbId, codeId);
    } catch (error) {
      console.error('Error adding achievement ID mapping:', error);
      throw error;
    }
  }
  
  static async updateMapping(codeId: string, dbId: string): Promise<void> {
    try {
      // Update mapping in database
      const { error } = await supabase
        .from('achievement_id_mappings')
        .update({ db_id: dbId })
        .eq('code_id', codeId);
        
      if (error) {
        throw error;
      }
      
      // Update local mappings
      this.mappings.set(codeId, dbId);
      this.reverseMappings.set(dbId, codeId);
    } catch (error) {
      console.error('Error updating achievement ID mapping:', error);
      throw error;
    }
  }
  
  static async removeMapping(codeId: string): Promise<void> {
    try {
      const dbId = this.mappings.get(codeId);
      if (!dbId) return;
      
      // Remove mapping from database
      const { error } = await supabase
        .from('achievement_id_mappings')
        .delete()
        .eq('code_id', codeId);
        
      if (error) {
        throw error;
      }
      
      // Update local mappings
      this.mappings.delete(codeId);
      this.reverseMappings.delete(dbId);
    } catch (error) {
      console.error('Error removing achievement ID mapping:', error);
      throw error;
    }
  }
  
  /**
   * Get validation status for mappings
   */
  static validateMappings() {
    // Get all code IDs from constants
    const codeIds: string[] = [];
    
    // Get all DB IDs from database
    const dbIds: string[] = [];
    
    return {
      mapped: Array.from(this.mappings.keys()),
      unmapped: codeIds.filter(id => !this.mappings.has(id)),
      orphaned: Array.from(this.mappings.keys()).filter(id => !codeIds.includes(id))
    };
  }
}
