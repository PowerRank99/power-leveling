
import { useEffect } from 'react';
import { XPService } from '@/services/rpg/XPService';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';
import { WorkoutState } from './useWorkoutState';

export const useXPCalculation = (
  state: WorkoutState,
  updateState: (updates: Partial<WorkoutState>) => void
) => {
  // Calculate XP whenever relevant params change
  useEffect(() => {
    calculatePotentialXP();
  }, [
    state.duration, 
    state.exerciseCount, 
    state.difficultyLevel, 
    state.includePersonalRecord, 
    state.streak, 
    state.useClassPassives, 
    state.selectedClass
  ]);
  
  const calculatePotentialXP = () => {
    try {
      const workout = {
        id: 'simulation',
        exercises: Array(state.exerciseCount).fill({}).map((_, i) => ({
          id: `sim-ex-${i}`,
          name: `Simulated Exercise ${i + 1}`,
          exerciseId: `sim-ex-${i}`,
          sets: Array(3).fill({}).map(() => ({
            id: `sim-set-${Math.random()}`,
            weight: '20',
            reps: '10',
            completed: true
          }))
        })),
        durationSeconds: state.duration * 60,
        difficulty: state.difficultyLevel as any,
        hasPR: state.includePersonalRecord
      };
      
      const timeMinutes = Math.floor(workout.durationSeconds / 60);
      const timeXP = XPCalculationService.calculateTimeXP(timeMinutes);
      
      const exerciseXP = state.exerciseCount * XPService.BASE_EXERCISE_XP;
      const totalSets = state.exerciseCount * 3;
      const cappedSets = Math.min(totalSets, XPCalculationService.MAX_XP_CONTRIBUTING_SETS);
      const setXP = cappedSets * XPService.BASE_SET_XP;
      
      const difficultyMultiplier = XPCalculationService.DIFFICULTY_MULTIPLIERS[state.difficultyLevel as keyof typeof XPCalculationService.DIFFICULTY_MULTIPLIERS];
      const streakMultiplier = XPCalculationService.getStreakMultiplier(state.streak);
      
      const prBonus = state.includePersonalRecord ? XPService.PR_BONUS_XP : 0;
      
      const baseCalculatedXP = Math.round((timeXP + exerciseXP + setXP) * difficultyMultiplier);
      
      const result = XPCalculationService.calculateWorkoutXP({
        workout,
        userClass: state.useClassPassives ? state.selectedClass : null,
        streak: state.streak,
        defaultDifficulty: state.difficultyLevel as any
      });
      
      updateState({
        xpBreakdown: {
          timeXP,
          exerciseXP,
          setXP,
          difficultyMultiplier,
          streakMultiplier,
          prBonus,
          baseXP: baseCalculatedXP
        },
        totalXP: result.totalXP,
        bonusBreakdown: result.bonusBreakdown
      });
      
      return result.totalXP;
    } catch (error) {
      console.error('Error calculating XP:', error);
      return 0;
    }
  };

  return { calculatePotentialXP };
};
