import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { mapDbAchievementToModel } from '@/utils/achievementMappers';
import { ErrorCategory, createErrorResponse, createSuccessResponse } from './ErrorHandlingService';

// Cache for achievements to avoid repeated database calls
let achievementsCache: Achievement[] | null = null;
let lastCacheTime: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get all achievements from the database
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (achievementsCache && now - lastCacheTime < CACHE_DURATION_MS) {
      return achievementsCache;
    }

    // Fetch achievements from database
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true })
      .order('rank', { ascending: true });

    if (error) {
      console.error('Error fetching achievements:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Map database records to model objects
    const achievements = data.map(mapDbAchievementToModel);
    
    // Update cache
    achievementsCache = achievements;
    lastCacheTime = now;
    
    return achievements;
  } catch (error) {
    console.error('Exception in getAllAchievements:', error);
    throw error;
  }
}

/**
 * Clear the achievements cache
 */
export function clearCache(): void {
  achievementsCache = null;
  lastCacheTime = 0;
}

/**
 * Get cached achievements or null if cache is empty/expired
 */
export function getCachedAchievements(): Achievement[] | null {
  const now = Date.now();
  if (achievementsCache && now - lastCacheTime < CACHE_DURATION_MS) {
    return achievementsCache;
  }
  return null;
}

/**
 * Get achievement by ID
 */
export async function getAchievementById(id: string): Promise<Achievement | null> {
  try {
    // Try to find in cache first
    const cachedAchievements = getCachedAchievements();
    if (cachedAchievements) {
      const cachedAchievement = cachedAchievements.find(a => a.id === id);
      if (cachedAchievement) {
        return cachedAchievement;
      }
    }

    // Fetch from database if not in cache
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found error
        return null;
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return data ? mapDbAchievementToModel(data) : null;
  } catch (error) {
    console.error(`Exception in getAchievementById(${id}):`, error);
    throw error;
  }
}

/**
 * Get achievements by category
 */
export async function getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
  try {
    // Try to find in cache first
    const cachedAchievements = getCachedAchievements();
    if (cachedAchievements) {
      return cachedAchievements.filter(a => a.category === category);
    }

    // Fetch from database if not in cache
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', category)
      .order('rank', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(mapDbAchievementToModel);
  } catch (error) {
    console.error(`Exception in getAchievementsByCategory(${category}):`, error);
    throw error;
  }
}

/**
 * Get achievement hierarchy (for navigation and UI)
 */
export async function getAchievementHierarchy(): Promise<Record<AchievementCategory, Record<AchievementRank, Achievement[]>>> {
  try {
    const achievements = await getAllAchievements();
    
    // Initialize hierarchy structure
    const hierarchy: Record<AchievementCategory, Record<AchievementRank, Achievement[]>> = {} as any;
    
    // Populate with empty arrays
    Object.values(AchievementCategory).forEach(category => {
      hierarchy[category] = {} as Record<AchievementRank, Achievement[]>;
      Object.values(AchievementRank).forEach(rank => {
        hierarchy[category][rank] = [];
      });
    });
    
    // Fill with achievements
    achievements.forEach(achievement => {
      const category = achievement.category as AchievementCategory;
      const rank = achievement.rank as AchievementRank;
      
      if (hierarchy[category] && hierarchy[category][rank]) {
        hierarchy[category][rank].push(achievement);
      }
    });
    
    return hierarchy;
  } catch (error) {
    console.error('Exception in getAchievementHierarchy:', error);
    throw error;
  }
}

/**
 * Get next achievements based on current progress
 */
export async function getNextAchievements(userId: string, limit: number = 5): Promise<Achievement[]> {
  try {
    // Get all achievements
    const allAchievements = await getAllAchievements();
    
    // Get user's unlocked achievements
    const { data: unlockedData, error: unlockedError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
      
    if (unlockedError) {
      throw new Error(`Database error: ${unlockedError.message}`);
    }
    
    // Get user's in-progress achievements
    const { data: progressData, error: progressError } = await supabase
      .from('achievement_progress')
      .select('achievement_id, current_value, target_value, is_complete')
      .eq('user_id', userId)
      .not('is_complete', 'eq', true);
      
    if (progressError) {
      throw new Error(`Database error: ${progressError.message}`);
    }
    
    // Set of unlocked achievement IDs
    const unlockedIds = new Set(unlockedData.map(item => item.achievement_id));
    
    // Map of in-progress achievements
    const progressMap = new Map(
      progressData.map(item => [
        item.achievement_id, 
        { 
          currentValue: item.current_value, 
          targetValue: item.target_value,
          progress: item.current_value / item.target_value
        }
      ])
    );
    
    // Filter to achievements that are not unlocked
    const availableAchievements = allAchievements.filter(
      achievement => !unlockedIds.has(achievement.id)
    );
    
    // Sort by progress and return top N
    return availableAchievements
      .sort((a, b) => {
        // If both are in progress, sort by progress percentage
        const progressA = progressMap.get(a.id);
        const progressB = progressMap.get(b.id);
        
        if (progressA && progressB) {
          return progressB.progress - progressA.progress;
        }
        
        // If only one is in progress, prioritize it
        if (progressA) return -1;
        if (progressB) return 1;
        
        // If neither is in progress, sort by rank (lower ranks first)
        const rankOrder = { 'E': 0, 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5 };
        return (rankOrder[a.rank as keyof typeof rankOrder] || 0) - 
               (rankOrder[b.rank as keyof typeof rankOrder] || 0);
      })
      .slice(0, limit);
  } catch (error) {
    console.error(`Exception in getNextAchievements(${userId}):`, error);
    return [];
  }
}
