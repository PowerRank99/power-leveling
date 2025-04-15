
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { CachingService } from './CachingService';
import { mapDbAchievementToModel } from '@/utils/achievementMappers';

// Constants for caching
const CACHE_KEY_ALL = 'achievements:all';
const CACHE_KEY_PREFIX_BY_ID = 'achievements:id:';
const CACHE_KEY_PREFIX_BY_CATEGORY = 'achievements:category:';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// In-memory cache
let achievementsCache: Achievement[] | null = null;
const categoryCache = new Map<AchievementCategory, Achievement[]>();

/**
 * Get all achievements from the database with caching
 */
export async function getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
  try {
    // Check memory cache first
    if (achievementsCache) {
      return createSuccessResponse(achievementsCache);
    }

    // Check persistent cache
    const cached = CachingService.get<Achievement[]>(CACHE_KEY_ALL);
    if (cached) {
      achievementsCache = cached;
      return createSuccessResponse(cached);
    }

    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('rank', { ascending: false });
      
    if (error) throw error;
    
    const achievements = data.map(achievement => mapDbAchievementToModel(achievement));
    
    // Update both caches
    CachingService.set(CACHE_KEY_ALL, achievements, CACHE_DURATION_MS);
    achievementsCache = achievements;
    
    return createSuccessResponse(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return createErrorResponse(
      'Failed to fetch achievements',
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCategory.DATABASE
    );
  }
}

/**
 * Get achievements by category
 */
export async function getAchievementsByCategory(
  category: AchievementCategory
): Promise<ServiceResponse<Achievement[]>> {
  try {
    // Check category cache first
    const cachedCategory = categoryCache.get(category);
    if (cachedCategory) return createSuccessResponse(cachedCategory);

    const cacheKey = `${CACHE_KEY_PREFIX_BY_CATEGORY}${category}`;
    const cached = CachingService.get<Achievement[]>(cacheKey);
    if (cached) {
      categoryCache.set(category, cached);
      return createSuccessResponse(cached);
    }

    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', category)
      .order('rank', { ascending: false });
      
    if (error) throw error;
    
    const achievements = data.map(achievement => mapDbAchievementToModel(achievement));
    
    // Update both caches
    CachingService.set(cacheKey, achievements, CACHE_DURATION_MS);
    categoryCache.set(category, achievements);
    
    return createSuccessResponse(achievements);
  } catch (error) {
    console.error('Error fetching achievements by category:', error);
    return createErrorResponse(
      'Failed to fetch achievements by category',
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCategory.DATABASE
    );
  }
}

/**
 * Get achievement by ID
 */
export async function getAchievementById(id: string): Promise<ServiceResponse<Achievement | null>> {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX_BY_ID}${id}`;
    const cached = CachingService.get<Achievement>(cacheKey);
    if (cached) return createSuccessResponse(cached);
    
    // First try to find in the all achievements cache
    const allCached = CachingService.get<Achievement[]>(CACHE_KEY_ALL);
    if (allCached) {
      const found = allCached.find(a => a.id === id);
      if (found) {
        CachingService.set(cacheKey, found, CACHE_DURATION_MS);
        return createSuccessResponse(found);
      }
    }

    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) throw error;
    if (!data) return createSuccessResponse(null);
    
    const achievement = mapDbAchievementToModel(data);
    
    CachingService.set(cacheKey, achievement, CACHE_DURATION_MS);
    
    return createSuccessResponse(achievement);
  } catch (error) {
    console.error(`Error fetching achievement by ID ${id}:`, error);
    return createErrorResponse(
      'Failed to fetch achievement by ID',
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCategory.DATABASE
    );
  }
}

/**
 * Get achievement hierarchy by rank and category
 */
export async function getAchievementHierarchy(): Promise<ServiceResponse<Record<AchievementRank, Record<AchievementCategory, Achievement[]>>>> {
  try {
    const { data: achievements } = await getAllAchievements();
    
    const hierarchy: Record<AchievementRank, Record<AchievementCategory, Achievement[]>> = {} as any;
    
    achievements.forEach(achievement => {
      if (!hierarchy[achievement.rank]) {
        hierarchy[achievement.rank] = {} as Record<AchievementCategory, Achievement[]>;
      }
      if (!hierarchy[achievement.rank][achievement.category]) {
        hierarchy[achievement.rank][achievement.category] = [];
      }
      hierarchy[achievement.rank][achievement.category].push(achievement);
    });
    
    return createSuccessResponse(hierarchy);
  } catch (error) {
    console.error('Error creating achievement hierarchy:', error);
    return createErrorResponse(
      'Failed to create achievement hierarchy',
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCategory.PROCESSING
    );
  }
}

/**
 * Get next (unlocked) achievements for a user
 */
export async function getNextAchievements(
  userId: string, 
  category?: AchievementCategory
): Promise<ServiceResponse<Achievement[]>> {
  try {
    const { data: unlockedIds } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
    
    const { data: allAchievements } = await getAllAchievements();
    const unlockedSet = new Set(unlockedIds?.map(ua => ua.achievement_id));
    
    const nextAchievements = allAchievements.filter(a => 
      !unlockedSet.has(a.id) && 
      (!category || a.category === category)
    );
    
    return createSuccessResponse(nextAchievements);
  } catch (error) {
    console.error('Error fetching next achievements:', error);
    return createErrorResponse(
      'Failed to fetch next achievements',
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCategory.DATABASE
    );
  }
}

/**
 * Clear the achievement cache
 */
export function clearAchievementCache(): void {
  CachingService.clear(CACHE_KEY_ALL);
  CachingService.clearCategory(CACHE_KEY_PREFIX_BY_ID);
  CachingService.clearCategory(CACHE_KEY_PREFIX_BY_CATEGORY);
  achievementsCache = null;
  categoryCache.clear();
}
