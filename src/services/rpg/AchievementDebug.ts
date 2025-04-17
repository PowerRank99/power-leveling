
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
  }
}
