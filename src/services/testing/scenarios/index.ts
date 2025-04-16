import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';

// Define test scenario types
export interface TestScenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  achievementTypes?: string[];
  execute: (userId: string) => Promise<ScenarioResult>;
}

export interface ScenarioResult {
  success: boolean;
  message?: string;
  achievementsAwarded?: Achievement[];
  data?: any;
}

class ScenarioRunner {
  private scenarios: Map<string, TestScenario> = new Map();

  /**
   * Register a testing scenario
   */
  registerScenario(scenario: TestScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  /**
   * Get list of available scenarios
   */
  getAvailableScenarios(): TestScenario[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Run a specific scenario
   */
  async runScenario(userId: string, scenarioId: string): Promise<ScenarioResult> {
    const scenario = this.scenarios.get(scenarioId);
    
    if (!scenario) {
      return {
        success: false,
        message: `Scenario '${scenarioId}' not found`
      };
    }
    
    try {
      // Begin transaction if available
      try {
        await supabase.rpc('begin_transaction');
      } catch (error) {
        console.warn('Transaction not available, running scenario without transaction');
      }
      
      const result = await scenario.execute(userId);
      
      // Roll back transaction to keep database clean
      try {
        await supabase.rpc('rollback_transaction');
      } catch (error) {
        console.warn('Failed to rollback transaction', error);
      }
      
      return result;
    } catch (error) {
      // Ensure transaction is rolled back on error
      try {
        await supabase.rpc('rollback_transaction');
      } catch (rollbackError) {
        console.warn('Failed to rollback transaction', rollbackError);
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Run multiple scenarios in sequence
   */
  async runMultipleScenarios(userId: string, scenarioIds: string[]): Promise<Record<string, ScenarioResult>> {
    const results: Record<string, ScenarioResult> = {};
    
    for (const scenarioId of scenarioIds) {
      results[scenarioId] = await this.runScenario(userId, scenarioId);
    }
    
    return results;
  }
}

// Create singleton instance
export const scenarioRunner = new ScenarioRunner();
