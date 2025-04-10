import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreateGuildParams, CreateRaidParams, GuildRole } from './types';

export class GuildService {
  /**
   * Creates a new guild
   * @param userId User ID of the creator
   * @param params Guild creation parameters
   * @returns Guild ID if successful, null if failed
   */
  static async createGuild(userId: string, params: CreateGuildParams): Promise<string | null> {
    try {
      // Insert the new guild
      const { data: guild, error: createError } = await supabase
        .from('guilds')
        .insert({
          name: params.name,
          description: params.description || '',
          avatar_url: params.avatarUrl,
          creator_id: userId
        })
        .select('id')
        .single();
        
      if (createError) {
        console.error('Error creating guild:', createError);
        throw createError;
      }
      
      // Add creator as guild master
      const { error: memberError } = await supabase
        .from('guild_members')
        .insert({
          guild_id: guild.id,
          user_id: userId,
          role: 'guild_master'
        });
        
      if (memberError) {
        console.error('Error adding creator to guild:', memberError);
        // Try to delete the guild since we failed to add the creator
        await supabase.from('guilds').delete().eq('id', guild.id);
        throw memberError;
      }
      
      toast.success('Guilda Criada!', {
        description: `Sua guilda "${params.name}" foi criada com sucesso.`
      });
      
      return guild.id;
    } catch (error) {
      console.error('Failed to create guild:', error);
      toast.error('Erro ao criar guilda', {
        description: 'Ocorreu um erro ao criar sua guilda. Tente novamente.'
      });
      return null;
    }
  }
  
  /**
   * Joins a guild
   * @param userId User ID
   * @param guildId Guild ID to join
   * @returns Success status
   */
  static async joinGuild(userId: string, guildId: string): Promise<boolean> {
    try {
      // Check if the user is already a member
      const { count, error: checkError } = await supabase
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('guild_id', guildId);
        
      if (checkError) {
        console.error('Error checking guild membership:', checkError);
        throw checkError;
      }
      
      // User is already a member
      if (count && count > 0) {
        toast.info('Você já é membro desta guilda.');
        return true;
      }
      
      // Add user to guild
      const { error: joinError } = await supabase
        .from('guild_members')
        .insert({
          guild_id: guildId,
          user_id: userId,
          role: 'member'
        });
        
      if (joinError) {
        console.error('Error joining guild:', joinError);
        throw joinError;
      }
      
      toast.success('Guilda Ingressada!', {
        description: 'Você agora é um membro desta guilda.'
      });
      
      return true;
    } catch (error) {
      console.error('Failed to join guild:', error);
      toast.error('Erro ao ingressar na guilda', {
        description: 'Ocorreu um erro ao ingressar na guilda. Tente novamente.'
      });
      return false;
    }
  }
  
  /**
   * Creates a new guild raid
   * @param guildId Guild ID
   * @param creatorId Creator's user ID
   * @param params Raid parameters
   * @returns Raid ID if successful, null if failed
   */
  static async createRaid(
    guildId: string, 
    creatorId: string, 
    params: CreateRaidParams
  ): Promise<string | null> {
    try {
      // Check if user is guild master or moderator
      const { data: member, error: memberError } = await supabase
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', creatorId)
        .single();
        
      if (memberError || !member) {
        console.error('Error checking guild permissions:', memberError);
        throw new Error('Você precisa ser membro da guilda para criar uma raid.');
      }
      
      if (member.role !== 'guild_master' && member.role !== 'moderator') {
        throw new Error('Apenas mestres e moderadores da guilda podem criar raids.');
      }
      
      // Create the raid
      const startDate = params.startDate || new Date();
      const { data: raid, error: raidError } = await supabase
        .from('guild_raids')
        .insert({
          guild_id: guildId,
          name: params.name,
          start_date: startDate.toISOString(),
          end_date: params.endDate.toISOString(),
          days_required: params.daysRequired,
          created_by: creatorId
        })
        .select('id')
        .single();
        
      if (raidError) {
        console.error('Error creating guild raid:', raidError);
        throw raidError;
      }
      
      toast.success('Raid Criada!', {
        description: `A raid "${params.name}" foi criada com sucesso.`
      });
      
      return raid.id;
    } catch (error) {
      console.error('Failed to create raid:', error);
      toast.error('Erro ao criar raid', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao criar a raid.'
      });
      return null;
    }
  }
  
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
