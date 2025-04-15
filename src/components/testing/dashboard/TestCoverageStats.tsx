
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CircleX, Award } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Award className="h-8 w-8 text-arcane mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalAchievements}</div>
            <div className="text-sm text-text-secondary">Total Achievements</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CircleCheck className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.passedTests}</div>
            <div className="text-sm text-text-secondary">Passed Tests</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CircleX className="h-8 w-8 text-valor mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.failedTests}</div>
            <div className="text-sm text-text-secondary">Failed Tests</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="space-y-2 pt-6">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold">{Math.round(stats.coveragePercentage)}%</div>
            <div className="text-sm text-text-secondary">Test Coverage</div>
          </div>
          <Progress value={stats.coveragePercentage} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default TestCoverageStats;
