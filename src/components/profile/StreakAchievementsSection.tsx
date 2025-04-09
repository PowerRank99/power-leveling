
import React from 'react';
import { Flame, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StreakAchievementsSectionProps {
  streak: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
}

const StreakAchievementsSection: React.FC<StreakAchievementsSectionProps> = ({
  streak,
  achievementsUnlocked,
  achievementsTotal
}) => {
  return (
    <Card className="mt-3 shadow-sm border-none">
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-1 flex items-center justify-center p-3 border-r border-gray-100">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-full mr-3 text-white">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Streak</p>
              <p className="font-bold text-lg">{streak} dias</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="bg-gradient-to-br from-fitpurple to-fitpurple-700 p-2 rounded-full mr-3 text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Conquistas</p>
              <p className="font-bold text-lg">{achievementsUnlocked}/{achievementsTotal}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakAchievementsSection;
