
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GuildRole } from './types';

export class GuildMemberService {
  /**
   * Promotes a guild member to a new role
   */
  static async promoteMember(
    guildId: string, 
    userId: string, 
    newRole: GuildRole
  ): Promise<boolean> {
    try {
      // Verify current user has permission (must be guild master)
      const { data: currentMember, error: memberError } = await supabase
        .from('guild_members')
        .select('role')
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .single();

      if (memberError || !currentMember) {
        console.error('Error checking member permissions:', memberError);
        throw new Error('Membro não encontrado na guilda.');
      }

      // Update member role
      const { error: updateError } = await supabase
        .from('guild_members')
        .update({ role: newRole })
        .eq('guild_id', guildId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating member role:', updateError);
        throw updateError;
      }

      toast.success('Cargo Atualizado!', {
        description: `O membro foi promovido para ${newRole}.`
      });

      return true;
    } catch (error) {
      console.error('Failed to promote member:', error);
      toast.error('Erro ao promover membro', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o cargo.'
      });
      return false;
    }
  }

  /**
   * Removes a member from a guild
   */
  static async removeMember(guildId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('guild_members')
        .delete()
        .eq('guild_id', guildId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing guild member:', error);
        throw error;
      }

      toast.success('Membro Removido!', {
        description: 'O membro foi removido da guilda.'
      });

      return true;
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Erro ao remover membro', {
        description: 'Ocorreu um erro ao remover o membro da guilda.'
      });
      return false;
    }
  }

  /**
   * Gets a list of guild members with their roles
   */
  static async listMembers(guildId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          user_id,
          role,
          profiles:user_id (
            name,
            avatar_url,
            level,
            class
          )
        `)
        .eq('guild_id', guildId);

      if (error) {
        console.error('Error fetching guild members:', error);
        throw error;
      }

      return data?.map(member => ({
        userId: member.user_id,
        role: member.role,
        ...member.profiles
      })) || [];
    } catch (error) {
      console.error('Failed to fetch guild members:', error);
      return [];
    }
  }
}
