
import React, { useState, useEffect } from 'react';
import { 
  FeatureFlag, 
  FeatureFlagService 
} from '@/services/feature-flags/FeatureFlagService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Component for managing feature flags (only visible in development)
 */
const FeatureFlagManager: React.FC = () => {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>({} as Record<FeatureFlag, boolean>);
  const [userId, setUserId] = useState<string>('');
  const [userFlags, setUserFlags] = useState<Record<FeatureFlag, boolean>>({} as Record<FeatureFlag, boolean>);
  
  useEffect(() => {
    const loadFlags = async () => {
      await FeatureFlagService.initialize();
      
      // Create a flags object from the enum
      const initialFlags: Record<FeatureFlag, boolean> = {} as Record<FeatureFlag, boolean>;
      
      Object.values(FeatureFlag).forEach(flag => {
        initialFlags[flag as FeatureFlag] = FeatureFlagService.isEnabled(flag as FeatureFlag);
      });
      
      setFlags(initialFlags);
    };
    
    loadFlags();
  }, []);
  
  const handleFlagChange = (flag: FeatureFlag, enabled: boolean) => {
    if (enabled) {
      FeatureFlagService.enableFlag(flag);
    } else {
      FeatureFlagService.disableFlag(flag);
    }
    
    setFlags(prevFlags => ({
      ...prevFlags,
      [flag]: enabled
    }));
  };
  
  const handleUserFlagChange = (flag: FeatureFlag, enabled: boolean) => {
    if (!userId) return;
    
    if (enabled) {
      FeatureFlagService.enableFlagForUser(flag, userId);
    } else {
      FeatureFlagService.disableFlagForUser(flag, userId);
    }
    
    setUserFlags(prevFlags => ({
      ...prevFlags,
      [flag]: enabled
    }));
  };
  
  const loadUserFlags = () => {
    if (!userId) return;
    
    const userFlagValues: Record<FeatureFlag, boolean> = {} as Record<FeatureFlag, boolean>;
    
    Object.values(FeatureFlag).forEach(flag => {
      userFlagValues[flag as FeatureFlag] = FeatureFlagService.isEnabled(flag as FeatureFlag, userId);
    });
    
    setUserFlags(userFlagValues);
  };
  
  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }
  
  return (
    <Card className="bg-midnight-card border-midnight-elevated">
      <CardHeader>
        <CardTitle className="font-orbitron text-lg">Feature Flag Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-md font-semibold">Global Flags</h3>
            {Object.entries(flags).map(([flag, enabled]) => (
              <div key={flag} className="flex items-center justify-between">
                <span className="text-sm">{flag}</span>
                <Switch 
                  checked={enabled}
                  onCheckedChange={(checked) => handleFlagChange(flag as FeatureFlag, checked)}
                />
              </div>
            ))}
          </div>
          
          <div className="border-t border-midnight-elevated pt-4 space-y-2">
            <h3 className="text-md font-semibold">User-Specific Flags</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="User ID"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className="flex-1 bg-midnight-elevated"
              />
              <Button onClick={loadUserFlags} disabled={!userId}>
                Load
              </Button>
            </div>
            
            {userId && (
              <div className="space-y-2 mt-2">
                {Object.entries(userFlags).map(([flag, enabled]) => (
                  <div key={`user-${flag}`} className="flex items-center justify-between">
                    <span className="text-sm">{flag}</span>
                    <Switch 
                      checked={enabled}
                      onCheckedChange={(checked) => handleUserFlagChange(flag as FeatureFlag, checked)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureFlagManager;
