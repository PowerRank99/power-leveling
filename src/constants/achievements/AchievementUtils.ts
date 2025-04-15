
import * as AchievementDatabaseService from '@/services/common/AchievementDatabaseService';

// Export directly to avoid issues with default exports
export const getAllAchievements = AchievementDatabaseService.getAllAchievements;
export const getAchievementById = AchievementDatabaseService.getAchievementById;
export const getAchievementsByCategory = AchievementDatabaseService.getAchievementsByCategory;
export const getAchievementHierarchy = AchievementDatabaseService.getAchievementHierarchy;
export const getNextAchievements = AchievementDatabaseService.getNextAchievements;
export const getAllAchievementsSync = () => {
  if (AchievementDatabaseService.getCachedAchievements) {
    return AchievementDatabaseService.getCachedAchievements() || [];
  }
  console.warn('Attempted to access achievements synchronously before cache was populated');
  return [];
};
export const clearCache = () => {
  if (AchievementDatabaseService.clearCache) {
    AchievementDatabaseService.clearCache();
  }
};

// Export as a namespace for backward compatibility
export const AchievementUtils = {
  getAllAchievements,
  getAchievementById,
  getAchievementsByCategory,
  getAchievementHierarchy,
  getNextAchievements,
  getAllAchievementsSync,
  clearCache
};
