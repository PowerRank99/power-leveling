
import { useState, useEffect } from 'react';
import { AchievementTestingService, AchievementTestResult } from '@/services/testing/AchievementTestingService';
import { Achievement } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

export function useAchievementTestState(userId: string) {
  const [testService, setTestService] = useState<AchievementTestingService | null>(null);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedAchievements, setSelectedAchievements] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRank, setSelectedRank] = useState('all');

  // Initialize test service
  useEffect(() => {
    if (userId) {
      const service = new AchievementTestingService(userId);
      setTestService(service);
      
      // Fetch all achievements
      const achievements = AchievementUtils.getAllAchievements()
        .map(def => AchievementUtils.convertToAchievement(def));
      setAllAchievements(achievements);
      
      // Expand first category by default
      if (achievements.length > 0) {
        const firstCategory = achievements[0].category;
        setExpandedCategories(new Set([firstCategory]));
      }
    }
  }, [userId]);

  const filteredAchievements = allAchievements.filter(achievement => {
    const matchesSearch = searchQuery === '' || 
      achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRank = selectedRank === 'all' || achievement.rank === selectedRank;
    
    return matchesSearch && matchesCategory && matchesRank;
  });

  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleAchievementSelection = (achievementId: string) => {
    const newSelected = new Set(selectedAchievements);
    if (newSelected.has(achievementId)) {
      newSelected.delete(achievementId);
    } else {
      newSelected.add(achievementId);
    }
    setSelectedAchievements(newSelected);
  };

  const selectAllVisible = () => {
    const newSelected = new Set(selectedAchievements);
    filteredAchievements.forEach(achievement => {
      newSelected.add(achievement.id);
    });
    setSelectedAchievements(newSelected);
  };

  const clearSelection = () => {
    setSelectedAchievements(new Set());
  };

  // Group achievements by category
  const achievementsByCategory = filteredAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  return {
    testService,
    achievementsByCategory,
    expandedCategories,
    selectedAchievements,
    searchQuery,
    selectedCategory,
    selectedRank,
    filteredAchievements,
    setSearchQuery,
    setSelectedCategory,
    setSelectedRank,
    toggleCategoryExpansion,
    toggleAchievementSelection,
    selectAllVisible,
    clearSelection,
  };
}
