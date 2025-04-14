
import { FeatureFlag } from './types';
import { FlagStorageService } from './FlagStorageService';
import { UserOverrideService } from './UserOverrideService';

export class FeatureFlagService {
  private static flags: Record<FeatureFlag, boolean> = {
    [FeatureFlag.GUILDS]: false,
    [FeatureFlag.SOCIAL_FEED]: false,
    [FeatureFlag.FRIENDS]: false,
    [FeatureFlag.CHALLENGES]: false,
    [FeatureFlag.POWER_LEVEL_V2]: false,
    [FeatureFlag.TOURNAMENTS]: false,
    [FeatureFlag.QUEST_SYSTEM]: false
  };
  
  private static isInitialized = false;
  
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.loadFlags();
      UserOverrideService.initialize();
      this.isInitialized = true;
      console.log('[FeatureFlagService] Initialized feature flags');
    } catch (error) {
      console.error('[FeatureFlagService] Failed to initialize:', error);
    }
  }
  
  static isEnabled(flag: FeatureFlag, userId?: string): boolean {
    // Check for user-specific override
    if (userId) {
      const override = UserOverrideService.getOverride(flag, userId);
      if (override !== undefined) {
        return override;
      }
    }
    
    // Fall back to global flag status
    return this.flags[flag] || false;
  }
  
  private static async loadFlags(): Promise<void> {
    if (import.meta.env.DEV) {
      const storedFlags = FlagStorageService.loadFromLocalStorage();
      Object.entries(storedFlags).forEach(([key, value]) => {
        if (key in FeatureFlag) {
          this.flags[key as FeatureFlag] = Boolean(value);
        }
      });
      return;
    }
    
    try {
      const flags = await FlagStorageService.loadFromDatabase();
      Object.entries(flags).forEach(([key, value]) => {
        if (key in FeatureFlag) {
          this.flags[key as FeatureFlag] = value;
        }
      });
    } catch (error) {
      console.error('[FeatureFlagService] Error loading flags:', error);
      // Fall back to localStorage if database fails
      this.loadFlags();
    }
  }
  
  static enableFlag(flag: FeatureFlag): void {
    this.flags[flag] = true;
    if (import.meta.env.DEV) {
      FlagStorageService.saveToLocalStorage(this.flags);
    }
  }
  
  static disableFlag(flag: FeatureFlag): void {
    this.flags[flag] = false;
    if (import.meta.env.DEV) {
      FlagStorageService.saveToLocalStorage(this.flags);
    }
  }
  
  static enableFlagForUser(flag: FeatureFlag, userId: string): void {
    UserOverrideService.setOverride(flag, userId, true);
  }
  
  static disableFlagForUser(flag: FeatureFlag, userId: string): void {
    UserOverrideService.setOverride(flag, userId, false);
  }
}

export { FeatureFlag } from './types';
