
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS } from '@/constants/achievements/AchievementConstants';

export class AchievementIdMappingService {
  private static idMap: Map<string, string> = new Map();
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
  
  private static async doInitialize(): Promise<void> {
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
      
      // Create mapping from string IDs to UUIDs
      achievements.forEach(achievement => {
        const normalizedName = this.normalizeId(achievement.name);
        
        // Find matching achievement ID from constants
        for (const rank in ACHIEVEMENT_IDS) {
          for (const category in ACHIEVEMENT_IDS[rank]) {
            const stringIds = ACHIEVEMENT_IDS[rank][category];
            const matchingStringId = stringIds.find(id => 
              this.normalizeId(id) === normalizedName ||
              this.normalizeId(achievement.name).includes(this.normalizeId(id))
            );
            
            if (matchingStringId) {
              this.idMap.set(matchingStringId, achievement.id);
              console.log(`[AchievementIdMapping] Mapped ${matchingStringId} to ${achievement.id}`);
            }
          }
        }
      });
      
      this.initialized = true;
      console.log(`[AchievementIdMapping] Initialized with ${this.idMap.size} mappings`);
      
      // Log unmapped achievements for debugging
      const allStringIds = this.getAllStringIds();
      const unmappedIds = allStringIds.filter(id => !this.idMap.has(id));
      if (unmappedIds.length > 0) {
        console.warn('[AchievementIdMapping] Unmapped achievement IDs:', unmappedIds);
      }
      
    } catch (error) {
      console.error('[AchievementIdMapping] Failed to initialize:', error);
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
  
  private static normalizeId(id: string): string {
    return id.toLowerCase()
      .replace(/[-_\s]/g, '') // Remove dashes, underscores, and spaces
      .replace(/[^a-z0-9]/g, ''); // Remove any non-alphanumeric characters
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
