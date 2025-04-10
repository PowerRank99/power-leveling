
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class JoinGuildService {
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
}
