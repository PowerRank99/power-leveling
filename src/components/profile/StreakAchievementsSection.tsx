
import React from 'react';
import { Flame, Award } from 'lucide-react';

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
    <div className="bg-white p-4 mt-2 flex">
      <div className="flex-1 flex items-center justify-center p-3 border-r border-gray-100">
        <div className="bg-orange-100 p-2 rounded-full mr-3">
          <Flame className="text-orange-500 w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Streak</p>
          <p className="font-bold text-lg">{streak} dias</p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-3">
        <div className="bg-fitpurple-100 p-2 rounded-full mr-3">
          <Award className="text-fitpurple w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Conquistas</p>
          <p className="font-bold text-lg">{achievementsUnlocked}/{achievementsTotal}</p>
        </div>
      </div>
    </div>
  );
};

export default StreakAchievementsSection;
