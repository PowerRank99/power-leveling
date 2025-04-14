
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementAwardService } from '@/services/rpg/achievements/services/AchievementAwardService';
import { AchievementFetchService } from '@/services/rpg/achievements/services/AchievementFetchService';
import { AchievementProcessingService } from '@/services/rpg/achievements/services/AchievementProcessingService';
import { AchievementProgressService } from '@/services/rpg/achievements/AchievementProgressService';

// Mock the dependent services
vi.mock('@/services/rpg/achievements/services/AchievementAwardService');
vi.mock('@/services/rpg/achievements/services/AchievementFetchService');
vi.mock('@/services/rpg/achievements/services/AchievementProcessingService');
vi.mock('@/services/rpg/achievements/AchievementProgressService');

describe('AchievementService', () => {
  const mockUserId = 'test-user-id';
  const mockAchievementId = 'test-achievement-id';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('awardAchievement', () => {
    it('should delegate to AchievementAwardService', async () => {
      const mockResponse = { success: true, data: true };
      vi.mocked(AchievementAwardService.awardAchievement).mockResolvedValue(mockResponse);

      const result = await AchievementService.awardAchievement(mockUserId, mockAchievementId);

      expect(AchievementAwardService.awardAchievement).toHaveBeenCalledWith(
        mockUserId,
        mockAchievementId
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkAndAwardAchievements', () => {
    it('should delegate to AchievementAwardService', async () => {
      const mockAchievementIds = ['achievement1', 'achievement2'];
      const mockResponse = { success: true, data: true };
      vi.mocked(AchievementAwardService.checkAndAwardAchievements).mockResolvedValue(mockResponse);

      const result = await AchievementService.checkAndAwardAchievements(
        mockUserId,
        mockAchievementIds
      );

      expect(AchievementAwardService.checkAndAwardAchievements).toHaveBeenCalledWith(
        mockUserId,
        mockAchievementIds
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAllAchievements', () => {
    it('should delegate to AchievementFetchService', async () => {
      const mockResponse = { success: true, data: [] };
      vi.mocked(AchievementFetchService.getAllAchievements).mockResolvedValue(mockResponse);

      const result = await AchievementService.getAllAchievements();

      expect(AchievementFetchService.getAllAchievements).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUnlockedAchievements', () => {
    it('should delegate to AchievementFetchService', async () => {
      const mockResponse = { success: true, data: [] };
      vi.mocked(AchievementFetchService.getUnlockedAchievements).mockResolvedValue(mockResponse);

      const result = await AchievementService.getUnlockedAchievements(mockUserId);

      expect(AchievementFetchService.getUnlockedAchievements).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkWorkoutAchievements', () => {
    it('should delegate to AchievementProcessingService', async () => {
      const mockWorkoutId = 'test-workout-id';
      const mockResponse = { success: true, data: [] };
      vi.mocked(AchievementProcessingService.checkWorkoutAchievements).mockResolvedValue(mockResponse);

      const result = await AchievementService.checkWorkoutAchievements(mockUserId, mockWorkoutId);

      expect(AchievementProcessingService.checkWorkoutAchievements).toHaveBeenCalledWith(
        mockUserId,
        mockWorkoutId
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateAchievementProgress', () => {
    it('should delegate to AchievementProgressService', async () => {
      const mockResponse = { success: true, data: true };
      vi.mocked(AchievementProgressService.updateProgress).mockResolvedValue(mockResponse);

      const result = await AchievementService.updateAchievementProgress(
        mockUserId,
        mockAchievementId,
        5,
        10,
        false
      );

      expect(AchievementProgressService.updateProgress).toHaveBeenCalledWith(
        mockUserId,
        mockAchievementId,
        5,
        10,
        false
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
