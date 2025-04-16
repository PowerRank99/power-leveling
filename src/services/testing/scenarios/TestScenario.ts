
import { ScenarioOptions, ScenarioResult, ScenarioProgress } from './ScenarioTypes';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  supportedAchievementCategories?: string[];
  tags?: string[];
  execute(userId: string, options?: ScenarioOptions): Promise<ScenarioResult>;
  cleanup(): Promise<boolean>;
  getEstimatedDuration(): number;
}

export abstract class BaseScenario implements TestScenario {
  id: string;
  name: string;
  description: string;
  supportedAchievementCategories?: string[];
  tags?: string[] = [];
  
  constructor(id: string, name: string, description: string, supportedCategories?: string[]) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.supportedAchievementCategories = supportedCategories;
  }
  
  abstract execute(userId: string, options?: ScenarioOptions): Promise<ScenarioResult>;
  abstract cleanup(): Promise<boolean>;
  
  getEstimatedDuration(): number {
    return 30; // Default 30 seconds
  }
}
