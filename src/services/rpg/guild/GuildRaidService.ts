
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreateRaidParams } from './GuildService';

export class GuildRaidService {
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
}
