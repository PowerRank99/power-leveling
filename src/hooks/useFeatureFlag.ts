
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export enum FeatureFlag {
  ACHIEVEMENTS = 'achievements',
  GUILDS = 'guilds',
  COMPETITIONS = 'competitions',
  ADVANCED_STATS = 'advanced_stats',
  WORKOUT_SHARING = 'workout_sharing'
}

export class FeatureFlagService {
  private static features: Record<string, boolean> = {
    [FeatureFlag.ACHIEVEMENTS]: false,  // Disabled since we removed achievements
    [FeatureFlag.GUILDS]: true,
    [FeatureFlag.COMPETITIONS]: true,
    [FeatureFlag.ADVANCED_STATS]: true,
    [FeatureFlag.WORKOUT_SHARING]: true
  };

  static async initialize(): Promise<void> {
    // This is a placeholder for the real initialization
    return Promise.resolve();
  }

  static isEnabled(flag: FeatureFlag, userId?: string): boolean {
    return this.features[flag] || false;
  }
}

/**
 * Hook to check if a feature flag is enabled
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    const checkFlag = async () => {
      await FeatureFlagService.initialize();
      const enabled = FeatureFlagService.isEnabled(flag, user?.id);
      setIsEnabled(enabled);
    };
    
    checkFlag();
  }, [flag, user]);
  
  return isEnabled;
}

export default useFeatureFlag;
