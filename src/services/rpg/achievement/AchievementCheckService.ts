
import { supabase } from '@/integrations/supabase/client';
import { isTestingMode } from '@/config/testingMode';
import { WorkoutCountChecker } from './checkers/WorkoutCountChecker';
import { WeeklyWorkoutChecker } from './checkers/WeeklyWorkoutChecker';
import { VarietyChecker } from './checkers/VarietyChecker';

export class AchievementCheckService {
  static async checkAchievements(userId: string): Promise<void> {
    try {
      if (!userId) {
        console.error('No userId provided to checkAchievements');
        return;
      }
      
      if (isTestingMode()) {
        console.log('🔧 Testing mode: Achievement check starting');
      }
      
      // Get user profile data including manual_workouts count
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('workouts_count, streak, records_count')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Get count of workouts in the current week
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Get weekly workouts count (combining tracked and manual)
      const [trackedCount, manualCount] = await Promise.all([
        supabase
          .from('workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('completed_at', startOfWeek.toISOString())
          .not('completed_at', 'is', null)
          .then(({ count }) => count || 0),
          
        supabase
          .from('manual_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('workout_date', startOfWeek.toISOString())
          .then(({ count }) => count || 0)
      ]);
      
      const totalWeeklyWorkouts = trackedCount + manualCount;
      
      // Get all achievements user doesn't have yet
      const { data: unlockedAchievements, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      if (unlockedError) {
        console.error('Error fetching unlocked achievements:', unlockedError);
        return;
      }

      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get all eligible achievements
      const { data: remainingAchievements, error: remainingError } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'NULL'})`);

      if (remainingError || !remainingAchievements) {
        console.error('Error fetching achievements:', remainingError);
        return;
      }

      console.log('Checking eligible achievements:', remainingAchievements.length);
      
      // Check different types of achievements using specialized checkers
      await Promise.all([
        WorkoutCountChecker.checkWorkoutAchievements(
          userId, 
          profile, 
          unlockedIds, 
          remainingAchievements
        ),
        
        WeeklyWorkoutChecker.checkWeeklyAchievements(
          userId, 
          totalWeeklyWorkouts, 
          unlockedIds, 
          remainingAchievements
        ),
        
        VarietyChecker.checkVarietyAchievements(
          userId,
          unlockedIds,
          remainingAchievements
        )
      ]);
      
    } catch (error) {
      console.error('Error in checkAchievements:', error);
    }
  }
}
