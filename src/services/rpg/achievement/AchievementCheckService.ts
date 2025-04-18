
import { supabase } from '@/integrations/supabase/client';
import { isTestingMode } from '@/config/testingMode';
import { AchievementAwardService } from './AchievementAwardService';
import { FirstAchievementService } from './FirstAchievementService';

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

      // Get count of manual workouts
      const { count: manualWorkoutsCount, error: manualCountError } = await supabase
        .from('manual_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (manualCountError) {
        console.error('Error fetching manual workouts count:', manualCountError);
        return;
      }

      // Get count of workouts in the current week
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const { count: weeklyWorkoutsCount, error: weeklyCountError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', startOfWeek.toISOString())
        .is('completed_at', 'not.null');
        
      if (weeklyCountError) {
        console.error('Error fetching weekly workouts count:', weeklyCountError);
        return;
      }

      // Add manual workouts from this week
      const { count: weeklyManualCount, error: weeklyManualError } = await supabase
        .from('manual_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('workout_date', startOfWeek.toISOString());
        
      if (weeklyManualError) {
        console.error('Error fetching weekly manual workouts count:', weeklyManualError);
        return;
      }

      const totalWeeklyWorkouts = (weeklyWorkoutsCount || 0) + (weeklyManualCount || 0);

      console.log('User stats for achievement check:', {
        ...profile,
        manualWorkoutsCount,
        weeklyWorkouts: totalWeeklyWorkouts
      });
      
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
      
      // Check each achievement
      for (const achievement of remainingAchievements) {
        try {
          const requirements = typeof achievement.requirements === 'string' 
            ? JSON.parse(achievement.requirements) 
            : achievement.requirements;
          
          let achievementUnlocked = false;
          
          // Check workout count achievements
          if (requirements && 
              'workouts_count' in requirements && 
              profile.workouts_count >= requirements.workouts_count) {
            console.log('Unlocking workout achievement:', {
              name: achievement.name,
              required: requirements.workouts_count,
              current: profile.workouts_count
            });
            await AchievementAwardService.awardAchievement(
              userId, 
              achievement.id, 
              achievement.name, 
              achievement.description, 
              achievement.xp_reward,
              achievement.points
            );
            achievementUnlocked = true;
          }
          
          // Check weekly workout achievements
          if (!achievementUnlocked && 
              requirements && 
              'workouts_in_week' in requirements && 
              totalWeeklyWorkouts >= requirements.workouts_in_week) {
            console.log('Unlocking weekly workout achievement:', {
              name: achievement.name,
              required: requirements.workouts_in_week,
              current: totalWeeklyWorkouts
            });
            await AchievementAwardService.awardAchievement(
              userId, 
              achievement.id, 
              achievement.name, 
              achievement.description, 
              achievement.xp_reward,
              achievement.points
            );
            achievementUnlocked = true;
          }
          
          // Check manual workout achievements
          if (!achievementUnlocked && 
              requirements && 
              'manual_workouts_count' in requirements && 
              manualWorkoutsCount >= requirements.manual_workouts_count) {
            console.log('Unlocking manual workout achievement:', {
              name: achievement.name,
              required: requirements.manual_workouts_count,
              current: manualWorkoutsCount
            });
            await AchievementAwardService.awardAchievement(
              userId, 
              achievement.id, 
              achievement.name, 
              achievement.description, 
              achievement.xp_reward,
              achievement.points
            );
            achievementUnlocked = true;
          }
          
          // Check streak achievements
          if (!achievementUnlocked && 
              requirements && 
              'streak_days' in requirements && 
              profile.streak >= requirements.streak_days) {
            console.log('Unlocking streak achievement:', {
              name: achievement.name,
              required: requirements.streak_days,
              current: profile.streak
            });
            await AchievementAwardService.awardAchievement(
              userId, 
              achievement.id, 
              achievement.name, 
              achievement.description, 
              achievement.xp_reward,
              achievement.points
            );
            achievementUnlocked = true;
          }
          
          // Check personal records achievements
          if (!achievementUnlocked && 
              requirements && 
              'records_count' in requirements && 
              profile.records_count >= requirements.records_count) {
            console.log('Unlocking records achievement:', {
              name: achievement.name,
              required: requirements.records_count,
              current: profile.records_count
            });
            await AchievementAwardService.awardAchievement(
              userId, 
              achievement.id, 
              achievement.name, 
              achievement.description, 
              achievement.xp_reward,
              achievement.points
            );
            achievementUnlocked = true;
          }
          
          if (achievementUnlocked) {
            console.log('Achievement unlocked:', achievement.name);
          }
        } catch (error) {
          console.error('Error checking achievement:', achievement.id, error);
          continue;
        }
      }
    } catch (error) {
      console.error('Error in checkAchievements:', error);
    }
  }
}
