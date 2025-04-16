
export interface GeneratorResult {
  success: boolean;
  message?: string;
  ids?: string[];
  workoutIds?: string[];
  data?: any;
}

export interface TestDataGenerator {
  generate: (userId: string, options?: any) => Promise<GeneratorResult>;
  cleanup: (userId: string) => Promise<boolean>;
  getGenerators?: () => TestDataGenerator[];
}

export const createTestDataGenerators = () => {
  // Import generators dynamically to avoid circular dependencies
  const { WorkoutGenerator } = require('./WorkoutGenerator');
  const { ActivityGenerator } = require('./ActivityGenerator');
  const { StreakGenerator } = require('./StreakGenerator');
  const { RecordGenerator } = require('./RecordGenerator');
  const { AchievementGenerator } = require('./AchievementGenerator');
  
  return {
    workout: new WorkoutGenerator(),
    activity: new ActivityGenerator(),
    streak: new StreakGenerator(),
    record: new RecordGenerator(),
    achievement: new AchievementGenerator()
  };
};
