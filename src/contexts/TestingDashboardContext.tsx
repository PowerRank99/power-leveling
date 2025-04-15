import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { AchievementTestingService, AchievementTestResult } from '@/services/testing/AchievementTestingService';
import { TestCoverageService } from '@/services/testing/TestCoverageService';
import { testDataGenerator } from '@/services/testing/generators/TestDataGeneratorService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TestingDashboardContextType {
  userId: string;
  allAchievements: Achievement[];
  filteredAchievements: Achievement[];
  selectedAchievements: Set<string>;
  searchQuery: string;
  selectedCategory: string;
  selectedRank: string;
  testResults: AchievementTestResult[];
  testProgress: {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    isRunning: boolean;
    currentTest?: string;
  };
  testService: AchievementTestingService | null;
  isLoading: boolean;
  isDataGenerating: boolean;
  isDataCleaning: boolean;
  userAchievements: Record<string, { isUnlocked: boolean; unlockedAt?: string }>;
  expandedCategories: Set<string>;
  showSuccessful: boolean;
  showFailed: boolean;
  showPending: boolean;
  notificationsQueue: Achievement[];
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedRank: (rank: string) => void;
  toggleCategoryExpansion: (category: string) => void;
  toggleAchievementSelection: (achievementId: string) => void;
  selectAllVisible: () => void;
  selectByCategory: (category: string) => void;
  selectByRank: (rank: string) => void;
  clearSelection: () => void;
  runTests: (achievementIds?: string[]) => Promise<void>;
  stopTests: () => void;
  clearResults: () => void;
  generateTestData: () => Promise<void>;
  cleanupTestData: () => Promise<void>;
  refreshUserAchievements: () => Promise<void>;
  pushNotification: (achievement: Achievement) => void;
  removeNotification: (achievementId: string) => void;
  simulateAchievement: (achievementId: string) => void;
  toggleShowSuccessful: () => void;
  toggleShowFailed: () => void;
  toggleShowPending: () => void;
  logAction: (action: string, details: string) => void;
}

const TestingDashboardContext = createContext<TestingDashboardContextType>({
  userId: '',
  allAchievements: [],
  filteredAchievements: [],
  selectedAchievements: new Set(),
  searchQuery: '',
  selectedCategory: 'all',
  selectedRank: 'all',
  testResults: [],
  testProgress: {
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false
  },
  testService: null,
  isLoading: false,
  isDataGenerating: false,
  isDataCleaning: false,
  userAchievements: {},
  expandedCategories: new Set(),
  showSuccessful: true,
  showFailed: true,
  showPending: true,
  notificationsQueue: [],
  setSearchQuery: () => {},
  setSelectedCategory: () => {},
  setSelectedRank: () => {},
  toggleCategoryExpansion: () => {},
  toggleAchievementSelection: () => {},
  selectAllVisible: () => {},
  selectByCategory: () => {},
  selectByRank: () => {},
  clearSelection: () => {},
  runTests: async () => {},
  stopTests: () => {},
  clearResults: () => {},
  generateTestData: async () => {},
  cleanupTestData: async () => {},
  refreshUserAchievements: async () => {},
  pushNotification: () => {},
  removeNotification: () => {},
  simulateAchievement: () => {},
  toggleShowSuccessful: () => {},
  toggleShowFailed: () => {},
  toggleShowPending: () => {},
  logAction: () => {}
});

