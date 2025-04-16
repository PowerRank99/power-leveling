
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';

// Define test scenario types
export interface TestScenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  achievementTypes?: string[];
  execute: (userId: string, options?: ScenarioOptions) => Promise<ScenarioResult>;
  cleanup?: () => Promise<void>;
  getConfigurationOptions?: () => Record<string, any>;
}

export interface ScenarioOptions {
  verbose?: boolean;
  skipCleanup?: boolean;
  maxSteps?: number;
  speed?: 'slow' | 'normal' | 'fast';
  autoCleanup?: boolean;
  silent?: boolean;
}

export interface ScenarioResult {
  success: boolean;
  message?: string;
  achievementsAwarded?: Achievement[];
  data?: any;
  error?: Error;
  actions?: ScenarioAction[];
  achievementsUnlocked?: Achievement[];
  executionTimeMs?: number;
  completionPercentage?: number;
  unlockedCount?: number;
  targetCount?: number;
}

export interface ScenarioProgress {
  percentage: number;
  totalActions: number;
  completedActions: number;
  isRunning: boolean;
  isPaused: boolean;
  currentAction?: string;
}

export interface ScenarioAction {
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp?: Date;
  details?: string;
  description?: string;
  success?: boolean;
  error?: string;
}

export class BaseScenario {
  protected userId: string;
  protected startTime: number = 0;
  protected actions: ScenarioAction[] = [];
  protected achievementsUnlocked: Achievement[] = [];

  constructor(userId: string) {
    this.userId = userId;
  }

  protected createResult(success: boolean, message: string): ScenarioResult {
    return {
      success,
      message,
      executionTimeMs: Date.now() - this.startTime,
      actions: this.actions,
      achievementsUnlocked: this.achievementsUnlocked
    };
  }

  protected async logAction(name: string, type: string, details?: string): Promise<void> {
    this.actions.push({
      name,
      type,
      status: 'running',
      timestamp: new Date(),
      details
    });
  }

  protected async delayBySpeed(speed: 'slow' | 'normal' | 'fast'): Promise<void> {
    const delays = {
      slow: 1000,
      normal: 500,
      fast: 0
    };
    await new Promise(resolve => setTimeout(resolve, delays[speed]));
  }

  protected async checkAchievementUnlock(achievementId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', this.userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
      
      return !!data;
    } catch (error) {
      console.error('Error checking achievement unlock:', error);
      return false;
    }
  }
}

class ScenarioRunner {
  private scenarios: Map<string, TestScenario> = new Map();
  private progressCallback?: (progress: ScenarioProgress) => void;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentScenario?: string;

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
   * Get scenario by ID
   */
  getScenario(scenarioId: string): TestScenario | undefined {
    return this.scenarios.get(scenarioId);
  }

  /**
   * Set progress callback for monitoring scenario execution
   */
  setProgressCallback(callback: (progress: ScenarioProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Pause currently running scenario
   */
  pauseCurrentScenario(): void {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      
      if (this.progressCallback) {
        this.progressCallback({
          percentage: 0,
          totalActions: 0,
          completedActions: 0,
          isRunning: this.isRunning,
          isPaused: this.isPaused
        });
      }
    }
  }

  /**
   * Resume paused scenario
   */
  resumeCurrentScenario(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      
      if (this.progressCallback) {
        this.progressCallback({
          percentage: 0,
          totalActions: 0,
          completedActions: 0,
          isRunning: this.isRunning,
          isPaused: this.isPaused
        });
      }
    }
  }

  /**
   * Get all scenarios (alias for getAvailableScenarios)
   */
  getScenarios(): TestScenario[] {
    return this.getAvailableScenarios();
  }

  /**
   * Run a specific scenario
   */
  async runScenario(userId: string, scenarioId: string, options?: ScenarioOptions): Promise<ScenarioResult> {
    const scenario = this.scenarios.get(scenarioId);
    
    if (!scenario) {
      return {
        success: false,
        message: `Scenario '${scenarioId}' not found`
      };
    }
    
    this.isRunning = true;
    this.isPaused = false;
    this.currentScenario = scenarioId;
    
    try {
      // Begin transaction if available
      try {
        await supabase.rpc('begin_transaction');
      } catch (error) {
        console.warn('Transaction not available, running scenario without transaction');
      }
      
      const startTime = performance.now();
      
      const result = await scenario.execute(userId, options);
      
      const endTime = performance.now();
      result.executionTimeMs = Math.round(endTime - startTime);
      
      // Roll back transaction to keep database clean
      if (!options?.skipCleanup) {
        try {
          await supabase.rpc('rollback_transaction');
        } catch (error) {
          console.warn('Failed to rollback transaction', error);
        }
      }
      
      this.isRunning = false;
      this.isPaused = false;
      this.currentScenario = undefined;
      
      return result;
    } catch (error) {
      // Ensure transaction is rolled back on error
      try {
        await supabase.rpc('rollback_transaction');
      } catch (rollbackError) {
        console.warn('Failed to rollback transaction', rollbackError);
      }
      
      this.isRunning = false;
      this.isPaused = false;
      this.currentScenario = undefined;
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Run multiple scenarios in sequence
   */
  async runMultipleScenarios(userId: string, scenarioIds: string[], options?: ScenarioOptions): Promise<Record<string, ScenarioResult>> {
    const results: Record<string, ScenarioResult> = {};
    
    for (const scenarioId of scenarioIds) {
      results[scenarioId] = await this.runScenario(userId, scenarioId, options);
    }
    
    return results;
  }
}

// Create singleton instance
export const scenarioRunner = new ScenarioRunner();
