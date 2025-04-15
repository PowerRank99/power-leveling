
// This file now re-exports from the unified AchievementService
export { 
  getAllAchievements,
  getAchievementsByCategory,
  getAchievementById,
  getAchievementHierarchy,
  getNextAchievements
} from '@/services/common/AchievementDatabaseService';
