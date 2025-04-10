
import { supabase } from '@/integrations/supabase/client';

export class GuildQueryService {
  /**
   * Gets a list of guilds for display
   * @returns Array of guilds
   */
  static async listGuilds(limit: number = 20): Promise<any[]> {
    try {
      // Get guilds with member count
      const { data, error } = await supabase
        .from('guilds')
        .select(`
          id, 
          name, 
          description, 
          avatar_url, 
          created_at,
          creator_id
        `)
        .limit(limit);
        
      if (error) {
        console.error('Error fetching guilds:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to list guilds:', error);
      return [];
    }
  }
  
  /**
   * Gets guilds the user is a member of
   * @param userId User ID
   * @returns Array of guilds
   */
  static async getUserGuilds(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          role,
          guilds (
            id,
            name,
            description,
            avatar_url,
            created_at
          )
        `)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user guilds:', error);
        throw error;
      }
      
      return data?.map(item => ({
        ...item.guilds,
        role: item.role
      })) || [];
    } catch (error) {
      console.error('Failed to fetch user guilds:', error);
      return [];
    }
  }
  
  /**
   * Gets guild leaderboard
   * @param guildId Guild ID
   * @returns Leaderboard data
   */
  static async getLeaderboard(guildId: string): Promise<any[]> {
    try {
      // Get guild members with their profiles
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          user_id,
          profiles (
            name,
            avatar_url,
            level,
            xp,
            workouts_count
          )
        `)
        .eq('guild_id', guildId)
        .order('profiles(xp)', { ascending: false });
        
      if (error) {
        console.error('Error fetching guild leaderboard:', error);
        throw error;
      }
      
      return data?.map(member => ({
        userId: member.user_id,
        name: member.profiles?.name,
        avatarUrl: member.profiles?.avatar_url,
        level: member.profiles?.level || 1,
        xp: member.profiles?.xp || 0,
        workoutsCount: member.profiles?.workouts_count || 0
      })) || [];
    } catch (error) {
      console.error('Failed to fetch guild leaderboard:', error);
      return [];
    }
  }
}
