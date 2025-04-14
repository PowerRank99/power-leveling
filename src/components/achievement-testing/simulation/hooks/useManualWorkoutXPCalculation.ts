
import { useEffect } from 'react';
import { XPService } from '@/services/rpg/XPService';
import { ActivityBonusService } from '@/services/workout/manual/ActivityBonusService';
import { ManualWorkoutState } from './useManualWorkoutState';

export const POWER_DAY_BONUS_XP = 50;

interface UseManualWorkoutXPCalculationProps {
  state: ManualWorkoutState;
  updateState: (updates: Partial<ManualWorkoutState>) => void;
}

export const useManualWorkoutXPCalculation = ({ state, updateState }: UseManualWorkoutXPCalculationProps) => {
  // Calculate XP whenever relevant params change
  useEffect(() => {
    const totalXP = calculateXP();
    updateState({ totalXP });
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
  
  return {
    calculateXP,
    getClassBonusDescription
  };
};
