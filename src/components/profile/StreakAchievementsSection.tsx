
import React from 'react';
import { Flame, Award, Sparkles } from 'lucide-react';
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
    <Card className="mt-3 shadow-lg border-none dark:bg-midnight-light/50 dark:border dark:border-arcane/20 rpg-card card-glow">
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-1 flex items-center justify-center p-3 border-r border-gray-100 dark:border-arcane/20 relative overflow-hidden">
            {/* Background effect for high streaks */}
            {isHighStreak && (
              <div className="absolute inset-0 bg-gradient-to-r from-valor/5 to-xpgold/10"></div>
            )}
            
            <div className={`bg-gradient-valor-xpgold p-2 rounded-full mr-3 text-white shadow-lg ${isHighStreak ? 'animate-glow-pulse shadow-glow-valor' : ''}`}>
              <Flame className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-sora">Streak</p>
              <p className="font-bold text-lg font-ibm-plex flex items-center">
                {streak} 
                <span className="font-sora ml-1 text-sm">dias</span>
                {isHighStreak && <Sparkles className="w-4 h-4 ml-1 text-xpgold animate-pulse" />}
              </p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden">
            {/* Background effect for many achievements */}
            {hasUnlockedManyAchievements && (
              <div className="absolute inset-0 bg-gradient-to-r from-arcane/5 to-energy/10"></div>
            )}
            
            <div className={`bg-gradient-arcane-energy p-2 rounded-full mr-3 text-white shadow-lg ${hasUnlockedManyAchievements ? 'animate-glow-pulse shadow-glow-energy' : ''}`}>
              <Award className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-sora">Conquistas</p>
              <p className="font-bold text-lg font-ibm-plex flex items-center">
                {achievementsUnlocked}
                <span className="font-sora text-sm">/{achievementsTotal}</span>
                {hasUnlockedManyAchievements && <Sparkles className="w-4 h-4 ml-1 text-xpgold animate-pulse" />}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakAchievementsSection;
