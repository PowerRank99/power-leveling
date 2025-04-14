
import { useState } from 'react';

export interface WorkoutState {
  workoutType: string;
  duration: number;
  exerciseCount: number;
  difficultyLevel: string;
  includePersonalRecord: boolean;
  isLoading: boolean;
  streak: number;
  useClassPassives: boolean;
  selectedClass: string | null;
  totalXP: number;
  xpBreakdown: {
    timeXP: number;
    exerciseXP: number;
    setXP: number;
    difficultyMultiplier: number;
    streakMultiplier: number;
    prBonus: number;
    baseXP: number;
  };
  bonusBreakdown: Array<{skill: string, amount: number, description: string}>;
}

export const useWorkoutState = () => {
  const [state, setState] = useState<WorkoutState>({
    workoutType: 'strength',
    duration: 45,
    exerciseCount: 5,
    difficultyLevel: 'intermediario',
    includePersonalRecord: false,
    isLoading: false,
    streak: 0,
    useClassPassives: false,
    selectedClass: null,
    totalXP: 0,
    xpBreakdown: {
      timeXP: 0,
      exerciseXP: 0,
      setXP: 0,
      difficultyMultiplier: 1,
      streakMultiplier: 1,
      prBonus: 0,
      baseXP: 0
    },
    bonusBreakdown: []
  });

  // Setter functions for each state property
  const setWorkoutType = (workoutType: string) => setState(prev => ({ ...prev, workoutType }));
  const setDuration = (duration: number) => setState(prev => ({ ...prev, duration }));
  const setExerciseCount = (exerciseCount: number) => setState(prev => ({ ...prev, exerciseCount }));
  const setDifficultyLevel = (difficultyLevel: string) => setState(prev => ({ ...prev, difficultyLevel }));
  const setIncludePersonalRecord = (includePersonalRecord: boolean) => setState(prev => ({ ...prev, includePersonalRecord }));
  const setStreak = (streak: number) => setState(prev => ({ ...prev, streak }));
  const setUseClassPassives = (useClassPassives: boolean) => setState(prev => ({ ...prev, useClassPassives }));
  const setSelectedClass = (selectedClass: string | null) => setState(prev => ({ ...prev, selectedClass }));
  const setIsLoading = (isLoading: boolean) => setState(prev => ({ ...prev, isLoading }));
  const setXpBreakdown = (xpBreakdown: WorkoutState['xpBreakdown']) => setState(prev => ({ ...prev, xpBreakdown }));
  const setTotalXP = (totalXP: number) => setState(prev => ({ ...prev, totalXP }));
  const setBonusBreakdown = (bonusBreakdown: WorkoutState['bonusBreakdown']) => 
    setState(prev => ({ ...prev, bonusBreakdown }));
  const updateState = (updates: Partial<WorkoutState>) => 
    setState(prev => ({ ...prev, ...updates }));

  return {
    state,
    setWorkoutType,
    setDuration,
    setExerciseCount,
    setDifficultyLevel,
    setIncludePersonalRecord,
    setStreak,
    setUseClassPassives,
    setSelectedClass,
    setIsLoading,
    setXpBreakdown,
    setTotalXP,
    setBonusBreakdown,
    updateState
  };
};
