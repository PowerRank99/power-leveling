
import { supabase } from '@/integrations/supabase/client';
import { AchievementNotificationService } from './AchievementNotificationService';

export class AchievementAwardService {
  static async awardAchievement(
    userId: string, 
    achievementId: string, 
    achievementName: string,
    achievementDescription: string,
    xpReward: number,
    points: number
  ): Promise<boolean> {
    try {
      // First try direct method as it's more reliable
      const directResult = await this.awardAchievementDirect(
        userId,
        achievementId,
        achievementName,
        achievementDescription,
        xpReward,
        points
      );
      
      if (directResult) {
        return true;
      }
      
      // If direct method fails, try RPC as fallback
      return await this.awardAchievementUsingRPC(
        userId,
        achievementId,
        achievementName,
        achievementDescription,
        xpReward,
        points
      );
    } catch (error) {
      console.error('Error in awardAchievement:', error);
      return false;
    }
  }

  private static async awardAchievementUsingRPC(
    userId: string, 
    achievementId: string, 
    achievementName: string,
    achievementDescription: string,
    xpReward: number,
    points: number
  ): Promise<boolean> {
    try {
      console.log('Awarding achievement using RPC:', {
        userId,
        achievementId,
        achievementName
      });
      
      const { data, error } = await supabase.rpc(
        'check_achievement_batch',
        {
          p_user_id: userId,
          p_achievement_ids: [achievementId]
        }
      );
      
      if (error) {
        console.error('RPC Error awarding achievement:', error);
        return false;
      }
      
      console.log('Achievement award RPC result:', data);
      
      // Show achievement notification
      AchievementNotificationService.showAchievementNotification(
        achievementName, 
        achievementDescription, 
        xpReward
      );
      return true;
    } catch (error) {
      console.error('Error in awardAchievementUsingRPC:', error);
      return false;
    }
  }

  private static async awardAchievementDirect(
    userId: string,
    achievementId: string,
    achievementName: string,
    achievementDescription: string,
    xpReward: number,
    points: number
  ): Promise<boolean> {
    try {
      console.log('Trying direct achievement insert');
      
      // Insert the achievement directly
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        });
        
      if (insertError) {
        if (insertError.code !== '23505') {
          console.error('Error in direct achievement insert:', insertError);
        } else {
          console.log('Achievement already exists (duplicate key)');
        }
        return false;
      }
      
      // First, get current profile values
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('achievements_count, achievement_points, xp')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        return false;
      }
      
      // Calculate new values
      const newAchievementCount = (profileData.achievements_count || 0) + 1;
      const newAchievementPoints = (profileData.achievement_points || 0) + points;
      const newXp = (profileData.xp || 0) + xpReward;
      
      // Update profile with numeric values
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          achievements_count: newAchievementCount,
          achievement_points: newAchievementPoints,
          xp: newXp
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating profile stats:', updateError);
        return false;
      }
      
      // Show notification
      AchievementNotificationService.showAchievementNotification(
        achievementName,
        achievementDescription,
        xpReward
      );
      return true;
    } catch (error) {
      console.error('Error in direct achievement award:', error);
      return false;
    }
  }
}
