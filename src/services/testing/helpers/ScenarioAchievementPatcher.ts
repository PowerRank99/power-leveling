
import { ScenarioAchievementAdapter } from '@/services/rpg/achievements/progress/ScenarioAchievementAdapter';

/**
 * Helper utility to patch scenario classes to work with promised-based achievements
 */
export class ScenarioAchievementPatcher {
  /**
   * Patch a scenario class instance to handle promised-based achievements
   */
  static patchScenario(scenarioInstance: any): void {
    // Add logging action method if missing
    if (!scenarioInstance.addAction) {
      scenarioInstance.addAction = function(action: string, details: string) {
        console.log(`${action}: ${details}`);
        return this;
      };
    }
    
    // Patch any achievement handling methods
    this.patchCommonMethods(scenarioInstance);
  }
  
  /**
   * Patch common achievement handling methods
   */
  private static patchCommonMethods(instance: any): void {
    // Add helper methods for achievement operations
    instance.resolveAchievement = async function(achievement: any) {
      return ScenarioAchievementAdapter.resolveAchievement(achievement);
    };
    
    instance.getAchievementName = async function(achievement: any) {
      return ScenarioAchievementAdapter.getAchievementName(achievement);
    };
    
    instance.getAchievementRank = async function(achievement: any) {
      return ScenarioAchievementAdapter.getAchievementRank(achievement);
    };
  }
  
  /**
   * Patch an array of scenarios at once
   */
  static patchScenarios(scenarios: any[]): void {
    scenarios.forEach(scenario => this.patchScenario(scenario));
  }
}
