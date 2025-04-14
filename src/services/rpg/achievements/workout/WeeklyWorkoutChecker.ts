
/**
 * Service for checking weekly workout-related achievements
 */
export class WeeklyWorkoutChecker {
  /**
   * Check for weekly workout patterns and achievements
   */
  static async checkWeeklyWorkouts(workouts: any[]): Promise<string[]> {
    try {
      const achievementsToCheck: string[] = [];
      
      if (!workouts || workouts.length === 0) return achievementsToCheck;
      
      // Group workouts by week
      const workoutsByWeek: Record<string, number> = {};
      
      workouts.forEach(workout => {
        if (!workout.started_at) return;
        
        const date = new Date(workout.started_at);
        const weekKey = `${date.getFullYear()}-${this.getWeekNumber(date)}`;
        
        workoutsByWeek[weekKey] = (workoutsByWeek[weekKey] || 0) + 1;
      });
      
      // Check for 3+ workouts in a week
      const hasThreeInWeek = Object.values(workoutsByWeek).some(count => count >= 3);
      if (hasThreeInWeek) {
        achievementsToCheck.push('trio-na-semana');
      }
      
      return achievementsToCheck;
    } catch (error) {
      console.error('Error checking weekly workouts:', error);
      return [];
    }
  }
  
  /**
   * Helper to get week number from date
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
