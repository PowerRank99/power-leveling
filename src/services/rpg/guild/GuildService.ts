import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { GuildMemberResponse } from './types';

/**
 * Type for member info returned from the database
 */
interface MemberData {
  id: string;
  name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  workouts_count: number;
  streak: number;
}

/**
 * Service for managing guild operations
 */
export class GuildService {
  /**
   * Get members for a guild
   */
  static async getGuildMembers(guildId: string): Promise<ServiceResponse<GuildMemberResponse[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // First get all member IDs for the guild
        const { data: memberIds, error: memberError } = await supabase
          .from('guild_members')
          .select('user_id, role, joined_at')
          .eq('guild_id', guildId);
          
        if (memberError) throw memberError;
        
        if (!memberIds || memberIds.length === 0) {
          return [];
        }
        
        // Extract just the user IDs
        const userIds = memberIds.map(m => m.user_id);
        
        // Get profile data for all members in one query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, level, xp, workouts_count, streak')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        // Combine the data
        const members: GuildMemberResponse[] = [];
        
        if (profilesData && Array.isArray(profilesData)) {
          for (const memberIdInfo of memberIds) {
            const profile = profilesData.find(p => p.id === memberIdInfo.user_id);
            
            if (profile) {
              members.push({
                id: profile.id,
                name: profile.name || 'Unknown Member',
                avatarUrl: profile.avatar_url || null,
                level: profile.level || 1,
                role: memberIdInfo.role || 'member',
                joinedAt: memberIdInfo.joined_at,
                xp: profile.xp || 0,
                workoutsCount: profile.workouts_count || 0,
                streak: profile.streak || 0
              });
            }
          }
        }
        
        return members;
      },
      'GET_GUILD_MEMBERS'
    );
  }
  
  /**
   * Get guild details
   */
  static async getGuildDetails(guildId: string): Promise<ServiceResponse<{
    id: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    createdAt: string;
    creatorId: string | null;
    memberCount?: number;
    role?: string;
  }>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('guilds')
          .select(`
            id,
            name,
            description,
            avatar_url,
            created_at,
            creator_id,
            guild_members (
              role
            )
          `)
          .eq('id', guildId)
          .single();
          
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          creatorId: data.creator_id,
          memberCount: data.guild_members?.length,
          role: data.guild_members?.[0]?.role
        };
      },
      'GET_GUILD_DETAILS'
    );
  }
  
  /**
   * Check if user is a guild member
   */
  static async isGuildMember(guildId: string, userId: string): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('guild_members')
          .select('id')
          .eq('guild_id', guildId)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (error) throw error;
        
        return !!data;
      },
      'IS_GUILD_MEMBER'
    );
  }
  
  /**
   * Add a member to a guild
   */
  static async addGuildMember(guildId: string, userId: string): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Check if already a member
        const { data: existingMember, error: checkError } = await supabase
          .from('guild_members')
          .select('id')
          .eq('guild_id', guildId)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        if (existingMember) {
          return true; // Already a member, nothing to do
        }
        
        // Add the member
        const { error } = await supabase
          .from('guild_members')
          .insert({
            guild_id: guildId,
            user_id: userId,
            role: 'member'
          });
          
        if (error) throw error;
        
        return true;
      },
      'ADD_GUILD_MEMBER'
    );
  }
  
  /**
   * Remove a member from a guild
   */
  static async removeGuildMember(guildId: string, userId: string): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { error } = await supabase
          .from('guild_members')
          .delete()
          .eq('guild_id', guildId)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        return true;
      },
      'REMOVE_GUILD_MEMBER'
    );
  }
  
  /**
   * Get the number of members in a guild
   */
  static async getGuildMemberCount(guildId: string): Promise<ServiceResponse<number>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { count, error } = await supabase
          .from('guild_members')
          .select('*', { count: 'exact' })
          .eq('guild_id', guildId);
          
        if (error) throw error;
        
        return count || 0;
      },
      'GET_GUILD_MEMBER_COUNT'
    );
  }
}
