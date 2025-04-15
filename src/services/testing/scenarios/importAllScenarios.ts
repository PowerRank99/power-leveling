
/**
 * This file's sole purpose is to import all scenario files
 * to ensure they're loaded and registered with the scenario runner.
 * 
 * This approach avoids circular dependencies between the scenario implementations
 * and the base classes in index.ts.
 */

// Import scenario runner and helpers for patching
import { scenarioRunner } from './index';
import { ScenarioAchievementPatcher } from '@/services/helpers/ScenarioAchievementPatcher';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';

// First, pre-load the achievements cache and mapping service
Promise.all([
  AchievementUtils.getAllAchievements().catch(err => {
    console.error('Failed to initialize achievement cache:', err);
  }),
  AchievementIdMappingService.initialize().catch(err => {
    console.error('Failed to initialize achievement ID mappings:', err);
  })
]).then(() => {
  console.log('Achievement data and ID mappings initialized');
}).catch(err => {
  console.error('Failed to initialize achievement data:', err);
});

// Import all scenario files
// Importing them here makes them register with the scenarioRunner via their side effects
import './NewUserScenario';
import './PowerUserScenario';
import './StreakScenario';
import './ClassProgressionScenario';
import './CompletionistScenario';

// Ensure all scenario instances are properly patched with the achievement adapter utilities
(function initializeScenarioPatches() {
  const allScenarios = scenarioRunner.getScenarios();
  allScenarios.forEach(scenario => {
    ScenarioAchievementPatcher.patchScenario(scenario);
  });
  console.log(`Initialized and patched ${allScenarios.length} test scenarios`);
})();
