
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreateGuildParams } from './GuildService';

export class CreateGuildService {
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
}
