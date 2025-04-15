
import { useState, useEffect } from 'react';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { AchievementTestingService } from '@/services/testing/AchievementTestingService';
import { testDataGenerator } from '@/services/testing/generators/TestDataGeneratorService';
import { toast } from 'sonner';

export function useAchievementTestState(userId: string) {
  const [testService, setTestService] = useState<AchievementTestingService | null>(null);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [selectedAchievements, setSelectedAchievements] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isDataGenerating, setIsDataGenerating] = useState(false);
  const [isDataCleaning, setIsDataCleaning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRank, setSelectedRank] = useState('all');
  
  // Initialize the test service and load achievements
  useEffect(() => {
    const initialize = async () => {
      try {
        // Create test service
        const service = new AchievementTestingService(userId);
        setTestService(service);
        
        // Load achievements
        const achievements = await AchievementUtils.getAllAchievements();
        setAllAchievements(achievements);
        
        // Expand first category by default if we have achievements
        if (achievements.length > 0) {
          const firstCategory = achievements[0].category;
          setExpandedCategories(new Set([firstCategory]));
        }
      } catch (error) {
        console.error('Error initializing achievement test state:', error);
        toast.error('Failed to initialize test runner');
      }
    };
    
    if (userId) {
      initialize();
    }
  }, [userId]);
  
  // Filter achievements based on search and filters
  const filteredAchievements = allAchievements.filter(achievement => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    
    // Filter by rank
    const matchesRank = selectedRank === 'all' || achievement.rank === selectedRank;
    
    return matchesSearch && matchesCategory && matchesRank;
  });
  
  // Group achievements by category
  const achievementsByCategory = filteredAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);
  
  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  // Toggle achievement selection
  const toggleAchievementSelection = (achievementId: string) => {
    setSelectedAchievements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(achievementId)) {
        newSet.delete(achievementId);
      } else {
        newSet.add(achievementId);
      }
      return newSet;
    });
  };
  
  // Select all visible achievements
  const selectAllVisible = () => {
    setSelectedAchievements(prev => {
      const newSet = new Set(prev);
      filteredAchievements.forEach(achievement => {
        newSet.add(achievement.id);
      });
      return newSet;
    });
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedAchievements(new Set());
  };
  
  // Generate test data
  const generateTestData = async () => {
    if (!userId) return;
    
    setIsDataGenerating(true);
    try {
      await testDataGenerator.generateStandardTestData(userId);
      toast.success('Test data generated');
    } catch (error) {
      toast.error('Error generating test data');
      console.error(error);
    } finally {
      setIsDataGenerating(false);
    }
  };
  
  // Clean up test data
  const cleanupTestData = async () => {
    if (!userId) return;
    
    setIsDataCleaning(true);
    try {
      await testDataGenerator.cleanupAllTestData(userId);
      toast.success('Test data cleaned up');
    } catch (error) {
      toast.error('Error cleaning up test data');
      console.error(error);
    } finally {
      setIsDataCleaning(false);
    }
  };
  
  return {
    testService,
    allAchievements,
    achievementsByCategory,
    expandedCategories,
    selectedAchievements,
    searchQuery,
    selectedCategory,
    selectedRank,
    filteredAchievements,
    isDataGenerating,
    isDataCleaning,
    setSearchQuery,
    setSelectedCategory,
    setSelectedRank,
    toggleCategoryExpansion,
    toggleAchievementSelection,
    selectAllVisible,
    clearSelection,
    generateTestData,
    cleanupTestData
  };
}
