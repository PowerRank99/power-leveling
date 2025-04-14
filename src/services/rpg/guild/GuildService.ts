import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreateGuildParams, CreateRaidParams, GuildRole } from './types';
import { AchievementService } from '@/services/rpg/AchievementService';

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
      
      // Award guild creation achievement
      await AchievementService.awardAchievement(userId, 'guild-creator');
      
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
      
      // Award guild joining achievement
      await AchievementService.awardAchievement(userId, 'guild-joiner');
      
      // Check how many guilds the user has joined
      const { count: guildCount, error: countError } = await supabase
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (!countError && guildCount) {
        // Award achievement for joining multiple guilds
        if (guildCount >= 3) {
          await AchievementService.awardAchievement(userId, 'guild-networker');
        }
        if (guildCount >= 5) {
          await AchievementService.awardAchievement(userId, 'guild-socializer');
        }
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
      // Define the date range based on the time filter
      const now = new Date();
      let startDate: Date;
      
      switch (timeFilter) {
        case 'weekly':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'alltime':
        default:
          startDate = new Date(0); // Beginning of time
          break;
      }
      
      // Define the sorting field based on the metric filter
      let sortField: string;
      
      switch (metricFilter) {
        case 'workouts':
          sortField = 'profiles(workouts_count)';
          break;
        case 'streak':
          sortField = 'profiles(streak)';
          break;
        case 'xp':
        default:
          sortField = 'profiles(xp)';
          break;
      }
      
      // Get guild members with their profiles
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          user_id,
          role,
          profiles (
            name,
            avatar_url,
            level,
            xp,
            workouts_count,
            streak
          )
        `)
        .eq('guild_id', guildId)
        .order(sortField, { ascending: false });
        
      if (error) {
        console.error('Error fetching guild leaderboard:', error);
        throw error;
      }
      
      // Format and return the leaderboard data
      return data?.map((member, index) => ({
        id: member.user_id,
        name: member.profiles?.name,
        avatar: member.profiles?.avatar_url,
        level: member.profiles?.level || 1,
        points: metricFilter === 'xp' 
          ? member.profiles?.xp 
          : metricFilter === 'workouts' 
            ? member.profiles?.workouts_count 
            : member.profiles?.streak,
        position: index + 1,
        isMaster: member.role === 'guild_master',
        isModerator: member.role === 'moderator',
        badge: member.role === 'guild_master' 
          ? 'Mestre da Guilda' 
          : member.role === 'moderator' 
            ? 'Moderador' 
            : undefined,
        trend: Math.random() > 0.6 
          ? Math.random() > 0.5 ? 'up' : 'down' 
          : 'same' // Mock trend data for now
      })) || [];
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
      // Get guild details
      const { data: guild, error: guildError } = await supabase
        .from('guilds')
        .select('*')
        .eq('id', guildId)
        .single();
        
      if (guildError) {
        console.error('Error fetching guild details:', guildError);
        throw guildError;
      }
      
      // Get member count
      const { count: memberCount, error: memberError } = await supabase
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('guild_id', guildId);
        
      if (memberError) {
        console.error('Error counting guild members:', memberError);
        throw memberError;
      }
      
      // Get active raids count
      const { count: activeRaidsCount, error: raidError } = await supabase
        .from('guild_raids')
        .select('*', { count: 'exact', head: true })
        .eq('guild_id', guildId)
        .gte('end_date', new Date().toISOString());
        
      if (raidError) {
        console.error('Error counting active raids:', raidError);
        throw raidError;
      }
      
      // Return combined data
      return {
        ...guild,
        memberCount: memberCount || 0,
        activeRaidsCount: activeRaidsCount || 0
      };
    } catch (error) {
      console.error('Failed to fetch guild details:', error);
      return null;
    }
  }

  /**
   * Format member data for UI display
   */
  static formatMemberData(memberData: any[]): ServiceResponse<any[]> {
    try {
      const formattedMembers = memberData.map(member => ({
        id: member.id,
        name: member.name || 'Unknown',
        avatar_url: member.avatar_url || null,
        level: member.level || 1,
        xp: member.xp || 0,
        workouts_count: member.workouts_count || 0,
        streak: member.streak || 0,
        joined_at: member.joined_at || new Date().toISOString()
      }));
      
      return createSuccessResponse(formattedMembers);
    } catch (error: any) {
      console.error('Error formatting member data:', error);
      return createErrorResponse(error.message);
    }
  }
}
