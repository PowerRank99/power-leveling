
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Service responsible for XP calculations and constants
 */
export class XPCalculationService {
  // XP system constants
  static readonly DAILY_XP_CAP = 300;
  static readonly BASE_TIME_XP_RATE = 10; // XP per 10 minutes
  static readonly BASE_EXERCISE_XP = 5; // XP per exercise
  static readonly BASE_SET_XP = 2; // XP per set
  static readonly PR_BONUS_XP = 50; // Bonus XP for personal records
  
  // Difficulty multipliers
  static readonly DIFFICULTY_MULTIPLIERS = {
    iniciante: 0.8,
    intermediario: 1.0,
    avancado: 1.5,
  };
  
  // Exercise types for class bonus calculations
  static readonly EXERCISE_TYPES = {
    COMPOUND_LIFTS: ['squat', 'deadlift', 'bench press', 'agachamento', 'levantamento terra', 'supino'],
    BODYWEIGHT: ['push-up', 'pull-up', 'dip', 'flexão', 'barra', 'paralela', 'bodyweight', 'calistenia'],
    CARDIO_HIIT: ['run', 'sprint', 'jog', 'cycle', 'cardio', 'hiit', 'corrida', 'ciclismo', 'bicicleta', 'intervalo'],
    FLEXIBILITY: ['yoga', 'stretch', 'mobility', 'flexibility', 'alongamento', 'mobilidade', 'flexibilidade'],
    RECOVERY: ['foam roll', 'massage', 'recovery', 'recuperação', 'massagem', 'mobilidade'],
    SPORTS: ['soccer', 'basketball', 'volleyball', 'tennis', 'futebol', 'basquete', 'vôlei', 'tênis', 'esporte']
  };
  
  /**
   * Calculate the streak multiplier (5% per day up to 35% at 7 days)
   */
  static getStreakMultiplier(streak: number): number {
    const maxStreakBonus = 7;
    const bonusPerDay = 0.05;
    const streakDays = Math.min(streak, maxStreakBonus);
    return 1 + (streakDays * bonusPerDay);
  }
  
  /**
   * Calculate XP for a completed workout
   * @param workout Workout data
   * @param userClass User's selected class
   * @param streak Current workout streak
   * @param difficulty Workout difficulty level
   */
  static calculateWorkoutXP(
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      difficulty?: 'iniciante' | 'intermediario' | 'avancado'
    },
    userClass?: string | null,
    streak: number = 0,
    difficulty: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario'
  ): number {
    try {
      // Base XP calculation
      const timeMinutes = Math.floor((workout.durationSeconds || 0) / 60);
      const baseTimeXP = Math.floor(timeMinutes / 10) * this.BASE_TIME_XP_RATE; // 10 XP per 10 minutes
      const exerciseXP = workout.exercises.length * this.BASE_EXERCISE_XP; // 5 XP per exercise
      
      // Calculate sets XP
      const completedSets = workout.exercises.reduce((sum, ex) => {
        return sum + ex.sets.filter(set => set.completed).length;
      }, 0);
      const setsXP = completedSets * this.BASE_SET_XP; // 2 XP per completed set
      
      // Sum base XP
      let totalXP = baseTimeXP + exerciseXP + setsXP;
      
      // Apply difficulty modifier if available
      const workoutDifficulty = workout.difficulty || difficulty;
      if (workoutDifficulty in this.DIFFICULTY_MULTIPLIERS) {
        totalXP = Math.round(totalXP * this.DIFFICULTY_MULTIPLIERS[workoutDifficulty as keyof typeof this.DIFFICULTY_MULTIPLIERS]);
      }
      
      // Apply class-specific bonuses
      totalXP = this.applyClassBonuses(totalXP, workout, userClass, streak);
      
      // Cap at daily maximum
      return Math.min(totalXP, this.DAILY_XP_CAP);
    } catch (error) {
      console.error('Error calculating workout XP:', error);
      return 50; // Default XP on error
    }
  }
  
  /**
   * Apply class-specific bonuses to XP
   */
  private static applyClassBonuses(
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
          this.EXERCISE_TYPES.COMPOUND_LIFTS.some(lift => name.includes(lift))
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
          this.EXERCISE_TYPES.BODYWEIGHT.some(bw => name.includes(bw))
        );
        
        if (hasBodyweight) {
          classBonus += Math.round(baseXP * 0.15); // +15% for bodyweight exercises
        }
        
        // Additional streak bonus (existing streak bonus + 10%)
        const streakMultiplier = this.getStreakMultiplier(streak);
        const additionalStreakBonus = baseXP * (streakMultiplier - 1) * 0.10;
        classBonus += Math.round(additionalStreakBonus);
        break;
        
      case 'Ninja':
        // Check for cardio/HIIT
        const hasCardioHiit = exerciseNames.some(name => 
          this.EXERCISE_TYPES.CARDIO_HIIT.some(cardio => name.includes(cardio))
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
          this.EXERCISE_TYPES.FLEXIBILITY.some(flex => name.includes(flex))
        );
        
        if (hasFlexibility) {
          classBonus += Math.round(baseXP * 0.20); // +20% for flexibility exercises
        }
        
        // Recovery/mobility sessions
        const hasRecovery = exerciseNames.some(name => 
          this.EXERCISE_TYPES.RECOVERY.some(rec => name.includes(rec))
        );
        
        if (hasRecovery) {
          classBonus += Math.round(baseXP * 0.10); // +10% for recovery sessions
        }
        break;
        
      case 'Paladino':
        // Check for sports activities
        const hasSports = exerciseNames.some(name => 
          this.EXERCISE_TYPES.SPORTS.some(sport => name.includes(sport))
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
}
