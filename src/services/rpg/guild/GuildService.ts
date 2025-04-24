
import { supabase } from '@/integrations/supabase/client';
import { GuildUtils } from './GuildUtils';
import { toast } from 'sonner';
import { CreateGuildParams, CreateRaidParams } from './types';

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
   * @param userId Creator's user ID
   * @param raidData Raid parameters
   * @returns Raid ID if successful, null if failed
   */
  static async createRaid(
    guildId: string, 
    userId: string, 
    raidData: CreateRaidParams
  ): Promise<string | null> {
    try {
      // Check if user is guild master or moderator
      const { data: member, error: memberError } = await supabase
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .single();
        
      if (memberError || !member) {
        console.error('Error checking guild permissions:', memberError);
        throw new Error('Você precisa ser membro da guilda para criar uma raid.');
      }
      
      if (member.role !== 'guild_master' && member.role !== 'moderator') {
        throw new Error('Apenas mestres e moderadores da guilda podem criar raids.');
      }
      
      // Create the raid
      const startDate = raidData.startDate || new Date();
      const { data: raid, error: raidError } = await supabase
        .from('guild_raids')
        .insert({
          guild_id: guildId,
          name: raidData.name,
          raid_type: raidData.raidType,
          start_date: startDate.toISOString(),
          end_date: raidData.endDate.toISOString(),
          days_required: raidData.daysRequired,
          created_by: userId
        })
        .select('id')
        .single();
        
      if (raidError) {
        console.error('Error creating guild raid:', raidError);
        throw raidError;
      }
      
      toast.success('Raid Criada!', {
        description: `A raid "${raidData.name}" foi criada com sucesso.`
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
      const { data, error } = await supabase
        .from('guilds')
        .select(`
          id, 
          name, 
          description, 
          avatar_url,
          total_xp,
          created_at,
          creator_id,
          guild_members!inner (count)
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
            total_xp,
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
   * @param timeFilter Time period filter ('weekly', 'monthly', 'alltime')
   * @param metricFilter Metric to rank by ('xp', 'workouts', 'streak')
   * @returns Leaderboard data
   */
  static async getLeaderboard(
    guildId: string, 
    timeFilter: string = 'weekly',
    metricFilter: string = 'xp'
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_guild_leaderboard', {
          p_guild_id: guildId,
          p_time_range: timeFilter,
          p_limit: 50
        });

      if (error) {
        console.error('Error fetching guild leaderboard:', error);
        throw error;
      }

      if (Array.isArray(data)) {
        return data;
      }

      console.warn('Leaderboard data is not an array:', data);
      return [];
    } catch (error) {
      console.error('Failed to fetch guild leaderboard:', error);
      return [];
    }
  }
  
  /**
   * Gets guild details including stats
   * @param guildId Guild ID
   * @returns Guild details and stats
   */
  static async getGuildDetails(guildId: string): Promise<any> {
    try {
      const { data: guild, error } = await supabase
        .from('guilds')
        .select(`
          *,
          guild_members (count),
          guild_raids (
            count,
            status:end_date,
            type:raid_type
          )
        `)
        .eq('id', guildId)
        .single();
      
      if (error) throw error;
      
      return GuildUtils.mapDatabaseGuildToUIFormat(guild);
    } catch (error) {
      console.error('Error fetching guild details:', error);
      throw error;
    }
  }
  
  static async getMemberRole(guildId: string, userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      return data?.role || 'member';
    } catch (error) {
      console.error('Error fetching member role:', error);
      return 'member';
    }
  }
}

export default GuildService;
