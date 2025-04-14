
import { describe, it, expect } from 'vitest';
import { ExerciseTypeClassifier } from '@/services/rpg/calculations/ExerciseTypeClassifier';
import { EXERCISE_TYPES } from '@/services/rpg/constants/exerciseTypes';

describe('ExerciseTypeClassifier', () => {
  describe('isGuerreiroExercise', () => {
    it('should correctly identify strength exercises', () => {
      const exercise = { 
        id: 'ex1', 
        exerciseId: 'str-1', 
        name: 'Bench Press',
        type: EXERCISE_TYPES.STRENGTH
      };
      
      expect(ExerciseTypeClassifier.isGuerreiroExercise(exercise)).toBe(true);
    });
    
    it('should reject non-strength exercises', () => {
      const exercise = { 
        id: 'ex2', 
        exerciseId: 'cardio-1', 
        name: 'Running',
        type: EXERCISE_TYPES.CARDIO
      };
      
      expect(ExerciseTypeClassifier.isGuerreiroExercise(exercise)).toBe(false);
    });
  });
  
  describe('isMongeExercise', () => {
    it('should correctly identify bodyweight exercises', () => {
      const exercise = { 
        id: 'ex3', 
        exerciseId: 'bw-1', 
        name: 'Push-ups',
        type: EXERCISE_TYPES.BODYWEIGHT
      };
      
      expect(ExerciseTypeClassifier.isMongeExercise(exercise)).toBe(true);
    });
  });
  
  describe('isNinjaExercise', () => {
    it('should correctly identify cardio and HIIT exercises', () => {
      const cardioExercise = { 
        id: 'ex4', 
        exerciseId: 'cardio-2', 
        name: 'Running',
        type: EXERCISE_TYPES.CARDIO
      };
      
      const hiitExercise = { 
        id: 'ex5', 
        exerciseId: 'hiit-1', 
        name: 'Burpees',
        type: EXERCISE_TYPES.HIIT
      };
      
      expect(ExerciseTypeClassifier.isNinjaExercise(cardioExercise)).toBe(true);
      expect(ExerciseTypeClassifier.isNinjaExercise(hiitExercise)).toBe(true);
    });
  });
  
  describe('isDruidaExercise', () => {
    it('should correctly identify mobility and flexibility exercises', () => {
      const exercise = { 
        id: 'ex6', 
        exerciseId: 'mob-1', 
        name: 'Stretching',
        type: EXERCISE_TYPES.MOBILITY
      };
      
      expect(ExerciseTypeClassifier.isDruidaExercise(exercise)).toBe(true);
    });
  });
  
  describe('isPaladinoExercise', () => {
    it('should correctly identify sport exercises', () => {
      const exercise = { 
        id: 'ex7', 
        exerciseId: 'sport-1', 
        name: 'Basketball',
        type: EXERCISE_TYPES.SPORT
      };
      
      expect(ExerciseTypeClassifier.isPaladinoExercise(exercise)).toBe(true);
    });
  });
});
