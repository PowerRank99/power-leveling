
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
    <Card className="mt-3 premium-card hover:premium-card-elevated transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-1 flex items-center justify-center p-3 border-r border-divider">
            <div className="bg-gradient-to-br from-valor to-valor-60 p-2 rounded-full mr-3 text-white shadow-glow-purple border border-valor-30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-sora">Streak</p>
              <p className="font-bold text-lg font-space text-text-primary">{streak} dias</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="bg-gradient-to-br from-arcane to-arcane-60 p-2 rounded-full mr-3 text-white shadow-glow-purple border border-arcane-30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-sora">Conquistas</p>
              <p className="font-bold text-lg font-space text-text-primary">{achievementsUnlocked}/{achievementsTotal}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakAchievementsSection;
