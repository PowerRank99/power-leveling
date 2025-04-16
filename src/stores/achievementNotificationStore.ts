/**
 * This is a placeholder file for the removed achievement notification system.
 */

import { create } from 'zustand';

interface AchievementNotification {
  id: string;
  title: string;
  description: string;
  rank: string;
  points: number;
  xpReward: number;
  bonusText?: string;
  timestamp: string;
}

interface AchievementNotificationState {
  isVisible: boolean;
  currentAchievement: AchievementNotification | null;
  queue: AchievementNotification[];
  showNotification: (achievement: AchievementNotification) => void;
  hideNotification: () => void;
  queueNotification: (achievement: AchievementNotification) => void;
}

export const useAchievementNotificationStore = create<AchievementNotificationState>(() => ({
  isVisible: false,
  currentAchievement: null,
  queue: [],
  showNotification: () => {},
  hideNotification: () => {},
  queueNotification: () => {}
}));
