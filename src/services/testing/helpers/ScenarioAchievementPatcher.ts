
/**
 * ScenarioAchievementPatcher
 * 
 * This utility patches TestScenario instances to correctly handle asynchronous achievement operations
 * by adding methods that safely wrap Promise-based achievement operations.
 */
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { Achievement } from '@/types/achievementTypes';
import { TestScenario } from '../scenarios';

export class ScenarioAchievementPatcher {
  /**
   * Patches a TestScenario instance to handle async achievement operations
   */
  static patchScenario(scenario: TestScenario): void {
    // Add method to get achievement name asynchronously
    (scenario as any).asyncGetAchievementName = async (achievementId: string): Promise<string> => {
      try {
        const achievement = await AchievementUtils.getAchievementById(achievementId);
        return achievement?.name || achievementId;
      } catch (error) {
        console.error(`Error getting achievement name for ${achievementId}:`, error);
        return achievementId;
      }
    };

    // Add utility method to safely resolve achievement promises
    (scenario as any).safelyAwaitAchievements = async (achievementsPromise: Promise<Achievement[]>): Promise<Achievement[]> => {
      try {
        return await achievementsPromise;
      } catch (error) {
        console.error('Error resolving achievements promise:', error);
        return [];
      }
    };

    // Add utility method to safely get achievement by ID
    (scenario as any).safelyGetAchievementById = async (achievementId: string): Promise<Achievement | null> => {
      try {
        return await AchievementUtils.getAchievementById(achievementId);
      } catch (error) {
        console.error(`Error getting achievement ${achievementId}:`, error);
        return null;
      }
    };
  }

  /**
   * Patches an array of TestScenario instances
   */
  static patchScenarios(scenarios: TestScenario[]): void {
    scenarios.forEach(scenario => this.patchScenario(scenario));
  }
}
