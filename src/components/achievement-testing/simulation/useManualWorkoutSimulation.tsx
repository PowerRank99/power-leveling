
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/rpg/XPService';
import { ActivityBonusService } from '@/services/workout/manual/ActivityBonusService';

interface ManualWorkoutSimulationState {
  activityType: string;
  description: string;
  duration: number;
  isPowerDay: boolean;
  photoUrl: string;
  isLoading: boolean;
  useClassPassives: boolean;
  selectedClass: string | null;
  totalXP: number;
}

interface UseManualWorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

export const POWER_DAY_BONUS_XP = 50;

export const useManualWorkoutSimulation = ({ userId, addLogEntry }: UseManualWorkoutSimulationProps) => {
  const [state, setState] = useState<ManualWorkoutSimulationState>({
    activityType: 'strength',
    description: '',
    duration: 45,
    isPowerDay: false,
    photoUrl: 'https://frzgnszosqvcgycjtntz.supabase.co/storage/v1/object/public/workout-photos/default.jpg',
    isLoading: false,
    useClassPassives: false,
    selectedClass: null,
    totalXP: XPService.MANUAL_WORKOUT_BASE_XP
  });

  // Setter functions for each state property
  const setActivityType = (activityType: string) => setState(prev => ({ ...prev, activityType }));
  const setDescription = (description: string) => setState(prev => ({ ...prev, description }));
  const setDuration = (duration: number) => setState(prev => ({ ...prev, duration }));
  const setIsPowerDay = (isPowerDay: boolean) => setState(prev => ({ ...prev, isPowerDay }));
  const setUseClassPassives = (useClassPassives: boolean) => setState(prev => ({ ...prev, useClassPassives }));
  const setSelectedClass = (selectedClass: string | null) => setState(prev => ({ ...prev, selectedClass }));
  
  // Calculate XP whenever relevant params change
  useEffect(() => {
    const totalXP = calculateXP();
    setState(prev => ({ ...prev, totalXP }));
  }, [state.isPowerDay, state.useClassPassives, state.selectedClass, state.activityType]);
  
  const calculateXP = () => {
    let baseXP = XPService.MANUAL_WORKOUT_BASE_XP;
    
    if (state.isPowerDay) {
      baseXP += POWER_DAY_BONUS_XP;
    }
    
    if (state.useClassPassives && state.selectedClass) {
      const bonusPercentage = ActivityBonusService.getClassBonus(state.selectedClass, state.activityType);
      
      if (bonusPercentage > 0) {
        const classBonus = Math.round(baseXP * bonusPercentage);
        baseXP += classBonus;
      }
    }
    
    return baseXP;
  };
  
  const getClassBonusDescription = () => {
    if (!state.useClassPassives || !state.selectedClass) return null;
    
    const bonusPercentage = ActivityBonusService.getClassBonus(state.selectedClass, state.activityType);
    if (bonusPercentage <= 0) return null;
    
    const bonusAmount = Math.round(
      (XPService.MANUAL_WORKOUT_BASE_XP + (state.isPowerDay ? POWER_DAY_BONUS_XP : 0)) * bonusPercentage
    );
    
    const bonusPercentText = `+${Math.round(bonusPercentage * 100)}%`;
    
    const activityDescriptions: Record<string, string> = {
      'strength': 'treinos de força',
      'cardio': 'treinos de cardio',
      'running': 'corrida',
      'yoga': 'yoga/flexibilidade',
      'sports': 'atividades esportivas',
      'bodyweight': 'peso corporal',
      'flexibility': 'flexibilidade',
      'swimming': 'natação',
      'other': 'este tipo de atividade'
    };
    
    const activityDesc = activityDescriptions[state.activityType] || state.activityType;
    
    return {
      description: `${state.selectedClass}: ${bonusPercentText} para ${activityDesc}`,
      amount: bonusAmount
    };
  };
  
  const submitManualWorkout = async () => {
    if (!userId) {
      toast.error('Error', {
        description: 'Please select a user',
      });
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const xpAwarded = state.totalXP;
      
      const { error } = await supabase.rpc('create_manual_workout', {
        p_user_id: userId,
        p_description: state.description,
        p_activity_type: state.activityType,
        p_exercise_id: null,
        p_photo_url: state.photoUrl,
        p_xp_awarded: xpAwarded,
        p_workout_date: new Date().toISOString(),
        p_is_power_day: state.isPowerDay
      });
      
      if (error) throw error;
      
      await XPService.awardXP(userId, xpAwarded, 'manual_workout', {
        activityType: state.activityType,
        isPowerDay: state.isPowerDay,
        ...(state.useClassPassives ? { class: state.selectedClass } : {})
      });
      
      const classInfo = state.useClassPassives ? `, Class: ${state.selectedClass}` : '';
      addLogEntry(
        'Manual Workout Submitted', 
        `Type: ${state.activityType}, XP: ${xpAwarded}${state.isPowerDay ? ' (Power Day)' : ''}${classInfo}`
      );
      
      toast.success('Manual Workout Submitted!', {
        description: `${xpAwarded} XP has been awarded.`,
      });
      
      setState(prev => ({ 
        ...prev, 
        description: '',
        isLoading: false 
      }));
      
    } catch (error) {
      console.error('Error submitting manual workout:', error);
      toast.error('Error', {
        description: 'Failed to submit manual workout',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    state,
    setActivityType,
    setDescription,
    setDuration,
    setIsPowerDay,
    setUseClassPassives,
    setSelectedClass,
    getClassBonusDescription,
    submitManualWorkout
  };
};
