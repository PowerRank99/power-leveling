
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievementTypes';
import { toast } from 'sonner';

// Type definitions for scenario system
export type SpeedOption = 'slow' | 'normal' | 'fast';

export interface ScenarioOptions {
  speed: SpeedOption;
  silent: boolean;
  autoCleanup: boolean;
  testDataTag?: string;
  [key: string]: any;
}

export interface ScenarioAction {
  type: string;
  name?: string;
  description: string;
  timestamp: Date;
  success: boolean;
  status?: 'completed' | 'failed' | 'pending';
  error?: string;
}

export interface ScenarioProgress {
  percentage: number;
  totalActions: number;
  completedActions: number;
  isRunning: boolean;
  isPaused: boolean;
  currentAction?: string;
}

export interface ScenarioResult {
  success: boolean;
  error?: string | null;
  executionTimeMs: number;
  actions: ScenarioAction[];
  achievementsUnlocked: string[];
  completionPercentage?: number;
  unlockedCount?: number;
  targetCount?: number;
}

// Base scenario interface
export interface TestScenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  getConfigurationOptions(): Record<string, any>;
  execute(userId: string, options?: ScenarioOptions): Promise<ScenarioResult>;
  cleanup(): Promise<boolean>;
}

// Scenario runner
export class ScenarioRunner {
  private scenarios: Map<string, TestScenario> = new Map();
  private progressCallback: ((progress: ScenarioProgress) => void) | null = null;
  
  constructor() {
    // Initialize with empty scenario map
  }
  
  // Register a scenario with the runner
  registerScenario(scenario: TestScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }
  
  // Get a specific scenario by ID
  getScenario(scenarioId: string): TestScenario | undefined {
    return this.scenarios.get(scenarioId);
  }
  
  // Get all registered scenarios
  getScenarios(): TestScenario[] {
    return Array.from(this.scenarios.values());
  }
  
  // Set a callback to receive progress updates
  setProgressCallback(callback: (progress: ScenarioProgress) => void): void {
    this.progressCallback = callback;
  }
  
  // Run a specific scenario
  async runScenario(
    scenarioId: string,
    userId: string,
    options?: Partial<ScenarioOptions>
  ): Promise<ScenarioResult> {
    const scenario = this.scenarios.get(scenarioId);
    
    if (!scenario) {
      return {
        success: false,
        error: `Scenario with ID ${scenarioId} not found`,
        executionTimeMs: 0,
        actions: [],
        achievementsUnlocked: []
      };
    }
    
    // Default options
    const defaultOptions: ScenarioOptions = {
      speed: 'normal',
      silent: false,
      autoCleanup: true
    };
    
    // Merge with provided options
    const mergedOptions: ScenarioOptions = {
      ...defaultOptions,
      ...options
    };
    
    try {
      return await scenario.execute(userId, mergedOptions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: errorMessage,
        executionTimeMs: 0,
        actions: [{
          type: 'ERROR',
          name: 'Execution Error',
          description: errorMessage,
          timestamp: new Date(),
          success: false,
          status: 'failed',
          error: errorMessage
        }],
        achievementsUnlocked: []
      };
    }
  }
  
  // Pause the currently running scenario
  pauseCurrentScenario(): void {
    // Implement pause functionality
    if (this.progressCallback) {
      this.progressCallback({
        percentage: 0,
        totalActions: 0,
        completedActions: 0,
        isRunning: true,
        isPaused: true
      });
    }
  }
  
  // Resume the currently paused scenario
  resumeCurrentScenario(): void {
    // Implement resume functionality
    if (this.progressCallback) {
      this.progressCallback({
        percentage: 0,
        totalActions: 0,
        completedActions: 0,
        isRunning: true,
        isPaused: false
      });
    }
  }
}

// Create a singleton instance of the scenario runner
export const scenarioRunner = new ScenarioRunner();

// Base class for scenarios to extend
export abstract class BaseScenario implements TestScenario {
  public id: string;
  public name: string;
  public description: string;
  public tags: string[];
  protected startTime: number = 0;
  protected actions: ScenarioAction[] = [];
  protected achievementsUnlocked: string[] = [];
  
  constructor(id: string, name: string, description: string, tags: string[] = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tags = tags;
  }
  
  // Common scenario configuration options
  getConfigurationOptions(): Record<string, any> {
    return {
      speed: {
        type: 'select',
        label: 'Execution Speed',
        options: [
          { value: 'slow', label: 'Slow (Realistic)' },
          { value: 'normal', label: 'Normal' },
          { value: 'fast', label: 'Fast (Quick Testing)' }
        ],
        default: 'normal',
        description: 'How quickly the scenario should execute'
      },
      silent: {
        type: 'boolean',
        label: 'Silent Mode',
        default: false,
        description: 'Hide toast notifications during execution'
      },
      autoCleanup: {
        type: 'boolean',
        label: 'Auto Cleanup',
        default: true,
        description: 'Automatically clean up test data after execution'
      }
    };
  }
  
  // Each scenario must implement its own execute method
  abstract execute(userId: string, options?: ScenarioOptions): Promise<ScenarioResult>;
  
  // Base cleanup method
  async cleanup(): Promise<boolean> {
    return true;
  }
  
  // Helper method to convert speed option to milliseconds
  protected getDelayFromSpeed(speed: SpeedOption): number {
    switch (speed) {
      case 'slow': return 1000;
      case 'fast': return 100;
      case 'normal':
      default: return 500;
    }
  }
  
  // Helper to delay execution based on speed setting
  protected async delayBySpeed(speed: SpeedOption): Promise<void> {
    const delay = this.getDelayFromSpeed(speed);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Log an action during scenario execution
  protected logAction(type: string, description: string, success: boolean = true, error?: string): void {
    const action: ScenarioAction = {
      type,
      description,
      timestamp: new Date(),
      success,
      status: success ? 'completed' : 'failed',
      error
    };
    
    this.actions.push(action);
  }
  
  // Check if an achievement has been unlocked
  protected async checkAchievementUnlock(userId: string, achievementId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .maybeSingle();
      
    if (error) {
      this.logAction('CHECK_ACHIEVEMENT', `Error checking achievement ${achievementId}: ${error.message}`, false, error.message);
      return false;
    }
    
    if (data) {
      this.achievementsUnlocked.push(achievementId);
      return true;
    }
    
    return false;
  }
  
  // Create a result object from the scenario execution
  protected createResult(success: boolean, error?: string | null): ScenarioResult {
    const endTime = performance.now();
    return {
      success,
      error: error || null,
      executionTimeMs: endTime - this.startTime,
      actions: this.actions,
      achievementsUnlocked: this.achievementsUnlocked
    };
  }
  
  // Helper to show a toast notification if not in silent mode
  protected showToast(message: string, description: string, type: 'success' | 'error' | 'info' = 'info', silent: boolean = false): void {
    if (silent) return;
    
    switch (type) {
      case 'success':
        toast.success(message, { description });
        break;
      case 'error':
        toast.error(message, { description });
        break;
      default:
        toast.info(message, { description });
        break;
    }
  }
}

// Export central reference
export * from './WorkoutScenario';
export * from './StreakScenario';
