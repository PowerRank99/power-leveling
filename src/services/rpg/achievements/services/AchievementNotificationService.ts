
import { achievementPopupStore, AchievementPopupData } from '@/stores/achievementPopupStore';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import { AchievementDefinition } from '@/constants/achievements/AchievementSchema';

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
    
    const popupData: AchievementPopupData = {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      xpReward: achievement.xpReward,
      points: achievement.points,
      rank: achievement.rank,
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
