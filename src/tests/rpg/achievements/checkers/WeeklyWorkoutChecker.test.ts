
import { describe, it, expect, vi } from 'vitest';
import { WeeklyWorkoutChecker } from '@/services/rpg/achievements/workout/WeeklyWorkoutChecker';

describe('WeeklyWorkoutChecker', () => {
  describe('checkWeeklyWorkouts', () => {
    it('should detect three workouts in a week', async () => {
      const mockWorkouts = [
        { started_at: '2024-04-01T10:00:00Z' },
        { started_at: '2024-04-02T10:00:00Z' },
        { started_at: '2024-04-03T10:00:00Z' }
      ];

      const achievements = await WeeklyWorkoutChecker.checkWeeklyWorkouts(mockWorkouts);
      expect(achievements).toContain('trio-na-semana');
    });

    it('should not award achievement for less than three workouts', async () => {
      const mockWorkouts = [
        { started_at: '2024-04-01T10:00:00Z' },
        { started_at: '2024-04-02T10:00:00Z' }
      ];

      const achievements = await WeeklyWorkoutChecker.checkWeeklyWorkouts(mockWorkouts);
      expect(achievements).not.toContain('trio-na-semana');
    });

    it('should handle empty workout list', async () => {
      const achievements = await WeeklyWorkoutChecker.checkWeeklyWorkouts([]);
      expect(achievements).toHaveLength(0);
    });

    it('should handle workouts across different weeks', async () => {
      const mockWorkouts = [
        { started_at: '2024-04-01T10:00:00Z' }, // Week 1
        { started_at: '2024-04-08T10:00:00Z' }, // Week 2
        { started_at: '2024-04-15T10:00:00Z' }  // Week 3
      ];

      const achievements = await WeeklyWorkoutChecker.checkWeeklyWorkouts(mockWorkouts);
      expect(achievements).not.toContain('trio-na-semana');
    });
  });
});
