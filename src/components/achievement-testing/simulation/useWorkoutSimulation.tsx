
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/rpg/XPService';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';
import { AchievementService } from '@/services/rpg/AchievementService';

interface WorkoutSimulationState {
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

interface UseWorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

export const useWorkoutSimulation = ({ userId, addLogEntry }: UseWorkoutSimulationProps) => {
  const [state, setState] = useState<WorkoutSimulationState>({
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
      
      setState(prev => ({
        ...prev,
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
      }));
      
      return result.totalXP;
    } catch (error) {
      console.error('Error calculating XP:', error);
      return 0;
    }
  };
  
  const simulateWorkout = async () => {
    if (!userId) {
      toast.error('Error', {
        description: 'Please select a test user',
      });
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const awardedXP = state.totalXP;
      
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          started_at: new Date(Date.now() - state.duration * 60 * 1000).toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: state.duration * 60
        })
        .select('id')
        .single();
      
      if (workoutError) throw workoutError;
      
      const workoutId = workoutData.id;
      
      const exercisePromises = [];
      for (let i = 0; i < state.exerciseCount; i++) {
        const { data: exercises } = await supabase
          .from('exercises')
          .select('id')
          .limit(10);
        
        if (exercises && exercises.length > 0) {
          const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
          
          exercisePromises.push(
            supabase
              .from('workout_sets')
              .insert({
                workout_id: workoutId,
                exercise_id: randomExercise.id,
                set_order: i + 1,
                weight: 20 + Math.floor(Math.random() * 80),
                reps: 8 + Math.floor(Math.random() * 8),
                completed: true,
                completed_at: new Date().toISOString()
              })
          );
        }
      }
      
      await Promise.all(exercisePromises);
      
      const metadata = {
        workoutType: state.workoutType,
        exerciseCount: state.exerciseCount,
        difficultyLevel: state.difficultyLevel,
        includePersonalRecord: state.includePersonalRecord,
        ...(state.useClassPassives ? { class: state.selectedClass } : {})
      };
      
      await XPService.awardXP(userId, awardedXP, 'workout', metadata);
      
      if (state.includePersonalRecord) {
        const { data: exercises } = await supabase
          .from('exercises')
          .select('id')
          .limit(1);
        
        if (exercises && exercises.length > 0) {
          await supabase
            .from('personal_records')
            .insert({
              user_id: userId,
              exercise_id: exercises[0].id,
              weight: 100,
              previous_weight: 80
            });
        }
      }
      
      await AchievementService.checkWorkoutAchievements(userId, workoutId);
      
      const classInfo = state.useClassPassives ? `, Class: ${state.selectedClass}` : '';
      addLogEntry(
        'Workout Simulated', 
        `Type: ${state.workoutType}, Duration: ${state.duration}min, Exercises: ${state.exerciseCount}, XP: ${awardedXP}, Streak: ${state.streak}${classInfo}`
      );
      
      toast.success('Workout Simulated!', {
        description: `${awardedXP} XP has been awarded to the user.`,
      });
      
    } catch (error) {
      console.error('Error simulating workout:', error);
      toast.error('Error', {
        description: 'Failed to simulate workout',
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

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
    simulateWorkout
  };
};
