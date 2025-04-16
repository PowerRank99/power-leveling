
import { supabase } from '@/integrations/supabase/client';
import { createTestDataGenerators } from '../generators';

export type SpeedOption = 'slow' | 'normal' | 'fast';

export interface ScenarioOptions {
  speed?: SpeedOption;
  silent?: boolean;
  autoCleanup?: boolean;
  testDataTag?: string;
  [key: string]: any;
}

export interface ScenarioResult {
  success: boolean;
  message?: string;
  data?: any;
  executionTimeMs?: number;
  actions?: ScenarioAction[];
  achievementsUnlocked?: any[];
  completionPercentage?: number;
  unlockedCount?: number;
  targetCount?: number;
  error?: Error | string;
}

export interface ScenarioAction {
  type: string;
  description: string;
  timestamp: Date;
  success: boolean;
  name?: string;
  status?: string;
  error?: string;
}

export interface ScenarioProgress {
  percentage: number;
  totalActions: number;
  completedActions: number;
  isRunning: boolean;
  isPaused: boolean;
  actions?: ScenarioAction[];
  currentAction?: string;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  achievementTypes?: string[];
  execute: (userId: string, options?: ScenarioOptions) => Promise<ScenarioResult>;
  cleanup?: () => Promise<boolean>;
  getConfigurationOptions?: () => Record<string, any>;
}

export abstract class BaseScenario implements TestScenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  achievementTypes?: string[];
  protected startTime: number = 0;
  protected actions: ScenarioAction[] = [];
  protected achievementsUnlocked: any[] = [];
  protected generators = createTestDataGenerators();

  constructor(id: string, name: string, description: string, tags: string[] = [], achievementTypes?: string[]) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tags = tags;
    this.achievementTypes = achievementTypes;
  }

  abstract execute(userId: string, options?: ScenarioOptions): Promise<ScenarioResult>;

  async cleanup(): Promise<boolean> {
    return true;
  }

  getConfigurationOptions(): Record<string, any> {
    return {
      speed: {
        type: 'select',
        label: 'Execution Speed',
        options: [
          { value: 'slow', label: 'Slow (easier to follow)' },
          { value: 'normal', label: 'Normal' },
          { value: 'fast', label: 'Fast (quicker tests)' }
        ],
        default: 'normal',
        description: 'How quickly to execute the scenario steps'
      },
      silent: {
        type: 'boolean',
        label: 'Silent Mode',
        default: false,
        description: 'Disable toast notifications during execution'
      },
      autoCleanup: {
        type: 'boolean',
        label: 'Auto-Cleanup',
        default: true,
        description: 'Automatically clean up test data after completion'
      }
    };
  }

  protected logAction(type: string, description: string, success: boolean = true, error?: string): void {
    this.actions.push({
      type,
      description,
      timestamp: new Date(),
      success,
      error,
      status: success ? 'completed' : 'failed',
      name: type
    });
  }

  protected async delayBySpeed(speed: SpeedOption): Promise<void> {
    const delays = {
      slow: 1000,
      normal: 500,
      fast: 100
    };
    
    return new Promise(resolve => setTimeout(resolve, delays[speed]));
  }

  protected createResult(success: boolean, message?: string): ScenarioResult {
    return {
      success,
      message,
      executionTimeMs: performance.now() - this.startTime,
      actions: this.actions,
      achievementsUnlocked: this.achievementsUnlocked,
      completionPercentage: 100,
      unlockedCount: this.achievementsUnlocked.length,
      targetCount: this.achievementsUnlocked.length
    };
  }

  protected async checkAchievementUnlock(userId: string, achievementIds: string[]): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)
      .in('achievement_id', achievementIds);
      
    if (error) {
      this.logAction('ERROR', `Failed to check achievement unlocks: ${error.message}`, false);
      return [];
    }
    
    return data.map(item => item.achievement_id);
  }
}

export class ScenarioRunner {
  private scenarios: Map<string, TestScenario> = new Map();
  private progressCallback?: (progress: ScenarioProgress) => void;
  private currentScenario?: { id: string; cancel: boolean };

  registerScenario(scenario: TestScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  getAvailableScenarios(): TestScenario[] {
    return Array.from(this.scenarios.values());
  }
  
  getScenarios(): TestScenario[] {
    return this.getAvailableScenarios();
  }

  getScenario(id: string): TestScenario | undefined {
    return this.scenarios.get(id);
  }

  setProgressCallback(callback: (progress: ScenarioProgress) => void): void {
    this.progressCallback = callback;
  }

  async runScenario(userId: string, scenarioId: string, options?: ScenarioOptions): Promise<ScenarioResult> {
    const scenario = this.scenarios.get(scenarioId);
    
    if (!scenario) {
      return {
        success: false,
        message: `Scenario ${scenarioId} not found`
      };
    }
    
    this.currentScenario = { id: scenarioId, cancel: false };
    
    try {
      const result = await scenario.execute(userId, options);
      
      // Clean up if auto-cleanup is enabled
      if (options?.autoCleanup !== false && scenario.cleanup) {
        await scenario.cleanup();
      }
      
      this.currentScenario = undefined;
      return result;
    } catch (error) {
      this.currentScenario = undefined;
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error : String(error)
      };
    }
  }

  pauseCurrentScenario(): void {
    if (this.currentScenario) {
      this.currentScenario.cancel = true;
    }
  }

  resumeCurrentScenario(): void {
    if (this.currentScenario) {
      this.currentScenario.cancel = false;
    }
  }

  isScenarioCancelled(): boolean {
    return this.currentScenario?.cancel || false;
  }
}

// Create singleton instance
export const scenarioRunner = new ScenarioRunner();
