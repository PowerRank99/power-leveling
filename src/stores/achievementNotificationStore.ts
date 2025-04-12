
import { create } from 'zustand';

export interface AchievementNotification {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'Unranked';
  bonusText?: string;
  points: number;
  iconName: string;
  timestamp: string;
}

interface AchievementNotificationStore {
  isVisible: boolean;
  queue: AchievementNotification[];
  currentAchievement: AchievementNotification | null;
  addNotification: (achievement: AchievementNotification) => void;
  hideNotification: () => void;
}

export const useAchievementNotificationStore = create<AchievementNotificationStore>((set, get) => ({
  isVisible: false,
  queue: [],
  currentAchievement: null,
  
  addNotification: (achievement) => {
    const { isVisible, queue } = get();
    
    if (isVisible || queue.length > 0) {
      // Add to queue if a notification is already showing
      set((state) => ({
        queue: [...state.queue, achievement]
      }));
    } else {
      // Show immediately if no notification is active
      set({
        isVisible: true,
        currentAchievement: achievement
      });
    }
  },
  
  hideNotification: () => {
    const { queue } = get();
    
    if (queue.length > 0) {
      // Show next notification in queue
      const nextQueue = [...queue];
      const nextAchievement = nextQueue.shift();
      
      set({
        queue: nextQueue,
        currentAchievement: nextAchievement,
        isVisible: true
      });
    } else {
      // No more notifications, hide
      set({
        isVisible: false,
        currentAchievement: null
      });
    }
  }
}));
