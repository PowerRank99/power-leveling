
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TestCoverageStatsProps {
  stats: {
    totalAchievements: number;
    testedAchievements: number;
    passedTests: number;
    failedTests: number;
    coveragePercentage: number;
  };
}

const TestCoverageStats: React.FC<TestCoverageStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{stats.totalAchievements}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Test Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{stats.coveragePercentage.toFixed(1)}%</div>
          <Progress value={stats.coveragePercentage} className="h-2 mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Passing Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-success">{stats.passedTests}</div>
          <div className="text-sm text-text-secondary">
            {stats.testedAchievements > 0 ? 
              `${((stats.passedTests / stats.testedAchievements) * 100).toFixed(1)}% success rate` : 
              'No tests run yet'}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Failing Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-valor">{stats.failedTests}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestCoverageStats;
