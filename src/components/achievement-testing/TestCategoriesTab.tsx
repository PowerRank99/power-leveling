
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterX } from 'lucide-react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import AchievementCategorySection from './categories/AchievementCategorySection';
import FilterHeader from './categories/FilterHeader';
import ExpandedFilters from './categories/ExpandedFilters';
import SelectionControls from './categories/SelectionControls';

interface TestCategoriesTabProps {
  userId: string;
}

const TestCategoriesTab: React.FC<TestCategoriesTabProps> = ({ userId }) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  const {
    allAchievements,
    filteredAchievements,
    selectedAchievements,
    searchQuery,
    selectedCategory,
    selectedRank,
    testResults,
    expandedCategories,
    testProgress,
    showSuccessful,
    showFailed,
    showPending,
    isLoading,
    setSearchQuery,
    setSelectedCategory,
    setSelectedRank,
    toggleCategoryExpansion,
    toggleAchievementSelection,
    selectAllVisible,
    clearSelection,
    runTests,
    toggleShowSuccessful,
    toggleShowFailed,
    toggleShowPending
  } = useTestingDashboard();
  
  // Group achievements by category
  const achievementsByCategory = filteredAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof allAchievements>);
  
  // Convert results to a map for easier lookup
  const resultsMap = testResults.reduce((acc, result) => {
    acc[result.achievementId] = {
      success: result.success,
      errorMessage: result.errorMessage,
      testDurationMs: result.testDurationMs
    };
    return acc;
  }, {} as Record<string, {success: boolean, errorMessage?: string, testDurationMs: number}>);
  
  // Run tests for a specific category
  const runCategoryTests = async (category: string) => {
    const categoryAchievements = allAchievements
      .filter(a => a.category === category)
      .map(a => a.id);
    
    await runTests(categoryAchievements);
  };
  
  // Run test for a single achievement
  const runSingleTest = async (achievementId: string) => {
    await runTests([achievementId]);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRank('all');
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-midnight-elevated border-divider/30">
        <CardContent className="p-3 space-y-3">
          <FilterHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filtersExpanded={filtersExpanded}
            setFiltersExpanded={setFiltersExpanded}
            filteredCount={filteredAchievements.length}
            runTests={runTests}
            isLoading={isLoading}
          />
          
          {filtersExpanded && (
            <ExpandedFilters 
              selectedCategory={selectedCategory}
              selectedRank={selectedRank}
              showSuccessful={showSuccessful}
              showFailed={showFailed}
              showPending={showPending}
              setSelectedCategory={setSelectedCategory}
              setSelectedRank={setSelectedRank}
              toggleShowSuccessful={toggleShowSuccessful}
              toggleShowFailed={toggleShowFailed}
              toggleShowPending={toggleShowPending}
            />
          )}
          
          <SelectionControls 
            selectedCount={selectedAchievements.size}
            selectAllVisible={selectAllVisible}
            clearSelection={clearSelection}
            filteredCount={filteredAchievements.length}
            resetFilters={resetFilters}
          />
        </CardContent>
      </Card>
      
      {testProgress.isRunning && (
        <Card className="border-arcane-30 p-3 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Running Tests</h3>
            <span className="text-sm text-text-secondary">
              {testProgress.completed} / {testProgress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-midnight-card rounded-full overflow-hidden">
            <div 
              className="h-full bg-arcane"
              style={{ width: `${(testProgress.completed / testProgress.total) * 100}%` }}
            />
          </div>
          {testProgress.currentTest && (
            <p className="text-xs text-text-tertiary">
              Current: {testProgress.currentTest}
            </p>
          )}
        </Card>
      )}
      
      <ScrollArea className="h-[600px] rounded-md border border-divider/30 bg-midnight-card">
        {Object.keys(achievementsByCategory).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-text-secondary">
            <FilterX className="h-10 w-10 mb-2 opacity-40" />
            <p>No achievements match your filters</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
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
};

export default TestCategoriesTab;
