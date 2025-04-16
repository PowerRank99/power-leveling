
import { create } from 'zustand';

interface Achievement {
  title: string;
  description: string;
  xpReward: number;
  bonusText?: string;
}

interface AchievementPopupState {
  isVisible: boolean;
  achievement: Achievement | null;
  showAchievement: (achievement: Achievement) => void;
  hideAchievement: () => void;
}

export const achievementPopupStore = create<AchievementPopupState>((set) => ({
  isVisible: false,
  achievement: null,
  showAchievement: (achievement) => set({ isVisible: true, achievement }),
  hideAchievement: () => set({ isVisible: false }),
}));
