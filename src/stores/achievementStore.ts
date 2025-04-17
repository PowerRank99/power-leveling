
import { create } from 'zustand';
import { AchievementService, Achievement, AchievementStats } from '@/services/rpg/AchievementService';
import { RankService, RankData } from '@/services/rpg/RankService';

interface AchievementState {
  achievements: Achievement[];
  achievementsByRank: Record<string, Achievement[]>;
  stats: AchievementStats | null;
  rankData: RankData | null;
  rankCounts: Record<string, { total: number; unlocked: number }>;
  isLoading: boolean;
  
  // Actions
  fetchAchievements: (userId: string) => Promise<void>;
  fetchAchievementsByRank: (userId: string) => Promise<void>;
  fetchAchievementStats: (userId: string) => Promise<void>;
  fetchRankData: (userId: string) => Promise<void>;
  fetchAll: (userId: string) => Promise<void>;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: [],
  achievementsByRank: {},
  stats: null,
  rankData: null,
  rankCounts: {},
  isLoading: false,
  
  fetchAchievements: async (userId: string) => {
    try {
      set({ isLoading: true });
      const achievements = await AchievementService.getAllAchievements(userId);
      set({ achievements, isLoading: false });
    } catch (error) {
      console.error('Error fetching achievements:', error);
      set({ isLoading: false });
    }
  },
  
  fetchAchievementsByRank: async (userId: string) => {
    try {
      set({ isLoading: true });
      
      // Get all rank thresholds
      const ranks = RankService.RANK_THRESHOLDS.map(t => t.rank);
      const achievementsByRank = {};
      
      // Fetch achievements for each rank
      for (const rank of ranks) {
        const achievements = await AchievementService.getAchievementsByRank(userId, rank);
        achievementsByRank[rank] = achievements;
      }
      
      set({ achievementsByRank, isLoading: false });
    } catch (error) {
      console.error('Error fetching achievements by rank:', error);
      set({ isLoading: false });
    }
  },
  
  fetchAchievementStats: async (userId: string) => {
    try {
      set({ isLoading: true });
      const [stats, rankCounts] = await Promise.all([
        AchievementService.getAchievementStats(userId),
        AchievementService.getAchievementCountByRank(userId)
      ]);
      set({ stats, rankCounts, isLoading: false });
    } catch (error) {
      console.error('Error fetching achievement stats:', error);
      set({ isLoading: false });
    }
  },
  
  fetchRankData: async (userId: string) => {
    try {
      set({ isLoading: true });
      const rankData = await RankService.getRankData(userId);
      set({ rankData, isLoading: false });
    } catch (error) {
      console.error('Error fetching rank data:', error);
      set({ isLoading: false });
    }
  },
  
  fetchAll: async (userId: string) => {
    try {
      set({ isLoading: true });
      
      await Promise.all([
        get().fetchAchievements(userId),
        get().fetchAchievementsByRank(userId),
        get().fetchAchievementStats(userId),
        get().fetchRankData(userId)
      ]);
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Error fetching all achievement data:', error);
      set({ isLoading: false });
    }
  }
}));
