
import { FeatureFlag } from './types';
import { FlagStorageService } from './FlagStorageService';

export class UserOverrideService {
  private static overrides: Record<string, Record<FeatureFlag, boolean>> = {};

  static initialize(): void {
    this.overrides = FlagStorageService.loadOverrides();
  }

  static getOverride(flag: FeatureFlag, userId: string): boolean | undefined {
    return this.overrides[userId]?.[flag];
  }

  static setOverride(flag: FeatureFlag, userId: string, enabled: boolean): void {
    if (!this.overrides[userId]) {
      this.overrides[userId] = {} as Record<FeatureFlag, boolean>;
    }
    this.overrides[userId][flag] = enabled;
    
    if (import.meta.env.DEV) {
      FlagStorageService.saveOverrides(this.overrides);
    }
  }

  static clearOverride(flag: FeatureFlag, userId: string): void {
    if (this.overrides[userId]) {
      delete this.overrides[userId][flag];
      if (import.meta.env.DEV) {
        FlagStorageService.saveOverrides(this.overrides);
      }
    }
  }
}
