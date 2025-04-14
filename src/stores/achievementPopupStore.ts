
import { create } from 'zustand';
import { Achievement } from '@/types/achievementTypes';

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
  hideAchievement: () => set({ isVisible: false, achievement: null }),
}));
