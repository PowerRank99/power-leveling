import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Award, CheckCircle, Play, RotateCcw, XCircle } from 'lucide-react';
import TestResultsSummary from './dashboard/TestResultsSummary';
import AchievementStatusChart from './dashboard/AchievementStatusChart';
import RecentTestResults from './dashboard/RecentTestResults';
import TestCategoryBreakdown from './dashboard/TestCategoryBreakdown';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';

interface TestDashboardTabProps {
  userId: string;
}

const TestDashboardTab: React.FC<TestDashboardTabProps> = ({ userId }) => {
  const {
    allAchievements,
    userAchievements,
    testResults,
    testProgress,
    runTests,
    clearResults,
    isLoading,
  } = useTestingDashboard();

  // Calculate statistics
  const totalAchievements = allAchievements.length;
  const unlockedAchievements = Object.values(userAchievements).filter(a => a.isUnlocked).length;
  const testedAchievements = testResults.length;
  const successfulTests = testResults.filter(r => r.success).length;
  const failedTests = testResults.filter(r => !r.success).length;
  
  // Calculate percentages
  const unlockedPercentage = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0;
  const testedPercentage = totalAchievements > 0 ? (testedAchievements / totalAchievements) * 100 : 0;
  const successRate = testedAchievements > 0 ? (successfulTests / testedAchievements) * 100 : 0;
  
  // Get recent test results - ensuring we handle testedAt property
  const recentResults = [...testResults]
    .sort((a, b) => {
      // Handle case where testedAt might not exist
      const dateA = a.testedAt ? new Date(a.testedAt).getTime() : 0;
      const dateB = b.testedAt ? new Date(b.testedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);
  
  // Function to run all tests by rank
  const runTestsByRank = (rank: string) => {
    const rankAchievements = allAchievements
      .filter(a => a.rank === rank)
      .map(a => a.id);
    
    runTests(rankAchievements);
  };
  
  // Function to run all tests by category
  const runTestsByCategory = (category: string) => {
    const categoryAchievements = allAchievements
      .filter(a => a.category === category)
      .map(a => a.id);
    
    runTests(categoryAchievements);
  };

  return (
    <div className="space-y-4">
      {/* Test Progress */}
      {testProgress.isRunning && (
        <Card className="border-arcane-30">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Running Tests</h3>
              <span className="text-sm text-text-secondary">
                {testProgress.completed} / {testProgress.total}
              </span>
            </div>
            <Progress 
              value={(testProgress.completed / testProgress.total) * 100} 
              className="h-2" 
            />
            {testProgress.currentTest && (
              <p className="text-xs text-text-tertiary">
                Current: {testProgress.currentTest}
              </p>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Overview Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-orbitron flex items-center">
                <Award className="mr-2 h-5 w-5 text-arcane" />
                Achievement System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Unlocked Achievements</span>
                    <span>{unlockedAchievements} / {totalAchievements}</span>
                  </div>
                  <Progress value={unlockedPercentage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tested Achievements</span>
                    <span>{testedAchievements} / {totalAchievements}</span>
                  </div>
                  <Progress value={testedPercentage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Test Success Rate</span>
                    <span>{successfulTests} / {testedAchievements}</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="arcane"
                  onClick={() => runTests()}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isLoading ? 'Running Tests...' : 'Run All Tests'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={clearResults}
                  disabled={testResults.length === 0 || isLoading}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AchievementStatusChart 
              totalCount={totalAchievements}
              unlockedCount={unlockedAchievements}
              testedCount={testedAchievements}
              passedCount={successfulTests}
              failedCount={failedTests}
            />
            
            <TestCategoryBreakdown 
              achievements={allAchievements}
              testResults={testResults} 
              onRunCategory={runTestsByCategory}
            />
          </div>
          
          {/* Recent Test Results */}
          <RecentTestResults results={recentResults} />
        </div>
        
        <div className="space-y-4">
          {/* Test Results Summary */}
          <TestResultsSummary 
            passed={successfulTests}
            failed={failedTests}
            pending={totalAchievements - testedAchievements}
          />
          
          {/* Quick Test By Rank */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Test By Rank
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(AchievementRank).map(rank => {
                const rankCount = allAchievements.filter(a => a.rank === rank).length;
                const testedCount = testResults.filter(r => r.rank === rank).length;
                
                return (
                  <div key={rank} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge 
                        variant="outline" 
                        className={`mr-2 ${rankCount > 0 ? 'bg-midnight-card' : 'bg-transparent text-text-tertiary'}`}
                      >
                        {testedCount}/{rankCount}
                      </Badge>
                      <span>Rank {rank}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => runTestsByRank(rank)}
                      disabled={isLoading || rankCount === 0}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          
          {/* Quick Test By Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Test By Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(AchievementCategory).map(category => {
                const catCount = allAchievements.filter(a => a.category === category).length;
                const testedCount = testResults.filter(r => r.category === category).length;
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge 
                        variant="outline" 
                        className={`mr-2 ${catCount > 0 ? 'bg-midnight-card' : 'bg-transparent text-text-tertiary'}`}
                      >
                        {testedCount}/{catCount}
                      </Badge>
                      <span className="capitalize">{category}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => runTestsByCategory(category)}
                      disabled={isLoading || catCount === 0}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          
          {/* Result Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Test Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Passed: {successfulTests}</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span>Failed: {failedTests}</span>
                </div>
                <div className="flex items-center">
                  <Badge className="h-4 w-4 flex items-center justify-center bg-gray-500 mr-2">?</Badge>
                  <span>Not Tested: {totalAchievements - testedAchievements}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestDashboardTab;
