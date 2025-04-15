
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS } from '@/constants/achievements/AchievementConstants';
import { Achievement } from '@/types/achievementTypes';
import { AchievementDefinition } from '@/constants/achievements/AchievementSchema';

export class AchievementIdMappingService {
  private static idMap: Map<string, { 
    uuid: string; 
    achievement: Achievement | AchievementDefinition 
  }> = new Map();
  
  private static unmappedIds: Set<string> = new Set();
  private static initialized: boolean = false;
  private static debugLog: string[] = [];

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, name, category, rank, points, xp_reward, icon_name');

      if (error) {
        this.logError('Initialization failed', error);
        throw error;
      }

      this.idMap.clear();
      this.unmappedIds.clear();
      this.debugLog = [];

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
          this.logWarning(`Unmapped Achievement: ${achievement.name}`);
        }
      });

      this.initialized = true;
    } catch (error) {
      this.logError('AchievementIdMapping initialization failed', error);
      throw error;
    }
  }

  private static normalizeId(id: string): string {
    if (!id) return '';
    
    // Enhanced normalization for Portuguese and English
    return id.toLowerCase()
      .normalize('NFD')       // Normalize accented characters
      .replace(/[\u0300-\u036f]/g, '')  // Remove accent marks
      .replace(/[^a-z0-9]/g, '')  // Remove non-alphanumeric
      .replace(/\s+/g, '');  // Remove whitespaces
  }

  private static findMatchingAchievement(normalizedName: string): Achievement | undefined {
    // Search through all achievement constants
    for (const rank in ACHIEVEMENT_IDS) {
      for (const category in ACHIEVEMENT_IDS[rank]) {
        const achievements = ACHIEVEMENT_IDS[rank][category];
        
        const match = achievements.find(achievement => 
          this.normalizeId(achievement.name || achievement) === normalizedName
        );

        if (match) return match;
      }
    }
    return undefined;
  }

  // Comprehensive validation and reporting
  static validateMappings(): {
    valid: number;
    invalid: number;
    unmapped: string[];
    missingDatabaseEntries: string[];
    debugLog: string[];
  } {
    if (!this.initialized) {
      this.logError('AchievementIdMapping not initialized');
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
      missingDatabaseEntries,
      debugLog: this.debugLog
    };
  }

  private static getAllConstantIds(): string[] {
    const ids: string[] = [];
    
    Object.values(ACHIEVEMENT_IDS).forEach(rankAchievements => {
      Object.values(rankAchievements).forEach(categoryAchievements => {
        ids.push(...categoryAchievements.map(a => a.id || a));
      });
    });
    
    return ids;
  }

  // Logging methods
  private static logError(message: string, error?: any): void {
    const logEntry = `[ERROR] ${message}: ${error ? JSON.stringify(error) : ''}`;
    this.debugLog.push(logEntry);
    console.error(logEntry);
  }

  private static logWarning(message: string): void {
    const logEntry = `[WARN] ${message}`;
    this.debugLog.push(logEntry);
    console.warn(logEntry);
  }

  // Defensive programming methods
  static getAchievementDetails(stringId: string): { uuid?: string; achievement?: Achievement } {
    this.ensureInitialized();
    const entry = Array.from(this.idMap.values()).find(
      entry => entry.achievement.id === stringId
    );
    return entry || {};
  }

  private static ensureInitialized(): void {
    if (!this.initialized) {
      this.logError('Service not initialized');
      throw new Error('AchievementIdMapping not initialized');
    }
  }

  // Method to reset and reinitialize
  static async reset(): Promise<void> {
    this.initialized = false;
    this.idMap.clear();
    this.unmappedIds.clear();
    this.debugLog = [];
    await this.initialize();
  }
}

// Automatically initialize on import
AchievementIdMappingService.initialize().catch(console.error);
