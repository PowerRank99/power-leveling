
import { create } from 'zustand';
import { AchievementNotification } from '@/types/achievementTypes';

interface AchievementNotificationState {
  isVisible: boolean;
  queue: AchievementNotification[];
  currentAchievement: AchievementNotification | null;
  addAchievement: (achievement: AchievementNotification) => void;
  showNextAchievement: () => void;
  hideNotification: () => void;
  clearAll: () => void;
}

export const useAchievementNotificationStore = create<AchievementNotificationState>((set, get) => ({
  isVisible: false,
  queue: [],
  currentAchievement: null,
  
  addAchievement: (achievement) => {
    set((state) => {
      const newQueue = [...state.queue, achievement].sort((a, b) => {
        // Sort by rank first (S, A, B, C, D, E)
        const rankOrder = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5 };
        const rankDiff = (rankOrder[a.rank as keyof typeof rankOrder] || 6) - 
                         (rankOrder[b.rank as keyof typeof rankOrder] || 6);
        
        if (rankDiff !== 0) return rankDiff;
        
        // Then sort by timestamp (newest first)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      // If nothing is currently displayed, show the first achievement
      if (!state.isVisible && newQueue.length > 0 && !state.currentAchievement) {
        setTimeout(() => get().showNextAchievement(), 500);
      }
      
      return { queue: newQueue };
    });
  },
  
  showNextAchievement: () => {
    set((state) => {
      if (state.queue.length === 0) {
        return { isVisible: false, currentAchievement: null };
      }
      
      const [nextAchievement, ...restQueue] = state.queue;
      return {
        isVisible: true,
        currentAchievement: nextAchievement,
        queue: restQueue
      };
    });
  },
  
  hideNotification: () => {
    set({ isVisible: false });
    // Show next achievement with a small delay
    setTimeout(() => get().showNextAchievement(), 600);
  },
  
  clearAll: () => {
    set({ isVisible: false, queue: [], currentAchievement: null });
  }
}));
