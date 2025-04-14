
import { describe, it, expect } from 'vitest';
import { ExerciseTypeClassifier } from '@/services/rpg/calculations/ExerciseTypeClassifier';
import { WorkoutExercise } from '@/types/workoutTypes';

describe('ExerciseTypeClassifier', () => {
  describe('exercise classification', () => {
    it('should identify Guerreiro exercises correctly', () => {
      const strengthExercise = {
        id: 'ex1',
        exerciseId: 'ex1',
        name: 'Bench Press',
        type: 'Musculação',
        sets: []
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isGuerreiroExercise(strengthExercise)).toBe(true);
      
      const nonStrengthExercise = {
        id: 'ex2',
        exerciseId: 'ex2',
        name: 'Running',
        type: 'Cardio',
        sets: []
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isGuerreiroExercise(nonStrengthExercise)).toBe(false);
    });
    
    it('should identify Monge exercises correctly', () => {
      const calisthenicExercise = {
        id: 'ex3',
        exerciseId: 'ex3',
        name: 'Pull-up',
        type: 'Calistenia',
        sets: []
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isMongeExercise(calisthenicExercise)).toBe(true);
      
      const bodyweightExercise = {
        id: 'ex4',
        exerciseId: 'ex4',
        name: 'push up challenge',
        type: 'Other',
        sets: []
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isMongeExercise(bodyweightExercise)).toBe(true);
      
      const nonBodyweightExercise = {
        id: 'ex5',
        exerciseId: 'ex5',
        name: 'Bench Press',
        type: 'Musculação',
        sets: []
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isMongeExercise(nonBodyweightExercise)).toBe(false);
    });
    
    it('should identify Ninja exercises correctly', () => {
      const cardioExercise = {
        id: 'ex6',
        exerciseId: 'ex6',
        name: 'Running',
        type: 'Cardio',
        sets: []
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isNinjaExercise(cardioExercise)).toBe(true);
      
      const hiitExercise = {
        id: 'ex7',
        exerciseId: 'ex7',
        name: 'hiit training',
        type: 'Other',
        sets: []
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isNinjaExercise(hiitExercise)).toBe(true);
      
      const nonCardioExercise = {
        id: 'ex8',
        exerciseId: 'ex8',
        name: 'Bench Press',
        type: 'Musculação',
        sets: []
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isNinjaExercise(nonCardioExercise)).toBe(false);
    });
  });
  
  describe('counting exercises and sets', () => {
    it('should count qualifying exercises correctly', () => {
      const exercises = [
        { id: 'ex1', exerciseId: 'ex1', name: 'Bench Press', type: 'Musculação', sets: [] } as WorkoutExercise,
        { id: 'ex2', exerciseId: 'ex2', name: 'Squat', type: 'Musculação', sets: [] } as WorkoutExercise,
        { id: 'ex3', exerciseId: 'ex3', name: 'Running', type: 'Cardio', sets: [] } as WorkoutExercise
      ];
      
      const guerreiroCount = ExerciseTypeClassifier.countQualifyingExercises(
        exercises,
        ExerciseTypeClassifier.isGuerreiroExercise
      );
      
      expect(guerreiroCount).toBe(2);
      
      const ninjaCount = ExerciseTypeClassifier.countQualifyingExercises(
        exercises,
        ExerciseTypeClassifier.isNinjaExercise
      );
      
      expect(ninjaCount).toBe(1);
    });
    
    it('should count qualifying sets correctly', () => {
      const exercises = [
        {
          id: 'ex1',
          exerciseId: 'ex1',
          name: 'Bench Press',
          type: 'Musculação',
          sets: [
            { id: 'set1', completed: true },
            { id: 'set2', completed: true },
            { id: 'set3', completed: false }
          ]
        } as unknown as WorkoutExercise,
        {
          id: 'ex2',
          exerciseId: 'ex2',
          name: 'Squat',
          type: 'Musculação',
          sets: [
            { id: 'set4', completed: true },
            { id: 'set5', completed: true }
          ]
        } as unknown as WorkoutExercise,
        {
          id: 'ex3',
          exerciseId: 'ex3',
          name: 'Running',
          type: 'Cardio',
          sets: [
            { id: 'set6', completed: true }
          ]
        } as unknown as WorkoutExercise
      ];
      
      const guerreiroSets = ExerciseTypeClassifier.countQualifyingSets(
        exercises,
        ExerciseTypeClassifier.isGuerreiroExercise
      );
      
      // 2 completed sets from Bench Press + 2 completed sets from Squat
      expect(guerreiroSets).toBe(4);
      
      const ninjaSets = ExerciseTypeClassifier.countQualifyingSets(
        exercises,
        ExerciseTypeClassifier.isNinjaExercise
      );
      
      // 1 completed set from Running
      expect(ninjaSets).toBe(1);
    });
  });
});
