
import { supabase } from '@/integrations/supabase/client';
import { BaseScenario, ScenarioOptions, ScenarioResult } from './index';
import { WorkoutType } from '../generators/WorkoutGenerator';

export interface ClassProgressionScenarioOptions extends ScenarioOptions {
  classType?: string;
  workoutCount?: number;
  includePR?: boolean;
  generateCompletion?: boolean;
}

export class ClassProgressionScenario extends BaseScenario {
  constructor() {
    super(
      'class-progression',
      'Class Progression',
      'Simulates a user progressing through class-specific content',
      ['class', 'progression', 'achievement'],
      ['class', 'workout', 'achievement']
    );
  }

  async execute(userId: string, options?: ClassProgressionScenarioOptions): Promise<ScenarioResult> {
    this.startTime = performance.now();
    this.actions = [];
    this.achievementsUnlocked = [];
    
    // Default options
    const defaultOptions: Required<ClassProgressionScenarioOptions> = {
      speed: 'normal',
      silent: false,
      autoCleanup: true,
      testDataTag: 'class-progression',
      classType: 'guerreiro',
      workoutCount: 5,
      includePR: true,
      generateCompletion: true
    };
    
    const mergedOptions = { ...defaultOptions, ...(options || {}) };
    
    try {
      // Set the user's class
      this.logAction('SET_CLASS', `Setting user class to ${mergedOptions.classType}`);
      
      const { error: classError } = await supabase
        .from('profiles')
        .update({
          class: mergedOptions.classType,
          class_selected_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (classError) {
        throw new Error(`Failed to set user class: ${classError.message}`);
      }
      
      await this.delayBySpeed(mergedOptions.speed);
      
      // Generate workouts based on class type
      let workoutType = WorkoutType.STRENGTH;
      
      switch (mergedOptions.classType.toLowerCase()) {
        case 'guerreiro':
          workoutType = WorkoutType.STRENGTH;
          break;
        case 'monge':
          workoutType = WorkoutType.MOBILITY;
          break;
        case 'ninja':
          workoutType = WorkoutType.HIIT;
          break;
        case 'druida':
          workoutType = WorkoutType.MOBILITY;
          break;
        case 'bruxo':
          workoutType = WorkoutType.STRENGTH;
          break;
        case 'paladino':
          workoutType = WorkoutType.SPORT;
          break;
      }
      
      this.logAction('GENERATE_WORKOUTS', `Generating ${mergedOptions.workoutCount} ${workoutType} workouts`);
      
      // Generate workouts with workout generator
      const workoutOptions = {
        count: mergedOptions.workoutCount,
        type: workoutType,
        isTestData: true
      };
      
      const workoutResult = await this.generators.workout.generate(userId, workoutOptions);
      
      if (!workoutResult.success) {
        throw new Error(`Failed to generate workouts: ${workoutResult.message}`);
      }
      
      await this.delayBySpeed(mergedOptions.speed);
      
      // Generate personal records if needed
      if (mergedOptions.includePR) {
        this.logAction('GENERATE_PR', 'Creating personal record');
        
        const prResult = await this.generators.record.generate(userId);
        
        if (!prResult.success) {
          this.logAction('WARNING', `Failed to generate PR: ${prResult.message}`, false);
        }
        
        await this.delayBySpeed(mergedOptions.speed);
      }
      
      // Check for unlocked achievements
      this.logAction('CHECK_ACHIEVEMENTS', 'Checking for unlocked class achievements');
      
      // Get potential class achievements
      const { data: classAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('id')
        .ilike('requirements', `%${mergedOptions.classType}%`);
        
      if (achievementsError) {
        this.logAction('WARNING', `Failed to fetch class achievements: ${achievementsError.message}`, false);
      } else if (classAchievements && classAchievements.length > 0) {
        const achievementIds = classAchievements.map(a => a.id);
        
        // Check which ones the user has unlocked
        const unlockedAchievements = await this.checkAchievementUnlock(userId, achievementIds);
        
        if (unlockedAchievements.length > 0) {
          this.achievementsUnlocked = unlockedAchievements;
          this.logAction('ACHIEVEMENTS_UNLOCKED', `Unlocked ${unlockedAchievements.length} class achievements`);
        }
      }
      
      if (this.achievementsUnlocked.length === 0) {
        this.logAction('INFO', 'No class achievements were unlocked');
      }
      
      // Return success result
      return this.createResult(true, 'Class progression scenario completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logAction('ERROR', `Scenario failed: ${errorMessage}`, false);
      
      return this.createResult(false, `Failed to execute class progression scenario: ${errorMessage}`);
    }
  }
}

// Register the scenario
export const classProgressionScenario = new ClassProgressionScenario();
