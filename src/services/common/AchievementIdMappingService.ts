import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS } from '@/constants/achievements/AchievementConstants';
import { Achievement } from '@/types/achievementTypes';
import { ServiceErrorHandler } from '@/services/common/ServiceErrorHandler';

export class AchievementIdMappingService {
  private static idMap: Map<string, { uuid: string; achievement: Achievement }> = new Map();
  private static unmappedIds: Set<string> = new Set();
  private static initialized: boolean = false;
  private static logger = new ServiceErrorHandler('AchievementIdMappingService');

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, name, category, rank, points, xp_reward, icon_name');

      if (error) {
        this.logger.logError('Initialization failed', error);
        throw error;
      }

      this.idMap.clear();
      this.unmappedIds.clear();

      achievements.forEach(achievement => {
        const normalizedName = this.normalizeId(achievement.name);
        const matchingAchievement = this.findMatchingAchievement(normalizedName);

        if (matchingAchievement) {
          this.idMap.set(matchingAchievement.id, {
            uuid: achievement.id,
            achievement: {
              ...matchingAchievement,
              id: achievement.id  // Override with database UUID
            }
          });
        } else {
          this.unmappedIds.add(achievement.name);
          this.logger.logWarning(`Unmapped Achievement: ${achievement.name}`);
        }
      });

      this.initialized = true;
    } catch (error) {
      this.logger.logError('Initialization failed', error);
      throw error;
    }
  }

  private static normalizeId(id: string): string {
    if (!id) return '';
    
    return id.toLowerCase()
      .normalize('NFD')       // Normalize accented characters
      .replace(/[\u0300-\u036f]/g, '')  // Remove accent marks
      .replace(/[^a-z0-9]/g, '');  // Remove non-alphanumeric
  }

  private static findMatchingAchievement(normalizedName: string): Achievement | undefined {
    // Search through all achievement constants
    for (const rank in ACHIEVEMENT_IDS) {
      for (const category in ACHIEVEMENT_IDS[rank]) {
        const achievements = ACHIEVEMENT_IDS[rank][category];
        
        const match = achievements.find(achievement => 
          this.normalizeId(achievement.name) === normalizedName
        );

        if (match) return match;
      }
    }
    return undefined;
  }

  private static logUnmappedIds(): void {
    if (this.unmappedIds.size > 0) {
      console.warn(
        '[AchievementIdMapping] Unmapped Achievement IDs:', 
        Array.from(this.unmappedIds)
      );
    }
  }

  static validateMappings(): {
    valid: number;
    invalid: number;
    unmapped: string[];
    missingDatabaseEntries: string[];
  } {
    if (!this.initialized) {
      throw new Error('AchievementIdMapping not initialized');
    }

    const allConstantIds = this.getAllConstantIds();
    const missingDatabaseEntries = allConstantIds.filter(id => 
      !Array.from(this.idMap.keys()).includes(id)
    );

    return {
      valid: this.idMap.size,
      invalid: this.unmappedIds.size,
      unmapped: Array.from(this.unmappedIds),
      missingDatabaseEntries
    };
  }

  private static getAllConstantIds(): string[] {
    const ids: string[] = [];
    Object.values(ACHIEVEMENT_IDS).forEach(rankAchievements => {
      Object.values(rankAchievements).forEach(categoryAchievements => {
        ids.push(...categoryAchievements.map(a => a.id));
      });
    });
    return ids;
  }

  static getAchievementDetails(stringId: string): { uuid?: string; achievement?: Achievement } {
    if (!this.initialized) {
      console.warn('[AchievementIdMapping] Service not initialized');
      return {};
    }

    const entry = Array.from(this.idMap.values()).find(
      entry => entry.achievement.id === stringId
    );

    return entry || {};
  }

  static getUuid(stringId: string): string | undefined {
    if (!this.initialized) {
      console.warn('[AchievementIdMapping] Service not initialized when getting UUID for', stringId);
      return undefined;
    }

    const entry = Array.from(this.idMap.entries()).find(
      ([id, _]) => id === stringId
    );

    return entry?.[1].uuid;
  }

  static getAllMappings(): Map<string, string> {
    if (!this.initialized) {
      console.warn('[AchievementIdMapping] Service not initialized when getting all mappings');
      return new Map();
    }

    const mappings = new Map<string, string>();
    this.idMap.forEach((value, key) => {
      mappings.set(key, value.uuid);
    });
    
    return mappings;
  }

  static async syncDatabaseEntries(): Promise<void> {
    const missingEntries = this.validateMappings().missingDatabaseEntries;
    
    if (missingEntries.length > 0) {
      try {
        // Future implementation: Bulk insert missing achievements
        this.logger.logInfo(`Syncing ${missingEntries.length} missing achievement entries`);
      } catch (error) {
        this.logger.logError('Database sync failed', error);
      }
    }
  }

  static async reset(): Promise<void> {
    this.initialized = false;
    this.idMap.clear();
    this.unmappedIds.clear();
    await this.initialize();
  }
}

// Automatically initialize on import
AchievementIdMappingService.initialize().catch(console.error);
