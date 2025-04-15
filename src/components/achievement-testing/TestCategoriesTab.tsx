
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  FilterX, 
  Play, 
  CheckCircle, 
  XCircle, 
  Filter 
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import AchievementCategorySection from '@/components/achievement-testing/categories/AchievementCategorySection';

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
  
  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card className="bg-midnight-elevated border-divider/30">
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center space-x-2 flex-grow">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
                <Input
                  placeholder="Search achievements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-midnight-card border-divider"
                />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1 h-7 w-7"
                  >
                    <FilterX className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="flex-shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-midnight-card">
                {filteredAchievements.length} achievements
              </Badge>
              
              <Button 
                variant="arcane" 
                size="sm" 
                onClick={() => runTests()}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <Play className="h-4 w-4 mr-1" />
                Run Selected
              </Button>
            </div>
          </div>
          
          {filtersExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-divider/20">
              <div>
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="bg-midnight-card border-divider">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.values(AchievementCategory).map(category => (
                      <SelectItem key={category} value={category} className="capitalize">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={selectedRank} 
                  onValueChange={setSelectedRank}
                >
                  <SelectTrigger className="bg-midnight-card border-divider">
                    <SelectValue placeholder="All Ranks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranks</SelectItem>
                    {Object.values(AchievementRank).map(rank => (
                      <SelectItem key={rank} value={rank}>
                        Rank {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-passed"
                    checked={showSuccessful}
                    onCheckedChange={() => toggleShowSuccessful()}
                  />
                  <label htmlFor="show-passed" className="text-sm flex items-center cursor-pointer">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    Passed
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-failed"
                    checked={showFailed}
                    onCheckedChange={() => toggleShowFailed()}
                  />
                  <label htmlFor="show-failed" className="text-sm flex items-center cursor-pointer">
                    <XCircle className="h-3 w-3 text-red-500 mr-1" />
                    Failed
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-pending"
                    checked={showPending}
                    onCheckedChange={() => toggleShowPending()}
                  />
                  <label htmlFor="show-pending" className="text-sm flex items-center cursor-pointer">
                    <Badge className="h-3 w-3 flex items-center justify-center bg-gray-500 mr-1">?</Badge>
                    Pending
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* Selection Controls */}
          <div className="flex space-x-2 text-sm justify-between border-t border-divider/20 pt-2">
            <div className="flex items-center">
              <span className="text-text-secondary mr-2">
                {selectedAchievements.size} selected
              </span>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={selectAllVisible}
                disabled={filteredAchievements.length === 0}
                className="h-8"
              >
                Select All
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSelection}
                disabled={selectedAchievements.size === 0}
                className="h-8"
              >
                Clear
              </Button>
            </div>
            
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedRank('all');
                }}
                className="h-8"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Test Progress Indicator */}
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
      
      {/* Achievement List */}
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
