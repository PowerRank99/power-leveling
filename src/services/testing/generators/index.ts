
export interface GeneratorResult {
  success: boolean;
  message?: string;
  error?: string;
  ids?: string[];
  workoutIds?: string[];
  prIds?: string[];
  data?: any;
}

export interface GeneratorOptions {
  count?: number;
  isTestData?: boolean;
  testDataTag?: string;
  silent?: boolean;
}

export const formatDateForDB = (date: Date): string => {
  return date.toISOString();
};

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
  const { ClassGenerator } = require('./ClassGenerator');
  const { PRGenerator } = require('./PRGenerator');
  
  return {
    workout: new WorkoutGenerator(),
    activity: new ActivityGenerator(),
    streak: new StreakGenerator(),
    record: new RecordGenerator(),
    achievement: new AchievementGenerator(),
    class: new ClassGenerator(),
    pr: new PRGenerator()
  };
};
