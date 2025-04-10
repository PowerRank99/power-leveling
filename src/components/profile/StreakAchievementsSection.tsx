
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
    <Card className="mt-3 shadow-sm border-none dark:bg-card dark:border dark:border-arcane/20">
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-1 flex items-center justify-center p-3 border-r border-gray-100 dark:border-arcane/20">
            <div className="bg-gradient-to-br from-valor to-xpgold p-2 rounded-full mr-3 text-white">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-inter">Streak</p>
              <p className="font-bold text-lg font-ibm-plex">{streak} <span className="font-inter text-base">dias</span></p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="bg-gradient-to-br from-arcane to-arcane-light p-2 rounded-full mr-3 text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-inter">Conquistas</p>
              <p className="font-bold text-lg font-ibm-plex">{achievementsUnlocked}<span className="font-inter text-base">/{achievementsTotal}</span></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakAchievementsSection;
