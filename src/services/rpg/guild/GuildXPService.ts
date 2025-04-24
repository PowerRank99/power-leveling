
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GuildXPContribution } from './types';
import { PaladinoBonus } from '../calculations/class-bonuses/PaladinoBonus';

export class GuildXPService {
  /**
   * Contributes XP to a guild, applying any Paladino bonuses
   */
  static async contributeXP(
    guildId: string,
    userId: string,
    baseAmount: number,
    source: string,
    workoutId?: string,
    manualWorkoutId?: string
  ): Promise<number> {
    try {
      const { data: finalAmount, error } = await supabase.rpc('add_guild_xp', {
        p_guild_id: guildId,
        p_user_id: userId,
        p_amount: baseAmount,
        p_source: source,
        p_workout_id: workoutId,
        p_manual_workout_id: manualWorkoutId
      });

      if (error) {
        console.error('Error contributing guild XP:', error);
        throw error;
      }

      return finalAmount;
    } catch (error) {
      console.error('Failed to contribute guild XP:', error);
      toast.error('Erro ao contribuir XP para guilda', {
        description: 'Ocorreu um erro ao processar sua contribuição de XP.'
      });
      return 0;
    }
  }

  /**
   * Gets guild XP contributions history
   */
  static async getContributions(
    guildId: string,
    limit: number = 20
  ): Promise<GuildXPContribution[]> {
    try {
      const { data, error } = await supabase
        .from('guild_xp_contributions')
        .select('*')
        .eq('guild_id', guildId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching guild contributions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch guild contributions:', error);
      return [];
    }
  }

  /**
   * Gets a user's total XP contribution to a guild
   */
  static async getUserContribution(guildId: string, userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('guild_xp_contributions')
        .select('amount')
        .eq('guild_id', guildId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user contribution:', error);
        throw error;
      }

      return data?.reduce((total, contribution) => total + contribution.amount, 0) || 0;
    } catch (error) {
      console.error('Failed to fetch user contribution:', error);
      return 0;
    }
  }
}
