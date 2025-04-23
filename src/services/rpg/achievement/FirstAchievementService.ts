
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from './AchievementAwardService';

export class FirstAchievementService {
  static async tryAwardFirstWorkoutAchievement(userId: string): Promise<void> {
    try {
      console.log('Attempting to award first workout achievement directly');
      
      // Try to find the achievement using multiple possible string IDs
      const { data: firstWorkoutAchievements, error: firstWorkoutError } = await supabase
        .from('achievements')
        .select('*')
        .or('string_id.eq.primeiro-treino,string_id.eq.first-workout,name.ilike.%primeiro%,name.ilike.%first%workout%')
        .limit(5);
      
      if (firstWorkoutError) {
        console.error('Error fetching first workout achievement:', firstWorkoutError);
        return;
      }
      
      console.log('Found potential first workout achievements:', firstWorkoutAchievements);
      
      if (!firstWorkoutAchievements || firstWorkoutAchievements.length === 0) {
        console.error('No first workout achievement found in the database');
        return;
      }
      
      // Try each potential achievement
      for (const achievement of firstWorkoutAchievements) {
        // Check if user already has this achievement
        const { data: hasAchievement, error: hasAchievementError } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .maybeSingle();
          
        if (hasAchievementError) {
          console.error('Error checking if user has achievement:', hasAchievementError);
          continue;
        }
        
        console.log('Achievement check status for', achievement.name, ':', {
          hasAchievement,
          shouldAward: !hasAchievement
        });
        
        // If user doesn't have this achievement yet, award it
        if (!hasAchievement) {
          console.log('Attempting to award achievement:', achievement.name);
          
          try {
            const result = await AchievementAwardService.awardAchievement(
              userId,
              achievement.id,
              achievement.name,
              achievement.description,
              achievement.xp_reward,
              achievement.points
            );
            
            console.log('Achievement award result:', result);
            
            break; // Stop after awarding one achievement
          } catch (error) {
            console.error('Error awarding achievement:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in tryAwardFirstWorkoutAchievement:', error);
    }
  }
}
