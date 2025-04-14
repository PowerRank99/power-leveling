
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/rpg/XPService';
import { ActivityBonusService } from '@/services/workout/manual/ActivityBonusService';

export class ManualWorkoutSubmissionService {
  private userId: string;
  private addLogEntry: (action: string, details: string) => void;
  
  constructor(userId: string, addLogEntry: (action: string, details: string) => void) {
    this.userId = userId;
    this.addLogEntry = addLogEntry;
  }
  
  async submitManualWorkout(params: {
    activityType: string;
    description: string;
    photoUrl: string;
    xpAwarded: number;
    isPowerDay: boolean;
    useClassPassives: boolean;
    selectedClass: string | null;
  }) {
    if (!this.userId) {
      toast.error('Error', {
        description: 'Please select a user',
      });
      return false;
    }
    
    try {
      const { 
        activityType, 
        description, 
        photoUrl, 
        xpAwarded, 
        isPowerDay,
        useClassPassives,
        selectedClass
      } = params;
      
      // Calculate class bonus for display in log
      let classBonus = 0;
      let classBonusDescription = null;
      
      if (useClassPassives && selectedClass) {
        const bonusMultiplier = ActivityBonusService.getClassBonus(selectedClass, activityType);
        if (bonusMultiplier > 0) {
          const baseXP = XPService.MANUAL_WORKOUT_BASE_XP + (isPowerDay ? 50 : 0);
          classBonus = Math.round(baseXP * bonusMultiplier);
          classBonusDescription = ActivityBonusService.getBonusDescription(selectedClass, activityType);
        }
      }
      
      const { error } = await supabase.rpc('create_manual_workout', {
        p_user_id: this.userId,
        p_description: description,
        p_activity_type: activityType,
        p_exercise_id: null,
        p_photo_url: photoUrl,
        p_xp_awarded: xpAwarded,
        p_workout_date: new Date().toISOString(),
        p_is_power_day: isPowerDay
      });
      
      if (error) throw error;
      
      // Award XP with class bonus metadata if applicable
      await XPService.awardXP(this.userId, xpAwarded, 'manual_workout', {
        activityType,
        isPowerDay,
        ...(useClassPassives && classBonus > 0 ? {
          classBonus: {
            class: selectedClass,
            amount: classBonus,
            description: classBonusDescription
          }
        } : {})
      });
      
      // Build detailed log entry
      let logDetails = `Type: ${activityType}, XP: ${xpAwarded}`;
      
      if (isPowerDay) {
        logDetails += ' (Power Day)';
      }
      
      if (useClassPassives && selectedClass) {
        logDetails += `, Class: ${selectedClass}`;
        
        if (classBonus > 0) {
          logDetails += `, Bonus: +${classBonus} XP (${classBonusDescription})`;
        }
      }
      
      this.addLogEntry('Manual Workout Submitted', logDetails);
      
      toast.success('Manual Workout Submitted!', {
        description: `${xpAwarded} XP has been awarded.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error submitting manual workout:', error);
      toast.error('Error', {
        description: 'Failed to submit manual workout',
      });
      return false;
    }
  }
}
