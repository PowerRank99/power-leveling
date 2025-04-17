
import { supabase } from '@/integrations/supabase/client';

export class AchievementDebug {
  static async verifyPrimeiroTreino(): Promise<void> {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .or('string_id.eq.primeiro-treino,string_id.eq.first-workout');
      
    console.log('Found first workout achievements:', achievements);
    if (error) console.error('Error:', error);
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
    if (error) console.error('Error:', error);
  }
  
  static async checkUserProfile(userId: string): Promise<void> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    console.log('User profile:', profile);
    if (error) console.error('Error:', error);
  }
  
  static async debugFirstWorkoutAchievement(userId: string): Promise<void> {
    await this.verifyPrimeiroTreino();
    await this.checkUserProfile(userId);
    await this.checkUserAchievements(userId);
    
    // Attempt to manually award the achievement using RPC for testing
    await this.testAwardFirstWorkoutAchievement(userId);
  }
  
  static async testAwardFirstWorkoutAchievement(userId: string): Promise<void> {
    try {
      // Get the first workout achievement
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .or('string_id.eq.primeiro-treino,string_id.eq.first-workout')
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

  static async checkRLSPolicies(): Promise<void> {
    // This is an informational function only, showing what to check in Supabase dashboard
    console.log(`
      RLS Policy Check Reminder:
      1. Check if 'user_achievements' table has proper RLS policies
      2. Check if 'check_achievement_batch' RPC function has SECURITY DEFINER
      3. Verify user has correct permissions
    `);
  }
}
