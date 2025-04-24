
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  GuildRaidType, 
  RaidWithProgress, 
  RaidDetails,
  RaidProgress,
  CreateRaidParams
} from './types';
import { GuildXPService } from './GuildXPService';

export class RaidService {
  /**
   * Creates a new guild raid
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
          description: params.description,
          start_date: startDate.toISOString(),
          end_date: params.endDate.toISOString(),
          days_required: params.daysRequired,
          raid_type: params.raidType || 'consistency',
          raid_details: params.raidDetails || {}
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
   * Gets active raids for a guild
   */
  static async getActiveRaids(guildId: string): Promise<RaidWithProgress[]> {
    try {
      const { data: raids, error } = await supabase
        .from('guild_raids')
        .select(`
          *,
          guild_raid_participants(
            days_completed,
            completed,
            user_id
          )
        `)
        .eq('guild_id', guildId)
        .gte('end_date', new Date().toISOString());

      if (error) {
        console.error('Error fetching active raids:', error);
        throw error;
      }

      return raids.map(raid => this.mapRaidWithProgress(raid));
    } catch (error) {
      console.error('Failed to fetch active raids:', error);
      return [];
    }
  }

  /**
   * Gets details for a specific raid
   */
  static async getRaidDetails(raidId: string): Promise<RaidWithProgress | null> {
    try {
      const { data: raid, error } = await supabase
        .from('guild_raids')
        .select(`
          *,
          guild_raid_participants(
            days_completed,
            completed,
            user_id
          )
        `)
        .eq('id', raidId)
        .single();

      if (error) {
        console.error('Error fetching raid details:', error);
        throw error;
      }

      return this.mapRaidWithProgress(raid);
    } catch (error) {
      console.error('Failed to fetch raid details:', error);
      return null;
    }
  }

  /**
   * Records participation in a raid
   */
  static async trackParticipation(
    raidId: string, 
    userId: string
  ): Promise<boolean> {
    try {
      const { data: result, error } = await supabase
        .rpc('record_raid_participation', {
          p_raid_id: raidId,
          p_user_id: userId
        });

      if (error) {
        console.error('Error recording raid participation:', error);
        throw error;
      }

      if (result) {
        // If the raid was completed, distribute rewards
        await this.distributeRewards(raidId);
      }

      return result;
    } catch (error) {
      console.error('Failed to track raid participation:', error);
      return false;
    }
  }

  /**
   * Distributes rewards for a completed raid
   */
  private static async distributeRewards(raidId: string): Promise<void> {
    try {
      const raid = await this.getRaidDetails(raidId);
      if (!raid) return;

      const { data: participants, error } = await supabase
        .from('guild_raid_participants')
        .select('*')
        .eq('raid_id', raidId)
        .eq('completed', true);

      if (error) throw error;

      const baseXp = raid.raidDetails?.xpReward || 200; // Default XP reward

      // Award XP to each participant
      for (const participant of participants || []) {
        await GuildXPService.contributeXP(
          raid.guildId,
          participant.user_id,
          baseXp,
          'raid_completion',
          undefined,
          undefined
        );
      }
    } catch (error) {
      console.error('Error distributing raid rewards:', error);
    }
  }

  /**
   * Maps a raid database record to RaidWithProgress type
   */
  private static mapRaidWithProgress(raid: any): RaidWithProgress {
    const progress = this.calculateRaidProgress(raid);
    
    return {
      id: raid.id,
      name: raid.name,
      guildId: raid.guild_id,
      raidType: raid.raid_type,
      startDate: new Date(raid.start_date),
      endDate: new Date(raid.end_date),
      daysRequired: raid.days_required,
      raidDetails: raid.raid_details || {},
      progress
    };
  }

  /**
   * Calculates raid progress based on type
   */
  private static calculateRaidProgress(raid: any): RaidProgress {
    const participants = raid.guild_raid_participants || [];
    let currentValue = 0;
    let targetValue = 0;

    switch (raid.raid_type) {
      case 'consistency':
        // Target is achieving required days for each participant
        targetValue = raid.days_required;
        currentValue = Math.max(...participants.map(p => p.days_completed || 0));
        break;

      case 'beast':
        // Target is collective workout count
        targetValue = raid.raid_details?.targetValue || 100;
        currentValue = participants.reduce((sum, p) => sum + (p.days_completed || 0), 0);
        break;

      case 'elemental':
        // Target is completing all required workout types
        const requiredTypes = raid.raid_details?.elementalTypes || [];
        targetValue = requiredTypes.length;
        const completedTypes = new Set(
          participants.flatMap(p => p.completed_types || [])
        );
        currentValue = completedTypes.size;
        break;
    }

    const percentage = (currentValue / targetValue) * 100;
    const completed = percentage >= 100;

    return {
      completed,
      currentValue,
      targetValue,
      percentage: Math.min(percentage, 100)
    };
  }
}
