
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import { AchievementDefinition } from '@/constants/achievements/AchievementSchema';
import { Achievement, AchievementCategory } from '@/types/achievementTypes';

/**
 * Service for handling achievement notifications
 */
export class AchievementNotificationService {
  /**
   * Show achievement notification
   */
  static async showAchievementNotification(achievement: AchievementDefinition): Promise<void> {
    // First show the achievement popup if a user is viewing it
    const { showAchievement } = achievementPopupStore.getState();
    
    // Convert AchievementDefinition to Achievement interface
    const popupData: Achievement = {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category || AchievementCategory.SPECIAL,
      rank: achievement.rank,
      points: achievement.points,
      xpReward: achievement.xpReward,
      iconName: achievement.iconName || 'award',
      requirements: {
        type: achievement.requirementType,
        value: achievement.requirementValue
      },
      metadata: {
        bonusText: "Excede o limite diário"
      }
    };
    
    showAchievement(popupData);
    
    // Queue it in the notification system for persistent display
    const { queueNotification } = useAchievementNotificationStore.getState();
    
    queueNotification({
      id: achievement.id,
      title: achievement.name,
      description: achievement.description,
      rank: achievement.rank,
      points: achievement.points,
      xpReward: achievement.xpReward,
      timestamp: new Date().toISOString()
    });
  }
}
