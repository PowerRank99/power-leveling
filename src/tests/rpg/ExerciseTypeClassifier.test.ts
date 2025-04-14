
import { describe, it, expect } from 'vitest';
import { ExerciseTypeClassifier } from '@/services/rpg/calculations/ExerciseTypeClassifier';
import { WorkoutExercise } from '@/types/workoutTypes';

describe('ExerciseTypeClassifier', () => {
  describe('exercise classification', () => {
    it('should identify Guerreiro exercises correctly', () => {
      const strengthExercise = {
        type: 'Musculação',
        name: 'Bench Press'
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isGuerreiroExercise(strengthExercise)).toBe(true);
      
      const nonStrengthExercise = {
        type: 'Cardio',
        name: 'Running'
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isGuerreiroExercise(nonStrengthExercise)).toBe(false);
    });
    
    it('should identify Monge exercises correctly', () => {
      const calisthenicExercise = {
        type: 'Calistenia',
        name: 'Pull-up'
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isMongeExercise(calisthenicExercise)).toBe(true);
      
      const bodyweightExercise = {
        type: 'Other',
        name: 'push up challenge'
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isMongeExercise(bodyweightExercise)).toBe(true);
      
      const nonBodyweightExercise = {
        type: 'Musculação',
        name: 'Bench Press'
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isMongeExercise(nonBodyweightExercise)).toBe(false);
    });
    
    it('should identify Ninja exercises correctly', () => {
      const cardioExercise = {
        type: 'Cardio',
        name: 'Running'
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isNinjaExercise(cardioExercise)).toBe(true);
      
      const hiitExercise = {
        type: 'Other',
        name: 'hiit training'
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isNinjaExercise(hiitExercise)).toBe(true);
      
      const nonCardioExercise = {
        type: 'Musculação',
        name: 'Bench Press'
      } as WorkoutExercise;
      
      expect(ExerciseTypeClassifier.isNinjaExercise(nonCardioExercise)).toBe(false);
    });
  });
  
  describe('counting exercises and sets', () => {
    it('should count qualifying exercises correctly', () => {
      const exercises = [
        { type: 'Musculação', name: 'Bench Press', id: 'ex1' } as WorkoutExercise,
        { type: 'Musculação', name: 'Squat', id: 'ex2' } as WorkoutExercise,
        { type: 'Cardio', name: 'Running', id: 'ex3' } as WorkoutExercise
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
          type: 'Musculação',
          name: 'Bench Press',
          id: 'ex1',
          sets: [
            { id: 'set1', completed: true },
            { id: 'set2', completed: true },
            { id: 'set3', completed: false }
          ]
        } as unknown as WorkoutExercise,
        {
          type: 'Musculação',
          name: 'Squat',
          id: 'ex2',
          sets: [
            { id: 'set4', completed: true },
            { id: 'set5', completed: true }
          ]
        } as unknown as WorkoutExercise,
        {
          type: 'Cardio',
          name: 'Running',
          id: 'ex3',
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
