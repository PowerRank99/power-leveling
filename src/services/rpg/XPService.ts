
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRPGData, RPGClassName } from '@/types/rpgTypes';
import { toast } from 'sonner';

// XP thresholds for each level (indexed by level - 1)
const XP_THRESHOLDS = [
  0,      // Level 1 (index 0)
  1000,   // Level 2
  2500,   // Level 3
  4500,   // Level 4
  7000,   // Level 5
  10000,  // Level 6
  14000,  // Level 7
  19000,  // Level 8
  25000,  // Level 9
  32000,  // Level 10
  40000,  // Level 11
  50000,  // Level 12
  65000,  // Level 13
  85000,  // Level 14
  110000, // Level 15
  140000, // Level 16
  175000, // Level 17
  220000, // Level 18
  270000, // Level 19
  330000  // Level 20
];

// XP calculation constants
const BASE_WORKOUT_XP = 100;
const XP_PER_SET = 10;
const XP_PER_MINUTE = 5;

/**
 * Calculate XP from completed workout data
 */
export const calculateWorkoutXP = async (
  workoutId: string,
  userClass: RPGClassName | null,
  streak: number
): Promise<WorkoutRPGData> => {
  try {
    // Fetch workout data
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('*, workout_sets(*)')
      .eq('id', workoutId)
      .single();
      
    if (workoutError || !workout) {
      throw new Error('Failed to fetch workout data');
    }
    
    // Calculate base XP
    const completedSets = workout.workout_sets.filter((set) => set.completed).length;
    const workoutDuration = workout.duration_seconds || 0;
    const workoutMinutes = Math.floor(workoutDuration / 60);
    
    let baseXP = BASE_WORKOUT_XP;
    baseXP += completedSets * XP_PER_SET;
    baseXP += workoutMinutes * XP_PER_MINUTE;
    
    // Calculate bonuses
    const streakMultiplier = calculateStreakMultiplier(streak);
    const streakBonus = Math.floor(baseXP * (streakMultiplier - 1));
    
    const classBonus = userClass ? 
      await getClassBonus(baseXP, userClass, 'strength') : 0;

    // For now, no achievement bonus during workout completion
    const achievementBonus = 0;
    
    // Calculate total XP
    const totalBonus = streakBonus + classBonus + achievementBonus;
    const totalXP = baseXP + totalBonus;
    
    return {
      baseXP,
      bonuses: {
        streakBonus,
        classBonus,
        achievementBonus,
        totalBonus
      },
      totalXP,
      achievements: [],
      levelUp: false
    };
  } catch (error) {
    console.error('Error calculating workout XP:', error);
    return {
      baseXP: BASE_WORKOUT_XP,
      bonuses: {
        streakBonus: 0,
        classBonus: 0,
        achievementBonus: 0,
        totalBonus: 0
      },
      totalXP: BASE_WORKOUT_XP,
      achievements: [],
      levelUp: false
    };
  }
};

/**
 * Calculate streak multiplier based on consecutive workout days
 */
export const calculateStreakMultiplier = (streak: number): number => {
  if (streak <= 0) return 1.0;  // No bonus
  if (streak < 3) return 1.1;   // 10% bonus
  if (streak < 7) return 1.15;  // 15% bonus
  if (streak < 14) return 1.2;  // 20% bonus
  if (streak < 30) return 1.25; // 25% bonus
  return 1.3;                  // 30% bonus for 30+ day streak
};

/**
 * Get XP bonus from user class
 */
export const getClassBonus = async (
  baseXP: number, 
  className: RPGClassName, 
  bonusType: string
): Promise<number> => {
  try {
    const { data: bonuses, error } = await supabase
      .from('class_bonuses')
      .select('bonus_value')
      .eq('class_name', className)
      .eq('bonus_type', bonusType)
      .single();
      
    if (error || !bonuses) {
      return 0;
    }
    
    return Math.floor(baseXP * (bonuses.bonus_value / 100));
  } catch (error) {
    console.error('Error fetching class bonus:', error);
    return 0;
  }
};

/**
 * Determine level based on XP thresholds
 */
export const getLevelFromXP = (xp: number): number => {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1; // Minimum level
};

/**
 * Get XP threshold for a given level
 */
export const getXPRequiredForLevel = (level: number): number => {
  if (level <= 1) return 0;
  if (level > XP_THRESHOLDS.length) {
    return XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  }
  return XP_THRESHOLDS[level - 1];
};

/**
 * Get XP needed for the next level
 */
export const getXPForNextLevel = (currentXP: number): number => {
  const currentLevel = getLevelFromXP(currentXP);
  return getXPRequiredForLevel(currentLevel + 1);
};

/**
 * Update user XP and check for level up
 */
export const updateUserXP = async (
  userId: string, 
  xpToAdd: number
): Promise<{ success: boolean, levelUp: boolean, newLevel?: number }> => {
  try {
    // Get current user XP and level
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile) {
      throw new Error('Failed to fetch user profile');
    }
    
    const currentXP = profile.xp || 0;
    const currentLevel = profile.level || 1;
    
    const newXP = currentXP + xpToAdd;
    const newLevel = getLevelFromXP(newXP);
    const levelUp = newLevel > currentLevel;
    
    // Update user XP and level in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      throw new Error('Failed to update user XP');
    }
    
    if (levelUp) {
      toast.success(`Nível aumentado!`, {
        description: `Você alcançou o nível ${newLevel}!`
      });
    }
    
    return { 
      success: true, 
      levelUp,
      newLevel: levelUp ? newLevel : undefined 
    };
  } catch (error) {
    console.error('Error updating user XP:', error);
    return { success: false, levelUp: false };
  }
};
