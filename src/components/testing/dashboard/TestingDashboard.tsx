import React from 'react';
import TestCoverageStats from './TestCoverageStats';
import RecentTestResults from './RecentTestResults';
import QuickActions from './QuickActions';
import { useEffect } from 'react';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';
import { AchievementIdDebugger } from '../debug/AchievementIdDebugger';

interface TestingDashboardProps {
  stats: {
    totalAchievements: number;
    testedAchievements: number;
    passedTests: number;
    failedTests: number;
    coveragePercentage: number;
  };
  results: Array<{
    achievementId: string;
    name: string;
    category: string;
    rank: string;
    success: boolean;
    errorMessage?: string;
    testDurationMs: number;
  }>;
  onRunAllTests: () => void;
  onRunCategoryTests: (category: string) => void;
  onClearResults: () => void;
  onExportResults: () => void;
  isLoading: boolean;
}

const TestingDashboard: React.FC<TestingDashboardProps> = ({
  stats,
  results,
  onRunAllTests,
  onRunCategoryTests,
  onClearResults,
  onExportResults,
  isLoading
}) => {
  useEffect(() => {
    // Initialize achievement ID mapping
    AchievementIdMappingService.initialize().catch(error => {
      console.error('Failed to initialize achievement mapping:', error);
    });
  }, []);

  return (
    <div className="space-y-6">
      <TestCoverageStats stats={stats} />
      <AchievementIdDebugger />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTestResults results={results} />
        <QuickActions
          onRunAllTests={onRunAllTests}
          onRunCategoryTests={onRunCategoryTests}
          onClearResults={onClearResults}
          onExportResults={onExportResults}
          isLoading={isLoading}
          hasResults={results.length > 0}
        />
      </div>
    </div>
  );
};

export default TestingDashboard;
