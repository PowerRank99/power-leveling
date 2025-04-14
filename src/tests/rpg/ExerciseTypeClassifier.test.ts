
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
        type: 'Musculação',
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
      };
      
      expect(ExerciseTypeClassifier.isGuerreiroExercise(exercise)).toBe(true);
    });
    
    it('should reject non-strength exercises', () => {
      const exercise = { 
        id: 'ex2', 
        exerciseId: 'cardio-1', 
        name: 'Running',
        type: 'Cardio',
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
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
        type: 'Calistenia',
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
      };
      
      expect(ExerciseTypeClassifier.isMongeExercise(exercise)).toBe(true);
    });
    
    it('should identify exercises by name even if type is different', () => {
      const exercise = { 
        id: 'ex3b', 
        exerciseId: 'bw-2', 
        name: 'pullup advanced',
        type: 'Other', // Not calistenia, but name contains a bodyweight keyword
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
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
        type: 'Cardio',
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
      };
      
      const hiitExercise = { 
        id: 'ex5', 
        exerciseId: 'hiit-1', 
        name: 'Burpees',
        type: 'HIIT',
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
      };
      
      expect(ExerciseTypeClassifier.isNinjaExercise(cardioExercise)).toBe(true);
      expect(ExerciseTypeClassifier.isNinjaExercise(hiitExercise)).toBe(true);
    });
    
    it('should identify exercises by name keywords', () => {
      const exercise = { 
        id: 'ex6', 
        exerciseId: 'run-1', 
        name: 'sprint interval',
        type: 'Other', // Not cardio/HIIT by type, but name contains keywords
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
      };
      
      expect(ExerciseTypeClassifier.isNinjaExercise(exercise)).toBe(true);
    });
  });
  
  describe('isDruidaExercise', () => {
    it('should correctly identify mobility and flexibility exercises', () => {
      const exercise = { 
        id: 'ex6', 
        exerciseId: 'mob-1', 
        name: 'Stretching',
        type: 'Flexibilidade & Mobilidade',
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
      };
      
      expect(ExerciseTypeClassifier.isDruidaExercise(exercise)).toBe(true);
    });
    
    it('should identify exercises by name keywords', () => {
      const exercise = { 
        id: 'ex7', 
        exerciseId: 'yoga-1', 
        name: 'yoga flow',
        type: 'Other', // Not mobility by type, but name contains keywords
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
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
        type: 'Esportes',
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
      };
      
      expect(ExerciseTypeClassifier.isPaladinoExercise(exercise)).toBe(true);
    });
    
    it('should identify exercises by name keywords', () => {
      const exercise = { 
        id: 'ex8', 
        exerciseId: 'tennis-1', 
        name: 'tennis match',
        type: 'Other', // Not sport by type, but name contains keywords
        sets: [] // Add empty sets array to satisfy WorkoutExercise type
      };
      
      expect(ExerciseTypeClassifier.isPaladinoExercise(exercise)).toBe(true);
    });
  });
  
  describe('counting functions', () => {
    it('should correctly count qualifying exercises', () => {
      const exercises = [
        { id: 'ex1', exerciseId: 'str-1', name: 'Bench Press', type: 'Musculação', sets: [] },
        { id: 'ex2', exerciseId: 'cardio-1', name: 'Running', type: 'Cardio', sets: [] },
        { id: 'ex3', exerciseId: 'str-2', name: 'Squat', type: 'Musculação', sets: [] }
      ];
      
      const count = ExerciseTypeClassifier.countQualifyingExercises(
        exercises,
        ExerciseTypeClassifier.isGuerreiroExercise
      );
      
      expect(count).toBe(2); // Two strength exercises
    });
    
    it('should correctly count qualifying sets', () => {
      const exercises = [
        { 
          id: 'ex1', 
          exerciseId: 'str-1', 
          name: 'Bench Press', 
          type: 'Musculação', 
          sets: [
            { id: 'set1', weight: '50', reps: '10', completed: true },
            { id: 'set2', weight: '50', reps: '10', completed: false }
          ] 
        },
        { 
          id: 'ex2', 
          exerciseId: 'str-2', 
          name: 'Squat', 
          type: 'Musculação', 
          sets: [
            { id: 'set3', weight: '70', reps: '8', completed: true },
            { id: 'set4', weight: '70', reps: '8', completed: true }
          ] 
        }
      ];
      
      const count = ExerciseTypeClassifier.countQualifyingSets(
        exercises,
        ExerciseTypeClassifier.isGuerreiroExercise
      );
      
      expect(count).toBe(3); // Three completed sets in qualifying exercises
    });
  });
});

