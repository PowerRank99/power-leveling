
import { BaseScenario } from '../scenarios';
import { AchievementScenarioAdapter } from '../adapters/AchievementScenarioAdapter';

/**
 * Helper class to patch scenario classes to properly handle async achievement data
 */
export class ScenarioAchievementPatcher {
  /**
   * Patch all provided scenarios to handle async achievement data
   */
  static patchScenarios(scenarios: BaseScenario[]): void {
    for (const scenario of scenarios) {
      this.patchScenario(scenario);
    }
  }
  
  /**
   * Patch a single scenario to handle async achievement data
   */
  static patchScenario(scenario: BaseScenario): void {
    // Add the async-aware logAction and addAction methods if they don't exist
    if (!scenario.hasOwnProperty('asyncGetAchievementName')) {
      Object.defineProperty(scenario, 'asyncGetAchievementName', {
        value: async function(achievementId: string): Promise<string> {
          try {
            const achievement = await AchievementScenarioAdapter.getAchievementById(achievementId);
            return achievement?.name || achievementId;
          } catch (error) {
            console.error(`Error fetching achievement name for ${achievementId}:`, error);
            return achievementId;
          }
        },
        writable: false
      });
    }
    
    // Add method to handle achievement name resolution for logging
    if (!scenario.hasOwnProperty('addAction')) {
      Object.defineProperty(scenario, 'addAction', {
        value: function(action: any): void {
          if (Array.isArray(this.actions)) {
            this.actions.push(action);
          }
        },
        writable: false
      });
    }
    
    // Ensure we have a safe way to handle achievement properties
    if (!scenario.hasOwnProperty('safeGetAchievementProperty')) {
      Object.defineProperty(scenario, 'safeGetAchievementProperty', {
        value: async function<T>(
          promise: Promise<any>,
          propertyName: string,
          defaultValue: T
        ): Promise<T> {
          try {
            const result = await promise;
            return result && result[propertyName] !== undefined 
              ? result[propertyName] 
              : defaultValue;
          } catch (error) {
            console.error(`Error accessing property ${propertyName}:`, error);
            return defaultValue;
          }
        },
        writable: false
      });
    }
  }
}
