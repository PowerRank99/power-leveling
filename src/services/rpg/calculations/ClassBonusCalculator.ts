
import { EXERCISE_TYPES } from '../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Service for calculating class-specific XP bonuses
 */
export class ClassBonusCalculator {
  /**
   * Apply class-specific bonuses to XP
   */
  static applyClassBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
    },
    userClass?: string | null,
    streak: number = 0
  ): number {
    if (!userClass) return baseXP;
    
    // Default bonus (applies to all classes)
    let totalXP = baseXP;
    let classBonus = 0;
    
    const workoutTimeMinutes = Math.floor((workout.durationSeconds || 0) / 60);
    const exerciseNames = workout.exercises.map(ex => ex.name.toLowerCase());
    
    // Apply class-specific bonuses
    switch(userClass) {
      case 'Guerreiro':
        // Check for compound lifts
        const hasCompoundLifts = exerciseNames.some(name => 
          EXERCISE_TYPES.COMPOUND_LIFTS.some(lift => name.includes(lift))
        );
        
        if (hasCompoundLifts) {
          classBonus += Math.round(baseXP * 0.20); // +20% for compound lifts
        }
        
        // General strength training bonus
        classBonus += Math.round(baseXP * 0.10); // +10% for all strength training
        break;
        
      case 'Monge':
        // Check for bodyweight exercises
        const hasBodyweight = exerciseNames.some(name => 
          EXERCISE_TYPES.BODYWEIGHT.some(bw => name.includes(bw))
        );
        
        if (hasBodyweight) {
          classBonus += Math.round(baseXP * 0.15); // +15% for bodyweight exercises
        }
        
        // Additional streak bonus (existing streak bonus + 10%)
        const streakMultiplier = this.getMongeStreakBonus(streak);
        const additionalStreakBonus = baseXP * (streakMultiplier - 1) * 0.10;
        classBonus += Math.round(additionalStreakBonus);
        break;
        
      case 'Ninja':
        // Check for cardio/HIIT
        const hasCardioHiit = exerciseNames.some(name => 
          EXERCISE_TYPES.CARDIO_HIIT.some(cardio => name.includes(cardio))
        );
        
        if (hasCardioHiit) {
          classBonus += Math.round(baseXP * 0.20); // +20% for cardio/HIIT
        }
        
        // Short workout bonus
        if (workoutTimeMinutes < 45) {
          classBonus += Math.round(baseXP * 0.15); // +15% for workouts < 45 minutes
        }
        break;
        
      case 'Bruxo':
        // Check for flexibility exercises
        const hasFlexibility = exerciseNames.some(name => 
          EXERCISE_TYPES.FLEXIBILITY.some(flex => name.includes(flex))
        );
        
        if (hasFlexibility) {
          classBonus += Math.round(baseXP * 0.20); // +20% for flexibility exercises
        }
        
        // Recovery/mobility sessions
        const hasRecovery = exerciseNames.some(name => 
          EXERCISE_TYPES.RECOVERY.some(rec => name.includes(rec))
        );
        
        if (hasRecovery) {
          classBonus += Math.round(baseXP * 0.10); // +10% for recovery sessions
        }
        break;
        
      case 'Paladino':
        // Check for sports activities
        const hasSports = exerciseNames.some(name => 
          EXERCISE_TYPES.SPORTS.some(sport => name.includes(sport))
        );
        
        if (hasSports) {
          classBonus += Math.round(baseXP * 0.15); // +15% for sports activities
        }
        
        // Long workout bonus
        if (workoutTimeMinutes > 60) {
          classBonus += Math.round(baseXP * 0.10); // +10% for workouts > 60 minutes
        }
        break;
    }
    
    return totalXP + classBonus;
  }
  
  /**
   * Helper method for Monge class to calculate streak bonus
   */
  private static getMongeStreakBonus(streak: number): number {
    const maxStreakBonus = 7;
    const bonusPerDay = 0.05;
    const streakDays = Math.min(streak, maxStreakBonus);
    return 1 + (streakDays * bonusPerDay);
  }
}
