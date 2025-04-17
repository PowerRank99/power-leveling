
import { toast } from 'sonner';
import { achievementPopupStore } from '@/stores/achievementPopupStore';

export class AchievementNotificationService {
  static showAchievementNotification(
    achievementName: string,
    achievementDescription: string,
    xpReward: number
  ): void {
    // Show achievement popup using the store
    const { showAchievement } = achievementPopupStore.getState();
    showAchievement({
      title: achievementName,
      description: achievementDescription,
      xpReward: xpReward,
      bonusText: "Excede o limite diário"
    });
      
    // Also show toast notification
    toast.success(`🏆 Conquista Desbloqueada!`, {
      description: `${achievementName} (+${xpReward} XP)`
    });
  }
}
