/**
 * Achievement Testing Scenarios
 * 
 * This module provides standardized test scenarios that simulate real user journeys
 * to thoroughly test achievement functionality.
 */
import { toast } from 'sonner';
import { TestDataGeneratorService } from '../generators/TestDataGeneratorService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { ScenarioAchievementPatcher } from '../helpers/ScenarioAchievementPatcher';

/**
 * Interface for scenario configuration options
 */
export interface ScenarioOptions {
  /** Whether to show toast notifications during execution */
  silent?: boolean;
  /** How fast to execute the scenario (0-1, with 1 being fastest) */
  speed?: number;
  /** Whether to automatically clean up test data after completion */
  autoCleanup?: boolean;
  /** Custom tag for identifying test data */
  testDataTag?: string;
  /** Additional scenario-specific options */
  [key: string]: any;
}

/**
 * Result of a scenario execution
 */
export interface ScenarioResult {
  /** Whether the scenario completed successfully */
  success: boolean;
  /** Error message if the scenario failed */
  error?: string;
  /** Which achievements were unlocked during the scenario */
  achievementsUnlocked: string[];
  /** Detailed list of actions performed during the scenario */
  actions: ScenarioAction[];
  /** Total execution time in milliseconds */
  executionTimeMs: number;
  /** Additional scenario-specific result data */
  [key: string]: any;
}

/**
 * A single action performed during a scenario
 */
export interface ScenarioAction {
  /** Type of action performed */
  type: string;
  /** Description of the action */
  description: string;
  /** When the action was performed */
  timestamp: Date;
  /** Additional action-specific data */
  metadata?: any;
  /** Whether the action was successful */
  success: boolean;
  /** Error message if the action failed */
  error?: string;
}

/**
 * Progress update during scenario execution
 */
export interface ScenarioProgress {
  /** Overall progress percentage (0-100) */
  percentage: number;
  /** Current action being performed */
  currentAction?: string;
  /** Total number of actions */
  totalActions: number;
  /** Number of completed actions */
  completedActions: number;
  /** Whether the scenario is currently running */
  isRunning: boolean;
  /** Whether the scenario is paused */
  isPaused: boolean;
}

/**
 * Interface that all test scenarios must implement
 */
export interface TestScenario {
  /** Unique identifier for the scenario */
  id: string;
  /** Display name for the scenario */
  name: string;
  /** Detailed description of what the scenario tests */
  description: string;
  /** List of achievements that should be unlocked by this scenario */
  getRequiredAchievements(): string[];
  /** Estimated duration of the scenario in milliseconds */
  getEstimatedDuration(): number;
  /** Run the scenario for a specific user */
  run(userId: string, options?: ScenarioOptions): Promise<ScenarioResult>;
  /** Clean up all test data generated by this scenario */
  cleanup(userId: string, options?: { silent?: boolean }): Promise<boolean>;
  /** Get configuration options specific to this scenario */
  getConfigurationOptions(): Record<string, any>;
  /** Set progress callback function */
  setProgressCallback(callback: (progress: ScenarioProgress) => void): void;
  /** Pause scenario execution */
  pause(): void;
  /** Resume scenario execution */
  resume(): void;
}

/**
 * Base class for test scenarios
 * Provides common functionality for all scenarios
 */
export abstract class BaseScenario implements TestScenario {
  public id: string;
  public name: string;
  public description: string;
  protected dataGenerator: TestDataGeneratorService;
  protected actions: ScenarioAction[] = [];
  protected achievementsUnlocked: string[] = [];
  protected startTime: number = 0;
  protected endTime: number = 0;
  protected progressCallback?: (progress: ScenarioProgress) => void;
  protected isPaused: boolean = false;

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.dataGenerator = TestDataGeneratorService.getInstance();
  }

  /**
   * Get all achievements that should be unlocked by this scenario
   */
  abstract getRequiredAchievements(): string[];

  /**
   * Get estimated execution time in milliseconds
   */
  abstract getEstimatedDuration(): number;

  /**
   * Run the scenario
   */
  abstract run(userId: string, options?: ScenarioOptions): Promise<ScenarioResult>;

  /**
   * Clean up all test data generated by this scenario
   */
  abstract cleanup(userId: string, options?: { silent?: boolean }): Promise<boolean>;

  /**
   * Get configuration options specific to this scenario
   */
  abstract getConfigurationOptions(): Record<string, any>;

  /**
   * Record an action performed during the scenario
   */
  protected logAction(type: string, description: string, metadata?: any, success: boolean = true, error?: string): void {
    this.actions.push({
      type,
      description,
      timestamp: new Date(),
      metadata,
      success,
      error
    });

    // Update progress if callback is provided
    if (this.progressCallback) {
      this.progressCallback({
        percentage: (this.actions.length / this.getTotalActions()) * 100,
        currentAction: description,
        totalActions: this.getTotalActions(),
        completedActions: this.actions.length,
        isRunning: true,
        isPaused: this.isPaused
      });
    }
  }

  /**
   * Get the total number of actions in this scenario
   * To be overridden by implementing classes
   */
  protected getTotalActions(): number {
    return 100; // Default estimate
  }

  /**
   * Set progress callback function
   */
  public setProgressCallback(callback: (progress: ScenarioProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Pause scenario execution
   */
  public pause(): void {
    this.isPaused = true;
    if (this.progressCallback) {
      this.progressCallback({
        percentage: (this.actions.length / this.getTotalActions()) * 100,
        totalActions: this.getTotalActions(),
        completedActions: this.actions.length,
        isRunning: true,
        isPaused: true
      });
    }
  }

  /**
   * Resume scenario execution
   */
  public resume(): void {
    this.isPaused = false;
    if (this.progressCallback) {
      this.progressCallback({
        percentage: (this.actions.length / this.getTotalActions()) * 100,
        totalActions: this.getTotalActions(),
        completedActions: this.actions.length,
        isRunning: true,
        isPaused: false
      });
    }
  }

  /**
   * Wait for scenario to be unpaused
   */
  protected async waitIfPaused(): Promise<void> {
    const checkPause = () => {
      return new Promise<void>((resolve) => {
        if (!this.isPaused) {
          resolve();
          return;
        }
        setTimeout(() => {
          checkPause().then(resolve);
        }, 500);
      });
    };

    await checkPause();
  }

  /**
   * Add a delay based on speed option
   */
  protected async delayBySpeed(baseDelayMs: number, options?: ScenarioOptions): Promise<void> {
    await this.waitIfPaused();
    
    if (!options || options.speed === undefined) {
      await new Promise(resolve => setTimeout(resolve, baseDelayMs));
      return;
    }

    const speed = Math.max(0, Math.min(1, options.speed));
    const adjustedDelay = baseDelayMs * (1 - speed);
    
    if (adjustedDelay > 10) {
      await new Promise(resolve => setTimeout(resolve, adjustedDelay));
    }
  }

  /**
   * Create standard result object
   */
  protected createResult(success: boolean, error?: string): ScenarioResult {
    this.endTime = Date.now();
    
    return {
      success,
      error,
      achievementsUnlocked: this.achievementsUnlocked,
      actions: this.actions,
      executionTimeMs: this.endTime - this.startTime,
    };
  }
}

/**
 * ScenarioRunner class for executing test scenarios
 */
export class ScenarioRunner {
  private scenarios: any[] = [];
  
  registerScenario(scenario: any): void {
    // Patch the scenario to work with promised-based achievements
    ScenarioAchievementPatcher.patchScenario(scenario);
    this.scenarios.push(scenario);
  }
  
  // Other scenario runner methods would be here
}

export const scenarioRunner = new ScenarioRunner();
