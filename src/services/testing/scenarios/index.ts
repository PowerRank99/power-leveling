import { TestDataGenerator, createTestDataGenerators } from '../generators';

export type SpeedOption = 'slow' | 'normal' | 'fast';

export interface ScenarioOptions {
  speed?: SpeedOption;
  silent?: boolean;
  autoCleanup?: boolean;
  testDataTag?: string;
}

export interface ScenarioProgress {
  isRunning: boolean;
  isPaused: boolean;
  totalActions: number;
  completedActions: number;
  percentage: number;
  currentAction?: string;
}

export interface ScenarioAction {
  type: string;
  name: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning' | 'info';
  details?: any;
}

export interface ScenarioResult {
  success: boolean;
  message?: string;
  error?: string | Error;
  actions: ScenarioAction[];
  achievementsUnlocked: string[];
  duration: number;
  raw?: any;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  supportedFeatures?: string[];
  execute: (userId: string, options?: any) => Promise<ScenarioResult>;
  cleanup: () => Promise<boolean>;
}

export abstract class BaseScenario implements TestScenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  supportedFeatures: string[];
  protected startTime: number = 0;
  protected actions: ScenarioAction[] = [];
  protected achievementsUnlocked: string[] = [];
  protected generators: Record<string, TestDataGenerator>;
  
  constructor(
    id: string,
    name: string,
    description: string,
    tags: string[] = [],
    supportedFeatures: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tags = tags;
    this.supportedFeatures = supportedFeatures;
    this.generators = createTestDataGenerators();
  }
  
  abstract execute(userId: string, options?: any): Promise<ScenarioResult>;
  
  async cleanup(): Promise<boolean> {
    return true;
  }
  
  protected createResult(success: boolean, message?: string, error?: string | Error): ScenarioResult {
    const endTime = performance.now();
    return {
      success,
      message,
      error,
      actions: this.actions,
      achievementsUnlocked: this.achievementsUnlocked,
      duration: Math.round(endTime - this.startTime)
    };
  }
  
  protected logAction(
    type: string,
    description: string,
    success: boolean = true,
    details?: any
  ): void {
    this.actions.push({
      type,
      name: type,
      description,
      timestamp: new Date(),
      status: success ? 'success' : 'error',
      details
    });
  }
  
  protected async delayBySpeed(speed: SpeedOption): Promise<void> {
    let delayMs = 500;
    
    switch (speed) {
      case 'slow':
        delayMs = 1000;
        break;
      case 'fast':
        delayMs = 200;
        break;
      case 'normal':
      default:
        delayMs = 500;
    }
    
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  protected async checkAchievementUnlock(
    userId: string,
    achievementIds: string[]
  ): Promise<string[]> {
    // Implementation placeholder
    return [];
  }
}

export class ScenarioRunner {
  private scenarios: Map<string, TestScenario> = new Map();
  
  register(scenario: TestScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }
  
  getScenario(id: string): TestScenario | undefined {
    return this.scenarios.get(id);
  }
  
  getScenarios(): TestScenario[] {
    return Array.from(this.scenarios.values());
  }
  
  getAvailableScenarios(): TestScenario[] {
    return this.getScenarios();
  }
  
  async runScenario(scenarioId: string, userId: string, options?: any): Promise<ScenarioResult> {
    const scenario = this.getScenario(scenarioId);
    
    if (!scenario) {
      return {
        success: false,
        error: `Scenario with ID "${scenarioId}" not found`,
        actions: [],
        achievementsUnlocked: [],
        duration: 0
      };
    }
    
    try {
      return await scenario.execute(userId, options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : String(error),
        actions: [],
        achievementsUnlocked: [],
        duration: 0
      };
    }
  }
}

export const scenarioRunner = new ScenarioRunner();
