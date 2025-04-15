
/**
 * This file's sole purpose is to import all scenario files
 * to ensure they're loaded and registered with the scenario runner.
 * 
 * This approach avoids circular dependencies between the scenario implementations
 * and the base classes in index.ts.
 */

// Import all scenario files
import './NewUserScenario';
import './PowerUserScenario';
import './StreakScenario';
import './ClassProgressionScenario';
import './CompletionistScenario';

// This file doesn't export anything - it's just for importing
