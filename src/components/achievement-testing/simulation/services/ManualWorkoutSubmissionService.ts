
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/rpg/XPService';

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
      
      await XPService.awardXP(this.userId, xpAwarded, 'manual_workout', {
        activityType,
        isPowerDay,
        ...(useClassPassives ? { class: selectedClass } : {})
      });
      
      const classInfo = useClassPassives ? `, Class: ${selectedClass}` : '';
      this.addLogEntry(
        'Manual Workout Submitted', 
        `Type: ${activityType}, XP: ${xpAwarded}${isPowerDay ? ' (Power Day)' : ''}${classInfo}`
      );
      
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
