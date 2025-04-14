
import { useState, useEffect } from 'react';
import { FeatureFlag, FeatureFlagService } from '@/services/feature-flags/FeatureFlagService';
import { useAuth } from './useAuth';

/**
 * Hook to check if a feature flag is enabled
 * @param flag The feature flag to check
 * @returns boolean indicating if the flag is enabled
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    const checkFlag = async () => {
      // Ensure feature flags are initialized
      await FeatureFlagService.initialize();
      
      // Check if flag is enabled for current user
      const enabled = FeatureFlagService.isEnabled(flag, user?.id);
      setIsEnabled(enabled);
    };
    
    checkFlag();
  }, [flag, user]);
  
  return isEnabled;
}

export default useFeatureFlag;
