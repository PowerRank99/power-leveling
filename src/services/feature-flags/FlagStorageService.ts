
import { FeatureFlag } from './types';
import { supabase } from '@/integrations/supabase/client';

export class FlagStorageService {
  static async loadFromDatabase(): Promise<Record<string, boolean>> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*');
      
    if (error) {
      throw new Error(`Failed to load feature flags: ${error.message}`);
    }
    
    const flags: Record<string, boolean> = {};
    if (data) {
      data.forEach(flag => {
        if (flag.name in FeatureFlag) {
          flags[flag.name] = flag.enabled;
        }
      });
    }
    return flags;
  }

  static loadFromLocalStorage(): Record<string, boolean> {
    try {
      const storedFlags = localStorage.getItem('featureFlags');
      if (storedFlags) {
        return JSON.parse(storedFlags);
      }
    } catch (error) {
      console.error('[FlagStorageService] Error loading from localStorage:', error);
    }
    return {};
  }

  static saveToLocalStorage(flags: Record<string, boolean>): void {
    localStorage.setItem('featureFlags', JSON.stringify(flags));
  }

  static loadOverrides(): Record<string, Record<string, boolean>> {
    try {
      const storedOverrides = localStorage.getItem('featureFlagOverrides');
      if (storedOverrides) {
        return JSON.parse(storedOverrides);
      }
    } catch (error) {
      console.error('[FlagStorageService] Error loading overrides:', error);
    }
    return {};
  }

  static saveOverrides(overrides: Record<string, Record<string, boolean>>): void {
    localStorage.setItem('featureFlagOverrides', JSON.stringify(overrides));
  }
}
