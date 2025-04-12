
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { 
  Achievement, 
  AchievementProgress, 
  AchievementStats, 
  AchievementRank 
} from '@/types/achievementTypes';
import { XPService } from './XPService';
import { WorkoutExercise } from '@/types/workoutTypes';

export class AchievementService {
  // Rank calculation constants
  private static readonly rankThresholds: Record<AchievementRank, number> = {
    'Unranked': 0,
    'E': 20,
    'D': 50,
    'C': 80,
    'B': 120,
    'A': 160,
    'S': 198
  };

  /**
   * Master achievement checker that calls all individual achievement checks
   */
  static async checkAchievements(userId: string): Promise<void> {
    try {
      if (!userId) {
        console.error('No userId provided to checkAchievements');
        return;
      }
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('workouts_count, streak, records_count, level, achievements_count')
        .eq('id', userId)
        .single();
        
      if (!profile) {
        console.error('No profile found for user', userId);
        return;
      }
      
      // Get all achievements user doesn't have yet
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = userAchievements?.map(a => a.achievement_id) || [];
      
      // Get all eligible achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`);
        
      if (!achievements || achievements.length === 0) {
        return;
      }
      
      // Check each achievement
      for (const achievement of achievements) {
        // Parse the requirements JSON to access its properties safely
        const requirements = parseRequirements(achievement.requirements);
        
        let achievementUnlocked = false;
        
        // Check workout count achievements
        if (requirements && 
            'workouts_count' in requirements && 
            profile.workouts_count >= requirements.workouts_count) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points || 1 // Default to 1 if points not specified
          );
          achievementUnlocked = true;
        }
        
        // Check streak achievements
        if (!achievementUnlocked && 
            requirements && 
            'streak_days' in requirements && 
            profile.streak >= requirements.streak_days) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points || 1
          );
          achievementUnlocked = true;
        }
        
        // Check personal records achievements
        if (!achievementUnlocked && 
            requirements && 
            'records_count' in requirements && 
            profile.records_count >= requirements.records_count) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points || 1
          );
          achievementUnlocked = true;
        }
        
        // Check level-based achievements
        if (!achievementUnlocked && 
            requirements && 
            'level' in requirements && 
            profile.level >= requirements.level) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points || 1
          );
          achievementUnlocked = true;
        }
        
        // Additional achievement types can be added here
      }
    } catch (error) {
      console.error('Error in checkAchievements:', error);
    }
  }
  
  /**
   * Check workout-related achievements
   */
  static async checkWorkoutAchievements(
    userId: string, 
    workout: { 
      id: string; 
      exercises: WorkoutExercise[]; 
      durationSeconds: number; 
      difficulty?: string;
    }
  ): Promise<void> {
    try {
      if (!userId) return;
      
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('workouts_count')
        .eq('id', userId)
        .single();
        
      if (!profile) return;
      
      // Get achievements user doesn't have yet that are workout-related
      const { data: unlockedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get all eligible achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`)
        .or('requirements->workouts_count.gte.0,requirements->long_workouts_count.gte.0,requirements->exercise_types.neq.null');
        
      if (!achievements || achievements.length === 0) return;
      
      // Calculate workout duration in minutes
      const durationMinutes = Math.round(workout.durationSeconds / 60);
      
      // Check achievements
      for (const achievement of achievements) {
        const requirements = parseRequirements(achievement.requirements);
        
        // Check workout count achievements
        if (requirements.workouts_count && profile.workouts_count >= requirements.workouts_count) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points
          );
        }
        
        // Check long workout achievements (workouts > 60 mins)
        if (requirements.long_workouts_count && durationMinutes >= 60) {
          // Get count of long workouts
          const { count } = await supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('duration_seconds', 3600);
            
          if (count && count >= requirements.long_workouts_count) {
            await this.awardAchievement(
              userId, 
              achievement.id, 
              achievement.name, 
              achievement.description, 
              achievement.xp_reward,
              achievement.points
            );
          }
        }
        
        // Check for specific exercise types in workout
        if (requirements.exercise_types && workout.exercises.length > 0) {
          const exerciseTypeMap = await this.getExerciseTypesFromWorkout(workout.exercises);
          const requiredTypes = requirements.exercise_types.split(',');
          
          // Check if all required types are in the workout
          const hasAllTypes = requiredTypes.every(type => exerciseTypeMap[type.trim()]);
          
          if (hasAllTypes) {
            await this.awardAchievement(
              userId, 
              achievement.id, 
              achievement.name, 
              achievement.description, 
              achievement.xp_reward,
              achievement.points
            );
          }
        }
        
        // Check for time of day achievements (early morning workouts)
        if (requirements.workout_time_range) {
          const now = new Date();
          const hour = now.getHours();
          const [startHour, endHour] = requirements.workout_time_range.split('-').map(Number);
          
          if (hour >= startHour && hour <= endHour) {
            // Count workouts in this time range
            const { count } = await supabase.rpc('count_workouts_in_time_range', {
              p_user_id: userId,
              p_start_hour: startHour,
              p_end_hour: endHour
            });
            
            if (count && count >= (requirements.workout_time_count || 1)) {
              await this.awardAchievement(
                userId, 
                achievement.id, 
                achievement.name, 
                achievement.description, 
                achievement.xp_reward,
                achievement.points
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking workout achievements:', error);
    }
  }
  
  /**
   * Helper method to get exercise types from a workout
   */
  private static async getExerciseTypesFromWorkout(exercises: WorkoutExercise[]): Promise<Record<string, boolean>> {
    try {
      const exerciseIds = exercises.map(e => e.id);
      const { data } = await supabase
        .from('exercises')
        .select('id, type')
        .in('id', exerciseIds);
        
      const typeMap: Record<string, boolean> = {};
      data?.forEach(exercise => {
        if (exercise.type) {
          typeMap[exercise.type] = true;
        }
      });
      
      return typeMap;
    } catch (error) {
      console.error('Error getting exercise types:', error);
      return {};
    }
  }
  
  /**
   * Check streak-related achievements
   */
  static async checkStreakAchievements(userId: string, currentStreak: number): Promise<void> {
    try {
      if (!userId || currentStreak <= 0) return;
      
      // Get achievements user doesn't have yet that are streak-related
      const { data: unlockedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get eligible streak achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`)
        .or('requirements->streak_days.lte.' + currentStreak);
        
      if (!achievements || achievements.length === 0) return;
      
      // Award achievements
      for (const achievement of achievements) {
        const requirements = parseRequirements(achievement.requirements);
        
        if (requirements.streak_days && currentStreak >= requirements.streak_days) {
          await this.awardAchievement(
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
      console.error('Error checking streak achievements:', error);
    }
  }
  
  /**
   * Check guild-related achievements
   */
  static async checkGuildAchievements(userId: string): Promise<void> {
    try {
      if (!userId) return;
      
      // Get user's guild memberships
      const { data: guildMemberships } = await supabase
        .from('guild_members')
        .select('guild_id')
        .eq('user_id', userId);
        
      if (!guildMemberships || guildMemberships.length === 0) return;
      
      // Get raids the user has participated in
      const { data: raidParticipations } = await supabase
        .from('guild_raid_participants')
        .select('raid_id, completed')
        .eq('user_id', userId);
        
      const completedRaids = raidParticipations?.filter(p => p.completed).length || 0;
      
      // Get unlocked achievements
      const { data: unlockedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get eligible guild achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`)
        .or('requirements->quests_completed.gte.0,requirements->active_guilds.gte.0,requirements->guild_xp_contributed.gte.0');
        
      if (!achievements || achievements.length === 0) return;
      
      // Check each achievement
      for (const achievement of achievements) {
        const requirements = parseRequirements(achievement.requirements);
        
        // Check quest completion achievements
        if (requirements.quests_completed && completedRaids >= requirements.quests_completed) {
          await this.awardAchievement(
            userId, 
            achievement.id, 
            achievement.name, 
            achievement.description, 
            achievement.xp_reward,
            achievement.points
          );
        }
        
        // Check active guilds achievements
        if (requirements.active_guilds && guildMemberships.length >= requirements.active_guilds) {
          // Check if the guilds are active (have > 5 members)
          let activeGuildsCount = 0;
          
          for (const membership of guildMemberships) {
            const { count } = await supabase
              .from('guild_members')
              .select('*', { count: 'exact', head: true })
              .eq('guild_id', membership.guild_id);
              
            if (count && count >= 5) {
              activeGuildsCount++;
            }
          }
          
          if (activeGuildsCount >= requirements.active_guilds) {
            await this.awardAchievement(
              userId, 
              achievement.id, 
              achievement.name, 
              achievement.description, 
              achievement.xp_reward,
              achievement.points
            );
          }
        }
        
        // Check guild XP contribution achievements
        if (requirements.guild_xp_contributed) {
          // This would require tracking XP contributions to guilds
          // Implement based on how guild XP contributions are tracked
        }
      }
    } catch (error) {
      console.error('Error checking guild achievements:', error);
    }
  }
  
  /**
   * Check personal record achievements
   */
  static async checkRecordAchievements(userId: string): Promise<void> {
    try {
      if (!userId) return;
      
      // Get user's personal records count
      const { data: profile } = await supabase
        .from('profiles')
        .select('records_count')
        .eq('id', userId)
        .single();
        
      if (!profile) return;
      
      // Get unlocked achievements
      const { data: unlockedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get eligible record achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`)
        .or('requirements->records_count.lte.' + profile.records_count);
        
      if (!achievements || achievements.length === 0) return;
      
      // Check each achievement
      for (const achievement of achievements) {
        const requirements = parseRequirements(achievement.requirements);
        
        if (requirements.records_count && profile.records_count >= requirements.records_count) {
          await this.awardAchievement(
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
      console.error('Error checking record achievements:', error);
    }
  }
  
  /**
   * Check power day achievements
   */
  static async checkPowerDayAchievements(userId: string): Promise<void> {
    try {
      if (!userId) return;
      
      // Get power day usage count
      const { data: powerDayUsage } = await supabase
        .from('power_day_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      const powerDayCount = powerDayUsage?.length || 0;
      
      // Get unlocked achievements
      const { data: unlockedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get eligible power day achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`)
        .or('requirements->power_days_used.lte.' + powerDayCount);
        
      if (!achievements || achievements.length === 0) return;
      
      // Check each achievement
      for (const achievement of achievements) {
        const requirements = parseRequirements(achievement.requirements);
        
        if (requirements.power_days_used && powerDayCount >= requirements.power_days_used) {
          await this.awardAchievement(
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
      console.error('Error checking power day achievements:', error);
    }
  }
  
  /**
   * Check variety achievements (different workout types)
   */
  static async checkVarietyAchievements(userId: string): Promise<void> {
    try {
      if (!userId) return;
      
      // Get distinct exercise types used in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: exerciseTypes } = await supabase.rpc('get_distinct_exercise_types', {
        p_user_id: userId,
        p_start_date: thirtyDaysAgo.toISOString()
      });
      
      const distinctTypes = exerciseTypes?.length || 0;
      
      // Get unlocked achievements
      const { data: unlockedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get eligible variety achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`)
        .or('requirements->distinct_exercise_types.lte.' + distinctTypes);
        
      if (!achievements || achievements.length === 0) return;
      
      // Check each achievement
      for (const achievement of achievements) {
        const requirements = parseRequirements(achievement.requirements);
        
        if (requirements.distinct_exercise_types && distinctTypes >= requirements.distinct_exercise_types) {
          await this.awardAchievement(
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
      console.error('Error checking variety achievements:', error);
    }
  }
  
  /**
   * Check manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<void> {
    try {
      if (!userId) return;
      
      // Count manual workouts
      const { data: countData } = await supabase
        .from('manual_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      const count = countData?.length || 0;
      
      // Get unlocked achievements
      const { data: unlockedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get eligible manual workout achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`)
        .or('requirements->manual_workouts_count.lte.' + count);
        
      if (!achievements || achievements.length === 0) return;
      
      // Check each achievement
      for (const achievement of achievements) {
        const requirements = parseRequirements(achievement.requirements);
        
        if (requirements.manual_workouts_count && count >= requirements.manual_workouts_count) {
          await this.awardAchievement(
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
      console.error('Error checking manual workout achievements:', error);
    }
  }
  
  /**
   * Awards an achievement to a user
   */
  static async awardAchievement(
    userId: string, 
    achievementId: string, 
    achievementName: string,
    achievementDescription: string,
    xpReward: number,
    points: number
  ): Promise<void> {
    try {
      // Record the achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        });
        
      if (error) {
        // If there's a unique constraint violation, the user already has this achievement
        if (error.code !== '23505') { // PostgreSQL unique violation code
          console.error('Error awarding achievement:', error);
        }
        return;
      }
      
      // Update the achievements count and XP
      await supabase
        .from('profiles')
        .update({ 
          achievements_count: supabase.rpc('increment_profile_counter', {
            user_id_param: userId,
            counter_name: 'achievements_count',
            increment_amount: 1
          }),
          xp: supabase.rpc('increment_profile_counter', {
            user_id_param: userId,
            counter_name: 'xp',
            increment_amount: xpReward
          })
        })
        .eq('id', userId);
      
      // Update user rank after achievement award
      await this.updateUserRank(userId);
      
      // Show achievement popup using the Zustand store
      const { showAchievement } = achievementPopupStore.getState();
      showAchievement({
        title: achievementName,
        description: achievementDescription,
        xpReward: xpReward,
        bonusText: "Achievement Unlocked! " + points + " points earned!"
      });
        
      // Also show toast notification
      toast.success(`🏆 Achievement Unlocked!`, {
        description: `${achievementName} (+${xpReward} XP, +${points} points)`
      });
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }
  
  /**
   * Calculate and update user rank based on level and achievement points
   */
  static async updateUserRank(userId: string): Promise<string> {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('level, achievements_count')
        .eq('id', userId)
        .single();
        
      if (!profile) {
        return 'Unranked';
      }
      
      // Calculate rank
      const rank = this.calculateRank(profile.level, profile.achievements_count);
      
      // Store rank in profile if needed in the future
      // Currently just calculating on demand
      
      return rank;
    } catch (error) {
      console.error('Error updating user rank:', error);
      return 'Unranked';
    }
  }

  /**
   * Get all achievements for a specific category
   */
  static async getAchievements(userId: string, category?: string): Promise<Achievement[]> {
    try {
      // Build query
      let query = supabase
        .from('achievements')
        .select('*');
      
      // Filter by category if provided
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Execute query
      const { data, error } = await query.order('rank', { ascending: false });
      
      if (error) {
        throw error;
      }

      // If no user ID, just return all achievements
      if (!userId) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          rank: item.rank,
          points: item.points,
          xpReward: item.xp_reward,
          iconName: item.icon_name,
          requirements: parseRequirements(item.requirements)
        }));
      }

      // Get user's achievements to mark which ones are unlocked
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      const unlockedAchievementIds = new Set(userAchievements?.map(a => a.achievement_id) || []);

      // Return achievements with unlocked status
      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        rank: item.rank,
        points: item.points,
        xpReward: item.xp_reward,
        iconName: item.icon_name,
        requirements: parseRequirements(item.requirements),
        isUnlocked: unlockedAchievementIds.has(item.id)
      }));
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }
  
  /**
   * Get achievements filtered by rank
   */
  static async getAchievementsByRank(userId: string, rank: string): Promise<Achievement[]> {
    try {
      // Get achievements of the specified rank
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('rank', rank)
        .order('points', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // If no user ID, just return all achievements of this rank
      if (!userId) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          rank: item.rank,
          points: item.points,
          xpReward: item.xp_reward,
          iconName: item.icon_name,
          requirements: parseRequirements(item.requirements)
        }));
      }
      
      // Get user's achievements to mark which ones are unlocked
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedAchievementIds = new Set(userAchievements?.map(a => a.achievement_id) || []);
      
      // Return achievements with unlocked status
      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        rank: item.rank,
        points: item.points,
        xpReward: item.xp_reward,
        iconName: item.icon_name,
        requirements: parseRequirements(item.requirements),
        isUnlocked: unlockedAchievementIds.has(item.id)
      }));
    } catch (error) {
      console.error('Error fetching achievements by rank:', error);
      return [];
    }
  }

  /**
   * Get user's unlocked achievements
   */
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          achieved_at,
          achievements (*)
        `)
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(item => ({
        id: item.achievements.id,
        name: item.achievements.name,
        description: item.achievements.description,
        category: item.achievements.category,
        rank: item.achievements.rank,
        points: item.achievements.points,
        xpReward: item.achievements.xp_reward,
        iconName: item.achievements.icon_name,
        requirements: parseRequirements(item.achievements.requirements),
        achievedAt: item.achieved_at
      }));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  /**
   * Get achievement statistics for a user
   */
  static async getAchievementStats(userId: string): Promise<AchievementStats> {
    try {
      // Get user profile with level and achievements count
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, achievements_count')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }

      // Get total number of achievements
      const { count: totalCount, error: countError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw countError;
      }

      // Get count of unlocked achievements
      const { count: unlockedCount, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (unlockedError) {
        throw unlockedError;
      }

      // Calculate current rank
      const currentRank = this.calculateRank(profile.level, profile.achievements_count);
      
      // Define the rank progression
      const ranks: AchievementRank[] = ['Unranked', 'E', 'D', 'C', 'B', 'A', 'S'];
      const currentRankIndex = ranks.indexOf(currentRank as AchievementRank);
      
      // Calculate next rank and points needed
      let nextRank: AchievementRank | null = null;
      let pointsToNextRank: number | null = null;
      
      if (currentRankIndex < ranks.length - 1) {
        nextRank = ranks[currentRankIndex + 1];
        
        const currentScore = (1.5 * profile.level) + (2 * profile.achievements_count);
        pointsToNextRank = Math.ceil((this.rankThresholds[nextRank] - currentScore) / 2);
        if (pointsToNextRank < 0) pointsToNextRank = 0;
      }

      return {
        total: totalCount || 0,
        unlocked: unlockedCount || 0,
        points: profile.achievements_count || 0,
        rank: currentRank,
        nextRank,
        pointsToNextRank
      };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
      return {
        total: 0,
        unlocked: 0,
        points: 0,
        rank: 'Unranked',
        nextRank: 'E',
        pointsToNextRank: 10
      };
    }
  }

  /**
   * Get progress for a specific achievement
   */
  static async getAchievementProgress(userId: string, achievementId: string): Promise<AchievementProgress | null> {
    try {
      // Get achievement details
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
      
      if (achievementError) {
        throw achievementError;
      }

      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('workouts_count, streak, records_count, level')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }

      // Parse requirements
      const requirements = parseRequirements(achievement.requirements);

      // Check if user has already unlocked this achievement
      const { data: userAchievement, error: userAchievementError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
      
      const isComplete = !!userAchievement;

      // Calculate progress based on achievement type
      let current = 0;
      let total = 1;

      if ('workouts_count' in requirements) {
        current = profile.workouts_count || 0;
        total = requirements.workouts_count;
      } else if ('streak_days' in requirements) {
        current = profile.streak || 0;
        total = requirements.streak_days;
      } else if ('records_count' in requirements) {
        current = profile.records_count || 0;
        total = requirements.records_count;
      } else if ('level' in requirements) {
        current = profile.level || 1;
        total = requirements.level;
      } else if ('manual_workouts_count' in requirements) {
        // Get count of manual workouts
        const { count } = await supabase
          .from('manual_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        current = count || 0;
        total = requirements.manual_workouts_count;
      } else if ('power_days_used' in requirements) {
        // Get count of power days used
        const { count } = await supabase
          .from('power_day_usage')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        current = count || 0;
        total = requirements.power_days_used;
      } else if ('quests_completed' in requirements) {
        // Get count of completed quests
        const { count } = await supabase
          .from('guild_raid_participants')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('completed', true);
        
        current = count || 0;
        total = requirements.quests_completed;
      }

      // Ensure current doesn't exceed total for display purposes
      current = Math.min(current, total);

      return {
        id: achievementId,
        current,
        total,
        isComplete
      };
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return null;
    }
  }
  
  /**
   * Calculate rank based on level and achievement points
   */
  static calculateRank(level: number, achievementPoints: number): string {
    const rankScore = (1.5 * level) + (2 * achievementPoints);
    
    if (rankScore < this.rankThresholds.E) return 'Unranked';
    if (rankScore >= this.rankThresholds.E && rankScore < this.rankThresholds.D) return 'E';
    if (rankScore >= this.rankThresholds.D && rankScore < this.rankThresholds.C) return 'D';
    if (rankScore >= this.rankThresholds.C && rankScore < this.rankThresholds.B) return 'C';
    if (rankScore >= this.rankThresholds.B && rankScore < this.rankThresholds.A) return 'B';
    if (rankScore >= this.rankThresholds.A && rankScore < this.rankThresholds.S) return 'A';
    return 'S';
  }
}

/**
 * Helper function to parse requirements from JSON
 */
function parseRequirements(requirementsJson: any): Record<string, any> {
  if (!requirementsJson) return {};
  
  try {
    if (typeof requirementsJson === 'string') {
      return JSON.parse(requirementsJson);
    }
    
    // If it's already an object, return it
    if (typeof requirementsJson === 'object') {
      return requirementsJson;
    }
    
    return {};
  } catch (error) {
    console.error('Error parsing requirements:', error);
    return {};
  }
}
