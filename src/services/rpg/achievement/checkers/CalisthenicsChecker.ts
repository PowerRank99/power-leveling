
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class CalisthenicsChecker {
  static async checkCalisthenicsAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    try {
      // Count calisthenics workouts from completed workouts with calisthenics exercises
      const { data: calisthenicsWorkouts, error: calisthenicsError } = await supabase
        .rpc('count_workouts_by_exercise_type', { 
          p_user_id: userId,
          p_type: 'Calistenia'
        });
      
      // If RPC isn't available, this is a fallback method
      let calisthenicsCount = 0;
      if (calisthenicsError) {
        console.error('Error using RPC for calisthenics count, using fallback method:', calisthenicsError);
        
        // Fallback: Check manual workouts for calisthenics
        const { data: manualWorkouts, error: manualError } = await supabase
          .from('manual_workouts')
          .select('id')
          .eq('user_id', userId)
          .eq('activity_type', 'Calistenia');
        
        if (manualError) {
          console.error('Error fetching calisthenics manual workouts:', manualError);
        } else {
          calisthenicsCount = manualWorkouts?.length || 0;
        }
      } else {
        calisthenicsCount = calisthenicsWorkouts?.[0]?.count || 0;
      }
      
      // Debug logging
      console.log('Calisthenics workouts count:', calisthenicsCount);
      
      // Check for monk/calisthenics achievement
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) continue;
        
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
        
        if (requirements?.calisthenics_workouts && 
            calisthenicsCount >= requirements.calisthenics_workouts) {
          console.log('Unlocking calisthenics achievement:', {
            name: achievement.name,
            required: requirements.calisthenics_workouts,
            current: calisthenicsCount
          });
          
          await AchievementAwardService.awardAchievement(
            userId,
            achievement.id,
            achievement.name,
            achievement.description,
            achievement.xp_reward,
            achievement.points
          );
        }
      }
    } catch (error) {
      console.error('Error in checkCalisthenicsAchievements:', error);
    }
  }
}
