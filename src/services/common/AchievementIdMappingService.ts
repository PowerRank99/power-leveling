import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS } from '@/constants/achievements/AchievementConstants';

export class AchievementIdMappingService {
  private static idMap: Map<string, string> = new Map();
  private static unmappedIds: Set<string> = new Set();
  private static initialized: boolean = false;
  private static initializationPromise: Promise<void> | null = null;
  
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // If already initializing, wait for that promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = this.doInitialize();
    await this.initializationPromise;
    this.initializationPromise = null;
  }
  
  private static logUnmappedIds() {
    if (this.unmappedIds.size > 0) {
      console.warn(
        '[AchievementIdMapping] Unmapped Achievement IDs:', 
        Array.from(this.unmappedIds)
      );
    }
  }

  static getUnmappedIds(): string[] {
    return Array.from(this.unmappedIds);
  }

  private static normalizeId(id: string): string {
    return id.toLowerCase()
      .replace(/[-_\s]/g, '') // Remove dashes, underscores, and spaces
      .normalize('NFD')       // Normalize accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
      .replace(/[^a-z0-9]/g, ''); // Remove any remaining non-alphanumeric characters
  }

  static async doInitialize(): Promise<void> {
    try {
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, name');
        
      if (error) {
        console.error('Failed to fetch achievements:', error);
        throw error;
      }
      
      if (!achievements) {
        console.error('No achievements found in database');
        return;
      }
      
      // Clear previous mappings and unmapped IDs
      this.idMap.clear();
      this.unmappedIds.clear();
      
      // Create mapping from string IDs to UUIDs with improved matching
      achievements.forEach(achievement => {
        const normalizedName = this.normalizeId(achievement.name);
        
        let matched = false;
        
        // Search through all achievement constants
        for (const rank in ACHIEVEMENT_IDS) {
          for (const category in ACHIEVEMENT_IDS[rank]) {
            const stringIds = ACHIEVEMENT_IDS[rank][category];
            const matchingStringId = stringIds.find(id => 
              this.normalizeId(id) === normalizedName ||
              normalizedName.includes(this.normalizeId(id))
            );
            
            if (matchingStringId) {
              this.idMap.set(matchingStringId, achievement.id);
              matched = true;
              break;
            }
          }
          
          if (matched) break;
        }
        
        // Track unmapped achievements
        if (!matched) {
          this.unmappedIds.add(achievement.name);
        }
      });
      
      // Log unmapped IDs for debugging
      this.logUnmappedIds();
      
      this.initialized = true;
    } catch (error) {
      console.error('[AchievementIdMapping] Initialization failed:', error);
      throw error;
    }
  }
  
  static getUuid(stringId: string): string | undefined {
    if (!this.initialized) {
      console.warn('[AchievementIdMapping] Service not initialized. Call initialize() first.');
      return undefined;
    }
    
    const uuid = this.idMap.get(stringId);
    if (!uuid) {
      console.warn(`[AchievementIdMapping] No UUID mapping found for: ${stringId}`);
    }
    return uuid;
  }
  
  static getAllMappings(): Map<string, string> {
    return new Map(this.idMap);
  }
  
  private static getAllStringIds(): string[] {
    const ids: string[] = [];
    Object.values(ACHIEVEMENT_IDS).forEach(rankAchievements => {
      Object.values(rankAchievements).forEach(categoryAchievements => {
        ids.push(...categoryAchievements);
      });
    });
    return ids;
  }
}