export const TestingDashboardProvider: React.FC<{
  userId: string;
  children: ReactNode;
  logAction?: (action: string, details: string) => void;
}> = ({ userId, children, logAction }) => {
  const [testService, setTestService] = useState<AchievementTestingService | null>(null);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRank, setSelectedRank] = useState('all');
  const [selectedAchievements, setSelectedAchievements] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isDataGenerating, setIsDataGenerating] = useState(false);
  const [isDataCleaning, setIsDataCleaning] = useState(false);
  const [testResults, setTestResults] = useState<AchievementTestResult[]>([]);
  const [userAchievements, setUserAchievements] = useState<Record<string, { isUnlocked: boolean; unlockedAt?: string }>>({});
  const [showSuccessful, setShowSuccessful] = useState(true);
  const [showFailed, setShowFailed] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [notificationsQueue, setNotificationsQueue] = useState<Achievement[]>([]);
  
  const [testProgress, setTestProgress] = useState({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false,
    currentTest: undefined as string | undefined
  });
  
  useEffect(() => {
    const initialize = async () => {
      if (userId) {
        const service = new AchievementTestingService(userId);
        
        service.onProgress(progress => {
          const updatedProgress = {
            ...progress,
            currentTest: progress.currentTest || undefined
          };
          setTestProgress(updatedProgress);
        });
        
        service.onResult(result => {
          setTestResults(prev => [...prev.filter(r => r.achievementId !== result.achievementId), result]);
        });
        
        setTestService(service);
        
        try {
          const achievements = await AchievementUtils.getAllAchievements();
          setAllAchievements(achievements);
          
          if (achievements.length > 0) {
            const firstCategory = achievements[0].category;
            setExpandedCategories(new Set([firstCategory]));
          }
          
          await refreshUserAchievements();
        } catch (error) {
          console.error('Error initializing achievements:', error);
          toast.error('Failed to load achievements');
        }
      }
    };
    
    initialize();
  }, [userId]);
  
  const filteredAchievements = allAchievements.filter(achievement => {
    const matchesSearch = searchQuery === '' || 
      achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    
    const matchesRank = selectedRank === 'all' || achievement.rank === selectedRank;
    
    const matchesResultFilter = (
      (showSuccessful && testResults.some(r => r.achievementId === achievement.id && r.success)) ||
      (showFailed && testResults.some(r => r.achievementId === achievement.id && !r.success)) ||
      (showPending && !testResults.some(r => r.achievementId === achievement.id))
    );
    
    return matchesSearch && matchesCategory && matchesRank && matchesResultFilter;
  });
  
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
  
  const selectAllVisible = () => {
    setSelectedAchievements(prev => {
      const newSet = new Set(prev);
      filteredAchievements.forEach(achievement => {
        newSet.add(achievement.id);
      });
      return newSet;
    });
  };
  
  const selectByCategory = (category: string) => {
    setSelectedAchievements(prev => {
      const newSet = new Set(prev);
      allAchievements
        .filter(a => a.category === category)
        .forEach(a => newSet.add(a.id));
      return newSet;
    });
  };
  
  const selectByRank = (rank: string) => {
    setSelectedAchievements(prev => {
      const newSet = new Set(prev);
      allAchievements
        .filter(a => a.rank === rank)
        .forEach(a => newSet.add(a.id));
      return newSet;
    });
  };
  
  const clearSelection = () => {
    setSelectedAchievements(new Set());
  };
  
  const runTests = async (achievementIds?: string[]) => {
    if (!testService) return;
    
    setIsLoading(true);
    try {
      const idsToTest = achievementIds || Array.from(selectedAchievements);
      
      if (idsToTest.length === 0) {
        if (selectedCategory !== 'all') {
          await testService.runCategoryTests(selectedCategory as AchievementCategory);
        } else if (selectedRank !== 'all') {
          await testService.runRankTests(selectedRank as AchievementRank);
        } else {
          await testService.runAllTests();
        }
      } else {
        for (const id of idsToTest) {
          await testService.testAchievement(id);
        }
      }
      
      await refreshUserAchievements();
      
      if (logAction) {
        logAction('Tests Completed', 
          `${testProgress.successful} passed, ${testProgress.failed} failed`
        );
      }
    } catch (error) {
      toast.error('Error running tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopTests = () => {
    toast.info('Test interruption requested');
  };
  
  const clearResults = () => {
    setTestResults([]);
    toast.info('Test results cleared');
  };
  
  const generateTestData = async () => {
    if (!userId) return;
    
    setIsDataGenerating(true);
    try {
      await testDataGenerator.generateStandardTestData(userId);
      toast.success('Test data generated');
      
      if (logAction) {
        logAction('Generated Test Data', 'Standard test data pack created');
      }
      
      await refreshUserAchievements();
    } catch (error) {
      toast.error('Error generating test data', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsDataGenerating(false);
    }
  };
  
  const cleanupTestData = async () => {
    if (!userId) return;
    
    setIsDataCleaning(true);
    try {
      await testDataGenerator.cleanupAllTestData(userId);
      toast.success('Test data cleaned up');
      
      if (logAction) {
        logAction('Cleaned Test Data', 'All test data removed');
      }
      
      await refreshUserAchievements();
    } catch (error) {
      toast.error('Error cleaning test data', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsDataCleaning(false);
    }
  };
  
  const refreshUserAchievements = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, achieved_at')
        .eq('user_id', userId);
        
      if (error) {
        throw new Error(`Error fetching user achievements: ${error.message}`);
      }
      
      const userAchievementMap: Record<string, { isUnlocked: boolean; unlockedAt?: string }> = {};
      
      allAchievements.forEach(achievement => {
        userAchievementMap[achievement.id] = { isUnlocked: false };
      });
      
      if (data) {
        data.forEach(ua => {
          userAchievementMap[ua.achievement_id] = { 
            isUnlocked: true, 
            unlockedAt: ua.achieved_at 
          };
        });
      }
      
      setUserAchievements(userAchievementMap);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    }
  };
  
  const pushNotification = (achievement: Achievement) => {
    setNotificationsQueue(prev => [...prev, achievement]);
  };
  
  const removeNotification = (achievementId: string) => {
    setNotificationsQueue(prev => prev.filter(a => a.id !== achievementId));
  };
  
  const simulateAchievement = (achievementId: string) => {
    const achievement = allAchievements.find(a => a.id === achievementId);
    if (achievement) {
      pushNotification(achievement);
      
      if (logAction) {
        logAction('Achievement Simulated', `${achievement.name} (${achievement.rank})`);
      }
    }
  };
  
  const toggleShowSuccessful = () => setShowSuccessful(prev => !prev);
  const toggleShowFailed = () => setShowFailed(prev => !prev);
  const toggleShowPending = () => setShowPending(prev => !prev);
  
  const contextValue: TestingDashboardContextType = {
    userId,
    allAchievements,
    filteredAchievements,
    selectedAchievements,
    searchQuery,
    selectedCategory,
    selectedRank,
    testResults,
    testProgress,
    testService,
    isLoading,
    isDataGenerating,
    isDataCleaning,
    userAchievements,
    expandedCategories,
    showSuccessful,
    showFailed,
    showPending,
    notificationsQueue,
    setSearchQuery,
    setSelectedCategory,
    setSelectedRank,
    toggleCategoryExpansion,
    toggleAchievementSelection,
    selectAllVisible,
    selectByCategory,
    selectByRank,
    clearSelection,
    runTests,
    stopTests,
    clearResults,
    generateTestData,
    cleanupTestData,
    refreshUserAchievements,
    pushNotification,
    removeNotification,
    simulateAchievement,
    toggleShowSuccessful,
    toggleShowFailed,
    toggleShowPending,
    logAction: logAction || (() => {})
  };
  
  return (
    <TestingDashboardContext.Provider value={contextValue}>
      {children}
    </TestingDashboardContext.Provider>
  );
};

export const useTestingDashboard = () => useContext(TestingDashboardContext);

export const useAchievementDetails = (achievementId: string) => {
  const { allAchievements, userAchievements, testResults } = useTestingDashboard();
  
  const achievement = allAchievements.find(a => a.id === achievementId);
  const isUnlocked = userAchievements[achievementId]?.isUnlocked || false;
  const unlockedAt = userAchievements[achievementId]?.unlockedAt;
  const testResult = testResults.find(r => r.achievementId === achievementId);
  
  return {
    achievement,
    isUnlocked,
    unlockedAt,
    testResult
  };
};
