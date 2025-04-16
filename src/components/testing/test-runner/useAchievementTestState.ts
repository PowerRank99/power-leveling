
import { useState, useEffect, useMemo } from 'react';
import { AchievementTestingService } from '@/services/testing/AchievementTestingService';
import { AchievementCategory, AchievementRank, Achievement } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { toast } from 'sonner';
import { testDataGenerator } from '@/services/testing/generators/TestDataGeneratorService';

export const useAchievementTestState = (userId: string) => {
  const [testService, setTestService] = useState<AchievementTestingService | null>(null);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRank, setSelectedRank] = useState('all');
  const [selectedAchievements, setSelectedAchievements] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isDataGenerating, setIsDataGenerating] = useState(false);
  const [isDataCleaning, setIsDataCleaning] = useState(false);
  
  // Initialize
  useEffect(() => {
    const initialize = async () => {
      if (userId) {
        // Create testing service
        const service = new AchievementTestingService(userId);
        setTestService(service);
        
        // Load achievements
        try {
          const achievements = await AchievementUtils.getAllAchievements();
          setAllAchievements(achievements);
          
          // Expand the first category by default
          if (achievements.length > 0) {
            const categories = new Set<string>();
            categories.add(achievements[0].category);
            setExpandedCategories(categories);
          }
        } catch (error) {
          console.error('Error loading achievements:', error);
          toast.error('Failed to load achievements');
        }
      }
    };
    
    initialize();
  }, [userId]);
  
  // Filter achievements based on search and category/rank filters
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter(achievement => {
      // Match search query
      const matchesSearch = 
        searchQuery === '' || 
        achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Match category
      const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
      
      // Match rank
      const matchesRank = selectedRank === 'all' || achievement.rank === selectedRank;
      
      return matchesSearch && matchesCategory && matchesRank;
    });
  }, [allAchievements, searchQuery, selectedCategory, selectedRank]);
  
  // Group achievements by category for display
  const achievementsByCategory = useMemo(() => {
    const result: Record<string, Achievement[]> = {};
    
    filteredAchievements.forEach(achievement => {
      if (!result[achievement.category]) {
        result[achievement.category] = [];
      }
      result[achievement.category].push(achievement);
    });
    
    return result;
  }, [filteredAchievements]);
  
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
      toast.success('Test data generated successfully');
    } catch (error) {
      console.error('Error generating test data:', error);
      toast.error('Failed to generate test data');
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
      toast.success('Test data cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up test data:', error);
      toast.error('Failed to clean up test data');
    } finally {
      setIsDataCleaning(false);
    }
  };
  
  return {
    testService,
    allAchievements,
    searchQuery,
    selectedCategory,
    selectedRank,
    selectedAchievements,
    expandedCategories,
    achievementsByCategory,
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
};
