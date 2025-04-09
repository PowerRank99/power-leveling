
import { supabase } from '@/integrations/supabase/client';
import { Achievement, UserAchievement, AchievementCategory } from '@/types/rpgTypes';
import { updateUserXP } from './XPService';
import { toast } from 'sonner';

/**
 * Check if workout triggered any achievements
 */
export const checkAchievements = async (
  userId: string, 
  workoutId: string
): Promise<Achievement[]> => {
  try {
    // Get the workout data
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_sets(*),
        routine:routine_id(name)
      `)
      .eq('id', workoutId)
      .single();
      
    if (workoutError || !workout) {
      throw new Error('Failed to fetch workout data');
    }
    
    // Get user workout history
    const { data: userWorkouts, error: userWorkoutsError } = await supabase
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .eq('completed_at', 'is not', null);
      
    if (userWorkoutsError) {
      throw new Error('Failed to fetch user workout history');
    }
    
    // Get all achievements that this workout might trigger
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', 'workout');
      
    if (achievementsError || !achievements) {
      throw new Error('Failed to fetch achievements');
    }
    
    // Get user's completed achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
      
    if (userAchievementsError) {
      throw new Error('Failed to fetch user achievements');
    }
    
    const completedAchievementIds = userAchievements?.map(ua => ua.achievement_id) || [];
    
    // Filter achievements that are not already completed
    const eligibleAchievements = achievements.filter(
      achievement => !completedAchievementIds.includes(achievement.id)
    );
    
    // Check each achievement to see if it's unlocked
    const triggeredAchievements: Achievement[] = [];
    
    for (const achievement of eligibleAchievements) {
      const isUnlocked = checkAchievementRequirements(
        achievement.requirements,
        workout,
        userWorkouts?.length || 0
      );
      
      if (isUnlocked) {
        // Award the achievement to the user
        await awardAchievement(userId, achievement.id);
        
        // Map database achievement to our interface format
        triggeredAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category as AchievementCategory,
          xpReward: achievement.xp_reward,
          iconName: achievement.icon_name,
          requirements: achievement.requirements
        });
      }
    }
    
    return triggeredAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

/**
 * Check if an achievement's requirements are met by the workout
 */
const checkAchievementRequirements = (
  requirements: any, 
  workout: any, 
  totalWorkouts: number
): boolean => {
  if (!requirements) return false;
  
  // Example requirement checks
  if (requirements.total_workouts && totalWorkouts < requirements.total_workouts) {
    return false;
  }
  
  if (requirements.sets_completed) {
    const completedSets = workout.workout_sets.filter((set: any) => set.completed).length;
    if (completedSets < requirements.sets_completed) {
      return false;
    }
  }
  
  if (requirements.workout_duration && 
     (!workout.duration_seconds || workout.duration_seconds < requirements.workout_duration)) {
    return false;
  }
  
  // Add more requirement checks as needed
  
  return true;
};

/**
 * Award achievement and XP to user
 */
export const awardAchievement = async (userId: string, achievementId: string): Promise<boolean> => {
  try {
    // Insert user achievement record
    const { error: insertError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        achieved_at: new Date().toISOString()
      });
      
    if (insertError) {
      throw new Error('Failed to award achievement');
    }
    
    // Get achievement details for XP reward
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('name, description, xp_reward, icon_name')
      .eq('id', achievementId)
      .single();
      
    if (achievementError || !achievement) {
      throw new Error('Failed to fetch achievement details');
    }
    
    // Award XP to user
    if (achievement.xp_reward && achievement.xp_reward > 0) {
      await updateUserXP(userId, achievement.xp_reward);
    }
    
    // Update achievements count
    const { error: updateProfileError } = await supabase
      .rpc('increment', { i: 1 })
      .eq('id', userId);
      
    if (updateProfileError) {
      console.error('Error updating achievements count:', updateProfileError);
    }
    
    // Show achievement notification
    toast.success(`Conquista desbloqueada: ${achievement.name}`, {
      description: `${achievement.description} (+${achievement.xp_reward} XP)`,
      duration: 5000
    });
    
    return true;
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return false;
  }
};

/**
 * Get all achievements earned by user
 */
export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        id,
        user_id,
        achievement_id,
        achieved_at,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });
      
    if (error || !data) {
      throw new Error('Failed to fetch user achievements');
    }
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      achievementId: item.achievement_id,
      achievedAt: item.achieved_at,
      achievement: item.achievement ? {
        id: item.achievement.id,
        name: item.achievement.name,
        description: item.achievement.description,
        category: item.achievement.category as AchievementCategory,
        xpReward: item.achievement.xp_reward,
        iconName: item.achievement.icon_name,
        requirements: item.achievement.requirements
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
};
