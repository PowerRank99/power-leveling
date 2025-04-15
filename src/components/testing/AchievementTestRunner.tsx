
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2, Play, RotateCcw, Filter, Search, FilterX } from 'lucide-react';
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { 
  AchievementTestingService, 
  AchievementTestResult
} from '@/services/testing/AchievementTestingService';
import { toast } from 'sonner';
import TestProgressIndicator from './TestProgressIndicator';
import AchievementCategorySection from './AchievementCategorySection';
import AchievementTestHeader from './AchievementTestHeader';
import { Input } from '@/components/ui/input';

interface AchievementTestRunnerProps {
  userId: string;
  results: AchievementTestResult[];
  onResultsChange: (results: AchievementTestResult[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function AchievementTestRunner({ 
  userId, 
  results, 
  onResultsChange,
  isLoading,
  setIsLoading
}: AchievementTestRunnerProps) {
  const [testService, setTestService] = useState<AchievementTestingService | null>(null);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedAchievements, setSelectedAchievements] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRank, setSelectedRank] = useState('all');
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0, 
    successful: 0,
    failed: 0,
    isRunning: false,
    currentTest: ''
  });
  
  // Convert results to a map for easier lookup
  const resultsMap = results.reduce((acc, result) => {
    acc[result.achievementId] = {
      success: result.success,
      errorMessage: result.errorMessage,
      testDurationMs: result.testDurationMs
    };
    return acc;
  }, {} as Record<string, {success: boolean, errorMessage?: string, testDurationMs: number}>);
  
  // Initialize test service
  useEffect(() => {
    if (userId) {
      const service = new AchievementTestingService(userId);
      service.onProgress(setProgress);
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
  
  // Filter achievements
  const filteredAchievements = allAchievements.filter(achievement => {
    const matchesSearch = searchQuery === '' || 
      achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRank = selectedRank === 'all' || achievement.rank === selectedRank;
    
    return matchesSearch && matchesCategory && matchesRank;
  });
  
  // Group achievements by category
  const achievementsByCategory: Record<string, Achievement[]> = {};
  filteredAchievements.forEach(achievement => {
    if (!achievementsByCategory[achievement.category]) {
      achievementsByCategory[achievement.category] = [];
    }
    achievementsByCategory[achievement.category].push(achievement);
  });
  
  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };
  
  // Toggle achievement selection
  const toggleAchievementSelection = (achievementId: string) => {
    const newSelected = new Set(selectedAchievements);
    if (newSelected.has(achievementId)) {
      newSelected.delete(achievementId);
    } else {
      newSelected.add(achievementId);
    }
    setSelectedAchievements(newSelected);
  };
  
  // Run tests for a specific category
  const runCategoryTests = async (category: string) => {
    if (!testService || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await testService.runCategoryTests(category as AchievementCategory);
      if (response.success && response.data) {
        // Update results
        const updatedResults = [...results.filter(r => r.category !== category), ...response.data];
        onResultsChange(updatedResults);
        
        toast.success(`${category} tests completed`, {
          description: `${response.data.filter(r => r.success).length} passed, ${response.data.filter(r => !r.success).length} failed`
        });
      }
    } catch (error) {
      toast.error('Failed to run tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run test for a single achievement
  const runSingleTest = async (achievementId: string) => {
    if (!testService || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await testService.testAchievement(achievementId);
      // Update results
      const updatedResults = [...results.filter(r => r.achievementId !== achievementId), result];
      onResultsChange(updatedResults);
      
      toast(result.success ? 'Test passed' : 'Test failed', {
        description: result.name,
        icon: result.success ? <CheckCircle2 className="text-success" /> : undefined
      });
    } catch (error) {
      toast.error('Failed to run test', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run selected tests
  const runSelectedTests = async () => {
    if (!testService || isLoading || selectedAchievements.size === 0) return;
    
    setIsLoading(true);
    const newResults: AchievementTestResult[] = [];
    let succeeded = 0;
    let failed = 0;
    
    try {
      for (const achievementId of selectedAchievements) {
        const result = await testService.testAchievement(achievementId);
        newResults.push(result);
        
        if (result.success) {
          succeeded++;
        } else {
          failed++;
        }
      }
      
      // Update results
      const updatedResults = [
        ...results.filter(r => !selectedAchievements.has(r.achievementId)), 
        ...newResults
      ];
      onResultsChange(updatedResults);
      
      toast.success(`${selectedAchievements.size} tests completed`, {
        description: `${succeeded} passed, ${failed} failed`
      });
    } catch (error) {
      toast.error('Failed to run tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (category: string, rank: string) => {
    setSelectedCategory(category);
    setSelectedRank(rank);
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedAchievements(new Set());
  };
  
  // Select all visible achievements
  const selectAllVisible = () => {
    const newSelected = new Set(selectedAchievements);
    filteredAchievements.forEach(achievement => {
      newSelected.add(achievement.id);
    });
    setSelectedAchievements(newSelected);
  };
  
  return (
    <div className="space-y-4">
      <AchievementTestHeader
        onRunTests={runSelectedTests}
        onStopTests={() => {}}
        onFilterChange={handleFilterChange}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        selectedRank={selectedRank}
        searchQuery={searchQuery}
        isRunning={progress.isRunning}
        testCount={filteredAchievements.length}
      />
      
      <TestProgressIndicator 
        current={progress.completed}
        total={progress.total}
        successful={progress.successful}
        failed={progress.failed}
        isRunning={progress.isRunning}
        currentTest={progress.currentTest}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllVisible}
            disabled={filteredAchievements.length === 0 || isLoading}
          >
            Select All ({filteredAchievements.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedAchievements.size === 0 || isLoading}
          >
            Clear Selection
          </Button>
        </div>
        
        <Button
          variant="arcane"
          size="sm"
          onClick={runSelectedTests}
          disabled={selectedAchievements.size === 0 || isLoading}
        >
          <Play className="mr-2 h-4 w-4" />
          Run Selected ({selectedAchievements.size})
        </Button>
      </div>
      
      <ScrollArea className="h-[500px] rounded-md border border-divider/30 p-2">
        {Object.keys(achievementsByCategory).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-text-secondary">
            <FilterX className="h-10 w-10 mb-2 opacity-40" />
            <p>No achievements match your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(achievementsByCategory).map(([category, achievements]) => (
              <AchievementCategorySection
                key={category}
                category={category}
                achievements={achievements}
                isExpanded={expandedCategories.has(category)}
                onToggleExpand={() => toggleCategoryExpansion(category)}
                onRunCategoryTests={() => runCategoryTests(category)}
                onRunSingleTest={runSingleTest}
                onToggleSelect={toggleAchievementSelection}
                selectedAchievements={Array.from(selectedAchievements)}
                testResults={resultsMap}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
