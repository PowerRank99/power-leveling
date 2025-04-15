// Create proper AchievementUtils exports

import * as AchievementDatabaseService from '@/services/common/AchievementDatabaseService';

// Export as a namespace for backward compatibility
export const AchievementUtils = {
  // Re-export all functionality from the database service
  getAllAchievements: AchievementDatabaseService.getAllAchievements,
  getAchievementById: AchievementDatabaseService.getAchievementById,
  getAchievementsByCategory: AchievementDatabaseService.getAchievementsByCategory,
  getAchievementHierarchy: AchievementDatabaseService.getAchievementHierarchy,
  getNextAchievements: AchievementDatabaseService.getNextAchievements,
  
  // Add extra utility methods that might be needed
  getAllAchievementsSync: function() {
    // If we have a cached value, return it
    if (AchievementDatabaseService.getCachedAchievements) {
      return AchievementDatabaseService.getCachedAchievements() || [];
    }
    
    // Otherwise, return an empty array and log a warning
    console.warn('Attempted to access achievements synchronously before cache was populated');
    return [];
  },
  
  clearCache: function() {
    if (AchievementDatabaseService.clearCache) {
      AchievementDatabaseService.clearCache();
    }
  }
};

// Also export individual functions for modern imports
export const {
  getAllAchievements,
  getAchievementById,
  getAchievementsByCategory,
  getAchievementHierarchy,
  getNextAchievements,
  getAllAchievementsSync,
  clearCache
} = AchievementUtils;
