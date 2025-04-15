
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { FilterX } from 'lucide-react';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';
import { toast } from 'sonner';
import TestProgressIndicator from './TestProgressIndicator';
import AchievementCategorySection from './AchievementCategorySection';
import AchievementTestHeader from './AchievementTestHeader';
import TestControlPanel from './test-runner/TestControlPanel';
import { useAchievementTestState } from './test-runner/useAchievementTestState';

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
  const {
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
  } = useAchievementTestState(userId);

  const [progress, setProgress] = useState({
    total: 0,
    completed: 0, 
    successful: 0,
    failed: 0,
    isRunning: false,
    currentTest: undefined as string | undefined
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
  
  // Run tests for a specific category
  const runCategoryTests = async (category: string) => {
    if (!testService || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await testService.runCategoryTests(category as any);
      if (response.success && response.data) {
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
      const updatedResults = [...results.filter(r => r.achievementId !== achievementId), result];
      onResultsChange(updatedResults);
      
      toast(result.success ? 'Test passed' : 'Test failed', {
        description: result.name
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
  
  return (
    <div className="space-y-4">
      <AchievementTestHeader
        onRunTests={runSelectedTests}
        onStopTests={() => {}}
        onFilterChange={(category, rank) => {
          setSelectedCategory(category);
          setSelectedRank(rank);
        }}
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
      
      <TestControlPanel
        selectedCount={selectedAchievements.size}
        onRunSelected={runSelectedTests}
        onSelectAll={selectAllVisible}
        onClearSelection={clearSelection}
        filteredCount={filteredAchievements.length}
        isLoading={isLoading}
      />
      
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
