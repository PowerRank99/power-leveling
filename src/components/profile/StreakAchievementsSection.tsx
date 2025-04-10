
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
  // Determine if we should show special animations
  const isHighStreak = streak >= 7;
  const hasUnlockedManyAchievements = achievementsUnlocked > achievementsTotal * 0.5;
  
  return (
    <Card className="mt-3 shadow-md border-none dark:bg-midnight-light/30 dark:border dark:border-arcane/10 rpg-card">
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-1 flex items-center justify-center p-3 border-r border-arcane/5 relative overflow-hidden">
            {/* Subtle background effect for high streaks */}
            {isHighStreak && (
              <div className="absolute inset-0 bg-gradient-to-r from-valor-muted/5 to-xp-gold-muted/5"></div>
            )}
            
            <div className={`bg-gradient-to-br from-valor-muted/90 to-xp-gold-muted/90 p-1.5 rounded-full mr-3 text-white shadow-sm ${isHighStreak ? 'opacity-90' : 'opacity-80'}`}>
              <Flame className="w-4 h-4" />
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-500 dark:text-gray-400/90 font-sora">Streak</p>
              <p className="font-medium text-base font-ibm-plex flex items-center text-ghostwhite/90">
                {streak} 
                <span className="font-sora ml-1 text-xs text-ghostwhite/70">dias</span>
              </p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden">
            {/* Subtle background effect for many achievements */}
            {hasUnlockedManyAchievements && (
              <div className="absolute inset-0 bg-gradient-to-r from-arcane-muted/5 to-energy-muted/5"></div>
            )}
            
            <div className={`bg-gradient-to-br from-arcane-muted/90 to-energy-muted/90 p-1.5 rounded-full mr-3 text-white shadow-sm ${hasUnlockedManyAchievements ? 'opacity-90' : 'opacity-80'}`}>
              <Award className="w-4 h-4" />
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-500 dark:text-gray-400/90 font-sora">Conquistas</p>
              <p className="font-medium text-base font-ibm-plex flex items-center text-ghostwhite/90">
                {achievementsUnlocked}
                <span className="font-sora text-xs text-ghostwhite/70">/{achievementsTotal}</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakAchievementsSection;
