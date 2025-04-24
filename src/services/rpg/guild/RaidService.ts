
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RaidWithProgress, GuildRaidType } from './types';

export class RaidService {
  /**
   * Track participation in a guild raid
   * @param raidId Raid ID
   * @param userId User ID
   * @returns Success status
   */
  static async trackParticipation(raidId: string, userId: string): Promise<boolean> {
    try {
      // First check if user is already a participant
      const { data: existingParticipant, error: checkError } = await supabase
        .from('guild_raid_participants')
        .select('id, days_completed')
        .eq('raid_id', raidId)
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected if not a participant yet
        console.error('Error checking raid participation:', checkError);
        throw checkError;
      }
      
      // If user is already a participant, increment days_completed
      if (existingParticipant) {
        const { error: updateError } = await supabase
          .from('guild_raid_participants')
          .update({
            days_completed: existingParticipant.days_completed + 1,
            last_participation: new Date().toISOString()
          })
          .eq('id', existingParticipant.id);
          
        if (updateError) {
          console.error('Error updating raid participation:', updateError);
          throw updateError;
        }
      } else {
        // Create a new participant record
        const { error: insertError } = await supabase
          .from('guild_raid_participants')
          .insert({
            raid_id: raidId,
            user_id: userId,
            days_completed: 1,
            completed: false,
            last_participation: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error creating raid participation:', insertError);
          throw insertError;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to track raid participation:', error);
      return false;
    }
  }
  
  /**
   * Get active raids for a guild
   * @param guildId Guild ID
   * @returns List of raids with progress information
   */
  static async getActiveRaids(guildId: string): Promise<RaidWithProgress[]> {
    try {
      const { data: raids, error } = await supabase
        .from('guild_raids')
        .select(`
          id,
          name,
          raid_type,
          start_date,
          end_date,
          days_required,
          xp_reward,
          guild_raid_participants (
            user_id,
            days_completed
          )
        `)
        .eq('guild_id', guildId)
        .gte('end_date', new Date().toISOString());
        
      if (error) {
        console.error('Error fetching guild raids:', error);
        throw error;
      }
      
      if (!raids) {
        return [];
      }

      // Transform into RaidWithProgress objects
      const raidWithProgress: RaidWithProgress[] = raids.map(raid => {
        const totalParticipants = raid.guild_raid_participants ? raid.guild_raid_participants.length : 0;
        const totalDaysCompleted = raid.guild_raid_participants
          ? raid.guild_raid_participants.reduce((acc: number, curr: any) => acc + curr.days_completed, 0)
          : 0;
          
        // Calculate progress percentage based on total days completed vs target
        const targetDaysTotal = raid.days_required * (totalParticipants || 1);
        const progressPercentage = Math.min(100, (totalDaysCompleted / Math.max(1, targetDaysTotal)) * 100);
        
        // Cast raid_type to GuildRaidType to ensure type safety
        const raidType = raid.raid_type as GuildRaidType;
        if (!['consistency', 'beast', 'elemental'].includes(raidType)) {
          console.warn(`Unknown raid type: ${raid.raid_type}, defaulting to 'consistency'`);
        }
        
        return {
          id: raid.id,
          name: raid.name,
          raidType: raidType || 'consistency',
          startDate: new Date(raid.start_date),
          endDate: new Date(raid.end_date),
          daysRequired: raid.days_required,
          progress: {
            currentValue: totalDaysCompleted,
            targetValue: targetDaysTotal,
            percentage: progressPercentage
          },
          raidDetails: {
            participantsCount: totalParticipants,
            xpReward: raid.xp_reward || 100,
            targetValue: targetDaysTotal,
            participants: raid.guild_raid_participants,
            elementalTypes: raidType === 'elemental' ? ['strength', 'cardio', 'mobility', 'sport'] : []
          }
        };
      });
      
      return raidWithProgress;
    } catch (error) {
      console.error('Failed to fetch guild raids:', error);
      return [];
    }
  }
}
