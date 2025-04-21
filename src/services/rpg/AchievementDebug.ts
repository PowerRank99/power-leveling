
import { supabase } from '@/integrations/supabase/client';

export class AchievementDebug {
  static async verifyPrimeiroTreino(): Promise<void> {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .or('string_id.eq.primeiro-treino,string_id.eq.first-workout,name.ilike.%primeiro%,name.ilike.%first%workout%');
      
    console.log('Found first workout achievements:', achievements);
    if (error) console.error('Error fetching primeiro-treino:', error);
  }
  
  static async checkUserAchievements(userId: string): Promise<void> {
    const { data: userAchievements, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId);
      
    console.log('User achievements:', userAchievements);
    if (error) console.error('Error fetching user achievements:', error);
  }
  
  static async checkUserProfile(userId: string): Promise<void> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    console.log('User profile:', profile);
    if (error) console.error('Error fetching user profile:', error);
  }
  
  static async debugFirstWorkoutAchievement(userId: string): Promise<void> {
    console.log('🔍 Starting deep debug for first workout achievement');
    await this.verifyPrimeiroTreino();
    await this.checkUserProfile(userId);
    await this.checkUserAchievements(userId);
    await this.checkRPCFunctionality(userId);
    await this.checkRLSPolicies();
  }
  
  static async testAwardFirstWorkoutAchievement(userId: string): Promise<void> {
    try {
      // Get the first workout achievement
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .or('string_id.eq.primeiro-treino,string_id.eq.first-workout,name.ilike.%primeiro%,name.ilike.%first%workout%')
        .limit(1);
      
      if (error || !achievements || achievements.length === 0) {
        console.error('Error or no achievement found:', error);
        return;
      }
      
      const achievement = achievements[0];
      console.log('Testing award of achievement:', achievement);
      
      // Check if user already has this achievement
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .maybeSingle();
      
      if (existingAchievement) {
        console.log('User already has this achievement');
        return;
      }
      
      // Try to award using RPC
      const { data, error: rpcError } = await supabase.rpc(
        'check_achievement_batch',
        {
          p_user_id: userId,
          p_achievement_ids: [achievement.id]
        }
      );
      
      console.log('RPC result:', data);
      if (rpcError) console.error('RPC error:', rpcError);
      
      // Verify it was awarded
      await this.checkUserAchievements(userId);
    } catch (error) {
      console.error('Error in testAwardFirstWorkoutAchievement:', error);
    }
  }

  static async checkRPCFunctionality(userId: string): Promise<void> {
    try {
      console.log('Testing RPC functionality');
      
      // Test a basic RPC call
      const { data: testData, error: testError } = await supabase.rpc(
        'get_achievement_stats',
        {
          p_user_id: userId
        }
      );
      
      console.log('RPC test result:', testData);
      if (testError) console.error('RPC test error:', testError);
    } catch (error) {
      console.error('Error in checkRPCFunctionality:', error);
    }
  }

  static async checkRLSPolicies(): Promise<void> {
    // This is an informational function only, showing what to check in Supabase dashboard
    console.log(`
      RLS Policy Check Reminder:
      1. Check if 'user_achievements' table has proper RLS policies
      2. Check if 'check_achievement_batch' RPC function has SECURITY DEFINER
      3. Verify user has correct permissions
      4. Check if required SELECT policies exist
    `);
  }
  
  static async checkAllAchievements(): Promise<void> {
    try {
      const { data: allAchievements, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: true });
        
      if (error) {
        console.error('Error fetching all achievements:', error);
        return;
      }
      
      console.log('All achievements in database:', allAchievements);
    } catch (error) {
      console.error('Error in checkAllAchievements:', error);
    }
  }

  static async checkUserAchievementProgress(userId: string): Promise<void> {
    try {
      console.log('🔍 Checking user achievement progress for specific achievements');

      // Check for "Manual na Veia" achievement
      await this.checkManualWorkoutCount(userId);
      
      // Check for "Combo Fitness" achievement
      await this.checkWorkoutVariety(userId);

      // Check for "Monge em Ação" achievement
      await this.checkExerciseTypeCount(userId, 'Calistenia');
      
      // Check for "Dia de Poder" achievement
      await this.checkPowerDays(userId);
      
    } catch (error) {
      console.error('Error in checkUserAchievementProgress:', error);
    }
  }

  static async checkManualWorkoutCount(userId: string): Promise<void> {
    try {
      const { data: manualWorkouts, error } = await supabase
        .from('manual_workouts')
        .select('id, activity_type, created_at, workout_date')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching manual workouts:', error);
        return;
      }
      
      console.log(`Found ${manualWorkouts?.length || 0} manual workouts for user ${userId}`);
      console.log('Manual workouts details:', manualWorkouts);
      
      // Check for manual na veia achievement requirement
      const { data: achievement, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .ilike('name', '%Manual na Veia%')
        .single();
        
      if (achError) {
        console.error('Error fetching Manual na Veia achievement:', achError);
        return;
      }
      
      if (achievement) {
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
          
        console.log('Manual na Veia achievement requirements:', requirements);
        console.log('Manual na Veia achievement progress:', {
          current: manualWorkouts?.length || 0,
          required: requirements?.manual_workouts || requirements?.manual_workout_count || 'unknown'
        });
      }
    } catch (error) {
      console.error('Error in checkManualWorkoutCount:', error);
    }
  }

  static async checkWorkoutVariety(userId: string): Promise<void> {
    try {
      // Get current week's dates
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Check workout_varieties table
      const { data: varieties, error: varError } = await supabase
        .from('workout_varieties')
        .select('*')
        .eq('user_id', userId)
        .gte('workout_date', startOfWeek.toISOString().split('T')[0]);
        
      if (varError) {
        console.error('Error fetching workout varieties:', varError);
      }
      
      console.log('Workout varieties this week:', varieties);
      
      // Check manual workouts variety
      const { data: manualWorkouts, error: manError } = await supabase
        .from('manual_workouts')
        .select('activity_type, workout_date')
        .eq('user_id', userId)
        .gte('workout_date', startOfWeek.toISOString());
        
      if (manError) {
        console.error('Error fetching manual workouts for variety check:', manError);
      }
      
      // Count unique activity types
      const uniqueTypes = new Set();
      
      varieties?.forEach(v => {
        if (v.exercise_types && Array.isArray(v.exercise_types)) {
          v.exercise_types.forEach(t => uniqueTypes.add(t));
        }
      });
      
      manualWorkouts?.forEach(w => {
        if (w.activity_type) {
          uniqueTypes.add(w.activity_type);
        }
      });
      
      console.log('Unique workout types this week:', {
        types: Array.from(uniqueTypes),
        count: uniqueTypes.size
      });
      
      // Get Combo Fitness achievement
      const { data: achievement, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .ilike('name', '%Combo Fitness%')
        .single();
        
      if (achError) {
        console.error('Error fetching Combo Fitness achievement:', achError);
        return;
      }
      
      if (achievement) {
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
          
        console.log('Combo Fitness achievement requirements:', requirements);
        console.log('Combo Fitness achievement progress:', {
          current: uniqueTypes.size,
          required: requirements?.unique_exercise_types || requirements?.variety_count || 'unknown'
        });
      }
    } catch (error) {
      console.error('Error in checkWorkoutVariety:', error);
    }
  }

  static async checkExerciseTypeCount(userId: string, exerciseType: string): Promise<void> {
    try {
      // Check for tracked workouts with this exercise type
      let exerciseTypeCount = 0;
      
      // Check manual workouts
      const { data: manualWorkouts, error: manError } = await supabase
        .from('manual_workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', exerciseType);
        
      if (manError) {
        console.error(`Error fetching ${exerciseType} manual workouts:`, manError);
      } else {
        exerciseTypeCount = manualWorkouts?.length || 0;
      }
      
      console.log(`Found ${exerciseTypeCount} ${exerciseType} workouts for user ${userId}`);
      console.log(`${exerciseType} workouts details:`, manualWorkouts);
      
      // Get the relevant achievement
      const { data: achievement, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .or(`name.ilike.%${exerciseType}%,description.ilike.%${exerciseType}%`)
        .ilike('description', '%complete%workouts%')
        .limit(1);
        
      if (achError || !achievement || achievement.length === 0) {
        console.error(`Error or no achievement found for ${exerciseType}:`, achError);
        return;
      }
      
      const targetAch = achievement[0];
      const requirements = typeof targetAch.requirements === 'string'
        ? JSON.parse(targetAch.requirements)
        : targetAch.requirements;
        
      console.log(`${targetAch.name} achievement requirements:`, requirements);
      
      // Find the requirement key for this exercise type
      const typeKeys = Object.keys(requirements).filter(key => 
        key.toLowerCase().includes(exerciseType.toLowerCase()) || 
        key.toLowerCase().includes(exerciseType.toLowerCase().replace(/ /g, '_'))
      );
      
      if (typeKeys.length > 0) {
        const requirementKey = typeKeys[0];
        console.log(`${targetAch.name} achievement progress:`, {
          current: exerciseTypeCount,
          required: requirements[requirementKey],
          requirementKey
        });
      } else {
        console.log(`Could not find requirement key for ${exerciseType} in ${targetAch.name}`);
        console.log('All requirements:', requirements);
      }
    } catch (error) {
      console.error('Error in checkExerciseTypeCount:', error);
    }
  }

  static async checkPowerDays(userId: string): Promise<void> {
    try {
      // Check power day usage table
      const { data: powerDays, error: pdError } = await supabase
        .from('power_day_usage')
        .select('*')
        .eq('user_id', userId);
        
      if (pdError) {
        console.error('Error fetching power day usage:', pdError);
      }
      
      // Check manual workouts with power day flag
      const { data: manualPowerDays, error: mpError } = await supabase
        .from('manual_workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_power_day', true);
        
      if (mpError) {
        console.error('Error fetching manual power days:', mpError);
      }
      
      const totalPowerDays = (powerDays?.length || 0) + (manualPowerDays?.length || 0);
      
      console.log('Power day usage:', {
        fromTable: powerDays?.length || 0,
        fromManualWorkouts: manualPowerDays?.length || 0,
        total: totalPowerDays
      });
      
      console.log('Power day details:', {
        powerDayUsage: powerDays,
        manualPowerDays: manualPowerDays
      });
      
      // Get Dia de Poder achievement
      const { data: achievement, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .ilike('name', '%Dia de Poder%')
        .single();
        
      if (achError) {
        console.error('Error fetching Dia de Poder achievement:', achError);
        return;
      }
      
      if (achievement) {
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
          
        console.log('Dia de Poder achievement requirements:', requirements);
        console.log('Dia de Poder achievement progress:', {
          current: totalPowerDays,
          required: requirements?.power_days || requirements?.power_day_count || 'unknown'
        });
      }
    } catch (error) {
      console.error('Error in checkPowerDays:', error);
    }
  }
}
