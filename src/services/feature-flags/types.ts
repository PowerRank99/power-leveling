
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
