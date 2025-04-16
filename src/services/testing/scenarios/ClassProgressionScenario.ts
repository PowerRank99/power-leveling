
import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createTestDataGenerators } from '../generators';

export interface ClassProgressionScenarioOptions extends ScenarioOptions {
  className: string;
  workoutsToGenerate: number;
}

export class ClassProgressionScenario extends BaseScenario {
  private generators = createTestDataGenerators();
  
  constructor() {
    super(
      'class-progression',
      'Class Progression Scenario',
      'Tests achievements related to class selection and progression',
      ['class', 'progression', 'rpg']
    );
  }
  
  getConfigurationOptions(): Record<string, any> {
    const baseOptions = super.getConfigurationOptions();
    
    return {
      ...baseOptions,
      className: {
        type: 'select',
        label: 'Character Class',
        options: [
          { value: 'guerreiro', label: 'Guerreiro' },
          { value: 'monge', label: 'Monge' },
          { value: 'ninja', label: 'Ninja' },
          { value: 'druida', label: 'Druida' },
          { value: 'bruxo', label: 'Bruxo' },
          { value: 'paladino', label: 'Paladino' }
        ],
        default: 'guerreiro',
        description: 'Character class to simulate progression for'
      },
      workoutsToGenerate: {
        type: 'number',
        label: 'Workouts to Generate',
        default: 5,
        min: 1,
        max: 30,
        description: 'Number of workouts to generate for the class'
      }
    };
  }
  
  async execute(userId: string, options?: ScenarioOptions): Promise<ScenarioResult> {
    this.startTime = performance.now();
    this.actions = [];
    this.achievementsUnlocked = [];
    
    try {
      const mergedOptions: Required<ClassProgressionScenarioOptions> = {
        speed: options?.speed || 'normal',
        silent: options?.silent || false,
        autoCleanup: options?.autoCleanup !== false,
        className: options?.className || 'guerreiro',
        workoutsToGenerate: options?.workoutsToGenerate || 5,
        testDataTag: 'test-data'
      };
      
      // Log start of scenario
      this.logAction('START_SCENARIO', `Starting class progression scenario for ${mergedOptions.className}`);
      
      // Set user's class
      await this.setUserClass(userId, mergedOptions.className);
      
      // Generate workouts appropriate for the class
      await this.generateClassWorkouts(userId, mergedOptions);
      
      // Check for class-specific achievements
      const achievements = await this.checkClassAchievements(userId, mergedOptions.className);
      
      // Return successful result
      return this.createResult(true);
      
    } catch (error) {
      // Log error and return failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logAction('ERROR', errorMessage, false, errorMessage);
      return this.createResult(false, errorMessage);
    }
  }
  
  private async setUserClass(userId: string, className: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          class: className,
          class_selected_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      this.logAction('SET_CLASS', `Set user class to ${className}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('SET_CLASS_ERROR', message, false, message);
      throw error;
    }
  }
  
  private async generateClassWorkouts(userId: string, options: Required<ClassProgressionScenarioOptions>): Promise<void> {
    try {
      const { workoutsToGenerate, className } = options;
      
      // Different workout types based on class
      let workoutType = 'strength';
      switch (className) {
        case 'guerreiro':
          workoutType = 'strength';
          break;
        case 'monge':
          workoutType = 'calisthenics';
          break;
        case 'ninja':
          workoutType = 'cardio';
          break;
        case 'druida':
          workoutType = 'mobility';
          break;
        case 'bruxo':
          workoutType = 'flexibility';
          break;
        case 'paladino':
          workoutType = 'sport';
          break;
      }
      
      // Generate the workouts
      this.logAction('GENERATE_WORKOUTS', `Generating ${workoutsToGenerate} ${workoutType} workouts`);
      
      // Use workout generator
      const result = await this.generators.workout.createRandomWorkouts(userId, {
        workoutCount: workoutsToGenerate,
        workoutType: workoutType,
        isTestData: true
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      this.logAction('WORKOUTS_GENERATED', `Successfully generated ${workoutsToGenerate} workouts`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logAction('GENERATE_WORKOUTS_ERROR', message, false, message);
      throw error;
    }
  }
  
  private async checkClassAchievements(userId: string, className: string): Promise<string[]> {
    const unlockedAchievements: string[] = [];
    
    // Check for class-specific achievements
    const classAchievements = this.getClassAchievements(className);
    
    for (const achievementId of classAchievements) {
      const unlocked = await this.checkAchievementUnlock(userId, achievementId);
      if (unlocked) {
        unlockedAchievements.push(achievementId);
      }
    }
    
    return unlockedAchievements;
  }
  
  private getClassAchievements(className: string): string[] {
    // Return achievement IDs related to the specified class
    switch (className) {
      case 'guerreiro':
        return ['guerreiro_iniciado', 'forca_bruta'];
      case 'monge':
        return ['monge_iniciado', 'forca_interior'];
      case 'ninja':
        return ['ninja_iniciado', 'hiit_and_run'];
      case 'druida':
        return ['druida_iniciado', 'ritmo_da_natureza'];
      case 'bruxo':
        return ['bruxo_iniciado', 'pijama_arcano'];
      case 'paladino':
        return ['paladino_iniciado', 'caminho_do_heroi'];
      default:
        return [];
    }
  }
}

// Create the scenario instance
export const classProgressionScenario = new ClassProgressionScenario();
