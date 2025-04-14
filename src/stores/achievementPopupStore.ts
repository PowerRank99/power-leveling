
import { create } from 'zustand';
import { Achievement, AchievementRank } from '@/types/achievementTypes';

/**
 * Interface for achievement popup data with only required display properties
 */
export interface AchievementPopupData {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  points: number;
  rank: AchievementRank;
  metadata?: Record<string, any>;
  // These properties are not needed for display but included for type compatibility
  category?: string;
  iconName?: string;
  requirements?: any;
}

interface AchievementPopupState {
  isVisible: boolean;
  achievement: AchievementPopupData | null;
  showAchievement: (achievement: AchievementPopupData) => void;
  hideAchievement: () => void;
}

export const achievementPopupStore = create<AchievementPopupState>((set) => ({
  isVisible: false,
  achievement: null,
  showAchievement: (achievement) => set({ isVisible: true, achievement }),
  hideAchievement: () => set({ isVisible: false, achievement: null }),
}));
