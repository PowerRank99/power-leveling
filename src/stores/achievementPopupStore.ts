
/**
 * This is a placeholder file for the removed achievement popup system.
 */

import { create } from 'zustand';
import { Achievement } from '@/types/achievementTypes';

interface AchievementPopupState {
  isVisible: boolean;
  achievement: Achievement | null;
  showAchievement: (achievement: Achievement) => void;
  hideAchievement: () => void;
}

export const achievementPopupStore = create<AchievementPopupState>(() => ({
  isVisible: false,
  achievement: null,
  showAchievement: () => {},
  hideAchievement: () => {}
}));
