
/**
 * This file's sole purpose is to import all scenario files
 * to ensure they're loaded and registered with the scenario runner.
 * 
 * This approach avoids circular dependencies between the scenario implementations
 * and the base classes in index.ts.
 */

// Import scenario runner and helpers for patching
import { scenarioRunner } from './index';
import { ScenarioAchievementPatcher } from '../helpers/ScenarioAchievementPatcher';

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
