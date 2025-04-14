import { create } from 'zustand';

/**
 * Standardized achievement notification interface
 */
export interface AchievementNotification {
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

export const useAchievementNotificationStore = create<AchievementNotificationState>((set, get) => ({
  isVisible: false,
  currentAchievement: null,
  queue: [],
  
  showNotification: (achievement) => {
    set({ 
      isVisible: true, 
      currentAchievement: achievement 
    });
  },
  
  hideNotification: () => {
    const { queue } = get();
    
    // Process queue
    if (queue.length > 0) {
      const nextAchievement = queue[0];
      const remainingQueue = queue.slice(1);
      
      set({ 
        currentAchievement: nextAchievement, 
        queue: remainingQueue,
        isVisible: true 
      });
    } else {
      set({ 
        isVisible: false, 
        currentAchievement: null 
      });
    }
  },
  
  queueNotification: (achievement) => {
    const { isVisible, queue } = get();
    
    if (!isVisible && queue.length === 0) {
      // If no active notification, show immediately
      set({ 
        isVisible: true, 
        currentAchievement: achievement 
      });
    } else {
      // Otherwise add to queue
      set(state => ({ 
        queue: [...state.queue, achievement] 
      }));
    }
  }
}));
