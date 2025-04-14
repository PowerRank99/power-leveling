
import { supabase } from '@/integrations/supabase/client';

/**
 * Enum of feature flags available in the application
 */
export enum FeatureFlag {
  GUILDS = 'guilds',
  SOCIAL_FEED = 'social_feed',
  FRIENDS = 'friends',
  CHALLENGES = 'challenges',
  POWER_LEVEL_V2 = 'power_level_v2',
  TOURNAMENTS = 'tournaments',
  QUEST_SYSTEM = 'quest_system'
}

/**
 * Interface for feature flag data
 */
export interface FeatureFlagData {
  name: FeatureFlag;
  enabled: boolean;
  enabledForUsers?: string[];
}

/**
 * Service for managing feature flags
 */
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
  
  private static userOverrides: Record<string, Record<FeatureFlag, boolean>> = {};
  private static isInitialized = false;
  
  /**
   * Initialize feature flags
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.loadFlags();
      this.isInitialized = true;
      console.log('[FeatureFlagService] Initialized feature flags');
    } catch (error) {
      console.error('[FeatureFlagService] Failed to initialize:', error);
    }
  }
  
  /**
   * Check if a feature flag is enabled
   */
  static isEnabled(flag: FeatureFlag, userId?: string): boolean {
    // Check for user-specific override
    if (userId && this.userOverrides[userId]?.[flag] !== undefined) {
      return this.userOverrides[userId][flag];
    }
    
    // Fall back to global flag status
    return this.flags[flag] || false;
  }
  
  /**
   * Load feature flags from localStorage in development or database in production
   */
  static async loadFlags(): Promise<void> {
    if (import.meta.env.DEV) {
      // In development, load from localStorage for easy testing
      this.loadFromLocalStorage();
      return;
    }
    
    try {
      // In production, load from database
      await this.loadFromDatabase();
    } catch (error) {
      console.error('[FeatureFlagService] Error loading flags:', error);
      // Fall back to localStorage if database fails
      this.loadFromLocalStorage();
    }
  }
  
  /**
   * Load feature flags from localStorage
   */
  private static loadFromLocalStorage(): void {
    try {
      const storedFlags = localStorage.getItem('featureFlags');
      if (storedFlags) {
        const parsedFlags = JSON.parse(storedFlags);
        Object.entries(parsedFlags).forEach(([key, value]) => {
          if (key in FeatureFlag) {
            this.flags[key as FeatureFlag] = Boolean(value);
          }
        });
      }
      
      const storedOverrides = localStorage.getItem('featureFlagOverrides');
      if (storedOverrides) {
        this.userOverrides = JSON.parse(storedOverrides);
      }
    } catch (error) {
      console.error('[FeatureFlagService] Error loading from localStorage:', error);
    }
  }
  
  /**
   * Load feature flags from database
   */
  private static async loadFromDatabase(): Promise<void> {
    // Feature flags table not yet created, this will be implemented when we add the table
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*');
      
    if (error) {
      throw new Error(`Failed to load feature flags: ${error.message}`);
    }
    
    if (data) {
      data.forEach(flag => {
        if (flag.name in FeatureFlag) {
          this.flags[flag.name as FeatureFlag] = flag.enabled;
          
          // Load user overrides if available
          if (flag.enabled_for_users && Array.isArray(flag.enabled_for_users)) {
            flag.enabled_for_users.forEach(userId => {
              if (!this.userOverrides[userId]) {
                this.userOverrides[userId] = {} as Record<FeatureFlag, boolean>;
              }
              this.userOverrides[userId][flag.name as FeatureFlag] = true;
            });
          }
        }
      });
    }
  }
  
  /**
   * Save feature flags to localStorage (for development)
   */
  static saveToLocalStorage(): void {
    localStorage.setItem('featureFlags', JSON.stringify(this.flags));
    localStorage.setItem('featureFlagOverrides', JSON.stringify(this.userOverrides));
  }
  
  /**
   * Enable a feature flag
   */
  static enableFlag(flag: FeatureFlag): void {
    this.flags[flag] = true;
    if (import.meta.env.DEV) {
      this.saveToLocalStorage();
    }
  }
  
  /**
   * Disable a feature flag
   */
  static disableFlag(flag: FeatureFlag): void {
    this.flags[flag] = false;
    if (import.meta.env.DEV) {
      this.saveToLocalStorage();
    }
  }
  
  /**
   * Enable a feature flag for a specific user
   */
  static enableFlagForUser(flag: FeatureFlag, userId: string): void {
    if (!this.userOverrides[userId]) {
      this.userOverrides[userId] = {} as Record<FeatureFlag, boolean>;
    }
    this.userOverrides[userId][flag] = true;
    if (import.meta.env.DEV) {
      this.saveToLocalStorage();
    }
  }
  
  /**
   * Disable a feature flag for a specific user
   */
  static disableFlagForUser(flag: FeatureFlag, userId: string): void {
    if (!this.userOverrides[userId]) {
      this.userOverrides[userId] = {} as Record<FeatureFlag, boolean>;
    }
    this.userOverrides[userId][flag] = false;
    if (import.meta.env.DEV) {
      this.saveToLocalStorage();
    }
  }
}
